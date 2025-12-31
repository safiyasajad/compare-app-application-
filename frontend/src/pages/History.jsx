import { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Star, Trash2, User } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);

  // Load data when page opens
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("compare_history") || "[]");
    setHistory(saved);
  }, []);

  // Clear specific item
  const deleteItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("compare_history", JSON.stringify(updated));
  };

  // Clear all
  const clearAll = () => {
    if(confirm("Are you sure you want to delete all history?")) {
      setHistory([]);
      localStorage.removeItem("compare_history");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ padding: "12px", backgroundColor: "#EFF6FF", borderRadius: "12px" }}>
            <HistoryIcon size={28} color="#2563EB" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: 0 }}>
            Search History
          </h1>
        </div>

        {history.length > 0 && (
          <button 
            onClick={clearAll}
            style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", gap: "6px", alignItems: "center" }}
          >
            <Trash2 size={16} /> Clear History
          </button>
        )}
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div style={{ border: "2px dashed #E5E7EB", borderRadius: "12px", padding: "60px", backgroundColor: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", textAlign: "center" }}>
          <Clock size={48} color="#D1D5DB" />
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>No history yet</h3>
            <p style={{ color: "#9CA3AF" }}>Generate a report and save it to see it here.</p>
          </div>
        </div>
      ) : (
        /* History List */
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {history.map((item) => (
            <div key={item.id} style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              
              {/* Left: Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{item.name}</h3>
                  {item.userRating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF3C7", padding: "2px 8px", borderRadius: "12px" }}>
                      <Star size={12} fill="#D97706" color="#D97706" />
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#D97706" }}>{item.userRating}</span>
                    </div>
                  )}
                </div>
                
                {item.affiliations && (
                   <p style={{ fontSize: "13px", color: "#6B7280", maxWidth: "500px", marginBottom: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                     {item.affiliations}
                   </p>
                )}

                {/* Metrics Summary */}
                <div style={{ display: "flex", gap: "20px" }}>
                  <MiniMetric label="H-Index" value={item.h_index} />
                  <MiniMetric label="Citations" value={item.total_c.toLocaleString()} />
                  <div style={{ fontSize: "12px", color: "#9CA3AF", alignSelf: "center" }}>
                    Saved on {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                
                {/* User Comment */}
                {item.userComment && (
                  <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#F3F4F6", borderRadius: "8px", fontSize: "13px", color: "#4B5563", fontStyle: "italic" }}>
                    "{item.userComment}"
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <button 
                onClick={() => deleteItem(item.id)}
                style={{ padding: "8px", borderRadius: "8px", border: "none", background: "white", cursor: "pointer", color: "#9CA3AF" }}
                title="Remove from history"
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper Components
function MiniMetric({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: "16px", fontWeight: "700", color: "#1F2937" }}>{value}</span>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}