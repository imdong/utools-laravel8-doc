# 目录结构

-   [介绍](#introduction)
-   [根目录](#the-root-directory)
    -   [`app` 目录](#the-root-app-directory)
    -   [`bootstrap` 目录](#the-bootstrap-directory)
    -   [`config` 目录](#the-config-directory)
    -   [`database` 目录](#the-database-directory)
    -   [`public` 目录](#the-public-directory)
    -   [`resources` 目录](#the-resources-directory)
    -   [`routes` 目录](#the-routes-directory)
    -   [`storage` 目录](#the-storage-directory)
    -   [`tests` 目录](#the-tests-directory)
    -   [`vendor` 目录](#the-vendor-directory)
-   [应用程序目录](#the-app-directory)
    -   [`Broadcasting` 目录](#the-broadcasting-directory)
    -   [`Console` 目录](#the-console-directory)
    -   [`Events` 目录](#the-events-directory)
    -   [`Exceptions` 目录](#the-exceptions-directory)
    -   [`Http` 目录](#the-http-directory)
    -   [`Jobs` 目录](#the-jobs-directory)
    -   [`Listeners` 目录](#the-listeners-directory)
    -   [`Mail` 目录](#the-mail-directory)
    -   [`Models` 目录](#the-models-directory)
    -   [`Notifications` 目录](#the-notifications-directory)
    -   [`Policies` 目录](#the-policies-directory)
    -   [`Providers` 目录](#the-providers-directory)
    -   [`Rules` 目录](#the-rules-directory)

<a name="introduction"></a>
## 介绍

默认的 Laravel 应用程序结构旨在为大型和小型应用程序提供一个良好的起点。但是你可以自由地组织你的应用程序。Laravel 几乎不会限制任何给定类的位置——只要 Composer 可以自动加载类即可。

> **注意**
> 初次使用 Laravel？请查看 [Laravel Bootcamp](https://bootcamp.laravel.com) 以获得该框架的实战指南，同时我们将帮助你构建你的第一个 Laravel 应用。

<a name="the-root-directory"></a>
## 根目录

<a name="the-root-app-directory"></a>
#### App 目录

`app` 目录包含应用程序的核心代码。我们很快将详细探讨这个目录；但是，你的应用程序中几乎所有的类都将在此目录中。

<a name="the-bootstrap-directory"></a>
#### Bootstrap 目录

`bootstrap` 目录包含 `app.php` 文件，该文件引导框架。此目录还包含一个 `cache` 目录，其中包含框架生成的文件，用于性能优化，例如路由和服务缓存文件。你通常不需要修改此目录中的任何文件。

<a name="the-config-directory"></a>
#### Config 目录

`config` 目录，顾名思义，包含所有应用程序的配置文件。建议你阅读所有这些文件并熟悉所有可用选项。

<a name="the-database-directory"></a>
#### Database 目录

`database` 目录包含数据库迁移、模型工厂和种子。如果需要，你还可以使用此目录来保存 SQLite 数据库。

<a name="the-public-directory"></a>
#### Public 目录

`public` 目录包含 `index.php` 文件，该文件是所有进入应用程序的请求的入口点并配置自动加载。此目录还包含你的资源文件，例如图片、JavaScript 和 CSS。

<a name="the-resources-directory"></a>
#### Resources 目录

`resources` 目录包含你的 [视图](/docs/laravel/10.x/views)，以及原始的、未编译的资源文件，例如 CSS 或 JavaScript。

<a name="the-routes-directory"></a>
#### Routes 目录

`routes` 目录包含应用程序的所有路由定义。默认情况下，Laravel 包括几个路由文件：`web.php`、`api.php`、`console.php` 和 `channels.php`。

`web.php` 文件包含 `RouteServiceProvider` 将放置在 `web` 中间件组中的路由，该组提供会话状态、CSRF 保护和 cookie 加密。如果你的应用程序不提供无状态的 RESTful API，则所有路由都很可能在 `web.php` 文件中定义。

`api.php` 文件包含 `RouteServiceProvider` 将放置在 `api` 中间件组中的路由。这些路由旨在是无状态的，因此通过这些路由进入应用程序的请求旨在通过令牌进行身份验证，并且不会访问会话状态。

`console.php` 文件是你可以在其中定义基于闭包的控制台命令的位置。每个闭包都绑定到一个命令实例，允许一种简单的方法与每个命令的 IO 方法进行交互。即使此文件不定义 HTTP 路由，它也定义了基于控制台的入口点（路由）进入你的应用程序。

`channels.php` 文件是你可以在其中注册所有应用程序支持的 [事件广播](/docs/laravel/10.x/broadcasting) 频道的位置。

<a name="the-storage-directory"></a>
#### Storage 目录

`storage` 目录包含日志、编译后的 Blade 模板、基于文件的会话、文件缓存和框架生成的其他文件。该目录分为 `app`、`framework` 和 `logs` 目录。`app` 目录可用于存储应用程序生成的任何文件。`framework` 目录用于存储框架生成的文件和缓存。最后，`logs` 目录包含应用程序的日志文件。

`storage/app/public` 目录可用于存储用户生成的文件，例如个人资料头像，应该是公开可访问的。你应该在 `public/storage` 创建一个符号链接，该符号链接指向此目录。你可以使用 `php artisan storage:link` Artisan 命令创建链接。

<a name="the-tests-directory"></a>
#### Tests 目录

`tests` 目录包含你的自动化测试。 开箱即用的示例 [PHPUnit](https://phpunit.de/) 单元测试和功能测试。 每个测试类都应以单词「Test」作为后缀。 你可以使用 `phpunit` 或 `php vendor/bin/phpunit` 命令运行测试。 或者，如果你想要更详细和更漂亮的测试结果表示，你可以使用 `php artisan test` Artisan 命令运行测试

<a name="the-vendor-directory"></a>
#### Vendor 目录

`vendor` 目录包含你的 [Composer](https://getcomposer.org/) 依赖项。

<a name="the-app-directory"></a>
## App 目录

你的大部分应用程序都位于 `app` 目录中。默认情况下，此目录在 `App` 下命名，并由 Composer 使用 [PSR-4 自动加载标准] ([www.php-fig.org/psr/psr-4/](https://www.php-fig.org/psr/psr-4/)) 自动加载。

`app` 目录包含各种附加目录，例如 `Console`、`Http` 和 `Providers`。将 `Console` 和 `Http` 目录视为为应用程序核心提供 API。 HTTP 协议和 CLI 都是与应用程序交互的机制，但实际上并不包含应用程序逻辑。换句话说，它们是向你的应用程序发出命令的两种方式。 `Console` 目录包含你的所有 Artisan 命令，而 `Http` 目录包含你的控制器、中间件和请求。

当你使用 `make` Artisan 命令生成类时，会在 `app` 目录中生成各种其他目录。因此，例如，在你执行 `make:job` Artisan 命令生成作业类之前，`app/Jobs` 目录将不存在。

> **技巧**  
> `app` 目录中的许多类可以由 Artisan 通过命令生成。 要查看可用命令，请在终端中运行 `php artisan list make` 命令。

<a name="the-broadcasting-directory"></a>
#### Broadcasting 目录

`Broadcasting` 目录包含应用程序的所有广播频道类。 这些类是使用 `make:channel` 命令生成的。 此目录默认不存在，但会在你创建第一个频道时为你创建。 要了解有关频道的更多信息，请查看有关 [事件广播](/docs/laravel/10.x/broadcasting) 的文档。

<a name="the-console-directory"></a>
#### Console 目录

`Console` 目录包含应用程序的所有自定义 Artisan 命令。 这些命令可以使用 `make:command` 命令生成。 该目录还包含你的控制台内核，这是你注册自定义 Artisan 命令和定义 [计划任务](/docs/laravel/10.x/scheduling) 的地方。

<a name="the-events-directory"></a>
#### Events 目录

此目录默认不存在，但会由 `event:generate` 和 `make:event` Artisan 命令为你创建。 `Events` 目录包含 [事件类](/docs/laravel/10.x/events)。 事件可用于提醒应用程序的其他部分发生了给定的操作，从而提供了极大的灵活性和解耦性。

<a name="the-exceptions-directory"></a>
#### Exceptions 目录

`Exceptions` 目录包含应用程序的异常处理程序，也是放置应用程序抛出的任何异常的好地方。 如果你想自定义记录或呈现异常的方式，你应该修改此目录中的 `Handler` 类。

<a name="the-http-directory"></a>
#### Http 目录

`Http` 目录包含你的控制器、中间件和表单请求。 几乎所有处理进入应用程序的请求的逻辑都将放在这个目录中。

<a name="the-jobs-directory"></a>
#### Jobs 目录

该目录默认不存在，但如果你执行 `make:job` Artisan 命令，则会为你创建。 `Jobs` 目录包含你的应用程序的 [队列作业](/docs/laravel/10.x/queues)。 作业可能由你的应用程序排队或在当前请求生命周期内同步运行。 在当前请求期间同步运行的作业有时被称为「命令」，因为它们是 [命令模式](https://en.wikipedia.org/wiki/Command_pattern) 的实现。

<a name="the-listeners-directory"></a>
#### Listeners 目录

此目录默认不存在，但如果你执行 `event:generate` 或 `make:listener` Artisan 命令，则会为你创建。 `Listeners` 目录包含处理你的 [events](/docs/laravel/10.x/events) 的类。 事件侦听器接收事件实例并执行逻辑以响应被触发的事件。 例如，`UserRegistered` 事件可能由 `SendWelcomeEmail` 监听器处理。

<a name="the-mail-directory"></a>
#### Mail 目录

该目录默认不存在，但如果你执行 `make:mail` Artisan 命令，则会为你创建。 `Mail` 目录包含你的应用程序发送的所有 [代表电子邮件的类](/docs/laravel/10.x/mail)。 Mail 对象允许你将构建电子邮件的所有逻辑封装在一个简单的类中，该类可以使用 `Mail::send` 方法发送。

<a name="the-models-directory"></a>
#### Models 目录

`Models` 目录包含所有 [Eloquent 模型类](/docs/laravel/10.x/eloquent)。 Laravel 中包含的 Eloquent ORM 提供了一个漂亮、简单的 ActiveRecord 实现来处理你的数据库。 每个数据库表都有一个相应的「模型」，用于与该表进行交互。 模型允许你查询表中的数据，以及将新记录插入表中

<a name="the-notifications-directory"></a>
#### Notifications 目录

默认情况下，此目录不存在，但如果你执行 `make:notification` Artisan 命令时会自动生成。 `Notifications` 目录包含所有你发送给应用程序的「事务性」 [消息通知](/docs/laravel/10.x/notifications) 。例如关于应用程序内发生的事件的简单通知。Laravel 的通知功能抽象了通过各种驱动程序发送的通知，如电子邮件通知、Slack 信息、SMS 短信通知或数据库存储。

<a name="the-policies-directory"></a>
#### Policies 目录

默认情况下，此目录不存在，但如果你执行 `make:policy` Artisan 命令会生成。 `Policies` 目录包含应用程序的 [授权策略类](/docs/laravel/10.x/authorization)。这些类用于确定用户是否可以对资源执行给定的操作。

<a name="the-providers-directory"></a>
#### Providers 目录

`Providers` 目录包含程序中所有的 [服务提供者](/docs/laravel/10.x/providers)。服务提供者通过在服务容器中绑定服务、注册事件或执行任何其他任务来引导应用程序以应对传入请求。

在一个新的 Laravel 应用程序中，这个目录已经包含了几个提供者。你可以根据需要将自己的提供程序添加到此目录。

<a name="the-rules-directory"></a>
#### Rules 目录

默认情况下，此目录不存在，但如果你执行 `make:rule` Artisan 命令后会生成。 `Rules` 目录包含应用程序用户自定义的验证规则。这些验证规则用于将复杂的验证逻辑封装在一个简单的对象中。有关更多信息，请查看 [表单验证](/docs/laravel/10.x/validation)。