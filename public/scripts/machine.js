
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

document.getElementById('new-machine-Xout').addEventListener('click', function() {
    let newMachine = document.getElementById('new-machine')
    newMachine.style.opacity = 0
    newMachine.style.visibility = 'hidden'
    newMachine.childNodes.forEach(element => {
        element.value = null
    })
    document.getElementById('new-machine-creation-date').value = formattedYYYYMMDD(new Date())
})

document.getElementById('new-machine-creation-date').value = formattedYYYYMMDD(new Date())

var newMachineElement = new Machine()

document.getElementById('new-machine-submit').addEventListener('click', function() {
    newMachineElement = new Machine()
    newMachineElement.createdBy = document.getElementById('new-machine-created-by').value
    newMachineElement.name = document.getElementById('new-machine-name').value
    newMachineElement.creationDate = document.getElementById('new-machine-creation-date').value
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
}