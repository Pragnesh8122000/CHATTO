const express = require('express');
const http = require('http');
const socketService = require('./socketServices');

const indexRouter = require("./routes/index");
const middleware = require("./middleware/index");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.Server(app);

app.set('socketService', socketService.SocketService.Initialize(server));

app.use(express.json());

// cors
app.use(cors({ origin: "*" }));

// public routes without authentication
app.use("/api", indexRouter.publicRouter);
// private routes with authentication
app.use(
    "/",
    middleware.authenticate,
    indexRouter.privateRouter
);

server.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port:', process.env.PORT || 3000);
});