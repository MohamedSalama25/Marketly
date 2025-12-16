import { useOutletContext } from "react-router-dom";
import ChatsPageHeader from "../Components/ChatsComponents/ChatsPageHeader";
import { fetchUsers } from "../Redux/slices/Users";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "../Components/globalComonents/loading";
import ChatModal from "../Components/ChatsComponents/ChatModal";

function Chats() {
    const { UserRole } = useOutletContext();
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.Users);
    const [searchValue, setSearchValue] = useState("");
    
    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch]);

    const filteredUsers = users?.filter((user) => {
        const v = searchValue.trim().toLowerCase();
        return (
            user.role !== "admin" &&
            (user.name?.toLowerCase().includes(v) ||
                user.email?.toLowerCase().includes(v) ||
                user.phone?.toLowerCase().includes(v))
        );
    });

    return (
        <>
            {/* <ChatsPageHeader /> */}
            {loading ? (
                <Loading />
            ) : (
                <ChatModal
                    users={filteredUsers}
                        searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    UserRole={UserRole}
                />
            )}
        </>
    );
}

export default Chats;
