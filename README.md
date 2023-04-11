# TDashboard

_World class_

<<<<<<< HEAD
**Readonly dashboard for OPC server connected machinery, web based**

**Functionality:**

****

>**🚧 Display:**
>
>      1.✅ PLC -> OPC system using 1 UDT [DType], 1 DB >(user specified), 2 functions for indexing and >mapping into DB explanation further down
>      2.✅ OPC -> NodeJS server via NodeOPCUA, where to >   collect data from specified through MongoDB, > customized per machine through UI
>      3.✅ NodeJS subscribe to specified DB elements and >  emit via SocketIO to web client 
>      4.🚧 D3 Layout:
>          1.✅ D3 general layout with sticky circles key >  value pair
>          2.🚧 NodeJS data parsed to d3 layout

****

>🚧 Logs for machinery/PLCs via simple log box [MongoDB]    
>✅ Single log / log collection specification on new log   input    
>✅ Enter log input via UI  
>🚧 Better display box  

****

>✅ Sidebar:    
>   1.✅ Parses MongoDB collection as sidebar   
>   2.✅ Clickable buttons to add/remove machines/log inputs/>modify display data
 
****

>🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧    
>Planned support for simple OEE integration and display via UI  
>Loggable OPC data:     
>   Login system for per user logs  
>   log-tag manage system   
=======
Readonly dashboard for OPC server connected machinery, web based

>## Functionality:
>->###🚧 Display:
>->  ####✅ PLC -> OPC system using 1 UDT [DType], 1 DB (user specified), 2 functions for indexing and mapping into DB explanation further down
>->  ####✅ OPC -> NodeJS server via NodeOPCUA, where to collect data from specified through MongoDB, customized per machine through UI
>->  ####✅ NodeJS subscribe to specified DB elements and emit via SocketIO to web client 
>->>  ####🚧 D3 Layout:
>->>    #####✅ D3 general layout with sticky circles + key value pair
>->>    #####🚧 NodeJS data parsed to d3 layout
>  
>->###🚧 Logs for machinery/PLCs via simple log box [MongoDB]
>->  ####✅ Single log / log collection specification on new log input
>->  ####✅ Enter log input via UI
>->  ####🚧 Better display box
>
>->###✅ Sidebar:
>->  ####✅ Parses MongoDB collection as sidebar
>->  ####✅ Clickable buttons to add/remove machines/log inputs/modify display data
>  
>->###🚧 Planned support for simple OEE integration and display via UI
>->###🚧 Loggable OPC data:
>->  ####🚧 Login system for per user logs
>->  ####🚧 log-tag manage system
>>>>>>> 9a70041bb7526e988fdd75a24d631e6f81355fad
