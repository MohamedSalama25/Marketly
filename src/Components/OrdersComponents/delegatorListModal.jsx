import React, { useEffect } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDelegates } from '../../Redux/slices/DelegatesSlice';
import { getOrders, updateOrder } from '../../Redux/slices/OrdersSlice';
import avatar from "../../assets/Images/user.png"

function DelegatorListModal({ show, Setshow, location }) {
  const dispatch = useDispatch();
  const { delegates, loading } = useSelector((state) => state.Delegates);
  // console.log(delegates);
 
  useEffect(() => {
    if (show) dispatch(fetchDelegates());
  }, [dispatch, show]);

  function onClose() {
    Setshow(false);
  }


  const normalize = (str) => str?.toLowerCase().trim();

  return (
    <Modal show={show}  >
       <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between w-100" dir="rtl">
          <Modal.Title>اختيار مندوب</Modal.Title>
          <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => Setshow(false)} />

        </Modal.Header>
    

      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
            <Spinner animation="border" variant="primary" />
          
          </div>
        ) : delegates.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="fa-solid fa-user-slash fa-2x mb-2"></i>
            <p>لا يوجد مناديب متاحين حالياً</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {delegates
              .filter(d =>
                Array.isArray(d.routes) &&
                d.routes.some(r =>
                  normalize(r.governorate)==(normalize(location.governorate)) 
                )
              )
              .map((delegate, idx) => (
               <div key={delegate.id || idx} className="border rounded p-3 bg-light shadow-sm text-center">

 
  <div className="d-flex flex-column align-items-center mb-3">
    <img
      src={delegate.image || avatar} 
      alt={delegate.name}
      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
      className="rounded-circle mb-2 shadow"
    />
    <h5 className="mb-0 text-dark">{delegate.name || '--'}</h5>
  </div>


  <div className="mb-2">
    <strong>المنطقة:</strong>{' '}
    {[...new Set(
      delegate.routes
        .filter(r =>
          (normalize(r.governorate)?.includes(normalize(location.governorate)) ||
           normalize(r.route)?.includes(normalize(location.city)))
        )
        .map(r => r.route)
    )].map((route, i) => (
      <Badge key={i} bg="secondary" className="me-1">{route}</Badge>
    ))}
  </div>


  <div className="mb-2">
    <strong>الأيام:</strong>{' '}
    {delegate.routes
     
      .map((r, i) => (
        <Badge bg="info" key={i} className="me-1">{r.day}</Badge>
      ))}
  </div>

 
  <div>
    <strong>رقم الهاتف:</strong> {delegate.phone || '--'}
  </div>
<Button
  className="btn-primary w-100 mt-3"
  type="button"
  onClick={async () => {
    await dispatch(updateOrder({ id: location.orderId, updatedData: { delegator: delegate.id,status:'inprogress' } }));
    dispatch(getOrders());
    onClose();
  }}
>
  ارسال الطلب
</Button>

</div>

              ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>إغلاق</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DelegatorListModal;
