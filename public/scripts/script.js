const makeid = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const formattedYYYYMMDD = (nowDate) => {
  return nowDate.getFullYear() + '-' + ('0' + (nowDate.getMonth()+1)).slice(-2) + '-' + ('0' + nowDate.getDate()).slice(-2);
}

const qSelect = (query) => {
    return document.querySelector(query)
}

const showCenteredLoading = () => {
	let loading = document.createElement('div')
	loading.className = 'lds-grid'
	loading.id = 'loading-grid'
	for(let i=0; i<9; i++) {
		let subp = document.createElement('div')
		loading.append(subp)
	}
	document.body.prepend(loading)
}

var socket = io();
socket.on('alert', async (arg, callback) => {
  alert(arg)
})

const setCaret = (elem, caret) => {
  elem.setSelectionRange(caret, caret);
}