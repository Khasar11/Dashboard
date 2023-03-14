
function JSONResolver(element) { // parse sidebar element to html element
  if (element.type == '0') {
    var newElement = document.createElement('li');
    var title = document.createElement('span');
    title.className = 'title';
    title.textContent = element.name;
    newElement.append(title)
    newElement.id = element.id;
    newElement.className = 'folder';
    var nestedElement = document.createElement('ul');
    nestedElement.className = 'nested';
    element.data.forEach(value => 
      nestedElement.append(JSONResolver(value)))
    newElement.append(nestedElement)
    return newElement;
  }
  var newElement = document.createElement('li');
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
      peekClick(file.id);
    }))

    // add collapsability to title elements
  Array.from(document.getElementsByClassName("title")).forEach(toggler =>
    toggler.addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("title-down");
    }));
} 

getSidebar();

function peekClick(id) {
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