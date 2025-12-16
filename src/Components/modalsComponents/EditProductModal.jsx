import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImagesToSupabase } from '../../Redux/uploadingImage';
import { GetCategories } from '../../Redux/slices/Categories';
import { GetUnits } from '../../Redux/slices/units';
import { fetchCompanies } from '../../Redux/slices/CompaniesSlice';
import { deleteImageFromStore, updateProduct } from '../../Redux/slices/ProductSlice';

const EditProductModal = ({ product, show, setShow }) => {
  const [images, setImages] = useState(product?.image ? [product.image] : []);
  const [PiecePrice, SetPiecePrice] = useState('');
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.Categories);
  const { Units } = useSelector((state) => state.Units);
  const { companies } = useSelector((state) => state.Companies);

  useEffect(() => {
    dispatch(GetCategories());
    dispatch(GetUnits());
    dispatch(fetchCompanies());
  }, [dispatch]);

  // دالة محسنة لحساب سعر القطعة مع ضبط التقريب
  const getPriceOfPiece = (price) => {
    const total = parseFloat(price);
    const quantity = parseInt(formik.values.quantity_per_unit);
    const finalTotal = isNaN(total) ? 0 : total;
    const finalQty = isNaN(quantity) ? 1 : quantity;
    
    // حل مشكلة التقريب باستخدام طريقة أكثر دقة
    const piece = Math.round((finalTotal / finalQty) * 100) / 100;
    SetPiecePrice(piece.toFixed(2));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    formik.setFieldValue('image', files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
  };

  // دالة محسنة لحفظ المنتج مع ضبط التقريب
  const handleEditPro = async () => {
    try {
      let imageUrl = product.image;
      if (formik.values.image.length > 0) {
        await deleteImageFromStore(imageUrl);
        const imageUrls = await uploadImagesToSupabase(formik.values.image, 'products');
        imageUrl = imageUrls[0];
      }

      // تأكد من القيم العشرية بدقة
      const traderprice = Math.round(parseFloat(formik.values.traderprice) * 100) / 100;
      const endPrice = formik.values.onSale ? 
        Math.round(parseFloat(formik.values.endPrice) * 100) / 100 : 
        traderprice;

      const updatedData = {
        ...formik.values,
        image: imageUrl,
        traderprice: traderprice,
        quantity_per_unit: parseInt(formik.values.quantity_per_unit),
        sale: formik.values.onSale ? parseFloat(formik.values.sale) : 0,
        endPrice: endPrice
      };

      console.log('بيانات المنتج قبل الحفظ:', updatedData);

      await dispatch(updateProduct({ id: product.id, updatedData })).unwrap();
      setShow(false);
    } catch (error) {
      console.error("❌ فشل في تحديث المنتج:", error.message);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('اسم المنتج مطلوب'),
    description: Yup.string().required('الوصف مطلوب'),
    traderprice: Yup.number()
      .required('السعر مطلوب')
      .min(0.01, 'يجب أن يكون السعر أكبر من 0'),
    endPrice: Yup.number()
      .min(0, 'السعر بعد الخصم يجب أن يكون موجب')
      .max(
        Yup.ref('traderprice'), 
        'السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي'
      )
      .when('onSale', {
        is: true,
        then: (schema) => schema.required('السعر بعد الخصم مطلوب'),
        otherwise: (schema) => schema.notRequired(),
      }),
    quantity_per_unit: Yup.number()
      .required('الكمية لكل وحدة مطلوبة')
      .min(1, 'يجب أن تكون الكمية على الأقل 1'),
    category_id: Yup.string().required('التصنيف مطلوب'),
    unit: Yup.string().required('الوحدة مطلوبة'),
    company_id: Yup.string().required('الشركة مطلوبة'),
    trader_id: Yup.string().required('التاجر مطلوب'),
    image: Yup.mixed(),
  });

  // دالة محسنة لحساب الخصم
  const handleSale = (endPrice) => {
    const traderPrice = parseFloat(formik.values.traderprice);
    endPrice = parseFloat(endPrice);

    if (traderPrice > 0 && endPrice >= 0 && endPrice <= traderPrice) {
      const salePercentage = ((traderPrice - endPrice) / traderPrice) * 100;
      formik.setFieldValue('sale', parseFloat(salePercentage.toFixed(2)));
      formik.setFieldValue('endPrice', Math.round(endPrice * 100) / 100);
    } else {
      formik.setFieldValue('sale', 0);
    }
  };

  const toggleSale = (checked) => {
    formik.setFieldValue('onSale', checked);
    if (!checked) {
      formik.setFieldValue('endPrice', Math.round(parseFloat(formik.values.traderprice) * 100) / 100);
      formik.setFieldValue('sale', 0);
    } else {
      formik.setFieldValue('endPrice', product?.endPrice || '');
    }
  };

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      traderprice: product?.traderprice || 0,
      endPrice: product?.endPrice || product?.traderprice || 0,
      onSale: product?.onSale || false,
      sale: product?.sale || 0,
      category_id: product?.category_id || '',
      trader_id: product?.trader_id || '',
      company_id: product?.company_id || '',
      unit: product?.unit || '',
      quantity_per_unit: product?.quantity_per_unit || 1,
      image: [],
      state: product?.state ?? true,
    },
    validationSchema,
    onSubmit: handleEditPro,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (product) {
      getPriceOfPiece(product.traderprice);
      if (product.onSale && product.endPrice) {
        handleSale(product.endPrice);
      }
    }
  }, [product]);

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)} centered dialogClassName="AddProductModal">
   <Modal.Header>
          <div className="border-0 pb-0 d-flex align-items-center justify-content-between w-100">
            <Modal.Title>تعديل المنتج</Modal.Title>
            <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => setShow(false)} />
          </div>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form noValidate onSubmit={formik.handleSubmit}>
            <Row>
             <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>اسم المنتج</Form.Label>
                  <Form.Control
                    name='name'
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type="text"
                    placeholder="ادخل اسم المنتج"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger">{formik.errors.name}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>التصنيف</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formik.values.category_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
                  {formik.touched.category_id && formik.errors.category_id && (
                    <div className="text-danger">{formik.errors.category_id}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>الوحدة</Form.Label>
                  <Form.Select
                    name="unit"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">اختر الوحدة</option>
                    {Units.map((unit) => (
                      <option key={unit.name} value={unit.name}>{unit.name}</option>
                    ))}
                  </Form.Select>
                  {formik.touched.unit && formik.errors.unit && (
                    <div className="text-danger">{formik.errors.unit}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>الشركة المصنعة</Form.Label>
                  <Form.Select
                    name="company_id"
                    value={formik.values.company_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </Form.Select>
                  {formik.touched.company_id && formik.errors.company_id && (
                    <div className="text-danger">{formik.errors.company_id}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>حالة المنتج</Form.Label>
                  <Form.Select
                    className={formik.values.state ? 'text-success' : 'text-danger'}
                    name="state"
                    value={formik.values.state}
                    onChange={(e) => formik.setFieldValue('state', e.target.value === 'true')}
                    onBlur={formik.handleBlur}
                  >
                    <option className="text-success" value={true}>متاح</option>
                    <option className="text-danger" value={false}>غير متاح</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>الكمية للوحدة</Form.Label>
                  <Form.Control
                    type="number"
                    name='quantity_per_unit'
                    placeholder="أدخل الكمية"
                    onChange={(e) => {
                      formik.handleChange(e);
                      getPriceOfPiece(formik.values.traderprice);
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.quantity_per_unit}
                  />
                  {formik.touched.quantity_per_unit && formik.errors.quantity_per_unit && (
                    <div className="text-danger">{formik.errors.quantity_per_unit}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name='traderprice'
                    placeholder="جنيه مصري"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      formik.setFieldValue('traderprice', value);
                      getPriceOfPiece(value);
                      if (!formik.values.onSale) {
                        formik.setFieldValue('endPrice', value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.traderprice}
                    step="0.01"
                    min="0"
                  />
                  {formik.touched.traderprice && formik.errors.traderprice && (
                    <div className="text-danger">{formik.errors.traderprice}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={8} className="mb-3">
                <div className='d-flex align-items-center mt-2'>
                  <label className="checkbox-wrapper ms-3">
                    <input
                      type="checkbox"
                      checked={formik.values.onSale}
                      onChange={(e) => toggleSale(e.target.checked)}
                    />
                    <Form.Label className='mt-2' style={{ fontSize: '18px' }}>تفعيل الخصم</Form.Label>
                  </label>
                  {formik.values.onSale &&
                    <Form.Group className="ms-3">
                     
                      
                  <Form.Label  style={{marginRight:25}}>السعر بعد الخصم</Form.Label>
                     
                      <Form.Control
                        style={{width:150,marginRight:25}}
                        placeholder='السعر ب الخصم'
                        type="number"
                        name='endPrice'
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          formik.setFieldValue('endPrice', value);
                          handleSale(value);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.endPrice}
                        step="0.01"
                        min="0"
                        max={formik.values.traderprice}
                      />
                      {formik.touched.endPrice && formik.errors.endPrice && (
                        <div className="text-danger">{formik.errors.endPrice}</div>
                      )}
                      {formik.values.sale > 0 && (
                        <div  style={{marginRight:25}} className="text-success mt-1">
                          نسبة الخصم: {parseFloat(formik.values.sale).toFixed(2)}%
                        </div>
                      )}
                    </Form.Group>
                  }
                </div>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    placeholder="اكتب وصف المنتج"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-danger">{formik.errors.description}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>تحديث صورة المنتج</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    onBlur={formik.handleBlur}
                  />
                </Form.Group>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="preview"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Button type="submit" className="btn-warning w-100 mt-4">
              حفظ التعديل
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditProductModal;