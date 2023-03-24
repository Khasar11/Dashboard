
import { SidebarData, ValueType } from "../Sidebar/sidebar";

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
        return new SidebarData(
            String(this.date).split('T')[0],
             this.id, 
             this.header, 
             ValueType.file, 
             undefined);
    }
}