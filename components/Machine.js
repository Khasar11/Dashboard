"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSidebarData = exports.Machine = void 0;
const LogInput_1 = require("./Logs/LogInput");
const sidebar_1 = require("./Sidebar/sidebar");
class Machine {
    constructor(name, id, createdBy, creationDate, logs, belonging) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
        this.belonging = belonging;
    }
}
exports.Machine = Machine;
const toSidebarData = (machine) => {
    let logData = [];
    machine.logs.forEach(element => {
        if (element != null) {
            let collect = new LogInput_1.LogInput(element.id, element.data, element.date, element.header, element.writtenBy, element.logs).toSidebarData();
            logData.push(collect);
        }
    });
    return new sidebar_1.SidebarData(machine.name, machine.id, new Date(machine.creationDate).toDateString() + ' | ' + machine.createdBy, sidebar_1.ValueType.folder, [
        new sidebar_1.SidebarData('OEE', machine.id + '-oee', 'OEE data', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Display', machine.id + '-display', 'Display OPCUA subscription', sidebar_1.ValueType.file),
        new sidebar_1.SidebarData('Logs', machine.id + '-logs', 'Log inputs', sidebar_1.ValueType.folder, logData)
    ]);
};
exports.toSidebarData = toSidebarData;
//# sourceMappingURL=Machine.js.map