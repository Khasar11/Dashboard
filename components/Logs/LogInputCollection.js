"use strict";
exports.__esModule = true;
exports.LogInputCollection = void 0;
var sidebar_1 = require("../Sidebar/sidebar");
var LogInputCollection = /** @class */ (function () {
    function LogInputCollection(id, date, logs) {
        this.date = date;
        this.logs = logs;
        this.id = id;
    }
    LogInputCollection.prototype.toSidebarData = function () {
        return new sidebar_1.SidebarData(String(this.date).split('T')[0], this.id, sidebar_1.ValueType.folder, logInputSetToSidebarData(this.logs));
    };
    return LogInputCollection;
}());
exports.LogInputCollection = LogInputCollection;
function logInputSetToSidebarData(logs) {
    var data = [];
    logs.forEach(function (element) {
        data.push(element.toSidebarData());
    });
    return data;
}
