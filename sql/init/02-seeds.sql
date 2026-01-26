-- Connect to database
\connect pa2425

-- Insert data
INSERT INTO users (email, password, role, tokens) VALUES
('alice@example.com', 'pippopluto93', 'user', 100),
('bob@example.com', 'pippopluto93', 'operator', 100),
('charlie@example.com', 'pippopluto93', 'admin', 100);
