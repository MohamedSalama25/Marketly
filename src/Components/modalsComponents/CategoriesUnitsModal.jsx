import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { uploadImagesToSupabase } from "../../Redux/uploadingImage";
import { AddCategory } from "../../Redux/slices/Categories";
import { AddUnit } from "../../Redux/slices/units";
import { AiOutlineClose } from "react-icons/ai";

const CategoriesUnitsModal = ({ type, onAdd }) => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCategory = type === "categories";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isCategory) {
        let imageUrl = null;
        if (image) {
          const urls = await uploadImagesToSupabase([image], "categories");
          imageUrl = urls[0];
          // تحقق من الرابط واطبعه
          if (
            !imageUrl ||
            !imageUrl.includes("/storage/v1/object/public/categories/")
          ) {
            alert(
              "⚠️ هناك مشكلة في رفع الصورة أو في اسم الباكت. تحقق من اسم الباكت في supabase."
            );
            console.log("[DEBUG] imageUrl:", imageUrl);
            setLoading(false);
            return;
          }
        }
        await dispatch(AddCategory({ name, img: imageUrl })).unwrap();
      } else {
        await dispatch(AddUnit({ name })).unwrap();
      }
      setName("");
      setImage(null);
      setPreviewImage(null);
      setShow(false);
      if (onAdd) onAdd();
    } catch (err) {
      alert(err+"حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="btn btn-primary" onClick={() => setShow(true)}>
        {isCategory ? "إضافة صنف" : "إضافة وحدة"}
      </Button>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between w-100" dir="rtl">
          <Modal.Title>{isCategory ? "إضافة تصنيف" : "إضافة وحدة"}</Modal.Title>

         <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => setShow(false)} />

             
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>الاسم</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={isCategory ? "اسم الصنف" : "اسم الوحدة"}
              />
            </Form.Group>
            {isCategory && (
              <Form.Group className="mb-3">
                <Form.Label>صورة الصنف</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
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
              </Form.Group>
            )}
            <Button
              className="btn-primary w-100 mt-3"
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "تأكيد الإضافة"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CategoriesUnitsModal;
