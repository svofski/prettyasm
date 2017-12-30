
var inTheOpera = false;
var scrollHistory = [];
var LabelsCount = 0;
var labels = new Object();

var resolveTable = Array(); // label negative id, resolved address
var mem = Array();
var textlabels = Array();
var references = Array();
var errors = Array();


String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.startsWith = function(s) {return (this.match("^"+s)==s); }

function loaded() {
    var json_textlabels = document.getElementById("json_textlabels").innerHTML;
    var json_references = document.getElementById("json_references").innerHTML;

    textlabels = eval(json_textlabels);
    references = eval(json_references);

    updateSizes();

    return false;
}

function updateSizes() {
    height = window.innerHeight;
    width = window.innerWidth;

    var to = document.getElementById('list');
    to.style.height = (height - 0) + "px";
    to.style.width = (width - 10) + "px";
}


function gotoLabel(label) {
    var sought = textlabels.indexOf(label.toLowerCase());
    var element = document.getElementById("label" + sought);
    if (element != undefined) {
        startHighlighting(sought, element);
        element = element.parentNode;
        var destination = element.offsetTop - getListHeight()/2;
        scrollTo(destination, true);
    }
    return false;
}

function getReferencedLabel(lineno) {
    var refto = references[lineno];
    if (refto != undefined) {
        var sought = textlabels.indexOf(refto.toLowerCase());
        return document.getElementById("label" + sought);
    }
    return undefined;
}

function getReferencingLines(lineno) {
    var refs = new Array();
    var fullrefs = new Array();
    var label = textlabels[lineno];
    if (label != undefined) {
        for(var i = 0; i < references.length; i++) {
            if (references[i] == label) {
                var element = document.getElementById("code" + i);
                refs[refs.length] = element;
                element = document.getElementById("l" + i);
                fullrefs[fullrefs.length] = element;
            }
        }
    }
    referencingLinesFull = fullrefs;
    return refs;
}

function getLabel(l) {
    return labels[l.toLowerCase()];
}

function referencesLabel(identifier, linenumber) {
    identifier = identifier.toLowerCase();
    if (references[linenumber] == undefined) {
        references[linenumber] = identifier;
    }
}


function scrollMark(location) {
    scrollHistory[scrollHistory.length] = location;
    if (scrollHistory.length > 32) {
        scrollHistory = scrollHistory.slice(1);
    }
}

// gobak i sosak
function scrollBack() {
    if (scrollHistory.length == 0) return;

    var dest = scrollHistory[scrollHistory.length - 1];
    scrollHistory.length = scrollHistory.length - 1;

    var l = document.getElementById('list');
    l.scrollTop = dest;

    magicToolbar(0);
}

// -- Highlighting and navigation --

var highlightTimeout = false;
var highlightTimeout2 = false;
var highlightLabel = false;
var highlightLineNo = false;
var highlightLines = new Array();
var highlightArrow = false;
var highlightOrigin = false;
var highlightDir = false;
var highlightDelayed = false;

// backreferences window
var backrefTimeout = false;
var backrefWindow = false;
var backrefTop = 0, backrefLeft = 0;
var backrefLabel = "?";

var referencingLinesFull = [];

function startHighlighting(lineno, label) {
    if (highlightTimeout == false) {
         highlightLineNo = lineno;
         highlightOrigin = document.getElementById('code'+lineno);
         highlightTimeout = setTimeout('highlightStage1()', 500);
         if (label != undefined) {
            highlightLabel = label;
         } else {
            highlightLabel = false;
         }
    }
}

function scrollTo(n, dontdelay) {
    if (!dontdelay) {
        highlightDelayed = true;
    }
    var l = document.getElementById('list');
    scrollMark(l.scrollTop);

    l.scrollTop = n;

    if (highlightOrigin) {
        highlightOrigin.removeAttribute('onclick');
        highlightOrigin.style.cursor = null;
    }
    if (highlightArrow) {
        highlightOrigin.removeChild(highlightArrow);
    }
}

