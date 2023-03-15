
class SidebarData {
    name: string;
    id: string;
    type: ValueType;
    data?: SidebarData[];

    constructor(name: string, id: string, type: ValueType, data?: SidebarData[]) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.data = data;
    }
}

enum ValueType {
    'folder',
    'file',
}

var sidebar = [new SidebarData('undefined', 'undefined', ValueType.file, undefined)]

module.exports = {
    getSidebar: function() {
        return sidebar
    }
}
