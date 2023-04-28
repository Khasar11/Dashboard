
const stopParentEventClick = 'event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation();  return false;'

const sortLogs = async _ => {
  Array.from(document.getElementsByClassName('sortable')).forEach(element => { sortList(element); })
}

const sortList = async ul => { // sort ul by 'date' attribute
  var list, i, switching, shouldSwitch;
  list = ul;
  switching = true;
  /* Make a loop that will continue until no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    b = list.children;
    // Loop through all list items:
    for (i = 0; i < (b.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Check if the next item should
      switch place with the current item: */
      if (new Date(b[i].getAttribute("date")) < new Date(b[i + 1].getAttribute("date"))) {
        /* If next item is date lower than current item,
        mark as a switch and break the loop: */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark the switch as done: */
      b[i].parentNode.insertBefore(b[i + 1], b[i]);
      switching = true;
    }
  }
}

const  addButton = (inner, onclick, appendTo) => {
  let btn = document.createElement('button');
  btn.innerHTML = inner;
  btn.className = 'forced-button';
  btn.addEventListener('click', e => {
    e.stopPropagation()
    onclick()
  })
  appendTo.append(btn)
}

const addHover = (element, text) => {
  element.addEventListener('mouseover', e => {
    e.stopPropagation()
    qSelect('.hover-elem') != null ? qSelect('.hover-elem').remove() : undefined;
    let hoverElem = document.createElement('span')
    hoverElem.innerText = text
    hoverElem.className = 'hover-elem'
    hoverElem.style.opacity = 0;
    element.prepend(hoverElem)
    hoverElem.style.opacity = 1;
  })
  element.addEventListener('mouseleave', e => {
    e.stopPropagation()
    qSelect('.hover-elem') != null ? qSelect('.hover-elem').remove() : undefined;
  })
}

const toggle = element => {
  if (element.classList.contains('collapsed')) {
    element.classList.remove('collapsed');
    element.classList.add('shown');
  } else {
    element.classList.remove('shown');
    element.classList.add('collapsed');
  }
}

const addToggle = element => {
  element.addEventListener('dblclick', e => { // toggle visibility
    e.stopPropagation()
    toggle(element)
  })
}

const addDrag = sidebar => {
  var startX, startY, startWidth;

  const initDrag = e =>  {
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(sidebar).width, 10);
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
  }

  const doDrag = e => {
    sidebar.style.width = (startWidth + e.clientX - startX) + 'px';
    qSelect(':root').style.setProperty('--sidebar-width', sidebar.style.width)
  }

  const stopDrag = e => {
    document.documentElement.removeEventListener('mousemove', doDrag, false);    document.documentElement.removeEventListener('mouseup', stopDrag, false);
  }

  sidebar.className = sidebar.className + ' resizable';
  var resizer = document.createElement('div');
  resizer.className = 'resizer';
  sidebar.appendChild(resizer);
  resizer.addEventListener('mousedown', initDrag, false);
}

const newEmptyLog = id => {
  let split = id.split('-')
  if (split.length < 3)
    return  new LogInput(String(id).substring(0, id.length-1)+'-'+makeid(6), '', new Date(), '', '', undefined)
  return  new LogInput(id+'-'+makeid(6), '', new Date(), '', '', undefined)
}

const addAndRemoveButtons = (toElement, id) => {
  addButton('+', _ => {
    /* add brand new log */
    showLog(newEmptyLog(id))
  }, toElement)
  addButton('-', _ => {
    /* remove log with id element.id*/
    remEntry(id)
  }, toElement)
}

