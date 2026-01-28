-- Connect to database
\connect pa2425

-- Insert data
INSERT INTO users (email, password, role, tokens) VALUES
('alice@example.com', '$2b$10$caSKPemnx9SZi3PKPuvGuuXPPwHJl.uM2hiJLgfFPsGjwxmNeNptm', 'user', 100),
('bob@example.com', '$2b$10$3CviVz3qOX9E.JpMIaKw1OIqHbhpdRBLYXvDoYXM0TYMNa3me2uoe', 'operator', 100),
('charlie@example.com', '$2b$10$Dicjz7Yv9JUigZaD1IMtmO1vwr1XT6/HdidyoGfG3fpJHihBp4Y/6', 'admin', 100);
