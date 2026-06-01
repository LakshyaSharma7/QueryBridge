import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DatabaseList = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await fetch('http://localhost:5000/databases');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setDatabases(data);
      } catch (err) {
        setError('Failed to load databases: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  if (loading) return <p>Loading databases...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="database-list">
      <h2 className="section-title">Available Databases</h2>
      <div className="database-grid">
        {databases.length > 0 ? (
          databases.map((db) => (
            <div key={db.id} className="database-card">
              <div>
                <h3 className="database-name">{db.name}</h3>
                <p className="database-meta">
                  Last Edited: {db.lastEdit}
                </p>
              </div>
              <div>
                <button
                  className="action-button mr-2"
                  onClick={() => navigate(`/view-table/${db.name}`)}
                >
                  Open
                </button>
                <button
                  className="action-button"
                  onClick={() => navigate(`/edit-table/${db.name}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No databases available. Create one using the Create Database page.</p>
        )}
      </div>
    </div>
  );
};

export default DatabaseList;