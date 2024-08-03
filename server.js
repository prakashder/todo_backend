const express = require('express');
const cors = require('cors');
const todoRoutes = require('./todos');
const authRoutes = require('./auth'); // Assuming auth routes are in a separate file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use('/api', authRoutes); // Authentication routes
app.use('/api', todoRoutes); // To-Do routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
