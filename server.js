const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Endpoint to send a message
app.post('/api/messages', async (req, res) => {
    const { message, senderId } = req.body;
    try {
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const result = await db.query(
            'INSERT INTO messages (content, sender_id) VALUES ($1, $2) RETURNING *',
            [message, senderId || 'anonymous']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Error sending message' });
    }
});

// Endpoint to get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM messages ORDER BY created_at ASC'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error retrieving messages:', err);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
