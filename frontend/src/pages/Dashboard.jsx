import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2"; // Importing bar chart component
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registering necessary chart types
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [categoryExpenses, setCategoryExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch expenses data (total amount by category)
        const fetchCategoryExpenses = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/expenses");
                const expenses = response.data;

                // Group expenses by category and calculate the total amount for each category
                const groupedByCategory = expenses.reduce((acc, expense) => {
                    const category = expense.category; // Assuming the category is in `expense.category`
                    if (!acc[category]) {
                        acc[category] = 0;
                    }
                    acc[category] += expense.amount; // Add the amount for the category
                    return acc;
                }, {});

                // Prepare category expenses data for chart
                const categoryData = Object.keys(groupedByCategory).map((category) => ({
                    category,
                    totalAmount: groupedByCategory[category],
                }));

                setCategoryExpenses(categoryData);
            } catch (error) {
                console.error("Error fetching category expenses:", error);
            }
        };

        // Fetch categories for the dropdown or box
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/today-expenses");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategoryExpenses();
        fetchCategories();
    }, []);

    // Data preparation for Bar Chart (Expenses by Category)
    const categoryData = {
        labels: categoryExpenses.map((expense) => expense.category), // Category names
        datasets: [
            {
                label: "Total Expense by Category",
                data: categoryExpenses.map((expense) => expense.totalAmount), // Total expense for each category
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container mt-4">
            <h1>Dashboard</h1>
            <p>Welcome to the Expenses Tracker Dashboard</p>

            {/* Bar Chart for Expenses by Category */}
            <div className="mb-5">
                <h3>Expenses by Category</h3>
                <Bar
                    data={categoryData}
                    options={{
                        responsive: true,
                        plugins: { title: { display: true, text: "Expenses by Category" } },
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
