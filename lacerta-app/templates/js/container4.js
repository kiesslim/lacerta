
$(document).ready(function() {

	var parent_container = document.getElementById("container4");
	var width = parent_container.offsetWidth * 0.9544;
	var height = parent_container.offsetHeight * 0.9544;
	var node_labels = [];

	const scale = d3.scaleOrdinal(d3.schemeCategory10);
	svg = d3.select(".crawler_graph")
			.attr("width", "95.44%")
			.attr("height", "95.44%")
			.attr("viewBox", [-width / 2, -height / 2, width, height]);

	$.getJSON("{{ url_for('static', filename='testing_data/graph8.json') }}", function(graph) {
		var node_count = graph.nodes.length;
		var link_count = graph.links.length;

		graph.nodes.forEach(function(e) {
			node_labels.push(e.id);
		});

		if (graph.type == "BFS") {
			var tick_counter = 0;
			if (node_count >= 20) {
				var tick_stop = 240;
				var alpha_stop = 0.0015;
			} else if (node_count >= 10) {
				var tick_stop = 120;
				var alpha_stop = 0.006;
			} else if (node_count >= 5) {
				var tick_stop = 90;
				var alpha_stop = 0.02;
			} else {
				var tick_stop = 60;
				var alpha_stop = 0.04;
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
				    .selectAll("circle")
				    .data(nodes.slice(0, node_count))
				    .enter().append("circle")
				      .attr("stroke", "#fff")
				      .attr("stroke-width", 3)
				      .attr("r", 10);

				var linknode = svg.append("g")
				    .selectAll("circle")
				    .data(nodes.slice(node_count, node_count + link_count))
				    .enter().append("circle")
				     .attr("class", "link_node")
				      .attr("r", 8)
				      .attr("fill", "#717171")
			      	  .attr("opacity", 0.6)
			      	  .attr("display", "none");

			    link
			        .attr("x1", function(d) { graph_linknodes[d.index].x1 = d.source.x; return d.source.x; })
			        .attr("y1", function(d) { graph_linknodes[d.index].y1 = d.source.y; return d.source.y; })
			        .attr("x2", function(d) { graph_linknodes[d.index].x2 = d.target.x; return d.target.x; })
			        .attr("y2", function(d) { graph_linknodes[d.index].y2 = d.target.y; return d.target.y; });

			    node
			        .attr("cx", d => d.x)
			        .attr("cy", d => d.y)
			        .attr("fill", color = function(d) {return scale(d.index % 10);})
			        .attr("id", function(d) { return "graph_node" + String(d.index);});
			     
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
					.attr("refX", 24)
					.attr("refY", 0)
					.attr("markerWidth", 4.2)
					.attr("markerHeight", 4.2)
					.attr("orient", "auto")
					.append("path")
						.attr("d", "M0,-5L10,0L0,5")
						.attr("class","graph_arrowhead");

				d3.selectAll(".graph_line")
					.attr("marker-end", "url(#graph_arrow)");

				d3.selectAll(".crawler_graph circle")
					.on("mouseover", circle_node_ingress)
					.on("mouseout", circle_node_egress);
 
			}

			function forceSimulation(nodes, links) {
				return d3.forceSimulation(nodes)
			      .force("link", d3.forceLink(links).id(d => d.id).distance(50))
			      .force("charge", d3.forceManyBody().strength(-50))
			      .force("center", d3.forceCenter())
			      .force("collision", d3.forceCollide().radius(6))
			      .alphaDecay([alpha_stop]);

			}
		} else {
			spiral_plot(graph.nodes, graph.links, node_labels);
		}

	});

	function circle_node_ingress() {
		var this_circle = d3.select(this);
		var node_label_text = node_labels[Number(this_circle.attr("id").slice(10))];
		this_circle
			.attr("stroke", "#000000")
	        .attr("stroke-width", 5)
			.attr("fill", "white")
			.attr("r", 12);
		var circle_cx = Number(this_circle.attr("cx"));
		var circle_cy = Number(this_circle.attr("cy"));
		var label_x = String(circle_cx + 18 + width/2) + "px";
		var label_y = String(circle_cy + 25 + height/2) + "px";
		var overall_container = d3.select("#container4");
		overall_container	
			.append("div")
				.html("<b>Title: </b>" + node_label_text + "<br/>" + "<b>URL: </b>" + node_label_text)
				.attr("id", "graph_node_label");
		var new_node_label = document.getElementById("graph_node_label");
		new_node_label.style.left = label_x;
		new_node_label.style.top = label_y;
	}

	function circle_node_egress() {
		color = scale(Number(this.id.slice(10)) % 10);
		d3.select(this)
			.attr("stroke", "#fff")
	        .attr("stroke-width", 3)
			.attr("fill", color)
			.attr("r", 10);
		d3.selectAll("#container4 #graph_node_label").remove();
	}

});

