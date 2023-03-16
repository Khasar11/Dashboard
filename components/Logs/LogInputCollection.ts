import { SidebarData, ValueType } from "../Sidebar/sidebar";
import { LogInput } from "./LogInput";

export class LogInputCollection {
    date: string = '';
    id: string = '';
    logs: (LogInput[] | LogInput);

    constructor(id: string, date: string, logs: (LogInput[] | LogInput)) {
        this.date = date;
        this.logs = logs;
        this.id = id;
    }

    toSidebarData() {
        if (Array.isArray(this.logs))
            return new SidebarData(
                this.date, 
                this.id, 
                this.id, 
                ValueType.folder, 
                logInputsToSidebarData(this.logs))
        return this.logs.toSidebarData();
    }
}

function logInputsToSidebarData(logs: (LogInput[] | LogInput)): SidebarData[] {
    if (Array.isArray(logs)) {
        let data: SidebarData[] = [];
        logs.forEach(element => {
            data.push(element.toSidebarData())
        });
        return data;
    }
    return [logs.toSidebarData()];
}