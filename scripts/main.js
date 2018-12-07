var yaml;
var editor;

require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.15.6/min/vs'
    }
});

require(['vs/editor/editor.main', 'lib/js-yaml.min'], function () {
    yaml = require('lib/js-yaml.min');
    editor = monaco.editor.create(document.getElementById('container'), {
        value:
            'class Socket\r\n{\r\n   void Connect(string server)\r\n   {\r\n      SocketLibrary.Connect(mSocket, server);\r\n   }\r\n\r\n   void Disconnect()\r\n   {\r\n      SocketLibrary.Disconnect(mSocket);\r\n   }\r\n}',
        language: 'csharp'
    });
});

function getDecorationsFromYaml(yamlText) {
    let decorations = [];
    try {
        var file = yaml.safeLoad(yamlText);
        for (let fileChildIndex = 0; fileChildIndex < file.children.length; fileChildIndex++) {
            const element = file.children[fileChildIndex];
            if (element.type == "class") {
                let decoration = {
                    range: new monaco.Range(element.locationSpan.start[0], element.locationSpan.start[1],
                        element.locationSpan.end[0], element.locationSpan.end[1]),
                    options: {
                        isWholeLine: true,
                        inlineClassName: 'semanticClass'
                    }
                }
                decorations.push(decoration);
            }

            for (let methodChildIndex = 0; methodChildIndex < element.children.length; methodChildIndex++) {
                const elementChild = element.children[methodChildIndex];
                if (elementChild.type = "method") {
                    let decoration = {
                        range: new monaco.Range(elementChild.locationSpan.start[0], elementChild.locationSpan.start[1],
                            elementChild.locationSpan.end[0], elementChild.locationSpan.end[1]),
                        options: {
                            isWholeLine: true,
                            inlineClassName: 'semanticMethod'
                        }
                    }
                    decorations.push(decoration);
                }
            }
        }
        return decorations;
    } catch (e) {
        console.log(e);
    }
}

function highlightCode() {
    var yamlText = `
type: file
name: FooSocket.csharp
locationSpan : {start: [1, 0], end: [12, 1]}
footerSpan : [0,-1]
parsingErrorsDetected : false
children:

  - type : class
    name : name of the first container
    locationSpan : {start: [1, 0], end: [12, 1]}
    headerSpan : [0, 16]
    footerSpan : [186, 186]
    children :

    - type : method
      name : Connect
      locationSpan : {start: [3, 0], end: [7,2]}
      span : [17, 109]

    - type : method
      name : Disconnect
      locationSpan : {start: [8,0], end: [11,6]}
      span : [110, 185]
        `;

    let decorations = editor.deltaDecorations([], getDecorationsFromYaml(yamlText));
}