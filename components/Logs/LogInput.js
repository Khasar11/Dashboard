"use strict";
exports.__esModule = true;
exports.LogInput = void 0;
var sidebar_1 = require("../Sidebar/sidebar");
var LogInput = /** @class */ (function () {
    function LogInput(id, data, date, header, writtenBy) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }
    LogInput.prototype.toSidebarData = function () {
        return new sidebar_1.SidebarData(String(this.date).split('T')[0], this.id, this.header, sidebar_1.ValueType.file, undefined);
    };
    return LogInput;
}());
exports.LogInput = LogInput;
