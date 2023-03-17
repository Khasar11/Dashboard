
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
      addButton('-', `remLogAtLocation('${newElement.id}', 'folder')`, newElement)
    }
    if (element.id.split('-')[1] == undefined) {
      addButton('-', `remMachine(${element.id})`, newElement)
    }
    newElement.className = 'folder';
    let nestedElement = document.createElement('ul');
    nestedElement.className = 'nested';
    element.data.forEach(value => 
      nestedElement.append(JSONResolver(value)))
    newElement.append(nestedElement)
    return newElement;
  }
  let newElement = document.createElement('li');
  newElement.id = element.id;
  newElement.className = 'file';
  newElement.innerHTML = element.name;
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

  var sidebar = document.createElement('ul')
  sidebar.id = 'main-sidebar'

  addButton('+', 'newMachine()', sidebar)

  var addMachineBtn = document.createElement('button')
  var delMachineBtn = document.createElement('button')

  addMachineBtn.id = 'add-machine-to-tree'

  const returnData = JSON.parse(data);
  returnData.forEach(element => sidebar.append(JSONResolver(element)))
  document.body.prepend(sidebar)

  // on click of file
  Array.from(document.getElementsByClassName('file')).forEach(file => {
    file.setAttribute('onclick', `peekFile('${file.id}'); ${stopParentEventClick}`) })

    // add collapsability to title elements
  Array.from(document.getElementsByClassName("title")).forEach(toggler =>
    toggler.addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("title-down");
    }));
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
  addingLogInputTo = id;
  newLogInputCollection = new LogInputCollection()
  newLogInputCollection.id = addingLogInputTo+'-'+makeid(10)
  if (document.getElementById(id).className == 'file') showAddLogPrompt(id, false)
  if (id.split('-')[1] == 'logs') showAddLogPrompt(id, true)
  if (id.split('-')[1] == 'log') showAddLogPrompt(id, false)
}

function remLogAtLocation(id, currentType) {
  removingLogInput = id;
  showRemoveLogPrompt()
}
