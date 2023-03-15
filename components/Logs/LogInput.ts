
export class LogInput {
    id: string;
    data: string;
    date: Date;
    header: string;
    writtenBy: string;

    constructor(id: string, date: Date, header: string, writtenBy: string, data: string) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }
}

export function fetchLogInput(id: string) {
    return null
}
