
import { Link } from './Link';
import { NodeObject } from './NodeObject';

class Display {
    links: Link[];
    nodeObjects: NodeObject[];

    constructor(links: Link[], nodeObjects: NodeObject[]) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
}

let display = new Display(
    [
        new Link(0,1), 
        new Link(1,2)
    ], 
    [
        new NodeObject('key1', 'true'), 
        new NodeObject('key2', 'value2'), 
        new NodeObject('key3', 'value3')
    ]
)

module.exports = {
    getDisplay: function(from: string) {
        return from == 'knuser' ? new Display(
            [
                new Link(0,1), 
                new Link(1,2)
            ], 
            [
                new NodeObject('key1', 'true'), 
                new NodeObject('key2', 'value2'), 
                new NodeObject('key3', 'value3')
            ]
        ) : new Display(
            [
                new Link(0,1), 
                new Link(1,2),
                new Link(2,0)
            ], 
            [
                new NodeObject('key4', 'true'), 
                new NodeObject('key5', '1231'), 
                new NodeObject('key6', 'false')
            ]
        );
    }
}
