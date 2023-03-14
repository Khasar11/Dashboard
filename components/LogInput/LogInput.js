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
var logs = [
    new LogInput('knuser-log-0', new Date('03 14 2023'), 'knuser log 0 title', 'warben', 'aaaaaaaaa')
    /*new LogInput('knuser-log-1',
    new Date('03 12 2023'),
    'knuser log 1 title',
    'warben',
    [new LogInput('knuser-log-2',
        new Date('03 13 2023'),
        'knuser log 2 title',
        'warben',
        undefined,
        'data in log input')
    ],
    undefined) */
];
function fetchLogInput(id) {
    return new LogInput('knuser-log-0', new Date('03 14 2023'), 'knuser log 0 title', 'warben', 'aaaaaaaaa');
}
exports.fetchLogInput = fetchLogInput;
