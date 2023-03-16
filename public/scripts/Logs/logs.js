
var currentLogInput;
var addingLogInputTo;
var removingLogInput;

async function showLog(logId) {

  const baseUrl = `http://localhost:8383/logs/${logId}`

  currentLogInput = logId;

  let data = await fetch(baseUrl, {
    method: 'GET'
  }).then((response) => response.text())
  .then(data => { return data; })
  .catch(error => { console.error(error); });

  let log = JSON.parse(data);
  let dateTimePicker = document.getElementById('logs-date')
  let header = document.getElementById('logs-header-text')
  let writtenBy = document.getElementById('logs-header-written-by')
  let dataField = document.getElementById('logs-input')
  let idField = document.getElementById('logs-div-id')
  idField.innerHTML = log.id;
  dataField.innerHTML = log.data
  header.value = log.header
  writtenBy.value = log.writtenBy;
  dateTimePicker.value = log.date.split('T')[0];
  let logDiv = document.getElementById('logs-div')
  logDiv.style.visibility = 'visible'
  logDiv.style.opacity = 1;
}

function emptyLog() {
  let dateTimePicker = document.getElementById('logs-date')
  let header = document.getElementById('logs-header-text')
  let writtenBy = document.getElementById('logs-header-written-by')
  let dataField = document.getElementById('logs-input')
  let idField = document.getElementById('logs-div-id')
  currentLogInput = null;
  dateTimePicker.value = String(new Date()).split('T')[0]
  header.value = ''
  dataField.innerHTML = ''
  writtenBy.value = ''
  idField.value = ''
}

document.getElementById("logs-div-Xout").addEventListener("click", function() {
    document.getElementById('logs-div').style.visibility = 'hidden';
    document.getElementById('logs-div').style.opacity = 0;
    emptyLog();
  });

// Make the DIV element draggable:
dragElement(document.getElementById("logs-div"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-moveable")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-moveable").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

document.getElementById("new-logs-singular").addEventListener('click', function () {
  document.getElementById("new-logs-value").innerHTML = 'Singular'
})

document.getElementById("new-logs-collection").addEventListener('click', function () {
  document.getElementById("new-logs-value").innerHTML = 'Collection'
})