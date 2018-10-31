
function spiral_plot(width, height, scale, points, lines, node_labels, node_urls) {
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
        .attr("id", function(d) { return "graph_node" + String(d.index);})
        .attr("jump_link", function(d) { return node_urls[d.index]; })

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
                    .on("mouseover", function() { rect_node_ingress(this, node_labels, node_urls, width, height)})
                    .on("mouseout", function() { rect_node_egress(this, scale)})
                    .on("click", rect_node_click);
}

function rect_node_ingress(input, node_labels, node_urls, width, height) {
    var this_rect = d3.select(input);
    var node_label_text = node_labels[Number(this_rect.attr("id").slice(10))];
    var node_url_text = node_urls[Number(this_rect.attr("id").slice(10))];
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
            .html("<b>Title: </b>" + node_label_text + "<br/>" + "<b>URL: </b>" + node_url_text)
            .attr("id", "graph_node_label");
    var new_node_label = document.getElementById("graph_node_label");
    new_node_label.style.left = label_x;
    new_node_label.style.top = label_y;
}

function rect_node_egress(input, scale) {
    color = scale(Number(input.id.slice(10)) % 10);
    this_rect = d3.select(input);
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

function rect_node_click() {
    this_rect = d3.select(this);
    var url_link = this_rect.attr("jump_link");
    window.open(url_link, "_blank");
}