const express = require('express');
const sidebar = require('./components/Sidebar/sidebar');
const display = require('./components/Display/Display');
const logInput = require('./components/Logs/LogInput');
const mongoDB = require('./components/MongoDB/MongoDB');
const app = express();
const port = 8383;

app.use(express.static('public'));
app.use(express.json());

app.get('/sidebar', (req, res) => {
    const sidebarPromise = Promise.resolve(sidebar.getSidebar());
    sidebarPromise.then((value) => {
      res.status(200).json(value)
    });
});

app.get('/display/:dynamic', async (req, res) => {
    const {dynamic} = req.params;
    res.status(200).json(await display.getDisplay(dynamic))
});

app.get('/logs/:dynamic', async (req, res) => {
    const {dynamic} = req.params;

    let split = dynamic.split('-')
    
    let done = false

    mongoDB.client.connect()
    await mongoDB.coll.find({id: split[0]}).forEach(element => 
        element.logs.forEach(log => {
            if (log != null && split[0]+'-'+split[1]+'-'+split[2] == log.id) {
                if (Array.isArray(log.logs))
                    log.logs.forEach(subLog => {
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
    let {dynamic} = req.params;
    res.status(200).json({'id': dynamic.replaceAll('-', '_')})
});

app.post('/logupsert', async (req, res) => { // submit of log input to machine with {machineId: LogInput}
    console.log('logupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))
    let appendTo = String(parsed.id).substring(0, String(parsed.id).lastIndexOf("-"))
    let split = parsed.id.split('-')

    console.log(parsed)
    mongoDB.client.connect()

    let written = false

    await mongoDB.coll.find({id: split[0]}).forEach(element => 
        element.logs.forEach(log => {
            if (log != null && split[0]+'-'+split[1]+'-'+split[2] == log.id) {
                if (!Array.isArray(log.logs)) {
                    console.log('update sub log non array')
                    let query = { id: parsed.id.split('-')[0], 'logs.id': appendTo };
                    let update = { $set: {'logs.$.logs': parsed}}
                    let options = { upsert: true };
                    mongoDB.coll.updateOne(query, update, options);
                    written = true
                } else {
                    console.log('update sub log array')
                    log.logs.forEach(subLog => { 
                        if (subLog != null && split[0]+'-'+split[1]+'-'+split[2]+'-'+split[3] == subLog.id) {
                            mongoDB.coll.findOneAndUpdate({id:split[0]}, 
                                { $pull : { 'logs.$[log].logs' : subLog }}, 
                                { arrayFilters : [{ 'log.id' : split[0]+'-'+split[1]+'-'+split[2] }], new : true });
                            mongoDB.coll.findOneAndUpdate({id:split[0]}, 
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
        console.log('write')
        mongoDB.coll.updateOne(query, update, options);
    }
});

app.post('/logcolupsert', (req, res) => { // submitting of log collection {LogInputCollection}
    console.log('logcolupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))

    mongoDB.client.connect()
    
    const query = { id: parsed.id.split('-')[0] };
    const update = { $push: {logs: parsed}}
    const options = { upsert: true };
    mongoDB.coll.updateOne(query, update, options);
});

app.post('/machineupsert/', (req, res) => { // submit of machine {Machine}
    console.log('machineupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))
    mongoDB.client.connect()
    
    const query = { id: parsed.id };
    const update = { $set: parsed };
    const options = { upsert: true };
    mongoDB.coll.updateOne(query, update, options);
});

app.post('/removeentry/', (req, res) => { // submit of machine {Machine}
    console.log('removeentry')
    let parsed = JSON.parse(JSON.stringify(req.body))

    mongoDB.client.connect()
    const split = parsed.id.split('-') // 1 len = top level, 2 len = loginputcollection level, 3 len = loginput level
    let query;

    switch (split.length) {
        case 1: { // machine deleted
            query = { id: split[0] };
            mongoDB.coll.deleteOne(query)
            return;
        }
        case 3: { // log collection removed folder type
            mongoDB.coll.find({id: split[0]}).forEach(element =>
                element.logs.forEach(log => {
                    if (log != null && log.logs != null ) {
                        if (Array.isArray(log.logs)) {
                            if (log.id == parsed.id) {
                                mongoDB.coll.updateOne(
                                    {id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]},
                                    {$unset: {'logs.$' : log.logs}}, false, true)
                                return;
            }}}}))
            return;
        }
        case 4: { // log collection/singular log input deleted
            mongoDB.coll.find({id: split[0]}).forEach(element =>
                element.logs.forEach(log => {
                    if (log != null && log.logs != null ) {
                        if (!Array.isArray(log.logs)) {
                            if (log.logs.id == parsed.id) {
                                mongoDB.coll.updateOne(
                                    {id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]},
                                    {$unset: {'logs.$' : log.logs}}, false, true)
                                return;
                            }
                            return;
                        }
                        let toRemove = log.logs.filter(x => x!= null && x.id == parsed.id)
                        mongoDB.coll.findOneAndUpdate({id:split[0], 'logs.id': split[0]+'-'+split[1]+'-'+split[2]}, 
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

app.listen(port, () => {
    console.log('NodeJS startup')
});

//display.displayTest()