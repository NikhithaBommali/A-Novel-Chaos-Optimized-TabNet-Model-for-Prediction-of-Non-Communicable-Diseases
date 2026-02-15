import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

class DataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.categorical_columns = ['gender', 'smoker', 'physical_activity']
        self.numerical_columns = ['age', 'bmi', 'blood_pressure', 'cholesterol', 'glucose']
        
    def preprocess_train(self, df):
        """
        Preprocesses training data: Fits encoders and scalers.
        """
        df_processed = df.copy()
        
        # 1. Handle Missing Values (Simple imputation for now)
        for col in self.numerical_columns:
            if col in df_processed.columns:
                df_processed[col] = df_processed[col].fillna(df_processed[col].mean())
                
        # 2. Encode Categorical
        for col in self.categorical_columns:
            if col in df_processed.columns:
                le = LabelEncoder()
                df_processed[col] = le.fit_transform(df_processed[col].astype(str))
                self.label_encoders[col] = le
            else:
                # Handle missing categorical columns by adding 0s or handling error
                pass
                
        # 3. Scale Numerical
        if all(col in df_processed.columns for col in self.numerical_columns):
            df_processed[self.numerical_columns] = self.scaler.fit_transform(df_processed[self.numerical_columns])
            
        return df_processed

    def preprocess_inference(self, data_dict):
        """
        Preprocesses a single dictionary of input data for prediction.
        """
        # Convert to DataFrame
        df = pd.DataFrame([data_dict])
        
        # Encode
        for col, le in self.label_encoders.items():
            if col in df.columns:
                # Handle unseen labels carefully
                try:
                    df[col] = le.transform(df[col].astype(str))
                except:
                    # Fallback for unseen label -> 0
                    df[col] = 0
                    
        # Scale
        if all(col in df.columns for col in self.numerical_columns):
            df[self.numerical_columns] = self.scaler.transform(df[self.numerical_columns])
            
        return df.values