function highlightStage1() {
    //highlightLines = getReferencingLines(highlightLineNo);
    if (!highlightLabel) {
        highlightLabel = getReferencedLabel(highlightLineNo);
    }
    if (highlightLabel != undefined) {
        var listElement = document.getElementById('list');
        var scrollTop = listElement.scrollTop;
        var height = getListHeight();

        // highlightLabel would only have relative offsetTop in Opera
        var labelTop = highlightLabel.parentNode.offsetTop;
        var labelHeight = highlightLabel.offsetHeight;

        if (highlightArrow == false && (labelTop-labelHeight) <= scrollTop) {
            highlightArrow = document.createElement('span');
            highlightArrow.innerHTML = '&#x25b2;'; //uarr
            highlightDir = 'uarr';
        } else if (highlightArrow == false && labelTop > scrollTop+height) {
            highlightArrow = document.createElement('span');
            highlightArrow.innerHTML = '&#x25bc;'; //darr
            highlightDir = 'darr';
        }

        if (highlightArrow != false) {
            highlightArrow.className = highlightDir+1;

            highlightOrigin.insertBefore(highlightArrow, highlightOrigin.firstChild);
            highlightArrow.style.display='inline-block';
            highlightArrow.style.marginLeft ='-4em';
            highlightArrow.style.paddingLeft ='2em';
            highlightArrow.style.width = '2em';

            highlightOrigin.setAttribute('onclick', 
                'scrollTo('+(labelTop-height/2)+'); return false;');
            highlightOrigin.style.cursor = 'pointer';
        }

        highlightLabel.className += ' highlight1';
    } 
    highlightTimeout = setTimeout('highlightStage2()', 50);
}

function highlightStage2() {
    if (highlightLabel != undefined) {
        highlightLabel.className = highlightLabel.className.replace('highlight1', 'highlight2');
    }
    if (highlightArrow != false) {
        highlightArrow.className = highlightDir + 2;
    }
    highlightTimeout = setTimeout('highlightStage3()', 100);
}

function highlightStage3() {
    if (highlightLabel != undefined) {
        highlightLabel.className = highlightLabel.className.replace('highlight2', 'highlight3');
    }
    if (highlightArrow != false) {
        highlightArrow.className = highlightDir + 3;
    }
}

function endHighlighting(lineno) {
    if (lineno == -2) {
         highlightTimeout2 = setTimeout('endHighlighting(-1)', 1000);
         highlightStage1();
         return;
    } else if (lineno == -1) {
        highlightDelayed = false;
        highlightTimeout2 = false;
    } else {
        if (highlightDelayed) {
            if (highlightTimeout2 == false) {
                highlightTimeout2 = setTimeout('endHighlighting(-2)', 350);
            }
            return;
        }
    }

    clearTimeout(highlightTimeout);
    highlightTimeout = false;
    if (highlightLabel != undefined) {
        if (highlightLabel.className != undefined) {
            highlightLabel.className = highlightLabel.className.replace(/ .*/, '');
        }
        highlightLabel = undefined;
    }
    for (src = 0; src < highlightLines.length; src++) {
        highlightLines[src].className = null;//'srchl0';
    }
    highlightLines.length = 0;

    if (highlightArrow != false) {
        if (highlightArrow.parentNode != null) {
            highlightArrow.parentNode.removeChild(highlightArrow);
        }
        highlightArrow = false;
    }
    if (highlightOrigin) {
        highlightOrigin.removeAttribute('onclick');
        highlightOrigin.style.cursor = null;
    }
}

function formatBackrefText(element) {
    formatBackrefText.spaces = "         ";
    var label = "";
    var text = "";
    for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if (child.id == undefined) continue;
        if (child.id.indexOf("label") == 0) {
            label = child.innerHTML;
        } else if (child.id.indexOf("code") == 0) {
            text = child.innerHTML;
        } else if (child.className == "adr") {
            adr = child.innerHTML;
        }
    }

    if (label.length < formatBackrefText.spaces.length) {
        label += formatBackrefText.spaces.substring(label.length);
    }

    return [adr,label,text].join(' ').replace(/ /g,'&nbsp;');
}

function showBackrefReturn(on) {
    var sosak = document.getElementById('backrefgoback');
    if (sosak != undefined) {
        sosak.style.display= on ? 'block' : 'none';
    }
    return false;
}

function backrefHintLine(n) {
    if (n == -1) {
        if (backrefHintLine.unhint != undefined) {
            backrefHintLine.unhint.className = null;
            backrefHintLine.unhint = undefined;
        }
        return;
    }
    backrefHintLine(-1);
    var line = document.getElementById(n);
    if (line != undefined) {
        var node = line.childNodes[line.childNodes.length-1];
        if (node.className == 'cmt')
            node = line.childNodes[line.childNodes.length-2];
        backrefHintLine.unhint = node;
        backrefHintLine.unhint.className = 'srchl3';
    }
}

