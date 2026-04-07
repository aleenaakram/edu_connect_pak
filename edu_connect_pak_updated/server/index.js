const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ========== SIMPLE IN-MEMORY STORAGE ==========
const users = [];

// ========== SIGNUP ROUTE ==========
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Validations
  if (!name || name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }
  
  // Create user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: role || "student",
    createdAt: new Date()
  };
  users.push(newUser);
  
  res.status(201).json({ 
    message: "Signup successful", 
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// ========== LOGIN ROUTE ==========
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  res.status(200).json({ 
    message: "Login successful", 
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// ========== GET ALL USERS (FOR TESTING) ==========
app.get("/api/users", (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

// ========== TEST ROUTE ==========
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running", 
    endpoints: {
      signup: "POST /api/auth/register",
      login: "POST /api/auth/login",
      users: "GET /api/users"
    }
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Login/Signup API ready for testing`);
  console.log(``);
  console.log(`📍 POST /api/auth/register - Signup`);
  console.log(`📍 POST /api/auth/login - Login`);
  console.log(`📍 GET /api/users - List all users`);
});

module.exports = app;