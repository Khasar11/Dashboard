import path from "path";
import { app, port, server } from "../server";
import { getSidebar } from "../components/Sidebar/sidebar";
import { client, coll } from "../components/MongoDB/MongoDB";
import { getDisplayData, setDisplayData } from "../components/Display/Display";

export const initApp = () => {
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/index.html'));
    });
    
    server.listen(port, () => {
        console.log('listening on '+port);
    });

    app.get('/sidebar', (req, res) => {
        const sidebarPromise = Promise.resolve(getSidebar());
        sidebarPromise.then((value) => {
          res.status(200).json(value)
        });
    });
    
    app.get('/displayData/:dynamic', async (req, res) => {
        const {dynamic} = req.params;
        res.status(200).json(await getDisplayData(dynamic)) // {dynamic} = id to get display data from
    })
    
    app.get('/writeDisplayData/:dynamic', (req, res) => {
        const {dynamic} = req.params;
        res.status(200).json(setDisplayData(JSON.parse(dynamic))) 
        // {dynamic} = data object to set $.$ to
        // containing id, endpoint, nodeAddress fields
    })
    
    app.get('/logs/:dynamic', async (req, res) => {
        const {dynamic} = req.params;
        let split = dynamic.split('-')
        let done = false
    
        client.connect()
        await coll.find({id: split[0]}).forEach((element: { logs: any[]; }) => 
            element.logs.forEach(log => {
                if (log != null && split[0]+'-'+split[1]+'-'+split[2] == log.id) {
                    if (Array.isArray(log.logs))
                        log.logs.forEach((subLog: { id: string; } | null) => {
                            if (subLog != null && split[0]+'-'+split[1]+'-'+split[2]+'-'+split[3] == subLog.id) {
                                if (!done)
                                    res.status(200).json(subLog)
                                done = true
                            }
                        })
                    if (!done)
                        res.status(200).json(log.logs)
                }   
            })
        )
    });
    
    app.get('/idfy/:dynamic', (req, res) => {
        let dynamic = req.params;
        let rep = String(dynamic).replaceAll('-', '_')
        res.status(200).json({'id': rep})
    });
    
    app.post('/logupsert', async (req, res) => { // submit of log input to machine with {machineId: LogInput}
        let parsed = JSON.parse(JSON.stringify(req.body))
        let appendTo = String(parsed.id).substring(0, String(parsed.id).lastIndexOf("-"))
        let split = parsed.id.split('-')
    
        client.connect()
    
        let written = false
    
        await coll.find({id: split[0]}).forEach((element: { logs: any[]; }) => 
            element.logs.forEach(log => {
                if (log != null && split[0]+'-'+split[1]+'-'+split[2] == log.id) {
                    if (!Array.isArray(log.logs)) {
                        let query = { id: parsed.id.split('-')[0], 'logs.id': appendTo };
                        let update = { $set: {'logs.$.logs': parsed}}
                        let options = { upsert: true };
                        coll.updateOne(query, update, options);
                        written = true
                    } else {
                        log.logs.forEach((subLog: { id: string; } | null) => { 
                            if (subLog != null && split[0]+'-'+split[1]+'-'+split[2]+'-'+split[3] == subLog.id) {
                                coll.findOneAndUpdate({id:split[0]}, 
                                    { $pull : { 'logs.$[log].logs' : subLog }}, 
                                    { arrayFilters : [{ 'log.id' : split[0]+'-'+split[1]+'-'+split[2] }], new : true });
                                coll.findOneAndUpdate({id:split[0]}, 
                                    { $push : { 'logs.$[log].logs' : parsed }}, 
                                    { arrayFilters : [{ 'log.id' : split[0]+'-'+split[1]+'-'+split[2] }], new : true });
                                written = true
                            }
                        })
                    }
                }   
            })
        )
    
        const query = { id: parsed.id.split('-')[0], 'logs.id': appendTo };
        const update = { $push: {'logs.$.logs': parsed}}
        const options = { upsert: true };
        if (!written) {
            coll.updateOne(query, update, options);
        }
    });
    
    app.post('/logcolupsert', (req, res) => { // submitting of log collection {LogInputCollection}
        let parsed = JSON.parse(JSON.stringify(req.body))
    
        client.connect()
        
        const query = { id: parsed.id.split('-')[0] };
        const update = { $push: {logs: parsed}}
        const options = { upsert: true };
        coll.updateOne(query, update, options);
    });
    
    app.post('/machineupsert/', (req, res) => { // submit of machine {Machine}
        let parsed = JSON.parse(JSON.stringify(req.body))
        client.connect()
        
        const query = { id: parsed.id };
        const update = { $set: parsed };
        const options = { upsert: true };
        coll.updateOne(query, update, options);
    });
    
    app.post('/removeentry/', (req, res) => { // submit of machine {Machine}
        let parsed = JSON.parse(JSON.stringify(req.body))
    
        client.connect()
        const split = parsed.id.split('-') // 1 len = top level, 2 len = loginputcollection level, 3 len = loginput level
        let query;
    
        switch (split.length) {
            case 1: { // machine deleted
                query = { id: split[0] };
                coll.deleteOne(query)
                return;
            }
            case 3: { // log collection removed folder type
                coll.find({id: split[0]}).forEach((element: { logs: any[]; }) =>
                    element.logs.forEach(log => {
                        if (log != null && log.logs != null ) {
                            if (Array.isArray(log.logs)) {
                                if (log.id == parsed.id) {
                                    coll.updateOne(
                                        {id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]},
                                        {$unset: {'logs.$' : log.logs}}, false, true)
                                    return;
                }}}}))
                return;
            }
            case 4: { // log collection/singular log input deleted
                coll.find({id: split[0]}).forEach((element: { logs: any[]; }) =>
                    element.logs.forEach(log => {
                        if (log != null && log.logs != null ) {
                            if (!Array.isArray(log.logs)) {
                                if (log.logs.id == parsed.id) {
                                    coll.updateOne(
                                        {id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]},
                                        {$unset: {'logs.$' : log.logs}}, false, true)
                                    return;
                                }
                                return;
                            }
                            let toRemove = log.logs.filter((x: { id: any; } | null) => x!= null && x.id == parsed.id)
                            coll.findOneAndUpdate({id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]}, 
                            { $unset : { 'logs.$[log].logs.$[sublog]' : toRemove }}, 
                            { arrayFilters : [{ 'sublog.id' : parsed.id }, { 'log.id' : split[0]+'-'+split[1]+'-'+split[2] }], new : true });
                            return;
                        }
                        return;
                    })
                )
            }
        }
    });
}