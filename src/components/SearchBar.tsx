import { useState } from 'react';
import type { ColDef } from 'ag-grid-community';

interface SearchBarProps {
  columnDefs: ColDef[];
  onSearch: (field: string, value: string) => void;
  onClear: () => void;
  isSearchActive: boolean;
  resultCount: number | null;
  loading: boolean;
}

const searchBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '13px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  backgroundColor: '#fff',
  color: '#1e293b',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '13px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  backgroundColor: '#fff',
  color: '#1e293b',
  width: '160px',
};

const searchButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#fff',
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const clearButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#fff',
  backgroundColor: '#64748b',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const resultCountStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  marginLeft: '8px',
};

export function SearchBar({ columnDefs, onSearch, onClear, isSearchActive, resultCount, loading }: SearchBarProps) {
  const [field, setField] = useState('');
  const [value, setValue] = useState('');

  const handleSearch = () => {
    if (field && value.trim()) {
      onSearch(field, value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <div style={searchBarStyle}>
      <select style={selectStyle} value={field} onChange={(e) => setField(e.target.value)}>
        <option value="">Select field...</option>
        {columnDefs.map((col) => (
          <option key={col.field} value={col.field}>
            {col.headerName || col.field}
          </option>
        ))}
      </select>
      <input
        style={inputStyle}
        type="text"
        placeholder="Search value..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        style={searchButtonStyle}
        onClick={handleSearch}
        disabled={!field || !value.trim() || loading}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      {isSearchActive && (
        <button style={clearButtonStyle} onClick={handleClear}>
          Clear
        </button>
      )}
      {isSearchActive && resultCount !== null && (
        <span style={resultCountStyle}>Found {resultCount} trade{resultCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
