/*global angular */

var checkForm = function (form) {
  var isInvalid = false;
  angular.forEach(form, (element, name) => {
    if (!name.startsWith('$') && element.$dirty && element.$invalid) {
      isInvalid = true;
      return;
    }
  });
  return !isInvalid;
};

module.exports = {
  'checkForm': checkForm
};
