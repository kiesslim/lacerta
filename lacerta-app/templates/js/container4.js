
$(document).ready(function() {

	var parent_container = document.getElementById("container4");
	var width = parent_container.offsetWidth * 0.9544;
	var height = parent_container.offsetHeight * 0.9544;

	const scale = d3.scaleOrdinal(d3.schemeCategory10);
	svg = d3.select(".crawler_graph")
			.attr("width", "95.44%")
			.attr("height", "95.44%")
			.attr("viewBox", [-width / 2, -height / 2, width, height]);

	$.getJSON("{{ url_for('static', filename='testing_data/graph11.json') }}", function(graph) {
		var node_count = graph.nodes.length;
		var link_count = graph.links.length;

		if (graph.type == "BFS") {
			var tick_counter = 0;
			if (node_count >= 20) {
				var tick_stop = 120;
				var alpha_stop = 0.005;
			} else if (node_count >= 10) {
				var tick_stop = 100;
				var alpha_stop = 0.007;
			} else if (node_count >= 5) {
				var tick_stop = 80;
				var alpha_stop = 0.025;
			} else {
				var tick_stop = 40;
				var alpha_stop = 0.05;
			}

			var graph_linknodes = [];
			var j = 0;
			graph.links.forEach(function(link) {
				graph_linknode_index = node_count + j++;
				graph_linknodes.push({
					"id": graph_linknode_index
				});
			});
			graph.nodes = graph.nodes.concat(graph_linknodes);

			const links = graph.links.map(d => Object.create(d));
	  		const nodes = graph.nodes.map(d => Object.create(d));
			const simulation = forceSimulation(nodes, links).on("tick", ticked).on("end", ended);

			function ticked() {
				d3.selectAll(".crawler_graph g").remove();

				var link = svg.append("g")
			      .attr("stroke", "#717171")
			      .attr("stroke-opacity", 0.6)
				    .selectAll("line")
				    .data(links)
				    .enter().append("line")
				    	.attr("class", "graph_line")
				      .attr("stroke-width", 2);

				var node = svg.append("g")
				      .attr("stroke", "#fff")
				      .attr("stroke-width", 1.5)
				    .selectAll("circle")
				    .data(nodes.slice(0, node_count))
				    .enter().append("circle")
				      .attr("r", 6);

				var linknode = svg.append("g")
				    .selectAll("circle")
				    .data(nodes.slice(node_count, node_count + link_count))
				    .enter().append("circle")
				     .attr("class", "link-node")
				      .attr("r", 6)
				      .attr("fill", "#717171")
			      	  .attr("opacity", 0.6)
			      	  .attr("display", "none");

			    link
			        .attr("x1", function(d) { graph_linknodes[d.index].x1 = d.source.x; return d.source.x; })
			        .attr("y1", function(d) { graph_linknodes[d.index].y1 = d.source.y; return d.source.y; })
			        .attr("x2", function(d) { graph_linknodes[d.index].x2 = d.target.x; return d.target.x; })
			        .attr("y2", function(d) { graph_linknodes[d.index].y2 = d.target.y; return d.target.y; });

				var i = 0;
			    node
			        .attr("cx", d => d.x)
			        .attr("cy", d => d.y)
			        .attr("fill", color = function() {i++; return scale(i % 10);});
			    node.append("title")
			      .text(d => d.id);

			    linknode
			        .attr("cx", function(d) {
			        	return (graph_linknodes[d.index - node_count].x1 +
			        		graph_linknodes[d.index - node_count].x2) * 0.5; })
			        .attr("cy", function(d) {
			        	return (graph_linknodes[d.index - node_count].y1 +
			        		graph_linknodes[d.index - node_count].y2) * 0.5; });

			    if (tick_counter++ > tick_stop) {
			    	simulation.stop();
			    	ended();
			    }
			}

			function ended() {
		    	defs = svg.append("defs");
				defs.append("marker")
					.attr("id", "graph_arrow")
					.attr("viewBox", "0 -5 10 10")
					.attr("refX", 19)
					.attr("refY", 0)
					.attr("markerWidth", 3.6)
					.attr("markerHeight", 3.6)
					.attr("orient", "auto")
					.append("path")
						.attr("d", "M0,-5L10,0L0,5")
						.attr("class","graph_arrowhead");

				d3.selectAll(".graph_line")
					.attr("marker-end", "url(#graph_arrow)")
			}

			function forceSimulation(nodes, links) {
				return d3.forceSimulation(nodes)
			      .force("link", d3.forceLink(links).id(d => d.id).distance(45))
			      .force("charge", d3.forceManyBody())
			      .force("center", d3.forceCenter())
			      .force("collision", d3.forceCollide().radius(6))
			      .alphaDecay([alpha_stop]);

			}
		} else {
			spiral_plot(graph.nodes, graph.links);
		}

	});

});

function spiral_plot(points, lines) {
	var parent_container = document.getElementById("container4");
	var width = parent_container.offsetWidth * 0.9544;
	const scale = d3.scaleOrdinal(d3.schemeCategory10);
	var num = points.length;

	// Use r(t) = kt
	var r = width/100*2;
	var k = 16;
	var j = 0;
	var q = 0;
	p_list = {};
	l_list = {};

	points.forEach(function(p) {
		p_list[p.id] = {};
		q = Math.sqrt(k*j++);
		p_list[p.id].x = r*q*Math.cos(q);
		p_list[p.id].y = r*q*Math.sin(q);
	});

	j = 0;
	lines.forEach(function(l) {
		l_list[j] = {};
		l_list[j].x1 = p_list[l.source].x;
		l_list[j].x2 = p_list[l.target].x;
		l_list[j].y1 = p_list[l.source].y;
		l_list[j++].y2 = p_list[l.target].y;
	});

	var data_points = Object.keys(p_list).map(function(key) {
  		return {"id": key, "x": p_list[key].x, "y": p_list[key].y};
	});

	var data_lines = Object.keys(l_list).map(function(key) {
  		return {"source": {"x": l_list[key].x1, "y": l_list[key].y1}, "target": {"x": l_list[key].x2, "y": l_list[key].y2}};
	});

	d3.selectAll(".crawler_graph g").remove();

	var link = svg.append("g")
      .attr("stroke", "#717171")
      .attr("stroke-opacity", 0.6)
	    .selectAll("line")
	    .data(data_lines)
	    .enter().append("line")
	    	.attr("class", "graph_line")
	      .attr("stroke-width", 2);

	var node = svg.append("g")
	      .attr("stroke", "#fff")
	      .attr("stroke-width", 1.5)
	    .selectAll("rect")
	    .data(data_points)
	    .enter().append("rect")
	      .attr("width", 18)
   	      .attr("height", 18)
   	      .attr("rx", 4)
 	      .attr("ry", 4);

    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

	var i = 0;
    node
        .attr("x", d => d.x - 9)
        .attr("y", d => d.y - 9)
        .attr("fill", color = function() {i++; return scale(i % 10);});
    node.append("title")
      .text(d => d.id);

	defs = svg.append("defs");
	defs.append("marker")
		.attr("id", "graph_arrow")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 22)
		.attr("refY", 0)
		.attr("markerWidth", 4.8)
		.attr("markerHeight", 4.8)
		.attr("orient", "auto")
		.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("class","graph_arrowhead");

	d3.selectAll(".graph_line")
		.attr("marker-end", "url(#graph_arrow)")

}
