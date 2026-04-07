import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../context/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">EduConnectPakistan</h1>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-white">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition duration-200"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
