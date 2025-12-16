import React, { useState } from "react";
import { Button, Container, Card, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../css/AuthLayout.module.css";
import "../../css/global.css";

const CheckDelegates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const [showError, setShowError] = useState(false);

  const handleAnswer = (hasDelegates) => {
    if (!role) {
      alert("برجاء اختيار نوع الحساب أولاً");
      return navigate("/choose-role");
    }

    if (hasDelegates) {
      navigate("/signup", {
        state: { role, hasDelegates: true },
      });
    } else {
      setShowError(true);
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
            <h2 className="fw-bold mb-3 text-center">هل لديك مناديب توزيع؟</h2>
            <p className="text-muted text-center mb-4">
              وجود مناديب شرط أساسي للتسجيل كتاجر جملة
            </p>

            {showError && (
              <Alert
                variant="danger"
                className="text-center"
                dismissible
                onClose={() => setShowError(false)}
              >
                لا يمكنك التسجيل كتاجر بدون وجود مناديب توزيع
              </Alert>
            )}

            <Row className="gy-3 mt-3">
              <Col md={6}>
                <Button
                  variant="outline-primary"
                  className="w-100 py-3 fw-bold"
                  onClick={() => handleAnswer(true)}
                  style={{
                    borderColor: "var(--primary-color)",
                    color: "var(--primary-color)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary-color-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  نعم، لدي مناديب
                </Button>
              </Col>

              <Col md={6}>
                <Button
                  variant="outline-danger"
                  className="w-100 py-3 fw-bold"
                  onClick={() => handleAnswer(false)}
                  style={{
                    borderColor: "var(--delete-color)",
                    color: "var(--delete-color)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--delete-color-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  لا، ليس لدي
                </Button>
              </Col>
            </Row>
 
                        <div className="d-flex justify-content-center my-2">
                          <div style={{ width: "100%", maxWidth: "400px" }} className="d-flex align-items-center">
                            <hr className="flex-grow-1" />
                            <span className="mx-2 text-muted">أو</span>
                            <hr className="flex-grow-1" />
                          </div>
                        </div>
                       
                        <div className="text-center">
                           <Link  to="/choose-role" className="text-decoration-none text-warning fw-bold px-1">
                العودة لاختيار نوع الحساب
                          </Link> 
                        </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CheckDelegates;