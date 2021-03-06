'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */
function regex($filter) {
  return function(input, field, regex) {
    if (!input) {
      return [];
    }
    var pattern = null;
    var out = [];
    try {
      pattern = new RegExp(regex);
    } catch (e) {
      return input;
    }

    for (var i = 0; i < input.length; i++) {
      var entry = input[i];
      var value;
      if (field === null) {
        // for flat string arrays there is no key, so allow a 'null' field to
        // signal values should be used directly
        value = entry;
      } else {
        value = entry[field];
      }

      if (pattern.test(value)) {
        out.push(input[i]);
      }
    }
    return out;
  };
}

filtersModule.filter('regex', regex);
