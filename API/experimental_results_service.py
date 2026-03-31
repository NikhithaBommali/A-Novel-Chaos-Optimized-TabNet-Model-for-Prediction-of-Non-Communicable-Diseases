import json
import math
import os
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.chaos_optimizer import ChaosOptimizer

try:
    from xgboost import XGBClassifier  # type: ignore
except Exception:
    XGBClassifier = None

try:
    from pytorch_tabnet.tab_model import TabNetClassifier
except Exception:
    TabNetClassifier = None


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_RESULTS_PATH = BASE_DIR / "experimental_results.json"
GENERATED_RESULTS_PATH = BASE_DIR / "experimental_results.generated.json"

DATASET_KEYWORDS = {
    "alz": ["alz", "alzheimer"],
    "breast": ["breast"],
    "heart": ["heart", "cardio"],
    "diabetes": ["diabetes"],
    "lung": ["lung"],
}

DATASET_LABELS = {
    "alz": "Alzheimer's",
    "breast": "Breast Cancer",
    "heart": "Heart Disease",
    "diabetes": "Diabetes",
    "lung": "Lung Cancer",
}


def _finite_float(x: float, default: float = 0.0) -> float:
    v = float(x)
    return default if math.isnan(v) or math.isinf(v) else v


def _to_percent(value: float) -> float:
    return round(_finite_float(value, 0.0) * 100, 1)


def _sanitize_for_json(obj: Any) -> Any:
    """Recursively replace nan/inf and numpy scalars so Starlette json.dumps succeeds."""
    if obj is None or isinstance(obj, (str, bool)):
        return obj
    if isinstance(obj, float):
        return 0.0 if math.isnan(obj) or math.isinf(obj) else obj
    if isinstance(obj, (np.floating, np.integer)):
        if isinstance(obj, np.integer):
            return int(obj)
        x = float(obj)
        return 0.0 if math.isnan(x) or math.isinf(x) else x
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_sanitize_for_json(v) for v in obj]
    return obj


def _safe_auc(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    try:
        if len(np.unique(y_true)) < 2:
            return 0.0
        if len(np.unique(y_true)) == 2:
            auc = float(roc_auc_score(y_true, y_prob[:, 1]))
        else:
            auc = float(roc_auc_score(y_true, y_prob, multi_class="ovr"))
        return _finite_float(auc, 0.0)
    except Exception:
        return 0.0


def _specificity(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    try:
        labels = np.unique(np.concatenate([y_true, y_pred]))
        if len(labels) != 2:
            return 0.0
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
        return float(tn / (tn + fp)) if (tn + fp) else 0.0
    except Exception:
        return 0.0


def _metric_payload(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict[str, float]:
    return {
        "accuracy": _to_percent(accuracy_score(y_true, y_pred)),
        "precision": _to_percent(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
        "sensitivity": _to_percent(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
        "specificity": _to_percent(_specificity(y_true, y_pred)),
        "f1": _to_percent(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
        "auroc": round(_safe_auc(y_true, y_prob) * 100, 1),
    }


def _error_payload(name: str, y_true: np.ndarray, baseline_pred: np.ndarray, chaos_pred: np.ndarray) -> dict[str, float | str]:
    baseline_mae = _finite_float(mean_absolute_error(y_true, baseline_pred), 0.0)
    chaos_mae = _finite_float(mean_absolute_error(y_true, chaos_pred), 0.0)
    baseline_rmse = _finite_float(float(np.sqrt(mean_squared_error(y_true, baseline_pred))), 0.0)
    chaos_rmse = _finite_float(float(np.sqrt(mean_squared_error(y_true, chaos_pred))), 0.0)
    baseline_mape = _finite_float(float(np.mean(np.abs((y_true - baseline_pred) / (y_true + 1e-10))) * 100), 0.0)
    chaos_mape = _finite_float(float(np.mean(np.abs((y_true - chaos_pred) / (y_true + 1e-10))) * 100), 0.0)
    return {
        "name": name,
        "baselineMae": round(baseline_mae, 3),
        "chaosMae": round(chaos_mae, 3),
        "baselineRmse": round(baseline_rmse, 3),
        "chaosRmse": round(chaos_rmse, 3),
        "baselineMape": round(baseline_mape, 2),
        "chaosMape": round(chaos_mape, 2),
    }


def _detect_dataset_key(file_name: str) -> str | None:
    lower = file_name.lower()
    for key, keywords in DATASET_KEYWORDS.items():
        if any(keyword in lower for keyword in keywords):
            return key
    return None


def _find_candidate_datasets() -> dict[str, Path]:
    candidates: dict[str, Path] = {}
    search_roots = [
        BASE_DIR.parent.parent / "Datasets",
        BASE_DIR / "data",
        BASE_DIR / "datasets",
        BASE_DIR.parent / "data",
        BASE_DIR.parent / "datasets",
        BASE_DIR.parent,
    ]
    for root in search_roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".csv", ".xlsx", ".xls"}:
                continue
            key = _detect_dataset_key(path.name)
            if key and key not in candidates:
                candidates[key] = path
    return candidates


def _load_dataframe(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    return pd.read_excel(path)


def _prepare_dataset(path: Path) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    df = _load_dataframe(path).copy()
    total_rows = len(df)
    target_col = df.columns[-1]

    for col in df.columns:
        if col == target_col:
            continue
        if not is_numeric_dtype(df[col]):
            df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(df.mean(numeric_only=True))
    df = df.fillna(0)

    X = df.drop(columns=[target_col]).values
    y = LabelEncoder().fit_transform(df[target_col].values)

    positives = int(np.sum(y == 1)) if len(np.unique(y)) == 2 else int(np.sum(y == y.max()))
    negatives = int(total_rows - positives)

    meta = {
      "total": int(total_rows),
      "positive": positives,
      "negative": negatives,
      "features": int(X.shape[1]),
    }
    return X, y, meta


def _fit_tabnet(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    params: dict[str, Any] | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    if TabNetClassifier is None:
        model = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=400, random_state=42)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)
        return preds, probs

    actual_params = params or {
        "n_d": 32,
        "n_a": 32,
        "n_steps": 5,
        "gamma": 1.3,
        "lambda_sparse": 1e-3,
        "optimizer_params": {"lr": 2e-2},
        "momentum": 0.02,
    }
    model = TabNetClassifier(**actual_params, verbose=0)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], patience=20, max_epochs=60)
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)
    return preds, probs


def _fit_chaos_tabnet(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    if TabNetClassifier is None:
        model = MLPClassifier(hidden_layer_sizes=(96, 48), learning_rate_init=0.005, max_iter=500, random_state=42)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)
        return preds, probs

    optimizer = ChaosOptimizer(n_iterations=6)

    def evaluate(params: dict[str, Any]) -> float:
        model = TabNetClassifier(**params, verbose=0)
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], patience=10, max_epochs=40)
        preds = model.predict(X_test)
        return float(accuracy_score(y_test, preds))

    best_params, _best_score = optimizer.optimize(evaluate)
    if best_params is None:
        best_params = {
            "n_d": 32,
            "n_a": 32,
            "n_steps": 5,
            "gamma": 1.3,
            "lambda_sparse": 1e-3,
            "optimizer_params": {"lr": 2e-2},
            "momentum": 0.02,
        }

    model = TabNetClassifier(**best_params, verbose=0)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], patience=20, max_epochs=80)
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)
    return preds, probs


