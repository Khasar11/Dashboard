'use strict'

var currentDisplayData;
var currentDisplay;
let simulation = undefined;
let svg = d3.select('body').append('svg').attr('id', 'main-svg')
let elemLinks = svg.append('g').attr('id', 'node-links')
let elemCircles = svg.append('g').attr('id', 'node-circles')
let elemKeys = svg.append('g').attr('id', 'node-keys')
let elemValues = svg.append('g').attr('id', 'node-values')
let displayData = qSelect('#display-data')
let links, circles, keys, values = undefined;
let nodes 	 = [];
let nodeLinks= [];

qSelect('#display-data-Xout').addEventListener('click', () => {clearDisplayData()})

function clearDisplayData() {
	displayData.style.visibility = 'hidden'
	displayData.style.opacity = 0
	displayData.childNodes.forEach(e => {
		e.value = ''
	}) 
	currentDisplayData = null 
}

qSelect('#display-data-submit').addEventListener('click', () => {
	setDisplayData(currentDisplayData)
})

async function setDisplayData(id) {

	let submission = {
		id: id,
		endpoint:    encodeURIComponent(qSelect('#display-data-endpturl').value),
		nodeAddress: encodeURIComponent(qSelect('#display-data-opc-adr').value),
		username:    encodeURIComponent(qSelect('#display-data-opc-username').value),
		password:    encodeURIComponent(qSelect('#display-data-opc-password').value)
	}

	let actSubmission = JSON.stringify(submission)

	const baseUrl = `http://localhost:8383/writeDisplayData/${actSubmission}`
	fetch(baseUrl, {
			method: 'GET'
		}).then((response) => response.text())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});

	clearDisplayData() 
}

async function modifyDisplay(id) {
	currentDisplayData = id;
	await updateDisplayData(id)
	displayData.style.visibility = 'visible'
	displayData.style.opacity = 1
}

async function updateDisplayData(id) {
	const baseUrl = `http://localhost:8383/displayData/${id}`
	let data = await fetch(baseUrl, {
			method: 'GET'
		}).then((response) => response.text())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});

	const returnData = JSON.parse(JSON.parse(data));

	qSelect("#display-data-endpturl").value = returnData["endpoint"]
	qSelect("#display-data-opc-adr").value = returnData["nodeAddress"]
	qSelect("#display-data-opc-username").value = returnData["username"]
	qSelect("#display-data-opc-password").value = returnData["password"]
} 

function upsert(array, element) { // upserts object by .key//
  const i = array.findIndex(_element => _element.key === element.key)
	if (i > -1) array[i] = element;
  else array.push(element);
}

const ticked = _ => {
	links
		.attr('x1', d => { return d.source.x })
		.attr('y1', d => { return d.source.y })
		.attr('x2', d => { return d.target.x })
		.attr('y2', d => { return d.target.y })

	circles
		.classed("fixed", d => d.fx !== undefined)
		.attr('cx', d => { return d.x })
		.attr('cy', d => { return d.y })

	keys
		.attr('x', d => { return d.x })
		.attr('y', d => { return d.y })

	values
		.attr('x',    d => { return d.x })
		.attr('y',    d => { return d.y +10 }) 
}

const startDisplaySubscription = id => {
	currentDisplay = id;
	showCenteredLoading()
	socket.emit('subscribe-display', id, res => { // socket io 
		console.log(res)
	})

	simulation = d3.forceSimulation().nodes(nodes)

	socket.on('subscribe-update', arg => { // waiting for server to send data from opc 
		if (qSelect('#loading-grid') != null) qSelect('#loading-grid').remove() // removes loading grid on 
		if (arg == undefined) return;
		if (arg[1].includes('.') && arg[1].includes('E+')) { // fix float numbers 
			upsert(nodes, {key: arg[0], value: ((arg[1])/10).toFixed(5), links: arg[2]})
		}
		else {
			upsert(nodes, {key: arg[0], value: arg[1], links: arg[2]})
		}

		parseLinks()

		let nodeLinksCopy = JSON.parse(JSON.stringify(nodeLinks))

		elemLinks
  		.selectAll("line")
  		.data(nodeLinksCopy)
  		.enter().append("line")
			.classed("node-link", true)

		elemCircles
  			.selectAll("circle")
  			.data(nodes)
  			.enter().append("circle")
			.classed("node-circle", true)
			.attr('r', 18)
			.attr('cx', d => { return d.cx })
			.attr('cy', d => { return d.cy })
			.call(drag).on("click", click)

		elemKeys
			.selectAll('text')
			.data(nodes)
			.enter().append('text')
			.classed('node-key', true)
			.attr('x', d => { return d.x })
			.attr('y', d => { return d.y })
			.html(d => { return d.key })

		elemValues
			.selectAll('text')
			.data(nodes)
			.enter().append('text')
			.attr('font-weight', 'bold')
			.attr('id', d => {return 'values-'+d.key})
			.html(d => { return d.value == '+0' ? 'false' : d.value == '+1' ? 'true' : d.value })
			.attr('x', d => { return d.x })
			.attr('y', d => { return d.y })
			.attr('fill', d => fixColor(d.value))
			.classed('node-value', true)

		values = elemValues.selectAll('text')
		links = elemLinks.selectAll('line')
		keys = elemKeys.selectAll('text')
		circles = elemCircles.selectAll('circle')

		elemValues.selectAll('#values-'+arg[0])
			.text(d => { return d.value == '+0' ? 'false' : d.value == '+1' ? 'true' : d.value }).
			attr('fill', d => fixColor(d.value))

		simulation
			.nodes(nodes)
			//.force("charge", d3.forceManyBody().strength(-1000))
			//.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeigh / 2))
			.force("link", d3.forceLink(nodeLinksCopy).distance(50))
			.on('tick', ticked)
	})

	setTimeout(_ => {
		socket.emit('subscribe-terminate')
	}, 30000)
}

