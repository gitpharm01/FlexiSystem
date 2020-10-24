function main(){ 
var cylinder1 = CSG.cylinder({start: [0, 0, 0],	end: [0, 0, 10],radius: 4,resolution: 64});
var cylinder2 = CSG.cylinder({start: [0, 0, 0],	end: [0, 0, 10],radius: 8,resolution: 64});
var shape1 = CAG.fromPoints([[0,0], [6.5,0], [0,16]]);
var cutterTemplate = shape1.extrude({offset: [0, 0, 16]});
var accessory = cylinder2.subtract(cylinder1).union(CSG.cube({center: [0, -7, 5],radius: [7, 3, 5]})).subtract(cutterTemplate.rotateY(90).rotateZ(180).translate([8,8,10]));

var cube = CSG.cube({radius: [5,2.5, 5]});
cube = cube.translate([0,0,5]);
var cylinder = CSG.cylinder({  start: [0, -2.5, 0],  end: [0, 2.5, 0],  radius: 5,  resolution: 128      });
var holeCylinder =  CSG.cylinder({  start: [0, -2.5, 0],  end: [0, 2.5, 0],  radius: 2.8,  resolution: 128  });
var hingeBar =  CSG.cylinder({  start: [0, -4, 0],  end: [0, 4, 0],  radius: 2.5,  resolution: 128  });  
var hingeJoint = cylinder.union(cube).subtract(holeCylinder).union(hingeBar); 
hingeJoint = hingeJoint.rotateY(-90).translate([0,0,5]);


var cagShape = CAG.fromPoints(); //finalpoints

var csg=cagShape.extrude({offset: [0,0,10] });

//hingesHere

//AccessoryHere


return csg
}
