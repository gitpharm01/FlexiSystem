/**
 author: gitpharm01 / https://github.com/gitpharm01
*/
//Function to get full path and file name for images, assume the number of pictures is below 100
function getImgPath(path, slideIndex){
	var imgPath;
	if(slideIndex<10){
		imgPath = path + "0" + slideIndex + ".png"; 
	}else{
		imgPath = path + slideIndex + ".png";
	}
	return imgPath
}

function changePage(indexNum, changeNum, maxNum){
	
}

var fileNum,slideIndex;

class tutorialObj{
	constructor (prefix, maxNum ,button, picDiv){
		//locate a folder and confirm prefix of pictures
		this.path = "./images/" + prefix + "/";
		this.button = button;
		this.picDiv = picDiv;
		this.slideIndex = 1;
		this.fileNum = maxNum;//Number of pictures in the folder
		this.isActive = false;
	};
		
	
	//Locate a TriggerButton for triggering slideshow event, add event listener to it
	setTriggerButton(){
		var div = this.picDiv;
		var path = this.path;
		slideIndex = this.slideIndex;
		fileNum= this.fileNum;
		
		var x = document.createElement("IMG");
		x.setAttribute("src", getImgPath(path, slideIndex));
		x.setAttribute("class", "slideshow-content");

		div.appendChild(x);

		this.button.addEventListener('click', function(){
			//add a slide show modal when the TriggerButton is clicked
			//load picture according to picIndex
			console.log(path);
			console.log(slideIndex);
			console.log( getImgPath(path, slideIndex));
			div.style.display = "block";
			
		});
		div.appendChild(document.createElement("BR"));
		
		//add btn: nextBtn previousBtn closeBtn
		var prevBtn = document.createElement("BUTTON");
		prevBtn.innerHTML = "Previous page"; 
		prevBtn.setAttribute("style","vertical-align: baseline");
		prevBtn.setAttribute("style","z-index: 100");
		div.appendChild(prevBtn);
		prevBtn.addEventListener('click', function (){
			var tempNum = slideIndex - 1;
			if (tempNum == 0 || tempNum > fileNum){
				return
			}else{
				slideIndex = tempNum;
			}
			x.setAttribute("src", getImgPath(path, slideIndex));
			console.log(slideIndex);
			
		});
		
		var nextBtn = document.createElement("BUTTON");
		nextBtn.innerHTML = "Next page"; 
		nextBtn.setAttribute("style","vertical-align: baseline");
		nextBtn.setAttribute("style","z-index: 100");
		div.appendChild(nextBtn);
		nextBtn.addEventListener('click', function (){
			var tempNum = slideIndex + 1;
			if (tempNum == 0 || tempNum > fileNum){
				return
			}else{
				slideIndex = tempNum;
			}
			x.setAttribute("src", getImgPath(path, slideIndex));
			console.log(slideIndex);
			
		});

		

		var closeBtn = document.createElement("BUTTON");
		closeBtn.innerHTML = "CloseTutorial"; 
		closeBtn.setAttribute("style","vertical-align: baseline");
		closeBtn.setAttribute("style","z-index: 100");
		div.appendChild(closeBtn);
		closeBtn.addEventListener('click', function(){
			div.style.display = "none";
		});
		
	}

}

export { tutorialObj };

