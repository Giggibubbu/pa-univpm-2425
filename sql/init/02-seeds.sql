-- Connect to database
\connect pa2425

-- Insert data
INSERT INTO users (email, password, role, tokens) VALUES
('alice@example.com', '$2b$10$caSKPemnx9SZi3PKPuvGuuXPPwHJl.uM2hiJLgfFPsGjwxmNeNptm', 'user', 5000),
('notoken@example.com', '$2b$10$caSKPemnx9SZi3PKPuvGuuXPPwHJl.uM2hiJLgfFPsGjwxmNeNptm', 'user', 2),
('bob@example.com', '$2b$10$3CviVz3qOX9E.JpMIaKw1OIqHbhpdRBLYXvDoYXM0TYMNa3me2uoe', 'operator', 0),
('charlie@example.com', '$2b$10$Dicjz7Yv9JUigZaD1IMtmO1vwr1XT6/HdidyoGfG3fpJHihBp4Y/6', 'admin', 0);

INSERT INTO no_navigation_zones (operator_id, route, validity_start, validity_end) VALUES
    -- sempre attiva
    (
        3,
        '{"type": "Polygon",
        "coordinates": [[[10.0, 41.0],[12.0, 41.0],[12.0, 42.0],[10.0, 42.0],[10.0, 41.0]]]}',
        NULL,
        NULL
    ),

    -- attiva
    (
        3,
        '{"type": "Polygon",
        "coordinates": [[[1.0, 50.5],[2.0, 50.5],[2.0, 51.0],[1.0, 51.0],[1.0, 50.5]]]}',
        '2025-01-01 00:00:00',
        '2027-12-31 23:59:59'
    ),

    -- scaduta
    (
        3,
        '{"type": "Polygon",
        "coordinates":[[[-73.0, 39.0],[-72.0, 39.0],[-72.0, 40.0],[-73.0, 40.0],[-73.0, 39.0]]]}',
        '2020-01-01 00:00:00',
        '2020-12-31 23:59:59'
    ),

    -- futura
    (
        3,
        '{"type": "Polygon",
        "coordinates":[[[49.0, -18.0],[51.0, -18.0],[51.0, -16.0],[49.0, -16.0],[49.0, -18.0]]]}',
        '2050-01-01 00:00:00',
        '2050-12-31 23:59:59'
    );

INSERT INTO navigation_requests 
(user_id, status, submitted_at, date_start, date_end, drone_id, navigation_plan, motivation) VALUES

-- Approved (2022)
(
    1, 
    'approved', 
    '2022-05-10 09:00:00',       
    '2022-05-15 10:00:00',       
    '2022-05-15 11:30:00',       
    'DRONE-SEA1', 
    '{ "type": "LineString", "coordinates": [
        [18.100, 37.500], 
        [18.150, 37.500], 
        [18.125, 37.550], 
        [18.100, 37.500]
    ]}', 
    NULL
),

-- Pending (2027)
(
    1, 
    'pending', 
    '2027-03-01 08:30:00', 
    '2027-03-10 09:00:00', 
    '2027-03-10 10:00:00',       
    'DRONE-SEA2', 
    '{ "type": "LineString", "coordinates": [
        [18.200, 37.600], 
        [18.250, 37.600], 
        [18.250, 37.620], 
        [18.200, 37.620], 
        [18.200, 37.600]
    ]}', 
    NULL
),

-- Approved (2026)
(
    1, 
    'approved', 
    '2026-11-20 14:00:00', 
    '2026-12-05 10:00:00', 
    '2026-12-05 11:45:00',       
    'DRONE-SEA1', 
    '{ "type": "LineString", "coordinates": [
        [18.300, 37.700], 
        [18.320, 37.700], 
        [18.320, 37.720], 
        [18.300, 37.720], 
        [18.300, 37.700]
    ]}', 
    NULL
),

-- Rejected (2020)
(
    1, 
    'rejected', 
    '2020-06-01 09:00:00', 
    '2020-06-10 12:00:00', 
    '2020-06-10 13:00:00', 
    'DRONE-OLD1', 
    '{ "type": "LineString", "coordinates": [
        [18.410, 37.800], 
        [18.420, 37.810], 
        [18.420, 37.820], 
        [18.410, 37.830], 
        [18.400, 37.820], 
        [18.400, 37.810], 
        [18.410, 37.800]
    ]}', 
    'Mancanza autorizzazione marittima'
),

-- Cancelled (2026)
(
    1, 
    'cancelled', 
    '2026-01-10 08:00:00', 
    '2026-01-20 09:00:00', 
    '2026-01-20 10:00:00', 
    'DRONE-SEA3', 
    '{ "type": "LineString", "coordinates": [
        [18.500, 37.950], 
        [18.550, 37.950], 
        [18.525, 37.900], 
        [18.500, 37.950]
    ]}', 
    NULL
),

