/**
 author: gitpharm01 / https://github.com/gitpharm01
*/

import {tutorialObj} from './slideTutorial.js'
import {setupCanvas,loadInitializer, startOver, toggleDeleteMode, insertModeToggle, addNewJoint,deleteJoint, toggleTraceImage, loadTraceImage, resetTraceImageFUpload, toggleMagicTrace, toggleJointMode, update3DScript, setOffset, isTemplatesEmpty, setTemplateRotation, setTemplateLengthRL} from './flexiBase.js'

//Global variables(objects and data)
var overCanvas = 1;

//Tutorial slide show object
var tutorial;

//////////////////////////////////////////////////////////////////////////////////

$.ajaxSetup({
    beforeSend: function (a) {
        a.setRequestHeader("X-CSRF-Token", $('meta[name="csrf-token"]').attr("content"))
    }
});

window.onresize = function (a) {
    setOffset()
};

$(document).ready(function () {
	setupCanvas();
    loadInitializer(); 
		
	//Create tutorial for this system
	var tBtn = document.getElementById("tutorialTrigger");
	var tDiv = document.getElementById("tutorialDivision");
	tutorial = new tutorialObj("01flexi",37,tBtn,tDiv);
	tutorial.setTriggerButton();	
	
	tBtn.style.background = "red";


    //make trace buttons visible
    $("#trace-buttons").show();
    $("#tracebtn").css("visibility", "visible");
    $("#sketcharea").mouseenter(function () {
		overCanvas = 1
      
    });

	

    //Key event: if shift key is pressed, change the variable "shiftDepressed" to 1, seems to be useless.
    $(document).keydown(function (a) {
        if (a.which == 16) {
            shiftDepressed = 1
        }
    });
    //Keyboard function to toggle different modes
    $(document).keyup(function (a) {
        if (a.target.nodeName == "INPUT" || a.target.nodeName == "TEXTAREA" || a.target.nodeName == "SELECT") {
            return
        }
        // keyboard number 78= "n", 82 = "r"
        if (a.which == 78 || a.which == 82) {
            startOver();
            return
        } else {
            //keyboard number 80="p", 66="b"
            if (a.which == 80 || a.which == 66) {} else {
                //press t to enter trace mode
                if (a.which == 84) {
                    $("#traceimage").click()
                } else {
                    if (a.which == 68) {
                        //press d to enter delete mode
                        toggleDeleteMode()
                    } else {
                        //press s to save the model
                        if (a.which == 73) {
                            insertModeToggle()
                        } 
                    }
                }
            }
        }
    })

  	//Add event listeners for buttons
	
	document.getElementById("penbutton").addEventListener("click", function () {
        startOver();
    });
  	document.getElementById("uploadButton").addEventListener("click", function () {
        toggleTraceImage();
    });
	document.getElementById("traceimage").addEventListener("change", function () {
        loadTraceImage(this); 
		resetTraceImageFUpload();
    });
	document.getElementById("tracebtn").addEventListener("click", function () {
		toggleMagicTrace(); 
    });
    document.getElementById("jointModBtn").addEventListener("click", function () {
		toggleJointMode(); 
    });
	
	document.getElementById("jointAddBtn").addEventListener("click", function () {
		addNewJoint(); 
    });

	document.getElementById("jointDeleteBtn").addEventListener("click", function () {
		deleteJoint(); 
    });

	document.getElementById("clockwiseBtn").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateRotation(-5)
			update3DScript();
		}
    });

    document.getElementById("clockwiseAntiBtn").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateRotation(+5)
			update3DScript();
		}
	});

	document.getElementById("lengthRPlus").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateLengthRL(true, +2)
			update3DScript();
		}
	});
	document.getElementById("lengthRMinus").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateLengthRL(true, -2)
			update3DScript();
		}
	});
	
	document.getElementById("lengthLPlus").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateLengthRL(false, +2)
			update3DScript();
		}
	});
	document.getElementById("lengthLMinus").addEventListener("click", function () {
		if(!isTemplatesEmpty()){
			setTemplateLengthRL(false, -2)
			update3DScript();
		}
	});

});
