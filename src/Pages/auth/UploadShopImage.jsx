import React, { useState } from "react";
import { Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "../../css/AuthLayout.module.css";
import "../../css/global.css";

const UploadShopImage = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "user";

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleContinue = () => {
    navigate("/signup", { state: { role, image } });
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
            <h3 className="mb-5 text-center">صورة المتجر (اختياري)</h3>
            
            {image && (
              <div className="d-flex justify-content-center mb-4">
                <Image 
                  src={image} 
                  alt="Shop Preview" 
                  fluid 
                  style={{ maxHeight: "200px", borderRadius: "8px" }} 
                />
              </div>
            )}

            <Row className="gy-4 justify-content-center">
              <Col md={8}>
                <label 
                  className="w-100 py-3 fw-bold d-flex justify-content-center align-items-center"
                  style={{
                    border: "2px dashed var(--primary-color)",
                    color: "var(--primary-color)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary-color-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  اختر صورة المتجر
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </Col>
              
              <Col md={8} className="d-flex gap-3">
                <Button
                  variant="primary"
                  className="w-100 py-3 fw-bold"
                  onClick={handleContinue}
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
                  المتابعة
                </Button>
                
                <Button
                  variant="outline-primary"
                  className="w-100 py-3 fw-bold"
                  onClick={handleContinue}
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
                  تخطي
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
            <div className="text-center mt-4">
              <Link to="/choose-role" className="text-decoration-none text-warning fw-bold px-1">
                العودة للخلف
              </Link> 
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default UploadShopImage;