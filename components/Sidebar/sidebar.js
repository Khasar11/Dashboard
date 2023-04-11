"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSidebar = exports.ValueType = exports.SidebarData = void 0;
const Machine_1 = require("../Machine");
const MongoDB_1 = require("../MongoDB/MongoDB");
class SidebarData {
    constructor(name, id, hover, type, data) {
        this.name = name;
        this.id = id;
        this.hover = hover;
        this.type = type;
        this.data = data;
    }
}
exports.SidebarData = SidebarData;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
async function getSidebar() {
    MongoDB_1.client.connect();
    var sidebar = [];
    await MongoDB_1.coll.find().forEach((e) => {
        sidebar.push((0, Machine_1.toSidebarData)(e));
    });
    return sidebar;
}
exports.getSidebar = getSidebar;
//# sourceMappingURL=sidebar.js.map