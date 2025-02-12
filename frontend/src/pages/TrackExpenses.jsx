import React, { useEffect, useState } from "react";
import axios from "axios";
import ExpenseModal from "../models/ExpenseModal"; // Modal for adding/editing expenses
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa"; // Importing edit and delete icons
import Swal from "sweetalert2";

const TrackExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // For search bar
    const [selectedCategory, setSelectedCategory] = useState(""); // For category filter
    const [selectedMonth, setSelectedMonth] = useState(""); // For month filter

    useEffect(() => {
        // Fetch categories for the filter
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5050/api/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                // Log the filters to debug the issue
                console.log('Fetching expenses with filters:', {
                    search: searchTerm,
                    category: selectedCategory,
                    month: selectedMonth,
                });

                // Construct the API request with filters
                const response = await axios.get("http://localhost:5050/api/expenses", {
                    params: {
                        search: searchTerm,
                        category: selectedCategory,
                        month: selectedMonth,
                    },
                });

                // Log the response to check if the data is correct
                console.log("Fetched expenses:", response.data);
                setExpenses(response.data);
            } catch (error) {
                console.error("Error fetching expenses:", error);
            }
        };

        fetchExpenses();
    }, [searchTerm, selectedCategory, selectedMonth]); // Dependencies include searchTerm, selectedCategory, and selectedMonth

    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedExpense(null);
        setShowModal(true);
    };

    const handleDelete = (expenseId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5050/api/expenses/${expenseId}`);
                    setExpenses(expenses.filter((expense) => expense.id !== expenseId)); // Update the UI after deletion
                    Swal.fire("Deleted!", "Your expense has been deleted.", "success");
                } catch (error) {
                    console.error("Error deleting expense:", error);
                    Swal.fire("Error!", "There was an issue deleting the expense.", "error");
                }
            }
        });
    };

    // Define the formatDate function here
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };


    const filteredExpenses = expenses.filter((expense) => {
        return (
            (selectedCategory ? expense.category === selectedCategory : true) && // Compare category by name
            (selectedMonth ? new Date(expense.date).getMonth() + 1 === parseInt(selectedMonth) : true) &&
            (
                (expense.title ? expense.title.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                (expense.description ? expense.description.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                (expense.category ? expense.category.toLowerCase() : '').includes(searchTerm.toLowerCase()) || // Include category in search
                (expense.amount ? expense.amount.toString().includes(searchTerm) : false) ||
                (expense.date ? formatDate(expense.date).toLowerCase().includes(searchTerm.toLowerCase()) : false)
            )
        );
    });



    return (
        <div className="container mt-4">
            <h1>Track Expenses</h1>



            {/* Filters */}
            <div className="d-flex mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search Expenses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mr-2"
                />

                <Form.Control
                    as="select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </Form.Control>

                <Form.Control
                    as="select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="">Select Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </Form.Control>
            </div>

            <Button variant="primary" onClick={handleAdd} className="mb-3">
                Add Expense
            </Button>

            <Row>
                {filteredExpenses.map((expense) => (
                    <Col sm={12} md={6} lg={4} key={expense.id}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Card.Title>{expense.title}</Card.Title>
                                <Card.Text>
                                    <strong>Description:</strong> {expense.description}
                                    <br />
                                    <strong>Category:</strong> {expense.category}
                                    <br />
                                    <strong>Amount:</strong> LKR {expense.amount}
                                    <br />
                                    <strong>Date:</strong> {formatDate(expense.date)} {/* Format date */}
                                </Card.Text>
                                <Button
                                    variant="warning"
                                    onClick={() => handleEdit(expense)}
                                    className="mr-2" // Right margin for the first button
                                >
                                    <FaEdit />
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(expense.id)}
                                    className="ml-2" // Left margin for the second button
                                >
                                    <FaTrash />
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <ExpenseModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedExpense={selectedExpense}
                setExpenses={setExpenses}
            />
        </div>
    );
};

export default TrackExpenses;
