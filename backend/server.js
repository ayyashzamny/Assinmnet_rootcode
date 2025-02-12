require('dotenv').config();
const express = require('express');
const cors = require('cors');
const categoriesRoutes = require('./routes/categoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expenseRoutes);

// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
