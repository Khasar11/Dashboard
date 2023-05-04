
export enum ValueType {
    'folder',
    'file',
}

export class StructuredDataElement {
    name: string;
    id: string | undefined;
    hover: string;
    type: ValueType;
    data?: StructuredDataElement[];

    constructor(name: string, id: string | undefined, hover: string, type: ValueType, data?: StructuredDataElement[]) {
        this.name = name;
        this.id = id;
        this.hover = hover;
        this.type = type;
        this.data = data;
    }
}
