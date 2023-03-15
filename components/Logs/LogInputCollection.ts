import { LogInput } from "./LogInput";

export class LogInputCollection {
    date: Date;
    id: string;
    logs: Set<LogInput>;

    constructor(id: string, date: Date, logs: Set<LogInput>) {
        this.date = date;
        this.logs = logs;
        this.id = id;
    }
}