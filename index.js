import express from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import { connect } from "net";
import { error } from "console";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const app = express();

mongoose
  .connect(
    "mongodb+srv://animeshpandeyit:Animesh123@cluster0.nvlem2q.mongodb.net/",
    { dbName: "backend" }
  )
  .then((connect) => console.log("database connection established"))
  .catch((err) => console.log(error));

const Schema = mongoose.Schema;

// const messagesSchema = new Schema()

const messagesSchema = new Schema({
  name: "String",
  email: "String",
});

const userSchema = new Schema({
  name: "String",
  email: "String",
});

const Messge = mongoose.model("message", messagesSchema, "messages");

const User = mongoose.model("user", userSchema, "users");

const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "animeshisnawab");
    console.log(decoded);
    /* `req.user = await User.findById(decoded._id);` is finding a user in the database with the `_id`
    value decoded from the JWT token and assigning it to the `user` property of the `req` object.
    This allows the user's information to be accessed and used in subsequent middleware or routes. */
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.render("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  // res.render("login", { name: "pandey" });
  // console.log(req.cookies.token);
  // const token = req.cookies.token;
  // or
  // const { token } = req.cookies;
  // if (token) {
  //   res.render("logout");
  // } else {
  //   res.render("login");
  // }
  console.log("::", req.user);
  res.render("logout", { name: req.user.name });
});

// app.get("/success", (req, res) => {
//   res.render("success");
//   console.log(users);
// });

// app.post("/contact", async (req, res) => {
//   // console.log(req.body);
//   // users.push({ username: req.body.name, email: req.body.email });

//   // const messageData = { username: req.body.name, email: req.body.email };
//   // console.log(messageData);
//   // res.render("success");
//   // await Messge.create(messageData)

//   /* `const { name, email } = req.body;` is destructuring the `req.body` object and assigning the
//   values of its properties `name` and `email` to the variables `name` and `email` respectively. This
//   is a shorthand way of accessing the properties of an object in JavaScript. */
//   const { name, email } = req.body;
//   await Messge.create({ name: name, email: email });
//   res.redirect("/success");
// });

// app.get("/users", (req, res) => {
//   res.json(users);
// });

// app.get("/add", (req, res) => {
//   Messge.create({ name: "abc", email: "abc@gmail.com" })
//     .then(() => {
//       res.send("Nice");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// app.get("/add", async (req, res) => {
//   await Messge.create({ name: "abc2", email: "abc2@gmail.com" })
//     .then(() => {
//       res.send("Nice");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { name, email } = req.body;

  const user = await User.findOne({email});

  if (!user) {
   return console.log("register failed");
  }

  const userId = await User.create({
    name: name,
    email: email,
  });

  const token = jwt.sign({ _id: userId._id }, "animeshisnawab");
  console.log(token);
  // res.cookie("token", userId._id, {
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.post("/login", async (req, res) => {});

app.listen(5000, () => {
  console.log("Server is Running...");
});
