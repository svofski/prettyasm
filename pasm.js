//
// Pretty 8080 Assembler
// 
// Send comments to svofski at gmail dit com 
// 
// Copyright (c) 2009 Viacheslav Slavinsky
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//
// Translation help:
// Leonid Kirillov, Alexander Timoshenko, Upi Tamminen,
// Cristopher Green, Nard Awater, Ali Asadzadeh,
// Guillermo S. Romero, Anna Merkulova, Stephan Henningsen
// 
// Revison Log
// Rev.A: Initial release
// Rev.B: A lot of fixes to compile TINIDISK.ASM by Dr. Li-Chen Wang
// Rev.C: Performance optimizations and cleanup, labels->hash
// Rev.D: More syntax fixes; opera navigation and Back Button Toolbar
// Rev.E: Navigation to label references (backref menu)
//        Nice labels table
//        Some Opera-related fixes
// Rev.F: fixed '.' and semi-colon in db
//        tab scroll fixed
// Rev.G: $ can now work as hex prefix
// Rev.H: Fixed spaces in reg-reg, .binfile, .hexfile
// Rev.I: Fixed bug in evaluation of hex literals ending with d
// Rev.J: Backport from offline version: register highlighting
// Rev.K: Target encodings support
//
// TODO: evaluation should ignore precedence, it's all left-to-right
//

// -- global DOM elements

var debug = false;

var debugOut = '';

var inTheOpera = false;

var binFileName = 'test.bin';
var hexFileName = 'test.hex';
var downloadFormat = 'bin';
var objCopy = 'gobjcopy';
var postbuild = '';
var doHexDump = true;
var targetEncoding = 'koi8-r';

// -- encodings.js --
// example python line to get encoding mapping
// ''.join(map(chr, range(256))).decode('koi8-r', 'replace')
var
  encodings = {
    'koi8-r': '\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\u2500\u2502\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c\u2580\u2584\u2588\u258c\u2590\u2591\u2592\u2593\u2320\u25a0\u2219\u221a\u2248\u2264\u2265\xa0\u2321\xb0\xb2\xb7\xf7\u2550\u2551\u2552\u0451\u2553\u2554\u2555\u2556\u2557\u2558\u2559\u255a\u255b\u255c\u255d\u255e\u255f\u2560\u2561\u0401\u2562\u2563\u2564\u2565\u2566\u2567\u2568\u2569\u256a\u256b\u256c\xa9\u044e\u0430\u0431\u0446\u0434\u0435\u0444\u0433\u0445\u0438\u0439\u043a\u043b\u043c\u043d\u043e\u043f\u044f\u0440\u0441\u0442\u0443\u0436\u0432\u044c\u044b\u0437\u0448\u044d\u0449\u0447\u044a\u042e\u0410\u0411\u0426\u0414\u0415\u0424\u0413\u0425\u0418\u0419\u041a\u041b\u041c\u041d\u041e\u041f\u042f\u0420\u0421\u0422\u0423\u0416\u0412\u042c\u042b\u0417\u0428\u042d\u0429\u0427\u042a',
    'koi8-u': '\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\u2500\u2502\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c\u2580\u2584\u2588\u258c\u2590\u2591\u2592\u2593\u2320\u25a0\u2219\u221a\u2248\u2264\u2265\xa0\u2321\xb0\xb2\xb7\xf7\u2550\u2551\u2552\u0451\u0454\u2554\u0456\u0457\u2557\u2558\u2559\u255a\u255b\u0491\u255d\u255e\u255f\u2560\u2561\u0401\u0404\u2563\u0406\u0407\u2566\u2567\u2568\u2569\u256a\u0490\u256c\xa9\u044e\u0430\u0431\u0446\u0434\u0435\u0444\u0433\u0445\u0438\u0439\u043a\u043b\u043c\u043d\u043e\u043f\u044f\u0440\u0441\u0442\u0443\u0436\u0432\u044c\u044b\u0437\u0448\u044d\u0449\u0447\u044a\u042e\u0410\u0411\u0426\u0414\u0415\u0424\u0413\u0425\u0418\u0419\u041a\u041b\u041c\u041d\u041e\u041f\u042f\u0420\u0421\u0422\u0423\u0416\u0412\u042c\u042b\u0417\u0428\u042d\u0429\u0427\u042a',
    'cp866': '\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041a\u041b\u041c\u041d\u041e\u041f\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042a\u042b\u042c\u042d\u042e\u042f\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043a\u043b\u043c\u043d\u043e\u043f\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255d\u255c\u255b\u2510\u2514\u2534\u252c\u251c\u2500\u253c\u255e\u255f\u255a\u2554\u2569\u2566\u2560\u2550\u256c\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256b\u256a\u2518\u250c\u2588\u2584\u258c\u2590\u2580\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044a\u044b\u044c\u044d\u044e\u044f\u0401\u0451\u0404\u0454\u0407\u0457\u040e\u045e\xb0\u2219\xb7\u221a\u2116\xa4\u25a0\xa0',
    'latin1': '\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff'
  }

function toEncoding(str, encoding) {
  var table = encodings[encoding];
  var strlen = str.length;
  var encoded = new Array(strlen);
  for (var i = 0; i < strlen; i++) {
    var c = table.indexOf(str.charAt(i));
    if (c == null) c = 255;
    encoded[i] = String.fromCharCode(c);
  }
  return encoded.join('');
}
// -- end of encodings.js --


// -- utility stuffs --
function fromBinary(val) {
    x = 0;
    n = 1;
    for (i = val.length - 1; i >= 0; i--) {
        if (val[i] == '1')
            x += n;
        else if (val[i] != '0') 
            return Number.NaN;
        n *= 2;
    }

    return new Number(x);
}

function char8(val) {
    if (val > 32 && val < 127) return String.fromCharCode(val);
    return '.';
}

function hex8(val) {
    if (val < 0 || val > 255)  return "??";

    var hexstr = "0123456789ABCDEF";
    return hexstr[(val & 0xf0) >> 4] + hexstr[val & 0x0f];
}

