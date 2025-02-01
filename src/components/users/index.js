import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios'; 
import config from '../../config.dev.json'
import './style.scss';
import { CTable } from '@coreui/react';
import { FaEdit  } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DeleteDialog from '../deletedialog';
import { IoMdAdd } from "react-icons/io";
import { DialogTitle, DialogContent, DialogActions } from "@mui/material";

const backend_url = config.backend_url

const AddPopUp = ({setAddEmployeeBox,fetchUsers,currentPage})=>{
  const [newUser,setnewUser] = useState({
    name: '',
    email: '',
    password:'',
    phone_number:'',
    code:'',
    verified: true,
    position:''

  })
  const [err , setErr] = useState(null)
  const positions = ['TSE', 'ZSM', 'ASM', 'ABM'];

  const handleInputChange = (e)=>{
    const {name,value}=e.target
    setnewUser({...newUser,[name]:value})
  }
  const handleAddEmployee = async () => {
    try {
      await axios.post(`${backend_url}/user/addUser`, newUser);
      setAddEmployeeBox(false); // Close the popup
      fetchUsers(currentPage); // Reload data after addition
    } catch(err){
      console.error("Error adding data:", err);
      setErr(err.response?.data?.message || "An error occurred while adding the employee.");
    }
  }
  return(
    <div className="add-user-box" onClick={() => setAddEmployeeBox(false)}>
      <div className="add-user-content" onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Add Users</DialogTitle>
        <DialogContent>
          <input type="text" name="name" value={newUser.name} onChange={handleInputChange} placeholder="Name"/>
          <input type="email" name="email" value={newUser.email} onChange={handleInputChange} placeholder="Email"/>
          <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="Password"/>
          <input type="tel" name="phone_number" value={newUser.phone_number} onChange={handleInputChange} placeholder="Phone Number" maxlength="10" pattern="[1-9]{1}[0-9]{9}"/>
          <input type="text" name="code" value={newUser.code} onChange={handleInputChange} placeholder="Code"/>
          <label>Verified</label>
          <select
            value={newUser.verified}
            onChange={handleInputChange}
            name="verified"
            >
            <option value="true">True</option>
            <option value="false">False</option>
            </select>
          <label >Position:</label>
          <select
            name="position" 
            value={newUser.position } 
            onChange={handleInputChange}
            className="position-dropdown"
            >
              <option value="">All Positions</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>

        </DialogContent>
        <div className='dialog-actions'>
          <button className="save-btn" onClick={handleAddEmployee}>
            save
          </button>
          <button onClick={() => setAddEmployeeBox(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
        {err && <p style={{color: 'red',textAlign:"center"}}>{err}</p>}
      </div>
    </div>
  )
}

const Users = () => {
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  // const [selectedPosition, setSelectedPosition] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalCount , setTotalCount] = useState()
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editRowId,setEditRowId] = useState(null)
  const [editRowData,setEditRowData] = useState({})
  const [addEmployeeBox,setAddEmployeeBox] = useState(false)
  

  const deleteDialogRef = useRef();
  const itemsPerPage = 50

  const fetchUsers = async (currentPage) => {
    try {
      const response = await axios.get(`${backend_url}/users/getUser?page=${currentPage}&limit=${itemsPerPage}&query=${searchTerm}`); 
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
      setTotalCount(response.data.totalCount);
      setLoading(false); 
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };
  const handleEditClick = (id) => {
    setEditRowId(id); // Set the ID of the row being edited
    const userData = users.find(user => user._id === id); // Find the user data by id
    setEditRowData({ ...userData }); // Set the user data to be edited
  };
  
    // Handle input change for inline editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRowData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSaveEdit= async(id) => {
    try{
      const response = await axios.put(`${backend_url}/user/editUser/${id}`, editRowData);
      fetchUsers(currentPage);
      console.log(response.data)
      setEditRowId(null);
    }catch(err){
      console.log(err)
    }
  }

   // Handle the delete operation
   const handleDelete = async () => {
    try {
      await axios.delete(`${backend_url}/user/deleteUser/${deleteId}`);// Close the popup
      fetchUsers(currentPage); // Reload data after deletion
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage); 
  }, [currentPage]);

  useEffect(()=>{
    fetchUsers(1)
    setCurrentPage(1)
  }, [searchTerm])
    // Navigate to the previous page
  
    // Navigate to the next page
    const nextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    };

  // useEffect(() => {
  //   const filtered = users.filter((user) => {
  //     const matchesSearchTerm = 
  //       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.position.toLowerCase().includes(searchTerm.toLowerCase());

  //     const matchesPosition = selectedPosition ? user.position === selectedPosition : true;

  //     return matchesSearchTerm && matchesPosition;
  //   });

  //   setFilteredUsers(filtered);
  //   setCurrentPage(1); // Reset to first page on filter change
  // }, [searchTerm, selectedPosition, users]);

 // Calculate total number of pages
 const totalPages = Math.ceil(totalCount / itemsPerPage);

 // Navigate to the previous page
 const prevPage = () => {
   if (currentPage > 1) {
     setCurrentPage((prev) => prev - 1);
   }
 };

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>{error}</div>; 
  }
  const handleDeleteClick = (id) => {
    deleteDialogRef.current.handleOpen();
    setDeleteId(id);
  };
  return (
    <div className="user-container">
      <h2 className="user-title">Users</h2>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by name, email, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value) }
          className="search-input"
        />
        {/* Add Employee Button */}
        <button onClick={()=> setAddEmployeeBox(true)} className="add-btn"><IoMdAdd />Add User</button>
      {/*
        
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="position-dropdown"
        >
          <option value="">All Positions</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
        */}
      </div>

      <div className="table-container">
        <div className="scrollable-table">
         <CTable striped className='user-table'>
         <thead>
            <tr>
              <th>SNo.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user,index) => (
              <tr key={user._id}>
              <td>{(currentPage-1)*itemsPerPage+index+1}</td>
                {editRowId === user._id?
                  (<td><input
                    type="text"
                    name="name"
                    value={editRowData.name || ""}
                    onChange={handleInputChange}
                  /></td>) : (<td>{user.name}</td>)
                }
                
                <td>{user.email}</td>
                <td>{user.position}</td>
                <td>
                  <div className="action-btns">
                    {editRowId === user._id?(
                      <>
                        <button className="save-btn" onClick={() => handleSaveEdit(user._id)}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditRowId("")}>Cancel</button>
                      </>
                    ):(
                      <>
                        <button className="edit-btn" onClick={()=>handleEditClick(user._id)}><FaEdit /></button>
                        <button className="delete-btn" onClick={()=>handleDeleteClick(user._id)}><MdDelete /></button>
                      </>
                    )}                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
         </CTable>
        </div>
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
     <DeleteDialog
        action={handleDelete}
        ref={deleteDialogRef} 
      />
      {addEmployeeBox && <AddPopUp setAddEmployeeBox ={setAddEmployeeBox} fetchUsers= {fetchUsers}  currentPage={currentPage}  />}
    </div>
  );
};

export default Users;
