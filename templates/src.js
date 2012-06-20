function readyFunction(){

var manyFor = parseInt($('div.meter.non.box .agree').text());
var against = parseInt($('div.meter.non.box .disagree').text());

$('.support.button').qtip({content:'View Support', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.more.button').qtip({content:'More options', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.evidence.button').qtip({content:'View Evidence', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.object.button').qtip({content:'View Objections', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});

function setSizes(){
	var containerWidth = $('.meter').width();
	var totalPop = manyFor + against;
	var reducedWidth = containerWidth - 60;
	var agreeWidth = reducedWidth * manyFor / totalPop;
	var againstWidth = reducedWidth * against / totalPop;
	$('.agree').width(agreeWidth);
	$('.disagree').width(againstWidth);
}

$(window).resize(function() { setSizes(); });

setSizes();

};

