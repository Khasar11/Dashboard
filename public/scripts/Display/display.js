let zoom = d3.zoom()
	.on('zoom', handleZoom);

function handleZoom(e) {
	d3.selectAll('svg line')
		.attr('transform', e.transform);
	d3.selectAll('svg circle')
		.attr('transform', e.transform);
	d3.selectAll('svg text')
		.attr('transform', e.transform);
}

function initZoom() {
	d3.selectAll('svg')
		.call(zoom);
}

initZoom();

function copy(that) {
	var inp = document.createElement('input');
	document.body.appendChild(inp)
	inp.value = that.textContent
	inp.select();
	document.execCommand('copy', false);
	inp.remove();
}

function center() {
	d3.select('svg')
		.transition()
		.call(zoom.translateTo, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
}

document.addEventListener('keydown', function(event) {
	if (event.code == 'KeyH') {
		center();
	}
});

var links;
var nodes;
var simulation;
var elemLinks;
var elemCircles;
var elemKeys;
var elemValues;
var svg = d3.select('#main-svg');

async function modifyDisplay(id) {
	await updateDisplayData(id)

	displaydata = qSelect('#display-data')
}

async function getDisplay(id) {
	const baseUrl = `http://localhost:8383/display/${id}`

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

	links = returnData.links;
	nodes = returnData.nodeObjects;

	qSelect('#main-svg').innerHTML = ''

	simulation = d3.forceSimulation()
		.nodes(nodes)
		.force('charge', d3.forceManyBody().strength(-400).distanceMax(200))
		.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
		.force("link", d3.forceLink(links))
		.on('tick', ticked);

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
		.classed('.node-values', true)

}

function ticked() {
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
		.attr('fill', d => fixColor(d))
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

function fixColor(d) {
	if (d.value === 'false') 
	  return 'red'
	if (d.value === 'true') 
	  return 'green'
	if (typeof d.value === 'string' || d.value instanceof String)
		return '#004400'
	return 'teal'
}