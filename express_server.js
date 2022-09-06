const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = (stringLength) => {
  return (Math.random().toString(36).slice(2,stringLength + 2))
}

app.use(express.urlencoded({ extended: true }));

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
  const urls = urlDatabase;
  const templateVars = { urls: urls, };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  console.log(id);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
  console.log(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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