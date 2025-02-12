import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2"; // Importing chart components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";

// Registering necessary chart types
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement, // Register PointElement for line charts
    LineElement // Register LineElement for line charts
);

const Dashboard = () => {
    const [categoryExpenses, setCategoryExpenses] = useState([]);
    const [monthlyExpenses, setMonthlyExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch expenses data (total amount by category)
        const fetchCategoryExpenses = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/expenses");
                setCategoryExpenses(response.data);
            } catch (error) {
                console.error("Error fetching category expenses:", error);
            }
        };

        // Fetch monthly expenses for the growth graph, filtered by month
        const fetchMonthlyExpenses = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/expenses");
                const expenses = response.data;

                // Group expenses by month
                const groupedByMonth = expenses.reduce((acc, expense) => {
                    const month = new Date(expense.date).getMonth(); // Get the month (0-11)
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += expense.totalAmount; // Add the expense to the total for the month
                    return acc;
                }, {});

                // Prepare monthly expenses data for chart
                const monthlyData = Object.keys(groupedByMonth).map((month) => ({
                    month: month + 1, // Convert to human-readable month (1-12)
                    totalAmount: groupedByMonth[month],
                }));

                setMonthlyExpenses(monthlyData);
            } catch (error) {
                console.error("Error fetching monthly expenses:", error);
            }
        };

        // Fetch categories for the dropdown or box
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategoryExpenses();
        fetchMonthlyExpenses();
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

    // Data preparation for Line Chart (Month vs Expense Growth)
    const monthlyData = {
        labels: monthlyExpenses.map((month) => `Month ${month.month}`), // Month labels
        datasets: [
            {
                label: "Monthly Expense Growth",
                data: monthlyExpenses.map((expense) => expense.totalAmount), // Total expense for each month
                fill: false,
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container mt-4">
            <h1>Dashboard</h1>
            <p>Welcome to the Expenses Tracker Dashboard</p>

            {/* Total Expenses by Category (Box View) */}
            <div className="row mb-4">
                {categories.map((category) => (
                    <div key={category.id} className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{category.name}</h5>
                                <p className="card-text">
                                    LKR {categoryExpenses.find(expense => expense.category === category.name)?.totalAmount || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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

            {/* Line Chart for Monthly Expense Growth */}
            <div className="mb-5">
                <h3>Expense Growth (Month vs Expense)</h3>
                <Line
                    data={monthlyData}
                    options={{
                        responsive: true,
                        plugins: { title: { display: true, text: "Monthly Expense Growth" } },
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
