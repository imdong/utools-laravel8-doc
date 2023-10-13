# 资源绑定（Vite）

-   [介绍](#introduction)
-   [安装和设置](#installation)
    -   [安装 Node](#installing-node)
    -   [安装 Vite 和 Laravel 插件](#installing-vite-and-laravel-plugin)
    -   [配置 Vite](#configuring-vite)
    -   [加载你的脚本和样式](#loading-your-scripts-and-styles)
-   [运行 Vite](#running-vite)
-   [使用 JavaScript](#working-with-scripts)
    -   [别名](#aliases)
    -   [Vue](#vue)
    -   [React](#react)
    -   [Inertia](#inertia)
    -   [URL 处理](#url-processing)
-   [使用样式表](#working-with-stylesheets)
-   [使用 Blade 和路由](#working-with-blade-and-routes)
    -   [使用 Vite 处理静态资源](#blade-processing-static-assets)
    -   [保存后刷新](#blade-refreshing-on-save)
    -   [别名](#blade-aliases)
-   [自定义基础 URL](#custom-base-urls)
-   [环境变量](#environment-variables)
-   [在测试中禁用 Vite](#disabling-vite-in-tests)
-   [服务器端渲染（SSR）](#ssr)
-   [脚本和样式标记属性](#script-and-style-attributes)
    -   [内容安全策略（CSP）随机数](#content-security-policy-csp-nonce)
    -   [子资源完整性（SRI）](#subresource-integrity-sri)
    -   [任意属性](#arbitrary-attributes)
-   [高级定制](#advanced-customization)
    -   [更正开发服务器 URL](#correcting-dev-server-urls)

<a name="introduction"></a>

## 介绍

[Vite](https://vitejs.dev/) 是一款现代前端构建工具，提供极快的开发环境并将你的代码捆绑到生产准备的资源中。在使用 Laravel 构建应用程序时，通常会使用 Vite 将你的应用程序的 CSS 和 JavaScript 文件绑定到生产环境的资源中。

Laravel 通过提供官方插件和 Blade 指令，与 Vite 完美集成，以加载你的资源进行开发和生产。

>注意：你正在运行 Laravel Mix 吗？在新的 Laravel 安装中，Vite 已经取代了 Laravel Mix 。有关 Mix 的文档，请访问 [Laravel Mix](https://laravel-mix.com/) 网站。如果你想切换到 Vite，请参阅我们的 [迁移指南](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)。

#### 选择 Vite 还是 Laravel Mix

在转向 Vite 之前，新的 Laravel 应用程序在打包资产时通常使用 [Mix](https://laravel-mix.com/)，它由 [webpack](https://webpack.js.org/) 支持。Vite 专注于在构建丰富的 JavaScript 应用程序时提供更快、更高效的开发体验。如果你正在开发单页面应用程序（SPA），包括使用 [Inertia](https://inertiajs.com/) 工具开发的应用程序，则 Vite 是完美选择。

Vite 也适用于具有 JavaScript “sprinkles” 的传统服务器端渲染应用程序，包括使用 [Livewire](https://laravel-livewire.com/) 的应用程序。但是，它缺少 Laravel Mix 支持的某些功能，例如将没有直接在 JavaScript 应用程序中引用的任意资产复制到构建中的能力。

#### 切换回 Mix

如果你使用我们的 Vite 脚手架创建了一个新的 Laravel 应用程序，但需要切换回 Laravel Mix 和 webpack，那么也没有问题。请参阅我们的[从 Vite 切换到 Mix 的官方指南](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)。

## 安装和设置

> **注意**
> 以下文档讨论如何手动安装和配置 Laravel Vite 插件。但是，Laravel 的[起始套件](/docs/laravel/10.x/starter-kits)已经包含了所有的脚手架，并且是使用 Laravel 和 Vite 开始最快的方式。

### 安装 Node

在运行 Vite 和 Laravel 插件之前，你必须确保已安装 Node.js（16+）和 NPM：


`node -v
npm -v` 

你可以通过[官方 Node 网站](https://nodejs.org/en/download/)的简单图形安装程序轻松安装最新版本的 Node 和 NPM。或者，如果你使用的是 [Laravel Sail](/docs/laravel/10.x/sail)，可以通过 Sail 调用 Node 和 NPM：


`./vendor/bin/sail node -v
./vendor/bin/sail npm -v`

<a name="installing-vite-and-laravel-plugin"></a>
### 安装 Vite 和 Laravel 插件

在 Laravel 的全新安装中，你会在应用程序目录结构的根目录下找到一个 package.json 文件。默认的 package.json 文件已经包含了你开始使用 Vite 和 Laravel 插件所需的一切。你可以通过 NPM 安装应用程序的前端依赖：

```sh
npm install
```

<a name="configuring-vite"></a>
### 配置 Vite

Vite 通过项目根目录中的 `vite.config.js` 文件进行配置。你可以根据自己的需要自定义此文件，也可以安装任何其他插件，例如 `@vitejs/plugin-vue` 或 `@vitejs/plugin-react`。

Laravel Vite 插件需要你指定应用程序的入口点。这些入口点可以是 JavaScript 或 CSS 文件，并包括预处理语言，例如 TypeScript、JSX、TSX 和 Sass。

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

如果你正在构建一个单页应用程序，包括使用 Inertia 构建的应用程序，则最好不要使用 CSS 入口点：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

相反，你应该通过 JavaScript 导入你的 CSS。通常，这将在应用程序的 resources/js/app.js 文件中完成：

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

Laravel 插件还支持多个入口点和高级配置选项，例如[SSR 入口点](#ssr)。



<a name="working-with-a-secure-development-server"></a>
#### 使用安全的开发服务器

如果你的本地开发 Web 服务器通过 HTTPS 提供应用程序服务，则可能会遇到连接到 Vite 开发服务器的问题。

如果你在本地开发中使用 [Laravel Valet](/docs/laravel/10.x/valet) 并已针对你的应用程序运行 [secure 命令](/docs/laravel/10.x/valetmd#securing-sites)，则可以配置 Vite 开发服务器自动使用 Valet 生成的 TLS 证书：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            valetTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```
当使用其他 Web 服务器时，你应生成一个受信任的证书并手动配置 Vite 使用生成的证书：

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

如果你无法为系统生成可信证书，则可以安装并配置 [`@vitejs/plugin-basic-ssl` 插件](https://github.com/vitejs/vite-plugin-basic-ssl)。使用不受信任的证书时，你需要通过在运行 `npm run dev` 命令时按照控制台中的“Local”链接接受 Vite 开发服务器的证书警告。


<a name="loading-your-scripts-and-styles"></a>
### 加载你的脚本和样式

配置了 Vite 入口点后，你只需要在应用程序根模板的 `<head>` 中添加一个 `@vite()` Blade 指令引用它们即可：

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```



如果你通过 JavaScript 导入你的 CSS 文件，你只需要包含 JavaScript 的入口点：

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 指令会自动检测 Vite 开发服务器并注入 Vite 客户端以启用热模块替换。在构建模式下，该指令将加载已编译和版本化的资产，包括任何导入的 CSS 文件。

如果需要，在调用 `@vite` 指令时，你还可以指定已编译资产的构建路径：

```blade
<!doctype html>
<head>
    {{-- Given build path is relative to public path. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="running-vite"></a>
## 运行 Vite

你可以通过两种方式运行 Vite。你可以通过 `dev` 命令运行开发服务器，在本地开发时非常有用。开发服务器会自动检测文件的更改，并立即在任何打开的浏览器窗口中反映这些更改。

或者，运行 `build` 命令将版本化并打包应用程序的资产，并准备好部署到生产环境：

Or, running the `build` command will version and bundle your application's assets and get them ready for you to deploy to production:

```shell
# Run the Vite development server...
npm run dev

# Build and version the assets for production...
npm run build
```

<a name="working-with-scripts"></a>
## 使用 JavaScript

<a name="aliases"></a>
### 别名

默认情况下，Laravel 插件提供一个常用的别名，以帮助你快速开始并方便地导入你的应用程序的资产：

```js
{
    '@' => '/resources/js'
}
```

你可以通过添加自己的别名到 `vite.config.js` 配置文件中，覆盖 `'@'` 别名：

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

如果你想要使用 [Vue](https://vuejs.org/) 框架构建前端，那么你还需要安装 `@vitejs/plugin-vue` 插件：

```sh
npm install --save-dev @vitejs/plugin-vue
```

然后你可以在 `vite.config.js` 配置文件中包含该插件。当使用 Laravel 和 Vue 插件时，还需要一些附加选项：

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
                    // Vue 插件会重新编写资产 URL，以便在单文件组件中引用时，指向 Laravel web 服务器。
                    // 将其设置为 `null`，则 Laravel 插件会将资产 URL 重新编写为指向 Vite 服务器。
                    base: null,

                    // Vue 插件将解析绝对 URL 并将其视为磁盘上文件的绝对路径。
                    // 将其设置为 `false`，将保留绝对 URL 不变，以便可以像预期那样引用公共目录中的资源。
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

**注意**
Laravel 的 [起步套件](/docs/laravel/10.x/starter-kits) 已经包含了适当的 Laravel、Vue 和 Vite 配置。请查看 [Laravel Breeze](/docs/laravel/10.x/starter-kitsmd#breeze-and-inertia) 以了解使用 Laravel、Vue 和 Vite 快速入门的最快方法。

<a name="react"></a>
### React

如果你想要使用 [React](https://reactjs.org/) 框架构建前端，那么你还需要安装 `@vitejs/plugin-react` 插件：

```sh
npm install --save-dev @vitejs/plugin-react
```

你可以在 `vite.config.js` 配置文件中包含该插件：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```



当使用 Vite 和 React 时，你将需要确保任何包含 JSX 的文件都有一个 .jsx 和 .tsx 扩展，记住更新入口文件，如果需要 [如上所示](#configuring-vite)。你还需要在现有的 `@vite` 指令旁边包含额外的 `@viteReactRefresh` Blade 指令。

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 指令必须在 `@vite` 指令之前调用 。

> **注意**  
> Laravel 的 [起步套件](/docs/laravel/10.x/starter-kits) 已经包含了适合的 Laravel、React 和 Vite 配置。查看 [Laravel Breeze](/docs/laravel/10.x/starter-kitsmd#breeze-and-inertia) 以最快的方式开始学习 Laravel、React 和 Vite。

<a name="inertia"></a>
### Inertia

Laravel Vite 插件提供了一个方便的 `resolvePageComponent` 函数，帮助你解决 Inertia 页面组件。以下是使用 Vue 3 的助手示例；然而，你也可以在其他框架中使用该函数，例如 React：

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    return createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

> **注意**  
> Laravel 的 [起步套件](/docs/laravel/10.x/starter-kits) 已经包含了适合的 Laravel、Inertia 和 Vite 配置。查看 [Laravel Breeze](/docs/laravel/10.x/starter-kitsmd#breeze-and-inertia) 以最快的方式开始学习 Laravel、Inertia 和 Vite。

<a name="url-processing"></a>
### URL 处理

当使用 Vite 并在你的应用程序的 HTML，CSS 和 JS 中引用资源时，有几件事情需要考虑。首先，如果你使用绝对路径引用资源，Vite 将不会在构建中包含资源；因此，你需要确认资源在你的公共目录中是可用的。



在引用相对路径的资源时，你应该记住这些路径是相对于它们被引用的文件的路径。通过相对路径引用的所有资源都将被 Vite 重写、版本化和打包。

参考以下项目结构：

```
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
``` 

以下示例演示了 Vite 如何处理相对路径和绝对 URL：

```
<!-- 这个资源不被 Vite 处理，不会被包含在构建中 -->
<img src="/taylor.png">

<!-- 这个资源将由 Vite 重写、版本化和打包 -->
<img src="../../images/abigail.png">` 
```

<a name="working-with-stylesheets"></a>

## 使用样式表

你可以在 [Vite 文档](https://vitejs.dev/guide/features.html#css) 中了解有关 Vite 的 CSS 支持更多的信息。如果你使用 PostCSS 插件，如 [Tailwind](https://tailwindcss.com/)，你可以在项目的根目录中创建一个 `postcss.config.js` 文件，Vite 会自动应用它：

```
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```
> **注意** Laravel 的 [起始套件](/docs/laravel/10.x/starter-kits) 已经包含了正确的 Tailwind、PostCSS 和 Vite 配置。或者，如果你想在不使用我们的起始套件的情况下使用 Tailwind 和 Laravel，请查看 [Tailwind 的 Laravel 安装指南](https://tailwindcss.com/docs/guides/laravel)。

<a name="working-with-blade-and-routes"></a>

## 使用 Blade 和 路由

<a name="blade-processing-static-assets"></a>

### 通过 Vite 处理静态资源

在你的 JavaScript 或 CSS 中引用资源时，Vite 会自动处理和版本化它们。此外，在构建基于 Blade 的应用程序时，Vite 还可以处理和版本化你仅在 Blade 模板中引用的静态资源。

然而，要实现这一点，你需要通过将静态资源导入到应用程序的入口点来让 Vite 了解你的资源。例如，如果你想处理和版本化存储在 `resources/images` 中的所有图像和存储在 `resources/fonts` 中的所有字体，你应该在应用程序的 `resources/js/app.js` 入口点中添加以下内容：

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

这些资源将在运行 `npm run build` 时由 Vite 处理。然后，你可以在 Blade 模板中使用 `Vite::asset` 方法引用这些资源，该方法将返回给定资源的版本化 URL：

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}">
```

<a name="blade-refreshing-on-save"></a>
### 保存刷新

当你的应用程序使用传统的服务器端渲染 Blade 构建时，Vite 可以通过在你的应用程序中更改视图文件时自动刷新浏览器来提高你的开发工作流程。要开始，你可以简单地将 `refresh` 选项指定为 `true`。

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

当 `refresh` 选项为 `true` 时，保存以下目录中的文件将在你运行 `npm run dev` 时触发浏览器进行全面的页面刷新：

- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

监听 `routes/**` 目录对于在应用程序前端中利用 [Ziggy](https://github.com/tighten/ziggy) 生成路由链接非常有用。



如果这些默认路径不符合你的需求，你可以指定自己的路径列表：

```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
``` 

在后台，Laravel Vite 插件使用了 [`vite-plugin-full-reload`](https://github.com/ElMassimo/vite-plugin-full-reload) 包，该包提供了一些高级配置选项，可微调此功能的行为。如果你需要这种级别的自定义，可以提供一个 `config` 定义：

```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
``` 

### 别名

在 JavaScript 应用程序中创建别名来引用常用目录是很常见的。但是，你也可以通过在 `Illuminate\Support\Facades\Vite` 类上使用 `macro` 方法来创建在 Blade 中使用的别名。通常，“宏”应在 [服务提供商](/docs/laravel/10.x/providers) 的 `boot` 方法中定义：

```
/**
 * Bootstrap any application services.
 */
public function boot(): void {
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
``` 

定义了宏之后，可以在模板中调用它。例如，我们可以使用上面定义的 `image` 宏来引用位于 `resources/images/logo.png` 的资源：

```
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo">
``` 

### 自定义 base URL

如果你的 Vite 编译的资产部署到与应用程序不同的域（例如通过 CDN），必须在应用程序的 `.env` 文件中指定 `ASSET_URL` 环境变量：

```
ASSET_URL=https://cdn.example.com
```

在配置了资源 URL 之后，所有重写的 URL 都将以配置的值为前缀：

```
https://cdn.example.com/build/assets/app.9dce8d17.js
``` 

请记住，[绝对路径的 URL 不会被 Vite 重新编写](/#url-processing)，因此它们不会被添加前缀。

### 环境变量

你可以在应用程序的 `.env` 文件中以 `VITE_` 为前缀注入环境变量以在 JavaScript 中使用：

```
VITE_SENTRY_DSN_PUBLIC=http://example.com
``` 

你可以通过 `import.meta.env` 对象访问注入的环境变量：

```
import.meta.env.VITE_SENTRY_DSN_PUBLIC
``` 

### 在测试中禁用 Vite

Laravel 的 Vite 集成将在运行测试时尝试解析你的资产，这需要你运行 Vite 开发服务器或构建你的资产。

如果你希望在测试中模拟 Vite，你可以调用 `withoutVite` 方法，该方法对任何扩展 Laravel 的 `TestCase` 类的测试都可用：

```
use Tests\TestCase;

class ExampleTest extends TestCase {
    public function test_without_vite_example(): void {
        $this->withoutVite();

        // ...
    }
}
``` 

如果你想在所有测试中禁用 Vite，可以在基本的 `TestCase` 类上的 `setUp` 方法中调用 `withoutVite` 方法：

```
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase {
    use CreatesApplication;

    protected function setUp(): void// [tl! add:start] {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
``` 

### 服务器端渲染

Laravel Vite 插件可以轻松地设置与 Vite 的服务器端渲染。要开始使用，请在 `resources/js` 中创建一个 SSR（Server-Side Rendering）入口点，并通过将配置选项传递给 Laravel 插件来指定入口点：

```
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

为确保不遗漏重建 SSR 入口点，我们建议增加应用程序的 `package.json` 中的 「build」 脚本来创建 SSR 构建：

```
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
``` 

然后，要构建和启动 SSR 服务器，你可以运行以下命令：

```
npm run build
node bootstrap/ssr/ssr.mjs
``` 

> **注意** Laravel 的 [starter kits](/docs/laravel/10.x/starter-kits) 已经包含了适当的 Laravel、Inertia SSR 和 Vite 配置。查看 [Laravel Breeze](/docs/laravel/10.x/starter-kitsmd#breeze-and-inertia) ，以获得使用 Laravel、Inertia SSR 和 Vite 的最快速的方法。

## Script & Style 标签的属性

### Content Security Policy (CSP) Nonce

如果你希望在你的脚本和样式标签中包含 [`nonce` 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)，作为你的 [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 的一部分，你可以使用自定义 [middleware](/docs/laravel/10.x/middleware) 中的 `useCspNonce` 方法生成或指定一个 nonce：

Copy code

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders {
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
``` 

调用了 `useCspNonce` 方法后，Laravel 将自动在所有生成的脚本和样式标签上包含 `nonce` 属性。

如果你需要在其他地方指定 nonce，包括 Laravel 的 starter kits 中带有的 [Ziggy `@route` directive](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) 指令，你可以使用 `cspNonce` 方法来检索它：

```
@routes(nonce: Vite::cspNonce())
```
如果你已经有了一个 nonce，想要告诉 Laravel 使用它，你可以通过将 nonce 传递给 `useCspNonce` 方法来实现：

```
Vite::useCspNonce($nonce);
```
<a name="subresource-integrity-sri"></a>
###子资源完整性 (SRI)
如果你的 `Vite manifest` 中包括资源的完整性哈希，则 Laravel 将自动向其生成的任何脚本和样式标签中添加 `integrity` 属性，以执行 子资源完整性。默认情况下，Vite 不包括其清单中的 `integrity` 哈希，但是你可以通过安装 `vite-plugin-manifest-sri` NPM 插件来启用它：

```shell
npm install --save-dev vite-plugin-manifest-sri
```
然后，在你的 `vite.config.js` 文件中启用此插件：

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```
如果需要，你也可以自定义清单中的完整性哈希键：

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

如果你想完全禁用这个自动检测，你可以将 `false` 传递给 `useIntegrityKey` 方法：

```
Vite::useIntegrityKey(false);
```
<a name="arbitrary-attributes"></a>
### 任意属性
如果你需要在脚本和样式标签中包含其他属性，例如 `data-turbo-track` 属性，你可以通过 `useScriptTagAttributes` 和 `useStyleTagAttributes` 方法指定它们。通常，这些方法应从一个服务提供程序中调用：

```
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 为属性指定一个值...
    'async' => true, // 在不使用值的情况下指定属性...
    'integrity' => false, // 排除一个将被包含的属性...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

如果你需要有条件地添加属性，你可以传递一个回调函数，它将接收到资产源路径、它的URL、它的清单块和整个清单：

```
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
``` 

> **警告**
> 在 Vite 开发服务器运行时，`$chunk` 和 `$manifest` 参数将为 `null`。

<a name="advanced-customization"></a>

## 高级定制

默认情况下，Laravel 的 Vite 插件使用合理的约定，适用于大多数应用，但是有时你可能需要自定义 Vite 的行为。为了启用额外的自定义选项，我们提供了以下方法和选项，可以用于替代 `@vite` Blade 指令：

```
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // 自定义 "hot" 文件...
            ->useBuildDirectory('bundle') // 自定义构建目录...
            ->useManifestFilename('assets.json') // 自定义清单文件名...
            ->withEntryPoints(['resources/js/app.js']) // 指定入口点...
    }}
</head>
``` 

然后，在 `vite.config.js` 文件中，你应该指定相同的配置：

```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // 自定义 "hot" 文件...
            buildDirectory: 'bundle', // 自定义构建目录...
            input: ['resources/js/app.js'], // 指定入口点...
        }),
    ],
    build: {
      manifest: 'assets.json', // 自定义清单文件名...
    },
});
``` 

<a name="correcting-dev-server-urls"></a>

### 修正开发服务器 URL

Vite 生态系统中的某些插件默认假设以正斜杠开头的 URL 始终指向 Vite 开发服务器。然而，由于 Laravel 集成的性质，实际情况并非如此。

例如，`vite-imagetools` 插件在 Vite 服务时，你的资产时会输出以下类似的 URL：

```
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520">
``` 

`vite-imagetools` 插件期望输出URL将被 Vite 拦截，并且插件可以处理所有以 `/@imagetools` 开头的 URL。如果你正在使用期望此行为的插件，则需要手动纠正 URL。你可以在 `vite.config.js` 文件中使用 `transformOnServe` 选项来实现。

在这个例子中，我们将在生成的代码中的所有 `/@imagetools` 钱加上开发服务器的 URL：

```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
``` 

现在，在 Vite 提供资产服务时，它会输出URL指向 Vite 开发服务器：

```
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] -->
```
