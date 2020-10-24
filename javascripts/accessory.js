/**
 * @author gitpharm / https://github.com/gitpharm01
 * define classes of accessories and offer methods to manipulate it's corrdinate 
*/

const canvasScaleX = 650;
var currentPlotScaleX = 150;
var scaleRatio = currentPlotScaleX / canvasScaleX;
var basicRectPoints = [[-7 /scaleRatio,-4/scaleRatio],[7/scaleRatio,-4/scaleRatio],[7/scaleRatio,-10/scaleRatio],[-7/scaleRatio,-10/scaleRatio]]

function rotate(x, y, angle, origin ) {
    var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x )) + (sin * (y)) ,
	ny = (cos * (y)) - (sin * (x )) ;
	return [nx + origin[0] , ny + origin[1] ];
}

function getRectPoints(angle, origin){
	var rectPoints  = [];
	for(var i = 0; i< basicRectPoints.length ; i++){
		var point = rotate(basicRectPoints[i][0],basicRectPoints[i][1],angle,origin);
		rectPoints.push(point);
	}	
	return rectPoints
}


class Ring{

	constructor(coordinates = [200,200],innerRadius=4, outerRadius=8 ,rotation =180,isActive = 1 ){

		this.coordinates = [coordinates[0],coordinates[1] ] ;
		this.rotation = rotation;
		this.isActive = isActive;
		this.innerRadius = innerRadius /scaleRatio;
		this.outerRadius = outerRadius /scaleRatio;
		this.rectPoints = getRectPoints(this.rotation,this.coordinates);
	}; 

	setRotation(r){		
		this.rotation += r;
		this.rectPoints = getRectPoints(this.rotation,this.coordinates);
	}

	setCoordinates(a,b) {
		this.coordinates = [a,b];
		this.rectPoints = getRectPoints(this.rotation,this.coordinates);
	}
	//Draw hollowed ring with color at the coordinate
	//Calculate rotated rect and draw
	//
	drawAccessory(ctx){
		
		//Draw the template
		ctx.beginPath();
		console.log(basicRectPoints);
		ctx.moveTo(this.rectPoints[0][0] , this.rectPoints[0][1]);
		ctx.lineTo(this.rectPoints[1][0] , this.rectPoints[1][1]);
		ctx.lineTo(this.rectPoints[2][0] , this.rectPoints[2][1]);
		ctx.lineTo(this.rectPoints[3][0] , this.rectPoints[3][1]);
		ctx.closePath();
		//Fill different color 	
		if(this.isActive){
			ctx.fillStyle = "#ffff00";
		}else { ctx.fillStyle = "#80ff00"}
		ctx.fill();


		// show different signs for the one active template and other inactive templates	
		if(this.isActive){
			//Cricle for dragging
			ctx.lineWidth = (this.outerRadius - this.innerRadius) ;
			ctx.strokeStyle ="#ffff00";
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], (this.innerRadius + this.outerRadius)/2, 0, 2 * Math.PI);
			ctx.stroke(); 
			ctx.closePath();
			//Text
			ctx.fillStyle = "#ff0000";
			ctx.font = "18px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Drag to move!", this.coordinates[0], this.coordinates[1] -20);
			//Draw a small dot to aim for dragging
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], 5, 0, 360);
    		ctx.stroke();
    		ctx.fill();

			
		}else { 
			ctx.lineWidth = (this.outerRadius - this.innerRadius) ;
			ctx.strokeStyle  = "#80ff00"
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], (this.innerRadius + this.outerRadius)/2, 0, 2 * Math.PI);
			ctx.stroke(); 
			ctx.fillStyle = "#ffbf00";
			ctx.font = "20px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Click to Activate!", this.coordinates[0], this.coordinates[1] -20); 
			//Draw a small dot to aim for dragging
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], 5, 0, 360);
    		ctx.stroke();
    		ctx.fill();
		}
			
	}
}

export { Ring };
