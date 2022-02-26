\c napo;

CREATE TABLE IF NOT EXISTS game_tables (
    id SERIAL NOT NULL PRIMARY KEY,
    first_seat VARCHAR(255),
    second_seat VARCHAR(255),
    third_seat VARCHAR(255),
    fourth_seat VARCHAR(255),
    fifth_seat VARCHAR(255)
);
