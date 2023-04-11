"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSock = void 0;
const server_1 = require("../server");
const initSock = () => {
    var allClients = [];
    server_1.io.sockets.on('connection', (socket) => {
        allClients.push(socket);
        console.log('socket connect');
        socket.on('disconnect', function () {
            console.log('socket disconnect');
            var i = allClients.indexOf(socket);
            allClients.splice(i, 1);
        });
        socket.on('subscribe-display', (arg, callback) => {
            console.log(arg);
            callback('big');
        });
    });
};
exports.initSock = initSock;
//# sourceMappingURL=socket.js.map