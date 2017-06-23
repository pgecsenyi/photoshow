var unk = '_';
var asciiChars = [
  ' ',   '!', 'c', 'L',  unk, 'Y',  '|', 'S',  unk, 'C', 'a', '<<',   unk,   '-',   'R',  '-',
  unk, '+/-', '2', '3', '\'', 'u',  'P', '.',  ',', '1', 'o', '>>', '1/4', '1/2', '3/4',  '?',
  'A',   'A', 'A', 'A',  'A', 'A', 'AE', 'C',  'E', 'E', 'E',  'E',   'I',   'I',   'I',  'I',
  'D',   'N', 'O', 'O',  'O', 'O',  'O', '*',  '0', 'U', 'U',  'U',   'U',   'Y',   'P', 'ss',
  'a',   'a', 'a', 'a',  'a', 'a', 'ae', 'c',  'e', 'e', 'e',  'e',   'i',   'i',   'i',  'i',
  'd',   'n', 'o', 'o',  'o', 'o',  'o', '/',  '0', 'u', 'u',  'u',   'u',   'y',   'p',  'y'
];

function containsAsciiCharsOnly(utf8String) {
  if (typeof utf8String !== 'undefined' && utf8String != null) {
    for (let i = 0; i < utf8String.length; i++) {
      if (utf8String[i].charCodeAt(0) > 255) {
        return false;
      }
    }
  }

  return true;
}

function createIdentifier(utf8String) {
  var asciiString = utf8ToAscii(utf8String);
  asciiString = asciiString.replace(/\./g, '');
  asciiString = asciiString.replace(/,/g, '');
  asciiString = asciiString.replace(/ /g, '-');
  return asciiString;
}

function utf8ToAscii(utf8String) {
  if (typeof utf8String === 'undefined' || utf8String == null) {
    return null;
  }
  var asciiString = '';
  for (let i = 0; i < utf8String.length; i++) {
    let utf8Char = utf8String[i];
    let utf8Code = utf8Char.charCodeAt(0);
    if (utf8Code <= 127) {
      asciiString += utf8Char;
    } else if (160 <= utf8Code && utf8Code <= 255) {
      asciiString += asciiChars[utf8Code - 160];
    } else {
      asciiString += unk;
    }
  }
  return asciiString;
}

module.exports = {
  'containsAsciiCharsOnly': containsAsciiCharsOnly,
  'createIdentifier' : createIdentifier,
  'utf8ToAscii': utf8ToAscii
};
