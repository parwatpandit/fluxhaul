import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from flask import Flask, request, jsonify

app = Flask(__name__)

# Generate synthetic training data
def generate_training_data():
    np.random.seed(42)
    n = 200
    data = {
        'distance_km': np.random.uniform(1, 500, n),
        'weather_score': np.random.randint(1, 5, n),
        'driver_rating': np.random.uniform(1, 5, n),
        'package_weight': np.random.uniform(0.1, 50, n),
        'hour_of_day': np.random.randint(0, 24, n),
        'delayed': np.random.randint(0, 2, n),
    }
    return pd.DataFrame(data)

# Train model
df = generate_training_data()
X = df[['distance_km', 'weather_score', 'driver_rating', 'package_weight', 'hour_of_day']]
y = df['delayed']
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

@app.route('/predict/delay', methods=['POST'])
def predict_delay():
    try:
        data = request.json
        features = [[
            data.get('distance_km', 10),
            data.get('weather_score', 3),
            data.get('driver_rating', 4),
            data.get('package_weight', 1),
            data.get('hour_of_day', 12),
        ]]
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        return jsonify({
            'will_be_delayed': bool(prediction),
            'delay_probability': round(float(probability) * 100, 2),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running'})

if __name__ == '__main__':
    app.run(port=5002, debug=True)
