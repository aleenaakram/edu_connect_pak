import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/student/StudentDashboard";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
import Navbar from "./components/common/Navbar";
import Signup from "./pages/auth/Signup.js";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <h1 className="text-center mt-10 text-2xl">
              Welcome to EduConnectPakistan
            </h1>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
