Standalone Pretty 8080 Assembler
================================

1. Clone or download and unzip
2. ``npm install -g``

Usage:
  ``pasm [-Dsym=value] [-b] [-t85] file.asm file.bin``
  
Options `-b` and `-t85` are only for compatibility with Telemark TASM, they don't do anything.

The preprocessor is not real, but it lets compile most TASM sources. #ifdef/#ifndef can nest, but cannot evaluate expressions. `-Dsym=value` is equivalent to writing `sym .equ expr` in the beginning of code.

