/**
 author: gitpharm01 / https://github.com/gitpharm01
*/

import {JointTemplate} from './hingeJoint.js'
import {tutorialObj} from './slideTutorial.js'

//Global variables(settings)
const FIRST_POINT_TOLERANCE = 16;
const FIRST_POINT_TOLERANCE_OFFSET = 8;
const MOUSE_TOLERANCE = 8;
const MOUSE_TOLERANCEOffset = 5;
const GUIDE_TOLERANCE = 5;
const HIGHLIGHTED_ANCHOR_COLOR = "rgb(41,171,226)";
const HIGHLIGHTED_ANCHOR_RADIUS = 15;
const HIGHLIGHTED_LINE_WIDTH = 2;
const CLOSING_ANCHOR_COLOR = "#000000";
const CLOSING_ANCHOR_RADIUS = 2;
const POINT_BORDER_COLOR = "#d12a00";
const POINT_FILL_COLOR = "rgba(41,171,226,0.75)";
const FIRST_POINT_FILL_COLOR = "rgba(156,228,62,0.7)";
const POINT_RADIUS = 5;
const INITIAL_LINE_COLOR = "rgba(0,255,100,0.7)";
const INITIAL_FILL_COLOR = "#666666";
const INITIAL_LINE_WIDTH = 15;
const CLOSED_LINE_COLOR = "rgba(0,255,100,0.9)";
const CLOSED_FILL_COLOR = "#EEEEEE";
const CLOSED_LINE_WIDTH = 15;
const LINE_DROPSHADOW_COLOR = "rgba(0,0,0,0.2)";
const LINE_DROPSHADOW_BLUR = 4;
const LINE_DROPSHADOW_OFFSETX = 3;
const LINE_DROPSHADOW_OFFSETY = 3;
const REPLACE_CONTROL_POINT_TOLERANCE = 1;
const TRACE_SCALE_FACTOR = 0.9;
const POINT_DISTANCE_FROM_EDGE = 2;
const POINT_DELETE_MODE_FILL_COLOR = "rgba(0, 20, 255, 0.75)";
const POTENTIAL_LINE_COLOR = "#aaaaaa";
const POTENTIAL_LINE_WIDTH = 8;
const CONTROL_POINT_ACTIVE_RADIUS = 3;
const CONTROL_POINT_ACTIVE_FILL_COLOR = "rgba(251,176,59,0.8)";
const CONTROL_POINT_INACTIVE_RADIUS = 3;
const CONTROL_POINT_INACTIVE_FILL_COLOR = "rgba(251,176,59,0.7)";
const CONTROL_POINT_ADD_FILL_COLOR = "#ea1f1f";
const CONTROL_POINT_SELECTED_LINE_WIDTH = 2;
const CONTROL_POINT_INACTIVE_SELECTED_COLOR = "#444444";
const CONTROL_POINT_ACTIVE_SELECTED_COLOR = "rgba(251,176,59,0.8)";
const CONTROL_POINT_SELECTED_ANCHOR_RADIUS = 9;
const CONTROL_POINT_TANGENT_WIDTH = 2;
const CONTROL_POINT_TANGENT_COLOR = "rgb(212,20,90)";
const CONTROL_POINT_LINE_WIDTH = 5;
const GUIDE_LINE_COLOR = "rgba(221,221,221,0.5)";
const GUIDE_LINE_WIDTH = 0.5;
const OVERLAY_OPACITY = 200;
const MAGIC_TRACE_TOLERANCE = 60;
const MAGIC_TRACE_OVERLAY_COLOR = {
    r: 240,
    g: 248,
    b: 255
};
const MAGIC_TRACE_PATH_COLOR = CLOSED_LINE_COLOR;
const MAGIC_TRACE_PATH_WIDTH = 5;
//Tolerable loop length for tracing a flood filled reagion
var MAGIC_TRACE_MAX_LOOP_LENGTH = 1000000;
var messages = {
    closed: "Loop closed! The shape is done.",
    empty: "",
    magictracefailed: "Sorry, magic trace cannot build up a usable shape",
    startmagictrace: "Magic Trace Mode: Click within your image to auto-select it",
    deletemode: "Delete Mode: Click on any red points to delete it with connecting segments",
    insertmode: "Insert mode: Click on red points to create new anchors. Tap i again to exit this mode."
};
//Global variables(objects and data)
var mainCanvas, context;
var traceCanvas, traceContext;
var allPoints = [];
var finalArray = [];
var newPoint;
var offset;
var colorLayerData;
var colorLayerDataTraceCanvas;
//The container for segments found by magic trace function "buildOutline"
var magicTraceSegmentDictionary = {};
var magicTracePathArray;
var metaUsed = false;
var itemClosed = 0;
var itemEditable = true;
var startOverFlag = 0;
var deleteAnchorMode = 0;

var magicTrace = 0;
var traceImageLoaded = 0;
var magicTraceError = 0;
var insertMode = false;
var editAnchorIndex = -1;
var editControlIndex = -1;
var endpointHover = 0;
var overCanvas = 1;
var guideActiveVertical = -1;
var guideActiveVerticalControl = 0;
var guideActiveHorizontal = -1;
var guideActiveHorizontalControl = 0;
var anchorRemoved = 0;


//Tutorial slide show object
var tutorial;

var jointMod = false;
const CANVAS_SCALE_X = 650;
var currentPlotScaleX = 150;
var scaleRatio = currentPlotScaleX / CANVAS_SCALE_X;

var templates = [];
var activeTemplateNum;
var dragActiveTemplate = false;

//functions for external use to change the templates(templates will be packed in this module) such as in flexisystem.js 
function isTemplatesEmpty(){
	if (templates.length ==0) {
		return true	
	}else {return false}
}

function setTemplateRotation( angle ){
	templates[activeTemplateNum].setRotation(angle);
}

function setTemplateLengthRL(isR, distance ){
	if(isR){
		templates[activeTemplateNum].setLengthR(distance)
	}else{
		templates[activeTemplateNum].setLengthL(distance)
	}
	
}

function addNewJoint(){
	if(!jointMod){
		console.log("joint can only be added in jointMod!!");
		return	
	}
	if(allPoints.length ==0){
		alert("The shape is not done yet!");
		return
	}
	var jtemplate = new JointTemplate([mainCanvas.width / 2, mainCanvas.height / 2]);
	//Inactivate all other existing templates
	if(templates.length > 0){ 
		for(var i=0;i< templates.length;i++){
			templates[i].isActive = 0;
		}	
	}
	templates.push(jtemplate);
	activeTemplateNum = templates.length -1;
	refresh();
	update3DScript();
}
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Initialize the scene after the page is ready.
var shiftDepressed = 0;

//Function to detect tutorial element is active or not
function checkTutorialMod(){
	if(document.getElementById("tutorialDivision").style.display=="block"){
		document.getElementById("sketcharea").disabled = true;
		return true;
	}else {
		document.getElementById("sketcharea").disabled = false;
		return false
	}
}

