/* Flujo completo de ejecución
  
   Cuando se escribe: node server.js

   el proceso completo es:

   node server.js
      │
      ▼
Cargar Express
      │
      ▼
Cargar Mongoose
      │
      ▼
Cargar Product
      │
      ▼
Crear app Express
      │
      ▼
Habilitar JSON
      │
      ▼
Definir PORT
      │
      ▼
Definir MONGO_URI
      │
      ▼
Registrar rutas
      │
      ▼
startServer()
      │
      ▼
Conectar MongoDB
      │
      ▼
¿Conexión correcta?
    /     \
   Sí      No
   │        │
   ▼        ▼
app.listen  Mostrar error
   │        │
   ▼        ▼
Puerto     process.exit(1)
4002
 
Una vez funcionando, se tiene actualmente tres endpoints:

| Método | Endpoint    | Propósito                               |
| ------ | ----------- | --------------------------------------- |
| `GET`  | `/`         | Verificar que el microservicio funciona |
| `POST` | `/products` | Crear un producto                       |
| `GET`  | `/products` | Consultar todos los productos           |

Por ejemplo, desde Postman se podrá probar:

GET http://localhost:4002/

después:

POST http://localhost:4002/products

con:

{
    "name": "Disco SSD",
    "price": 350000,
    "stock": 8
}

y finalmente:

GET http://localhost:4002/products

para comprobar que el producto quedó almacenado.

La siguiente evolución lógica de este microservicio sería implementar el CRUD completo, 
agregando GET /products/:id, PUT /products/:id y DELETE /products/:id, y después separar 
server.js en rutas, controladores, modelos y configuración de base de datos para que la 
arquitectura quede más profesional y mantenible. */

/* Este código corresponde a un microservicio de Productos construido con Node.js, Express, 
   Mongoose y MongoDB. Su función principal es permitir crear productos, consultar productos 
   y conectarse a una base de datos MongoDB antes de iniciar el servidor.

   La idea general del flujo es esta:

Cliente / Postman
       │
       ▼
   Express
       │
       ▼
Rutas /products
       │
       ▼
    Product
       │
       ▼
   Mongoose
       │
       ▼
    MongoDB  */

/* 1. Importación de librerías */


/* Importa Express, que es el framework encargado de crear el servidor web y gestionar las 
   peticiones HTTP.

   Gracias a Express se pueden manejar peticiones como:

    GET, POST, PUT y DELETE */
    
const express = require("express");

/* Importa Mongoose, que sirve como intermediario entre Node.js y MongoDB. */

/* Mongoose permite, por ejemplo: Product.find(); para consultar información, o: 
   product.save(); para guardar información. */

const mongoose = require("mongoose");

/* Importa el modelo Product que está definido en: models/Product.js */

/* Ese archivo normalmente contiene el esquema del producto, por ejemplo:
   
   const mongoose = require("mongoose");

   const productSchema = new mongoose.Schema({
     name: String,
     price: Number,
     stock: Number
   });

   module.exports = mongoose.model("Product", productSchema);

Por tanto, Product representa la colección de productos almacenados en MongoDB. */

const Product = require("./models/Product");

/* 2. Creación de la aplicación Express */
/* Aquí se crea una instancia de Express. La variable app representa el servidor web. */

/* Sobre ella posteriormente se configuran las rutas: 
   app.get(...)
   app.post(...)
   app.listen(...)

   Se puede imaginar app como el núcleo del microservicio. */

const app = express();

/* 3. Middleware para recibir JSON */
/* Esta línea permite que Express interprete datos enviados en formato JSON.

   Por ejemplo, desde Postman se podrá enviar:

   {
    "name": "Monitor Samsung",
    "price": 850000,
    "stock": 15
   }
  
   Cuando llegue esta petición:

   POST http://localhost:4002/products

   Express colocará esa información dentro de: req.body

   Por ejemplo:

   console.log(req.body);

   mostraría:

   {
    name: "Monitor Samsung",
    price: 850000,
    stock: 15
  }
  
  Sin:

  app.use(express.json());

  Express no podrá procesar automáticamente el JSON enviado por el cliente. */

  /* Permite recibir JSON */

app.use(express.json());

/* 4. Configuración del puerto */

/* Aquí se define el puerto donde funcionará el microservicio.

   Primero intenta utilizar una variable de entorno llamada: PORT

   Por ejemplo: PORT=4002 Si esa variable no existe, utiliza: 4002

   Por eso el operador: || puede entenderse como:

   Usa el valor de la izquierda si existe; de lo contrario, usa el valor de la derecha.

   Así: const PORT = process.env.PORT || 4002; 

   significa: Usa el puerto configurado externamente y, si no existe, utiliza 4002.

   Esto es muy útil en microservicios porque cada servicio puede utilizar un puerto diferente:

   users-service      → 4001
   products-service   → 4002
   orders-service     → 4003
   api-gateway        → 4000 */

