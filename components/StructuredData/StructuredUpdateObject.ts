import { StructuredDataElement } from "./StructuredDataElement";

export class StructuredUpdateObject {
  remove: boolean = false;
  data: StructuredDataElement;
  belonging: string | undefined
  constructor(data: any, remove: boolean, belonging: string | undefined = undefined) {
    this.remove = remove;
    this.data = data;
    this.belonging = belonging;
  }
}