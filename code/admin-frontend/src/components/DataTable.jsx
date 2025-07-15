import React, { useState } from 'react';
import { Table, Form, Button, InputGroup } from 'react-bootstrap';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  title, 
  icon,
  searchable = true,
  pagination = true,
  onRowClick,
  emptyMessage = 'No data available'
}) => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorting indicator
  const getSortDirection = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  // Filter data
  const filteredData = searchTerm.trim() === '' 
    ? data 
    : data.filter(item => {
        return Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  
  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : sortedData;
  
  return (
    <div className="card">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {icon && <span className="me-2">{icon}</span>}
          <h5 className="mb-0">{title}</h5>
        </div>
        
        {searchable && (
          <InputGroup style={{ width: '250px' }}>
            <Form.Control
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
          </InputGroup>
        )}
      </div>
      
      <div className="card-body p-0">
        <Table hover responsive>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ 
                    cursor: column.sortable !== false ? 'pointer' : 'default',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: '#1a202c',
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                    padding: '0.875rem 0.75rem'
                  }}
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
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor: '#f8f9fa'
                  }}
                  onMouseEnter={(e) => {
                    e.target.closest('tr').style.backgroundColor = '#e9ecef';
                  }}
                  onMouseLeave={(e) => {
                    e.target.closest('tr').style.backgroundColor = '#f8f9fa';
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {pagination && totalPages > 0 && (
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            Showing {Math.min(filteredData.length, (currentPage - 1) * rowsPerPage + 1)} to {Math.min(filteredData.length, currentPage * rowsPerPage)} of {filteredData.length} entries
          </div>
          
          <div className="d-flex">
            <Button 
              variant="outline-secondary" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="px-2 d-flex align-items-center">
              {currentPage} / {totalPages}
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
