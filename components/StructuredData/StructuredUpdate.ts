export class StructuredUpdate {
  remove: boolean = false;
  id: string;
  constructor(id: string, remove: boolean) {
    this.id = id;
    this.remove = remove;
  }
}