'use strict'

var currentDisplayData;
var currentDisplay = undefined;
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
		.linkDirectionalArrowLength(6)
		.nodeCanvasObject((node, ctx, globalScale) => {
			const label = node.key;
			const label2 = node.value == '+0' ? 'false' : node.value == '+1' ? 'true' : node.value == '-' ? '' : node.value;
			const fontSize = 10/globalScale;
			ctx.font = `${fontSize}px Sans-Serif`;
			const textWidth = ctx.measureText(label).width;
			const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'white';
			ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
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
		.d3VelocityDecay(0.4)
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
var parsedLinks = [];

const nodeUpsertSimple = (input, index) => {
	if (index != -1) {
		nodes[index].value = input.value
	}
	else
		nodes.push(input);
}

const parseLinks = links => {
	let newLinks = []
	links.forEach(l => {
		let sourceIndex = nodes.findIndex(node => node.key == l.source)
		let targetIndex = nodes.findIndex(node => node.key == l.target)
		if (sourceIndex != -1 && targetIndex != -1) newLinks.push({source: sourceIndex, target: targetIndex})  
	})
	return newLinks;
}

setInterval(() => {
	socket.emit('log',currentDisplay)
	if (currentDisplay != undefined) {
		socket.emit('log', 'caching data')
		cacheJS.set('display-'+currentDisplay+'-links', parsedLinks)
		cacheJS.set('display-'+currentDisplay+'-nodes', nodes)
	}
}, 30000)

const startDisplaySubscription = async id => {
	currentDisplay = id;
	showCenteredLoading()
	qSelect('#header').style.visibility = 'visible'
	qSelect('#header').style.opacity = 1
	qSelect('#header-text').innerHTML = id
	socket.emit('subscribe-display', id, res => { // socket io 
		console.log(res)
	})

	let cachedLinks = cacheJS.get('display-'+currentDisplay+'-links')
	let cachedNodes = cacheJS.get('display-'+currentDisplay+'-nodes')

	if (cachedLinks != null && cachedNodes != null) {
		nodes = cachedNodes
		Graph.graphData({
			nodes: nodes,
			links: cachedLinks
		})
	}

	socket.on('subscribe-link', arg => {
		const tryFind = nodeLinks.findIndex(x => x.source == arg.source && x.target == arg.target)
		if (tryFind == -1) nodeLinks.push(arg)
		else nodeLinks[tryFind] = arg
		parsedLinks = parseLinks(nodeLinks)
		let redoLinkage = false;
		for (let i=0; i<parsedLinks.length; i++) 
			if (cachedLinks == null || cachedLinks[i] == null || (parsedLinks[i].source != cachedLinks[i].source.id || parsedLinks[i].target != cachedLinks[i].target.id))
				redoLinkage = true; 
		Graph.graphData({
			nodes: Graph.graphData().nodes,
			links: !redoLinkage ? Graph.graphData().links : parsedLinks
		}) 
	})

	socket.on('subscribe-update', arg => { // waiting for server to send data from opc 
		if (qSelect('#loading-grid') != null) qSelect('#loading-grid').remove() // removes loading grid on 
		if (arg == undefined) return;
		const tryFind = nodes.findIndex(x => x.key == arg[0]);
		if (arg[1].includes('.') && arg[1].includes('E+'))
			nodeUpsertSimple({id: tryFind != -1 ? tryFind : nodes.length, key: arg[0], value: ((arg[1])/10).toFixed(5)}, tryFind)
		else 
			nodeUpsertSimple({id: nodes.length, key: arg[0], value: arg[1]}, tryFind)

		Graph.graphData({
			nodes: nodes,
			links: Graph.graphData().links
		})
	})
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