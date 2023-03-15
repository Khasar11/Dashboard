"use strict";
exports.__esModule = true;
exports.getSidebar = exports.ValueType = exports.SidebarData = void 0;
var LogInput_1 = require("../Logs/LogInput");
var LogInputCollection_1 = require("../Logs/LogInputCollection");
var Machine_1 = require("../Machine");
var SidebarData = /** @class */ (function () {
    function SidebarData(name, id, type, data) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.data = data;
    }
    return SidebarData;
}());
exports.SidebarData = SidebarData;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
function getSidebar() {
    return [
        (0, Machine_1.toSidebarData)(new Machine_1.Machine('knuser', 'knuser', 'warben', '03/15/2023', new LogInputCollection_1.LogInputCollection('knuser-log-0', '03/15/2023', [new LogInput_1.LogInput('knuser-log-0-1', 'yep', '03/15/2023', 'header yep', 'warben')]))),
        (0, Machine_1.toSidebarData)(new Machine_1.Machine('b2', 'b2', 'warben', '03/15/2023', new LogInputCollection_1.LogInputCollection('b2-log-0', '03/15/2023', [new LogInput_1.LogInput('b2-log-0-1', 'yep b2', '03/15/2023', 'header yep b2', 'warben')])))
    ];
}
exports.getSidebar = getSidebar;
