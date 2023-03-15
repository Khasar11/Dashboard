
function JSONResolver(element) { // parse sidebar element to html element
  if (element.type == '0') {
    let newElement = document.createElement('li');
    let title = document.createElement('span');
    title.classList = 'title'
    title.textContent = element.name;
    newElement.append(title)
    newElement.id = element.id;
    if (element.id.split('-')[1] == 'logs' || element.id.split('-')[1] == 'log') {
      let addButton = document.createElement('button');
      let remButton = document.createElement('button');
      addButton.innerHTML = '+'
      remButton.innerHTML = '-'
      remButton.className = 'remButton'
      addButton.className = 'addButton'
      addButton.onclick = function() { addLogAtLocation(newElement.id) }
      remButton.onclick = function() { remLogAtLocation(newElement.id) }
      newElement.append(addButton)
      newElement.append(remButton)
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
  return newElement;
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

  const returnData = JSON.parse(data);
  returnData.forEach(element => sidebar.append(JSONResolver(element)))
  document.body.prepend(sidebar)

  // on click of file
  Array.from(document.getElementsByClassName('file')).forEach(file => 
    file.addEventListener('click', function() {
      peekFile(file.id);
    }))

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
  console.log(id)
}

function remLogAtLocation(id) {
  console.log(id)
}