import requests
import pandas as pd
import time

API_KEY = '###'
BASE_URL = 'https://api.themoviedb.org/3'




HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json;charset=utf-8'
}

def get_discover_movies(page):
    url = f'{BASE_URL}/discover/movie'
    params = {
        'sort_by': 'vote_count.desc',
        'page': page,
        'vote_count.gte': 50,
        'api_key': API_KEY
    }
    response = requests.get(url, params=params)
    return response.json().get('results', [])

def get_imdb_id_for_person(person_id):
    url = f"{BASE_URL}/person/{person_id}/external_ids"
    params = {'api_key': API_KEY}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get("imdb_id")
    else:
        print(f"Failed to fetch IMDb ID for person {person_id}")
        return None

def get_movie_details(movie_id):
    movie = requests.get(f'{BASE_URL}/movie/{movie_id}', params={'api_key': API_KEY}).json()
    credits = requests.get(f'{BASE_URL}/movie/{movie_id}/credits', params={'api_key': API_KEY}).json()
    external = requests.get(f'{BASE_URL}/movie/{movie_id}/external_ids', params={'api_key': API_KEY}).json()

    imdb_id = external.get('imdb_id')
    title = movie.get('title')
    release_year = movie.get('release_date', '')[:4]
    runtime = movie.get('runtime')
    rating = movie.get('vote_average')
    genres = movie.get('genres')
    genre_name = genres[0]['name'] if genres else None
    print(title)

    # Handle cast
    cast = credits.get('cast', [])
    actor1_tmdb = cast[0]['id'] if len(cast) > 0 else None
    actor2_tmdb = cast[1]['id'] if len(cast) > 1 else None
    actor1 = get_imdb_id_for_person(actor1_tmdb) if actor1_tmdb else None
    actor2 = get_imdb_id_for_person(actor2_tmdb) if actor2_tmdb else None

    # Handle director
    crew = credits.get('crew', [])
    directors_tmdb = [c['id'] for c in crew if c['job'] == 'Director']
    director_tmdb = directors_tmdb[0] if directors_tmdb else None
    director = get_imdb_id_for_person(director_tmdb) if director_tmdb else None
    
    return {
        'tconst': imdb_id,
        'primaryTitle': title,
        'startYear': release_year,
        'runtimeMinutes': runtime,
        'rating': rating,
        'primaryGenre': genre_name,
        'actor1': actor1,
        'actor2': actor2,
        'directors': director
    }

def fetch_top_movies(limit=10000):
    data = []
    pages = limit // 20
    print(f"Fetching up to {limit} movies across {pages} pages...")

    request_count = 0

    for page in range(1, pages + 1):
        print(f"Page {page}...")
        movies = get_discover_movies(page)
        request_count += 1

        for movie in movies:
            try:
                details = get_movie_details(movie['id'])
                request_count += 4  # 1 discover + 3 detail requests + 3x external_id (if actors/director exist)

                if details['tconst']:  # skip if no IMDb ID
                    data.append(details)

                # Sleep every 40 requests
                if request_count % 40 == 0:
                    print("Sleeping for 1 second to avoid spamming the API...")
                    time.sleep(1)

            except Exception as e:
                print(f"Error on movie {movie['id']}: {e}")

    df = pd.DataFrame(data)
    return df


# === Run the Script ===
df = fetch_top_movies(limit=10000)
df.to_csv("tmdb_top_movies.csv", index=False)
print("Saved to tmdb_top_movies.csv")
