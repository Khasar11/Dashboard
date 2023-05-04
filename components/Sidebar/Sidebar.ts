import { toSidebarData } from "../Machine/Machine"
import { coll, mongoClient } from "../MongoDB/MongoDB"
import { StructuredDataElement, ValueType } from "../StructuredData/StructuredDataElement"

export const getSidebar = async () => {

  mongoClient.connect()

  var sidebar: StructuredDataElement[] = []
  await coll.find().forEach((machine: any) => {
      if (machine.belonging != null ) {
          if (sidebar.find(elem => elem.name == machine.belonging) == null)
              sidebar.push(
                  new StructuredDataElement(
                      machine.belonging, 
                      `$divider-`+machine.belonging, 
                      '', 
                      ValueType.folder, 
                      [toSidebarData(machine)]
                      )
                  )
          else 
              sidebar[sidebar.findIndex(elem => elem.name == machine.belonging)]
                  .data?.push(toSidebarData(machine))
      } else sidebar.push(toSidebarData(machine));
  })
  
  return sidebar
}
