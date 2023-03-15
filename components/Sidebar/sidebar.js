var SidebarData = /** @class */ (function () {
    function SidebarData(name, id, type, data) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.data = data;
    }
    return SidebarData;
}());
var ValueType;
(function (ValueType) {
    ValueType[ValueType["folder"] = 0] = "folder";
    ValueType[ValueType["file"] = 1] = "file";
})(ValueType || (ValueType = {}));
var sidebar = [new SidebarData('undefined', 'undefined', ValueType.file, undefined)];
module.exports = {
    getSidebar: function () {
        return sidebar;
    }
};
