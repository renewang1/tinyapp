const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser, urlVisited } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null if email does not exist', function() {
    const user = getUserByEmail("noEmail@example.com", testUsers);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a completely random string every time', function() {
    const random1 = generateRandomString();
    const random2 = generateRandomString();
    assert.notEqual(random1, random2);
  });
});

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW", visits: 0, visitors: [] },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW", visits: 0, visitors: [] }
};

describe('urlsForUser', function() {
  it('should return object of urls with matching user_id to current user_id', function() {
    const user_id = "aJ48lW";
    const output = urlsForUser(user_id, urlDatabase);
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW", visits: 0, visitors: [] },
      i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW", visits: 0, visitors: [] }
    };
    assert.deepEqual(output, expectedOutput);
  });

  it('should return empty object if user has no matching urls', function() {
    const user_id = 12345;
    const output = urlsForUser(user_id, urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(output, expectedOutput);
  });
});

describe('urlVisited', function() {
  const shortURL = 'i3BoGr';
  const user1 = 'abcd';
  const user2 = 'efgh';
  it('should increase visits when called', function() {
    urlVisited(shortURL, user1, urlDatabase);
    assert.equal(urlDatabase[shortURL].visits, 1);
  });

  it('should increase visitors for unique visits', function() {
    urlVisited(shortURL, user1, urlDatabase);
    urlVisited(shortURL, user2, urlDatabase);
    assert.equal(urlDatabase[shortURL].visitors.length, 2);
  });

  it('should not increase visitors for non unique visits', function() {
    const urlDatabase1 = {
      b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW", visits: 0, visitors: [] },
      i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW", visits: 0, visitors: [] }
    };
    urlVisited(shortURL, user1, urlDatabase1);
    urlVisited(shortURL, user1, urlDatabase1);
    assert.equal(urlDatabase1[shortURL].visitors.length, 1);
  });
});