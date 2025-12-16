import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Supabase/supabaseClient";
import { Row, Col, Form, Button } from "react-bootstrap";
import styles from "../../css/AuthLayout.module.css";

function GoogleUserSetup() {
  const navigate = useNavigate();
  const [googleUser, setGoogleUser] = useState(null);

  const [formData, setFormData] = useState({
    phone: "",
    role: "trader",
    city: "",
    governorate: "",
    location: "",
  });

  // ✅ جلب بيانات المستخدم من auth
  useEffect(() => {
    const fetchGoogleUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting Google user:", error.message);
        return;
      }

      setGoogleUser(user);
    };

    fetchGoogleUser();
  }, []);

  // ✅ تحديث البيانات عند الكتابة
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ إرسال البيانات إلى جدول users
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!googleUser) return;

    const { error } = await supabase.from("users").upsert({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.user_metadata.full_name,
      image: googleUser.user_metadata.avatar_url,
      ...formData,
      isBlocked: false,
    });

    if (error) {
      console.error("Error updating user:", error.message);
    } else {
       sessionStorage.setItem("userID", googleUser.id);
      navigate("/Dashboard/Charts");
    }
  };

  return (
    <div
      className={styles.signupPage}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 540, padding: "32px 0" }}>
        <div
          className={styles.signupFormWrapper}
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px #0001",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <h2 className="fw-bold mb-2 text-end">أكمل بيانات حسابك</h2>
          <p
            className="text-muted mb-4 text-end"
            style={{ fontSize: "1.1rem" }}
          >
            الرجاء استكمال بياناتك لتفعيل حسابك على Marketly
          </p>
          <Form onSubmit={handleSubmit} dir="rtl">
            <Form.Group className={styles.formGroup} controlId="phone">
              <Form.Label className={styles.formLabel}>رقم الهاتف</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="رقم الهاتف"
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className={styles.formGroup} controlId="city">
              <Form.Label className={styles.formLabel}>المدينة</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="المدينة"
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className={styles.formGroup} controlId="governorate">
              <Form.Label className={styles.formLabel}>المحافظة</Form.Label>
              <Form.Control
                type="text"
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                placeholder="المحافظة"
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className={styles.formGroup} controlId="location">
              <Form.Label className={styles.formLabel}>
                العنوان التفصيلي
              </Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="العنوان التفصيلي"
                className="py-2"
                required
              />
            </Form.Group>
            <Form.Group className={styles.formGroup} controlId="role">
              <Form.Label className={styles.formLabel}>نوع الحساب</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="py-2"
                required
              >
                {/* <option value="">اختر النوع</option> */}
                <option value="trader">تاجر</option>
                {/* <option value="user">مستخدم</option> */}
              </Form.Select>
            </Form.Group>
            <Button
              type="submit"
              className="w-100 mt-2 fw-bold"
              style={{
                background: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                fontSize: "1.1rem",
                borderRadius: 8,
                padding: "0.7rem 0",
                letterSpacing: 1,
              }}
            >
              استمرار
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default GoogleUserSetup;
