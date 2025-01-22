import React, { useState, useEffect } from "react";
import config from '../../config.dev.json'
import "./style.scss";
import { MdSkipNext ,MdSkipPrevious} from "react-icons/md";

import axios from "axios";
import { CTable } from "@coreui/react";

const backend_url = config.backend_url

const ExtractionData = () => {
  const [originalData, setOriginalData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [columns] = useState([
    "Dealer Code",
    "Brand",
    "Model",
    "Price",
    "Status",
  ]);
  const [filters, setFilters] = useState({
    universal: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50; 

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_url}/extraction/getExtractions`, {
        params: { page: 1, limit: 100 }, 
      });

      if (response.status === 200) {
        const { records } = response.data;
        setOriginalData(records.slice(1)); 
        setFilteredData(records.slice(1)); 
      } else {
        setError(response.data.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    applyFilters(updatedFilters); 
  };

  const applyFilters = (filterParams) => {
    const { universal, startDate, endDate } = filterParams;
    let filtered = [...originalData];

    if (universal) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          val?.toString().toLowerCase().includes(universal.toLowerCase())
        )
      );
    }

    if (startDate) {
      filtered = filtered.filter((row) => new Date(row.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((row) => new Date(row.date) <= new Date(endDate));
    }

    setFilteredData(filtered); 
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({ universal: "", startDate: "", endDate: "" });
    setFilteredData(originalData); 
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="extraction-container">
      <h2 className="table-title">Extraction</h2>
      <div className="filters">
        <input
          type="text"
          name="universal"
          placeholder="Search..."
          value={filters.universal}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="filter-date"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="filter-date"
        />
        <button onClick={resetFilters} className="filter-reset">
          Reset Filters
        </button>
        <button className="upload-file">
          Upload File
        </button>
      </div>
      <div className="table-container">
        <div className="scrollable-table">
         <CTable striped className="extraction-table">

         <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="table-header">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, index) => (
              <tr key={index} className="table-row">
                {columns.map((col, idx) => (
                  <td key={idx} className="table-cell">
                    {row[col] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
         </CTable>
        </div>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <MdSkipPrevious />

        </button>
        <span className="pagination-info">
          Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
          className="pagination-button"
        >
          <MdSkipNext />

        </button>
      </div>
    </div>
  );
};

export default ExtractionData;
