"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSidebar = void 0;
const Machine_1 = require("./Machine");
const MongoDB_1 = require("./MongoDB/MongoDB");
const StructuredDataElement_1 = require("./StructuredData/StructuredDataElement");
const getSidebar = async () => {
    MongoDB_1.mongoClient.connect();
    var sidebar = [];
    await MongoDB_1.coll.find().forEach((machine) => {
        if (machine.belonging != null) {
            if (sidebar.find(elem => elem.name == machine.belonging) == null)
                sidebar.push(new StructuredDataElement_1.StructuredDataElement(machine.belonging, `$divider-` + machine.belonging, '', StructuredDataElement_1.ValueType.folder, [(0, Machine_1.toSidebarData)(machine)]));
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
//# sourceMappingURL=Sidebar.js.map