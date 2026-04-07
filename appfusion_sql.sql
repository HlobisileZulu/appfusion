CREATE DATABASE appfusion;
SHOW DATABASES;
USE appfusion;

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    review_text TEXT,
    review_date VARCHAR(50),
    author VARCHAR(100),
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SHOW TABLES;

SELECT app_name, COUNT(*) as total_reviews 
FROM reviews 
GROUP BY app_name;

SELECT app_name, rating, review_text, review_date 
FROM reviews 
LIMIT 10;

SELECT app_name, rating, COUNT(*) as count
FROM reviews
GROUP BY app_name, rating
ORDER BY app_name, rating;