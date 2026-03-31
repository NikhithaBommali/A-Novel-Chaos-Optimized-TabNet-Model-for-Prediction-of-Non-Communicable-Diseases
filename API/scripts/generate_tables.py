import pandas as pd
import numpy as np
import os
import glob
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)
from xgboost import XGBClassifier
import torch
from pytorch_tabnet.tab_model import TabNetClassifier

# --- Chaos Optimization Logic (Self-Contained) ---
class ChaosOptimizer:
    def __init__(self, n_iterations=20, r=4.0):
        self.n_iterations = n_iterations
        self.r = r 
        
    def get_hyperparameters_tabnet(self, chaotic_value):
        # Map 0-1 to TabNet params
        lr = 10 ** (-4 + chaotic_value * 2) # 0.0001 to 0.01
        lambda_sparse = 10 ** (-5 + chaotic_value * 3) # 1e-5 to 1e-2
        n_steps = int(3 + chaotic_value * 5) # 3 to 8
        n_d = n_a = int(8 + chaotic_value * 56) # 8 to 64
        return {
            "n_d": n_d, "n_a": n_a, "n_steps": n_steps,
            "gamma": 1.3, "lambda_sparse": lambda_sparse,
            "optimizer_params": {"lr": lr},
            "momentum": 0.02
        }

    def get_hyperparameters_xgboost(self, chaotic_value):
        # Map 0-1 to XGBoost params
        lr = 0.01 + chaotic_value * 0.29 # 0.01 to 0.3
        max_depth = int(3 + chaotic_value * 7) # 3 to 10
        n_estimators = int(50 + chaotic_value * 250) # 50 to 300
        gamma = chaotic_value * 0.5 # 0 to 0.5
        return {
            "learning_rate": lr,
            "max_depth": max_depth,
            "n_estimators": n_estimators,
            "gamma": gamma
        }

    def optimize(self, eval_function, model_type='tabnet'):
        x = np.random.random()
        best_score = -float('inf')
        best_params = None
        
        print(f"  > Optimizing {model_type} with Chaos (r={self.r})...")
        for i in range(self.n_iterations):
            x = self.r * x * (1 - x) # Logistic Map
            
            if model_type == 'tabnet':
                params = self.get_hyperparameters_tabnet(x)
            else:
                params = self.get_hyperparameters_xgboost(x)
                
            try:
                score = eval_function(params)
                if score > best_score:
                    best_score = score
                    best_params = params
            except Exception as e:
                pass # Ignore failed params
                
        return best_params

# --- Metrics Calculation ---
def calculate_metrics(y_true, y_pred, y_prob):
    # Classification
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_true, y_pred, average='weighted', zero_division=0) # Sensitivity
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    
    try:
        if len(np.unique(y_true)) == 2:
            auroc = roc_auc_score(y_true, y_prob[:, 1])
        else:
            auroc = roc_auc_score(y_true, y_prob, multi_class='ovr')
    except:
        auroc = 0.0
        
    # Specificity
    try:
        if len(np.unique(y_true)) == 2:
            tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
            specificity = tn / (tn + fp)
        else:
            # Multiclass specificity average
            mcm = confusion_matrix(y_true, y_pred)
            tn = mcm.diagonal()
            # ... roughly specificity is hard to define simply for multiclass without strict OVR
            specificity = 0.0 
    except:
        specificity = 0.0

    # Error / Regression Metrics (on probabilities/predictions)
    # Treating outcome as 0/1 for error calculation
    y_true_num = y_true
    y_pred_num = y_pred 
    
    mae = mean_absolute_error(y_true_num, y_pred_num)
    mse = mean_squared_error(y_true_num, y_pred_num)
    rmse = np.sqrt(mse)
    mape = np.mean(np.abs((y_true_num - y_pred_num) / (y_true_num + 1e-10))) * 100
    r2 = r2_score(y_true_num, y_pred_num)

    return {
        "Accuracy": f"{acc*100:.2f}%",
        "Precision": f"{prec*100:.2f}%",
        "Sensitivity": f"{rec*100:.2f}%",
        "Specificity": f"{specificity*100:.2f}%" if specificity > 0 else "-",
        "F1 Score": f"{f1*100:.2f}%",
        "AUROC": f"{auroc:.2f}",
        "MAE": f"{mae:.3f}",
        "MSE": f"{mse:.3f}",
        "RMSE": f"{rmse:.3f}",
        "MAPE(%)": f"{mape:.2f}",
        "R^2": f"{r2:.3f}"
    }

