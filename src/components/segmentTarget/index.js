import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config.dev.json'
import './style.scss';
import { MdOutlineSkipPrevious,MdOutlineSkipNext } from "react-icons/md";
import { CTable } from '@coreui/react';

const backend_url = config.backend_url
const SegmentTable = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; 
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const fetchSegments = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_url}/segment-target/getSegement`, {
        params: { page: pageNumber, limit },
      });
      setSegments(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching segments:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments(page);
  }, [page]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const applyFilters = () => {
   setPage(1);
   fetchSegments(1);
 };
 
 const resetFilters = () => {
   setSearchTerm("");
   setStartDate("");
   setEndDate("");
   setPage(1);
   fetchSegments(1);
 };
 

  return (
    <div className="segment-table-container">
      <h2>Segments</h2>
      <div className="filter-container">
        <div className="search-and-filters">
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
        </div>
        <div className="filter-buttons">
          <button className="apply-btn" onClick={applyFilters}>
            Apply Filter
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>
      <div className="table-container">
        <div className="scrollable-table">
        <CTable striped className = "segment-table">
        <thead>
            <tr>
              <th>Name</th>
              <th>Segment</th>
              <th>Target Value</th>
              <th>Target Volume</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment._id}>
                <td>{segment.Name}</td>
                <td>{segment.Segment}</td>
                <td>{segment['Target Value']}</td>
                <td>{segment['Target Volume']}</td>
                <td>{segment.Category}</td>
              </tr>
            ))}
          </tbody>
        </CTable>
        </div>
      </div>
      <div className="pagination">
        <button onClick={handlePrevious} disabled={page === 1}>
        <MdOutlineSkipPrevious />
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={page === totalPages}>
        <MdOutlineSkipNext />

        </button>
      </div>
    </div>
  );
};

export default SegmentTable;
