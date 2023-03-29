const async = require("async");
import { OPCUAClient, AttributeIds, DataValue, Variant, NodeId, Subscription, ClientSubscription, TimestampsToReturn, ReadValueIdOptions, BrowseResult, ReferenceDescription } from "node-opcua";
import { Bindings } from './Bindings';
import { Link } from './Link';
import { NodeObject } from './NodeObject';

class Display { // object to return for GET method from browser, will turn automatically into graphic display
    links: Link[];
    nodeObjects: NodeObject[];

    constructor(links: Link[], nodeObjects: NodeObject[]) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
}

export async function getDisplay(from: string) {
    return new Display(
        [
            new Link(0, 1),
            new Link(1, 2),
            new Link(2,0),
            new Link(2,3),
            new Link(4,5),
            new Link(3,6),
            new Link(6,7),
            new Link(7,8),
            new Link(8,9),
            new Link(9,10),
        ], 
        [
            new NodeObject('key1', 3),
            new NodeObject('key2', 'false'),
            new NodeObject('key3', 'true'),
            new NodeObject('key4', 'value4'),
            new NodeObject('key5', 'value5'),
            new NodeObject('key6', 'true'),
            new NodeObject('key7', 'false'),
            new NodeObject('key8', 'true'),
            new NodeObject('key9', 'false'),
            new NodeObject('key10', '0'),
            new NodeObject('key11', '16#ffff'),

        ]
    )
}

export async function displayTest() {
    const endpointUrl = "opc.tcp://192.168.120.160:49320";
    const client = OPCUAClient.create({ endpointMustExist: false});
    client.on("backoff", (retry: number, delay: number) => {
        console.log(" cannot connect to endpoint retry = ", retry,
          " next attempt in " , delay/1000, "seconds");
    });

    let subscription: ClientSubscription | undefined = undefined;
    const node = 
        "ns=3;s=SRV123006->Kepware.KEPServerEX.V6->Tapperi.Knuser.Program_blocks.HMI";
    try {
        await client.connect(endpointUrl);
        const session = await client.createSession();

        console.log(await session.browse('RootFolder'))

        await session.createSubscription2({
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 1000,
            requestedMaxKeepAliveCount: 20,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        }, async (err: Error | null, newSubscription: ClientSubscription | undefined) => {
            subscription = newSubscription;
            if (subscription != undefined) 
                subscription.on("keepalive", function() {
                    console.log("Subscription keep alive");
                }).on("terminated", function() {
                    console.log('Subscription ended')
                });
            
                const browseResult: BrowseResult = await session.browse("RootFolder") as BrowseResult;

                if (browseResult.references != null)
                    console.log(browseResult.references.map(
                        (r: ReferenceDescription) => r.browseName.toString()).join("\n"));

            let monitorItem = await subscription?.monitor({
                nodeId: node,
                attributeId: AttributeIds.Value
            },{
                samplingInterval: 100,
                discardOldest: true,
                queueSize: 5
            }, TimestampsToReturn.Both)

            monitorItem?.on('changed', (val) => {
                console.log('Value change: '+val.value.value)
            }) 
        });

        await setTimeout(() => {
            subscription?.terminate();
            session.close();
            client.disconnect();
            console.log('Client disconnect')
        }, 10000);

    } catch (err: any) {
        console.log("An error occured in OPC-UA client connection ", err.message);
    }
}