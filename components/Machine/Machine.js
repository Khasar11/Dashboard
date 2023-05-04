"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSidebarData = exports.Machine = void 0;
const LogInput_1 = require("../Logs/LogInput");
const StructuredDataElement_1 = require("../StructuredData/StructuredDataElement");
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
    return new StructuredDataElement_1.StructuredDataElement(machine.name, machine.id, new Date(machine.creationDate).toDateString() + ' | ' + machine.createdBy, StructuredDataElement_1.ValueType.folder, [
        new StructuredDataElement_1.StructuredDataElement('Files', machine.id + '-files', 'File storage', StructuredDataElement_1.ValueType.file),
        new StructuredDataElement_1.StructuredDataElement('OEE', machine.id + '-oee', 'OEE data', StructuredDataElement_1.ValueType.file),
        new StructuredDataElement_1.StructuredDataElement('Display', machine.id + '-display', 'Display OPCUA subscription', StructuredDataElement_1.ValueType.file),
        new StructuredDataElement_1.StructuredDataElement('Logs', machine.id + '-logs', 'Log inputs', StructuredDataElement_1.ValueType.folder, logData)
    ]);
};
exports.toSidebarData = toSidebarData;
//# sourceMappingURL=Machine.js.map