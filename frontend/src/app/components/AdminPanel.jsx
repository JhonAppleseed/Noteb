import { useState } from "react";
import React from "react";
import ModNotes from "./ModNotes";
import ModUsers from "./ModUsers";
import ModTerminal from "./ModTerminal";

const AdminPanel = ({ sendCloseAdminPanel, token, isAdmin, adminName }) => {
  const closeAdminPanel = () => {
    sendCloseAdminPanel(false);
  };
  // console.log(adminName);

  const [selectedSect, setSelectedSect] = useState(null);
  const SECTIONS = {
    NOTES: 1,
    ACCOUNTS: 2,
    TERMINAL: 3,
  };
  const MODERATION = {
    1: <ModNotes token={token} isAdmin={isAdmin} />,
    2: <ModUsers token={token} isAdmin={isAdmin} />,
    3: <ModTerminal token={token} isAdmin={isAdmin} adminName={adminName} />,
  };

  return (
    <div className="h-screen w-screen absolute flex bg-white top-0 left-0">
      <div className="w-[20vw] border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-xl font-bold">ADMIN PANEL</h1>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => closeAdminPanel()}
          >
            Close Panel
          </button>
        </div>
        {/* panel nav */}
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedSect(SECTIONS.NOTES)}
            className={`cursor-pointer border-gray-100 hover:bg-gray-100 w-full px-6 py-4 text-left border-b transition-colors active:bg-gray-200 ${selectedSect == SECTIONS.NOTES && "bg-gray-100"}`}
          >
            <div className="text-sm mb-1 truncate">Users</div>
            <div className="text-xs text-gray-500">Moderating Notes</div>
          </button>

          <button
            onClick={() => setSelectedSect(SECTIONS.ACCOUNTS)}
            className={`cursor-pointer border-gray-100 hover:bg-gray-100 w-full px-6 py-4 text-left border-b transition-colors active:bg-gray-200 ${selectedSect == SECTIONS.ACCOUNTS && "bg-gray-100"}`}
          >
            <div className="text-sm mb-1 truncate">Users</div>
            <div className="text-xs text-gray-500">Moderating Accounts</div>
          </button>

          <button
            onClick={() => setSelectedSect(SECTIONS.TERMINAL)}
            className={`cursor-pointer border-gray-100 hover:bg-gray-100 w-full px-6 py-4 text-left border-b transition-colors active:bg-gray-200 ${selectedSect == SECTIONS.TERMINAL && "bg-gray-100"}`}
          >
            <div className="text-sm mb-1 truncate">Terminal</div>
            <div className="text-xs text-gray-500">Command Center</div>
          </button>
        </div>
      </div>
      {/*  */}
      <div className="flex-1 flex">
        {isAdmin && selectedSect && MODERATION[selectedSect]}
      </div>
    </div>
  );
};

export default AdminPanel;
