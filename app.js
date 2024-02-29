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

class App {
    constructor() {
        this.app = express();
        this.setup();
    }

    setup() {
        this.app.use(express.json());

        // cors
        this.app.use(cors({ origin: "*" }));

        // public routes without authentication
        this.app.use("/api", indexRouter.publicRouter);
        // private routes with authentication
        this.app.use(
            "/",
            middleware.authenticate,
            indexRouter.privateRouter
        );
    }

    startServer() {
        return this.app;
    }
}

// If running locally, start the server
if (process.env.NODE_ENV !== 'production') {
    const app = new App();
    const server = app.startServer();
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

// Export the App class for Vercel deployment
module.exports = App;
