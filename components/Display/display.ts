
import { OPCUAClient, AttributeIds, ClientSubscription, ClientSession, TimestampsToReturn, BrowseResult, ReferenceDescription, UserIdentityToken, UserTokenPolicy, UserTokenType, NodeId } from "node-opcua";
import { client, coll } from "../MongoDB/MongoDB";
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

export async function getDisplayData(from: string) {
    client.connect()
    let split = from.split('-')

    let retData: any;

    await coll.find({id: split[0]}).forEach((machine: any ) => {
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
        }
    })
    return JSON.stringify(retData)
}

// takes in data object to set $.display.$ to
// containing id, endpoint, nodeAddress fields
// requests back an ok status
export async function setDisplayData(data: any) {
    client.connect()
    const split = data.id.split('-')

    const query = { id: split[0]};
    const update = { $set: {'display.endpoint': data.endpoint}}
    const options = { upsert: true };
    coll.updateOne(query, update, options);

    const update2 = { $set: {'display.nodeAddress': data.nodeAddress}}
    coll.updateOne(query, update2, options);

    const update3 = { $set: {'display.username': data.username}}
    coll.updateOne(query, update3, options);

    const update4 = { $set: {'display.password': data.password}}
    coll.updateOne(query, update4, options);

    return "display updated for " + split[0] 
}

const randomHex = () => {
	let n = (Math.random() * 0xfffff * 1000000).toString(16);
	return '16#' + n.slice(0, 6);
};

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
            new Link(10, 3)
        ], 
        [
            new NodeObject('key1', Math.random() < 0.5),
            new NodeObject('key2', Math.round((Math.random() * 100 * 100)) / 100),
            new NodeObject('key3', Math.round((Math.random() * 100 * 100)) / 100),
            new NodeObject('key4', Math.round((Math.random() * 100 * 100)) / 100),
            new NodeObject('key5', Math.random() < 0.5),
            new NodeObject('key6', Math.random() < 0.5),
            new NodeObject('key7', randomHex()),
            new NodeObject('key8', randomHex()),
            new NodeObject('key9', Math.random() < 0.5),
            new NodeObject('key10',Math.random() < 0.5),
            new NodeObject('key11',Math.random() < 0.5),
        ]
    )
}
const nss = 'ns=2;s='
export async function displayTest() {
    const endpointUrl = "opc.tcp://192.168.120.160:49320";
    const baseNode = nss+"Tapperi.Knuser.Program_blocks.Dashboard.Dash";
    const client = OPCUAClient.create({ endpointMustExist: false});
    client.on("backoff", (retry: number, delay: number) => {
        console.log(" cannot connect to endpoint retry = ", retry,
          " next attempt in " , delay/1000, "seconds");
    });

    let subscription: ClientSubscription | undefined = undefined;
    try {
        await client.connect(endpointUrl);
        const session = await client.createSession({userName: 'tine', password: 'Melkebart_2021%&', type: UserTokenType.UserName});

        const dashBrowser: BrowseResult = await session.browse(baseNode) as BrowseResult;

        let nodes = await lookupNodeIds(dashBrowser, session) // get available nodes in array of DType from PLC
        let nodeIdList: string[] = []
        Object.entries(nodes).forEach(([key, value], index) => {
            Object.entries(value as object).forEach(([key, value], index) => {
                if (key == '5') nodeIdList.push(value) // push only 'value' index of DType (5th child)
            })
        });
        session.createSubscription2({
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
                    console.log("OPCUA Subscription keep alive");
                }).on("terminated", function() {
                    console.log('OPCUA Subscription ended')
                });
            for(const nodeId of nodeIdList) {
                const monitorItem = await subscription?.monitor({
                    nodeId: nss+nodeId,
                    attributeId: AttributeIds.Value
                },{
                    samplingInterval: 100,
                    discardOldest: true,
                    queueSize: 2
                }, TimestampsToReturn.Neither)
                
                monitorItem?.on('changed', async (val) => {
                    if (val.value.value != null) {
                        let tag = await session.read(
                            {nodeId: nss+nodeId.substring(0, nodeId.lastIndexOf('.'))+'.tag'}
                            , TimestampsToReturn.Both)
                        console.log('Value change: '+ (tag.value.value))
                        console.log(val.value.value)
                    }
                }) 
            }
        });

        setTimeout(() => {
            subscription?.terminate();
            session.close();
            client.disconnect();
            console.log('OPCUA Client disconnect')
        }, 60000);

    } catch (err: any) {
        console.log("An error occured in OPC-UA client connection ", err.message);
    }
}

const lookupNodeIds = async (startpoint: BrowseResult, session: ClientSession) => {
    let lookupList: any = {}
    if (startpoint != null && startpoint.references != null) {
        let i = -1
        for(const ref of startpoint.references) {
            const dashBrowser: BrowseResult = await session.browse(nss+ref.nodeId.value+'') as BrowseResult;
            let lookupSubList: any = {}
            if (dashBrowser.references != null) {
                let i2 = 0
                for(const subRef of dashBrowser.references) {
                    lookupSubList[i2] = subRef.nodeId.value
                    i2++
                }
            }
            i++
            lookupList[i] = lookupSubList
        }
    }
    return lookupList
}