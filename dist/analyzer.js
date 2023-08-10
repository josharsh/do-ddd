"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFiles = void 0;
const ts_morph_1 = require("ts-morph");
const fs = require("fs");
function analyzeFiles() {
    const project = new ts_morph_1.Project();
    const files = fs.readdirSync(process.cwd());
    let verbIdentifier = "";
    files.forEach((file) => {
        var _a;
        const regex = /I([A-Za-z]+)Request\.ts/;
        const match = file.match(regex);
        // const match = file.match(/I[A-Za-z]+Request\.ts$/);
        if (match) {
            const extractedName = match[1];
            const requestFile = project.addSourceFileAtPath(file);
            const requestClassName = ((_a = requestFile.getClasses()[0]) === null || _a === void 0 ? void 0 : _a.getName()) || "1";
            verbIdentifier = extractedName;
        }
    });
    return verbIdentifier;
}
exports.analyzeFiles = analyzeFiles;
