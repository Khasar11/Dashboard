"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInput = void 0;
const sidebar_1 = require("../Sidebar/sidebar");
class LogInput {
    constructor(id, data, date, header, writtenBy, logs) {
        this.id = id;
        this.data = data;
        this.date = date;
        this.header = header;
        this.writtenBy = writtenBy;
        this.logs = logs;
    }
    toSidebarData() {
        let data = new sidebar_1.SidebarData(new Date(this.date).toDateString(), this.id, this.header, this.logs.length == 0 ? sidebar_1.ValueType.file : sidebar_1.ValueType.folder, /* file == 0 folder == 1 */ []);
        this.logs.forEach(sl => {
            data.data?.push(new LogInput(sl.id, sl.data, sl.date, sl.header, sl.writtenBy, sl.logs).toSidebarData());
        });
        return data;
    }
}
exports.LogInput = LogInput;
//# sourceMappingURL=LogInput.js.map