var yaml;
var yamlEditor;
var codeEditor;

require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.15.6/min/vs'
    }
});

require(['vs/editor/editor.main', 'lib/js-yaml.min'], function () {
    yaml = require('lib/js-yaml.min');
    var yamlText = `type: file
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
      span : [110, 185]`;
    yamlEditor = monaco.editor.create(document.getElementById('yamlContainer'), {
        value: yamlText,
        language: 'yaml'
    });
    
    var codeText = 'class Socket\r\n{\r\n   void Connect(string server)\r\n   {\r\n      SocketLibrary.Connect(mSocket, server);\r\n   }\r\n\r\n   void Disconnect()\r\n   {\r\n      SocketLibrary.Disconnect(mSocket);\r\n   }\r\n}';
    codeEditor = monaco.editor.create(document.getElementById('codeContainer'), {
        value: codeText,
        language: 'csharp'
    });
});

function getDecorationsFromYaml(yamlText) {
    let decorations = [];
    try {
        var file = yaml.safeLoad(yamlText);
        traverseYaml(file, decorations);
        return decorations;
    } catch (e) {
        console.log(e);
    }
}

function traverseYaml(root, decorations) {
    let decoration = {
        range: new monaco.Range(root.locationSpan.start[0], root.locationSpan.start[1],
            root.locationSpan.end[0], root.locationSpan.end[1]),
        options: {
            isWholeLine: true
        }
    }
    switch (root.type) {
        case "class":
            decoration.options.inlineClassName = 'semanticClass';
            break;
        case "method":
            decoration.options.inlineClassName = 'semanticMethod';
            break;
    
        default:
            break;
    }
    decorations.push(decoration);
    if (root.children != null) {
        for (let index = 0; index < root.children.length; index++) {
            const child = root.children[index];
            traverseYaml(child, decorations);
        }
    }
}

function highlightCode() {
    let decorations = codeEditor.deltaDecorations([], getDecorationsFromYaml(yamlEditor.getValue()));
}

function resizeEditors() {
    yamlEditor.layout();
    codeEditor.layout();
}