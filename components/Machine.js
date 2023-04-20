"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSidebarData = exports.Machine = void 0;
const LogInputCollection_1 = require("./Logs/LogInputCollection");
const sidebar_1 = require("./Sidebar/sidebar");
class Machine {
    constructor(name, id, createdBy, creationDate, logs) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
    }
}
exports.Machine = Machine;
const toSidebarData = (machine) => {
    let logData = [];
    machine.logs.forEach(element => {
        if (element != null) {
            let collect = new LogInputCollection_1.LogInputCollection(element.id, element.date, element.logs).toSidebarData();
            logData.push(collect);
        }
    });
    return new sidebar_1.SidebarData(machine.name, machine.id, machine.creationDate, sidebar_1.ValueType.folder, [
        new sidebar_1.SidebarData('OEE', machine.id + '-oee', '', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Display', machine.id + '-display', '', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Logs', machine.id + '-logs', 'Log inputs', sidebar_1.ValueType.folder, logData)
    ]);
};
exports.toSidebarData = toSidebarData;
//# sourceMappingURL=Machine.js.map