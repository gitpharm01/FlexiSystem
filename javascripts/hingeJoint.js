/**
 * @author gitpharm / https://github.com/gitpharm01
 * define a class of joint hinges and offer methods to manipulate it's corrdinate and sizes
*/

const canvasScaleX = 650;
var currentPlotScaleX = 150;
var scaleRatio = currentPlotScaleX / canvasScaleX;



//Rescale a set of points to the current canvas plot scale
function scaleForCanvas(points){
	var scaledPoints = [];
	for(var i = 0; i<points.length;i++){
		scaledPoints.push([points[i][0] /scaleRatio , points[i][1] /scaleRatio]);
	}
	return scaledPoints
	
}
//Building points for hinge template
var baseHingePoints = [[-3.5,3],[5.5, 3],[5.5, -3], [-3.5, -3], [-3.5, -3], [-5, -3], [-5, 3], [-3.5,3]];

//Make set of points for the hinge according to its settings
function makeHinge(lengthL, lengthR, rotation, coordinates, points, isJscad){
	//If its for jscad, transform the origin coordinates with scaleRatio
	var originPoint;
	if(isJscad){
		originPoint = [coordinates[0] * scaleRatio, coordinates[1] * scaleRatio];
	}else{
		originPoint	= coordinates;
	}
	function rotate(x, y, angle, origin ) {
    	var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x )) + (sin * (y)) ,
        ny = (cos * (y)) - (sin * (x )) ;
    	return [nx + origin[0] , ny + origin[1] ];
	}

	
	var convertedPoints = [rotate(points[0][0], points[0][1], rotation, originPoint),
						   rotate(points[1][0], points[1][1], rotation, originPoint),
						   rotate(points[2][0], points[2][1], rotation, originPoint),
						   rotate(points[3][0], points[3][1], rotation, originPoint),
						   rotate(points[4][0], points[4][1] - lengthR, rotation, originPoint),
						   rotate(points[5][0], points[5][1] - lengthR, rotation, originPoint),
						   rotate(points[6][0], points[6][1] + lengthL, rotation, originPoint),
						   rotate(points[7][0], points[7][1] + lengthL, rotation, originPoint), ];
	return convertedPoints
}


class JointTemplate{
	constructor(coordinates = [200,200], rotation = 0, lengthL=30,lengthR=30,isActive = 1 ){

		this.coordinates = [coordinates[0],coordinates[1] ] ;
		this.rotation = rotation;
		this.lengthL = lengthL;
		this.lengthR = lengthR;
		this.isActive = isActive;
		this.hingePoints = makeHinge(lengthL,lengthR,rotation,coordinates,baseHingePoints,true);
		this.canvasHingePoints = makeHinge(lengthL /scaleRatio,lengthR/scaleRatio,rotation,coordinates,scaleForCanvas(baseHingePoints),false);


	}; 

	getHingePoints(){
		return this.hingePoints	
	}
	setRotation(r){
		
		this.rotation += r;
		this.hingePoints = makeHinge(this.lengthL,this.lengthR,this.rotation,this.coordinates,baseHingePoints,true);
		this.canvasHingePoints = makeHinge(this.lengthL /scaleRatio,this.lengthR/scaleRatio,this.rotation,this.coordinates,scaleForCanvas(baseHingePoints),false);
		//redraw();
	}

	setCoordinates(a,b) {
		this.coordinates = [a,b];
		this.hingePoints = makeHinge(this.lengthL,this.lengthR, this.rotation,this.coordinates,baseHingePoints,true);
		this.canvasHingePoints = makeHinge(this.lengthL /scaleRatio,this.lengthR/scaleRatio,this.rotation,this.coordinates,scaleForCanvas(baseHingePoints),false);
	
	}
	
	setLengthR(x){
		this.lengthR += x;
		this.hingePoints = makeHinge(this.lengthL,this.lengthR, this.rotation,this.coordinates,baseHingePoints,true);
		this.canvasHingePoints = makeHinge(this.lengthL /scaleRatio,this.lengthR/scaleRatio,this.rotation,this.coordinates,scaleForCanvas(baseHingePoints),false);
		//redraw();

	}

	setLengthL(x){
		this.lengthL += x;
		this.hingePoints = makeHinge(this.lengthL,this.lengthR, this.rotation,this.coordinates,baseHingePoints,true);
		this.canvasHingePoints = makeHinge(this.lengthL /scaleRatio,this.lengthR/scaleRatio,this.rotation,this.coordinates,scaleForCanvas(baseHingePoints),false);
		//redraw();

	}
	drawTemplate(ctx){
		
		//Draw the template
		ctx.beginPath();
		ctx.moveTo(this.canvasHingePoints[0][0] , this.canvasHingePoints[0][1]);
		ctx.lineTo(this.canvasHingePoints[1][0] , this.canvasHingePoints[1][1] );
		ctx.lineTo(this.canvasHingePoints[2][0] , this.canvasHingePoints[2][1]);
		ctx.lineTo(this.canvasHingePoints[3][0] , this.canvasHingePoints[3][1]);
		ctx.lineTo(this.canvasHingePoints[4][0] , this.canvasHingePoints[4][1]);
		ctx.lineTo(this.canvasHingePoints[5][0] , this.canvasHingePoints[5][1]);
		ctx.lineTo(this.canvasHingePoints[6][0] , this.canvasHingePoints[6][1]);
		ctx.lineTo(this.canvasHingePoints[7][0] , this.canvasHingePoints[7][1]);
		ctx.closePath();
		//Fill different color 	
		if(this.isActive){
			ctx.fillStyle = "#7FFF00";
		}else { ctx.fillStyle = "#FF8C00"}
		
		ctx.fill();
		console.log(this.canvasHingePoints);

		// show different signs for the one active template and other inactive templates	
		if(this.isActive){
			//Cricle for dragging
			ctx.lineWidth = 5;
			ctx.strokeStyle ="#ffff00";
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], 10, 0, 2 * Math.PI);
			ctx.stroke(); 
			//Text
			ctx.fillStyle = "#ffbf00";
			ctx.font = "18px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Drag to move!", this.coordinates[0], this.coordinates[1] -20);
			ctx.fillStyle = "red";
			ctx.fillText("R Side", this.coordinates[0], this.coordinates[1] -60);
			ctx.fillText("L Side", this.coordinates[0], this.coordinates[1] +50);

			
		}else { 
			ctx.lineWidth = 5;
			ctx.strokeStyle  = "#80ff00"
			ctx.beginPath();
			ctx.arc(this.coordinates[0], this.coordinates[1], 10, 0, 2 * Math.PI);
			ctx.stroke(); 
			ctx.fillStyle = "#ffbf00";
			ctx.font = "20px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Click to Activate!", this.coordinates[0], this.coordinates[1] -20); 
		}
			
	}
}

export { JointTemplate };
