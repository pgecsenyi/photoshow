const nodeDir = require('node-dir');
const path = require('path');

const entities = require('../dal/entities.js');

module.exports = function () {

  var allFiles = [];
  var basePath = '';
  var currentIndex = 0;
  var cutImageName = null;
  var fullPath = '';
  var imageSelectionMap = Object.create(null);
  var presentation = null;

  this.addCurrent = function () {
    if (currentIndex < allFiles.length) {
      let name = allFiles[currentIndex];
      imageSelectionMap[name] = new entities.Image(name);
    }
  };

  this.collectImages = function () {
    return new Promise((resolve, reject) => {
      if (presentation == null) {
        reject('Presentation is null.');
      }
      listDirectory(fullPath)
        .then(files => {
          allFiles = filterFilesByExtension(files, fullPath);
          if (allFiles.length <= 0) {
            reject('There are no image files at the provided path.');
          }
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  this.cutCurrent = function () {
    this.addCurrent();
    cutImageName = getCurrentFilename();
    allFiles.splice(currentIndex, 1);
  };

  this.getAllFileCount = function () {
    return allFiles.length;
  };

  this.getCurrentDescription = function () {
    var currentFilename = getCurrentFilename();
    if (currentFilename) {
      var currentImage = imageSelectionMap[currentFilename];
      if (currentImage) {
        return currentImage.description;
      }
    }
    return null;
  };

  this.getCurrentPath = function () {
    if (currentIndex < allFiles.length) {
      let name = allFiles[currentIndex];
      return path.join(fullPath, name);
    }
    return null;
  };

  this.getCurrentIndex = function () {
    return currentIndex;
  };

  this.getNextPath = function () {
    if (currentIndex + 1 < allFiles.length) {
      currentIndex++;
      return this.getCurrentPath();
    }
    return null;
  };

  this.getPresentation = function () {
    if (presentation != null) {
      presentation.images = buildImageList();
    }
    return presentation;
  };

  this.getPreviousPath = function () {
    if (currentIndex - 1 >= 0) {
      currentIndex--;
      return this.getCurrentPath();
    }
    return null;
  };

  this.getSelectedImageCount = function () {
    return Object.keys(imageSelectionMap).length;
  };

  this.getTransformationsForCurrentImage = function () {
    var currentFilename = getCurrentFilename();
    if (!currentFilename) {
      return null;
    }
    if (typeof imageSelectionMap[currentFilename] === 'undefined') {
      return null;
    }
    return imageSelectionMap[currentFilename].transformations;
  };

  this.isCurrentImageSelected = function () {
    if (currentIndex < allFiles.length) {
      let name = allFiles[currentIndex];
      return typeof imageSelectionMap[name] !== 'undefined';
    }
    return false;
  };

  this.paste = function () {
    allFiles.splice(currentIndex + 1, 0, cutImageName);
    cutImageName = null;
  };

  this.removeCurrent = function () {
    if (currentIndex < allFiles.length) {
      let name = allFiles[currentIndex];
      delete imageSelectionMap[name];
    }
  };

  this.reset = function () {
    allFiles = [];
    basePath = '';
    currentIndex = 0;
    fullPath = '';
    imageSelectionMap = Object.create(null);
    presentation = null;
  };

  this.setDescriptionForCurrentImage = function (description) {
    var currentFilename = getCurrentFilename();
    if (!currentFilename) {
      return;
    }
    if (typeof imageSelectionMap[currentFilename] === 'undefined' && description !== null) {
      this.addCurrent();
    }
    if (imageSelectionMap[currentFilename]) {
      imageSelectionMap[currentFilename].description = description;
    }
  };

  this.setTransformations = function (transformations) {
    presentation.transformations = transformations;
  };

  this.setTransformationsForCurrentImage = function (transformations) {
    var currentFilename = getCurrentFilename();
    if (!currentFilename) {
      return;
    }
    if (typeof imageSelectionMap[currentFilename] === 'undefined') {
      this.addCurrent();
    }
    imageSelectionMap[currentFilename].transformations = transformations;
  };

  this.updatePresentation = function (id, title, relativePath, audienceId, newBasePath) {
    if (presentation == null) {
      presentation = new entities.Presentation(id, title, relativePath, audienceId);
    } else {
      presentation.id = id;
      presentation.title = title;
      presentation.path = relativePath;
      presentation.audienceId = audienceId;
    }
    basePath = newBasePath;
    fullPath = path.join(basePath, relativePath);
  };

  function buildImageList() {
    var images = [];
    for (let i = 0; i < allFiles.length; i++) {
      let filename = allFiles[i];
      if (typeof imageSelectionMap[filename] !== 'undefined') {
        images.push(imageSelectionMap[filename]);
      }
    }
    return images;
  }

  function filterFilesByExtension(files, prefix) {
    var allowedExtensions = [ 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'tif', 'svg' ];
    var result = [];
    files.forEach(file => {
      for (let i = 0; i < allowedExtensions.length; i++) {
        var start = file.length - allowedExtensions[i].length;
        var extension = file.substring(start);
        if (extension === allowedExtensions[i]) {
          let name = file;
          if (prefix) {
            name = name.substring(prefix.length + 1);
          }
          result.push(name);
          break;
        }
      }
    });

    return result;
  }

  function getCurrentFilename() {
    if (currentIndex < allFiles.length) {
      let filename = allFiles[currentIndex];
      return filename;
    }
    return null;
  }

  function listDirectory(directory) {
    return new Promise((resolve, reject) => {
      nodeDir.files(
        directory,
        (err, files) => {
          if (err) {
            reject(err);
          } else if (files) {
            files = files.sort();
            resolve(files);
          }
        }
      );
    });
  }
};
