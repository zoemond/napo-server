CREATE TABLE IF NOT EXISTS napo.game_tables (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    turn_count tinyint UNSIGNED NOT NULL default 0,
    seat_first varchar(256),
    seat_second varchar(256),
    seat_third varchar(256),
    seat_fourth varchar(256),
    seat_fifth varchar(256)
);
