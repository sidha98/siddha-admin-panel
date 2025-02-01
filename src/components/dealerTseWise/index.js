import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import "./style.scss";
import { cilArrowCircleLeft, cilArrowCircleRight } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { FaRegSave } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import { MdOutlineFileDownload } from "react-icons/md";

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
    const [uniqueAreas, setUniqueAreas] = useState(""); // New state for area filter

    const [editFormData, setEditFormData] = useState({
        TSE: "",
        "Dealer Code": "",
        "DEALER NAME": "",
        Area: "",
    });

    const fetchAllEmployeeCodes = async () => {
        try {
            const response = await axios.get(`${backend_url}/employeename/get-employee-names-for-dropdown`);
            if (response.status === 200 && response.data.success) {
                setAllEmployeeCodes(response.data.data);
            } else {
                console.error("Failed to fetch employee names:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching employee names:", error);
        }
    };
    const fetchAllAreas = async () => {
        try {
            const response = await axios.get(`${backend_url}/area/get-areas-for-dropdown`);
            if (response.status === 200 && response.data.success) {
                setUniqueAreas(response.data.data);  // assuming setUniqueAreas is the state setter for the area dropdown options
            } else {
                console.error("Failed to fetch areas:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    };

    // Fetch data from the backend
    const fetchData = async (page, limit) => {
        try {
            const dealerResponse = await axios.get(
                `${backend_url}/tse/getdealertsewise?page=${page}&limit=${limit}`
            );

            const { data: dealerData, pagination } = dealerResponse.data;

            // Log pagination to check if it's structured properly
            console.log("Pagination data:", pagination);

            // Use pagination from the response to set the total pages
            if (pagination && pagination.totalPages) {
                setTotalPages(pagination.totalPages);
            } else {
                console.error("Pagination data is missing or incomplete.");
                setTotalPages(1); // Fallback to 1 if pagination is missing
            }

            // Fetch employee codes only if necessary
            const employeeCodePromises = dealerData.map((dealer) =>
                axios.get(`${backend_url}/employeecode/getemployeecode?name=${dealer.TSE}`)
            );
            const employeeCodeResponses = await Promise.allSettled(employeeCodePromises);

            const employeeCodesFetched = employeeCodeResponses.map((response, index) => {
                if (response.status === "fulfilled" && response.value.data.data) {
                    return response.value.data.data;
                } else {
                    return { Name: dealerData[index].TSE, Code: "N/A" };
                }
            });

            setEmployeeCodes(employeeCodesFetched);

            // Merge dealer data with employee codes
            const dataWithCodes = dealerData.map((dealer) => {
                const employee = employeeCodesFetched.find((emp) => emp.Name === dealer.TSE);
                return {
                    ...dealer,
                    code: employee ? employee.Code : "N/A",
                };
            });

            // Save the merged data to state
            setData(dataWithCodes);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return; // Prevent invalid page numbers
        setCurrentPage(newPage); // This will trigger the useEffect to refetch the data
    };
    useEffect(() => {
        fetchData(currentPage, 100);
        fetchAllEmployeeCodes(); // Fetch all employee codes for the dropdown
    }, [currentPage]);
    useEffect(() => {
        fetchAllAreas();
    }, []);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    // const handleAreaFilterChange = (event) => {
    //     setAreaFilter(event.target.value); // Update the area filter state
    // };

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

        // Filter based on search term and area filter
        return sortableData.filter((item) =>
            ["_id", "Area", "DEALER NAME", "Dealer Code", "TSE"].some((key) =>
                item[key] && item[key].toString().toLowerCase().includes(search.toLowerCase())
                // &&
                // (areaFilter ? item.Area.toLowerCase().includes(areaFilter.toLowerCase()) : true)
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
    };
    // Extract unique areas from the fetched data
    // const uniqueAreas = [...new Set(data.map((item) => item.Area))];

    return (
        <div className="dealerTSE-table">
            <h2>Dealer List</h2>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                <div className="Area-dropdown-container">
                    <select
                        name="Area"
                        value={editFormData.Area || ""}
                        onChange={handleInputChange}
                        className="dropdown"
                    >
                        <option value="" disabled>Select Area</option>
                        {uniqueAreas.length > 0 ? (
                            uniqueAreas.map((area, index) => (
                                <option key={index} value={area}>{area}</option>
                            ))
                        ) : (
                            <option value="" disabled>Loading...</option>
                        )}
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Search by id, tse, dealer code, dealer name, area..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ marginBottom: "20px", padding: "10px", width: "30%", fontSize: "12px" }}
                />
            </div>

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
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="Dealer Code" value={editFormData["Dealer Code"]} onChange={handleInputChange} /></div> : item["Dealer Code"]}</td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="DEALER NAME" value={editFormData["DEALER NAME"]} onChange={handleInputChange} /></div> : item["DEALER NAME"]}</td>
                                <td>{editItemIndex === index ? <div style={{ display: 'flex', justifyContent: 'center' }}> <input type="text" name="Area" value={editFormData["Area"]} onChange={handleInputChange} /></div> : item.Area}</td>
                                <td className="actions">
                                    {editItemIndex === index ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div className="edit-btn" style={{ border: "none", padding: '2px', background: 'blue' }} onClick={() => handleSaveEdit(index)}><FaRegSave fontSize={17} /></div>
                                            <div className="delete-btn" onClick={() => setEditItemIndex(null)}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                                                <linearGradient id="wRKXFJsqHCxLE9yyOYHkza_fYgQxDaH069W_gr1" x1="9.858" x2="38.142" y1="9.858" y2="38.142" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f44f5a"></stop><stop offset=".443" stop-color="#ee3d4a"></stop><stop offset="1" stop-color="#e52030"></stop></linearGradient><path fill="url(#wRKXFJsqHCxLE9yyOYHkza_fYgQxDaH069W_gr1)" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path d="M33.192,28.95L28.243,24l4.95-4.95c0.781-0.781,0.781-2.047,0-2.828l-1.414-1.414	c-0.781-0.781-2.047-0.781-2.828,0L24,19.757l-4.95-4.95c-0.781-0.781-2.047-0.781-2.828,0l-1.414,1.414	c-0.781,0.781-0.781,2.047,0,2.828l4.95,4.95l-4.95,4.95c-0.781,0.781-0.781,2.047,0,2.828l1.414,1.414	c0.781,0.781,2.047,0.781,2.828,0l4.95-4.95l4.95,4.95c0.781,0.781,2.047,0.781,2.828,0l1.414-1.414	C33.973,30.997,33.973,29.731,33.192,28.95z" opacity=".05"></path><path d="M32.839,29.303L27.536,24l5.303-5.303c0.586-0.586,0.586-1.536,0-2.121l-1.414-1.414	c-0.586-0.586-1.536-0.586-2.121,0L24,20.464l-5.303-5.303c-0.586-0.586-1.536-0.586-2.121,0l-1.414,1.414	c-0.586,0.586-0.586,1.536,0,2.121L20.464,24l-5.303,5.303c-0.586,0.586-0.586,1.536,0,2.121l1.414,1.414	c0.586,0.586,1.536,0.586,2.121,0L24,27.536l5.303,5.303c0.586,0.586,1.536,0.586,2.121,0l1.414-1.414	C33.425,30.839,33.425,29.889,32.839,29.303z" opacity=".07"></path><path fill="#fff" d="M31.071,15.515l1.414,1.414c0.391,0.391,0.391,1.024,0,1.414L18.343,32.485	c-0.391,0.391-1.024,0.391-1.414,0l-1.414-1.414c-0.391-0.391-0.391-1.024,0-1.414l14.142-14.142	C30.047,15.124,30.681,15.124,31.071,15.515z"></path><path fill="#fff" d="M32.485,31.071l-1.414,1.414c-0.391,0.391-1.024,0.391-1.414,0L15.515,18.343	c-0.391-0.391-0.391-1.024,0-1.414l1.414-1.414c0.391-0.391,1.024-0.391,1.414,0l14.142,14.142	C32.876,30.047,32.876,30.681,32.485,31.071z"></path>
                                            </svg></div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div onClick={() => handleEdit(index)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 128 128">
                                                    <path fill="#444b54" d="M89 127H49c-1.7 0-3-1.3-3-3s1.3-3 3-3h40c1.7 0 3 1.3 3 3S90.7 127 89 127zM104 121A3 3 0 1 0 104 127 3 3 0 1 0 104 121z"></path><g><path fill="#fff" d="M84.7,39.1l-37.3,64.4c-3.1,5.4-7.4,10-12.6,13.4L24,124l0.8-12.9c0.4-6.2,2.2-12.2,5.3-17.6l37.3-64.4"></path><path fill="#fff" d="M60.4 44.1c-.5 0-1-.1-1.5-.4-1.4-.8-1.9-2.7-1.1-4.1l7-12c.8-1.4 2.7-1.9 4.1-1.1s1.9 2.7 1.1 4.1l-7 12C62.4 43.5 61.4 44.1 60.4 44.1zM77.7 54.1c-.5 0-1-.1-1.5-.4-1.4-.8-1.9-2.7-1.1-4.1l7-12c.8-1.4 2.7-1.9 4.1-1.1 1.4.8 1.9 2.7 1.1 4.1l-7 12C79.7 53.5 78.7 54.1 77.7 54.1z"></path><path fill="#fcca3d" d="M47.2,94.8c-0.5,0-1-0.1-1.5-0.4c-1.4-0.8-1.9-2.7-1.1-4.1l25-43.4c0.8-1.4,2.6-1.8,4.1-1.1c5.6,2.7,5.6,2.7,5.6,2.7L49.9,93.4C49.3,94.4,48.2,94.8,47.2,94.8z"></path><path fill="#444b54" d="M24,127c-0.5,0-1-0.1-1.5-0.4c-1-0.6-1.6-1.6-1.5-2.8l0.8-12.9c0.4-6.6,2.4-13.2,5.7-18.9l30.3-52.4c0.8-1.4,2.7-1.9,4.1-1.1c1.4,0.8,1.9,2.7,1.1,4.1L32.7,95c-2.9,4.9-4.5,10.6-4.9,16.3l-0.4,6.9l5.8-3.8C38,111.3,42,107,44.9,102l30.3-52.4c0.8-1.4,2.7-1.9,4.1-1.1c1.4,0.8,1.9,2.7,1.1,4.1L50,105c-3.3,5.8-8,10.7-13.5,14.4l-10.8,7.1C25.2,126.8,24.6,127,24,127z"></path><path fill="#ff5576" d="M87.7,36.7c-0.5,0-1-0.1-1.5-0.4c-1.4-0.8-1.9-2.7-1.1-4.1c0.9-1.6,1.2-3.5,0.7-5.3s-1.6-3.3-3.3-4.2c-1.6-0.9-3.5-1.2-5.3-0.7s-3.3,1.6-4.3,3.3c-0.8,1.4-2.7,1.9-4.1,1.1s-1.9-2.7-1.1-4.1c3.6-6.2,11.6-8.3,17.8-4.8c3,1.7,5.2,4.5,6.1,7.9s0.4,6.9-1.3,9.9C89.7,36.2,88.7,36.7,87.7,36.7z"></path><path fill="#ff5576" d="M87.7,33.7c2.8-4.8,1.1-10.9-3.7-13.7l0,0c-4.8-2.8-10.9-1.1-13.7,3.7l-3.7,6.5l17.3,10L87.7,33.7z"></path><path fill="#ff5576" d="M83.9,43.2c-0.5,0-1-0.1-1.5-0.4l-17.3-10c-0.7-0.4-1.2-1.1-1.4-1.8c-0.2-0.8-0.1-1.6,0.3-2.3l3.7-6.5c3.6-6.2,11.6-8.3,17.8-4.8c3,1.7,5.2,4.5,6.1,7.9s0.4,6.9-1.3,9.9l-3.7,6.5c-0.4,0.7-1.1,1.2-1.8,1.4C84.4,43.2,84.2,43.2,83.9,43.2z M70.7,29.1l12.1,7l2.2-3.9l0,0c0.9-1.6,1.2-3.5,0.7-5.3s-1.6-3.3-3.3-4.2c-3.3-1.9-7.6-0.8-9.6,2.6L70.7,29.1z"></path><g><path fill="#d32f56" d="M83.9,43.2c-0.5,0-1-0.1-1.5-0.4c-1.4-0.8-1.9-2.7-1.1-4.1l3.7-6.5c1-1.8,1.2-4,0.5-6c-0.6-1.6,0.2-3.3,1.8-3.9c1.6-0.6,3.3,0.2,3.9,1.8c1.4,3.7,1,7.7-0.9,11.1l-3.7,6.5C86,42.7,85,43.2,83.9,43.2z"></path></g></g>
                                                </svg>
                                            </div>
                                            <div className="delete-btn" onClick={() => handleDelete(item._id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 100 100">
                                                    <path fill="#f37e98" d="M25,30l3.645,47.383C28.845,79.988,31.017,82,33.63,82h32.74c2.613,0,4.785-2.012,4.985-4.617L75,30"></path><path fill="#f15b6c" d="M65 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S65 36.35 65 38zM53 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S53 36.35 53 38zM41 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S41 36.35 41 38zM77 24h-4l-1.835-3.058C70.442 19.737 69.14 19 67.735 19h-35.47c-1.405 0-2.707.737-3.43 1.942L27 24h-4c-1.657 0-3 1.343-3 3s1.343 3 3 3h54c1.657 0 3-1.343 3-3S78.657 24 77 24z"></path><path fill="#1f212b" d="M66.37 83H33.63c-3.116 0-5.744-2.434-5.982-5.54l-3.645-47.383 1.994-.154 3.645 47.384C29.801 79.378 31.553 81 33.63 81H66.37c2.077 0 3.829-1.622 3.988-3.692l3.645-47.385 1.994.154-3.645 47.384C72.113 80.566 69.485 83 66.37 83zM56 20c-.552 0-1-.447-1-1v-3c0-.552-.449-1-1-1h-8c-.551 0-1 .448-1 1v3c0 .553-.448 1-1 1s-1-.447-1-1v-3c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v3C57 19.553 56.552 20 56 20z"></path><path fill="#1f212b" d="M77,31H23c-2.206,0-4-1.794-4-4s1.794-4,4-4h3.434l1.543-2.572C28.875,18.931,30.518,18,32.265,18h35.471c1.747,0,3.389,0.931,4.287,2.428L73.566,23H77c2.206,0,4,1.794,4,4S79.206,31,77,31z M23,25c-1.103,0-2,0.897-2,2s0.897,2,2,2h54c1.103,0,2-0.897,2-2s-0.897-2-2-2h-4c-0.351,0-0.677-0.185-0.857-0.485l-1.835-3.058C69.769,20.559,68.783,20,67.735,20H32.265c-1.048,0-2.033,0.559-2.572,1.457l-1.835,3.058C27.677,24.815,27.351,25,27,25H23z"></path><path fill="#1f212b" d="M61.5 25h-36c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h36c.276 0 .5.224.5.5S61.776 25 61.5 25zM73.5 25h-5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h5c.276 0 .5.224.5.5S73.776 25 73.5 25zM66.5 25h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c.276 0 .5.224.5.5S66.776 25 66.5 25zM50 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v25.5c0 .276-.224.5-.5.5S52 63.776 52 63.5V38c0-1.103-.897-2-2-2s-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2v-3.5c0-.276.224-.5.5-.5s.5.224.5.5V73C53 74.654 51.654 76 50 76zM62 76c-1.654 0-3-1.346-3-3V47.5c0-.276.224-.5.5-.5s.5.224.5.5V73c0 1.103.897 2 2 2s2-.897 2-2V38c0-1.103-.897-2-2-2s-2 .897-2 2v1.5c0 .276-.224.5-.5.5S59 39.776 59 39.5V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C65 74.654 63.654 76 62 76z"></path><path fill="#1f212b" d="M59.5 45c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v2C60 44.776 59.776 45 59.5 45zM38 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C41 74.654 39.654 76 38 76zM38 36c-1.103 0-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2V38C40 36.897 39.103 36 38 36z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button
                    className="prev-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <CIcon icon={cilArrowCircleLeft} />
                </button>
                <span className="page-number">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    className="next-btn"
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
