import numpy as np

class ChaosOptimizer:
    """
    Implements the Chaos Optimization Algorithm (COA) using the Logistic Map
    to optimize hyperparameters for TabNet.
    
    Logistic Map Equation: x(n+1) = r * x(n) * (1 - x(n))
    where r = 4 (fully chaotic regime)
    """
    
    def __init__(self, n_iterations=30, r=4.0):
        self.n_iterations = n_iterations
        self.r = r # Control parameter, 4.0 ensures chaotic behavior
        
    def generate_chaotic_sequence(self, x0, length):
        """
        Generates a sequence of chaotic numbers between 0 and 1.
        """
        sequence = []
        x = x0
        for _ in range(length):
            x = self.r * x * (1 - x)
            sequence.append(x)
        return sequence

    def map_to_hyperparameters(self, chaotic_value):
        """
        Maps a single chaotic value (0-1) to a set of TabNet hyperparameters.
        This provides ergodic exploration of the parameter space.
        """
        # Map to Learning Rate: Log scale range [1e-4, 1e-2]
        # lr = 10^(-4 + x * 2) -> 10^-4 to 10^-2
        learning_rate = 10 ** (-4 + chaotic_value * 2)
        
        # Map to Sparsity Coefficient (lambda_sparse): Range [1e-4, 1e-1]
        lambda_sparse = 10 ** (-4 + chaotic_value * 3)
        
        # Map to Decision Steps (n_steps): Integer Range [3, 10]
        # x is 0-1, so 3 + floor(x * 7) gives 3 to 9/10
        n_steps = int(3 + np.floor(chaotic_value * 8))
        if n_steps > 10: n_steps = 10
        
        # Map to Feature Dimensions (n_d, n_a): Range [8, 64]
        # Usually n_d = n_a for TabNet
        dim_base = 8 + int(chaotic_value * 56) 
        n_d = n_a = dim_base
        
        return {
            "optimizer_params": {"lr": learning_rate},
            "lambda_sparse": lambda_sparse,
            "n_steps": n_steps,
            "n_d": n_d,
            "n_a": n_a,
            "gamma": 1.3, # Fixed for now or could be optimized
            "momentum": 0.02
        }

    def optimize(self, eval_function, x0=None):
        """
        Runs the chaos optimization loop.
        
        Args:
            eval_function: A function that takes params and returns a score (higher is better).
            x0: Initial chaotic value. If None, random (0,1) is used.
            
        Returns:
            best_params: The hyperparameters that achieved the highest score.
            best_score: The highest score achieved.
        """
        if x0 is None:
            x0 = np.random.random()
            # Avoid fixed points 0, 0.25, 0.5, 0.75, 1.0 for r=4
            while x0 in [0, 0.25, 0.5, 0.75, 1.0]:
                x0 = np.random.random()
                
        best_score = -float('inf')
        best_params = None
        
        print(f"Starting Chaos Optimization with x0={x0:.4f} for {self.n_iterations} iterations...")
        
        x = x0
        for i in range(self.n_iterations):
            # 1. Generate next chaotic value
            x = self.r * x * (1 - x)
            
            # 2. Map to parameters
            params = self.map_to_hyperparameters(x)
            
            # 3. Evaluate (Train model with these params)
            print(f"Iteration {i+1}/{self.n_iterations}: Testing params {params}...")
            try:
                score = eval_function(params)
                print(f"  -> Score: {score:.4f}")
                
                # 4. Update best
                if score > best_score:
                    best_score = score
                    best_params = params
                    print(f"  -> New Best found!")
            except Exception as e:
                print(f"  -> Failed to evaluate params: {e}")
                
        return best_params, best_score
