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

    var decorations = editor.deltaDecorations([], [
        { range: new monaco.Range(1, 0, 12, 1), options: { isWholeLine: true, inlineClassName: 'semanticClass' } },
        { range: new monaco.Range(3, 0, 7, 2), options: { isWholeLine: true, inlineClassName: 'semanticMethod' } },
        { range: new monaco.Range(8, 0, 11, 6), options: { isWholeLine: true, inlineClassName: 'semanticMethod' } }
    ]);
});