const chai = require('chai');
const expect = chai.expect;

describe(' Email Validation Tests', () => {
  it(' Valid email should pass', () => {
    const email = 'student@example.com';
    const isValid = email.includes('@') && email.includes('.');
    expect(isValid).to.be.true;
  });

  it(' Email without @ should fail', () => {
    const email = 'studentexample.com';
    const isValid = email.includes('@') && email.includes('.');
    expect(isValid).to.be.false;
  });

  it(' Email without domain should fail', () => {
    const email = 'student@';
    const isValid = email.includes('@') && email.includes('.');
    expect(isValid).to.be.false;
  });

  it(' Empty email should fail', () => {
    const email = '';
    expect(email.length).to.equal(0);
  });
});

describe(' Password Validation Tests', () => {
  it(' Password >= 6 chars should pass', () => {
    const password = '123456';
    expect(password.length).to.be.at.least(6);
  });

  it(' Password < 6 chars should fail', () => {
    const password = '12345';
    expect(password.length).to.be.lessThan(6);
  });
});

describe(' Name Validation Tests', () => {
  it(' Name >= 3 chars should pass', () => {
    const name = 'Ali';
    expect(name.length).to.be.at.least(3);
  });

  it(' Name < 3 chars should fail', () => {
    const name = 'A';
    expect(name.length).to.be.lessThan(3);
  });
});