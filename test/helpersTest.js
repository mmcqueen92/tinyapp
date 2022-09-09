const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const actual = findUserByEmail("user@example.com", testUsers)
    const expected = "userRandomID";
    assert.equal(actual, expected);
  });
  it('should return undefined if user does not exist with the given email', function() {
    const actual = findUserByEmail("doesntexist@example.com", testUsers)
    const expected = undefined;
    assert.equal(actual, expected);
  });
});