function spiral_plot(points, lines, node_labels) {
	var parent_container = document.getElementById("container4");
	var width = parent_container.offsetWidth * 0.9544;
	var height = parent_container.offsetHeight * 0.9544;
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

	var data_points = Object.keys(p_list).map(function(key, i) {
  		return {"id": key, "index": i, "x": p_list[key].x, "y": p_list[key].y};
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
	    .selectAll("rect")
	    .data(data_points)
	    .enter().append("rect")
	    	.attr("stroke", "#fff")
	      .attr("stroke-width", 3)
	      .attr("width", 22)
   	      .attr("height", 22)
   	      .attr("rx", 4)
 	      .attr("ry", 4);

    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("x", d => d.x - 11)
        .attr("y", d => d.y - 11)
        .attr("fill", color = function(d) { return scale(d.index % 10);})
		.attr("id", function(d) { return "graph_node" + String(d.index);});

	defs = svg.append("defs");
	defs.append("marker")
		.attr("id", "graph_arrow")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 25.75)
		.attr("refY", 0)
		.attr("markerWidth", 4.9)
		.attr("markerHeight", 4.9)
		.attr("orient", "auto")
		.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("class","graph_arrowhead");

	d3.selectAll(".graph_line")
		.attr("marker-end", "url(#graph_arrow)")

	d3.selectAll(".crawler_graph rect")
					.on("mouseover", rect_node_ingress)
					.on("mouseout", rect_node_egress);

	function rect_node_ingress() {
		var this_rect = d3.select(this);
		var node_label_text = node_labels[Number(this_rect.attr("id").slice(10))];
		var current_x = Number(this_rect.attr("x"));
		var current_y = Number(this_rect.attr("y"));
		this_rect
			.attr("stroke", "#000000")
	        .attr("stroke-width", 7)
			.attr("fill", "white")
			.attr("x", current_x - 3)
        	.attr("y", current_y - 3)
			.attr("width", 28)
   	      	.attr("height", 28);
		var rect_x = Number(this_rect.attr("x"));
		var rect_y = Number(this_rect.attr("y"));
		var label_x = String(rect_x + 38 + width/2) + "px";
		var label_y = String(rect_y + 40 + height/2) + "px";
		var overall_container = d3.select("#container4");
		overall_container	
			.append("div")
				.html("<b>Title: </b>" + node_label_text + "<br/>" + "<b>URL: </b>" + node_label_text)
				.attr("id", "graph_node_label");
		var new_node_label = document.getElementById("graph_node_label");
		new_node_label.style.left = label_x;
		new_node_label.style.top = label_y;
	}

	function rect_node_egress() {
		color = scale(Number(this.id.slice(10)) % 10);
		this_rect = d3.select(this);
		var current_x = Number(this_rect.attr("x"));
		var current_y = Number(this_rect.attr("y"));
		this_rect
			.attr("stroke", "#fff")
	        .attr("stroke-width", 3)
			.attr("fill", color)
			.attr("x", current_x + 3)
        	.attr("y", current_y + 3)
			.attr("width", 22)
   	      	.attr("height", 22);
		d3.selectAll("#container4 #graph_node_label").remove();
	}

}
