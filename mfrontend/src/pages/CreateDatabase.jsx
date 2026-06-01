import React, { useState } from 'react';
import './CreateDatabase.css';

const CreateDatabase = () => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: 'TEXT' }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'TEXT' }]);
  };

  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      setError('Invalid table name. Use letters, numbers, and underscores only.');
      return;
    }

    const validColumns = columns.filter(c => c.name && c.type);
    if (validColumns.length === 0) {
      setError('At least one column is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, columns: validColumns }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      setMessage(`✅ ${data.message}`);
      setTableName('');
      setColumns([{ name: '', type: 'TEXT' }]);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cdb-container">
      <div className="cdb-header">
        <h2>📊 Create New Database Table</h2>
        <p>Define your table structure with columns and data types</p>
      </div>

      <form onSubmit={handleSubmit} className="cdb-form">
        {/* Table Name Input */}
        <div className="cdb-form-group">
          <label htmlFor="tableName" className="cdb-label">
            <span className="required">*</span> Table Name
          </label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="cdb-input"
            placeholder="e.g., customers, products, employees"
            pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
            required
          />
          <small className="cdb-help">
            Letters, numbers, and underscores only. Must start with a letter.
          </small>
        </div>

        {/* Columns Section */}
        <div className="cdb-form-group">
          <label className="cdb-label">
            <span className="required">*</span> Columns
          </label>
          <div className="cdb-columns-list">
            {columns.map((col, index) => (
              <div key={index} className="cdb-column-row">
                <div className="cdb-column-inputs">
                  <div className="cdb-input-wrapper">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                      className="cdb-column-input"
                      placeholder="Column name"
                      pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
                    />
                    <small>Column Name</small>
                  </div>

                  <div className="cdb-input-wrapper">
                    <select
                      value={col.type}
                      onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                      className="cdb-column-select"
                    >
                      <option value="TEXT">TEXT</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="REAL">REAL</option>
                      <option value="BLOB">BLOB</option>
                    </select>
                    <small>Data Type</small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeColumn(index)}
                  className="cdb-remove-btn"
                  disabled={columns.length === 1}
                  title="Remove column"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addColumn}
            className="cdb-add-column-btn"
          >
            ➕ Add Column
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="cdb-message error-message">
            <span className="icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="cdb-message success-message">
            <span className="icon">✅</span>
            <span>{message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="cdb-submit-btn"
          disabled={loading || !tableName || columns.every(c => !c.name)}
        >
          {loading ? '⏳ Creating...' : '🚀 Create Table'}
        </button>
      </form>

      {/* Data Types Reference */}
      <div className="cdb-reference">
        <h3>📋 Data Types Reference</h3>
        <div className="cdb-types-grid">
          <div className="type-card">
            <strong>TEXT</strong>
            <p>Store text and strings</p>
            <small>Names, emails, descriptions</small>
          </div>
          <div className="type-card">
            <strong>INTEGER</strong>
            <p>Store whole numbers</p>
            <small>Age, quantity, count</small>
          </div>
          <div className="type-card">
            <strong>REAL</strong>
            <p>Store decimal numbers</p>
            <small>Price, salary, rating</small>
          </div>
          <div className="type-card">
            <strong>BLOB</strong>
            <p>Store binary data</p>
            <small>Images, files, documents</small>
          </div>
        </div>
      </div>

      {/* Example Tables */}
      <div className="cdb-examples">
        <h3>💡 Example Table Structures</h3>
        <div className="cdb-examples-grid">
          <div className="example-card">
            <h4>Students Table</h4>
            <ul>
              <li>name (TEXT)</li>
              <li>age (INTEGER)</li>
              <li>email (TEXT)</li>
              <li>gpa (REAL)</li>
            </ul>
          </div>
          <div className="example-card">
            <h4>Products Table</h4>
            <ul>
              <li>name (TEXT)</li>
              <li>price (REAL)</li>
              <li>stock (INTEGER)</li>
              <li>category (TEXT)</li>
            </ul>
          </div>
          <div className="example-card">
            <h4>Employees Table</h4>
            <ul>
              <li>name (TEXT)</li>
              <li>department (TEXT)</li>
              <li>salary (REAL)</li>
              <li>hiring_date (TEXT)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDatabase;