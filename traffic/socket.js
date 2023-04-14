"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSock = void 0;
const server_1 = require("../server");
const Display_1 = require("../components/Display/Display");
const node_opcua_1 = require("node-opcua");
const initSock = () => {
    var allClients = [];
    server_1.io.sockets.on("connection", (socket) => {
        allClients.push(socket);
        console.log("socket connect:", socket.id);
        let client = undefined;
        let subscription = undefined;
        let session = undefined;
        socket.on("disconnect", function () {
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
            if (client != undefined) {
                client.disconnect();
                client = undefined;
            }
            ;
            var i = allClients.indexOf(socket);
            allClients.splice(i, 1);
        });
        socket.on("subscribe-display", async (arg, callback) => {
            let displayData = JSON.parse(await (0, Display_1.getDisplayData)(arg));
            const endpointUrl = displayData.endpoint;
            const baseNode = displayData.nodeAddress;
            const nss = baseNode.substring(0, baseNode.lastIndexOf("=") + 1);
            client = node_opcua_1.OPCUAClient.create({ endpointMustExist: false });
            let terminated = false;
            client.on("backoff", (retry, delay) => {
                console.log(" cannot connect to endpoint retry = ", retry, " next attempt in ", delay / 1000, "seconds");
                socket.emit('alert', 'Error on OPCUA client initialization on server side, are you sure you have a connection route to the destination?');
                socket.emit("subscribe-update", undefined); // to reomve the loading bar
                console.log('OPCUA client terminated for', socket.id);
                subscription?.terminate();
                if (client != undefined)
                    client.disconnect();
                terminated = true;
            });
            if (terminated)
                return;
            try {
                await client.connect(endpointUrl);
                session = await client.createSession({
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
                            .on("keepalive", function () {
                            console.log("OPCUA Subscription keep alive");
                        })
                            .on("terminated", function () {
                            console.log("OPCUA Subscription ended");
                            subscription = undefined;
                        });
                    const delayedIterator = (i) => {
                        setTimeout(async () => {
                            const monitorItem = await subscription?.monitor({
                                nodeId: nss + nodeIdListValues[i],
                                attributeId: node_opcua_1.AttributeIds.Value,
                            }, {
                                samplingInterval: 500,
                                discardOldest: true,
                                queueSize: 2,
                            }, node_opcua_1.TimestampsToReturn.Neither);
                            let links = [];
                            (async () => {
                                for (let i2 = 0; i2 <= 3; i2++) {
                                    await new Promise((resolve) => {
                                        setTimeout(async () => {
                                            links.push(session != undefined ? (await session.read({
                                                nodeId: nss +
                                                    nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                                                    `.links[${i2}]`,
                                            }, node_opcua_1.TimestampsToReturn.Neither)).value.value : undefined);
                                            resolve(true);
                                        }, 5);
                                    });
                                }
                            })();
                            monitorItem?.on("changed", async (val) => {
                                if (val.value.value != null) {
                                    let tag = session != undefined ? await session.read({
                                        nodeId: nss +
                                            nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                                            ".tag",
                                    }, node_opcua_1.TimestampsToReturn.Neither) : undefined;
                                    console.log(tag?.value.value, val.value.value, links);
                                    socket.emit("subscribe-update", [
                                        tag != undefined ? tag.value.value : undefined,
                                        val.value.value,
                                        links
                                    ]);
                                }
                            });
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
                    if (client != undefined)
                        client.disconnect();
                    subscription = undefined;
                    session = undefined;
                    client = undefined;
                    console.log("OPCUA Client disconnect");
                    socket.emit("alert", "OPCUA client disconnect");
                });
            }
            catch (err) {
                console.log("An error occured in OPC-UA client connection ", err.message);
            }
            if (!terminated)
                callback("Subscription start for " + arg);
            else
                callback('Unable to connect to OPCUA');
        });
    });
};
exports.initSock = initSock;
//# sourceMappingURL=socket.js.map