import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../../config.dev.json";
import { CTable } from "@coreui/react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import './style.scss';
import { DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteDialog from "../deletedialog/index";

const backend_url = config.backend_url; // Backend API URL

const AddPopUp = ({setAddEmployeeBox,fetchEmployeeData,currentPage})=>{
  const [newEmployee,setNewEmployee] = useState({})
  const [err ,setErr] = useState(null)

  const handleInputChange = (e)=>{
    const {name,value}=e.target
    setNewEmployee({...newEmployee,[name]:value})
  }
  const handleAddEmployee = async () => {
    try {
      await axios.post(`${backend_url}/employee/add-employee`, newEmployee);
      setAddEmployeeBox(false); // Close the popup
      fetchEmployeeData(currentPage); // Reload data after addition
    } catch(err){
      console.error("Error adding data:", err);
      setErr(err.response?.data?.message || "An error occurred while adding the employee.");
    }
  }
  return(
    <div className="add-employee-box" onClick={() => setAddEmployeeBox(false)}>
      <div className="add-employee-content" onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent>
          <input type="text" name="Code" value={newEmployee.Code} onChange={handleInputChange} placeholder="Code" required/>
          <input type="text" name="Name" value={newEmployee.Name} onChange={handleInputChange} placeholder="Name" required/>
          <input type="text" name="Position" value={newEmployee.Position} onChange={handleInputChange} placeholder="Position" required/>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <button className="save-btn" onClick={handleAddEmployee}>
            save
          </button>
          <button onClick={() => setAddEmployeeBox(false)} className="cancel-btn">
            Cancel
          </button>
        </DialogActions>
        {err && <p style={{color:"red",textAlign:"center"}}>{err}</p>}
      </div>
    </div>
  )
}


// Main Employee Management Component
function Employee() {
  // State variables for data and UI management
  const [employeeData, setEmployeeData] = useState([]); // Holds the employee data
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalCount, setTotalCount] = useState(0); // Total records count
  const [deleteId, setDeleteId] = useState(""); // ID of the employee to be deleted
  const [loading, setLoading] = useState(false); // Loading state
  const [editRowId, setEditRowId] = useState(""); // Row ID for editing
  const [editRowData, setEditRowData] = useState({}); // Edited row data
  const[addEmployeeBox,setAddEmployeeBox] = useState(false)//add Employee Data

  const rowsPerPage = 50; // Number of rows per page

  const deleteDialogRef = useRef();



  // Open the delete confirmation popup
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    deleteDialogRef.current.handleOpen(); // Open the dialog
  };

  // Open the edit row input fields
  const handleEditClick = (id) => {
    setEditRowId(id);
    const rowToEdit = employeeData.find((row) => row._id === id);
    setEditRowData({ ...rowToEdit }); // Pre-fill the edit fields with current data
  };

  // Handle input change for inline editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRowData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Save the edited data to the backend
  const handleSaveEdit = async (id) => {
    try {
      const response = await axios.put(`${backend_url}/employee/edit-employee/${id}`, editRowData);
      console.log(response.data);
      setEditRowId(""); // Close the edit mode
      fetchEmployeeData(currentPage); // Reload data after edit
    } catch (err) {
      console.error(err);
    }
  };

  // Handle the delete operation
  const handleDelete = async () => {
    try {
      await axios.delete(`${backend_url}/employee/delete-employee/${deleteId}`);
       // Close the popup
      fetchEmployeeData(currentPage); // Reload data after deletion
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  };

  // Fetch employee data with pagination and search
  const fetchEmployeeData = async (page) => {
    setLoading(true); // Show loading indicator
    try {
      const response = await axios.get(
        `${backend_url}/employee/get-employee?page=${page}&limit=${rowsPerPage}&query=${searchTerm}`
      );
      setEmployeeData(response.data.data); // Update employee data
      setTotalCount(response.data.totalRecords); // Update total record count
    } catch (err) {
      console.error("Error fetching employee data:", err);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Fetch data on component load or when currentPage/searchTerm changes
  useEffect(() => {
    fetchEmployeeData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchEmployeeData(1);
  }, [searchTerm]);
  // Calculate total number of pages
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Navigate to the previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Navigate to the next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="employee-data">
      <h2 className="table-title">Employee Codes</h2>

      <div className="filter-container">
      {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value)}}
          className="filter-input"
        />
        {/* Add Employee Button */}
        <button onClick={()=> setAddEmployeeBox(true)} className="add-btn"><IoMdAdd />Add Employee</button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="scrollable-table">
          {loading ? (
            <p>Loading...</p> // Display loading message while data is being fetched
          ) : (
            <CTable striped className="dealer-table">
              <thead>
                <tr>
                  <th>SNo.</th>
                  <th>CODE</th>
                  <th>NAME</th>
                  <th>POSITION</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeData.length > 0 ? (
                  employeeData.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      {editRowId === item._id ? (
                        // Row in edit mode
                        <>
                          <td>
                            <input
                              type="text"
                              name="Code"
                              value={editRowData.Code || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="Name"
                              value={editRowData.Name || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="Position"
                              value={editRowData.Position || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <button className="save-btn" onClick={() => handleSaveEdit(item._id)}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditRowId("")}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        // Normal row
                        <>
                          <td>{item.Code}</td>
                          <td>{item.Name}</td>
                          <td>{item.Position}</td>
                          <td>
                            <div className="action-btn">
                              <button
                                className="edit-btn"
                                onClick={() => handleEditClick(item._id)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item._id)}
                                className="delete-btn"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  // No data message
                  <tr>
                    <td colSpan="5">No data available</td>
                  </tr>
                )}
              </tbody>
            </CTable>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={prevPage}
            className="page-btn"
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            className="page-btn"
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Refactored DeleteDialog */}
      <DeleteDialog
        ref={deleteDialogRef} // Pass the ref to access the handleOpen method
        action={handleDelete} // Define what happens when "Delete" is confirmed
      />
      {/*Add employee Popup*/}
      {addEmployeeBox && (
        <AddPopUp
        setAddEmployeeBox ={setAddEmployeeBox} fetchEmployeeData= {fetchEmployeeData}  currentPage={currentPage}  />)}
    </div>
  );
}export default Employee;