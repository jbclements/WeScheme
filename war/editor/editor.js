var savedContents = "";

// makeBreak: key-event -> void
function makeBreak(e){
  var brk = $("<br />")
             .addClass("userBreak")
             .addClass("wspace")
             .attr("contenteditable","false");
  brk.splitAndInsertAtSelection();
  var nxt = brk.next();
  if( !nxt.text().length ){
    nxt.html("&nbsp;");
  }
  sizeParens(nxt.parents(".sexpr:first"));
  nxt.focusStart();

}

// makeSpace: key-event -> void
function makeSpace(e){
  var space =
    $("<div/>")
      .addClass("wspace")
      .addClass("space")
      .html("&nbsp;");

  space.splitAndInsertAtSelection();
  space.next().focusStart();

}

// makeLiteral : key-event -> void
function makeLiteral(e){
  var lit =
    $("<div/>")
     .addClass("literal")
     .append(
       $("<div />")
         .addClass("tick")
         .attr("contenteditable","false")
         .click(clickOpen)
         .text('\''))
      .append(
        $("<div />")
          .addClass("body")
          .attr("contenteditable","false")
          .append(
            $("<div />")
              .addClass("data")
              .attr("contenteditable","true")
              .html("&nbsp;")
              .keypress(metaHandler(literalKeyHandler))));
  
  lit.focus(illuminateBlock);
  lit.attr("onblur","dimBlock");
  $("#editor").blur();
  lit.splitAndInsertAtSelection();
  lit.children(".body").children(".data").focus();
  lit.children(".body").children(".data").contentFocus();
}

// makeString: key-event -> void
function makeString(e){
  var tar = jQuery(e.target);
  var str =
    $("<div/>")
     .addClass("string")
     .keypress(metaHandler(stringKeyHandler))
     .append(
       $("<div />")
         .addClass("openQuote")
         .addClass("open")
         .click(clickOpen)
         .html("&#147;"))
     .append(
       $("<div />")
         .addClass("body")
         .attr("contenteditable","false")
         .append(
           $("<div />")
             .addClass("data")
             .attr("contenteditable","true")
             .html("&nbsp;")))
     .append(
       $("<div />")
         .addClass("closeQuote")
         .addClass("close")
         .addClass("gray")
         .click(clickClose)
         .html("&#148;"));

  str.focus(illuminateBlock);
  str.attr("onblur","dimBlock");
  $("#editor").blur();
  str.splitAndInsertAtSelection();
  str.children(".body").children(".data").focus();
  str.children(".body").children(".data").contentFocus();
  
}


// makeSexpr: key-event -> void
function makeSexpr(e){
 
  var tar = jQuery(e.target);
 
 var sexpr =  
   $("<div/>")
     .addClass("sexpr")
     .attr("contenteditable","false")
     .append(
       $("<div />")
         .addClass("open")
         .css("vertical-align","top")
         .click(clickOpen)
         .append(openBracket()))
     .append(
       $("<div />")
         .addClass("body")
         .click(clickBody)
         .attr("contenteditable","false")
         .append(
           $("<div />")
             .addClass("data")
             .attr("contenteditable","true")
             .html("&nbsp;")
             .keypress(metaHandler(sexprKeyHandler))))
     .append(
       $("<div />")
         .addClass("close")
         .css("vertical-align","top")
         .addClass("gray")
         .click(clickClose)
         .append(closeBracket()));
  sexpr.focus(illuminateBlock);
  sexpr.blur(dimBlock);
  $("#editor").blur();
  sexpr.splitAndInsertAtSelection();
  sizeParens(sexpr);
  sexpr.children(".body").children(".data").focus();
  sexpr.children(".body").children(".data").contentFocus();
}

function openBracket() {
   var b = $("<div />")
    .addClass("openParen")
    .append(
      $("<img />")
        .attr("src", "../css/images/top.png")
        .css("width","10px"))
    .append($("<br />"))
    .append(
      $("<img />")
        .attr("src", "../css/images/mid.png")
        .css("width","10px")
        .css("height","100%")
        .attr("alt","("))
    .append($("<br />"))
    .append(
      $("<img />")
        .attr("src", "../css/images/bot.png")
        .css("width","10px"));
    return b;
}

function closeBracket() {
  var b = $("<div />")
    .addClass("closeParen")
    .append(
      $("<img />")
        .attr("src", "../css/images/top_r.png")
        .css("width","10px"))
    .append($("<br />"))
    .append(
      $("<img />")
        .attr("src", "../css/images/mid_r.png")
        .css("width","10px")
        .css("height","100%")
        .attr("alt",")"))
    .append($("<br />"))
    .append(
      $("<img />")
        .attr("src", "../css/images/bot_r.png")
        .css("width","10px"));

    return b;
}

