import { SidebarData } from "./sidebar";

export class SidebarUpdateObject {
  remove: boolean = false;
  data: SidebarData;
  constructor(data: any, remove: boolean ) {
    this.remove = remove;
    this.data = data;
  }
}