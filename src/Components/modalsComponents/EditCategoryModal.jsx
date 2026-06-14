import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { uploadImagesToSupabase } from "../../Redux/uploadingImage";
import { UpdateCategory } from "../../Redux/slices/Categories";

const imageBoxStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "14px",
  border: "1px solid var(--border-color)",
  objectFit: "cover",
  backgroundColor: "#f8f9fa",
};

const EditCategoryModal = ({ show, category, onHide, onUpdated }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show || !category) return;

    setName(category.name || "");
    setImage(null);
    setPreviewImage(category.img || "");
    setError("");
  }, [category, show]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : category?.img || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("اسم الصنف مطلوب");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatedData = { name: trimmedName };

      if (image) {
        const urls = await uploadImagesToSupabase([image], "categories");
        updatedData.img = urls[0];
      }

      await dispatch(
        UpdateCategory({ id: category.id, updatedData })
      ).unwrap();

      if (onUpdated) onUpdated();
      onHide();
    } catch (err) {
      setError(err?.message || err || "حدث خطأ أثناء تعديل الصنف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={loading ? undefined : onHide} centered dir="rtl">
      <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between w-100">
        <Modal.Title>تعديل الصنف</Modal.Title>
        <button
          className="fa-solid fa-close border-0 bg-transparent CloseModalBtn"
          onClick={onHide}
          disabled={loading}
          type="button"
        />
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            {previewImage ? (
              <img src={previewImage} alt={name || "صورة الصنف"} style={imageBoxStyle} />
            ) : (
              <div
                style={imageBoxStyle}
                className="d-flex align-items-center justify-content-center text-muted"
              >
                لا توجد صورة
              </div>
            )}
            <div className="flex-grow-1">
              <Form.Label>صورة الصنف</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <small className="text-muted d-block mt-2">
                اتركها كما هي لو مش عايز تغير الصورة الحالية.
              </small>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>اسم الصنف</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسم الصنف"
              disabled={loading}
              required
            />
          </Form.Group>

          <div className="d-flex gap-2 mt-4">
            <Button className="btn-primary flex-grow-1" type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التعديل"}
            </Button>
            <Button variant="light" type="button" onClick={onHide} disabled={loading}>
              إلغاء
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditCategoryModal;