function loadInitializer() {
	refresh();
}
window.onresize = function (a) {
    setOffset()
};
//Set up the html5 2d canvas 
function setupCanvas() {
    mainCanvas = document.getElementById("sketcharea");
    if (!mainCanvas || !mainCanvas.getContext) {
        return
    }
    context = mainCanvas.getContext("2d");
    if (!context) {
        return
    }
    setOffset();
    traceCanvas = document.getElementById("tracelayer");
    traceContext = traceCanvas.getContext("2d");
    traceContext.globalAlpha = 0.5;
    //change mouse cursor type 
    mainCanvas.style.cursor = "crosshair";
    //enable drag and drop and handle image to be dragged into the canvas
    mainCanvas.addEventListener("dragover", handleDragOver, false);
    mainCanvas.addEventListener("drop", loadTraceImage, false);
    //add listeners for drawing related mouse event(press, drag, release, cancel) 
    addRelevantEventListeners();
    //CSS effects for the user interface
    $(".mode-label .exit").click(function () {
        $(this).parent().fadeOut();
        $(".toolbar").slideDown();
        if (insertMode) {
            insertModeToggle()
        } else {
            if (deleteAnchorMode) {
                toggleDeleteMode()
            }
        }
        //initialize the canvas
        refresh()
    });
    //if (sampleStartImage.length > 0) {
    //    var a = sampleStartImage.length == 1 ? 0 : Math.floor(Math.random() * sampleStartImage.length)
    //}
    refresh();
    //trace mode settings
    if (($("meta[name=trace_image]").length == 1) && !metaUsed) {
        metaUsed = true;
        drawTraceImage($("meta[name=trace_image]").attr("content"));
        $("meta[name=trace_image]").remove()
    }
}
function pressJoint(event){
	//Skip all process if tutorial is shown
	if(checkTutorialMod()){
		return	
	}
	//reletive mouse click position at (x,y)
    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;

	if (jointMod && templates.length >0 ) {
		
		if( checkIfNearPoint(x, y, templates[activeTemplateNum].coordinates[0], templates[activeTemplateNum].coordinates[1]) ){
			dragActiveTemplate = true;
		}else {
			dragActiveTemplate = false;
		}
		//Enter loop for checking possible hit on any inactive templates
		for(var i=0; i< templates.length; i++){
			if (i == activeTemplateNum){
				continue	
			}
			if( checkIfNearPoint(x, y, templates[i].coordinates[0], templates[i].coordinates[1]) ){
				//Deactivate the current active template
				templates[activeTemplateNum].isActive = false;
				//Set the next active template
				activeTemplateNum = i;
				templates[i].isActive = true;
				
			}
		}
		

	}
}
//function for mouse 'click'
function press(j) {
	//Skip all process if tutorial is shown
	if(checkTutorialMod()){
		return	
	}
    //reletive mouse click position at (x,y)
    var x = j.pageX - offset.left;
    var y = j.pageY - offset.top;
    //In a condition which allPoints is empty 
    if (allPoints.length == 0 ) {
        //call function to set up offset(in this case is canvas) size( width and length)
        setOffset();
        //return if the trace mode is not active
        if (!magicTrace) {
            return
        }
    }
    //In tracemode, locate the selected region and the "refresh()" function will activate the magic trace
    if (magicTrace) {
        findSelectedRegion(x, y);
        refresh();
        return
    }

	

    //part for "Delete anchor mode "
    for (var c = 0; c < allPoints.length; c++) {
        //If the click position is near to any of the anchorPoint (function "checkIfNearPoint"),
        //do the following code, otherwise just keep looping
        if (((c !== 0 || itemClosed) || (c == 0 && allPoints.length > 0 && allPoints.length < 3)) && checkIfNearPoint(x, y, allPoints[c][0], allPoints[c][1])) {
            //In Delete anchor mode, function"removeAnchor()" will be called to return a value "l"(true or false)
            if (deleteAnchorMode) {
                //get variable "l" to show the result of anchor deletion,
                //it will return true(1) if deletion happended
                var l = removeAnchor(c);
                if (l) {
                    //if a anchor is deleted, change the global variable anchorRemoved to true(1)
                    anchorRemoved = 1;
                    if (allPoints.length == 0) {
                        toggleDeleteMode()
                    }
                    //refresh first if the item is closed and the points can form up a shape
                    refresh();
                    if (itemClosed && allPoints.length == 4) {
                        toggleDeleteMode()
                    }
                } else {
                    toggleDeleteMode()
                }
                return
            }
            //set index value to "c" and break the loop
            editAnchorIndex = c;
            mainCanvas.style.cursor = "default";
            return
        }
    }
    //End of loop

    //If it's in deleteAnchor mode AND the points are Not closed AND the clicked area is near the first point
    if (deleteAnchorMode && !itemClosed && checkIfNearPoint(x, y, allPoints[0][0], allPoints[0][1])) {
        var l = removeAnchor(0);
        if (l) {
            anchorRemoved = 1;
            if (allPoints.length == 0) {
                toggleDeleteMode()
            }
            refresh()
        } else {
            toggleDeleteMode()
        }
        return
    }

    //Insert mode part
    //If the are more than one points, go through following loop 
    if (allPoints.length > 1) {
        for (var c = 0; c < allPoints.length - 1; c++) {
            //(cx,xy)is the position of point[c]'s control point,
            var cx = allPoints[c][2];
            var cy = allPoints[c][3];
            //check if the clicked area is near to any one of the control points in allPoints
            //replace the control point at point[c] with a new anchor point and create a new control point
            if (checkIfNearPoint(x, y, cx, cy)) {
                if (insertMode) {
                    //loop backward from last point,
                    for (var a = allPoints.length - 1; a > -1; a--) {
                        //if a is still bigger than c, pass the value of allPoints[a] to [a+1], 
                        //Because the array is inserted with a new point
                        if (a > c) {
                            allPoints[a + 1] = allPoints[a]
                        }
                        //If the "Control" point c is reached, change the value of subsequent anchor point [a+1]
                        //
                        if (a == c) {
                            allPoints[a + 1] = [cx, cy, cx, cy, 0];
                            allPoints[a][2] = allPoints[a][0] + (allPoints[a + 1][0] - allPoints[a][0]) / 2;
                            allPoints[a][3] = allPoints[a][1] + (allPoints[a + 1][1] - allPoints[a][1]) / 2;
                            //The control point value of [a+1] will be set again here!!
                            allPoints[a + 1][2] = allPoints[a + 1][0] + (allPoints[a + 2][0] - allPoints[a + 1][0]) / 2;
                            allPoints[a + 1][3] = allPoints[a + 1][1] + (allPoints[a + 2][1] - allPoints[a + 1][1]) / 2;
                        }
                    }
                } else {
                    //If it's not in add anchor point mod, turn the control point into editable form
                    editControlIndex = c;
                    allPoints[editControlIndex][4] = 1;
                    mainCanvas.style.cursor = "default"
                }
            }
        }
    }
}
//joint mod version of Mouse up
function releaseJoint(event){
	//Skip all process if tutorial is shown
	if(checkTutorialMod()){
		return	
	}
	var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;
	if( allPoints.length==0){
		alert("No existing shape!");
		return	
	}

	if(templates.length ==0){
		return	
	}
	if(dragActiveTemplate){
		templates[activeTemplateNum].setCoordinates(x,y);
		dragActiveTemplate = false;	
	}
	
	refresh();
	update3DScript();
}
//function for mouse up (c,b)
function release(d) {
	//Skip all process if tutorial is shown
	if(checkTutorialMod()){
		return	
	}
    var x = d.pageX - offset.left;
    var y = d.pageY - offset.top;
    //Nothing to do in magictrace mode
    if (magicTrace) {
        return
    }
	//Reset the dragActiveTemplate value to false
	
    //If there are a anchor point removed, reset the variable"anchorRemoved" and update the model in 3DViewer
    if (anchorRemoved == 1) {
        anchorRemoved = 0;
        update3DScript();
        return
    }
    if (insertMode) {
        insertMode = 0;
        update3DScript();
        return
    }
    //If one of the anchor point is clicked, do the following:
    if (editAnchorIndex != -1) {
        //If there are more than one point and in deleteAnchorMode
        if (deleteAnchorMode != 1 && allPoints.length > 0) {
            //reassign the value of x and y to the deleted point
            if (guideActiveVertical != -1) {
                x = allPoints[guideActiveVertical][0]
            }
            if (guideActiveHorizontal != -1) {
                y = allPoints[guideActiveHorizontal][1]
            }
        }
        //change the anchor point position
        changeAnchor(x, y, editAnchorIndex);
        //reset the anchorIndex to -1(no anchor selected) and call refresh and update3DScript
        editAnchorIndex = -1;
        refresh();
        update3DScript();
        mainCanvas.style.cursor = "crosshair";
        return
    }
    //If one of the control points is clicked
    if (editControlIndex != -1) {
        //check function if contorl point is needed to be replaced, will return true if control point have no need to be changed
        if (determineIfControlPointReplaced(x, y, editControlIndex)) {
            var a = editControlIndex + 1;
            if (itemClosed && a == allPoints.length - 1) {
                a = 0
            }
            //Send the control point back to proper position and refresh/update3D Viewer
            recenterControlPointPosition(x, y, editControlIndex);
            editControlIndex = -1;
            update3DScript();
            refresh();
            mainCanvas.style.cursor = "crosshair";
            return
        }
        editControlIndex = -1;
        update3DScript();
        refresh();
        mainCanvas.style.cursor = "crosshair";
        return
    }

    if (itemClosed || deleteAnchorMode) {
        return
    }
    //If the mouse curser hover on the first point, add the endpoint on the first point(close the loop)
    if (endpointHover) {
        addClick(allPoints[0][0], allPoints[0][1]);
        //set the control point position for the second last point
        allPoints[allPoints.length - 1][2] = (allPoints[allPoints.length - 2][0] + allPoints[0][0]) / 2;
        allPoints[allPoints.length - 1][3] = (allPoints[allPoints.length - 2][1] + allPoints[0][1]) / 2;
        //Reset the variable
        endpointHover = 0;
        //set the flage for complete shape to True
        itemClosed = 1;
        //refrash the canvas
        refresh();
        //pop a system message
        updateTopBarMessage("closed");
        //Generate final result, send the new 3d model to viewer
        createFinalArray();
        update3DScript();
        mainCanvas.style.cursor = "default";

    } else {
        //If it's not the endpoint, and it's NOT in delete anchor mode
        //check if the new position will cause any intersection, return if intersection happened
        mainCanvas.style.cursor = "crosshair";
        if (deleteAnchorMode != 1 && !itemClosed && allPoints.length > 0) {
            if (guideActiveVertical != -1) {
                x = allPoints[guideActiveVertical][0]
            }
            if (guideActiveHorizontal != -1) {
                y = allPoints[guideActiveHorizontal][1]
            }
        }
        if (determineIfAnyIntersection(x, y)) {
            return
        }
        addClick(x, y);
    }
}
var countDragEventMSIE;

