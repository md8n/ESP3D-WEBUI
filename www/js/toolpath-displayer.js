// Display the XY-plane projection of a GCode toolpath on a 2D canvas

var root = window;

var canvas = id("small-toolpath");
canvas.width = 800;
canvas.height = 400;
var tp = canvas.getContext("2d");
var tpRect;

tp.lineWidth = 0.1;
tp.lineCap = 'round';
tp.strokeStyle = 'black';

var cameraAngle = 1;

var xMaxTravel = 2438;
var yMaxTravel = 2438/2;

var xHomePos = 2438/2;
var yHomePos = 2438/4;

var xHomeDir = 1;
var yHomeDir = 1;

var tlX = -8.339;
var tlY = 2209;
var trX = 3505; 
var trY = 2209;
var blX = 0;
var blY = 0;
var brX = 3505;
var brY = 0;

//Draw buttons
const tlC = document.getElementById("tlBtn").getContext("2d");
tlC.fillStyle = "#b69fcb";
tlC.fillRect(0, 0, 500, 500);
tlC.beginPath();
tlC.moveTo(90, 40);
tlC.lineTo(90, 140);
tlC.lineTo(230, 40);
tlC.lineTo(90, 40);
tlC.closePath();
tlC.lineWidth = 5;
tlC.strokeStyle = 'white';
tlC.fillStyle = 'white';
tlC.fill();
tlC.stroke();

const trC = document.getElementById("trBtn").getContext("2d");
trC.fillStyle = "#b69fcb";
trC.fillRect(0, 0, 500, 500);
trC.beginPath();
trC.moveTo(90, 40);
trC.lineTo(230, 140);
trC.lineTo(230, 40);
trC.lineTo(90, 40);
trC.closePath();
trC.lineWidth = 5;
trC.strokeStyle = 'white';
trC.fillStyle = 'white';
trC.fill();
trC.stroke();

const blC = document.getElementById("blBtn").getContext("2d");
blC.fillStyle = "#b69fcb";
blC.fillRect(0, 0, 500, 500);
blC.beginPath();
blC.moveTo(90, 40);
blC.lineTo(230, 140);
blC.lineTo(90, 140);
blC.lineTo(90, 40);
blC.closePath();
blC.lineWidth = 5;
blC.strokeStyle = 'white';
blC.fillStyle = 'white';
blC.fill();
blC.stroke();

const brC = document.getElementById("brBtn").getContext("2d");
brC.fillStyle = "#b69fcb";
brC.fillRect(0, 0, 500, 500);
brC.beginPath();
brC.moveTo(90, 140);
brC.lineTo(230, 140);
brC.lineTo(230, 40);
brC.lineTo(90, 140);
brC.closePath();
brC.lineWidth = 5;
brC.strokeStyle = 'white';
brC.fillStyle = 'white';
brC.fill();
brC.stroke();

const upC = document.getElementById("upBtn").getContext("2d");
upC.fillStyle = "#9d88c0";
upC.fillRect(0, 0, 500, 500);
// #rect441
upC.beginPath();
upC.fillStyle = 'white';
upC.lineWidth = 1;
upC.rect(60+49.213840, 99.622299, 93.976021, 74.721062);
upC.fill();
    
// #path608
upC.beginPath();
upC.strokeStyle = 'white';
upC.lineWidth = 1;
upC.lineCap = 'butt';
upC.lineJoin = 'miter';
upC.moveTo(60+5.109692, 104.666810);
upC.lineTo(60+94.679220, 4.145211);
upC.lineTo(60+189.305070, 103.959000);
upC.lineTo(60+5.109692, 104.666810);
upC.closePath();
upC.stroke();
upC.fill();



const dnC = document.getElementById("dnBtn").getContext("2d");
dnC.fillStyle = "#9d88c0";
dnC.fillRect(0, 0, 500, 500);
// #rect441
dnC.save();
dnC.transform(1.000000, 0.000000, 0.000000, -1.000000, 0.000000, 0.000000);
dnC.fillStyle = 'white';
dnC.lineWidth = 1;
dnC.rect(60 + 49.213840, -75.901474, 93.976021, 74.721062);
dnC.fill();
dnC.restore();
    
