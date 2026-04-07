# 📌 Project Overview

EduConnect Pakistan is a comprehensive authentication system that allows users to sign up and log in as students or tutors. The system includes:

- User registration with email, password, and name validation
- Secure login with credential verification
- Role-based access (student/tutor/admin)
- Session management using JWT tokens

Authentication Features:
- ✅ Email validation (format checking)
- ✅ Password strength validation (minimum 6 characters)
- ✅ Name validation (minimum 3 characters)
- ✅ Duplicate email prevention
- ✅ Error handling for invalid credentials

---

## 🧪 Testing Purpose

**Why automation is implemented?**

Automated testing ensures that the authentication system remains **reliable**, **secure**, and **bug-free** as the codebase evolves. Key benefits include:

| Benefit | Description |
|---------|-------------|
| **Regression Prevention** | Catches bugs before they reach production |
| **Time Efficiency** | Runs 16+ tests in under 10 seconds |
| **CI/CD Integration** | Tests run automatically on every code change |
| **Documentation** | Tests serve as executable documentation |
| **Confidence** | Enables fearless refactoring and feature addition |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for backend |
| **Express.js** | Web framework for API routes |
| **Mocha** | Test framework for writing test suites |
| **Chai** | Assertion library for test validations |
| **Supertest** | HTTP assertion library for API testing |
| **Jenkins** | CI/CD pipeline for automated test execution |
| **Nodemon** | Development server with auto-restart |

---

## 📊 Test Summary Table

| Type | Count | Status |
|------|-------|--------|
| **Unit Tests** (Validation Logic) | 8 | ✅ **Pass** |
| **Integration Tests** (API Endpoints) | 8 | ✅ **Pass** |
| **Total** | **16** | ✅ **Pass** |

### Test Breakdown:

**Unit Tests (8 tests):**
- Email validation (4 tests)
- Password validation (2 tests)
- Name validation (2 tests)

**Integration Tests (8 tests):**
- Signup endpoint (5 tests)
- Login endpoint (3 tests)

---

## 🔧 Jenkins Pipeline Explanation

### Stage-wise Breakdown

| Stage | Description | Commands |
|-------|-------------|----------|
| **1. Checkout Code** | Pulls latest code from GitHub repository | `git clone` |
| **2. Install Dependencies** | Installs Node.js packages | `npm install` |
| **3. Run Unit Tests** | Executes validation logic tests | `npm run test:unit` |
| **4. Run Integration Tests** | Executes API endpoint tests | `npm run test:integration` |
| **5. Generate Reports** | Creates JUnit XML test reports | `mocha --reporter mocha-junit-reporter` |
| **Post-build Actions** | Sends success/failure notifications | Email alerts |

edu_connect_pak/
├── server/
│ ├── index.js # Main Express server
│ ├── package.json # Dependencies & scripts
│ ├── tests/
│ │ ├── unit/
│ │ │ └── validation.test.js # Unit tests
│ │ └── integration/
│ │ └── auth.test.js # API integration tests
│ └── Jenkinsfile # CI/CD pipeline definition
├── client/ # React frontend
├── README.md # This file
└── .gitignore

---

## 🚀 Local Setup & Test Execution

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/aleenaakram/edu_connect_pak.git
cd edu_connect_pak/edu_connect_pak_updated

# Install server dependencies
cd server
npm install

# Install testing dependencies
npm install --save-dev mocha chai supertest

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Start the server (Terminal 1)
npm run dev

# Start the client (Terminal 2)
cd ../client
npm start

java -jar jenkins.war --httpPort=9090
