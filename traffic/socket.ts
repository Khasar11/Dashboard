import { Socket } from "socket.io";
import { io } from "../server";
import { getDisplayData, lookupNodeIds } from "../components/Display/Display";
import {
  AttributeIds,
  BrowseResult,
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

    socket.on("disconnect", function () {
      console.log("socket disconnect:", socket.id);

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
    });

    socket.on("subscribe-display", async (arg, callback) => {
      let displayData = JSON.parse(await getDisplayData(arg));
      const endpointUrl = displayData.endpoint;
      const baseNode = displayData.nodeAddress;
      const nss = baseNode.substring(0, baseNode.lastIndexOf("=") + 1);
      const client = OPCUAClient.create({ endpointMustExist: false });
      client.on("backoff", (retry: number, delay: number) => {
        console.log(
          " cannot connect to endpoint retry = ",
          retry,
          " next attempt in ",
          delay / 1000,
          "seconds"
        );
      });

      let subscription: ClientSubscription | undefined = undefined;
      try {
        await client.connect(endpointUrl);
        const session = await client.createSession({
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
            priority: 10,
          },
          async (
            err: Error | null,
            newSubscription: ClientSubscription | undefined
          ) => {
            subscription = newSubscription;
            if (subscription != undefined)
              subscription
                .on("keepalive", function () {
                  console.log("OPCUA Subscription keep alive");
                })
                .on("terminated", function () {
                  console.log("OPCUA Subscription ended");
                });

            const delayedIterator = (i:number) => {
              setTimeout(async () => {
                  console.log(i)
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
                  let links: string[] = [];
                  (async () => {
                    for (let i = 0; i <= 3; i++) {
                      await new Promise((resolve) => {
                        setTimeout(async () => {
                            links.push(
                                (await session.read(
                                {
                                  nodeId: nss +
                                    nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                                    `.links[${i}]`,
                                },
                                TimestampsToReturn.Neither)).value.value
                              )
                          resolve(true)
                        }, 25)
                      });
                    }
                  })()

                  monitorItem?.on("changed", async (val) => {
                    if (val.value.value != null) {
                      console.log('yup')
                      let tag = await session.read(
                        {
                          nodeId:
                            nss +
                            nodeIdListValues[i].substring(0, nodeIdListValues[i].lastIndexOf(".")) +
                            ".tag",
                        },
                        TimestampsToReturn.Neither
                      );
                      socket.emit("subscribe-update", [
                        tag.value.value,
                        val.value.value,
                        links
                      ]);
                    }
                  });
                if (i+1<nodeIdListValues.length) delayedIterator(i+1);
              }, 25)
            };
          delayedIterator(0)
          }
        );

        socket.on("subscribe-terminate", () => {
          subscription?.terminate();
          session.close();
          client.disconnect();
          console.log("OPCUA Client disconnect");
          socket.emit("alert", "OPCUA client disconnect");
        });
      } catch (err: any) {
        console.log(
          "An error occured in OPC-UA client connection ",
          err.message
        );
      }
      callback("Subscription start for " + arg);
    });
  });
};