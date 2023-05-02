"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSock = void 0;
const server_1 = require("../server");
const Display_1 = require("../components/Display/Display");
const node_opcua_1 = require("node-opcua");
const sidebar_1 = require("../components/Sidebar/sidebar");
const MongoDB_1 = require("../components/MongoDB/MongoDB");
const LogInput_1 = require("../components/Logs/LogInput");
const Machine_1 = require("../components/Machine");
const SidebarUpdate_1 = require("../components/Sidebar/SidebarUpdate");
const SidebarUpdateObject_1 = require("../components/Sidebar/SidebarUpdateObject");
const fixId = (old) => {
    return String(old).replaceAll('-', '_').replaceAll(' ', '_');
};
const initSock = () => {
    var allClients = [];
    const sendSidebarUpdateByID = async (update) => {
        const split = update.id.split('-');
        const from = String(update.id).substring(0, String(update.id).lastIndexOf("-"));
        let machine = new Machine_1.Machine('undefined', 'undefined', 'undefined', new Date(), [], undefined);
        await MongoDB_1.coll.find({ id: split[0] }).forEach((loopMachine) => machine = loopMachine);
        switch (split.length) {
            case 1: { // machine
                console.log('1');
                server_1.io.emit('sidebar-update', new SidebarUpdateObject_1.SidebarUpdateObject((0, Machine_1.toSidebarData)(machine), update.remove));
                break;
            }
            case 2: { // logs or display or oee
                // unused for now
                console.log('2');
                break;
            }
            case 3: { // log input
                console.log('3');
                machine.logs.forEach((log) => {
                    if (log.id == update.id)
                        server_1.io.emit('sidebar-update', new SidebarUpdateObject_1.SidebarUpdateObject(new LogInput_1.LogInput(log.id, log.data, new Date(log.date), log.header, log.writtenBy, log.logs).toSidebarData(), update.remove));
                });
                break;
            }
            case 4: { // sub log 
                console.log('4');
                machine.logs.forEach((log) => {
                    if (log.id == from)
                        log.logs.forEach((subLog) => {
                            if (subLog.id == update.id) {
                                server_1.io.emit('sidebar-update', new SidebarUpdateObject_1.SidebarUpdateObject(new LogInput_1.LogInput(subLog.id, subLog.data, new Date(subLog.date), subLog.header, subLog.writtenBy, subLog.logs).toSidebarData(), update.remove));
                            }
                        });
                });
                break;
            }
        }
    };
    server_1.io.sockets.on("connection", (socket) => {
        allClients.push(socket);
        console.log("socket connect:", socket.id);
        let OPCClient = undefined;
        let subscription = undefined;
        let session = undefined;
        socket.on('write-display-data', submission => {
            (0, Display_1.setDisplayData)(submission);
        });
        socket.on('request-sidebar', (x, callback) => {
            const sidebarPromise = Promise.resolve((0, sidebar_1.getSidebar)());
            sidebarPromise.then((value) => {
                callback(value);
            });
        });
        socket.on('get-sidebar-element', (id, callback) => {
            const split = id.split('-');
            switch (split.length) {
                case 1: { // machine
                    MongoDB_1.coll.find({ id: id }).forEach((machine) => callback((0, Machine_1.toSidebarData)(machine)));
                    break;
                }
                case 3: { // log input
                    MongoDB_1.coll.find({ id: split[0] }).forEach((machine) => machine.logs.forEach((log) => {
                        if (log.id == id)
                            callback(new LogInput_1.LogInput(log.id, log.data, new Date(log.date), log.header, log.writtenBy, log.logs).toSidebarData());
                    }));
                    break;
                }
                case 4: { // sub log
                    MongoDB_1.coll.find({ id: split[0] }).forEach((machine) => machine.logs.forEach((log) => {
                        if (log.id == split[0] + '-' + split[1] + '-' + split[2])
                            log.logs.forEach((subLog) => {
                                if (subLog.id == id)
                                    callback(new LogInput_1.LogInput(subLog.id, subLog.data, new Date(subLog.date), subLog.header, subLog.writtenBy, subLog.logs).toSidebarData());
                            });
                    }));
                    break;
                }
            }
        });
        socket.on('request-displayData', async (id, callback) => {
            callback(await (0, Display_1.getDisplayData)(id));
        });
        socket.on('request-log', async (id, callback) => {
            let split = id.split('-');
            const from = String(id).substring(0, String(id).lastIndexOf("-"));
            MongoDB_1.mongoClient.connect();
            switch (split.length) {
                // cannot remove layer 2 elements so skipping
                case 3: { // log input from machine
                    await MongoDB_1.coll.find({ id: split[0] }).forEach(machine => machine.logs.forEach((log) => log.id == id ? callback(log) : undefined));
                    break;
                }
                case 4: { // sub log from log input of machine
                    await MongoDB_1.coll.find({ id: split[0] }).forEach(machine => machine.logs.forEach((log) => log.id == from ? log.logs.forEach((subLog) => subLog.id == id ? callback(subLog) : undefined)
                        : undefined));
                    break;
                }
            }
        });
        socket.on('remove-entry', async (entry) => {
            const split = entry.id.split('-');
            const removeFrom = String(entry.id).substring(0, String(entry.id).lastIndexOf("-"));
            sendSidebarUpdateByID(new SidebarUpdate_1.SidebarUpdate(entry.id, true));
            switch (split.length) {
                case 1: { // remove machine
                    await MongoDB_1.coll.deleteOne({ id: split[0] });
                    break;
                }
                // cannot remove layer 2 elements so skipping
                case 3: { // remove log input from machine
                    await MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $pull: { 'logs': entry } });
                    break;
                }
                case 4: { // remove sub log from log input of machine
                    await MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $pull: { 'logs.$[log].logs': entry } }, { arrayFilters: [{ 'log.id': removeFrom }] });
                    break;
                }
            }
        });
        socket.on('machine-upsert', machine => {
            machine.id = fixId(machine.id);
            MongoDB_1.mongoClient.connect();
            const query = { id: machine.id };
            const update = { $set: machine };
            const options = { upsert: true };
            MongoDB_1.coll.updateOne(query, update, options);
            setTimeout(() => sendSidebarUpdateByID(new SidebarUpdate_1.SidebarUpdate(machine.id, false)), 2);
        });
        socket.on('append-log', async (logInput) => {
            let appendTo = String(logInput.id).substring(0, String(logInput.id).lastIndexOf("-"));
            let split = logInput.id.split('-');
            let oldLog;
            let oldSubLog;
            MongoDB_1.mongoClient.connect();
            if (split.length == 3) {
                await MongoDB_1.coll.find({ id: split[0] }).forEach((machine) => machine.logs.forEach((log) => {
                    if (log.id == logInput.id) {
                        oldLog = log;
                        logInput.logs = log.logs;
                    } // fetch sub points so we dont need the client to always know about them
                }));
                // upsert the log input
                await MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $pull: { 'logs': oldLog } });
                await MongoDB_1.coll.findOneAndUpdate({ id: split[0] }, { $push: { 'logs': logInput } });
            }
            if (split.length == 4) {
                // upsert the sub log
                await MongoDB_1.coll.find({ id: split[0] }).forEach((machine) => machine.logs.forEach((log) => {
                    if (log.id == appendTo)
                        log.logs.forEach((subLog) => subLog.id == logInput.id ? (oldSubLog = subLog) : undefined);
                }));
                await MongoDB_1.coll.findOneAndUpdate({ id: split[0], 'logs.id': appendTo }, { $pull: { 'logs.$[log].logs': oldSubLog } }, { arrayFilters: [{ 'log.id': appendTo }] });
                await MongoDB_1.coll.findOneAndUpdate({ id: split[0], 'logs.id': appendTo }, { $push: { 'logs.$[log].logs': logInput } }, { arrayFilters: [{ 'log.id': appendTo }] });
            }
            setTimeout(() => sendSidebarUpdateByID(new SidebarUpdate_1.SidebarUpdate(logInput.id, false)), 2);
        });
        socket.on('log', arg => {
            console.log(arg);
        });
        socket.on("disconnect", _ => {
            console.log("socket disconnect:", socket.id);
            if (subscription != undefined) {
                subscription.terminate();
                subscription = undefined;
            }
            ;
            if (session != undefined) {
                session.close();
                session = undefined;
            }
            ;
            if (OPCClient != undefined) {
                OPCClient.disconnect();
                OPCClient = undefined;
            }
            ;
            var i = allClients.indexOf(socket);
            allClients.splice(i, 1);
        });
        socket.on("subscribe-display", async (arg, callback) => {
            let displayData = await (0, Display_1.getDisplayData)(arg);
            if (displayData == null || displayData.endpoint == null || displayData.nodeAddress == null) {
                socket.emit('alert', 'No display for ' + arg);
                return;
            }
            ;
            const endpointUrl = displayData.endpoint;
            const baseNode = displayData.nodeAddress;
            const nss = baseNode.substring(0, baseNode.lastIndexOf("=") + 1);
            OPCClient = node_opcua_1.OPCUAClient.create({ endpointMustExist: false });
            let terminated = false;
            OPCClient.on("backoff", (retry, delay) => {
                console.log(" cannot connect to endpoint retry = ", retry, " next attempt in ", delay / 1000, "seconds");
                socket.emit('alert', 'Error on OPCUA OPCClient initialization on server side, are you sure you have a connection route to the destination?');
                socket.emit("subscribe-update", undefined); // to reomve the loading bar
                console.log('OPCUA OPCClient terminated for', socket.id);
                subscription?.terminate();
                if (OPCClient != undefined)
                    OPCClient.disconnect();
                terminated = true;
            });
            if (terminated)
                return;
            try {
                await OPCClient.connect(endpointUrl);
                session = await OPCClient.createSession({
                    userName: "tine",
                    password: "Melkebart_2021%&",
                    type: node_opcua_1.UserTokenType.UserName,
                });
                const dashBrowser = (await session.browse(baseNode));
                let nodes = await (0, Display_1.lookupNodeIds)(dashBrowser, session, nss); // get available nodes in array of DType from PLC
                let nodeIdListValues = [];
                Object.entries(nodes).forEach(([key, value]) => {
                    Object.entries(value).forEach(([key, value]) => {
                        if (key == "5")
                            nodeIdListValues.push(value); // push only 'value' index of DType (5th child)
                    });
                });
                session.createSubscription2({
                    requestedPublishingInterval: 1000,
                    requestedLifetimeCount: 1000,
                    requestedMaxKeepAliveCount: 20,
                    maxNotificationsPerPublish: 10,
                    publishingEnabled: true,
                    priority: 1,
                }, async (err, newSubscription) => {
                    subscription = newSubscription;
                    if (subscription != undefined)
                        subscription
                            .on("keepalive", () => {
                            console.log("OPCUA Subscription keep alive", socket.id);
                        })
                            .on("terminated", () => {
                            console.log("OPCUA Subscription ended", socket.id);
                            subscription = undefined;
                        });
                    const delayedIterator = (i) => {
                        setTimeout(async () => {
                            if (subscription?.isActive) {
                                const monitorItem = await subscription?.monitor({
                                    nodeId: nss + nodeIdListValues[i],
                                    attributeId: node_opcua_1.AttributeIds.Value,
                                }, {
                                    samplingInterval: 500,
                                    discardOldest: true,
                                    queueSize: 2,
                                }, node_opcua_1.TimestampsToReturn.Neither);
                                const sendLinks = async (tag, i2) => {
                                    setTimeout(async () => {
                                        let link = session != undefined ? (await session.read({
                                            nodeId: nss +
                                                nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                                                `.links[${i2}]`,
                                        }, node_opcua_1.TimestampsToReturn.Neither)).value.value : undefined;
                                        if (link != null)
                                            socket.emit('subscribe-link', { source: tag, target: link });
                                    }, 5);
                                    if (i2 + 1 < 3)
                                        sendLinks(tag, i2 + 1);
                                };
                                monitorItem?.on("changed", async (val) => {
                                    if (val.value.value != null) {
                                        let tag = session != undefined ? await session.read({
                                            nodeId: nss +
                                                nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                                                ".tag",
                                        }, node_opcua_1.TimestampsToReturn.Neither) : undefined;
                                        sendLinks(tag?.value.value, 0);
                                        socket.emit("subscribe-update", [
                                            tag != undefined ? tag.value.value : undefined,
                                            val.value.value,
                                        ]);
                                    }
                                });
                            }
                            if (i + 1 < nodeIdListValues.length)
                                delayedIterator(i + 1);
                        }, 5);
                    };
                    delayedIterator(0);
                });
                socket.on("subscribe-terminate", () => {
                    if (subscription != undefined)
                        subscription.terminate();
                    if (session != undefined)
                        session.close();
                    if (OPCClient != undefined)
                        OPCClient.disconnect();
                    subscription = undefined;
                    session = undefined;
                    OPCClient = undefined;
                    console.log("OPCUA OPCClient disconnect", socket.id);
                    socket.emit("alert", "OPCUA OPCClient disconnect", socket.id);
                });
            }
            catch (err) {
                console.log("An error occured in OPC-UA OPCClient connection ", socket.id, err.message);
            }
            if (!terminated)
                callback("Subscription start for " + arg, socket.id);
            else
                callback('Unable to connect to OPCUA', socket.id);
        });
    });
};
exports.initSock = initSock;
//# sourceMappingURL=socket.js.map