const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Ensure this points to your SQLite database setup file
const router = express.Router();
require('dotenv').config();

const secretKey = process.env.SECRET_KEY; // Accessing secret key from environment variable

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ message: 'No token provided. User not authorized.' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        next();
    });
};

// Create a new to-do item
router.post('/todos', verifyToken, (req, res) => {
    const { description, status } = req.body;

    db.run('INSERT INTO todos (user_id, description, status) VALUES (?, ?, ?)', [req.userId, description, status], function (err) {
        if (err) {
            console.error('Error creating new to-do item:', err.message);
            return res.status(500).send({ message: 'Error creating new to-do item.' });
        }
        res.status(201).send({ message: 'To-do item created successfully.', item: { id: this.lastID, description, status } });
    });
});

// Get all to-do items for the logged-in user
router.get('/todos', verifyToken, (req, res) => {
    db.all('SELECT * FROM todos WHERE user_id = ?', [req.userId], (err, rows) => {
        if (err) {
            console.error('Error fetching to-do items:', err.message);
            return res.status(500).send({ message: 'Error fetching to-do items.' });
        }
        res.status(200).send({ message: 'To-do items fetched successfully.', items: rows });
    });
});

// Update a to-do item
router.put('/todos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { description, status } = req.body;

    db.run('UPDATE todos SET description = ?, status = ? WHERE id = ? AND user_id = ?', [description, status, id, req.userId], function (err) {
        if (err) {
            console.error('Error updating to-do item:', err.message || err);
            return res.status(500).send({ message: 'Error updating to-do item.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ message: 'To-do item not found.' });
        }
        res.status(200).send({ message: 'To-do item updated successfully.', item: { id, description, status } });
    });
});

// Delete a to-do item
router.delete('/todos/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.userId], function (err) {
        if (err) {
            console.error('Error deleting to-do item:', err.message);
            return res.status(500).send({ message: 'Error deleting to-do item.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ message: 'To-do item not found.' });
        }
        res.status(200).send({ message: 'To-do item deleted successfully.' });
    });
});

module.exports = router;
