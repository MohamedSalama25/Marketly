import React, { useEffect, useState } from "react";
import "../../css/Table.css";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCompany,
  fetchCompanies,
} from "../../Redux/slices/CompaniesSlice";
import CompaniesFilter from "./CompaniesFilter";
import EditCompaniesModal from "../modalsComponents/EditCompaniesModal";
import CustomMenu from "../globalComonents/CustomMenu";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import { deleteImageFromStore } from "../../Redux/uploadingImage";
import Loading from "../globalComonents/loading";
import { UserRole } from "../../Redux/slices/token";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import NotificationModal from "../modalsComponents/NotificationModal";

// const rowsPerPage = 8;

const CompaniesTbl = () => {

  const dispatch = useDispatch();
  const { companies ,loading } = useSelector((state) => state.Companies);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [currentCompanies, setCurrentCompanies] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [show, setShow] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    confirmText: "تأكيد",
    confirmClass: "btn-primary",
    onConfirm: () => {},
  });
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  useEffect(() => {
    if(!companies||companies.length===0){
 dispatch(fetchCompanies());
    }
   
  }, [dispatch,UserRole]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const sliced = companies.slice(startIndex, startIndex + rowsPerPage);
    setCurrentCompanies(sliced);
  }, [companies, currentPage, rowsPerPage]);
  const totalPages = Math.ceil(companies.length / rowsPerPage);

  // for filtering
  const handleSearchClick = () => {
    const filtered = companies.filter((x) => {
      const matchName =
        searchName === "" ||
        (x.name && x.name.toLowerCase().includes(searchName.toLowerCase()));

      const matchDate =
        (!startDate || new Date(x.created_at) >= new Date(startDate)) &&
        (!endDate || new Date(x.created_at) <= new Date(endDate));

      return matchName && matchDate;
    });

    setCurrentCompanies(filtered);
  };
  function onResetFilters() {
    setSearchName("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1); // اختياري، لو عايز ترجع لأول صفحة
    setCurrentCompanies(companies); // رجّع كل المنتجات الأصلية
  }

  // for confirm deleteing
  const handleDeleteCompany = (company) => {
    const isBlocked = company.isBlocked;
    setConfirmModal({
      open: true,
      message: isBlocked
        ? `هل تريد إلغاء حذف ${company.name}؟`
        : `هل تريد حذف ${company.name}؟`,
      confirmText: isBlocked ? "إلغاء الحذف" : "حذف",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        try {
          // حذف الصورة من الستوريج
          if (company.image) {
            await deleteImageFromStore(company.image, "companies");
          }

          // حذف الشركة من الداتا بيز
          dispatch(deleteCompany(company.id));

          // قفل المودال
          setConfirmModal((prev) => ({ ...prev, open: false }));

          console.log("✅ Company and image deleted:", company.name);
          console.log(company.image);
        } catch (error) {
          console.error("❌ Error deleting company or image:", error.message);
        }
      },
    });
  };

  // تحديد أو إلغاء تحديد كل الشركات المعروضة
  const handleSelectAll = () => {
    if (selectedCompanies.length === currentCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(currentCompanies.map((c) => c.id));
    }
  };
  // تحديد أو إلغاء تحديد شركة واحدة
  const handleSelectCompany = (id) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // حذف جماعي
  const handleDeleteSelected = () => {
    if (selectedCompanies.length === 0) {
      setNotification({
        isOpen: true,
        message: "من فضلك، يجب تحديد شركة واحدة عل الأقل."
      });
      return;
    }
    setConfirmModal({
      open: true,
      message: `هل تريد حذف ${selectedCompanies.length} شركة؟`,
      confirmText: "حذف الكل",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        for (const id of selectedCompanies) {
          const company = companies.find((c) => c.id === id);
          if (company?.image) {
            await deleteImageFromStore(company.image, "companies");
          }
          dispatch(deleteCompany(id));
        }
        setSelectedCompanies([]);
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

      //NotificationModal
      const [notification, setNotification] = useState({ isOpen: false, message: "" });
      //NotificationModal
  return (
    <>
    {loading?<Loading/>:
    
    <div>
 <CompaniesFilter
        searchName={searchName}
        setSearchName={setSearchName}
        onSearchClick={handleSearchClick}
        onResetFilters={onResetFilters}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
      <div className="user-table z-0">
        <table border="1" width="100%" dir="rtl" className="table">
          <thead>
            <tr>
              <th>
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={
                      selectedCompanies.length === currentCompanies.length &&
                      currentCompanies.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </label>
              </th>
              <th>شعار / صورة</th>
              <th>اسم الشركة</th>
              <th>معرف الشركة </th>
              <th>تاريخ الإضافة</th>
              <th>
                <CustomMenu
                  id="bulk-actions"
                  options={[
                    {
                      label: `حذف المحدد (${selectedCompanies.length})`,
                      icon: "fa-solid fa-trash",
                      color: "red",
                      disabled: selectedCompanies.length === 0,
                      onClick: handleDeleteSelected,
                    },
                  ]}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCompanies.map((company) => (
              <tr key={company.id}>
                <td>
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => handleSelectCompany(company.id)}
                    />
                  </label>
                </td>
                <td>
                  {company.image ? (
                    <img
                      src={company.image}
                      alt={company.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <span>--</span>
                  )}
                </td>
                <td>{company.name}</td>
                <td>{company.id}</td>
                <td>
                  {new Date(company.created_at).toLocaleDateString("ar-EG")}
                </td>

                <td style={{}}>
                  <CustomMenu
                    id={company.id}
                    options={[
                      {
                        label: "تعديل",
                        icon: "fa-solid fa-pen",
                        color: "green",
                        onClick: () => {
                          setShow(true);
                          setEditCompany(company);
                        },
                      },
                      {
                        label: "حذف",
                        icon: "fa-solid fa-trash",
                        color: "red",
                        onClick: () => {
                          handleDeleteCompany(company);
                        },
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
            {/* اليمين: السليكتور */}
            <div>
              <RowsPerPageSelector value={rowsPerPage} onChange={setRowsPerPage} />
            </div>

            {/* الوسط: الباجينيشن */}
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

            {/* الشمال: رسالة عرض العناصر */}
            <p className="mt-4 small text-muted">
            {companies.length === 0 ? (
              "لا يوجد شركات للعرض"
            ) : (
              <>عرض {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, companies.length)} من أصل {companies.length} شركة</>
            )}
              
            </p>
          </div>

        </div>
      }
     

      <ModalConfirm
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmClass={confirmModal.confirmClass}
      />

     
      <EditCompaniesModal show={show} setShow={setShow} company={editCompany} />
      <NotificationModal
        isOpen={notification.isOpen}
        message={notification.message}
        onClose={() => setNotification({ isOpen: false, message: "" })}
      />
    </>
  );
};

export default CompaniesTbl;
