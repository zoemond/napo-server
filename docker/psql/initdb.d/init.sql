DROP DATABASE IF EXISTS napo;
CREATE DATABASE napo;

\c napo;
\i /docker-entrypoint-initdb.d/create_tables/create_tables.sql
