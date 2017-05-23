# ascii-to-utf8-converter
Sometimes we have text files in ASCII format and applications which do not support them.
For that reason, I created this small tool which allows converting an ASCII file to UTF8.

To convert a file just type:

`npm start <file.txt> <ISO-XXXX-X>`

If you don't know the ISO character set you can leave blank the arguments and it will print all the available options for you, or alternatively define "auto" as the second parameter to automatically detect the character set and convert the file.

`npm start`

or

`npm start <file.txt> auto`
