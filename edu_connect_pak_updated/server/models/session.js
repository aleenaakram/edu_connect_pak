// TEMPORARILY DISABLED - Session model for assignment purposes
// Assignment focus: Only Login/Signup functionality testing

// Simple placeholder to avoid mongoose errors
class Session {
  static async create() {
    throw new Error("Session feature is disabled for this assignment");
  }
  
  static async find() {
    return [];
  }
  
  static async findOne() {
    return null;
  }
  
  static async findById() {
    return null;
  }
}

module.exports = Session;