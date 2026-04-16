import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ModNotes = ({ token, isAdmin }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const userNoteAdmin = async (token) => {
    try {
      const response = await fetch(`${API_URL}/usersnotesadmin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const dataNotAdmin = data.notes.filter((data) => data["is_admin"] === 0);
      setUserNotes(dataNotAdmin);
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      userNoteAdmin(token);
      setLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const [userNotes, setUserNotes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const selectedNote = userNotes?.find((note) => note?.id === selectedNoteId);

  const adminNoteDelete = async (token, selectedNoteId) => {
    try {
      const response = await fetch(
        `${API_URL}/adminUserNoteDelete/${selectedNoteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedNoteId,
          }),
        },
      );
      const data = await response.json();

      setUserNotes(userNotes.filter((note) => note.id !== selectedNoteId));
      setSelectedNoteId(null);

      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="flex w-full">
        {!loading && isAdmin && (
          <div className="flex flex-col overflow-y-auto">
            {userNotes?.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`px-6 py-4 text-left w-[20vw] border-b border-gray-100 transition-colors hover:bg-gray-50 ${selectedNoteId == note.id && "bg-gray-100"}`}
              >
                <div className="text-sm mb-1 truncate font-semibold">
                  <h2 className="">
                    {note.name}{" "}
                    {isAdmin && selectedNoteId == note.id && (
                      <span
                        className="float-right brightness-0 text-sm cursor-pointer"
                        onClick={() => {
                          console.log("Deleting note id:", selectedNoteId);
                          setConfirmDelete(true);
                        }}
                      >
                        ✖
                      </span>
                    )}
                  </h2>{" "}
                  USER ID: {note.user_id}
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  {note.title} | {note.id}
                </div>
                <div className="text-xs text-gray-500">{note.content}</div>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-1">
          <AnimatePresence mode="wait">
            {selectedNote && (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col"
              >
                <div className="px-16 py-12 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-3xl flex-1 tracking-tight cursor-text font-semibold transition-colors">
                    {selectedNote.title}
                  </h2>
                </div>

                <div className="flex-1 px-16 py-12 overflow-y-auto">
                  <span className="w-full h-full bg-transparent border-none outline-none text-base leading-relaxed placeholder:text-gray-400">
                    {selectedNote.content}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="absolute w-screen h-screen top-0 left-0 bg-transparent">
            <motion.div
              className="flex flex-col p-8 rounded-md gap-4 absolute top-1/2 left-1/2 outline-1 items-center z-999 backdrop-blur-sm bg-white/30"
              initial={{ opacity: 0, scale: 0.85, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.85, x: "-50%", y: "-50%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <span className="text-[2ch]">
                Delete note: "{selectedNote.title}"?
              </span>
              <div className="flex justify-between gap-[2em]">
                <button
                  className="text-[2ch] text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-md transition-colors cursor-pointer outline-1 outline-black"
                  onClick={() => {
                    adminNoteDelete(token, selectedNoteId);
                    setConfirmDelete(false);
                  }}
                >
                  Confirm
                </button>
                <button
                  className="text-[2ch] text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md transition-colors cursor-pointer outline-1 outline-white"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModNotes;
