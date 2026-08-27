const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const app = express();
app.use(express.json());

// Conectar a MongoDB
mongoose.connect("mongodb://localhost/users-db", { useNewUrlParser: true, useUnifiedTopology: true });

app.post("/register", async (req, res) => {
 const user = new User(req.body);
 await user.save();
 res.send({ message: "Usuario registrado", user });
});

app.get("/users", async (req, res) => {
 const users = await User.find();
 res.send(users);
});

app.listen(4001, () => console.log("Servicio de Usuarios en http://localhost:4001"));