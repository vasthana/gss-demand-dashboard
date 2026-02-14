// src/App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login";
import Dashboard from "./components/pages/dashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={setCurrentUser} />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to="/login" />} // redirect root to /login
        />
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <Dashboard
                user={currentUser}
                onLogout={() => setCurrentUser(null)}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
