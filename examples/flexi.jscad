function main(){ 

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


return csg
}
