
class LogInput {
  constructor(id,  data, date, header, writtenBy, logs) {
      this.id = id;
      this.data = data;
      this.date = date;
      this.header = header;
      this.writtenBy = writtenBy;
      this.logs = logs;
  }
}

dragElement = elmnt => {
  const dragMouseDown = e => {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }
  var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
  if (document.getElementById(elmnt.id + "-moveable")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "-moveable").onmousedown = dragMouseDown;
  } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
  }
  const elementDrag = e => {
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
  const closeDragElement = _ => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
  }
}

const showLog = logInput => { // create log box and update with data from log input

  // remove old 
  let old = qSelect('#log-container-'+logInput.id);
  if (old != null) old.remove();

  let logXout = document.createElement('div')
  logXout.className = 'form-Xout'
  logXout.innerHTML = '✖'
  logXout.addEventListener('click', _ => { // x out this log view
    logContainer.remove()
  })
  let logHeaderDateField = document.createElement('input')
  logHeaderDateField.type = 'date'
  logHeaderDateField.value = formattedYYYYMMDD(new Date(logInput.date))
  let logHeaderTitle = document.createElement('input')
  logHeaderTitle.value = logInput.header
  logHeaderTitle.placeholder = 'Title'
  let logHeaderWrittenBy = document.createElement('input')
  logHeaderWrittenBy.value = logInput.writtenBy
  logHeaderWrittenBy.placeholder = 'Author'
  let logHeaderId = document.createElement('p')
  logHeaderId.textContent = logInput.id
  logHeaderId.className = 'fixed-top-small-grayed'
  let logContenteditable = document.createElement('div')
  logContenteditable.contentEditable = true
  logContenteditable.innerHTML = logInput.data
  let logFooterSubmit = document.createElement('button')
  logFooterSubmit.textContent = 'Submit'
  logFooterSubmit.addEventListener('click', _ => { // submit to server
    upsertLog(new LogInput(logHeaderId.textContent, logContenteditable.innerHTML, logHeaderDateField.valueAsDate, logHeaderTitle.value, logHeaderWrittenBy.value, []))
    logContainer.remove()
  })
  let logHeader = document.createElement('div')
  logHeader.className = 'log-header'
  logHeader.append(logHeaderId, logHeaderDateField,  logHeaderTitle, logHeaderWrittenBy, logXout)
  let logContent = document.createElement('div')
  logContent.append(logContenteditable)
  let logFooter = document.createElement('div')
  logFooter.className = 'footer'
  logFooter.append(logFooterSubmit)
  let logContainer = document.createElement('form')
  logContainer.id = 'log-container-'+logInput.id
  logContainer.className = 'form-form'
  let logMoveable = document.createElement('div')
  logMoveable.className = 'top-left'
  logMoveable.id = logContainer.id+'-moveable' // add -moveable to make this the focus of later dragElement()
  logMoveable.innerHTML = '-'
  logContainer.append(logMoveable, logHeader, logContent, logFooter)
  qSelect('#main-view').append(logContainer)
  logHeaderTitle.focus()
  dragElement(logContainer) // make top let - drag button of container
}

const clearLogContainer = _ => {
  qSelect('log-container').remove()
}

const showLogInput = async (logId) => {
  socket.emit('request-log', logId, log => {
    showLog(log)
  })
}

const upsertLog = async logInput => {
  socket.emit('append-log', logInput) // upsert log to log collection
}

const remEntry = async (id) => { // remove entry by id
  if (confirm(`Do you really want to delete '${id}'?`)) {
    socket.emit('remove-entry', {id: id})
  }
}