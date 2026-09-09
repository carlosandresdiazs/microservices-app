const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4001;
const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/usersdb';

async function startServer() {
    try {

        await mongoose.connect(MONGO_URI);

        console.log('MongoDB conectado correctamente');

        app.listen(PORT, () => {
            console.log(
                `Servicio de Usuarios en http://localhost:${PORT}`
            );
        });

    } catch (error) {

        console.error('Error conectando a MongoDB:');
        console.error(error);

        process.exit(1);
    }
}

startServer();