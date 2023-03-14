
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

var logs = [
    new LogInput('knuser-log-0',
    new Date('03 14 2023'), 
    'knuser log 0 title',
    'warben',  
    'aaaaaaaaa')
    /*new LogInput('knuser-log-1',
    new Date('03 12 2023'), 
    'knuser log 1 title',
    'warben', 
    [new LogInput('knuser-log-2',
        new Date('03 13 2023'), 
        'knuser log 2 title',
        'warben', 
        undefined,
        'data in log input')
    ],  
    undefined) */
]

export function fetchLogInput(id: string) {
    return new LogInput('knuser-log-0',
        new Date('03 14 2023'), 
        'knuser log 0 title',
        'warben', 
        'aaaaaaaaa')
}
