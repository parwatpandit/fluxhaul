import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from flask import Flask, request, jsonify

app = Flask(__name__)

# Generate synthetic training data
def generate_training_data():
    np.random.seed(42)
    n = 200
    data = {
        'day_of_week': np.random.randint(0, 7, n),
        'month': np.random.randint(1, 13, n),
        'price': np.random.uniform(10, 1000, n),
        'stock': np.random.randint(0, 500, n),
        'demand': np.random.randint(1, 100, n),
    }
    return pd.DataFrame(data)

# Train model
df = generate_training_data()
X = df[['day_of_week', 'month', 'price', 'stock']]
y = df['demand']
model = LinearRegression()
model.fit(X, y)

@app.route('/predict/demand', methods=['POST'])
def predict_demand():
    try:
        data = request.json
        features = [[
            data.get('day_of_week', 0),
            data.get('month', 1),
            data.get('price', 100),
            data.get('stock', 50),
        ]]
        prediction = model.predict(features)[0]
        return jsonify({
            'predicted_demand': round(float(prediction), 2),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
