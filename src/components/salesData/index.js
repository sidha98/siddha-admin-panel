import React, { useState, useEffect } from "react";
import axios from "axios";
import { CTable } from '@coreui/react'
import config from '../../config'
import "./style.scss";

const backend_url = config.backend_url

const Sales_Data = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 50;

  const fetchSalesData = async (page) => {
    try {
      const response = await axios.get(
        `${backend_url}/sales-data-mtdw/get-sales-data?page=${page}&limit=${rowsPerPage}`
      );
      setSalesData(response.data.data);
      setTotalCount(response.data.totalCount);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      console.error("Error fetching sales data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(currentPage);
  }, [currentPage]);

  const applyFilters = () => {
    const filteredData = salesData.filter((item) => {
      const matchesSearchTerm = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDateRange =
        (!startDate || new Date(item.date) >= new Date(startDate)) &&
        (!endDate || new Date(item.date) <= new Date(endDate));
      return matchesSearchTerm && matchesDateRange;
    });
    setSalesData(filteredData);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    fetchSalesData(currentPage);
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
    <div className="sales-data">
      <h2 className="table-title">Sales</h2>
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
          <CTable striped className="sales-table">
            <thead>
              <tr>
                <th>STATE</th>
                <th>TSE</th>
                <th>ASM</th>
                <th>SEGMENT</th>
                <th>PRICE BAND</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.STATE}</td>
                    <td>{item.TSE}</td>
                    <td>{item.ASM}</td>
                    <td>{item.SEGMENT}</td>
                    <td>{item["PRICE BAND"]}</td>
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

export default Sales_Data;