function hex16(val) {
    return hex8((val & 0xff00) >> 8) + hex8(val & 0x00ff);
}

function isValidIm16(s) {
    return s != null && s.length > 0;
}

function isValidIm8(s) {
    return s != null && s.length > 0;
}

function isWhitespace(c) {
    return c=='\t' || c == ' ';// this is too slow c.match(/\s/);
}

function toTargetEncoding(str, encoding) {
	return toEncoding(str, encoding);
}

Array.prototype.indexOf = function (element) {
    for (var i = 0; i < this.length; i++) {
          if (this[i] == element) {
              return i;
          }
    }
    return -1;
};

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.endsWith = function(c) { return this[this.length-1] == c; };
String.prototype.startsWith = function(s) {return (this.match("^"+s)==s); }

// -- Assembler --

var ops0 = {
"nop": "00",
"hlt":  "76",
"ei":   "fb",
"di":   "f3",
"sphl": "f9",
"xchg": "eb",
"xthl": "e3",
"daa":  "27",
"cma":  "2f",
"stc":  "37",
"cmc":  "3f",
"rlc":  "07",
"rrc":  "0f",
"ral":  "17",
"rar":  "1f",
"pchl": "e9",
"ret":  "c9",
"rnz":  "c0",
"rz":   "c8",
"rnc":  "d0",
"rc":   "d8",
"rpo":  "e0",
"rpe":  "e8",
"rp":   "f0",
"rm":   "f8"
};

var opsIm16 = {
"lda":  "3a",
"sta":  "32",
"lhld": "2a",
"shld": "22",
"jmp":  "c3",
"jnz":  "c2",
"jz":   "ca",
"jnc":  "d2",
"jc":   "da",
"jpo":  "e2",
"jpe":  "ea",
"jp":   "f2",
"jm":   "fa",
"call": "cd",
"cnz":  "c4",
"cz":   "cc",
"cnc":  "d4",
"cc":   "dc",
"cpo":  "e4",
"cpe":  "ec",
"cp":   "f4",
"cm":   "fc"
};

// lxi rp, im16
var opsRpIm16 = {
"lxi":  "01"    // 00rp0001, bc=00, de=01,hl=10, sp=11
};

// adi 33, out 10
var opsIm8 = {
"adi":  "c6",
"aci":  "ce",
"sui":  "d6",
"sbi":  "de",
"ani":  "e6",
"xri":  "ee",
"ori":  "f6",
"cpi":  "fe",
"in":   "0db",
"out":  "d3"
};

var opsRegIm8 = {
"mvi":  "06"
};

var opsRegReg = {
"mov":  "40"
};

var opsReg = {
"add": "80", // regsrc
"adc": "88",
"sub": "90",
"sbb": "98",
"ana": "a0",
"xra": "a8",
"ora": "b0",
"cmp": "b8",

"inr": "04", // regdst (<<3)
"dcr": "05"
};

// these are the direct register ops, regdst
var opsRegDst = new Array("inr", "dcr");

var opsRp = {
"ldax": "0A", // rp << 4 (only B, D)
"stax": "02", // rp << 4 (only B, D)
"dad":  "09", // rp << 4
"inx":  "03", // rp << 4
"dcx":  "0b", // rp << 4
"push": "c5", // rp << 4
"pop":  "c1" // rp << 4
};


var LabelsCount = 0;
var labels = new Object();

var resolveTable = Array(); // label negative id, resolved address
var mem = Array();
var textlabels = Array();
var references = Array();
var errors = Array();

var regUsage = Array();

function clearLabels() {
    LabelsCount = 0;
    labels = new Object();
}

function resolveNumber(identifier) {
    if (identifier == undefined || identifier.length == 0) return;
    
    if ((identifier[0] == "'" || identifier[0] == "'")
        && identifier.length == 3) {
        return (0xff & identifier.charCodeAt(1));
    }

    if (identifier[0] == '$') {
        identifier = "0x" + identifier.substr(1, identifier.length-1);
    }

    if ("0123456789".indexOf(identifier[0]) != -1) {
        var test;
        test = new Number(identifier);
        if (!isNaN(test)) {
            return test;
        }

        var suffix = identifier[identifier.length-1].toLowerCase();
        switch (suffix) {
        case 'd':
            test = new Number(identifier.substr(0, identifier.length-1));
            if (!isNaN(test)) {
                return test;
            }
            break;
        case 'h':
            test = new Number("0x" + identifier.substr(0, identifier.length-1));
            if (!isNaN(test)) {
                return test;
            }
            break;
        case 'b':
            test = fromBinary(identifier.substr(0, identifier.length-1));
            if (!isNaN(test)) {
                return test;
            }
            break;
        case 'q':
            try {
                var oct = identifier.substr(0, identifier.length-1);
                for (var i = oct.length; --i >= 0;) {
                    if (oct[i] == '8' || oct[i] == '9') return -1;
                }
                return new Number(
                    eval('0' + identifier.substr(0, identifier.length-1)));
            } catch(err) {}
            break;
        }
    }
    return -1;
}

function referencesLabel(identifier, linenumber) {
    identifier = identifier.toLowerCase();
    if (references[linenumber] == undefined) {
        references[linenumber] = identifier;
    }
}

