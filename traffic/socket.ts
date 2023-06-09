import { Socket } from "socket.io";
import { fileDir, io } from "../server";
import { getDisplayData, lookupNodeIds, setDisplayData } from "../components/Display/Display";
import {
  AttributeIds,
  BrowseResult,
  ClientSession,
  ClientSubscription,
  OPCUAClient,
  TimestampsToReturn,
  UserTokenType,
} from "node-opcua";
import { getSidebar } from "../components/Sidebar/Sidebar";
import { mongoClient as mongoClient, coll } from "../components/MongoDB/MongoDB";
import { LogInput } from "../components/Logs/LogInput";
import { Machine, toSidebarData } from "../components/Machine/Machine";
import { StructuredUpdate } from "../components/StructuredData/StructuredUpdate";
import { StructuredUpdateObject } from "../components/StructuredData/StructuredUpdateObject";
import { getFileStorage } from "../components/FileStorage/FileStorage";
import { writeFile } from "fs";


const fixId = (old: string) => {
  return String(old).replaceAll('-', '_').replaceAll(' ', '_')
}

export const initSock = () => {
  var allClients: Socket[] = [];

  const sendSidebarUpdateByID = async (update: StructuredUpdate) => {
    const split = update.id.split('-')
    const from = String(update.id).substring(0, String(update.id).lastIndexOf("-"))
    let machine: Machine = new Machine('undefined', 'undefined', 'undefined', new Date(), [], undefined);
    await coll.find({id: split[0]}).forEach((loopMachine: any) => machine = loopMachine) 
    switch(split.length) {
      case 1: { // machine
        io.emit('sidebar-update', new StructuredUpdateObject(toSidebarData(machine), update.remove, machine.belonging));
        break;
      }
      case 2: { // logs or display or oee
        // unused for now
        console.log('2')
        break;
      }
      case 3: { // log input
        machine.logs.forEach((log: LogInput) => {
          if (log.id == update.id)
            io.emit('sidebar-update', new StructuredUpdateObject(
              new LogInput(log.id, log.data, new Date(log.date), log.header, log.writtenBy, log.logs).toSidebarData(), 
              update.remove)
            )
        })
        break;
      }
      case 4: { // sub log 
        machine.logs.forEach((log: LogInput) => {
          if (log.id == from)
            log.logs.forEach((subLog: LogInput) => {
              if (subLog.id == update.id) {
                io.emit('sidebar-update', new StructuredUpdateObject(
                  new LogInput(subLog.id, subLog.data, new Date(subLog.date), subLog.header, subLog.writtenBy, subLog.logs).toSidebarData(), 
                  update.remove)
                )
              }
            })
        })
        break;
      }
    }
  }

  io.sockets.on("connection", (socket: Socket) => {

    allClients.push(socket);
    console.log("socket connect:", socket.id);

    let OPCClient: OPCUAClient | undefined = undefined;
    let subscription: ClientSubscription | undefined = undefined;
    let session: ClientSession | undefined = undefined;

    socket.on('file-upload', (data, callback) => {
      writeFile(`${fileDir}/public/storage/${data.id}/${data.name}`, data.data, err => {
        callback(err)
      })
    })

    socket.on('write-display-data', submission => {
      setDisplayData(submission)
    })

    socket.on('request-sidebar', (x, callback) => {
      const sidebarPromise = Promise.resolve(getSidebar());
      sidebarPromise.then((value) => {
        callback(value)
      });
    })

    socket.on('request-folder-info', async (id, callback) => {
      callback(await getFileStorage(id))
    })

    socket.on('get-sidebar-element', (id, callback) => {
      const split = id.split('-')

      switch (split.length) {
        case 1: { // machine
          coll.find({id: id}).forEach((machine: any) => callback(toSidebarData(machine)))
          break;
        }
        case 3: { // log input
          coll.find({id: split[0]}).forEach((machine: any) => machine.logs.forEach((log: LogInput) => {
            if (log.id == id) callback(
                new LogInput(log.id, log.data, new Date(log.date), log.header, log.writtenBy, log.logs).toSidebarData()
              )
          }))
          break;
        }
        case 4: { // sub log
          coll.find({id: split[0]}).forEach((machine: any) => machine.logs.forEach((log: LogInput) => {
            if (log.id == split[0]+'-'+split[1]+'-'+split[2])
              log.logs.forEach((subLog: LogInput) => {
                if (subLog.id == id) callback(
                  new LogInput(subLog.id, subLog.data, new Date(subLog.date), 
                               subLog.header, subLog.writtenBy, subLog.logs).toSidebarData()
                  );
              })
          }))
          break;
        }
      }
    })

    socket.on('request-displayData', async (id, callback) => {
      callback(await getDisplayData(id))
    })

    socket.on('request-log', async (id, callback) => {
      let split = id.split('-')
      const from = String(id).substring(0, String(id).lastIndexOf("-"))
      mongoClient.connect()

      switch (split.length) {
        // cannot remove layer 2 elements so skipping
        case 3: { // log input from machine
          await coll.find({id: split[0]}).forEach(machine => machine.logs.forEach((log: LogInput) =>
            log.id == id ? callback(log) : undefined
          ))
          break;
        }
        case 4: { // sub log from log input of machine
          await coll.find({id: split[0]}).forEach(machine => machine.logs.forEach((log: LogInput) => 
            log.id == from ? log.logs.forEach((subLog: LogInput) => 
              subLog.id == id ? callback(subLog) : undefined) 
            : undefined
          ))
          break;
        }
      }
    })

    socket.on('remove-entry', async entry => {
      const split = entry.id.split('-')
      const removeFrom = String(entry.id).substring(0, String(entry.id).lastIndexOf("-"))
    
      sendSidebarUpdateByID(new StructuredUpdate(entry.id, true))

      switch (split.length) {
        case 1: { // remove machine
          await coll.deleteOne({id: split[0]})
          break;
        }
        // cannot remove layer 2 elements so skipping
        case 3: { // remove log input from machine
          await coll.findOneAndUpdate({id: split[0]}, 
                                      {$pull: {'logs': entry}})
          break;
        }
        case 4: { // remove sub log from log input of machine
          await coll.findOneAndUpdate({id: split[0]}, 
                                    { $pull : { 'logs.$[log].logs' : entry }}, 
                                    { arrayFilters : [{ 'log.id' : removeFrom}]});
          break;
        }
      }
    })

    socket.on('machine-upsert', machine => {
      machine.id = fixId(machine.id)
      mongoClient.connect()
      const query = { id: machine.id };
      const update = { $set: machine };
      const options = { upsert: true };
      coll.updateOne(query, update, options);

      setTimeout(() => sendSidebarUpdateByID(new StructuredUpdate(machine.id, false)), 2)
    })

    socket.on('append-log', async logInput => {  // submit of log input to machine with {machineId: LogInput}
      let appendTo = String(logInput.id).substring(0, String(logInput.id).lastIndexOf("-"))
      let split = logInput.id.split('-')

      let oldLog;
      let oldSubLog;

      mongoClient.connect()
      if (split.length == 3) {
        await coll.find({id: split[0]}).forEach((machine: any) => machine.logs.forEach((log: LogInput) => {
          if (log.id == logInput.id) {
            oldLog = log;
            logInput.logs = log.logs;
          } // fetch sub points so we dont need the client to always know about them
        }))
        // upsert the log input
        await coll.findOneAndUpdate({id: split[0]}, 
                                    {$pull: {'logs': oldLog}})
        await coll.findOneAndUpdate({id: split[0]}, 
                                    {$push: {'logs': logInput}})
      }
      if (split.length == 4) {
        // upsert the sub log
        await coll.find({id: split[0]}).forEach((machine: any) => machine.logs.forEach((log: LogInput) => {
          if (log.id == appendTo) log.logs.forEach((subLog: LogInput) => 
            subLog.id == logInput.id ? (oldSubLog = subLog) : undefined)
        }))
        await coll.findOneAndUpdate({id: split[0], 'logs.id': appendTo}, 
                                    { $pull : { 'logs.$[log].logs' : oldSubLog }}, 
                                    { arrayFilters : [{ 'log.id' : appendTo}]});
        await coll.findOneAndUpdate({id: split[0], 'logs.id': appendTo}, 
                                    { $push : { 'logs.$[log].logs' : logInput }}, 
                                    { arrayFilters : [{ 'log.id' : appendTo}]})
      }

      setTimeout(() => sendSidebarUpdateByID(new StructuredUpdate(logInput.id, false)), 2)

    })

    socket.on('log', arg => {
      console.log(arg)
    })

    socket.on("disconnect", _ => {
      console.log("socket disconnect:", socket.id);
      if (subscription!= undefined) { subscription.terminate(); subscription = undefined };
      if (session     != undefined) { session.close(); session = undefined };
      if (OPCClient      != undefined) {OPCClient.disconnect(); OPCClient = undefined };
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
    });

    socket.on("subscribe-display", async (arg, callback) => {
      let displayData = await getDisplayData(arg);
      if (displayData == null || displayData.endpoint == null || displayData.nodeAddress == null) { socket.emit('alert', 'No display for '+arg); return};
      const endpointUrl = decodeURIComponent(displayData.endpoint);
      const baseNode = decodeURIComponent(displayData.nodeAddress);
      const nss = baseNode.substring(0, baseNode.lastIndexOf("=") + 1);
      OPCClient = OPCUAClient.create({ endpointMustExist: false });
      let terminated: boolean = false;
      OPCClient.on("backoff", (retry: number, delay: number) => {
        console.log(
          " cannot connect to endpoint retry = ",
          retry,
          " next attempt in ",
          delay / 1000,
          "seconds"
        );
        socket.emit('alert', 'Error on OPCUA OPCClient initialization on server side, are you sure you have a connection route to the destination?')
        socket.emit("subscribe-update", undefined); // to reomve the loading bar
        console.log('OPCUA OPCClient terminated for', socket.id)
        subscription?.terminate();
        if (OPCClient  != undefined) OPCClient.disconnect();
        terminated = true;
      });

      if (terminated) return;

      try {
        await OPCClient.connect(endpointUrl);
        session = await OPCClient.createSession({
          userName: decodeURIComponent(displayData.username),
          password: decodeURIComponent(displayData.password),
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
          if (OPCClient      != undefined) OPCClient.disconnect();
          subscription = undefined;
          session = undefined;
          OPCClient = undefined;
          console.log("OPCUA OPCClient disconnect", socket.id);
          socket.emit("alert", "OPCUA OPCClient disconnect", socket.id);
        });
      } catch (err: any) {
        socket.emit('alert',
          ("An error occured in OPC-UA OPCClient connection "+ socket.id + ' ' +
          err.message)
        );
      }
      if (!terminated) callback("Subscription start for " + arg, socket.id);
      else callback('Unable to connect to OPCUA', socket.id)
    });
  }); 
};