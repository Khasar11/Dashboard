import { LogInput } from "../Logs/LogInput";
import { LogInputCollection } from "../Logs/LogInputCollection";
import { Machine, toSidebarData } from "../Machine";

export class SidebarData {
    name: string;
    id: string;
    hover: string;
    type: ValueType;
    data?: SidebarData[];

    constructor(name: string, id: string, hover: string, type: ValueType, data?: SidebarData[]) {
        this.name = name;
        this.id = id;
        this.hover = hover;
        this.type = type;
        this.data = data;
    }
}

export enum ValueType {
    'folder',
    'file',
}

export function getSidebar() {
    return [
        toSidebarData(new Machine('knuser', 'knuser', 'warben', '03/15/2023', [
        new LogInputCollection('knuser-log-0', '01/15/2023', 
            [new LogInput('knuser-log-0-1', 'yep', '03/15/2023', 'header yep', 'warben'),
            new LogInput('knuser-log-0-2', 'yep2', '02/15/2023', 'header yep2', 'warben')]
            ),
        new LogInputCollection('knuser-log-1', '01/15/2023', 
            new LogInput('knuser-log-1-1', 'yep', '03/15/2023', 'header yep', 'warben')
            )])), 
        toSidebarData(new Machine('b2', 'b2', 'warben', '03/15/2023', [
        new LogInputCollection('b2-log-0', '03/15/2023', 
            new LogInput('b2-log-0-1', 'yep b2', '03/15/2023', 'header yep b2', 'warben')
            )]))
        ];
}
