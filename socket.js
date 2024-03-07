let instance;

class SocketService {
    static Initialize(server) {

        instance = require('socket.io')(server);

        instance.on('connection', (socket) => {
            console.log('A user connected');
            });

            return instance;
        }

    }

module.exports = SocketService;