
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
            url: "dev/query",
            // url: "/query",
            data: package,
            success: function(output) {
                graph = JSON.parse(output);
                // var container2_data = {
                //     "start_url": package["start_url"],
                //     "depth": package["depth"],
                //     "search_type": package["search_type"],
                //     "keyword": package["keyword"],
                //     "crawl_data": graph["nodes"]
                // };
                $("#container1").load( document.URL +  ' #container1' );
                plotCrawlerGraph(graph);
            }
        });
	});
});

function plotCrawlerGraph(graph) {
    console.log(graph);
    d3.selectAll(".crawler_graph g").remove();
    d3.selectAll(".crawler_graph defs").remove();
    d3.selectAll(".graph_url_list div").remove();
    d3.selectAll(".graph_url_list li").remove();

    // Scroll to graph
    $('html, body').animate({
            scrollTop: ($("#container4").offset().top - 82)
    }, 400);

    var parent_container = document.getElementById("container4");
    var width = parent_container.offsetWidth * 0.9544;
    var height = parent_container.offsetHeight * 0.9544;
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    var node_labels = [];
    var node_urls = [];

    graph.nodes.forEach(function(e) {
        node_labels.push(e.title);
        node_urls.push(e.id);
    });

    if (graph.nodes.length > 1) {
        if (graph.type == "BFS") {
            force_directed_plot(graph.keyword, width, height, scale, graph.nodes, graph.links);
        } else {
            spiral_plot(graph.keyword, width, height, scale, graph.nodes, graph.links, node_labels, node_urls);
        }
    }
}