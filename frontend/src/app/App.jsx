import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { NotesApp } from "./components/NotesApp";

export default function App() {
  const [currentView, setCurrentView] = useState("login");
  const [currentToken, setCurrentToken] = useState("");

  useEffect(() => {
    try {
      setCurrentToken(localStorage.getItem("token"));
      if (localStorage.getItem("token") != null) {
        setCurrentView("app");
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <>
      {currentView === "login" && (
        <Login
          onSwitchToRegister={() => setCurrentView("register")}
          onLogin={(currentToken) => {
            setCurrentToken(currentToken);
            setCurrentView("app");
          }}
        />
      )}
      {currentView === "register" && (
        <Register
          onRegister={() => setCurrentView("login")}
          // onRegister={() => console.log("Register attempt")}
          onSwitchToLogin={() => setCurrentView("login")}
        />
      )}
      {currentView === "app" && (
        <NotesApp
          onLogout={() => {
            setCurrentToken("");
            setCurrentView("login");
          }}
          token={currentToken}
        />
      )}
    </>
  );
}