const parseLinks = _ => { // parse linkage tag array to numbered linkage key value pair collection array
	let i = 0;
	let nodeKeys = []
	nodes.forEach(n => nodeKeys.push(n.key))
	for (const node of nodes) {
		for (const link of node.links) {
			let index = nodeKeys.indexOf(link)
			if (index != -1) {
				let index2 = nodeLinks.findIndex(x => x.source == i && x.target == index);
				let toUpsert = {source: i, target: index};
				index2 != -1 ? 
					nodeLinks[index2] = toUpsert : nodeLinks.push(toUpsert); //must be upserted into array somehow
			}
		}
		i++;
	}
}

const fixColor = dvalue => { // fixes color values for string variable from opc
	dvalue = parseFloat(dvalue)
	if (String(dvalue).includes('.'))
		return '#9b34eb'
	if (dvalue > 1 && dvalue < 16384)
		return '#ff00ff'
	if (dvalue == '0' || !dvalue) 
	  return 'red'
	if (dvalue == '1' || dvalue) 
	  return 'green'
	return 'teal'
}

const handleZoom = (e) => {
	d3.selectAll('svg line')
		.attr('transform', e.transform);
	d3.selectAll('svg circle')
		.attr('transform', e.transform);
	d3.selectAll('svg text')
		.attr('transform', e.transform);
}

let zoom = d3.zoom()
	.on('zoom', handleZoom);

const initZoom = _ => {
	d3.selectAll('svg')
		.call(zoom);
}

initZoom();

