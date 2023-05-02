
class Machine {
    name;
    id;
    createdBy;
    creationDate;
    logs;
    belonging;
    constructor(name, id, createdBy, creationDate, logs, belonging) {
        this.name = name;
        this.id = id;
        this.createdBy = createdBy;
        this.creationDate = creationDate;
        this.logs = logs;
        this.belonging = belonging;
    }
}

const newMachine = machine => {
    let machineBoxInner = `
        <div id="new-machine-header" class="form-header">New data input</div>
        <div id="new-machine-Xout" class="form-Xout">✖</div>
        <input id="new-machine-name" class="form-inputbox" type="text" placeholder="Data name" oninput="this.setCustomValidity('Machine name')" required>
        <input id="new-machine-creation-date" class="form-inputbox" type="date" required>
        <input id="new-machine-belonging" class="form-inputbox" type="text" placeholder="Sort tag" oninput="this.setCustomValidity('Sort tag')" required>
        <input id="new-machine-created-by" class="form-inputbox" type="text" placeholder="Created by" oninput="this.setCustomValidity('Created by')" required>
        <button id="new-machine-submit" class="form-button" type="button">Submit machine</button>`
    let machineBox = document.createElement('form')
    machineBox.innerHTML = machineBoxInner
    machineBox.id = 'new-machine'; machineBox.className = 'form-form';
    document.body.append(machineBox)
    machine != undefined ? qSelect('#new-machine-belonging').value = machine.belonging : undefined
    qSelect('#new-machine-creation-date').value = formattedYYYYMMDD(new Date())
    qSelect('#new-machine-Xout').addEventListener('click', _ => {clearNewMachine()})
    qSelect('#new-machine-submit').addEventListener('click', _ => {
        let newMachineDate = qSelect('#new-machine-creation-date');
        let newMachineName = qSelect('#new-machine-name');
        let newMachineCreatedBy = qSelect('#new-machine-created-by')
        newMachineElement = new Machine()
        newMachineElement.createdBy = newMachineCreatedBy.value
        newMachineElement.name = newMachineName.value
        newMachineElement.creationDate = newMachineDate.valueAsDate
        newMachineElement.belonging = qSelect('#new-machine-belonging').value
        if (newMachineDate.value == '' || newMachineName.value == '' || newMachineCreatedBy.value == '') { alert('Missing inputs'); return }
        submitMachine()
    })
}

const clearNewMachine = _ => {
    let newMachine = qSelect('#new-machine')
    qSelect('#new-machine').remove();
    newMachine.childNodes.forEach(element => {
        element.value = null
    })
    newMachineElement = new Machine()
}

var newMachineElement = new Machine()

const submitMachine = async machine => {
    newMachineElement.id = qSelect('#new-machine-name').value;
    newMachineElement.logs = []
    socket.emit('machine-upsert', newMachineElement)
    clearNewMachine();
}