// #path608
dnC.beginPath();
dnC.strokeStyle = 'white';
dnC.fillStyle = 'white';
dnC.lineWidth = 1;
dnC.lineCap = 'butt';
dnC.lineJoin = 'miter';
dnC.moveTo(60 + 5, 70 - 20);
dnC.lineTo(60 + 94, 171 - 20);
dnC.lineTo(60 + 189, 71 - 20);
dnC.lineTo(60 + 5, 70 - 20);
dnC.closePath();
dnC.stroke();
dnC.fill();

const rC = document.getElementById("rBtn").getContext("2d");
rC.fillStyle = "#9d88c0";
rC.fillRect(0, 0, 500, 500);
// #g1100
rC.save();
rC.transform(0.000000, 1.000000, -1.000000, 0.000000, 187.481000, 0.273690);
    
// #rect441
rC.fillStyle = 'white';
rC.lineWidth = 1;
rC.rect(-20 + 49.213840, 99.622299 - 80, 93.976021, 74.721062);
rC.fill();
    
// #path608
rC.beginPath();
rC.strokeStyle = 'white';
rC.lineWidth = 1;
rC.lineCap = 'butt';
rC.lineJoin = 'miter';
rC.moveTo(-20+5.109692, 104.666810 - 80);
rC.lineTo(-20+94.679220, 4.145213 - 80);
rC.lineTo(-20+189.305070, 103.959000 - 80);
rC.closePath();
rC.stroke();
rC.fill();
rC.restore();


const lC = document.getElementById("lBtn").getContext("2d");
lC.fillStyle = "#9d88c0";
lC.fillRect(0, 0, 500, 500);
// #g1100
lC.save();
lC.transform(0.000000, 1.000000, 1.000000, 0.000000, 11.957500, 0.273690);
    
// #rect441
lC.fillStyle = 'white';
lC.lineWidth = 1;
lC.rect(-20 + 49.213840, 99.622299, 93.976021, 74.721062);
lC.fill();
    
// #path608
lC.beginPath();
lC.strokeStyle = 'white';
lC.lineWidth = 1;
lC.lineCap = 'butt';
lC.lineJoin = 'miter';
lC.moveTo(-20 + 5.109692, 104.666810);
lC.lineTo(-20 + 94.679220, 4.145213);
lC.lineTo(-20 + 189.305070, 103.959000);
lC.closePath();
lC.stroke();
lC.fill();
lC.restore();

const hC = document.getElementById("hBtn").getContext("2d");

const xO = 55;
const yO = -45;

// #path5094
hC.beginPath();
hC.fillStyle = 'rgb(183, 161, 208)';
hC.strokeStyle = 'rgb(0, 0, 0)';
hC.lineWidth = 0.472615;
hC.lineCap = 'butt';
hC.lineJoin = 'miter';
hC.moveTo(xO + 55.719343, 197.549650 + yO);
hC.lineTo(xO + 152.150650, 197.549650 + yO);
hC.lineTo(xO + 152.609520, 74.078285 + yO);
hC.lineTo(xO + 132.404810, 73.680279 + yO);
hC.lineTo(xO + 131.393420, 110.310850 + yO);
hC.lineTo(xO + 103.475730, 84.035976 + yO);
hC.lineTo(xO + 54.341657, 131.433070 + yO);
hC.fill();
hC.stroke();
    
// #rect1898
hC.beginPath();
hC.fillStyle = 'rgb(218, 208, 230)';
hC.lineWidth = 0.472615;
hC.rect(xO + 74.087212, 146.169600 + yO, 29.847790, 50.981743);
hC.fill();
    
// #path13430
hC.beginPath();
hC.fillStyle = 'rgb(151, 132, 181)';
hC.strokeStyle = 'rgb(0, 0, 0)';
hC.lineWidth = 0.472615;
hC.lineCap = 'butt';
hC.lineJoin = 'miter';
hC.moveTo(xO + 103.475730, 84.035976 + yO);
hC.lineTo(xO + 167.304170, 144.974770 + yO);
hC.lineTo(xO + 181.080090, 132.229340 + yO);
hC.lineTo(xO + 103.016580, 56.951581 + yO);
hC.lineTo(xO + 24.953156, 131.432760 + yO);
hC.lineTo(xO + 40.565818, 144.974770 + yO);
hC.fill();
hC.stroke();

