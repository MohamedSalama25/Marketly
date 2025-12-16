import React, { useEffect, useState } from "react";
import "../../css/Table.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from "../../Redux/slices/testimonialsSlice";
import Loading from "../globalComonents/loading";
import CustomMenu from "../globalComonents/CustomMenu";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import NotificationModal from "../modalsComponents/NotificationModal";

const MAX_FEEDBACK_LENGTH = 40;

const TestimonialsTbl = () => {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.Testimonials);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTestimonials, setCurrentTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    confirmText: "نشر",
    confirmClass: "btn-success",
    onConfirm: () => {},
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const handleSelectAll = (e) => {
    const pageIds = currentTestimonials.map((t) => t.id);
    setSelectedIds((prev) =>
      e.target.checked
        ? [...new Set([...prev, ...pageIds])]
        : prev.filter((id) => !pageIds.includes(id))
    );
  };
  const handleSelectRow = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) {
      dispatch(fetchTestimonials());
    }
  }, [dispatch]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const sliced = testimonials.slice(startIndex, startIndex + rowsPerPage);
    setCurrentTestimonials(sliced);
  }, [testimonials, currentPage, rowsPerPage]);
  const totalPages = Math.ceil(testimonials.length / rowsPerPage);

  // const handlePublish = (testimonial) => {
  //   setConfirmModal({
  //     open: true,
  //     message: `هل تريد نشر هذا الرأي؟`,
  //     confirmText: "نشر",
  //     confirmClass: "btn-success",
  //     onConfirm: async () => {
  //       dispatch(updateTestimonial({ id: testimonial.id, isPublished: true }));
  //       setConfirmModal((prev) => ({ ...prev, open: false }));
  //     },
  //   });
  // };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      setNotification({
        isOpen: true,
        message: "من فضلك، اختر على الأقل رأي واحد."
      });
      return;
    }
    setConfirmModal({
      open: true,
      message: `هل تريد حذف ${selectedIds.length} رأي؟`,
      confirmText: "حذف الكل",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        for (const id of selectedIds) {
          await dispatch({ type: "testimonials/deleteTestimonial/pending" });
          dispatch({ type: "testimonials/deleteTestimonial", payload: id });
        }
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleShowModal = (testimonial) => {
    setModalData(testimonial);
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const shortFeedback = (text) => {
    if (!text) return "--";
    return text.length > MAX_FEEDBACK_LENGTH
      ? text.slice(0, MAX_FEEDBACK_LENGTH) + "..."
      : text;
  };

      //NotificationModal
      const [notification, setNotification] = useState({ isOpen: false, message: "" });
  
      //NotificationModal
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="user-table z-0">
            <table width="100%" dir="rtl" className="table">
              <thead>
                <tr>
                  <th>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={
                          currentTestimonials.length > 0 &&
                          currentTestimonials.every((t) =>
                            selectedIds.includes(t.id)
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </label>
                  </th>
                 
                  <th>اسم المستخدم</th>
                  <th>التقييم</th>
                  <th>الرأي/التعليق</th>
                  <th>تاريخ الإضافة</th>
                  <th>الحالة</th>
                  <th>عرض</th>
                  <th>
                    <CustomMenu
                      id="bulk-actions"
                      options={[
                        {
                          label: `حذف الكل (${selectedIds.length})`,
                          icon: "fa-solid fa-trash",
                          color: "red",
                          disabled: selectedIds.length === 0,
                          onClick: handleDeleteSelected,
                        },
                      ]}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTestimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td>
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(testimonial.id)}
                          onChange={(e) =>
                            handleSelectRow(testimonial.id, e.target.checked)
                          }
                        />
                      </label>
                    </td>
                   
                    <td>{testimonial.users?.name || "--"}</td>
                    <td>{testimonial.rate}</td>
                    <td>{shortFeedback(testimonial.feed_back)}</td>
                    <td>{formatDate(testimonial.created_at)}</td>
                    <td>
                      {/* Toggle Switch for isPublished */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={testimonial.isPublished}
                          onChange={() =>
                            dispatch(
                              updateTestimonial({
                                id: testimonial.id,
                                isPublished: !testimonial.isPublished,
                              })
                            )
                          }
                          style={{
                            accentColor: "#0d6efd",
                            width: "32px",
                            height: "18px",
                          }}
                        />
                        <span
                          className={`badge rounded-pill px-3 py-1 fw-medium ${
                            testimonial.isPublished
                              ? "bg-primary-subtle text-primary"
                              : "bg-light text-muted border"
                          }`}
                          style={{ fontSize: "0.85rem" }}
                        >
                          {testimonial.isPublished ? "ظاهر" : "غير ظاهر"}
                        </span>
                      </label>
                    </td>
                    <td>
                      {/* زر دائري بأيقونة عين زرقاء */}
                      <div
                        title="عرض كل الخطوط"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "rgb(231, 241, 255)",
                          color: "rgb(13, 110, 253)",
                          cursor: "pointer",
                          fontSize: "1rem",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => handleShowModal(testimonial)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </div>
                    </td>
                    <td>
                      <CustomMenu
                        id={testimonial.id}
                        options={[
                          {
                            label: "حذف الرأي",
                            icon: "fa-solid fa-trash",
                            color: "red",
                            onClick: () =>
                              setConfirmModal({
                                open: true,
                                message: `هل تريد حذف هذا الرأي؟`,
                                confirmText: "حذف",
                                confirmClass: "btn-danger",
                                onConfirm: async () => {
                                  await dispatch(
                                    deleteTestimonial(testimonial.id)
                                  );
                                  setConfirmModal((prev) => ({
                                    ...prev,
                                    open: false,
                                  }));
                                },
                              }),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="pagination-container mt-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <RowsPerPageSelector
                value={rowsPerPage}
                onChange={setRowsPerPage}
              />
            </div>
            <div className="pagination d-flex gap-1 flex-wrap justify-content-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                &gt;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
            <p className="mt-4 small text-muted">
              {testimonials.length === 0 ? (
                "لا يوجد آراء للعرض"
              ) : (
                <>
                  عرض {(currentPage - 1) * rowsPerPage + 1} -{" "}
                  {Math.min(currentPage * rowsPerPage, testimonials.length)} من
                  أصل {testimonials.length} رأي
                </>
              )}
            </p>
          </div>
        </div>
      )}
      {/* Modal for full feedback */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          dir="rtl"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
               {/* <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between w-100" dir="rtl">
                        <Modal.Title>إضافة شركة</Modal.Title>
                        <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => setShow(false)} />
              
                      </Modal.Header> */}
              <div style={{ borderBottom: '1px solid #ccc' }}
 className=" py-3 px-3  d-flex align-items-center justify-content-between w-100">
                <h5 className="modal-title">تفاصيل الرأي</h5>
                <button
                  type="button"
                  className="fa-solid fa-close border-0 bg-transparent CloseModalBtn"
                  onClick={() => setShowModal(false)}
                ></button>

              </div>
              <div className="modal-body">
                <p>
                  <strong>رقم الرأي:</strong> {modalData?.id}
                </p>
                <p>
                  <strong>اسم المستخدم:</strong>{" "}
                  {modalData?.users?.name || "--"}
                </p>
                <p>
                  <strong>التقييم:</strong> {modalData?.rate}
                </p>
                <p>
                  <strong>الرأي/التعليق:</strong> {modalData?.feed_back}
                </p>
                <p>
                  <strong>تاريخ الإضافة:</strong>{" "}
                  {formatDate(modalData?.created_at)}
                </p>
                <p>
                  <strong>الحالة:</strong>{" "}
                  {modalData?.isPublished ? "منشور" : "غير منشور"}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowModal(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalConfirm
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmClass={confirmModal.confirmClass}
      />
      <NotificationModal
        isOpen={notification.isOpen}
        message={notification.message}
        onClose={() => setNotification({ isOpen: false, message: "" })}
      />
    </>
  );
};

export default TestimonialsTbl;
