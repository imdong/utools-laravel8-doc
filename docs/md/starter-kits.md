# 入门套件

- [介绍](#introduction)
- [Laravel Breeze](#laravel-breeze)
    - [安装](#laravel-breeze-installation)
    - [Breeze & Inertia](#breeze-and-inertia)
    - [Breeze & Next.js / API](#breeze-and-next)
- [Laravel Jetstream](#laravel-jetstream)

<a name="introduction"></a>
## 介绍

为了让您开始构建新的 Laravel 应用程序，我们很高兴提供身份验证和应用程序入门工具包。 这些工具包会自动为您的应用程序提供注册和验证应用程序用户所需的路由、控制器和视图。

虽然欢迎您使用这些入门套件，但它们不是必需的。 只需安装一个新的 Laravel 副本，您就可以自由地从头开始构建自己的应用程序。 无论哪种方式，我们都知道你会创造出伟大的东西！

<a name="laravel-breeze"></a>
## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze) 是 Laravel 的所有 [认证功能](/docs/laravel/9.x/authentication) 的最小、简单的实现，包括登录、注册、密码重置、电子邮件验证和密码确认。 Laravel Breeze 的默认视图层由简单的 [Blade 模板](/docs/laravel/9.x/blade) 组成，并使用 [Tailwind CSS](https://tailwindcss.com) 进行样式设置。

Breeze 为开始一个全新的 Laravel 应用程序提供了一个很好的起点，对于计划使用 [Laravel Livewire](https://laravel-livewire.com) 将其 Blade 模板提升到新水平的项目来说，它也是一个很好的选择。

<a name="laravel-breeze-installation"></a>
### 安装

首先，你应该[创建一个新的 Laravel 应用程序](/docs/laravel/9.x/installation)，配置你的数据库，然后运行你的[数据库迁移](/docs/laravel/9.x/migrations)：

```shell
curl -s https://laravel.build/example-app | bash

cd example-app

php artisan migrate
```

一旦你创建了一个新的 Laravel 应用程序，你就可以使用 Composer 安装 Laravel Breeze：

```shell
composer require laravel/breeze --dev
```



Composer 安装好 Laravel Breeze 包后，你可以运行 `breeze:install` Artisan 命令。 此命令将身份验证视图、路由、控制器和其他资源发布到您的应用程序。 Laravel Breeze 将其所有代码发布到您的应用程序，以便您可以完全控制和查看其功能和实现。 安装 Breeze 后，您还应该编译您的资产，以便您的应用程序的 CSS 文件可用：

```shell
php artisan breeze:install

npm install
npm run dev
php artisan migrate
```

接下来，您可以在 Web 浏览器中导航到应用程序的 `/login` 或 `/register` URL。 Breeze 的所有路由都在 `routes/auth.php` 文件中定义。

> 技巧：要了解有关编译应用程序的 CSS 和 JavaScript 的更多信息，请查看 [Laravel Mix 文档](/docs/laravel/9.x/mix#running-mix)。

<a name="breeze-and-inertia"></a>
### Breeze & Inertia

Laravel Breeze 还提供了一个由 Vue 或 React 提供支持的 [Inertia.js](https://inertiajs.com) 前端实现。 要使用 Inertia 堆栈，请在执行 `breeze:install` Artisan 命令时指定 `vue` 或 `react` 作为所需的堆栈：

```shell
php artisan breeze:install vue

// 或...

php artisan breeze:install react

npm install
npm run dev
php artisan migrate
```

<a name="breeze-and-next"></a>
### Breeze & Next.js / API

Laravel Breeze 还可以构建一个身份验证 API，该 API 已准备好对现代 JavaScript 应用程序进行身份验证，例如由 [Next](https://nextjs.org)、[Nuxt](https://nuxtjs.org) 等提供支持的应用程序。 首先，在执行 `breeze:install` Artisan 命令时，将 `api` 堆栈指定为所需的堆栈：

```shell
php artisan breeze:install api

php artisan migrate
```



在安装过程中，Breeze 会在您的应用程序 `.env` 文件中添加一个 `FRONTEND_URL` 环境变量。此 URL 应该是您的 JavaScript 应用程序的 URL。在本地开发期间这通常是 `http://localhost:3000`。此外，您应该确保您 `APP_URL` 的设置为 `http://localhost:8000`，这是 `serve` Artisan 命令使用的默认 URL。

<a name="next-reference-implementation"></a>
#### Next.js 参考实现

最后，您已准备好将此后端与您选择的前端配对。 [GitHub 上提供](https://github.com/laravel/breeze-next)了 Breeze 前端的 Next 参考实现。该前端由 Laravel 维护，包含与 Breeze 提供的传统 Blade 和 Inertia 堆栈相同的用户界面。

<a name="laravel-jetstream"></a>
## Laravel Jetstream

Laravel Breeze 提供了一个简单的、最小化的起点来构建 Laravel 应用，而 Jetstream 则通过更强大的功能和额外的前端技术堆栈来对应用功能进行增强。 **对于那些刚接触 Laravel 的人，我们建议在学习 Laravel Jetstream 之前先学习 Laravel Breeze。**

Jetstream 为 Laravel 提供了精美设计的应用程序脚手架代码，包括登录、注册、邮箱验证、双因子认证、会话管理、基于 Laravel Sanctum 的 API 支持，以及可选的团队管理功能。Jetstream 使用  [Tailwind CSS](https://tailwindcss.com) 设计样式，并提供 [Livewire](https://laravel-livewire.com) 或 [Inertia.js](https://inertiajs.com) 驱动的前端脚手架技术栈供你选择。

Laravel Jetstream 的安装使用完整文档位于 [Jetstream 官方文档](https://jetstream.laravel.com/2.x/introduction.html).