//---------------------------

const playC = document.getElementById("playBtn").getContext("2d");
playC.fillStyle = "#4aa85c";
playC.fillRect(0, 0, 500, 500);

playC.beginPath();
playC.strokeStyle = 'white';
playC.fillStyle = 'white';
playC.lineWidth = 1;
playC.lineCap = 'butt';
playC.lineJoin = 'miter';
playC.moveTo(60 + 44.053484, 147.608260 - 35);
playC.lineTo(60 + 44.053484, 68.502834 - 35);
playC.lineTo(60 + 112.311470, 106.828610 - 35);
playC.closePath;
playC.fill();
playC.stroke();

const pauseC = document.getElementById("pauseBtn").getContext("2d");
pauseC.fillStyle = "#efbb33";
pauseC.fillRect(0, 0, 500, 500);

// #rect1967
pauseC.beginPath();
pauseC.fillStyle = 'white';
pauseC.lineWidth = 1;
pauseC.rect(75 + 44, 66 - 35, 20, 81);
pauseC.fill();
    
// #rect1967-4
pauseC.beginPath();
pauseC.fillStyle = 'white';
pauseC.lineWidth = 1;
pauseC.rect(75 + 75, 66 - 35, 20, 81);
pauseC.fill();

const stopC = document.getElementById("stopBtn").getContext("2d");
stopC.fillStyle = "#cd654c";
stopC.fillRect(0, 0, 500, 500);

stopC.strokeStyle = 'white';
stopC.fillStyle = 'white';
stopC.beginPath();
stopC.fillStyle = 'white';
stopC.lineWidth = 1;
stopC.rect(60 + 44, 65 - 35, 100, 80);
stopC.fill();
stopC.stroke();

var tpUnits = 'G21';

var tpBbox = {
    min: {
        x: Infinity,
        y: Infinity
    },
    max: {
        x: -Infinity,
        y: -Infinity
    }
};
var bboxIsSet = false;

var resetBbox = function() {
    tpBbox.min.x = Infinity;
    tpBbox.min.y = Infinity;
    tpBbox.max.x = -Infinity;
    tpBbox.max.y = -Infinity;
    tpBboxIsSet = false;

}

// Project the 3D toolpath onto the 2D Canvas
// The coefficients determine the type of projection
// Matrix multiplication written out
var xx = 0.707;
var xy = 0.707;
var xz = 0.0;
var yx = -0.707/2;
var yy = 0.707/2;
var yz = 1.0;
var isoView = function() {
    xx = 0.707;
    xy = 0.707;
    xz = 0.0;
    yx = -0.707;
    yy = 0.707;
    yz = 1.0;
}
var defaultView = function() {
    xx = 0.707;
    xy = 0.707;
    xz = 0.0;
    yx = -0.707/2;
    yy = 0.707/2;
    yz = 1.0;
}
var topView = function() {
    xx = 1.0;
    xy = 0.0;
    xz = 0.0;
    yx = 0.0;
    yy = 1.0;
    yz = 0.0;
}
var projection = function(inpoint) {
    outpoint = {}
    outpoint.x = inpoint.x * xx + inpoint.y * xy + inpoint.z * xz;
    outpoint.y = inpoint.x * yx + inpoint.y * yy + inpoint.z * yz;
    return outpoint;
}

var formatLimit = function(mm) {
    return (tpUnits == 'G20') ? (mm/25.4).toFixed(3)+'"' : mm.toFixed(2)+'mm';
}

var toolX = null;
var toolY = null;
var toolSave = null;
var toolRadius = 6;
var toolRectWH = toolRadius*2 + 4;  // Slop to encompass the entire image area

var drawTool = function(pos) {
    pp = projection(pos)
    toolX = xToPixel(pp.x)-toolRadius-2;
    toolY = yToPixel(pp.y)-toolRadius-2;
    toolSave = tp.getImageData(toolX, toolY, toolRectWH, toolRectWH);

    tp.beginPath();
    tp.strokeStyle = 'magenta';
    tp.fillStyle = 'magenta';
    tp.arc(pp.x, pp.y, toolRadius/scaler, 0, Math.PI*2, true);
    tp.fill();
    tp.stroke();
}

