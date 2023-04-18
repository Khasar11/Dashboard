'use strict'

var currentDisplayData;
var currentDisplay;
const initData = {
	nodes: [],
	links: []
}

const display = qSelect('#display')
const Graph = ForceGraph()(display)
		.graphData(initData)
		.nodeLabel(d => { return d.key+' : '+d.value})
    .onNodeDragEnd(node => {
      node.fx = node.x;
      node.fy = node.y;
    })
		.linkDirectionalArrowLength(3)
		.nodeCanvasObject((node, ctx, globalScale) => {
			const label = node.key;
			const label2 = node.value == '+0' ? 'false' : node.value == '+1' ? 'true' : node.value == '-' ? '' : node.value;
			const fontSize = 10/globalScale;
			ctx.font = `${fontSize}px Sans-Serif`;
			const textWidth = ctx.measureText(label).width;
			const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = fixColorKey(node.value);
			ctx.fillText(label, node.x, node.y);
			ctx.fillStyle = fixColor(node.value);
			ctx.fillText(label2, node.x, node.y+bckgDimensions[1]);

			node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
		})
		.nodePointerAreaPaint((node, color, ctx) => {
			ctx.fillStyle = color;
			const bckgDimensions = node.__bckgDimensions;
			bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
		});

const N = 80;

Graph.cooldownTime(Infinity)
		.d3AlphaDecay(0)
		.d3VelocityDecay(0.2)
		.d3Force('center', null)
		.d3Force('charge', null)
		.d3Force('collide', d3.forceCollide(Graph.nodeRelSize()*2))

var displayData = qSelect('#display-data')

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

var nodes 	 = [];
var nodeLinks= [];

const nodeUpsertSimple = (input, index) => {
	if (index != -1) {
		nodes[index].value = input.value
		nodes[index].links = input.links
	}
	else
		nodes.push(input);
}

const startDisplaySubscription = id => {
	currentDisplay = id;
	showCenteredLoading()
	socket.emit('subscribe-display', id, res => { // socket io 
		console.log(res)
	})

	socket.on('subscribe-update', arg => { // waiting for server to send data from opc 
		if (qSelect('#loading-grid') != null) qSelect('#loading-grid').remove() // removes loading grid on 
		if (arg == undefined) return;
		const tryFind = nodes.findIndex(x => x.key == arg[0]);
		console.log(arg[2])
		if (arg[1].includes('.') && arg[1].includes('E+'))
			nodeUpsertSimple({id: tryFind != -1 ? tryFind : nodes.length, key: arg[0], value: ((arg[1])/10).toFixed(5), links: arg[2]}, tryFind)
		else 
			nodeUpsertSimple({id: nodes.length, key: arg[0], value: arg[1], links: arg[2]}, tryFind)

		parseLinks()

		let nodeLinksCopy = JSON.parse(JSON.stringify(nodeLinks))

		Graph.graphData({
			nodes: nodes,
			links: nodeLinksCopy
		})
	})
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
					nodeLinks[index2] = toUpsert : nodeLinks.push(toUpsert);
			}
		}
		i++;
	}
}

const fixColor = dvalue => { // fixes color values for string variable from opc
	dvalue = parseFloat(dvalue)
	if (String(dvalue).includes('.') || String(dvalue).substring(0,1).includes('N'))
		return '#9b34eb'
	if (dvalue > 1 && dvalue < 16384)
		return '#ff00ff'
	if (dvalue == '0' || !dvalue) 
	  return 'red'
	if (dvalue == '1' || dvalue) 
	  return 'green'
	return 'teal'
}

const fixColorKey = dvalue => {
	if (dvalue == '-') return 'black'
	return '#636363'
}