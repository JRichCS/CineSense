import sys
import json
import pandas as pd
import pickle
import os

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "movies.csv"))
df_scaled = pd.read_csv(os.path.join(BASE_DIR, "scaled_features.csv"))

# We assume that tconst was set as an index in movies.csv during training
df.set_index('tconst', inplace=True)

# Load the KNN model
with open(os.path.join(BASE_DIR, "knn_model.pkl"), "rb") as f:
    knn = pickle.load(f)

def recommend(imdb_id):
    # Ensure we're working with valid imdb_id
    if imdb_id not in df.index:
        return {"error": "Movie not found"}

    # Get the index of the movie based on IMDb ID (tconst)
    idx = df.index.get_loc(imdb_id)
    
    # Find the nearest neighbors using the KNN model
    distances, indices = knn.kneighbors([df_scaled.iloc[idx]])

    # Get the recommended movies using the indices (skip the first index because it's the input movie)
    recommended_movies = df.iloc[indices[0][1:]].index.tolist()

    return {"recommendations": recommended_movies}

# From stdin or argument
if len(sys.argv) > 1:
    imdb_id = sys.argv[1]  # Accept IMDb ID as input
else:
    imdb_id = sys.stdin.read().strip()

result = recommend(imdb_id)
print(json.dumps(result))
