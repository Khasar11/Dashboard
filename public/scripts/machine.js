
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

newMachine();

function newMachine() {
    let machineBox = qSelect('#new-machine')
    machineBox.style.visibility = 'visible'
    machineBox.style.opacity = 1;
}

clearNewMachine();

qSelect('#new-machine-Xout').addEventListener('click', function() {clearNewMachine()})

function clearNewMachine() {
    let newMachine = qSelect('#new-machine')
    newMachine.style.opacity = 0
    newMachine.style.visibility = 'hidden'
    newMachine.childNodes.forEach(element => {
        element.value = null
    })
    qSelect('#new-machine-creation-date').value = formattedYYYYMMDD(new Date())
}

qSelect('#new-machine-creation-date').value = formattedYYYYMMDD(new Date())

var newMachineElement = new Machine()

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