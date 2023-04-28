import { LogInput } from "./Logs/LogInput";
import { SidebarData, ValueType } from "./Sidebar/sidebar";

export class Machine {

    name: string;
    id: string;
    createdBy: string;
    creationDate: Date;
    logs: LogInput[];

    constructor(name: string, id: string, createdBy: string, creationDate: Date, logs: LogInput[]) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
    }
}

export const toSidebarData = (machine: Machine) => {

    let logData: SidebarData[] = [];

    machine.logs.forEach(element => {
        if (element != null) {
            let collect = new LogInput(element.id, element.data, element.date, element.header, element.writtenBy, element.logs).toSidebarData()
            logData.push(collect)
        }
    });

    return new SidebarData(machine.name, machine.id, new Date(machine.creationDate).toDateString() + ' | ' + machine.createdBy, ValueType.folder,
        [
            new SidebarData('OEE', machine.id+'-oee', 'OEE data', ValueType.file),
            new SidebarData('Display', machine.id+'-display', 'Display OPCUA subscription', ValueType.file),
            new SidebarData('Logs', machine.id+'-logs', 'Log inputs', ValueType.folder, logData)
        ]);
}