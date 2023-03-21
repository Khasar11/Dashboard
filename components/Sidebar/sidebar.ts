
import { Machine, toSidebarData } from "../Machine";
import { client, coll } from "../MongoDB/MongoDB";

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

export async function getSidebar() {

    client.connect()

    var sidebar: SidebarData[] = []

    await coll.find().forEach((e: Machine) => {
        sidebar.push(toSidebarData(e))
    })
    
    return sidebar
}
