import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeProfile } from '../api';
import { 
  Search, Bookmark, Star, X, Check, 
  TrendingUp, Users, Award, Zap, FileText, Hash, HelpCircle 
} from 'lucide-react';

export default function GenerateReport() {
  const [url, setUrl] = useState("");
  
  // --- MEMORY STATE ---
  const [reportData, setReportData] = useState(() => {
    const saved = sessionStorage.getItem("current_report");
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Analysis API Hook
  const mutation = useMutation({
    mutationFn: (link) => analyzeProfile(link, true), 
    onMutate: () => {
      setProgress(0);
      setReportData(null); 
    },
    onSuccess: (data) => {
      setProgress(100);
      setTimeout(() => {
        setReportData(data);
        sessionStorage.setItem("current_report", JSON.stringify(data));
        setIsSaved(false);
        setRating(0);
        setComment("");
        setProgress(0); 
      }, 500);
    },
    onError: () => setProgress(0)
  });

  // Progress Timer
  useEffect(() => {
    let interval;
    if (mutation.isPending) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 60 ? 2 : 0.5;
          return Math.min(prev + increment, 90);
        });
      }, 100); 
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [mutation.isPending]);

  // Handle Save
  const handleConfirmSave = () => {
    if (!reportData) return;
    const newEntry = {
      id: reportData.profile.id,
      name: reportData.profile.name,
      total_c: reportData.metrics.total_c,
      h_index: reportData.metrics.h_index,
      affiliations: reportData.profile.affiliations,
      userRating: rating,
      userComment: comment,
      date: new Date().toISOString()
    };
    const existingHistory = JSON.parse(localStorage.getItem("compare_history") || "[]");
    const updatedHistory = [newEntry, ...existingHistory.filter(h => h.id !== newEntry.id)];
    localStorage.setItem("compare_history", JSON.stringify(updatedHistory));
    setIsModalOpen(false);
    setIsSaved(true);
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {/* --- 1. SEARCH BAR --- */}
      <div style={{ 
        backgroundColor: "white", padding: "12px", borderRadius: "12px", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F3F4F6",
        display: "flex", gap: "12px", marginBottom: "40px", position: "sticky", top: "20px", zIndex: 50,
        alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <Search size={20} style={{ position: "absolute", left: "16px", color: "#9CA3AF" }} />
          <input 
            type="text" placeholder="Paste Google Scholar URL..." 
            value={url} onChange={(e) => setUrl(e.target.value)} disabled={mutation.isPending}
            style={{ 
              width: "100%", height: "48px", padding: "0 16px 0 48px", 
              borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none", 
              fontSize: "16px", color: "#111827", backgroundColor: "#F9FAFB"
            }}
          />
        </div>
        <button 
          onClick={() => mutation.mutate(url)} disabled={mutation.isPending || !url.trim()}
          style={{ 
            height: "48px", padding: "0 24px", whiteSpace: "nowrap",
            borderRadius: "8px", backgroundColor: "#2563EB", color: "white", 
            border: "none", cursor: mutation.isPending ? "not-allowed" : "pointer", 
            fontWeight: "600", fontSize: "15px", minWidth: "140px"
          }}
        >
          {mutation.isPending ? "Scanning..." : "Generate Report"}
        </button>
      </div>

      {mutation.isPending && (
        <div style={{ width: "100%", height: "4px", backgroundColor: "#E5E7EB", borderRadius: "2px", overflow: "hidden", marginBottom: "40px" }}>
          <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#2563EB", transition: "width 0.2s ease-out" }} />
        </div>
      )}

      {/* --- 2. REPORT DASHBOARD --- */}
      {reportData && !mutation.isPending && (
        <div className="animate-fade-in">
          
          {/* HEADER SECTION */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>{reportData.profile.name}</h1>
              <p style={{ fontSize: "16px", color: "#6B7280", maxWidth: "800px" }}>{reportData.profile.affiliations || "No affiliation listed"}</p>
              
              {/* ACADEMIC AGE BADGE */}
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", alignItems: "center" }}>
                <span style={{ 
                  backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", 
                  borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" 
                }}>
                  <Award size={14} /> Academic Age: {reportData.profile.academic_age} Years
                </span>
                <span style={{ fontSize: "13px", color: "#9CA3AF" }}>ID: {reportData.profile.id}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)} disabled={isSaved}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "white", color: isSaved ? "#166534" : "#374151", fontWeight: "600", cursor: "pointer" }}
            >
              {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>

          {/* METRICS ROW 1: REORDERED (Papers -> Citations -> Recent Papers) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            {/* 1. Total Papers */}
            <HeroCard 
              label="Total Papers" 
              value={reportData.metrics.total_p} 
              icon={<FileText size={24} color="#059669" />} 
              sub="Lifetime publications" 
              color="#ECFDF5"
              tooltip="Total number of publications found on this Google Scholar profile."
            />
            {/* 2. Total Citations (FIXED: Uses recent_citations) */}
            <HeroCard 
            label="Total Citations" 
            value={reportData.metrics.total_c.toLocaleString()} 
            icon={<TrendingUp size={24} color="#2563EB" />} 
            sub={`+${reportData.metrics.recent_c || 0} in last 5y`} 
            color="#EFF6FF"
            tooltip="Total citations (All time) vs Citations received in the last 5 years."
            />
            {/* 3. Recent Papers */}
            <HeroCard 
              label="Recent Papers" 
              value={reportData.metrics.recent_p} 
              icon={<Zap size={24} color="#D97706" />} 
              sub="Published in last 5 years" 
              color="#FEF3C7"
              tooltip="Number of papers published in the last 5 calendar years."
            />
          </div>

          {/* METRICS ROW 2: Indices & Health */}
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "16px", marginTop: "30px" }}>Impact & Integrity Indices</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "60px" }}>
            <DetailCard label="H-Index" value={reportData.metrics.h_index} icon={<Hash size={20} color="#7C3AED"/>} tooltip="The researcher has H papers that have each been cited at least H times." />
            <DetailCard label="i10-Index" value={reportData.metrics.i10_index} icon={<Hash size={20} color="#7C3AED"/>} tooltip="Number of publications with at least 10 citations." />
            <DetailCard label="g-Index" value={reportData.metrics.g_index} icon={<Hash size={20} color="#7C3AED"/>} tooltip="A score where the top G papers have at least G² citations combined." />
            
            <DetailCard label="Avg Cits/Paper" value={reportData.metrics.cpp} icon={<TrendingUp size={20} color="#6B7280"/>} tooltip="Total Citations divided by Total Papers." />
            <DetailCard label="Network Size" value={reportData.metrics.network_size} icon={<Users size={20} color="#EA580C"/>} sub="Co-authors" tooltip="Total number of unique co-authors across all publications." />
            <DetailCard label="Leadership" value={`${reportData.metrics.leadership_score}%`} icon={<Award size={20} color="#D97706"/>} sub="1st/Solo Auth" tooltip="% of papers where the researcher is the First or Solo author." />
            <DetailCard label="One-Hit Wonder" value={`${reportData.metrics.one_hit}%`} icon={<Zap size={20} color="#EF4444"/>} sub="Top paper dep." tooltip="% of total citations that come from the single most cited paper." />
          </div>

          {/* --- PUBLICATIONS TABLE --- */}
          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "40px" }}>
             <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", marginBottom: "24px" }}>Publications Analysis</h3>
             <PublicationsTable papers={reportData.papers || []} />
          </div>

        </div>
      )}

      {/* SAVE MODAL (Unchanged) */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "16px", width: "450px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Save to History</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
             </div>
             <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
               {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={32} fill={(hoverRating || rating) >= star ? "#FBBF24" : "none"} color={(hoverRating || rating) >= star ? "#FBBF24" : "#D1D5DB"} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ cursor: "pointer" }} />
               ))}
             </div>
             <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Note..." style={{ width: "100%", height: "80px", marginBottom: "20px", padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
             <div style={{ display: "flex", gap: "10px" }}>
               <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "white" }}>Cancel</button>
               <button onClick={handleConfirmSave} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#2563EB", color: "white", border: "none" }}>Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PublicationsTable({ papers }) {
  const [filterVenue, setFilterVenue] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [filterVenue]);

  const venueStats = useMemo(() => {
    const counts = {};
    papers.forEach(p => {
      const v = p.venue || "Unknown";
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
  }, [papers]);

  const filteredPapers = useMemo(() => {
    if (!filterVenue) return papers;
    return papers.filter(p => (p.venue || "Unknown") === filterVenue);
  }, [papers, filterVenue]);

  const displayedPapers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPapers.slice(start, start + itemsPerPage);
  }, [filteredPapers, currentPage]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexDirection: "row" }}>
      <div style={{ width: "250px", flexShrink: 0 }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>Refine by Venue</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => setFilterVenue(null)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", border: "none", backgroundColor: filterVenue === null ? "#EFF6FF" : "white", color: filterVenue === null ? "#2563EB" : "#4B5563", display: "flex", justifyContent: "space-between" }}>
            <span>All Publications</span><span style={{ color: "#9CA3AF", fontSize: "12px" }}>{papers.length}</span>
          </button>
          {venueStats.map((venue) => (
            <button key={venue.name} onClick={() => setFilterVenue(venue.name)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", border: "none", backgroundColor: filterVenue === venue.name ? "#EFF6FF" : "white", color: filterVenue === venue.name ? "#2563EB" : "#4B5563", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }} title={venue.name}>{venue.name}</span>
              <span style={{ backgroundColor: "#F3F4F6", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", color: "#6B7280" }}>{venue.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead style={{ backgroundColor: "#F9FAFB" }}>
              <tr style={{ borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "#6B7280", fontWeight: "600", width: "50%" }}>Title</th>
                <th style={{ padding: "16px", color: "#6B7280", fontWeight: "600" }}>Rank</th>
                <th style={{ padding: "16px", color: "#6B7280", fontWeight: "600" }}>Pos</th>
                <th style={{ padding: "16px", color: "#6B7280", fontWeight: "600", textAlign: "right" }}>Citations</th>
              </tr>
            </thead>
            <tbody>
              {displayedPapers.map((paper, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6", height: "64px" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "#111827", marginBottom: "4px", lineHeight: "1.4" }}>{paper.title}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280" }}>{paper.year} • {paper.venue || "Unknown"}</div>
                  </td>
                  <td style={{ padding: "16px" }}>{paper.rank ? <span style={{ backgroundColor: paper.rank.includes("A*") || paper.rank.includes("Q1") ? "#DCFCE7" : "#FEF3C7", color: paper.rank.includes("A*") || paper.rank.includes("Q1") ? "#166534" : "#D97706", padding: "4px 8px", borderRadius: "4px", fontWeight: "700", fontSize: "12px" }}>{paper.rank}</span> : <span style={{ color: "#D1D5DB" }}>-</span>}</td>
                  <td style={{ padding: "16px" }}><span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", backgroundColor: paper.author_pos === "1st" ? "#EFF6FF" : "transparent", color: paper.author_pos === "1st" ? "#2563EB" : "#9CA3AF" }}>{paper.author_pos || "Middle"}</span></td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "#111827" }}>{paper.citations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination UI */}
        {filteredPapers.length > itemsPerPage && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "0 10px" }}>
            <div style={{ fontSize: "13px", color: "#6B7280" }}>
              Showing <span style={{ fontWeight: "600", color: "#111" }}>{((currentPage - 1) * itemsPerPage) + 1}</span> to <span style={{ fontWeight: "600", color: "#111" }}>{Math.min(currentPage * itemsPerPage, filteredPapers.length)}</span> of {filteredPapers.length} results
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #E5E7EB", backgroundColor: currentPage === 1 ? "#F9FAFB" : "white", color: currentPage === 1 ? "#D1D5DB" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "500" }}>Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #E5E7EB", backgroundColor: currentPage === totalPages ? "#F9FAFB" : "white", color: currentPage === totalPages ? "#D1D5DB" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "500" }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- UPDATED CARD COMPONENTS WITH TOOLTIPS ---
function HeroCard({ label, value, icon, sub, color, tooltip }) {
  return (
    <div style={{ 
      backgroundColor: "white", padding: "24px", borderRadius: "16px", 
      border: "1px solid #E5E7EB", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", 
      display: "flex", flexDirection: "column", gap: "12px",
      position: "relative" // Critical for tooltip positioning
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>{label}</span>
          
          {/* CUSTOM HOVER TOOLTIP */}
          {tooltip && (
            <div className="group" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <HelpCircle size={14} color="#9CA3AF" style={{ cursor: "help" }} />
              <div style={{ 
                visibility: "hidden", position: "absolute", bottom: "100%", left: "50%", 
                transform: "translateX(-50%)", marginBottom: "8px", width: "200px", 
                backgroundColor: "#1F2937", color: "white", padding: "8px 12px", 
                borderRadius: "6px", fontSize: "12px", lineHeight: "1.4", textAlign: "center", 
                zIndex: 100, pointerEvents: "none", opacity: 0, transition: "opacity 0.2s"
              }} className="tooltip-content">
                {tooltip}
                {/* Little arrow */}
                <div style={{ position: "absolute", top: "100%", left: "50%", marginLeft: "-5px", borderWidth: "5px", borderStyle: "solid", borderColor: "#1F2937 transparent transparent transparent" }}></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: color }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: "36px", fontWeight: "800", color: "#111827" }}>{value}</div>
        {sub && <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>{sub}</div>}
      </div>
      
      {/* Global Style for Hover Effect */}
      <style>{`
        .group:hover .tooltip-content { visibility: visible !important; opacity: 1 !important; }
      `}</style>
    </div>
  );
}

function DetailCard({ label, value, icon, sub, tooltip }) {
  return (
    <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
      <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "#F9FAFB", color: "#6B7280" }}>{icon}</div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "500" }}>{label}</div>
          {/* CUSTOM HOVER TOOLTIP */}
          {tooltip && (
            <div className="group" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <HelpCircle size={12} color="#D1D5DB" style={{ cursor: "help" }} />
              <div style={{ 
                visibility: "hidden", position: "absolute", bottom: "100%", left: "50%", 
                transform: "translateX(-50%)", marginBottom: "8px", width: "180px", 
                backgroundColor: "#1F2937", color: "white", padding: "8px 12px", 
                borderRadius: "6px", fontSize: "12px", lineHeight: "1.4", textAlign: "center", 
                zIndex: 100, pointerEvents: "none", opacity: 0, transition: "opacity 0.2s"
              }} className="tooltip-content">
                {tooltip}
                <div style={{ position: "absolute", top: "100%", left: "50%", marginLeft: "-5px", borderWidth: "5px", borderStyle: "solid", borderColor: "#1F2937 transparent transparent transparent" }}></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>{value}</div>
        {sub && <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{sub}</div>}
      </div>
    </div>
  );
}