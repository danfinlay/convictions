

var topicData = {};
var currentUrlId = $('div.topic.box').attr("conviction-data");





var buttonTypeDict = {0: "reasons_for", 1:"reasons_against", 2:"citations_for"};
var divClassList = ["reason", "disagreeBox", "evidenceBox"];

function buttonType(button){
	if ($(button).hasClass("support")) {
		return 0;
	}else if($(button).hasClass("object")){
		return 1;
	}else if($(button).hasClass("evidence")){
		return 2;
	}else{
		return 3;
	}
}

function getFirstPostFor(parentId, buttonType){
	return {"text":"Sample text body!", "id":5, "support_count":1, 
	"objection_count":2, "evidence_count":3};
}

function expand(button){
	var buttonType = buttonType(button);
	var parentId = $(button).attr(id-data);
	var postDict = getFirstPostFor(parentId, buttonType);
	if (postDict["error"] == "No replies") {
		return;
	};
	$(button).parent().append('<div class = "branch" parent-data = '+parentId+'>'+
		'<div class = "'+divClassList[buttonType]+' reason box"; id-data= '+parentId+'>'+
		'<div class = voteButton><img src="/images/finger-icon-grey.png"/></div>'+
		'<p>'+postDict["text"]+
		'<div class ="more button" id-data= '+parentId+'>'+
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
}

function collapse(reason_id){

}


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
	var reply = '<div class = "branch '+ divClass + ' box" replyTo-data=' + reasonId + '><p>'+responseList[type]+'</p><a href = "add'+responseTypeList[type]+'">Add '+responseTypeList[type]+'</a></p><br></div>';
	return reply;
}