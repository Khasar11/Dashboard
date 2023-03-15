import { SidebarData, ValueType } from "../Sidebar/sidebar";
import { LogInput } from "./LogInput";

export class LogInputCollection {
    date: string;
    id: string;
    logs: LogInput[];

    constructor(id: string, date: string, logs: LogInput[]) {
        this.date = date;
        this.logs = logs;
        this.id = id;
    }

    toSidebarData() {
        return new SidebarData(
            String(this.date).split('T')[0], 
            this.id, 
            ValueType.folder, 
            logInputSetToSidebarData(this.logs))
    }
}

function logInputSetToSidebarData(logs: LogInput[]) {
    let data: SidebarData[] = [];
    logs.forEach(element => {
        data.push(element.toSidebarData())
    });
    return data;
}