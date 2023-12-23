var input = require("./input/mappingsInput.json");
// Ignore the `script` part of the input - use the `script.js` instead
var mappingStep = require("./mappingScript").step;
var partTypeStep = require("./mappingPartTypeScript").step;

// Add in the global variables
global._ = require("lodash");
global.mout = require("mout");
global.moment = require("moment");
global.fs = require("fs");

var variables = {};
input.variables.forEach(function (variable) {
  variables[variable.name] = variable.value;
});

console.log(mappingStep(variables));
console.log(partTypeStep(variables));
