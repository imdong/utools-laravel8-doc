const fs = require('fs');
const marked = require('marked');
const hljs = require("highlight");

fs.readFile('./data.html', (err, buffer) => {
    let data = buffer.toString();

    matchStyle(data);
});

fs.readFile('./md_docs/validation.md', (err, buffer) => {
    let data = buffer.toString();

    mdToHtml(data);
});


function matchStyle(html) {
    let regex = '<link\\s*href="([^"]+)"';

    html.match(new RegExp(regex, 'g')).map(item => {
        let style_url = item.match(new RegExp(regex))[1],
            style_name = style_url.split('/').pop();

        console.log(style_url, style_name);

        // 下载并保存至文件
    })
}

function matchTranslator(html) {
    // ^\s+<a\s*href="([^"]+)">[^<]+<img[^>]+title="([^"]+)"[^>]+>\s+<\/a>
}

function mdToHtml(md) {
    let html = marked(md);
    html = hljs.Highlight(html, false, true);

    console.log(html)
}