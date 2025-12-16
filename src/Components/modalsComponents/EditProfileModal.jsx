import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateUser } from '../../Redux/slices/Users';
import { uploadImagesToSupabase, deleteImageFromStore } from '../../Redux/uploadingImage';
import styles from '../../css/Modal.module.css';
import { AiOutlineClose } from "react-icons/ai";
import { GetToken } from '../../Redux/slices/token';

const DEFAULT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const citiesByGovernorate = [
    "الإسكندرية", "الإسماعيلية", "الأقصر", "البحر الأحمر", "البحيرة",
    "الجيزة", "الدقهلية", "السويس", "الشرقية", "الغربية", "الفيوم",
    "القاهرة", "القليوبية", "المنوفية", "المنيا", "الوادي الجديد",
    "بني سويف", "بورسعيد", "جنوب سيناء", "دمياط", "سوهاج", "شمال سيناء",
    "قنا", "كفر الشيخ", "مطروح", "أسوان", "أسيوط"
];

function EditProfileModal({ show, handleClose }) {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.Token);
    const [images, setImages] = useState([]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: userData?.name || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            location: userData?.location || '',
            governorate: userData?.governorate || '',
            city: userData?.city || '',
            role: userData?.role || '',
            userImage: [],
        },
        validationSchema: Yup.object({
            name: Yup.string().required('الاسم مطلوب'),
            email: Yup.string().email('بريد غير صالح').required('البريد مطلوب'),
            phone: Yup.string().required('رقم الهاتف مطلوب'),
            location: Yup.string().required('العنوان مطلوب'),
            governorate: Yup.string().required('المحافظة مطلوبة'),
        }),
        onSubmit: async (values) => {
            try {
                let imageUrl = userData.image;

                // لو تم اختيار صورة جديدة
                if (values.userImage.length > 0) {
                    // حذف الصورة القديمة لو موجودة ومش افتراضية
                    if (userData.image && userData.image !== DEFAULT_IMAGE) {
                        await deleteImageFromStore(userData.image, 'users');
                    }

                    // رفع الصورة الجديدة
                    const uploaded = await uploadImagesToSupabase(values.userImage, 'users');
                    imageUrl = uploaded[0];
                }

                const updatedData = {
                    ...values,
                    image: imageUrl,
                    isBlocked: false,
                };
                delete updatedData.userImage;

                await dispatch(updateUser({ id: userData.id, updatedData }));
                await dispatch(GetToken());
                formik.resetForm();
                handleClose();
            } catch (error) {
                console.error('[PROFILE UPDATE ERROR]:', error.message);
            }
        }
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        formik.setFieldValue('userImage', files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImages(previews);
    };

    const closeModal = () => {
        formik.resetForm();
        handleClose();
    };

    return (
        <Modal show={show} onHide={closeModal} centered dialogClassName={styles.customModal} className='customModal'>
            {/* <Modal.Header className="justify-content-between align-items-center" dir="rtl">
                <Modal.Title>تعديل الملف الشخصي</Modal.Title>
                <Button
                    variant="link"
                    onClick={closeModal}
                    style={{ fontSize: '1.5rem', color: 'black', textDecoration: 'none' }}
                    aria-label="Close"
                >
                    <AiOutlineClose size={24} style={{ color: "black" }} />
                </Button>
            </Modal.Header> */}

            <Modal.Header>
          <div className="border-0 pb-0 d-flex align-items-center justify-content-between w-100">
            <Modal.Title>تعديل الملف الشخصي</Modal.Title>
                    <button className='fa-solid fa-close border-0 bg-transparent CloseModalBtn' onClick={closeModal} />
          </div>
        </Modal.Header>

            <Modal.Body>
                <Form onSubmit={formik.handleSubmit}>
                    <Row>
                        <Col md={12} className="d-flex justify-content-center mb-4">
                            <div
                                onClick={() => document.getElementById('userImageInput').click()}
                                style={{
                                    position: 'relative',
                                    width: 100,
                                    height: 100,
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    borderRadius: '50%',
                                }}
                                className="profile-image-wrapper"
                            >
                                <img
                                    src={images[0] || userData.image || DEFAULT_IMAGE}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div
                                    className="camera-icon-overlay d-flex align-items-center justify-content-center"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        color: '#fff',
                                        opacity: 0,
                                        transition: 'opacity 0.3s',
                                        borderRadius: '50%',
                                        fontSize: 24,
                                    }}
                                >
                                    <i className="fa fa-camera"></i>
                                </div>
                            </div>
                            <input
                                id="userImageInput"
                                type="file"
                                accept="image/*"
                                className="d-none"
                                onChange={handleImageChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label className='pe-2 mb-0'>الاسم</Form.Label>
                                <Form.Control {...formik.getFieldProps('name')} />
                                {formik.touched.name && formik.errors.name && (
                                    <div className="text-danger">{formik.errors.name}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label className='pe-2 mb-0'>البريد الإلكتروني</Form.Label>
                                <Form.Control {...formik.getFieldProps('email')} disabled />
                                {formik.touched.email && formik.errors.email && (
                                    <div className="text-danger">{formik.errors.email}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label className='pe-2 mb-0'>رقم الهاتف</Form.Label>
                                <Form.Control {...formik.getFieldProps('phone')} />
                                {formik.touched.phone && formik.errors.phone && (
                                    <div className="text-danger">{formik.errors.phone}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label className='pe-2 mb-0'>المحافظة</Form.Label>
                                <Form.Select
                                    name="governorate"
                                    value={formik.values.governorate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="">اختر المحافظة</option>
                                    {citiesByGovernorate.map((gov) => (
                                        <option key={gov} value={gov}>
                                            {gov}
                                        </option>
                                    ))}
                                </Form.Select>
                                {formik.touched.governorate && formik.errors.governorate && (
                                    <div className="text-danger">{formik.errors.governorate}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label className='pe-2 mb-0'>المدينة</Form.Label>
                                <Form.Control {...formik.getFieldProps('city')} />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className='pe-2 mb-0'>العنوان</Form.Label>
                                <Form.Control {...formik.getFieldProps('location')} />
                                {formik.touched.location && formik.errors.location && (
                                    <div className="text-danger">{formik.errors.location}</div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button type="submit" className="w-100 mt-3">حفظ التعديلات</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditProfileModal;
