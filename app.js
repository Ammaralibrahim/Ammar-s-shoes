//  to controll ur website

const express = require("express");
const app = express();
const port = 5000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const Article = require("./models/articleSchema");
const User = require("./models/UserSchema");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser());
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);


// for auto refresh
const path = require("path");
const livereload = require("livereload");
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));

const connectLivereload = require("connect-livereload");
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// mongoose

mongoose
  .connect(
    "mongodb+srv://ammar:alibrahim@cluster0.51i7rk6.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

  app.get("/", (req, res) => {
    res.redirect("/home");
  });
  
  app.get("/home", (req, res) => {
    res.render("home");
  });
  
  app.post("/home", (req, res) => {
    // form verilerinin alınması
    const { title, summary, number, shoesname, body } = req.body;
  
    // veri nesnesi oluşturma
    const article = new Article({ title, summary, number, shoesname, body });
  
    // veri nesnesinin veritabanına kaydedilmesi
    article.save()
      .then(() => {
        res.redirect("/all-shoes");
      })
      .catch((err) => {
        console.error(err);
        res.send("Veritabanına kaydetme sırasında hata oluştu.");
      });
  });
  
  app.get("/all-shoes", (req, res) => {
    Article.find()
      .then((articles) => {
        res.render("all-shoes", { articles });
      })
      .catch((err) => { 
        console.error(err);
        res.send("Verileri çekme sırasında hata oluştu.");
      });
  });
  
  app.get("/user", (req, res) => {
    if (req.session.user) {
      res.render("user", { user: req.session.user });
    } else {
      res.redirect("/login");
    }
  });
  
  // Signup Route
  app.get("/signup", (req, res) => {
    res.render("signup");
  });
  
  app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    User.create({ username, email, password })
      .then((user) => {
        req.session.user = user;
        res.render("user", { user });
      })
      .catch((err) => {
        console.error(err);
        res.send("Kullanıcı kaydetme sırasında hata oluştu.");
      });
  });
  
  // Login Route
  app.get("/login", (req, res) => {
    res.render("login");
  });
  
  // setting the user object in session after successful login
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email, password })
    .then((user) => {
    if (user) {
    req.session.user = user;
    res.render("user", { user });
    } else {
    res.send("Email veya şifre yanlış.");
    }
    })
    .catch((err) => {
    console.error(err);
    res.send("Giriş sırasında hata oluştu.");
    });
    });