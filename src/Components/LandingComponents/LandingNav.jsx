import React from "react";
import { useDispatch } from "react-redux";
import { clearAuthData } from "../../Redux/slices/token";
import { FaRocket } from "react-icons/fa";
import "./nav.css";
import { Link, useNavigate } from "react-router-dom";


const LandingNavbar = ({ token }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthData());
    sessionStorage.removeItem("userID");
    navigate("/");
  };

   const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-5 py-3">
      <div className="container">
        <a
          className="navbar-brand fw-bolder"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src="Logo/Asset 1.svg"
           alt="Marketly Logo"
           style={{ width: "100px", height: "auto" }} />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav me-4">

            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={() => scrollToSection("download-section")}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                حمل التطبيق
              </button>
            </li>
             <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={() => scrollToSection("companies-section")}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                شركاؤنا
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={() => scrollToSection("faq-section")}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                الأسئلة الشائعة
              </button>
            </li>
           
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={() => scrollToSection("testimonials-section")}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                آراء عملائنا
              </button>
            </li>
            
          </ul>

          {!token ? (
           <Link
  to="/SigninPage"
  className="btn btn-primary btn-cta px-4 py-2 d-flex align-items-center gap-2 fw-bold"
>
  <FaRocket />
  تسجيل الدخول
</Link>
          ) : (
            <button
              className="btn btn-primary btn-cta px-4 py-2 d-flex align-items-center gap-2 fw-bold"
              onClick={handleLogout}
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;