var drawOrigin = function(radius) {
    po = projection({x: 0.0, y:0.0, z:0.0})
    tp.beginPath();
    tp.strokeStyle = 'red';
    tp.arc(po.x, po.y, radius, 0, Math.PI*2, false);
    tp.moveTo(-radius*1.5, 0);
    tp.lineTo(radius*1.5, 0);
    tp.moveTo(0,-radius*1.5);
    tp.lineTo(0, radius*1.5);
    tp.stroke();
}

var drawMachineBounds = function() {

    const wcoX = MPOS[0] - WPOS[0];
    const wcoY = MPOS[1] - WPOS[1];

    var xMin = 0;
    var YMin = 0;

    if(xHomeDir == 1){
        xMin = xHomePos - xMaxTravel;
    }
    else{
        xMin = xHomePos;
    }

    if(yHomeDir == 1){
        yMin = yHomePos - yMaxTravel;
    }
    else{
        yMin = yHomePos;
    }


    const xMax = xMin + xMaxTravel;
    const yMax = yMin + yMaxTravel;


    const p0 = projection({x: xMin - wcoX, y: yMin - wcoY, z: 0});
    const p1 = projection({x: xMin - wcoX, y: yMax - wcoY, z: 0});
    const p2 = projection({x: xMax - wcoX, y: yMax - wcoY, z: 0});
    const p3 = projection({x: xMax - wcoX, y: yMin - wcoY, z: 0});

    tpBbox.min.x = Math.min(tpBbox.min.x, p0.x);
    tpBbox.min.y = Math.min(tpBbox.min.y, p0.y);
    tpBbox.max.x = Math.max(tpBbox.max.x, p2.x);
    tpBbox.max.y = Math.max(tpBbox.max.y, p2.y);

    tp.beginPath();
    tp.moveTo(p0.x, p0.y);
    tp.lineTo(p0.x, p0.y);
    tp.lineTo(p1.x, p1.y);
    tp.lineTo(p2.x, p2.y);
    tp.lineTo(p3.x, p3.y);
    tp.lineTo(p0.x, p0.y);
    tp.strokeStyle = "green";
    tp.stroke();

}

var drawMachineBelts = function() {
    console.log("Drawing machine belts");

    const tl = projection({x: tlX - trX/2, y: tlY/2, z: 0});
    const tr = projection({x: trX, y: trY, z: 0});
    const bl = projection({x: blX - brX/2, y: blY - tlY/2, z: 0});
    const br = projection({x: brX/2, y: brY - trY/2, z: 0});

    tp.beginPath();
    tp.strokeStyle = "grey";
    tp.moveTo(0, 0);
    tp.lineTo(tl.x, tl.y);
    tp.moveTo(0, 0);
    tp.lineTo(tr.x, tr.y);
    tp.moveTo(0, 0);
    tp.lineTo(bl.x, bl.y);
    tp.moveTo(0, 0);
    tp.lineTo(br.x, br.y);
    tp.stroke();
}

var xOffset = 0;
var yOffset = 0;
var scaler = 1;
var xToPixel = function(x) { return scaler * x + xOffset; }
var yToPixel = function(y) { return -scaler * y + yOffset; }

