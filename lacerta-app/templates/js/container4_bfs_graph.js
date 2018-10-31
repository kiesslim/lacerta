
function force_directed_plot(width, height, scale, points, lines, node_labels, node_urls) {
    var node_count = points.length;
    var link_count = lines.length;
    var tick_counter = 0;

    if (node_count >= 10) {
        var tick_stop = 375;
        var alpha_stop = 0.002;
    } else if (node_count >= 5) {
        var tick_stop = 150;
        var alpha_stop = 0.01;
    } else {
        var tick_stop = 70;
        var alpha_stop = 0.02;
    }

    var graph_linknodes = [];
    var j = 0;
    lines.forEach(function(link) {
        graph_linknode_index = node_count + j++;
        graph_linknodes.push({
            "id": graph_linknode_index
        });
    });
    points = points.concat(graph_linknodes);

    const links = lines.map(d => Object.create(d));
    const nodes = points.map(d => Object.create(d));
    const simulation = forceSimulation(nodes, links).on("tick", ticked).on("end", ended);

    function ticked() {
        d3.selectAll(".crawler_graph g").remove();

        nodes[0].fx = 0;
        nodes[0].fy = 0;

        var link = svg.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
                .attr("class", "graph_line")
                .attr("stroke", "#717171")
                .attr("stroke-opacity", 0.6)
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
            .attr("id", function(d) { return "graph_node" + String(d.index);})
            .attr("jump_link", function(d) { return node_urls[d.index]; });

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
            .on("mouseover", function() { circle_node_ingress(this, node_labels, node_urls, width, height)})
            .on("mouseout", function() { circle_node_egress(this, scale);})
            .on("click", circle_node_click);

    }

    function forceSimulation(nodes, links) {
        return d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(180))
          .force("charge", d3.forceManyBody().strength(-120))
          .force("center", d3.forceCenter())
          .force("collision", d3.forceCollide().radius(6))
          .alphaDecay([alpha_stop]);
    }
}

function circle_node_ingress(input, node_labels, node_urls, width, height) {
    var this_circle = d3.select(input);
    var node_label_text = node_labels[Number(this_circle.attr("id").slice(10))];
    var node_url_text = node_urls[Number(this_circle.attr("id").slice(10))];
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
            .html("<b>Title: </b>" + node_label_text + "<br/>" + "<b>URL: </b>" + node_url_text)
            .attr("id", "graph_node_label");
    var new_node_label = document.getElementById("graph_node_label");
    new_node_label.style.left = label_x;
    new_node_label.style.top = label_y;
}

function circle_node_egress(input, scale) {
    color = scale(Number(input.id.slice(10)) % 10);
    d3.select(input)
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("fill", color)
        .attr("r", 10);
    d3.selectAll("#container4 #graph_node_label").remove();
}

function circle_node_click() {
    this_circle = d3.select(this);
    var url_link = this_circle.attr("jump_link");
    window.open(url_link, "_blank");
}