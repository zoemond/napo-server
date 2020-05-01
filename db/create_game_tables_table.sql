CREATE TABLE IF NOT EXISTS napo.game_tables (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    turn_count TINYINT UNSIGNED NOT NULL default 0,
    seat_first VARCHAR(255),
    seat_second VARCHAR(255),
    seat_third VARCHAR(255),
    seat_fourth VARCHAR(255),
    seat_fifth VARCHAR(255)
);
