\c napo;

CREATE TYPE state_type AS ENUM ('completed', 'cheated', 'playing', 'all_green');
CREATE TYPE winner_type AS ENUM ('napoleon_forces', 'allied_forces');

CREATE TABLE IF NOT EXISTS rounds (
    game_table_id INT NOT NULL,
    round_count SMALLINT NOT NULL DEFAULT 0,
    is_opened BOOLEAN,
    open_cards VARCHAR(31),
    state state_type DEFAULT 'playing',
    winner winner_type,
    cheater seat_name,
    PRIMARY KEY (game_table_id, round_count),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
