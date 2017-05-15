module.exports = function () {

  var basePath = null;
  var outputDirectory = null;

  this.getBasePath = function () {
    return basePath;
  };

  this.setBasePath = function (value) {
    basePath = value;
  };

  this.getOutputDirectory = function () {
    return outputDirectory;
  };

  this.setOutputDirectory = function (value) {
    outputDirectory = value;
  };
};
