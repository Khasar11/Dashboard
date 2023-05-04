
import { StructuredDataElement, ValueType } from "../StructuredData/StructuredDataElement";

export class LogInput {
    id: string;
    data: string;
    date: Date;
    header: string;
    writtenBy: string;
    logs: LogInput[];

    constructor(id: string,  data: string, date: Date, header: string, writtenBy: string, logs: LogInput[]) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
        this.logs = logs;
    }

    toSidebarData() {
        let data = new StructuredDataElement(
            new Date(this.date).toDateString(),
            this.id, 
            this.header, 
            this.logs.length == 0 ? ValueType.file : ValueType.folder, /* file == 0 folder == 1 */
            []);
        this.logs.forEach(sl => { // dont understand why i have to manually insert it like this
            data.data?.push(new LogInput(sl.id,sl.data,sl.date,sl.header,sl.writtenBy,sl.logs).toSidebarData())
        })
        return data;
    }
}