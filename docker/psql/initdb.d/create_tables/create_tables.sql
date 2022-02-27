CREATE TYPE suit AS ENUM ('no_trump', 'spade', 'club', 'heart', 'diamond');
CREATE TYPE seat_name AS ENUM ('first_seat', 'second_seat', 'third_seat', 'fourth_seat', 'fifth_seat');
CREATE TYPE state_type AS ENUM ('completed', 'cheated', 'playing', 'all_green');
CREATE TYPE winner_type AS ENUM ('napoleon_forces', 'allied_forces');

CREATE TABLE IF NOT EXISTS game_tables (
    id SERIAL NOT NULL PRIMARY KEY,
    first_seat VARCHAR(255),
    second_seat VARCHAR(255),
    third_seat VARCHAR(255),
    fourth_seat VARCHAR(255),
    fifth_seat VARCHAR(255)
);

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

CREATE TABLE IF NOT EXISTS seats (
    game_table_id INT NOT NULL,
    seat_name seat_name NOT NULL,
    play_card VARCHAR(15),
    is_aide BOOLEAN DEFAULT FALSE,
    is_last_lap_winner BOOLEAN DEFAULT FALSE,
    hands VARCHAR(511),
    face_cards VARCHAR(511),
    score INT,
    PRIMARY KEY (game_table_id, seat_name),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
