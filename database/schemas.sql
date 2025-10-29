-- Teams table
CREATE TABLE teams (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL
);

-- Players table
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    team_id INTEGER,
    full_name VARCHAR(100) NOT NULL,
    salary INTEGER NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    injured_spot BOOLEAN NOT NULL DEFAULT FALSE,
    is_unpickable BOOLEAN NOT NULL DEFAULT FALSE,
    has_not_played_last_season BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Keeper history table (one row per player per season kept)
CREATE TABLE keeper_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    season VARCHAR(4) NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(player_id, season)
);

-- Player detailed stats table
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    fga INTEGER NOT NULL DEFAULT 0,
    fgm INTEGER NOT NULL DEFAULT 0,
    ftm INTEGER NOT NULL DEFAULT 0,
    fta INTEGER NOT NULL DEFAULT 0,
    three_pm REAL NOT NULL DEFAULT 0,
    reb REAL NOT NULL DEFAULT 0,
    ast REAL NOT NULL DEFAULT 0,
    stl REAL NOT NULL DEFAULT 0,
    blk REAL NOT NULL DEFAULT 0,
    turnovers REAL NOT NULL DEFAULT 0,
    pts REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(player_id)
);

-- Player raters table (stores raters for each season)
CREATE TABLE player_raters (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    season VARCHAR(4) NOT NULL, -- Season year (e.g., '2025' for 2024-2025 season)
    total_rater REAL NOT NULL DEFAULT 0,
    fg_rater REAL NOT NULL DEFAULT 0,
    ft_rater REAL NOT NULL DEFAULT 0,
    three_pm_rater REAL NOT NULL DEFAULT 0,
    reb_rater REAL NOT NULL DEFAULT 0,
    ast_rater REAL NOT NULL DEFAULT 0,
    stl_rater REAL NOT NULL DEFAULT 0,
    blk_rater REAL NOT NULL DEFAULT 0,
    to_rater REAL NOT NULL DEFAULT 0,
    pts_rater REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(player_id, season)
);

-- Indexes for better query performance
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_keeper_history_player_id ON keeper_history(player_id);
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_raters_player_id ON player_raters(player_id);
CREATE INDEX idx_player_raters_season ON player_raters(season);
