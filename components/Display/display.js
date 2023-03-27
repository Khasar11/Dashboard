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
exports.getDisplay = void 0;
var async = require("async");
var node_opcua_1 = require("node-opcua");
var node_opcua_client_1 = require("node-opcua-client");
var Display = /** @class */ (function () {
    function Display(bindings, links, nodeObjects) {
        this.links = links;
        this.nodeObjects = nodeObjects;
        this.bindings = bindings;
    }
    return Display;
}());
function getDisplay(from) {
    return __awaiter(this, void 0, void 0, function () {
        var client, endpointUrl, nodeId, theSession, theSubscription;
        return __generator(this, function (_a) {
            client = node_opcua_1.OPCUAClient.create({ endpointMustExist: false });
            endpointUrl = 'opc.tcp://srv123006:57888/opcexpert';
            nodeId = "ns=3;s=SRV123006->Kepware.KEPServerEX.V6->Tapperi.Knuser.Trykkgiver_inn_hydraulikk_13BPC1_P5BPC2";
            theSession = null;
            theSubscription = null;
            async.series([
                // step 1 : connect to
                function (callback) {
                    client.connect(endpointUrl, function (err) {
                        if (err)
                            console.log("Can't connect to endpoint with url: ", endpointUrl);
                        else
                            console.log("Connected to endpoint URL");
                        callback(err);
                    });
                },
                // step 2 : createSession
                function (callback) {
                    client.createSession(function (err, session) {
                        if (!err)
                            theSession = session;
                        callback(err);
                    });
                },
                // step 3 : browse
                function (callback) {
                    theSession.browse("RootFolder", function (err, browse_result) {
                        if (!err)
                            browse_result.references.forEach(function (reference) {
                                console.log(reference.browseName);
                            });
                        callback(err);
                    });
                },
                // step 4 : read a variable
                function (callback) {
                    theSession.read({
                        nodeId: nodeId,
                        attributeId: node_opcua_client_1.AttributeIds.Value
                    }, function (err, dataValue) {
                        if (!err)
                            console.log(" read value = ", dataValue.toString());
                        callback(err);
                    });
                },
                // step 5: install a subscription and monitored item
                //
                // -----------------------------------------
                // create subscription
                function (callback) {
                    theSession.createSubscription2({
                        requestedPublishingInterval: 1000,
                        requestedLifetimeCount: 1000,
                        requestedMaxKeepAliveCount: 20,
                        maxNotificationsPerPublish: 10,
                        publishingEnabled: true,
                        priority: 10
                    }, function (err, subscription) {
                        if (err) {
                            return callback(err);
                        }
                        theSubscription = subscription;
                        theSubscription.on("keepalive", function () {
                            console.log("keepalive");
                        }).on("terminated", function () {
                        });
                        callback();
                    });
                }, function (callback) {
                    // install monitored item
                    //
                    theSubscription.monitor({
                        nodeId: nodeId,
                        attributeId: node_opcua_client_1.AttributeIds.Value
                    }, {
                        samplingInterval: 100,
                        discardOldest: true,
                        queueSize: 10
                    }, node_opcua_client_1.TimestampsToReturn.Both, function (err, monitoredItem) {
                        console.log("-------------------------------------");
                        monitoredItem
                            .on("changed", function (value) {
                            console.log(" New Value = ", value.toString());
                        })
                            .on("err", function (err) {
                            console.log("MonitoredItem err =", err.message);
                        });
                        callback(err);
                    });
                }, function (callback) {
                    console.log("Waiting 5 seconds");
                    setTimeout(function () {
                        theSubscription.terminate();
                        callback();
                    }, 5000);
                }, function (callback) {
                    console.log(" closing session");
                    theSession.close(function (err) {
                        console.log(" session closed");
                        callback();
                    });
                },
            ], function (err) {
                if (err) {
                    console.log(" failure ", err);
                    process.exit(0);
                }
                else {
                    console.log("done!");
                }
                client.disconnect(function () { });
            });
            return [2 /*return*/];
        });
    });
}
exports.getDisplay = getDisplay;
