"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getWeeks(d) {
    const t = d.getTime();
    // a week is from sunday to saturday.
    return Math.floor((t / 86400000 + 4) / 7);
    // if a week is from monday to sunday.
    // return Math.floor((t / 3600 / 24 / 1000 + 3) / 7);
}
exports.getWeeks = getWeeks;
function parseDate(d) {
    if (!d) {
        return 0;
    }
    else if (typeof d === 'string') {
        return Date.parse(d);
    }
    else {
        if (d % 1000 === 0) {
            return d;
        }
        else {
            // second to milliseconds
            return d * 1000;
        }
    }
}
exports.parseDate = parseDate;
const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getDay(d) {
    return weekday[new Date(d).getUTCDay()];
}
exports.getDay = getDay;
function getDateString(d) {
    d = new Date(d);
    return `${getDay(d)}, ${d.getUTCFullYear()}, ${d.getUTCMonth()}, ${d.getDate()}`;
}
exports.getDateString = getDateString;
exports.default = {
    getDay,
    getDateString,
    getWeeks,
    parseDate,
};
//# sourceMappingURL=date.js.map