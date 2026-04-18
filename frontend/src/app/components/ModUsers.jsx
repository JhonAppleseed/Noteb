import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ModUsers = ({ token, isAdmin }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const userAccountsAdmin = async (token) => {
    try {
      const response = await fetch(`${API_URL}/useraccountsadmin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const dataNotAdmin = data.users.filter((data) => data["is_admin"] === 0);
      console.log(dataNotAdmin);
      setUserAccounts(dataNotAdmin);
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      userAccountsAdmin(token);
      setLoading(false);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const [userAccounts, setUserAccounts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const selectedNote = userAccounts?.find(
    (user) => user?.id === selectedNoteId,
  );

  return (
    <>
      <div className="flex w-full">
        {!loading && isAdmin && (
          <div className="flex flex-col overflow-y-auto">
            {userAccounts?.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedNoteId(user.id)}
                className={`px-6 py-4 text-left w-[20vw] border-b border-gray-100 transition-colors hover:bg-gray-50 ${selectedNoteId == user.id && "bg-gray-100"}`}
              >
                <div className="text-sm mb-1 truncate font-semibold">
                  <h2 className="">{user.name} </h2> USER ID: {user.id}
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  CREATED AT: {user.created_at}
                </div>
                {user.is_banned ? (
                  <div className="text-xs font-semibold text-gray-600">
                    BANNED
                  </div>
                ) : (
                  <></>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ModUsers;
