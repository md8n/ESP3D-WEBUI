import { beforeEach, describe, expect, test } from "bun:test";
import {
  MaslowErrMsgNoKey,
  MaslowErrMsgNoValue,
  MaslowErrMsgNoMatchingKey,
  MaslowErrMsgKeyValueCantUse,
  MaslowErrMsgKeyValueSuffix,
  maslowMsgHandling
} from "../maslow";

describe('maslowMsgHandling', () => {
  beforeEach(() => {
    // Set up the DOM elements and initial values
    document.body.innerHTML = `
              <input id="gridSize" value="" />
              <input id="gridWidth" value="" />
              <input id="gridHeight" value="" />
              <input id="retractionForce" value="" />
              <input id="machineOrientation" value="" />
              <input id="machineWidth" value="" />
              <input id="machineHeight" value="" />
          `;
    global.loadedValues = {};
    global.initialGuess = {
      tr: { x: 0, y: 0, z: 0 },
      tl: { x: 0, y: 0, z: 0 },
      br: { x: 0, y: 0, z: 0 },
      bl: { x: 0, y: 0, z: 0 }
    };
    global.acceptableCalibrationThreshold = 0.5;
  });

  const inputValidation = [
    ["invalidMessage", `${MaslowErrMsgKeyValueCantUse} ${MaslowErrMsgKeyValueSuffix}invalidMessage`],
    ["=value", `${MaslowErrMsgNoKey} ${MaslowErrMsgKeyValueSuffix}=value`],
    ["key=", `${MaslowErrMsgNoValue} ${MaslowErrMsgKeyValueSuffix}key=`],
    ["unknownKey=value", `${MaslowErrMsgNoMatchingKey} ${MaslowErrMsgKeyValueSuffix}unknownKey=value`],
  ];

  test.each(inputValidation)("Input %p results in %p", (inp, expected) => {
    const result = maslowMsgHandling(inp);
    expect(result).toBe(expected);
  });

  const stdActions = [
    ["calibration_grid_size", "10", "gridSize"],
    ["calibration_grid_width_mm_X", "2000", "gridWidth"],
    ["calibration_grid_height_mm_Y", "1000", "gridHeight"],
    ["Retract_Current_Threshold", "1500", "retractionForce"],
  ];

  const noErrorResult = (key, value) => {
    const result = maslowMsgHandling(`${key}=${value}`);
    expect(result).toBe("");
  }

  test.each(stdActions)("Key %p sets value %p into %p", (key, value, outputValueName) => {
    noErrorResult(key, value);
    expect(global.loadedValues[outputValueName]).toBe(value);
  });

  const orientationActions = [
    ["vertical", "false", "machineOrientation", "horizontal"],
    ["vertical", "true", "machineOrientation", "vertical"],
    ["vertical", "something else", "machineOrientation", "vertical"],
  ];

  test.each(orientationActions)("Key %p with value %p sets %p to %p", (key, value, outputValueName, outputValue) => {
    noErrorResult(key, value);
    expect(global.loadedValues[outputValueName]).toBe(outputValue);
  });

  const setDim = (key, value, outDim, outValue) => {
    noErrorResult(key, value);
    if (typeof outValue === "undefined") {
      outValue = parseFloat(value);
    }
    if (Array.isArray(outDim)) {
      expect(global.initialGuess[outDim[0]][outDim[1]]).toBe(outValue);
    } else {
      expect(global[outDim]).toBe(outValue);
    }
  };

  const fullDimensionActions = [
    ["trX", "3000", "machineWidth", ["tr", "x"]],
    ["trY", "2000", "machineHeight", ["tr", "y"]],
  ];

  test.each(fullDimensionActions)("Key %p with value %p sets %p and %p.%p as well", (key, value, outputValueName, outDim) => {
    setDim(key, value, outDim, undefined);
    expect(global.loadedValues[outputValueName]).toBe(value);
  });

  const stdDimensionActions = [
    ["trZ", "50", ["tr", "z"]],
    ["tlX", "20", ["tl", "x"]],
    ["tlY", "10", ["tl", "y"]],
    ["tlZ", "40", ["tl", "z"]],
    ["brX", "20", ["br", "x"]],
    ["brY", "15", ["br", "y"], 0],
    ["brZ", "40", ["br", "z"]],
    ["blX", "16", ["bl", "x"], 0],
    ["blY", "17", ["bl", "y"], 0],
    ["blZ", "70", ["bl", "z"]],
    ["Acceptable_Calibration_Threshold", "1500", "acceptableCalibrationThreshold"],
  ];

  test.each(stdDimensionActions)("Key %p with value %p sets %p", (key, value, outDim, outValue = undefined) => {
    setDim(key, value, outDim, outValue);
  });
});
