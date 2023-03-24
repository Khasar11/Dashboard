import { Address4 } from "ip-address";

export class Bindings {

    ip: Address4;
    port: number;
    DBname: string;
    DBNumber: number;

    constructor(ip: Address4, port: number, DBname: string, DBNumber: number) {
        this.ip = ip;
        this.port = port;
        this.DBname = DBname;
        this.DBNumber = DBNumber;
    }

    refresh() {

    }

    nodeObjects() {

    }

    links() {
        
    }
}