"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInputCollection = void 0;
const sidebar_1 = require("../Sidebar/sidebar");
const LogInput_1 = require("./LogInput");
class LogInputCollection {
    constructor(id, date, logs) {
        this.date = '';
        this.id = '';
        this.date = date;
        this.logs = logs;
        this.id = id;
    }
    toSidebarData() {
        if (Array.isArray(this.logs))
            return new sidebar_1.SidebarData(this.date, this.id, this.id, sidebar_1.ValueType.folder, logInputsToSidebarData(this.logs));
        return new LogInput_1.LogInput(this.logs.id, this.logs.data, this.logs.date, this.logs.header, this.logs.writtenBy).toSidebarData();
    }
}
exports.LogInputCollection = LogInputCollection;
const logInputsToSidebarData = (logs) => {
    if (Array.isArray(logs)) {
        let data = [];
        logs.filter(e => e != null).forEach(element => {
            data.push(new LogInput_1.LogInput(element.id, element.data, element.date, element.header, element.writtenBy).toSidebarData());
        });
        return data;
    }
    return [logs.toSidebarData()];
};
//# sourceMappingURL=LogInputCollection.js.map