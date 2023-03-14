
let zoom = d3.zoom()
  .on('zoom', handleZoom);

function handleZoom(e) {
  d3.selectAll('svg g')
    .attr('transform', e.transform);
}

function initZoom() {
  d3.selectAll('svg')
    .call(zoom);
}

function center() {
	d3.select('svg')
		.transition()
		.call(zoom.translateTo, 0.5 * width, 0.5 * height);
}

var width = window.innerWidth, height = window.innerHeight

document.addEventListener('keydown', function(event) {
  if (event.code == 'KeyH') {
    center();
  }
});

var links;
var nodes;
var simulation;

async function getDisplay(id) {
    const baseUrl = `http://localhost:8383/display/${id}`

    let data = await fetch(baseUrl, {
        method: 'GET'
      }).then((response) => response.text())
      .then(data => { return data; })
      .catch(error => { console.error(error); });
    
    const returnData = JSON.parse(data);

    links = returnData.links;
    nodes = returnData.nodeObjects;
      
    simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(function (d, i) {
        var a = i == 0 ? -2000 : -1000;
        return a;
    }).distanceMin(200).distanceMax(1000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink().distance(150).links(links))
    .on('tick', ticked);
}

function updateLinks() {
	d3.select('.links')
		.selectAll('line')
		.data(links)
		.join('line')
		.attr('x1', function(d) {
			return d.source.x
		})
		.attr('y1', function(d) {
			return d.source.y
		})
		.attr('x2', function(d) {
			return d.target.x
		})
		.attr('y2', function(d) {
			return d.target.y
		});
}

function copy(that){
	var inp =document.createElement('input');
	document.body.appendChild(inp)
	inp.value =that.textContent
	inp.select();
	document.execCommand('copy',false);
	inp.remove(); 
	}

function updateNodes() {
	d3.select('.nodes')
		.selectAll('text')
		.data(nodes)
		.join('text')
    .text(function(d) {
			return d.name
		})
	.attr('class', 'dataText')
    .attr('fill', '#666')
		.attr('x', function(d) {
			return d.x
		})
		.attr('y', function(d) {
			return d.y
		})
		.attr('dy', function(d) {
			return 0
		}).attr('onclick', 'copy(this)');

  d3.select('.nodes')
		.selectAll('.text2')
		.data(nodes)
		.join('text')
    .text(function(d) {
			return d.value
		})
	.attr('class', 'dataText')
    .attr('fill', function(d) {
      if (d.value === 'false') 
        return 'red'
      if (d.value === 'true') 
        return 'green'
      return 'teal'})
	.attr('x', function(d) {
		return d.x
	})
	.attr('y', function(d) {
		return d.y+15
	})
	.attr('dy', function(d) {
		return 0
	}).attr('onclick', 'copy(this)');
}

function ticked() {
	updateLinks()
	updateNodes()
}

initZoom();