// src/App.js
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login";
import Dashboard from "./components/pages/dashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Routes>
      {/* Login Page */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={setCurrentUser} />
          )
        }
      />

      {/* Dashboard Page */}
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <Dashboard
              user={currentUser}
              onLogout={() => setCurrentUser(null)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
