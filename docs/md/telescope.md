# Laravel Telescope

- [简介](#introduction)
- [安装](#installation)
    - [仅本地安装](#local-only-installation)
    - [配置](#configuration)
    - [数据修改](#data-pruning)
    - [仪表盘授权](#dashboard-authorization)
- [升级 Telescope](#upgrading-telescope)
- [过滤](#filtering)
    - [单项过滤](#filtering-entries)
    - [批量过滤](#filtering-batches)
- [标记](#tagging)
- [可用的监视器](#available-watchers)
    - [批量监视器](#batch-watcher)
    - [缓存监视器](#cache-watcher)
    - [命令监视器](#command-watcher)
    - [输出监视器](#dump-watcher)
    - [事件监视器](#event-watcher)
    - [异常监视器](#exception-watcher)
    - [Gate 监视器](#gate-watcher)
    - [HTTP Client 监视器](#http-client-watcher)
    - [任务监视器](#job-watcher)
    - [日志监视器](#log-watcher)
    - [邮件监视器](#mail-watcher)
    - [模型监视器](#model-watcher)
    - [消息通知监视器](#notification-watcher)
    - [数据查询监视器](#query-watcher)
    - [Redis 监视器](#redis-watcher)
    - [请求监视器](#request-watcher)
    - [定时任务监视器](#schedule-watcher)
    - [视图监视器](#view-watcher)
- [显示用户头像](#displaying-user-avatars)

<a name="introduction"></a>
## 简介

[Laravel Telescope](https://github.com/laravel/telescope) 是 Laravel 本地开发环境的绝佳伴侣。Telescope 可以洞察你的应用程序的请求、异常、日志条目、数据库查询、排队的作业、邮件、消息通知、缓存操作、定时计划任务、变量打印等。

<img src="https://laravel.com/img/docs/telescope-example.png">

<a name="installation"></a>
## 安装

你可以使用 Composer 将 Telescope 安装到 Laravel 项目中：

```shell
composer require laravel/telescope
```

安装 Telescope 后，你应使用 `telescope:install` 命令来发布其公共资源，然后运行 `migrate` 命令执行数据库变更来创建和保存 Telescope 需要的数据：

```shell
php artisan telescope:install

php artisan migrate
```

<a name="migration-customization"></a>
#### 自定义迁移



如果不打算使用 Telescope 的默认迁移，则应在应用程序的 `App\Providers\AppServiceProvider` 类的 `register` 方法中调用 `Telescope::ignoreMigrations` 方法。你可以使用以下命令导出默认迁移：`php artisan vendor:publish --tag=telescope-migrations`

<a name="local-only-installation"></a>
### 仅本地安装

如果你仅打算使用 Telescope 来帮助你的本地开发，你可以使用 `--dev` 标记安装 Telescope：

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

运行 `telescope:install` 后，应该从应用程序的 `config/app.php` 配置文件中删除 `TelescopeServiceProvider` 服务提供者注册。手动在 `App\Providers\AppServiceProvider` 类的 `register` 方法中注册 telescope 的服务提供者来替代。在注册提供者之前，我们会确保当前环境是 `local`：

    /**
     * 注册应用服务。
     */
    public function register(): void
    {
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

最后，你还应该将以下内容添加到你的 `composer.json` 文件中来防止 Telescope 扩展包被 [自动发现](/docs/laravel/10.x/packages#package-discovery)：

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a name="configuration"></a>
### 配置

发布 Telescope 的资源文件后，其主要配置文件将位于 `config/telescope.php`。此配置文件允许你配置监听 [观察者选项](#available-watchers)，每个配置选项都包含其用途说明，因此请务必彻底浏览此文件。

如果需要，你可以使用 `enabled` 配置选项完全禁用 Telescope 的数据收集：

    'enabled' => env('TELESCOPE_ENABLED', true),



<a name="data-pruning"></a>
### 数据修改

有了数据修改， `telescope_entries` 表可以非常快速地累积记录。 为了缓解这个问题，你应该使用 [调度](/docs/laravel/10.x/scheduling) 每天运行 `telescope:prune` 命令：

    $schedule->command('telescope:prune')->daily();

默认情况下，将获取超过 24 小时的所有数据。在调用命令时可以使用 `hours` 选项来确定保留 `Telescope` 数据的时间。例如，以下命令将删除 48 小时前创建的所有记录：

    $schedule->command('telescope:prune --hours=48')->daily();

<a name="dashboard-authorization"></a>
### 仪表板授权

访问 `/telescope` 即可显示仪表盘。默认情况下，你只能在 `local` 环境中访问此仪表板。 在 `app/Providers/TelescopeServiceProvider.php` 文件中，有一个 [gate 授权](/docs/laravel/10.x/authorization#gates) 。此授权能控制在 **非本地** 环境中对 Telescope 的访问。你可以根据需要随意修改此权限以限制对 Telescope 安装和访问：

    use App\Models\User;

    /**
     * 注册 Telescope gate。
     *
     * 该 gate 确定谁可以在非本地环境中访问 Telescope
     */
    protected function gate(): void
    {
        Gate::define('viewTelescope', function (User $user) {
            return in_array($user->email, [
                'taylor@laravel.com',
            ]);
        });
    }

> 注意：你应该确保在生产环境中将 `APP_ENV` 环境变量更改为 `Production`。 否则，你的 Telescope 调试工具将公开可用。

<a name="upgrading-telescope"></a>
## 更新 Telescope

升级到 Telescope 的新主要版本时，务必仔细阅读 [升级指南](https://github.com/laravel/telescope/blob/master/UPGRADE.).



此外，升级到任何新的 Telescope 版本时，你都应该重建 Telescope 实例：

```shell
php artisan telescope:publish
```

为了使实例保持最新状态并避免将来的更新中出现问题，可以在应用程序的 `composer.json` 文件中的 `post-update-cmd` 脚本添加 `telescope:publish` 命令：

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="filtering"></a>
## 过滤

<a name="filtering-entries"></a>
### 单项过滤

你可以通过在 `App\Providers\TelescopeServiceProvider` 类中定义的 `filter` 闭包来过滤 Telescope 记录的数据。 默认情况下，此回调会记录 `local` 环境中的所有数据以及异常、失败任务、计划任务和带有受监控标记的数据：

    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     * 注册应用服务
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::filter(function (IncomingEntry $entry) {
            if ($this->app->environment('local')) {
                return true;
            }

            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
        });
    }

<a name="filtering-batches"></a>
### 批量过滤

`filter` 闭包过滤单个条目的数据， 你也可以使用 `filterBatch` 方法注册一个闭包，该闭包过滤给定请求或控制台命令的所有数据。如果闭包返回 `true`，则所有数据都由 Telescope 记录：

    use Illuminate\Support\Collection;
    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     *  注册应用服务
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::filterBatch(function (Collection $entries) {
            if ($this->app->environment('local')) {
                return true;
            }

            return $entries->contains(function (IncomingEntry $entry) {
                return $entry->isReportableException() ||
                    $entry->isFailedJob() ||
                    $entry->isScheduledTask() ||
                    $entry->isSlowQuery() ||
                    $entry->hasMonitoredTag();
                });
        });
    }



<a name="tagging"></a>
## 标签

Telescope 允许你通过 「tag」 搜索条目。通常，标签是 Eloquent 模型的类名或经过身份验证的用户 ID， 这些标签会自动添加到条目中。有时，你可能希望将自己的自定义标签附加到条目中。 你可以使用 `Telescope::tag` 方法。 `tag` 方法接受一个闭包，该闭包应返回一个标签数组。返回的标签将与 Telescope 自动附加到条目的所有标签合并。你应该在 `App\Providers\TelescopeServiceProvider` 类中的 `register` 方法调用 `tag` 方法：

    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     * 注册应用服务
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::tag(function (IncomingEntry $entry) {
            return $entry->type === 'request'
                        ? ['status:'.$entry->content['response_status']]
                        : [];
        });
     }

<a name="available-watchers"></a>
## 可用的观察者

Telescope 「观察者」 在执行请求或控制台命令时收集应用数据。你可以在 `config/telescope.php` 配置文件中自定义启用的观察者列表：

    'watchers' => [
        Watchers\CacheWatcher::class => true,
        Watchers\CommandWatcher::class => true,
        ...
    ],

一些监视器还允许你提供额外的自定义选项：

    'watchers' => [
        Watchers\QueryWatcher::class => [
            'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
            'slow' => 100,
        ],
        ...
    ],

<a name="batch-watcher"></a>
### 批量监视器

批量监视器记录队列 [批量任务](/docs/laravel/10.x/queues#job-batching) 的信息，包括任务和连接信息。

<a name="cache-watcher"></a>
### 缓存监视器

当缓存键被命中、未命中、更新和删除时，缓存监视器会记录数据。

<a name="command-watcher"></a>


### 命令监视器

只要执行 Artisan 命令，命令监视器就会记录参数、选项、退出码和输出。如果你想排除监视器记录的某些命令，你可以在 `config/telescope.php` 文件的 `ignore` 选项中指定命令：

    'watchers' => [
        Watchers\CommandWatcher::class => [
            'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
            'ignore' => ['key:generate'],
        ],
        ...
    ],

<a name="dump-watcher"></a>
### 输出监视器

输出监视器在 Telescope 中记录并显示你的变量输出。使用 Laravel 时，可以使用全局 `dump` 函数输出变量。必须在浏览器中打开数据监视器选项卡，才能进行输出变量，否则监视器将忽略此次输出。

<a name="event-watcher"></a>
### 事件监视器

事件监视器记录应用分发的所有 [事件](/docs/laravel/10.x/events) 的有效负载、监听器和广播数据。事件监视器忽略了 Laravel 框架的内部事件。

<a name="exception-watcher"></a>
### 异常监视器

异常监视器记录应用抛出的任何可报告异常的数据和堆栈跟踪。

<a name="gate-watcher"></a>
### Gate（拦截）监视器

Gate 监视器记录你的应用的 [gate 和策略](/docs/laravel/10.x/authorization) 检查的数据和结果。如果你希望将某些属性排除在监视器的记录之外，你可 `config/telescope.php` 文件的 `ignore_abilities` 选项中指定它们：

    'watchers' => [
        Watchers\GateWatcher::class => [
            'enabled' => env('TELESCOPE_GATE_WATCHER', true),
            'ignore_abilities' => ['viewNova'],
        ],
        ...
    ],

<a name="http-client-watcher"></a>
### HTTP 客户端监视器



HTTP 客户端监视器记录你的应用程序发出的传出 [HTTP 客户端请求](/docs/laravel/10.x/http-client)。

<a name="job-watcher"></a>
### 任务监视器

任务监视器记录应用程序分发的任何 [任务](/docs/laravel/10.x/queues) 的数据和状态。

<a name="log-watcher"></a>
### 日志监视器

日志监视器记录应用程序写入的任何日志的 [日志数据](/docs/laravel/10.x/logging)。

默认情况下，Telescope 将只记录 [错误] 级别及以上的日志。但是，你可以修改应用程序的 `config/tescope.php` 配置文件中的 `level` 选项来修改此行为：

    'watchers' => [
        Watchers\LogWatcher::class => [
            'enabled' => env('TELESCOPE_LOG_WATCHER', true),
            'level' => 'debug',
        ],

        // ...
    ],

<a name="mail-watcher"></a>
### 邮件监视器

邮件监视器允许你查看应用发送的 [邮件](/docs/laravel/10.x/mail) 及其相关数据的浏览器内预览。你也可以将该电子邮件下载为 `.eml` 文件。

<a name="model-watcher"></a>
### 模型监视器

每当调度 Eloquent 的 [模型事件](/docs/laravel/10.x/eloquent#events) 时，模型监视器就会记录模型更改。你可以通过监视器的 `events` 选项指定应记录哪些模型事件：

    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
        ],
        ...
    ],

如果你想记录在给定请求期间融合的模型数量，请启用 `hydrations` 选项：

    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
            'hydrations' => true,
        ],
        ...
    ],

<a name="notification-watcher"></a>
### 消息通知监视器

消息通知监听器记录你的应用程序发送的所有 [消息通知](/docs/laravel/10.x/notifications) 。如果通知触发了电子邮件并且你启用了邮件监听器，则电子邮件也可以在邮件监视器屏幕上进行预览。



<a name="query-watcher"></a>
### 数据查询监视器

数据查询监视器记录应用程序执行的所有查询的原始 SQL、绑定和执行时间。监视器还将任何慢于 100 毫秒的查询标记为 `slow`。你可以使用监视器的 `slow` 选项自定义慢查询阈值：

    'watchers' => [
        Watchers\QueryWatcher::class => [
            'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
            'slow' => 50,
        ],
        ...
    ],

<a name="redis-watcher"></a>
### Redis 监视器

Redis 监视器记录你的应用程序执行的所有 [Redis](/docs/laravel/10.x/redis) 命令。如果你使用 Redis 进行缓存，Redis 监视器也会记录缓存命令。

<a name="request-watcher"></a>
### 请求监视器

请求监视器记录与应用程序处理的任何请求相关联的请求、请求头、会话和响应数据。你可以通过 `size_limit`（以 KB 为单位）选项限制记录的响应数据：

    'watchers' => [
        Watchers\RequestWatcher::class => [
            'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
            'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
        ],
        ...
    ],

<a name="schedule-watcher"></a>
### 定时任务监视器

定时任务监视器记录应用程序运行的任何 [计划任务](/docs/laravel/10.x/scheduling) 的命令和输出。

<a name="view-watcher"></a>
### 视图监视器

视图监视器记录渲染视图时使用的 [视图](/docs/laravel/10.x/views) 名称、路径、数据和「composer」组件。

<a name="displaying-user-avatars"></a>
## 显示用户头像

Telescope 仪表盘显示保存给定条目时会有登录用户的用户头像。 默认情况下，Telescope 将使用 Gravatar Web 服务检索头像。 但是，你可以通过在 `App\Providers\TelescopeServiceProvider` 类中注册一个回调来自定义头像 URL。 回调将收到用户的 ID 和电子邮件地址，并应返回用户的头像 URL：

    use App\Models\User;
    use Laravel\Telescope\Telescope;

    /**
     * 注册应用服务
     */
    public function register(): void
    {
        // ...

        Telescope::avatar(function (string $id, string $email) {
            return '/avatars/'.User::find($id)->avatar_path;
        });
    }

