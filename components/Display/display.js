"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupNodeIds = exports.setDisplayData = exports.getDisplayData = void 0;
const MongoDB_1 = require("../MongoDB/MongoDB");
class Display {
    constructor(links, nodeObjects) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
}
const getDisplayData = async (from) => {
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
};
exports.getDisplayData = getDisplayData;
// takes in data object to set $.display.$ to
// containing id, endpoint, nodeAddress fields
// requests back an ok status
const setDisplayData = async (data) => {
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
};
exports.setDisplayData = setDisplayData;
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