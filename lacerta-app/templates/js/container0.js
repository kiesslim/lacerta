
$(document).ready(function() {
	$('#nav_link_graph').click( function (e) {
		$('html, body').animate({
            scrollTop: $("#container4").offset().top
        }, 400);
	});
});

$(document).ready(function() {
	$('#nav_link_new_query').click( function (e) {
		$('html, body').animate({
            scrollTop: 0
        }, 400);
	});
});