function dragJoint(event){
	var b = event.pageX - offset.left;
    var a = event.pageY - offset.top;
	//If it's in joijntMod and one Template is clicked, start the dragging process and change the coordinate of the active one
	if (dragActiveTemplate){
		console.log("activeTemplateNum is"+activeTemplateNum);
		templates[activeTemplateNum].setCoordinates(b,a);
	}
	refresh();
}


//function for mouse move
function drag(j) {
	//Skip all process if tutorial is shown
	if(checkTutorialMod()){
		return	
	}
    var b = j.pageX - offset.left;
    var a = j.pageY - offset.top;
    j.preventDefault();
    //skip the whole process if in magic trace mode 
    if (magicTrace) {
        return
    }

    //If allpoints is empty, skip the process
    if (allPoints.length == 0) {
        mainCanvas.style.cursor = "crosshair";
        refreshWithMouseover(b, a);
        return
    }
    //turn off the horizontal and axial guide lines
    turnOffGuides();
    //If the mode for deleting points is not active( press "D"Key to toggle), start editing points(anchors) 
    if (deleteAnchorMode != 1) {
        var m, g, l, d;
        for (var h = 0; h < allPoints.length; h++) {
            //skip all loops if item is closed and there is no point(anchor/controlpoint) selected.
            if (itemClosed && (editAnchorIndex == -1 && editControlIndex == -1)) {
                break
            }
            //skip one loop if the selected point is reached
            if (editAnchorIndex == h) {
                continue
            }
            //skip one loop if there is only one point
            if (editAnchorIndex == 0 && h == allPoints.length - 1) {
                continue
            }
            //create a square region with tolerance range(default guide tolerance is 5)
            m = allPoints[h][0] - GUIDE_TOLERANCE; //left limit of x 
            g = allPoints[h][0] + GUIDE_TOLERANCE; //right limit of x
            l = allPoints[h][1] - GUIDE_TOLERANCE; //up limit of y
            d = allPoints[h][1] + GUIDE_TOLERANCE; //bottom limit of y

            //if the x coordinate of the mouse cursor is inside of the canvas(with tolerance),
            //copy the x coordinate value to the variable "b"
            if (m < b && b < g && guideActiveVertical == -1) {
                b = allPoints[h][0];
                guideActiveVertical = h;
                guideActiveVerticalControl = 0
            } else {
                //if the y coordinate of the mouse cursor is inside of the canvas(with tolerance),
                //copy the y coordinate value to the variable "a"
                if (l < a && a < d && guideActiveHorizontal == -1) {
                    a = allPoints[h][1];
                    guideActiveHorizontal = h;
                    guideActiveHorizontalControl = 0
                }
            }
            //skip one loop if control point is not being dragged 
            if (editControlIndex == h || editControlIndex == -1) {
                continue
            }
            m = allPoints[h][2] - GUIDE_TOLERANCE;
            g = allPoints[h][2] + GUIDE_TOLERANCE;
            l = allPoints[h][3] - GUIDE_TOLERANCE;
            d = allPoints[h][3] + GUIDE_TOLERANCE;
            if (m < b && b < g && guideActiveVertical == -1) {
                b = allPoints[h][2];
                guideActiveVertical = h;
                guideActiveVerticalControl = 1
            } else {
                if (l < a && a < d && guideActiveHorizontal == -1) {
                    a = allPoints[h][3];
                    guideActiveHorizontal = h;
                    guideActiveHorizontalControl = 1
                }
            }
        }
    }
    //if the anchor point is being dragged, call changeAnchor function to change the x,y values
    //the changeAnchor will change the anchor point and also the control point if necessary
    if (editAnchorIndex != -1) {
        changeAnchor(b, a, editAnchorIndex);
        refresh();
        markPoint(editAnchorIndex, HIGHLIGHTED_ANCHOR_COLOR);
        return
    }
    //if the control point is being dragged, change the x,y values of the corresponding control point directly
    if (editControlIndex != -1) {
        allPoints[editControlIndex][2] = b;
        allPoints[editControlIndex][3] = a;
        //If the controlpoint position is on the straight line between two anchor points, 
        //the control point's movement don't have any effect, just relocate it back to the center!
        if (determineIfControlPointReplaced(b, a, editControlIndex)) {
            allPoints[editControlIndex][4] = 0;
            recenterControlPointPosition(b, a, editControlIndex)
        } else {
            //If the control point have to be replaced, set it to editable state([index][4]=1)
            allPoints[editControlIndex][4] = 1
        }

        //if (countDragEventMSIE < 1) {
        //    countDragEventMSIE++
        //} else {
        //    countDragEventMSIE = 0;
        //    refresh()
        //}

        refresh();
        //If the controlpoint entered the editable state
        if (allPoints[editControlIndex][4] == 1 ) {
            //visualize the triangular tnagents with two red lines
            showControlPointTangents(editControlIndex);
            //highlight the control point with a yellow circle
            markControlPoint(editControlIndex, CONTROL_POINT_ACTIVE_SELECTED_COLOR)
        } else {
            //No red line needed, just highlight the control point with a black circle
            markControlPoint(editControlIndex, CONTROL_POINT_INACTIVE_SELECTED_COLOR)
        }
        return
    }
    endpointHover = 0;
    //loop through all  points and if the first point is selected
    for (var h = 0; h < allPoints.length; h++) {
        if ((h == 0 && allPoints.length > 2 && !itemClosed && checkIfNearPointAdvanced(b, a, allPoints[h][0], allPoints[h][1], FIRST_POINT_TOLERANCE, FIRST_POINT_TOLERANCE_OFFSET)) || checkIfNearPoint(b, a, allPoints[h][0], allPoints[h][1])) {
            mainCanvas.style.cursor = "default";
            turnOffGuides();
            var c;
            //If the shape is not closed yet, show the preview of last line which will close the shape.
            if (h == 0 && allPoints.length > 2 && !itemClosed) {
                refreshWithMouseover(b, a);
                endpointHover = 1;
                c = CLOSING_ANCHOR_COLOR;
                drawPotentialLine(b, a)
            } else {
                //If it's not the case, just refresh with the new anchor point position
                refresh();
                endpointHover = 0;
                c = HIGHLIGHTED_ANCHOR_COLOR
            }
            //highlight the point which is being hovered on.
            markPoint(h, c);
            return
        }
    }
    //loop through the all points again, but starts from 1 to allPoints.length
    //check if the mouse position is near any of the control points
    for (var h = 1; h < allPoints.length; h++) {
        if (checkIfNearPoint(b, a, allPoints[h - 1][2], allPoints[h - 1][3])) {
            turnOffGuides();
            refresh();
            var k = allPoints[h - 1][4] == 1 ? CONTROL_POINT_ACTIVE_SELECTED_COLOR : CONTROL_POINT_INACTIVE_SELECTED_COLOR;
            markControlPoint(h - 1, k);
            mainCanvas.style.cursor = "default";
            return
        }
    }
    if (determineIfAnyIntersection(b, a)) {
        turnOffGuides();
        refresh();
        return
    }
    refresh();
    //If the item is closed by a final mouse click on the original point, skip the following code and return.
    if (itemClosed) {
        return
    }
    if (deleteAnchorMode) {
        mainCanvas.style.cursor = "default"
    } else {
        mainCanvas.style.cursor = "crosshair"
    }
    //If the item is not closed yet, draw the gray potential line to preview the next line segment.
    drawPotentialLine(b, a)
}
//function for mouse out and leave
function cancel(d) {
    var x = d.pageX - offset.left;
    var y = d.pageY - offset.top;
    overCanvas = 0;
    //If the control point is being dragged while the mouse curser getting out of the canvas
    //update the shape with the last position of the mouse curser inside of the canvas.
    if (editControlIndex != -1) {
        if (determineIfControlPointReplaced(x, y, editControlIndex)) {
            var a = editControlIndex + 1;
            if (itemClosed && a == allPoints.length - 1) {
                a = 0
            }
            recenterControlPointPosition(x, y, editControlIndex);
            editControlIndex = -1;
            update3DScript();
            turnOffGuides();
            refresh();
            mainCanvas.style.cursor = "crosshair";
            return
        }
        editControlIndex = -1;
        update3DScript();
        turnOffGuides();
        refresh();
        mainCanvas.style.cursor = "crosshair";
        return
    }
    refresh()
}



