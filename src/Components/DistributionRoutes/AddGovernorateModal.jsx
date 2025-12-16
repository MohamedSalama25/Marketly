// ✅ AddGovernorateModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../Redux/slices/Users";
import { useFormik } from "formik";
import * as Yup from "yup";
import PrimaryButton from "../globalComonents/PrimaryButton";

/* 🗺️ المحافظات */
const citiesByGovernorate = [
  "الإسكندرية", "الإسماعيلية", "الأقصر", "البحر الأحمر", "البحيرة", "الجيزة", "الدقهلية",
  "السويس", "الشرقية", "الغربية", "الفيوم", "القاهرة", "القليوبية", "المنوفية", "المنيا",
  "الوادي الجديد", "بني سويف", "بورسعيد", "جنوب سيناء", "دمياط", "سوهاج", "شمال سيناء",
  "قنا", "كفر الشيخ", "مطروح", "أسوان", "أسيوط"
];

const AddGovernorateModal = () => {
  const dispatch = useDispatch();
  const { token: userId } = useSelector((state) => state.Token);
  const user = useSelector((state) =>
    state.Users?.users?.find((u) => u.id === userId)
  );

  const [selectedGov, setSelectedGov] = useState("");
  const [show, setShow] = useState(false);

  const formik = useFormik({
    initialValues: {
      governorates: [],
    },
    validationSchema: Yup.object({
      governorates: Yup.array()
        .min(1, "يجب اختيار محافظة واحدة على الأقل")
        .of(Yup.string()),
    }),
    onSubmit: async (values) => {
      try {
        const routesAsString = values.governorates.join(",");
        await dispatch(updateUser({
          id: userId,
          updatedData: { routes: routesAsString },
        })).unwrap();
        handleClose();
      } catch (err) {
        console.log(err);
      }
    },
  });

  useEffect(() => {
    if (show && user?.routes) {
      const existing = typeof user.routes === "string"
        ? user.routes.split(",").filter(Boolean)
        : [];
      formik.setFieldValue("governorates", existing);
    }
  }, [show, user]);

  const handleAddGov = () => {
    if (!selectedGov) {
      formik.setFieldError("governorates", "اختر محافظة لإضافتها");
      return;
    }

    if (formik.values.governorates.includes(selectedGov)) {
      formik.setFieldError("governorates", "المحافظة مضافة بالفعل");
      return;
    }

    const updated = [...formik.values.governorates, selectedGov];
    formik.setFieldValue("governorates", updated);
    setSelectedGov("");
    formik.setFieldError("governorates", "");
  };

  const removeGov = (gov) => {
    const updated = formik.values.governorates.filter(g => g !== gov);
    formik.setFieldValue("governorates", updated);
  };

  const handleClose = () => {
    setSelectedGov("");
    formik.resetForm();
    setShow(false);
  };

  return (
    <>
    
      <PrimaryButton label="محافظات التوزيع" icon="fa-solid fa-map-location-dot" onClick={() => setShow(true)} />
      {/* <Button onClick={() => setShow(true)} className="mb-3">
        محافظات التوزيع
      </Button> */}

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header >
          <Modal.Title>تحديد المحافظات</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate onSubmit={formik.handleSubmit}>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>اختر محافظة</Form.Label>
                <Form.Select
                  value={selectedGov}
                  onChange={(e) => setSelectedGov(e.target.value)}
                >
                  <option value="">-- اختر محافظة --</option>
                  {citiesByGovernorate.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </Form.Select>
                {formik.errors.governorates && (
                  <div className="text-danger mt-1">{formik.errors.governorates}</div>
                )}
              </Col>

              <Col md={12} className="mb-3">
                <Button variant="secondary" onClick={handleAddGov}>
                  إضافة
                </Button>
              </Col>

              <Col md={12} className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                  {formik.values.governorates.map((gov, idx) => (
                    <Badge
                      key={idx}
                      bg="primary"
                      pill
                      style={{ cursor: "pointer" }}
                      onClick={() => removeGov(gov)}
                      title="اضغط لإزالة"
                    >
                      {gov} ×
                    </Badge>
                  ))}
                </div>
              </Col>

              <Col md={12} className="d-flex justify-content-between">
                <Button variant="danger" onClick={handleClose}>
                  إلغاء
                </Button>
                <Button type="submit" className="btn btn-primary">
                  حفظ
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddGovernorateModal;
