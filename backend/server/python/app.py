import sys
import json
import pandas as pd
import pickle
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "movies.csv"))
df_features = pd.read_csv(os.path.join(BASE_DIR, "scaled_dataset.csv"))

# Set index for lookup
df.set_index('tconst', inplace=True)
df_features.index = df.index  # Ensure the index matches

def get_similar_movies_cosine(df_weighted, input_ids, total_recommendations=10):
    recommendations = []
    per_movie_recommendations = max(1, int(total_recommendations / len(input_ids)))

    for movie_id in input_ids:
        if movie_id not in df_weighted.index:
            continue

        vector = df_weighted.loc[movie_id].values.reshape(1, -1)

        # Compute cosine similarity between this movie and all others
        similarities = cosine_similarity(vector, df_weighted.values)[0]

        sim_series = pd.Series(similarities, index=df_weighted.index)
        sim_series = sim_series.drop(labels=[movie_id])  # remove self


        top_ids = sim_series.sort_values(ascending=False).head(per_movie_recommendations).index.tolist()
        recommendations.extend(top_ids)

    if not recommendations:
        raise ValueError("No valid recommendations could be made from the input IDs.")

    return recommendations


def apply_custom_weights(df_scaled, weights):
    genre_cols = [col for col in df_scaled.columns if col.startswith("primaryGenre_")]
    director_cols = [col for col in df_scaled.columns if col.startswith("director")]
    actor_cols = [col for col in df_scaled.columns if col.startswith("actor")]
    rating = ["rating"]

    df_weighted = df_scaled.copy()

    # Apply weights
    if "genre" in weights:
        df_weighted[genre_cols] *= weights["genre"]
    if "director" in weights:
        df_weighted[director_cols] *= weights["director"]
    if "actor" in weights:
        df_weighted[actor_cols] *= weights["actor"]
    if "numeric" in weights:
        df_weighted[rating] *= weights["rating"]


    return df_weighted


# Accept JSON array of IMDb IDs as argument
if len(sys.argv) > 1:
    try:
        payload = json.loads(sys.argv[1])
        imdb_ids = payload.get("imdb_ids", [])
        weights = payload.get("weights", {"genre": 1.0, "director": 1.0, "actor": 1.0, "rating": 1.0})

        df_weighted = apply_custom_weights(df_features, weights)
        

        result = get_similar_movies_cosine(df_weighted, imdb_ids, total_recommendations=10)

        # ✅ ALWAYS RETURN VALID JSON OBJECT
        print(json.dumps({ "recommendations": result }))
    except Exception as e:
        print(json.dumps({ "error": f"Invalid input or internal error: {str(e)}" }))
else:
    print(json.dumps({ "error": "No input provided" }))
