"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupNodeIds = exports.getDisplay = exports.setDisplayData = exports.getDisplayData = void 0;
const MongoDB_1 = require("../MongoDB/MongoDB");
const Link_1 = require("./Link");
const NodeObject_1 = require("./NodeObject");
class Display {
    constructor(links, nodeObjects) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
}
async function getDisplayData(from) {
    MongoDB_1.client.connect();
    let split = from.split('-');
    let retData;
    await MongoDB_1.coll.find({ id: split[0] }).forEach((machine) => {
        machine.display != undefined ? retData = {
            endpoint: machine.display.endpoint,
            nodeAddress: machine.display.nodeAddress,
            username: machine.display.username,
            password: machine.display.password
        } : retData = {
            endpoint: '',
            nodeAddress: '',
            username: '',
            password: ''
        };
    });
    return JSON.stringify(retData);
}
exports.getDisplayData = getDisplayData;
// takes in data object to set $.display.$ to
// containing id, endpoint, nodeAddress fields
// requests back an ok status
async function setDisplayData(data) {
    MongoDB_1.client.connect();
    const split = data.id.split('-');
    const query = { id: split[0] };
    const update = { $set: { 'display.endpoint': data.endpoint } };
    const options = { upsert: true };
    MongoDB_1.coll.updateOne(query, update, options);
    const update2 = { $set: { 'display.nodeAddress': data.nodeAddress } };
    MongoDB_1.coll.updateOne(query, update2, options);
    const update3 = { $set: { 'display.username': data.username } };
    MongoDB_1.coll.updateOne(query, update3, options);
    const update4 = { $set: { 'display.password': data.password } };
    MongoDB_1.coll.updateOne(query, update4, options);
    return "display updated for " + split[0];
}
exports.setDisplayData = setDisplayData;
const randomHex = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '16#' + n.slice(0, 6);
};
async function getDisplay(from) {
    return new Display([
        new Link_1.Link(0, 1),
        new Link_1.Link(1, 2),
        new Link_1.Link(2, 0),
        new Link_1.Link(2, 3),
        new Link_1.Link(4, 5),
        new Link_1.Link(3, 6),
        new Link_1.Link(6, 7),
        new Link_1.Link(7, 8),
        new Link_1.Link(8, 9),
        new Link_1.Link(9, 10),
        new Link_1.Link(10, 3)
    ], [
        new NodeObject_1.NodeObject('key1', Math.random() < 0.5),
        new NodeObject_1.NodeObject('key2', Math.round((Math.random() * 100 * 100)) / 100),
        new NodeObject_1.NodeObject('key3', Math.round((Math.random() * 100 * 100)) / 100),
        new NodeObject_1.NodeObject('key4', Math.round((Math.random() * 100 * 100)) / 100),
        new NodeObject_1.NodeObject('key5', Math.random() < 0.5),
        new NodeObject_1.NodeObject('key6', Math.random() < 0.5),
        new NodeObject_1.NodeObject('key7', randomHex()),
        new NodeObject_1.NodeObject('key8', randomHex()),
        new NodeObject_1.NodeObject('key9', Math.random() < 0.5),
        new NodeObject_1.NodeObject('key10', Math.random() < 0.5),
        new NodeObject_1.NodeObject('key11', Math.random() < 0.5),
    ]);
}
exports.getDisplay = getDisplay;
const lookupNodeIds = async (startpoint, session, nss) => {
    let lookupList = {};
    if (startpoint != null && startpoint.references != null) {
        let i = -1;
        for (const ref of startpoint.references) {
            const dashBrowser = await session.browse(nss + ref.nodeId.value + '');
            let lookupSubList = {};
            if (dashBrowser.references != null) {
                let i2 = 0;
                for (const subRef of dashBrowser.references) {
                    lookupSubList[i2] = subRef.nodeId.value;
                    i2++;
                }
            }
            i++;
            lookupList[i] = lookupSubList;
        }
    }
    return lookupList;
};
exports.lookupNodeIds = lookupNodeIds;
//# sourceMappingURL=Display.js.map