var transformCanvas = function() {
    toolSave = null;
    if (tpRect == undefined) {
        tpRect = canvas.parentNode.getBoundingClientRect();
        //canvas.width = tpRect.width;
        //canvas.height = tpRect.height;
    }

    // Reset the transform and clear the canvas
    tp.setTransform(1,0,0,1,0,0);
    tp.fillStyle = "white";
    tp.fillRect(0, 0, canvas.width, canvas.height);

    var imageWidth;
    var imageHeight;
    var inset;
    if (!bboxIsSet) {
        imageWidth = canvas.width;
        imageHeight = canvas.height;
        inset = 0;
        scaler = 1;
        xOffset = 0;
        yOffset = 0;
        return;
    }

    var imageWidth = tpBbox.max.x - tpBbox.min.x;
    var imageHeight = tpBbox.max.y - tpBbox.min.y;
    if (imageWidth == 0) {
        imageWidth = 1;
    }
    if (imageHeight == 0) {
        imageHeight = 1;
    }
    var shrink = 0.90;
    inset = 5;
    var scaleX = (canvas.width - inset*2) / imageWidth;
    var scaleY = (canvas.height - inset*2) / imageHeight;
    var minScale = Math.min(scaleX, scaleY);

    scaler = minScale * shrink;
    if (scaler < 0) {
        scaler = -scaler;
    }
    xOffset = inset - tpBbox.min.x * scaler;
    yOffset = (canvas.height-inset) - tpBbox.min.y * (-scaler);

    // Canvas coordinates of image bounding box top and right
    var imageTop = scaler * imageHeight;
    var imageRight = scaler * imageWidth;

    // Show the X and Y limit coordinates of the GCode program.
    // We do this before scaling because after we invert the Y coordinate,
    // text would be displayed upside-down.
    // tp.fillStyle = "black";
    // tp.font = "14px Ariel";
    // tp.textAlign = "center";
    // tp.textBaseline = "bottom";
    // tp.fillText(formatLimit(tpBbox.min.y), imageRight/2, canvas.height-inset);
    // tp.textBaseline = "top";
    // tp.fillText(formatLimit(tpBbox.max.y), imageRight/2, canvas.height-inset - imageTop);
    // tp.textAlign = "left";
    // tp.textBaseline = "center";
    // tp.fillText(formatLimit(tpBbox.min.x), inset, canvas.height-inset - imageTop/2);
    // tp.textAlign = "right";
    // tp.textBaseline = "center";
    // tp.fillText(formatLimit(tpBbox.max.x), inset+imageRight, canvas.height-inset - imageTop/2);
    // Transform the path coordinate system so the image fills the canvas
    // with a small inset, and +Y goes upward.
    // The net transform from image space (x,y) to pixel space (x',y') is:
    //   x' =  scaler*x + xOffset
    //   y' = -scaler*y + yOffset
    // We use setTransform() instead of a sequence of scale() and translate() calls
    // because we need to perform the transform manually for getImageData(), which
    // uses pixel coordinates, and there is no standard way to read back the current
    // transform matrix.

    tp.setTransform(scaler, 0, 0, -scaler, xOffset, yOffset);

    tp.lineWidth = 0.5 / scaler;

    drawOrigin(imageWidth * 0.04);
}
var wrappedDegrees = function(radians) {
    var degrees = radians * 180 / Math.PI;
    return degrees >= 0 ? degrees : degrees + 360;
}

