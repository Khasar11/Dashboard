"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInput = void 0;
const sidebar_1 = require("../Sidebar/sidebar");
class LogInput {
    constructor(id, data, date, header, writtenBy) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
    }
    toSidebarData() {
        return new sidebar_1.SidebarData(String(this.date).split('T')[0], this.id, this.header, sidebar_1.ValueType.file, undefined);
    }
}
exports.LogInput = LogInput;
//# sourceMappingURL=LogInput.js.map