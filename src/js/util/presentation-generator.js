const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

require('../util/extensions-global.js');

var PresentationGenerator = function(
  newFullSourcePath,
  newTargetPath,
  newImages,
  newGlobalTransformations,
  newOnStartImageProcessing,
  newOnEndImageProcessing) {
  if (!newFullSourcePath) {
    throw 'newFullSourcePath cannot be undefined or null.';
  }
  if (!newTargetPath) {
    throw 'newTargetPath cannot be undefined or null.';
  }
  if (!newImages) {
    throw 'newImages cannot be undefined or null.';
  }
  this.sourcePath = newFullSourcePath;
  this.targetPath = newTargetPath;
  this.images = newImages;
  this.globalTransformations = newGlobalTransformations;
  this.onStartImageProcessing = null;
  if (newOnStartImageProcessing) {
    this.onStartImageProcessing = newOnStartImageProcessing;
  }
  this.onEndImageProcessing = null;
  if (newOnEndImageProcessing) {
    this.onEndImageProcessing = newOnEndImageProcessing;
  }

  this.areGlobalTransformationsDefined = this.globalTransformations && !this.globalTransformations.isEmpty();
};

PresentationGenerator.prototype.generate = function () {
  var promise = new Promise(resolve => resolve());
  for (let i = 0; i < this.images.length; i++) {
    var image = this.images[i];
    promise = followProcessPromise(this, promise, image);
  }
  return promise;
};

PresentationGenerator.prototype.processImage = function (image) {
  return new Promise((resolve, reject) => {
    var sourceFile = path.join(this.sourcePath, image.name);
    var targetFile = path.join(this.targetPath, image.name);
    if (this.onStartImageProcessing != null) {
      this.onStartImageProcessing(image.name);
    }
    if (this.areGlobalTransformationsDefined || image.transformations) {
      let transformations = mergeTransformations(this.globalTransformations, image.transformations);
      let promise = transformImage(sourceFile, transformations, targetFile);
      handleImageProcessingPromise(this, image.name, promise, resolve, reject);
    } else {
      let promise = copyFile(sourceFile, targetFile);
      handleImageProcessingPromise(this, image.name, promise, resolve, reject);
    }
  });
};

function verifyScaleTransformationParameters(scale) {
  return scale && (scale.width || scale.height) && (scale.width > 0 || scale.height > 0);
}

function copyFile(sourceFile, targetFile) {
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(sourceFile);
    rd.on('error', err => {
      reject(err);
    });
    var wr = fs.createWriteStream(targetFile);
    wr.on('error', err => {
      reject(err);
    });
    wr.on('close', () => {
      resolve();
    });
    rd.pipe(wr);
  });
}

function followProcessPromise(that, promise, image) {
  return promise.then(() => {
    return that.processImage(image);
  });
}

function handleImageProcessingPromise(that, imageName, promise, resolve, reject) {
  promise.then(() => {
    if (that.onEndImageProcessing != null) {
      that.onEndImageProcessing(imageName);
    }
    resolve();
  })
  .catch(function (err) {
    reject(err);
  });
}

function mergeTransformations(globalTransformations, transformations) {
  if (!globalTransformations) {
    return transformations;
  }
  var result = Object.create(globalTransformations);
  if (transformations) {
    if (transformations.clean) {
      result.clean = transformations.clean;
    }
    if (transformations.rotate) {
      result.rotate = transformations.rotate;
    }
    if (transformations.scale) {
      result.scale = transformations.scale;
    }
  }
  return result;
}

function transformImage(sourceFile, transformations, targetFile) {
  return jimp.read(sourceFile)
    .then(imageData => {
      // Scale.
      if (verifyScaleTransformationParameters(transformations.scale)) {
        if (!transformations.scale.height || transformations.scale.height <= 0) {
          imageData = imageData.resize(transformations.scale.width, jimp.auto);
        } else if (!transformations.scale.width || transformations.scale.width <= 0) {
          imageData = imageData.resize(jimp.auto, transformations.scale.height);
        } else {
          imageData = imageData.resize(transformations.scale.width, transformations.scale.height);
        }
      }
      // Rotate.
      if (transformations.rotate) {
        imageData = imageData.rotate(transformations.rotate.degree);
      }
      return imageData.write(targetFile);
    });
}

module.exports = PresentationGenerator;
