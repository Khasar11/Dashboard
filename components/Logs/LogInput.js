"use strict";
exports.__esModule = true;
exports.fetchLogInput = exports.LogInput = void 0;
var LogInput = /** @class */ (function () {
    function LogInput(id, date, header, writtenBy, data) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }
    return LogInput;
}());
exports.LogInput = LogInput;
function fetchLogInput(id) {
    return null;
}
exports.fetchLogInput = fetchLogInput;
