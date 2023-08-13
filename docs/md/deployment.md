# 部署

- [介绍](#introduction)
- [服务器要求](#server-requirements)
- [服务器配置](#server-configuration)
  - [Nginx](#nginx)
- [优化](#optimization)
  - [优化自动加载器](#autoloader-optimization)
  - [优化配置加载](#optimizing-configuration-loading)
  - [优化路由加载](#optimizing-route-loading)
  - [优化视图加载](#optimizing-view-loading)
- [调试模式](#debug-mode)
- [使用 Forge / Vapor 进行部署](#deploying-with-forge-or-vapor)

<a name="introduction"></a>

## 介绍

当你准备将 Laravel 应用程序部署到生产环境时，你可以做一些重要的事情来确保应用程序尽可能高效地运行。本文将会提供几个范本以使你的 Laravel 应用部署妥当。

<a name="server-requirements"></a>

## 服务器要求

Laravel 框架有一些系统要求。你应该确保你的 Web 服务器具有以下最低 PHP 版本和扩展：

<div class="content-list" markdown="1">

- PHP >= 8.1
- Ctype PHP 扩展
- cURL PHP 扩展
- DOM PHP 扩展
- Fileinfo PHP 扩展
- Filter PHP 扩展
- Hash PHP 扩展
- Mbstring PHP 扩展
- OpenSSL PHP 扩展
- PCRE PHP 扩展
- PDO PHP 扩展
- Session PHP 扩展
- Tokenizer PHP 扩展
- XML PHP 扩展

</div>

<a name="server-configuration"></a>

## 服务器配置

<a name="nginx"></a>

### Nginx

如果你将应用程序部署到运行 Nginx 的服务器上，你可以将以下配置文件作为为你的 Web 服务器配置的起点。最有可能需要根据你的服务器配置自定义此文件。**如果你需要管理服务器，请考虑使用官方的 Laravel 服务器管理和部署服务，如 [Laravel Forge](https://forge.laravel.com)。**

请确保像以下配置一样，你的 Web 服务器将所有请求指向应用程序的 `public/index.php` 文件。永远不要尝试将 `index.php` 文件移动到项目的根目录，因为从项目根目录为应用提供服务会将许多敏感配置文件暴露到公网。

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
<a name="optimization"></a>

## 优化

<a name="autoloader-optimization"></a>

### 优化自动加载器

在部署到生产环境时，请确保你正在优化 Composer 的类自动加载器映射，以便 Composer 可以快速找到适合给定类加载的文件：

```shell
composer install --optimize-autoloader --no-dev
```

> **注意**
> 除了优化自动加载器之外，你还应该始终确保在项目的源代码控制存储库中包括一个 `composer.lock` 文件。存在 `composer.lock` 文件时，可以更快地安装项目的依赖项。

<a name="optimizing-configuration-loading"></a>

### 优化配置加载

在将应用程序部署到生产环境时，你应该确保在部署过中运行 `config:cache` Artisan 命令来提前对一些配置文件做一下缓存：

```shell
php artisan config:cache
```

这个命令将把 Laravel 的所有配置文件合并成一个缓存文件，大大减少框在加载配置值时必须进行的文件系统访问次数。

> **警告**
> 如果你在部署过程中执行 `config:cache` 命令，应确保仅从配置文件中调用 `env` 函数。一旦配置已被缓存，`.env` 文件将不再被加载，所有对于 `.env` 变量 env 函数的调用将返回 null。

<a name="optimizing-route-loading"></a>

### 优化路由加载

如果你正在构建一个包含许多路由的大型应用程序，你应该确保在部署过程中运行 `route:cache` Artisan 命令：

```shell
php artisan route:cache
```

这个命令将所有路由注册缩减成单个方法调用且放入缓存文件中，提高注册大量路由时的性能。

<a name="optimizing-view-loading"></a>

### 优化视图加载

在将应用程序部署到生产环境时，你应该确保在部署过程中运行 `view:cache` Artisan 命令：

```shell
php artisan view:cache
```

这个命令预编译了所有的 Blade 视图，使它们不再是按需编译，因此可以提高返回视图的每个请求的性能。

<a name="debug-mode"></a>

## 调试模式

在 `config/app.php` 配置文件中，调试选项决定了有多少错误信息实际上会显示给用户。默认情况下，该选项设置为遵守 `APP_DEBUG` 环境变量的值，该值存储在你的应用程序的 `.env` 文件中。

**在生产环境中，这个值应该永远是 `false`。如果在生产环境中将 `APP_DEBUG` 变量的值设置为 `true`，则存在将敏感配置值暴露给应用程序最终用户的风险。**

<a name="deploying-with-forge-or-vapor"></a>

## 使用 Forge / Vapor 部署

<a name="laravel-forge"></a>

#### Laravel Forge

如果你还不准备好管理自己的服务器配置，或者对于配置运行一个强大的 Laravel 应用程序所需的各种服务不太熟悉，那么 [Laravel Forge](https://forge.laravel.com) 是一个非常好的选择。

Laravel Forge 可以在诸如Linode、AWS 等多种基础设施服务提供商上创建服务器。此外，Forge 还安装和管理构建强大的 Laravel 应用程序所需的所有工具，例如 Nginx、MySQL、Redis、Memcached、Beanstalk 等等。

> **注意**
> 想获取 Laravel Forge 完整部署指南吗？请查看 [Laravel Bootcamp](https://bootcamp.laravel.com/deploying) 和 [Laracasts 上提供的 Forge 视频系列](https://laracasts.com/series/learn-laravel-forge-2022-edition)。

<a name="laravel-vapor"></a>

#### Vapor

如果你想要一个为 Laravel 调整的完全无服务器、自动扩展的部署平台，请看看 [Laravel Vapor](https://vapor.laravel.com)。Laravel Vapor 是一个由 AWS 提供支持的基于无服务器概念的 Laravel 部署平台。在 Vapor 上启动你的 Laravel 基础架构，并爱上无服务器的可扩展简单性。Laravel Vapor 由 Laravel 的创作者进行了精细调校，以便与框架无缝协作，因此你可以像以前一样继续编写 Laravel 应用程序。
