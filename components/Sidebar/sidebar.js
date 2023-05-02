"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSidebar = exports.SidebarData = exports.ValueType = void 0;
const Machine_1 = require("../Machine");
const MongoDB_1 = require("../MongoDB/MongoDB");
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
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
const getSidebar = async () => {
    MongoDB_1.mongoClient.connect();
    var sidebar = [];
    await MongoDB_1.coll.find().forEach((machine) => {
        if (machine.belonging != null) {
            if (sidebar.find(elem => elem.name == machine.belonging) == null)
                sidebar.push(new SidebarData(machine.belonging, `$divider-` + machine.belonging, '', ValueType.folder, [(0, Machine_1.toSidebarData)(machine)]));
            else
                sidebar[sidebar.findIndex(elem => elem.name == machine.belonging)]
                    .data?.push((0, Machine_1.toSidebarData)(machine));
        }
        else
            sidebar.push((0, Machine_1.toSidebarData)(machine));
    });
    return sidebar;
};
exports.getSidebar = getSidebar;
//# sourceMappingURL=sidebar.js.map