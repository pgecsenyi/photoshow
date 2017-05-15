var PresentationGenerator = require('../util/presentation-generator.js');

var generatePresentation = function(
  sourcePath, targetPath,
  images, globalTransformations,
  onStartImageProcessing, onEndImageProcessing) {

  let presentationGenerator = new PresentationGenerator(
    sourcePath, targetPath,
    images, globalTransformations,
    onStartImageProcessing, onEndImageProcessing);

  return presentationGenerator.generate();
};

module.exports = {
  'generatePresentation': generatePresentation
};
