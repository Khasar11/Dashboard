'use strict'

var currentDisplayData;
var currentDisplay = undefined;
const initData = {
	nodes: [],
	links: []
}

const display = qSelect('#display')
let Graph = ForceGraph()(display)
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
			ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, fontSize*2);
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

var displayData = undefined

const clearDisplayData = _ => {
	qSelect('#display-data').remove()
	currentDisplayData = null 
}

const setDisplayData = async id => {

	let submission = {
		id: id,
		endpoint:    encodeURIComponent(qSelect('#display-data-endpturl').value),
		nodeAddress: encodeURIComponent(qSelect('#display-data-opc-adr').value),
		username:    encodeURIComponent(qSelect('#display-data-opc-username').value),
		password:    encodeURIComponent(qSelect('#display-data-opc-password').value)
	}

	socket.emit('write-display-data', submission)

	clearDisplayData() 
}

const modifyDisplay = async id => {
	let formDisplayInner = `
    <div id="display-data-header" class="form-header">Display data</div>
    <div id="display-data-Xout" class="form-Xout">✖</div>
    <input id="display-data-endpturl" class="form-inputbox" type="text" placeholder="Endpoint url OPC" required oninput="this.setCustomValidity('OPC endpoint url')">
    <input id="display-data-opc-adr" class="form-inputbox" type="text" placeholder="OPC DB address" required oninput="this.setCustomValidity('OPC node address')">
    <input id="display-data-opc-username" class="form-inputbox" type="text" placeholder="OPC username" required oninput="this.setCustomValidity('OPC username')">
    <input id="display-data-opc-password" class="form-inputbox" type="password" placeholder="OPC password" required oninput="this.setCustomValidity('OPC password')">
    <button id="display-data-submit" class="form-button" type="button">Submit display</button>`
	let formDisplay = document.createElement('form')
	formDisplay.id = 'display-data'
	formDisplay.className = 'form-form'
	formDisplay.innerHTML = formDisplayInner
	document.body.append(formDisplay)
	displayData = qSelect('#display-data')
	qSelect('#display-data-Xout').addEventListener('click', () => {clearDisplayData()})
	qSelect('#display-data-submit').addEventListener('click', () => {
		setDisplayData(currentDisplayData)
	})
	currentDisplayData = id;
	await updateDisplayData(id)
}

const updateDisplayData = async id =>  {
	socket.emit('request-displayData', id, returnData => {
		if (returnData == null) { alert('an unknown error occured, no data to display'); clearDisplayData(); return;}
		qSelect("#display-data-endpturl").value = decodeURIComponent(returnData["endpoint"])
		qSelect("#display-data-opc-adr").value = decodeURIComponent(returnData["nodeAddress"])
		qSelect("#display-data-opc-username").value = decodeURIComponent(returnData["username"])
		qSelect("#display-data-opc-password").value = decodeURIComponent(returnData["password"])
	})
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
	if (currentDisplay == null) return;
	if (currentDisplay != undefined) {
		cacheJS.set('display-'+currentDisplay+'-links', parsedLinks)
		cacheJS.set('display-'+currentDisplay+'-nodes', nodes)
	}
}, 30000)

const createSubscriptionHeader = _ => {
	let header = document.createElement('div')
	let headerText = document.createElement('p')
	let headerButtons = document.createElement('div')
	let headerStop = document.createElement('button')
	let headerReload = document.createElement('button')
	header.id = 'header'
	headerText.innerHTML = currentDisplay; headerStop.className = 'form-button'; headerStop.innerHTML = 'Stop'; headerStop.id = 'header-stop-subscription';
	headerReload.className = 'form-button'; headerReload.innerHTML = 'Reload'; headerReload.id = 'header-reload-data';
	headerStop.addEventListener('click', () => {
		header.remove();
		currentDisplay = undefined;
		Graph.graphData(initData)
		socket.emit('subscribe-terminate')
	})
	headerReload.addEventListener('click', () => {
		cacheJS.set('display-'+currentDisplay+'-links', null)
		cacheJS.set('display-'+currentDisplay+'-nodes', null)
		Graph.graphData(initData)
		nodes 	 = [];
		nodeLinks= [];
		parsedLinks = [];
		startDisplaySubscription(currentDisplay)
	})
	headerButtons.append(headerStop, headerReload); header.append(headerText, headerButtons); document.body.prepend(header)
}

