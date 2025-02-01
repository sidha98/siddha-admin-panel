import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../../config.dev.json'
import "./style.scss";
import { CTable } from "@coreui/react";
import { FaEdit  } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const backend_url = config.backend_url

const Dealers = () => {
  const [dealerData, setDealerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 50;

  const fetchDealerData = async (page) => {
    try {
      const response = await axios.get(
        `${backend_url}/dealer/getDealer?page=${page}&limit=${rowsPerPage}&query=${searchTerm}`
      );
      setDealerData(response.data.data);
      setTotalCount(response.data.totalRecords);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      console.error("Error fetching sales data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerData(currentPage);
  }, [currentPage]);
  useEffect(()=>{
    fetchDealerData(currentPage)
  },[searchTerm])

  const applyFilters = () => {
    const filteredData = fetchDealerData.filter((item) => {
      // const matchesSearchTerm = item.name
      //   .toLowerCase()
      //   .includes(searchTerm.toLowerCase());
      const matchesDateRange =
        (!startDate || new Date(item.date) >= new Date(startDate)) &&
        (!endDate || new Date(item.date) <= new Date(endDate));
      return matchesDateRange;
    });
    setDealerData(filteredData);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    fetchDealerData(currentPage);
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Handle Previous Page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Handle Next Page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="dealer-data">
      <h2 className="table-title">Dealers</h2>
      {/* Filters */}
      <div className="filter-container">
      
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
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
        <div className="filter-buttons">
          <button className="apply-btn" onClick={applyFilters}>
            Apply Filter
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="scrollable-table">
          <CTable striped className="dealer-table">
            <thead>
              <tr>
                <th>SNo.</th>
                <th>NAME</th>
                <th>POSITION</th>
                <th>CONTACT NUMBER</th>
                <th>EMAIL</th>
                <th>ADDRESS</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dealerData.length > 0 ? (
                dealerData.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{(currentPage-1)*rowsPerPage+index+1}</td>
                    <td>{item.owner.name}</td>
                    {/* <td>{item.position}</td> */}
                    <td>{item.owner.position}</td>
                    <td>{item.owner.contactNumber}</td>
                    <td>{item.owner.email}</td>
                    <td>{item.owner.homeAddress}</td>
                    <td>
                      <div className="action-btn">
                        <button className="edit-btn"><FaEdit /></button>
                        <button className="delete-btn"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No data available</td>
                </tr>
              )}
            </tbody>
          </CTable>
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
    </div>
  );
};

export default Dealers;
