import React, { useEffect, useState, useMemo } from "react";
import "../../css/Table.css";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  deleteSelectedProduct,
  fetchProducts,
  updateProduct,
} from "../../Redux/slices/ProductSlice";
import ProductsFilter from "./ProductsFilter";
import CustomMenu from "../globalComonents/CustomMenu";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import EditProductModal from "../modalsComponents/EditProductModal";
import Switch from "../globalComonents/Switch";
import Loading from "../globalComonents/loading";
import { UserRole } from "../../Redux/slices/token";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import EmptyState from "../Notfound/EmptyState"; 

// const rowsPerPage = 8;

const ProductsTbl = () => {
  
    const [rowsPerPage, setRowsPerPage] = useState(8);
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.Products);

  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [EditProduct, setEditProduct] = useState({});
  const [SelectedProducts, SetSelectedProducts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedCat, setselectedCat] = useState("");
  const [searchTrader, setSearchTrader] = useState("");
  const [selectedCompany, setselectedCompany] = useState("");
  const [showNotPublished, setShowNotPublished] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: "",
    confirmText: "تأكيد",
    confirmClass: "btn-primary",
    onConfirm: () => {},
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch,UserRole]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, selectedCat, searchTrader, selectedCompany, showNotPublished, setRowsPerPage]);

  const filteredProducts = useMemo(() => {
    return products.filter((x) => {
      const matchName =
        searchName === "" || (x.name && x.name.toLowerCase().includes(searchName.toLowerCase()));
      const matchCat =
        selectedCat === "" || (x.category?.name && x.category.name.toLowerCase().includes(selectedCat.toLowerCase()));
      const matchTrader =
        searchTrader === "" || (x.trader?.name && x.trader.name.toLowerCase().includes(searchTrader.toLowerCase()));
      const matchCompany =
        selectedCompany === "" || (x.company?.name && x.company.name.toLowerCase().includes(selectedCompany.toLowerCase()));
      const matchPublish = !showNotPublished || x.publish === false;

      return matchName && matchCat && matchTrader && matchCompany && matchPublish;
    });
  }, [products, searchName, selectedCat, searchTrader, selectedCompany, showNotPublished]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + rowsPerPage);

  // 👈 إضافة دالة للتحقق من وجود فلاتر نشطة
  const hasActiveFilters = () => {
    return searchName || selectedCat || searchTrader || selectedCompany || showNotPublished;
  };

  const selectAll = (checked) => {
    SetSelectedProducts(checked ? currentProducts : []);
  };

  const isSelected = (id) => SelectedProducts.some((product) => product.id === id);

  const handleCheckboxChange = (e, product) => {
    if (e.target.checked) {
      SetSelectedProducts((prev) => [...prev, product]);
    } else {
      SetSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const handleDeleteSelected = async () => {
    await dispatch(deleteSelectedProduct(SelectedProducts));
    SetSelectedProducts([]);
  };

  const handleDeletePro = (product) => {
    const isBlocked = product.state === false;
    setConfirmModal({
      open: true,
      message: isBlocked ? `هل تريد إلغاء حذف ${product.name}؟` : `هل تريد حذف ${product.name}؟`,
      confirmText: isBlocked ? "إلغاء الحذف" : "حذف",
      confirmClass: "btn-danger",
      onConfirm: async () => {
        await dispatch(deleteProduct({ id: product.id, image: product.image }));
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  function selectNotPublished() {
    setShowNotPublished(true);
    setCurrentPage(1);
  }

  function onResetFilters() {
    setSearchName("");
    setselectedCat("");
    setSearchTrader("");
    setselectedCompany("");
    setShowNotPublished(false);
    setCurrentPage(1);
  }

  // 👈 إذا كان في حالة تحميل، اعرض Loading
  if (loading) {
    return <Loading />;
  }

  // 👈 إذا كان الجدول فارغاً، اعرض EmptyState
  if (filteredProducts.length === 0) {
    return (
      <>
        <ProductsFilter
          searchName={searchName}
          setSearchName={setSearchName}
          selectedCat={selectedCat}
          setselectedCat={setselectedCat}
          searchTrader={searchTrader}
          setSearchTrader={setSearchTrader}
          selectedCompany={selectedCompany}
          setselectedCompany={setselectedCompany}
          onSearchClick={() => {}}
          onResetFilters={onResetFilters}
          selectNotPublished={selectNotPublished}
          showNotPublished={showNotPublished}
        />
        
        <EmptyState 
          title={hasActiveFilters() ? "لا توجد نتائج" : "لا يوجد منتجات"}
          description={
            hasActiveFilters() 
              ? `لم يتم العثور على منتجات تطابق معايير البحث المحددة.${showNotPublished ? ' جرب البحث في المنتجات المنشورة.' : ' جرب تعديل الفلاتر أو البحث بمعايير مختلفة.'}`
              : "لا توجد منتجات في النظام حالياً. ابدأ بإضافة منتجات جديدة."
          }
          actionText={hasActiveFilters() ? "إعادة تعيين الفلاتر" : "تحديث"}
          onActionClick={onResetFilters}
          icon={hasActiveFilters() ? "fa-search" : "fa-box"}
        />

        {/* الـ Modals يجب أن تبقى حتى لو كان الجدول فارغ */}
        <ModalConfirm
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmClass={confirmModal.confirmClass}
        />

        <EditProductModal show={show} setShow={setShow} product={EditProduct} />
      </>
    );
  }

  return (
    <>
      <div>
        <ProductsFilter
          searchName={searchName}
          setSearchName={setSearchName}
          selectedCat={selectedCat}
          setselectedCat={setselectedCat}
          searchTrader={searchTrader}
          setSearchTrader={setSearchTrader}
          selectedCompany={selectedCompany}
          setselectedCompany={setselectedCompany}
          onSearchClick={() => {}}
          onResetFilters={onResetFilters}
          selectNotPublished={selectNotPublished}
          showNotPublished={showNotPublished}
        />

        <div className="user-table">
          <table border="1" width="100%" dir="rtl" className="table">
            <thead>
              <tr>
                <th>
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={
                        currentProducts.length > 0 &&
                        currentProducts.every((p) =>
                          SelectedProducts.some((sp) => sp.id === p.id)
                        )
                      }
                      onChange={(e) => selectAll(e.target.checked)}
                    />
                  </label>
                </th>
                <th>صورة</th>
                <th>اسم المنتج</th>
                <th>الصنف</th>
                <th>سعر المنتج</th>
              
                      {UserRole === "admin" &&
                     <th>التاجر</th>
                  }
                <th>الشركة المصنعة</th>
                <th>الوحدة</th>
                <th>الكمية فى الوحدة</th>
                <th>الحالة</th>
                <th>نشر</th>
                <th>
                  {SelectedProducts.length > 0 && (
                    <p className="tdcontentstate tdDeleteSelected" onClick={handleDeleteSelected}>
                      حذف
                    </p>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id} className={product.state ? "" : "blocked-row"}>
                  <td>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={isSelected(product.id)}
                        onChange={(e) => handleCheckboxChange(e, product)}
                      />
                    </label>
                  </td>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
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
                  <td>{product.name}</td>
                  <td>{product.category?.name || "--"}</td>
                  <td>{product.endPrice}</td>
                  {UserRole === "admin" &&
                    <td>{product.trader?.name || "--"}</td>
                  }
                
                  <td>{product.company?.name || "--"}</td>
                  <td>{product.unit || "--"}</td>
                  <td>{product.quantity_per_unit || "--"}</td>
                  <td>
                    <p
                      className={
                        product.state
                          ? "tdcontentstate tdcontentstateSuc"
                          : " tdcontentstate tdcontentstateDanger"
                      }
                    >
                      {product.state ? "متاح" : "غير متاح"}
                    </p>
                  </td>
                  {UserRole === "admin" ? (
                    <td>
                      <Switch
                        ispublish={product.publish}
                        setispublish={(value) =>
                          dispatch(updateProduct({ id: product.id, updatedData: { publish: value } }))
                        }
                        id={`publish-switch-${product.id}`}
                      />
                    </td>
                  ) : (
                    <td>
                      <p
                        className={
                          product.publish
                            ? "tdcontentstate tdcontentstateSuc"
                            : " tdcontentstate tdcontentstateDanger"
                        }
                      >
                        {product.publish ? "مكتمل" : "معلق"}
                      </p>
                    </td>
                  )}
                  <td>
                    <CustomMenu
                      id={product.id}
                      options={[
                        {
                          label: "تعديل",
                          icon: "fa-solid fa-pen-to-square",
                          color:'#915EF6',
                          onClick: () => {
                            setShow(true);
                            setEditProduct(product);
                          },
                        },
                        {
                          label: "حذف",
                          icon: "fa-solid fa-trash",
                          color: "red",
                          onClick: () => {
                            handleDeletePro(product);
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

        <ModalConfirm
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmClass={confirmModal.confirmClass}
        />

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
              
            {filteredProducts.length === 0 ? (
              "لا يوجد منتجات للعرض"
            ) : (
              <>عرض {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredProducts.length)} من أصل {filteredProducts.length} منتج</>
            )}
            </p>
          </div>

        <EditProductModal show={show} setShow={setShow} product={EditProduct} />
      </div>
    </>
  );
};

export default ProductsTbl;