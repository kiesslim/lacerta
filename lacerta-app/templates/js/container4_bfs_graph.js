
function force_directed_plot(keyword, width, height, scale, points, lines, node_labels, node_urls) {
    var node_count = points.length;
    var link_count = lines.length;
    var tick_counter = 0;

    var svg = d3.select(".crawler_graph")
            .attr("width", "95.44%")
            .attr("height", "95.44%")
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

    if (node_count >= 10) {
        var tick_stop = 250;
        var alpha_stop = 0.005;
    } else if (node_count >= 5) {
        var tick_stop = 150;
        var alpha_stop = 0.01;
    } else {
        var tick_stop = 70;
        var alpha_stop = 0.02;
    }

    var ideal_distance = 200;
    if (link_count >= 500) {
        ideal_distance = 300;
    } else if (link_count >= 750) {
        ideal_distance = 400;
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
                .attr("stroke-width", 3);

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
            .attr("x1", function(d) { 
                graph_linknodes[d.index].x1 = d.source.x; 
                return d.source.x; })
            .attr("y1", function(d) { 
                graph_linknodes[d.index].y1 = d.source.y; 
                return d.source.y; })
            .attr("x2", function(d) { 
                graph_linknodes[d.index].x2 = d.target.x; 
                return d.target.x; })
            .attr("y2", function(d) { 
                graph_linknodes[d.index].y2 = d.target.y; 
                return d.target.y; });

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", color = function(d) {return scale(d.index % 10);})
            .attr("id", function(d) { return "graph_node" + String(d.index);})
            .attr("jump_link", function(d) { return node_urls[d.index]; })
            .attr("has_keyword", d => d.has_keyword);

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
            .attr("markerWidth", 4.2)
            .attr("markerHeight", 4.2)
            .attr("orient", "auto")
            .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class","graph_arrowhead");

        defs.append("marker")
        .attr("id", "graph_asterisk")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", 0)
        .attr("fill", "white")
        .append("path")
            .attr("d", "M5,0L4,0L4,3.3L1.1,1.7L0.2,3.4L3,5L0.2,6.6L1.1,8.4L4,6.7L4,10L6,10L6,6.7L8.9,8.4L9.8,6.6L7,5L9.8,3.4L8.9,1.7L6,3.3L6,0")
            .attr("class","graph_asterisk_path");   

        d3.selectAll(".graph_line")
            .attr("marker-end", "url(#graph_arrow)");

        var supplemental_list = d3.select(".graph_url_list")
        supplemental_list.append("div")
                            .text("Supplemental List View")
                            .attr("class", "graph_url_list_title")
        supplemental_list.append("div")
                            .text("(Hover Over Nodes In Graph For More Information)")
                            .attr("class", "graph_url_list_title");

        d3.selectAll(".crawler_graph g .link_node").remove();
        var final_nodes = d3.selectAll(".crawler_graph circle");
        final_nodes.on("mouseover", function() { 
                        circle_node_ingress(this, node_labels, node_urls, width, height, keyword);})
                    .on("mouseout", function() { circle_node_egress(this, scale);})
                    .on("click", circle_node_click)
                    .each( function() {
                        this_circle = d3.select(this);
                        if (this_circle.attr("has_keyword") == "true") {
                            supplemental_list.append("div")
                                                .text("(Keyword Was Found)")
                                                .attr("class", "graph_url_list_title");
                            this_circle_parent = d3.select(this.parentNode);
                            this_circle_parent.append("line")
                                    .attr("class", "graph_line")
                                    .attr("id", "graph_asterisk_line")
                                    .attr("x1", this_circle.attr("cx"))
                                    .attr("y1", this_circle.attr("cy"))
                                    .attr("x2", this_circle.attr("cx"))
                                    .attr("y2", this_circle.attr("cy"))
                                    .attr("marker-end", "url(#graph_asterisk)")
                                    .attr("stroke-width", 1)
                                    .attr("stroke", "white")
                        }
                    })
                    .each( function() {
                            bfs_add_supplemental_url(this, supplemental_list, scale);
                    });

        var final_lines = d3.selectAll(".crawler_graph .graph_line");

        svg.call(d3.zoom().on("zoom", function() {
        	final_nodes.attr("transform", d3.event.transform);
        	final_lines.attr("transform", d3.event.transform);
      	}));

    }

    function forceSimulation(nodes, links) {
        return d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(ideal_distance))
          .force("charge", d3.forceManyBody().strength(-120))
          .force("center", d3.forceCenter())
          .force("collision", d3.forceCollide().radius(6))
          .alphaDecay([alpha_stop]);
    }
}

