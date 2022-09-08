// --- REQUIREMENTS ---
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");


/// --- MIDDLEWARE ---
app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


/// --- DATABASES --- (SHOULD THESE BE ARRAYS?)
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'default' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'default' }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


/// --- FUNCTIONS --- (MODIFY TO IMPORT?)
const userExists = (givenEmail) => {
  for (let user in users) {
    if (users[user].email === givenEmail) {
      return true;
    }
  }
  return false;
};

const findUser = (givenEmail) => {
  for (let user in users) {
    if (users[user].email === givenEmail) {
      return user;
    }
  }
};

const generateRandomString = (stringLength) => {
  return (Math.random().toString(36).slice(2, stringLength + 2));
};


// --- BREAD ---
app.get("/", (req, res) => {
  res.send("Hello!");
});

// --- JSON URLDATABASE ---
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// --- HELLO ---
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// --- GET MAIN PAGE ---
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies.user_id) {
      urls[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urls, users: users, user: user };
  res.render("urls_index", templateVars);
});

// --- POST NEW URL ---
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.send("You cannot create new shortened URLs because you are not logged in.");
  } else if (user) {
    const id = generateRandomString(6);
    urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies.user_id, };
    res.redirect(`/urls`);
  }
});

// --- GET CREATE NEW PAGE ---
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.redirect("/login");
  } else if (user) {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

// --- GET REGISTER PAGE ---
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: user };
  res.render("register", templateVars);
});

// --- POST REGISTER ---
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.send("Error 400: Invalid Request.\nPlease enter a valid email address and a password.");
  } else if (userExists(req.body.email)) {
    res.send('Email is already registered');
  } else {
    const newUserId = generateRandomString(6);
    const password = req.body.password;
    const hashedPass = bcrypt.hashSync(password, 10);
    users[newUserId] = { id: newUserId, email: req.body.email, password: hashedPass };
    res.cookie("user_id", newUserId);
    res.redirect("/urls");
  }
});

// --- GET LOGIN PAGE ---
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: user };
  res.render("login", templateVars);
});

// --- POST LOGIN ---
app.post("/login", (req, res) => {
  if (!userExists(req.body.email)) {
    res.send('Error 403: Email or Password is incorrect.');
  } else if (userExists(req.body.email)) {
    const user = findUser(req.body.email);
    const userHashedPass = users[user].password;
    const givenPassword = req.body.password;
    if (!bcrypt.compareSync(givenPassword, userHashedPass)) {
      res.send('Error 403: Email or Password is incorrect.');
    } else if (bcrypt.compareSync(givenPassword, userHashedPass)) {
      res.cookie("user_id", user);
      res.redirect("/urls");
    }
  }
});

// --- POST LOGOUT ---
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});



// --- GET VIEW SHORTENED URL PAGE ---
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  if (urlDatabase[req.params.id]) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user };
    res.render("urls_show", templateVars);
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send("Page not found");
  }
});

// --- POST DELETE URL ---
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(403).send("Error 403: You don't have permission to do that.");
  } else if (req.cookies.user_id) {
    const user = users[req.cookies.user_id].id;
    if (!urlDatabase[req.params.id]) {
      res.status(404).send("Error 404 page not found");
    } else if (!user || user !== urlDatabase[req.params.id].userID) {
      res.status(403).send("Error 403: You don't have permission to do that.");
    } else if (user === urlDatabase[req.params.id].userID) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    }
  }
});

// --- POST EDIT URL ---
app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id].id;
  if (!user || user !== urlDatabase[req.params.id].userID) {
    res.status(403).send("Error 403: You don't have permission to do that.");
  } else if (!urlDatabase[req.params.id]) {
    res.send("Given URL doesnt exist and cannot be modified.");
  } else if (user === urlDatabase[req.params.id].userID) {
    const id = req.params.id;
    const newURL = req.body.newURL;
    urlDatabase[id].longURL = newURL;
    res.redirect(`/urls`);
  }
});

// --- LISTEN ON PORT X ---
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});