const center = _ => {
	d3.select('svg')
		.transition()
		.call(zoom.translateTo, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
}

document.addEventListener('keydown', function(event) {
	if (event.code == 'KeyH') {
		center();
	}
});

const dragstart = _ => {
	d3.select().classed("fixed", true);
}

const clamp = (x, lo, hi) => {
	return x < lo ? lo : x > hi ? hi : x;
}

const dragged = (event, d) => {
	d.fx = clamp(event.x, 0, qSelect('#main-svg').innerWidth);
	d.fy = clamp(event.y, 0, qSelect('#main-svg').innerHeight);
	simulation.alpha(1).restart();
}

const drag = d3
		.drag()
		.on("start", dragstart)
		.on("drag", dragged);
	
const click = (event, d) => {
	delete d.fx;
	delete d.fy;
	d3.select().classed("fixed", false);
	simulation.alpha(1).restart();
}


/* old

function copy(that) {
	var inp = document.createElement('input');
	document.body.appendChild(inp)
	inp.value = that.textContent
	inp.select();
	document.execCommand('copy', false);
	inp.remove();
}

var simulation;
var elemLinks;
var elemCircles;
var elemKeys;
var elemValues;
var currentDisplayData;
var currentDisplay;
var svg = d3.select('#main-svg');
displayData = qSelect('#display-data')

qSelect('#display-data-Xout').addEventListener('click', () => {clearDisplayData()})

function clearDisplayData() {
	displayData.style.visibility = 'hidden'
	displayData.style.opacity = 0
	displayData.childNodes.forEach(e => {
		e.value = ''
	}) 
	currentDisplayData = null 
}

qSelect('#display-data-submit').addEventListener('click', () => {
	setDisplayData(currentDisplayData)
})

async function setDisplayData(id) {

	let submission = {
		id: id,
		endpoint:    encodeURIComponent(qSelect('#display-data-endpturl').value),
		nodeAddress: encodeURIComponent(qSelect('#display-data-opc-adr').value),
		username:    encodeURIComponent(qSelect('#display-data-opc-username').value),
		password:    encodeURIComponent(qSelect('#display-data-opc-password').value)
	}

	let actSubmission = JSON.stringify(submission)

	const baseUrl = `http://localhost:8383/writeDisplayData/${actSubmission}`
	fetch(baseUrl, {
			method: 'GET'
		}).then((response) => response.text())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});

	clearDisplayData() 
}

async function modifyDisplay(id) {
	currentDisplayData = id;
	await updateDisplayData(id)
	displayData.style.visibility = 'visible'
	displayData.style.opacity = 1
}

async function updateDisplayData(id) {
	const baseUrl = `http://localhost:8383/displayData/${id}`
	let data = await fetch(baseUrl, {
			method: 'GET'
		}).then((response) => response.text())
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(error);
		});

	const returnData = JSON.parse(JSON.parse(data));

	qSelect("#display-data-endpturl").value = returnData["endpoint"]
	qSelect("#display-data-opc-adr").value = returnData["nodeAddress"]
	qSelect("#display-data-opc-username").value = returnData["username"]
	qSelect("#display-data-opc-password").value = returnData["password"]
} 

let nodes = [];
let links = [];

function upsert(array, element) { // (1)
  const i = array.findIndex(_element => _element[0] === element[0]);
  if (i > -1) array[i] = element; // (2)
  else array.push(element);
}

async function startDisplaySubscription(id) {
	currentDisplay = id;
	let loading = document.createElement('div')
	loading.className = 'lds-grid'
	loading.id = 'loading-grid'
	for(i=0; i<9; i++) {
		let subp = document.createElement('div')
		loading.append(subp)
	}
	document.body.prepend(loading)
	socket.emit('subscribe-display', id, res => { // socket io 
		console.log(res)
	}) 

	socket.on('subscribe-update', async arg => {
		if (qSelect('#loading-grid') != null) qSelect('#loading-grid').remove()
		console.log(arg)
		upsert(nodes, arg)
		console.log(nodes)
	})

	setTimeout(() => {
		socket.emit('subscribe-terminate', id => {
			console.log('Subscription terminate')
		}) 
	}, 20000);

	
	links = returnData.links;
	nodes = returnData.nodeObjects;

	qSelect('#main-svg').innerHTML = ''


	elemLinks = svg
		.append("g")
		.attr("id", "links")
  		.selectAll("line")
  		.data(links)
  		.enter().append("line");

	elemCircles = svg
		.append("g")
		.attr("id", "nodes")
  		.selectAll("circle")
  		.data(nodes)
  		.enter().append("circle")
		.classed("node", true)
		.attr('r', 18)
		.call(drag).on("click", click)

	elemKeys = svg
		.append('g')
		.attr('id', 'keys')
		.selectAll('.node-key')
		.data(nodes)
		.enter().append('text')
		.classed('.node-key', true)
		.text(d => { return d.name })

	elemValues = svg
		.append('g')
		.attr('id', 'values')
		.selectAll('.node-values')
		.data(nodes)
		.enter().append('text')
		.attr('font-weight', 'bold')
		.classed('node-values', true)
	}

	setInterval(async () => { // re-fetch data on time
		if (currentDisplay != null) {
			const baseUrl = `http://localhost:8383/display/${currentDisplay}`
	
			let data = await fetch(baseUrl, {
				method: 'GET'
			}).then((response) => response.text())
			.then(data => {
				return data;
			})
			.catch(error => {
				console.error(error);
			});
	
			const returnData = JSON.parse(data);
	
			nodes = returnData.nodeObjects;
	
			let elems = document.getElementsByClassName("node-values");
			Array.prototype.forEach.call(elems, (e, i) => {
				if (nodes[i].value != undefined) {
					e.innerHTML = nodes[i].value
					e.setAttribute('fill', fixColor(nodes[i].value))
				}
			});
		}
	}, 5000); 
	
	async function ticked() {
		elemLinks
			.attr('x1', d => { return d.source.x })
			.attr('y1', d => { return d.source.y })
			.attr('x2', d => { return d.target.x })
			.attr('y2', d => { return d.target.y });
	
		elemCircles
			.classed("fixed", d => d.fx !== undefined)
			.attr('cx', d => { return d.x })
			.attr('cy', d => { return d.y })
	
		elemKeys
			.attr('x', d => { return d.x })
			.attr('y', d => { return d.y })
	
		elemValues
			.text(	   	  d => { return d.value })
			.attr('fill', d => fixColor(d.value))
			.attr('x',    d => { return d.x })
			.attr('y',    d => { return d.y +10 })
	}
	
	const drag = d3
		.drag()
		.on("start", dragstart)
		.on("drag", dragged);
	
	function click(event, d) {
		delete d.fx;
		delete d.fy;
		d3.select(this).classed("fixed", false);
		simulation.alpha(1).restart();
	}
	
	function dragstart() {
		d3.select(this).classed("fixed", true);
	}
	
	function dragged(event, d) {
		d.fx = clamp(event.x, 0, window.innerWidth);
		d.fy = clamp(event.y, 0, window.innerHeight);
		simulation.alpha(1).restart();
	}
	
	function clamp(x, lo, hi) {
		return x < lo ? lo : x > hi ? hi : x;
	}
	
	function fixColor(dvalue) {
		if (typeof dvalue === 'string' && dvalue.includes('#'))
			return '#ff00ff'
		if (dvalue == 'false' || !dvalue) 
			return 'red'
		if (dvalue == 'true' || dvalue && !(typeof dvalue === 'number')) 
			return 'green'
		return 'teal'
	}

*/