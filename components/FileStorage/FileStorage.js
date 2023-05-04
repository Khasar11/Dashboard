"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileStorage = void 0;
const server_1 = require("../../server");
const fs_readdir_recursive_1 = __importDefault(require("fs-readdir-recursive"));
const getFileStorage = async (id) => {
    try {
        let walked = (0, fs_readdir_recursive_1.default)(server_1.fileDir + `\\public\\storage\\${id}`);
        return walked;
    }
    catch (err) {
        console.log(err);
    }
};
exports.getFileStorage = getFileStorage;
//# sourceMappingURL=FileStorage.js.map