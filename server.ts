import express from 'express';
export const app = express();
export const port = 8383;
import http from 'http';
export const server = http.createServer(app);
import { Server } from "socket.io";
import { initApp } from "./traffic/traffic";
import { initSock } from "./traffic/socket";
export const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

initApp()
initSock()

//displayTest()