function metaHandler(handler){
  return function(e){

    var tar = $(e.target);
    if( "&nbsp;" == tar.html()){
      tar.text("");
    }
    
    handler(e);
  }

}

function leaveBlock(type, e){
  var tar = $(e.target);
  var range = window.getSelection().getRangeAt(0);
  if( tar.parents(".sexpr").length || tar.parents(".string").length ){
    tar.parents(".body").parents(":first").children(":last").removeClass("gray");
    tar.parents(".body").parents(":first").next(":first").focusStart();
  }

    e.preventDefault(); 
}

function illuminateBlock(e){
  var tar = $(e.target);
  tar.parents(":body:first").parent().fadeTo("fast", 1.0);
  return 0;
}

function dimBlock(e){
  var tar = $(e.target);
  tar.parents(":body:first").parent().fadeTo("slow", 0.5);
  return 0;
}


function globalKeyHandler(e){
  $("#editor").find(".active").removeClass("active");
  $(e.target).addClass("active");


  switch(e.keyCode){
  case 8:                   //backspace
      backspaceKey(e);
      return;
  case 13:                   // newline
      makeBreak(e);
      e.preventDefault();
      return;
  case 37:                   // left
      leftKey(e);
      return;
  case 39:                 // right
      rightKey(e);
      return;
  case 46:
      deleteKey(e);
      return;
  }

  switch(e.charCode){
  case 32:                   // space
      makeSpace(e);
      e.preventDefault();
      return;
  default:
      return;
  }
}

//
function parsedNode(n){
  
  return (n.hasClass("arglist")       ||
          n.hasClass("function-node") ||
          n.hasClass("string-node")   ||
          n.hasClass("begin-like")    ||
          n.hasClass("lambda-like")   ||
          n.hasClass("open")          ||
          n.hasClass("close")         ||
          n.hasClass("tick")          ||
          n.hasClass("data"));

}


// backspace: key-event -> void
function backspaceKey(e) {
 
    var aSelection = getCursorSelection();
    var tar = aSelection.node;


    if( tar.hasClass("body") ){ tar = tar.children(".active"); }

    // If we're at the start edge, merge with the previous sibling.
    if(aSelection.atStart()) {
      	e.preventDefault();
        var prev = tar.prev();

        if( prev.hasClass("wspace") ){
            prev.remove();
            prev = tar.prev();

            if( prev.hasClass("data") ){
              var loc = prev.text().length;
              tar.text(prev.text() + tar.text());
              prev.remove();              
              tar.focusAt(loc); 
              return;
            }
        } 
    
        var pred = tar.predecessorWith(parsedNode);
         
        // console.log(pred);

        if( pred.hasClass("close") ){

          if( !pred.hasClass("gray") ){
            pred.addClass("gray");
          }
          
          var endNode = pred.parent().children(".body").children(".data:last");
          endNode.focus();
          endNode.focusEnd();
          return;
        }

        if( pred.hasClass("open") ){
          // Walk up from the data node
          var expr = pred.parent();
          var lastNode = expr.children(":last"); // the last node might be the same as tar
          
          //remove the parens or quotes
          expr.children(".open").remove();
          expr.children(".close").remove();

          var prev = expr.prev(":first");
          var next = expr.next(":first");
          
          if( 1 == expr.children().length && "&nbsp;" == tar.html()){
            var newTar = expr.leafPredecessor();
            newTar.focusAt(newTar.text().length);
            expr.remove();
          } else {
            var newTar = expr.leafPredecessor();
            newTar.focusAt(newTar.text().length);
            tar.parent().unwrap(); // unwrap the body
            expr.unwrap();  // unwrap the container
          }

          if( lastNode.hasClass("data") && next.hasClass("data") ){
            lastNode.text(lastNode.text() + next.text());
            next.remove();
          }


          if( tar.hasClass("data") && prev.hasClass("data") ){
            var len = prev.text().length;
            tar.text(prev.text() + tar.text());
            prev.remove();
            tar.focusAt(len);
          } else {
            tar.focusAt(0);
          }
        }
        

    } else {
	e.preventDefault();
	// Manually doing backspace deletion to avoid the introduction
	// of the weird <br _mozdirty="" type="_moz"> stuff.
	var range = window.getSelection().getRangeAt(0);
	if (range.startOffset == range.endOffset) {
	    range.setStart(range.startContainer, range.startOffset - 1);
	}
	range.deleteContents();
  }

  if( tar.text().length == 0 ){
    tar.html("&nbsp;");
  }

}

function clickOpen(e){
  e.stopPropagation();
	var predecessor = $(e.target).predecessorWith(
	    function(p){ 
		  return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });
	if (predecessor.size() > 0) {
	    predecessor.get(0).focus();
      predecessor.focusEnd();
	}

}

function clickClose(e){
  e.stopPropagation();
	var successor =	$(e.target).successorWith(
	    function(p){ 
		return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });

	if (successor.size() > 0) {
	    successor.focusStart();
	}
 }