//function called in Html mainpage
function changeMaterialCharacteristic() {
    if (itemClosed) {
        update3DScript()
    }
}
//function called in Html mainpage
function stopEditing() {
    itemEditable = false;
    mainCanvas.style.cursor = "crosshair";
    mainCanvas.removeEventListener("mousedown", press, false);
    mainCanvas.removeEventListener("mousemove", drag, false);
    mainCanvas.removeEventListener("mouseup", release);
    mainCanvas.removeEventListener("mouseout", cancel, false);
    mainCanvas.removeEventListener("touchstart", press, false);
    mainCanvas.removeEventListener("touchmove", drag, false);
    mainCanvas.removeEventListener("touchend", release, false);
    mainCanvas.removeEventListener("touchcancel", cancel, false);
    refresh()
}


//Set up the value of global variable "offset"
function setOffset() {
    offset = $("#sketcharea").offset();
    offset.left = Math.round(offset.left);
    offset.top = Math.round(offset.top)
}
//Function to add new points into allPoints on clicked position at (a,b)
function addClick(a, b) {
    //Nothing to do in insert mode
    if (insertMode) {
        return
    }
    //At first set the control point postion (newPoint[2] , newPoint[3]) to 0.
    newPoint = [a, b, 0, 0, 0];
    //If the newPoint is not the first point, set the contorl point position of the point before newPoint.
    if (allPoints.length > 0) {
        allPoints[allPoints.length - 1][2] = (a + allPoints[allPoints.length - 1][0]) / 2;
        allPoints[allPoints.length - 1][3] = (b + allPoints[allPoints.length - 1][1]) / 2
    }
    //push the new point to the allPoints and call refresh to refrash the canvas
    allPoints.push(newPoint);
    refresh()
}
//function to change position of the anchor point
//e stands for clicked/dragged anchor index 
function changeAnchor(mouseX, mouseY, e) {
    //get the distance between mouse drag/up position and the anchor point's original position  
    var d, c;
    d = mouseX - allPoints[e][0];
    c = mouseY - allPoints[e][1];
    //set the anchorpoint position updated
    allPoints[e][0] += d;
    allPoints[e][1] += c;
    if (allPoints.length > 1) {
        var g = e - 1;
        var a = e + 1;
        if (g == -1 && itemClosed) {
            g = allPoints.length - 2
        }
        if (a == allPoints.length && itemClosed) {
            a = 0
        }
        if (g != -1 && allPoints[g][4] == 0) {
            allPoints[g][2] = (mouseX + allPoints[g][0]) / 2;
            allPoints[g][3] = (mouseY + allPoints[g][1]) / 2
        }
        if (a != allPoints.length && allPoints[e][4] == 0) {
            allPoints[e][2] = (mouseX + allPoints[a][0]) / 2;
            allPoints[e][3] = (mouseY + allPoints[a][1]) / 2
        }
    }
    if (itemClosed && e == 0) {
        allPoints[allPoints.length - 1][0] = mouseX;
        allPoints[allPoints.length - 1][1] = mouseY
    } else {
        if (itemClosed && (e == allPoints.length - 1)) {
            allPoints[0][0] = mouseX;
            allPoints[0][1] = mouseY
        }
    }
}

function removeAnchor(b) {
    //If the points can only form up a triangle, delete nothing and return with value "False"
    if (itemClosed && allPoints.length == 4) {
        return false
    }
    //Delete the one point of index"b", !!!!allPoints.length will be changed from "n" to "n-1"
    allPoints.splice(b, 1);
    //In order to recalculate the new control points of index "b" and "b-1", do the following:
    var c = b - 1;
    var a = b;
    //If allPoints become empty, return with true
    if (allPoints.length == 0) {
        return true
    }
    //If the deleted point is the last point( b = a = n-1 ), set the new last point lable(allpoints[][4]) to 0 
    if (a == allPoints.length) {
        allPoints[c][4] = 0;
        return true
    }
    //If the first point is NOT the point to be deleted: just get control point value with next point"c"
    if (c != -1) {
        allPoints[c][2] = (allPoints[c][0] + allPoints[a][0]) / 2;
        allPoints[c][3] = (allPoints[c][1] + allPoints[a][1]) / 2;
        allPoints[c][4] = 0
    } else { //In the case when first point got deleted: control point is between last point and new first point
        if (c == -1 && itemClosed) {
            allPoints[allPoints.length - 1][0] = allPoints[0][0];
            allPoints[allPoints.length - 1][1] = allPoints[0][1];
            if ((allPoints.length - 2) != -1) {
                allPoints[allPoints.length - 2][2] = (allPoints[allPoints.length - 1][0] + allPoints[allPoints.length - 2][0]) / 2;
                allPoints[allPoints.length - 2][3] = (allPoints[allPoints.length - 1][1] + allPoints[allPoints.length - 2][1]) / 2;
                allPoints[allPoints.length - 2][4] = 0
            }
        }
    }
    return true
}

function turnOffGuides() {
    guideActiveVertical = -1;
    guideActiveHorizontal = -1
}


//Simple form of CheckIfNearPointAdvanced, have default mouse tolerance and tolerance offset
function checkIfNearPoint(b, a, d, c) {
    return (checkIfNearPointAdvanced(b, a, d, c, MOUSE_TOLERANCE, MOUSE_TOLERANCEOffset))
}
//check near point with custom tolerance "a" and offset "d"
function checkIfNearPointAdvanced(c, b, g, e, a, d) {
    if (allPoints.length > 0) {
        if ((c > (g - a + d)) && (c < (g + a + d)) && (b > (e - a + d)) && (b < (e + a + d))) {
            return true
        }
    }
    return false
}

function refreshWithMouseover(b, a) {
    refresh()
}
//Draw the shape in magic trace mode and pen mode
export function refresh() {
	console.log("refresh called");
    mainCanvas.width = mainCanvas.width;
    //If in magic trace mode
    if (magicTrace) {
        context.putImageData(colorLayerData, 0, 0);
        context.strokeStyle = MAGIC_TRACE_PATH_COLOR;
        context.lineWidth = MAGIC_TRACE_PATH_WIDTH;
        if (allPoints != null && allPoints.length > 0) {
            //Start drawing in html5 canvas
            context.beginPath();
            //go to the first point
            context.moveTo(allPoints[0][0], allPoints[0][1]);
            //create lines and draw them
            for (var a = 1; a < allPoints.length; a++) {
                context.lineTo(allPoints[a][0], allPoints[a][1])
            }
            //show the resulting shape
            context.stroke();
        }
        return
    }
	if (jointMod){
		if(allPoints.length>3){
			context.clearRect(0,0,context.width,context.height);
			context.beginPath();
			//console.log(finalArray[0]);
			context.fillStyle = "#0011ff";
			context.moveTo(finalArray[0][0],finalArray[0][1]);
			for(var i = 1; i< finalArray.length; i++){
				context.lineTo(finalArray[i][0],finalArray[i][1])
			}
			context.fill();

			for (var i=0;i< templates.length ; i++) {
				templates[i].drawTemplate(context);
			}
			return
		}
	}
    //If in other modes, check the shape and see it is closed or not.
    //The stroke styel will be determined by it
    var b = itemClosed ?  CLOSED_LINE_COLOR : INITIAL_LINE_COLOR;
    context.strokeStyle = b;
    context.fillStyle = itemClosed ? CLOSED_FILL_COLOR : INITIAL_FILL_COLOR;
    context.lineJoin = "round";
    context.lineWidth = itemClosed ? CLOSED_LINE_WIDTH : INITIAL_LINE_WIDTH;
    if (allPoints.length == 0 ) {
        drawStartText()
    }
    if (allPoints.length > 0) {
        context.beginPath();
        //go to the starting point
        context.moveTo(allPoints[0][0], allPoints[0][1]);
        if (allPoints.length > 1) {
            //start the drawing loop from first controlpoint
            for (var a = 1; a < allPoints.length; a++) {
                //allPoints[a-1][2] and [a-1][3] are x,y position of control points, allpoints[a] is the end point
                context.quadraticCurveTo(allPoints[a - 1][2], allPoints[a - 1][3], allPoints[a][0], allPoints[a][1])
            }
            context.stroke()
        }
        //close the path
        context.closePath();
        if (!itemEditable) {
            return
        }
        //draw different dots on control points and anchor points depending on which edit mode is active
        for (var a = 0; a < allPoints.length; a++) {
            //In delete anchor mode
            if (deleteAnchorMode) {
                drawPointSphereAdvanced(allPoints[a][0], allPoints[a][1], POINT_RADIUS, POINT_DELETE_MODE_FILL_COLOR, 0, "")
            } else {
                //Not in delete anchor mode: draw different shape for first point
                if (a == 0 && !itemClosed) {
                    drawPointSphereAdvanced(allPoints[a][0], allPoints[a][1], POINT_RADIUS, FIRST_POINT_FILL_COLOR, 0, "")
                } else {
                    //draw ordinary points on toher anchor points
                    drawPointSphere(allPoints[a][0], allPoints[a][1])
                }
            }
            //draw control points(last point's control point should not be drawn)
            if (!(a == allPoints.length - 1)) {
                drawControlPointSphere(allPoints[a][2], allPoints[a][3], allPoints[a][4]);
            }
        }
        //draw gray lines to preview the next point and line
        drawRelevantGuides()
    }
}

