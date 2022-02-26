\c napo;

CREATE TYPE suit AS ENUM ('no_trump', 'spade', 'club', 'heart', 'diamond');
CREATE TYPE seat_name AS ENUM ('first_seat', 'second_seat', 'third_seat', 'fourth_seat', 'fifth_seat');

CREATE TABLE IF NOT EXISTS declarations (
    game_table_id INT NOT NULL,
    round_count SMALLINT NOT NULL DEFAULT 0,
    discards VARCHAR(31),
    face_card_number SMALLINT DEFAULT 0,
    trump suit,
    napoleon seat_name,
    aide_card VARCHAR(9),
    PRIMARY KEY (game_table_id, round_count),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
