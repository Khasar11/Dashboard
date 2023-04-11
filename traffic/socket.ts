import { Socket } from "socket.io";
import { io } from "../server";
import { getDisplayData, lookupNodeIds } from "../components/Display/Display";
import { AttributeIds, BrowseResult, ClientSubscription, OPCUAClient, TimestampsToReturn, UserTokenType } from "node-opcua";

export const initSock = () => {
    
    var allClients: Socket[] = [];
    io.sockets.on('connection', (socket: Socket) => {
       allClients.push(socket);
       console.log('socket connect');
    
       socket.on('disconnect', function() {
          console.log('socket disconnect');
    
          var i = allClients.indexOf(socket);
          allClients.splice(i, 1);
       });
   
       socket.on('subscribe-display', async (arg, callback) => {
            let displayData = JSON.parse(await getDisplayData(arg));
            const endpointUrl = displayData.endpoint;
            const baseNode = displayData.nodeAddress;
            const nss = baseNode.substring(0, baseNode.lastIndexOf('=')+1)
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
            
                let nodes = await lookupNodeIds(dashBrowser, session, nss) // get available nodes in array of DType from PLC
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
                                    , TimestampsToReturn.Neither)
                                 let links = [
                                    (await session.read(
                                       {nodeId: nss+nodeId.substring(0, nodeId.lastIndexOf('.'))+'.links[0]'}
                                       , TimestampsToReturn.Neither)).value.value,
                                    (await session.read(
                                       {nodeId: nss+nodeId.substring(0, nodeId.lastIndexOf('.'))+'.links[1]'}
                                       , TimestampsToReturn.Neither)).value.value,
                                    (await session.read(
                                       {nodeId: nss+nodeId.substring(0, nodeId.lastIndexOf('.'))+'.links[2]'}
                                       , TimestampsToReturn.Neither)).value.value,
                                    (await session.read(
                                       {nodeId: nss+nodeId.substring(0, nodeId.lastIndexOf('.'))+'.links[3]'}
                                       , TimestampsToReturn.Neither)).value.value
                                 ]
                                socket.emit('subscribe-update', [tag.value.value, val.value.value, links])
                            }
                        }) 
                    }
                });
             
                setTimeout(() => {
                    subscription?.terminate();
                    session.close();
                    client.disconnect();
                    console.log('OPCUA Client disconnect')
                }, 20000);
             
            } catch (err: any) {
                console.log("An error occured in OPC-UA client connection ", err.message);
            }
            callback('Subscription start for '+ arg)
       })
    });

}
