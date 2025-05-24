import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { server } from "../main";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [newRequestLoading, setNewRequestLoading] = useState(false);

    async function fetchResponse() {
        if (prompt === "") return alert("Write prompt");
        setNewRequestLoading(true);
        setPrompt("");
        try {
            const response = await axios({
                url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDq8Z3paZIQ0kZaIRhsMxvd8GOO7xHDbD0",
                method: "post",
                data: {
                    contents: [{ parts: [{ text: prompt }] }],
                },
            });

            const rawAnswer = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
            const formattedAnswer = rawAnswer
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/\n/g, "<br />");

            const chunks = formattedAnswer.split(" ");
            let streamedAnswer = "";

            for (let i = 0; i < chunks.length; i++) {
                streamedAnswer += chunks[i] + " ";

                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.question === prompt) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, answer: streamedAnswer.trim() },
                        ];
                    } else {
                        return [...prev, { question: prompt, answer: streamedAnswer.trim() }];
                    }
                });

                if (i === 0) {
                    setNewRequestLoading(false);
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }

            const { data } = await axios.post(
                `${server}/api/chat/${selected}`,
                {
                    question: prompt,
                    answer: formattedAnswer,
                },
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    },
                }
            );

            fetchChats();
        } catch (error) {
            alert("Something went wrong");
            console.log(error);
        } finally {
            setNewRequestLoading(false);
        }
    }

    const [chats, setChats] = useState([]);

    const [selected, setSelected] = useState(null);

    async function fetchChats() {
        try {
            const { data } = await axios.get(`${server}/api/chat/all`, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });

            setChats(data);
            if (data.length > 0) {
                setSelected(data[0]._id);
            } else {
                setSelected(null);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const [createLod, setCreateLod] = useState(false);

    async function createChat() {
        setCreateLod(true);
        try {
            const { data } = await axios.post(
                `${server}/api/chat/new`,
                {},
                {
                    headers: {
                        token: localStorage.getItem("token"),
                    },
                }
            );

            setSelected(data._id);
            fetchChats();
            setCreateLod(false);
        } catch (error) {
            toast.error("something went wrong");
            setCreateLod(false);
        }
    }

    const [loading, setLoading] = useState(false);

    async function fetchMessages() {
        if (!selected) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${server}/api/chat/${selected}`, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setMessages(data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function deleteChat(id) {
        try {
            const { data } = await axios.delete(`${server}/api/chat/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            toast.success(data.message);
            fetchChats();
            window.location.reload();
        } catch (error) {
            console.log(error);
            alert("something went wrong");
        }
    }

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (selected) {
            fetchMessages();
        }
    }, [selected]);
    return (
        <ChatContext.Provider
            value={{
                fetchResponse,
                messages,
                prompt,
                setPrompt,
                newRequestLoading,
                chats,
                createChat,
                createLod,
                selected,
                setSelected,
                loading,
                setLoading,
                deleteChat,
                fetchChats,
                setMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatData = () => useContext(ChatContext);