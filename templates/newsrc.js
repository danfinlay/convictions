function readyFunction(){



function setSizes(){
	var containerWidth = $('.meter').width();
	$('textarea').width(containerWidth);
}
$(window).resize(function() { setSizes(); });
setSizes();
}