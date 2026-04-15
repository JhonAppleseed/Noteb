import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, LogOut } from "lucide-react";
import "../styles/notes.css";

export function NotesApp({ onLogout, token }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [username, setUsername] = useState(null);
  const [adminStatus, setAdminStatus] = useState("");

  const fetchUserNoteData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAdminStatus(data.admin);
      setUsername(data.username);
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserNoteData(token).then((data) => {
      setUserNoteData(data.notes);
      setSelectedNoteId(data?.notes?.[0]?.id || null);
    });
  }, [token]);

  const [userNoteData, setUserNoteData] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const selectedNote = userNoteData?.find(
    (note) => note?.id === selectedNoteId,
  );

  const [editingTitle, setEditingTitle] = useState(false);

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // console.log(userNoteData);

  const updateNoteContent = (content) => {
    setUserNoteData(
      userNoteData.map((note) =>
        note.id === selectedNoteId
          ? { ...note, content, created_at: new Date() }
          : note,
      ),
    );
  };

  const updateNoteTitle = (title) => {
    setUserNoteData(
      userNoteData.map((note) =>
        note.id === selectedNoteId
          ? { ...note, title, updatedAt: new Date() }
          : note,
      ),
    );
  };

  // Updating logic
  const userNoteUpdate = async (token) => {
    try {
      const response = await fetch(`${API_URL}/notes/${selectedNoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const userNoteAdd = async (newNote, token) => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const createNewNote = async (token) => {
    const newNote = {
      title: "Untitled",
      content: "",
      created_at: new Date(),
    };

    const result = await userNoteAdd(newNote, token);
    setUserNoteData((prev) => [{ ...newNote, id: result.id }, ...(prev ?? [])]);
    setSelectedNoteId(result.id);
  };

  useEffect(() => {
    if (!selectedNote || !selectedNoteId) return;
    if (typeof selectedNoteId === "string") return; // fake id, skip
    const timer = setTimeout(() => {
      userNoteUpdate(token);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userNoteData]);

  const userDeleteNote = async (token, selectedNoteId) => {
    try {
      const response = await fetch(`${API_URL}/notes/${selectedNoteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedNoteId,
        }),
      });
      const data = await response.json();

      setUserNoteData(
        userNoteData.filter((note) => note.id !== selectedNoteId),
      );

      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSelectedNoteId([]); // clear user state
    setUserNoteData([]); // clear any content state if needed
    onLogout(); // then change the "site"
  };

  return (
    <>
      <div className="h-screen flex bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl tracking-tight">
                Noteb
                {username
                  ? ` - ${username.charAt(0).toUpperCase() + username.slice(1)}`
                  : ""}
              </h1>
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-600 cursor-pointer" />
              </button>
            </div>
            <button
              onClick={() => createNewNote(token)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {userNoteData?.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full px-6 py-4 text-left border-b border-gray-100 transition-colors ${
                  selectedNoteId === note.id ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="text-sm mb-1 truncate">{note.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
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
                  {editingTitle ? (
                    <input
                      id={selectedNoteId}
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => updateNoteTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingTitle(false);
                      }}
                      className="flex flex-1 text-3xl tracking-tight bg-transparent border-none outline-none w-full outline-0"
                      autoFocus
                    />
                  ) : (
                    <h2
                      onClick={() => setEditingTitle(true)}
                      className="text-3xl flex-1 tracking-tight cursor-text hover:text-gray-700 transition-colors"
                    >
                      {selectedNote.title}
                    </h2>
                  )}
                  {selectedNoteId ? (
                    //
                    <span
                      className="trash"
                      onClick={() => setShowConfirmDelete(true)}
                    >
                      <span></span>
                    </span>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="flex-1 px-16 py-12 overflow-y-auto">
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => updateNoteContent(e.target.value)}
                    spellCheck={false}
                    placeholder="Start writing..."
                    className="w-full h-full resize-none bg-transparent border-none outline-none text-base leading-relaxed placeholder:text-gray-400"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Logout  */}
      <AnimatePresence>
        {showConfirmLogout && (
          <motion.div
            className="flex flex-col p-8 rounded-md gap-4 absolute top-1/2 left-1/2 outline-1 items-center z-999 backdrop-blur-sm bg-white/30"
            initial={{ opacity: 0, scale: 0.85, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.85, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <span className="text-[2ch]">Do you want to logout?</span>
            <div className="flex justify-between gap-[2em]">
              <button
                className="text-[2ch] text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-md transition-colors cursor-pointer outline-1 outline-black"
                onClick={() => {
                  setAdminStatus(0);
                  handleLogout();
                }}
              >
                Confirm
              </button>
              <button
                className="text-[2ch] text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md transition-colors cursor-pointer outline-1 outline-white"
                onClick={() => setShowConfirmLogout(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete popup */}
      <AnimatePresence>
        {showConfirmDelete && (
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
                  userDeleteNote(token, selectedNoteId);
                  setShowConfirmDelete(false);
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
        )}
      </AnimatePresence>
    </>
  );
}
