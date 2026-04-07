import requests
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv
import os

# ── Load environment variables from .env file
load_dotenv()

# ── Database connection
def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password=os.getenv("DB_PASSWORD"),
        database="appfusion"
    )
    return connection

# ── Fetch reviews from iTunes API (completely free, no key needed)
def fetch_reviews(app_id, app_name):
    url = f"https://itunes.apple.com/us/rss/customerreviews/id={app_id}/sortBy=mostRecent/json"
    
    print(f"Fetching reviews for {app_name}...")
    
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error fetching {app_name}: {response.status_code}")
        return []
    
    data = response.json()
    
    # Check if reviews exist in the response
    if "feed" not in data or "entry" not in data["feed"]:
        print(f"No reviews found for {app_name}")
        return []
    
    reviews = []
    for entry in data["feed"]["entry"]:
        # Skip the first entry - it's app info not a review
        if "im:rating" not in entry:
            continue
            
        review = {
            "app_name": app_name,
            "rating": int(entry["im:rating"]["label"]),
            "review_text": entry["content"]["label"],
            "review_date": entry["updated"]["label"][:10],
            "author": entry["author"]["name"]["label"]
        }
        reviews.append(review)
    
    print(f"Found {len(reviews)} reviews for {app_name}")
    return reviews

# ── Save reviews to MySQL
def save_reviews(reviews):
    if not reviews:
        return
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        INSERT INTO reviews (app_name, rating, review_text, review_date, author)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    for review in reviews:
        cursor.execute(query, (
            review["app_name"],
            review["rating"],
            review["review_text"],
            review["review_date"],
            review["author"]
        ))
    
    conn.commit()
    print(f"Saved {len(reviews)} reviews to database")
    cursor.close()
    conn.close()

# ── Main function - runs everything
def main():
    # Bending Spoons apps and their iTunes App IDs
    apps = [
        {"id": "281796108", "name": "Evernote"},
        {"id": "522765726", "name": "WeTransfer"},
        {"id": "375593482", "name": "Meetup"}
    ]
    
    for app in apps:
        reviews = fetch_reviews(app["id"], app["name"])
        save_reviews(reviews)
        print(f"✓ Done with {app['name']}\n")
    
    print("All done! Check your database.")

# ── Run the script
if __name__ == "__main__":
    main()
