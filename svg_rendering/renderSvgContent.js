var renderSvgContent = function(transcriptString, imageTextLinkString, renderPageUrl, callback) {
  "use strict";

  var http = require('http');
  var WebSocket = require('ws');

  var result = {};

  var getChromiumTabs = function(chromiumTabsConsumer) {
  
    var debuggerJsonRequest = http.request({
      hostname: "127.0.0.1",
      port: 9222,
      path: "/json",
      method: "GET"
    }, function(response) {
      response.setEncoding("UTF-8");
      var responseText = "";

      // As long as data arrives, append to responseText String
      response.on('data', function(chunk) {
        responseText = responseText + chunk;
      });

      // All data arrived. Get on with processing
      response.on('end', function() {
        chromiumTabsConsumer(JSON.parse(responseText));
      });
    });

    // If there is an error while getting tabs write a message
    debuggerJsonRequest.on('error', function() {
      console.log("Error calling/receiving chromium tabs");
    });

    debuggerJsonRequest.end();
  
  };

  getChromiumTabs(function(tabs) {
    // opened connection to chrome instance
    var ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

    ws.on("open", function() {

      // open page where svg's will be rendered in
      ws.send(JSON.stringify({
        id: 100,
        method: "Page.enable"
      }));

    });


    // process messages emitted from chrome
    var processMessage = (function() {

      var processResult = function(message) {
//console.log(message.id);
        switch(message.id) {

          case 100:
            ws.send(JSON.stringify({
              id: 200,
              method: "Network.clearBrowserCache",
              params: {
                url: renderPageUrl
              }
            }));
            ws.send(JSON.stringify({
              id: 300,
              method: "Network.setCacheDisabled",
              params: {
                cacheDisabled: true
              }
            }));
            break;

          case 300:
            ws.send(JSON.stringify({
              id: 400,
              method: "Page.navigate",
              params: {
                url: renderPageUrl
              }
            }));
            break;

          case 600:
            if(message.result.wasThrown === true) {
              result.error = message.result.exceptionDetails;
              ws.close();
              callback(result);
            }
            break;

          case 700:
            result.diplomaticSvg = message.result.result.value;
            if(imageTextLinkString !== undefined) {
              ws.send(JSON.stringify({
                id: 800,
                method: "Runtime.evaluate",
                params: {
                    expression: "var imageTextLink = \"" + escape(imageTextLinkString) + "\"; (function() {window.facsimileOverlaySvg = transcriptGeneration.createFacsimileOverlaySvg(window.diplomaticSvg, unescape(imageTextLink)); return window.facsimileOverlaySvg.outerHTML;})();"
                }
              }));
            } else {
              ws.close();
              callback(result);
            }
            break;

          case 800:
            if(message.result.wasThrown === true) {
              result.error = message.result.exceptionDetails;
            } else {
              result.facsimileOverlaySvg = message.result.result.value;
            }
            ws.close();
            callback(result);
            break;
        }
      };

      // process method result emitted from chrome
      var processMethod = function(message) {

        switch(message.method) {
          case "Page.domContentEventFired":
            ws.send(JSON.stringify({
              id: 500,
              method: "Console.enable"
            }));
            ws.send(JSON.stringify({
              id: 600,
              method: "Runtime.evaluate",
              params: {
                expression: "transcriptGeneration.createDiplomaticSvg(" + transcriptString + ", function(diplomaticSvg) {console.log(\"diplomatic svg rendering complete\"); window.diplomaticSvg = diplomaticSvg});"
              }
            }));
            break;

          case "Console.messageAdded":
            if(message.params.message.text === "diplomatic svg rendering complete") {
              ws.send(JSON.stringify({
                id: 700,
                method: "Runtime.evaluate",
                params: {
                    expression: "(function(){return window.diplomaticSvg.outerHTML;})();"
                }
              }));
            }
            break;

        }
      };
    
      // preocess chrome messages
      return function(message) {
//console.log(message);
        message = JSON.parse(message);

        if(message.result) {
          processResult(message);
        }

        if(message.method) {
          processMethod(message);
        }
      };
    
    })();

    // start listening to chrome
    ws.on("message", processMessage);

  });

};

module.exports = renderSvgContent;
