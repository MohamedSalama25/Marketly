import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import styles from "../../css/AuthLayout.module.css";
import "../../css/global.css";

const ChooseRole = () => {
  const navigate = useNavigate();
const handleSelect = (role) => {
  if (role === "trader") {
    navigate("/check-delegates", { state: { role } });
  } else if (role === "user") {
    navigate("/upload-shop-image", { state: { role } });
  }
};


  return (
    <div className={styles.signupPage}>
      <Row className="g-0 justify-content-center align-items-center min-vh-100">
        <Col
          md={4}
          className={`d-none d-md-flex align-items-center justify-content-center rounded-3 ${styles.signupImageSection}`}
        >
          <img src='/Logo/Asset 11.svg' alt="شعار" className={styles.signupSideImg} />
        </Col>

        <Col md={7}>
          <div className={styles.signupFormWrapper}>
            <h3 className="mb-5 text-center">اختر نوع الحساب</h3>
            
            <Row className="gy-4 justify-content-center">
              <Col md={8}>
                <Button
                  variant="outline-primary"
                  className="w-100 py-3 fw-bold"
                  onClick={() => handleSelect("user")}
                  style={{
                    borderColor: "var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary-color-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  صاحب متجر
                </Button>
              </Col>
              
              <Col md={8}>
                <Button
                  variant="primary"
                  className="w-100 py-3 fw-bold"
                  onClick={() => handleSelect("trader")}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--primary-color)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = "1";
                  }}
                >
                  تاجر جملة
                </Button>
              </Col>
            </Row>

             <div className="d-flex justify-content-center my-2">
              <div style={{ width: "75%", maxWidth: "400px" }} className="d-flex align-items-center">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">أو</span>
                <hr className="flex-grow-1" />
              </div>
            </div>
           
            <div className="text-center">
              <span> لديك حساب بالفعل ؟</span>
              <Link to="/SigninPage" className="text-decoration-none text-warning fw-bold px-1">
                تسجيل الدخول
              </Link> 
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ChooseRole;