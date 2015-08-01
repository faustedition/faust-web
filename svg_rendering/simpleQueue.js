var createSimpleQueue = function(consumer, maxParallelTasks, pollInterval) {
  "use strict";

  var queue = [];
  
  var simpleQueue = {};
  var runningTasks = 0;

  simpleQueue.push = function(data) {
    queue.push(data);
    processQueue();
  };

  simpleQueue.getLength = function() {
    return queue.length;
  };

  var processQueue = function() {
    if(queue.length > 0) {
      if(runningTasks < maxParallelTasks) {
        var data = queue.shift();
        runningTasks = runningTasks + 1;
        consume(data);
        processQueue();
      } else {
        setTimeout(processQueue, pollInterval);
      }
    }
  };

  var signalEndedTask = function() {
    runningTasks = runningTasks - 1;
    processQueue();
  };

  var consume = function(data) {
    consumer(data, signalEndedTask);
  };

  return simpleQueue;
};

module.exports = createSimpleQueue;