const PORT = process.env.PORT || 4002;

  /* 5. Dirección de MongoDB */
  /* Aquí se define la dirección de la base de datos. Primero intenta obtener:
     process.env.MONGO_URI Si esa variable no está definida, utiliza:
     mongodb://127.0.0.1:27017/products-db

     Se puede dividir esa dirección así:

     mongodb://127.0.0.1:27017/products-db
   │           │       │
   │           │       └── Base de datos
   │           │
   │           └── Puerto MongoDB
   │
   └── Servidor MongoDB local

   127.0.0.1 significa:

   MongoDB se encuentra en el mismo computador donde estás ejecutando Node.js.

   27017 es el puerto estándar de MongoDB.

   products-db es el nombre de la base de datos. */

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/products-db";


/* ==========================================
   RUTAS
   ========================================== */

/* 6. Ruta principal de comprobación

/* Esta ruta utiliza el método HTTP: GET y responde cuando alguien accede a:
   http://localhost:4002/
   
   En: (req, res)

   se tiene dos objetos importantes.

   req significa request, es decir, la petición del cliente.

   res significa response, es decir, la respuesta que enviará el servidor.

   Aquí: res.status(200) indica que la operación fue correcta. HTTP 200 significa: OK

   Después: .json(...) envía una respuesta JSON:

   {
    "service": "products-service",
    "status": "running"
   }

   Esta ruta es útil para comprobar rápidamente si el microservicio está activo. */

app.get("/", (req, res) => {

    res.status(200).json({
        service: "products-service",
        status: "running"
    });

});

/* 7. Crear un producto con POST

   La siguiente ruta es:

   app.post("/products", async (req, res) => {
   
   Esto significa que Express atenderá una solicitud:

   POST /products

   Por ejemplo: 

   POST http://localhost:4002/products

   La palabra: async indica que dentro de esta función se realizará 
   operaciones asíncronas, principalmente operaciones contra MongoDB. */

      

app.post("/products", async (req, res) => {

    /* Se tiene:
   
       try {
   
       El bloque try significa:

      Intenta ejecutar estas instrucciones. */
  
      try {

        /* Después aparece:

           const product = new Product(req.body);

           Supongamos que Postman envía:

           {
             "name": "Mouse Logitech",
             "price": 120000,
             "stock": 20
           }
   
          Entonces: req.body contendrá esos datos.

          Con:

          new Product(req.body)

          se crea un nuevo objeto utilizando el modelo Product.

          Conceptualmente:

            JSON recibido
                 │
                 ▼
             req.body
                 │
                 ▼
         new Product(...)
                 │
                 ▼
         Objeto Product

        Pero en este punto todavía no está guardado en MongoDB. */
        
        const product = new Product(req.body);

        /* 8. Guardar el producto
           Esta línea almacena el producto en MongoDB.

           La palabra: await significa: Espera hasta que MongoDB termine de guardar el producto 
           antes de continuar.

           Por tanto:

           Crear objeto Product
                    │
                    ▼
              product.save()
                    │
                    ▼
             Esperar a MongoDB
                    │
                    ▼
            Producto almacenado

            Después de guardarlo, MongoDB genera automáticamente un identificador _id.

            Por ejemplo:

            {
               "_id": "68c123456789abcdef",
               "name": "Mouse Logitech",
               "price": 120000,
               "stock": 20
            } */

        await product.save();

        /* 9. Respuesta al crear el producto
           
           Aquí el servidor devuelve HTTP: 201 El código 201 significa que un recurso fue 
           creado correctamente.

           La respuesta podría ser:

           {
             "message": "Producto agregado correctamente",
             "product": {
                  "_id": "68c123456789abcdef",
                  "name": "Mouse Logitech",
                  "price": 120000,
                  "stock": 20
              }
           }
          
           También se podrá escribir simplemente: product en lugar de: product: product

           Así:

           res.status(201).json({
                message: "Producto agregado correctamente",
                product
          });

          Ambas formas son equivalentes. */

        res.status(201).json({
            message: "Producto agregado correctamente",
            product: product
        });

        /* 10. Manejo de errores al crear

           Si algo falla: 
           
           } catch (error) {
           
           JavaScript entra en el bloque catch.

           Por ejemplo, podría ocurrir un problema porque falta un campo obligatorio definido 
           en el modelo.

           Entonces:

           console.error("Error creando producto:", error);

           muestra el error en la consola.

           Y:

           res.status(500).json({
              message: "Error al crear el producto",
              error: error.message
           });

           envía al cliente:

           HTTP 500

           que significa: Internal Server Error

           La respuesta es: 

           {
             "message": "Error al crear el producto",
             "error": "Product validation failed"
          } */

    } catch (error) {

        console.error("Error creando producto:", error);

        res.status(500).json({
            message: "Error al crear el producto",
            error: error.message
        });

    }

});

