
class Machine {

    name;
    id;
    createdBy;
    creationDate;
    logs;

    constructor(name, id, createdBy, creationDate, logs) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
    }
}

function newMachine() {
    let machineBoxInner = `
        <div id="new-machine-header" class="form-header">New machine</div>
        <div id="new-machine-Xout" class="form-Xout">✖</div>
        <input id="new-machine-name" class="form-inputbox" type="text" placeholder="Machine name" oninput="this.setCustomValidity('Machine name')" required>
        <input id="new-machine-creation-date" class="form-inputbox" type="date" required>
        <input id="new-machine-created-by" class="form-inputbox" type="text" placeholder="Created by" oninput="this.setCustomValidity('Created by')" required>
        <button id="new-machine-submit" class="form-button" type="button">Submit machine</button>`
    let machineBox = document.createElement('form')
    machineBox.innerHTML = machineBoxInner
    machineBox.id = 'new-machine'; machineBox.className = 'form-form';
    document.body.append(machineBox)
    qSelect('#new-machine-creation-date').value = formattedYYYYMMDD(new Date())
    qSelect('#new-machine-Xout').addEventListener('click', function() {clearNewMachine()})
    qSelect('#new-machine-submit').addEventListener('click', function() {
        let newMachineDate = qSelect('#new-machine-creation-date');
        let newMachineName = qSelect('#new-machine-name');
        let newMachineCreatedBy = qSelect('#new-machine-created-by')
        newMachineElement = new Machine()
        newMachineElement.createdBy = newMachineCreatedBy.value
        newMachineElement.name = newMachineName.value
        newMachineElement.creationDate = newMachineDate.value
        if (newMachineDate.value == '' || newMachineName.value == '' || newMachineCreatedBy.value == '') { alert('Missing inputs'); return }
        submitMachine()
    })
}

function clearNewMachine() {
    let newMachine = qSelect('#new-machine')
    qSelect('#new-machine').remove();
    newMachine.childNodes.forEach(element => {
        element.value = null
    })
}

var newMachineElement = new Machine()

async function submitMachine(machine) {
    // update id first
    const baseUrl = `http://localhost:8383/idfy/${qSelect('#new-machine-name').value}`

  let data = await fetch(baseUrl, {
    method: 'GET'
  }).then((response) => response.text())
  .then(data => { return data; })
  .catch(error => { console.error(error); });

  newId = JSON.parse(data);

  newMachineElement.id = newId.id;
  newMachineElement.logs = []
  console.log(newMachineElement)
  console.log('new machine submitted')

  fetch('http://localhost:8383/machineupsert/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMachineElement)
  });

  clearNewMachine();
  getSidebar()
}