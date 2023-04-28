"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const path_1 = __importDefault(require("path"));
const server_1 = require("../server");
const initApp = () => {
    server_1.app.get('/', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '/index.html'));
    });
    server_1.server.listen(server_1.port, () => {
        console.log('listening on ' + server_1.port);
    });
};
exports.initApp = initApp;
//# sourceMappingURL=traffic.js.map