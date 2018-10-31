
$(document).ready(function() {
	$('#new_query_button').click( function (e) {
        e.preventDefault();
		var package = {};
		package["start_url"] = $("#start_url").val();
		package["depth"] = $("#depth").val();
		package["keyword"] = $("#keyword").val();
		package["search_type"] = $("input[name='search_type']:checked").val();
        $.ajax({
            type: "POST",
            // url: "dev/query",
            url: "/query",
            data: package,
            success: function(output) {
                graph = JSON.parse(output);
                plotCrawlerGraph(graph);
            }
        });
	});
});

function plotCrawlerGraph(graph) {
    console.log(graph);
    d3.selectAll(".crawler_graph g").remove();
    d3.selectAll(".crawler_graph defs").remove();

    // Scroll to graph
    $('html, body').animate({
            scrollTop: $("#container4").offset().top
    }, 400);

    var parent_container = document.getElementById("container4");
    var width = parent_container.offsetWidth * 0.9544;
    var height = parent_container.offsetHeight * 0.9544;
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    var node_labels = [];
    var node_urls = [];

    svg = d3.select(".crawler_graph")
            .attr("width", "95.44%")
            .attr("height", "95.44%")
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

    graph.nodes.forEach(function(e) {
        node_labels.push(e.title);
        node_urls.push(e.id);
    });

    if (graph.type == "BFS") {
        force_directed_plot(width, height, scale, graph.nodes, graph.links, node_labels, node_urls)
    } else {
        spiral_plot(width, height, scale, graph.nodes, graph.links, node_labels, node_urls);
    }
}