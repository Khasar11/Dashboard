"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.displayTest = exports.getDisplay = exports.setDisplayData = exports.getDisplayData = void 0;
var node_opcua_1 = require("node-opcua");
var MongoDB_1 = require("../MongoDB/MongoDB");
var Link_1 = require("./Link");
var NodeObject_1 = require("./NodeObject");
var Display = /** @class */ (function () {
    function Display(links, nodeObjects) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
    return Display;
}());
function getDisplayData(from) {
    return __awaiter(this, void 0, void 0, function () {
        var split, retData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    MongoDB_1.client.connect();
                    split = from.split('-');
                    return [4 /*yield*/, MongoDB_1.coll.find({ id: split[0] }).forEach(function (machine) {
                            machine.display != undefined ? retData = {
                                endpoint: machine.display.endpoint,
                                nodeAddress: machine.display.nodeAddress
                            } : retData = {
                                endpoint: '',
                                nodeAddress: ''
                            };
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, JSON.stringify(retData)];
            }
        });
    });
}
exports.getDisplayData = getDisplayData;
// takes in data object to set $.display.$ to
// containing id, endpoint, nodeAddress fields
// requests back an ok status
function setDisplayData(data) {
    return __awaiter(this, void 0, void 0, function () {
        var split, query, update, options, update2;
        return __generator(this, function (_a) {
            MongoDB_1.client.connect();
            console.log(data);
            split = data.id.split('-');
            query = { id: split[0] };
            update = { $set: { 'display.endpoint': data.endpoint } };
            options = { upsert: true };
            MongoDB_1.coll.updateOne(query, update, options);
            update2 = { $set: { 'display.nodeAddress': data.nodeAddress } };
            MongoDB_1.coll.updateOne(query, update2, options);
            return [2 /*return*/, "display updated for " + split[0]];
        });
    });
}
exports.setDisplayData = setDisplayData;
function getDisplay(from) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Display([
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
                ], [
                    new NodeObject_1.NodeObject('key1', 3),
                    new NodeObject_1.NodeObject('key2', 'false'),
                    new NodeObject_1.NodeObject('key3', 'true'),
                    new NodeObject_1.NodeObject('key4', 'value4'),
                    new NodeObject_1.NodeObject('key5', 'value5'),
                    new NodeObject_1.NodeObject('key6', 'true'),
                    new NodeObject_1.NodeObject('key7', 'false'),
                    new NodeObject_1.NodeObject('key8', 'true'),
                    new NodeObject_1.NodeObject('key9', 'false'),
                    new NodeObject_1.NodeObject('key10', '0'),
                    new NodeObject_1.NodeObject('key11', '16#ffff'),
                ])];
        });
    });
}
exports.getDisplay = getDisplay;
function displayTest() {
    return __awaiter(this, void 0, void 0, function () {
        var endpointUrl, client, subscription, node, session_1, _a, _b, err_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    endpointUrl = "opc.tcp://192.168.120.160:49320";
                    client = node_opcua_1.OPCUAClient.create({ endpointMustExist: false });
                    client.on("backoff", function (retry, delay) {
                        console.log(" cannot connect to endpoint retry = ", retry, " next attempt in ", delay / 1000, "seconds");
                    });
                    subscription = undefined;
                    node = "ns=3;s=SRV123006->Kepware.KEPServerEX.V6->Tapperi.Knuser.Program_blocks.HMI";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, client.connect(endpointUrl)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, client.createSession()];
                case 3:
                    session_1 = _c.sent();
                    _b = (_a = console).log;
                    return [4 /*yield*/, session_1.browse('RootFolder')];
                case 4:
                    _b.apply(_a, [_c.sent()]);
                    return [4 /*yield*/, session_1.createSubscription2({
                            requestedPublishingInterval: 1000,
                            requestedLifetimeCount: 1000,
                            requestedMaxKeepAliveCount: 20,
                            maxNotificationsPerPublish: 10,
                            publishingEnabled: true,
                            priority: 10
                        }, function (err, newSubscription) { return __awaiter(_this, void 0, void 0, function () {
                            var browseResult, monitorItem;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        subscription = newSubscription;
                                        if (subscription != undefined)
                                            subscription.on("keepalive", function () {
                                                console.log("Subscription keep alive");
                                            }).on("terminated", function () {
                                                console.log('Subscription ended');
                                            });
                                        return [4 /*yield*/, session_1.browse("RootFolder")];
                                    case 1:
                                        browseResult = _a.sent();
                                        if (browseResult.references != null)
                                            console.log(browseResult.references.map(function (r) { return r.browseName.toString(); }).join("\n"));
                                        return [4 /*yield*/, (subscription === null || subscription === void 0 ? void 0 : subscription.monitor({
                                                nodeId: node,
                                                attributeId: node_opcua_1.AttributeIds.Value
                                            }, {
                                                samplingInterval: 100,
                                                discardOldest: true,
                                                queueSize: 5
                                            }, node_opcua_1.TimestampsToReturn.Both))];
                                    case 2:
                                        monitorItem = _a.sent();
                                        monitorItem === null || monitorItem === void 0 ? void 0 : monitorItem.on('changed', function (val) {
                                            console.log('Value change: ' + val.value.value);
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, setTimeout(function () {
                            subscription === null || subscription === void 0 ? void 0 : subscription.terminate();
                            session_1.close();
                            client.disconnect();
                            console.log('Client disconnect');
                        }, 10000)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _c.sent();
                    console.log("An error occured in OPC-UA client connection ", err_1.message);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.displayTest = displayTest;
