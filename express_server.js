const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

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

//Function that returns object containing urls that match user's ID
const urlsForUser = function(id) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

//Homepage that redirects to urls page if logged in or login page if not
app.get("/", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (user) {
    res.redirect("urls");
  } else {
    res.redirect("login")
  }
});

//get urls that gives template file the complete url database, user cookie,
//and url checking function
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { urls: urlDatabase, user, urlsForUser };
  if (!user) {
    res.status(403).send('User is not logged in');
  } else {
    res.render("urls_index", templateVars);
  }
});

//post urls that creates new shortURL given a longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.cookies["user_id"]].id ;
  if (userID) {
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send('User is not logged in');
  }
  //Adding new shortURL to database using longURL input and userID from cookie
});

//get urls/new page that gives user cookie if user is logged in or redirects
//to login page if not
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

//get request that renders a single page relating to the shortURL passed in
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

//get request that will redirect user to longURL associated to shortURL that
//is passed in
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    res.status(404).send('Page not found');
  }
  let longURL = urlDatabase[shortURL].longURL;
  const httpsCheck = longURL.substring(0, 8) === "https://";
  const httpCheck = longURL.substring(0, 7) === "http://";
  //checking if longURL has 'http://' or 'https://', if not it will add it
  //must do this because res.redirect will redirect to relative path if no protocol detected
  if (httpsCheck || httpCheck) {
    res.redirect(longURL);
  } else {
    longURL = `https://${longURL}`;
    res.redirect(longURL);
  }
});

//post request to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user_id = users[req.cookies["user_id"]].id;
  //checking if shortURL belongs to user before deleting based on cookies
  if (!user_id) {
    res.status(403).send('User is not logged in');
  } else if (!urlsForUser(user_id).includes(shortURL)) {
    res.status(403).send('User does not own this url');
  } else if (shortURL in urlsForUser(user_id)) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }
});

//post request to update a URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  const user_id = users[req.cookies["user_id"]].id;
  //checking if shortURL belongs to user before editing based on cookies
  if (!user_id) {
    res.status(403).send('User is not logged in');
  } else if (!urlsForUser(user_id).includes(shortURL)) {
    res.status(403).send('User does not own this URL');
  } else if (shortURL in urlsForUser(user_id)) {
    urlDatabase[shortURL].longURL = newURL;
    res.redirect("/urls");
  }
});

//get request for login page
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  //checking if user is logged in before rendering login page, if already logged in then redirect to /urls
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars)
  }
})

//post request for user to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let id in users) {
    //checking if email and password inputted matches a user in the database
    //password check is for hashed password for security
    if (users[id].email === email && bcrypt.compareSync(password, users[id].hashedPassword)) {
      res.cookie('user_id', users[id].id);
      res.redirect(`/urls`);
      return;
    }
  }
  res.status(401).send('Email or password is incorect');
});

//post request to logout, clears cookies and redirects to /url
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

//get request for register page
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user };
  //checking if user is already logged in, if they are then redirect to /urls
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
})

//post request to register, generates random ID and assigns to user in database
app.post("/register", (req, res) => {
  const ID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  //Checking if email or password field is empty
  if (email === '' || password === '') {
    res.status(401).send('Email or password is incorect');
    return;
  }
  //Checking if email is already in use by existing user
  if (emailLookup(email)) {
    res.status(409).send('Email is already in use');
    return;
  }
  //Creating user in users database
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[ID] = { id: ID, email, hashedPassword };
  res.cookie('user_id', ID);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
