// Display the XY-plane projection of a GCode toolpath on a 2D canvas
import { Common, getValue, id, MPOS, WPOS, Toolpath } from "./common.js";

let tpc = null;
const tpCanvas = () => {
	if (!tpc) {
		const elem = id("small-toolpath");
		if (!elem) {
			return null;
		}
		tpc = elem;

		const scale = window.devicePixelRatio;
		const width = window.innerWidth;

		tpc.width = width * scale;
		tpc.height = (width / 2) * scale;
	}

	return tpc;
}

const tp = tpc ? tpc.getContext("2d", { willReadFrequently: true }) : {};

tp.lineWidth = 0.1;
tp.lineCap = "round";
tp.strokeStyle = "black";

let cameraAngle = 0;

const tlX = -8.339;
const tlY = 2209;
const trX = 3505;
const trY = 2209;
const blX = 0;
const blY = 0;
const brX = 3505;
const brY = 0;

const get2DContext = (id) => {
	const btnElem = document.getElementById(id)
	if (!btnElem) {
		return null;
	}
	return btnElem.getContext("2d");
}

/** Draw buttons */
const drawBtn = (btnDef) => {
	const bec = get2DContext(btnDef.id);
	if (!bec) {
		return;
	}

	bec.fillStyle = btnDef.fillStyle;
	bec.fillRect(0, 0, 500, 500);
	bec.beginPath();
	bec.moveTo(...btnDef.path[0]);
	for (let ix = 1; ix < btnDef.path.length; ix++) {
		bec.lineTo(...btnDef.path[ix]);
	}
	bec.closePath();
	bec.lineWidth = 5;
	bec.strokeStyle = "white";
	bec.fillStyle = "white";
	bec.fill();
	bec.stroke();

	return bec;
}

const btnDefs = [
	{ name: "tlC", id: "tlBtn", fill: "#b69fcb", path: [[90, 40], [90, 140], [230, 40], [90, 40]] },
	{ name: "trC", id: "trBtn", fill: "#b69fcb", path: [[90, 40], [230, 140], [230, 40], [90, 40]] },
	{ name: "blC", id: "blBtn", fill: "#b69fcb", path: [[90, 40], [230, 140], [90, 140], [90, 40]] },
	{ name: "brC", id: "brBtn", fill: "#b69fcb", path: [[90, 140], [230, 140], [230, 40], [90, 140]] },
]

const tlC = drawBtn(btnDefs.find((btnDef) => btnDef.name === "tlC"));
const trC = drawBtn(btnDefs.find((btnDef) => btnDef.name === "trC"));
const blC = drawBtn(btnDefs.find((btnDef) => btnDef.name === "blC"));
const brC = drawBtn(btnDefs.find((btnDef) => btnDef.name === "brC"));

const upC = get2DContext("upBtn");
if (upC) {
	upC.fillStyle = "#9d88c0";
	upC.fillRect(0, 0, 500, 500);
	// #rect441
	upC.beginPath();
	upC.fillStyle = "white";
	upC.lineWidth = 1;
	upC.rect(60 + 49.21384, 99.622299, 93.976021, 74.721062);
	upC.fill();

	// #path608
	upC.beginPath();
	upC.strokeStyle = "white";
	upC.lineWidth = 1;
	upC.lineCap = "butt";
	upC.lineJoin = "miter";
	upC.moveTo(60 + 5.109692, 104.66681);
	upC.lineTo(60 + 94.67922, 4.145211);
	upC.lineTo(60 + 189.30507, 103.959);
	upC.lineTo(60 + 5.109692, 104.66681);
	upC.closePath();
	upC.stroke();
	upC.fill();
}