function circle_node_ingress(input, node_labels, node_urls, width, height, keyword) {
    var this_circle = d3.select(input);
    var node_label_text = node_labels[Number(this_circle.attr("id").slice(10))];
    var node_url_text = node_urls[Number(this_circle.attr("id").slice(10))];
    var transform_cx = 0;
    var transform_cy = 0;
    var transform_scale = 1;
    if (this_circle.attr("transform") != null) {
        transform_cx = Number((this_circle.attr("transform").split('(')[1]).split(',')[0]);
        transform_cy = Number(((this_circle.attr("transform").split('(')[1]).split(',')[1]).split(')')[0]);
        transform_scale = Number((this_circle.attr("transform").split('(')[2]).split(')')[0]);
    }
    this_circle
        .attr("stroke", "#000000")
        .attr("stroke-width", 5)
        .attr("fill", "white")
        .attr("r", 12);
    var circle_cx = Number(this_circle.attr("cx"));
    var circle_cy = Number(this_circle.attr("cy"));
    var label_x = String(transform_scale * (circle_cx + 23) + transform_cx + width/2) + "px";
    var label_y = String(transform_scale * (circle_cy + 30) + transform_cy + height/2) + "px";
    var overall_container = d3.select("#container4");
    var hover_text = "";
    if (Number(this_circle.attr("id").slice(10)) == 0) {
        hover_text += "<b><i>Start Website</i></b><br/>";
    }
    if (this_circle.attr("has_keyword") == "true") {
        hover_text += "<b><i>Has Keyword: </b>" + keyword + "</i><br/>";
    }
    hover_text += "<b>Title: </b>" + node_label_text + "<br/>" + "<b>URL: </b>" + node_url_text;
    overall_container.append("div")
                        .html(hover_text)
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

function bfs_add_supplemental_url(input, url_list, scale) {
    var this_circle = d3.select(input);
    var hover_text = "";
    if (Number(this_circle.attr("id").slice(10)) == 0) {
        hover_text += "<i>(Start Website)</i> ";
    }
    if (this_circle.attr("has_keyword") == "true") {
        hover_text += "<i>(Has Keyword)</i> ";
    }
    hover_text += this_circle.attr("jump_link");
    url_list.append("li")
        .html(hover_text)
        .attr("class", "graph_url_list_item")
        .on("mouseover", function() { bfs_url_list_ingress(this, this_circle);})
        .on("mouseout", function() { bfs_url_list_egress(this, this_circle, scale);})
        .on("click", function() { bfs_url_list_click(this, this_circle);});
}

function bfs_url_list_ingress(list_input, circle_input) {
    list_input.style.color = "blue";
    list_input.style.textDecoration = "underline";

    circle_input
        .attr("stroke", "#000000")
        .attr("stroke-width", 5)
        .attr("fill", "white")
        .attr("r", 12);
}

function bfs_url_list_egress(list_input, circle_input, scale) {
    list_input.style.color = "black";
    list_input.style.textDecoration = "none";

    color = scale(Number(circle_input.attr("id").slice(10)) % 10);
    circle_input
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("fill", color)
        .attr("r", 10);
}

function bfs_url_list_click(list_input, circle_input) {
    var url_link = circle_input.attr("jump_link");
    window.open(url_link, "_blank");
}