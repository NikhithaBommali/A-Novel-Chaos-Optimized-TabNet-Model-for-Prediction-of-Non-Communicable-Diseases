import torch
from pytorch_tabnet.tab_model import TabNetClassifier

class DiseasePredictionTabNet:
    """
    Wrapper for TabNetClassifier to be used with Chaos Optimization.
    """
    def __init__(self, params=None):
        if params is None:
            # Defaults
            params = {
                "n_d": 32, "n_a": 32, "n_steps": 5,
                "gamma": 1.3, "lambda_sparse": 1e-3, 
                "optimizer_params": {"lr": 2e-2},
                "momentum": 0.02
            }
        
        self.params = params
        self.model = TabNetClassifier(
            n_d=params["n_d"],
            n_a=params["n_a"],
            n_steps=params["n_steps"],
            gamma=params["gamma"],
            lambda_sparse=params["lambda_sparse"],
            optimizer_params=params["optimizer_params"],
            momentum=params["momentum"],
            verbose=0,
            optimizer_fn=torch.optim.Adam
        )
        
    def fit(self, X_train, y_train, X_valid, y_valid):
        self.model.fit(
            X_train=X_train, y_train=y_train,
            eval_set=[(X_valid, y_valid)],
            eval_name=['valid'],
            eval_metric=['accuracy'],
            max_epochs=50, # Keep low for optimization speed
            patience=20,
            batch_size=256, 
            virtual_batch_size=128,
            num_workers=0,
            drop_last=False
        )
        
    def predict(self, X):
        return self.model.predict(X)

    def predict_proba(self, X):
        return self.model.predict_proba(X)
        
    def explain(self, X):
        """
        Returns feature importance and masks for explainability.
        """
        explain_matrix, masks = self.model.explain(X)
        return explain_matrix, masks
    
    def save_model(self, path):
        self.model.save_model(path)

    def load_model(self, path):
        self.model.load_model(path)
