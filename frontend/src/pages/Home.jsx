import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      {/* Hero Section */}
      <h1 style={{ fontSize: "60px", fontWeight: "800", color: "#111827", marginBottom: "20px", lineHeight: "1.1" }}>
        ComPARE <span style={{ color: "#2563EB" }}>Intelligence</span>
      </h1>
      
      <p style={{ fontSize: "20px", color: "#6B7280", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: "1.6" }}>
        The advanced profiling tool for academic researchers. 
        Evaluate publication quality, track metrics, and analyze impact in seconds.
      </p>

      {/* Big Call to Action Button */}
      <Link to="/generate" style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "10px", 
        backgroundColor: "#2563EB", 
        color: "white", 
        padding: "16px 32px", 
        borderRadius: "50px", 
        fontSize: "18px", 
        fontWeight: "600", 
        textDecoration: "none",
        boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)"
      }}>
        Get Started <ArrowRight size={20} />
      </Link>

      {/* Decorative Stats or Features (Optional visual fluff) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "60px", marginTop: "80px", borderTop: "1px solid #E5E7EB", paddingTop: "40px" }}>
        <div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#111" }}>FAST</div>
          <div style={{ color: "#666" }}>Instant Analysis</div>
        </div>
        <div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#111" }}>ACCURATE</div>
          <div style={{ color: "#666" }}>Google Scholar Data</div>
        </div>
        <div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#111" }}>SMART</div>
          <div style={{ color: "#666" }}>Metric Calculations</div>
        </div>
      </div>
    </div>
  );
}