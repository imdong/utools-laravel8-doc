# 打包资产 (Vite)

- [介绍](#introduction)
- [安装 & 设置](#installation)
  - [安装 Node](#installing-node)
  - [安装 Vite 和 Laravel Plugin](#installing-vite-and-laravel-plugin)
  - [配置 Vite](#configuring-vite)
  - [加载 Scripts 和 Styles](#loading-your-scripts-and-styles)
- [运行 Vite](#running-vite)
- [处理 JavaScript](#working-with-scripts)
  - [别名](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 处理](#url-processing)
- [处理 Stylesheets](#working-with-stylesheets)
- [自定义 Base URLs](#custom-base-urls)
- [环境变量](#environment-variables)
- [服务端渲染 (SSR)](#ssr)

<a name="introduction"></a>
## 介绍

[Vite](https://vitejs.dev) 是一个现代的前端构建工具，它提供一个非常快速的开发环境，并将您的代码打包用于生产。使用 Laravel 构建应用程序时，您通常会使用 Vite 将应用程序的 CSS 和 JavaScript 文件绑定到生产环境就绪的资产中。

Laravel 通过提供官方插件和 Blade 指令来加载您的开发和生产资产。从而与 Vite 无缝衔接。

> 技巧：您是否运行 Laravel Mix? 在新的 Laravel 安装中，Vite 已经取代 Laravel Mix。如需 Mix 文档，请访问 [Laravel Mix](https://laravel-mix.com/) 站点。如果您想切换到 Vite，请查看我们 [迁移指引](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite).

<a name="vite-or-mix"></a>
####  在 Vite 和 Laravel Mix 之间选择

在过渡到 Vite 之前，当打包资产时，新的 Laravel 应用使用 [Mix](https://laravel-mix.com/)，它由 [webpack](https://webpack.js.org/) 来支持。在构建富 JavaScript 应用时，Vite 致力于提供一个更快和更高效的体验。如果您开发一个单网页应用 (SPA)，包括使用以下工具开发，如 [Inertia](https://inertiajs.com)，Vite 将会更加适合。



Vite 也适用于带有 JavaScript "sprinkles" 的传统服务端渲染应用程序，包括使用 [Livewire](https://laravel-livewire.com) 。然而，它缺少 Laravel Mix 支持的一些特性，例如将任意资源复制到构建中的能力，而这些资源没有在 JavaScript 应用程序中直接引用。

<a name="迁移回 Mix"></a>
#### 迁移回 Mix

您是否使用我们的 Vite 脚手架开始新的 Laravel 应用程序，但需要回到 Laravel Mix 和 webpack ？没问题。请查阅 [从 Vite 迁移到 Mix 官方指南](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)。

<a name="installation"></a>
## 安装 & 设置

> 技巧：以下文档讨论了如何动手安装和配置 Laravel Vite 插件。然而，Larvel 的 [入门套件](/docs/laravel/9.x/starter-kits) 已经包含了所有这些脚手架，这是开始使用 Laravel 和 Vite 的最快方式。

<a name="installing-node"></a>
### 安装 Node

在运行 Vite 和 Laravel 插件之前，您必须确保已安装 Node.js 和 NPM

```sh
node -v
npm -v
```

你可以使用来自 [Node 官方](https://nodejs.org/en/ownload/) 的简单图形安装程序轻松安装最新的 Node 和 NPM。或者，如果你使用[Laravel Sail](https://laravel.com/docs/laravel/9.x/sail)，你可以通过 Sail 调用 Node 和 NPM：


```sh
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### 安装 Vite 和 Laravel Plugin

在 Laravel 的全新安装中，您会在应用程序目录结构的根目录中找到一个 `package.json` 文件。 默认的 `package.json` 文件已经包含了你开始使用 Vite 和 Laravel 插件所需的一切。 您可以通过 NPM 安装应用程序的前端依赖项：

```sh
npm install
```



<a name="configuring-vite"></a>
### 配置 Vite

Vite是通过项目根目录的 `vite.config.js` 文件配置的。您可以根据自己的需求自由自定义此文件，还可以安装应用程序所需的任何其他插件，例如 `@vitejs/plugin-vue` 或 `@vitejs/plugin-react` 。

Laravel Vite插件要求您指定应用程序的入口点。这些可能是 JavaScript 或 CSS 文件，和其他预处理语言，例如 Typescript，JSX，TSX 和 SASS。

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

如果您正在构建 SPA，包括使用 Inertia 构建的应用程序，则 Vite 在没有 CSS 入口点的情况下运行最佳：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            // 'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

作为替代，您应该通过 JavaScript 导入 CSS。通常，这将在您的应用程序的 `resources/js/app.js` 文件中完成：

```js
import './bootstrap';
import '../css/app.css'; // 新增
```

Laravel 插件还支持多个入口点和高级配置选项，例如 [SSR 入口点](#ssr)。

<a name="working-with-a-secure-development-server"></a>
#### 通过一个安全的开发服务器工作

如果您的开发 Web 服务器在 HTTPS 上运行，包括 Valet 的 [secure command](/docs/laravel/9.x/valet#securing-sites)，您可能会遇到连接到Vite开发服务器的问题。您可以通过将以下内容添加到 `vite.config.js` 配置文件：

```js
export default defineConfig({
    // ...
    server: {
        https: true,
        host: 'localhost',
    },
});
```



当您运行 `npm run dev` 命令时，你还需要通过控制台中的「Local」链接来接受浏览器中 Vite 开发服务器的证书警告。

<a name="loading-your-scripts-and-styles"></a>
### 加载 Scripts 和 Styles

配置好 Vite 的入口点后，您仅需要在 `@vite()` Blade 指令中引用它们，该指令被添加到你的应用根模板的 `<head>` 中：

```html
<!doctype html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

如果您通过 JavaScript 引入 CSS，您仅需要包含 JavaScript 入口点：

```html
<!doctype html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 指令将自动检测 Vite 开发服务器并注入 Vite 客户端以启动热模块更换。在构建模式下，这个指令将加载已编译和版本化的资产，包括任何导入的 CSS。

<a name="running-vite"></a>
## 运行 Vite

有两种方式可以运行 Vite。您可以通过 `dev` 命令运行开发服务器，它在本地开发是很有用的。这个开发服务器将自动检测您文件的改变并在任何打开的浏览器窗口中立即反映它们。

或者，运行 `build` 命令，将应用程序的资产做版本和打包，并为您部署到生产环境做准备：

```shell
# 运行 Vite 开发服务器...
npm run dev

# 构建并为生产环境版本化资产...
npm run build
```

<a name="working-with-scripts"></a>
## 处理 JavaScript

<a name="aliases"></a>
### 别名

默认情况下，Laravel 插件提供一个命令别名去帮助你启动并方便地导入应用程序资产：
```js
{
    '@' => '/resources/js'
}
```



您可以通过将自己的别名添加到 `vite.config.js` 配置文件中来覆盖 `'@'` 别名：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a name="vue"></a>
### Vue

当 Vue 插件和 Laravel 插件一起使用时，以下是需要在 `vite.config.js` 配置文件中包含的几个附加的选项。

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // Vue 插件将重写资产 URLs，当被引用
                    // 在单文件组件中，指向 Laravel Web 服务
                    // 设置它为 `null` 允许 Laravel 插件
                    // 去替代重写资产 URLs 指向到 Vite 服务
                    base: null,

                    //  Vue 插件将解析绝对 URLs 
                    // 并把它们看做磁盘上的绝对路径。
                    // 设置它为 `false` 将保留绝对 URLs 
                    // 以便它们可以按照预期直接引用公共资产。
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> 技巧：Laravel 的 [初学者工具包](/docs/laravel/9.x/starter-kits) 已经包含适合的 Laravel， Vue 和 Vite 配置。检出 [Laravel Breeze](/docs/laravel/9.x/starter-kits#breeze-and-inertia) 以最快的方式开始学习 Laravel, Vue 和 Vite。

<a name="react"></a>
### React

当使用 Vite 和 React 时，您将需要确保任何包含 JSX 的文件都有一个 `.jsx` 和 `.tsx` 扩展，记住更新入口点，如果需要 [如上所示](#configuring-vite)。您还需要在现有的 `@vite` 指令旁边包含额外的 `@viteReactRefresh` Blade 指令。

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```



 `@viteReactRefresh` 指令必须在 `@vite` 指令之前被调用。

> 技巧：Laravel 的 初学者工具包 已经包含适合的 Laravel， React 和 Vite 配置。检出 Laravel Breeze 以最快的方式开始学习 Laravel, React 和 Vite。

<a name="inertia"></a>
### Inertia

Laravel Vite 插件提供了一个便利的 `resolvePageComponent` 函数去帮助你解决 Inertia 页面组件。以下是一个使用 Vue 3 的助手示例；然而，您也可能需要在其他框架使用这个函数，如 React：

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/inertia-vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

> 技巧：Laravel 的 初学者工具包 已经包含适合的 Laravel， Inertia 和 Vite 配置。检出 Laravel Breeze 以最快的方式开始学习 Laravel, Inertia 和 Vite。

<a name="url-processing"></a>
### URL 处理

当使用 Vite 并在您的应用程序的 HTML，CSS 和 JS 中引用资产时，有几件事情需要考虑。首先，如果您使用绝对路径引用资产，Vite 将不会在构建中包含资产；因此，您需要确认资产在你的公共目录中是可用的。

当引用相对资产路径时，您应该记住，路径是相对于引用他们的文件的。任何通过相对路径的资产都由 Vite 重新编写，版本控制和绑定。



考虑以下项目结构：

```nothing
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

以下示例演示了 Vite 如何处理相对和绝对 URLs：

```html
<!-- This asset is not handled by Vite and will not be included in the build -->
<img src="/taylor.png">

<!-- This asset will be re-written, versioned, and bundled by Vite -->
<img src="../../images/abigail.png">
```

<a name="working-with-stylesheets"></a>
## 处理 Stylesheets

您可以学习更多有关 Vite 的 CSS 支持在 [Vite 文档](https://vitejs.dev/guide/features.html#css) 中。如果您在使用 PostCSS 插件，比如 [Tailwind](https://tailwindcss.com)，你可以创建一个 `postcss.config.js` 文件在你项目的根目录中，然后 Vite 将自动应用它：

```js
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

<a name="custom-base-urls"></a>
## 自定义 Base URLs

如果您的 Vite 编译资产被部署到一个与应用程序分离的域，比如通过一个 CDN，您必须明确在应用 `.env` 文件中的 `ASSET_URL` 环境变量：

```env
ASSET_URL=https://cdn.example.com
```

在配置完资产 URL 时，所有重写的资产 URL，都将以配置中的值作为前缀：

```URL
https://cdn.example.com/build/assets/app.9dce8d17.js
```

记住 [绝对 URLs 不会被 Vite 重写](#url-processing)，因此也将不会被前置内容。

<a name="environment-variables"></a>
## 环境变量

您可以通过在应用程序的 `.env` 文件中使用 `VITE_` 来将环境变量注入到JavaScript中：

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```



您可以通过 `import.meta.env` 对象访问被注入的环境变量：

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="ssr"></a>
## 服务端渲染 (SSR)

Laravel Vite 插件可以轻松的使用 Vite 设置服务端渲染。首先，在 `resources/js/ssr.js` 创建一个 SSR 入口点并通过向 Laravel 插件传递配置选项来指定入口点：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

为了确保您不会忘记重建 SSR 入口点，我建议在您应用的 `package.json` 增加「构建」脚本去创建您的 SSR 构建：

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

然后，要构建和开启 SSR 服务，可以运行一下命令：

```sh
npm run build
node storage/ssr/ssr.js
```

> Laravel 的 [初学者工具包](https://learnku.com/docs/laravel/9.x/starter-kits) 已经包含适合的 Laravel， Inertia SSR 和 Vite 配置。检出 [Laravel Breeze](https://learnku.com/docs/laravel/9.x/starter-kits#breeze-and-inertia) 以最快的方式开始学习 Laravel, Inertia SSR 和 Vite。

