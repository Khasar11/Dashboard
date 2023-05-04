"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDir = exports.io = exports.server = exports.port = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const traffic_1 = require("./traffic/traffic");
const socket_1 = require("./traffic/socket");
exports.app = (0, express_1.default)();
exports.port = 8383;
exports.server = http_1.default.createServer(exports.app);
exports.io = new socket_io_1.Server(exports.server);
exports.fileDir = process.cwd();
exports.app.use(express_1.default.static('public'));
exports.app.use(express_1.default.json({ limit: '100mb' }));
(0, traffic_1.initApp)();
(0, socket_1.initSock)();
//# sourceMappingURL=server.js.map