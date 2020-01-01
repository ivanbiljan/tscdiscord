"use strict";
exports.__esModule = true;
function random(min, max) {
    if (min > max) {
        var temp = min;
        min = max;
        max = temp;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.random = random;
function isStringNullOrWhitespace(str) {
    return !str || !/\S/.test(str);
}
exports.isStringNullOrWhitespace = isStringNullOrWhitespace;
