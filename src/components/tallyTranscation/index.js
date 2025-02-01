import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config.dev.json";
import "./style.scss";
import { CTable } from "@coreui/react";
import { FaEdit, FaFileUpload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const backend_url = config.backend_url;

const DeleteDialogBox = ({ Close, fetchdata }) => {
  const [deleteError, setDeleteError] = useState("");
  const [deleteDate, setDeleteDate] = useState("");
  const handleDeleteTally = async () => {
  let response
    try {
         response = await axios.delete(
         `${backend_url}/tally-transaction/delete-tally-transaction/${deleteDate}`
       );
       console.log(response.data.message)
       console.log(response.data.data)
      setDeleteError("");
      fetchdata();
      Close();
    } catch (err) {
        // Check error response
      if (err.response) {
        // Server responded with a status code outside 2xx
        setDeleteError(err.response.data.error || "An error occurred on the server.");
      } else if (err.request) {
        // No response from server (e.g., network error)
        setDeleteError("No response from the server. Please try again.");
      } else {
        // Other unexpected errors
        setDeleteError(err.message);
      }
    }
  };
  return (
    <div className="delete-dialog">
      <div className="dialog-content">
        <h3>Delete Tally Transactions</h3>
        <label>Enter Date:</label>
        <input
          type="date"
          value={deleteDate}
          onChange={(e) => setDeleteDate(e.target.value)}
          pattern="\d{4}-\d{2}-\d{2}"
        />
        {deleteError && <p className="error-message">{deleteError}</p>}
        <div className="dialog-buttons">
          <button className="cancel-btn" onClick={() =>Close()}>
            Cancel
          </button>
          <button className="delete-btn" onClick={handleDeleteTally}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TallyTable = () => {
  const [Tally, setTally] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterError, setfilterError] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [voucherType, setVoucherType] = useState([]);
  const [voucher, setVoucher] = useState("");
  const [deleteBox, setDeleteBox] = useState(false);
  const itemsPerPage = 50;

  const fetchVoucher = async () => {
    try {
      const response = await axios.get(
        `${backend_url}/voucher/get-voucher-type`
      );
      setVoucherType(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTally = async (currentPage) => {
    try {
      const response = await axios.get(
        `${backend_url}/tally-transaction/get-tally-transaction/`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            filter: searchTerm,
            startDate: startDate,
            endDate: endDate,
            voucher: voucher,
          },
        }
      );
      setTally(response.data.data);

      setTotalCount(response.data.totalCount);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch Tally");
      setLoading(false);
    }
  };
  const handleEditClick = (id) => {
    setEditRowId(id); // Set the ID of the row being edited
    const TallyData = Tally.find((user) => user._id === id); // Find the user data by id
    setEditRowData({ ...TallyData }); // Set the user data to be edited
  };

  // Handle input change for inline editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRowData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSaveEdit = async (id) => {
    try {
      let updatedData = { ...editRowData };

      // Remove DATE from the object so it doesn't get updated
      delete updatedData.DATE;
      const response = await axios.put(
        `${backend_url}/tally-transaction/edit-tally-transaction/${id}`,
        updatedData
      );
      fetchTally(currentPage);
      console.log(response.data);
      setEditRowId(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTally(currentPage);
    fetchVoucher();
  }, [currentPage]);

  useEffect(() => {
    fetchTally(1);
    setCurrentPage(1);
  }, [searchTerm, voucher]);

  // Navigate to the next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleDeleteClick = () => {
    setDeleteBox(true);
  };

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

  const applyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const effectiveEndDate = endDate || today;

    if (!startDate) {
      setfilterError("Start date is required");
      return;
    }
    if (!endDate) {
      setEndDate(new Date().toISOString().split("T")[0]);
    }

    const start = new Date(startDate);
    const end = new Date(effectiveEndDate);

    if (start > end) {
      setfilterError("Start date should be before end date");
      return;
    }

    setfilterError(""); // Clear errors
    if (!endDate) setEndDate(today); // Update only if necessary

    fetchTally(1); // Fetch data only if everything is valid
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setVoucher("");
    setCurrentPage(1)
  };
  
  return (
    <div className="Tally-container">
      <h2 className="Tally-title">Tally Transaction</h2>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="filter-input"
        />
        <select
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
          className="voucher-dropdown"
        >
          <option value="">All Voucher</option>
          {voucherType.map((voucher) => (
            <option key={voucher} value={voucher}>
              {voucher}
            </option>
          ))}
        </select>
        <div className="filter-buttons">
          <button className="apply-btn" onClick={applyFilters}>
            Apply Filter
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        {filterError && <div className="error-message">{filterError}</div>}
      </div>
      {/* Upload Tally Button */}
      <div className="upload">
        <label className="upload-btn">
          <FaFileUpload />
          Upload 
          <input type="file" name="file" accept=".csv,.xml" hidden />
        </label>
        <label className="tally-delete-btn" onClick={handleDeleteClick}>
          <MdDelete />
          Delete 
        </label>
      </div>
      <div className="table-container">
        <div className="scrollable-table">
          <CTable striped className="Tally-table">
            <thead>
              <tr>
                <th>SNo.</th>
                <th>Party Name</th>
                <th>Party Ledger Name</th>
                <th>Dealer Code</th>
                <th>Date</th>
                <th>Voucher Number</th>
                <th>Voucher Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Tally.map((Tally, index) => (
                <tr key={Tally._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  {editRowId === Tally._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="PARTYNAME"
                          value={editRowData.PARTYNAME || ""}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="PARTYLEDGERNAME"
                          value={editRowData.PARTYLEDGERNAME || ""}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="dealerCode"
                          value={editRowData.dealerCode || ""}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        {new Date(Tally.DATE)
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 19)}
                      </td>
                      <td>
                        <input
                          type="text"
                          name="VOUCHERNUMBER"
                          value={editRowData.VOUCHERNUMBER || ""}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <select
                          value={voucher}
                          name="VOUCHERTYPE"
                          onChange={handleInputChange}
                        >
                          <option value={editRowData.VOUCHERTYPE}>
                            {editRowData.VOUCHERTYPE}
                          </option>
                          {voucherType.map((voucher) => (
                            <option key={voucher} value={voucher}>
                              {voucher}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="AMOUNT"
                          value={editRowData.AMOUNT || ""}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="save-btn"
                            onClick={() => handleSaveEdit(Tally._id)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setEditRowId("")}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{Tally.PARTYNAME || "N/A"}</td>
                      <td>{Tally.PARTYLEDGERNAME || "N/A"}</td>
                      <td>{Tally.dealerCode || "N/A"}</td>
                      <td>
                        {new Date(Tally.DATE)
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 19)}
                      </td>
                      <td>{Tally.VOUCHERNUMBER || "N/A"}</td>
                      <td>{Tally.VOUCHERTYPE || "N/A"}</td>
                      <td>{Tally.AMOUNT || "N/A"}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(Tally._id)}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
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
      {deleteBox && (
        <DeleteDialogBox
          Close={() => setDeleteBox(false)}
          fetchdata={() => fetchTally(1)}
        />
      )}
    </div>
  );
};

export default TallyTable;
