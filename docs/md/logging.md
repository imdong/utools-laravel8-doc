# 日志（Logging）

- [介绍](#introduction)
- [配置](#configuration)
    - [可用通道驱动](#available-channel-drivers)
    - [通道先决条件](#channel-prerequisites)
    - [记录弃用警告](#logging-deprecation-warnings)
- [构建日志堆栈](#building-log-stacks)
- [写日志消息](#writing-log-messages)
    - [上下文信息](#contextual-information)
    - [写入到指定通道](#writing-to-specific-channels)
- [Monolog 通道自定义](#monolog-channel-customization)
    - [为通道自定义 Monolog](#customizing-monolog-for-channels)
    - [创建 Monolog 处理器通道](#creating-monolog-handler-channels)
    - [通过工厂创建通道](#creating-custom-channels-via-factories)

<a name="introduction"></a>
## 介绍

为了帮助你了解程序中正在发生什么，Laravel 提供了健壮的日志服务，允许你记录日志信息到文件，到系统错误日志，甚至到 Slack 通知你的整个团队。

Laravel 日志基于「 通道 」。每个通道代表一个具体的记录日志消息的方式。举例来说，`single` 通道会把日志记录到一个单独的文件里， `slack` 通道会发送日志信息到 Slack。基于它们的重要程度，日志可能会被写入到多个通道中去。

Laravel 使用了 [Monolog](https://github.com/Seldaek/monolog) 库，它为各种强大的日志处理提供支持。Laravel 使配置这些处理器变得小菜一碟，它允许以混合和匹配的方式，自定义你的程序日志处理。

<a name="configuration"></a>
## 配置

所有的应用程序日志系统配置都位于 `config/logging.php` 配置文件中。这个文件允许你配置程序的日志通道，因此务必查看每个可用通道和它们的选项。我们将在下面回顾一些常用的选项。

Laravel 默认使用 `stack` 通道记录日志消息。 `stack` 通道被用于将多个日志通道集成到一个单独的通道中去。获得更多构建堆栈信息，请查看 [以下文档](#building-log-stacks) 。

<a name="configuring-the-channel-name"></a>
#### 配置通道名

默认情况下，Monolog 用与当前环境匹配的 `channel name` 实例化，例如 `production` 或 `local`。要更改此值，请在通道配置中添加 `name` 选项：

    'stack' => [
        'driver' => 'stack',
        'name' => 'channel-name',
        'channels' => ['single', 'slack'],
    ],

<a name="available-channel-drivers"></a>
### 可用的通道驱动

每个日志通道都由一个驱动程序驱动。驱动程序确定日志消息的实际记录方式和位置。以下日志通道驱动程序在每个 Laravel 应用程序中都可用。大多数驱动程序的条目已经存在于应用程序的 `config/logging.php` 配置文件中，因此请务必查看此文件以熟悉其内容：

名称 | 说明
------------- | -------------
`custom` | 调用指定工厂来创建通道的驱动程序
`daily` | 一个基于 `RotatingFileHandler` 的每日循环的 Monolog 驱动程序
`errorlog` | 基于 `ErrorLogHandler` 的 Monolog 驱动程序
`monolog` | 可以使用任何支持的 Monolog 处理程序的 Monolog 工厂驱动程序
`null` | 丢弃所有日志消息的驱动程序
`papertrail` | 基于 `SyslogUdpHandler` 的 Monolog 驱动程序
`single` | 单个基于文件或路径的记录器通道 (`StreamHandler`)
`slack` | 基于 `SlackWebhookHandler` 的 Monolog 驱动程序
`stack` | 该通道有助于创建 「多通道」 的包装器
`syslog` | 基于 `SyslogHandler` 的 Monolog 驱动程序

> 技巧：查看 [高级通道定制](#monolog-channel-customization) 文档，了解有关 `monolog` 和 `custom` 驱动程序的更多信息。

<a name="channel-prerequisites"></a>
### 通道先决条件

<a name="configuring-the-single-and-daily-channels"></a>
#### 配置单通道和每日通道

`single` 和 `daily` 通道有三个可选配置选项： `bubble` 、`permission` 和 `locking`。

名称 | 说明 | 默认值
------------- | ------------- | -------------
`bubble` | 指示消息在处理后是否应跳转到其他通道 | `true`
`locking` | 尝试在写入日志文件之前锁定它 | `false`
`permission` | 日志文件的权限 | `0644`

<a name="configuring-the-papertrail-channel"></a>
#### 配置 Papertrail 通道

`papertrail` 通道需要 `host` 和 `port` 配置选项。你可以从 [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app) 获得这些值。

<a name="configuring-the-slack-channel"></a>
#### 配置 Slack 通道

`slack` 通道需要 `url` 配置选项。URL 应该与你为 Slack 团队配置 [incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) 的 URL 匹配。

默认情况下，Slack 将仅接收 `critical` 级别及更高级别的日志；但是，你可以在 `config/logging.php` 配置文件中通过修改 Slack 日志通道的配置数组中的 `level` 配置选项来进行调整。

<a name="logging-deprecation-warnings"></a>
### 记录弃用警告

PHP、Laravel 和其他库经常通知他们的用户，他们的一些功能已被弃用，并将在未来的版本中删除。如果你想记录这些弃用警告，你可以在应用程序的 `config/logging.php` 配置文件中指定 `deprecations` 的日志通道：

    'deprecations' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

    'channels' => [
        ...
    ]

或者，你可以定义一个名为 `deprecations` 的日志通道。 如果存在具有此名称的日志通道，它将被用于记录弃用警告：

    'channels' => [
        'deprecations' => [
            'driver' => 'single',
            'path' => storage_path('logs/php-deprecation-warnings.log'),
        ],
    ],

<a name="building-log-stacks"></a>
## 构建日志堆栈

如前所述，`stack` 为方便起见，该驱动程序允许你将多个通道合并为一个日志通道。为了说明如何使用日志堆栈，让我们看一下你可能在生产应用程序中看到的示例配置：

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['syslog', 'slack'],
        ],

        'syslog' => [
            'driver' => 'syslog',
            'level' => 'debug',
        ],

        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'Laravel Log',
            'emoji' => ':boom:',
            'level' => 'critical',
        ],
    ],

让我们剖析此配置。首先，请注意我们的 `stack` 渠道聚集通过它的两个其他渠道 `channels` 选项：`syslog` 和 `slack`。因此，在记录消息时，这两个渠道都将有机会记录消息。但是，正如我们将在下面看到的，这些通道是否实际记录了消息可能取决于消息的重要性 /「级别」。

<a name="log-levels"></a>
#### 日志级别

请注意上面示例中的 `syslog` 和 `slack` 通道配置上的 `level` 配置选项。此选项确定消息必须由通道记录的最低「级别」。Monolog，为 Laravel 的日志服务提供了所有在 [RFC 5424 specification](https://tools.ietf.org/html/rfc5424): 中定义的日志级别: **emergency**、 **alert**、 **critical**、 **error**、 **warning**、 **notice**、 **info** 和 **debug**。

因此，假设我们使用 `debug` 方法记录了一条消息：

    Log::debug('An informational message.');

根据我们的配置，`syslog` 通道会将消息写入系统日志。但是，由于错误消息不是 `critical` 或更高级别，因此不会将其发送到 Slack。但是，如果我们记录一个 `emergency` 消息，它将被发送到系统日志和 Slack，因为 `emergency` 级别高于两个通道的最低级别阈值：

    Log::emergency('The system is down!');

<a name="writing-log-messages"></a>
## 编写日志消息

你可以使用 `Log` [facade](/docs/laravel/9.x/facades) 将信息写入日志。如前所述，记录器提供 [RFC 5424 规范](https://tools.ietf.org/html/rfc5424) 中定义的八个记录级别： **emergency**、 **alert**、 **critical**、 **error**、 **warning**、 **notice**、 **info** 和 **debug**：

    use Illuminate\Support\Facades\Log;

    Log::emergency($message);
    Log::alert($message);
    Log::critical($message);
    Log::error($message);
    Log::warning($message);
    Log::notice($message);
    Log::info($message);
    Log::debug($message);

你可以调用任何这些方法来记录相应级别的消息。默认情况下，消息将写入你的 `logging` 配置文件配置的默认日志通道：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Support\Facades\Log;

    class UserController extends Controller
    {
        /**
         * 显示给定用户的个人资料。
         *
         * @param  int  $id
         * @return \Illuminate\Http\Response
         */
        public function show($id)
        {
            Log::info('Showing the user profile for user: '.$id);

            return view('user.profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }

<a name="contextual-information"></a>
### 上下文信息

可以将一组上下文数据传递给日志方法。此上下文数据将被格式化并与日志消息一起显示：

    use Illuminate\Support\Facades\Log;

    Log::info('User failed to login.', ['id' => $user->id]);

有时，你可能希望指定一些应包含在所有后续日志条目中的上下文信息。例如，你可能希望记录与应用程序的每个传入请求相关联的请求 ID。为此，你可以调用 `Log` 门面的 `withContext` 方法：

    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Str;

    class AssignRequestId
    {
        /**
         * 处理传入的请求。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Closure  $next
         * @return mixed
         */
        public function handle($request, Closure $next)
        {
            $requestId = (string) Str::uuid();

            Log::withContext([
                'request-id' => $requestId
            ]);

            return $next($request)->header('Request-Id', $requestId);
        }
    }

<a name="writing-to-specific-channels"></a>
### 写入特定通道

有时你可能希望将消息记录到应用程序默认通道以外的通道。你可以使用 `Log` 门面的 `channel` 方法来检索并记录到配置文件中定义的任何通道：

    use Illuminate\Support\Facades\Log;

    Log::channel('slack')->info('Something happened!');

如果你想创建一个由多个通道组成的按需日志堆栈，你可以使用 `stack` 方法：

    Log::stack(['single', 'slack'])->info('Something happened!');

<a name="on-demand-channels"></a>
#### 按需通道

也可以通过在运行时提供配置来创建按需通道，而该配置不存在于应用程序的「日志记录」配置文件中。 为此，你可以将配置数组传递给 `Log` 门面的 `build` 方法：

    use Illuminate\Support\Facades\Log;

    Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ])->info('Something happened!');

你可能还希望在按需日志记录堆栈中包含一个按需通道。这可以通过将你的按需通道实例包含在传递给 `stack` 方法的数组中来实现：

    use Illuminate\Support\Facades\Log;

    $channel = Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ]);

    Log::stack(['slack', $channel])->info('Something happened!');

<a name="monolog-channel-customization"></a>
## Monolog 通道自定义

<a name="customizing-monolog-for-channels"></a>
### 为通道自定义 Monolog

有时你可能需要完全控制如何为现有通道配置 Monolog。例如，你可能想要为 Laravel 的内置 `single` 通道配置自定义 Monolog `FormatterInterface` 实现。

首先，在通道的配置上定义一个 `tap` 数组。 `tap` 数组应该包含一个类列表，这些类应该有机会在创建 Monolog 实例后进行自定义（或「tap」）。没有应该放置这些类的常规位置，因此你可以在应用程序中自由创建一个目录来包含这些类：

    'single' => [
        'driver' => 'single',
        'tap' => [App\Logging\CustomizeFormatter::class],
        'path' => storage_path('logs/laravel.log'),
        'level' => 'debug',
    ],

一旦你在你的通道上配置了 `tap` 选项，你就可以定义自定义你的 Monolog 实例的类了。 这个类只需要一个方法：`__invoke`，它接收一个`Illuminate\Log\Logger`实例。 `Illuminate\Log\Logger` 实例代理所有对底层 Monolog 实例的方法调用：

    <?php

    namespace App\Logging;

    use Monolog\Formatter\LineFormatter;

    class CustomizeFormatter
    {
        /**
         * Customize the given logger instance.
         *
         * @param  \Illuminate\Log\Logger  $logger
         * @return void
         */
        public function __invoke($logger)
        {
            foreach ($logger->getHandlers() as $handler) {
                $handler->setFormatter(new LineFormatter(
                    '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
                ));
            }
        }
    }

> 技巧：你的所有「tap」类都由 [服务容器](/docs/laravel/9.x/container) 解析，因此它们所需的任何构造函数依赖项都将自动注入。

<a name="creating-monolog-handler-channels"></a>
### 创建 Monolog 处理器通道

Monolog 有多种 [可用的处理程序](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)，并且 Laravel 没有为每个处理程序包含一个内置通道。 在某些情况下，你可能希望创建一个自定义通道，它只是一个特定的 Monolog 处理程序的实例，它没有相应的 Laravel 日志驱动程序。 这些通道可以使用 `monolog` 驱动轻松创建。

使用 `monolog` 驱动程序时，`handler` 配置选项用于指定将实例化哪个处理程序。或者，可以使用 `with` 配置选项指定处理程序所需的任何构造函数参数：

    'logentries' => [
        'driver'  => 'monolog',
        'handler' => Monolog\Handler\SyslogUdpHandler::class,
        'with' => [
            'host' => 'my.logentries.internal.datahubhost.company.com',
            'port' => '10000',
        ],
    ],

<a name="monolog-formatters"></a>
#### Monolog 格式化程序

使用 `monolog` 驱动程序时，Monolog `LineFormatter` 将用作默认格式化程序。但是，你可以使用 `formatter` 和 `formatter_with` 配置选项自定义传递给处理程序的格式化程序类型：

    'browser' => [
        'driver' => 'monolog',
        'handler' => Monolog\Handler\BrowserConsoleHandler::class,
        'formatter' => Monolog\Formatter\HtmlFormatter::class,
        'formatter_with' => [
            'dateFormat' => 'Y-m-d',
        ],
    ],

如果你使用的是能够提供自己的格式化程序的 Monolog 处理程序，你可以将 `formatter` 配置选项的值设置为 `default`：

    'newrelic' => [
        'driver' => 'monolog',
        'handler' => Monolog\Handler\NewRelicHandler::class,
        'formatter' => 'default',
    ],

<a name="creating-custom-channels-via-factories"></a>
### 通过工厂创建通道

如果你想定义一个完全自定义的通道，你可以在其中完全控制 Monolog 的实例化和配置，你可以在 `config/logging.php` 配置文件中指定`custom` 驱动程序类型。你的配置应该包括一个 `via` 选项，其中包含将被调用以创建 Monolog 实例的工厂类的名称：

    'channels' => [
        'example-custom-channel' => [
            'driver' => 'custom',
            'via' => App\Logging\CreateCustomLogger::class,
        ],
    ],

一旦你配置了「custom」驱动程序通道，你就可以定义将创建你的 Monolog 实例的类。这个类只需要一个 __invoke 方法，它应该返回 Monolog 记录器实例。 该方法将接收通道配置数组作为其唯一参数：

    <?php

    namespace App\Logging;

    use Monolog\Logger;

    class CreateCustomLogger
    {
        /**
         * 创建一个自定义 Monolog 实例。
         *
         * @param  array  $config
         * @return \Monolog\Logger
         */
        public function __invoke(array $config)
        {
            return new Logger(...);
        }
    }