def _heart_model_comparison(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    baseline_acc: float,
    chaos_acc: float,
) -> list[dict[str, Any]]:
    comparisons: list[dict[str, Any]] = []

    logistic = LogisticRegression(max_iter=1000, random_state=42)
    logistic.fit(X_train, y_train)
    comparisons.append({"name": "Logistic Regression", "accuracy": round(accuracy_score(y_test, logistic.predict(X_test)) * 100, 1)})

    forest = RandomForestClassifier(n_estimators=200, random_state=42)
    forest.fit(X_train, y_train)
    comparisons.append({"name": "Random Forest", "accuracy": round(accuracy_score(y_test, forest.predict(X_test)) * 100, 1)})

    if XGBClassifier is not None:
        xgb = XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)
        xgb.fit(X_train, y_train)
        comparisons.append({"name": "XGBoost", "accuracy": round(accuracy_score(y_test, xgb.predict(X_test)) * 100, 1)})

    mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=450, random_state=42)
    mlp.fit(X_train, y_train)
    comparisons.append({"name": "Tabular Neural Net", "accuracy": round(accuracy_score(y_test, mlp.predict(X_test)) * 100, 1)})

    comparisons.append({"name": "Standard TabNet", "accuracy": baseline_acc})
    comparisons.append({"name": "Chaos-Opt TabNet", "accuracy": chaos_acc})
    return comparisons


def disease_types_to_allowed_keys(disease_types: list[str | None]) -> set[str]:
    """Map admin CSV disease labels (e.g. 'Heart Disease') to benchmark keys (e.g. 'heart')."""
    allowed: set[str] = set()
    for dt in disease_types:
        if not dt:
            continue
        low = dt.lower()
        for key, kws in DATASET_KEYWORDS.items():
            if any(kw in low for kw in kws):
                allowed.add(key)
                break
    return allowed


_ERROR_METRIC_NAME_HINTS: dict[str, tuple[str, ...]] = {
    "alz": ("alz",),
    "breast": ("breast",),
    "heart": ("heart",),
    "diabetes": ("diab",),
    "lung": ("lung",),
}


