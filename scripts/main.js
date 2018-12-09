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
            highlightCode(yamlObject);
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

function highlightCode(yamlObject) {
    clearHighlights();
    let decorationList = [];
    decorationList.push({
        range: new monaco.Range(
            yamlObject.locationSpan.start[0],
            yamlObject.locationSpan.start[1],
            yamlObject.locationSpan.end[0],
            yamlObject.locationSpan.end[1]
        ),
        options: {
            isWholeLine: true,
            inlineClassName: 'gaps',
            zIndex: 0
        }
    });

    if (yamlObject.headerSpan != null) {
        let headerRange = calculateRangeFromSpan(yamlObject.headerSpan);
        decorationList.push({
            range: headerRange,
            options: {
                isWholeLine: true,
                inlineClassName: 'highlighted',
                zIndex: 2
            }
        });
    }

    if (yamlObject.footerSpan != null) {
        let footerRange = calculateRangeFromSpan(yamlObject.footerSpan);
        decorationList.push({
            range: footerRange,
            options: {
                isWholeLine: true,
                inlineClassName: 'highlighted',
                zIndex: 2
            }
        });
    }

    if (yamlObject.span != null) {
        let range = calculateRangeFromSpan(yamlObject.span);
        decorationList.push({
            range: range,
            options: {
                isWholeLine: true,
                inlineClassName: 'highlighted',
                zIndex: 2
            }
        });
    }
    
    if (yamlObject.children != null) {
        yamlObject.children.forEach(child => {
            decorationList.push({
                range: new monaco.Range(
                    child.locationSpan.start[0],
                    child.locationSpan.start[1],
                    child.locationSpan.end[0],
                    child.locationSpan.end[1]),
                options: {
                    isWholeLine: true,
                    inlineClassName: 'child',
                    zIndex: 3
                }
            });
        });
    }
    decorations = codeEditor.deltaDecorations(decorations, decorationList);
}

function clearHighlights() {
    if (decorations == null) {
        decorations = codeEditor.deltaDecorations([], [{ range: new monaco.Range(1, 1, 1, 1), options: {} }]);
    } else {
        decorations = codeEditor.deltaDecorations(decorations, [{ range: new monaco.Range(1, 1, 1, 1), options: {} }]);
    }
}

function calculateRangeFromSpan(span) {
    startRow = 1;
    startColumn = 0;
    endRow = 1;
    endColumn = 0;

    let code = codeEditor.getValue();
    if (span[0] != 0) {
        for (let i = 0; i < span[0]; i++) {
            let char = code[i];
            if (char == '\n') {
                startColumn = 0;
                startRow++;
            }
            startColumn++;
        }
        startColumn--;
    }
    if (span[1] == -1) {
        for (let i = 0; i < code.length; i++) {
            let char = code[i];
            if (char == '\n') {
                endColumn = 0;
                endRow++;
            }
            endColumn++;
        }
        endColumn--;
    } else if (span[1] != 0) {
        for (let i = 0; i < span[1]; i++) {
            let char = code[i];
            if (char == '\n') {
                endColumn = 0;
                endRow++;
            }
            endColumn++;
        }
        endColumn--;
    }
    return new monaco.Range(startRow, startColumn, endRow, endColumn);
}

function resizeEditors() {
    yamlEditor.layout();
    codeEditor.layout();
}