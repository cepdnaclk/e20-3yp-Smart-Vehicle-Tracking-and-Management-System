import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  title = 'Data Table',
  icon = <FileText size={18} />,
  searchable = true,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  actions = null,
  onRowClick = null,
  emptyMessage = 'No data available',
  loading = false
}) => {
  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Filter data based on search query
  const filteredData = searchQuery.trim() === '' 
    ? data 
    : data.filter(item => 
        Object.values(item)
          .some(value => 
            value !== null && 
            value !== undefined && 
            value.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
  
  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
      if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
      
      const aValue = typeof a[sortConfig.key] === 'string' 
        ? a[sortConfig.key].toLowerCase() 
        : a[sortConfig.key];
      
      const bValue = typeof b[sortConfig.key] === 'string' 
        ? b[sortConfig.key].toLowerCase() 
        : b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) 
    : sortedData;
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };
  
  // Getting sort direction for a column
  const getSortDirection = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <div className="text-primary me-2">
            {icon}
          </div>
          <h6 className="mb-0">{title}</h6>
        </div>
        
        <div className="d-flex flex-wrap align-items-center gap-2">
          {searchable && (
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm pe-5"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ minWidth: '200px' }}
              />
              <Search 
                size={16} 
                className="position-absolute text-muted" 
                style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }} 
              />
            </div>
          )}
          
          {actions && (
            <div className="d-flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    style={{ 
                      cursor: column.sortable !== false ? 'pointer' : 'default',
                      width: column.width || 'auto'
                    }}
                    className={column.className || ''}
                  >
                    <div className="d-flex align-items-center">
                      {column.header || column.key}
                      {column.sortable !== false && (
                        <span className="ms-1">
                          {getSortDirection(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="loading-spinner" style={{ width: '30px', height: '30px' }}></div>
                    </div>
                    <p className="mt-2 text-muted">Loading data...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <motion.tr 
                    key={rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className={column.cellClassName || ''}>
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key] !== undefined && row[column.key] !== null 
                            ? row[column.key].toString()
                            : '-'
                        }
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <p className="text-muted">{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {pagination && totalPages > 0 && (
        <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center py-2">
          <div className="d-flex align-items-center mb-2 mb-md-0">
            <span className="text-muted me-2">Rows per page:</span>
            <select
              className="form-select form-select-sm"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              style={{ width: '70px' }}
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">
              {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length}
            </span>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
