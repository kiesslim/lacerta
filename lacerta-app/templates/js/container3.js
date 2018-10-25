
$(document).ready(function() {
	$('#new_query_button').click( function (e) {
		var package = {};
		package["start_url"] = $("#start_url").val();
		package["depth"] = $("#depth").val();
		package["keyword"] = $("#keyword").val();
		package["search_type"] = $("input[name='search_type']:checked").val();
        $.ajax({
            type: "POST",
            url: "./query",
            data: package,
            success: function(data) {
                window.location.href = "/";
            }
        });
        event.preventDefault();
	});
});
