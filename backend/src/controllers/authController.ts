import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {
    // ... existing methods ...

    static async googleLogin(req: Request, res: Response) {
        try {
            const { credential } = req.body;

            // Verify Google Token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            });
            const payload = ticket.getPayload();

            if (!payload) {
                return res.status(400).json({ error: 'Invalid Google Token' });
            }

            const { email, name, sub: googleId, picture } = payload;

            if (!email) {
                return res.status(400).json({ error: 'Email not provided by Google' });
            }

            // Check if user exists
            const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            let user;

            if (userCheck.rows.length > 0) {
                // User exists -> Login
                user = userCheck.rows[0];

                // Link Google ID if not linked
                if (!user.google_id) {
                    await pool.query('UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3', [googleId, picture, user.id]);
                }
            } else {
                // User does not exist -> Register
                const newUser = await pool.query(
                    'INSERT INTO users (email, display_name, google_id, avatar_url, password_hash) VALUES ($1, $2, $3, $4, NULL) RETURNING *',
                    [email, name || 'User', googleId, picture]
                );
                user = newUser.rows[0];

                // Create default "Saved" library for the user
                await pool.query(
                    "INSERT INTO reading_lists (user_id, name, is_public) VALUES ($1, 'Saved', false)",
                    [user.id]
                );
            }

            // Create JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    subscription_tier: user.subscription_tier
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Google Login Failed' });
        }
    }
    // ... existing methods ...

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
                'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at, subscription_tier',
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
                { expiresIn: '7d' }
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
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    subscription_tier: user.subscription_tier
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static async me(req: any, res: Response) {
        try {
            const userResult = await pool.query('SELECT id, email, display_name, avatar_url, bio, subscription_tier FROM users WHERE id = $1', [req.user.id]);
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
