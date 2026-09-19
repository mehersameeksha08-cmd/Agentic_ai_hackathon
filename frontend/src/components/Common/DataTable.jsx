// src/components/Common/DataTable.jsx
import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  defaultPageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search criteria or load a dataset.",
  className = ""
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return val.join(" ").toLowerCase().includes(term);
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "string") {
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className={`data-table-wrapper ${className}`}>
      {/* Search & Meta Bar */}
      <div className="table-controls-bar">
        {searchable && (
          <div className="table-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        <div className="table-meta-info">
          <span>Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records</span>
          <select
            className="table-page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-scroll-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={col.sortable !== false ? "sortable-header" : ""}
                  style={{ width: col.width }}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="sort-indicator">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="sort-idle" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-td">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || row.customer_id || row.master_id || rIdx} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className={col.className || ""}>
                      {col.render ? col.render(row[col.key], row, rIdx) : (
                        <span className="cell-truncate" title={String(row[col.key] || "")}>
                          {row[col.key] !== undefined && row[col.key] !== null && String(row[col.key]).trim() !== ""
                            ? String(row[col.key])
                            : <span className="cell-empty">—</span>
                          }
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="table-pagination-footer">
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, i, arr) => {
                  const prev = arr[i - 1];
                  return (
                    <React.Fragment key={page}>
                      {prev && page - prev > 1 && <span className="pagination-ellipsis">...</span>}
                      <button
                        className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
