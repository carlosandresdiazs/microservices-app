/* El flujo completo de su programa es:

    node server.js
        ↓
    Importar Express
        ↓
    Importar Mongoose
        ↓
    Crear aplicación Express
        ↓
    Habilitar JSON
        ↓
    Definir PORT
        ↓
    Definir MONGO_URI
        ↓
    Definir función startServer()
        ↓
    Ejecutar startServer()
        ↓
    Intentar conexión MongoDB
        ↓
┌───────────────────┐
│ ¿Conexión exitosa?│
└───────────────────┘
       ↓        ↓
      Sí        No
       ↓        ↓
 MongoDB OK    Mostrar error
       ↓        ↓
 app.listen   process.exit(1)
       ↓
Servidor HTTP
       ↓
localhost:4001 */

/* Una forma muy útil de entender el papel de cada tecnología en este ejemplo es:

Node.js
   │
   ├── Express
   │      ↓
   │   API REST
   │      ↓
   │ GET POST PUT DELETE
   │
   └── Mongoose
          ↓
       MongoDB
          ↓
       usersdb */

/* Más adelante, cuando se agregue las rutas del microservicio, se tendrá algo como:

Postman
   ↓
HTTP
   ↓
Express
   ↓
Route
   ↓
Controller
   ↓
Mongoose
   ↓
MongoDB

Por ejemplo:

POST http://localhost:4001/users

podría recorrer:

Postman
   ↓
server.js
   ↓
users.routes.js
   ↓
users.controller.js
   ↓
User.js
   ↓
Mongoose
   ↓
MongoDB
   ↓
usersdb

Ese será precisamente el siguiente paso natural para convertir este server.js básico 
en un microservicio de usuarios completo con CRUD. */



/* Crea la base de un microservicio de usuarios con Node.js, Express y MongoDB usando Mongoose. 
   
   Su objetivo principal es:

   Crear el servidor web.
   Prepararlo para recibir datos JSON.
   Conectarse a MongoDB.
   Iniciar el servidor solo si la conexión con MongoDB fue exitosa.
   Detener la aplicación si no puede conectarse a la base de datos. */

/* Aquí se importan dos librerías.

   express es un framework para Node.js que permite crear servidores web y APIs REST. */

   const express = require('express');

/* mongoose es una biblioteca que permite trabajar con MongoDB desde Node.js.
   Mongoose facilita tareas como crear modelos, realizar consultas, guardar usuarios, actualizar 
   documentos y eliminar registros. */

   const mongoose = require('mongoose');

   const User = require("./models/User");


/* Aquí se está creando una instancia de Express. Se puede imaginar app como el objeto que 
   representa su servidor web. */

   const app = express();

/* Esta línea es muy importante para una API REST. 
   Le indica a Express: 
   Cuando llegue información en formato JSON, interprétala y conviértela en un objeto JavaScript. */

app.use(express.json());

/* Aquí se está definiendo el puerto donde funcionará el microservicio. 
   
   La expresión: process.env.PORT busca una variable de entorno llamada: PORT.
   
   El operador || significa, en este contexto: 
   
   Si process.env.PORT no existe, utiliza 4001.
   
   const PORT = process.env.PORT || 4001; --> Utiliza el puerto definido en las variables de entorno;
   si no existe, utiliza el puerto 4001. 
   
   Esto es especialmente útil en microservicios. */

const PORT = process.env.PORT || 4001;

/* El siguiente bloque hace algo parecido:
  
   const MONGO_URI =
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/usersdb';

   Aquí define la dirección de MongoDB.
   
   Primero intenta utilizar: 
   
   process.env.MONGO_URI que podría venir de un archivo .env:

   MONGO_URI=mongodb://127.0.0.1:27017/usersdb . 
   
   Si esa variable no existe, se utiliza: mongodb://127.0.0.1:27017/usersdb . 
   
   Se puede dividir esa URL: mongodb://127.0.0.1:27017/usersdb
   
   mongodb:// --> Indica que se utilizará MongoDB. 
   
   127.0.0.1  --> significa que MongoDB está ejecutándose en el mismo computador. 
   
   27017 es el puerto predeterminado de MongoDB. 
   
   Finalmente: usersdb --> es el nombre de la base de datos. 
   
   Por lo tanto: mongodb://127.0.0.1:27017/usersdb --> significa: Conéctese al servidor MongoDB que 
   está funcionando en mi computador, en el puerto 27017, y utiliza la base de datos usersdb. */
 

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/usersdb';

