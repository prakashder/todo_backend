const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(500).send('Error registering new user.');
        }
        res.status(201).send({ id: this.lastID });
    });
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Invalid password.');
        }

        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 }); // 24 hours

        res.status(200).send({
            auth: true,
            token: token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    });
});

module.exports = router;
