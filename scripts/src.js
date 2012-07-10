function readyFunction(){

var manyFor = parseInt($('div.meter.non.box .agree').text());
var against = parseInt($('div.meter.non.box .disagree').text());
var replying = 0;
var reasonDict = {};
var topicData = {};
var currentUrlId = $('div.topic.box').attr("conviction-data");

var buttonTypeDict = {0: "reasons_for", 1:"reasons_against", 2:"citations_for"};
var divClassList = ["reason", "disagreeBox", "evidenceBox"];
var typeNameList = ["Support", "Objection", "Evidence"];
var responseTypeList = ["Support", "Objection", "Evidence"];
var responseList = ["No Support For This Claim.", "No Objections To This Claim.", "No Evidence For This Claim.", "Loading..."];

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

function returnButtonType(button){
	if ($(button).hasClass("support")) {
		return 0;
	}else if($(button).hasClass("object")){
		return 1;
	}else if($(button).hasClass("evidence")){
		return 2;
	}else if ($(button).hasClass("reasons_for")){
		return 0;
	}else if ($(button).hasClass("reasons_against")){
		return 1;
	}else if ($(button).hasClass("citations_for")){
		return 2;
	}else{
		return 3;
	}
}

function getFirstPostFor(parentId, buttonType){
	return $.extend(true, {}, reasonDict[parentId][buttonTypeDict[buttonType]]);
}

function expand(button){
	var buttonType = returnButtonType(button);
	var parentId = parseInt($(button).attr("id-data"));

	console.log("Attempting to expand id:"+ parentId+ ", a "+ typeof reasonDict[parentId][buttonTypeDict[buttonType]]);
	var postDict;
	for (i = 0; i < reasonDict[parentId][buttonTypeDict[buttonType]].length; i++){
		if (i === 0) {
			postDict = $.extend(true, {}, reasonDict[parentId][buttonTypeDict[buttonType]][i]);
		}
		reasonDict[reasonDict[parentId][buttonTypeDict[buttonType]][i].id] = $.extend(true, {}, reasonDict[parentId][buttonTypeDict[buttonType]][i]);
	}

	if (postDict["error"] == "No replies") {
		return;
	};
	$(button).parent().after(
'<div class = "branch" parent-data = '+parentId+'>'+
	'<div class = "'+divClassList[buttonType]+' reason box"; id-data= '+parentId+'>'+
		'<display: inline-block class = "switch box" index-value=1>'+
			'<span class = "left '+buttonTypeDict[buttonType]+'">'+
			'<img src="/images/left-evidence.png"><span></span></span>'+
			'<span class = "right '+buttonTypeDict[buttonType]+'">'+
			'<img src="/images/right-evidence.png"><span></span></span>'+
			'<span class = "supportText"; style = "position:relative; top:50%">'+
				'Viewing '+typeNameList[buttonType] +
				' <span count-data=1>1</span>/<span total-data='+reasonDict[parentId][buttonTypeDict[buttonType]].length+'>'+
				reasonDict[parentId][buttonTypeDict[buttonType]].length+
				'</span>'+
			'</span>'+
		'</display: inline-block>'+
		'<div class = voteButton><img src="/images/finger-icon-grey.png"/></div>'+
			'<p>'+postDict["text"]+
		'</p><a href="add'+typeNameList[buttonType]+'">Add New '+typeNameList[buttonType]+'</a><div class ="more button" id-data= '+parentId+'>'+
			'<img src = "/images/more.gif"/>'+
	'</div>'+
	'<div class = "evidence button"; id-data= '+postDict["id"]+'>'+
		'<img src = "/images/citation.png"/>'+
		'<span class = "numberCircle">'+postDict["evidence_count"]+'</span>'+
	'</div>'+
	'<div class = "object button"; id-data= '+postDict["id"]+'>'+
		'<img src = "/images/objection.png"/>'+
		'<span class = "numberCircle">'+postDict["objection_count"]+'</span>'+
	'</div>	'+
	'<div class = "support button"; id-data= '+postDict["id"]+'>'+
		'<img src = "/images/support.png"/>'+
		'<span class = "numberCircle">'+postDict["support_count"]+'</span>'+
	'</div>'+
'</div>');
$(button).parent().next('div div display span').attr('index-value', 1);
}

function generateReplyNode(button){
	var type = returnButtonType(button);
	var divClass = divClassList[type];
	var reasonId = $(button).attr("id-data");
	$(button).addClass(divClassList[type]);
	var reply = '<div class = "branch '+ divClass + ' box" replyTo-data=' + reasonId + '><p>'+responseList[type]+'</p><a href = "add'+responseTypeList[type]+'">Add '+responseTypeList[type]+'</a></p><br></div>';
	return reply;
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
function collapse(button){
	console.log("Attempting to collapse...");
	removeAllSelectedClasses(button);
	$(button).parent().parent().children('.branch').remove();
}

function collapseSiblingButtons(selectedButton){
	$(selectedButton).siblings().removeClass("selectedReplyButton");
	$(selectedButton).siblings().removeClass("disagreeBox");
	$(selectedButton).siblings().removeClass("reason");
	$(selectedButton).siblings().removeClass("evidenceBox");
	$(selectedButton).siblings().removeClass("selected");
	var reasonId = $(selectedButton).attr("id-data");
	$('div.box[replyTo-data="' + reasonId+'"]').remove();
}

function removeAllSelectedClasses(button){
	console.log("Removing classes...");
	$(button).removeClass("selectedReplyButton");
	$(button).removeClass("disagreeBox");
	$(button).removeClass("reason");
	$(button).removeClass("evidenceBox");
	$(button).removeClass("selected");
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
		collapse(this);
	}else{
collapse(this);
		if (count > 0){
			expand(this);
			$(this).addClass("selectedReplyButton");
			$(this).addClass(divClassList[returnButtonType(this)]);
		}else{
			$(this).addClass("selectedReplyButton");
			$(this).parent().after(generateReplyNode(this));
}
}});

