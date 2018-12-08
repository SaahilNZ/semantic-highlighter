var yaml;
var yamlEditor;
var codeEditor;
var decorations;
var treeNodes = [];

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
    name : Socket
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
        language: 'plaintext'
    });
});

function populateTree() {
    clearHighlights();
    try {
        var file = yaml.safeLoad(yamlEditor.getValue());
        
        let yamlTree = document.getElementById("yamlTree");
        while (yamlTree.firstChild) {
            yamlTree.removeChild(yamlTree.firstChild);
        }
        addTreeNodes(file, yamlTree);
    } catch (e) {
        console.log(e);
    }
}

function addTreeNodes(yamlObject, parentNode) {
    if (yamlObject != null) {
        let node = document.createElement("li");
        let nodeSpan = document.createElement("span");
        nodeSpan.classList.add("treeNode");
        nodeSpan.innerHTML = yamlObject.name;
        nodeSpan.addEventListener("click", function () {
            clearNodes();
            nodeSpan.classList.add("treeNodeSelected");
            highlightCode(new monaco.Range(
                yamlObject.locationSpan.start[0],
                yamlObject.locationSpan.start[1],
                yamlObject.locationSpan.end[0],
                yamlObject.locationSpan.end[1]
            ));
        });

        treeNodes.push(nodeSpan);
        node.appendChild(nodeSpan);
        parentNode.appendChild(node);
        if (yamlObject.children != null) {
            let branch = document.createElement("ul");
            parentNode.appendChild(branch);
            for (let index = 0; index < yamlObject.children.length; index++) {
                const child = yamlObject.children[index];
                addTreeNodes(child, branch);
            }
        }
    }
}

function clearNodes() {
    for (let index = 0; index < treeNodes.length; index++) {
        const node = treeNodes[index];
        node.classList.remove("treeNodeSelected");
    }
}

function highlightCode(range) {
    if (decorations == null) {
        decorations = codeEditor.deltaDecorations([], [
            { range: range, options: { isWholeLine: true, inlineClassName: 'highlighted' } }
        ]);
    } else {
        decorations = codeEditor.deltaDecorations(decorations, [
            { range: range, options: { isWholeLine: true, inlineClassName: 'highlighted' } }
        ]);
    }
}

function clearHighlights() {
    if (decorations == null) {
        decorations = codeEditor.deltaDecorations([], []);
    } else {
        decorations = codeEditor.deltaDecorations(decorations, []);
    }
}

function resizeEditors() {
    yamlEditor.layout();
    codeEditor.layout();
}