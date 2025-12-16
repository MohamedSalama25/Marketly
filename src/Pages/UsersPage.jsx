import React, { useEffect, useState } from "react";
import UsersTbl from "../Components/UsersComponents/UsersTbl";
import UsersFilter from "../Components/UsersComponents/UsersFilter";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../Redux/slices/Users";
import { updateUser, updateSelectedUsers, deleteUser } from "../Redux/slices/Users";
import UsersPageHeader from "../Components/UsersComponents/usersPageHeader";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
// import { sendMessage } from "../Redux/slices/MessagesSlice";
import Loading from "../Components/globalComonents/loading";
import { UserRole } from "../Redux/slices/token";


export default function UsersPage() {

    // فنكشن الحظر
    const handleToggleBlock = (user) => {
        dispatch(updateUser({ id: user.id, updatedData: { isBlocked: !user.isBlocked } }));
    };

    // فنكشن الحذف
    const handleDeleteUser = (userId) => {
        dispatch(deleteUser(userId));
    };

    // getting user from store and subabase
    const dispatch = useDispatch();
    useEffect(() => {
        if (!users || users.length === 0) {
             dispatch(fetchUsers());
           }
    }, [dispatch,UserRole])

    const { users, loading } = useSelector((state) => state.Users);


    // getting user from store and subabase

    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    const [selectedGovernorate, setSelectedGovernorate] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [filters, setFilters] = useState({
        governorate: '',
        role: '',
        name: '',
        email: '',
    });

    const handleSearchClick = () => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            governorate: selectedGovernorate,
            role: selectedRole,
        }));
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            setFilters((prevFilters) => ({
                ...prevFilters,
                name: searchName,
                email: searchEmail,
            }));
        }, 500);

        return () => clearTimeout(delay);
    }, [searchName, searchEmail]);

    const handleResetFilters = () => {
        setSearchName("");
        setSearchEmail("");
        setSelectedGovernorate("");
        setSelectedRole("");
        setFilters({
            governorate: '',
            role: '',
            name: '',
            email: '',
        });
    };


    // Update User Role
    const handleUpdateUserRole = (userId, newRole) => {
        dispatch(updateUser({ id: userId, updatedData: { role: newRole } }));
    };
    // Update User Role

    const handleUpdateSelectedUsersRoles = async (userIds, newRole) => {
        try {
            const result = await dispatch(updateSelectedUsers({ userIds, updatedData: { role: newRole } })).unwrap();
            console.log("TOAST MESSAGE:", toastMessage);
            if (result?.length > 0) {
                setToastMessage(`تم تعديل صلاحية ${result.length} مستخدم بنجاح`);
                setToastVariant("success");
                setShowToast(true);
            } else {
                setToastMessage("لم يتم تعديل أي مستخدم");
                setToastVariant("warning");
                setShowToast(true);
            }
        } catch (e) {
            setToastMessage("حدث خطأ أثناء التعديل");
            setToastVariant("danger");
            console.log(e)
            setShowToast(true);
        }
    };
    // Update Selected Usres Role

    // Block And UnBlock Selected Users
    const handleBlockSelectedUsers = async (userIds) => {
        try {
            const result = await dispatch(updateSelectedUsers({
                userIds,
                updatedData: { isBlocked: true }
            }));

            if (result?.payload?.length > 0) {
                setToastMessage(`✅ تم حظر ${result.payload.length} مستخدم بنجاح`);
            } else {
                setToastMessage("⚠️ لم يتم حظر أي مستخدم");
            }
        } catch (error) {
            setToastMessage("❌ حدث خطأ أثناء الحظر");
            console.error(error);
        } finally {
            setShowToast(true);
        }
    };

    const handleUnblockSelectedUsers = async (userIds) => {
        try {
            const result = await dispatch(updateSelectedUsers({
                userIds,
                updatedData: { isBlocked: false }
            }));

            if (result?.payload?.length > 0) {
                setToastMessage(`✅ تم إلغاء حظر ${result.payload.length} مستخدم بنجاح`);
            } else {
                setToastMessage("⚠️ لم يتم إلغاء الحظر عن أي مستخدم");
            }
        } catch (error) {
            setToastMessage("❌ حدث خطأ أثناء إلغاء الحظر");
            console.error(error);
        } finally {
            setShowToast(true);
        }
    };

    // Block And UnBlock Selected Users

    // const test = async () => {
    //     const result = await supabase.from("UsersMessage").insert([
    //         {
    //             sender: "f875575f-b8c4-46ac-99e2-f9043b7e2cdc",
    //             receiver: "228b042b-00b7-4ccb-adaf-b52561ae82d7",
    //             Message: "رسالة اختبار مباش رة sss"
    //         }
    //     ]);
    //     console.log(result);
    // };
    // test();

    // Send Msg to Users
    // const handleSendMessage = (receiverIds, messageText) => {
    //     if (receiverIds.length === 0) {
    //         setToastMessage("⚠️ من فضلك اختر مستخدمين لإرسال الرسالة");
    //         setToastVariant("warning");
    //         setShowToast(true);
    //         return;
    //     }

    //     // dispatch(sendMessage({
    //     //     receiverIds,
    //     //     content: messageText
    //     // }))
    //     //     .unwrap()
    //     //     .then(() => {
    //     //         setToastMessage(`📩 تم إرسال الرسالة إلى ${receiverIds.length} مستخدم`);
    //     //         setToastVariant("success");
    //     //         setShowToast(true);
    //     //     })
    //     //     .catch((error) => {
    //     //         setToastMessage(`❌ فشل في إرسال الرسالة: ${error}`);
    //     //         setToastVariant("danger");
    //     //         setShowToast(true);
    //     //     });
    // };



    // Send Msg to Users

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    // Toast
    return (
        <>
            <UsersPageHeader />
            <UsersFilter

                searchName={searchName}
                setSearchName={setSearchName}

                searchEmail={searchEmail}
                setSearchEmail={setSearchEmail}

                selectedGovernorate={selectedGovernorate}
                setSelectedGovernorate={setSelectedGovernorate}

                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}

                onSearchClick={handleSearchClick}
                onResetFilters={handleResetFilters}

            />


            {loading ? (
               <Loading/>
            ) : (
                <UsersTbl
                    users={users}
                    selectedGovernorate={filters.governorate}
                    selectedRole={filters.role}
                    searchName={filters.name}
                    searchEmail={filters.email}
                    onDeleteUser={handleDeleteUser}
                    onBlockUser={handleToggleBlock}

                    onUpdateUserRole={handleUpdateUserRole}
                    onUpdateSelectedUseresRole={handleUpdateSelectedUsersRoles}

                    onBlockSelectedUsers={handleBlockSelectedUsers}
                    onUnblockSelectedUsers={handleUnblockSelectedUsers}

                    // onSendMessage={handleSendMessage}
                />
            )}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 999999 }}>
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg={toastVariant} // ← ديناميكي
                >
                    <Toast.Header>
                        <strong className="ms-auto">رسالة النظام</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>

            </ToastContainer>

        </>
    )
}