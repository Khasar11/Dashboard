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

  constructor(id, data, date, header, writtenBy) {
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

const showLog = async (logId) => {

  const baseUrl = `http://localhost:8383/logs/${logId}`

  currentLogInput = logId;

  let data = await fetch(baseUrl, {
          method: 'GET'
      }).then((response) => response.text())
      .then(data => {
          return data;
      })
      .catch(error => {
          console.error(error);
      });

  showAddNonCollection()

  let split = logId.split('-')
  addingLogInputTo = split[0]+'-'+split[1]+'-'+split[2]
  let log = JSON.parse(data);
  let dateTimePicker = qSelect('#logs-date')
  let header = qSelect('#logs-header-text')
  let writtenBy = qSelect('#logs-header-written-by')
  let dataField = qSelect('#logs-input')
  let idField = qSelect('#logs-div-id')
  idField.innerHTML = log.id;
  dataField.innerHTML = log.data
  header.value = log.header
  writtenBy.value = log.writtenBy;
  dateTimePicker.value = log.date.split('T')[0];
  let logDiv = qSelect('#logs-div')
  logDiv.style.visibility = 'visible'
  logDiv.style.opacity = 1;
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

const showAddNonCollection = id => {
  let logsDivInner = `<div id="logs">
        <section id="logs-div-header" class="outlined">
            <input type="date" id="logs-date" class="form-inputbox" name="log" required>
            <input id="logs-header-text" class="form-inputbox" type="text" placeholder="Title" required>
            <input id="logs-header-written-by" class="form-inputbox" type="text" placeholder="Writer" required>
            <div id="logs-div-X"><img id="logs-div-moveable" src="./move.png"></img></div>
            <div id="logs-div-id">null</div>
            <div id="logs-div-Xout" class="form-Xout">✖</div>
        </section>
        <section id="logs-body" class="outlined">
            <div id="logs-input" contenteditable="true" data-text="Input text/image(s)"></div>
        </section>
        <section id="logs-footer" class="outlined">
            <button id="logs-submit" class="form-button">Submit log</button>
        </section>
    </div>`
    let logsDivNew = document.createElement('div')
    logsDivNew.innerHTML = logsDivInner
    logsDivNew.id = 'logs-div'
    logsDivNew.className = 'form'
    document.body.append(logsDivNew)
    // Make the DIV element draggable:
    dragElement(qSelect("#logs-div"));
    qSelect('#logs-div-id').innerHTML = id + '-' + makeid(6)
    qSelect("#logs-div-Xout").addEventListener("click", _ => qSelect('#logs-div').remove());
    if (newLogInputCollection != undefined) {
      newLogInputCollection.logs = new LogInput()
      newLogInputCollection.logs.id = newLogInputCollection.id
      updateLogInputUI(newLogInputCollection.logs)
      qSelect('#logs-submit').addEventListener(('click'), _ => {
        let dateTimePicker = qSelect('#logs-date')
        let header = qSelect('#logs-header-text')
        let writtenBy = qSelect('#logs-header-written-by')
        let dataField = qSelect('#logs-input')
        let idField = qSelect('#logs-div-id')
      
        if (addingLogInputTo != null && addingLogInputTo.split('-')[1] == 'log') {
            let logInput = new LogInput(idField.innerHTML,
                dataField.innerHTML,
                dateTimePicker.value == '' ? formattedYYYYMMDD(new Date()) : dateTimePicker.value,
                header.value,
                writtenBy.value)
            appendLog(logInput, addingLogInputTo)
            addingLogInputTo = null
            newLogInputCollection = null
            return;
        }
        newLogInputCollection.logs.header = header.value
        newLogInputCollection.logs.writtenBy = writtenBy.value
        newLogInputCollection.logs.data = dataField.innerHTML
        newLogInputCollection.logs.id = idField.innerHTML
        if (dataField.innerHTML == '' || header.value == '' || writtenBy.value == '' || idField.innerHTML == '') {
            alert('Missing inputs');
            return
        }
        newLogInputCollection.date = formattedYYYYMMDD(new Date())
        newLogInputCollection.logs.date = dateTimePicker.value == '' ? formattedYYYYMMDD(new Date()) : dateTimePicker.value
        submitLogCollection()
      })
    }
}

const showAddCollection = _ => {
  qSelect('#new-logs-entry') != null ? qSelect('#new-logs-entry').remove() : null;
  qSelect('#logs-div') != null ? qSelect('#logs-div').remove() : null;
  let logDivInner = `
  <div id="new-logs-div-Xout" class="form-Xout">✖</div>
  <div id="new-logs">
      <span id="new-logs-type">Select log type</span>
      <text id="new-logs-value">Singular</text>
      <div id="new-logs-type-dropdown">
          <p id="new-logs-singular" class="background-on-hover">Singular</p>
          <p id="new-logs-collection" class="background-on-hover">Collection</p>
      </div>
  </div>
  <text id="new-logs-selected-adder-id"></text>
  <input type="date" id="collection-date" class="form-inputbox">
  <button id="new-log-continue" class="form-button">Continue</button>`
  let logDiv = document.createElement('div')
  logDiv.innerHTML = logDivInner;
  logDiv.id = 'new-logs-entry'
  document.body.append(logDiv)
  qSelect('#collection-date').value = formattedYYYYMMDD(new Date())

  qSelect("#new-logs-singular").addEventListener('click', _ => {
    qSelect("#new-logs-value").innerHTML = 'Singular'
    let coldate = qSelect('#collection-date')
    coldate.style.visibility = 'hidden'
    coldate.style.opacity = 0
  })
  
  qSelect("#new-logs-collection").addEventListener('click', _ => {
    qSelect("#new-logs-value").innerHTML = 'Collection'
    let coldate = qSelect('#collection-date')
    qSelect('#collection-date').value = formattedYYYYMMDD(new Date())
    coldate.style.visibility = 'visible'
    coldate.style.opacity = 1
  })
  
  qSelect('#new-log-continue').addEventListener('click', _ => {
    let val = qSelect("#new-logs-value").innerHTML
    if (val == 'Collection') {
        newLogInputCollection.logs = []
        newLogInputCollection.date = qSelect('#collection-date').value
        submitLogCollection(newLogInputCollection)
    }
    if (val == 'Singular') {
        newLogInputCollection.logs = new LogInput()
        newLogInputCollection.logs.id = newLogInputCollection.id
        updateLogInputUI(newLogInputCollection.logs)
        let logDiv = qSelect('#logs-div')
        logDiv.style.visibility = 'visible'
        logDiv.style.opacity = 1;
    }
    qSelect('#new-logs-entry').remove();
  })
  
  qSelect('#new-logs-div-Xout').addEventListener('click', _ => {
    qSelect('#new-logs-entry').remove()
    addingLogInputTo = null
    newLogInputCollection = null
  })
}

const updateLogInputUI = logInput => {
  let dateTimePicker = qSelect('#logs-date')
  let header = qSelect('#logs-header-text')
  let writtenBy = qSelect('#logs-header-written-by')
  let dataField = qSelect('#logs-input')
  let idField = qSelect('#logs-div-id')
  dateTimePicker.value = formattedYYYYMMDD(new Date())
  header.value = logInput.header === undefined ? null : logInput.header
  dataField.innerHTML = logInput.data === undefined ? null : logInput.data
  writtenBy.value = logInput.writtenBy === undefined ? null : logInput.writtenBy
  idField.innerHTML = logInput.id === undefined ? null : logInput.id + '-' + makeid(6)
}

const appendLog = async (logInput, origin) => {
  fetch('http://localhost:8383/logupsert/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(logInput)
  });

  getSidebar()
}

const submitLogCollection = async _ => {
  fetch('http://localhost:8383/logcolupsert/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(newLogInputCollection)
  });

  getSidebar()
}

const remEntry = async (id, origin) => {
  if (confirm(`Do you really want to delete '${id}'?`) == true) {
      fetch('http://localhost:8383/removeentry/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: origin == null ? JSON.stringify({id}) : JSON.stringify({origin: id})
      });
      setTimeout(()=> { 
        getSidebar()
      }, 1000);
  }
}