import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { server } from "../main";
import { ChatData } from "./Chatcontext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [btnLoading, setBtnLoading] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false); // New loading state

    async function loginUser(email, navigate) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/user/login`, { email });

            toast.success(data.message);
            localStorage.setItem("verifyToken", data.verifyToken);
            navigate("/verify");
            setBtnLoading(false);

        } catch (error) {
            toast.error(error.response.data.message);
            setBtnLoading(false);
        }
    }

    const [user, setUser] = useState([]);
    const [isAuth, setIsAuth] = useState(false);

    async function verifyUser(otp, navigate, fetchChats) {
        const verifyToken = localStorage.getItem("verifyToken");
        setBtnLoading(true);

        if (!verifyToken) return toast.error("Please give token");
        try {
            const { data } = await axios.post(`${server}/api/user/verify`, {
                otp,
                verifyToken,
            });

            toast.success(data.message);
            localStorage.clear();
            localStorage.setItem("token", data.token);
            setVerificationLoading(true);
            setBtnLoading(false);
            navigate("/");
            setIsAuth(true);
            setUser(data.user);
            const { setMessages, setSelected } = ChatData();
            setMessages([]);
            setSelected(null);
            fetchChats();
        } catch (error) {
            toast.error(error.response.data.message);
            setBtnLoading(false);
        } finally {
            window.location.reload();
        }
    }
    const [loading, setLoading] = useState(true);

    async function fetchUser() {
        const token = localStorage.getItem("token");

        // Don't make API call if no token exists
        if (!token) {
            setIsAuth(false);
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.get(`${server}/api/user/me`, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });

            setIsAuth(true);
            setUser(data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setIsAuth(false);
            setLoading(false);
        }
    }

    const logoutHandler = (navigate) => {
        if (confirm("are you sure you want to logout")) {

            localStorage.clear();

            setIsAuth(false);
            setUser([]);
            navigate("/login");

            const { setChats, setSelected, setMessages } = ChatData();
            setChats([]);
            setSelected(null);
            setMessages([]);
            toast.success("logged out");

            window.location.href = "/login";
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);
    return (
        <UserContext.Provider
            value={{
                loginUser,
                btnLoading,
                isAuth,
                setIsAuth,
                user,
                verifyUser,
                loading,
                logoutHandler,
                verificationLoading,
            }}
        >
            {children}
            <Toaster />
        </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);