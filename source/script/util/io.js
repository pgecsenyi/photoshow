const fs = require('fs');
const path = require('path');

var checkIfDirectoryExists = function (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err && err.code === 'ENOENT') {
        return resolve(false);
      } else if (err) {
        return reject(err);
      } else if (stats.isDirectory()) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    });
  });
};

var checkIfFileExists = function (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err && err.code === 'ENOENT') {
        return resolve(false);
      } else if (err) {
        return reject(err);
      } else if (stats.isFile()) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    });
  });
};

var checkIfPathsAreEqual = function (path1, path2) {
  var normalizedPath1 = path.resolve(path1);
  var normalizedPath2 = path.resolve(path2);
  return normalizedPath1 === normalizedPath2;
};

var validatePath = function (pathString) {
  var result = { basePath: '', isValid : false, path: '' };
  if (typeof pathString === 'undefined' || pathString == null) {
    return result;
  } else {
    let trimmedPathString = pathString.toString().trim();
    if (trimmedPathString !== '') {
      result.basePath = path.parse(trimmedPathString).root;
      result.path = trimmedPathString;
      result.isValid = true;
    }
  }

  return result;
};

module.exports = {
  'checkIfDirectoryExists': checkIfDirectoryExists,
  'checkIfFileExists': checkIfFileExists,
  'checkIfPathsAreEqual': checkIfPathsAreEqual,
  'validatePath': validatePath
};
