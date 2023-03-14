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
var sidebar = [
    new SidebarData('knuser', 'knuser', ValueType.folder, [
        new SidebarData('OEE', 'knuser-oee', ValueType.file),
        new SidebarData('Display', 'knuser-display', ValueType.file),
        new SidebarData('Logs', 'knuser-logs', ValueType.folder, [
            new SidebarData('13.03.2023', 'knuser-log-0', ValueType.file),
            new SidebarData('11.03.2023', 'knuser-log-1', ValueType.folder, [new SidebarData('12.03.2023', 'knuser-log-2', ValueType.file)])
        ]),
    ]),
    new SidebarData('f1', 'f1', ValueType.folder, [
        new SidebarData('OEE', 'f1-oee', ValueType.file),
        new SidebarData('Display', 'f1-display', ValueType.file),
        new SidebarData('Logs', 'f1-logs', ValueType.folder, [
            new SidebarData('13.03.2023', 'f1-log-0', ValueType.file),
            new SidebarData('11.03.2023', 'f1-log-1', ValueType.folder, [new SidebarData('12.03.2023', 'f1-log-2', ValueType.file)])
        ]),
    ]),
];
module.exports = {
    getSidebar: function () {
        return sidebar;
    }
};
