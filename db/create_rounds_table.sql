CREATE TABLE IF NOT EXISTS napo.rounds (
    game_table_id INT NOT NULL,
    round_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
    is_opened BOOLEAN,
    open_cards VARCHAR(31),
    state enum('completed', 'cheated', 'playing', 'all_green') DEFAULT 'playing',
    winner enum('napoleon_forces', 'allied_forces'),
    cheater enum('first_seat', 'second_seat', 'third_seat', 'fourth_seat', 'fifth_seat'),
    PRIMARY KEY (game_table_id, round_count),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
