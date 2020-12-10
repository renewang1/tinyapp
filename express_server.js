const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = {};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
}

const emailLookup = function(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let urls = {};
  for (let url in urlDatabase) {
    // console.log(id);
    console.log(urlDatabase[url]);
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (user) {
    res.redirect("urls");
  } else {
    res.redirect("login")
  }
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { urls: urlDatabase, user, urlsForUser };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.cookies["user_id"]].id ;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const httpsCheck = longURL.substring(0, 8) === "https://";
  const httpCheck = longURL.substring(0, 7) === "http://";
  if (httpsCheck || httpCheck) {
    res.redirect(longURL);
  } else {
    longURL = `https://${longURL}`;
    res.redirect(longURL);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = users[req.cookies["user_id"]].id;
  if (urlsForUser(user_id).includes(shortURL)) {
    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  const user_id = users[req.cookies["user_id"]].id;
  if (urlsForUser(user_id).includes(shortURL)) {
    urlDatabase[shortURL].longURL = newURL;
  }
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars)
  }
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let id in users) {
    if (users[id].email === email && users[id].password === password) {
      res.cookie('user_id', users[id].id);
      res.redirect(`/urls`);
      return;
    }
  }
  res.statusCode = 403;
  res.end("Email or password cannot be found");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
})

app.post("/register", (req, res) => {
  const ID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.statusCode = 400;
    res.end('Invalid email or password');
    return;
  }
  if (emailLookup(email)) {
    res.statusCode = 400;
    res.end("Email already in use");
    return;
  }
  users[ID] = { id: ID, email, password };
  res.cookie('user_id', ID);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