/* Aquí se define una función llamada: startServer. 

   La palabra: async indica que la función realizará operaciones asíncronas. 
   
   Conectarse a MongoDB no ocurre instantáneamente. Puede tardar algunos milisegundos o segundos. */
   
   async function startServer() {

       /* Por eso se utiliza programación asíncrona. Se encuentra: 
          
          El bloque try significa: Intenta ejecutar estas instrucciones. */

    try {

        /* Esta línea intenta establecer la conexión con MongoDB. 
        
           mongoose.connect() --> utiliza la dirección que se definió anteriormente: MONGO_URI.

           Por ejemplo: mongodb://127.0.0.1:27017/usersdb
           
           La palabra: await significa: Espera hasta que Mongoose termine de intentar conectarse 
           a MongoDB antes de continuar. 
           
           Entonces Node.js no se ejecutará inmediatamente: 
           
           console.log('MongoDB conectado correctamente'); sino que esperará primero el resultado 
           de: mongoose.connect(MONGO_URI). 
           
           Conceptualmente: 
           
           Intentar conexión MongoDB
                     ↓
            Esperar resultado
                     ↓
                  ¿Conectó?
                     ↓
                     Sí
                     ↓
                  Continuar
           
           
           
           Si la conexión fue exitosa: 
           
           console.log('MongoDB conectado correctamente');
        
           aparecerá en la terminal: MongoDB conectado correctamente. */
        

        await mongoose.connect(MONGO_URI);

        console.log('MongoDB conectado correctamente');

   
   /* Registrar un nuevo usuario */

   app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                name,
                email,
                password
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Error registrando usuario",
            error: error.message
        });

    }
});

/* ==========================================
   RUTAS
   ========================================== */

/* Comprobar funcionamiento */

app.get("/", (req, res) => {

    res.status(200).json({
        service: "users-service",
        status: "running"
    });

});

/* Obtener todos los usuarios */

app.get("/users", async (req, res) => {

    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            count: users.length,
            users: users
        });

    } catch (error) {

        console.error("Error obteniendo usuarios:", error);

        res.status(500).json({
            message: "Error al obtener los usuarios",
            error: error.message
        });

    }

});



        /* Después se tiene: app.listen(PORT, () => { --> Esta instrucción inicia el servidor Express.
           Por ejemplo, si: PORT = 4001. Express comenzará a escuchar peticiones en: 
           http://localhost:4001
         
           El callback: () => { --> es una función flecha que se ejecutará cuando el servidor haya 
           comenzado correctamente. 
           
           Se tiene:
           
           console.log(`Servicio de Usuarios en http://localhost:${PORT}`
           );
          
           Si: PORT = 4001 la consola mostrará: 
           
           Servicio de Usuarios en http://localhost:4001
        
           Aquí se utilizan backticks: ` ` porque se está usando un template literal de JavaScript.

           Esto permite insertar variables mediante: ${PORT} 
           
           Es equivalente aproximadamente a:
           
           console.log(
              'Servicio de Usuarios en http://localhost:' + PORT
           );
          
           pero es más limpio.
        
           Ahora se observa un detalle muy importante de la arquitectura:

           await mongoose.connect(MONGO_URI);

           console.log('MongoDB conectado correctamente');

           app.listen(PORT, () => {
            console.log(
                `Servicio de Usuarios en http://localhost:${PORT}`
            );
           }); */

        app.listen(PORT, () => {
            console.log(
                `Servicio de Usuarios en http://localhost:${PORT}`
            );
        });

        /* El servidor HTTP se inicia después de conectarse a MongoDB. Eso es una buena práctica.

         Con la estructura actual ocurre:
         Conectar MongoDB
                ↓
            ¿Funcionó?
              ↙      ↘
            Sí        No
            ↓          ↓
          Iniciar    Detener
         Express    aplicación

        Esto es mucho más seguro para un microservicio.

        Ahora se vé qué ocurre si MongoDB falla:
        
        } catch (error) {
        
        El catch captura cualquier error producido dentro del try.
        
        Por ejemplo, si MongoDB no está iniciado:
        
        await mongoose.connect(MONGO_URI);
        
        puede generar un error.
        
        En lugar de que la aplicación falle sin control, entrará aquí:
        
        catch (error) {
        
        Después: console.error('Error conectando a MongoDB:'); mostrará:
        
        Error conectando a MongoDB: y: 
        
        console.error(error); --> mostrará los detalles técnicos del error. 
        
        Podrá obtener algo parecido a:
        
        MongooseServerSelectionError:
        connect ECONNREFUSED 127.0.0.1:27017
        
        Eso ayudará a diagnosticar el problema. */

    } catch (error) {

        console.error('Error conectando a MongoDB:');
        console.error(error);

        /* Finalmente aparece: process.exit(1); --> Esto termina el proceso de Node.js.
           El: 1 significa que el programa terminó debido a un error. 
           
           Por convención: process.exit(0) significa: Terminación correcta
           mientras: process.exit(1) significa: Terminación debido a un error. */

        process.exit(1);

        /*En este caso tiene sentido detener el microservicio porque si el servicio de usuarios 
          necesita MongoDB y MongoDB no está disponible, no es conveniente mantener el servidor 
          funcionando como si todo estuviera correctamente. */
    }
}

/* Por último: Aquí se ejecuta la función que se acaba de definir. 
   Hay una diferencia importante entre:
   async function startServer() {
       ...
   }
   y:
   startServer();
   
   La primera: async function startServer() { --> define la función. 
   La segunda: startServer(); --> ejecuta la función. */
 
startServer();