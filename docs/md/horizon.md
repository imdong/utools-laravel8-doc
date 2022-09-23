# Laravel Horizon

- [介绍](#introduction)
- [安装](#installation)
    - [配置](#configuration)
    - [均衡策略](#balancing-strategies)
    - [控制面板授权](#dashboard-authorization)
- [升级 Horizon](#upgrading-horizon)
- [运行 Horizon](#running-horizon)
    - [部署 Horizon](#deploying-horizon)
- [标记](#tags)
- [通知](#notifications)
- [指标](#metrics)
- [删除失败的作业](#deleting-failed-jobs)
- [从队列中清除作业](#clearing-jobs-from-queues)

<a name="introduction"></a>
## 介绍

> 提示：在深入了解 Laravel Horizon 之前，您应该熟悉 Laravel 的基础 [队列服务](/docs/laravel/9.x/queues)。 Horizon 为 Laravel 的队列增加了额外的功能，如果你还不熟悉 Laravel 提供的基本队列功能，这些功能可能会让人感到困惑。

[Laravel Horizon](https://github.com/laravel/horizon) 为你的 Laravel [Redis queues](/docs/laravel/9.x/queues).提供了一个美观的仪表盘和代码驱动的配置；它可以方便的监控队列系统的关键指标：任务吞吐量、运行时间、作业失败情况。

所有的 worker 配置存储在一个简单的配置文件中，你可以在整个团队都可以进行协作的地方进行源码控制。

在使用 Horizon 时，所有队列的 worker 配置都存储在一个简单的配置文件中。通过在受版本控制的文件中定义应用程序的 worker 配置，你可以在部署应用程序时轻松扩展或修改应用程序的队列 worker。

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## 安装

> 注意：Laravel Horizon 要求你使用 [Redis](https://redis.io) 来为你的队列服务。因此，你应该确保在应用程序的 `config/queue.php` 配置文件中将队列连接设置为 `redis`。

你可以使用 Composer 将 Horizon 安装到你的 Laravel 项目里：

```shell
composer require laravel/horizon
```

Horizon 安装之后，使用 `horizon:install` Artisan 命令发布资源：

```shell
php artisan horizon:install
```



<a name="configuration"></a>
### 配置

Horizon 资源发布之后，其主要配置文件会被分配到 `config/horizon.php` 文件。可以用这个配置文件配置工作选项，每个配置选项包含一个用途描述，请务必仔细研究这个文件。

>注意：Horizon 在内部使用名为 `horizon` 的 Redis 连接。此 Redis 连接名称是保留的，不应分配给 `database.php` 配置文件中的另一个 Redis 连接或作为 `horizon.php` 配置文件中的 `use` 选项的值。

<a name="environments"></a>
#### 环境配置

安装后，你需要熟悉的重点 Horizon 配置选项是 `environments` 配置选项。此配置选项定义了你的应用程序运行的一系列环境，并为每个环境定义了工作进程选项。默认情况下，此条目包含　`生产 (production)`　和 `本地 (local)`环境。简而言之，你可以根据自己的需要自由添加更多环境：

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'maxProcesses' => 3,
            ],
        ],
    ],

当你启动 Horizon 时，它将使用指定应用程序运行环境所配置的 worker 进程选项。通常，环境配置由 `APP_ENV` [环境变量](/docs/laravel/9.x/configuration#determining-the-current-environment) 的值确定。例如，默认的 `local` Horizon 环境配置为启动三个工作进程，并自动平衡分配给每个队列的工作进程数量。默认的「生产」环境配置为最多启动 10 个 worker 进程，并自动平衡分配给每个队列的 worker 进程数量。

> 注意：您应该确保您的 `horizon` 配置文件的 `environments` 部分包含您计划在其上运行 Horizon 的每个 [环境](/docs/laravel/9.x/configuration#environment-configuration) 的配置。


<a name="supervisors"></a>
#### Supervisors

正如你在 Horizon 的默认配置文件中看到的那样。每个环境可以包含一个或多个 Supervisor 配置。默认情况下，配置文件将这个Supervisor 定义为 `supervisor-1`；但是，你可以随意命名你的 Supervisor。每个 Supervisor 负责监督一组 worker，并负责平衡队列之间的 worker。

如果你想定义一组在指定环境中运行的新 worker，可以向相应的环境添加额外的 Supervisor。如果你想为应用程序使用的特定队列定义不同的平衡策略或 worker 数量，也可以选择这样做。

<a name="default-values"></a>
#### 默认值

在 Horizon 的默认配置文件中，你会注意到一个 `defaults` 配置选项。这个配置选项指定应用程序的 [supervisors](#supervisors) 的默认值。Supervisor 的默认配置值将合并到每个环境的 Supervisor  配置中，让你在定义 Supervisor 时避免不必要的重复工作。

<a name="balancing-strategies"></a>
### 均衡策略

与 Laravel 的默认队列系统不同，Horizon 允许你从三个平衡策略中进行选择：`simple`， `auto`， 和 `false`。`simple` 策略是配置文件的默认选项，它会在进程之间平均分配进入的任务：

    'balance' => 'simple',

`auto` 策略根据队列的当前工作负载来调整每个队列的工作进程数量。举个例子，如果你的 `notifications` 队列有 1000 个等待的任务，而你的 `render` 队列是空的，那么 Horizon 将为 `notifications` 队列分配更多的工作线程，直到队列为空。


当 `balance` 选项被设置为 `false` 时，将使用默认的 Laravel 行为，它按照配置中列出的顺序处理队列。

当使用 `auto` 策略时，你可以定义 `minProcesses` 和 `maxProcesses` 的配置选项来控制 Horizon  扩展进程的最小和最大数量：

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'auto',
                'minProcesses' => 1,
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'tries' => 3,
            ],
        ],
    ],

`balanceMaxShift` 和 `balanceCooldown` 配置项可以确定 Horizon 将以多快的速度扩展进程，在上面的示例中，每 3 秒钟最多创建或销毁一个新进程，你可以根据应用程序的需要随意调整这些值。

当 `balance` 选项设置为 `false` 时，将使用默认的 Laravel 行为，它按照队列在配置中列出的顺序处理队列。

<a name="dashboard-authorization"></a>
### 控制面板授权

Horizon 在 `/horizon` 上显示了一个控制面板。默认情况下，你只能在 `local` 环境中访问这个面板。在你的 `app/Providers/HorizonServiceProvider.php` 文件中，有一个 [授权拦截器（Gates）](/docs/laravel/9.x/authorization#gates) 的方法定义，该拦截器用于控制在**非本地**环境中对 Horizon 的访问。末可以根据需要修改此方法，来限制对 Horizon 的访问：

    /**
     * 注册 Horizon 授权
     *
     * 此方法决定了谁可以在非本地环境中访问 Horizon
     *
     * @return void
     */
    protected function gate()
    {
        Gate::define('viewHorizon', function ($user) {
            return in_array($user->email, [
                'taylor@laravel.com',
            ]);
        });
    }

<a name="alternative-authentication-strategies"></a>
#### 可替代的身份验证策略

需要留意的是，Laravel 会自动将经过 *authenticated*  的用户注入到拦截器（Gate）闭包中。如果你的应用程序通过其他方法（例如 IP 限制）提供 Horizon 安全性保障，那么你访问 Horizon 用户可能不需要实现这个「登录」动作。因此，你需要将上面的 `function ($user)` 更改为 `function ($user = null)` 以强制 Laravel 跳过身份验证。


<a name="upgrading-horizon"></a>
## 升级 Horizon

当你升级到 Horizon 的一个新的主要版本时，你需要仔细阅读 [升级指南](https://github.com/laravel/horizon/blob/master/UPGRADE.md)。

此外，升级到新的 Horizon 版本时，你应该重新发布 Horizon 资源：

```shell
php artisan horizon:publish
```
为了使资源文件保持最新并避免以后的更新中出现问题，你可以将以下  `horizon:publish`  命令添加到 `composer.json` 文件中的 `post-update-cmd` 脚本中：

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan horizon:publish --ansi"
        ]
    }
}
```

<a name="running-horizon"></a>
## 运行 Horizon

在 `config/horizon.php` 中配置了你的 workers 之后，你可以使用 `horizon` Artisan 命令启动 Horizon。只需这一个命令你就可以启动你的所有已配置的 workers：

```shell
php artisan horizon
```

你可以暂停 Horizon 进程，并使用 `horizon:pause` 和 `horizon:continue` Artisan 命令指示它继续处理任务：

```shell
php artisan horizon:pause

php artisan horizon:continue
```

你还可以使用 `horizon:pause-supervisor` 和 `horizon:continue-supervisor` Artisan 命令暂停和继续指定的 Horizon [supervisors](#supervisors)：

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

你可以使用 `horizon:status` Artisan 命令检查 Horizon 进程的当前状态：

```shell
php artisan horizon:status
```

你可以使用 `horizon:terminate` Artisan 命令优雅地终止机器上的主 Horizon 进程。Horizon 会等当前正在处理的所有任务都完成后退出：

```shell
php artisan horizon:terminate
```



<a name="deploying-horizon"></a>
### 部署 Horizon

如果要将 Horizon 部署到一个正在运行的服务器上，应该配置一个进程监视器来监视 `php artisan horizon` 命令，并在它意外退出时重新启动它。

在将新代码部署到服务器时，你需要终止 Horizon 主进程，以便进程监视器重新启动它并接收代码的更改。

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### 安装 Supervisor

Supervisor 是一个用于 Linux 操作系统的进程监视器。如果 `Horizon` 进程被退出或终止，Supervisor 将自动重启你的 `Horizon` 进程。如果要在 Ubuntu 上安装 Supervisor，你可以使用以下命令。如果你不使用 Ubuntu，也可以使用操作系统的包管理器安装 Supervisor：

```shell
sudo apt-get install supervisor
```

> 技巧：如果你觉得自己配置 Supervisor 难如登天，可以考虑使用 [Laravel Forge](https://forge.laravel.com)，它将自动为你的 Laravel 项目安装和配置 Supervisor。

<a name="supervisor-configuration"></a>
#### Supervisor 配置

Supervisor 配置文件通常存储在 `/etc/supervisor/conf.d` 目录下。在此目录中，你可以创建任意数量的配置文件，这些配置文件会告诉 supervisor 如何监视你的进程。例如，让我们创建一个 `horizon.conf` 文件，它启动并监视一个 `horizon` 进程：

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

> 注意：要确保 `stopwaitsecs` 的值大于运行时间最长的任务所消耗的秒数。否则，Supervisor 可能会在工作完成前终止任务。


<a name="starting-supervisor"></a>
#### 启动 Supervisor

创建了配置文件后，可以使用以下命令更新 Supervisor 配置并启动进程：

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> 技巧：关于 Supervisor 的更多信息，可以查阅 [Supervisor 文档](http://supervisord.org/index.html)。

<a name="tags"></a>
## 标记

Horizon 允许你将 `tags` 分配给任务，包括邮件、事件广播、通知和排队的事件监听器。实际上，Horizon 会根据附加到作业上的有 Eloquent 模型，智能地、自动地标记大多数任务。例如，看看下面的任务：

    <?php

    namespace App\Jobs;

    use App\Models\Video;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class RenderVideo implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * video 实例
         *
         * @var \App\Models\Video
         */
        public $video;

        /**
         * 创建一个新的任务实例
         *
         * @param  \App\Models\Video  $video
         * @return void
         */
        public function __construct(Video $video)
        {
            $this->video = $video;
        }

        /**
         * 执行任务
         *
         * @return void
         */
        public function handle()
        {
            //
        }
    }


如果此任务与 `App\Models\Video` 实例一起排队，且该实例的 `id` 为 `1`，则该作业将自动接收 `App\Models\Video:1` 标记。这是因为 Horizon 将为任何有 Eloquent 的模型检查任务的属性。如果找到了有 Eloquent 的模型，Horizon 将智能地使用模型的类名和主键标记任务：

    use App\Jobs\RenderVideo;
    use App\Models\Video;

    $video = Video::find(1);

    RenderVideo::dispatch($video);



<a name="manually-tagging-jobs"></a>
#### 手动标记作业

如果你想手动定义你的一个队列对象的标签，你可以在类上定义一个 `tags` 方法：

    class RenderVideo implements ShouldQueue
    {
        /**
         * 获取应该分配给任务的标记
         *
         * @return array
         */
        public function tags()
        {
            return ['render', 'video:'.$this->video->id];
        }
    }

<a name="notifications"></a>
## 通知

> **注意：** 当配置 Horizon 发送 Slack 或 SMS 通知时，你应该查看 [相关通知驱动程序的先决条件](/docs/laravel/9.x/notifications)。

如果你希望在一个队列有较长的等待时间时得到通知，你可以使用 `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, 和 `Horizon::routeSmsNotificationsTo` 方法。你可以从你的应用程序的 `HorizonServiceProvider` 调用这些方法：

    /**
     * 服务引导
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        Horizon::routeSmsNotificationsTo('15556667777');
        Horizon::routeMailNotificationsTo('example@example.com');
        Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    }

<a name="configuring-notification-wait-time-thresholds"></a>
#### 配置通知等待时间阈值

你可以在 `config/horizon.php` 的配置文件中配置多少秒算是「长等待」。你可以用该文件中的 `waits` 配置选项控制每个 连接 / 队列 组合的长等待阈值：

    'waits' => [
        'redis:default' => 60,
        'redis:critical,high' => 90,
    ],

<a name="metrics"></a>
## 指标

Horizon 有一个指标控制面板，它提供了任务和队列的等待时间和吞吐量等信息。要让这些信息显示在这个控制面板上，你应该配置 Horizon 的 `snapshot` Artisan 命令，通过你的应用程序的 [调度器](/docs/laravel/9.x/scheduling) 每五分钟运行一次：

    /**
     * 定义应用程序的命令调度
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('horizon:snapshot')->everyFiveMinutes();
    }



<a name="deleting-failed-jobs"></a>
## 删除失败的作业

如果你想删除失败的作业，可以使用 `horizon:forget` 命令。 `horizon:forget` 命令接受失败作业的 ID 或 UUID 作为其唯一参数：

```shell
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## 从队列中清除作业

如果你想从应用程序的默认队列中删除所有作业，你可以使用 `horizon:clear` Artisan 命令执行此操作：

```shell
php artisan horizon:clear
```

你可以设置 `queue` 选项来从特定队列中删除作业：

```shell
php artisan horizon:clear --queue=emails
```

