import { client } from "../MongoDB/MongoDB";
import { SidebarData, ValueType } from "../Sidebar/sidebar";

const db = client.db("maskintest");
const logs = db.collection("logs");


export class LogInput {
    id: string;
    data: string;
    date: string;
    header: string;
    writtenBy: string;

    constructor(id: string,  data: string, date: string, header: string, writtenBy: string) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }

    toSidebarData() {
        return new SidebarData(String(this.date).split('T')[0], this.id, this.header, ValueType.file, undefined);
    }
}

export function fetchLogInput(id: string) {
    return new LogInput('undefined','undefined', 'undefined', 'undefined', 'undefined');
}

export function upsertLogInput(log: LogInput) {
    /*const update = { $set: { id: log.id }};
    const options = { upsert: true };
    logs.updateOne(log, update, options); */
}

