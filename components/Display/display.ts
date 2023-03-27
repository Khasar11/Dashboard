
const async = require("async");
import { OPCUAClient } from 'node-opcua';
import { AttributeIds, ClientSession, TimestampsToReturn } from 'node-opcua-client';
import { Bindings } from './Bindings';
import { Link } from './Link';
import { NodeObject } from './NodeObject';

class Display {
    bindings: Bindings;
    links: Link[];
    nodeObjects: NodeObject[];

    constructor(bindings: Bindings, links: Link[], nodeObjects: NodeObject[]) {
        this.links = links;
        this.nodeObjects = nodeObjects;
        this.bindings = bindings;
    }
}

export async function getDisplay(from: string) {
    const client = OPCUAClient.create({endpointMustExist: false})
    const endpointUrl = 'opc.tcp://srv123006:57888/opcexpert'
    const nodeId = "ns=3;s=SRV123006->Kepware.KEPServerEX.V6->Tapperi.Knuser.Trykkgiver_inn_hydraulikk_13BPC1_P5BPC2";

    let theSession: any = null
    let theSubscription: any = null
    async.series([
        // step 1 : connect to
        function(callback: any) {
    
            client.connect(endpointUrl, function(err) {
    
                if (err) console.log("Can't connect to endpoint with url: ", endpointUrl);
                else console.log("Connected to endpoint URL");
                callback(err);
            });
        },
        // step 2 : createSession
        function(callback: any) {
            client.createSession(function(err, session) {
                if (!err) theSession = session;
                callback(err);
            });
        },
        // step 3 : browse
        function(callback: any) {
            theSession.browse("RootFolder", function(err: any, browse_result: any) {
                if (!err)
                    browse_result.references.forEach(function(reference: any) {
                        console.log(reference.browseName);
                    });
                callback(err);
            });
        },
        // step 4 : read a variable
        function(callback: any) {
            theSession.read({
                nodeId,
                attributeId: AttributeIds.Value
            }, (err:any, dataValue:any) => {
                if (!err) console.log(" read value = ", dataValue.toString());
                callback(err);
            })
        },
    
        // step 5: install a subscription and monitored item
        //
        // -----------------------------------------
        // create subscription
        function(callback: any) {
            theSession.createSubscription2({
                requestedPublishingInterval: 1000,
                requestedLifetimeCount: 1000,
                requestedMaxKeepAliveCount: 20,
                maxNotificationsPerPublish: 10,
                publishingEnabled: true,
                priority: 10
            }, function(err:any, subscription:any) {
                if (err) { return callback(err); }
                theSubscription = subscription;
                theSubscription.on("keepalive", function() {
                    console.log("keepalive");
                }).on("terminated", function() {
                });
                callback();
            });
    
        }, function(callback: any) {
            // install monitored item
            //
            theSubscription.monitor({
                nodeId,
                attributeId: AttributeIds.Value
            },
                {
                    samplingInterval: 100,
                    discardOldest: true,
                    queueSize: 10
                }, TimestampsToReturn.Both,
                (err:any, monitoredItem:any) => {
                    console.log("-------------------------------------");
                    monitoredItem
                        .on("changed", function(value:any) {
                            console.log(" New Value = ", value.toString());
                        })
                        .on("err", (err:any) => {
                            console.log("MonitoredItem err =", err.message);
                        });
                    callback(err);
    
                });
        }, function(callback: any) {
            console.log("Waiting 5 seconds")
            setTimeout(() => {
                theSubscription.terminate();
                callback();
            }, 5000);
        }, function(callback: any) {
            console.log(" closing session");
            theSession.close(function(err:any) {
                console.log(" session closed");
                callback();
            });
        },
    
    ],
        function(err:any) {
            if (err) {
                console.log(" failure ", err);
                process.exit(0);
            } else {
                console.log("done!");
            }
            client.disconnect(function() { });
        });
}