function clickBody(e){

  e.stopPropagation();
  if( 1 == $(e.target).children().length &&
      !$(e.target).children(".data").text().length){
      
      $(e.target).children(".data").html("&nbsp;");
      $(e.target).children(".data").focus();
      $(e.target).children(".data").contentFocus();

      }

}


// FIXME: We may need to do something clever here, at least according to
// http://stackoverflow.com/questions/202285/trigger-a-keypress-with-jqueryand-specify-which-key-was-pressed
function leftKey(e) {

    var aSelection = getCursorSelection();
    if(aSelection.atStart()) {
	e.preventDefault();
	var predecessor = aSelection.node.predecessorWith(
	    function(p){ 
		return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });
	if (predecessor.size() > 0) {
	    predecessor.get(0).focus();
      predecessor.focusEnd();
	}

    }
}

function rightKey(e) {
    var aSelection = getCursorSelection();
    if (aSelection.atEnd()) {
	e.preventDefault();
	var successor =	aSelection.node.successorWith(
	    function(p){ 
		return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });

	if (successor.size() > 0) {
	    successor.focusStart();
	}
    }
}



function deleteKey(e) {
    var aSelection = getCursorSelection();
    //    debugLog(aSelection);
    if (aSelection.atEnd()) {
	e.preventDefault();
	//	debugLog("We should delete forward");
    }
}

// sexprKeyHandler: key-event -> void
function sexprKeyHandler(e){

  e.stopPropagation();
  var tar = $(e.target).parents(".body:first");
    
  switch(e.charCode){
  case 34:                 // quote
      makeString(e);
      e.preventDefault();
      break;
  case 39:
      makeLiteral(e);
      e.preventDefault();
      break;
  case 40:                 // paren
  case 91:
      makeSexpr(e);
      e.preventDefault();
      break;
  case 41:
  case 93:
      leaveBlock("close",e);
      break;
    default:
      globalKeyHandler(e);
  }
  
  setTimeout(function(){
               tar.indent(); 
               sizeParens($(e.target).parents(".sexpr:first"));
            },1);

  return true;
}

function sizeParens(sexpr){
  var bdy = sexpr.children(".body");
  var currSz = -1;
  var height = 0;

  if( bdy ){
    height = bdy.css("height"); //scalePx(bdy.css("height"),1.25);
    var open  = sexpr.children(".open");
    var close = sexpr.children(".close");
    currSz = open.css("font-size");
    open.css("height", height);
    close.css("height", height);
  }

  var enclosingSexpr = sexpr.parents(".sexpr:first");
  
  if( enclosingSexpr.length 
      && height != currSz ){
    sizeParens(enclosingSexpr);
  }
  return;
}


function scalePx(str, scalar){

  var num = (new String(str)).split('px')[0] - 0;
  num *= scalar;
  num = Math.floor(num);
  return num + "px";
  
}
// literalKeyHandler: key-event -> void
function literalKeyHandler(e){
  
  e.stopPropagation();
  switch(e.charCode){
    case 32:
      e.preventDefault();
      $(e.target).parents(".literal").next(".data").focusAt(0);
      makeSpace(e);
      $(e.target).parents(".literal").next(".data").remove(); //TODO This code deletes an extra empty data element
      return;
  }

  globalKeyHandler(e);
}

// stringKeyHandler: key-event -> void
function stringKeyHandler(e){
	e.stopPropagation();
  e.cancelBubble = true;

  switch(e.charCode){
      case 34:
        leaveBlock("close",e);
        return;
      default:
  }
	
	switch(e.keyCode){
      case 13:                   // newline
        makeBreak(e);
        e.preventDefault();
      return;
 
        break;
      default:
        globalKeyHandler(e);
    }
}



// isParen: key-event -> boolean
function isParen(e){ return (e.charCode == 40); }

// isQuote: key-event -> boolean
function isQuote(e){ return (e.charCode == 34); }


// serialize: node -> string
function serialize(node) {
    return $(node).html()
}


// unserialize: string node -> void
function unserialize(text, node) {
    $(node).html(text);
}


// doSave: -> void
// Save the contents of the buffer.
function doSave() {
    savedContents = serialize($("#editor"));
}

// doRestore: -> void
// Restore the contents of the buffer.
function doRestore() {
    unserialize(savedContents, jQuery("#editor"));
    // fixme: restore the key handlers
}

$(document).ready(function() {

    // Set the default keyhandler of the editor.
    $("body").keypress(sexprKeyHandler);
    
    // Hooking up the save and restore buttons.
    $("#save").click(function(e) {
	doSave();
	e.preventDefault();
    });
    $("#restore").click(function(e) {
	doRestore();
	e.preventDefault();
    });

    $("#head").focus();
    $("#head").contentFocus();
    // Do an initial save.
    doSave();
});