const startDisplaySubscription = async id => {
	socket.emit('request-displayData', id, returnData => { 
		if (returnData['endpoint'] == '' || returnData['nodeAddress'] == '') {
			alert(`No display for ${id}`)
			return;
		}
		currentDisplay = id;
		createSubscriptionHeader()
		showCenteredLoading()
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

/* PNR
1,		Rå melk
2,		Termisert rå melk
3,		Rå fløte
4,		Mellomprodukt 10% Creme Fraiche
5,		Mellomprodukt Naturell yoghurt 3 %
6,		Mellomprodukt Fruktyoghurt
7,		Mellomprodukt Naturell yoghurt 3 %(ikke i bruk)
8,		Mellomprodukt Sprett yoghurt (ikke i bruk)
9,		Mellomprodukt Biola (ikke i bruk)
10,		Mellomprodukt Mild&Lett yoghurt (ikke i bruk)
11,		Mellomprodukt 18 % Creme Fraiche
13,		Supplerings Fløte
17,		Dyrefôr
18,		Restmelk
20,		2% melk til industri
21,		Helmelk
22,		Melk til Mellomprodukt Naturell yoghurt 3 %
23,		Lettmelk
24,		Skummet melk
25,		Ekstra lettmelk
26,		Melk til Mellomprodukt fruktyoghurt
27,		Melk til Mellomprodukt Naturell yoghurt 3 %(ikke i bruk)
28,		Melk til Mellomprodukt Sprett (ikke i bruk)
29,		Melk til Mellomprodukt Biola (ikke i bruk)
30,		Melk til Mild&Lett yoghurt (ikke i bruk)
31,		Kremfløte
32,		Fløte til supplering
33,		Fløte til lagring/repasteurisering
34,		Økologisk fløte til lagring/repasteurisering
35,		Fløte til 10% Creme Fraiche mellomprodukt
36,		Fløte til 18% Creme Fraiche mellomprodukt
41,		Seterrømme
42,		Lettrømme
43,		Creme Fraiche
44,		Økologisk Lettrømme
45,		10% Creme Fraiche
46,		18% Creme Fraiche
51,		Økologisk Kefir
52,		Skummet Kultur
53,		Kulturmelk
55,		Biola (ikke i bruk)
61,		Naturell yoghurt 3 %
62,		Fruktyoghurt
63,		Naturell yoghurt 3 % (ikke i bruk)
64,		Sprett yoghurt (ikke i bruk)
66,		Mild&Lett yoghurt (ikke i bruk)
72,		Original appelsinjuice
73,		Supri Frukt- og Grønnsaksjuice 
76,		IsTe fersken
77,		Original eplejuice
79,		Sprett epledrikk (ikke i bruk)
80,		Tropisk orginal m/ eple og appelsin
81,		Økologisk Eplejuice (ikke i bruk)
82,		Original appelsinjuice m/fruktkjøtt
83,		Sprett tropisk drikk (ikke i bruk)
84,		Økologisk appelsinjuice (ikke i bruk)
85,		Konsentrat appelsinjuice
88,		IsTe lime
88,		Konsentrat IsTe lime
89,		Konsentrat IsTe fersken
90,		Konsentrat eplejuice (var også til Sprett epledrikk)
93,		Konsentrat Tropisk orginal (skal tilsettes eple og app)
94,		Konsentrat Lett eple fruktdrikk (ikke i bruk)
95,		Konsentrat appelsinjuice m/fruktkjøtt
96,		Konsentrat tropisk juice (var også til Sprett tropisk drikk)
97,		Konsentrat øko appelsinjuice  (ikke i bruk)
101,	Økologisk rå melk
103,	Økologisk rå fløte
105,	Mellomprodukt økologisk Naturell yoghurt
113,	Økologisk Suppleringsfløte
121,	Økologisk Helmelk
122,	Melk til økologisk Naturell yoghurt
123,	Økologisk Lettmelk
124,	Økologisk Skummet melk
125,	Økologisk Ekstra lettmelk
131,	Økologisk kremfløte
161,	Økologisk Naturell yoghurt
270,	Eple sydtyrol /mango
271,	Sydtyrol Bringebær sesong
273,	Premium appelsinjuice m/fruktkjøtt (NFC)
274,	Premium grapejuice (NFC) (ikke i bruk)
275,	Grape/app NFC
278,	Presset tropisk (ikke i bruk)
280,	Hardangerjuice (Presset Eple frå Hardanger)
281,	Tyroljuice
*/