import { useState, useEffect } from "react";
import "../css/Table.css";
import { useSelector, useDispatch } from "react-redux";
import { GetCategories } from "../Redux/slices/Categories";
import { GetUnits } from "../Redux/slices/units";
import Loading from "../Components/globalComonents/loading";
import PrimarySelector from "../Components/globalComonents/PrimarySelector";
import TableComponent from "../Components/CategoriesComponents/TableComponent";
import CategoriesFilter from "../Components/CategoriesComponents/CategoriesFilter";
import CustomMenu from "../Components/globalComonents/CustomMenu";
import ModalConfirm from "../Components/UsersComponents/ModalConfirm";
import { DeleteUnit } from "../Redux/slices/units";
import { DeleteCategory } from "../Redux/slices/Categories";
import CategoriesPageHeader from "../Components/CategoriesComponents/CategoriesPageHeader";
import { UserRole } from "../Redux/slices/token";
import RowsPerPageSelector from "../Components/globalComonents/RowsPerPageSelector";
import NotificationModal from "../Components/modalsComponents/NotificationModal";
// const rowsPerPage = 5;

function Categories() {
  const dispatch = useDispatch();
  const [flag, setFlag] = useState("categories");
  const { categories, loading } = useSelector((state) => state.Categories);
  const { Units } = useSelector((state) => state.Units);

  // Search & selection state
  const [searchName, setSearchName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    confirmText: "تأكيد",
    confirmClass: "btn-primary",
    onConfirm: () => { },
  });

  // Pagination state
  
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(GetCategories());
      dispatch(GetUnits());
    }
  }, [dispatch, UserRole]);

  // Filtered data
  const data = flag === "categories" ? categories : Units;
  const [filteredData, setFilteredData] = useState(data);

  // Apply filter only when pressing search
  useEffect(() => {
    setFilteredData(data);
    setSelectedRows([]);
    setCurrentPage(1);
  }, [data, flag]);

  const handleSearchClick = () => {
    if (!searchName) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter(
          (x) =>
            x.name && x.name.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }
    setSelectedRows([]);
    setCurrentPage(1);
  };

  // Paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Selectors
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [
        ...new Set([...prev, ...paginatedData.map((c) => c.id)]),
      ]);
    } else {
      setSelectedRows((prev) =>
        prev.filter((id) => !paginatedData.some((c) => c.id === id))
      );
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete
  const handleDeleteRow = (row) => {
    setConfirmModal({
      open: true,
      message: `هل تريد حذف ${row.name}؟`,
      confirmText: "حذف",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        if (flag === "categories") {
          await dispatch(DeleteCategory(row.id));
        } else {
          await dispatch(DeleteUnit(row.id));
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
        setSelectedRows((prev) => prev.filter((x) => x !== row.id));
        handleAdd();
      },
    });
  };
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      setNotification({
        isOpen: true,
        // استخدمنا متغير 'label' هنا عشان الرسالة تتغير تلقائيًا
        message: `الرجاء تحديد ${pluralLabel} أولاً.`
      });
      return;
    }
    setConfirmModal({
      open: true,
      message: `هل تريد حذف ${selectedRows.length} ${label}؟`,
      confirmText: "حذف الكل",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        for (const id of selectedRows) {
          if (flag === "categories") {
            await dispatch(DeleteCategory(id));
          } else {
            await dispatch(DeleteUnit(id));
          }
        }
        setSelectedRows([]);
        setConfirmModal((prev) => ({ ...prev, open: false }));
        handleAdd();
      },
    });
  };

  // دالة لإعادة جلب الداتا بعد الإضافة
  const handleAdd = () => {
    if (flag === "categories") dispatch(GetCategories());
    else dispatch(GetUnits());
  };

  // Table columns
  const columns = [
    {
      header: (
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={
              paginatedData.length > 0 &&
              paginatedData.every((c) => selectedRows.includes(c.id))
            }
            onChange={handleSelectAll}
          />
        </label>
      ),
      accessor: "selector",
      render: (_, row) => (
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={() => handleSelectRow(row.id)}
          />
        </label>
      ),
    },
    ...(flag === "categories"
      ? [
        {
          header: "صورة",
          accessor: "img",
          render: (val) => (
            <img
              src={val}
              alt="img"
              style={{ width: "50px", borderRadius: "5px" }}
            />
          ),
        },
      ]
      : []),
    { header: "الاسم", accessor: "name" },
    { header: "المعرف", accessor: "id" },
    {
      header: (
        <CustomMenu
          id="bulk-actions"
          options={[
            {
              label: `حذف المحدد (${selectedRows.length})`,
              icon: "fa-solid fa-trash",
              color: "red",
              disabled: selectedRows.length === 0,
              onClick: handleDeleteSelected,
            },
          ]}
        />
      ),
      accessor: "actions",
      render: (_, row) => (
        <CustomMenu
          id={row.id}
          options={[
            {
              label: "حذف",
              icon: "fa-solid fa-trash",
              color: "red",
              onClick: () => handleDeleteRow(row),
            },
          ]}
        />
      ),
    },
  ];
  
  const label = flag === "categories" ? "صنف" : "وحدة";
  label;
  const pluralLabel = flag === "categories" ? "أصناف" : "وحدات";


      //NotificationModal
      const [notification, setNotification] = useState({ isOpen: false, message: "" });
      //NotificationModal
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <CategoriesPageHeader
            title={flag === "categories" ? "الأصناف" : "الوحدات"}
            flag={flag}
            onAdd={handleAdd}
          />
          <div className="d-flex justify-content-between gap-4 align-items-center">
            <div className="mt-2 px-2" style={{ Width: 500 }}>
              <PrimarySelector
                className="w-100 px-3"
                value={flag}
                onChange={(value) => {
                  setFlag(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "categories", label: "الأصناف" },
                  { value: "units", label: "الوحدات" },
                ]}
                label="اختر الجدول"
              />
            </div>
            {flag === "categories" && (
              <div>
                <CategoriesFilter
                  searchName={searchName}
                  setSearchName={setSearchName}
                  onSearchClick={handleSearchClick}
                  onResetFilters={() => {
                    setSearchName("");
                    setFilteredData(data);
                    setSelectedRows([]);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
          <TableComponent data={paginatedData} columns={columns} />
          {/* <div className="pagination">
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
          </div> */}

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
                {filteredData.length === 0 ? (
                  `لا يوجد ${pluralLabel} للعرض`
                ) : (
                  <>
                    عرض {(currentPage - 1) * rowsPerPage + 1} -
                    {Math.min(currentPage * rowsPerPage, filteredData.length)} من أصل {filteredData.length} {label}
                  </>
                )}
              </p>

            </div>
          
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
        </div>
      )}
    </>
  );
}

export default Categories;
