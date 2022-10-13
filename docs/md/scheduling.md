# 任务调度

- [简介](#introduction)
- [定义调度](#defining-schedules)
    - [Artisan 命令调度](#scheduling-artisan-commands)
    - [队列任务调度](#scheduling-queued-jobs)
    - [Shell 命令调度](#scheduling-shell-commands)
    - [调度频率设置](#schedule-frequency-options)
    - [时区](#timezones)
    - [避免任务重复](#preventing-task-overlaps)
    - [单机任务调度](#running-tasks-on-one-server)
    - [后台任务](#background-tasks)
    - [维护模式](#maintenance-mode)
- [运行调度程序](#running-the-scheduler)
    - [本地运行调度程序](#running-the-scheduler-locally)
- [任务输出](#task-output)
- [任务钩子](#task-hooks)
- [事件](#events)

<a name="introduction"></a>
## 简介

过去，你可能需要在服务器上为每一个调度任务去创建 Cron 条目。因为这些任务的调度不是通过代码控制的，你要查看或新增任务调度都需要通过 SSH 远程登录到服务器上去操作，所以这种方式很快会让人变得痛苦不堪。
Laravel 的命令行调度器允许你在 Laravel 中清晰明了地定义命令调度。在使用这个任务调度器时，你只需要在你的服务器上创建单个 Cron 入口。你的任务调度在 app/Console/Kernel.php 的 schedule 方法中进行定义。为了帮助你更好的入门，这个方法中有个简单的例子。

<a name="defining-schedules"></a>
## 定义调度

你可以在 `App\Console\Kernel` 类的 `schedule` 方法中定义所有的调度任务。在开始之前，我们来看一个例子：我们计划每天午夜执行一个 `闭包`，这个 `闭包` 会执行一次数据库语句去清空一张表：

    <?php

    namespace App\Console;

    use Illuminate\Console\Scheduling\Schedule;
    use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
    use Illuminate\Support\Facades\DB;

    class Kernel extends ConsoleKernel
    {
        /**
         * 定义应用中的命令调度
         *
         * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
         * @return void
         */
        protected function schedule(Schedule $schedule)
        {
            $schedule->call(function () {
                DB::table('recent_users')->delete();
            })->daily();
        }
    }



除了调用闭包这种方式来调度外，你还可以调用 [可调用对象](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke). 可调用对象是简单的 PHP 类，包含一个 `__invoke` 方法：

    $schedule->call(new DeleteRecentUsers)->daily();

如果你想查看任务计划的概述及其下次计划运行时间，你可以使用 `schedule:list` Artisan 命令:

```bash
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Artisan 命令调度

调度方式不仅有调用闭包，还有调用 [Artisan commands](/docs/laravel/9.x/artisan) 和操作系统命令。例如，你可以给 `command` 方法传递命令名称或类来调度一个 Artisan 命令：

当使用命令类名调度 Artisan 命令时，你可以通过一个数组传递附加的命令行参数，且这些参数需要在命令触发时提供：

    use App\Console\Commands\SendEmailsCommand;

    $schedule->command('emails:send Taylor --force')->daily();

    $schedule->command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();

<a name="scheduling-queued-jobs"></a>
### 队列任务调度

`job` 方法可以用来调度 [queued job](/docs/laravel/9.x/queues)。此方法提供了一种快捷方式来调度任务，而无需使用 call 方法创建闭包来调度任务：

    use App\Jobs\Heartbeat;

    $schedule->job(new Heartbeat)->everyFiveMinutes();

`job` 方法提供了可选的第二，三参数，分别指定任务将被放置的队列名称及连接：

    use App\Jobs\Heartbeat;

    // 分发任务到「heartbeats」队列及「sqs」连接...
    $schedule->job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();



<a name="scheduling-shell-commands"></a>
### Shell 命令调度

`exec` 方法可发送命令到操作系统：

    $schedule->exec('node /home/forge/script.js')->daily();

<a name="schedule-frequency-options"></a>
### 调度频率选项

我们已经看到了几个如何设置任务在指定时间间隔运行的例子。不仅如此，你还有更多的任务调度频率可选：

方法  | 描述
------------- | -------------
`->cron('* * * * *');`  |  自定义 Cron 计划执行任务
`->everyMinute();`  |  每分钟执行一次任务
`->everyTwoMinutes();`  |  每两分钟执行一次任务
`->everyThreeMinutes();`  |  每三分钟执行一次任务
`->everyFourMinutes();`  |  每四分钟执行一次任务
`->everyFiveMinutes();`  |  每五分钟执行一次任务
`->everyTenMinutes();`  |  每十分钟执行一次任务
`->everyFifteenMinutes();`  |  每十五分钟执行一次任务
`->everyThirtyMinutes();`  |  每三十分钟执行一次任务
`->hourly();`  |  每小时执行一次任务
`->hourlyAt(17);`  |  每小时第十七分钟时执行一次任务
`->everyTwoHours();`  |  每两小时执行一次任务
`->everyThreeHours();`  |  每三小时执行一次任务
`->everyFourHours();`  |  每四小时执行一次任务
`->everySixHours();`  |  每六小时执行一次任务
`->daily();`  |  每天 00:00 执行一次任务
`->dailyAt('13:00');`  |  每天 13:00 执行一次任务
`->twiceDaily(1, 13);`  |  每天 01:00 和 13:00 各执行一次任务
`->weekly();`  |  每周日 00:00 执行一次任务
`->weeklyOn(1, '8:00');`  |  每周一 08:00 执行一次任务
`->monthly();`  |  每月第一天 00:00 执行一次任务
`->monthlyOn(4, '15:00');`  |  每月第四天 15:00 执行一次任务
`->twiceMonthly(1, 16, '13:00');`  |  每月第一天和第 十六天的 13:00 各执行一次任务
`->lastDayOfMonth('15:00');` | 每月最后一天 15:00 执行一次任务
`->quarterly();` |  每季度第一天 00:00 执行一次任务
`->yearly();`  |  每年第一天 00:00 执行一次任务
`->yearlyOn(6, 1, '17:00');`  |  每年六月第一天 17:00 执行一次任务
`->timezone('America/New_York');` | 设置时区



这些方法与额外的约束条件相结合后，可用于创建在一周的特定时间运行甚至更精细的计划任务。例如，在每周一执行命令：
```
    // 在每周一 13:00 执行...
    $schedule->call(function () {
        //
    })->weekly()->mondays()->at('13:00');

    // 在每个工作日 8:00 到 17:00 之间的每小时周期执行...
    $schedule->command('foo')
              ->weekdays()
              ->hourly()
              ->timezone('America/Chicago')
              ->between('8:00', '17:00');
```
下方列出了额外的约束条件：

方法  | 描述
------------- | -------------
`->weekdays();`  |  限制任务在工作日执行
`->weekends();`  |  限制任务在周末执行
`->sundays();`  |  限制任务在周日执行
`->mondays();`  |  限制任务在周一执行
`->tuesdays();`  |  限制任务在周二执行
`->wednesdays();`  |  限制任务在周三执行
`->thursdays();`  |  限制任务在周四执行
`->fridays();`  |  限制任务在周五执行
`->saturdays();`  |  限制任务在周六执行
`->days(array\|mixed);`  |  限制任务在每周的指定日期执行
`->between($startTime, $endTime);`  |  限制任务在 `$startTime` 和 `$endTime` 区间执行
`->unlessBetween($startTime, $endTime);`  |  限制任务不在 `$startTime` 和 `$endTime` 区间执行
`->when(Closure);`  |  限制任务在闭包返回为真时执行
`->environments($env);`  |  限制任务在特定环境中执行

<a name="day-constraints"></a>
#### 周几（Day）限制

`days` 方法可以用于限制任务在每周的指定日期执行。举个例子，您可以在让一个命令每周日和每周三每小时执行一次：
```
    $schedule->command('emails:send')
                    ->hourly()
                    ->days([0, 3]);
```


不仅如此，你还可以使用 `Illuminate\Console\Scheduling\Schedule` 类中的常量来设置任务在指定日期运行：
```
    use Illuminate\Console\Scheduling\Schedule;

    $schedule->command('emails:send')
                    ->hourly()
                    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```
<a name="between-time-constraints"></a>
#### 时间范围限制

`between` 方法可用于限制任务在一天中的某个时间段执行：

    $schedule->command('emails:send')
                        ->hourly()
                        ->between('7:00', '22:00');

同样， `unlessBetween` 方法也可用于限制任务不在一天中的某个时间段执行：
```
    $schedule->command('emails:send')
                        ->hourly()
                        ->unlessBetween('23:00', '4:00');
```
<a name="truth-test-constraints"></a>
#### 闭包检测限制

`when` 方法可根据闭包返回结果来执行任务。换言之，若给定的闭包返回 `true`，若无其他限制条件阻止，任务就会一直执行：
```
    $schedule->command('emails:send')->daily()->when(function () {
        return true;
    });
```
`skip` 可看作是 `when` 的逆方法。若 `skip` 方法返回 `true`，任务将不会执行：
```
    $schedule->command('emails:send')->daily()->skip(function () {
        return true;
    });
```
当链式调用 `when` 方法时，仅当所有 `when` 都返回 `true` 时，任务才会执行。

<a name="environment-constraints"></a>
#### 环境限制

`environments` 方法可限制任务在指定环境中执行（由 `APP_ENV` [环境变量](/docs/laravel/9.x/configuration#environment-configuration) 定义）：
```
    $schedule->command('emails:send')
                ->daily()
                ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### 时区

`timezone` 方法可指定在某一时区的时间执行计划任务：

    $schedule->command('report:generate')
             ->timezone('America/New_York')
             ->at('2:00')

若想给所有计划任务分配相同的时区，那么需要在 `app/Console/Kernel.php` 类中定义 `scheduleTimezone` 方法。该方法会返回一个默认时区，最终分配给所有计划任务：

    /**
     * 获取计划事件默认使用的时区。
     *
     * @return \DateTimeZone|string|null
     */
    protected function scheduleTimezone()
    {
        return 'America/Chicago';
    }

> 注意：请记住，有些时区会使用夏令时。当夏令时发生调整时，你的任务可能会执行两次，甚至根本不会执行。因此，我们建议尽可能避免使用时区来安排计划任务。

<a name="preventing-task-overlaps"></a>
### 避免任务重复

默认情况下，即使之前的任务实例还在执行，调度内的任务也会执行。为避免这种情况的发生，你可以使用 `withoutOverlapping` 方法：

    $schedule->command('emails:send')->withoutOverlapping();

在此例中，若 `emails:send` [Artisan 命令](/docs/laravel/9.x/artisan) 还未运行，那它将会每分钟执行一次。如果你的任务执行时间非常不确定，导致你无法准确预测任务的执行时间，那 `withoutOverlapping` 方法会特别有用。

如有需要，你可以在 `without overlapping` 锁过期之前，指定它的过期分钟数。默认情况下，这个锁会在 24 小时后过期：

    $schedule->command('emails:send')->withoutOverlapping(10);

<a name="running-tasks-on-one-server"></a>
### 任务只运行在一台服务器上

> 注意：要使用此功能, 你的应用程序必须使用 `database`, `memcached`, `dynamodb`, 或 `redis` 缓存驱动程序作为应用程序的默认缓存驱动程序。此外，所有服务器必须和同一个中央缓存服务器通信。

如果你的应用运行在多台服务器上，可能需要限制调度任务只在某台服务器上运行。 例如, 假设你有一个每个星期五晚上生成新报告的调度任务，如果任务调度器运行在三台服务器上，调度任务会在三台服务器上运行并且生成三次报告，不够优雅！

要指示任务应仅在一台服务器上运行, 请在定义计划任务时使用 `onOneServer`方法. 第一台获取到该任务的服务器会给任务上一把原子锁以阻止其他服务器同时运行该任务:

    $schedule->command('report:generate')
                    ->fridays()
                    ->at('17:00')
                    ->onOneServer();

<a name="background-tasks"></a>
### 后台任务

默认情况下, 同时运行多个任务将根据它们在 `schedule` 方法中定义的顺序执行. 如果你有一些长时间运行的任务, 将会导致后续任务比预期时间更晚启动。 如果你想在后台运行任务，以便它们可以同时运行，则可以使用`runInBackground` 方法:

    $schedule->command('analytics:report')
             ->daily()
             ->runInBackground();

> 注意：`runInBackground` 方法只有在通过 `command` 和 `exec` 方法调度任务时才可以使用.



<a name="maintenance-mode"></a>
### 维护模式

当应用处于 [维护模式](/docs/laravel/9.x/configuration#maintenance-mode) 时，Laravel 的队列任务将不会运行。因为我们不想调度任务干扰到服务器上可能还未完成的维护项目。不过，如果你想强制任务在维护模式下运行，你可以使用 `evenInMaintenanceMode` 方法：

    $schedule->command('emails:send')->evenInMaintenanceMode();

<a name="running-the-scheduler"></a>
## 运行调度程序

现在，我们已经学会了如何定义计划任务，接下来让我们讨论如何真正在服务器上运行它们。`schedule:run` Artisan 命令将评估你的所有计划任务，并根据服务器的当前时间决定它们是否运行。

因此，当使用 `Laravel` 的调度程序时，我们只需要向服务器添加一个 cron 配置项，该项每分钟运行一次 `schedule:run` 命令。如果你不知道如何向服务器添加 cron 配置项，请考虑使用 [Laravel Forge](https://forge.laravel.com) 之类的服务来为你管理 cron 配置项：

```shell
* * * * * cd /你的项目路径 && php artisan schedule:run >> /dev/null 2>&1
```

<a name="running-the-scheduler-locally"></a>
## 本地运行调度程序

通常，你不会直接将 cron 配置项添加到本地开发计算机。你反而可以使用 `schedule:work` Artisan 命令。该命令将在前台运行，并每分钟调用一次调度程序，直到你终止该命令为止：

```shell
php artisan schedule:work
```

<a name="task-output"></a>


## 任务输出

Laravel 调度器提供了一些简便方法来处理调度任务生成的输出。首先，你可以使用 `sendOutputTo` 方法将输出发送到文件中以便后续检查：

    $schedule->command('emails:send')
             ->daily()
             ->sendOutputTo($filePath);

如果希望将输出追加到指定文件，可使用 `appendOutputTo` 方法：

    $schedule->command('emails:send')
             ->daily()
             ->appendOutputTo($filePath);

使用 `emailOutputTo` 方法，你可以将输出发送到指定邮箱。在发送邮件之前，你需要先配置 Laravel 的 [邮件服务](/docs/laravel/9.x/mail):

    $schedule->command('report:generate')
             ->daily()
             ->sendOutputTo($filePath)
             ->emailOutputTo('taylor@example.com');

如果你只想在命令执行失败时将输出发送到邮箱，可使用 `emailOutputOnFailure` 方法：

    $schedule->command('report:generate')
             ->daily()
             ->emailOutputOnFailure('taylor@example.com');

> 注意：`emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo` 和 `appendOutputTo` 是 `command` 和 `exec` 独有的方法。

<a name="task-hooks"></a>
## 任务钩子

使用 `before` 和 `after` 方法，你可以决定在调度任务执行前或者执行后来运行代码：

    $schedule->command('emails:send')
             ->daily()
             ->before(function () {
                 // 任务即将执行。。。
             })
             ->after(function () {
                 // 任务已经执行。。。
             });

使用 `onSuccess` 和 `onFailure` 方法，你可以决定在调度任务成功或者失败运行代码。失败表示 Artisan 或系统命令以非零退出码终止：

    $schedule->command('emails:send')
             ->daily()
             ->onSuccess(function () {
                 // 任务执行成功。。。
             })
             ->onFailure(function () {
                 // 任务执行失败。。。
             });



如果你的命令有输出，你可以在闭包中将 `Illuminate\Support\Stringable` 实例化为 `$output` 通过 `after`, `onSuccess` 或 `onFailure` 钩子对其进行访问：

    use Illuminate\Support\Stringable;

    $schedule->command('emails:send')
             ->daily()
             ->onSuccess(function (Stringable $output) {
                 // 任务执行成功。。。
             })
             ->onFailure(function (Stringable $output) {
                 // 任务执行失败。。。
             });

<a name="pinging-urls"></a>
#### Pinging 网址

使用 `pingBefore` 和 `thenPing` 方法，你可以在任务完成之前或完成之后来 ping 指定的 URL。当前方法在通知外部服务，如 [Envoyer](https://envoyer.io)，计划任务在将要执行或已完成时会很有用：

    $schedule->command('emails:send')
             ->daily()
             ->pingBefore($url)
             ->thenPing($url);

只有当条件为 `true` 时，才可以使用 `pingBeforeIf` 和 `thenPingIf` 方法来 ping 指定 URL ：

    $schedule->command('emails:send')
             ->daily()
             ->pingBeforeIf($condition, $url)
             ->thenPingIf($condition, $url);

当任务成功或失败时，可使用 `pingOnSuccess` 和 `pingOnFailure` 方法来 ping 给定 URL。失败表示 Artisan 或系统命令以非零退出码终止：

    $schedule->command('emails:send')
             ->daily()
             ->pingOnSuccess($successUrl)
             ->pingOnFailure($failureUrl);

所有 ping 方法都依赖 Guzzle HTTP 库。通常，Guzzle 已在所有新的 Laravel 项目中默认安装，不过，若意外将 Guzzle 删除，则可以使用 Composer 包管理器将 Guzzle 手动安装到项目中：


```shell
composer require guzzlehttp/guzzle
```

<a name="events"></a>
## 事件

如果需要，您可以监听调度程序调度的 [事件](/docs/laravel/9.x/events)。通常，事件侦听器映射将在您的应用程序的 `App\Providers\EventServiceProvider` 类中定义：

    /**
     * 应用的事件监听器映射
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Console\Events\ScheduledTaskStarting' => [
            'App\Listeners\LogScheduledTaskStarting',
        ],

        'Illuminate\Console\Events\ScheduledTaskFinished' => [
            'App\Listeners\LogScheduledTaskFinished',
        ],

        'Illuminate\Console\Events\ScheduledBackgroundTaskFinished' => [
            'App\Listeners\LogScheduledBackgroundTaskFinished',
        ],

        'Illuminate\Console\Events\ScheduledTaskSkipped' => [
            'App\Listeners\LogScheduledTaskSkipped',
        ],

        'Illuminate\Console\Events\ScheduledTaskFailed' => [
            'App\Listeners\LogScheduledTaskFailed',
        ],
    ];

