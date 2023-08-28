
# Laravel Mix

- [介绍](#introduction)

<a name="introduction"></a>
## 介绍

[Laravel Mix](https://github.com/laravel-mix/laravel-mix) 是一个由 [Laracasts](https://laracasts.com) 的创始人 Jeffrey Way 开发的包，它提供了一个流畅的API，用于定义 [Webpack](https://webpack.js.org) 构建步骤，以在 Laravel 应用程序中使用多种常见的 CSS 和 JavaScript 预处理器。

换句话说，Mix 让编译和压缩应用程序的 CSS 和 JavaScript 文件变得轻而易举。您可以通过简单的方法链接，流畅地定义资源文件管道。例如：

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```
如果您曾经因为开始使用 Webpack 和资源编译而感到困惑和不知所措，那么您会喜欢上 Laravel Mix 。然而，在开发应用程序时，并不需要强制使用它；您可以自由选择任何资源文件管道工具，甚至不使用任何工具。

> **注意**  
> 在新安装 Laravel 中，Vite 已经取代了 Laravel Mix 。如果您需要 Mix 的文档，请访问 [Laravel Mix 官方](https://laravel-mix.com/) 网站。如果您想切换到 Vite，请阅读我们的 [Vite 迁移指南](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)。
