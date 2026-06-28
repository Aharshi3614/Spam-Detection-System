import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEntries, setNewEntries] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const previousCountRef = useRef(0);

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