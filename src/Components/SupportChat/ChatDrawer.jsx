import React, { useState, useEffect, useRef } from "react";
import "./ChatDrawer.css";
import { supabase } from "../../Supabase/SupabaseClient";
import { buildConversationId } from "../../Redux/slices/messagesSlice";
import SupportAvatar from "../../assets/Images/supportChat.png"

// 🛠️ ثابت للدعم الفني (لو حبيت تغيره فيما بعد)
const SUPPORT_ADMIN_ID = "a157b1db-54c3-46e3-968c-b3e0be6f6392";
const SUPPORT_ADMIN_ROLE = "admin";

export default function ChatDrawer({ currentUserId, userRole, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
        const messagesContainerRef = useRef();
    const formatMessageTime = (timeStr) => {
        const date = new Date(timeStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return isToday
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString();
    };
    // const fetchMessages = async () => {
    //     if (!currentUserId) return;

    //     const conversationId = buildConversationId(SUPPORT_ADMIN_ROLE, currentUserId);

    //     const { data, error } = await supabase
    //         .from("UsersMessage")
    //         .select("*")
    //         .or(
    //             `and(sender_id.eq.${currentUserId},receiver_id.eq.${SUPPORT_ADMIN_ID}),and(sender_id.eq.${SUPPORT_ADMIN_ID},receiver_id.eq.${currentUserId})`
    //         )
    //         .order("created_at", { ascending: true });

    //     if (error) {
    //         console.error("❌ فشل في جلب الرسائل:", error.message);
    //         return;
    //     }

    //     // ✅ لو مفيش ولا رسالة، نضيف رسالة ترحيب تلقائية
    //     if (data.length === 0) {
    //         const welcomeMessage = {
    //             conversation_id: conversationId,
    //             sender_id: SUPPORT_ADMIN_ID, // أو تقدر تستخدم SUPPORT_ADMIN_ID
    //             receiver_id: currentUserId,
    //             sender_role: SUPPORT_ADMIN_ROLE,
    //             receiver_role: userRole,
    //             actual_sender_id: SUPPORT_ADMIN_ID,
    //             content: "مرحبًا بك! اكتب رسالتك وسنقوم بالرد عليك في أقرب وقت 😊",
    //         };

    //         const { error: insertError } = await supabase
    //             .from("UsersMessage")
    //             .insert([welcomeMessage]);

    //         if (insertError) {
    //             console.error("❌ فشل في إضافة رسالة الترحيب:", insertError.message);
    //         } else {
    //             // بعد ما نضيف الرسالة الترحيبية، نعيد التحميل
    //             return fetchMessages();
    //         }
    //     }

    //     setMessages(data);

    //     // ✅ نحدث read_at لو في رسائل جاية من الأدمن
    //     const unreadAdminMessages = data.filter(
    //         (msg) => msg.sender_id === SUPPORT_ADMIN_ID && !msg.read_at
    //     );

    //     if (unreadAdminMessages.length > 0) {
    //         await supabase
    //             .from("UsersMessage")
    //             .update({ read_at: new Date().toISOString() })
    //             .match({
    //                 sender_id: SUPPORT_ADMIN_ID,
    //                 receiver_id: currentUserId,
    //             })
    //             .is("read_at", null);
    //     }
    // };

    const fetchMessages = async () => {
        if (!currentUserId) return;

        const conversationId = buildConversationId(SUPPORT_ADMIN_ROLE, currentUserId);
        conversationId;
        const { data, error } = await supabase
            .from("UsersMessage")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUserId},receiver_id.eq.${SUPPORT_ADMIN_ID}),and(sender_id.eq.${SUPPORT_ADMIN_ID},receiver_id.eq.${currentUserId})`
            )
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ فشل في جلب الرسائل:", error.message);
            return;
        }

        // ✅ لو مفيش ولا رسالة حقيقية، نظهر رسالة ترحيب وهمية فقط
        if (data.length === 0) {
            const welcomeMessage = {
                id: "static-welcome", // أي ID وهمي لتجنب تكرار React key warning
                sender_id: SUPPORT_ADMIN_ID,
                receiver_id: currentUserId,
                content: "مرحبًا بك! اكتب رسالتك وسنقوم بالرد عليك في أقرب وقت 😊",
                created_at: new Date().toISOString(),
                is_static_welcome: true, // تقدر تستخدمه لو حبيت تخصها بتنسيق أو سلوك مختلف
            };

            setMessages([welcomeMessage]);
            return;
        }

        setMessages(data);

        // ✅ تحديث read_at للرسائل الغير مقروءة من الأدمن
        const unreadAdminMessages = data.filter(
            (msg) => msg.sender_id === SUPPORT_ADMIN_ID && !msg.read_at
        );

        if (unreadAdminMessages.length > 0) {
            await supabase
                .from("UsersMessage")
                .update({ read_at: new Date().toISOString() })
                .match({
                    sender_id: SUPPORT_ADMIN_ID,
                    receiver_id: currentUserId,
                })
                .is("read_at", null);
        }
    };


    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const conversationId = buildConversationId(SUPPORT_ADMIN_ROLE, currentUserId);

        const messagePayload = {
            conversation_id: conversationId,
            sender_id: currentUserId,
            receiver_id: SUPPORT_ADMIN_ID,
            sender_role: userRole,
            receiver_role: SUPPORT_ADMIN_ROLE,
            actual_sender_id: currentUserId,
            content: newMessage,
        };

        const { error } = await supabase.from("UsersMessage").insert([messagePayload]);

        if (error) {
            console.error("❌ فشل في إرسال الرسالة:", error.message);
        } else {
            setNewMessage("");
            fetchMessages();
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        const conversationId = buildConversationId(SUPPORT_ADMIN_ROLE, currentUserId);

        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on("postgres_changes", {
                event: "*", // 👈 نسمع على INSERT و UPDATE
                schema: "public",
                table: "UsersMessage",
                filter: `conversation_id=eq.${conversationId}`,
            }, () => {
                fetchMessages(); // 👈 نعيد تحميل الرسائل
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);


    useEffect(() => {
        const markAdminMessagesAsRead = async () => {
            const { error } = await supabase
                .from("UsersMessage")
                .update({ read_at: new Date().toISOString() })
                .match({
                    sender_id: SUPPORT_ADMIN_ID,
                    receiver_id: currentUserId,
                })
                .is("read_at", null);

            if (error) {
                console.error("❌ فشل في تحديث read_at عند التاجر:", error.message);
            }
        };

        markAdminMessagesAsRead();
    }, []);

    useEffect(() => {
        if (messages.length > 0 && messagesContainerRef.current) {
            requestAnimationFrame(() => {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            });
        }
    }, [messages]);
    return (
        <div className="chat-drawer-container">
            <div className="chat-header">
                الدعم الفني
                <button className="close-btn" style={{ color:"white" }} onClick={onClose}>✖</button>
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
                {messages.map((msg) => {
                    const isUser = msg.sender_id === currentUserId; // يعني التاجر

                    return (
                        <div
                            key={msg.id}
                            className="chat-message-wrapper"
                            style={{
                                display: "flex",
                                justifyContent: isUser ? "flex-start" : "flex-end",
                                alignItems: "flex-end",
                                marginBottom: "10px",
                            }}
                        >
                            {/* التاجر: يظهر على الشمال بدون أيقونة */}
                            {isUser && (
                                <div
                                    className="chat-message user-msg"
                                >
                                    <div className="msg-text">{msg.content}</div>
                                    <div
                                        className="msg-time"
                                        style={{
                                            fontSize: "10px",
                                            color: "gray",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: "5px",
                                        }}
                                    >
                                        {formatMessageTime(msg.created_at)}
                                        <span style={{ marginLeft: "10px", color: msg.read_at ? "blue" : "gray" }}>
                                            ✔✔
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* الأدمن: على اليمين وبجنبه الروبوت */}
                            {!isUser && (
                                <div style={{ display:"flex" , alignItems:"center", justifyContent: "flex-end" }}>
                                    <div
                                        className="chat-message admin-msg"
                                        style={{

                                            marginLeft: "8px",
                                        }}
                                    >
                                        <div className="msg-text">{msg.content}</div>
                                        <div
                                            className="msg-time"
                                            style={{
                                                fontSize: "10px",
                                                color: "gray",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: "5px",
                                            }}
                                        >
                                            {formatMessageTime(msg.created_at)}
                                        </div>
                                    </div>

                                    <div>
                                        {/* <FaRobot size={42} style={{ color: "#007bff", marginLeft: "5px" }} /> */}
                                        
                                                        <img src={SupportAvatar}  width={"40px"}/>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>


            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // يمنع السطر الجديد
                            handleSend();
                        }
                    }}
                    placeholder="اكتب رسالتك..."
                />

                <button onClick={handleSend}>

                    <i className="fa-solid fa-paper-plane"></i>
                    </button>
            </div>
        </div>
    );
}
