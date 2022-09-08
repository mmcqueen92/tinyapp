const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

const userExists = (givenEmail) => {
  for (user in users) {
    if (users[user].email === givenEmail)  {
      return true;
    }
  }
  return false;
};

const findUser = (givenEmail) => {
  for (user in users) {
    if (users[user].email === givenEmail)  {
      return user;
    }
  }
};

const generateRandomString = (stringLength) => {
  return (Math.random().toString(36).slice(2,stringLength + 2))
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const urls = urlDatabase;
  const templateVars = { urls: urls, users: users, user: user };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});


app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user}
  res.render("register", templateVars);
})

app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const id = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[id] = newURL;
  const templateVars = { user: user }
  res.redirect(`/urls`)
})

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  if (!userExists(req.body.email)) {
    res.send('Error 403: Email or Password is incorrect.');
  } 
  else if (userExists(req.body.email)) {
    const user = findUser(req.body.email);
    if (users[user].password !== req.body.password) {
      res.send('Error 403: Email or Password is incorrect.');
    } else if (users[user].password === req.body.password) {
      res.cookie("user_id", user)
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  if (req.body.email.length < 5 || req.body.password.length < 1)  {
    res.send("Error 400: Invalid Request.\nPlease enter a valid email address and a password.");
  } else if (userExists(req.body.email) === true)  {
    res.send('Email is already registered');
  } else {
    const newUserId = generateRandomString(6);
    users[newUserId] = { id: newUserId, email: req.body.email, password: req.body.password };
    res.cookie("user_id", newUserId);
    res.redirect("/urls");
  }
})

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user}
  res.render("login", templateVars);
})

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user };
  const urlDatabaseKey = templateVars.id;
  if (urlDatabase[urlDatabaseKey]) {
    res.render("urls_show", templateVars);
  } else if (!urlDatabase.urlDatabaseKey) {
    res.send("Error 404 page not found");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});