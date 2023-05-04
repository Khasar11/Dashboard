import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { initApp } from "./traffic/traffic";
import { initSock } from "./traffic/socket";

export const app = express();
export const port = 8383;
export const server = http.createServer(app);
export const io = new Server(server);
export const fileDir = process.cwd();

app.use(express.static('public'));
app.use(express.json({limit: '100mb'}));

initApp()
initSock()
