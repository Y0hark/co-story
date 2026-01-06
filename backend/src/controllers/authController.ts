import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

export class AuthController {

    static async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            // Check if user exists
            const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert user
            const newUser = await pool.query(
                'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at',
                [email, hashedPassword, name]
            );

            // Create default "Saved" library for the user
            await pool.query(
                "INSERT INTO reading_lists (user_id, name, is_public) VALUES ($1, 'Saved', false)",
                [newUser.rows[0].id]
            );

            // Create JWT
            const token = jwt.sign(
                { id: newUser.rows[0].id, email: newUser.rows[0].email },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );

            res.status(201).json({
                token,
                user: newUser.rows[0]
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Find user
            const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const user = userResult.rows[0];

            // Check password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Create JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static async me(req: any, res: Response) {
        try {
            const userResult = await pool.query('SELECT id, email, display_name, avatar_url, bio FROM users WHERE id = $1', [req.user.id]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(userResult.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
}
