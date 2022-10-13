# 部署

- [简介](#introduction)
- [服务器要求](#server-requirements)
- [服务器配置](#server-configuration)
    - [Nginx](#nginx)
- [优化](#optimization)
    - [优化自动加载器](#autoloader-optimization)
    - [优化配置加载](#optimizing-configuration-loading)
    - [优化路由加载](#optimizing-route-loading)
    - [优化视图加载](#optimizing-view-loading)
- [Debug 模式](#debug-mode)
- [使用 Forge / Vapor 部署](#deploying-with-forge-or-vapor)

<a name="introduction"></a>
## 简介

当你准备在生产环境部署 Laravel 应用时，请注意以下几点以使你的应用尽可能高效地运行。本文将会提供几个范本以使你的 Laravel 应用部署妥当。

<a name="server-requirements"></a>
## 服务器要求

Laravel 框架对系统有一些要求，请确保你的 Web 服务器至少满足以下 PHP 版本及扩展需求。

<div class="content-list" markdown="1">

- PHP >= 8.0
- BCMath PHP 扩展
- Ctype PHP 扩展
- DOM PHP 扩展
- Fileinfo PHP 扩展
- JSON PHP 扩展
- Mbstring PHP 扩展
- OpenSSL PHP 扩展
- PCRE PHP 扩展
- PDO PHP 扩展
- Tokenizer PHP 扩展
- XML PHP 扩展

</div>

<a name="server-configuration"></a>
## 服务器配置

<a name="nginx"></a>
### Nginx

当你想要部署应用到 Nginx 服务器上时，你可能会用到下面这个配置文件作为一个范本来配置你的 Web 服务器。这份文件很可能需要根据你的服务器配置进行一些自定义的修改。 **如果你想要一些协助以便更好地管理服务器，可以考虑使用 Laravel 服务器管理及部署第一方服务 [Laravel Forge](https://forge.laravel.com)。**



请确保，就像下面的配置一样，您的 Web 服务器将所有请求定向到项目目录的 `public/index.php` 文件。 不应该将 `index.php` 文件移动到项目的根目录，因为从项目根目录提供应用程序会将许多敏感配置文件暴露到公网：

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
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
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
### 优化自动加载

将项目部署到生产环境时，请确保您正在优化 Composer 的类自动加载器映射，以便 Composer 可以快速找到要为给定类加载的正确文件：

```shell
composer install --optimize-autoloader --no-dev
```

> 技巧：除了优化自动加载器之外，您应该始终确保在项目的源代码控制存储库中包含一个 `composer.lock` 文件。 当存在 `composer.lock` 文件时，可以更快地安装项目的依赖项。

<a name="optimizing-configuration-loading"></a>
### 优化配置加载

将应用程序部署到生产环境时，应确保在部署过程中运行 `config:cache` Artisan 命令 来提前缓存一些 配置 等信息：

```shell
php artisan config:cache
```



该命令会将 Laravel 的所有配置文件合并到一个缓存文件中，这大大减少了框架在加载配置值时必须访问文件系统的次数。

> 注意：如果您在部署过程中执行 `config:cache` 命令，则应确保仅从配置文件中调用 `env` 函数。 一旦配置被缓存，`.env` 文件将不会被加载，所有对 `.env` 变量的 `env` 函数的调用都将返回 `null`。

<a name="optimizing-route-loading"></a>
### 优化路由加载

如果您正在构建具有许多路由的大型应用程序，则应确保在部署过程中运行 `route:cache` Artisan 命令：

```shell
php artisan route:cache
```

此命令将所有路由注册减少到缓存文件中的单个方法调用中，从而在注册数百条路由时提高路由注册的性能。

<a name="optimizing-view-loading"></a>
### 优化视图加载

将应用程序部署到生产环境时，应确保在部署过程中运行 `view:cache` Artisan 命令：

```shell
php artisan view:cache
```

此命令预编译所有 Blade 视图，因此它们不会按需编译，从而提高返回视图的每个请求的性能。

<a name="debug-mode"></a>
## 调试模式

`config/app.php` 配置文件中的调试选项决定了实际向用户显示了多少有关错误的信息。默认情况下，此选项设置为尊重 APP_DEBUG 环境变量的值，该变量存储在您的 `.env` 文件中。



**在您的生产环境中，此值应始终为 `false`。 如果在生产环境中将 `APP_DEBUG` 变量设置为 `true`，则可能会将敏感配置值暴露给应用程序的最终用户。**

<a name="deploying-with-forge-or-vapor"></a>
## 使用 Forge / Vapor 进行部署

<a name="laravel-forge"></a>
#### Laravel Forge

如果您还没有准备好管理自己的服务器配置，或者不习惯配置运行强大的 Laravel 应用程序所需的所有各种服务，[Laravel Forge](https://forge.laravel.com) 是一个很棒的选择。

Laravel Forge 可以在 DigitalOcean、Linode、AWS 等各种基础设施提供商上创建服务器。此外，Forge 安装和管理构建强大的 Laravel 应用程序所需的所有工具，例如 Nginx、MySQL、Redis、Memcached、Beanstalk 等。

<a name="laravel-vapor"></a>
#### Laravel Vapor

如果你想要一个为 Laravel 调整的完全无服务器、自动扩展的部署平台，请查看 [Laravel Vapor](https://vapor.laravel.com)。 Laravel Vapor 是 Laravel 的无服务器部署平台，由 AWS 提供支持。在 Vapor 上启动您的 Laravel 基础架构，并爱上无服务器的可扩展简单性。Laravel Vapor 由 Laravel 的创建者进行了微调，可以与框架无缝协作，这样你就可以像以前一样继续编写 Laravel 应用程序。

