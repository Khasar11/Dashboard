import { SidebarData } from "./sidebar";

export class SidebarUpdateObject {
  remove: boolean = false;
  data: SidebarData;
  belonging: string | undefined
  constructor(data: any, remove: boolean, belinging: string | undefined = undefined) {
    this.remove = remove;
    this.data = data;
    this.belonging = belinging;
  }
}