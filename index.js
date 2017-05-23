const log = console.log;
const fs = require('fs');
const path = require('path');
const Iconv = require('iconv').Iconv;
const clr = require('chalk');

fs.readFileAsync = (filename, options) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, options, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

fs.writeFileAsync = (filename, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, content, err => {
            if(err) reject(err);
            else resolve(content);
        }); 
    });
};

const validArgNumber = 2;

(async () => {
    let cmdArgs = parseAppArguments();

    if (cmdArgs.length < validArgNumber) {
        log(`${clr.red(' ...2 arguments should be provided... ')} \n${clr.white('1)')} ${clr.green('A file path with text data')} \n${clr.white('2)')} ${clr.green('One of the following ISO character sets')}\n${clr.white.underline('Format:')} ${clr.yellow('npm start <text-file.txt> <ISO-XXXX-X>')} `);
        printAsciiEncodings();
        process.exit(0);
    }
    
    let filename = cmdArgs[0];

    if (!fs.existsSync(filename)) {
        log(clr.red('File does not exist.'));
        process.exit(0);
    }

    let charset = cmdArgs[1];

    try {
        let binaryTextData = await fs.readFileAsync(cmdArgs[0]);
        let text = await convertToUtf8FromEncodingAsync(charset, binaryTextData);

        let newFilename = generateNameFrom(filename);
        await fs.writeFileAsync(newFilename, text);
        log(clr.green(`File has been converted successfully! New file: "${newFilename}"`));
    } catch (err) {
        log(clr.red(err.message));
    }
})();


async function convertToUtf8FromEncodingAsync(charset, binaryTextData) {
    return new Promise((resolve, reject) => {
        let iconv = new Iconv(charset, 'UTF8');
        try {
            let buffer = iconv.convert(binaryTextData);
            resolve(buffer.toString('utf8'));
        }
        catch (err) {
            reject(err);
        }
    });
}

function parseAppArguments() {
	let args = [];
	process.argv.slice(2).forEach(arg => args.push(arg));
	return args;
}

function printAsciiEncodings() {
    let encodings = [
        { charset: 'ISO-8859-1', description: 'Latin alphabet part 1', covers: 'North America, Western Europe, Latin America, the Caribbean, Canada, Africa' },
        { charset: 'ISO-8859-2', description: 'Latin alphabet part 2', covers: 'Eastern Europe' },
        { charset: 'ISO-8859-3', description: 'Latin alphabet part 3', covers: 'SE Europe, Esperanto, miscellaneous others' },
        { charset: 'ISO-8859-4', description: 'Latin alphabet part 4', covers: 'Scandinavia/Baltics (and others not in ISO-8859-1)' },
        { charset: 'ISO-8859-5', description: 'Latin/Cyrillic part 5', covers: 'The languages that are using a Cyrillic alphabet such as Bulgarian, Belarusian, Russian and Macedonian' },
        { charset: 'ISO-8859-6', description: 'Latin/Arabic part 6', covers: 'The languages that are using the Arabic alphabet' },
        { charset: 'ISO-8859-7', description: 'Latin/Greek part 7', covers: 'The modern Greek language as well as mathematical symbols derived from the Greek' },
        { charset: 'ISO-8859-8', description: 'Latin/Hebrew part 8', covers: 'The languages that are using the Hebrew alphabet' },
        { charset: 'ISO-8859-9', description: 'Latin 5 part 9', covers: 'The Turkish language. Same as ISO-8859-1 except Turkish characters replace Icelandic ones' },
        { charset: 'ISO-8859-10', description: 'Latin 6 Lappish, Nordic, Eskimo', covers: 'The Nordic languages' },
        { charset: 'ISO-8859-15', description: 'Latin 9 (aka Latin 0)', covers: 'Similar to ISO-8859-1 but replaces some less common symbols with the euro sign and some other missing characters' },
        { charset: 'ISO-2022-JP', description: 'Latin/Japanese part 1', covers: 'The Japanese language' },
        { charset: 'ISO-2022-JP-2', description: 'Latin/Japanese part 2', covers: 'The Japanese language' },
        { charset: 'ISO-2022-KR', description: '	Latin/Korean part 1', covers: 'The Korean language' }
    ];
    encodings.forEach(encoding => log(`${clr.blue('Character set:')} ${clr.yellow.bold(encoding.charset)}, ${clr.blue('Description:')} ${clr.cyan(encoding.description)}, ${clr.blue('Covers:')} ${clr.cyan(encoding.covers)}`));
}

function generateNameFrom(filename) {
    let extension = findFileExtension(filename);
    let filenameTemplate = `${filename.substring(0, filename.length - extension.length)} (${'utf8'})`;
    let newFilename = filenameTemplate + extension;
    let counter = 2;
    while (fs.existsSync(newFilename)) {
        newFilename = `${filenameTemplate} (${counter++})${extension}`;
    }
    return newFilename;
}

function findFileExtension(fileName){
	return path.extname(fileName);
}