//arrow is pressed.
$('span.left').live("click", function(event){
	var currentCount = parseInt($(this).parent().attr('index-value'));
	console.log("Current count is: "+currentCount);
	var topicNumber = parseInt($(this).parent().parent().attr("id-data"));
	console.log("Topic number: "+topicNumber);
	var replyType = buttonTypeDict[returnButtonType(this)];
	var newCount = currentCount;
	var replyCount = reasonDict[topicNumber][replyType].length;

	if (replyCount > 1) {
		if (currentCount === 1) {
			newCount = replyCount;
		}else{
			newCount = currentCount-1;
		}
		repopulateBranch(this, replyType, topicNumber, newCount);
	}
});

$('span.right').live("click", function(event){
	var currentCount = parseInt($(this).parent().attr('index-value'));
	console.log("Current count is: "+currentCount);
	var topicNumber = parseInt($(this).parent().parent().attr("id-data"));
	console.log("Topic number: "+topicNumber);
	var replyType = buttonTypeDict[returnButtonType(this)];
	var newCount = currentCount;
	var replyCount = reasonDict[topicNumber][replyType].length;

	if (replyCount > 1) {
		if (currentCount === replyCount) {
			newCount = 1;
		}else{
			newCount = currentCount+1;
		}
		repopulateBranch(this, replyType, topicNumber, newCount);
	}
});

function repopulateBranch(button, type, parentId, newIndex){
	console.log("Attempting to repopulate.. "+parentId+" and type: "+type+" and new index: "+newIndex);
	$(button).parent().parent().children('p').text(reasonDict[parentId][type][newIndex-1].text);
	$(button).siblings('.supportText').children('span:first').text(String(newIndex));
	$(button).parent().attr('index-value', String(newIndex));
	//next update the reply button id infos...
	$(button).parent().parent().children('div.evidence span').text(String(reasonDict[parentId][type][newIndex-1].citations_for.length));
	$(button).parent().parent.children('div.object span').text(String(reasonDict[parentId][type][newIndex-1].reasons_against.length));
	$(button).parent().parent.children('div.support span').text(String(reasonDict[parentId][type][newIndex-1].reasons_for.length));
}

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
var replyToId
$("body").delegate('.branch input', "click", function(event){

	if ($(this).parent().parent().children('h3').text("New Reason")){

	}else{

	event.preventDefault();
	var replyToId = parseInt($(this).parent().parent().parent().attr("replyto-data"));
	console.log("Posting reply to: "+replyToId);
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
		resetPage();
		/**I know I'm making this inefficient, but I want it working before it's efficient.
			console.log("Ajax returned JSON" + jqXHR.responseText);
			topicData[String(replyToId)] = $.parseJSON(jqXHR.responseText);
			console.log(topicData[String(replyToId)].text);
			console.log(topicData[String(replyToId)].reasons_for[0]);
			**/
});
}
});

function fetchRootReplies(doneFunct) {
	var urlString = '/topic/' + currentUrlId + '.json';
	var jqxhr = $.ajax({
		type: "GET",
		url: urlString,
		cache: false,
		error: function(){alert("Error sending data."); },
		dataType: "JSON"
	});
	jqxhr.done(doneFunct);
}

function populate(){
	fetchRootReplies(function ( data, textStatus, jqXHR ) {
			console.log("Ajax returned JSON" + jqXHR.responseText);
			topicData = JSON.parse(jqXHR.responseText);
			addReasonTypesToData();
			var reasonDisplayOrder = sortRootReasons();
			displayReasons(reasonDisplayOrder);
});
}

function resetPage(){

	fetchRootReplies(function ( data, textStatus, jqXHR ) {
		console.log("Ajax returned JSON" + jqXHR.responseText);
		topicData = JSON.parse(jqXHR.responseText);
		addReasonTypesToData();
		var reasonDisplayOrder = sortRootReasons();
		$('.branch').remove();
		displayReasons(reasonDisplayOrder);
});


}