//highlight the edited control point with a circle
function markControlPoint(b, a) {
    context.lineWidth = CONTROL_POINT_SELECTED_LINE_WIDTH;
    context.strokeStyle = a;
    context.beginPath();
    context.arc(allPoints[b][2], allPoints[b][3], CONTROL_POINT_SELECTED_ANCHOR_RADIUS, 0, 360, false);
    context.stroke();
    context.closePath()
}
//Draw two red lines, one from anchor(b) to control point, another from anchor(a) to control point
//This will visualize the triangular tangents of the control point
function showControlPointTangents(b) {
    //b is the anchorpoint which's control point is selected 
    //and "a" is the next anchorpoint
    var a = b + 1;
    //if a is the last point of allPoints, set its value to 0(to the starting point)
    if (itemClosed && a == allPoints.length - 1) {
        a = 0
    } else {
        if (a == allPoints.length) {
            a = 0
        }
    }
    context.lineWidth = CONTROL_POINT_TANGENT_WIDTH;
    context.strokeStyle =  CONTROL_POINT_TANGENT_COLOR;
    context.beginPath();
    context.moveTo(allPoints[b][0], allPoints[b][1]);
    context.lineTo(allPoints[b][2], allPoints[b][3]);
    context.lineTo(allPoints[a][0], allPoints[a][1]);
    context.stroke();
    context.closePath()
}

function markPoint(b, a) {
    context.lineWidth = HIGHLIGHTED_LINE_WIDTH;
    context.strokeStyle = a;
    context.beginPath();
    context.arc(allPoints[b][0], allPoints[b][1], HIGHLIGHTED_ANCHOR_RADIUS, 0, 360, false);
    context.stroke();
    context.closePath()
}
//Draw a gray line to the potential line which might become the next segment of allPoints
function drawPotentialLine(a, b) {
    if (overCanvas == 0 || deleteAnchorMode || insertMode) {
        return
    }
    context.lineWidth = POTENTIAL_LINE_WIDTH;
    context.strokeStyle = POTENTIAL_LINE_COLOR;
    context.beginPath();
    context.moveTo(allPoints[allPoints.length - 1][0], allPoints[allPoints.length - 1][1]);
    context.lineTo(a, b);
    context.stroke();
    context.closePath()
}

//draw lines to illustrate the reletve position(horizontally or vertically aligned) of a new point to existing points  
function drawRelevantGuides() {
    if (guideActiveVertical != -1 && guideActiveVerticalControl) {
        drawGuide(allPoints[guideActiveVertical][2], 1)
    } else {
        if (guideActiveVertical != -1) {
            drawGuide(allPoints[guideActiveVertical][0], 1)
        }
    }
    if (guideActiveHorizontal != -1 && guideActiveHorizontalControl) {
        drawGuide(allPoints[guideActiveHorizontal][3], 0)
    } else {
        if (guideActiveHorizontal != -1) {
            drawGuide(allPoints[guideActiveHorizontal][1], 0)
        }
    }
}
//a=coordinate position in x/y axis, b=1 for vertical, b=0 for horizontal
function drawGuide(a, b) {
    context.lineWidth = GUIDE_LINE_WIDTH;
    context.strokeStyle = GUIDE_LINE_COLOR;
    context.beginPath();
    if (b) {
        //draw a vertical line with full height of canvas at position x=a
        context.moveTo(a, 0);
        context.lineTo(a, mainCanvas.height)
    } else {
        //draw a horizontal line with full width of canvas at position y=a
        context.moveTo(0, a);
        context.lineTo(mainCanvas.width, a)
    }
    context.stroke();
    context.closePath()
}

function drawControlPointSphere(a, e, d) {
    context.lineWidth = CONTROL_POINT_LINE_WIDTH;
    var c = CONTROL_POINT_INACTIVE_FILL_COLOR;
    var b = CONTROL_POINT_INACTIVE_RADIUS;
    if (insertMode) {
        c = CONTROL_POINT_ADD_FILL_COLOR;
        b = CONTROL_POINT_ACTIVE_RADIUS
    } else {
        if (d != 0) {
            c = CONTROL_POINT_ACTIVE_FILL_COLOR;
            b = CONTROL_POINT_ACTIVE_RADIUS
        }
    }
    if (d == 0) {
        drawPointSphereAdvanced(a, e, b, c, 0, "")
    } else {
        drawPointSphereAdvanced(a, e, b, c, 0, "")
    }
}

function drawPointSphere(a, b) {
    drawPointSphereAdvanced(a, b, POINT_RADIUS, POINT_FILL_COLOR, 1, "rgba(255, 0, 0, 0.3)")
}
//Prototype function for drawing points on canvas in "pen mode"
function drawPointSphereAdvanced(b, g, a, d, e, c) {
    context.fillStyle = d;
    context.strokeStyle = d;
    context.beginPath();
    context.arc(b, g, a, 0, 360, false);
    context.stroke();
    context.fill();
    context.closePath();
    context.moveTo(b, g)
}
//Unused function
//function drawPointSphereRadiusAdvanced(b, g, a, d, e, c) {
//    context.strokeStyle = d;
//    context.lineWidth = 2;
//    context.beginPath();
//    context.arc(b, g, a, 0, 360, false);
//    context.stroke();
//    context.closePath();
//    context.moveTo(b, g);
//    context.lineWidth = 1
//}

//a cluster of event listeners for mouse drawing event
function addRelevantEventListeners() {
    mainCanvas.addEventListener("mousedown", press, false);
    mainCanvas.addEventListener("mousemove", drag, false);
    mainCanvas.addEventListener("mouseup", release);
    mainCanvas.addEventListener("mouseout", cancel, false);
    mainCanvas.addEventListener("mouseleave", cancel, false)
}
//show a text in the middle of canvas to guide the user
function drawStartText() {
    var b = mainCanvas.width / 2;
    var d = mainCanvas.height / 2 + 15;
    var c = [];
    var a = [];
    if (traceImageLoaded) {
        c[0] = ""
    } else {
        c[0] = "Click on the canvas to get started"
    }
    context.font = "16pt Arial";
    context.textAlign = "center";
    context.fillStyle = "rgb(187,187,187)";
    d += 20;
    context.font = "17pt Arial";
    context.fillText(c[0], b, d)
}
//Not used
//function addCanvasImage() {}

//handle events for dragover on the canvas
function handleDragOver(a) {
    a.stopPropagation();
    a.preventDefault();
    a.dataTransfer.dropEffect = "copy"
}

//Will be called in Main html page and load image file if the "trace-buttons" is pressed
function loadTraceImage(b) {
	var img,f;
    if (b.dataTransfer) {
        img = b.dataTransfer
    } else {
        img = b
    }
    f = img.files[0];
    if (f.type.match("image.*")) {
        //If the browser support html5-file API, then use the FileReader object to load the file
        if (typeof FileReader !== "undefined") {
            var a = new FileReader();
            a.onload = function (c) {
                //draw the loaded image on the canvas
                drawTraceImage(c.target.result)
            };
            a.readAsDataURL(f)
        } else {
            //If the browser is too old to support file API, use an alternative method by calling ajax
            echoFile(f)
        }
    }
    $(".placeImage").addClass("active")
}
//Alternative method used in loadTraceImage
function echoFile(a) {
    var b = new FormData();
    b.append("file", a);
    $.ajax({
        url: "/echo",
        data: b,
        cache: false,
        contentType: false,
        processData: false,
        type: "POST",
        success: function (c) {
            drawTraceImage(c)
        }
    })
}

