import React from 'react';

const ResultDisplay = ({ sql, error, result }) => {
  if (!sql && !error && !result) return null;

  return (
    <div className="result-display">
      {error && <p className="error-message">{error}</p>}

      {sql && (
        <div className="sql-output">
          <h3 className="sql-output-title">Generated SQL:</h3>
          <pre className="sql-code">{sql}</pre>
        </div>
      )}

      {result && result.length > 0 && (
        <div className="result-output">
          <h3 className="result-output-title">Results:</h3>
          <pre className="result-code">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;