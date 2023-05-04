"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredDataElement = exports.ValueType = void 0;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
class StructuredDataElement {
    constructor(name, id, hover, type, data) {
        this.name = name;
        this.id = id;
        this.hover = hover;
        this.type = type;
        this.data = data;
    }
}
exports.StructuredDataElement = StructuredDataElement;
//# sourceMappingURL=StructuredDataElement.js.map