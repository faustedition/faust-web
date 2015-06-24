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
        method: "Page.navigate",
        params: {
          url: renderPageUrl
        }
      }));

    });


    // process messages emitted from chrome
    var processMessage = (function() {

      var processResult = function(message) {
        switch(message.id) {

          // page was opened, clear console messages (if exist)
          case 100:
            ws.send(JSON.stringify({
              id: 200,
              method: "Console.clearMessages",
            }
            ));
            break;

          // console stack is empty. start listening to console messages (if not already enabled)
          case 200:
            ws.send(JSON.stringify({
              id: 300,
              method: "Console.enable",
            }
            ));
            break;

          // listening to console messages. generate diplomatic transcript svg
          case 300: 
            ws.send(JSON.stringify({
              id: 400,
              method: "Runtime.evaluate",
              params: {
                expression: "transcriptGeneration.createDiplomaticSvg(" + transcriptString + ", function(diplomaticSvg) {console.log(\"diplomatic svg rendering complete\"); window.diplomaticSvg = diplomaticSvg});"
              }
            }
            ));
            break;

          // received diplomatic svg result. write result to file and generate facsimile overlay svg
          case 500:
            result.diplomaticSvg = message.result.result.value;
            //fs.writeFileSync(diplomaticTranscriptSvgFilename, message.result.result.value);
            if(imageTextLinkString !== undefined) {
              ws.send(JSON.stringify({
                id: 600,
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

          // generated and received facsimile overlay svg. return result to callback and exit
          case 600:
            result.facsimileOverlaySvg = message.result.result.value;
            ws.close();
            callback(result);
            break;

          default:
            //console.log(message);
            break;
        }
      };

      // process method result emitted from chrome
      var processMethod = function(message) {
        switch(message.method) {
          case "Console.messageAdded":
            if(message.params.message.text === "diplomatic svg rendering complete") {
              // diplomatic transcript was generated. fetch result
              ws.send(JSON.stringify({
                id: 500,
                method: "Runtime.evaluate",
                params: {
                    expression: "(function(){return window.diplomaticSvg.outerHTML;})();"
                }
              }
              ));
            }
            break;
        }
      };
    
      // preocess chrome messages
      return function(message) {
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





/*

(function(){
  "use strict";

  var fs = require("fs");

  var renderPageUrl = "http://127.0.0.1/new2/!!00_non_release/5_node_chrome_transcript_generations/page/transcript-generation_sole2.html";
  var transcript = fs.readFileSync("./page/0002.json", "utf-8");
  var imageTextLink = fs.readFileSync("./page/0002.svg", "utf-8");

  var diplomaticTranscriptSvgFilename = "a1";
  var facsimileOverlaySvgFilename = "a2";

  renderSvgContent(transcript, imageTextLink, renderPageUrl, function(result) {console.log(result);});



})();

*/
