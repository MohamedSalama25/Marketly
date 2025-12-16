import React, { useEffect, useState } from "react";
import "../../css/Table.css";
import { useDispatch, useSelector } from "react-redux";
import { getDoneOrders } from "../../Redux/slices/OrdersSlice";
import OrdersFilter from "./SalesFilter";
import { FaEye, FaPrint } from "react-icons/fa";
import Loading from "../globalComonents/loading";
import { UserRole } from "../../Redux/slices/token";
import { supabase } from "../../Supabase/SupabaseClient";
import RowsPerPageSelector from "../globalComonents/RowsPerPageSelector";
import EmptyState from "../Notfound/EmptyState";

const SalesTbl = () => {
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.Orders);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentOrders, setcurrentOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    dispatch(getDoneOrders());
  }, [dispatch, UserRole]);

  useEffect(() => {
    // تحديث حالة وجود البيانات عند تغيير الطلبات
    setHasData(orders.length > 0);
  }, [orders]);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchName =
        searchName === "" ||
        (order.user?.name &&
          order.user.name.toLowerCase().includes(searchName.toLowerCase()));

      const matchGov =
        selectedGovernorate === "" ||
        (order.user?.governorate &&
          order.user.governorate
            .toLowerCase()
            .includes(selectedGovernorate.toLowerCase()));

      return matchName && matchGov;
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchName, selectedGovernorate, orders, setRowsPerPage]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const sliced = filteredOrders.slice(startIndex, startIndex + rowsPerPage);
    setcurrentOrders(sliced);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const onResetFilters = () => {
    setSearchName("");
    setStartDate(null);
    setEndDate(null);
    setSelectedGovernorate("");
    setCurrentPage(1);
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "قيد التنفيذ": return "gold";
      case "تم التوصيل": return "#065f12ff";
      case "ملغي": return "#ca1c1cff";
      default: return "#000000ff";
    }
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
    const win = window.open("", "", "height=700,width=900");
    win.document.write("<html><head><title>فاتورة الطلب</title>");
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
    win.document.write("</head><body >");
    win.document.write(`<div class="invoice-container">${printContents}</div>`);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const formatArabicDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    const toArabicDigits = (n) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
    const day = toArabicDigits(date.getDate());
    const month = toArabicDigits(date.getMonth() + 1);
    const year = toArabicDigits(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  const totalSales = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const completedOrdersCount = currentOrders.length;

  const onSearchClick = () => {
    const filtered = orders.filter((order) => {
      const matchName =
        searchName === "" ||
        (order.user?.name &&
          order.user.name.toLowerCase().includes(searchName.toLowerCase()));

      const matchGov =
        selectedGovernorate === "" ||
        (order.user?.governorate &&
          order.user.governorate.toLowerCase().includes(selectedGovernorate.toLowerCase()));

      const orderDate = new Date(order.created_at);
      const matchStartDate = !startDate || orderDate >= new Date(startDate);
      const matchEndDate = !endDate || orderDate <= new Date(endDate);

      return matchName && matchGov && matchStartDate && matchEndDate;
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {hasData && (
        <OrdersFilter
          searchName={searchName}
          setSearchName={setSearchName}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedGovernorate={selectedGovernorate}
          setSelectedGovernorate={setSelectedGovernorate}
          onResetFilters={onResetFilters}
          onSearchClick={onSearchClick}
        />
      )}

      {filteredOrders.length === 0 ? (
<EmptyState
    title="لا يوجد مبيعات"
    description="لا يوجد مبيعات  لم يتم تسجيل أي مبيعات بعد."
    actionText="إعادة تعيين الفلتر"
    onActionClick={onResetFilters}
    icon="fa-shopping-cart"
  />

      ) : (
        <div className="user-table z-0">
          <table border="1" width="100%" dir="rtl" className="table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>رقم العميل</th>
                <th>المحافظة</th>
                {UserRole == "admin" && <th>التاجر</th>}
                <th>تاريخ الطلب</th>
                <th>عرض الطلب</th>
                <th>إجمالى الطلب</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.user?.name || "--"}</td>
                  <td>{order.user?.phone || "--"}</td>
                  <td>{order.user?.governorate || "--"}</td>
                  {UserRole == "admin" && <td>{order.trader_id?.name || "--"}</td>}
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
                        margin: "0 auto",
                      }}
                      title="عرض الطلب"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <FaEye size={16} />
                    </div>
                  </td>
                  <td>{order.total} <span className="px-1">ج.م</span></td>
                </tr>
              ))}
              <tr className="bg-light fw-bold">
                <td>عدد الطلبات</td>
                <td>{completedOrdersCount}</td>
                <td></td>
                {UserRole == "admin" && <td></td>}
                <td></td>
                <td>إجمالى المبيع</td>
                <td>{totalSales} ج.م </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {filteredOrders.length > 0 && (
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
            عرض {(currentPage - 1) * rowsPerPage + 1} -{" "}
            {Math.min(currentPage * rowsPerPage, filteredOrders.length)} من أصل{" "}
            {filteredOrders.length} طلب
          </p>
        </div>
      )}

      {viewModalOpen && (
        <div
          className="modal show fade d-block modal-lg"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
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
                <div
                  style={{
                    border: "0.1rem solid #00000073",
                    borderRadius: 12,
                    padding: 24,
                    background: "#fff",
                    maxWidth: 700,
                    margin: "0 auto",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="fw-bold mb-1">فاتورة بيع</h2>
                      <div style={{ fontSize: 15 }}>
                        رقم الطلب: <span className="fw-bold">{viewOrderId}</span>
                      </div>
                    </div>
                  </div>
                  {orders
                    .filter((x) => x.id === viewOrderId)
                    .map((order) => (
                      <>
                        <div className="mb-2" style={{ fontSize: 16 }}>
                          <span className="fw-bold">اسم العميل:</span>{" "}
                          {order.user?.name || "--"}
                        </div>
                        <div className="mb-2" style={{ fontSize: 16 }}>
                          <span className="fw-bold"> رقم الهاتف:</span>{" "}
                          {order.user?.phone || "--"}
                        </div>
                        <div className="mb-2" style={{ fontSize: 16 }}>
                          <span className="fw-bold">المدينة:</span>{" "}
                          {order.user?.city || "--"}
                        </div>
                        <div className="mb-2" style={{ fontSize: 16 }}>
                          <span className="fw-bold">العنوان:</span>{" "}
                          {order.user?.location || "--"}
                        </div>
                        <div className="mb-2" style={{ fontSize: 16 }}>
                          <span className="fw-bold">تاريخ الطلب:</span>{" "}
                          {formatArabicDate(order.created_at)}
                        </div>
                      </>
                    ))}
                  <table
                    className="table table-bordered text-center mb-4 mt-4"
                    style={{ fontSize: 16 }}
                  >
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
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td>{item.product_id?.name || item.name || "--"}</td>
                          <td>
                            {item.product_id?.image || item.image ? (
                              <img
                                src={item.product_id?.image || item.image}
                                alt={item.product_id?.name || item.name || "--"}
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
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders
                    .filter((x) => x.id === viewOrderId)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="d-flex justify-content-start align-items-center mt-3"
                        style={{ fontSize: 18 }}
                      >
                        <div
                          className="border p-3 rounded bg-light"
                          style={{ minWidth: 250 }}
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <span>المجموع الكلي:</span>
                            <span className="fw-bold">{order.total} ج.م</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>طريقة الدفع:</span>
                            <span>{order.payment_method}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>حالة الطلب:</span>
                            <span
                              style={{
                                color: getStatusBgColor(order.status),
                                fontWeight: "bold",
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div
                    className="text-center mt-4"
                    style={{ fontSize: 15, color: "#888" }}
                  >
                    شكرًا لتعاملكم معنا
                  </div>
                </div>
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handlePrintInvoice}
                >
                  <FaPrint size={18} />
                  <span>طباعة</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewModalOpen(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesTbl;