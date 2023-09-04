# 起步套件

- [介绍](#introduction)
- [Laravel Breeze](#laravel-breeze)
    - [安装](#laravel-breeze-installation)
    - [Breeze & Blade](#breeze-and-blade)
    - [Breeze & React / Vue](#breeze-and-inertia)
    - [Breeze & Next.js / API](#breeze-and-next)
- [Laravel Jetstream](#laravel-jetstream)

<a name="introduction"></a>
## 介绍

为了帮助你快速构建 Laravel 应用，我们很高兴提供认证和应用程序起始套件。这些套件会自动使用所需的路由、控制器和视图来注册和验证应用程序的用户。

虽然你可以使用这些起始套件，但它们并非必需品。你可以通过安装全新的 Laravel 来从头开始构建自己的应用程序。无论你选择哪种方式，我们相信你都能构建出很棒的应用程序！

<a name="laravel-breeze"></a>
## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze) 是 Laravel 的 [认证功能](/docs/laravel/10.x/authentication) 的一种简单、最小实现，包括登录、注册、密码重置、电子邮件验证和密码确认。此外，Breeze 还包括一个简单的「个人资料」页面，用户可以在该页面上更新其姓名、电子邮件地址和密码。

Laravel Breeze 的默认视图层由简单的 [Blade 模版](/docs/laravel/10.x/blade) 和 [Tailwind CSS](https://tailwindcss.com) 组成。除此之外，Breeze 还可以使用 Vue 或 React 和 [Inertia](https://inertiajs.com) 来构建应用。

Breeze 为开始全新的 Laravel 应用程序提供了很好的起点，并且对于打算使用 [Laravel Livewire](https://laravel-livewire.com) 将 Blade 模板提升新的水平的项目来说，也是一个不错的选择。

<img src="https://laravel.com/img/docs/breeze-register.png">

#### Laravel 训练营

如果你是 Laravel 的新手，欢迎加入 [Laravel 训练营](https://bootcamp.laravel.com)。 Laravel 训练营将带领你通过使用 Breeze 构建你的第一个 Laravel 应用程序。这是一个很好的方式，让你了解 Laravel 和 Breeze 提供的所有功能。

<a name="laravel-breeze-installation"></a>
### 安装

首先，你应该 [创建一个新的 Laravel 应用程序](/docs/laravel/10.x/installation)，配置好数据库并运行 [数据库迁移](/docs/laravel/10.x/migrations)。在创建了一个新的 Laravel 应用程序之后，你可以使用 Composer 来安装 Laravel Breeze：

```shell
composer require laravel/breeze --dev
```

安装完 Breeze 后，你可以使用下文中提到的 Breeze「栈」来快速构建你的应用程序。

<a name="breeze-and-blade"></a>
### Breeze & Blade

在使用 Composer 安装好 Laravel Breeze 之后，你可以运行 `breeze:install` Artisan 命令。这个命令会将身份验证视图、路由、控制器和其他资源复制到你的应用程序中。Laravel Breeze 将其所有代码都复制到你的应用程序中，这样你就可以完全控制和查看其功能和实现。

默认的 Breeze「栈」是 Blade 栈，它使用简单的 [Blade 模板](/docs/laravel/10.x/blade) 来渲染你的应用程序前端。你可以通过调用 `breeze:install` 命令来安装 Blade 栈，而无需其他额外的参数。在 Breeze 的脚手架安装完后，你还需要编译应用程序的前端资源：

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

接下来，你可以在 Web 浏览器中打开应用程序的 `/login` 或 `/register` 的 URL。所有 Breeze 的路由都定义在 `routes/auth.php` 文件中。

<a name="dark-mode"></a>
#### 黑暗模式

如果你希望 Breeze 在构建应用程序前端时支持「黑暗模式」，只需要在执行 `breeze:install` 命令时提供 `--dark` 指令即可：

```shell
php artisan breeze:install --dark
```

> **注意**
> 要了解有关编译应用程序的 CSS 和 JavaScript 的更多信息，请查看 Laravel 的 [Vite 编译 Assets](/docs/laravel/10.x/vitemd#running-vite).

<a name="breeze-and-inertia"></a>
### Breeze & React / Vue

Laravel Breeze 还通过 [Inertia](https://inertiajs.com) 前端实现提供 React 和 Vue 脚手架。 Inertia 允许你使用经典的服务器端路由和控制器构建目前流行的单页 React 和 Vue 应用程序。

Inertia 让你享受 React 和 Vue 的前端强大功能以及 Laravel 令人难以置信的后端生产力和快如闪电的 [Vite](https://vitejs.dev) 编译。 如果要指定技术栈，请在执行 `breeze:install` Artisan 命令时指定 `vue` 或 `react` 作为你想要的技术栈。 安装 Breeze 的脚手架后，你就可以安装依赖及运行前端项目：

```shell
php artisan breeze:install vue

# 或者。。。

php artisan breeze:install react

php artisan migrate
npm install
npm run dev
```

接下来，你就可以在浏览器中访问 `/login` 或 `/register` URL。 Breeze 的所有路由都在 `routes/auth.php` 文件中定义。

<a name="server-side-rendering"></a>
#### 服务器端渲染

如果你希望 Breeze 支持 [Inertia SSR](https://inertiajs.com/server-side-rendering)，你可以在调用 `breeze:install` 命令时提供 `ssr` 选项：

```shell
php artisan breeze:install vue --ssr
php artisan breeze:install react --ssr
```

<a name="breeze-and-next"></a>

### Breeze & Next.js / API

Laravel Breeze 还可以生成身份验证 API，可以准备验证现代 JavaScript 应用程序，例如由 [Next](https://nextjs.org/)，[Nuxt](https://nuxtjs.org/) 等驱动的应用。要开始，请在执行 `breeze:install` Artisan 命令时指定 `api` 堆栈作为所需的堆栈：

```shell
php artisan breeze:install api

php artisan migrate
```

在安装期间，Breeze 将在应用程序的 `.env` 文件中添加 `FRONTEND_URL` 环境变量。该 URL 应该是你的 JavaScript 应用程序的 URL。在本地开发期间，这通常是 `http://localhost:3000`。另外，你应该确保 `APP_URL` 设置为 `http://localhost:8000`，这是 `serve` Artisan 命令使用的默认 URL。

<a name="next-reference-implementation"></a>
#### Next.js 参考实现

最后，你可以将此后端与你选择的前端配对。Breeze 前端的 Next 参考实现在 [在GitHub上提供](https://github.com/laravel/breeze-next)。此前端由 Laravel 维护，并包含与 Breeze 提供的传统 Blade 和 Inertia 堆栈相同的用户界面。

<a name="laravel-jetstream"></a>
## Laravel Jetstream

虽然 Laravel Breeze 为构建 Laravel 应用程序提供了简单和最小的起点，但 Jetstream 通过更强大的功能和附加的前端技术栈增强了该功能。**对于全新接触 Laravel 的用户，我们建议使用 Laravel Breeze 学习一段时间后再尝试 Laravel Jetstream。**

Jetstream 为 Laravel 提供了美观的应用程序脚手架，并包括登录、注册、电子邮件验证、双因素身份验证、会话管理、通过 Laravel Sanctum 支持的 API 以及可选的团队管理。Jetstream 使用 [Tailwind CSS](https://tailwindcss.com/) 设计，并提供你选择使用 [Livewire](https://laravel-livewire.com/) 或 [Inertia](https://inertiajs.com/) 驱动的前端脚手架。

有关安装 Laravel Jetstream 的完整文档，请参阅 [Jetstream 官方文档](https://jetstream.laravel.com/3.x/introduction.html)。
