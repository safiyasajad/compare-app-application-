import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, History, BarChart2 } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F9FAFB", // Light gray background for the whole app
      display: "flex", 
      flexDirection: "column",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif" // Cleaner font stack
    }}>
      
      {/* TOP NAVIGATION BAR - FULL WIDTH */}
      <div style={{ 
        backgroundColor: "white", 
        borderBottom: "1px solid #E5E7EB", 
        height: "64px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
        padding: "0 24px", // Side padding
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ 
          fontSize: "20px", 
          fontWeight: "700", 
          color: "#111827", 
          textDecoration: "none", 
          display: "flex", 
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{ width: "24px", height: "24px", background: "#2563EB", borderRadius: "6px" }}></div>
          ComPARE
        </Link>
        
        {/* Navigation Links */}
        <nav style={{ display: "flex", gap: "8px" }}>
          <NavItem to="/generate" icon={<FileText size={18} />} label="Generate Report" active={location.pathname === "/generate"} />
          <NavItem to="/history" icon={<History size={18} />} label="History" active={location.pathname === "/history"} />
          <NavItem to="/analyze" icon={<BarChart2 size={18} />} label="Analyze" active={location.pathname === "/analyze"} />
        </nav>
      </div>

      {/* MAIN CONTENT AREA - WIDE BUT CENTERED */}
      <div style={{ 
        flex: 1, 
        width: "100%", 
        maxWidth: "1280px", // Wider standard for laptops
        margin: "0 auto", 
        padding: "32px 24px" // Breathing room
      }}>
        <Outlet />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link 
      to={to} 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        textDecoration: "none", 
        color: active ? "#2563EB" : "#6B7280",
        fontWeight: active ? "600" : "500",
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: active ? "#EFF6FF" : "transparent",
        transition: "all 0.2s"
      }}
    >
      {icon}
      {label}
    </Link>
  );
}