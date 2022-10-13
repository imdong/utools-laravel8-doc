# 编译前端资源（Mix）

- [简介](#introduction)
- [安装 & 设置](#installation)
- [运行 Mix](#running-mix)
- [使用样式表](#working-with-stylesheets)
    - [Tailwind CSS](#tailwindcss)
    - [PostCSS](#postcss)
    - [Sass](#sass)
    - [URL 处理](#url-processing)
    - [资源映射](#css-source-maps)
- [使用 JavaScript](#working-with-scripts)
    - [Vue](#vue)
    - [React](#react)
    - [Vendor 提取](#vendor-extraction)
    - [自定义 Webpack 配置](#custom-webpack-configuration)
- [版本控制 / 缓存清除](#versioning-and-cache-busting)
- [Browsersync 重新加载](#browsersync-reloading)
- [环境变量](#environment-variables)
- [通知](#notifications)

<a name="introduction"></a>
## 简介

[Laravel Mix](https://github.com/laravel-mix/laravel-mix) 是一个由 [Laracasts](https://laracasts.com) 所开发的拓展包，作者 Jeffrey Way 。其使用了常见的 CSS 和 JavaScript 预处理器，为定义 [webpack](https://webpack.js.org) 构建步骤提供了流畅的 API。

换句话说，Mix 使您可以轻松地编译和压缩应用程序中的 CSS 和 JavaScript 文件。通过链式调用这些简洁方法，可以流畅地定义资源管道。例如：

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

如果您曾经对使用 Webpack 和资源编译感到困惑和不知所措，那么你一定会喜欢 Laravel Mix。但你不一定非要使用它来开发应用，你可以使用你喜欢的任何资源管道工具，甚至干脆不用。

> 技巧：如果您需要先开始使用 Laravel 和 [Tailwind CSS](https://tailwindcss.com) 构建应用程序，请查看我们的 [应用程序入门工具包](/docs/laravel/9.x/starter-kits)。

<a name="installation"></a>
## 安装 & 配置

<a name="installing-node"></a>


#### 安装 Node

在运行 Mix 之前，要先确保您的机器上已经安装了 Node.js 和 NPM：

```shell
node -v
npm -v
```

您可以从 [Node 官网](https://nodejs.org/en/download/) 使用图形化安装器轻松安装最新版本的  Node 和 NPM。或者，如果您使用的是 [Laravel Sail](/docs/laravel/9.x/sail) 则可以通过  Sail 调用 Node 和 NPM：

```shell
./sail node -v
./sail npm -v
```

<a name="installing-laravel-mix"></a>
#### 安装 Laravel Mix

剩下的事就是安装 Laravel Mix。在全新安装的 Laravel 中，您会在应用目录结构的根目录中找到 `package.json` 文件。 默认的 `package.json` 包含了使用 Laravel Mix 所需要的所有东西。 您可以把它想象成为 `composer.json` 文件，只是它定义的是 Node 依赖而不是 PHP 依赖。您可以像这样来安装依赖：

```shell
npm install
```

<a name="running-mix"></a>
## 运行 Mix

Mix 是 [webpack](https://webpack.js.org) 的顶层配置，因此如果您要执行 Mix 任务，您只需要执行一条被包含于 Laravel 默认的 `package.json` 文件中的 NPM 脚本。当您运行 `dev` 或 `production` 脚本时， 应用程序的所有 CSS 和 JavaScript 资源文件都将被编译并放置在应用程序的 `public` 目录中：

```shell
// 运行所有的 Mix 任务…
npm run dev

// 运行所有的 Mix 任务并最小化输出…
npm run prod
```

<a name="watching-assets-for-changes"></a>
#### 监听静态资源的变化



`npm run watch` 命令将会在您的终端中持续运行，并监听所有相关的 CSS 和 JavaScript 文件的修改。当发现文件有任何改动时， Webpack 将会自动重新编译它们：

```shell
npm run watch
```

您会发现在特定的环境下， 文件的修改并不会触发 Webpack 的更新。如果在您的系统中发生了这样的事，您可以考虑使用 `watch-poll` 命令:

```shell
npm run watch-poll
```

<a name="working-with-stylesheets"></a>
## 使用样式表

`webpack.mix.js` 是所有静态资源编译的入口。 您可以将其看成是 [webpack](https://webpack.js.org) 的轻量配置封装。Mix 任务能够与定义了静态资源的编译方式的配置一起被链式调用。

<a name="tailwindcss"></a>
### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com) 是一种实用程序优先的现代框架，可在不离开 HTML 的情况下构建出色的网站。让我们研究一下如何在 Laravel Mix 的 Laravel 项目中开始使用它。首先，我们应该使用 NPM 安装 Tailwind 并生成我们的 Tailwind 配置文件：

```shell
npm install

npm install -D tailwindcss

npx tailwindcss init
```

 `init` 命令将生成一个 `tailwind.config.js` 文件。该文件的 `content` 部分允许您配置所有 HTML 模板、JavaScript 组件和任何其他包含 Tailwind 类名称的源文件的路径，以便 Tailwind 在优化生产环境中的 CSS 时，可以削减未使用的样式：

```js
content: [
    './storage/framework/views/*.php',
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
],
```



接下来，您应该将 Tailwind 的每个「层」添加到应用中的 `resources/css/app.css` 文件：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

配置 Tailwind 的层后，请更新应用中的 `webpack.mix.js` 文件，如此便可编译 Tailwind 支持的 CSS：

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [
        require('tailwindcss'),
    ]);
```

最后，您应当在应用的主布局模板中引用您的样式表。很多应用都将该模板存储于 `resources/views/layouts/app.blade.php` 中。此外，如果它还未正常显示，请确保您已经添加了 `meta` 标签：

```blade
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/css/app.css" rel="stylesheet">
</head>
```

<a name="postcss"></a>
### PostCSS

[PostCSS](https://postcss.org/) 是一个强大的工具，它可以转换您的 CSS ，它已经包含在 Laravel Mix 中，并可开箱即用。默认情况下，Mix 利用流行的 [Autoprefixer](https://github.com/postcss/autoprefixer) 插件来自动附加所有必要的 CSS3 前缀。当然，您亦可自由地添加任何应用所需的附加组件。

首先，通过 NPM 安装所需的插件。然后，在调用 Mix 的 `postCss` 方法的时候，将其添加到您的插件数组中。 `postCss` 方法的第一个参数为 CSS 文件的路径，第二个参数为编译后的文件的位置路径：

```js
mix.postCss('resources/css/app.css', 'public/css', [
    require('postcss-custom-properties')
]);
```

或者，为了实现简单的 CSS 的编译和压缩，您可以在不使用其他插件的情况下执行 `postCss` :

```js
mix.postCss('resources/css/app.css', 'public/css');
```



<a name="sass"></a>
### Sass

`sass` 方法允许您将 [Sass](https://sass-lang.com/) 编译成 Web 浏览器可以理解的 CSS 文件。`sass` 方法的第一个参数是您的 Sass 文件的路径，第二个参数是编译后的文件的存储路径：

```js
mix.sass('resources/sass/app.scss', 'public/css');
```

您可以将多个 Sass 文件编译成各自的 CSS 文件，甚至可以通过多次调用 `sass` 方法来自定义生成的 CSS 的输出目录：

```js
mix.sass('resources/sass/app.sass', 'public/css')
    .sass('resources/sass/admin.sass', 'public/css/admin');
```

<a name="url-processing"></a>
### URL 处理

因为 Laravel Mix 是基于 Webpack 之上构建的，所以了解几个 webpack 的概念就很重要了。对于 CSS 编译，webpack 将会重写和优化在样式表中的任何 `url()` 调用。虽然初听起来很奇怪，但这确实是一个很强大的功能。想象一下我们想要编译包含图片相对 URL 的 Sass：

```css
.example {
    background: url('../images/example.png');
}
```

> 注意：任何给定 `url()` 的绝对路径将被排除在 URL 重写之外。例如， `url('/images/thing.png')` 或 `url('http://example.com/images/thing.png')` 将不会作任何修改。

默认情况下，Laravel Mix 和 Webpack 将会寻找到 `example.png`，并将其复制到您的 `public/images` 文件夹中，然后重写生成的样式表中的 `url()` 。如此一来，编译后的 CSS 将变为：

```css
.example {
    background: url(/images/example.png?d41d8cd98f00b204e9800998ecf8427e);
}
```

<a name="css-source-maps"></a>
### 源码映射

Source map 默认是关闭的，你可以在 `webpack.mix.js` 文件中调用 `mix.sourceMaps()` 方法来打开 Source map 功能。尽管这会给前端编译带来一些性能负担，但是在使用浏览器调试时就会很方便找到对应的代码:

```js
mix.js('resources/js/app.js', 'public/js')
    .sourceMaps();
```

<a name="style-of-source-mapping"></a>
#### 源码映射样式

Webpack 提供了多种 [源码映射样式](https://webpack.js.org/configuration/devtool/#devtool)。在默认情况下 Mix 的源码映射使用 `eval-source-map`模式，它快速构建非常快。 如果你想更改映射样式可以使用 `sourceMaps` 方法:

```js
let productionSourceMaps = false;

mix.js('resources/js/app.js', 'public/js')
    .sourceMaps(productionSourceMaps, 'source-map');
```

<a name="working-with-scripts"></a>
## 使用 JavaScript

Mix 提供了多种功能来帮助您处理 JavaScript 文件，例如编译最新的 ECMAScript 语法，模块化，代码压缩和合并 JavaScript 文件。更棒的是，所有这些都可以无缝运行，而无需大量的自定义配置:

```js
mix.js('resources/js/app.js', 'public/js');
```



通过这一行代码，你现在就可以实现：

<div class="content-list" markdown="1">

- 支持最新的 EcmaScript 语法
- 支持模块化开发
- 在生产环境的代码压缩最小化

</div>

<a name="vue"></a>
### Vue

当使用 `vue` 方法时，Mix 会自动安装编译 Vue 组件所需要的 Babel 插件。 不需要其他任何配置。

```js
mix.js('resources/js/app.js', 'public/js')
   .vue();
```

编译 JavaScript 后，您可以在应用程序中引用它:

```blade
<head>
    <!-- ... -->

    <script src="/js/app.js"></script>
</head>
```

<a name="react"></a>
### React

Mix 可以自动安装 React 支持所需的 Babel 插件。 首先，请添加一个对 `react` 方法的调用：

```js
mix.js('resources/js/app.jsx', 'public/js')
   .react();
```

Mix 将在后台下载并包含相应的 `babel-preset-react` Babel  插件。编译 JavaScript 后，您可以在应用程序中引用它：

```blade
<head>
    <!-- ... -->

    <script src="/js/app.js"></script>
</head>
```

<a name="vendor-extraction"></a>
### 提取 Vendor

将应用程序本身所有的 JavaScript 与 vendor 库（例如 React 和 Vue ）捆绑在一起的潜在缺点是：这会使长期缓存变得更加困难。 例如，对应用程序代码进行一次更新将迫使浏览器重新下载所有 vendor 库，即使它们没有更改。

如果打算频繁更新应用程序的 JavaScript，则应考虑将所有 vender 库提取到它们自己的文件中。 这样，对应用程序代码的更改将不会影响大型 `vendor.js` 文件的缓存。 Mix 的  `extract` 方法使这变得轻而易举：

```js
mix.js('resources/js/app.js', 'public/js')
    .extract(['vue'])
```



`extract` 方法接受你希望提取到 `vendor.js` 文件中的所有库或模块的数组。 以上面的代码段为例，Mix 将生成以下文件：

<div class="content-list" markdown="1">

- `public/js/manifest.js`: *Webpack 运行时清单*
- `public/js/vendor.js`: *vendor 库*
- `public/js/app.js`: *你的应用程序代码*

</div>

为避免 JavaScript 错误，请确保以正确的顺序加载这些文件:

```html
<script src="/js/manifest.js"></script>
<script src="/js/vendor.js"></script>
<script src="/js/app.js"></script>
```

<a name="custom-webpack-configuration"></a>
### 自定义 Webpack 配置

有时候你可能需要手动修改 Webpack 配置，例如，你可能需要引入特殊的 `loader` 或者插件。

Mix 提供非常有用的 `webpackConfig` 方法可以让你覆盖 Webpack 的配置。这非常吸引人，因为它不需要你复制和维护自己的 `webpack.config.js` 文件。 `webpackConfig` 方法接收一个对象你可以传入你希望的 [Webpack 特定配置](https://webpack.js.org/configuration/) 。

```js
mix.webpackConfig({
    resolve: {
        modules: [
            path.resolve(__dirname, 'vendor/laravel/spark/resources/assets/js')
        ]
    }
});
```

<a name="versioning-and-cache-busting"></a>
## 版本管理 / 缓存销毁

许多开发者在他们编译后的资源添加时间戳或唯一令牌作后缀，强制浏览器加载新的资源，以替换旧的代码副本。Mix 可以使用 `version` 方法替你处理它们。

`version` 方法自动在所有编译后的文件名后追加唯一的哈希值，从而实现更方便的缓存销毁：

```js
mix.js('resources/js/app.js', 'public/js')
    .version();
```



在生成版本化文件后，你不会知道确切的文件名。因此，你需要在 [视图](/docs/laravel/9.x/views) 中使用Laravel 的全局 `mix` 函数载入相应的哈希资源。 `mix` 函数自动判断哈希文件的当前文件名：

```blade
<script src="{{ mix('/js/app.js') }}"></script>
```

通常在开发阶段不需要版本化文件，你可以仅在运行 `npm run prod` 时执行版本化处理：

```js
mix.js('resources/js/app.js', 'public/js');

if (mix.inProduction()) {
    mix.version();
}
```

<a name="custom-mix-base-urls"></a>
#### 自定义 Mix Base URLs

如果你的 Mix 编译资产被部署到独立于应用程序的 CDN 上，则需要更改 `mix` 函数生成的基本 URL 。 你可以通过在 `config/app.php` 中添加一个 `mix_url` 配置选项来做到这一点。php 的配置文件:

    'mix_url' => env('MIX_ASSET_URL', null)

在配置了 Mix URL 之后，`mix` 函数将在生成资产 URL 时为所配置的 URL 添加前缀:

```shell
https://cdn.example.com/js/app.js?id=1964becbdd96414518cd
```

<a name="browsersync-reloading"></a>
## Browsersync 重加载

[BrowserSync](https://browsersync.io/) 能够自动监测文件变化，并且无需手动刷新就将变化注入到浏览器。可以调用 `mix.browserSync()` 方法开启此项支持：

```js
mix.browserSync('laravel.test');
```

可以将 [BrowserSync 选项](https://browsersync.io/docs/options) 通过 Javascript 对象传递给 `browserSync` 方法来指定:

```js
mix.browserSync({
    proxy: 'laravel.test'
});
```

然后使用 `npm run watch` 命令启动 Webpack 的开发服务器。再编辑脚本或者 PHP 文件，就会看到浏览器立即刷新以响应你的修改。



<a name="environment-variables"></a>
## 环境变量

你可以通过在 `.env` 文件中添加 `MIX_` 前缀，将环境变量注入到 Mix：

```ini
MIX_SENTRY_DSN_PUBLIC=http://example.com
```

如果你在 `.env` 文件中定义了变量的话，你可以通过  `process.env` 对象来访问它。 但如果你在任务运行的时候修改了变量的值，你就需要重新启动任务了:

```js
process.env.MIX_SENTRY_DSN_PUBLIC
```

<a name="notifications"></a>
## 通知

如果系统支持 Mix ， 将在编译时自动显示操作系统通知，为您提供有关编译是否成功的及时反馈。但是在某些情况下，您可能希望禁用这些通知。 比如在生产服务器上。禁用通知可以使用 `disableNotifications` 方法:

```js
mix.disableNotifications();
```

