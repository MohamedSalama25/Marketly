import React, { useState } from "react";
import ModalConfirm from "../UsersComponents/ModalConfirm";
import { FormControl } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { updateUser } from "../../Redux/slices/Users";

export default function PasswordChangeModal({ isOpen, userId, userName, onClose }) {
    const dispatch = useDispatch();
    const [newPassword, setNewPassword] = useState("");

    const handlePasswordUpdate = () => {
        if (!newPassword) {
            return alert("من فضلك أدخل كلمة المرور الجديدة");
        }

        if (newPassword.trim().length < 6) {
            return alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        }

        dispatch(updateUser({ id: userId, updatedData: { password: newPassword } }));
        setNewPassword(""); // تنظيف الحقل
        onClose(); // إغلاق المودال
    };


    return (
        <ModalConfirm
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setNewPassword("");
            }}
            onConfirm={handlePasswordUpdate}
            confirmText="تحديث"
            confirmClass="btn-warning"
            message={() => (
                <div>
                    تعديل كلمة المرور للمندوب: <strong>{userName}</strong>
                    {/* <FormControl
                        type="password"
                        placeholder="كلمة المرور الجديدة"
                        className="mt-2"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    /> */}
                    <div
                        contentEditable
                        className="form-control mt-2"
                        onInput={(e) => setNewPassword(e.target.innerText)}
                        placeholder="كلمة المرور الجديدة"
                        style={{ minHeight: "38px" }}
                    ></div>

                </div>
            )}
        />
    );
}
