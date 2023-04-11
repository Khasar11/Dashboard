"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 8383;
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const socket_io_1 = require("socket.io");
const sidebar_1 = require("./components/Sidebar/sidebar");
const MongoDB_1 = require("./components/MongoDB/MongoDB");
const Display_1 = require("./components/Display/Display");
const io = new socket_io_1.Server(server);
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/index.html'));
});
var allClients = [];
io.sockets.on('connection', (socket) => {
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
server.listen(port, () => {
    console.log('listening on ' + port);
});
//displayTest()
app.get('/sidebar', (req, res) => {
    const sidebarPromise = Promise.resolve((0, sidebar_1.getSidebar)());
    sidebarPromise.then((value) => {
        res.status(200).json(value);
    });
});
app.get('/display/:dynamic', async (req, res) => {
    const { dynamic } = req.params;
    res.status(200).json(await (0, Display_1.getDisplay)(dynamic)); // {dynamic} = id to get display data from
});
app.get('/displayData/:dynamic', async (req, res) => {
    const { dynamic } = req.params;
    res.status(200).json(await (0, Display_1.getDisplayData)(dynamic)); // {dynamic} = id to get display data from
});
app.get('/writeDisplayData/:dynamic', (req, res) => {
    const { dynamic } = req.params;
    res.status(200).json((0, Display_1.setDisplayData)(JSON.parse(dynamic)));
    // {dynamic} = data object to set $.$ to
    // containing id, endpoint, nodeAddress fields
});
app.get('/logs/:dynamic', async (req, res) => {
    const { dynamic } = req.params;
    let split = dynamic.split('-');
    let done = false;
    MongoDB_1.client.connect();
    await MongoDB_1.coll.find({ id: split[0] }).forEach((element) => element.logs.forEach(log => {
        if (log != null && split[0] + '-' + split[1] + '-' + split[2] == log.id) {
            if (Array.isArray(log.logs))
                log.logs.forEach((subLog) => {
                    if (subLog != null && split[0] + '-' + split[1] + '-' + split[2] + '-' + split[3] == subLog.id) {
                        if (!done)
                            res.status(200).json(subLog);
                        done = true;
                    }
                });
            if (!done)
                res.status(200).json(log.logs);
        }
    }));
});
app.get('/idfy/:dynamic', (req, res) => {
    let dynamic = req.params;
    let rep = String(dynamic).replaceAll('-', '_');
    res.status(200).json({ 'id': rep });
});
app.post('/logupsert', async (req, res) => {
    let parsed = JSON.parse(JSON.stringify(req.body));
    let appendTo = String(parsed.id).substring(0, String(parsed.id).lastIndexOf("-"));
    let split = parsed.id.split('-');
    MongoDB_1.client.connect();
    let written = false;
    await MongoDB_1.coll.find({ id: split[0] }).forEach((element) => element.logs.forEach(log => {
        if (log != null && split[0] + '-' + split[1] + '-' + split[2] == log.id) {
            if (!Array.isArray(log.logs)) {
                let query = { id: parsed.id.split('-')[0], 'logs.id': appendTo };
                let update = { $set: { 'logs.$.logs': parsed } };
                let options = { upsert: true };
                MongoDB_1.coll.updateOne(query, update, options);
                written = true;
            }
            else {
                log.logs.forEach((subLog) => {
                    if (subLog != null && split[0] + '-' + split[1] + '-' + split[2] + '-' + split[3] == subLog.id) {
                        MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $pull: { 'logs.$[log].logs': subLog } }, { arrayFilters: [{ 'log.id': split[0] + '-' + split[1] + '-' + split[2] }], new: true });
                        MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $push: { 'logs.$[log].logs': parsed } }, { arrayFilters: [{ 'log.id': split[0] + '-' + split[1] + '-' + split[2] }], new: true });
                        written = true;
                    }
                });
            }
        }
    }));
    const query = { id: parsed.id.split('-')[0], 'logs.id': appendTo };
    const update = { $push: { 'logs.$.logs': parsed } };
    const options = { upsert: true };
    if (!written) {
        MongoDB_1.coll.updateOne(query, update, options);
    }
});
app.post('/logcolupsert', (req, res) => {
    let parsed = JSON.parse(JSON.stringify(req.body));
    MongoDB_1.client.connect();
    const query = { id: parsed.id.split('-')[0] };
    const update = { $push: { logs: parsed } };
    const options = { upsert: true };
    MongoDB_1.coll.updateOne(query, update, options);
});
app.post('/machineupsert/', (req, res) => {
    let parsed = JSON.parse(JSON.stringify(req.body));
    MongoDB_1.client.connect();
    const query = { id: parsed.id };
    const update = { $set: parsed };
    const options = { upsert: true };
    MongoDB_1.coll.updateOne(query, update, options);
});
app.post('/removeentry/', (req, res) => {
    let parsed = JSON.parse(JSON.stringify(req.body));
    MongoDB_1.client.connect();
    const split = parsed.id.split('-'); // 1 len = top level, 2 len = loginputcollection level, 3 len = loginput level
    let query;
    switch (split.length) {
        case 1: { // machine deleted
            query = { id: split[0] };
            MongoDB_1.coll.deleteOne(query);
            return;
        }
        case 3: { // log collection removed folder type
            MongoDB_1.coll.find({ id: split[0] }).forEach((element) => element.logs.forEach(log => {
                if (log != null && log.logs != null) {
                    if (Array.isArray(log.logs)) {
                        if (log.id == parsed.id) {
                            MongoDB_1.coll.updateOne({ id: split[0], 'logs.id': split[0] + '-' + split[1] + '-' + split[2] }, { $unset: { 'logs.$': log.logs } }, false, true);
                            return;
                        }
                    }
                }
            }));
            return;
        }
        case 4: { // log collection/singular log input deleted
            MongoDB_1.coll.find({ id: split[0] }).forEach((element) => element.logs.forEach(log => {
                if (log != null && log.logs != null) {
                    if (!Array.isArray(log.logs)) {
                        if (log.logs.id == parsed.id) {
                            MongoDB_1.coll.updateOne({ id: split[0], 'logs.id': split[0] + '-' + split[1] + '-' + split[2] }, { $unset: { 'logs.$': log.logs } }, false, true);
                            return;
                        }
                        return;
                    }
                    let toRemove = log.logs.filter((x) => x != null && x.id == parsed.id);
                    MongoDB_1.coll.findOneAndUpdate({ id: split[0], 'logs.id': split[0] + '-' + split[1] + '-' + split[2] }, { $unset: { 'logs.$[log].logs.$[sublog]': toRemove } }, { arrayFilters: [{ 'sublog.id': parsed.id }, { 'log.id': split[0] + '-' + split[1] + '-' + split[2] }], new: true });
                    return;
                }
                return;
            }));
        }
    }
});
//# sourceMappingURL=server.js.map