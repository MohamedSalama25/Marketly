import React, { useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import RouteDetailsModal from "../DelegatesComponents/RouteDetailsModal";
import CustomMenu from "../globalComonents/CustomMenu";
import LabeledMenu from "../globalComonents/LabeledMenu";
import { UserRole } from "../../Redux/slices/token";
import "../../css/Table.css";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import PasswordChangeModal from "./PasswordChangeModal";
import EmptyState from "../Notfound/EmptyState"; // تأكد من استيراد المكون
import NotificationModal from "../modalsComponents/NotificationModal";

const groupRoutes = (arr = []) =>
  arr.reduce((acc, cur) => {
    const found = acc.find((r) => r.route === cur.route);
    if (found) {
      if (!found.days.includes(cur.day)) found.days.push(cur.day);
    } else {
      acc.push({ route: cur.route, days: [cur.day] });
    }
    return acc;
  }, []);

export default function DelegatesTbl({
  users,
  delegates,
  searchName,
  searchPhone,
  selectedGovernorate,
  selectedDay,
  onDeleteDelegate,
  setEditModalData,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    confirmText: "",
    confirmClass: "",
    onConfirm: () => {},
  });
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [modalRoutes, setModalRoutes] = useState([]);
  const [modalName, setModalName] = useState("");
  const [passwordModalData, setPasswordModalData] = useState({
    open: false,
    userId: null,
    userName: "",
  });

  const totalPages = Math.ceil(delegates.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentDelegates = delegates.slice(startIdx, startIdx + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchPhone, selectedGovernorate, selectedDay, rowsPerPage]);

  const handleSelectAll = (e) => {
    const pageIds = currentDelegates.map((d) => d.id);
    setSelectedIds((prev) =>
      e.target.checked
        ? [...new Set([...prev, ...pageIds])]
        : prev.filter((id) => !pageIds.includes(id))
    );
  };

  const openRoutesModal = (routes, name) => {
    setModalRoutes(routes);
    setModalName(name);
    setShowRoutesModal(true);
  };

  const onResetFilters = () => {
    // يمكنك إضافة دالة لإعادة تعيين الفلترات هنا إذا كنت بحاجة إليها
    // مثلاً: setSearchName(""); setSelectedGovernorate(""); etc.
  };

      //NotificationModal
      const [notification, setNotification] = useState({ isOpen: false, message: "" });
  
      //NotificationModal
  return (
    <>
      {delegates.length === 0 ? (
        <EmptyState
          title="لا يوجد مناديب"
          description="لا يوجد مناديب مطابقين لبحثك أو لم يتم إضافة أي مناديب بعد."
          actionText="إعادة تعيين الفلتر"
          onActionClick={onResetFilters}
          icon="fa-user-tie"
        />
      ) : (
        <>
          <div className="user-table">
            <table className="table" width="100%" dir="rtl">
              <thead>
                <tr>
                  <th>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={
                          currentDelegates.length > 0 &&
                          currentDelegates.every((d) => selectedIds.includes(d.id))
                        }
                        onChange={handleSelectAll}
                      />
                    </label>
                  </th>
                  <th>الصورة</th>
                  <th>اسم المندوب</th>
                  <th>رقم الهاتف</th>
                  {UserRole == "admin" && <th>التاجر التابع له</th>}
                  <th>محافظة التوزيع</th>
                  <th>خط السير</th>
                  <th></th>
                  <th>
                    <CustomMenu
                      options={[
                        {
                          label: "حذف المناديب",
                          icon: "fa-solid fa-trash",
                          color: "red",
                          onClick: () => {
                            // if (!selectedIds.length)
                            //   return alert("اختر على الأقل مندوب واحد");
                            if (selectedIds.length === 0) {
                              setNotification({
                                isOpen: true,
                                message: "من فضلك، اختر على الأقل مندوب واحد."
                              });
                              return;
                            }
                            setConfirmModal({
                              open: true,
                              message: `هل أنت متأكد من حذف ${selectedIds.length} مندوب؟`,
                              confirmText: "نعم، احذف",
                              confirmClass: "btn-danger",
                              onConfirm: () => {
                                selectedIds.forEach(onDeleteDelegate);
                                setSelectedIds([]);
                                setConfirmModal((p) => ({ ...p, open: false }));
                              },
                            });
                          },
                        },
                      ]}
                    />
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentDelegates.map((delegate) => {
                  const grouped = groupRoutes(delegate.routes);
                  const first = grouped[0];

                  return (
                    <tr key={delegate.id}>
                      <td>
                        <label className="checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(delegate.id)}
                            onChange={(e) =>
                              setSelectedIds((prev) =>
                                e.target.checked
                                  ? [...prev, delegate.id]
                                  : prev.filter((id) => id !== delegate.id)
                              )
                            }
                          />
                        </label>
                      </td>

                      <td>
                        <img
                          src={
                            delegate.image ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt={delegate.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      </td>

                      <td>{delegate.name}</td>
                      <td>{delegate.phone}</td>
                      {UserRole == "admin" && (
                        <td>
                          {users.find((u) => u.id === delegate.trader_id)?.name ||
                            "---"}
                        </td>
                      )}

                      <td>
                        {delegate.routes.length > 0 ? (
                          [
                            ...new Set(delegate.routes.map((r) => r.governorate)),
                          ].map((gov, idx) => (
                            <Badge
                              key={idx}
                              bg="primary"
                              className="me-1"
                              style={{ fontSize: "16px" }}
                            >
                              {gov}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">غير محددة</span>
                        )}
                      </td>

                      <td style={{ position: "relative" }}>
                        {first ? (
                          <div className="d-flex justify-content-center align-items-center position-relative">
                            <div className="text-center">
                              <div className="fw-bold">{first.route}</div>
                              <div className="mb-1">
                                {first.days.map((d, i) => (
                                  <Badge
                                    bg="info"
                                    key={i}
                                    className="me-1 badge-sm"
                                  >
                                    {d}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">لا يوجد</span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor:
                              delegate.routes.length > 1 ? "#e7f1ff" : "#f0f0f0",
                            color: delegate.routes.length > 1 ? "#0d6efd" : "#999",
                            cursor:
                              delegate.routes.length > 1 ? "pointer" : "default",
                            fontSize: "1rem",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={
                            delegate.routes.length > 1
                              ? "عرض كل الخطوط"
                              : "لا توجد خطوط إضافية"
                          }
                          onClick={() =>
                            delegate.routes.length > 1 &&
                            openRoutesModal(delegate.routes, delegate.name)
                          }
                        >
                          <i className="fa-solid fa-eye"></i>
                        </div>
                      </td>

                      <td>
                        <CustomMenu
                          id={delegate.id}
                          options={[
                            {
                              label: "تعديل",
                              icon: "fa-solid fa-user-pen",
                              color: "#915EF6",
                              onClick: () => setEditModalData(delegate),
                            },
                            {
                              label: "تعديل كلمة المرور",
                              icon: "fa-solid fa-lock",
                              color: "orange",
                              onClick: () => {
                                setPasswordModalData({
                                  open: true,
                                  userId: delegate.id,
                                  userName: delegate.name,
                                });
                              },
                            },
                            {
                              label: "حذف المندوب",
                              icon: "fa-solid fa-trash",
                              color: "red",
                              onClick: () =>
                                setConfirmModal({
                                  open: true,
                                  message: `هل أنت متأكد من حذف (${delegate.name})؟`,
                                  confirmText: "نعم، احذف",
                                  confirmClass: "btn-danger",
                                  onConfirm: () => {
                                    onDeleteDelegate(delegate.id);
                                    setConfirmModal((p) => ({ ...p, open: false }));
                                  },
                                }),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <RouteDetailsModal
            show={showRoutesModal}
            onClose={() => setShowRoutesModal(false)}
            routes={modalRoutes}
            delegateName={modalName}
          />
          <PasswordChangeModal
            isOpen={passwordModalData.open}
            userId={passwordModalData.userId}
            userName={passwordModalData.userName}
            onClose={() => setPasswordModalData({ open: false, userId: null, userName: "" })}
          />

          <div className="pagination-container mt-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <RowsPerPageSelector value={rowsPerPage} onChange={setRowsPerPage} />
            </div>

            <div className="pagination d-flex gap-1 flex-wrap justify-content-center">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                &laquo;
              </button>
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
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
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                &gt;
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                &raquo;
              </button>
            </div>

            <p className="mt-4 small text-muted">
              عرض {startIdx + 1} - {Math.min(startIdx + rowsPerPage, delegates.length)} من أصل {delegates.length} مندوب
            </p>
          </div>
        </>
      )}

      <ModalConfirm
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal((p) => ({ ...p, open: false }))}
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
}