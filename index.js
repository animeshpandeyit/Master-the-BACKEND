import express from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import { error } from "console";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
  password: "String",
});

const Messge = mongoose.model("message", messagesSchema, "messages");

const User = mongoose.model("user", userSchema, "users");

const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// isAuthenticated
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "animeshisnawab");
    console.log(decoded);
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  console.log("::", req.user);
  res.render("logout", { name: req.user.name });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const userId = await User.create({
    name: name,
    email: email,
    password: hashpassword,
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

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }
  // const ismatch = user.password === password;
  const ismatch = await bcrypt.compare(password, user.password);

  if (!ismatch) {
    return res.render("login", { email, mismatch: "password mismatch" });
  }
  const token = jwt.sign({ _id: user._id }, "animeshisnawab");
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

app.listen(5000, () => {
  console.log("Server is Running...");
});
