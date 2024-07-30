const express = require('express');
const http = require('http');
const socketService = require('./socketServices');
const request = require("request");

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

function startAntiSleep(n){
    const url = "https://chatto-be.onrender.com/api/conn";
    request(url+'', (err,response,body) => {
         console.log("Anti Sleep: ", n);
        setTimeout(() => startAntiSleep(n+1), 1000*5*60);
    })
}

server.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port:', process.env.PORT || 3000);
    startAntiSleep(1);
});
