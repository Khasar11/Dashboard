import { LogInput } from "./Logs/LogInput";
import { LogInputCollection } from "./Logs/LogInputCollection";
import { SidebarData, ValueType } from "./Sidebar/sidebar";

export class Machine {

    name: string;
    id: string;
    createdBy: string;
    creationDate: string;
    logs: LogInputCollection[];

    constructor(name: string, id: string, createdBy: string, creationDate: string, logs: LogInputCollection[]) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
    }
}

export function toSidebarData(machine: Machine) {

    let logData: SidebarData[] = [];

    machine.logs.forEach(element => 
        logData.push(element.toSidebarData()));

    return new SidebarData(machine.name, machine.id, machine.creationDate, ValueType.folder,
        [
            new SidebarData('OEE', machine.id+'-oee', '', ValueType.file),
            new SidebarData('Display', machine.id+'-display', '', ValueType.file),
            new SidebarData('Logs', machine.id+'-logs', 'Log inputs', ValueType.folder, logData)
        ]);
}