function drawTraceImage(b) {
    //Initialize a new Image instance
    var a = new Image();
    //handle error events by showing a failure message
    a.onerror = function () {
        $(".canvas-loading").stop().hide();
        $(".canvas-failed").fadeIn(function () {
            setTimeout(function () {
                $(".canvas-failed").fadeOut()
            }, 2500)
        });
        clearTraceImage()
    };
    //If the image is loaded
    a.onload = function () {
        //remove the loading screen
        $(".canvas-loading").stop().hide();
        //set value of "e"  for the loaded picture "a"
        var e = Math.min(traceCanvas.width / a.width, traceCanvas.height / a.height) * TRACE_SCALE_FACTOR;
        var d = a.height * e;
        var c = a.width * e;
        traceContext.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
        //draw the image "a"(Only making a space, the image data in variable "b" will be loaded later)
        traceContext.drawImage(a, (traceCanvas.width - c) / 2, (traceCanvas.height - d) / 2 + (0), c, d);
        //Update the control panel and flag variable "traceImageLoaded"
        $("#traceimage-add").hide();
        $("#traceimage-remove").show();
        traceImageLoaded = 1;
        refresh()
    };
    $(".canvas-loading").trigger("fadedone");
    //Finally load the image data from "b"
    a.src = b
}
//Remove the loaded image
function clearTraceImage() {
    $(".canvas-loading").stop().hide();
    traceContext.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
    $(".placeImage").removeClass("active");
    traceImageLoaded = 0
}

//Wii be called in Main HTML page, handles events when "+" button is clicked
function insertModeToggle() {
    //Can't do it in magic trace
    if (magicTrace) {
        alert("Sorry, you can't delete an anchor point in Magic Trace mode");
        return
    }
    if (insertMode) {
        insertMode = false;
        toggleActive(document.getElementById("insertMode"));
        updateTopBarMessage("empty");
        $(".mode-label").fadeOut()
    } else {
        if (insertMode == 0 && (itemClosed || (!itemClosed && allPoints.length > 1))) {
            $(".mode-label").fadeIn().children(".name").text("Insert");
            insertMode = true;
            toggleActive(document.getElementById("insertMode"));
            updateTopBarMessage("insertmode")
        } else {
            if (itemClosed) {
                return
            } else {
                alert("You must place two anchors before you can add a point between them")
            }
        }
    }
    refresh()
}
//Restart the canvas reset all global variables
function startOver() {
    updateTopBarMessage("empty");
    startOverFlag = 1;
    allPoints = [];
    $("div.completed > button").attr("disabled", "");

    $("#display_data").empty();
    if (magicTrace) {
        toggleMagicTrace();
        toggleMagicTrace()
    }
    itemClosed = 0;
    editAnchorIndex = -1;
    editControlIndex = -1;
    endpointHover = 0;
    overCanvas = 1;
    if (deleteAnchorMode) {
        toggleDeleteMode()
    }
    if (insertMode) {
        insertModeToggle()
    }
    $("#alerts").css("display", "none");
    mainCanvas.style.cursor = "crosshair";
    if (!itemEditable) {
        itemEditable = true;
        addRelevantEventListeners()
    }
    turnOffGuides();
    refresh();
    drawStartText()
}
//check if the new segment is intersecting with existing edges
function determineIfAnyIntersection(c, a) {
    if (allPoints.length < 3) {
        return false
    }
    var e = allPoints[allPoints.length - 1][0];
    var d = allPoints[allPoints.length - 1][1];
    for (var b = 0; b < allPoints.length - 2; b++) {
        if (allPoints[b][4] == 1) {
            continue
        }
        if (DoLineSegmentsIntersect(e, d, c, a, allPoints[b][0], allPoints[b][1], allPoints[b + 1][0], allPoints[b + 1][1])) {
            return true
        }
    }
    return false
}
//will return true if the control point is on the straight line between the two connecting anchor points
function determineIfControlPointReplaced(c, b, d) {
    //if the shape is closed, the "a" equals the remainder of d(index of editing Control Point)+1 divided by allpoints.length-1.
    //else the "a" should be remainder of d+1 / allpoints.length
    var a = itemClosed ? (d + 1) % (allPoints.length - 1) : (d + 1) % allPoints.length;

    //if the distance of point (c,b) to point "d" plus (c,b) to point "a" is shorter than point "d" to point "a", the control point should be replaced. 
    //because the control point is not on the straight line between point "a" and "d" 
    return (pointdistance(c, b, allPoints[d][0], allPoints[d][1]) + pointdistance(c, b, allPoints[a][0], allPoints[a][1]) < pointdistance(allPoints[d][0], allPoints[d][1], allPoints[a][0], allPoints[a][1]) + REPLACE_CONTROL_POINT_TOLERANCE)
}
//Send the control point back to proper position
function recenterControlPointPosition(c, b, d) {
    var e = itemClosed ? (d + 1) % (allPoints.length - 1) : (d + 1) % allPoints.length;
    var h = [];
    h[0] = allPoints[e][0] - allPoints[d][0];
    h[1] = allPoints[e][1] - allPoints[d][1];
    var j = Math.sqrt(Math.pow(h[0], 2) + Math.pow(h[1], 2));
    h[0] /= j;
    h[1] /= j;
    var g = [];
    g[0] = allPoints[d][2] - allPoints[d][0];
    g[1] = allPoints[d][3] - allPoints[d][1];
    var i = g[0] * h[0] + g[1] * h[1];
    var a = [];
    a[0] = allPoints[d][0] + h[0] * i;
    a[1] = allPoints[d][1] + h[1] * i;
    allPoints[d][2] = a[0];
    allPoints[d][3] = a[1];
    allPoints[d][4] = 0
}
//Calculate distance between (b,d) and (a,c)
function pointdistance(b, d, a, c) {
    return (Math.sqrt(Math.pow((a - b), 2) + Math.pow((c - d), 2)))
}

//Function called in DoLineSegmentsIntersect
function IsOnSegment(d, g, b, e, a, c) {
    return (d <= a || b <= a) && (a <= d || a <= b) && (g <= c || e <= c) && (c <= g || c <= e)
}
//Function called in DoLineSegmentsIntersect
function ComputeDirection(i, k, g, j, d, h) {
    var e = (d - i) * (j - k);
    var c = (g - i) * (h - k);
    return e < c ? -1 : e > c ? 1 : 0
}
//Function called in determineIfAnyIntersection
function DoLineSegmentsIntersect(e, j, d, i, b, h, m, g) {
    var c = ComputeDirection(b, h, m, g, e, j);
    var a = ComputeDirection(b, h, m, g, d, i);
    var l = ComputeDirection(e, j, d, i, b, h);
    var k = ComputeDirection(e, j, d, i, m, g);
    return (((c > 0 && a < 0) || (c < 0 && a > 0)) && ((l > 0 && k < 0) || (l < 0 && k > 0))) || (c == 0 && IsOnSegment(b, h, m, g, e, j)) || (a == 0 && IsOnSegment(b, h, m, g, d, i)) || (l == 0 && IsOnSegment(e, j, d, i, b, h)) || (k == 0 && IsOnSegment(e, j, d, i, m, g))
}
//sample points to create an array for final model creation
function createFinalArray() {
    //empty the array first
    finalArray = [];
    var nextIndex;
    //skip this process if the shape is not closed yet
    if (!itemClosed) {
        return
    }
    //Iterate through allPoints from 0 to length-1
    for (var b = 0; b < allPoints.length - 1; b++) {
        //If it's a straight line, just push the anchor point
        if (allPoints[b][4] == 0) {
            var a = [];
            a[0] = allPoints[b][0];
            a[1] = allPoints[b][1];
            finalArray.push(a)
        } else {
            //
            if (b == allPoints.length - 2 && itemClosed) {
                nextIndex = 0
            } else {
                nextIndex = b + 1
            }
            //interpolate the quadratic curve's points(by 100 segments) and push them in to finalArray
            interpolatePointsForQuad(allPoints[b][0], allPoints[b][1], allPoints[nextIndex][0], allPoints[nextIndex][1], allPoints[b][2], allPoints[b][3])
        }
    }
}
//interpolate the quadratic curve's points(by 100 segments) and push them in to finalArray
function interpolatePointsForQuad(h, d, a, l, g, c) {
    var b;
    // e stands for loop length and number of points
    var e = 100;
    var k;
    for (var j = 0; j < e; j++) {
        b = [];
        k = j / e;
        b[0] = (1 - k) * (1 - k) * h + 2 * k * (1 - k) * g + k * k * a;
        b[1] = (1 - k) * (1 - k) * d + 2 * k * (1 - k) * c + k * k * l;
        finalArray.push(b)
    }
}

