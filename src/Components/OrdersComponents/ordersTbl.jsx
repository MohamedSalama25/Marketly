import React, { useEffect, useState } from "react";
import "../../css/Table.css";
import { useDispatch, useSelector } from "react-redux";
import {
    getOrders,
    deleteOrder,
    updateOrder,
} from "../../Redux/slices/OrdersSlice";
import OrdersFilter from "./OrdersFilter";
import CustomMenu from "../globalComonents/CustomMenu";
import LabeledMenu from "../globalComonents/LabeledMenu";
import { FaEye, FaPrint } from "react-icons/fa";
import DelegatorListModal from "../OrdersComponents/delegatorListModal";
import Loading from "../globalComonents/loading";
import { fetchOrderItems } from "../../Redux/slices/OrderItems";
import { UserRole } from "../../Redux/slices/token";
import { supabase } from "../../Supabase/supabaseClient";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import EmptyState from "../Notfound/EmptyState";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import NotificationModal from "../modalsComponents/NotificationModal";

const OrdersTbl = () => {
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.Orders);

    const [currentPage, setCurrentPage] = useState(1);
    const [currentOrders, setcurrentOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [SelectedOrders, SetSelectedOrders] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [selectedGovernorate, setSelectedGovernorate] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [OrderLocaction, SetOrderLocaction] = useState({});
    const [showDelegateModal, setshowDelegateModal] = useState(false);

    useEffect(() => {
        dispatch(getOrders());
    }, [dispatch, UserRole]);

    useEffect(() => {
        const filtered = orders.filter((order) => {
            const matchName =
                searchName === "" ||
                (order.user?.name && order.user.name.toLowerCase().includes(searchName.toLowerCase()));
            const matchId =
                searchId === "" ||
                (order.id===searchId);

            const matchState =
                selectedState === "" ||
                (order.status && order.status.toLowerCase().includes(selectedState.toLowerCase()));

            const matchGov =
                selectedGovernorate === "" ||
                (order.user?.governorate && order.user.governorate.toLowerCase().includes(selectedGovernorate.toLowerCase()));

            return matchName && matchId && matchState && matchGov;
        });
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchName,searchId, selectedGovernorate, selectedState, orders, rowsPerPage]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const sliced = filteredOrders.slice(startIndex, startIndex + rowsPerPage);
        setcurrentOrders(sliced);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    const onResetFilters = () => {
        setSearchName("");
        setSearchId("");
        setSelectedState("");
        setSelectedGovernorate("");
        setCurrentPage(1);
    };

    const orderStatuses = ["returns", "done", "inprogress", "pending"];

    const getStatusBgColor = (status) => {
        switch (status) {
            case "pending": return "gold";
            case "done": return "#065f12ff";
            case "inprogress": return "#007bff";
            case "returns": return "#ca1c1cff";
            default: return "#000000ff";
        }
    };

    const [stateModalOpen, setStateModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const handleOpenStateModal = (order) => {
        setOrderToEdit(order);
        setNewStatus(order.status || "");
        setStateModalOpen(true);
    };

    const handleUpdateOrderStatus = async () => {
        if (!orderToEdit || !newStatus) return;
        await dispatch(updateOrder({ id: orderToEdit.id, updatedData: { status: newStatus } }));
        setStateModalOpen(false);
        setOrderToEdit(null);
        dispatch(fetchOrderItems());
    };

    const [bulkStateModalOpen, setBulkStateModalOpen] = useState(false);
    const [bulkNewStatus, setBulkNewStatus] = useState("");

    const handleBulkUpdateOrderStatus = async () => {
        // if (!bulkNewStatus || SelectedOrders.length === 0) return;
        if (SelectedOrders.length === 0) {
            setNotification({
                isOpen: true,
                message: "من فضلك، يجب تحديد طلب واحد على الأقل لتعديل الحالة."
            });
            return;
        }
        for (const id of SelectedOrders) {
            await dispatch(updateOrder({ id, updatedData: { status: bulkNewStatus } }));
        }
        setBulkStateModalOpen(false);
        setBulkNewStatus("");
        SetSelectedOrders([]);
    };

    // const handleBulkDeleteOrders = async () => {
    //     if (SelectedOrders.length === 0) return;
    //     if (!window.confirm(`هل أنت متأكد أنك تريد حذف ${SelectedOrders.length} طلب؟`)) return;
    //     for (const id of SelectedOrders) {
    //         await supabase.from("order_items").delete().eq("order_id", id);
    //         await dispatch(deleteOrder(id));
    //     }
    //     SetSelectedOrders([]);
    //     dispatch(getOrders());
    // };

    const handleBulkDeleteOrders = () => {
        // if (SelectedOrders.length === 0) {
        //     // يمكن استخدام مودال تنبيه هنا أيضًا لو أردت، لكن alert سريع ومناسب للخطأ
        //     alert("من فضلك اختر طلبات أولاً");
        //     return;
        // }
        if (SelectedOrders.length === 0) {
            setNotification({
                isOpen: true,
                message: "من فضلك، يجب تحديد طلب واحد على الأقل لتنفيذ الحذف."
            });
            return;
        }
        setConfirmModal({
            open: true,
            message: `هل أنت متأكد أنك تريد حذف ${SelectedOrders.length} طلب؟`,
            confirmText: "نعم، احذف",
            confirmClass: "btn-danger",
            onConfirm: async () => {
                for (const id of SelectedOrders) {
                    await supabase.from("order_items").delete().eq("order_id", id);
                    await dispatch(deleteOrder(id));
                }
                SetSelectedOrders([]);
                dispatch(getOrders());
                setConfirmModal({ ...confirmModal, open: false }); // إغلاق المودال بعد التنفيذ
            },
        });
    };


    // const handleDeleteOrder = async (orderId) => {
    //     if (window.confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟")) {
    //         await supabase.from("order_items").delete().eq("order_id", orderId);
    //         await dispatch(deleteOrder(orderId));
    //         SetSelectedOrders(prev => prev.filter(id => id !== orderId));
    //         dispatch(getOrders());
    //     }
    // };

    const handleDeleteOrder = (order) => {
        setConfirmModal({
            open: true,
            message: `هل أنت متأكد من حذف طلب العميل (${order.user?.name || '---'})؟`,
            confirmText: "نعم، احذف",
            confirmClass: "btn-danger",
            onConfirm: async () => {
                await supabase.from("order_items").delete().eq("order_id", order.id);
                await dispatch(deleteOrder(order.id));
                SetSelectedOrders(prev => prev.filter(id => id !== order.id));
                dispatch(getOrders());
                setConfirmModal({ ...confirmModal, open: false }); // إغلاق المودال بعد التنفيذ
            },
        });
    };


    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [viewOrderId, setViewOrderId] = useState(null);
    const handleViewOrder = async (orderId) => {
        setViewOrderId(orderId);
        setViewModalOpen(true);
        const { data, error } = await supabase
            .from("order_items")
            .select(`*, product_id (name, image)`)
            .eq("order_id", orderId);
        if (!error) setOrderItems(data || []);
        else setOrderItems([]);
    };

    const handlePrintInvoice = () => {
        const printContents = document.getElementById("order-invoice-print").innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        win.document.write('<html><head><title>فاتورة الطلب</title>');
        win.document.write(`
            <style>
                body{direction:rtl;font-family:tahoma,Arial,sans-serif;background:#fff;}
                .invoice-container{border-radius:12px;padding:24px;max-width:700px;margin:0 auto;background:#fff;}
                h2{color:#007bff;text-align:center;font-weight:bold;}
                .invoice-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
                .invoice-header .order-id{font-size:15px;}
                .customer-info{font-size:16px;margin-bottom:8px;}
                .table{width:100%;border-collapse:collapse;margin:24px 0;}
                .table th,.table td{border:1px solid #ccc;padding:8px;text-align:center;}
                .table th{background:#f8f9fa;}
                .summary{display:flex;justify-content:start;align-items:center;margin-top:24px;font-size:18px;}
                .summary-box{border:1px solid #eee;padding:16px;border-radius:8px;background:#f7f7f7;min-width:250px;}
                .summary-box div{display:flex;justify-content:space-between;margin-bottom:8px;} 
                .thanks{text-align:center;margin-top:32px;font-size:15px;color:#888;}
            </style>
        `);
        win.document.write('</head><body >');
        win.document.write(`<div class="invoice-container">${printContents}</div>`);
        win.document.write('</body></html>');
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    const formatArabicDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        const toArabicDigits = n => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
        const day = toArabicDigits(date.getDate());
        const month = toArabicDigits(date.getMonth() + 1);
        const year = toArabicDigits(date.getFullYear());
        return `${day}-${month}-${year}`;
    };


    // ConfirmModal
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        message: "",
        confirmText: "نعم، حذف",
        confirmClass: "btn-danger",
        onConfirm: () => { },
    });
    // ConfirmModal

    //NotificationModal
    const [notification, setNotification] = useState({ isOpen: false, message: "" });
    //NotificationModal

    return (
        <>

         <OrdersFilter
                        searchName={searchName}
                        setSearchName={setSearchName}
                          searchId={searchId}
                        setSearchId={setSearchId}
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        selectedGovernorate={selectedGovernorate}
                        setSelectedGovernorate={setSelectedGovernorate}
                        onResetFilters={onResetFilters}
                    />
            {loading ? (
                <Loading />
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    title="لا توجد طلبات"
                    description="لا يوجد طلبات مطابقة لبحثك أو لم يتم إضافة أي طلبات بعد."
                    actionText="إعادة تعيين الفلتر"
                    onActionClick={onResetFilters}
                    icon="fa-file-invoice"
                />
            ) : (
                <div>
                   

                    <div className="user-table">
                        <table border="1" width="100%" dir="rtl" className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <label className="checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    currentOrders.length > 0 &&
                                                    currentOrders.every((order) => SelectedOrders.includes(order.id))
                                                }
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        SetSelectedOrders(prev => [
                                                            ...prev,
                                                            ...currentOrders
                                                                .map(o => o.id)
                                                                .filter(id => !prev.includes(id))
                                                        ]);
                                                    } else {
                                                        SetSelectedOrders(prev => prev.filter(id => !currentOrders.map(o => o.id).includes(id)));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </th>
                                    <th>اسم العميل</th>
                                    <th>رقم العميل</th>
                                    <th>المحافظة</th>
                                    <th>المدينة</th>
                                    <th>الحاله</th>
                                    <th>المندوب</th>
                                    <th>المجموع</th>
                                    <th>تاريخ الطلب</th>
                                    <th>عرض الطلب</th>
                                    <th style={{ position: "relative", zIndex: 1 }}>
                                        <CustomMenu
                                            options={[
                                                {
                                                    label: "تعديل الحالة", 
                                                     icon: "fa-solid fa-pen-to-square",
                                                    color:'#915EF6', 
                                                    onClick: () => {
                                                        if (SelectedOrders.length === 0) {
                                                            setNotification({
                                                                isOpen: true,
                                                                message: "من فضلك، يجب تحديد طلب واحد على الأقل لتعديل الحالة."
                                                            });
                                                            return;
                                                        }
                                                        setBulkStateModalOpen(true);
                                                    }
                                                },
                                                {
                                                    label: "مسح المحدد", 
                                                    icon: "fa-solid fa-trash", 
                                                    color: "red", 
                                                    // onClick: () => {
                                                    //     if (SelectedOrders.length === 0) {
                                                    //         alert("من فضلك اختر طلبات أولاً");
                                                    //         return;
                                                    //     }
                                                    //     handleBulkDeleteOrders()
                                                    // }
                                                    onClick: handleBulkDeleteOrders
                                                }
                                            ]}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <label className="checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={SelectedOrders.includes(order.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            SetSelectedOrders((prev) => [...prev, order.id]);
                                                        } else {
                                                            SetSelectedOrders((prev) => prev.filter((id) => id !== order.id));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </td>
                                        <td>{order.user?.name || "--"}</td>
                                        <td>{order.user?.phone || "--"}</td>
                                        <td>{order.user?.governorate || "--"}</td>
                                        <td>{order.user?.city || "--"}</td>
                                        <td style={{ color: getStatusBgColor(order.status), fontWeight: 'bold' }}>
                                            {order.status=='done'&&'تم الاستلام'||
                                            order.status=='pending'&&'معلق'||
                                            order.status=='returns'&&'مرتجع'||
                                            order.status=='inprogress'&&'قيد التنفيذ'}
                                        </td>
                                        <td>{order.delegator?.name || "--"}</td>
                                        <td>{order.total} <span className="px-1">ج.م</span></td>
                                        <td>{formatArabicDate(order.created_at)}</td>
                                        <td>
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    backgroundColor: "#e7f1ff",
                                                    color: "#0d6efd",
                                                    cursor: "pointer",
                                                    fontSize: "1rem",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: "0 auto"  
                                                }}
                                                title="عرض الطلب"
                                                onClick={() => handleViewOrder(order.id)}
                                            >
                                                <FaEye size={16} />
                                            </div>
                                        </td>
                                        <td>
                                            <CustomMenu
                                                id={order.id}
                                               options={[
  ...(order.status === "pending" || order.status === "inprogress"
    ? [
        {
          label: "تعديل الحالة",
           icon: "fa-solid fa-pen-to-square",
           color:'#915EF6',
          onClick: () => handleOpenStateModal(order),
        },
        {
          label: "اختيار مندوب",
          icon: "fa-solid fa-user",
          color: "#915EF6",
          onClick: () => {
            setshowDelegateModal(true);
            SetOrderLocaction({
              orderId: order.id,
              governorate: order.user.governorate,
              location: order.user.location,
              city: order.user.city,
            });
          },
        },
      ]
    : []),
  {
    label: "مسح الطلب",
    icon: "fa-solid fa-trash",
    color: "red",
    onClick: () => handleDeleteOrder(order),
  },
]}

                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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
                            عرض {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredOrders.length)} من أصل {filteredOrders.length} طلب
                        </p>
                    </div>
                </div>
            )}

            {stateModalOpen && orderToEdit && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content text-end">
                            <div className="modal-header">
                                <h5 className="modal-title w-100 text-center fw-bold">
                                    تعديل حالة الطلب
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setStateModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label fw-bold">اختر الحالة الجديدة:</label>
                                <select
                                    className="form-control text-end"
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                >
                                    <option value="">اختر الحالة</option>
                                    {orderStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status=='done'&&'تم الاستلام'||
                                            status=='pending'&&'معلق'||
                                            status=='returns'&&'مرتجع'||
                                            status=='inprogress'&&'قيد التنفيذ'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer justify-content-end">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setStateModalOpen(false)}
                                >
                                    إلغاء
                                </button>
                                <button
                                    className="btn btn-primary"
                                    disabled={!newStatus || newStatus === orderToEdit.status}
                                    onClick={handleUpdateOrderStatus}
                                >
                                    تأكيد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bulkStateModalOpen && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content text-end">
                            <div className="modal-header">
                                <h5 className="modal-title w-100 text-center fw-bold">
                                    تعديل حالة {SelectedOrders.length} طلب
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setBulkStateModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label fw-bold">اختر الحالة الجديدة:</label>
                                <select
                                    className="form-control text-end"
                                    value={bulkNewStatus}
                                    onChange={e => setBulkNewStatus(e.target.value)}
                                >
                                    <option value="">اختر الحالة</option>
                                    {orderStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status=='done'&&'تم الاستلام'||
                                            status=='pending'&&'معلق'||
                                            status=='returns'&&'مرتجع'||
                                            status=='inprogress'&&'قيد التنفيذ'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer justify-content-end">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setBulkStateModalOpen(false)}
                                >
                                    إلغاء
                                </button>
                                <button
                                    className="btn btn-primary"
                                    disabled={!bulkNewStatus}
                                    onClick={handleBulkUpdateOrderStatus}
                                >
                                    تأكيد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewModalOpen && (
                <div className="modal show fade d-block modal-lg" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content text-end">
                            <div className="modal-header">
                                <h5 className="modal-title w-100 text-center fw-bold">
                                    فاتورة الطلب رقم {viewOrderId}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setViewModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body" id="order-invoice-print">
                                <div style={{ border: '0.1rem solid #00000073', borderRadius: 12, padding: 24, background: '#fff', maxWidth: 700, margin: '0 auto' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h2 className="fw-bold mb-1">فاتورة بيع</h2>
                                            <div style={{ fontSize: 15 }}>رقم الطلب: <span className="fw-bold">{viewOrderId}</span></div>
                                        </div>
                                    </div>
                                    {orders.filter(x => x.id === viewOrderId).map(order => (
                                        <>
                                            <div className="mb-2" style={{ fontSize: 16 }}>
                                                <span className="fw-bold">اسم العميل:</span> {order.user?.name || "--"}
                                            </div>
                                            <div className="mb-2" style={{ fontSize: 16 }}>
                                                <span className="fw-bold"> رقم الهاتف:</span> {order.user?.phone || "--"}
                                            </div>
                                            <div className="mb-2" style={{ fontSize: 16 }}>
                                                <span className="fw-bold">المدينة:</span> {order.user?.city || "--"}
                                            </div>
                                            <div className="mb-2" style={{ fontSize: 16 }}>
                                                <span className="fw-bold">العنوان:</span> {order.user?.location || "--"}
                                            </div>
                                            <div className="mb-2" style={{ fontSize: 16 }}>
                                                <span className="fw-bold">تاريخ الطلب:</span> {formatArabicDate(order.created_at)}
                                            </div>
                                        </>
                                    ))}
                                    <table className="table table-bordered text-center mb-4 mt-4" style={{ fontSize: 16 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>م</th>
                                                <th>اسم المنتج</th>
                                                <th>صورة المنتج</th>
                                                <th>الكمية</th>
                                                <th>السعر</th>
                                                <th>الإجمالي</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, idx) => (
                                                <tr key={item.id}
                                                 style={item.quantity === 0 ? { textDecoration: 'line-through' } : {}}
                                                >
                                                    <td>{idx + 1}</td>
                                                    <td>{item.product_id?.name || item.name || '--'}</td>
                                                    <td>
                                                        {item.product_id?.image || item.image ? (
                                                            <img
                                                                src={item.product_id?.image || item.image}
                                                                alt={item.product_id?.name || item.name || '--'}
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                                            />
                                                        ) : (
                                                            <span>--</span>
                                                        )}
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price}</td>
                                                    <td>{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {orders.filter(x => x.id === viewOrderId).map(order => (
                                        <div key={order.id} className="d-flex justify-content-start align-items-center mt-3" style={{ fontSize: 18 }}>
                                            <div className="border p-3 rounded bg-light" style={{ minWidth: 250 }}>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>المجموع الكلي:</span>
                                                    <span className="fw-bold">{order.total} ج.م</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>طريقة الدفع:</span>
                                                    <span>عند الاستلام</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>حالة الطلب:</span>
                                                    <span style={{ color: getStatusBgColor(order.status), fontWeight: 'bold' }}>
                                                       {order.status=='done'&&'تم الاستلام'||
                                            order.status=='pending'&&'معلق'||
                                            order.status=='returns'&&'مرتجع'||
                                            order.status=='inprogress'&&'قيد التنفيذ'}
                                                        </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center mt-4" style={{ fontSize: 15, color: '#888' }}>شكرًا لتعاملكم معنا</div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-end">
                                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handlePrintInvoice}>
                                    <FaPrint size={18} />
                                    <span>طباعة</span>
                                </button>
                                <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DelegatorListModal show={showDelegateModal} Setshow={setshowDelegateModal} location={OrderLocaction} />
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
};

export default OrdersTbl;