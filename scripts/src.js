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

var responseList = ["No Support For This Claim.", "No Objections To This Claim.", "No Evidence For This Claim.", "Loading..."];
var responseTypeList = ["Support", "Objection", "Evidence"];
var divClassList = ["reason", "disagreeBox", "evidenceBox"];

function generateReplyNode(button){
	var type;
	if ($(button).hasClass("evidence")){
		type = 2;
	}else if ($(button).hasClass("object")){
		type = 1;
	}else if ($(button).hasClass("support")){
		type = 0;
	}else{
		type = 3;
	}
	var divClass = divClassList[type];
	var reasonId = $(button).attr("id-data");
	$(button).addClass(divClassList[type]);
	var reply = '<div class = "loading '+ divClass + ' box" replyTo-data=' + reasonId + '><p>'+responseList[type]+'</p><a href = "add'+responseTypeList[type]+'">Add '+responseTypeList[type]+'</a></p><br></div>';
	return reply;
}


$('.reason.box .button').live("click", function(event){
	collapseSiblingButtons(this);
	event.preventDefault();
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
					+ parseInt(reasonId) + '><p>Loading Evidence...</p></div');
				$(this).addClass("evidenceBox");
			}else if ($(this).hasClass("object")){
				buttonClass = "object";
				divClass = "disagreeBox";
				$(this).parent().after('<div class = "loading ' 
					+ divClass + ' box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading Objections...</p></div');
				$(this).addClass("disagreeBox");
			}else if ($(this).hasClass("support")){
				buttonClass = "support";
				divClass = "reason";
				$(this).parent().after('<div class = "loading ' 
					+ divClass + ' box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading Support...</p></div');
				$(this).addClass("reason");
			}else if ($(this).hasClass("more")){
				buttonClass = "more";
				$(this).parent().after('<div class = "loading box" replyTo-data=' 
					+ parseInt(reasonId) + '><p>Loading options...</p></div');
			}
			$(this).addClass("selectedReplyButton");
		}else{
			$(this).parent().after(generateReplyNode(this));
			
		$(this).addClass("selectedReplyButton");
}
}});

$('.box [href = "addSupport"]').live("click", function(event){
	event.preventDefault();
	var text = '<div><br><form method = "post"><textarea></textarea><br><input type = "submit" type-data="0"></div>';
	$(this).after(text);
	setSizes();
	$(this).remove();
});
$('.box [href = "addObjection"]').live("click", function(event){
	event.preventDefault();
	var text = '<div><br><form method = "post"><textarea></textarea><br><input type = "submit" type-data="1"></div>';
	$(this).after(text);
	setSizes();
	$(this).remove();  
});
$('.box [href = "addEvidence"]').live("click", function(event){
	event.preventDefault();
	var text = '<div><br><form method = "post"><textarea></textarea><br><input type = "submit" type-data="2"></div>';
	$(this).after(text);
	setSizes();
	$(this).remove();
});

$("body").delegate('.loading input', "click", function(event){
	event.preventDefault();
	var replyToId = parseInt($(this).parent().parent().parent().attr("replyto-data"));
	var postBody = $(this).prev().prev().val();
	var replyType = parseInt($(this).attr('type-data'));
	var currentUrlId = parseInt($('div.topic.box').attr("conviction-data"));
	var jqxhr = $.ajax({
		type: "POST",
		url: '/topic/'+currentUrlId,
		data: {
			"text": postBody, 
			"replyTo": replyToId, 
			"type": replyType
		},
		cache: false,
		done: function(data, textStatus, jqXHR){
			alert("Post success!");
			$(this).after("Post succeeded: \n"+data);
			$(this).remove();
		},
		error: function(){alert("Error sending data."); },
		dataType: "JSON"
	});
	jqxhr.done(function ( data, textStatus, jqXHR ) {
 			 alert("Post success!:" + String(data));
			$(this).after("Post succeeded: \n"+data);
			$(this).remove();
});
});

$(window).resize(function() { setSizes(); });
$('.reply').hide();
setSizes();
};
