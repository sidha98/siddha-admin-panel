import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { MdDelete, MdOutlineFileDownload } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import "./style.scss";
import { cilArrowCircleLeft, cilArrowCircleRight } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

const DealerCreditLimit = () => {
    const [data, setData] = useState([]); // State to store the fetched data
    const [loading, setLoading] = useState(true); // State to manage loading
    const [search, setSearch] = useState(""); // State to manage search input
    const [currentPage, setCurrentPage] = useState(1); // State to track the current page
    const [totalPages, setTotalPages] = useState(0); // State to track the total pages
    const [limit, setLimit] = useState(50); // Dynamically updated from the backend
    const [file, setFile] = useState(null);
    const [editItemIndex, setEditItemIndex] = useState(null); // Track item index for editing
    const [editCreditLimit, setEditCreditLimit] = useState(""); // Track edited credit limit value
    const [selectedOption, setSelectedOption] = useState("MDD"); // Default to 'MDD'
    // Backend API endpoint
    const backend_url = config.backend_url;

    // Fetch data from the backend for the current page
    const fetchData = async (page) => {
        try {
            setLoading(true); // Set loading to true before fetching
            const response = await axios.get(
                `${backend_url}/credit-limit/get-credit-limits?page=${page}&limit=${limit}&dealerCategory=${selectedOption}`
            );
            const { data: dealerData, pagination } = response.data;
            if (response.data.success) {
                setData(dealerData); // Set the fetched data
                setTotalPages(pagination.totalPages); // Set total pages
                setLimit(pagination.limit); // Dynamically update the limit
            } else {
                console.error("Failed to fetch data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    // Fetch data when the component mounts or the current page or dealerCategory changes
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, selectedOption]); // Trigger fetch on page change or category selection

    // Filter data based on search input
    const filteredData = data.filter((item) =>
        ["dealerCode", "shopName", "credit_limit", "_id"].some((key) =>
            item[key]?.toString().toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleEdit = (index) => {
        setEditItemIndex(index);
        setEditCreditLimit(data[index].credit_limit || ""); // Pre-fill the credit limit for editing
    };

    const handleSaveEdit = async (index) => {
        if (!editCreditLimit) {
            alert("Credit Limit is required.");
            return;
        }
        try {
            const updatedData = [...data];
            updatedData[index] = {
                ...updatedData[index],
                credit_limit: editCreditLimit,  // Update only the credit limit
            };

            setData(updatedData);
            setEditItemIndex(null);  // Close edit mode

            // Prepare data for the API call
            const dealerCode = updatedData[index].dealerCode;
            const payload = {
                credit_limit: editCreditLimit,
            };

            // Make the PUT request to the backend
            const response = await axios.put(
                `${backend_url}/credit-limit/update-single-credit-limit-for-admin?dealerCode=${dealerCode}`,
                payload
            );

            if (response.status === 200) {
                console.log("Data updated successfully:", response.data);
                fetchData(currentPage); // Refresh data after saving
            } else {
                console.error("Unexpected response:", response);
                alert(`Unexpected error occurred while saving the data. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error updating data:", error); // Log the entire error
            if (error.response) {
                console.error("Error response:", error.response);
                alert(`Failed to save data: ${error.response.data ? error.response.data.message : "Unknown error"}`);
            } else if (error.request) {
                console.error("Error request:", error.request);
                alert("No response from the server.");
            } else {
                console.error("Error message:", error.message);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        } else {
            setFile(null); // Clear the state if no file is selected
        }
    };

    const handleUploadFile = async () => {
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }

        if (window.confirm("Are you sure you want to upload this file?")) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await axios.put(
                    `${backend_url}/credit-limit/update-credit-limits-from-csv-for-admin`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (response.data.success) {
                    alert("File uploaded and credit limits updated successfully.");
                    setFile(null); // Clear the file after upload
                    fetchData(currentPage); // Refresh the data
                } else {
                    console.error("File upload failed:", response.data.message);
                    alert(`Error: ${response.data.message}`);
                }
            } catch (error) {
                console.error("Error uploading file:", error.message);
                if (error.response) {
                    alert(`Error: ${error.response.data.message}`);
                } else {
                    alert("An error occurred while uploading the file.");
                }
            }
        }
    };

    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value); // Update the selected dealer category
    };

    return (
        <div className="dealerTSE-table" style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "20px", display: 'flex', justifyContent: 'start' }}>Credit Limit of Dealers</h2>
            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                <input
                    type="text"
                    placeholder="Search by Dealer Code, Dealer Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        margin: '0px',
                        marginBottom: "20px",
                        padding: "10px",
                        width: "50%",
                        fontSize: "14px",
                        display: 'flex',
                        justifyContent: 'start'
                    }}
                />
                <div>
                    <select value={selectedOption} onChange={handleSelectChange} style={{ padding: "10px", fontSize: "14px" }}>
                        <option>MDD</option>
                        <option>All</option>
                    </select>
                </div>
                <div>
                    <button
                        onClick={() => document.getElementById("file-input").click()}
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            fontSize: "12px",
                            marginLeft: "20px",
                            backgroundColor: "green",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "5px",
                        }}
                    >
                        {file ? file.name : "Choose CSV File"}
                    </button>
                    <input
                        id="file-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    <button
                        onClick={handleUploadFile}
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            fontSize: "12px",
                            marginLeft: "10px",
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "5px",
                        }}
                    >
                        Upload CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <p>Loading data...</p>
            ) : filteredData.length > 0 ? (
                <div className="table-container" style={{ overflowX: "auto", maxHeight: "450px", overflowY: "auto" }}>
                    <table
                        className="table"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginBottom: "20px",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>S. No.</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Dealer Code</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Shop Name</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Dealer Category</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Credit Limit</th>
                                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ border: "1px solid #ccc" }}>
                                        {(currentPage - 1) * limit + index + 1}
                                    </td>
                                    <td style={{ border: "1px solid #ccc" }}>{item.dealerCode || "N/A"}</td>
                                    <td style={{ border: "1px solid #ccc" }}>{item.shopName || "N/A"}</td>
                                    <td style={{ border: "1px solid #ccc" }}>{item.dealerCategory || "N/A"}</td>
                                    <td style={{ border: "1px solid #ccc" }}>
                                        {editItemIndex === index ? (
                                            <input
                                                type="number"
                                                value={editCreditLimit}
                                                onChange={(e) => setEditCreditLimit(e.target.value)}
                                                style={{ width: "100%" }}
                                            />
                                        ) : (
                                            item.credit_limit || "N/A"
                                        )}
                                    </td>
                                    <td style={{ border: "1px solid #ccc" }}>
                                        {editItemIndex === index ? (
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleSaveEdit(index)}
                                                style={{
                                                    backgroundColor: "green",
                                                    color: "white",
                                                    padding: "5px 10px",
                                                }}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(index)}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                </div>
            ) : (
                <p>No data found.</p>
            )}
            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    <CIcon icon={cilArrowCircleLeft} />
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                   <CIcon icon={cilArrowCircleRight} />
                </button>
            </div>
        </div>
    );
};

export default DealerCreditLimit;
