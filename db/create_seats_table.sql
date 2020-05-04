CREATE TABLE IF NOT EXISTS napo.seats (
    game_table_id INT NOT NULL,
    seat_name enum('first', 'second', 'third', 'fourth', 'fifth'),
    play_card VARCHAR(15),
    hands VARCHAR(511),
    face_cards VARCHAR(511),
    score INT,
    PRIMARY KEY (game_table_id),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
