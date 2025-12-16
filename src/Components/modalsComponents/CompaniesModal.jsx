import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../css/global.css";
import PrimaryButton from "../globalComonents/PrimaryButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { createCompany } from "../../Redux/slices/CompaniesSlice";
import { uploadImagesToSupabase } from "../../Redux/uploadingImage";
import { AiOutlineClose } from "react-icons/ai";

const AddCompanyModal = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("image", file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleAddCompany = async () => {
    try {
      const imageUrls = await uploadImagesToSupabase(
        [formik.values.image],
        "companies"
      );
      const payload = {
        name: formik.values.name,
        image: imageUrls[0],
      };

      await dispatch(createCompany(payload)).unwrap();
      formik.resetForm();
      setPreviewImage(null);
      setShow(false);
    } catch (error) {
      console.error("❌ فشل في إضافة الشركة:", error.message);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("اسم الشركة مطلوب"),
    image: Yup.mixed().required("الصورة مطلوبة"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      image: null,
    },
    validationSchema,
    onSubmit: handleAddCompany,
  });

  return (
    <>
      <PrimaryButton
        label="إضافة شركة"
        icon="fa-solid fa-square-plus"
        onClick={() => setShow(true)}
      />

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between w-100" dir="rtl">
          <Modal.Title>إضافة شركة</Modal.Title>
          <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => setShow(false)} />

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

            <Button className="btn-primary w-100 mt-3" type="submit">
              تأكيد الإضافة
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddCompanyModal;
