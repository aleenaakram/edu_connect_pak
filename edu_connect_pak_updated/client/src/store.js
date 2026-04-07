import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./context/authSlice"; // We'll create this next

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
