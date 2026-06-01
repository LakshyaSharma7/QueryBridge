import React, { useState, useEffect } from 'react';
import './QueryConverter.css';

const QueryConverter = () => {
  const [query, setQuery] = useState('');
  const [sql, setSql] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpData, setHelpData] = useState(null);
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetchHelpData();
  }, []);

  const fetchHelpData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/help');
      if (response.ok) {
        const data = await response.json();
        setHelpData(data);
        setSchema(data.schema);
      }
    } catch (err) {
      console.error('Help fetch error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setError('');
    setSql('');
    setResults([]);
    setAnalysis(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Query failed');
        if (data.analysis) {
          setAnalysis(data.analysis);
          setShowAnalysis(true);
        }
      } else {
        setSql(data.sql || '');
        setResults(data.results || []);
        setAnalysis(data.analysis || null);
        setShowAnalysis(true);
      }
    } catch (err) {
      setError('Server error: Make sure it is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderParseTree = (node, depth = 0) => {
    if (!node) return null;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={`${node.type}-${depth}-${Math.random()}`} className="tree-item">
        <div className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
          <span className="tree-toggle">{hasChildren ? '▼' : '•'}</span>
          <span className="tree-type">{node.type}</span>
          <span className="tree-value">{node.value}</span>
        </div>
        {hasChildren && (
          <div className="tree-children">
            {node.children.map((child, i) => (
              <div key={i}>{renderParseTree(child, depth + 1)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="qc-app">
      <div className="qc-container">
        <header className="qc-header">
          <div className="header-content">
            <h1 className="qc-title">🧠 RBNLP SQL Generator</h1>
            <p className="qc-subtitle">Rule-Based Natural Language Processing</p>
          </div>
        </header>

        <main className="qc-main">
          <section className="input-section">
            <div className="input-box">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your natural language query...

Examples:
• show lakshya
• show lakshya where gpa is 3.9
• show students where age greater than 20 group by course"
                className="query-textarea"
              />
              <div className="button-group">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? '⏳ Processing...' : '✨ Convert to SQL'}
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="btn btn-secondary"
                  type="button"
                >
                  ❓ Help
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {showHelp && (
            <HelpModal 
              helpData={helpData} 
              schema={schema} 
              onClose={() => setShowHelp(false)} 
            />
          )}

          {sql && (
            <section className="results-section">
              <div className="card sql-card">
                <div className="card-header">
                  <h3>📝 Generated SQL (via RBNLP)</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(sql)}
                    className="btn-copy"
                    title="Copy SQL"
                  >
                    📋
                  </button>
                </div>
                <pre className="sql-code">{sql}</pre>
              </div>

              {analysis && (
                <>
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="btn-toggle-analysis"
                  >
                    {showAnalysis ? '▲ Hide Analysis' : '▼ Show Analysis'}
                  </button>

                  {showAnalysis && (
                    <div className="analysis-section">
                      {/* RBNLP Info */}
                      <div className="card parser-info-card">
                        <div className="card-header">
                          <h3>🧠 RBNLP Parser Information</h3>
                        </div>
                        <div className="parser-info">
                          <div className="info-row">
                            <span className="info-label">Query Type:</span>
                            <span className="info-value">{analysis.queryType}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Table:</span>
                            <span className="info-value">{analysis.tableName || 'NOT FOUND'}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Tokens:</span>
                            <span className="info-value">{analysis.tokens.length}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Stop Words:</span>
                            <span className="info-value">{analysis.stopWords.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Parse Tree */}
                      <div className="card parse-card">
                        <div className="card-header">
                          <h3>🌳 RBNLP Parse Tree</h3>
                        </div>
                        <div className="parse-tree">
                          {analysis.parseTree ? (
                            renderParseTree(analysis.parseTree)
                          ) : (
                            <p className="no-data">No parse tree available</p>
                          )}
                        </div>
                      </div>

                      {/* Symbol Table - Always show if present */}
                      {analysis.symbolTable && analysis.symbolTable.length > 0 && (
                        <div className="card symbol-card">
                          <div className="card-header">
                            <h3>📊 Symbol Table ({analysis.symbolTable.length} symbols)</h3>
                          </div>
                          <div className="table-wrapper">
                            <table className="symbol-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Symbol</th>
                                  <th>Type</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analysis.symbolTable.map((sym, i) => (
                                  <tr key={i} className={`sym-type-${(sym.type || '').toLowerCase()}`}>
                                    <td className="line-number">{i + 1}</td>
                                    <td className="symbol-name">{sym.name}</td>
                                    <td><span className="badge">{sym.type}</span></td>
                                    <td className="symbol-val">{sym.value || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Stop Words */}
                      {analysis.stopWords && analysis.stopWords.length > 0 && (
                        <div className="card stop-words-card">
                          <div className="card-header">
                            <h3>🛑 Stop Words Detected ({analysis.stopWords.length})</h3>
                          </div>
                          <div className="stop-words-list">
                            {analysis.stopWords.map((word, i) => (
                              <span key={i} className="stop-word-badge">{word}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed Stop Words */}
                      {analysis.removedStopWords && analysis.removedStopWords.length > 0 && (
                        <div className="card removed-stop-words-card">
                          <div className="card-header">
                            <h3>🗑️ Stop Words Removed ({analysis.removedStopWords.length})</h3>
                          </div>
                          <div className="removed-stop-words-list">
                            {analysis.removedStopWords.map((word, i) => (
                              <span key={i} className="removed-stop-word-badge">{word}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* WHERE Condition */}
                      {analysis.whereCondition && (
                        <div className="card condition-card">
                          <div className="card-header">
                            <h3>📌 WHERE Condition</h3>
                          </div>
                          <div className="condition-display">
                            <code>{analysis.whereCondition}</code>
                          </div>
                        </div>
                      )}

                      {/* HAVING Condition */}
                      {analysis.havingCondition && (
                        <div className="card condition-card">
                          <div className="card-header">
                            <h3>🎯 HAVING Condition</h3>
                          </div>
                          <div className="condition-display">
                            <code>{analysis.havingCondition}</code>
                          </div>
                        </div>
                      )}

                      {/* GROUP BY */}
                      {analysis.groupByColumns && analysis.groupByColumns.length > 0 && (
                        <div className="card groupby-card">
                          <div className="card-header">
                            <h3>📂 GROUP BY Columns</h3>
                          </div>
                          <div className="groupby-list">
                            {analysis.groupByColumns.map((col, i) => (
                              <span key={i} className="groupby-badge">{col}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ORDER BY */}
                      {analysis.orderByColumns && analysis.orderByColumns.length > 0 && (
                        <div className="card orderby-card">
                          <div className="card-header">
                            <h3>↕️ ORDER BY Columns</h3>
                          </div>
                          <div className="orderby-list">
                            {analysis.orderByColumns.map((col, i) => (
                              <span key={i} className="orderby-badge">{col}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LIMIT */}
                      {analysis.limitValue && (
                        <div className="card limit-card">
                          <div className="card-header">
                            <h3>📍 Limit: {analysis.limitValue} rows</h3>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {results.length > 0 && !error && (
                <div className="card results-card">
                  <div className="card-header">
                    <h3>📊 Results ({results.length} rows)</h3>
                  </div>
                  <div className="table-wrapper">
                    <table className="results-table">
                      <thead>
                        <tr>
                          {Object.keys(results[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                            {Object.values(row).map((val, j) => (
                              <td key={j}>{String(val).substring(0, 50)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

// ================ HELP MODAL ================
const HelpModal = ({ helpData, schema, onClose }) => {
  const [activeTab, setActiveTab] = useState('BASIC_SHOW');

  if (!helpData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const queryExamples = helpData.query_examples || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🧠 RBNLP SQL Generator Help</h2>

        {/* About RBNLP */}
        <div className="help-section">
          <h3>📖 About RBNLP</h3>
          <p>{helpData.description}</p>
        </div>

        {/* Grammar Rules */}
        <div className="help-section">
          <h3>📋 Grammar Rules</h3>
          <div className="rules-grid">
            {helpData.grammar_rules && Object.entries(helpData.grammar_rules).map(([rule, data]) => (
              <div key={rule} className="rule-card">
                <div className="rule-name">{rule}</div>
                {typeof data === 'object' && (
                  <>
                    <div className="rule-keywords">{data.keywords}</div>
                    <div className="rule-desc">{data.description}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Query Examples */}
        <div className="help-section">
          <h3>📝 Query Examples</h3>
          <div className="example-tabs">
            {Object.keys(queryExamples).map((type) => (
              <button
                key={type}
                className={`example-tab-btn ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {queryExamples[activeTab] && (
            <div className="examples-display">
              <div className="example-type-title">{activeTab.replace(/_/g, ' ')}</div>
              <div className="examples-list">
                {queryExamples[activeTab].map((example, i) => (
                  <div key={i} className="example-item">
                    <code>{example}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Database Schema */}
        {schema && (
          <div className="help-section">
            <h3>📊 Database Schema</h3>
            <div className="schema-grid">
              {Object.entries(schema).map(([tableName, columns]) => (
                <div key={tableName} className="schema-card">
                  <div className="schema-table-name">{tableName}</div>
                  <ul className="schema-columns">
                    {columns.map((col) => (
                      <li key={col.name}>
                        <span className="col-name">{col.name}</span>
                        <span className="col-type">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {helpData.features && (
          <div className="help-section">
            <h3>✨ Features</h3>
            <ul className="features-list">
              {helpData.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default QueryConverter;