/* peek from server (sidebar.ts)
export class SidebarData {
  name: string;
  id: string;
  hover: string;
  type: ValueType;
  data?: SidebarData[];
} */
const Resolver = async element => { // parse sidebar element recursively to html element
  let idSplit = element.id.split('-')
  if (element.type) { // sidebar element is type file
    let wrapper = document.createElement('ul')
    wrapper.className = 'sidebar-file-wrapper'
    wrapper.setAttribute('date', element.name)
    let fileElement = document.createElement('li')
    fileElement.innerText = element.name
    fileElement.className = 'sidebar-file'
    wrapper.append(fileElement)
    if (idSplit[1] == 'display' || idSplit[1] == 'oee' ) {
      addButton('M', _ => {
        idSplit[1] == 'display' ? modifyDisplay(element.id) : console.log('modify oee')
      }, wrapper)
      wrapper.addEventListener('click', e => {
        e.stopPropagation();
        // view display here
        startDisplaySubscription(idSplit[1])
      })
    }
    if (idSplit[1] == 'log' ) { 
      fileElement.addEventListener('click', e => {
        e.stopPropagation(); 
        /* view log with no further bulletpoints */
        showLogInput(element.id)
      })
      if (idSplit.length < 4) {
        addAndRemoveButtons(wrapper, element.id)
      } else {
        addButton('-', _ => {
          /* remove log with id element.id*/
          remEntry(element.id)
        }, wrapper)
      }
    }
    addHover(wrapper, element.hover)
    return wrapper; // returns wrapper ul 
  } 
  // sidebar element is type folder
  let folderElement = document.createElement('ul')
  let folderElementTitle = document.createElement('span')
  let folderWrapper = document.createElement('div')
  folderWrapper.className = 'sortable'
  folderElement.setAttribute('date', element.name)
  let flexWrapper = document.createElement('div')
  flexWrapper.className = 'sidebar-folder-wrapper'
  folderElementTitle.innerText = element.name
  folderElement.className = 'sidebar-folder'
  folderElement.classList.add('collapsed')
  flexWrapper.append(folderElementTitle)
  addHover(folderElement, element.hover)
  if (idSplit[1] == 'logs') addButton('+', _ => {
    /* add brand new log */
    showLog(newEmptyLog(element.id))
  }, flexWrapper)
  addToggle(folderElement)
  if (idSplit.length == 1) 
  addButton('-', _ => {
    /* remove machine */
    remEntry(element.id)
  }, flexWrapper)
  if (idSplit[1] == 'log') {
    addAndRemoveButtons(flexWrapper, element.id)
    folderElementTitle.addEventListener('click', _ => {
      /* view log that also has bulletpoints */
      showLogInput(element.id)
    })
  }
  element.data.forEach(async subElement => {
    folderWrapper.append(await Promise.resolve(Resolver(subElement))) // recursion of resolved sub element
  })
  folderElement.append(flexWrapper, folderWrapper)
  return folderElement
}

const getSidebar = async _ => { // get sidebar from server side
  socket.emit('request-sidebar', _, async arg => {
    if (qSelect('#main-sidebar') != null) {
      qSelect('#main-sidebar').remove();
    }
    var sidebar = document.createElement('div')
    sidebar.className = 'sidebar'
    let labelWrapper = document.createElement('div')
    labelWrapper.className = 'sidebar-file-wrapper'
    let label = document.createElement('span');
    label.innerHTML= 'Data'
    labelWrapper.append(label)
    addButton('+', _ => {
      /* add brand new machine */
      newMachine()
    }, labelWrapper)
    sidebar.append(labelWrapper)
    let wrapper = document.createElement('div')
    arg.forEach(async element => { // recursively append the folder content
      wrapper.append(await Promise.resolve(Resolver(element)))
    })
    addDrag(sidebar) 
    sidebar.append(wrapper)
    document.body.prepend(sidebar) // insert the sidebar at beginning of body
    sidebar.addEventListener('keydown', e => { // Add tab toggling of elements
      keyToggle(e, 'ArrowRight', 'collapsed')
      keyToggle(e, 'ArrowLeft', 'shown')
    })
    setTimeout(async _ => {
      await sortLogs();
    }, 20)
  })
} 

const keyToggle = (e, keyCode, clazz) => {
  if (e.code == keyCode) {
    let grandParent = e.target.parentElement.parentElement;
    if (grandParent.classList.contains(clazz)) {
      toggle(grandParent)
    }
  }
}

getSidebar();

socket.on('sidebar-update', sidebarUpdate => {
  console.log(sidebarUpdate)
})