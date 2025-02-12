const express = require("express");
const connectToDB = require("../db/db");

const router = express.Router();

// Get all expenses
router.get("/", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [rows] = await pool.query(`
            SELECT expenses.id, expenses.title, expenses.description, expenses.date, expenses.amount, expenses.category_id, categories.name AS category 
            FROM expenses 
            LEFT JOIN categories ON expenses.category_id = categories.id
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get an expense by ID
router.get("/:id", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [rows] = await pool.query("SELECT * FROM expenses WHERE id = ?", [req.params.id]);

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new expense
router.post("/", async (req, res) => {
    try {
        const { title, description, date, category_id, amount } = req.body;
        const pool = await connectToDB();
        const [result] = await pool.query(`
            INSERT INTO expenses (title, description, date, category_id, amount) 
            VALUES (?, ?, ?, ?, ?)
        `, [title, description, date, category_id, amount]);

        res.status(201).json({ message: "Expense created successfully", expenseId: result.insertId });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update an expense
router.put("/:id", async (req, res) => {
    try {
        const { title, description, date, category_id, amount } = req.body;
        const pool = await connectToDB();
        const [result] = await pool.query(`
            UPDATE expenses 
            SET title = ?, description = ?, date = ?, category_id = ?, amount = ? 
            WHERE id = ?
        `, [title, description, date, category_id, amount, req.params.id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Expense updated successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [result] = await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Expense deleted successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get today's expenses by category
router.get("/today-expenses", async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const pool = await connectToDB();
        
        const [results] = await pool.query(`
            SELECT categories.name AS category, 
                   SUM(expenses.amount) AS totalAmount
            FROM expenses
            JOIN categories ON expenses.category_id = categories.id
            WHERE DATE(expenses.date) = ?
            GROUP BY categories.name
        `, [today]);

        res.status(200).json(results);  // Send the results as JSON
    } catch (error) {
        console.error('Error fetching today\'s expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

module.exports = router;