var bboxHandlers = {
    addLine: function(modal, start, end) {
	// Update tpUnits in case it changed in a previous line
        tpUnits = modal.units;

        ps = projection(start);
        pe = projection(end);

        tpBbox.min.x = Math.min(tpBbox.min.x, ps.x, pe.x);
        tpBbox.min.y = Math.min(tpBbox.min.y, ps.y, pe.y);
        tpBbox.max.x = Math.max(tpBbox.max.x, ps.x, pe.x);
        tpBbox.max.y = Math.max(tpBbox.max.y, ps.y, pe.y);
        bboxIsSet = true;
    },
    addArcCurve: function(modal, start, end, center) {
        // To determine the precise bounding box of a circular arc we
	// must account for the possibility that the arc crosses one or
	// more axes.  If so, the bounding box includes the "bulges" of
	// the arc across those axes.

	// Update units in case it changed in a previous line
        tpUnits = modal.units;

        if (modal.motion == 'G2') {  // clockwise
            var tmp = start;
            start = end;
            end = tmp;
        }

        ps = projection(start);
        pc = projection(center);
        pe = projection(end);

	// Coordinates relative to the center of the arc
	var sx = ps.x - pc.x;
	var sy = ps.y - pc.y;
	var ex = pe.x - pc.x;
	var ey = pe.y - pc.y;

        var radius = Math.hypot(sx, sy);

	// Axis crossings - plus and minus x and y
	var px = false;
	var py = false;
	var mx = false;
	var my = false;

	// There are ways to express this decision tree in fewer lines
	// of code by converting to alternate representations like angles,
	// but this way is probably the most computationally efficient.
	// It avoids any use of transcendental functions.  Every path
	// through this decision tree is either 4 or 5 simple comparisons.
	if (ey >= 0) {              // End in upper half plane
	    if (ex > 0) {             // End in quadrant 0 - X+ Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			if (sx <= ex) {     // wraparound
			    px = py = mx = my = true;
			}
		    } else {              // Start in quadrant 1 - X- Y+
			mx = my = px = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = true;
		    } else {              // Start in quadrant 2 - X- Y-
			my = px = true;
		    }
		}
	    } else {                  // End in quadrant 1 - X- Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = true;
		    } else {              // Start in quadrant 1 - X- Y+
			if (sx <= ex) {     // wraparound
			    px = py = mx = my = true;
			}
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = py = true;
		    } else {              // Start in quadrant 2 - X- Y-
			my = px = py = true;
		    }
		}
	    }
	} else {                    // ey < 0 - end in lower half plane
	    if (ex > 0) {             // End in quadrant 3 - X+ Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = mx = my = true;
		    } else {              // Start in quadrant 1 - X- Y+
			mx = my = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			if (sx >= ex) {      // wraparound
			    px = py = mx = my = true;
			}
		    } else {              // Start in quadrant 2 - X- Y-
			my = true;
		    }
		}
	    } else {                  // End in quadrant 2 - X- Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = mx = true;
		    } else {              // Start in quadrant 1 - X- Y+
			mx = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = py = mx = true;
		    } else {              // Start in quadrant 2 - X- Y-
			if (sx >= ex) {      // wraparound
			    px = py = mx = my = true;
			}
		    }
		}
	    }
	}
	var maxX = px ? pc.x + radius : Math.max(ps.x, pe.x);
	var maxY = py ? pc.y + radius : Math.max(ps.y, pe.y);
	var minX = mx ? pc.x - radius : Math.min(ps.x, pe.x);
	var minY = my ? pc.y - radius : Math.min(ps.y, pe.y);

	tpBbox.min.x = Math.min(tpBbox.min.x, minX);
	tpBbox.min.y = Math.min(tpBbox.min.y, minY);
	tpBbox.max.x = Math.max(tpBbox.max.x, maxX);
	tpBbox.max.y = Math.max(tpBbox.max.y, maxY);
        bboxIsSet = true;
    }
};
var initialMoves = true;
var displayHandlers = {
    addLine: function(modal, start, end) {
        var motion = modal.motion;
        if (motion == 'G0') {
            tp.strokeStyle = initialMoves ? 'red' : 'green';
        } else {
            tp.strokeStyle = 'black';
            // Don't cancel initialMoves on no-motion G1 (e.g. G1 F30)
            // or on Z-only moves
            if (start.x != end.x || start.y != end.y) {
                initialMoves = false;
            }
        }

        ps = projection(start);
        pe = projection(end);
        tp.beginPath();
        // tp.moveTo(start.x, start.y);
        // tp.lineTo(end.x, end.y);
        tp.moveTo(ps.x, ps.y);
        tp.lineTo(pe.x, pe.y);
        tp.stroke();
    },
    addArcCurve: function(modal, start, end, center) {
        var motion = modal.motion;

        var deltaX1 = start.x - center.x;
        var deltaY1 = start.y - center.y;
        var radius = Math.hypot(deltaX1, deltaY1);
        var deltaX2 = end.x - center.x;
        var deltaY2 = end.y - center.y;
        var theta1 = Math.atan2(deltaY1, deltaX1);
        var theta2 = Math.atan2(deltaY2, deltaX2);
        var cw = modal.motion == "G2";
        if (!cw && theta2 < theta1) {
            theta2 += Math.PI * 2;
        } else if (cw && theta2 > theta1) {
            theta2 -= Math.PI * 2;
        }
	if (theta1 == theta2) {
	    theta2 += Math.PI * ((cw) ? -2 : 2);
	}

        initialMoves = false;

        tp.beginPath();
        tp.strokeStyle = 'black';
        deltaTheta = theta2 - theta1;
        n = (Math.abs(deltaTheta) > Math.PI) ? 20 : 10;
        dt = (deltaTheta) / n;
        ps = projection(start);
        tp.moveTo(ps.x, ps.y);
        next = {};
        // XXX we could do spirals by interpolating Z
        theta = theta1;
        for (i = 0; i < n; i++) {
            theta += dt;
            next.x = center.x + radius * Math.cos(theta);
            next.y = center.y + radius * Math.sin(theta);
            next.z = start.z;
            pe = projection(next)
            tp.lineTo(pe.x, pe.y);
        }
        tp.stroke();
    },
};

