# Dashboard

**Readonly dashboard for OPC server connected machinery, web based**

![image](https://user-images.githubusercontent.com/67635910/233319565-ce0f0a9e-6759-4b11-833e-bc9b37be6ee7.png)
Image from simple display view of a crushing machine

![image](https://user-images.githubusercontent.com/67635910/235786330-05ffea40-4927-4aaa-a297-cb76b1194570.png)
Image from simple sidebar (only example)

**Functionality:**

****

>**🚧 Display:**
>
>      1.✅ PLC -> OPC system using 1 UDT [DType], 1 DB >(user specified), 2 functions for indexing and >mapping into DB explanation further down
>      2.✅ OPC -> NodeJS server via NodeOPCUA, where to >   collect data from specified through MongoDB, > customized per machine through UI
>      3.✅ NodeJS subscribe to specified DB elements and >  emit via SocketIO to web client 
>      4.✅ D3 Layout:
>          1.✅ D3 general layout with sticky circles key >  value pair
>          2.✅ data from server parsed to d3 layout
>      5.✅ Node/link caching so displays load faster after first time viewing

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
>PLC Library

****
>**PLC data:**    
> _1. DType_   
>    >1.  tag _String[**10**]_   
>    >2.  value _String[**22**]_  
>    >3.  links _Array[**0..3**] of String[**10**]_
>    >    >1. links[0] _String[**10**]_   
>    >    >2. links[1] _String[**10**]_   
>    >    >3. links[2] _String[**10**]_   
>    >    >4. links[3] _String[**10**]_   
****
