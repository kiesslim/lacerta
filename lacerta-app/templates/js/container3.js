$(document).ready(function() {
	$('#new_query_button').click( function (e) {
	    e.preventDefault();
	    d3.selectAll(".crawler_graph g").remove();
        d3.selectAll(".crawler_graph defs").remove();
        d3.selectAll(".graph_url_list div").remove();
        d3.selectAll(".graph_url_list li").remove();
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
                $("#container1").load( document.URL +  ' #container1' );
                plotCrawlerGraph(graph);
            },
            error: function(xhr, textStatus, error) {
                d3.select(".graph_url_list")
                    .append("div")
                    .text("Search failed: " + xhr.status + " " + textStatus + " " + error)
                    .attr("class", "graph_url_list_error");
            }
        });
	});
});

function plotCrawlerGraph(graph) {
    console.log(graph);

    var parent_container = document.getElementById("container4");
    var width = parent_container.offsetWidth * 0.9544;
    var height = parent_container.offsetHeight * 0.9544;
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    var node_labels = []
    var node_urls = [];

    graph.nodes.forEach(function(e) {
        node_labels.push(e.title);
        node_urls.push(e.id);
    });

    if (graph.nodes.length === 1) {
        if (graph.type === "BFS") {
            force_directed_plot_one(graph.start_url, graph.depth, graph.keyword, width, height, scale, graph.nodes);
        } else {
            spiral_plot_one(graph.start_url, graph.depth, graph.keyword, width, height, scale, graph.nodes, node_labels, node_urls);
        }
    } else {
    	if (graph.type === "BFS") {
            force_directed_plot(graph.start_url, graph.depth, graph.keyword, width, height, scale, graph.nodes, graph.links);
        } else {
            spiral_plot(graph.start_url, graph.depth, graph.keyword, width, height, scale, graph.nodes, graph.links, node_labels, node_urls);
        }
    }
}