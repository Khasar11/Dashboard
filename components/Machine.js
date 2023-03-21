"use strict";
exports.__esModule = true;
exports.toSidebarData = exports.Machine = void 0;
var LogInputCollection_1 = require("./Logs/LogInputCollection");
var sidebar_1 = require("./Sidebar/sidebar");
var Machine = /** @class */ (function () {
    function Machine(name, id, createdBy, creationDate, logs) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
    }
    return Machine;
}());
exports.Machine = Machine;
function toSidebarData(machine) {
    var logData = [];
    machine.logs.forEach(function (element) {
        if (element != null) {
            var collect = new LogInputCollection_1.LogInputCollection(element.id, element.date, element.logs).toSidebarData();
            logData.push(collect);
        }
    });
    return new sidebar_1.SidebarData(machine.name, machine.id, machine.creationDate, sidebar_1.ValueType.folder, [
        new sidebar_1.SidebarData('OEE', machine.id + '-oee', '', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Display', machine.id + '-display', '', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Logs', machine.id + '-logs', 'Log inputs', sidebar_1.ValueType.folder, logData)
    ]);
}
exports.toSidebarData = toSidebarData;
