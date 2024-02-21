class App {
    constructor() {
        this.express = require("express");
        this.app = this.express();
        this.indexRouter = require("./routes/index");
        this.middleware = require("./middleware/index")
        this.socketServer = require("./socket")
        this.cors = require("cors");
        require("dotenv").config();

        this.app.use(this.express.json());

        // cors
        this.app.use(this.cors({ origin : "*" }));

        // public routes without authentication
        this.app.use("/api", this.indexRouter.publicRouter);
        // private routes with authentication
        this.app.use(
          "/",
          this.middleware.authenticate,
          this.indexRouter.privateRouter
        );

        this.app.listen(process.env.PORT, () => {
            console.log(`server is listening on port ${process.env.PORT}`);
        });
    }
}

module.exports = new App();