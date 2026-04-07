const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import app (make sure index.js exports app)
const app = require('../../index');

describe(' Authentication API Tests', () => {
  let testUser = {
    name: `TestUser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: '123456',
    role: 'student'
  };

  describe('POST /api/auth/register', () => {
    it('TC-01: Should register user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Signup successful');
      expect(response.body.user).to.have.property('email', testUser.email);
    });

    it('TC-02: Should fail with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).to.equal(409);
      expect(response.body).to.have.property('error', 'User already exists');
    });

    it('TC-03: Should fail with short name (<3 chars)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'short@example.com',
          password: '123456'
        });
      
      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('at least 3');
    });

    it('TC-04: Should fail with invalid email (no @)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: '123456'
        });
      
      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('Invalid email');
    });

    it('TC-05: Should fail with short password (<6 chars)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'password@example.com',
          password: '123'
        });
      
      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('at least 6');
    });
  });

  describe('POST /api/auth/login', () => {
    it('TC-06: Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Login successful');
    });

    it('TC-07: Should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).to.equal(401);
      expect(response.body.error).to.include('Invalid credentials');
    });

    it('TC-08: Should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: '123456'
        });
      
      expect(response.status).to.equal(401);
    });
  });
});