// Simple in-memory user storage (no MongoDB required)
const users = [];

class User {
  // Create new user
  static async create(userData) {
    const newUser = {
      id: users.length + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'student',
      wishlist: userData.wishlist || [],
      createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
  }

  // Find one user by condition (e.g., { email: "test@example.com" })
  static async findOne(condition) {
    const key = Object.keys(condition)[0];
    const value = condition[key];
    return users.find(user => user[key] === value);
  }

  // Find user by ID
  static async findById(id) {
    return users.find(user => user.id === parseInt(id));
  }

  // Find user by email
  static async findByEmail(email) {
    return users.find(user => user.email === email);
  }

  // Get all users (for testing)
  static async getAll() {
    return users;
  }

  // Update user
  async save() {
    const index = users.findIndex(u => u.id === this.id);
    if (index !== -1) {
      users[index] = this;
    }
    return this;
  }
}

module.exports = User;