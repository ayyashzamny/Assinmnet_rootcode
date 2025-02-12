import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

const ExpenseModal = ({ showModal, setShowModal, selectedExpense, setExpenses }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category_id, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [categories, setCategories] = useState([]);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Fetch categories when the component mounts
    useEffect(() => {
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

    // Pre-fill the form when editing an expense
    useEffect(() => {
        if (selectedExpense) {
            setTitle(selectedExpense.title);
            setDescription(selectedExpense.description);
            setCategoryId(selectedExpense.category_id || ""); // Ensure category_id is set correctly
            setAmount(selectedExpense.amount);

            // Format the date to YYYY-MM-DD before setting it in the state
            const formattedDate = selectedExpense.date ? selectedExpense.date.split('T')[0] : '';
            setDate(formattedDate);
        } else {
            // Clear form fields when opening for adding a new expense
            setTitle("");
            setDescription("");
            setCategoryId("");  // Reset category_id when adding new expense
            setAmount("");
            setDate("");
        }
    }, [selectedExpense]); // Only run when selectedExpense changes

    const handleSubmit = async () => {
        // Check if all required fields are filled
        if (!title || !category_id || !amount || !date) {
            Swal.fire("Error", "All required fields must be filled!", "error"); // SweetAlert error
            return;
        }
        try {
            const expenseData = { title, description, category_id, amount, date };

            if (selectedExpense) {
                await axios.put(
                    `http://localhost:5050/api/expenses/${selectedExpense.id}`,
                    expenseData
                );
            } else {
                await axios.post("http://localhost:5050/api/expenses", expenseData);
            }

            const response = await axios.get("http://localhost:5050/api/expenses");
            setExpenses(response.data);
            setShowModal(false);

            Swal.fire("Success", "Expense saved successfully!", "success"); // SweetAlert success
        } catch (error) {
            console.error("Error saving expense:", error);
            Swal.fire("Error", "An error occurred while saving the expense.", "error"); // SweetAlert error
        }
    };

    // Handle adding a new category
    const handleAddCategory = async () => {
        try {
            const response = await axios.post("http://localhost:5050/api/categories", {
                name: newCategoryName,
            });
            setCategories([...categories, response.data]);
            setNewCategoryName(""); // Reset new category input field
            setShowAddCategoryModal(false); // Close the modal

            Swal.fire("Success", "Category added successfully!", "success"); // SweetAlert success
        } catch (error) {
            console.error("Error adding category:", error);
            Swal.fire("Error", "An error occurred while adding the category.", "error"); // SweetAlert error
        }
    };

    return (
        <>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedExpense ? "Edit Expense" : "Add Expense"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="title">
                            <Form.Label className="floating-label">Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-control"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="description" className="mt-2">
                            <Form.Label className="floating-label">Description (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-control"
                            />
                        </Form.Group>


                        <Form.Group controlId="category_id" className="mt-2">
                            <Form.Label className="floating-label">Category</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    as="select"
                                    value={category_id}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="mr-2"
                                    required
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Form.Control>
                                <Button variant="outline-primary" onClick={() => setShowAddCategoryModal(true)}>
                                    Add
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group controlId="amount" className="mt-2">
                            <Form.Label className="floating-label">Amount</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="form-control"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="date" className="mt-2">
                            <Form.Label className="floating-label">Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="form-control"
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Add Category Modal */}
            <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="category_name">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddCategory}>
                        Add Category
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ExpenseModal;