var ToolpathDisplayer = function() {
};

var offset;

ToolpathDisplayer.prototype.showToolpath = function(gcode, wpos, mpos, cameraAngle = 0) {

    cameraAngle = cameraAngle;

    var drawBounds = false;
    var drawBelts  = false;

    switch (cameraAngle) {
      case 0:
        topView();
        break;
      case 1:
        topView();
        drawBounds = true;
        break;
      case 2:
        defaultView();
        break;
      case 3:
        defaultView();
        drawBounds = true;
        break;
      case 4:
        topView();
        drawBounds = true;
        drawBelts  = true;
        break;
      default:
        defaultView();
    }

    inInches = id('units').innerText != 'mm';

    // Assume WPOS in mm
    // var factor = inInches ? 25.4 : 1.0;
    factor = 1;

    var initialPosition = {
        x: wpos[0] * factor,
        y: wpos[1] * factor,
        z: wpos[2] * factor
    };

    var mposmm = {
        x: mpos[0] * factor,
        y: mpos[1] * factor,
        z: mpos[2] * factor
    };

    offset = {
        x: initialPosition.x - mposmm.x,
        y: initialPosition.y - mposmm.y,
        z: initialPosition.z - mposmm.z
    };

    resetBbox();
    bboxHandlers.position = initialPosition;

    if(drawBounds){
        drawMachineBounds(); //Adds the machine bounds to the bounding box...this does not draw
    }
    if(drawBelts){
        drawMachineBelts(); //Adds the belts to the bounding box...does not draw yet
    }

    var gcodeLines = gcode.split('\n');
    new Toolpath(bboxHandlers).loadFromLinesSync(gcodeLines);
    transformCanvas();
    if (!bboxIsSet) {
        return;
    }
    initialMoves = true;
    displayHandlers.position = initialPosition;
    new Toolpath(displayHandlers).loadFromLinesSync(gcodeLines);

    drawTool(initialPosition);

    if(drawBounds){
        drawMachineBounds(); //Actually draws the bounding box
    }
    if(drawBelts){
        drawMachineBelts(); //Actually draws the belts
    }
};

ToolpathDisplayer.prototype.reDrawTool = function(modal, mpos) {
    if (toolSave != null) {
        tp.putImageData(toolSave, toolX, toolY);
        var factor = 1;
        // var factor = modal.units === 'G20' ? 25.4 : 1.0;

        var dpos = {
            x: mpos[0] * factor + offset.x,
            y: mpos[1] * factor + offset.y,
            z: mpos[2] * factor + offset.z
        };
        drawTool(dpos);
    }
}

ToolpathDisplayer.prototype.setXTravel = function(maxTravelX) {
    xMaxTravel = maxTravelX;
}
ToolpathDisplayer.prototype.setYTravel = function(maxTravelY) {
    yMaxTravel = maxTravelY;
}

ToolpathDisplayer.prototype.setXHome = function(xHomeInternal) {
    xHomePos = xHomeInternal;
}
ToolpathDisplayer.prototype.setYHome = function(yHomeInternal) {
    yHomePos = yHomeInternal;
}

ToolpathDisplayer.prototype.setXDir = function(xDir) {
    if(xDir == "true"){
        xHomeDir = 1;
    }
    else{
        xHomeDir = -1
    }
}
ToolpathDisplayer.prototype.setYDir = function(yDir) {
    if(yDir == "true"){
        yHomeDir = 1;
    }
    else{
        yHomeDir = -1
    }
}

displayer = new ToolpathDisplayer();

var updateGcodeViewerAngle = function() {
    cameraAngle = cameraAngle + 1;
    if(cameraAngle > 4){
        cameraAngle = 0;
    }

    const gcode = id('gcode').value;
    displayer.showToolpath(gcode, WPOS, MPOS, cameraAngle);
}

var refreshGcode = function() {
    const gcode = id('gcode').value;
    displayer.showToolpath(gcode, WPOS, MPOS, cameraAngle);
}

id("small-toolpath").addEventListener("mouseup", updateGcodeViewerAngle); 
