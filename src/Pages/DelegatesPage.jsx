// ✅ DelegatesPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDelegates,
  updateDelegate,
  deleteDelegate,
} from "../Redux/slices/DelegatesSlice";
import { fetchUsers } from "../Redux/slices/Users";

import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

import DelegatesPageHeader from "../Components/DelegatesComponents/DelegatesPageHeader";
import DelegatesFilter from "../Components/DelegatesComponents/DelegatesFilter";
import DelegatesTbl from "../Components/DelegatesComponents/DelegatesTbl";
import EditDelegateModal from "../Components/modalsComponents/EditDelegateModal";
import Loading from "../Components/globalComonents/loading";
import { UserRole } from "../Redux/slices/token";

export default function DelegatesPage() {
  const dispatch = useDispatch();

  const { delegates, loading } = useSelector((state) => state.Delegates);
  const { users } = useSelector((state) => state.Users);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchTrader, setSearchTrader] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [filters, setFilters] = useState({
    governorate: "",
    name: "",
    phone: "",
    day: "",
    trader: "",
  });

  const [editModalData, setEditModalData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // ✅ تحميل البيانات فقط عند الحاجة
  useEffect(() => { 
      dispatch(fetchUsers());
       dispatch(fetchDelegates());
  }, [dispatch,UserRole]);

  // ✅ فلترة المناديب بعد تأخير 500ms
  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        name: searchName,
        phone: searchPhone,
        trader: searchTrader,
      }));
    }, 0);

    return () => clearTimeout(delay);
  }, [searchName, searchPhone, searchTrader]);

  // ✅ زر البحث اليدوي
  const handleSearchClick = () => {
    setFilters({
      governorate: selectedGovernorate,
      name: searchName,
      phone: searchPhone,
      day: selectedDay,
      trader: searchTrader,
    });
  };

  // ✅ زر إعادة التصفية
  const handleResetFilters = () => {
    setSearchName("");
    setSearchPhone("");
    setSelectedGovernorate("");
    setSelectedDay("");
    setSearchTrader("");
    setFilters({
      governorate: "",
      name: "",
      phone: "",
      day: "",
      trader: "",
    });
  };

  // ✅ تعديل المندوب
  const handleUpdateDelegate = (id, updatedData) => {
    dispatch(updateDelegate({ id, updatedData }));
  };

  // ✅ حذف المندوب
  const handleDeleteDelegate = async (id) => {
    try {
      await dispatch(deleteDelegate(id)).unwrap();
      setToastMessage("تم حذف المندوب بنجاح");
      setToastVariant("success");
    } catch {
      setToastMessage("حدث خطأ أثناء الحذف");
      setToastVariant("danger");
    } finally {
      setShowToast(true);
    }
  };

  // ✅ الفلترة النهائية
  const filteredDelegates = delegates.filter((delegate) => {
    const matchesName =
      filters.name === "" || delegate.name?.includes(filters.name);

    const matchPhone =
      filters.phone === "" || delegate.phone?.includes(filters.phone);

    const trader = users.find((user) => user.id === delegate.trader_id);
    const matchesTraderName =
      filters.trader === "" || trader?.name?.includes(filters.trader);

    const matchesGovernorate =
      filters.governorate === "" ||
      delegate.routes?.some(
        (r) =>
          r.governorate?.toLowerCase() ===
          filters.governorate.toLowerCase()
      );

    const matchesDay =
      filters.day === "" ||
      (filters.day === "ALL_DAYS" && delegate.routes?.length === 7) ||
      delegate.routes?.some((route) => route.day === filters.day);
    console.log("✅ filtering users", users);
    return (
      matchesName &&
      matchPhone &&
      matchesTraderName &&
      matchesGovernorate &&
      matchesDay
    );
  });

  return (
    <>
      <DelegatesPageHeader users={users} />

      <DelegatesFilter
        searchName={searchName}
        setSearchName={setSearchName}
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        searchTrader={searchTrader}
        setSearchTrader={setSearchTrader}
        selectedGovernorate={selectedGovernorate}
        setSelectedGovernorate={setSelectedGovernorate}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onSearchClick={handleSearchClick}
        onResetFilters={handleResetFilters}
      />

      {loading ? (
        <Loading />
      ) : (
        <DelegatesTbl
          delegates={filteredDelegates}
          selectedGovernorate={filters.governorate}
          searchName={filters.name}
          searchPhone={filters.phone}
          selectedDay={filters.day}
          onUpdateDelegate={handleUpdateDelegate}
          setEditModalData={setEditModalData}
          onDeleteDelegate={handleDeleteDelegate}
          users={users}
        />
      )}

      {/* ✅ مودال تعديل المندوب */}
      {editModalData && (
        <EditDelegateModal
          show={!!editModalData}
          delegate={editModalData}
          users={users}
          onClose={() => setEditModalData(null)}
          onUpdateSuccess={() => {
            setToastMessage("تم تعديل بيانات المندوب بنجاح");
            setToastVariant("success");
            setShowToast(true);
            setEditModalData(null);
          }}
          onUpdateFail={() => {
            setToastMessage("فشل في تعديل بيانات المندوب");
            setToastVariant("danger");
            setShowToast(true);
          }}
        />
      )}

      {/* ✅ التوست للرسائل */}
      <ToastContainer
        position="top-center"
        className="p-3"
        style={{ zIndex: 999999 }}
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="ms-auto">رسالة النظام</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
