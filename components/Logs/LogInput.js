"use strict";
exports.__esModule = true;
exports.upsertLogInput = exports.fetchLogInput = exports.LogInput = void 0;
var MongoDB_1 = require("../MongoDB/MongoDB");
var sidebar_1 = require("../Sidebar/sidebar");
var db = MongoDB_1.client.db("maskintest");
var logs = db.collection("logs");
var LogInput = /** @class */ (function () {
    function LogInput(id, data, date, header, writtenBy) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }
    LogInput.prototype.toSidebarData = function () {
        return new sidebar_1.SidebarData(String(this.date).split('T')[0], this.id, sidebar_1.ValueType.file, undefined);
    };
    return LogInput;
}());
exports.LogInput = LogInput;
function fetchLogInput(id) {
    MongoDB_1.client.connect();
    return new LogInput('undefined', 'undefined', 'undefined', 'undefined', 'undefined');
}
exports.fetchLogInput = fetchLogInput;
function upsertLogInput(log) {
    var update = { $set: { id: log.id } };
    var options = { upsert: true };
    logs.updateOne(log, update, options);
}
exports.upsertLogInput = upsertLogInput;
