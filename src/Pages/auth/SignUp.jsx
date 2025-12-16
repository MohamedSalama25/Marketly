import React, { useState, useEffect } from "react";
import { Form, Button, Col, Row, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { supabase } from "../../Supabase/SupabaseClient";
import { uploadImagesToSupabase } from "../../Redux/uploadingImage";
import { FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import styles from "../../css/AuthLayout.module.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../css/global.css";
import { useDispatch } from "react-redux";
import { GetToken } from "../../Redux/slices/token";

const citiesByGovernorate = [
  "الإسكندرية",
  "الإسماعيلية",
  "الأقصر",
  "البحر الأحمر",
  "البحيرة",
  "الجيزة",
  "الدقهلية",
  "السويس",
  "الشرقية",
  "الغربية",
  "الفيوم",
  "القاهرة",
  "القليوبية",
  "المنوفية",
  "المنيا",
  "الوادي الجديد",
  "بني سويف",
  "بورسعيد",
  "جنوب سيناء",
  "دمياط",
  "سوهاج",
  "شمال سيناء",
  "قنا",
  "كفر الشيخ",
  "مطروح",
  "أسوان",
  "أسيوط"
];

const SignUp = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRole, setSubmittedRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roleFromRoute = location.state?.role || "";
  useEffect(() => {
    if (!roleFromRoute) {

      navigate("/choose-role");
    }
  }, []);


  const validationSchema = Yup.object({
    name: Yup.string().required("الاسم مطلوب"),
    email: Yup.string().email("صيغة البريد غير صحيحة").required("البريد مطلوب"),
    phone: Yup.string()
      .matches(/^\d{10,15}$/, "رقم غير صالح")
      .required("رقم الهاتف مطلوب"),
    password: Yup.string().min(6, "كلمة المرور قصيرة").required("كلمة المرور مطلوبة"),
    governorate: Yup.string().required("المحافظة مطلوبة"),
    city: Yup.string().required("المدينة مطلوبة"),
    location: Yup.string().required("العنوان مطلوب"),

  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      governorate: "",
      city: "",
      location: "",
      userImage: null,
    },
    validationSchema,

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // 1. التحقق من وجود الإيميل أو رقم الهاتف بالفعل
        const { data: existingUsers, error: fetchError } = await supabase
          .from("users")
          .select("email, phone");
        if (fetchError) throw fetchError;

        const emailExists = existingUsers.some((u) => u.email === values.email);
        const phoneExists = existingUsers.some((u) => u.phone === values.phone);

        if (emailExists) {
          formik.setFieldError("email", "البريد مسجل مسبقًا");
          setIsSubmitting(false);
          return;
        }
        if (phoneExists) {
          formik.setFieldError("phone", "رقم الهاتف مستخدم من قبل");
          setIsSubmitting(false);
          return;
        }

        // 2. رفع صورة المستخدم
        let imageUrls = [];
        if (values.userImage) {
          imageUrls = await uploadImagesToSupabase(values.userImage, "users");
        }

        // 3. إنشاء مستخدم في auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // 4. إدخال باقي بيانات المستخدم في جدول users
        const newUser = {
          id: userId, // ربط المستخدم بجدول auth
          name: values.name,
          email: values.email,
          phone: values.phone,
          governorate: values.governorate,
          city: values.city,
          role: roleFromRoute,
          location: values.location,
          image: imageUrls.length > 0 ? imageUrls[0] : '',
          isBlocked: false,
          password: values.password,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert([newUser]);

        if (insertError) throw insertError;

        sessionStorage.setItem("userID", userId);
        dispatch(GetToken());

        setSubmittedRole(roleFromRoute);
        setShowSuccessModal(true);
        formik.resetForm();
        setImagePreview(null);
      } catch (error) {
        console.error("❌ خطأ في التسجيل:", error.message);
        alert("حدث خطأ أثناء التسجيل: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }

  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("userImage", [file]);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (roleFromRoute === "admin" || roleFromRoute === "trader") {
      navigate("/Dashboard/Charts");
    } else {
      navigate("/Landing");
    }
  };
  const getLocationAndSetAddress = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`,
            {
              headers: {
                "User-Agent": "wholesale-app/1.0 (wholesale@example.com)",
              },
            }
          );

          const data = await response.json();

          const fullAddress = [
            data.address.house_number,
            data.address.road,
            data.address.residential,
            data.address.neighbourhood,
            data.address.suburb,
            data.address.village,
            data.address.town,
            data.address.city,
            data.address.state_district,
            data.address.state,
            data.address.postcode,
            data.address.country,
          ]
            .filter(Boolean)
            .join(", ");

          formik.setFieldValue("location", fullAddress);
        } catch (error) {
          alert("فشل في جلب العنوان من الخدمة.");
          console.error(error);
        }
      },
      (error) => {
        alert("حدث خطأ أثناء تحديد الموقع.");
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };


  return (
    <div className={styles.signupPage}>
      <Row className="g-0 justify-content-center align-items-center min-vh-100">
        <Col md={4} className={`d-none d-md-flex align-items-center justify-content-center ${styles.signupImageSection}`}>
          <img src='src/assets/Logo/Asset 11.svg' alt="شعار" className={styles.signupSideImg} />
        </Col>

        <Col md={7}>
          <div className={styles.signupFormWrapper}>
            <h4 className="mb-3 text-end">إنشاء حساب</h4>

            <Form onSubmit={formik.handleSubmit}>
              {/* صورة المستخدم */}
              <Row className="mb-1 justify-content-center">
                <Col md={3} className="text-center">
                  <div className="position-relative d-inline-block">
                    <div
                      onClick={() => document.getElementById("userImageInput").click()}
                      className="rounded-circle overflow-hidden border border-3 mx-auto"
                      style={{
                        width: "100px",
                        height: "100px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <img
                        src={
                          imagePreview ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="user"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          opacity: 0,
                          transition: "0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                      >
                        <FaCamera size={24} />
                      </div>
                    </div>
                    <input
                      id="userImageInput"
                      name="userImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      onBlur={formik.handleBlur}
                      className="d-none"
                    />
                    {formik.touched.userImage && formik.errors.userImage && (
                      <div className="text-danger mt-2 small">
                        {formik.errors.userImage}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <Row className="g-3">
                {/* الاسم */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">الاسم الكامل</Form.Label>
                    <Form.Control
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="أدخل الاسم الكامل"
                      className="py-2"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-danger small">{formik.errors.name}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* البريد */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">البريد الإلكتروني</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="أدخل البريد الإلكتروني"
                      className="py-2"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-danger small">{formik.errors.email}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* الهاتف */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">رقم الهاتف</Form.Label>
                    <Form.Control
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="أدخل رقم الهاتف"
                      className="py-2"
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="text-danger small">{formik.errors.phone}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* كلمة المرور */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">كلمة المرور</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="أدخل كلمة المرور"
                      className="py-2"
                    />
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-danger small">{formik.errors.password}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* المحافظة */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">المحافظة</Form.Label>
                    <Form.Select
                      name="governorate"
                      value={formik.values.governorate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="py-2"
                    >
                      <option value="">اختر المحافظة</option>
                      {citiesByGovernorate.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </Form.Select>
                    {formik.touched.governorate && formik.errors.governorate && (
                      <div className="text-danger small">{formik.errors.governorate}</div>
                    )}
                  </Form.Group>
                </Col>

                {/* المدينة */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">المدينة</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="py-2"
                      placeholder="ادخل اسم المدينة"
                    />
                    {formik.touched.city && formik.errors.city && (
                      <div className="text-danger small">{formik.errors.city}</div>
                    )}
                  </Form.Group>
                </Col>


                {/* العنوان */}
                <Col md={12}>
                  <Form.Group className="position-relative">
                    <Form.Label className="fw-semibold">العنوان التفصيلي</Form.Label>
                    <div style={{ position: "relative" }}>
                      <Form.Control
                        name="location"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="الحي، الشارع، رقم المبني"
                        className="py-2 pe-5"
                      />
                      <FaMapMarkerAlt
                        onClick={getLocationAndSetAddress}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "grey",
                          fontSize: "18px",
                        }}
                        title="تحديد موقعي تلقائيًا"
                      />
                    </div>
                    {formik.touched.location && formik.errors.location && (
                      <div className="text-danger small mt-1">
                        {formik.errors.location}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* زر التسجيل */}
              <Button
                variant="primary"
                type="submit"
                className="mt-3 w-100 py-2 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التسجيل..." : "تسجيل حساب جديد"}
              </Button>

              <div className="d-flex align-items-center my-2">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">أو</span>
                <hr className="flex-grow-1" />
              </div>

              <div className="text-center">
                <span> لديك حساب بالفعل ؟</span>
                <Link to="/SigninPage" className="text-decoration-none text-warning fw-bold px-1">
                  تسجيل الدخول
                </Link>
              </div>
            </Form>

            {/* ✅ المودال بعد التسجيل */}
            <Modal show={showSuccessModal} onHide={handleModalClose} centered>
              <div className="container d-flex justify-content-between">
                <Modal.Title className="text-success p-2">تم التسجيل بنجاح!</Modal.Title>
                <Modal.Header closeButton></Modal.Header>
              </div>
              <Modal.Body className="text-center">
                <i className="fas fa-check-circle fs-1 mb-3  text-success"></i>
                <p>
                  تم إنشاء حسابك بنجاح.
                  {submittedRole === "user"
                    ? " يمكنك الآن تسجيل الدخول والبدء في استخدام الخدمة."
                    : " يمكنك الآن تسجيل الدخول للوحة التحكم."}
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleModalClose}>
                  حسناً
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignUp;