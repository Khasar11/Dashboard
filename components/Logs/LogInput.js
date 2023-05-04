"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInput = void 0;
const StructuredDataElement_1 = require("../StructuredData/StructuredDataElement");
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
        let data = new StructuredDataElement_1.StructuredDataElement(new Date(this.date).toDateString(), this.id, this.header, this.logs.length == 0 ? StructuredDataElement_1.ValueType.file : StructuredDataElement_1.ValueType.folder, /* file == 0 folder == 1 */ []);
        this.logs.forEach(sl => {
            data.data?.push(new LogInput(sl.id, sl.data, sl.date, sl.header, sl.writtenBy, sl.logs).toSidebarData());
        });
        return data;
    }
}
exports.LogInput = LogInput;
//# sourceMappingURL=LogInput.js.map