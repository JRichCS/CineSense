import sys
import json
import pandas as pd
import pickle
import os
import numpy as np

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "movies.csv"))
df_scaled = pd.read_csv(os.path.join(BASE_DIR, "scaled_features.csv"))

# Set index for lookup
df.set_index('tconst', inplace=True)
df_scaled.index = df.index  # Ensure the index matches

# Load the trained KNN model
with open(os.path.join(BASE_DIR, "knn_model.pkl"), "rb") as f:
    knn = pickle.load(f)

def recommend_multiple(imdb_ids):
    # Filter only valid IMDb IDs
    valid_ids = [mid for mid in imdb_ids if mid in df_scaled.index]

    if not valid_ids:
        return {"error": "No valid IMDb IDs provided."}

    # Get feature vectors of the selected movies
    feature_vectors = df_scaled.loc[valid_ids]

    # Average the feature vectors
    avg_vector = feature_vectors.mean(axis=0).values.reshape(1, -1)

    # Run KNN to get neighbors
    distances, indices = knn.kneighbors(avg_vector, n_neighbors=20)

    # Flatten and convert indices to IMDb IDs
    all_recs = df_scaled.iloc[indices[0]].index.tolist()

    # Remove input IMDb IDs from recommendations
    filtered_recs = [rec for rec in all_recs if rec not in valid_ids]

    # Return top 10
    return {"recommendations": filtered_recs[:10]}

# Accept JSON array of IMDb IDs as argument
if len(sys.argv) > 1:
    try:
        imdb_ids = json.loads(sys.argv[1])
        result = recommend_multiple(imdb_ids)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": f"Invalid input or internal error: {str(e)}"}))
else:
    print(json.dumps({"error": "No IMDb IDs provided"}))
