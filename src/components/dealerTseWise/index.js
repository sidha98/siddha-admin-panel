import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import "./style.scss";
import { cilArrowCircleLeft, cilArrowCircleRight } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";

const backend_url = config.backend_url;

const DealerTable = () => {
    const [data, setData] = useState([]);
    const [employeeCodes, setEmployeeCodes] = useState([]); // To store the employee codes
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editItemIndex, setEditItemIndex] = useState(null);
    const [allEmployeeCodes, setAllEmployeeCodes] = useState([]); // To store all employee codes

    const [editFormData, setEditFormData] = useState({
        TSE: "",
        "Dealer Code": "",
        "DEALER NAME": "",
        Area: "",
    });

    // Fetch data from the backend
    const fetchData = async (page, limit) => {
        try {
            console.log("Rendering dropdown options:", allEmployeeCodes);

            const dealerResponse = await axios.get(
                `${backend_url}/tse/getdealertsewise?page=${page}&limit=${limit}`
            );
            console.log("Dealer Response:", dealerResponse.data);

            const { data: dealerData, pagination } = dealerResponse.data;

            const employeeCodePromises = dealerData.map((dealer) =>
                axios.get(`${backend_url}/employeecode/getemployeecode?name=${dealer.TSE}`)
            );

            const employeeCodeResponses = await Promise.allSettled(employeeCodePromises);

            const employeeCodes = employeeCodeResponses.map((response, index) => {
                if (response.status === "fulfilled" && response.value.data.data) {
                    return response.value.data.data;
                } else {
                    console.error(`Error fetching code for TSE: ${dealerData[index].TSE}`);
                    return { Name: dealerData[index].TSE, Code: "N/A" };
                }
            });

            setEmployeeCodes(employeeCodes); // Set employee codes
            console.log("Seperatly called Employee Codes:", employeeCodes);

            const dataWithCodes = dealerData.map((dealer) => {
                const employee = employeeCodes.find((emp) => emp.Name === dealer.TSE);
                return {
                    ...dealer,
                    code: employee ? employee.Code : "N/A",
                };
            });

            setData(dataWithCodes);
            setCurrentPage(pagination.page);
            setTotalPages(pagination.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };
    const fetchAllEmployeeCodes = async () => {
        try {
            const response = await axios.get(`${backend_url}/employeename/get-employee-names-for-dropdown`);
            if (response.status === 200 && response.data.success) {
                setAllEmployeeCodes(response.data.data);
                console.log("response for dropdown is:", response)
                console.log("Employee Names:", response.data.data);
            } else {
                console.error("Failed to fetch employee names:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching employee names:", error);
        }
    };

    useEffect(() => {
        fetchData(currentPage, 50);  // Paginated data for the table
        fetchAllEmployeeCodes();  // Fetch all employee codes for the dropdown
    }, [currentPage]);
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const sortedData = () => {
        let sortableData = [...data];

        if (sortConfig.key !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableData.filter((item) =>
            ["_id", "Area", "DEALER NAME", "Dealer Code", "TSE"].some((key) =>
                item[key] && item[key].toString().toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    const handleSortChange = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleEdit = (index) => {
        setEditItemIndex(index);
        setEditFormData({ ...data[index] });
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        let updatedFormData = { ...editFormData, [name]: value };

        // If TSE is being updated, fetch the associated employee code
        if (name === "TSE") {
            try {
                const response = await axios.get(`${backend_url}/employeecode/getemployeecode?name=${value}`);
                const employee = response.data.data;
                updatedFormData.code = employee ? employee.Code : "N/A";
            } catch (error) {
                console.error("Error fetching TSE code:", error);
                updatedFormData.code = "N/A";
            }
        }

        setEditFormData(updatedFormData);
    };


    const handleSaveEdit = async (index) => {
        if (!editFormData["Dealer Code"] || !editFormData.TSE) {
            alert("Dealer Code and TSE are required.");
            return;
        }
        try {
            const updatedData = [...data];
            const { code, ...fieldsToUpdate } = editFormData;
            updatedData[index] = { ...updatedData[index], ...fieldsToUpdate };

            setData(updatedData);
            setEditItemIndex(null);

            const payload = {
                updates: [
                    {
                        "Dealer Code": editFormData["Dealer Code"],
                        TSE: editFormData.TSE,
                        "DEALER NAME": editFormData["DEALER NAME"],
                        Area: editFormData.Area,
                    },
                ],
            };

            const response = await axios.put(
                `${backend_url}/tse/put-dealer-tse-wise`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                console.log("Data updated successfully:", response.data);
            } else {
                console.error("Unexpected response:", response);
                alert("Unexpected error occurred while saving the data.");
            }
        } catch (error) {
            console.error("Error updating data:", error.response?.data || error.message);
            alert(
                `Failed to save data: ${error.response?.data?.message || error.message}`
            );
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            console.log(`Delete button clicked for ID: ${id}`);
            // Implement your delete logic here
        }
    };//===============oooorrrrrrrrr==================
    // const handleDelete = (id) => {
    //     const isConfirmed = window.confirm("Are you sure you want to delete this item?");
        
    //     if (isConfirmed) {
    //         console.log(`Item with ID: ${id} will be deleted.`);
    //         // Perform the actual delete logic here (e.g., making a request to the backend)
    //         // You can make an API call to delete the item from the backend if needed.
    //     } else {
    //         console.log("Deletion canceled.");
    //     }
    // };
    // ===============================================

    return (
        <div className="dealerTSE-table">
            <h2>Dealer List</h2>
            <input
                type="text"
                placeholder="Search by id, tse, dealer code, dealer name, area..."
                value={search}
                onChange={handleSearchChange}
                style={{ marginBottom: "20px", padding: "10px", width: "30%", fontSize: "12px" }}
            />
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr className="table-header">
                            <th>S. No.</th>
                            <th onClick={() => handleSortChange("TSE")}>TSE</th>
                            <th>TSE Code</th>
                            <th onClick={() => handleSortChange("Dealer Code")}>Dealer Code</th>
                            <th onClick={() => handleSortChange("DEALER NAME")}>Dealer Name</th>
                            <th onClick={() => handleSortChange("Area")}>Area</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData().map((item, index) => (
                            <tr key={item["Dealer Code"]}>
                                <td>{index + 1}</td>
                                <td>
                                    {editItemIndex === index ? (
                                        <div className="input-dropdown-container">
                                            <select
                                                name="TSE"
                                                value={editFormData.TSE || ""}
                                                onChange={handleInputChange}
                                                className="dropdown"
                                            >
                                                <option value="" disabled>Select TSE</option>
                                                {allEmployeeCodes && allEmployeeCodes.length > 0 ? (
                                                    allEmployeeCodes.map((emp) => (
                                                        <option key={emp.Name} value={emp.Name}>{emp.Name}</option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>Loading...</option>
                                                )}
                                            </select>

                                        </div>
                                    ) : (
                                        item.TSE || "N/A"
                                    )}
                                </td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="code" value={editFormData.code} onChange={handleInputChange} /></div> : item.code || "N/A"}</td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}><input type="text" name="Dealer Code" value={editFormData["Dealer Code"]} onChange={handleInputChange} /> </div> : item["Dealer Code"]}</td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="DEALER NAME" value={editFormData["DEALER NAME"]} onChange={handleInputChange} /></div> : item["DEALER NAME"]}</td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="Area" value={editFormData.Area} onChange={handleInputChange} /></div> : item.Area}</td>
                                <td className="action-btn">
                                    {editItemIndex === index ? (
                                        <button className="edit-btn" onClick={() => handleSaveEdit(index)}><MdOutlineFileDownload /></button>
                                    ) : (
                                        <button className="edit-btn" onClick={() => handleEdit(index)}>
                                            <FaEdit />
                                        </button>
                                    )}
                                    <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <CIcon icon={cilArrowCircleLeft} />
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <CIcon icon={cilArrowCircleRight} />
                </button>
            </div>
        </div>
    );
};

export default DealerTable;
