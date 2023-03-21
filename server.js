const express = require('express');
const sidebar = require('./components/Sidebar/sidebar');
const display = require('./components/Display/display');
const logInput = require('./components/Logs/LogInput');
const mongoDB = require('./components/MongoDB/MongoDB');
const LZUTF8 = require('lzutf8');
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

app.get('/display/:dynamic', (req, res) => {
    const {dynamic} = req.params;
    res.status(200).json(display.getDisplay(dynamic))
});

app.get('/logs/:dynamic', (req, res) => {
    const {dynamic} = req.params;
    res.status(200).json(logInput.fetchLogInput(dynamic))
});

app.get('/idfy/:dynamic', (req, res) => {
    let {dynamic} = req.params;
    res.status(200).json({'id': dynamic.replaceAll('-', '_')})
});

app.post('/logupsert', (req, res) => { // submit of log input to machine with {machineId: LogInput}
    console.log('logupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))
    console.log(parsed)
});

app.post('/logcolupsert', (req, res) => { // submitting of log collection {LogInputCollection}
    console.log('logcolupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))
    console.log(parsed)

    mongoDB.client.connect()
    
    const query = { id: parsed.id.split('-')[0] };
    const update = { $push: {logs: parsed}}
    const options = { upsert: true };
    mongoDB.coll.updateOne(query, update, options);
});

app.post('/machineupsert/', (req, res) => { // submit of machine {Machine}
    console.log('machineupsert')
    let parsed = JSON.parse(JSON.stringify(req.body))
    console.log(parsed)
    mongoDB.client.connect()
    
    const query = { id: parsed.id };
    const update = { $set: parsed };
    const options = { upsert: true };
    mongoDB.coll.updateOne(query, update, options);
});

app.post('/removeentry/', (req, res) => { // submit of machine {Machine}
    console.log('removeentry')
    let parsed = JSON.parse(JSON.stringify(req.body))
    console.log(parsed)

    mongoDB.client.connect()
    
    const query = { id: parsed.id };
    mongoDB.coll.deleteOne(query);
});

app.listen(port, () => {
    console.log('NodeJS startup')
});