-- Approved (2021)
(
    2, 
    'approved', 
    '2021-09-01 10:00:00', 
    '2021-09-10 15:00:00', 
    '2021-09-10 16:30:00', 
    'DRONE-OCN1', 
    '{ "type": "LineString", "coordinates": [
        [-30.000, 25.000], 
        [-29.950, 25.000], 
        [-29.950, 25.050], 
        [-30.000, 25.050], 
        [-30.000, 25.000]
    ]}', 
    NULL
),

-- Pending (2027)
(
    2, 
    'pending', 
    '2027-06-15 09:00:00', 
    '2027-06-20 11:00:00', 
    '2027-06-20 12:15:00', 
    'DRONE-OCN2', 
    '{ "type": "LineString", "coordinates": [
        [-30.100, 25.100], 
        [-30.050, 25.150], 
        [-30.150, 25.150], 
        [-30.100, 25.100]
    ]}', 
    NULL
),

-- Approved (2026)
(
    2, 
    'approved', 
    '2026-10-01 08:00:00', 
    '2026-10-15 14:00:00', 
    '2026-10-15 15:00:00', 
    'DRONE-OCN1', 
    '{ "type": "LineString", "coordinates": [
        [-30.200, 25.200], 
        [-30.200, 25.250], 
        [-30.300, 25.250], 
        [-30.300, 25.200], 
        [-30.200, 25.200]
    ]}', 
    NULL
),

-- Rejected (2020)
(
    2, 
    'rejected', 
    '2020-03-15 10:00:00', 
    '2020-03-20 09:00:00', 
    '2020-03-20 11:00:00', 
    'DRONE-OLD2', 
    '{ "type": "LineString", "coordinates": [
        [-30.400, 25.400], 
        [-30.410, 25.400], 
        [-30.410, 25.410], 
        [-30.400, 25.410], 
        [-30.400, 25.400]
    ]}', 
    'Drone non idoneo per oceano'
),

-- Cancelled (2026)
(
    2, 
    'cancelled', 
    '2026-02-01 11:00:00', 
    '2026-02-10 13:00:00', 
    '2026-02-10 14:30:00', 
    'DRONE-OCN3', 
    '{ "type": "LineString", "coordinates": [
        [-30.510, 25.500], 
        [-30.520, 25.510], 
        [-30.520, 25.520], 
        [-30.510, 25.530], 
        [-30.500, 25.520], 
        [-30.500, 25.510], 
        [-30.510, 25.500]
    ]}', 
    NULL
),

-- Pending (2026)
(
    1, 
    'pending', 
    '2026-07-10 09:00:00',
    '2026-07-20 10:00:00',
    '2026-07-20 11:30:00',
    'DRONE-SEA4', 
    '{ "type": "LineString", "coordinates": [
        [18.150, 37.550], 
        [18.200, 37.550], 
        [18.175, 37.600], 
        [18.150, 37.550]
    ]}', 
    NULL
),

-- Pending (2026)
(
    1, 
    'pending', 
    '2026-09-01 14:00:00', 
    '2026-09-15 14:00:00', 
    '2026-09-15 16:00:00', 
    'DRONE-SEA5', 
    '{ "type": "LineString", "coordinates": [
        [18.300, 37.600], 
        [18.350, 37.600], 
        [18.350, 37.650], 
        [18.300, 37.650], 
        [18.300, 37.600]
    ]}', 
    NULL
),

-- Pending (2026)
(
    2, 
    'pending', 
    '2026-07-25 08:30:00', 
    '2026-08-05 09:00:00', 
    '2026-08-05 10:30:00', 
    'DRONE-OCN4', 
    '{ "type": "LineString", "coordinates": [
        [-30.100, 25.100], 
        [-30.050, 25.100], 
        [-30.050, 25.150], 
        [-30.100, 25.150], 
        [-30.100, 25.100]
    ]}', 
    NULL
),

-- Pending (2027)
(
    2, 
    'pending', 
    '2026-12-20 10:00:00', 
    '2027-01-10 11:00:00', 
    '2027-01-10 13:00:00', 
    'DRONE-OCN5', 
    '{ "type": "LineString", "coordinates": [
        [-30.400, 25.400], 
        [-30.380, 25.410], 
        [-30.380, 25.430], 
        [-30.400, 25.440], 
        [-30.420, 25.430], 
        [-30.420, 25.410], 
        [-30.400, 25.400]
    ]}', 
    NULL
),

-- Pending (2027)
(
    1, 
    'pending', 
    '2027-05-01 10:00:00',
    '2027-05-10 14:00:00',
    '2027-05-10 16:00:00',
    'DRONE-SEA6', 

    '{ "type": "LineString", "coordinates": [
        [18.400, 37.380], 
        [18.420, 37.400], 
        [18.400, 37.420], 
        [18.380, 37.400], 
        [18.400, 37.380]
    ]}', 
    NULL
);


