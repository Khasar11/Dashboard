"use strict";
exports.__esModule = true;
exports.getSidebar = exports.ValueType = exports.SidebarData = void 0;
var LogInput_1 = require("../Logs/LogInput");
var LogInputCollection_1 = require("../Logs/LogInputCollection");
var Machine_1 = require("../Machine");
var SidebarData = /** @class */ (function () {
    function SidebarData(name, id, hover, type, data) {
        this.name = name;
        this.id = id;
        this.hover = hover;
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
        (0, Machine_1.toSidebarData)(new Machine_1.Machine('knuser', 'knuser', 'warben', '2023-03-17', [
            new LogInputCollection_1.LogInputCollection('knuser-log-0', '2023-03-16', [new LogInput_1.LogInput('knuser-log-0-1', 'yep', '2023-03-15', 'header yep', 'warben'),
                new LogInput_1.LogInput('knuser-log-0-2', 'yep2', '2023-03-14', 'header yep2', 'warben'),
                new LogInput_1.LogInput('knuser-log-0-3', 'yep2', '2023-03-17', 'header yep2', 'warben')]),
            new LogInputCollection_1.LogInputCollection('knuser-log-1', '2023-03-13', new LogInput_1.LogInput('knuser-log-1', 'yep', '2023-03-12', 'header yep', 'warben'))
        ])),
        (0, Machine_1.toSidebarData)(new Machine_1.Machine('b2', 'b2', 'warben', '2023-03-11', [
            new LogInputCollection_1.LogInputCollection('b2-log-0', '2023-03-10', new LogInput_1.LogInput('b2-log-0', 'yep b2', '2023-03-09', 'header yep b2', 'warben'))
        ]))
    ];
}
exports.getSidebar = getSidebar;
