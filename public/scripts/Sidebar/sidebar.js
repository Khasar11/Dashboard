
var undefined = NaN
const stopParentEventClick = 'event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation();  return false;'

function JSONResolver(element) { // parse sidebar element to html element
  if (element.type == '0') {
    let newElement = document.createElement('li');
    let title = document.createElement('span');
    title.classList = 'title'
    title.textContent = element.name;
    newElement.append(title)
    newElement.id = element.id;
    if (element.id.split('-')[1] == 'logs' || element.id.split('-')[1] == 'log') {
      addButton('+', `addLogAtLocation('${newElement.id}', 'folder')`, newElement)
      if (element.id.split('-')[1] == 'log') {
        addButton('-', `remEntry('${newElement.id}', null)`, newElement)
      }
      newElement.setAttribute('date', element.name)
    }
    if (element.id.split('-')[1] == undefined) {
      addButton('-', `remEntry('${element.id}', null)`, newElement)
    }
    newElement.className = 'folder';
    let nestedElement = document.createElement('ul');
    if(String(newElement.id.split('-')[1]).includes('log'))
      nestedElement.classList.add('log-area-'+element.id.split('-').length)
    nestedElement.classList.add('nested');
    element.data.forEach(value => 
      nestedElement.append(JSONResolver(value)))
    newElement.append(nestedElement)
    return newElement;
  }
  let newElement = document.createElement('li');
  newElement.id = element.id;
  newElement.className = 'file';
  newElement.innerHTML = element.name;
  if (element.id.split('-')[1] == 'log')  {
    addButton('-', `remEntry('${newElement.id}', null)`, newElement)
    newElement.setAttribute('date', element.name)
  }
  if (element.hover != '') {
    let hoverElement = document.createElement('span');
    hoverElement.innerHTML = element.hover;
    hoverElement.style.opacity = 0;
    hoverElement.style.visibility = 'hidden';
    newElement.addEventListener("mouseover", () => {
      hoverElement.style.opacity = 1;
      hoverElement.style.visibility = 'visible';
    });
    newElement.addEventListener('mouseout', () => {
      hoverElement.style.opacity = 0;
      hoverElement.style.visibility = '';
    })
    newElement.append(hoverElement);
  }
  return newElement;
}

function addButton(inner, onclick, appendTo) {
  let btn = document.createElement('button');
  btn.innerHTML = inner;
  btn.className = inner+'-button';
  btn.setAttribute('onclick', `${onclick}; ${stopParentEventClick}`)
  appendTo.append(btn)
}

async function getSidebar() { // get sidebar from server side
  const baseUrl = 'http://localhost:8383/sidebar'

  let data = await fetch(baseUrl, {
    method: 'GET'
  }).then((response) => response.text())
  .then(data => { return data; })
  .catch(error => { console.error(error); });

  if (document.getElementById('main-sidebar') != null) {
    document.getElementById('main-sidebar').remove();
    saveSidebarExpasionStates()
  }
  var sidebar = document.createElement('ul')
  sidebar.id = 'main-sidebar'

  let label = document.createElement('text');
  label.innerHTML= 'Machines'
  sidebar.append(label)
  addButton('+', 'newMachine()', sidebar)

  var addMachineBtn = document.createElement('button')
  addMachineBtn.id = 'add-machine-to-tree'

  const returnData = JSON.parse(data);
  returnData.forEach(element => {
    sidebar.append(JSONResolver(element))
  })
  document.body.prepend(sidebar)
  loadSidebarExpansionStates()

  // on click of file
  Array.from(document.getElementsByClassName('file')).forEach(file => {
    file.setAttribute('onclick', `peekFile('${file.id}'); ${stopParentEventClick}`) })

    // add collapsability to title elements
  Array.from(document.getElementsByClassName("title")).forEach(toggler =>
    toggler.addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("title-down");
    }));

  await sortLogs();
} 

function saveSidebarExpasionStates() {

}

function loadSidebarExpansionStates() {
  
}

async function sortLogs() {
  Array.from(document.getElementsByClassName('log-area-2')).forEach(element => { sortList(element); })
  Array.from(document.getElementsByClassName('log-area-3')).forEach(element => { sortList(element) })
}

async function sortList(ul) {
  var list, i, switching, shouldSwitch;
  list = ul;
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
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

getSidebar();

function peekFile(id) {
  let postDash = id.split('-')[1];
  if (postDash == 'display') {
    getDisplay(id.split('-')[0]);
  }
  if (postDash == 'log') {
    showLog(id);
  }
  if (postDash == 'oee') {
    
  }
}

function addLogAtLocation(id) {
  addingLogInputTo = id.slice(0,-1);
  newLogInputCollection = new LogInputCollection()
  newLogInputCollection.id = addingLogInputTo+'-'+makeid(6)
  if (document.getElementById(id).className == 'file') showAddLogPrompt(id, false)
  if (id.split('-')[1] == 'logs') showAddLogPrompt(id, true)
  if (id.split('-')[1] == 'log') showAddLogPrompt(id, false)
}