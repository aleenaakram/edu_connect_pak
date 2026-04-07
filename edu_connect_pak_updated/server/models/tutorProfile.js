// TEMPORARILY DISABLED - TutorProfile model for assignment purposes
// Assignment focus: Only Login/Signup functionality testing

class TutorProfile {
  static async create() {
    throw new Error("TutorProfile feature is disabled for this assignment");
  }
  
  static async findOne() {
    return null;
  }
  
  static async find() {
    return [];
  }
  
  static async findById() {
    return null;
  }
  
  static async findByIdAndUpdate() {
    return null;
  }
  
  async save() {
    throw new Error("TutorProfile feature is disabled for this assignment");
  }
}

module.exports = TutorProfile;