//Create or Update the script for creating 3d models in jscad environment
//In order to show the result of script, user must trigger updateSolid() which is defined in flexisystem.ejs
function update3DScript() {
	refresh();
	function array2DToScaledStr(array){
		var str ="[";
		for (var i=0;i<array.length; i++){
    		if (i < array.length-1) {
    			str = str + "[" + array[i][0] * scaleRatio  + "," + array[i][1] * scaleRatio +"],"
    		}else{
    			str = str + "[" + array[i][0] * scaleRatio  + "," + array[i][1] * scaleRatio  +"]]"
    		}
    
    	}
		return str
	}

	function array2DToStr(array){
		var str ="[";
		for (var i=0;i<array.length; i++){


    		if (i < array.length-1) {
    			str = str + "[" + array[i][0] + "," + array[i][1]  +"],"
    		}else{
    			str = str + "[" + array[i][0] + "," + array[i][1]  +"]]"
    		}
    
    	}
		return str
	}
	
	var hingeTemplateScript = "";
	//Iterate through the templates array, get its values to create hingeTemplate shpaes according to their lengthL and lengthR,
	//extrud them into 3D geometry.relocate and rotate them according to coordinates and rotation
	if(templates.length > 0){
		console.log("making hinges!!");
    	for(var i=0; i<templates.length; i++){
			hingeTemplateScript += "var hingeShape =CAG.fromPoints(" + array2DToStr(templates[i].hingePoints) + ");";
			hingeTemplateScript += "var hingeTemplate = hingeShape.extrude({offset: [0,0,20] });";

			hingeTemplateScript += "hingeTemplate.rotateZ(" + templates[i].rotation + ");";
			hingeTemplateScript += "csg = csg.subtract(hingeTemplate);";
			hingeTemplateScript += "csg = csg.union(hingeJoint.rotateZ(" + (-1 * templates[i].rotation) + ").translate([" + (templates[i].coordinates[0] *scaleRatio )+ "," + (templates[i].coordinates[1]* scaleRatio) + "]) );" ;
		}
	}
	var returnScript = "return csg }";

	createFinalArray();

	
	//console.log(hingeTemplateScript);
	//var finalString = cadScriptShapeA + str + cadScriptShapeB + hingeTemplateScript +  returnScript;
	//document.getElementById("code").value = finalString;

	fetch('./examples/flexi.jscad').then(response => response.text()).then((data) => {

		var position1 = data.indexOf("); //finalpoints");
		var temp = [data.slice(0, position1), array2DToScaledStr(finalArray), data.slice(position1)].join('');

		var position2 = temp.indexOf("//hingesHere");
		var output = [temp.slice(0, position2), hingeTemplateScript, temp.slice(position2)].join('');
    	document.getElementById("code").value =  output;
    })
	
}

//Switch between the shape editing mode(draw by mouse or magicTrace) and joint editing mode(add flexy joints)
function toggleJointMode(){
	magicTrace = false;
	
	if(jointMod){
		jointMod = false;
		
		document.getElementById("jointAddBtn").style.display = "none";
		document.getElementById("clockwiseBtn").style.display = "none";
		document.getElementById("clockwiseAntiBtn").style.display = "none";
		document.getElementById("lengthLPlus").style.display = "none";
		document.getElementById("lengthLMinus").style.display = "none";
		document.getElementById("lengthRPlus").style.display = "none";
		document.getElementById("lengthRMinus").style.display = "none";


		document.getElementById("jointModTxt").innerHTML = "Switch to Joint Mod";
		console.log("toggled");
		//Remove special mouse press method and restore normal methods
		mainCanvas.removeEventListener("mousedown", pressJoint, false);
		mainCanvas.removeEventListener("mousemove", dragJoint, false);
		mainCanvas.removeEventListener("mouseup", releaseJoint, false);
		addRelevantEventListeners();
		refresh();
		
	}else {
		jointMod = true;
		document.getElementById("jointAddBtn").style.display = "inline";
		document.getElementById("clockwiseBtn").style.display = "inline";
		document.getElementById("clockwiseAntiBtn").style.display = "inline";
		document.getElementById("lengthLPlus").style.display = "inline";
		document.getElementById("lengthLMinus").style.display = "inline";
		document.getElementById("lengthRPlus").style.display = "inline";
		document.getElementById("lengthRMinus").style.display = "inline";

		//Remove all EventListener	
		mainCanvas.removeEventListener("mousedown", press, false);
    	mainCanvas.removeEventListener("mousemove", drag, false);
    	mainCanvas.removeEventListener("mouseup", release);
    	mainCanvas.removeEventListener("mouseout", cancel, false);
    	mainCanvas.removeEventListener("touchstart", press, false);
    	mainCanvas.removeEventListener("touchmove", drag, false);
    	mainCanvas.removeEventListener("touchend", release, false);
    	mainCanvas.removeEventListener("touchcancel", cancel, false);
		document.getElementById("jointModTxt").innerHTML = "Switch back to Edit Mod";
		//Add special mousemove method for joint Mod
		mainCanvas.addEventListener("mousedown", pressJoint, false);
		mainCanvas.addEventListener("mousemove", dragJoint, false);
		mainCanvas.addEventListener("mouseup", releaseJoint, false);
		refresh();
	}

}


//control the delet mode in different situation(having sample image on canvas/ in trace mode, etc)
function toggleDeleteMode() {

    //return if in tracemode and give alert message
    if (magicTrace) {
        alert("Sorry, you can't delete an anchor point in Magic Trace mode");
        return
    }
    //if Not in delete anchor mode, set the global variable deleteAnchorMode to 0 and activate the button
    if (deleteAnchorMode) {
        deleteAnchorMode = 0;
        toggleActive(document.getElementById("deletebutton"));
        updateTopBarMessage("empty");
        $(".mode-label").fadeOut()
    } else {
        //If in deleteAnchorMode and points are closed and can at least be a triangle, 
        //Or if the item is not closed and there are one or more points present on the canvas, do the deletion
        //And toggle the buttons
        if (deleteAnchorMode == 0 && ((itemClosed && allPoints.length > 3) || (!itemClosed && allPoints.length > 0))) {
            $(".mode-label").fadeIn().children(".name").text("Delete");
            deleteAnchorMode = 1;
            toggleActive(document.getElementById("deletebutton"));
            updateTopBarMessage("deletemode")
        } else {
            if (itemClosed) {
                return
            } else {
                alert("You must place an anchor before you can delete it")
            }
        }
    }
    //Call function to refresh the canvas and control interface
    refresh()
}



//Function to toggle html element active 
function toggleActive(a) {
    $(a).toggleClass("active")
}


function toggleMagicTrace() {
	//Turn jointMod off if it's active
	if(jointMod){
		toggleJointMode();
	}
	
    //If no image is loaded yet, show alert
    if (!traceImageLoaded) {
        alert("To use magic trace, load an image to trace");
        return
    }
    //Handle event when the function is called during other mods(delet,insert, etc )
    if (deleteAnchorMode) {
        toggleDeleteMode()
    }
    if (insertMode) {
        insertModeToggle()
    }
    if (!magicTrace && traceImageLoaded) {
        loadMagicTrace();
        $(".toolbar").slideUp()
    } else {
        if (magicTrace) {
            removeMagicTrace();
            $(".toolbar").slideDown()
        }
    }
	
}

function loadMagicTrace() {
    //clean up the canvas an variables
    startOver();
    //set the flag for magic trace to True
    magicTrace = 1;
    allPoints = [];

    colorLayerData = context.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    colorLayerDataTraceCanvas = traceContext.getImageData(0, 0, traceCanvas.width, traceCanvas.height);
    $("#magictracebtn").addClass("active");
    updateTopBarMessage("startmagictrace");
    toggleActive(document.getElementById("penbutton"));
    refresh()
}
//Function to turn off magic trace and change html5 elements's activity
function removeMagicTrace() {
    updateTopBarMessage("empty");
    $("#magictracebtn").removeClass("active");
    toggleActive(document.getElementById("penbutton"));
    magicTrace = 0;
    allPoints = [];
    colorLayerDataTraceCanvas = null;
    colorLayerData = null;
    magicTraceSegmentDictionary = {};
    startOver()
}
//Major function in Trace mode, will access the image and locate the region if floodfill function detected it
function findSelectedRegion(h, d) {
    //set up the variables
    mainCanvas.width = mainCanvas.width;
    colorLayerData = null;
    colorLayerData = context.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    magicTraceSegmentDictionary = {};
    allPoints = [];
    magicTracePathArray = null;
    //k = pixel data position at the array of colorLayerDataTraceCanvas.data
    //(the value will be multiplied by 4 since there are four channels)
    var k = (d * traceCanvas.width + h) * 4,
        j = colorLayerDataTraceCanvas.data[k],
        i = colorLayerDataTraceCanvas.data[k + 1],
        c = colorLayerDataTraceCanvas.data[k + 2],
        e = colorLayerDataTraceCanvas.data[k + 3];
    //If the pixel is totally empty, return.
    if (j == 0 && i == 0 && c == 0 && e == 0) {
        return
    }
    //floodFill the region around coordinate(h,d) with the RGB(j,i,c) value
    floodFill(h, d, j, i, c);
    //draw the flodded region and get the points on it
    buildOutline();
    //Send the points to create 3d model if success
    if (allPoints.length != 0 && !magicTraceError) {
        update3DScript();
        updateTopBarMessage("closed")
    } else {
        if (magicTraceError) {
            magicTracePathArray = [];
            magicTraceError = 0;
            updateTopBarMessage("magictracefailed")
        }
    }
}
//floodFill the region around coordinate(r,q) with the RGB(u,d,g) value
function floodFill(x, y, u, d, g) {
    var k = 1,
        j = 1;
    var o = traceCanvas.width;
    var s = traceCanvas.height;
    var b, i, h, t, e, c, l = k,
        n = j,
        p = k + o - 1,
        m = j + s - 1,
        a = [[x, y]];
    while (a.length) {
        //loop through pixels until the continous region with similar color is flooded by "matchStartColor"
        b = a.pop();
        i = b[0];
        h = b[1];
        t = (h * traceCanvas.width + i) * 4;
        while (h >= n && matchStartColor(t, u, d, g)) {
            h -= 1;
            t -= traceCanvas.width * 4
        }
        t += traceCanvas.width * 4;
        h += 1;
        e = false;
        c = false;
        while (h <= m && matchStartColor(t, u, d, g)) {
            h += 1;
            colorPixel(t, MAGIC_TRACE_OVERLAY_COLOR.r, MAGIC_TRACE_OVERLAY_COLOR.g, MAGIC_TRACE_OVERLAY_COLOR.b);
            if (i > l) {
                if (matchStartColor(t - 4, u, d, g)) {
                    if (!e) {
                        a.push([i - 1, h]);
                        e = true
                    }
                } else {
                    if (e) {
                        e = false
                    }
                }
            }
            if (i < p) {
                if (matchStartColor(t + 4, u, d, g)) {
                    if (!c) {
                        a.push([i + 1, h]);
                        c = true
                    }
                } else {
                    if (c) {
                        c = false
                    }
                }
            }
            t += traceCanvas.width * 4
        }
    }
}

