"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredUpdateObject = void 0;
class StructuredUpdateObject {
    constructor(data, remove, belonging = undefined) {
        this.remove = false;
        this.remove = remove;
        this.data = data;
        this.belonging = belonging;
    }
}
exports.StructuredUpdateObject = StructuredUpdateObject;
//# sourceMappingURL=StructuredUpdateObject.js.map