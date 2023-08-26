# Logging

- [介绍](#introduction)
- [配置](#configuration)
    - [可用通道驱动](#available-channel-driver)
    - [通道先决条件](#available-channel-driver)
    - [记录弃用警告](#logging-deprecation-warnings)
- [构建日志堆栈](#building-log-stacks)
- [写日志消息](#writing-log-messages)
    - [上下文信息](#contextual-information)
    - [写入到指定通道](#writing-to-specific-channels)
- [Monolog 通道自定义](#monolog-channel-customization)
    - [为通道自定义 Monolog](#customizing-monolog-for-channels)
    - [创建 Monolog 处理器通道](#creating-monolog-handler-channels)
    - [创建 Monolog 处理器通道](#creating-custom-channels-via-factories)

<a name="introduction"></a>
## 介绍

为了帮助您更多地了解应用程序中发生的事情，Laravel 提供了强大的日志记录服务，允许您将日志记录到文件、系统错误日志，甚至记录到 Slack 以通知您的整个团队。

Laravel 日志基于「 通道 」。 每个通道代表一种写入日志信息的特定方式。 例如，`single` 通道是将日志写入到单个日志文件中。而 `slack` 通道是将日志发送到 Slack 上。 基于它们的重要程度，日志可以被写入到多个通道中去。

在底层，Laravel 利用 [Monolog](https://github.com/Seldaek/monolog) 库，它为各种强大的日志处理程序提供了支持。 Laravel 使配置这些处理程序变得轻而易举，允许您混合和匹配它们，以自定义应用程序的方式完成日志处理。
<a name="configuration"></a>
## 配置

所有应用程序的日志行为配置选项都位于 `config/logging.php` 配置文件中。 该文件允许您配置应用程序的日志通道，因此请务必查看每个可用通道及其选项。 我们将在下面回顾一些常见的选项。



默认情况下，Laravel 在记录日志消息时使用 `stack` 频道。`stack` 频道用于将多个日志频道聚合到一个频道中。有关构建堆栈的更多信息，请查看下面的[文档](https://chat.openai.com/chat#building-log-stacks)。

<a name="configuring-the-channel-name"></a>
#### 配置频道名称

默认情况下，Monolog 使用与当前环境相匹配的“频道名称”（例如 `production` 或 `local`）进行实例化。要更改此值，请向频道的配置中添加一个 `name` 选项：

    'stack' => [
        'driver' => 'stack',
        'name' => 'channel-name',
        'channels' => ['single', 'slack'],
    ],

<a name="available-channel-drivers"></a>
### 可用频道驱动程序

每个日志频道都由一个“驱动程序”驱动。驱动程序确定实际记录日志消息的方式和位置。以下日志频道驱动程序在每个 Laravel 应用程序中都可用。大多数这些驱动程序的条目已经在应用程序的 `config/logging.php` 配置文件中存在，因此请务必查看此文件以熟悉其内容：

<div class="overflow-auto">

| 名称 | 描述 |
| --- | --- |
| `custom` | 调用指定工厂创建频道的驱动程序 |
| `daily` | 基于 `RotatingFileHandler` 的 Monolog 驱动程序，每天轮换一次日志文件 |
| `errorlog` | 基于 `ErrorLogHandler` 的 Monolog 驱动程序 |
| `monolog` | 可使用任何支持的 Monolog 处理程序的 Monolog 工厂驱动程序 |
| `null` | 丢弃所有日志消息的驱动程序 |
| `papertrail` | 基于 `SyslogUdpHandler` 的 Monolog 驱动程序 |
| `single` | 单个文件或路径为基础的记录器频道（`StreamHandler`） |
| `slack` | 基于 `SlackWebhookHandler` 的 Monolog 驱动程序 |
| `stack` | 包装器，用于方便地创建“多通道”频道 |
| `syslog` | 基于 `SyslogHandler` 的 Monolog 驱动程序 |

</div>

> **注意**
> 查看 [高级频道自定义](/chat#monolog-channel-customization) 文档，了解有关 `monolog` 和 `custom` 驱动程序的更多信息。


### 频道前提条件

#### 配置单一和日志频道

在处理消息时，`single`和 `daily` 频道有三个可选配置选项：`bubble`，`permission` 和`locking`。

<div class="overflow-auto">

| 名称 | 描述 | 默认值 |
| --- | --- | --- |
| `bubble` | 表示是否在处理后将消息传递到其他频道 | `true` |
| `locking` | 在写入日志文件之前尝试锁定日志文件 | `false` |
| `permission` | 日志文件的权限 | `0644` |</div>

另外，可以通过 `days` 选项配置 `daily` 频道的保留策略：

<div class="overflow-auto">

| 名称 | 描述 | 默认值 |
| --- | --- | --- |
| `days` | 保留每日日志文件的天数 | `7` |</div>

#### 配置 Papertrail 频道

`papertrail` 频道需要 `host` 和 `port` 配置选项。您可以从[Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)获取这些值。

#### 配置Slack频道

`slack` 频道需要一个 `url` 配置选项。此URL应该与您为Slack团队配置的[incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)的URL匹配。

默认情况下，Slack仅会接收 `critical` 级别及以上的日志；但是，您可以通过修改 `config/logging.php` 配置文件中您的Slack日志频道配置数组中的 `level` 配置选项来调整此设置。

### 记录弃用警告

PHP、Laravel和其他库通常会通知其用户，一些功能已被弃用，将在未来版本中删除。如果您想记录这些弃用警告，可以在应用程序的 `config/logging.php` 配置文件中指定您首选的 `deprecations` 日志频道：

    'deprecations' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

    'channels' => [
        ...
    ]



或者，您可以定义一个名为 `deprecations` 的日志通道。如果存在此名称的日志通道，则始终将其用于记录弃用：

    'channels' => [
        'deprecations' => [
            'driver' => 'single',
            'path' => storage_path('logs/php-deprecation-warnings.log'),
        ],
    ],

<a name="building-log-stacks"></a>
## 构建日志堆栈

如前所述，`stack` 驱动程序允许您将多个通道组合成一个方便的日志通道。为了说明如何使用日志堆栈，让我们看一个您可能在生产应用程序中看到的示例配置：

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

让我们分解一下这个配置。首先，请注意我们的 `stack` 通道通过其 `channels` 选项聚合了两个其他通道：`syslog` 和 `slack`。因此，在记录消息时，这两个通道都有机会记录消息。但是，正如我们将在下面看到的那样，这些通道是否实际记录消息可能取决于消息的严重程度/"级别"。

<a name="log-levels"></a>
#### 日志级别

请注意上面示例中 `syslog` 和 `slack` 通道配置中存在的 `level` 配置选项。此选项确定必须记录消息的最小“级别”。Laravel的日志服务采用Monolog，提供[RFC 5424规范](https://tools.ietf.org/html/rfc5424)中定义的所有日志级别。按严重程度递减的顺序，这些日志级别是：**emergency**，**alert**，**critical**，**error**，**warning**，**notice**，**info**和**debug**。



在我们的配置中，如果我们使用 `debug` 方法记录消息：

    Log::debug('An informational message.');

根据我们的配置，`syslog` 渠道将把消息写入系统日志；但由于错误消息不是 `critical` 或以上级别，它不会被发送到 Slack。然而，如果我们记录一个 `emergency` 级别的消息，则会发送到系统日志和 Slack，因为 `emergency` 级别高于我们两个渠道的最小级别阈值：

    Log::emergency('The system is down!');

<a name="writing-log-messages"></a>
## 写入日志消息

您可以使用 `Log`  [facade](/docs/laravel/10.x/facades) 向日志写入信息。正如之前提到的，日志记录器提供了 [RFC 5424 规范](https://tools.ietf.org/html/rfc5424) 中定义的八个日志级别：**emergency**、**alert**、**critical**、**error**、**warning**、**notice**、**info** 和 **debug**：

    use Illuminate\Support\Facades\Log;

    Log::emergency($message);
    Log::alert($message);
    Log::critical($message);
    Log::error($message);
    Log::warning($message);
    Log::notice($message);
    Log::info($message);
    Log::debug($message);

您可以调用其中任何一个方法来记录相应级别的消息。默认情况下，该消息将根据您的 `logging` 配置文件配置的默认日志渠道进行写入：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Support\Facades\Log;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         */
        public function show(string $id): View
        {
            Log::info('Showing the user profile for user: '.$id);

            return view('user.profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }



<a name="contextual-information"></a>
### 上下文信息

可以向日志方法传递一组上下文数据。这些上下文数据将与日志消息一起格式化和显示：

    use Illuminate\Support\Facades\Log;

    Log::info('User failed to login.', ['id' => $user->id]);

偶尔，您可能希望指定一些上下文信息，这些信息应包含在特定频道中所有随后的日志条目中。例如，您可能希望记录与应用程序的每个传入请求相关联的请求ID。为了实现这一目的，您可以调用 `Log` 门面的 `withContext` 方法：

    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Str;
    use Symfony\Component\HttpFoundation\Response;

    class AssignRequestId
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            $requestId = (string) Str::uuid();

            Log::withContext([
                'request-id' => $requestId
            ]);

            return $next($request)->header('Request-Id', $requestId);
        }
    }

如果要在_所有_日志频道之间共享上下文信息，则可以调用 `Log::shareContext()` 方法。此方法将向所有已创建的频道提供上下文信息，以及随后创建的任何频道。通常，`shareContext` 方法应从应用程序服务提供程序的 `boot` 方法中调用：

    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Str;

    class AppServiceProvider
    {
        /**
         * 启动任何应用程序服务。
         */
        public function boot(): void
        {
            Log::shareContext([
                'invocation-id' => (string) Str::uuid(),
            ]);
        }
    }

<a name="writing-to-specific-channels"></a>
### 写入特定频道

有时，您可能希望将消息记录到应用程序默认频道以外的频道。您可以使用 `Log` 门面上的 `channel` 方法来检索并记录配置文件中定义的任何频道：

    use Illuminate\Support\Facades\Log;

    Log::channel('slack')->info('Something happened!');



如果你想创建一个由多个通道组成的按需记录堆栈，可以使用 `stack` 方法：

    Log::stack(['single', 'slack'])->info('Something happened!');

<a name="on-demand-channels"></a>
#### 按需通道

还可以创建一个按需通道，方法是在运行时提供配置而无需将该配置包含在应用程序的 `logging` 配置文件中。为此，可以将配置数组传递给 `Log` 门面的 `build` 方法：

    use Illuminate\Support\Facades\Log;

    Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ])->info('Something happened!');

您可能还希望在按需记录堆栈中包含一个按需通道。可以通过将按需通道实例包含在传递给 `stack` 方法的数组中来实现：

    use Illuminate\Support\Facades\Log;

    $channel = Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ]);

    Log::stack(['slack', $channel])->info('Something happened!');

<a name="monolog-channel-customization"></a>
## Monolog 通道定制

<a name="customizing-monolog-for-channels"></a>
### 为通道定制 Monolog

有时，您可能需要完全控制 Monolog 如何配置现有通道。例如，您可能希望为 Laravel 内置的 `single` 通道配置自定义的 Monolog `FormatterInterface` 实现。

要开始，请在通道配置中定义 `tap` 数组。`tap` 数组应包含一系列类，这些类在创建 Monolog 实例后应有机会自定义（或“tap”）它。没有这些类应放置在何处的惯例位置，因此您可以在应用程序中创建一个目录以包含这些类：

    'single' => [
        'driver' => 'single',
        'tap' => [App\Logging\CustomizeFormatter::class],
        'path' => storage_path('logs/laravel.log'),
        'level' => 'debug',
    ],



一旦你在通道上配置了 `tap` 选项，你就可以定义一个类来自定义你的 Monolog 实例。这个类只需要一个方法：`__invoke`，它接收一个 `Illuminate\Log\Logger` 实例。`Illuminate\Log\Logger` 实例代理所有方法调用到底层的 Monolog 实例：


    <?php

    namespace App\Logging;

    use Illuminate\Log\Logger;
    use Monolog\Formatter\LineFormatter;

    class CustomizeFormatter
    {
        /**
         * 自定义给定的日志记录器实例。
         */
        public function __invoke(Logger $logger): void
        {
            foreach ($logger->getHandlers() as $handler) {
                $handler->setFormatter(new LineFormatter(
                    '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
                ));
            }
        }
    }

> **注意**
> 所有的 “tap” 类都由 [服务容器](/docs/laravel/10.x/container) 解析，因此它们所需的任何构造函数依赖关系都将自动注入。

<a name="creating-monolog-handler-channels"></a>

### 创建 Monolog 处理程序通道

Monolog 有多种 [可用的处理程序](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler)，而 Laravel 并没有为每个处理程序内置通道。在某些情况下，你可能希望创建一个自定义通道，它仅是一个特定的 Monolog 处理程序实例，该处理程序没有相应的 Laravel 日志驱动程序。这些通道可以使用 `monolog` 驱动程序轻松创建。

使用 `monolog` 驱动程序时，`handler` 配置选项用于指定将实例化哪个处理程序。可选地，可以使用 `with` 配置选项指定处理程序需要的任何构造函数参数：

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


 <a name="monolog-processors"></a>
#### Monolog 处理器

Monolog 也可以在记录消息之前对其进行处理。你可以创建你自己的处理器或使用 [Monolog提供的现有处理器](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor)。

 如果你想为 `monolog` 驱动定制处理器，请在通道的配置中加入`processors` 配置值。

     'memory' => [
         'driver' => 'monolog',
         'handler' => Monolog\Handler\StreamHandler::class,
         'with' => [
             'stream' => 'php://stderr',
         ],
         'processors' => [
             // Simple syntax...
             Monolog\Processor\MemoryUsageProcessor::class,

             // With options...
             [
                'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
                'with' => ['removeUsedContextFields' => true],
            ],
         ],
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

一旦你配置了 `custom` 驱动程序通道，你就可以定义将创建你的 Monolog 实例的类。这个类只需要一个 __invoke 方法，它应该返回 Monolog 记录器实例。 该方法将接收通道配置数组作为其唯一参数：

    <?php

    namespace App\Logging;

    use Monolog\Logger;

    class CreateCustomLogger
    {
        /**
         * 创建一个自定义 Monolog 实例。
         */
        public function __invoke(array $config): Logger
        {
            return new Logger(/* ... */);
        }
    }

