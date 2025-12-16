import React, { useState, useEffect } from "react";
import "./SupportChat.css";
import ChatDrawer from "./ChatDrawer";
import { supabase } from "../../Supabase/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/slices/Users";
import SupportAvatar from "../../assets/Images/supportChat.png";

const SUPPORT_ADMIN_ID = "a157b1db-54c3-46e3-968c-b3e0be6f6392";

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showLoginMessage, setShowLoginMessage] = useState(false);

    const dispatch = useDispatch();
    const { token: userId, UserRole: userRole } = useSelector(state => state.Token);
    const { users } = useSelector(state => state.Users);

    const toggleChat = async () => {
        // لو مش مسجل دخول، أظهر رسالة فقط
        if (!userId) {
            if (!isOpen) {
                setIsOpen(true);
                setShowLoginMessage(true);

                setTimeout(() => {
                    setShowLoginMessage(false);
                    setIsOpen(false); // ✅ نقفل الزر تلقائيًا
                }, 2000);
            } else {
                // لو اتفتح بالفعل، قفله يدويًا
                setIsOpen(false);
                setShowLoginMessage(false);
            }
            return;
        }

        // لو مسجل دخول، كمل عادي وافتح/اقفل الشات
        setIsOpen(!isOpen);

        if (!isOpen) {
            const { error } = await supabase
                .from("UsersMessage")
                .update({ read_at: new Date().toISOString() })
                .match({
                    sender_id: SUPPORT_ADMIN_ID,
                    receiver_id: userId,
                })
                .is("read_at", null);

            if (error) {
                console.error("❌ فشل في تصفير العداد:", error.message);
            }

            setUnreadCount(0);
        }
    };

    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch]);

    useEffect(() => {
        if (!userId || !userRole) return;

        const fetchUnread = async () => {
            const { count, error } = await supabase
                .from("UsersMessage")
                .select("id", { count: "exact" })
                .eq("receiver_id", userId)
                .eq("receiver_role", userRole)
                .is("read_at", null);

            if (!error) {
                setUnreadCount(count);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 5000);
        return () => clearInterval(interval);
    }, [userId, userRole]);

    return (
        <>
            <div className="support-chat-float-button" onClick={toggleChat}>
                <img
                    src={SupportAvatar}
                    width={"55px"}
                    height={"55px"}
                    style={{
                        border: "none",
                        background: "transparent",
                        boxShadow: "none",
                        borderRadius: 50,
                        margin: 0,
                        padding: 0,
                        display: "block"
                    }}
                    alt="Support"
                />
                {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
            </div>

            {isOpen && userId ? (
                <ChatDrawer
                    currentUserId={userId}
                    userRole={userRole}
                    users={users}
                    onClose={toggleChat}
                />
            ) : isOpen && showLoginMessage ? (
                <div className="chat-login-required">
                    الرجاء تسجيل الدخول للتحدث مع خدمة العملاء
                </div>
            ) : null}
        </>
    );
}
