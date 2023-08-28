
# Laravel Octane

- [简介](#introduction)
- [安装](#installation)
- [服务器先决条件](#server-prerequisites)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [为应用程序提供服务](#serving-your-application)
    - [通过 HTTPS 服务应用程序](#serving-your-application-via-https)
    - [通过 Nginx 提供服务](#serving-your-application-via-nginx)
    - [监听文件修改](#watching-for-file-changes)
    - [指定 Worker 数量](#specifying-the-worker-count)
    - [指定最大请求数量](#specifying-the-max-request-count)
    - [重载 Workers](#reloading-the-workers)
    - [停止服务](#stopping-the-server)
- [依赖注入与 Octane](#dependency-injection-and-octane)
    - [容器注入](#container-injection)
    - [请求注入](#request-injection)
    - [配置文件注入](#configuration-repository-injection)
- [管理内存泄漏](#managing-memory-leaks)
- [并发任务](#concurrent-tasks)
- [计时与间隔](#ticks-and-intervals)
- [Octane 缓存](#the-octane-cache)
- [表](#tables)

<a name="introduction"></a>
## 简介

[Laravel Octane](https://github.com/laravel/octane) 通过使用高性能应用程序服务器为您的应用程序提供服务来增强您的应用程序的性能，包括 [Open Swoole](https://openswoole.com/)，[Swoole](https://github.com/swoole/swoole-src)，和 [RoadRunner](https://roadrunner.dev)。Octane 启动您的应用程序一次，将其保存在内存中，然后以极快的速度向它提供请求。

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

> **注意**
> Laravel Octane 需要 [PHP 8.1+](https://php.net/releases/).

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev) 由使用 Go 构建的 RoadRunner 二进制文件提供支持。当您第一次启动基于 RoadRunner 的 Octane 服务器时，Octane 将为您提供下载和安装 RoadRunner 二进制文件。



<a name="roadrunner-via-laravel-sail"></a>
#### 通过 Laravel Sail 使用 RoadRunner

如果你打算使用 [Laravel Sail](/docs/laravel/10.x/sail) 开发应用，你应该运行如下命令安装 Octane 和 RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner
```

接下来，你应该启动一个 Sail Shell，并运行 `rr` 可执行文件检索基于 Linux 的最新版 RoadRunner 二进制文件：

```shell
./vendor/bin/sail shell

# Within the Sail shell...
./vendor/bin/rr get-binary
```

安装完 RoadRunner 二进制文件后，你可以退出 Sail Shell 会话。然后，需要调整 Sail 用来保持应用运行的 `supervisor.conf` 文件。首先，请执行 `sail:publish` Artisan 命令：

```shell
./vendor/bin/sail artisan sail:publish
```

接着，更新应用 `docker/supervisord.confd` 文件中的 `command` 指令，这样 Sail 就可以使用 Octane 作为服务器，而非 PHP 开发服务器，运行服务了：

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80
```

最后，请确保 `rr` 二进制文件是可执行的并重新构建 Sail 镜像：

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

如果你打算使用 Swoole 服务器来运行 Laravel Octane 应用，你必须安装 Swoole PHP 组件。通常可以通过 PECL 安装：

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

如果你想要使用 Open Swoole 服务器运行 Laravel Octane 应用，你必须安装 Open Swoole PHP 扩展。通常可以通过 PECL 完成安装：

```shell
pecl install openswoole
```



通过 Open Swoole 使用 Laravel Octane，可以获得 Swoole 提供的相同功能，如并发任务，计时和间隔。

<a name="swoole-via-laravel-sail"></a>
#### 通过 Laravel Sail 使用 Swoole

> **注意**
> 在通过 Sail 提供 Octane 应用程序之前，请确保你使用的是最新版本的 Laravel Sail 并在应用程序的根目录中执行 `./vendor/bin/sail build --no-cache`。

你可以使用 Laravel 的官方 Docker 开发环境 [Laravel Sail](/docs/laravel/10.x/sail) 开发基于 Swoole 的 Octane 应用程序。 Laravel Sail 默认包含 Swoole 扩展。但是，你仍然需要调整 Sail 使用的 `supervisor.conf` 件以保持应用运行。首先，执行 `sail:publish` Artisan 命令：

```shell
./vendor/bin/sail artisan sail:publish
```

接下来，更新应用程序的 `docker/supervisord.conf` 文件的 `command` 指令，使得 Sail 使用 Octane 替代 PHP 开发服务器：

```ini
command=/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80
```

最后，构建你的 Sail 镜像：

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Swoole 配置

Swoole 支持一些额外的配置选项，如果需要，你可以将它们添加到你的 `octane` 配置文件中。因为它们很少需要修改，所以这些选项不包含在默认配置文件中：

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## 为应用程序提供服务

Octane 服务器可以通过 `octane:start`  Artisan 命令启动。此命令将使用由应用程序的 `octane` 配置文件的 `server` 配置选项指定的服务器：

```shell
php artisan octane:start
```



默认情况下，Octane 将在 8000 端口上启动服务器（可配置），因此你可以在 Web 浏览器中通过 `http://localhost:8000` 访问你的应用程序。

<a name="serving-your-application-via-https"></a>
### 通过 HTTPS 为应用程序提供服务

默认情况下，通过 Octane 运行的应用程序会生成以 `http://` 为前缀的链接。当使用 HTTPS 时，可将在应用的 `config/octane.php` 配置文件中使用的 `OCTANE_HTTPS` 环境变量设置为 `true`。当此配置值设置为 `true` 时，Octane 将指示 Laravel 在所有生成的链接前加上 `https://`：

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### 通过 Nginx 为应用提供服务

> **提示**
> 如果你还没有准备好管理自己的服务器配置，或者不习惯配置运行健壮的 Laravel Octane 应用所需的所有各种服务，请查看 [Laravel Forge](https://forge.laravel.com)。

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
### 监视文件更改

由于 Octane 服务器启动时应用程序被加载到内存中一次，因此对应用程序文件的任何更改都不会在您刷新浏览器时反映出来。例如，添加到 `routes/web.php` 文件的路由定义在服务器重新启动之前不会反映出来。为了方便起见，你可以使用 `--watch` 标志指示 Octane 在应用程序中的任何文件更改时自动重新启动服务器：

```shell
php artisan octane:start --watch
```

在使用此功能之前，您应该确保在本地开发环境中安装了 [Node](https://nodejs.org/)。此外，你还应该在项目中安装 [Chokidar](https://github.com/paulmillr/chokidar) 文件监视库：

```shell
npm install --save-dev chokidar
```

你可以使用应用程序的 `config/octane.php` 配置文件中的 `watch` 配置选项来配置应该被监视的目录和文件。

<a name="specifying-the-worker-count"></a>
### 指定工作进程数

默认情况下，Octane 会为机器提供的每个 CPU 核心启动一个应用程序请求工作进程。这些工作进程将用于在进入应用程序时服务传入的 HTTP 请求。你可以使用 `--workers` 选项手动指定要启动的工作进程数量，当调用 `octane:start` 命令时：

```shell
php artisan octane:start --workers=4
```

如果你使用 Swoole 应用程序服务器，则还可以指定要启动的任务工作进程数量：

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>


### 指定最大请求数量

为了防止内存泄漏，Octane 在处理完 500 个请求后会优雅地重新启动任何 worker。要调整这个数字，你可以使用 `--max-requests` 选项：

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

你可以使用  `octane:stop` Artisan 命令停止 Octane 服务器：

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

由于 Octane 只启动你的应用程序一次，并在服务请求时将其保留在内存中，所以在构建你的应用程序时，你应该考虑一些注意事项。例如，你的应用程序的服务提供者的 `register` 和 `boot` 方法将只在 request worker 最初启动时执行一次。在随后的请求中，将重用相同的应用程序实例。

鉴于这个机制，在将应用服务容器或请求注入任何对象的构造函数时应特别小心。这样一来，该对象在随后的请求中就可能有一个稳定版本的容器或请求。

Octane 会在两次请求之间自动处理重置任何第一方框架的状态。然而，Octane 并不总是知道如何重置由你的应用程序创建的全局状态。因此，你应该知道如何以一种对 Octane 友好的方式来构建你的应用程序。下面，我们将讨论在使用 Octane 时可能引起问题的最常见情况。



<a name="container-injection"></a>
### 容器注入

通常来说，你应该避免将应用服务容器或 HTTP 请求实例注入到其他对象的构造函数中。例如，下面的绑定将整个应用服务容器注入到绑定为单例的对象中：

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

在这个例子中，如果在应用程序引导过程中解析 `Service` 实例，容器将被注入到该服务中，并且该容器将在后续的请求中保留。这对于你的特定应用程序**可能**不是一个问题，但是它可能会导致容器意外地缺少后来在引导过程中添加的绑定或后续请求中添加的绑定。

为了解决这个问题，你可以停止将绑定注册为单例，或者你可以将一个容器解析器闭包注入到服务中，该闭包总是解析当前的容器实例：

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

全局的 `app` 辅助函数和 `Container::getInstance()` 方法将始终返回应用程序容器的最新版本。

<a name="request-injection"></a>
### 请求注入

通常来说，你应该避免将应用服务容器或 HTTP 请求实例注入到其他对象的构造函数中。例如，下面的绑定将整个请求实例注入到绑定为单例的对象中：

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```



在这个例子中，如果在应用程序启动过程中解析 `Service` 实例，则会将 HTTP 请求注入到服务中，并且相同的请求将由 `Service` 实例保持在后续请求中。因此，所有标头、输入和查询字符串数据以及所有其他请求数据都将不正确。

为了解决这个问题，你可以停止将绑定注册为单例，或者你可以将请求解析器闭包注入到服务中，该闭包始终解析当前请求实例。或者，最推荐的方法是在运行时将对象所需的特定请求信息传递给对象的方法之一：

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// Or...

$service->method($request->input('name'));
```

全局的 `request` 帮助函数将始终返回应用程序当前处理的请求，因此可以在应用程序中安全使用它。

> **警告**
> 在控制器方法和路由闭包中类型提示 Illuminate\Http\Request 实例是可以接受的。

<a name="configuration-repository-injection"></a>
### 配置库注入

一般来说，你应该避免将配置库实例注入到其他对象的构造函数中。例如，以下绑定将配置库注入到绑定为单例的对象中：

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```



在这个示例中，如果在请求之间的配置值更改了，那么这个服务将无法访问新的值，因为它依赖于原始存储库实例。

作为解决方法，你可以停止将绑定注册为单例，或者将配置存储库解析器闭包注入到类中：

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

全局 `config` 将始终返回配置存储库的最新版本，因此在应用程序中使用是安全的。

<a name="managing-memory-leaks"></a>
### 管理内存泄漏

请记住，Octane 在请求之间保留应用程序，因此将数据添加到静态维护的数组中将导致内存泄漏。例如，以下控制器具有内存泄漏，因为对应用程序的每个请求将继续向静态的 `$data` 数组添加数据：

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * 处理传入的请求。
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

在构建应用程序时，你应特别注意避免创建此类内存泄漏。建议在本地开发期间监视应用程序的内存使用情况，以确保您不会在应用程序中引入新的内存泄漏。

<a name="concurrent-tasks"></a>
## 并发任务

> **警告**
> 此功能需要 [Swoole](#swoole)。



当使用 Swoole 时，你可以通过轻量级的后台任务并发执行操作。你可以使用 Octane 的 `concurrently` 方法实现此目的。你可以将此方法与 PHP 数组解构结合使用，以检索每个操作的结果：

```php
use App\User;
use App\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

由 Octane 处理的并发任务利用 Swoole 的 「task workers」 并在与传入请求完全不同的进程中执行。可用于处理并发任务的工作程序的数量由 `octane:start` 命令的 `--task-workers` 指令确定：

```shell
php artisan octane:start --workers=4 --task-workers=6
```

在调用 `concurrently` 方法时，你应该不要提供超过 1024 个任务，因为 Swoole 任务系统强制执行此限制。

<a name="ticks-and-intervals"></a>
## 刻度和间隔

> **警告**
> 此功能需要 [Swoole](#swoole).

当使用 Swoole 时，你可以注册定期执行的 「tick」 操作。你可以通过 `tick` 方法注册 「tick」 回调函数。提供给 `tick` 方法的第一个参数应该是一个字符串，表示定时器的名称。第二个参数应该是在指定间隔内调用的可调用对象。

在此示例中，我们将注册一个闭包，每 10 秒调用一次。通常，`tick` 方法应该在你应用程序的任何服务提供程序的 `boot` 方法中调用：

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

使用 `immediate` 方法，你可以指示 Octane 在 Octane 服务器初始启动时立即调用 tick 回调，并在 N 秒后每次调用：

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```



<a name="the-octane-cache"></a>
## Octane 缓存

> **警告**
> 此功能需要 [Swoole](#swoole).

使用 Swoole 时，你可以利用 Octane 缓存驱动程序，该驱动程序提供每秒高达 200 万次的读写速度。因此，这个缓存驱动程序是需要从缓存层中获得极高读写速度的应用程序的绝佳选择。

该缓存驱动程序由 [Swoole tables](https://www.swoole.co.uk/docs/modules/swoole-table) 驱动。缓存中的所有数据可供服务器上的所有工作进程访问。但是，当服务器重新启动时，缓存数据将被清除：

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> **注意**
> Octane 缓存中允许的最大条目数可以在您的应用程序的 octane 配置文件中定义。

<a name="cache-intervals"></a>
### 缓存间隔

除了 Laravel 缓存系统提供的典型方法外，Octane 缓存驱动程序还提供了基于间隔的缓存。这些缓存会在指定的间隔自动刷新，并应在一个应用程序服务提供程序的 `boot` 方法中注册。例如，以下缓存将每五秒刷新一次：

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## 表格

> **警告**
> 此功能需要 [Swoole](#swoole).

使用 Swoole 时，你可以定义和与自己的任意 [Swoole tables](https://www.swoole.co.uk/docs/modules/swoole-table) 进行交互。Swoole tables 提供极高的性能吞吐量，并且可以通过服务器上的所有工作进程访问其中的数据。但是，当它们内部的数据在服务器重新启动时将被丢失。


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

> **注意**
> Swoole table 支持的列类型有： `string` ，`int` 和 `float` 。

