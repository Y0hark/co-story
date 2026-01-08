
import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db/pool';

async function checkLogs(email: string) {
    try {
        console.log(`Checking LOGS for ${email}...`);

        // 1. Get User ID
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return;
        const userId = userRes.rows[0].id;

        // 2. Get Recent Logs
        const logsRes = await pool.query(
            'SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5',
            [userId]
        );

        console.log(`Found ${logsRes.rows.length} logs.`);
        logsRes.rows.forEach(log => {
            console.log(`[${log.timestamp}] Words: ${log.words_generated}, IsChapter: ${log.is_chapter_generation}, Success: ${log.success}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

checkLogs('sam1@gmail.com');
