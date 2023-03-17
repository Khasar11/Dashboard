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
        toSidebarData(new Machine('knuser', 'knuser', 'warben', '2023-03-17', [
        new LogInputCollection('knuser-log-0', '2023-03-16', 
            [new LogInput('knuser-log-0-1', 'yep', '2023-03-15', 'header yep', 'warben'),
            new LogInput('knuser-log-0-2', 'yep2', '2023-03-14', 'header yep2', 'warben'),
            new LogInput('knuser-log-0-3', 'yep2', '2023-03-17', 'header yep2', 'warben')]
            ),
        new LogInputCollection('knuser-log-1', '2023-03-13', 
            new LogInput('knuser-log-1', 'yep', '2023-03-12', 'header yep', 'warben')
            )])), 
        toSidebarData(new Machine('b2', 'b2', 'warben', '2023-03-11', [
        new LogInputCollection('b2-log-0', '2023-03-10', 
            new LogInput('b2-log-0', 'yep b2', '2023-03-09', 'header yep b2', 'warben')
            )]))
        ];
}
