CREATE TABLE IF NOT EXISTS napo.game_cards (
    game_table_id INT NOT NULL,
    -- カードをSET型にするためにmysqlにしたが, 挿入・削除の方法がエキゾチックだったので文字列で持ちます
    open_cards VARCHAR(15),
    field_cards VARCHAR(63),
    seat_first VARCHAR(511),
    seat_second VARCHAR(511),
    seat_third VARCHAR(511),
    seat_fourth VARCHAR(511),
    seat_fifth VARCHAR(511),
    PRIMARY KEY (game_table_id),
    FOREIGN KEY (game_table_id) REFERENCES game_tables(id)
);