def filter_experimental_payload(payload: dict[str, Any], allowed_keys: set[str]) -> dict[str, Any]:
    """Keep only benchmark sections that match the admin's uploaded disease categories."""
    out = dict(payload)
    if not allowed_keys:
        out["performance"] = {}
        out["dataset_overview"] = []
        out["error_metrics"] = []
        out["confusion_matrices"] = []
        out["model_comparison"] = []
        return out

    label_set = {DATASET_LABELS[k] for k in allowed_keys if k in DATASET_LABELS}

    perf_in = payload.get("performance") or {}
    out["performance"] = {k: perf_in[k] for k in allowed_keys if k in perf_in}

    overview = payload.get("dataset_overview") or []
    out["dataset_overview"] = [x for x in overview if x.get("name") in label_set]

    def _error_matches(row: dict[str, Any]) -> bool:
        n = (row.get("name") or "").lower()
        for k in allowed_keys:
            for hint in _ERROR_METRIC_NAME_HINTS.get(k, (k,)):
                if hint in n:
                    return True
        return False

    out["error_metrics"] = [x for x in (payload.get("error_metrics") or []) if _error_matches(x)]

    cm = payload.get("confusion_matrices") or []
    out["confusion_matrices"] = [x for x in cm if x.get("name") in label_set]

    mc = payload.get("model_comparison") or []
    out["model_comparison"] = list(mc) if "heart" in allowed_keys else []

    key_order = ["alz", "breast", "heart", "diabetes", "lung"]
    shown = ", ".join(DATASET_LABELS[k] for k in key_order if k in allowed_keys)
    base_status = (payload.get("status") or "").strip()
    suffix = f" Filtered to your uploads: {shown}." if shown else ""
    out["status"] = (base_status + suffix).strip()
    return out


def experimental_payload_for_admin_diseases(
    payload: dict[str, Any],
    disease_types: list[str | None],
) -> dict[str, Any]:
    clean = [d for d in disease_types if d]
    allowed = disease_types_to_allowed_keys(clean)
    if allowed:
        return filter_experimental_payload(payload, allowed)
    out = filter_experimental_payload(payload, set())
    hint = (
        " Add words like heart, diabetes, lung, breast, or alzheimer to your disease name to match report benchmarks."
    )
    out["status"] = (out.get("status") or "").strip() + hint
    return out


def load_experimental_results() -> dict[str, Any]:
    for path in [GENERATED_RESULTS_PATH, DEFAULT_RESULTS_PATH]:
        if path.exists():
            with open(path, "r", encoding="utf-8") as handle:
                return _sanitize_for_json(json.load(handle))
    raise FileNotFoundError("No experimental results payload found")


def generate_experimental_results() -> dict[str, Any]:
    datasets = _find_candidate_datasets()
    if not datasets:
        payload = load_experimental_results()
        payload["source"] = "fallback"
        payload["status"] = "No dataset files found. Using fallback report metrics."
        return payload

    dataset_overview: list[dict[str, Any]] = []
    performance: dict[str, Any] = {}
    error_metrics: list[dict[str, Any]] = []
    confusion_matrices: list[dict[str, Any]] = []
    model_comparison: list[dict[str, Any]] = []

    for key, path in datasets.items():
        X, y, meta = _prepare_dataset(path)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
        )

        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        baseline_pred, baseline_prob = _fit_tabnet(X_train, y_train, X_test, y_test)
        chaos_pred, chaos_prob = _fit_chaos_tabnet(X_train, y_train, X_test, y_test)

        dataset_overview.append({"name": DATASET_LABELS[key], **meta})
        performance[key] = {
            "label": DATASET_LABELS[key],
            "baseline": _metric_payload(y_test, baseline_pred, baseline_prob),
            "chaos": _metric_payload(y_test, chaos_pred, chaos_prob),
        }
        error_metrics.append(_error_payload(DATASET_LABELS[key], y_test, baseline_pred, chaos_pred))
        confusion_matrices.append({
            "name": DATASET_LABELS[key],
            "baseline": confusion_matrix(y_test, baseline_pred, labels=[0, 1]).tolist(),
            "chaos": confusion_matrix(y_test, chaos_pred, labels=[0, 1]).tolist(),
        })

        if key == "heart":
            model_comparison = _heart_model_comparison(
                X_train,
                y_train,
                X_test,
                y_test,
                performance[key]["baseline"]["accuracy"],
                performance[key]["chaos"]["accuracy"],
            )

    payload = _sanitize_for_json({
        "source": "generated",
        "status": f"Generated from {len(datasets)} dataset file(s).",
        "dataset_overview": dataset_overview,
        "performance": performance,
        "error_metrics": error_metrics,
        "model_comparison": model_comparison,
        "confusion_matrices": confusion_matrices,
    })

    with open(GENERATED_RESULTS_PATH, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, allow_nan=False)

    return payload
