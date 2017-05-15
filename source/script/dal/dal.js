const fs = require('fs');
const xml2js = require('xml2js');
const xmlBuilder = require('xmlbuilder');

require('../util/extensions-global.js');
const entities = require('./entities.js');
const ioUtil = require('../util/io.js');

var audiences = [];
var collectionPath = null;
var presentations = [];

var addAudience = function (audience) {
  return new Promise((resolve, reject) => {
    if (audience == null) {
      reject('audience cannot be null.');
    }
    getAudience(audience.id)
      .then(storedAudience => {
        if (storedAudience == null) {
          audiences.push(audience);
          resolve();
        } else {
          reject('Audience ID does already exist.');
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

var addPresentation = function (presentation) {
  return new Promise((resolve, reject) => {
    if (presentation == null) {
      reject('presentation cannot be null.');
    }
    getPresentation(presentation.id)
      .then(storedPresentation => {
        if (storedPresentation == null) {
          return getAudience(presentation.audienceId);
        } else {
          reject('Presentation with the given ID does already exist.');
        }
      })
      .then(storedAudience => {
        if (storedAudience == null) {
          reject('Audience with the given ID does not exist.');
        } else {
          presentations.push(presentation);
          resolve();
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

var addOrUpdatePresentation = function (presentation) {
  return new Promise((resolve, reject) => {
    if (presentation == null) {
      reject('presentation cannot be null.');
    }
    getAudience(presentation.audienceId).then(storedAudience => {
      if (storedAudience == null) {
        reject('Audience with the given ID does not exist.');
      } else {
        for (let i = 0; i < presentations.length; i++) {
          if (presentations[i].id === presentation.id) {
            presentations[i] = presentation;
            resolve();
            return;
          }
        }
        presentations.push(presentation);
        resolve();
      }
    });
  });
};

var deletePresentation = function (presentationId) {
  return new Promise(resolve => {
    setTimeout(() => {
      for (let i = 0; i < presentations.length; i++) {
        if (presentations[i].id === presentationId) {
          presentations.splice(i, 1);
          break;
        }
      }
      resolve();
    });
  });
};

var getAudience = function (audienceId) {
  return new Promise((resolve, reject) => {
    if (audienceId == null) {
      reject('audienceId cannot be null.');
    }
    setTimeout(() => {
      for (let i = 0; i < audiences.length; i++) {
        if (audiences[i].id === audienceId) {
          resolve(audiences[i]);
          return;
        }
      }
      resolve(null);
    });
  });
};

var getAudiences = function () {
  return new Promise(resolve => {
    resolve(audiences);
  });
};

var getImages = function (presentationId) {
  return getPresentation(presentationId)
    .then(storedPresentation => {
      if (storedPresentation == null) {
        throw 'Presentation with the given ID does not exist.';
      } else {
        return new Promise(resolve => {
          resolve(storedPresentation.images);
        });
      }
    });
};

var getPresentation = function (presentationId) {
  return new Promise((resolve, reject) => {
    if (presentationId == null) {
      reject('presentationId cannot be null.');
    }
    setTimeout(() => {
      for (let i = 0; i < presentations.length; i++) {
        if (presentations[i].id === presentationId) {
          resolve(presentations[i]);
          return;
        }
      }
      resolve(null);
    });
  });
};

var getPresentationHeaders = function () {
  return new Promise(resolve => {
    setTimeout(() => {
      var result = [];
      for (let i = 0; i < presentations.length; i++) {
        result.push(new entities.PresentationHeader(
          presentations[i].id,
          presentations[i].title,
          presentations[i].audienceId
        ));
      }
      resolve(result);
    });
  });
};

var initialize = function (newCollectionPath, overwrite) {
  clear();
  collectionPath = newCollectionPath;
  return new Promise((resolve, reject) => {
    ioUtil.checkIfFileExists(collectionPath)
      .then(result => {
        if (result && overwrite) {
          fs.unlinkSync(collectionPath);
          resolve();
        } else if (result) {
          return loadCollection();
        } else {
          resolve();
        }
      })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

var setImages = function (presentationId, images) {
  return new Promise((resolve, reject) => {
    var presentation = getPresentation(presentationId)
      .then(() => {
        if (presentation != null) {
          presentation.images = images;
        }
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

var updatePresentation = function (id, newPresentation) {
  return new Promise(resolve => {
    setTimeout(() => {
      for (let i = 0; i < presentations.length; i++) {
        if (presentations[i].id === id) {
          presentations[i] = newPresentation;
          resolve();
          break;
        }
      }
    });
  });
};

var save = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      var xml = toPersistedCollection();
      fs.writeFile(
        collectionPath,
        xml,
        err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
};

function clear() {
  audiences = [];
  collectionPath = null;
  presentations = [];
}

function loadCollection() {
  return new Promise((resolve, reject) => {
    var parser = new xml2js.Parser();
    fs.readFile(
      collectionPath,
      function(err, data) {
        parser.parseString(data, (err, result) => {
          if (err) {
            reject(err);
          } else {
            fromPersistedCollection(result);
            resolve();
          }
        });
      }
    );
  });
}

/*******************************************************************************************************************//**
 * Data transformation -- From persisted.
 **********************************************************************************************************************/

function fromPersistedCollection(persistedData) {
  if (typeof persistedData.collection.audiences !== 'undefined') {
    let persistedAudiences = persistedData.collection.audiences[0].audience;
    audiences = fromPersistedAudiences(persistedAudiences);
  }

  if (typeof persistedData.collection.presentations !== 'undefined') {
    let persistedPresentations = persistedData.collection.presentations[0].presentation;
    presentations = fromPersistedPresentations(persistedPresentations);
  }
}

function fromPersistedAudiences(persistedAudiences) {
  var result = [];
  if (typeof persistedAudiences !== 'undefined') {
    for (let i = 0; i < persistedAudiences.length; i++) {
      result.push(fromPersistedAudience(persistedAudiences[i]));
    }
  }

  return result;
}

function fromPersistedAudience(persistedAudience) {
  var audience = new entities.Audience(persistedAudience.id[0], persistedAudience.name[0]);
  if (typeof persistedAudience.color !== 'undefined') {
    audience.color = persistedAudience.color[0];
  }
  return audience;
}

function fromPersistedPresentations(persistedPresentations) {
  var result = [];
  if (typeof persistedPresentations !== 'undefined') {
    for (let i = 0; i < persistedPresentations.length; i++) {
      result.push(fromPersistedPresentation(persistedPresentations[i]));
    }
  }

  return result;
}

function fromPersistedPresentation(persistedPresentation) {
  var presentation = new entities.Presentation(
    persistedPresentation.id[0],
    persistedPresentation.title[0],
    persistedPresentation.path[0],
    persistedPresentation.audienceId[0]
  );
  if (typeof persistedPresentation.images !== 'undefined') {
    presentation.images = fromPersistedImages(persistedPresentation.images[0].image);
  }
  if (typeof persistedPresentation.transformations !== 'undefined') {
    presentation.transformations = fromPersistedTransformations(persistedPresentation.transformations[0]);
  }
  return presentation;
}

function fromPersistedImages(persistedImages) {
  var result = [];
  if (typeof persistedImages !== 'undefined') {
    for (var i = 0; i < persistedImages.length; i++) {
      result.push(fromPersistedImage(persistedImages[i]));
    }
  }

  return result;
}

function fromPersistedImage(persistedImage) {
  var image = new entities.Image(persistedImage.name[0]);
  if (typeof persistedImage.description !== 'undefined') {
    image.description = persistedImage.description[0];
  }
  if (typeof persistedImage.transformations !== 'undefined') {
    image.transformations = fromPersistedTransformations(persistedImage.transformations[0]);
  }
  return image;
}

function fromPersistedTransformations(persistedTransformations) {
  var result = new entities.Transformations();
  if (typeof persistedTransformations !== 'undefined') {
    if (typeof persistedTransformations.rotate !== 'undefined') {
      let r = persistedTransformations.rotate[0];
      result.rotate = new entities.RotateTransformation(parseInt(r.degree[0]));
    }
    if (typeof persistedTransformations.scale !== 'undefined') {
      let s = persistedTransformations.scale[0];
      result.scale = new entities.ScaleTransformation(parseInt(s.width[0]), parseInt(s.height[0]));
    }
    if (typeof persistedTransformations.clean !== 'undefined') {
      result.clean = new entities.CleanTransformation();
    }
  }

  return result;
}

/*******************************************************************************************************************//**
 * Data transformation -- To persisted.
 **********************************************************************************************************************/

function toPersistedCollection() {
  var elCollection = xmlBuilder.create(
    'collection',
    {version: '1.0', encoding: 'UTF-8'},
    {pubID: null, sysID: null},
    {headless: false});
  toPersistedAudiences(audiences, elCollection);
  toPersistedPresentations(presentations, elCollection);
  elCollection = elCollection.end({ 'pretty': true, indent: '  ', newline: '\r\n' });

  return elCollection;
}

function toPersistedAudiences(audiences, parentElement) {
  var elAudiences = parentElement.ele('audiences');
  for (var i = 0; i < audiences.length; i++) {
    toPersistedAudience(audiences[i], elAudiences);
  }
}

function toPersistedAudience(audience, parentElement) {
  var elAudiences = parentElement.ele('audience');
  elAudiences.ele('id', audience.id);
  elAudiences.ele('name', audience.name);
  if (audience.color != null  && !audience.color.isEmptyOrWhitespace()) {
    elAudiences.ele('color', audience.color);
  }
}

function toPersistedPresentations(presentations, parentElement) {
  var elPresentations = parentElement.ele('presentations');
  for (var i = 0; i < presentations.length; i++) {
    toPersistedPresentation(presentations[i], elPresentations);
  }
}

function toPersistedPresentation(presentation, parentElement) {
  var elPresentation = parentElement.ele('presentation');
  elPresentation.ele('id', presentation.id);
  elPresentation.ele('title', presentation.title);
  elPresentation.ele('path', presentation.path);
  elPresentation.ele('audienceId', presentation.audienceId);

  if (presentation.transformations != null) {
    toPersistedTransformations(presentation.transformations, elPresentation);
  }
  if (presentation.images != null && presentation.images.length > 0) {
    toPersistedImages(presentation.images, elPresentation);
  }
}

function toPersistedImages(images, parentElement) {
  var elImages = parentElement.ele('images');
  for (var i = 0; i < images.length; i++) {
    toPersistedImage(images[i], elImages);
  }
}

function toPersistedImage(image, parentElement) {
  var elImage = parentElement.ele('image');
  elImage.ele('name', image.name);
  if (image.description != null && !image.description.isEmptyOrWhitespace()) {
    elImage.ele('description', image.description);
  }
  if (image.transformations != null) {
    toPersistedTransformations(image.transformations, elImage);
  }
}

function toPersistedTransformations(transformations, parentElement) {
  if (transformations.isReallyEmpty()) {
    return;
  }
  var elTransformations = parentElement.ele('transformations');
  if (transformations.scale != null) {
    let elScale = elTransformations.ele('scale');
    elScale.ele('width', transformations.scale.width);
    elScale.ele('height', transformations.scale.height);
  }
  if (transformations.rotate != null) {
    let elRotate = elTransformations.ele('rotate');
    elRotate.ele('degree', transformations.rotate.degree);
  }
  if (transformations.clean != null) {
    elTransformations.ele('clean');
  }
}

/*******************************************************************************************************************//**
 * Exports.
 **********************************************************************************************************************/

module.exports = {
  'addAudience': addAudience,
  'addPresentation': addPresentation,
  'addOrUpdatePresentation': addOrUpdatePresentation,
  'deletePresentation': deletePresentation,
  'getAudience': getAudience,
  'getAudiences': getAudiences,
  'getImages': getImages,
  'getPresentation': getPresentation,
  'getPresentationHeaders': getPresentationHeaders,
  'initialize': initialize,
  'save': save,
  'setImages': setImages,
  'updatePresentation': updatePresentation
};
