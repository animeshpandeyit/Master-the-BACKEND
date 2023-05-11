import express from "express";
import path from "path";
import mongoose from "mongoose";
import { connect } from "net";
import { error } from "console";
const app = express();

mongoose
  .connect(
    "mongodb+srv://animeshpandeyit:Animesh123@cluster0.nvlem2q.mongodb.net/",
    { dbName: "backend" }
  )
  .then((connect) => console.log("database connection established"))
  .catch((err) => console.log(error));

const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { name: "pandey" });
});

app.get("/success", (req, res) => {
  res.render("success");
  console.log(users);
});

app.post("/contact", (req, res) => {
  // console.log(req.body);
  users.push({ username: req.body.name, email: req.body.email });
  // res.render("success");
  res.redirect("/success");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/add", (req, res) => {
  res.send("Nice");
});

app.listen(5000, () => {
  console.log("Server is Running...");
});
