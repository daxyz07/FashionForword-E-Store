import React, { useState } from 'react';
import './AdminProductQuery.css';

const AdminProductQuery = ({ onSearch, onReset, categories }) => {
  const [queryParams, setQueryParams] = useState({
    searchTerm: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQueryParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(queryParams);
  };

  const handleReset = () => {
    const resetParams = {
      searchTerm: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      dateFrom: '',
      dateTo: ''
    };
    setQueryParams(resetParams);
    onReset();
  };

  return (
    <div className="admin-product-query">
      <div className="query-header">
        <h3>Advanced Product Search</h3>
        <button 
          type="button" 
          className="btn-toggle-query"
          onClick={() => document.querySelector('.query-form').classList.toggle('collapsed')}
        >
          <i className="bi bi-search"></i>
          Toggle Search
        </button>
      </div>

      <form className="query-form" onSubmit={handleSearch}>
        <div className="query-row">
          <div className="query-field">
            <label htmlFor="searchTerm">Search Products:</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={queryParams.searchTerm}
              onChange={handleInputChange}
              placeholder="Search by name or description..."
            />
          </div>

          <div className="query-field">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={queryParams.category}
              onChange={handleInputChange}
            >
              <option value="">All Categories</option>
              <option value="men">Men's</option>
              <option value="women">Women's</option>
              <option value="kids">Kids'</option>
            </select>
          </div>
        </div>

        <div className="query-row">
          <div className="query-field">
            <label htmlFor="minPrice">Min Price (₹):</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={queryParams.minPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="query-field">
            <label htmlFor="maxPrice">Max Price (₹):</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={queryParams.maxPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="query-row">
          <div className="query-field">
            <label htmlFor="dateFrom">Created From:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={queryParams.dateFrom}
              onChange={handleInputChange}
            />
          </div>

          <div className="query-field">
            <label htmlFor="dateTo">Created To:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={queryParams.dateTo}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="query-row">
          <div className="query-field">
            <label htmlFor="sortBy">Sort By:</label>
            <select
              id="sortBy"
              name="sortBy"
              value={queryParams.sortBy}
              onChange={handleInputChange}
            >
              <option value="created_at">Date Created</option>
              <option value="p_name">Product Name</option>
              <option value="p_price">Price</option>
              <option value="updated_at">Last Updated</option>
            </select>
          </div>

          <div className="query-field">
            <label htmlFor="sortOrder">Sort Order:</label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={queryParams.sortOrder}
              onChange={handleInputChange}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="query-actions">
          <button type="submit" className="btn-primary">
            <i className="bi bi-search"></i>
            Search Products
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            <i className="bi bi-arrow-clockwise"></i>
            Reset Filters
          </button>
        </div>
      </form>

      <div className="query-summary">
        <div className="active-filters">
          {queryParams.searchTerm && (
            <span className="filter-tag">
              Search: "{queryParams.searchTerm}"
            </span>
          )}
          {queryParams.category && (
            <span className="filter-tag">
              Category: {queryParams.category}
            </span>
          )}
          {(queryParams.minPrice || queryParams.maxPrice) && (
            <span className="filter-tag">
              Price: ₹{queryParams.minPrice || '0'} - ₹{queryParams.maxPrice || '∞'}
            </span>
          )}
          {(queryParams.dateFrom || queryParams.dateTo) && (
            <span className="filter-tag">
              Date: {queryParams.dateFrom || 'Start'} to {queryParams.dateTo || 'End'}
            </span>
          )}
          <span className="filter-tag">
            Sort: {queryParams.sortBy} ({queryParams.sortOrder})
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminProductQuery;