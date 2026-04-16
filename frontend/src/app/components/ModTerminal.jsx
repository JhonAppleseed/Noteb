import React from "react";
import NotebTerminal from "./NotebTerminal";

const ModTerminal = ({ token, isAdmin, adminName }) => {
  return (
    <div className="flex flex-1">
      <NotebTerminal token={token} isAdmin={isAdmin} adminName={adminName} />
    </div>
  );
};

export default ModTerminal;
