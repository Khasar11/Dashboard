"use strict";
exports.__esModule = true;
exports.LogInputCollection = void 0;
var sidebar_1 = require("../Sidebar/sidebar");
var LogInputCollection = /** @class */ (function () {
    function LogInputCollection(id, date, logs) {
        this.date = '';
        this.id = '';
        this.date = date;
        this.logs = logs;
        this.id = id;
    }
    LogInputCollection.prototype.toSidebarData = function () {
        if (Array.isArray(this.logs))
            return new sidebar_1.SidebarData(this.date, this.id, this.id, sidebar_1.ValueType.folder, logInputsToSidebarData(this.logs));
        return this.logs.toSidebarData();
    };
    return LogInputCollection;
}());
exports.LogInputCollection = LogInputCollection;
function logInputsToSidebarData(logs) {
    if (Array.isArray(logs)) {
        var data_1 = [];
        logs.forEach(function (element) {
            data_1.push(element.toSidebarData());
        });
        return data_1;
    }
    return [logs.toSidebarData()];
}
