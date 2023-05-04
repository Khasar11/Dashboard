import { LogInput } from "../Logs/LogInput";
import { StructuredDataElement, ValueType } from "../StructuredData/StructuredDataElement";

export class Machine {

    name: string;
    id: string;
    createdBy: string;
    creationDate: Date;
    logs: LogInput[];
    belonging: string | undefined;

    constructor(name: string, id: string, createdBy: string, creationDate: Date, logs: LogInput[], belonging: string | undefined) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
        this.belonging = belonging;
    }
}

export const toSidebarData = (machine: Machine) => {
    let logData: StructuredDataElement[] = [];
    machine.logs.forEach(element => {
        if (element != null) {
            let collect = new LogInput(element.id, element.data, element.date, element.header, element.writtenBy, element.logs).toSidebarData()
            logData.push(collect)
        }
    });

    return new StructuredDataElement(machine.name, machine.id, new Date(machine.creationDate).toDateString() + ' | ' + machine.createdBy, ValueType.folder,
        [
            new StructuredDataElement('Files', machine.id+'-files', 'File storage', ValueType.file),
            new StructuredDataElement('OEE', machine.id+'-oee', 'OEE data', ValueType.file),
            new StructuredDataElement('Display', machine.id+'-display', 'Display OPCUA subscription', ValueType.file),
            new StructuredDataElement('Logs', machine.id+'-logs', 'Log inputs', ValueType.folder, logData)
        ]);
}