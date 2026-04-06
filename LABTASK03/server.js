const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/sale", (req, res) => {
    res.render("sale");
});

app.get("/newin", (req, res) => {
    res.render("Newin");
});

app.get("/men", (req, res) => {
    res.render("men");
});

app.get("/women", (req, res) => {
    res.render("women");
});

app.get("/kids", (req, res) => {
    res.render("kids");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});