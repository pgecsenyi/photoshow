var processArguments = function (args) {
  let isInDebugMode = false, isMultiThreaded = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] == '-d' || args[i] == '--debug') {
      isInDebugMode = true;
    } else if (args[i] == '-m' || args[i] == '--multithread') {
      isMultiThreaded = true;
    }
  }

  return {
    'isInDebugMode': isInDebugMode,
    'isMultiThreaded': isMultiThreaded
  };
};

module.exports = processArguments;