function markLabel(identifier, address, linenumber, override) {
    identifier = identifier.replace(/\$([0-9a-fA-F]+)/, '0x$1');
    identifier = identifier.replace(/(^|[^'])(\$|\.)/, ' '+address+' ');
    var number = resolveNumber(identifier.trim());
    if (number != -1) return number;
    
    if (linenumber == undefined) {
        LabelsCount++;
        address = -1 - LabelsCount;
    }

    identifier = identifier.toLowerCase();
    
    var found = labels[identifier];
    if (found != undefined) {
        if (address >= 0) {
            resolveTable[-found] = address;
        } else {
            address = found;
        }
    }

    if (!found || override) {
        labels[identifier] = address;
    }

    if (linenumber != undefined) {
        textlabels[linenumber] = identifier;
    }
    
    return address;
}

function setmem16(addr, immediate) {
    if (immediate >= 0) {
        mem[addr] = immediate & 0xff;
        mem[addr+1] = immediate >> 8;
    } else {
        mem[addr] = immediate;
        mem[addr+1] = immediate;
    }
}

function setmem8(addr, immediate) {
    mem[addr] = immediate < 0 ? immediate : immediate & 0xff;
}

function parseRegisterPair(s) {
    if (s != undefined) {
        s = s.split(';')[0].toLowerCase();
        if (s == 'b' || s == 'bc') return 0;
        if (s == 'd' || s == 'de') return 1;
        if (s == 'h' || s == 'hl') return 2;
            if (s == 'sp'|| s == 'psw' || s == 'a') return 3;
    }
    return -1;
}

// b=000, c=001, d=010, e=011, h=100, l=101, m=110, a=111
function parseRegister(s) {
    if (s == undefined) return -1;
    if (s.length > 1) return -1;
    s = s.toLowerCase();
    return "bcdehlma".indexOf(s[0]);
}

function tokenDBDW(s, addr, len, linenumber) {
    var size = -1;

    if (s.length == 0) return 0;

    n = markLabel(s, addr);
    referencesLabel(s, linenumber);

    if (len == undefined) len = 1;

    if (len == 1 && n < 256) {
        setmem8(addr, n);
        size = 1;
    } else if (len == 2 && n < 65536) {
        setmem16(addr, n); 
        size = 2;
    }

    return size;
}

function tokenString(s, addr, linenumber) {
    for (var i = 0; i < s.length; i++) {
        setmem8(addr+i, s.charCodeAt(i));
    }
    return s.length;
}

function parseDeclDB(args, addr, linenumber, dw) {
    var text = args.slice(1).join(' ');
    var arg = "";
    var mode = 0;
    var cork = false;
    var nbytes = 0;

    for (var i = 0; i < text.length; i++) {
        switch (mode) {
        case 0:
            if (text[i] == '"' || text[i] == "'") {
                mode = 1; cork = text[i];
                break;
            } else if (text[i] == ',') {
                var len = tokenDBDW(arg, addr+nbytes, dw, linenumber);
                if (len < 0) {
                    return -1;
                }
                nbytes += len;
                arg = "";
            } else if (text[i] == ';') {
                i = text.length;
                break;
            } else {
                arg += text[i];
            }
            break;
        case 1:
            if (text[i] != cork) {
                arg += text[i]; 
            } else {
                cork = false;
                mode = 0;
                len = tokenString(arg, addr+nbytes, linenumber);
                if (len < 0) {
                    return -1;
                }
                nbytes += len;
                arg = "";
            }
            break; 
        }
    }
    if (mode == 1) return -1;    // unterminated string
    var len = tokenDBDW(arg, addr+nbytes, dw, linenumber);
    if (len < 0) return -1;
    nbytes += len;

    return nbytes;
}

function getExpr(arr) {
    var ex = arr.join(' ').trim();
    if (ex[0] == '"' || ex[0] == "'") {
        return ex;
    }
    return ex.split(';')[0];
}

function useExpr(s, addr, linenumber) {
    var expr = getExpr(s);
    if (expr == undefined || expr.trim().length == 0) return false;

    var immediate = markLabel(expr, addr);
    referencesLabel(expr, linenumber);
    return immediate;
}

function parseInstruction(s, addr, linenumber) {
    var parts = s.split(/\s+/);
        
    for (var i = 0; i < parts.length; i++) {
        if (parts[i][0] == ';') {
            parts.length = i;
            break;
        }
    }
    
    var labelTag;
    var immediate;

    for (;parts.length > 0;) {
        var opcs;
        var mnemonic = parts[0].toLowerCase();

        if (mnemonic.length == 0) {
            parts = parts.slice(1);
            continue;
        }

        // no operands
        if ((opcs = ops0[mnemonic]) != undefined) {
            mem[addr] = new Number("0x" + opcs);
            if (mnemonic == "xchg") {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#'; 
                regUsage[linenumber][1] = 'h'; 
                regUsage[linenumber][2] = 'l'; 
                regUsage[linenumber][3] = 'd';                
                regUsage[linenumber][4] = 'e';                
            } else if (mnemonic == "sphl" || mnemonic == "xthl") {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#';
                regUsage[linenumber][1] = 'sp';
                regUsage[linenumber][2] = 'h';
            } else if (["ral", "rar", "rla", "rra", "cma"].indexOf(mnemonic) != -1) {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#'; 
                regUsage[linenumber][1] = 'a'; 
            }


            return 1;
        }
        
        // immediate word
        if ((opcs = opsIm16[mnemonic]) != undefined) {
            mem[addr] = new Number("0x" + opcs);

            immediate = useExpr(parts.slice(1), addr, linenumber);

            setmem16(addr+1, immediate);

            if (["lhld", "shld"].indexOf(mnemonic) != -1) {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#'; 
                regUsage[linenumber][1] = 'h'; 
                regUsage[linenumber][2] = 'l'; 
            }
            else if (["lda", "sta"].indexOf(mnemonic) != -1) {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#'; 
                regUsage[linenumber][1] = 'a'; 
            }


            return 3;
        }
        
        // register pair <- immediate
        if ((opcs = opsRpIm16[mnemonic]) != undefined) {
            subparts = parts.slice(1).join(" ").split(",");
            if (subparts.length < 2) return -3;
            rp = parseRegisterPair(subparts[0]);
            if (rp == -1) return -3;

            mem[addr] = (new Number("0x" + opcs)) | (rp << 4);

            immediate = useExpr(subparts.slice(1), addr, linenumber);

            setmem16(addr+1, immediate);
            regUsage[linenumber] = ['@'+subparts[0].trim()];
            if (["h","d"].indexOf(subparts[0].trim()) != -1) {
                var rpmap = {"h":"l","d":"e"};
                regUsage[linenumber][1] = '#';
                regUsage[linenumber][2] = rpmap[subparts[0].trim()];
            }
            return 3;
        }

        // immediate byte       
        if ((opcs = opsIm8[mnemonic]) != undefined) {
            mem[addr] = new Number("0x" + opcs);
            immediate = useExpr(parts.slice(1), addr, linenumber);
            setmem8(addr+1, immediate);

            if (["sui", "sbi", "xri", "ori", "ani", "adi", "aci", "cpi"].indexOf(mnemonic) != -1) {
                regUsage[linenumber] = [];
                regUsage[linenumber][0] = '#'; 
                regUsage[linenumber][1] = 'a'; 
            }

            return 2;
        }

        // single register, im8
        if ((opcs = opsRegIm8[mnemonic]) != undefined) {
            subparts = parts.slice(1).join(" ").split(",");
            if (subparts.length < 2) return -2;
            reg = parseRegister(subparts[0]);
            if (reg == -1) return -2;

            mem[addr] = new Number("0x" + opcs) | reg << 3;

            immediate = useExpr(subparts.slice(1), addr, linenumber);

            setmem8(addr+1, immediate);
            
            regUsage[linenumber] = [subparts[0].trim()];
            
            return 2;           
        }
                
        // dual register (mov)
        if ((opcs = opsRegReg[mnemonic]) != undefined) {
            subparts = parts.slice(1).join(" ").split(",");
            if (subparts.length < 2) return -1;
            reg1 = parseRegister(subparts[0].trim());
            reg2 = parseRegister(subparts[1].trim());
            if (reg1 == -1 || reg2 == -1) return -1;
            mem[addr] = new Number("0x" + opcs) | reg1 << 3 | reg2;
            regUsage[linenumber] = [subparts[0].trim(), subparts[1].trim()];
            return 1;
        }

        // single register
        if ((opcs = opsReg[mnemonic]) != undefined) {
            reg = parseRegister(parts[1]);
            if (reg == -1) return -1;
            
            if (opsRegDst.indexOf(mnemonic) != -1) {
                reg <<= 3;
            }
            mem[addr] = new Number("0x" + opcs) | reg;

            regUsage[linenumber] = []
            regUsage[linenumber][0] = [parts[1].trim()];
            if (["ora", "ana", "xra", "add", "adc", "sub", "sbc", "cmp"].indexOf(mnemonic) != -1) {
                regUsage[linenumber][1] = '#'; 
                regUsage[linenumber][2] = 'a'; 
            }

            return 1;
        }
        
        // single register pair
        if ((opcs = opsRp[mnemonic]) != undefined) {
            rp = parseRegisterPair(parts[1]);
            if (rp == -1) return -1;
            mem[addr] = new Number("0x" + opcs) | rp << 4;

            regUsage[linenumber] = ['@'+parts[1].trim()];
            if (mnemonic == "dad") {
                regUsage[linenumber][1] = '#';
                regUsage[linenumber][2] = 'h';
                regUsage[linenumber][3] = 'l';
            } else if (["inx", "dcx"].indexOf(mnemonic) != -1) {
                if (["h","d"].indexOf(parts[1].trim()) != -1) {
                    var rpmap = {"h":"l","d":"e"};
                    regUsage[linenumber][1] = '#';
                    regUsage[linenumber][2] = rpmap[parts[1].trim()];
                }
            }
            return 1;
        }       
        
        // rst
        if (mnemonic == "rst") {
            n = resolveNumber(parts[1]);
            if (n >= 0 && n < 8) {
                mem[addr] = 0xC7 | n << 3;
                return 1;
            }
            return -1;
        }
        
        if (mnemonic == ".org" || mnemonic == "org") {
            n = evaluateExpression(parts.slice(1).join(' '), addr);
            if (n >= 0) {
                return -100000-n;
            }
            return -1;
        }

        if (mnemonic == ".binfile") {
            if (parts[1] != undefined && parts[1].trim().length > 0) {
                binFileName = parts[1];
            }
            return -100000;
        }

        if (mnemonic == ".hexfile") {
            if (parts[1] != undefined && parts[1].trim().length > 0) {
                hexFileName = parts[1];
            }
            return -100000;
        }

        if (mnemonic == ".download") {
            if (parts[1] != undefined && parts[1].trim().length > 0) {
                downloadFormat = parts[1].trim();
            }
            return -100000;
        }

        if (mnemonic == ".objcopy") {
           objCopy = parts.slice(1).join(' '); 
           return -100000;
        }

        if (mnemonic == ".postbuild") {
            postbuild = parts.slice(1).join(' ');
            return -100000;
        }

        if (mnemonic == ".nodump") {
            doHexDump = false;
            return -100000;
        }

        if (mnemonic == ".nolist" || mnemonic == ".list") {
            return 0;
        }

        // assign immediate value to label
        if (mnemonic == ".equ" || mnemonic == "equ") {
            if (labelTag == undefined) return -1;
            var value = evaluateExpression(parts.slice(1).join(' '), addr);
            if (value < 0) {
                console.log(labelTag, "equ value=", value);
            }
            markLabel(labelTag, value, linenumber, true);
            return 0;
        }

		if (mnemonic == ".encoding") {
    		var encoding = parts.slice(1).join(' ');	
			try {
				var encoded = toTargetEncoding('test', encoding);
				targetEncoding = encoding;
			} catch(err) {
				return -1;
			}
			return -100000;
		}

        if (mnemonic == 'cpu' ||
            mnemonic == 'aseg' ||
            mnemonic == '.aseg') return 0;

        if (mnemonic == 'db' || mnemonic == '.db' || mnemonic == 'str') {
            return parseDeclDB(parts, addr, linenumber, 1);
        }
        if (mnemonic == 'dw' || mnemonic == '.dw') {
            return parseDeclDB(parts, addr, linenumber, 2);
        }
        if (mnemonic == 'ds' || mnemonic == '.ds') {
            var size = evaluateExpression(parts.slice(1).join(' '), addr);
            if (size >= 0) {
                for (var i = 0; i < size; i++) {
                    setmem8(addr+i, 0);
                }
                return size;
            }
            return -1;
        }
        
        if (parts[0][0] == ";") {
            return 0;
        }

        // nothing else works, it must be a label
        if (labelTag == undefined) {
            var splat = mnemonic.split(':');
            labelTag = splat[0];
            markLabel(labelTag, addr, linenumber);

            parts.splice(0, 1, splat.slice(1).join(':'));
            continue;
        }
        
        mem[addr] = -2;
        return -1; // error
    }
    
    return 0; // empty
}


// -- output --

function labelList() {
    labelList.s = "                        ";
    labelList.f = function(label, addr) {
        var result = label.substring(0, labelList.s.length);
        if (result.length < labelList.s.length) {
            result += labelList.s.substring(result.length);
        }
        result += addr < 0 ? "????" : hex16(addr);
        return result;
    }

    var sorted = [];
    for (var i in labels) {
        sorted[sorted.length] = i;
    }
    sorted.sort();

    var result = "<pre>Labels:</pre>";
    result += '<div class="hordiv"></div>';
    result += '<pre class="labeltable">';
    var col = 1;
    for (var j = 0; j < sorted.length; j++) {
        var i = sorted[j];
        var label = labels[i];

        // hmm? 
        if (label == undefined) continue;
        if (i.length == 0) continue; // resolved expressions
        var resultClass = (col%4 == 0 ? 't2' : 't1');
        if (label < 0) resultClass += ' errorline';

        result += "<span class='" + resultClass +  
            "' onclick=\"return gotoLabel('"+i+"');\"";
        result += ">";
        result += labelList.f(i,label);
        result += "</span>";
        if (col % 4 == 0) result += "<br/>";
        col++;
    }
    result += "</pre>";
    
    return result;
}

function dumpspan(org, mode) {
    var result = "";
    var nonempty = false;
    conv = mode ? char8 : hex8;
    for (var i = org; i < org+16; i++) {
        if (mem[i] != undefined) nonempty = true;
        if (mode == 1) {
            result += conv(mem[i]);
        } else {
            result += (i > org && i%8 == 0) ? "-" : " ";
            if (mem[i] == undefined) {
                result += '  ';
            }
            else if (mem[i] < 0) {
                result += '<span class="errorline">' + conv(mem[i]) + '</span>';
            } else {
                result += conv(mem[i]);
            }
        }
    }

    return nonempty ? result : false;
}

function dump() {
    var org;
    for (org = 0; org < mem.length && mem[org] == undefined; org++);
    
    if (org % 16 != 0) org = org - org % 16;
    
    var result = "<pre>Memory dump:</pre>";
    result += '<div class="hordiv"></div>';
    var lastempty;

    var printline = 0;

    for (i = org; i < mem.length; i += 16) {
        span = dumpspan(i, 0);
        if (span || !lastempty) {
            result += '<pre ' + 'class="d' + (printline++%2) + '"';
            result += ">";
        }
        if (span) {
            result += hex16(i) + ": ";
            result += span;
            result += '  ';
            result += dumpspan(i, 1);
            result += "</pre><br/>";
            lastempty = false;
        } 
        if (!span && !lastempty) {
            result += " </pre><br/>";
            lastempty = true;
        }
    }

    return result;
}

function intelHex() {
    var i, j;
    var line = "";
    var r = "";
    var pureHex = "";
    r += "<pre>Intel HEX:</pre>";
    r += '<div class="hordiv"></div>';

    r += "<pre>";
    r += 'cat &gt;' + hexFileName + ' &lt;&lt;X<br/>';
    //r += 'ed<br>i<br>';
    for (i = 0; i < mem.length;) {
        for (j = i; j < mem.length && mem[j] == undefined; j++);
        i = j;
        if (i >= mem.length) break; 

        line = ":";

        cs = 0;

        rec = "";
        for (j = 0; j < 32 && mem[i+j] != undefined; j++) {
           if (mem[i+j] < 0) mem[i+j] = 0;
           rec += hex8(mem[i+j]); 
           cs += mem[i+j];
        }

        cs += j; line += hex8(j);   // byte count
        cs += (i>>8)&255; cs+=i&255; line += hex16(i);  // record address
        cs += 0; line += "00";      // record type 0, data
        line += rec;

        cs = 0xff&(-(cs&255));
        line += hex8(cs);
        pureHex += line + '\n';
        r += line + '<br/>';

        i += j;
    }
    r += ':00000001FF<br/>';
    pureHex += ':00000001FF\n';
    //r += '.<br>w ' + hexFileName +'<br>q<br>';
    r += 'X<br/>';
    r += objCopy + ' -I ihex ' + hexFileName + ' -O binary ' + 
        binFileName + '<br/>';
    if (postbuild.length > 0) {
        r += postbuild + '<br/>';
    }
    r += '</pre>';

    return pureHex;
}

function getLabel(l) {
    return labels[l.toLowerCase()];
}

function processRegUsage(instr, linenumber) {
    if (regUsage[linenumber] != undefined) {
        // check indirects
        var indirectsidx = regUsage[linenumber].indexOf('#');
        var indirects = [];
        var directs = [];
        if (indirectsidx != -1) {
            indirects = regUsage[linenumber].slice(indirectsidx + 1);
            directs = regUsage[linenumber].slice(0, indirectsidx);
        } else {
            directs = regUsage[linenumber];
        }

        if (indirects.length > 0) {
            regs = [''].concat(indirects).join("','rg").substr(2) + "'";

            var rep1 = '<span ' + 
                'onmouseover="return rgmouseover([' + regs + ']);" ' +
                'onmouseout="return rgmouseout([' + regs + ']);" ' +
                '>$1</span>';
            instr = instr.replace(/(\w+)/, rep1);
        }

        if (directs.length == 2) {
            // reg, reg 
            var s1 = "rg" + directs[0];
            var s2 = "rg" + directs[1];
            var rep1 = '<span class="' + s1 + '" ' + 
                'onmouseover="return rgmouseover(\'' + s1 + '\');" ' +
                'onmouseout="return rgmouseout(\'' + s1 + '\');" ' +
                '>$2</span>';
            var rep2 = '<span class="' + s2 + '" ' + 
                'onmouseover="return rgmouseover(\'' + s2 + '\');" ' +
                'onmouseout="return rgmouseout(\'' + s2 + '\');" ' +
                '>$3</span>';
            var replace = '$1' + rep1 + ', ' + rep2;
            instr=instr.replace(/(.+\s)([abcdehlm])\s*,\s*([abcdehlm])/, replace);
        } else if (directs.length == 1) {
            var rpname = directs[0];
            if (rpname[0] == '@') {
                rpname = rpname.substring(1);
                // register pair
                var s1 = "rg" + rpname;
                var rep1 = '<span class="' + s1 + '" ' + 
                    'onmouseover="return rgmouseover(\'' + s1 + '\');" ' +
                    'onmouseout="return rgmouseout(\'' + s1 + '\');" ' +
                    '>$2</span>';
                var replace = '$1'+rep1;
                instr=instr.replace(/([^\s]+[\s]+)([bdh]|sp)/, replace);
            } else {
                // normal register
                var s1 = "rg" + rpname;
                var rep1 = '<span class="' + s1 + '" ' + 
                    'onmouseover="return rgmouseover(\'' + s1 + '\');" ' +
                    'onmouseout="return rgmouseout(\'' + s1 + '\');" ' +
                    '>$2</span>';
                var replace = '$1'+rep1;
                instr=instr.replace(/([^\s]+[\s]+)([abcdehlm])/, replace);
            }
        }
    }
    
    return instr;
}

function listing(text,lengths,addresses) {
    var result = "";
    var addr = 0;
    var listOn = true;
    var skipLineCount = 0;
    for(var i = 0; i < text.length; i++) {
        var lineResult = "";
        var skipLine = false;
        var listOffComment = "";
        var labeltext = "";
        var remainder = text[i];
        var comment = '';
        var parts = text[i].split(/[\:\s]/);
        if (parts.length > 1) {
            if (getLabel(parts[0]) != -1 && parts[0].trim()[0] != ';') {
                labeltext = parts[0];
                remainder = text[i].substring(labeltext.length);
            }
        }

        if (remainder.trim().startsWith(".nolist")) {
            skipLine = true;
            listOn = false;
            listOffComment = "                        ; list generation turned off";
        } 
        else if (remainder.trim().startsWith(".list")) {
            skipLine = true;
            listOn = true;
            listOffComment = "                        ; skipped " + skipLineCount + " lines";
        }

        skipLineCount = listOn ? 0 : (skipLineCount + 1);

        var semicolon = remainder.indexOf(';');
        if (semicolon != -1) {
            comment = remainder.substring(semicolon);
            remainder = remainder.substring(0, semicolon);
        }

        remainder = processRegUsage(remainder, i);

        var id = "l" + i;
        var labelid = "label" + i;
        var remid = "code" + i;

        var hexes = "";
        var unresolved = false;
        var width = 0;

        var len = lengths[i] > 4 ? 4 : lengths[i];
        for (var b = 0; b < len; b++) {
            hexes += hex8(mem[addresses[i]+b]) + ' ';
            width += 3;
            if (mem[addresses[i]+b] < 0) unresolved = true;
        }
        for (b = 0; b < 16 - width; b++) { hexes += ' '; }

        lineResult += '<pre id="' + id + '"';

        if (unresolved || errors[i] != undefined) {
            lineResult += ' class="errorline" ';
        }
        if (unresolved) {
            console.log("unresolved label in line ", i, ": ", text[i]);
        } else if (errors[i]) {
            console.log("error in line ", i, ": ", text[i]);
        }

        lineResult += '>';
        lineResult += '<span class="adr">' + (lengths[i] > 0 ? hex16(addresses[i]) : "") + "</span>"
        lineResult += '\t';

        lineResult += hexes;

        if (labeltext.length > 0) {
            var t = '<span class="l" id="' + labelid + '"' +
            ' onmouseover="return mouseovel('+i+');"' + 
            ' onmouseout="return mouseout('+i+');"' +
            '>' + labeltext + '</span>';
            lineResult += t;
        }
        for (b = 0; b < remainder.length && isWhitespace(remainder[b]); b++) {
            lineResult += ' ';
        }
        remainder = remainder.substring(b);
        if (remainder.length > 0) {
            lineResult += '<span id="' + remid + '"' +
            ' onmouseover="return mouseover('+i+');"' + 
            ' onmouseout="return mouseout('+i+');"' +
            '>' + remainder + '</span>';
        }

        if (comment.length > 0) {
            lineResult += '<span class="cmt">' + comment + '</span>';
        }

        // hacked this into displaying only first and last lines
        // of db thingies
        if (len < lengths[i]) {
            lineResult += '<br/>\t.&nbsp;.&nbsp;.&nbsp;<br/>';
            for (var subline = 1; subline*4 < lengths[i]; subline++) {
                var sublineResult = '';
                sublineResult += hex16(addresses[i]+subline*4) + '\t';
                for (var sofs = 0; sofs < 4; sofs++) {
                    var adr = subline*4+sofs;
                    if (adr < lengths[i]) {
                        sublineResult += hex8(mem[addresses[i]+adr]) + ' ';
                    }
                }
                //lineResult += "<br/>";
            }
            lineResult += sublineResult + "<br/>";
        }
        lineResult += '</pre>';


        if (listOn && !skipLine) result += lineResult;
        if (listOffComment != "") result += '<pre><span class="cmt">' + listOffComment + '</span></pre>';

        addr += lengths[i];
    }

    result += labelList();

    result += "<div>&nbsp;</div>";

    if (!makeListing) {   
        if (doHexDump) {
            result += dump();
        }

        result += "<div>&nbsp;</div>";

        result += intelHex();

        result += "<div>&nbsp;</div>";
    }
    return result;
}

function error(line, text) {
    errors[line] = text;
}

function readInput(filename) {
    var fs = require("fs");
    var src = fs.readFileSync(filename, "utf8");
    var inputlines = src.split('\n');
    var result = "";
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

            if (directive == ".include") {
                if (parts[1] != undefined && parts[1].trim().length > 0) {
                    includeFileName = parts[1];
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

// assembler main entry point
function assemble(filename) {
    var src = readInput(filename);

    var list = '';
    var lengths = Array();
    var addresses = Array();

    var inputlines = src.split('\n');
    
    var addr = 0;
    clearLabels();
    resolveTable.length = 0;
    mem.length = 0;
    backrefWindow = false;
    references.length = 0;
    textlabels.length = 0;
    errors.length = 0;
    doHexDump = true;
    postbuild = '';
    objCopy = 'gobjcopy';
    
    for (var line = 0; line < inputlines.length; line++) {
		var encodedLine = toTargetEncoding(inputlines[line].trim(), targetEncoding);
		var size = parseInstruction(encodedLine, addr, line);
		if (size <= -100000) {
			addr = -size-100000;
			size = 0;
		} else if (size < 0) {
			error(line, "syntax error");
			size = -size;
		}
        lengths[line] = size;
        addresses[line] = addr;
        addr += size;
    }
    
    resolveLabelsTable();
    evaluateLabels();
    resolveLabelsInMem();
    
    list += listing(inputlines, lengths, addresses);

    return list;
}

function evaluateExpression(input, addr) {
    var q;
    var originput = input;
    //console.log("input=" + input + " addr=" + addr);
    try {
        input = input.replace(/\$([0-9a-fA-F]+)/, '0x$1');
        input = input.replace(/(^|[^'])\$|\./gi, ' '+addr+' ');
        input = input.replace(/([\d\w]+)\s(shr|shl|and|or|xor)\s([\d\w]+)/gi,'($1 $2 $3)');
        input = input.replace(/\b(shl|shr|xor|or|and|[+\-*\/()])\b/gi,
            function(m) {
                switch (m) {
                case 'and':
                    return '&';
                case 'or':
                    return '|';
                case 'xor':
                    return '^';
                case 'shl':
                    return '<<';
                case 'shr':
                    return '>>';
                default:
                    return m;
                }
            });
        q = input.split(/<<|>>|[+\-*\/()\^\&\|]/);
    } catch (e) {
        return -1;
    }
    input = input;

    var expr = '';
    for (var ident = 0; ident < q.length; ident++) {
        var qident = q[ident].trim();
        if (-1 != resolveNumber(qident)) continue;
        var addr = labels[qident];//.indexOf(qident);
        if (addr != undefined) {
            //addr = labels[idx+1];
            if (addr >= 0) {
                expr += 'var _' + qident + '=' + addr +';\n';
                var rx = new RegExp('\\b'+qident+'\\b', 'gm');
                input = input.replace(rx, '_' + qident);
            } else {
                expr = false;
                break;
            }
        }
    }
    //console.log('0 input=',  input);
    //console.log('1 expr=', expr);
    expr += input.replace(/0x[0-9a-fA-F]+|[0-9][0-9a-fA-F]*[hbqdHBQD]|'.'/g,
        function(m) {
            return resolveNumber(m);
        });
    //console.log('expr=', expr);
    try {
        return eval(expr.toLowerCase());
    } catch (err) {
        //console.log('expr was:',expr.toLowerCase(), originput);
        //console.log(err);
    }

    return -1;
}

function evaluateLabels() {
    for (var i in labels) {
        var label = labels[i];
        if (label < 0 && resolveTable[-label] == undefined) {
            var result = evaluateExpression(i,-1);
            if (result >= 0) {
                resolveTable[-label] = result;
                labels[i] = undefined;
            }
        } 
    }
}

function resolveLabelsInMem() {
    for (var i = 0; i < mem.length;) {
        var negativeId;
        if ((negativeId = mem[i]) < 0) {
            newvalue = resolveTable[-negativeId];

            if (newvalue != undefined) mem[i] = newvalue & 0xff;
            i++;
            if (mem[i] == negativeId) {
                if (newvalue != undefined) mem[i] = 0xff & (newvalue >> 8);
                i++;
            }
        } else {
            i++;
        }
    }
}
 
function resolveLabelsTable(nid) {   
   for (var i in labels) {
        var label = labels[i];
        if (label < 0) {
            var addr = resolveTable[-label];
            if (addr != undefined) {
                labels[i] = addr;
            }
        }
    }
}


function preamble() {
    return '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru"> <head> <title>Pretty 8080 Assembler</title>\n' +
'<script type="text/javascript"><!--  --></script>\n' +
'<script type="text/javascript" src="navigate.js"></script>\n' +
'<link href="listn.css" rel="stylesheet" type="text/css" media="screen"/>\n' +
'<style type="text/css">\n'+
'.rga { color: lightgray; }\n'+
'.rgb { color: lightgray; }\n'+
'.rgc { color: lightgray; }\n'+
'.rgd { color: lightgray; }\n'+
'.rge { color: lightgray; }\n'+
'.rgh { color: lightgray; }\n'+
'.rgl { color: lightgray; }\n'+
'.rgm { color: lightgray; }\n'+
'.rgsp { color: lightgray; }\n'+
'.rpb { color: lightgray; }\n'+
'.rpd { color: lightgray; }\n'+
'.rph { color: lightgray; }\n'+
'.rpsp { color: lightgray; }\n'+
'</style>\n'+
'<body id="main" onload="loaded(); return false;" onresize="updateSizes(); return false;">\n' +
'<div id="list">';
}

function tail() {
    return '</div></body></html>';
}

//-----
/*
json.js
2011-08-30

Public Domain

No warranty expressed or implied. Use at your own risk.

This file has been superceded by http://www.JSON.org/json2.js

See http://www.JSON.org/js.html

This code should be minified before deployment.
See http://javascript.crockford.com/jsmin.html

USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
NOT CONTROL.

This file adds these methods to JavaScript:

object.toJSONString(whitelist)
This method produce a JSON text from a JavaScript value.
It must not contain any cyclical references. Illegal values
will be excluded.

The default conversion for dates is to an ISO string. You can
add a toJSONString method to any date object to get a different
representation.

The object and array methods can take an optional whitelist
argument. A whitelist is an array of strings. If it is provided,
keys in objects not found in the whitelist are excluded.

string.parseJSON(filter)
This method parses a JSON text to produce an object or
array. It can throw a SyntaxError exception.

The optional filter parameter is a function which can filter and
transform the results. It receives each of the keys and values, and
its return value is used instead of the original value. If it
returns what it received, then structure is not modified. If it
returns undefined then the member is deleted.

Example:

// Parse the text. If a key contains the string 'date' then
// convert the value to a date.

myData = text.parseJSON(function (key, value) {
return key.indexOf('date') >= 0 ? new Date(value) : value;
});

This file will break programs with improper for..in loops. See
http://yuiblog.com/blog/2006/09/26/for-in-intrigue/

This file creates a global JSON object containing two methods: stringify
and parse.

JSON.stringify(value, replacer, space)
value any JavaScript value, usually an object or array.

replacer an optional parameter that determines how object
values are stringified for objects. It can be a
function or an array of strings.

space an optional parameter that specifies the indentation
of nested structures. If it is omitted, the text will
be packed without extra whitespace. If it is a number,
it will specify the number of spaces to indent at each
level. If it is a string (such as '\t' or '&nbsp;'),
it contains the characters used to indent at each level.

This method produces a JSON text from a JavaScript value.

When an object value is found, if the object contains a toJSON
method, its toJSON method will be called and the result will be
stringified. A toJSON method does not serialize: it returns the
value represented by the name/value pair that should be serialized,
or undefined if nothing should be serialized. The toJSON method
will be passed the key associated with the value, and this will be
bound to the object holding the key.

For example, this would serialize Dates as ISO strings.

Date.prototype.toJSON = function (key) {
function f(n) {
// Format integers to have at least two digits.
return n < 10 ? '0' + n : n;
}

return this.getUTCFullYear() + '-' +
f(this.getUTCMonth() + 1) + '-' +
f(this.getUTCDate()) + 'T' +
f(this.getUTCHours()) + ':' +
f(this.getUTCMinutes()) + ':' +
f(this.getUTCSeconds()) + 'Z';
};

You can provide an optional replacer method. It will be passed the
key and value of each member, with this bound to the containing
object. The value that is returned from your method will be
serialized. If your method returns undefined, then the member will
be excluded from the serialization.

If the replacer parameter is an array of strings, then it will be
used to select the members to be serialized. It filters the results
such that only members with keys listed in the replacer array are
stringified.

Values that do not have JSON representations, such as undefined or
functions, will not be serialized. Such values in objects will be
dropped; in arrays they will be replaced with null. You can use
a replacer function to replace those with JSON values.
JSON.stringify(undefined) returns undefined.

The optional space parameter produces a stringification of the
value that is filled with line breaks and indentation to make it
easier to read.

If the space parameter is a non-empty string, then that string will
be used for indentation. If the space parameter is a number, then
the indentation will be that many spaces.

Example:

text = JSON.stringify(['e', {pluribus: 'unum'}]);
// text is '["e",{"pluribus":"unum"}]'


text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

text = JSON.stringify([new Date()], function (key, value) {
return this[key] instanceof Date ?
'Date(' + this[key] + ')' : value;
});
// text is '["Date(---current time---)"]'


JSON.parse(text, reviver)
This method parses a JSON text to produce an object or array.
It can throw a SyntaxError exception.

The optional reviver parameter is a function that can filter and
transform the results. It receives each of the keys and values,
and its return value is used instead of the original value.
If it returns what it received, then the structure is not modified.
If it returns undefined then the member is deleted.

Example:

// Parse the text. Values that look like ISO date strings will
// be converted to Date objects.

myData = JSON.parse(text, function (key, value) {
var a;
if (typeof value === 'string') {
a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
if (a) {
return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
+a[5], +a[6]));
}
}
return value;
});

myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
var d;
if (typeof value === 'string' &&
value.slice(0, 5) === 'Date(' &&
value.slice(-1) === ')') {
d = new Date(value.slice(5, -1));
if (d) {
return d;
}
}
return value;
});


This is a reference implementation. You are free to copy, modify, or
redistribute.
*/

/*jslint evil: true, regexp: true, unparam: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
lastIndex, length, parse, parseJSON, prototype, push, replace, slice,
stringify, test, toJSON, toJSONString, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = { // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i, // The loop counter.
            k, // The member key.
            v, // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }

// Augment the basic prototypes if they have not already been augmented.
// These forms are obsolete. It is recommended that JSON.stringify and
// JSON.parse be used instead.

//    if (!Object.prototype.toJSONString) {
//        Object.prototype.toJSONString = function (filter) {
//            return JSON.stringify(this, filter);
//        };
//        Object.prototype.parseJSON = function (filter) {
//            return JSON.parse(this, filter);
//        };
//   }
}());
//------

function jsons() {
    return '<div style="display:none" id="json_references">\n' + JSON.stringify(references) + '</div>\n' +
     '<div style="display:none" id="json_textlabels">\n' + JSON.stringify(textlabels) + '</div>\n';
}

module.exports = {
    PrettyAsm: function(filename) {
        makeListing = false;
        var lst = assemble(filename);
        var ret = [preamble(), lst, jsons(), tail()].join('\n');
        var hex = intelHex();
        return [lst, ret, hex];
    }
};
