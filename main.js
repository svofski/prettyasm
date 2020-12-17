#!/usr/bin/env node 

var fs = require('fs');
var assembler = require('./assembler');

var inputFile, lstFile, binFile;

var symbols = {};

var parsedefine = function(v) {
    var parts = v.split('=');
    if (parts.length == 2) {
        symbols[parts[0]] = parts[1];
    }
    else {
        symbols[parts[0]] = 0;
    }
};

try {
    var borrow = null;
    for (var i = 2; i < process.argv.length; ++i) {
        var arg = process.argv[i].trim();
        if (borrow) {
            borrow(arg);
            borrow = null;
            continue;
        }

        if (arg[0] == '-') {
            switch (arg[1]) {
                case 'D':
                    if (arg.length == 2) {
                        borrow = parsedefine;
                    }
                    else {
                        parsedefine(arg.slice(2));
                    }
                    break;
            }
        }
        else {
            if (inputFile === undefined) {
                inputFile = arg;
            }
            else if (binFile === undefined) {
                binFile = arg;
            }
            else if (lstFile === undefined) {
                lstFile = arg;
            }
        }
    }
    if (!inputFile) throw "numberwang";

    if (!binFile) {
        binFile = inputFile.replace(/.asm$/, "") + ".bin";
    }

    if (!lstFile) {
        lstFile = inputFile.replace(/.asm$/, "") + ".lst";
    }
}
catch (numberwang) {
    console.log("Usage " + process.argv[0] + 
        " [-DSYM=VAL] input.asm output.bin [input.lst]");
    process.exit(0);
}

// insert .includes 
function readInput(filename, defines = {}) {
    var fs = require("fs");
    var src = fs.readFileSync(filename, "utf8");
    var inputlines = src.split('\n');
    var result = "";
    for (const [k,v] of Object.entries(defines)) {
        result += "#define " + k + " " + v + "\n";
    }

    for (var line = 0; line < inputlines.length; line++) {
        var text = inputlines[line];
        var parts = text.split(/\s+/);

        for (var i = 0; i < parts.length; i++) {
            if (parts[i][0] == ';') {
                parts.length = i;
                break;
            }
        }

        for (;parts.length > 0;) {
            var directive = parts[0].toLowerCase();
            if (directive.length == 0) {
                parts = parts.slice(1);
                continue;
            }

            if (directive === ".include") {
                if (parts[1] !== undefined && parts[1].trim().length > 0) {
                    includeFileName = parts[1].replace(/^"|"$/g, '');
                    text = "\n;;; include " + includeFileName + " begin\n"
                    text += readInput(includeFileName);
                    text += "\n;;; include " + includeFileName + " end\n"
                }
            }
            break;
        }
        result += text + "\n";
   }

   return result;
}

var asm = assembler.Assembler();
input = readInput(inputFile, symbols);
var listobj = {};
asm.assemble(input, listobj);
fs.writeFileSync(lstFile, listobj.text);

var start = asm.org;
var end = asm.mem.length;
var data = new Uint8Array(asm.mem.length);
for (var i = start, end = data.length; i < end; ++i) {
    data[i] = asm.mem[i];
}
fs.writeFileSync(binFile, data.slice(start, end));

