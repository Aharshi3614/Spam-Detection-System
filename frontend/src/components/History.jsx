import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEntries, setNewEntries] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const previousCountRef = useRef(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const newData = response.data.data || [];
            const oldCount = previousCountRef.current;
            
            if (oldCount > 0 && newData.length > oldCount) {
                setNewEntries(newData.length - oldCount);
            }
            
            setHistory(newData);
            previousCountRef.current = newData.length;
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchHistory();
        
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            fetchHistory();
        }, 30000); // 30 seconds
        
        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Clear new entries count when user interacts
    const clearNewEntries = () => {
        setNewEntries(0);
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>📜 History</h2>
                <div className="history-controls">
                    {newEntries > 0 && (
                        <span className="new-entries-badge">
                            {newEntries} new {newEntries === 1 ? 'entry' : 'entries'}
                        </span>
                    )}
                    <label className="auto-refresh-toggle">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={() => setAutoRefresh(!autoRefresh)}
                        />
                        Auto-refresh
                    </label>
                </div>
            </div>

            {/* History list */}
            {loading ? (
                <p>Loading history...</p>
            ) : history.length === 0 ? (
                <p>No history found.</p>
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb', marginTop: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '20px' }}>No scan history yet</h3>
                    <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>It looks like you haven't scanned any messages or emails.</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#2563eb'}
                        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="history-list" onClick={clearNewEntries}>
                    {history.map(item => (
                        <div key={item._id} className="history-item">
                            {/* ... existing history item content ... */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;