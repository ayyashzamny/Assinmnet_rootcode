const express = require("express");
const connectToDB = require("../db/db");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [rows] = await pool.query("SELECT * FROM categories");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a category by ID
router.get("/:id", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new category
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        const pool = await connectToDB();
        const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);

        res.status(201).json({ message: "Category created successfully", categoryId: result.insertId });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update a category
router.put("/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const pool = await connectToDB();
        const [result] = await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Category updated successfully" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a category
router.delete("/:id", async (req, res) => {
    try {
        const pool = await connectToDB();
        const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Category deleted successfully" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
