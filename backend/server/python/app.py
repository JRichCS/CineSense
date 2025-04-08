from flask import Flask, request, jsonify
import pandas as pd
import pickle
import os



BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))

print(BASE_DIR)

# Build full paths to the CSV files
movies_path = os.path.join(BASE_DIR, "movies.csv")
scaled_path = os.path.join(BASE_DIR, "scaled_features.csv")
pkl_path = os.path.join(BASE_DIR, "knn_model.pkl")

# Load everything
df = pd.read_csv(movies_path)
df_scaled = pd.read_csv(scaled_path)

with open(pkl_path, "rb") as f:
    knn_model = pickle.load(f)

app = Flask(__name__)

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    movie_name = data.get("movie_name")

    # Find the index of the movie
    movie_index = df[df["primaryTitle"].str.lower() == movie_name.lower()].index
    if movie_index.empty:
        return jsonify({"error": "Movie not found"}), 404

    movie_index = movie_index[0]

    # Get KNN recommendations
    distances, indices = knn_model.kneighbors([df_scaled.iloc[movie_index]])
    recommended_titles = df.iloc[indices[0][1:]]["primaryTitle"].tolist()

    return jsonify({"recommendations": recommended_titles})

if __name__ == "__main__":
    app.run(debug=True)
