import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { uploadImagesToSupabase } from "../../Redux/uploadingImage";
import { updateCompany } from "../../Redux/slices/CompaniesSlice";

const EditCompaniesModal = ({ company, show, setShow }) => {
  const dispatch = useDispatch();
  const [previewImage, setPreviewImage] = useState(company?.image || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("image", file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleEditCompany = async () => {
    try {
      let imageUrl = company.image;
      if (formik.values.image && formik.values.image !== company.image) {
        const imageUrls = await uploadImagesToSupabase(
          [formik.values.image],
          "companies"
        );
        imageUrl = imageUrls[0];
      }
      const payload = {
        name: formik.values.name,
        image: imageUrl,
      };
      await dispatch(
        updateCompany({ id: company.id, updatedData: payload })
      ).unwrap();
      setShow(false);
    } catch (error) {
      console.error("❌ فشل في تعديل الشركة:", error.message);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("اسم الشركة مطلوب"),
    image: Yup.mixed().required("الصورة مطلوبة"),
  });

  const formik = useFormik({
    initialValues: {
      name: company?.name || "",
      image: company?.image || null,
    },
    validationSchema,
    onSubmit: handleEditCompany,
    enableReinitialize: true,
  });

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <div className="w-100 d-flex align-items-center justify-content-between">
          <Modal.Title>تعديل الشركة</Modal.Title>
          <button
            className="fa-solid fa-close border-0 bg-transparent"
            onClick={() => setShow(false)}
          />
        </div>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form noValidate onSubmit={formik.handleSubmit}>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>اسم الشركة</Form.Label>
                <Form.Control
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type="text"
                  placeholder="ادخل اسم الشركة"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-danger">{formik.errors.name}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>شعار الشركة</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.image && formik.errors.image && (
                  <div className="text-danger">{formik.errors.image}</div>
                )}
              </Form.Group>
              {previewImage && (
                <div className="mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Button className="btn-warning w-100 mt-3" type="submit">
            حفظ التعديل
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditCompaniesModal;
