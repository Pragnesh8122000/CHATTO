// class App {
//     constructor() {
//         this.express = require("express");
//         this.app = this.express();
//         this.indexRouter = require("./routes/index");
//         this.middleware = require("./middleware/index")
//         this.socketServer = require("./socket")
//         this.cors = require("cors");
//         require("dotenv").config();

//         this.app.use(this.express.json());

//         // cors
//         this.app.use(this.cors({ origin: "*" }));

//         // public routes without authentication
//         this.app.use("/api", this.indexRouter.publicRouter);
//         // private routes with authentication
//         this.app.use(
//             "/",
//             this.middleware.authenticate,
//             this.indexRouter.privateRouter
//         );

//         this.app.listen(process.env.PORT, () => {
//             console.log(`server is listening on port ${process.env.PORT}`);
//         });
//     }
// }

// module.exports = new App(); 

const express = require("express");
const indexRouter = require("./routes/index");
const middleware = require("./middleware/index");
const socketServer = require("./socket");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
app.use("/api", indexRouter.publicRouter);
app.use("/", middleware.authenticate, indexRouter.privateRouter);

// Start server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});

module.exports = server;