function matchStartColor(j, m, e, k) {
    var a = colorLayerDataTraceCanvas.data[j];
    var l = colorLayerDataTraceCanvas.data[j + 1];
    var n = colorLayerDataTraceCanvas.data[j + 2];
    var i = colorLayerData.data[j + 3];
    if (i > 0) {
        return false
    }
    var c = 0.34 * a + 0.5 * l + 0.16 * n;
    var h = 0.34 * m + 0.5 * e + 0.16 * k;
    var d = c > (h - MAGIC_TRACE_TOLERANCE) && c < (h + MAGIC_TRACE_TOLERANCE);
    if (d) {
        return true
    }
    return false
}

function colorPixel(i, h, e, c, d) {
    colorLayerData.data[i] = h;
    colorLayerData.data[i + 1] = e;
    colorLayerData.data[i + 2] = c;
    colorLayerData.data[i + 3] = OVERLAY_OPACITY
}

function buildOutline() {
    var i;
    var j;
    var h = mainCanvas.width;
    var k = mainCanvas.height;
    var e = h * k * 4;
    var d, c;
    var g;
    var a;
    var m;
    var b, l;


    //iterate through the colorlayer data 
    for (i = 0; i < colorLayerData.data.length; i += 4) {
        //if the opacity of the pixel equals the overlay's opacity(default value is 200)
        if (colorLayerData.data[i + 3] == OVERLAY_OPACITY) {
            //g is an array of the 4 adjacent data points[upper,lower,left,right] to the point "i"
            g = [i - (h * 4), i + (h * 4), i - 4, i + 4];
            m = i / 4;
            d = m % h;
            c = Math.floor(m / h);
            for (a = 0; a < 4; a++) {
                if (g[a] < 0 || g[a] > e || colorLayerData.data[g[a] + 3] != OVERLAY_OPACITY) {
                    switch (a) {
                        case 0:
                            b = [d, c];
                            l = [d + 1, c];
                            break;
                        case 1:
                            b = [d, c + 1];
                            l = [d + 1, c + 1];
                            break;
                        case 2:
                            b = [d, c];
                            l = [d, c + 1];
                            break;
                        case 3:
                            b = [d + 1, c];
                            l = [d + 1, c + 1];
                            break
                    }
                    addSegment(b, l);
                    addSegment(l, b)
                }
            }
        }
    }
    colorLayerData = context.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    //translate and arrange segments in magicTraceSegmentDictionary to paths and store them in magicTracePathArray
    for (var xcoord in magicTraceSegmentDictionary) {
        for (var ycoord in magicTraceSegmentDictionary[xcoord]) {
            magicTracePathArray = tracePath(xcoord, ycoord);
            magicTraceSegmentDictionary = {};
            break
        }
        break
    }
    if (!magicTraceError) {
        convertPathToAllPoints()
    }
}
//transfer points in magictracePath to allPoints
function convertPathToAllPoints() {
    var a = false;
    var e = false;
    var d, c;
    if (magicTracePathArray.length == 0) {
        return
    }
    allPoints = [];
     //fill the anchor points and leave the control points empty
    for (var b = 0; b < magicTracePathArray.length; b++) {
        allPoints.push([magicTracePathArray[b][0], magicTracePathArray[b][1], 0, 0, 0])
    }
    //fill the control points
    for (var b = 0; b < allPoints.length - 1; b++) {
        allPoints[b][2] = (allPoints[b][0] + allPoints[b + 1][0]) / 2;
        allPoints[b][3] = (allPoints[b][1] + allPoints[b + 1][1]) / 2
    }
    itemClosed = true;
    magicTracePathArray = []
}
//called in buildOutline
function addSegment(b, a) {
    if (magicTraceSegmentDictionary[b[0]] == undefined) {
        magicTraceSegmentDictionary[b[0]] = {};
        magicTraceSegmentDictionary[b[0]][b[1]] = []
    } else {
        if (magicTraceSegmentDictionary[b[0]][b[1]] == undefined) {
            magicTraceSegmentDictionary[b[0]][b[1]] = []
        }
    }
    magicTraceSegmentDictionary[b[0]][b[1]].push(a)
}

function tracePath(h, e) {
    var a = [parseFloat(h), parseFloat(e)];
    var c = magicTraceSegmentDictionary[a[0]][a[1]][0];
    var j = a;
    var k = [];
    k.push(a);
    k.push(c);
    var i = 0;
    while (c[0] != a[0] || c[1] != a[1]) {
        var d = magicTraceSegmentDictionary[c[0]][c[1]][0];
        var b = magicTraceSegmentDictionary[c[0]][c[1]][1];
        var g = d;
        if (g[0] == j[0] && g[1] == j[1]) {
            g = b
        }
        k.push(g);
        j = c;
        c = g;
        i++;
        if (i > MAGIC_TRACE_MAX_LOOP_LENGTH) {
            magicTraceError = 1;
            break
        }
    }
    k.push(a);
    return k
}

function backupImageLoad() {
    if (typeof FileReader !== "undefined") {
        return
    }
    filepicker.setKey("pTUPBm-vRgC3BzA3WqOs");
    filepicker.getFile(["image/*"], {
        modal: true,
        services: [filepicker.SERVICES.COMPUTER, filepicker.SERVICES.DROPBOX, filepicker.SERVICES.URL],
        location: "/computer"
    }, function (a, b) {
        $("#tracebtn").addClass("active");
        $(".placeImage").addClass("active");
        $.post("/casts/image_reserve.json?" + Math.random(), {
            url: a
        }, function (c) {
            drawTraceImage(c.new_url)
        })
    })
}

function toggleTraceImage() {
    if (!traceImageLoaded) {
        if (typeof FileReader === "undefined") {
            backupImageLoad()
        } else {
            $("#traceimage").click()
        }
    } else {
        clearTraceImage();
        if (magicTrace) {
            removeMagicTrace()
        }
    }
}

function removeTraceImage() {
    if (traceImageLoaded) {
        clearTraceImage();
        if (magicTrace) {
            removeMagicTrace()
        }
        return true
    }
    return false
}

function toggleTraceMenu() {
    if (removeTraceImage()) {
        return
    }
    var a = $(".placeImage");
    a.toggleClass("active");

    if (a.hasClass("active")) {
        a.find(".tracedown").slideDown()
    } else {
        a.find(".tracedown").slideUp()
    }
}
function goToByScroll(a) {
    $("html,body").animate({
        scrollTop: $("#" + a).offset().top
    }, "slow")
}

function updateTopBarMessage(a) {
    $("#toptipspane .tiptext").html(messages[a])
}

function resetTraceImageFUpload() {
    $("#traceimage").val("")
};

export {setupCanvas,loadInitializer, startOver, toggleDeleteMode, insertModeToggle, addNewJoint, toggleTraceImage, loadTraceImage, resetTraceImageFUpload, toggleMagicTrace, toggleJointMode, update3DScript, setOffset, isTemplatesEmpty, setTemplateRotation, setTemplateLengthRL}