function addReasonTypesToData(){
	console.log("Adding reason types to data.  Let's look at the data first: " + topicData.reasons_for);
	for (i = 0; i < topicData["reasons_for"].length; i++){
		console.log("Adding reason type to data:" + topicData["reasons_for"][i].text);
		topicData["reasons_for"][i]["type"] = "reason";
	}
	for (i = 0; i < topicData["reasons_against"].length; i++){
	console.log("Adding objection types to data.:" + topicData["reasons_against"][i].text);
		topicData["reasons_against"][i]["type"] = "disagreeBox";
	}
}

//Sorting methods:
var whichReasons = 0; //0=all, 1=in favor, 2 = opposed.
var sortedInOrder = 0; //1 = most, 0 = least.
var sortedBy = 2; // 0 = cited, 1 = contentious, 2 = recent.

var sortingArray = [
					function(a,b){console.log("Sorting a for");return a.reasons_for.length-b.reasons_for.length;},
					function(a,b){console.log("Sorting b for");return b.reasons_for.length-a.reasons_for.length;},
					function(a,b){console.log("Sorting a against");return a.reasons_against.length-b.reasons_against.length;},
					function(a,b){console.log("Sorting b against");return b.reasons_against.length-a.reasons_against.length;},
					function(a, b){console.log("Sorting a created");return a.created - b.created},
					function(a,b){console.log("Sorting b created");return b.created - a.created;}
					];



function sortReasons(reasons){
	console.log("Sorting reasons..");

	var result = [];

	if (sortedInOrder === 1 && sortedBy === 0){
		result = $.extend(true, reasons.sort(sortingArray[0]));
	}else if (sortedInOrder === 0 && sortedBy === 0){
		result = $.extend(true, reasons.sort(sortingArray[1]));
	}else if (sortedInOrder === 1 && sortedBy ===1){
		result = reasons.sort(sortingArray[2]);
	}else if (sortedInOrder === 0 && sortedBy ===1){
		result = $.extend(true, reasons.sort(sortingArray[3]));
	}else if (sortedInOrder ===1 && sortedBy ===2){
		result =reasons.sort(sortingArray[4]);
	}else if (sortedInOrder ===0 && sortedBy ===2){
		result = reasons.sort(sortingArray[5]);
	}
	return result;

}
function sortRootReasons(){
	console.log("Sorting root reasons.");
	var result = [];
	if (topicData["reasons_for"].length > 0){
		for (i = 0; i < topicData["reasons_for"].length; i++){
			console.log("Appending: "+topicData["reasons_for"].text);
			result.push(topicData["reasons_for"][i]);
		}
		console.log("Concatenating "+topicData["reasons_for"].length+" reasons for.");
	}
	if (topicData["reasons_against"].length > 0){
		for (i = 0; i < topicData["reasons_against"].length; i++){
			console.log("Appending: "+topicData["reasons_against"][i].text);
			result.push(topicData["reasons_against"][i]);
		}
		console.log("Concatenating "+topicData["reasons_against"].length+" reasons against.");
	}
	console.log("Gathered "+result.length+" total reasons.");
	var sorted = sortReasons(result);
	return sorted;
}

function displayReasons(reasons){
	console.log("About to display " + reasons.length + " reasons...");
	for (var i = 0; i < reasons.length; i++){
		reason = reasons[i];
		reasonDict[reasons[i].id] = $.extend(true, {}, reasons[i]);
		console.log("Created a thingie.  id: "+reasons[i].id+"..and the thing is a " + typeof reasonDict[reasons[i].id].reasons_for)

		console.log("Displaying reason: " + reason + "text: "+ reason.text );
	$('body').append('<div class = "branch">'+
		'<div class = "'+reason.type+' reason box">'+
		'<div class = voteButton><img src="/images/finger-icon-grey.png"/></div>'+
		'<p>'+reason.text+
		'<div class ="more button" id-data= '+reasons[i].id+'>'+
		'<img src = "/images/more.gif"/>'+
	'</div>'+
	'<div class = "evidence button"; id-data= '+reasons[i].id+'>'+
		'<img src = "/images/citation.png"/>'+
		'<span class = "numberCircle">'+reason.citations_for.length+'</span>'+
	'</div>'+
	'<div class = "object button"; id-data= '+reasons[i].id+'>'+
		'<img src = "/images/objection.png"/>'+
		'<span class = "numberCircle">'+reason.reasons_against.length+'</span>'+
	'</div>	'+
	'<div class = "support button"; id-data= '+reasons[i].id+'>'+
		'<img src = "/images/support.png"/>'+
		'<span class = "numberCircle">'+reason.reasons_for.length+'</span>'+
	'</div>'+
'</div>');
}
}


var currentUrlId = parseInt($('div.topic.box').attr("conviction-data"));
populate();


$(window).resize(function() { setSizes(); });
$('.reply').hide();
setSizes();
};
