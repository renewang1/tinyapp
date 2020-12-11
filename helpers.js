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

const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].user_id === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

const urlVisited = function(shortURL, userID, urlDatabase) {
  urlDatabase[shortURL].visits += 1;
  if(!(urlDatabase[shortURL].visitors.includes(userID))) {
    urlDatabase[shortURL].visitors.push(userID);
  }
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, urlVisited };