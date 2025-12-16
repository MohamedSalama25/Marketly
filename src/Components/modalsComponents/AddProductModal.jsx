import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import '../../css/global.css';
import PrimaryButton from '../globalComonents/PrimaryButton';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct } from '../../Redux/slices/ProductSlice';
import { uploadImagesToSupabase } from '../../Redux/uploadingImage';
import { GetCategories } from '../../Redux/slices/Categories';
import { GetUnits } from '../../Redux/slices/units';
import { fetchCompanies } from '../../Redux/slices/CompaniesSlice';
import { UserRole } from '../../Redux/slices/token';

const AddProductModal = () => {
  const [images, setImages] = useState([]);
  const [show, setShow] = useState(false);
  const [PiecePrice, SetPiecePrice] = useState('');
  const { categories } = useSelector((state) => state.Categories);
  const { Units } = useSelector((state) => state.Units);
  const { companies } = useSelector((state) => state.Companies);
  const { token } = useSelector(state => state.Token);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetCategories());
    dispatch(GetUnits());
    dispatch(fetchCompanies());
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    formik.setFieldValue('image', files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImages(previews);
  };

  const getPriceOfPiece = (price) => {
    const total = Number(price);
    const quantity = Number(formik.values.quantity_per_unit);
    const finalTotal = isNaN(total) ? 0 : total;
    const finalQty = isNaN(quantity) ? 1 : quantity;

    const piece = finalTotal / finalQty;
    SetPiecePrice(piece.toFixed(2));
  };

  const handleAddPro = async () => {
    const imageUrls = await uploadImagesToSupabase(formik.values.image, 'products');

    const values = {
      ...formik.values,
      image: imageUrls[0],
      traderprice: Number(formik.values.traderprice),
      quantity_per_unit: Number(formik.values.quantity_per_unit),
      sale: formik.values.onSale ? Number(formik.values.sale) : 0,
      endPrice: formik.values.onSale ? Number(formik.values.endPrice) : Number(formik.values.traderprice)
    };

    if (Object.values(values).some(val => typeof val === 'number' && isNaN(val))) {
      console.error("❌ تأكد من ملء جميع الحقول الرقمية");
      return;
    }

    await dispatch(createProduct(values)).unwrap();
    formik.resetForm();
    setImages([]);
    setShow(false);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('اسم المنتج مطلوب'),
    description: Yup.string().required('الوصف مطلوب'),
    traderprice: Yup.number().required('السعر مطلوب').min(1),
    endPrice: Yup.number()
      .min(1, 'السعر بعد الخصم يجب أن يكون أكبر من 0')
      .when('onSale', {
        is: true,
        then: (schema) => schema.required('السعر بعد الخصم مطلوب'),
        otherwise: (schema) => schema.notRequired(),
      }),
    quantity_per_unit: Yup.number().required('الكمية لكل وحدة مطلوبة').min(1),
    category_id: Yup.string().required('التصنيف مطلوب'),
    unit: Yup.string().required('الوحدة مطلوبة'),
    company_id: Yup.string().required('الشركة مطلوبة'),
    trader_id: Yup.string().required('التاجر مطلوب'),
    image: Yup.mixed().test(
      'required',
      'الصورة مطلوبة',
      (value) => value && value.length > 0
    ),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: '',
      traderprice: 0,
      endPrice: 0,
      onSale: false,
      sale: 0,
      category_id: "",
      trader_id: token,
      company_id: "",
      unit: "",
      quantity_per_unit: 12,
      image: [],
      state: true,
      publish: false,
    },
    validationSchema,
    onSubmit: handleAddPro
  });

  const handleSale = (endPrice) => {
    const traderPrice = Number(formik.values.traderprice);
    endPrice = Number(endPrice);

    if (traderPrice > 0 && endPrice >= 0 && endPrice <= traderPrice) {
      const salePercentage = ((traderPrice - endPrice) / traderPrice) * 100;
      const rounded = Math.round(salePercentage);
      formik.setFieldValue('sale', rounded);
    } else {
      formik.setFieldValue('sale', 0);
    }
  };

  const toggleSale = (checked) => {
    formik.setFieldValue('onSale', checked);
    if (!checked) {
      formik.setFieldValue('endPrice', formik.values.traderprice);
      formik.setFieldValue('sale', 0);
    } else {
      formik.setFieldValue('endPrice', '');
    }
  };

  return (
    <>
      {UserRole == 'trader' &&
        <PrimaryButton
          label="إضافة منتج"
          icon='fa-solid fa-square-plus'
          onClick={() => setShow(true)}
        />
      }
      <Modal show={show} onHide={() => setShow(false)} centered dialogClassName='AddProductModal'>
        <Modal.Header>
          <div className="border-0 pb-0 d-flex align-items-center justify-content-between w-100">
            <Modal.Title>إضافة منتج</Modal.Title>
            <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={() => setShow(false)} />
          </div>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form noValidate onSubmit={formik.handleSubmit}>
            <Row>
             <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className='pe-2'> اسم المنتج</Form.Label>
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
                  <Form.Label className='pe-2'> التصنيف</Form.Label>
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
                  <Form.Label className='pe-2'>الوحدة</Form.Label>
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
                  <Form.Label className='pe-2'>الشركة المصنعة</Form.Label>
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
                  <Form.Label className='pe-2'>حالة المنتج</Form.Label>
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
                  <Form.Label className='pe-2'>الكمية للوحدة</Form.Label>
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
                  <Form.Label className='pe-2'>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name='traderprice'
                    placeholder="جنيه مصري"
                    onChange={(e) => {
                      formik.handleChange(e);
                      getPriceOfPiece(e.target.value);
                      if (!formik.values.onSale) {
                        formik.setFieldValue('endPrice', e.target.value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.traderprice}
                  />
                  {formik.touched.traderprice && formik.errors.traderprice && (
                    <div className="text-danger">{formik.errors.traderprice}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label className='pe-2'>سعر القطعة</Form.Label>
                  <Form.Control type="number" value={PiecePrice} readOnly />
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
                          formik.handleChange(e);
                          handleSale(e.target.value);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.endPrice}
                        min={0}
                        max={formik.values.traderprice}
                      />
                      {formik.touched.endPrice && formik.errors.endPrice && (
                        <div className="text-danger">{formik.errors.endPrice}</div>
                      )}
                      {formik.values.sale > 0 && (
                        <div  style={{marginRight:25}} className="text-success mt-1">نسبة الخصم: {formik.values.sale}%</div>
                      )}
                    </Form.Group>
                  }
                </div>
              </Col>
  <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className='pe-2'>الوصف</Form.Label>
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
                  <Form.Label className='pe-2'>صور المنتج</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.image && formik.errors.image && (
                    <div className="text-danger">{formik.errors.image}</div>
                  )}
                </Form.Group>

                <div className="d-flex flex-wrap gap-2 mt-2">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`preview-${index}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Button className="btn-primary w-100 mt-3" type="submit">
              تأكيد الإضافة
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddProductModal;