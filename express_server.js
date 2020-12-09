const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/urls", (req, res) => {
  const username = (req.cookies) ? req.cookies["username"] : undefined;
  const templateVars = { urls: urlDatabase, username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = (req.cookies) ? req.cookies["username"] : undefined;
  const templateVars = { username };
  console.log(req)
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = (req.cookies) ? req.cookies["username"] : undefined;
  const templateVars = { shortURL, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
