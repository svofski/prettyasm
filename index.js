#!/usr/bin/env node 

var fs = require('fs');
var pasm = require('./pasm');

var inputFile, lstFile, hexFile;
try {
    inputFile = process.argv[2].trim();
    lstFile = process.argv[3].trim();
    hexFile = process.argv[4].trim();

    if (lstFile.length === 0 || hexFile.length === 0 || inputFile.length === 0) {
        throw "numberwang";
    }
} catch (numberwang) {
    console.log('Usage: node pasm.js input.asm listing.html hex.hex');
    process.exit(0);
}

var asm = pasm.PrettyAsm(inputFile);

fs.writeFileSync(lstFile, asm[1]);
fs.writeFileSync(hexFile, asm[2]);

