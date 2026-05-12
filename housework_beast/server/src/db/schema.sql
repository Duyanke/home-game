-- 家庭信息表
CREATE TABLE IF NOT EXISTS families (
    family_id TEXT PRIMARY KEY,
    family_code TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 家庭成员表
CREATE TABLE IF NOT EXISTS members (
    member_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    beast_id TEXT,
    total_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'offline',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 神兽表
CREATE TABLE IF NOT EXISTS beasts (
    beast_id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL UNIQUE,
    beast_type TEXT NOT NULL,
    stage INTEGER DEFAULT 1,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    def INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    ep INTEGER DEFAULT 100,
    unlocked_skills TEXT
);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
    creator_id TEXT NOT NULL,
    executor_id TEXT,
    status TEXT DEFAULT 'pending',
    is_custom INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    confirmed_by TEXT
);

-- 决斗记录表
CREATE TABLE IF NOT EXISTS duels (
    duel_id TEXT PRIMARY KEY,
    challenger_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    winner_id TEXT,
    result TEXT DEFAULT 'ongoing',
    rounds INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_defender ON duels(defender_id)