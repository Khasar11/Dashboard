
class LogInputCollection {
  date = '';
  id = '';
  logs;

  constructor(id, date, logs) {
      this.date = date;
      this.logs = logs;
      this.id = id;
  }
}

class LogInput {
  id;
  data;
  date;
  header;
  writtenBy;

  constructor(id,  data, date, header, writtenBy) {
      this.id = id;
      this.data = data;
      this.date = date;
      this.header = header;
      this.writtenBy = writtenBy;
  }
}

var currentLogInput;
var addingLogInputTo;
var removingLogInput;

var newLogInputCollection;

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
  addingLogInputTo = null;
  dateTimePicker.value = formattedYYYYMMDD(new Date())
  header.value = ''
  dataField.innerHTML = ''
  writtenBy.value = ''
  idField.innerHTML = ''
  let logDiv = document.getElementById('logs-div')
  logDiv.style.visibility = 'hidden'
  logDiv.style.opacity = 0;
}

function emptyNew() {
  let newLogsEntry = document.getElementById('new-logs-entry')
  newLogsEntry.style.visibility = 'hidden'
  newLogsEntry.style.opacity = 0
}

document.getElementById("logs-div-Xout").addEventListener("click", function() {
    let logsDiv = document.getElementById('logs-div')
    logsDiv.style.visibility = 'hidden';
    logsDiv.style.opacity = 0;
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

function showAddLogPrompt(id, showCollection) {
  let logDiv = document.getElementById('logs-div')
  if (showCollection) {
    emptyLog()
    document.getElementById('new-logs-entry').style.visibility = 'visible'
    document.getElementById('new-logs-entry').style.opacity = 1
    return;
  }
  logDiv.style.visibility = 'visible'
  logDiv.style.opacity = 1;
  document.getElementById('logs-div-id').innerHTML = id +'-'+makeid(6)
  emptyNew()
}

document.getElementById("new-logs-singular").addEventListener('click', function () {
  document.getElementById("new-logs-value").innerHTML = 'Singular'
  let coldate = document.getElementById('collection-date')
  coldate.style.visibility = 'hidden'
  coldate.style.opacity = 0
})

document.getElementById("new-logs-collection").addEventListener('click', function () {
  document.getElementById("new-logs-value").innerHTML = 'Collection'
  let coldate = document.getElementById('collection-date')
  coldate.style.visibility = 'visible'
  coldate.style.opacity = 1
})

document.getElementById('new-log-continue').addEventListener('click', function() {
  document.getElementById('new-logs-entry').style.visibility = 'hidden'
  document.getElementById('new-logs-entry').style.opacity = 0
  let val = document.getElementById("new-logs-value").innerHTML
  if (val == 'Collection') {
    newLogInputCollection.logs = []
    newLogInputCollection.date = document.getElementById('collection-date').value
    submitLogCollection(newLogInputCollection)
  }
  if (val == 'Singular') {
    newLogInputCollection.logs = new LogInput()
    newLogInputCollection.logs.id = newLogInputCollection.id
    updateLogInputUI(newLogInputCollection.logs)
    let logDiv = document.getElementById('logs-div')
    logDiv.style.visibility = 'visible'
    logDiv.style.opacity = 1;
  }
})

document.getElementById('new-logs-div-Xout').addEventListener('click', function () {
  let newLogs = document.getElementById('new-logs-entry')
  newLogs.style.opacity = 0;
  newLogs.style.visibility = 'hidden'
  addingLogInputTo = null
  newLogInputCollection = null
})

document.getElementById('logs-submit').addEventListener(('click'), function() {
  let dateTimePicker = document.getElementById('logs-date')
  let header = document.getElementById('logs-header-text')
  let writtenBy = document.getElementById('logs-header-written-by')
  let dataField = document.getElementById('logs-input')
  let idField = document.getElementById('logs-div-id')

  if (addingLogInputTo != null && addingLogInputTo.split('-')[1] == 'log') {
    let logInput = new LogInput(idField.innerHTML, 
      dataField.innerHTML, 
      dateTimePicker.value == '' ? formattedYYYYMMDD(new Date()) : dateTimePicker.value,
      header.value,
      writtenBy.value)
    appendLog(logInput, addingLogInputTo)
    emptyLog()
    return;
  }
  newLogInputCollection.logs.header = header.value
  newLogInputCollection.logs.writtenBy = writtenBy.value
  newLogInputCollection.logs.data = dataField.innerHTML
  newLogInputCollection.logs.id = idField.innerHTML
  if (dataField.innerHTML == '' || header.value == '' || writtenBy.value == '' || idField.innerHTML == '') { alert('Missing inputs'); return }
  newLogInputCollection.date = formattedYYYYMMDD(new Date())
  newLogInputCollection.logs.date = dateTimePicker.value == '' ? formattedYYYYMMDD(new Date()) : dateTimePicker.value
  submitLogCollection() 
})

function updateLogInputUI(logInput) {
  let dateTimePicker = document.getElementById('logs-date')
  let header = document.getElementById('logs-header-text')
  let writtenBy = document.getElementById('logs-header-written-by')
  let dataField = document.getElementById('logs-input')
  let idField = document.getElementById('logs-div-id')
  dateTimePicker.value = formattedYYYYMMDD(new Date())
  header.value = logInput.header === undefined ? null : logInput.header
  dataField.innerHTML = logInput.data === undefined ? null : logInput.data
  writtenBy.value = logInput.writtenBy === undefined ? null : logInput.writtenBy
  idField.innerHTML = logInput.id === undefined ? null : logInput.id+'-'+makeid(6)
}

function appendLog(logInput, origin) {

  console.log(logInput)
  console.log('log input appended to ' + origin)
  emptyLog()
}

function submitLogCollection() {
  console.log(newLogInputCollection)
  console.log('log collection submit')
  emptyLog()
}

function remEntry(id) {
  if (confirm(`Do you really want to delete '${id}'?`) == true) {
      console.log('remove entry with id ' + id)
      return;
  }
}