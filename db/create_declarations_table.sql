CREATE TABLE IF NOT EXISTS napo.declarations (
    game_table_id INT NOT NULL,
    round_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
    discards VARCHAR(31),
    face_card_number TINYINT UNSIGNED DEFAULT 0,
    trump enum('no_trump', 'spade', 'club', 'heart', 'diamond'),
    napoleon enum('first_seat', 'second_seat', 'third_seat', 'fourth_seat', 'fifth_seat'),
    aide_card VARCHAR(9),
    PRIMARY KEY (game_table_id, round_count),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
