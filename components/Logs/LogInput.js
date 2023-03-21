"use strict";
exports.__esModule = true;
exports.fetchLogInput = exports.LogInput = void 0;
var MongoDB_1 = require("../MongoDB/MongoDB");
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
function fetchLogInput(id) {
    var split = id.split('-');
    MongoDB_1.client.connect();
    // err
    console.log(id);
    console.log(MongoDB_1.db.coll.find({ id: split[0] }));
    return new LogInput('undefined', 'undefined', 'undefined', 'undefined', 'undefined');
}
exports.fetchLogInput = fetchLogInput;
