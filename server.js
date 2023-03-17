const express = require('express');
const sidebar = require('./components/Sidebar/sidebar');
const display = require('./components/Display/display');
const logInput = require('./components/Logs/LogInput');
const mongoDB = require('./components/MongoDB/MongoDB');
const app = express();
const port = 8383;

app.use(express.static('public'));

app.get('/sidebar', (req, res) => {
    res.status(200).json(sidebar.getSidebar())
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

app.listen(port, () => {
    console.log('NodeJS startup')
});


