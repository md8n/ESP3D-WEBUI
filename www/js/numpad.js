var numpad = {
  // (A) CREATE NUMPAD HTML
  hwrap: null, // numpad wrapper container
  hpad: null, // numpad itself
  hdisplay: null, // number display
  hbwrap: null, // buttons wrapper
  hbuttons: {}, // individual buttons
  init: function(){
    // (A1) WRAPPER
    numpad.hwrap = document.createElement("div");
    numpad.hwrap.id = "numWrap";


    // (A2) ENTIRE NUMPAD ITSELF
    numpad.hpad = document.createElement("div");
    numpad.hpad.id = "numPad";
    numpad.hwrap.appendChild(numpad.hpad);
    numpad.hpad.tabindex = "0";
    numpad.hpad.contentEditable = true;
    numpad.hpad.addEventListener("keydown", numpad.keypr);
    
    // (A3) DISPLAY
    numpad.hdisplay = document.createElement("input");
    numpad.hdisplay.id = "numDisplay";
    numpad.hdisplay.type = "text";
    numpad.hdisplay.disabled = true;
    numpad.hdisplay.value = "0";
    numpad.hpad.appendChild(numpad.hdisplay);



    // (A4) NUMBER BUTTONS
    numpad.hbwrap = document.createElement("div");
    numpad.hbwrap.id = "numBWrap";
    numpad.hpad.appendChild(numpad.hbwrap);

    // (A5) BUTTONS
    var buttonator = function (txt, css, fn) {
      var button = document.createElement("div");
      button.innerHTML = txt;
      button.classList.add(css);
      button.addEventListener("click", fn);
      numpad.hbwrap.appendChild(button);
      numpad.hbuttons[txt] = button;
    };

    var spacer = function() {
      buttonator("", "spacer", null);
    }          

    // First row
    // 7 to 9
    for (var i=7; i<=9; i++) { buttonator(i, "num", numpad.digit); }
    buttonator("&#10502;", "del", numpad.delete);
    spacer();
    buttonator("Goto", "goto", numpad.gotoCoordinate);


    // Second row
    // 4 to 6
    for (var i=4; i<=6; i++) { buttonator(i, "num", numpad.digit); }
    buttonator("C", "clr", numpad.reset);
    spacer();
    spacer();

    // Third row
    // 1 to 3
    for (var i=1; i<=3; i++) { buttonator(i, "num", numpad.digit); }
    spacer();
    buttonator("Set", "set", numpad.setCoordinate);


    buttonator(0, "zero", numpad.digit);
    buttonator(".", "dot", numpad.dot);
    buttonator("Get", "get", numpad.recall);
    buttonator("Cancel", "cxwide", numpad.hide);


    // (A6) ATTACH NUMPAD TO HTML BODY
    document.body.appendChild(numpad.hwrap);
  },

  // (B) BUTTON ACTIONS
  // (B1) CURRENTLY SELECTED FIELD + MAX LIMIT
  nowTarget: null, // Current selected input field
  nowMax: 0, // Current max allowed digits
  
  keypr: function(event) {
          event.preventDefault();
          switch(event.key) {
          case "Escape":
          case "q":
              numpad.hide();
              break;
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
              numpad.digitv(event.key);
              break;
          case '.':
              numpad.dot();
              break;
          case 'Backspace':
          case 'Del':
              numpad.delete();
              break;
          case 'x':
          case 'X':
              numpad.reset();
              break;
          case 'c':
          case 'C':
              numpad.reset();
              break;
          case 'g':
          case 'G':
              numpad.recall();
              break;
          case 's':
          case 'S':
          case 'Enter':
              numpad.setCoordinate();
              break;
          }
      },

  // (B2) NUMBER (0 TO 9)

    digitv: function(n) {
        var current = numpad.hdisplay.value;
        if (current.length < numpad.nowMax) {
            if (current=="0") {
                numpad.hdisplay.value = n;
            } else {
                numpad.hdisplay.value += n;
            }
        }
    },

    digit: function() {
        numpad.digitv(this.innerHTML);
    },

  // ADD DECIMAL POINT
  dot: function(){
    if (numpad.hdisplay.value.indexOf(".") == -1) {
      if (numpad.hdisplay.value=="0") {
        numpad.hdisplay.value = "0.";
      } else {
        numpad.hdisplay.value += ".";
      }
    }
  },

  // BACKSPACE
  delete: function(){
    var length = numpad.hdisplay.value.length;
    if (length == 1) { numpad.hdisplay.value = 0; }
    else { numpad.hdisplay.value = numpad.hdisplay.value.substring(0, length - 1); }
  },

  // (B5) CLEAR ALL
  reset: function(){ numpad.hdisplay.value = "0"; },

  // (B6) Recall
  recall: function(){
    numpad.hdisplay.value = numpad.nowTarget.value;
  },

  setCoordinate: function(){
    numpad.nowTarget.value = numpad.hdisplay.value;
    setAxis(numpad.nowTarget.dataset.axis, numpad.nowTarget.dataset.elementName);
    numpad.hide();
  },

  gotoCoordinate: function(){
    numpad.nowTarget.value = numpad.hdisplay.value;
    moveAxis(numpad.nowTarget.dataset.axis, numpad.nowTarget.dataset.elementName);
    numpad.hide();
  },

  // (C) ATTACH NUMPAD TO INPUT FIELD
  attach: function(opt){
  // OPTIONS
  //  target: required, ID of target field.
  //  max: optional, maximum number of characters. Default 255.
  //  decimal: optional, allow decimal? Default true.

    // (C1) DEFAULT OPTIONS
    if (opt.max === undefined) { opt.max = 255; }
    if (opt.decimal === undefined) { opt.decimal = true; }
    
    // (C2) GET + SET TARGET OPTIONS
    var target = document.getElementById(opt.target);
    target.readOnly = true;
    target.dataset.max = opt.max;
    target.dataset.decimal = opt.decimal;
    target.dataset.axis = opt.axis;
    target.dataset.elementName = opt.target;
    target.addEventListener("click", numpad.show);
  },

  // (D) SHOW NUMPAD
  show: function() {


    // (D1) SET CURRENT DISPLAY VALUE
    //var cv = this.value;
    var cv = "";
    if (cv == "") { cv = "0"; }
    numpad.hdisplay.value = cv;

    // (D2) SET MAX ALLOWED CHARACTERS
    numpad.nowMax = this.dataset.max;

    // (D3) SET DECIMAL
    if (this.dataset.decimal == "true") {
      numpad.hbwrap.classList.remove("noDec");
    } else {
      numpad.hbwrap.classList.add("noDec");
    }

    // (D4) SET CURRENT TARGET
    numpad.nowTarget = this;

    // (D5) SHOW NUMPAD
    numpad.hwrap.classList.add("open"); 

    numpad.hpad.focus();
  },

  // (E) HIDE NUMPAD
  hide: function(){ numpad.hwrap.classList.remove("open"); },
};
window.addEventListener("DOMContentLoaded", numpad.init);