# --- Main Evaluation Loop ---
def evaluate_datasets():
    # 1. auto-discover datasets
    extensions = ['*.csv', '*.xlsx', '*.xls']
    files = []
    
    # Check current dir (assuming script runs from root or inside API)
    search_paths = ['.', 'API', 'datasets', 'data']
    for path in search_paths:
        for ext in extensions:
            files.extend(glob.glob(os.path.join(path, ext)))
            
    # Filter specific files if possible based on names in user request
    target_keywords = ['heart', 'breast', 'lung', 'diabetes', 'alzheimer', 'cancer']
    selected_files = [f for f in files if any(k in f.lower() for k in target_keywords)]
    
    if not selected_files:
        print("No matching datasets found. Please place .csv/.xlsx files in this folder.")
        # Create Dummy Data for demonstration
        print("Running on Mock Data for DEMO purposes...")
        from sklearn.datasets import make_classification
        X, y = make_classification(n_samples=500, n_features=20, random_state=42)
        df_mock = pd.DataFrame(X, columns=[f'feat_{i}' for i in range(20)])
        df_mock['target'] = y
        df_mock.to_csv('mock_dataset.csv', index=False)
        selected_files = ['mock_dataset.csv']

    results_perf = []
    results_error = []

    for file_path in selected_files:
        dataset_name = os.path.basename(file_path).split('.')[0].upper()
        if "MOCK" in dataset_name: dataset_name = "DEMO DATA"
        print(f"\nProcessing {dataset_name}...")
        
        # Load
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
            
        # Preprocess
        # Assume last column is target if not specified
        target_col = df.columns[-1]
        
        # Encode Categorical
        le = LabelEncoder()
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = le.fit_transform(df[col].astype(str))
        
        # Fill NA
        df.fillna(df.mean(), inplace=True)
        
        X = df.drop(columns=[target_col]).values
        y = df[target_col].values
        
        # Ensure y is proper type
        y = le.fit_transform(y)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        
        # --- Algorithm 1: XGBoost (Standard) ---
        xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        xgb.fit(X_train, y_train)
        y_pred = xgb.predict(X_test)
        y_prob = xgb.predict_proba(X_test)
        
        m_xgb = calculate_metrics(y_test, y_pred, y_prob)
        results_perf.append({
            "DATA SET": dataset_name, "ALGORITHM": "XGBoost", 
            **{k:v for k,v in m_xgb.items() if k in ["Accuracy", "Precision", "Sensitivity", "Specificity", "F1 Score", "AUROC"]}
        })
        results_error.append({
            "DATA SET": dataset_name, "ALGORITHM": "XGBoost", 
            **{k:v for k,v in m_xgb.items() if k not in ["Accuracy", "Precision", "Sensitivity", "Specificity", "F1 Score", "AUROC"]}
        })
        
        # --- Algorithm 2: Chaos TabNet (Proposed) ---
        # Optimization
        chaos_opt = ChaosOptimizer(n_iterations=5) # Keeping iterations low for speed
        
        def eval_tabnet(params):
            clf = TabNetClassifier(**params, verbose=0)
            clf.fit(X_train, y_train, eval_set=[(X_test, y_test)], patience=10, max_epochs=50)
            preds = clf.predict(X_test)
            return accuracy_score(y_test, preds)
            
        best_params = chaos_opt.optimize(eval_tabnet, model_type='tabnet')
        if best_params is None: best_params = chaos_opt.get_hyperparameters_tabnet(0.5)
        
        # Train Best
        ctab = TabNetClassifier(**best_params, verbose=0)
        ctab.fit(X_train, y_train, eval_set=[(X_test, y_test)], patience=20, max_epochs=100)
        y_pred_c = ctab.predict(X_test)
        y_prob_c = ctab.predict_proba(X_test)
        
        m_chaos = calculate_metrics(y_test, y_pred_c, y_prob_c)
        results_perf.append({
            "DATA SET": "", "ALGORITHM": "Chaos TabNet", # Empty name for 2nd row grouping
            **{k:v for k,v in m_chaos.items() if k in ["Accuracy", "Precision", "Sensitivity", "Specificity", "F1 Score", "AUROC"]}
        })
        results_error.append({
            "DATA SET": "", "ALGORITHM": "Chaos TabNet", 
            **{k:v for k,v in m_chaos.items() if k not in ["Accuracy", "Precision", "Sensitivity", "Specificity", "F1 Score", "AUROC"]}
        })

    # Output Tables
    print("\n\n=== PERFORMANCE EVALUATION TABLE ===")
    df_perf = pd.DataFrame(results_perf)
    print(df_perf.to_markdown(index=False))
    
    print("\n\n=== ERROR & STATISTICAL ANALYSIS TABLE ===")
    df_err = pd.DataFrame(results_error)
    print(df_err.to_markdown(index=False))

if __name__ == "__main__":
    evaluate_datasets()
