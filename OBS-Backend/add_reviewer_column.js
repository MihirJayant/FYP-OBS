require('dotenv').config(); // Load .env
const pool = require('./src/db');

async function migrate() {
    try {
        console.log("Adding reviewer_id to ratings table...");
        // Note: ADD COLUMN IF NOT EXISTS is valid in PG 9.6+
        await pool.query(`
      ALTER TABLE ratings 
      ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL;
    `);
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
