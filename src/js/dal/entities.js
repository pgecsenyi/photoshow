var Audience = function (id, name) {
  this.id = id;
  this.name = name;
  this.color = null;
};

var Image = function (name) {
  this.name = name;
  this.description = null;
  this.transformations = null;
};

var Presentation = function (id, title, relativePath, audienceId) {
  this.id = id;
  this.title = title;
  this.path = relativePath;
  this.audienceId = audienceId;
  this.images = null;
  this.transformations = null;
};

var PresentationHeader = function (id, title, audienceId) {
  this.id = id;
  this.title = title;
  this.audienceId = audienceId;
};

var Transformations = function () {
  this.clean = null;
  this.rotate = null;
  this.scale = null;
};

var CleanTransformation = function () {
};

var RotateTransformation = function (degree) {
  this.degree = degree;
};

var ScaleTransformation = function (width, height) {
  this.width = width;
  this.height = height;
};

module.exports = {
  'Audience': Audience,
  'CleanTransformation': CleanTransformation,
  'Image': Image,
  'Presentation': Presentation,
  'PresentationHeader': PresentationHeader,
  'RotateTransformation': RotateTransformation,
  'ScaleTransformation': ScaleTransformation,
  'Transformations': Transformations
};
