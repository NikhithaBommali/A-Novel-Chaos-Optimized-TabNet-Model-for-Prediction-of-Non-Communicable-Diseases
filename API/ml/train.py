import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

from ml.chaos_optimizer import ChaosOptimizer
from ml.tabnet_model import DiseasePredictionTabNet
from ml.utils import DataPreprocessor

# Mock Dataset Generator for demonstration if no CSV provided
def generate_mock_data(n_samples=1000):
    np.random.seed(42)
    data = {
        'age': np.random.randint(18, 90, n_samples),
        'gender': np.random.choice(['M', 'F'], n_samples),
        'bmi': np.random.normal(25, 5, n_samples),
        'blood_pressure': np.random.normal(120, 15, n_samples),
        'cholesterol': np.random.normal(200, 40, n_samples),
        'glucose': np.random.normal(100, 20, n_samples),
        'smoker': np.random.choice(['yes', 'no', 'former'], n_samples),
        'physical_activity': np.random.choice(['low', 'moderate', 'high'], n_samples),
        'has_heart_disease': np.random.randint(0, 2, n_samples) # Target
    }
    return pd.DataFrame(data)

def train_pipeline(data_path=None, target_col='has_heart_disease', save_path='model_heart.zip'):
    print(f"--- Starting Training Pipeline for {target_col} ---")
    
    # 1. Load Data
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        print("Dataset not found or provided. Using generated mock data.")
        df = generate_mock_data()
        
    # 2. Preprocess
    preprocessor = DataPreprocessor()
    df_processed = preprocessor.preprocess_train(df)
    
    X = df_processed.drop(columns=[target_col]).values
    y = df_processed[target_col].values
    
    X_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.3, random_state=42)
    
    # 3. Define Evaluation Function for Chaos Optimizer
    def evaluate_model(params):
        model = DiseasePredictionTabNet(params)
        model.fit(X_train, y_train, X_valid, y_valid)
        preds = model.predict(X_valid)
        return accuracy_score(y_valid, preds)
    
    # 4. Run Chaos Optimization
    optimizer = ChaosOptimizer(n_iterations=10) # 10 iterations for speed
    best_params, best_score = optimizer.optimize(evaluate_model)
    
    print(f"Best Params: {best_params}")
    print(f"Best Validation Accuracy: {best_score:.4f}")
    
    # 5. Train Final Model with Best Params
    final_model = DiseasePredictionTabNet(best_params)
    final_model.fit(X_train, y_train, X_valid, y_valid)
    
    # 6. Save Model & Preprocessor
    os.makedirs('API/models', exist_ok=True)
    final_model.save_model(os.path.join('API/models', save_path))
    
    with open(os.path.join('API/models', f'{target_col}_preprocessor.pkl'), 'wb') as f:
        pickle.dump(preprocessor, f)
        
    print("Model and Preprocessor saved successfully.")

if __name__ == "__main__":
    train_pipeline()
