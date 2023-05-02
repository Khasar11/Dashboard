
import { toSidebarData } from "../Machine";
import { mongoClient, coll } from "../MongoDB/MongoDB";

export enum ValueType {
    'folder',
    'file',
}

export class SidebarData {
    name: string;
    id: string | undefined;
    hover: string;
    type: ValueType;
    data?: SidebarData[];

    constructor(name: string, id: string | undefined, hover: string, type: ValueType, data?: SidebarData[]) {
        this.name = name;
        this.id = id;
        this.hover = hover;
        this.type = type;
        this.data = data;
    }
}

export const getSidebar = async () => {

    mongoClient.connect()

    var sidebar: SidebarData[] = []
    await coll.find().forEach((machine: any) => {
        if (machine.belonging != null ) {
            if (sidebar.find(elem => elem.name == machine.belonging) == null)
                sidebar.push(
                    new SidebarData(
                        machine.belonging, 
                        `$divider-`+machine.belonging, 
                        '', 
                        ValueType.folder, 
                        [toSidebarData(machine)]
                        )
                    )
            else 
                sidebar[sidebar.findIndex(elem => elem.name == machine.belonging)]
                    .data?.push(toSidebarData(machine))
        } else sidebar.push(toSidebarData(machine));
    })
    
    return sidebar
}
