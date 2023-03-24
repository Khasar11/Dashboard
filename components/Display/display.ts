
import { Bindings } from './Bindings';
import { Link } from './Link';
import { NodeObject } from './NodeObject';

class Display {
    links: Link[];
    nodeObjects: NodeObject[];
    bindings: Bindings;

    constructor(links: Link[], nodeObjects: NodeObject[], bindings: Bindings) {
        this.links = links;
        this.nodeObjects = nodeObjects;
        this.bindings = bindings;
    }
}

export async function getDisplay(from: string) {
    
}