function readyFunction(){

var manyFor = parseInt($('div.meter.non.box .agree').text());
var against = parseInt($('div.meter.non.box .disagree').text());
var replying = 0;

$('.support.button').qtip({content:'Support', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.more.button').qtip({content:'More options', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.evidence.button').qtip({content:'Evidence', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});
$('.object.button').qtip({content:'Objections', position:{corner:{tooltip:'topMiddle', target:'bottomMiddle'}}});

function setSizes(){
	var containerWidth = $('.meter').width();
	var totalPop = manyFor + against;
	var reducedWidth = containerWidth - 60;
	var agreeWidth = reducedWidth * manyFor / totalPop;
	var againstWidth = reducedWidth * against / totalPop;
	$('.agree').width(agreeWidth);
	$('.disagree').width(againstWidth);
	$('textarea').width(containerWidth-10);
}

function getReasons(){

	var theUrl = "/topic/" + toString($('.postid:first').text()) + ".json";
	$.getJSON(theUrl,
		function(data){
			var dataString = data[0][text];
			$('.postid:last').html(dataString);

		}
	);
}

$('.newReasonType').change(function(event){
	var current = $('.reply textarea').attr("name");
	if (current === "supportText"){
		$('.reply textarea').attr("name", "objectText");
	}else{
		$('.reply textarea').attr("name", "supportText");
	}
});

function hideNewTopic(){
 $('.sorting.box .reply').hide(500);
}
function showNewTopic(){
$('.sorting.box .reply').show(500);
}

$('.newButton').click(function(event){
	event.preventDefault();
	if(replying === 0){
		showNewTopic();
		replying = 1;
	}else{
		hideNewTopic();
		replying = 0;
	}
})

function collapseSiblingButtons(selectedButton){
	$(selectedButton).siblings().removeClass("selectedReplyButton");
	$(selectedButton).siblings().removeClass("disagreeBox");
	$(selectedButton).siblings().removeClass("reason");
	$(selectedButton).siblings().removeClass("evidenceBox");
	$(selectedButton).siblings().removeClass("selected");


	var reasonId = $(selectedButton).attr("id-data");
	$('div.box[replyTo-data="' + reasonId+'"]').remove();
}

function removeAllSelectedClasses(aButton){
	$(aButton).removeClass("selectedReplyButton");
	$(aButton).removeClass("disagreeBox");
	$(aButton).removeClass("reason");
	$(aButton).removeClass("evidenceBox");
	$(aButton).removeClass("selected");
}

var emptyResponseList = ["No Support For This Claim.", "No Objections To This Claim.", "No Evidence For This Claim."];
var responseTypeList = ["Support", "Objection", "Evidence"];
var divClassList = ["reason", "disagreeBox", "evidenceBox"];

function displayEmpty(button, reasonId, type){
	$(this).parent().after('
					<div class = "loading '+ divClassList[type] + ' box" replyTo-data=' 
					+ reasonId + '><p>'+emptyResponseList[type]+'</p> 
					<a href = "add'+responseTypeList[type]+'">Add '+responseTypeList[type]+'</a><div style = "visibility:hidden"><br>
						<form method = "post">
							<textarea name = "add'+responseTypeList[type]+'"></textarea><br/>
							<input type = "submit">
						</form></div>');
}

$('.reason.box .button').live("click", function(event){

	collapseSiblingButtons(this);

	var buttonClass = "";
	var divClass = "";
	var count = parseInt($(this, 'span.numberCircle').text());
	var reasonId = $(this).attr("id-data");

	if ($(this).hasClass("selectedReplyButton"))
	{
		removeAllSelectedClasses(this);
	}else{

		if (count > 0){
			if ($(this).hasClass("evidence")){
				buttonClass = "evidence";
				divClass = "evidenceBox";
				$(this).parent().after('<div class = "loading ' 
					+ divClass + ' box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading Evidence...</p><div style = "visibility:hidden"><br>
						<form method = "post">
							<textarea name = "addEvidence"></textarea><br/>
							<input type = "submit">
						</form></div>');
				$(this).addClass("evidenceBox");
			}else if ($(this).hasClass("object")){
				buttonClass = "object";
				divClass = "disagreeBox";
				$(this).parent().after('<div class = "loading ' 
					+ divClass + ' box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading Objections...</p><div style = "visibility:hidden"><br>
						<form method = "post">
							<textarea name = "addObjection"></textarea><br/>
							<input type = "submit">
						</form></div>');
				$(this).addClass("disagreeBox");
			}else if ($(this).hasClass("support")){
				buttonClass = "support";
				divClass = "reason";
				$(this).parent().after('<div class = "loading ' 
					+ divClass + ' box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading Support...</p><div style = "visibility:hidden"><br>
						<form method = "post">
							<textarea name = "addSupport"></textarea><br/>
							<input type = "submit">
						</form></div>');
				$(this).addClass("reason");
			}else if ($(this).hasClass("more")){
				buttonClass = "more";
				$(this).parent().after('<div class = "loading box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading options...</p></div>');
			}
			$(this).addClass("selectedReplyButton");
		}else{

			if ($(this).hasClass("evidence")){
				displayEmpty(this, reasonId, 2);
				$(this).addClass("evidenceBox");
			}else if ($(this).hasClass("object")){
				displayEmpty(this, reasonId, 1);
				$(this).addClass("disagreeBox");
			}else if ($(this).hasClass("support")){
				displayEmpty(this, reasonId, 0);
				$(this).addClass("reason");
			}else if ($(this).hasClass("more")){
				$(this).parent().after('<div class = "loading box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading options...</p></div>');
				buttonClass = "more";
			}
		$(this).addClass("selectedReplyButton");
}
}});

$('[href=addEvidence]').live(){"click", function(event){
	event.preventDefault();
	$(this).

	$(this).parent().hide();
}}

$(window).resize(function() { setSizes(); });
$('.reply').hide();
setSizes();
}

