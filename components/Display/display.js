"use strict";
exports.__esModule = true;
var Link_1 = require("./Link");
var NodeObject_1 = require("./NodeObject");
var Display = /** @class */ (function () {
    function Display(links, nodeObjects) {
        this.links = links;
        this.nodeObjects = nodeObjects;
    }
    return Display;
}());
var display = new Display([
    new Link_1.Link(0, 1),
    new Link_1.Link(1, 2)
], [
    new NodeObject_1.NodeObject('key1', 'true'),
    new NodeObject_1.NodeObject('key2', 'value2'),
    new NodeObject_1.NodeObject('key3', 'value3')
]);
module.exports = {
    getDisplay: function (from) {
        return from == 'knuser' ? new Display([
            new Link_1.Link(0, 1),
            new Link_1.Link(1, 2)
        ], [
            new NodeObject_1.NodeObject('key1', 'true'),
            new NodeObject_1.NodeObject('key2', 'value2'),
            new NodeObject_1.NodeObject('key3', 'value3')
        ]) : new Display([
            new Link_1.Link(0, 1),
            new Link_1.Link(1, 2),
            new Link_1.Link(2, 0)
        ], [
            new NodeObject_1.NodeObject('key4', 'true'),
            new NodeObject_1.NodeObject('key5', '1231'),
            new NodeObject_1.NodeObject('key6', 'false')
        ]);
    }
};
