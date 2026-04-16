import React, { useState } from "react";

const ModUsers = ({ token, isAdmin }) => {
  const userModAdmin = async (token) => {
    try {
      const response = await fetch(`${API_URL}/usersnotesadmin`, {
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

  return <div>ModUsers</div>;
};

export default ModUsers;
