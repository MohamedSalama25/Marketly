import { useEffect, useRef, useState } from "react";
import PrimarySearch from "../globalComonents/PrimarySearch";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMessages,
    sendMessage,
    buildConversationId,
} from "../../Redux/slices/messagesSlice";
import "./ChatModal.css";
import { supabase } from "../../Supabase/SupabaseClient";
import Loading from "../globalComonents/loading";
import avatar from "../../assets/Images/user.png";

const SUPPORT_ADMIN_ID = "a157b1db-54c3-46e3-968c-b3e0be6f6392";

export default function ChatModal({ users, searchValue, setSearchValue, onUserListLoaded }) {
    const dispatch = useDispatch();
    const { messages} = useSelector((state) => state.messages);
    const { token: userId, UserRole: userRole } = useSelector((state) => state.Token);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [latestMessageMap, setLatestMessageMap] = useState({});
    const messagesContainerRef = useRef();
    useEffect(() => {
        if (selectedUser && userRole) {
            dispatch(fetchMessages({
                userId: selectedUser.id,
                otherUserRole: selectedUser.role,
            }));

        }
    }, [selectedUser, userRole, dispatch]);



    const updateUserList = async () => {
        const map = {};
        for (const user of users) {
            const { data: msgs } = await supabase
                .from("UsersMessage")
                .select("*")
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order("created_at", { ascending: true });

            if (!msgs || msgs.length === 0) continue;

            const lastMsg = msgs[msgs.length - 1];
            const unreadCount = msgs.filter(
                (msg) =>
                    msg.sender_id === user.id &&
                    msg.receiver_id === SUPPORT_ADMIN_ID &&
                    !msg.read_at
            ).length;

            map[user.id] = {
                lastMessage: lastMsg,
                unreadCount,
            };
        }
        setLatestMessageMap(map);
    };
    const [userListInitialized, setUserListInitialized] = useState(false);

    useEffect(() => {
        const doInitialLoad = async () => {
            if (!userListInitialized && users.length > 0) {
                await updateUserList();
                setUserListInitialized(true);
                onUserListLoaded?.(); // ✅ ننده مرة واحدة بس
            }
        };
        doInitialLoad();
    }, [users, userListInitialized]);


    useEffect(() => {
        const channels = users.map((user) => {
            const conversation_id = buildConversationId(
                userRole === "admin" ? "admin" : userId,
                user.role === "admin" ? "admin" : user.id
            );

            return supabase
                .channel(`chat-${conversation_id}`)
                .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "UsersMessage",
                    filter: `conversation_id=eq.${conversation_id}`,
                }, async (payload) => {
                    const incomingMessage = payload.new;

                    if (
                        selectedUser &&
                        (incomingMessage.sender_id === selectedUser.id || incomingMessage.receiver_id === selectedUser.id)
                    ) {
                        dispatch(fetchMessages({
                            userId: selectedUser.id,
                            otherUserRole: selectedUser.role,
                        }));
                    }

                    // ✅ تصفير فوري لو الأدمن فاتح شات التاجر
                    if (selectedUser && incomingMessage.sender_id === selectedUser.id) {
                        await supabase
                            .from("UsersMessage")
                            .update({ read_at: new Date().toISOString() })
                            .match({
                                sender_id: selectedUser.id,
                                receiver_id: SUPPORT_ADMIN_ID,
                            })
                            .is("read_at", null);

                        updateUserList();
                    }

                    updateUserList();
                })

                // ✅ Real-time read_at updates
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "UsersMessage",
                    filter: `sender_id=eq.${SUPPORT_ADMIN_ID}`

                }, async (payload) => {
                    const updatedMsg = payload.new;

                    if (
                        selectedUser &&
                        (updatedMsg.sender_id === selectedUser.id || updatedMsg.receiver_id === selectedUser.id)
                    ) {
                        dispatch(fetchMessages({
                            userId: selectedUser.id,
                            otherUserRole: selectedUser.role,
                        }));
                    }

                    updateUserList();
                })

                .subscribe();
        });

        return () => {
            channels.forEach((ch) => supabase.removeChannel(ch));
        };
    }, [users, userId, userRole, selectedUser]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await dispatch(sendMessage({
                receiverIds: [selectedUser.id],
                content: newMessage,
            }));

            setNewMessage("");

            dispatch(fetchMessages({
                userId: selectedUser.id,
                otherUserRole: selectedUser.role,
            }));

            updateUserList();
        } catch (err) {
            console.error("❌ فشل في إرسال الرسالة:", err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getRoleLabel = (role) => {
        if (role === "trader") return "تاجر";
        if (role === "user") return "صاحب محل";
        if (role === "delegate") return "مندوب";
        return "مستخدم";
    };

    const formatMessageTime = (timeStr) => {
        const date = new Date(timeStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        return isToday
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString();
    };

    const sortedUsers = [...users].sort((a, b) => {
        const aTime = latestMessageMap[a.id]?.lastMessage?.created_at || 0;
        const bTime = latestMessageMap[b.id]?.lastMessage?.created_at || 0;
        return new Date(bTime) - new Date(aTime);
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 800) {
                setIsSidebarVisible(true);
            } else {
                setIsSidebarVisible(false);
            }
        };

        handleResize(); // ✅ تشغيله مرة عند التحميل
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);



    useEffect(() => {
        if (messages.length > 0 && messagesContainerRef.current) {
            requestAnimationFrame(() => {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            });
        }
    }, [messages]);


    return (
    <>

            {/* {loadingUserList ? (
                <Loading />
            ) : (
                 */}
        <div className="chat-layout-container">
                <button
                    className="users-btn"
                    onClick={() => {setIsSidebarVisible(true);
                        setSelectedUser(null);
                    }}
                    style={{ display: window.innerWidth < 800 && !isSidebarVisible ? "block" : "" }}
                >
                    العملاء
                </button>
                {window.innerWidth < 800 && !isSidebarVisible && !selectedUser && (
                    <div className="mobile-chat-placeholder">
                        <p>اضغط على زر <strong>العملاء</strong> لاختيار عميل وبدء المحادثة</p>
                    </div>
                )}

            <div className="chat-layout">
                {/* Sidebar */}
                    <div className={`chat-users-sidebar ${!isSidebarVisible ? "hidden" : ""}`}>
                    <div className="chat-sidebar-header">
                        <h3>العملاء</h3>
                        {/* <button onClick={onClose}>✖</button> */}
                    </div>
                    <div className="chat-search-box">
                        <PrimarySearch
                            value={searchValue}
                            placeholder="ابحث بالاسم أو الإيميل أو الهاتف..."
                            onChange={(val) => setSearchValue(val)}
                        />
                    </div>

                    <div className="chat-users-list">
                        {sortedUsers.map((user) => {
                            const data = latestMessageMap[user.id];
                            const lastMsg = data?.lastMessage;
                            const unread = data?.unreadCount || 0;

                            return (
                                <div
                                    key={user.id}
                                    className={`chat-user-card ${selectedUser?.id === user.id ? "active" : ""}`}
                                    onClick={async () => {
                                        setSelectedUser(user);
                                        if (window.innerWidth < 800) {
                                            setIsSidebarVisible(false);
                                        }
                                        const { error } = await supabase
                                            .from("UsersMessage")
                                            .update({ read_at: new Date().toISOString() })
                                            .match({
                                                sender_id: user.id,
                                                receiver_id: SUPPORT_ADMIN_ID,
                                            })
                                            .is("read_at", null); 


                                        if (error) console.error("فشل في تحديث read_at:", error);
                                        updateUserList();
                                    }}

                                >
                                    {/* <img src={user.image && user.image.trim() !== "" ? user.image : avatar} className="user-avatar" /> */}
                                    <img
                                        src={user.image && user.image.trim() !== "" && user.image.startsWith("http") ? user.image : avatar}
                                        className="user-avatar"
                                    />

                                    <div className="user-text">
                                        <div className="user-name">{user.name} <span className="user-role">{getRoleLabel(user.role)}</span></div>
                                        {/* <span className="user-role">{getRoleLabel(user.role)}</span> */}
                                        {lastMsg && (
                                            <div className="user-last-msg">
                                                <span className="user-last-msg-content">
                                                    {lastMsg.content.length > 20
                                                        ? lastMsg.content.slice(0, 15) + "..."
                                                        : lastMsg.content}
                                                </span>
                                                <span className="user-last-msg-time">
                                                    {" "}  {formatMessageTime(lastMsg.created_at)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {unread > 0 && (
                                        <div className="unread-badge">{unread}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Main */}
                    <div className={`chat-main-area ${window.innerWidth < 800 && !selectedUser ? "hidden" : ""}`}>

                    {selectedUser ? (
                        <>
                            <div className="chat-header">
                                <h4>{selectedUser.name}</h4>
                            </div>

                            <div className="chat-body" ref={messagesContainerRef}>
                                {messages.map((msg) => {
                                    const isMessageFromMe =
                                        userRole === "admin"
                                            ? msg.sender_id === SUPPORT_ADMIN_ID
                                            : msg.sender_id === userId;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`message-bubble ${isMessageFromMe ? "sent" : "received"}`}
                                        >
                                            <p className="message-content">{msg.content}</p>
                                            <div className="message-meta">
                                                <span className="message-time">
                                                    {formatMessageTime(msg.created_at)}
                                                </span>
                                                {isMessageFromMe && (
                                                    <span
                                                        className="message-checks"
                                                        style={{
                                                            color: msg.read_at ? "blue" : "gray",
                                                            marginRight: 6,
                                                        }}
                                                    >
                                                        ✔✔
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* <div ref={chatEndRef}></div> */}
                            </div>

                            <div className="chat-input-container">
                                <textarea
                                    className="chat-input"
                                    placeholder="اكتب رسالتك هنا..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="chat-send-btn" onClick={handleSendMessage}>
                                 <i style={{fontSize:20}} className="fa-solid fa-paper-plane"></i>
                                  
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <p>اختر عميل لبدء المحادثة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
            {/* )} */}
    </>
    );
}
