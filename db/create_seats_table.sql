CREATE TABLE IF NOT EXISTS napo.seats (
    game_table_id INT NOT NULL,
    seat_name enum('first_seat', 'second_seat', 'third_seat', 'fourth_seat', 'fifth_seat') NOT NULL,
    play_card VARCHAR(15),
    is_aide BOOLEAN DEFAULT FALSE,
    is_last_lap_winner BOOLEAN DEFAULT FALSE,
    hands VARCHAR(511),
    face_cards VARCHAR(511),
    score INT,
    PRIMARY KEY (game_table_id, seat_name),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
