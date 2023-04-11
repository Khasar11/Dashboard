
import { BrowseResult, ClientSession } from "node-opcua";
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

export const lookupNodeIds = async (startpoint: BrowseResult, session: ClientSession, nss: string) => {
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