/*
 index.js - ESP3D WebUI Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
import { h } from "preact";
import { Parser } from "./parser";
import { Fan, Bed, FeedRate, FlowRate, Extruder } from "./icons";
import { FilesPanelElement } from "../../../Panel/Files";
import { MacrosPanelElement } from "../../../Panel/Macros";
import { TerminalPanelElement } from "../../../Panel/Terminal";

const Target = "Marlin";
const Name = "ESP3D";
const fwUrl = "https://github.com/luc-github/ESP3D/tree/3.0";
const iconsTarget = {
  Fan: <Fan />,
  Bed: <Bed />,
  FeedRate: <FeedRate />,
  FlowRate: <FlowRate />,
  Extruder: <Extruder />,
};

const defaultPanelsList = [
  FilesPanelElement,
  TerminalPanelElement,
  MacrosPanelElement,
];

const restartdelay = 30;

const processData = (type, content) => {
  //the parser need to be here
  console.log(type, ":", content);
};

export {
  Target,
  Parser,
  fwUrl,
  Name,
  iconsTarget,
  restartdelay,
  defaultPanelsList,
  processData,
};
