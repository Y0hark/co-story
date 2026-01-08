
import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db/pool';

async function setWordCount(email: string, wordCount: number) {
    try {
        console.log(`Setting word count to ${wordCount} for ${email}...`);

        // 1. Get User ID
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found');
            return;
        }
        const userId = userRes.rows[0].id;

        // 2. Update monthly_usage
        const currentMonth = new Date().toISOString().slice(0, 7);
        await pool.query(`
            INSERT INTO monthly_usage (
                user_id, month, 
                chapters_generated_total, words_generated, 
                words_premium, words_free_extra
            )
            VALUES ($1, $2, 0, $3, 0, $3)
            ON CONFLICT (user_id, month) DO UPDATE SET
                words_generated = $3,
                words_free_extra = $3,
                updated_at = now()
        `, [userId, currentMonth, wordCount]);

        console.log(`✅ Word count set to ${wordCount}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

setWordCount('sam1@gmail.com', 2999);