/* 11. Obtener todos los productos

   La siguiente ruta es:

   app.get("/products", async (req, res) => {
   
   Esta ruta responde a:

   GET http://localhost:4002/products

   El objetivo es obtener todos los productos almacenados.

   La instrucción importante es:

   const products = await Product.find();

   Product.find() realiza una consulta en MongoDB.

   Sin filtros:

   Product.find() significa: Devuelve todos los documentos de la colección de productos.

   Supongamos que se tienen tres productos:

   [
     {
        "name": "Mouse",
        "price": 120000
     },
     {
        "name": "Teclado",
        "price": 180000
     },
     {
        "name": "Monitor",
        "price": 850000
     }
   ]
  
   Entonces:

   products contendrá ese arreglo. */


app.get("/products", async (req, res) => {

    try {

        const products = await Product.find();

        /*12. Enviar los productos
          
          El código: 200 indica que la consulta fue correcta. Y la respuesta será una colección JSON:

          [
            {
              "_id": "...",
              "name": "Mouse",
              "price": 120000
            },
            {
               "_id": "...",
               "name": "Monitor",
               "price": 850000
           }
          ] */

        res.status(200).json(products);

      /* Si ocurre un problema durante la consulta:
         
         catch (error) lo captura y envía: res.status(500).json(...) */

    } catch (error) {

        console.error("Error consultando productos:", error);

        res.status(500).json({
            message: "Error al consultar los productos",
            error: error.message
        });

    }

});


/* ==========================================
   INICIAR SERVIDOR
   ==========================================

13. Función para iniciar el microservicio

    Ahora se tiene:

    async function startServer() { 

    Esta función tiene una responsabilidad muy importante: Conectar primero MongoDB y después 
    iniciar Express.

    La función es async porque: mongoose.connect() es una operación asíncrona. 
    Por tanto, se debe esperar a que MongoDB esté listo antes de iniciar el servidor. */

async function startServer() {

    try {

        /* 14. Mensaje inicial. Solo muestra información en la consola:
           Conectando a MongoDB... Es útil para saber qué está haciendo el programa. */

        console.log("Conectando a MongoDB...");

        /* 15. Conexión con MongoDB. La instrucción fundamental es:
           await mongoose.connect(MONGO_URI); Mongoose intenta conectarse a:
           mongodb://127.0.0.1:27017/products-db 

           await hace que el programa espere hasta conocer el resultado de la conexión.

           Esto es importante porque no se quiere iniciar el servidor Express si la base de datos 
           no funciona. */

        await mongoose.connect(MONGO_URI);

        /*16. Conexión correcta. Si todo salió bien:
          
          console.log("MongoDB conectado correctamente");
          console.log("Base de datos: products-db");

          Se verá: 

          MongoDB conectado correctamente
          Base de datos: products-db */

        console.log("MongoDB conectado correctamente");
        console.log("Base de datos: products-db");

        /* Después se ejecutará: app.listen(PORT, () => { . Esta instrucción inicia el 
           servidor Express. */
        
        /* 17. app.listen() app.listen() le dice a Express: Empieza a escuchar solicitudes 
           HTTP en este puerto.
        
          Como: PORT = 4002 el servicio queda disponible en: http://localhost:4002 */

        /* La expresión: ${PORT} inserta el contenido de la variable dentro del texto.

           Por eso: `Servicio de Productos en http://localhost:${PORT}`

           se convierte en: Servicio de Productos en http://localhost:4002 */

        app.listen(PORT, () => {

            console.log(
                `Servicio de Productos en http://localhost:${PORT}`
            );

        });

        /* 18. ¿Qué pasa si MongoDB no conecta?

           Si: await mongoose.connect(MONGO_URI); produce un error, el programa pasa a:
           catch (error) { 
           Entonces: 
           console.error("Error conectando a MongoDB:");
           console.error(error.message);
           muestra el problema.

          Por ejemplo:

          Error conectando a MongoDB:
          connect ECONNREFUSED 127.0.0.1:27017

          Después:

          process.exit(1);

          termina la aplicación.

          El: 1 indica que Node.js terminó debido a un error.

          Esto es apropiado porque si el microservicio depende de MongoDB, no tiene mucho 
          sentido mantenerlo activo sin acceso a su base de datos. */

    } catch (error) {

        console.error("Error conectando a MongoDB:");
        console.error(error.message);

        process.exit(1);

    }

}

/* 19. Finalmente se ejecuta la función. Esta línea inicia todo el proceso. Es importante distinguir:
       async function startServer() { que define la función, de: startServer(); que ejecuta 
       la función. */

startServer();