const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost/orders-db", { useNewUrlParser: true, useUnifiedTopology: true });

app.post("/orders", async (req, res) => {
 const order = new Order(req.body);
 await order.save();
 res.send({ message: "Pedido realizado", order });
});

app.get("/orders", async (req, res) => {
 const orders = await Order.find();
 res.send(orders);
});

app.listen(4003, () => console.log("📦 Servicio de Pedidos en http://localhost:4003"));