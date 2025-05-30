
import { IoIosCloseCircle } from "react-icons/io";
import { ChatData } from "../context/Chatcontext";
import { MdDelete } from "react-icons/md";
import { LoadingSpinner } from "./Loading";
import { UserData } from "../context/Usercontext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { chats, createChat, createLod, setSelected, deleteChat } = ChatData();

    const { logoutHandler, user } = UserData();

    const deleteChatHandler = (id) => {
        if (confirm("are you sure you want to delete this chat")) {
            deleteChat(id);
        }
    };

    const clickEvent = (id) => {
        setSelected(id);
        toggleSidebar();
    };
    return (
        <div
            className={`fixed inset-0 bg-gray-800 p-4 transition-transform transform md:relative md:translate-x-0 md:w-1/4 md:block ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <button
                className="md:hidden p-2 mb-4 bg-gray-700 rounded text-2xl cursor-pointer"
                onClick={toggleSidebar}
            >
                <IoIosCloseCircle />
            </button>

            <div className="text-2xl font-semibold mb-6">ChatBot</div>
            <div className="mb-4">
                <button
                    onClick={createChat}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                >
                    {createLod ? <LoadingSpinner /> : "New Chat +"}
                </button>
            </div>
            <div>
                <p className="text-sm text-gray-400 mb-2">Recent</p>

                <div className="max-h-[500px] overflow-y-auto mb-20 md:mb-0 thin-scrollbar">
                    {chats && chats.length > 0 ? (
                        chats.map((e) => (
                            <div
                                key={e._id}
                                className="w-full text-left py-2 px-2 bg-gray-700 hover:bg-gray-600 rounded mt-2 flex justify-between items-center cursor-pointer"
                                onClick={() => clickEvent(e._id)}
                            >
                                <span>{e.latestmessage?.slice(0, 38) || "New Chat"}...</span>
                                <button
                                    className="bg-red-600 text-white text-xl px-3 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                                    onClick={() => deleteChatHandler(e._id)}
                                >
                                    <MdDelete />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No chats yet</p>
                    )}
                </div>
            </div>

            <div className="md:pb-0 absolute bottom-0 mb-3 w-full pr-8 pb-18">
                {/* User info section */}
                <div className="mb-1.5 p-1 pr-1 bg-gray-700 rounded">
                    <p className="text-sm text-gray-300 truncate">
                        Logged in as: <span className="text-white">{user?.email || 'User'}</span>
                    </p>
                </div>

                {/* Logout button */}
                <button
                    className="bg-red-600 text-white text-[18px] px-3 py-[4px] rounded-md hover:bg-red-700 w-full cursor-pointer"
                    onClick={logoutHandler}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;