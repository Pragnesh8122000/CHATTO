const express = require('express');
const http = require('http');
const socketService = require('./socketServices');

const indexRouter = require("./routes/index");
const middleware = require("./middleware/index");

const userBridge = require('./user-bridge');
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.Server(app);

const socketServiceInstance = socketService.SocketService.Initialize(server);
userBridge.setUsers(socketServiceInstance.users);

app.set('socketService', socketServiceInstance);

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