Function.prototype.method = function (name, func) {
  if (!this.prototype[name]) {
    this.prototype[name] = func;
  }
};

Object.method('isEmpty', function() {
  for (let key in this) {
    if (this.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
});

String.method('isEmptyOrWhitespace', function() {
  if (this.trim() === '') {
    return true;
  }
  return false;
});

Object.method('isReallyEmpty', function() {
  for (let key in this) {
    if (this.hasOwnProperty(key) && this[key] != null) {
      return false;
    }
  }
  return true;
});
