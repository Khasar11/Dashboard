
import { Bindings } from './Bindings';
import { Link } from './Link';
import { NodeObject } from './NodeObject';

class Display {
    bindings: Bindings;
    links: Link[];
    nodeObjects: NodeObject[];

    constructor(bindings: Bindings, links: Link[], nodeObjects: NodeObject[]) {
        this.links = links;
        this.nodeObjects = nodeObjects;
        this.bindings = bindings;
    }
}

export async function getDisplay(from: string) {
    
}