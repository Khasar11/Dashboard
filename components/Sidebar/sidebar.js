"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSidebar = exports.ValueType = exports.SidebarUpdate = exports.SidebarUpdateObject = exports.SidebarData = void 0;
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
class SidebarUpdateObject {
    constructor(data, remove) {
        this.remove = false;
        this.remove = remove;
        this.data = data;
    }
}
exports.SidebarUpdateObject = SidebarUpdateObject;
class SidebarUpdate {
    constructor(id, remove) {
        this.remove = false;
        this.id = id;
        this.remove = remove;
    }
}
exports.SidebarUpdate = SidebarUpdate;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
const getSidebar = async () => {
    MongoDB_1.mongoClient.connect();
    var sidebar = [];
    await MongoDB_1.coll.find().forEach((e) => {
        sidebar.push((0, Machine_1.toSidebarData)(e));
    });
    return sidebar;
};
exports.getSidebar = getSidebar;
//# sourceMappingURL=sidebar.js.map