const getUserByEmail = function(email, database) {
  let user = null;
  for (let id in database) {
    if (database[id].email === email) {
      user = database[id];
    }
  }
  return user;
}

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = { getUserByEmail, generateRandomString };