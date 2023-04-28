
import { Machine, toSidebarData } from "../Machine";
import { mongoClient, coll } from "../MongoDB/MongoDB";

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

function addDays(date: Date, days:number) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

export const getSidebar = async () => {

    mongoClient.connect()

    var sidebar: SidebarData[] = []
    await coll.find().forEach((e: any) => {
        sidebar.push(toSidebarData(e))
    })
    
    return sidebar
}
