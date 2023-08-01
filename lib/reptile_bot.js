const { exit } = require('process');

(function (module) {
    const fs = require('fs');
    const axios = require('axios').default;
    const $ = require('cheerio');
    const marked = require('marked');
    const Highlight = require("highlight");

    /**
     * 爬虫主体
     */
    class Bot {

        /**
         * 基础配置信息
         */
        options = {
            source_url: 'https://learnku.com/docs/laravel',
            cookies: null,
            doc_tpl_path: './doc_template.html',
            doc_tpl: '',
            md_path: './docs/md',
            style_path: './plugin/style',
            doc_path: './plugin/docs',
            cheatsheet_path: './plugin/cheatsheets',
            use_cache: false,
            highlight_style: 'idea'
        }

        /**
         * Axios 配置项
         */
        axios_options = {
            headers: {
                cookie: null
            }
        }

        /**
         * 加载回来的页面列表
         */
        page_list = [];

        /**
         * 译者列表
         */
        translator_list = [];

        /**
         * 速查表列表
         */
        cheatsheet_list = [];

        /**
         * 构建函数
         *
         * @param {Object} config
         */
        constructor(config) {
            Object.assign(this.options, config);
        }

        /**
         * 启动爬虫
         */
        run() {
            if (!this.options.cookies) {
                throw new Error('必须配置 learnku.com 的 Cookies');
            }

            // 设置 Cookies
            this.axios_options.headers.cookie = this.options.cookies

            // 初始化相关目录
            this.initDir();

            // 初始化代码高亮功能
            Highlight.init(
                (err) => { },
                ['php'],
                { classPrefix: 'token ' }
            );
            marked.setOptions({
                highlight: function (code, lang, callback) {
                    let hcode = Highlight.highlight(code, false);

                    let dom = $.load('<div>' + hcode + '</div>');

                    dom('span').addClass('token');

                    return dom('div').html();
                }
            });
        }

        /**
         * 初始化目录
         */
        initDir() {
            // 需要初始化的目录列表
            let that = this,
                path_list = [
                    this.options.md_path,
                    this.options.style_path,
                    this.options.doc_path,
                    this.options.cheatsheet_path
                ];

            function mkdir(index) {
                let path = path_list[index++];
                if (!path) {
                    that.initTemplate();
                    return;
                }

                fs.mkdir(path, { recursive: true }, (err, result) => {
                    mkdir(index)
                })
            }
            mkdir(0);
        }

        /**
         * 初始化模板
         */
        initTemplate() {
            fs.readFile(this.options.doc_tpl_path, (err, buffer) => {
                this.options.doc_tpl = buffer.toString();
                this.loadMenu();
            })
        }

        /**
         * 加载目录
         */
        loadMenu() {
            console.log('load Menu');

            // 加载文档
            axios.get(this.options.source_url + '/10.x', this.axios_options).then((response) => {
                const dom = $.load(response.data);

                // 获取译者
                this.getTranslator(dom);
                // console.log('Translator', this.translator_list)

                // this.updateReadme();
                // return;

                // 获取页面样式表
                this.matchStyle(dom);

                // 获取页面列表
                this.getPageList(dom);
            });

            // 加载速查表
            axios.get('https://learnku.com/docs/laravel-cheatsheet/10.x', this.axios_options).then(response => {
                const dom = $.load(response.data);

                this.getCheatsheet(dom);
            });

        }

        /**
         * 获取译者
         */
        getTranslator($) {
            $('.book .text-center a').each((index, element) => {
                this.translator_list.push({
                    title: $(element).find('img').attr('title'),
                    url: $(element).attr('href'),
                    img: $(element).find('img').attr('src')
                })
            });
        }

        /**
         * 匹配页面 样式表
         * @param {*} html
         */
        matchStyle($) {
            let style_list = [
                '<link rel="stylesheet" href="../style/' + this.options.highlight_style + '.css">'
            ];

            // 复制文件
            fs.copyFile(
                'node_modules/highlight/lib/vendor/highlight.js/styles/' + this.options.highlight_style + '.css',
                this.options.style_path + '/' + this.options.highlight_style + '.css',
                (err) => { }
            )

            $('link').map((index, item) => {
                if ($(item).attr('rel') == 'stylesheet') {
                    let style_url = $(item).attr('href'),
                        style_name = style_url.split('/').pop(),
                        style_path = this.options.style_path + '/' + style_name;

                    // 保存样式表模板
                    style_list.push('<link rel="stylesheet" href="../style/' + style_name + '">');

                    // 下载并保存至文件
                    fs.stat(style_path, (err, stat) => {
                        if (!err && this.options.use_cache) {
                            return;
                        }
                        axios.get(style_url, this.axios_options).then((response) => {
                            fs.writeFile(style_path, response.data, () => { });
                        })
                    })
                }
            });

            // 替换到模板
            this.options.doc_tpl = this.options.doc_tpl.replace('{LinkStyles}', style_list.join("\n"));

            // console.log('Style List', style_list)
        }

        /**
         * 获取页面地址
         */
        getPageList($) {
            // 页面列表
            $('ol.sorted_table ol.chapter-container li.item').each((index, element) => {
                let item_id = $(element).data('itemid'),
                    page_url = $(element).find('a').attr('href'),
                    page_name = page_url.split('/')[6];

                this.page_list.push({
                    id: item_id,
                    name: page_name,
                    md_url: this.options.source_url + '/' + item_id + '.md',
                    md_path: this.options.md_path + '/' + page_name + '.md',
                    doc_path: this.options.doc_path + '/' + page_name + '.html'
                });
            });

            // console.log('Page List', this.page_list)

            // 逐个加载
            this.loadPage();
        }

        /**
         * 处理速查表
         */
        getCheatsheet($) {
            // 遍历所有的
            $('.articles-column .column.cheatsheet-article').each((index, column) => {
                // 获取主要标题
                let h2 = $(column).find('.content h2'),
                    title = $(h2[0]).text(),
                    contents = [];

                console.log('load Cheatsheet', title);

                // 分 两种方式 获取代码内容
                let h3_list = $(column).find('.content h3');
                if (h3_list.length > 0) {
                    h3_list.each((index, h3) => {
                        let code_str = $(h3).next().find('code').text()
                            .replace(/^([^\n]+)$/mg, "    $1");
                        contents.push(
                            "## " + $(h3).text() + "\n\n" + code_str
                        );
                    });
                } else {
                    $(column).find('.content code').each((index, code) => {
                        let code_str = $(code).text().replace(/^([^\n]+)$/mg, "    $1");
                        contents.push(code_str);
                    })
                }

                // 直接编译吧
                let item = {
                    name: title,
                    md_body: "# " + title + "\n\n" + contents.join("\n\n"),
                    doc_path: this.options.cheatsheet_path + '/' + title + '.html'
                };

                // 追加到列表
                this.cheatsheet_list.push(item);
            })
        }

        /**
         * 加载指定页面
         *
         * @param {Int} index
         */
        loadPage(index) {
            index = index || 0;
            let bot = this,
                item = this.page_list[index];

            if (!item) {
                this.buildIndexs();
                return;
            }

            console.log('load Page', item.name);

            // 检查本地文件是否存在
            fs.stat(item.md_path, (err, stat) => {
                if (err || !this.options.use_cache) {
                    // 下载 md 文件
                    axios.get(item.md_url, this.axios_options).then((response) => {
                        // 判断类型
                        if (response.headers['content-type'].split(';')[0] != 'text/x-markdown') {
                            const dom = $.load(response.data);
                            let title = dom('title').text().trim();
                            throw new Error('未能读取到 Markdown: (' + title + ')');
                        }

                        // 保存到文件
                        fs.writeFile(item.md_path, response.data, (err, fd) => { });

                        // 处理内容
                        this.parseBody(response.data, item)

                        // 控制频率 每次休息 1 秒
                        setTimeout(() => {
                            bot.loadPage(++index);
                        }, 1000);
                    })
                } else {
                    fs.readFile(item.md_path, (err, buffer) => {
                        // 处理内容
                        this.parseBody(buffer.toString(), item)
                        // 开始下一次
                        bot.loadPage(++index);

                    })
                }
            });
        }

        /**
         * 处理页面内容
         * @param {*} body
         * @param {*} item
         */
        parseBody(body, item) {
            // 处理页面信息
            item.title = body.match(/^#\s*([^\r\n]+)/m)[1];
            item.md_body = body;

            // 编译代码
            this.buildDocs(body, item);
        }

        /**
         * 生成索引
         */
        buildIndexs() {
            // 文档的索引
            let indexs = [];
            this.page_list.forEach((item, index) => {
                indexs.push({
                    t: item.name + ' (' + item.title + ')',
                    d: item.md_body,
                    p: 'docs/' + item.name + '.html'
                })
            });
            fs.writeFile('./plugin/docs-indexes.json', JSON.stringify(indexs), () => { });

            // 速查表 这时候在编译吧
            indexs = [];
            this.cheatsheet_list.forEach((item, index) => {
                // 编译文档
                this.buildDocs(item.md_body, item);
                // 保存列表
                indexs.push({
                    t: item.name,
                    d: item.md_body,
                    p: 'cheatsheets/' + item.name + '.html'
                })
            })
            fs.writeFile('./plugin/cheatsheets-indexes.json', JSON.stringify(indexs), () => { });

            // 更新说明文档
            this.updateReadme();
        }

        /**
         * 更新说明
         */
        updateReadme() {
            console.log('更新版本号');

            let last_version = '0.0.0';

            // 更新版本信息
            fs.readFile('./plugin/plugin.json', (err, buffer) => {
                let data = JSON.parse(buffer.toString()),
                    version = data.version.split('.');

                version[2] = parseInt(version[2]) + 1;
                data.version = last_version = version.join('.');

                fs.writeFile('./plugin/plugin.json', JSON.stringify(data, null, '    '), () => {
                    console.log('插件 Version 已更新')
                })
            });

            // 更新插件说明
            fs.readFile('./plugin/README.md', (err, buffer) => {
                let body = buffer.toString(),
                    authors = [],
                    date = new Date(),
                    date_map = {
                        'Y': date.getFullYear(),
                        'm': (date.getMonth() + 1).toString().padStart(2, 0),
                        'd': date.getDate().toString().padStart(2, 0),
                        'H': date.getHours().toString().padStart(2, 0),
                        's': date.getMinutes().toString().padStart(2, 0)
                    };

                this.translator_list.forEach(item => {
                    authors.push(item.title.replace(/^([^\s]+)/, '- [$1](' + item.url + ')'))
                })

                body = body.replace(
                    /^最后同步日期:\s*`[^`]+`/m,
                    '最后同步日期: `Y-m-d H:s`'.replace(/[a-zA-Z]/g, key => {
                        return date_map[key];
                    })
                ).replace(
                    /^##\s*参与译者[^>]+/m,
                    '## 参与译者: ' + this.translator_list.length + "\n\n" + authors.join("\n") + "\n\n"
                ).replace(
                    /^[\s\r\n]+##\s*版权声明/m,
                    "- `" + last_version + " (Y-m-d)`: 同步文档\n\n## 版权声明".replace(/[a-zA-Z]/g, key => {
                        return date_map[key];
                    })
                );

                // 保存到文件
                fs.writeFile('./plugin/README.md', body, () => {
                    console.log('插件 README.md 已更新')
                });
            });


        }

        /**
         *  编译为 html
         */
        buildDocs(md_body, item) {
            // 转换 url [Laravel 支持的](/docs/laravel/9.x/database#introduction)
            md_body = md_body.replace(/\/docs\/laravel\/9\.x\/([^#\)]+)/g, (full, match) => {
                return match + '.html';
            });

            // 编译为 html
            let html = marked(md_body);

            // 替换模板
            html = this.options.doc_tpl.replace('{MarkdownBody}', html);

            // 保存文件
            fs.writeFile(item.doc_path, html, (err, fd) => { });
        }
    }

    module.exports = Bot;
})(module)
