-- Connect to your database first
\c soccer_super_stars_db   -- replace with your actual DB name

-- Drop the table if it already exists
DROP TABLE IF EXISTS users;

-- Create the table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    score INT DEFAULT 0
);

-- Insert some dummy users
INSERT INTO users (username, password) VALUES ('alice@example.com', 'password123');
INSERT INTO users (username, password) VALUES ('bob@example.com', 'mypassword');
INSERT INTO users (username, password) VALUES ('charlie@example.com', 'secretpass');

SELECT * FROM users;

-- Quit psql
\q
