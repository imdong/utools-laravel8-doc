# Laravel Octane

- [介绍](#introduction)
- [安装](#installation)
- [服务器先决条件](#server-prerequisites)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [为应用程序提供服务](#serving-your-application)
    - [通过 HTTPS 服务应用程序](#serving-your-application-via-https)
    - [通过 NGINX 提供服务](#serving-your-application-via-nginx)
    - [监听文件更改](#watching-for-file-changes)
    - [指定工作程序数量](#specifying-the-worker-count)
    - [指定最大请求数量](#specifying-the-max-request-count)
    - [重载 workers](#reloading-the-workers)
    - [停止服务](#stopping-the-server)
- [依赖注入与 Octane](#dependency-injection-and-octane)
    - [容器注入](#container-injection)
    - [请求注入](#request-injection)
    - [配置文件注入](#configuration-repository-injection)
- [管理内存泄漏](#managing-memory-leaks)
- [并发任务](#concurrent-tasks)
- [刻度和间隔](#ticks-and-intervals)
- [Octane 缓存](#the-octane-cache)
- [表](#tables)

<a name="introduction"></a>
## 介绍

[Laravel Octane](https://github.com/laravel/octane) 通过使用高性能应用程序服务器为您的应用程序提供服务来增强您的应用程序的性能，包括 [Open Swoole](https://swoole.co.uk)，[Swoole](https://github.com/swoole/swoole-src)，和 [RoadRunner](https://roadrunner.dev)。Octane 启动您的应用程序一次，将其保存在内存中，然后以极快的速度向它提供请求。

<a name="installation"></a>
## 安装

Octane 可以通过 Composer 包管理器安装：

```shell
composer require laravel/octane
```

安装 Octane 后，您可以执行 `octane:install` 命令，该命令会将 Octane 的配置文件安装到您的应用程序中：

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## 服务器先决条件

> 注意：Laravel Octane 需要 [PHP 8.0+](https://php.net/releases/).

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev) 由使用 Go 构建的 RoadRunner 二进制文件提供支持。当您第一次启动基于 RoadRunner 的 Octane 服务器时，Octane 将为您提供下载和安装 RoadRunner 二进制文件。



<a name="roadrunner-via-laravel-sail"></a>
####  通过 Laravel Sail 安装 RoadRunner

如果你打算使用 [Laravel Sail](/docs/laravel/9.x/sail) 开发你的应用程序，你应该运行以下命令来安装 Octane 和 RoadRunner：

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner
```

接下来应启动 Sail shell 并使用 `rr` 可执行文件来检查基于 Linux 的最新版本的 RoadRunner 二进制文件：

```shell
./vendor/bin/sail shell

# Within the Sail shell...
./vendor/bin/rr get-binary
```

安装 RoadRunner 二进制文件后可退出 Sail shell 会话。接下来需要调整 Sail 使用的 `supervisor.conf` 文件以保持应用运行。首先，执行 `sail:publish` Artisan 命令：

```shell
./vendor/bin/sail artisan sail:publish
```

接下来，更新应用程序的 `docker/supervisord.conf` 文件的 `command` 指令，以便 Sail 使用 Octane 作为服务器为你的应用提供服务：

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=8000
```

最后，确保 `rr` 二进制文件是可执行的并重新构建 Sail 镜像：

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

如果你打算使用 Swoole 应用服务器来配合 Laravel Octane，你必须安装 Swoole PHP 扩展。通常可以通过 PECL 完成：

```shell
pecl install swoole
```

<a name="swoole-via-laravel-sail"></a>
#### 通过 Laravel Sail 使用 Swoole 

> 注意：在通过 Sail 提供 Octane 应用程序之前，请确保你使用的是最新版本的 Laravel Sail 并在应用程序的根目录中执行 `./vendor/bin/sail build --no-cache`。



你可以使用 [Laravel Sail](/docs/laravel/9.x/sail) （Laravel 基于 Docker 的官方开发环境）开发基于 Swoole 的 Octane 应用程序。Laravel Sail 默认包含 Swoole 扩展。但是，你仍然需要调整 Sail 使用的 `supervisor.conf` 文件以保持应用运行。首先，执行 `sail:publish` Artisan 命令：

```shell
./vendor/bin/sail artisan sail:publish
```

接下来，更新应用程序的 `docker/supervisord.conf` 文件的 `command` 指令，以便 Sail 使用 Octane 替代 PHP 开发服务器：

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80
```

最后，构建你的 Sail 镜像：

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 配置

Swoole 支持一些额外的配置选项，如果需要，你可以将它们添加到您的 `octane` 配置文件中。因为它们很少需要修改，所以这些选项不包含在默认配置文件中：

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
];
```

<a name="serving-your-application"></a>
## 启用服务

Octane 服务器可以通过 `octane:start` Artisan 命令启动。此命令将使用由应用程序的 `octane` 配置文件的 `server` 配置选项指定的服务器：

```shell
php artisan octane:start
```

Octane 将在 8000 端口上启动服务器（可配置），因此你可以在 Web 浏览器中通过 `http://localhost:8000` 访问你的应用程序。

<a name="serving-your-application-via-https"></a>
### 通过 HTTPS 为应用程序提供服务



默认情况下，通过 Octane 运行的应用程序会生成以 `http://` 为前缀的链接。当使用 HTTPS 时，可将在应用的`config/octane.php` 配置文件中使用的 `OCTANE_HTTPS` 环境变量设置为 `true`。当此配置值设置为 `true` 时，Octane 将指示 Laravel 在所有生成的链接前加上 `https://`：

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### 通过 Nginx 为应用提供服务

> 提示：如果你还没有准备好管理自己的服务器配置，或者不习惯配置运行健壮的 Laravel Octane 应用所需的所有各种服务，请查看 [Laravel Forge](https://forge.laravel.com)。

在生产环境中，你应该在传统 Web 服务器（例如 Nginx 或 Apache）之后为 Octane 应用提供服务。 这样做将允许 Web 服务器为你的静态资源（例如图片和样式表）提供服务，并管理 SSL 证书。

在下面的 Nginx 配置示例文件中，Nginx 将向在端口 8000 上运行的 Octane 服务器提供站点的静态资源和代理请求：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```



<a name="watching-for-file-changes"></a>
### 监视文件修改

由于应用在 Octane 服务启动时已经加载到内存中了，因此代码修改后不会起作用。例如，`routes/web.php` 文件增加路由，在服务重启之前，都不会生效。为了方便，可以使用 `--watch` 标识来让 Octane 在应用中任何文件修改时都能够自动重启：

```shell
php artisan octane:start --watch
```

使用该功能之前，必须保证本地开发环境安装了 [Node](https://nodejs.org) 。并且在项目库中安装 [Chokidar](https://github.com/paulmillr/chokidar) 文件监视库：

```shell
npm install --save-dev chokidar
```

你可以使用应用程序的 `config/octane.php` 配置文件中的 `watch` 配置选项配置应监视的目录和文件。

<a name="specifying-the-worker-count"></a>
### 指定线程数

默认，Octane 会对机器的每个 CPU 核心启动一个应用线程。这些线程将处理进入应用的 HTTP 请求。你可以通过 `octane:start` 命令的 `--workers` 参数手动设置线程数：

```shell
php artisan octane:start --workers=4
```

如果是使用 Swoole 服务，可以设置 [「任务线程」](#concurrent-tasks) 数量：

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>


### 指定最大请求计数

为了防止内存泄漏，Octane 可在处理了给定数量的请求后优雅地重新启动 worker。要指示 Octane 执行此操作，你可以使用 `--max-requests` 选项：

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### 重载 Workers

你可以使用 `octane:reload` 命令优雅地重新启动 Octane 服务器的应用 workers。通常，这应该在部署后完成，以便将新部署的代码加载到内存中并用于为后续请求提供服务：

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### 停止服务器

你可以使用 `octane:stop` Artisan 命令停止 Octane 服务器：

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### 检查服务器状态

你可以使用 `octane:status` Artisan 命令检查 Octane 服务器的当前状态：

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## 依赖注入和 Octane

由于 Octane 会引导你的应用程序一次并在服务请求时将其保存在内存中，因此在构建应用程序时应考虑一些注意事项。例如，应用程序服务提供者的 `register` 和 `boot` 方法只会在 request worker 初始启动时执行一次。在后续请求中，将重用相同的应用程序实例。

鉴于这个机制，在将应用服务容器或请求注入任何对象的构造函数时应特别小心。该对象需支持容器的陈旧版本用以对后续请求的支持。



Octane 将自动处理在请求之间重置框架状态。但是，Octane 并不总是知道如何重置由你的应用创建的全局状态。因此，你应该了解如何以一种对 Octane 友好的方式构建你的应用。下面，我们将讨论在使用 Octane 时可能导致问题的常见情况。

<a name="container-injection"></a>
### 容器注入

一般来说，你应该避免将应用服务容器或 HTTP 请求实例注入到其他对象的构造函数中。例如，以下绑定将整个应用程序服务容器注入到绑定为单例的对象中：

```php
use App\Service;

/**
 * 注册应用服务。
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app);
    });
}
```

在此示例中，如果在应用程序启动过程中解析了 `Service` 实例，则容器将被注入到服务中，并且该容器将在后续请求中由 `Service` 实例持有。这 **可能** 对于你的特定应用程序来说不是问题；但是，它可能导致容器意外丢失在引导周期后期或后续请求中添加的绑定。

作为解决方法，可以停止将绑定注册为单例，或者将容器解析器闭包注入到始终解析当前容器实例的服务中：

```php
use App\Service;
use Illuminate\Container\Container;

$this->app->bind(Service::class, function ($app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```



全局 `app` 助手和 `Container::getInstance()` 方法会一直返回应用容器的最新版本。

<a name="request-injection"></a>
### 请求注入

通常，你应该避免在其他对象的构造器中注入应用服务容器或 HTTP 请求实例。例如，下面将一整个请求实例作为单例绑定到一个对象上：

```php
use App\Service;

/**
 * 注册应用服务。
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app['request']);
    });
}
```

例子中，如果 `Service` 实例在应用启动时生成，HTTP 请求会注入到这个服务中，随后请求中的相同请求都会被 `Service` 实例处理。这样，全部的 headers ，输入，和查询数据，以及其他数据都会不正确的。

想要解决此问题，就需要停止单例绑定，或者将请求处理程序注入到一个始终生成当前请求实例的服务中。又或者，最推荐的方法是将对象需要的请求信息作为传参：

```php
use App\Service;

$this->app->bind(Service::class, function ($app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function ($app) {
    return new Service(fn () => $app['request']);
});

// Or...

$service->method($request->input('name'));
```

全局 `request` 助手始终返回当前处理的请求，因此可以安全地使用。

> 提示：控制器方法中或者路由闭包中，依然可以使用 `Illuminate\Http\Request` 作为类型提示。



<a name="configuration-repository-injection"></a>
### 配置仓库注入

通常，应该避免将配置仓库实例注入到其他对象的构造器中。例如，下面的绑定将配置仓库作为单例注入到对象中：

```php
use App\Service;

/**
 * 注册程序服务
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(Service::class, function ($app) {
        return new Service($app->make('config'));
    });
}
```

例子中，如果请求中的配置值改变了，服务将无法获取新值，因为它依赖原始的仓库实例。

如要解决，应该停止单例绑定，或者将配置仓库注入到一个类中：

```php
use App\Service;
use Illuminate\Container\Container;

$this->app->bind(Service::class, function ($app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

全局 `config` 始终返回配置仓库的最新版本 ，可以安全地使用它。

<a name="managing-memory-leaks"></a>
### 管理内存泄漏

记住， 在请求中，Octane 将应用维护在内存中；因此，向静态数组中添加数据，可能会造成内存泄漏。例如，下面的控制器存在内存泄漏，因为每个请求持续向静态数组 `$data` 中添加数据：

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * 处理列表请求
 *
 * @param  \Illuminate\Http\Request  $request
 * @return void
 */
public function index(Request $request)
{
    Service::$data[] = Str::random(10);

    // ...
}
```



开发应用时，需要特别注意尽量避免造成这些类型的内存泄漏。本地开发时时刻监控内存使用情况，从而确保不会造成新的内存泄漏。

<a name="concurrent-tasks"></a>
## 并行任务

> 注意：这个功能仅支持 [Swoole](#swoole).

Swoole 允许并行执行一些轻量化的后台任务。 这可以通过 Octane 的 `concurrently` 方法实现。可以将这个方法与 PHP 数组解构结合来接收每个操作的结果：

```php
use App\User;
use App\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Octane 利用 Swoole 的 “task workers” 处理并行任务，在与传入请求完全不同的进程中执行。并行任务可用的执行者的数量由 `octane:start` 命令的 `--task-workers` 参数决定：

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="ticks-and-intervals"></a>
## 计时与间隔

> 注意：此功能仅支持 [Swoole](#swoole).

Swoole 中，“计时”操作能够按指定的秒数间隔执行。`tick` 方法可以注册 “计时” 回调操作。`tick` 方法的第一个参数代表计时器的名称，第二个参数代表指定间隔执行的回调。

例子中，注册了一个每 10 秒执行一次的闭包。通常，`tick` 方法应该在应用服务提供者的 `boot` 方法中调用：

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```



使用 `immediate` 方法指示 Octane 在启动服务时立即调用 tick 回调，此后每 N 秒调用一次：

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## Octane 缓存

> 注意：此功能仅支持 [Swoole](#swoole).

使用 Swoole 时，你可以利用 Octane 缓存驱动程序，它提供高达每秒 200 万次操作的读取和写入速度。因此，对于需要从其缓存层获得极高读/写速度的应用程序，此缓存驱动程序是绝佳选择。

此缓存驱动程序由 [Swoole tables](https://www.swoole.co.uk/docs/modules/swoole-table) 提供支持。 服务器上的所有 Workers 都可以使用缓存中存储的所有数据。但是，当服务器重新启动时，缓存的数据将被刷新：

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> 技巧：Octane 缓存中允许的最大条目数可以在应用程序的 `octane` 配置文件中定义。

<a name="cache-intervals"></a>
### 缓存间隔

除了 Laravel 缓存系统提供的常见方法之外，Octane 缓存驱动程序还具有基于间隔的缓存。这些缓存会在指定的时间间隔自动刷新，并且应该在你的应用程序服务提供商之一的`boot`方法中注册。例如，以下缓存将每五秒刷新一次：

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5)
```

<a name="tables"></a>
## 表

> 注意：此功能仅支持 [Swoole](#swoole).

使用 Swoole 时，你可以定义自己的任意 [Swoole tables](https://www.swoole.co.uk/docs/modules/swoole-table) 并与之交互。 Swoole table 提供了极高的性能吞吐量，服务器上的所有 Workers 都可以访问这些表中的数据。但是，当服务器重新启动时，其中的数据将丢失。



表在应用 `octane` 配置文件 `tables` 数组配置中设定。最大运行 1000 行的示例表已经配置。像下面这样，字符串行支持的最大长度在列类型后面设置：

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

通过 `Octane::table` 方法访问表：

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> 注意：Swoole table 支持的列类型有： `string` ，`int` 和 `float` 。

