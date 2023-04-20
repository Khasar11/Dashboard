import { Socket } from "socket.io";
import { io } from "../server";
import { getDisplayData, lookupNodeIds } from "../components/Display/Display";
import {
  AttributeIds,
  BrowseResult,
  ClientSession,
  ClientSubscription,
  OPCUAClient,
  TimestampsToReturn,
  UserTokenType,
} from "node-opcua";

export const initSock = () => {
  var allClients: Socket[] = [];
  io.sockets.on("connection", (socket: Socket) => {
    allClients.push(socket);
    console.log("socket connect:", socket.id);

    let client: OPCUAClient | undefined = undefined;
    let subscription: ClientSubscription | undefined = undefined;
    let session: ClientSession | undefined = undefined;

    socket.on('log', arg => {
      console.log(arg)
    })

    socket.on("disconnect", _ => {
      console.log("socket disconnect:", socket.id);
      if (subscription!= undefined) { subscription.terminate(); subscription = undefined };
      if (session     != undefined) { session.close(); session = undefined };
      if (client      != undefined) {client.disconnect(); client = undefined };
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
    });

    socket.on("subscribe-display", async (arg, callback) => {
      let displayData = JSON.parse(await getDisplayData(arg));
      if (displayData == null || displayData.endpoint == null || displayData.nodeAddress == null) { socket.emit('alert', 'No display for '+arg); return};
      const endpointUrl = displayData.endpoint;
      const baseNode = displayData.nodeAddress;
      const nss = baseNode.substring(0, baseNode.lastIndexOf("=") + 1);
      client = OPCUAClient.create({ endpointMustExist: false });
      let terminated: boolean = false;
      client.on("backoff", (retry: number, delay: number) => {
        console.log(
          " cannot connect to endpoint retry = ",
          retry,
          " next attempt in ",
          delay / 1000,
          "seconds"
        );
        socket.emit('alert', 'Error on OPCUA client initialization on server side, are you sure you have a connection route to the destination?')
        socket.emit("subscribe-update", undefined); // to reomve the loading bar
        console.log('OPCUA client terminated for', socket.id)
        subscription?.terminate();
        if (client  != undefined) client.disconnect();
        terminated = true;
      });

      if (terminated) return;

      try {
        await client.connect(endpointUrl);
        session = await client.createSession({
          userName: "tine",
          password: "Melkebart_2021%&",
          type: UserTokenType.UserName,
        });

        const dashBrowser: BrowseResult = (await session.browse(
          baseNode
        )) as BrowseResult;

        let nodes = await lookupNodeIds(dashBrowser, session, nss); // get available nodes in array of DType from PLC
        let nodeIdListValues: string[] = [];
        Object.entries(nodes).forEach(([key, value]) => {
          Object.entries(value as object).forEach(([key, value]) => {
            if (key == "5") nodeIdListValues.push(value); // push only 'value' index of DType (5th child)
          });
        });
        
        session.createSubscription2(
          {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 1000,
            requestedMaxKeepAliveCount: 20,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 1,
          },
          async (
            err: Error | null,
            newSubscription: ClientSubscription | undefined
          ) => {
            subscription = newSubscription;
            if (subscription != undefined)
              subscription
                .on("keepalive", () => {
                  console.log("OPCUA Subscription keep alive", socket.id);
                })
                .on("terminated", () => {
                  console.log("OPCUA Subscription ended", socket.id);
                  subscription = undefined;
                });

            const delayedIterator = (i:number) => {
              setTimeout(async () => {
                if (subscription?.isActive) {
                  const monitorItem = await subscription?.monitor(
                    {
                      nodeId: nss + nodeIdListValues[i],
                      attributeId: AttributeIds.Value,
                    },
                    {
                      samplingInterval: 500,
                      discardOldest: true,
                      queueSize: 2,
                    },
                    TimestampsToReturn.Neither
                  );

                  const sendLinks = async (tag: string, i2: number) => {
                    setTimeout(async () => {
                      let link = 
                          session != undefined ? (await session.read(
                          {
                            nodeId: nss +
                              nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                              `.links[${i2}]`,
                          },
                          TimestampsToReturn.Neither)).value.value : undefined
                      if (link != null) socket.emit('subscribe-link', {source: tag, target: link})
                    }, 5)
                    if (i2+1<3) sendLinks(tag, i2+1)
                  } 

                  monitorItem?.on("changed", async (val) => {
                    if (val.value.value != null) {
                      let tag = session != undefined ? await session.read(
                        {
                          nodeId:
                            nss +
                            nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                            ".tag",
                        },
                        TimestampsToReturn.Neither
                      ) : undefined;
                      sendLinks(tag?.value.value, 0)
                      socket.emit("subscribe-update", [
                        tag != undefined ? tag.value.value : undefined,
                        val.value.value,
                      ]);
                    }
                  });
                }
                if (i+1<nodeIdListValues.length) delayedIterator(i+1);
              }, 5)
            };
          delayedIterator(0)
          }
        );

        socket.on("subscribe-terminate", () => {
          if (subscription!= undefined) subscription.terminate();
          if (session     != undefined) session.close();
          if (client      != undefined) client.disconnect();
          subscription = undefined;
          session = undefined;
          client = undefined;
          console.log("OPCUA Client disconnect", socket.id);
          socket.emit("alert", "OPCUA client disconnect", socket.id);
        });
      } catch (err: any) {
        console.log(
          "An error occured in OPC-UA client connection ", socket.id,
          err.message
        );
      }
      if (!terminated) callback("Subscription start for " + arg, socket.id);
      else callback('Unable to connect to OPCUA', socket.id)
    });
  });
};