function startBackrefWindow(lineno) {
    if (lineno != -1) {
        highlightLines = getReferencingLines(lineno);
        highlightOrigin = document.getElementById('code'+lineno);
        backrefLabel = document.getElementById('label'+lineno);
        setTimeout('startBackrefWindow(-1)', 250);
        return;
    }
    if (backrefTimeout == false &&
        highlightLines.length > 0) {
        backrefTimeout = setTimeout('showBackref(0)', 500);
        backrefLeft = backrefLabel.offsetLeft;
        backrefTop = highlightOrigin.offsetTop + 4;
        backrefTop += backrefLabel.offsetHeight;
        list = document.getElementById('list');
        if (!inTheOpera) {
            backrefTop -= document.getElementById('list').scrollTop;
        }
    }
}


function showBackref(n) {
    if (n == 0) {
        endHighlighting(0);
        var list = document.getElementById('list');
        var height = getListHeight();
        backrefTimeout = false;
        // start display
        if (!backrefWindow) {
            backrefWindow = document.createElement('div');
            backrefWindow.id = 'backrefpopup';
            backrefWindow.style.position = 'fixed';
            backrefWindow.setAttribute("onmouseover",
                "clearTimeout(backrefTimeout);backrefTimeout=false;return false;");
            backrefWindow.setAttribute("onmouseout",
                "showBackref(-1);return false;");
            document.getElementById('list').appendChild(backrefWindow);
        }
        backrefWindow.style.left = backrefLeft + 'px';
        backrefWindow.style.top = backrefTop + 'px';
        backrefWindow.style.display = 'block';

        backrefWindow.innerHTML = '';
        for (var src = 0; src < referencingLinesFull.length; src++) {
            var labelTop = referencingLinesFull[src].offsetTop;
            var text = formatBackrefText(referencingLinesFull[src]);
            var scrollTo = labelTop - backrefTop + 18;
                        
            backrefWindow.innerHTML += 
              '<div onclick="scrollTo('+scrollTo+');' +
              'backrefHintLine(\'' + referencingLinesFull[src].id +'\');' +
              'showBackrefReturn(1);' +
              'return false;"' +
              ' class="brmenuitem" ' +
              '>' +
              text + 
              '</div>';
        }
        // append return
        var returnTo = list.scrollTop;
        backrefWindow.innerHTML += 
              '<div id="backrefgoback" onclick="scrollTo(' +returnTo+ ');'+
                            'showBackref(-1);return false;"' +
              ' class="brmenuitem" ' +
              ' style="border-top:1px solid black;font-size:120%;">' +
              '&nbsp;&#x25c0;&nbsp;' + backrefLabel.innerHTML +
              '</div>';
        showBackrefReturn(0);
        backrefWindow.style.opacity = 0;
        showBackref.opacity = 0;
        showBackref(1);
    }

    if (n == 1) {
        if (backrefWindow.style.opacity >= 0.9) {
            backrefTimeout = false;
        } else {
            showBackref.opacity += .3;
            backrefWindow.style.opacity = showBackref.opacity;
            setTimeout('showBackref(1);', 50);
        }
    }

    // start hiding
    if (n == -1) {
        clearTimeout(backrefTimeout);
        backrefTimeout = setTimeout('showBackref(-2)', 100);
        backrefHintLine(-1);
    }

    if (n == -2) {
        clearTimeout(backrefTimeout);
        backrefTimeout = false;
        if (backrefWindow != false) {
            backrefWindow.style.display = 'none';
        }
    }

    return false;
}

function mouseover(lineno) {
    startHighlighting(lineno);
    return false;
}

function mouseovel(lineno) {
    startBackrefWindow(lineno);
    return false;
}

function mouseout(lineno) {
    endHighlighting(lineno);
    showBackref(-1);
    return false;
}

function getRuleset(selector) {
    var rules = document.styleSheets[1].cssRules;
    for (i = 0; i < rules.length; i++) {
        if (rules[i].selectorText == selector) {
            return rules[i];
        }
    }
    return undefined;
}

function rgmouseover(className) {
    list = [].concat(className);

    for (var i = 0; i < list.length; i++) {
        ruleset = getRuleset("."+list[i]);
        if (ruleset != undefined) {
            ruleset.style["color"] = "#ff3020";
        }
    }
}

function rgmouseout(className) {
    list = [].concat(className);

    for (var i = 0; i < list.length; i++) {
        ruleset = getRuleset("."+list[i]);
        if (ruleset != undefined) {
            ruleset.style["color"] = "lightgray";
        }
    }
}

function getListHeight() {
    var listElement = document.getElementById("list");
    return inTheOpera ? 
        listElement.style.pixelHeight : listElement.offsetHeight;

}

