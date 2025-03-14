-- 🚀 Membership Types (e.g., Monthly, Annual)
CREATE TABLE IF NOT EXISTS membership_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    price REAL NOT NULL
);

-- 🚀 Members Table
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE, -- Ensuring emails are unique
    phone TEXT,
    address TEXT,
    membership_type_id INTEGER,
    membership_start TEXT NOT NULL, 
    membership_end TEXT NOT NULL, 
    notes TEXT,
    FOREIGN KEY (membership_type_id) REFERENCES membership_types(id) ON DELETE SET NULL
);

-- 🚀 Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 🚀 Users Table (For Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- This will be a hashed password
    role TEXT NOT NULL DEFAULT 'member' -- Possible values: 'admin', 'member'
);

-- 🚀 Sessions Table (Optional: To Track Logins)
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

