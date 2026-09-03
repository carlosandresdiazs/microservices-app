const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost/products-db", { useNewUrlParser: true, useUnifiedTopology: true });

app.post("/products", async (req, res) => {
 const product = new Product(req.body);
 await product.save();
 res.send({ message: "Producto agregado", product });
});

app.get("/products", async (req, res) => {
 const products = await Product.find();
 res.send(products);
});

app.listen(4002, () => console.log("Servicio de Productos en http://localhost:4002"));