const dnC = get2DContext("dnBtn");
if (dnC) {
	dnC.fillStyle = "#9d88c0";
	dnC.fillRect(0, 0, 500, 500);
	// #rect441
	dnC.save();
	dnC.transform(1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
	dnC.fillStyle = "white";
	dnC.lineWidth = 1;
	dnC.rect(60 + 49.21384, -75.901474, 93.976021, 74.721062);
	dnC.fill();
	dnC.restore();

	// #path608
	dnC.beginPath();
	dnC.strokeStyle = "white";
	dnC.fillStyle = "white";
	dnC.lineWidth = 1;
	dnC.lineCap = "butt";
	dnC.lineJoin = "miter";
	dnC.moveTo(60 + 5, 70 - 20);
	dnC.lineTo(60 + 94, 171 - 20);
	dnC.lineTo(60 + 189, 71 - 20);
	dnC.lineTo(60 + 5, 70 - 20);
	dnC.closePath();
	dnC.stroke();
	dnC.fill();
}

const rC = get2DContext("rBtn");
if (rC) {
	rC.fillStyle = "#9d88c0";
	rC.fillRect(0, 0, 500, 500);
	// #g1100
	rC.save();
	rC.transform(0.0, 1.0, -1.0, 0.0, 187.481, 0.27369);
	// #rect441
	rC.fillStyle = "white";
	rC.lineWidth = 1;
	rC.rect(-20 + 49.21384, 99.622299 - 80, 93.976021, 74.721062);
	rC.fill();

	// #path608
	rC.beginPath();
	rC.strokeStyle = "white";
	rC.lineWidth = 1;
	rC.lineCap = "butt";
	rC.lineJoin = "miter";
	rC.moveTo(-20 + 5.109692, 104.66681 - 80);
	rC.lineTo(-20 + 94.67922, 4.145213 - 80);
	rC.lineTo(-20 + 189.30507, 103.959 - 80);
	rC.closePath();
	rC.stroke();
	rC.fill();
	rC.restore();
}

const lC = get2DContext("lBtn");
if (lC) {
	lC.fillStyle = "#9d88c0";
	lC.fillRect(0, 0, 500, 500);
	// #g1100
	lC.save();
	lC.transform(0.0, 1.0, 1.0, 0.0, 11.9575, 0.27369);
	// #rect441
	lC.fillStyle = "white";
	lC.lineWidth = 1;
	lC.rect(-20 + 49.21384, 99.622299, 93.976021, 74.721062);
	lC.fill();

	// #path608
	lC.beginPath();
	lC.strokeStyle = "white";
	lC.lineWidth = 1;
	lC.lineCap = "butt";
	lC.lineJoin = "miter";
	lC.moveTo(-20 + 5.109692, 104.66681);
	lC.lineTo(-20 + 94.67922, 4.145213);
	lC.lineTo(-20 + 189.30507, 103.959);
	lC.closePath();
	lC.stroke();
	lC.fill();
	lC.restore();
}

const hC = get2DContext("hBtn");
if (hC) {
	const xO = 55;
	const yO = -45;

	// #path5094
	hC.beginPath();
	hC.fillStyle = "rgb(183, 161, 208)";
	hC.strokeStyle = "rgb(0, 0, 0)";
	hC.lineWidth = 0.472615;
	hC.lineCap = "butt";
	hC.lineJoin = "miter";
	hC.moveTo(xO + 55.719343, 197.54965 + yO);
	hC.lineTo(xO + 152.15065, 197.54965 + yO);
	hC.lineTo(xO + 152.60952, 74.078285 + yO);
	hC.lineTo(xO + 132.40481, 73.680279 + yO);
	hC.lineTo(xO + 131.39342, 110.31085 + yO);
	hC.lineTo(xO + 103.47573, 84.035976 + yO);
	hC.lineTo(xO + 54.341657, 131.43307 + yO);
	hC.fill();
	hC.stroke();

	// #rect1898
	hC.beginPath();
	hC.fillStyle = "rgb(218, 208, 230)";
	hC.lineWidth = 0.472615;
	hC.rect(xO + 74.087212, 146.1696 + yO, 29.84779, 50.981743);
	hC.fill();

	// #path13430
	hC.beginPath();
	hC.fillStyle = "rgb(151, 132, 181)";
	hC.strokeStyle = "rgb(0, 0, 0)";
	hC.lineWidth = 0.472615;
	hC.lineCap = "butt";
	hC.lineJoin = "miter";
	hC.moveTo(xO + 103.47573, 84.035976 + yO);
	hC.lineTo(xO + 167.30417, 144.97477 + yO);
	hC.lineTo(xO + 181.08009, 132.22934 + yO);
	hC.lineTo(xO + 103.01658, 56.951581 + yO);
	hC.lineTo(xO + 24.953156, 131.43276 + yO);
	hC.lineTo(xO + 40.565818, 144.97477 + yO);
	hC.fill();
	hC.stroke();
}

//---------------------------

const playC = get2DContext("playBtn");
if (playC) {
	playC.fillStyle = "#4aa85c";
	playC.fillRect(0, 0, 500, 500);
	playC.beginPath();
	playC.strokeStyle = "white";
	playC.fillStyle = "white";
	playC.lineWidth = 1;
	playC.lineCap = "butt";
	playC.lineJoin = "miter";
	playC.moveTo(60 + 44.053484, 147.60826 - 35);
	playC.lineTo(60 + 44.053484, 68.502834 - 35);
	playC.lineTo(60 + 112.31147, 106.82861 - 35);
	playC.closePath;
	playC.fill();
	playC.stroke();
}

const pauseC = get2DContext("pauseBtn");
if (pauseC) {
	pauseC.fillStyle = "#efbb33";
	pauseC.fillRect(0, 0, 500, 500);
	// #rect1967
	pauseC.beginPath();
	pauseC.fillStyle = "white";
	pauseC.lineWidth = 1;
	pauseC.rect(75 + 44, 66 - 35, 20, 81);
	pauseC.fill();
	// #rect1967-4
	pauseC.beginPath();
	pauseC.fillStyle = "white";
	pauseC.lineWidth = 1;
	pauseC.rect(75 + 75, 66 - 35, 20, 81);
	pauseC.fill();
}

const stopC = get2DContext("stopBtn");
if (stopC) {
	stopC.fillStyle = "#cd654c";
	stopC.fillRect(0, 0, 500, 500);
	stopC.strokeStyle = "white";
	stopC.fillStyle = "white";
	stopC.beginPath();
	stopC.fillStyle = "white";
	stopC.lineWidth = 1;
	stopC.rect(60 + 44, 65 - 35, 100, 80);
	stopC.fill();
	stopC.stroke();
}

let tpUnits = "G21";

const tpBbox = {
	min: {
		x: Number.POSITIVE_INFINITY,
		y: Number.POSITIVE_INFINITY,
	},
	max: {
		x: Number.NEGATIVE_INFINITY,
		y: Number.NEGATIVE_INFINITY,
	},
};
let bboxIsSet = false;

const resetBbox = () => {
	tpBbox.min.x = Number.POSITIVE_INFINITY;
	tpBbox.min.y = Number.POSITIVE_INFINITY;
	tpBbox.max.x = Number.NEGATIVE_INFINITY;
	tpBbox.max.y = Number.NEGATIVE_INFINITY;
	bboxIsSet = false;
};

// Project the 3D toolpath onto the 2D Canvas
// The coefficients determine the type of projection
// Matrix multiplication written out
let xx = Math.SQRT1_2;
let xy = Math.SQRT1_2;
let xz = 0.0;
let yx = -Math.SQRT1_2 / 2;
let yy = Math.SQRT1_2 / 2;
let yz = 1.0;
const isoView = () => {
	xx = Math.SQRT1_2;
	xy = Math.SQRT1_2;
	xz = 0.0;
	yx = -Math.SQRT1_2;
	yy = Math.SQRT1_2;
	yz = 1.0;
};
const obliqueView = () => {
	xx = Math.SQRT1_2;
	xy = Math.SQRT1_2;
	xz = 0.0;
	yx = -Math.SQRT1_2 / 2;
	yy = Math.SQRT1_2 / 2;
	yz = 1.0;
};
const topView = () => {
	xx = 1.0;
	xy = 0.0;
	xz = 0.0;
	yx = 0.0;
	yy = 1.0;
	yz = 0.0;
};
const projection = (wpos) => ({ x: wpos.x * xx + wpos.y * xy + wpos.z * xz, y: wpos.x * yx + wpos.y * yy + wpos.z * yz });

const formatLimit = (mm) => tpUnits === "G20" ? `${(mm / 25.4).toFixed(3)}"` : `${mm.toFixed(2)}mm`;

let toolX = null;
let toolY = null;
let toolSave = null;
const toolRadius = 6;
const toolRectWH = toolRadius * 2 + 4; // Slop to encompass the entire image area

const drawTool = (dpos) => {
	const pp = projection(dpos);
	toolX = xToPixel(pp.x) - toolRadius - 2;
	toolY = yToPixel(pp.y) - toolRadius - 2;
	toolSave = tp.getImageData(toolX, toolY, toolRectWH, toolRectWH);

	tp.beginPath();
	tp.strokeStyle = "magenta";
	tp.fillStyle = "magenta";
	tp.arc(pp.x, pp.y, toolRadius / scaler, 0, Math.PI * 2, true);
	tp.fill();
	tp.stroke();
};

const drawOrigin = (radius) => {
	const po = projection({ x: 0.0, y: 0.0, z: 0.0 });
	tp.beginPath();
	tp.strokeStyle = "red";
	tp.arc(po.x, po.y, radius, 0, Math.PI * 2, false);
	tp.moveTo(-radius * 1.5, 0);
	tp.lineTo(radius * 1.5, 0);
	tp.moveTo(0, -radius * 1.5);
	tp.lineTo(0, radius * 1.5);
	tp.stroke();
};

const drawMachineBounds = () => {
	//Work codinates offset the maxTravel part centers it in the view so 0,0 is the middle of the sheet
	const woodWidth = 2438;
	const woodHeight = 2438 / 2;

	//Project onto the camera view
	const p0 = projection({ x: -woodWidth / 2, y: -woodHeight / 2, z: 0 });
	const p1 = projection({ x: woodWidth / 2, y: -woodHeight / 2, z: 0 });
	const p2 = projection({ x: woodWidth / 2, y: woodHeight / 2, z: 0 });
	const p3 = projection({ x: -woodWidth / 2, y: woodHeight / 2, z: 0 });

	//This is used to fit everything in the camera view later
	tpBbox.min.x = Math.min(tpBbox.min.x, p0.x);
	tpBbox.min.y = Math.min(tpBbox.min.y, p0.y);
	tpBbox.max.x = Math.max(tpBbox.max.x, p2.x);
	tpBbox.max.y = Math.max(tpBbox.max.y, p2.y);
	bboxIsSet = true;

	//Draw to the actual display
	tp.beginPath();
	tp.moveTo(p0.x, p0.y);
	tp.lineTo(p0.x, p0.y);
	tp.lineTo(p1.x, p1.y);
	tp.lineTo(p2.x, p2.y);
	tp.lineTo(p3.x, p3.y);
	tp.lineTo(p0.x, p0.y);
	tp.strokeStyle = "green";
	tp.stroke();
};

const drawMachineBelts = () => {
	console.log("Draw belts");

	const tl = projection({ x: tlX - trX / 2, y: tlY / 2, z: 0 });
	const tr = projection({ x: trX / 2, y: trY / 2, z: 0 });
	const bl = projection({ x: blX - brX / 2, y: blY - tlY / 2, z: 0 });
	const br = projection({ x: brX / 2, y: brY - trY / 2, z: 0 });

	tpBbox.min.x = Math.min(tpBbox.min.x, bl.x);
	tpBbox.min.y = Math.min(tpBbox.min.y, bl.y);
	tpBbox.max.x = Math.max(tpBbox.max.x, tr.x);
	tpBbox.max.y = Math.max(tpBbox.max.y, tr.y);

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

	tp.fillStyle = "black";
	tp.beginPath();
	tp.arc(tl.x, tl.y, 10, 0, 2 * Math.PI);
	tp.closePath();
	tp.fill();
	tp.beginPath();
	tp.arc(tr.x, tr.y, 10, 0, 2 * Math.PI);
	tp.closePath();
	tp.fill();
	tp.beginPath();
	tp.arc(br.x, br.y, 10, 0, 2 * Math.PI);
	tp.closePath();
	tp.fill();
	tp.beginPath();
	tp.arc(bl.x, bl.y, 10, 0, 2 * Math.PI);
	tp.closePath();
	tp.fill();

	const squareSize = projection({ x: 50, y: 0, z: 0 });

	let i = bl.x;
	let j = bl.y;
	while (i < tr.x) {
		while (j < tr.y) {
			drawARect(
				i,
				j,
				squareSize.x,
				computPositonGradient(i, j, tl, tr, bl, br),
			);
			j = j + squareSize.x;
		}
		j = bl.y;
		i = i + squareSize.x;
	}
};

const checkMinBeltLength = (x1, y1, x2, y2) => {
	const dist = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	return (dist < 1200) ? 1 - dist / 1200 : 0;
};

const computPositonGradient = (x, y, tl, tr, bl, br) => {
	let opacity = 0;

	//Check distance from the mounting points
	opacity = opacity + checkMinBeltLength(x, y, tl.x, tl.y);
	opacity = opacity + checkMinBeltLength(x, y, tr.x, tr.y);
	opacity = opacity + checkMinBeltLength(x, y, bl.x, bl.y);
	opacity = opacity + checkMinBeltLength(x, y, br.x, br.y);

	opacity = Math.max(opacity, computeTension(x, y, tl, tr, bl, br));

	return opacity;
};

const computeTension = (x, y, tl, tr, bl, br) => {
	const A = Math.atan((y - tl.y) / (tr.x - x));
	const B = Math.atan((y - tl.y) / (x - tl.x));

	const T1 = 1 / ((Math.cos(A) * Math.sin(B)) / Math.cos(B) + Math.sin(A));
	const T2 = 1 / ((Math.cos(B) * Math.sin(A)) / Math.cos(A) + Math.sin(B));

	const T1Scaled = T1 / -3;
	const T2Scaled = T2 / -3; //This is some arbitrary scaling to make it look right in terms of color

	const max = Math.max(T1Scaled, T2Scaled);

	return (max > 0.15) ? max : 0;
};

// License: MIT - https://opensource.org/licenses/MIT
// Author: Michele Locati <michele@locati.it>
// Source: https://gist.github.com/mlocati/7210513
function perc2color(perc) {
	console.log(perc);
	let r;
	let g;
	const b = 0;
	if (perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	} else {
		g = 255;
		r = Math.round(510 - 5.1 * perc);
	}
	const h = r * 0x10000 + g * 0x100 + b * 0x1;

	console.log(`${r} ${g} ${b}`);
	return `rgba(${r}, ${g}, ${b}, .3)`; //'#' + ('000000' + h.toString(16)).slice(-6);
}

const drawARect = (x, y, size, opacity) => {
	const posP = projection({ x: x - size / 2, y: y - size / 2, z: 0 });
	tp.beginPath();
	tp.fillStyle = perc2color(100 - 100 * opacity); //"rgba(255, 0, 0, " + opacity + ")";
	tp.rect(posP.x, posP.y, size, size);
	tp.fill();
};

let xOffset = 0;
let yOffset = 0;
let scaler = 1;
const xToPixel = (x) => scaler * x + xOffset;
const yToPixel = (y) => -scaler * y + yOffset;

const clearCanvas = () => {
	const tpc = tpCanvas();
	if (!tpc) {
		return;
	}
	// Reset the transform and clear the tpCanvas
	tp.setTransform(1, 0, 0, 1, 0, 0);

	//    if (tpRect == undefined) {
	const tpRect = tpc.parentNode.getBoundingClientRect();
	// tpc.width = tpRect.width ? tpRect.width : 400;
	// tpc.height = tpRect.height ? tpRect.height : 400;
	//    }

	tp.fillStyle = "white";
	tp.fillRect(0, 0, tpc.width, tpc.height);
};

const transformCanvas = () => {
	toolSave = null;

	clearCanvas();

	const tpc = tpCanvas();

	let inset;
	if (!bboxIsSet) {
		// const tpc = tpCanvas();
		// if (tpc) {
		// imageWidth = tpc.width;
		// imageHeight = tpc.height;
		// }

		inset = 0;
		scaler = 1;
		xOffset = 0;
		yOffset = 0;
		return;
	}

	let imageWidth = tpBbox.max.x - tpBbox.min.x;
	let imageHeight = tpBbox.max.y - tpBbox.min.y;
	if (imageWidth === 0) {
		imageWidth = 1;
	}
	if (imageHeight === 0) {
		imageHeight = 1;
	}
	const shrink = 0.9;
	inset = 5;
	if (tpc) {
		const scaleX = (tpc.width - inset * 2) / imageWidth;
		const scaleY = (tpc.height - inset * 2) / imageHeight;
		const minScale = Math.min(scaleX, scaleY);

		scaler = minScale * shrink;
		if (scaler < 0) {
			scaler = -scaler;
		}
		xOffset = inset - tpBbox.min.x * scaler;
		yOffset = tpc.height - inset - tpBbox.min.y * -scaler;

		// Canvas coordinates of image bounding box top and right
		const imageTop = scaler * imageHeight;
		const imageRight = scaler * imageWidth;

		// Show the X and Y limit coordinates of the GCode program.
		// We do this before scaling because after we invert the Y coordinate,
		// text would be displayed upside-down.
		// tp.fillStyle = "black";
		// tp.font = "14px Ariel";
		// tp.textAlign = "center";
		// tp.textBaseline = "bottom";
		// tp.fillText(formatLimit(tpBbox.min.y), imageRight/2, tpc.height-inset);
		// tp.textBaseline = "top";
		// tp.fillText(formatLimit(tpBbox.max.y), imageRight/2, tpc.height-inset - imageTop);
		// tp.textAlign = "left";
		// tp.textBaseline = "center";
		// tp.fillText(formatLimit(tpBbox.min.x), inset, tpc.height-inset - imageTop/2);
		// tp.textAlign = "right";
		// tp.textBaseline = "center";
		// tp.fillText(formatLimit(tpBbox.max.x), inset+imageRight, tpc.height-inset - imageTop/2);
		// Transform the path coordinate system so the image fills the tpc
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
	}

	drawOrigin(imageWidth * 0.04);
};
const wrappedDegrees = (radians) => {
	const degrees = (radians * 180) / Math.PI;
	return degrees >= 0 ? degrees : degrees + 360;
};

const bboxHandlers = {
	addLine: (modal, start, end) => {
		// Update tpUnits in case it changed in a previous line
		tpUnits = modal.units;

		const ps = projection(start);
		const pe = projection(end);

		tpBbox.min.x = Math.min(tpBbox.min.x, ps.x, pe.x);
		tpBbox.min.y = Math.min(tpBbox.min.y, ps.y, pe.y);
		tpBbox.max.x = Math.max(tpBbox.max.x, ps.x, pe.x);
		tpBbox.max.y = Math.max(tpBbox.max.y, ps.y, pe.y);
		bboxIsSet = true;
	},
	addArcCurve: (modal, begin, finish, center, extraRotations) => {
		// To determine the precise bounding box of a circular arc we
		// must account for the possibility that the arc crosses one or
		// more axes.  If so, the bounding box includes the "bulges" of
		// the arc across those axes.

		// Update units in case it changed in a previous line
		tpUnits = modal.units;

		// clockwise check
		const start = (modal.motion === "G2") ? finish : begin;
		const end = (modal.motion === "G2") ? begin : finish;

		const ps = projection(start);
		const pc = projection(center);
		const pe = projection(end);

		// Coordinates relative to the center of the arc
		const sx = ps.x - pc.x;
		const sy = ps.y - pc.y;
		const ex = pe.x - pc.x;
		const ey = pe.y - pc.y;

		const radius = Math.hypot(sx, sy);

		// Axis crossings - plus and minus x and y
		let px = false;
		let py = false;
		let mx = false;
		let my = false;

		// There are ways to express this decision tree in fewer lines
		// of code by converting to alternate representations like angles,
		// but this way is probably the most computationally efficient.
		// It avoids any use of transcendental functions.  Every path
		// through this decision tree is either 4 or 5 simple comparisons.
		if (ey >= 0) {
			// End in upper half plane
			if (ex > 0) {
				// End in quadrant 0 - X+ Y+
				if (sy >= 0) {
					// Start in upper half plane
					if (sx > 0) {
						// Start in quadrant 0 - X+ Y+
						if (sx <= ex) {
							// wraparound
							px = py = mx = my = true;
						}
					} else {
						// Start in quadrant 1 - X- Y+
						mx = my = px = true;
					}
				} else {
					// Start in lower half plane
					if (sx > 0) {
						// Start in quadrant 3 - X+ Y-
						px = true;
					} else {
						// Start in quadrant 2 - X- Y-
						my = px = true;
					}
				}
			} else {
				// End in quadrant 1 - X- Y+
				if (sy >= 0) {
					// Start in upper half plane
					if (sx > 0) {
						// Start in quadrant 0 - X+ Y+
						py = true;
					} else {
						// Start in quadrant 1 - X- Y+
						if (sx <= ex) {
							// wraparound
							px = py = mx = my = true;
						}
					}
				} else {
					// Start in lower half plane
					if (sx > 0) {
						// Start in quadrant 3 - X+ Y-
						px = py = true;
					} else {
						// Start in quadrant 2 - X- Y-
						my = px = py = true;
					}
				}
			}
		} else {
			// ey < 0 - end in lower half plane
			if (ex > 0) {
				// End in quadrant 3 - X+ Y+
				if (sy >= 0) {
					// Start in upper half plane
					if (sx > 0) {
						// Start in quadrant 0 - X+ Y+
						py = mx = my = true;
					} else {
						// Start in quadrant 1 - X- Y+
						mx = my = true;
					}
				} else {
					// Start in lower half plane
					if (sx > 0) {
						// Start in quadrant 3 - X+ Y-
						if (sx >= ex) {
							// wraparound
							px = py = mx = my = true;
						}
					} else {
						// Start in quadrant 2 - X- Y-
						my = true;
					}
				}
			} else {
				// End in quadrant 2 - X- Y+
				if (sy >= 0) {
					// Start in upper half plane
					if (sx > 0) {
						// Start in quadrant 0 - X+ Y+
						py = mx = true;
					} else {
						// Start in quadrant 1 - X- Y+
						mx = true;
					}
				} else {
					// Start in lower half plane
					if (sx > 0) {
						// Start in quadrant 3 - X+ Y-
						px = py = mx = true;
					} else {
						// Start in quadrant 2 - X- Y-
						if (sx >= ex) {
							// wraparound
							px = py = mx = my = true;
						}
					}
				}
			}
		}
		const maxX = px ? pc.x + radius : Math.max(ps.x, pe.x);
		const maxY = py ? pc.y + radius : Math.max(ps.y, pe.y);
		const minX = mx ? pc.x - radius : Math.min(ps.x, pe.x);
		const minY = my ? pc.y - radius : Math.min(ps.y, pe.y);

		const minZ = Math.min(start.z, end.z);
		const maxZ = Math.max(start.z, end.z);

		const p0 = projection({ x: minX, y: minY, z: minZ });
		const p1 = projection({ x: minX, y: maxY, z: minZ });
		const p2 = projection({ x: maxX, y: maxY, z: minZ });
		const p3 = projection({ x: maxX, y: minY, z: minZ });
		const p4 = projection({ x: minX, y: minY, z: maxZ });
		const p5 = projection({ x: minX, y: maxY, z: maxZ });
		const p6 = projection({ x: maxX, y: maxY, z: maxZ });
		const p7 = projection({ x: maxX, y: minY, z: maxZ });

		tpBbox.min.x = Math.min(tpBbox.min.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
		tpBbox.min.y = Math.min(tpBbox.min.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
		tpBbox.max.x = Math.max(tpBbox.max.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
		tpBbox.max.y = Math.max(tpBbox.max.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
		bboxIsSet = true;
	},
};
let initialMoves = true;
const displayHandlers = {
	addLine: (modal, start, end) => {
		const motion = modal.motion;
		if (motion === "G0") {
			tp.strokeStyle = initialMoves ? "red" : "green";
		} else {
			tp.strokeStyle = "black";
			// Don't cancel initialMoves on no-motion G1 (e.g. G1 F30)
			// or on Z-only moves
			if (start.x !== end.x || start.y !== end.y) {
				initialMoves = false;
			}
		}

		const ps = projection(start);
		const pe = projection(end);
		tp.beginPath();
		// tp.moveTo(start.x, start.y);
		// tp.lineTo(end.x, end.y);
		tp.moveTo(ps.x, ps.y);
		tp.lineTo(pe.x, pe.y);
		tp.stroke();
	},
	addArcCurve: (modal, start, end, center, extraRotations) => {
		const motion = modal.motion;

		const deltaX1 = start.x - center.x;
		const deltaY1 = start.y - center.y;
		const radius = Math.hypot(deltaX1, deltaY1);
		const deltaX2 = end.x - center.x;
		const deltaY2 = end.y - center.y;
		const theta1 = Math.atan2(deltaY1, deltaX1);
		let theta2 = Math.atan2(deltaY2, deltaX2);
		const cw = modal.motion === "G2";
		if (!cw && theta2 < theta1) {
			theta2 += Math.PI * 2;
		} else if (cw && theta2 > theta1) {
			theta2 -= Math.PI * 2;
		}
		if (theta1 === theta2) {
			theta2 += Math.PI * (cw ? -2 : 2);
		}
		if (extraRotations > 1) {
			theta2 += (extraRotations - 1) * Math.PI * (cw ? -2 : 2);
		}

		initialMoves = false;

		tp.beginPath();
		tp.strokeStyle = "black";
		deltaTheta = theta2 - theta1;
		n = 10 * Math.ceil(Math.abs(deltaTheta) / Math.PI);
		dt = deltaTheta / n;
		dz = (end.z - start.z) / n;
		const ps = projection(start);
		tp.moveTo(ps.x, ps.y);
		next = {};
		let theta = theta1;
		next.z = start.z;
		for (i = 0; i < n; i++) {
			theta += dt;
			next.x = center.x + radius * Math.cos(theta);
			next.y = center.y + radius * Math.sin(theta);
			next.z += dz;
			pe = projection(next);
			tp.lineTo(pe.x, pe.y);
		}
		tp.stroke();
	},
};

class ToolpathDisplayer {
	// var offset;
	clear() { clearCanvas(); }
	showToolpath(gcode,
		modal,
		initialPosition) {
		cameraAngle = cameraAngle || 0;

		let drawBounds = false;
		let drawBelts = false;

		switch (cameraAngle) {
			case 0:
				obliqueView();
				break;
			case 1:
				obliqueView();
				drawBounds = true;
				break;
			case 2:
				topView();
				break;
			case 3:
				topView();
				drawBounds = true;
				break;
			case 4:
				topView();
				drawBounds = true;
				drawBelts = true;
				break;
			default:
				obliqueView();
		}

		resetBbox();
		bboxHandlers.position = initialPosition;
		bboxHandlers.modal = modal;

		if (drawBounds) {
			drawMachineBounds(); //Adds the machine bounds to the bounding box...this does not draw
		}
		if (drawBelts) {
			drawMachineBelts(); //Adds the belts to the bounding box...does not draw yet
		}

		const gcodeLines = gcode.split("\n");
		new Toolpath(bboxHandlers).loadFromLinesSync(gcodeLines);
		transformCanvas();
		if (!bboxIsSet) {
			return;
		}
		initialMoves = true;
		displayHandlers.position = initialPosition;
		const common = new Common();
		displayHandlers.modal = common.modal;
		new Toolpath(displayHandlers).loadFromLinesSync(gcodeLines);

		drawTool(initialPosition);

		if (drawBounds) {
			drawMachineBounds(); //Actually draws the bounding box
		}
		if (drawBelts) {
			drawMachineBelts(); //Actually draws the belts
		}
	}
	reDrawTool(modal, dpos) {
		if (toolSave != null) {
			tp.putImageData(toolSave, toolX, toolY);
			drawTool(dpos);
		}
	}
	cycleCameraAngle(gcode, position) {
		cameraAngle = cameraAngle + 1;
		if (cameraAngle > 4) {
			cameraAngle = 0;
		}

		const common = new Common();
		displayer.showToolpath(gcode, common.modal, position);
	}
}

const displayer = new ToolpathDisplayer();

/** Expects a simple array with 3 elements, and converts it to an xyz object */
const arrayToXYZ = (arr) => {
	return { x: arr[0], y: arr[1], z: arr[2] };
};

const updateGcodeViewerAngle = () => {
	const gcode = id("tablettab_gcode").value;
	displayer.cycleCameraAngle(gcode, arrayToXYZ(WPOS()));
};

if (tpc) {
	tpc.addEventListener("mouseup", updateGcodeViewerAngle);
}

const refreshGcode = () => {
	const gcode = getValue("tablettab_gcode");
	// This call has one too many parameters, no idea how it was supposed to work
	displayer.showToolpath(gcode, WPOS(), MPOS(), cameraAngle);
};

// id("small-toolpath").addEventListener("mouseup", updateGcodeViewerAngle);

export { arrayToXYZ, displayer, refreshGcode };
