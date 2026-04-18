import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, LogOut } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import "../styles/notes.css";
import AdminPanel from "./AdminPanel";

export function NotesApp({ onLogout, token }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState(null);
  const [adminPanel, setAdminPanel] = useState(false);

  const fetchUserNoteData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsername(data.username); // keep for UI rendering elsewhere
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
      setSaving(false);
      userNoteUpdate(token);
    }, 1000);
    return () => {
      clearTimeout(timer);
      setSaving(true);
    };
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

  const handleCloseAdminPanel = () => {
    setAdminPanel(false);
  };

  const user = token ? jwtDecode(token) : null;
  const isAdmin = user?.is_admin === 1;

  const [openTagId, setOpenTagId] = useState(null);

  const [currSearch, setCurrSearch] = useState("");

  const filteredNotes = userNoteData.filter((note) =>
    note.title.toLowerCase().includes(currSearch.toLowerCase()),
  );

  return (
    <>
      <div className="h-screen flex bg-white">
        {/* Sidebar */}
        <div className="w-[20vw] border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold tracking-tight">
                Noteb
                {username
                  ? ` - ${username.charAt(0).toUpperCase() + username.slice(1)}`
                  : ""}
              </h1>
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
          {isAdmin && (
            <div className="p-4 border-b border-gray-200 flex justify-center">
              <button
                className="justify-center cursor-pointer rounded-md flex bg-gray-200 hover:bg-gray-300 transition-all transition-300 w-full py-2"
                onClick={() => setAdminPanel(true)}
              >
                Admin Panel
              </button>
            </div>
          )}
          <div className="p-4 border-b border-gray-200 flex justify-center">
            <input
              className="justify-center cursor-pointer rounded-md flex bg-gray-200 hover:bg-gray-300 transition-all px-4 transition-300 w-full py-2"
              placeholder="Search..."
              value={currSearch}
              onChange={(e) => setCurrSearch(e.target.value)}
            />
          </div>

          <div className="flex-1">
            {filteredNotes?.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`flex justify-between w-full px-6 py-4 text-left border-b border-gray-100 transition-colors ${
                  selectedNoteId === note.id ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="mb-1 flex flex-col">
                  <span className="inline-block max-w-37.5 truncate text-sm">
                    {note.title}
                  </span>
                  <span className="inline-block max-w-37.5 truncate text-sm">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Tags */}
                {/* <AnimatePresence mode="wait">
                  {selectedNoteId == note.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center"
                    >
                      <div className="flex items-center relative">
                        <span
                          className="cursor-pointer text-[2ch] brightness-150 hover:brightness-125 transition-all transition-300"
                          onClick={() =>
                            setOpenTagId(
                              selectedNoteId == openTagId
                                ? null
                                : selectedNoteId,
                            )
                          }
                        >
                          ➕
                        </span>
                        {selectedNoteId == openTagId && (
                          <div className="w-20 h-auto bg-red-200 absolute left-full ml-10">
                            tags
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </button>
            ))}
          </div>
          {/*  */}
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
                <div className="px-16 py-12 gap-[2em] border-b border-gray-200 flex items-center justify-between">
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

                  {/* NOTE DELETE */}
                  {selectedNoteId && (
                    <span
                      className="trash"
                      onClick={() => setShowConfirmDelete(true)}
                    >
                      <span></span>
                    </span>
                  )}
                </div>
                <div className="absolute top-0 px-2 text-gray-500">
                  {saving && "Saving..."}
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

        {/*  */}
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
      {/* admin panel */}
      {isAdmin && adminPanel && username !== null && (
        <AdminPanel
          sendCloseAdminPanel={handleCloseAdminPanel}
          token={token}
          isAdmin={isAdmin}
          adminName={username}
        />
      )}
    </>
  );
}
