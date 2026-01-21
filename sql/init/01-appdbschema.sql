-- Create database
CREATE DATABASE pa2425;

-- Connect to database
\connect pa2425

-- Create schema
CREATE SCHEMA pa2425 AUTHORIZATION postgres;

-- Set postgres user and database search path
ALTER DATABASE pa2425 SET search_path=pa2425;
SET search_path=pa2425;

-- Enable postgis extension
CREATE EXTENSION postgis SCHEMA pa2425;

-- Create types
CREATE TYPE role AS ENUM ('user', 'operator', 'admin');
CREATE TYPE reqstatus AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role role NOT NULL,
    tokens smallint NOT null DEFAULT 0
);

-- Create no navigation zones table
CREATE TABLE no_navigation_zones (
    id SERIAL PRIMARY KEY,
    operator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route GEOMETRY(POLYGON, 4326) NOT NULL,
    validity_start timestamp DEFAULT NULL,
    validity_end timestamp DEFAULT NULL
);

-- Create navigation requests table
CREATE TABLE navigation_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status reqstatus NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT now(),
    date_start TIMESTAMP NOT NULL DEFAULT NULL,
    date_end TIMESTAMP NOT NULL DEFAULT NULL,
    drone_id VARCHAR(10) NOT NULL,
    navigation_plan GEOMETRY(POLYGON, 4326) NOT NULL,
    motivation VARCHAR(255) DEFAULT NULL
);