
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
    let machineBox = document.getElementById('new-machine')
    machineBox.style.visibility = 'visible'
    machineBox.style.opacity = 1;
}

document.getElementById('new-machine-Xout').addEventListener('click', function() {clearNewMachine()})

function clearNewMachine() {
    let newMachine = document.getElementById('new-machine')
    newMachine.style.opacity = 0
    newMachine.style.visibility = 'hidden'
    newMachine.childNodes.forEach(element => {
        element.value = null
    })
    document.getElementById('new-machine-creation-date').value = formattedYYYYMMDD(new Date())
}

document.getElementById('new-machine-creation-date').value = formattedYYYYMMDD(new Date())

var newMachineElement = new Machine()

document.getElementById('new-machine-submit').addEventListener('click', function() {
    let newMachineDate = document.getElementById('new-machine-creation-date');
    let newMachineName = document.getElementById('new-machine-name');
    let newMachineCreatedBy = document.getElementById('new-machine-created-by')
    newMachineElement = new Machine()
    newMachineElement.createdBy = newMachineCreatedBy.value
    newMachineElement.name = newMachineName.value
    newMachineElement.creationDate = newMachineDate.value
    if (newMachineDate.value == '' || newMachineName.value == '' || newMachineCreatedBy.value == '') { alert('Missing inputs'); return }
    submitMachine()
})

async function submitMachine(machine) {
    // update id first
    const baseUrl = `http://localhost:8383/idfy/${document.getElementById('new-machine-name').value}`

  let data = await fetch(baseUrl, {
    method: 'GET'
  }).then((response) => response.text())
  .then(data => { return data; })
  .catch(error => { console.error(error); });

  newId = JSON.parse(data);

  newMachineElement.id = newId.id;
  console.log(newMachineElement)
  console.log('new machine submitted')
  clearNewMachine();
}