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
        return new LogInput(this.logs.id, this.logs.data, this.logs.date, this.logs.header, this.logs.writtenBy).toSidebarData();
    }
}

function logInputsToSidebarData(logs: (LogInput[] | LogInput)): SidebarData[] {
    if (Array.isArray(logs)) {
        let data: SidebarData[] = [];
        logs.filter(e => e!=null).forEach(element => {
            data.push(new LogInput(element.id, element.data, element.date, element.header, element.writtenBy).toSidebarData())
        });
        return data;
    }
    return [logs.toSidebarData()];
}