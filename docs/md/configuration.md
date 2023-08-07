# 配置信息

- [介绍](#introduction)
- [环境配置](#environment-configuration)
    - [环境变量类型](#environment-variable-types)
    - [检索环境配置](#retrieving-environment-configuration)
    - [确定当前环境](#determining-the-current-environment)
    - [环境文件加密](#encrypting-environment-files)
- [访问配置值](#accessing-configuration-values)
- [缓存配置](#configuration-caching)
- [调试模式](#debug-mode)
- [维护模式](#maintenance-mode)

<a name="introduction"></a>
## 介绍

Laravel 框架的所有配置文件都存储在 config 目录中。每个选项都有文档记录，因此请随意查看文件并熟悉可用的选项。

这些配置文件允许你配置诸如数据库连接信息、邮件服务器信息以及各种其他核心配置值（例如应用程序时区和加密密钥）之类的事项。

<a name="application-overview"></a>
#### 应用概述

为了方便你可以通过 about Artisan 命令快速了解应用程序的配置、驱动程序和环境：

```shell
php artisan about
```

如果只对应用程序概述输出的特定部分感兴趣，则可以使用 --only 选项过滤该部分：

```shell
php artisan about --only=environment
```

<a name="environment-configuration"></a>
## 环境配置

根据应用程序运行的环境设置不同的配置值通常很有方便。例如，可能希望在本地使用不同的缓存驱动程序，而在生产服务器上则使用另一个。

为了让这变得方便，Laravel 使用了 [DotEnv](https://github.com/vlucas/phpdotenv)库 在全新的 Laravel 安装中，应用程序的根目录将包含一个 .env.example 文件，其中定义了许多常见的环境变量。在 Laravel 安装过程中，此文件将自动复制到 .env。

Laravel 的默认 .env 文件包含一些常见的配置值，这些值可能会根据你的应用程序是在本地运行还是在生产 Web 服务器上运行而有所不同。 然后使用 Laravel 的 env 函数从 config 目录中的各种 Laravel 配置文件中检索这些值。

如果你正在与团队一起开发，你可能希望继续在你的应用程序中包含一个 .env.example 文件。 通过将占位符值放入示例配置文件中，你团队中的其他开发人员可以清楚地看到运行你的应用程序需要哪些环境变量。

> **技巧**
> `.env`文件中的任何变量都可以被外部环境变量覆盖，例如服务器级或系统级环境变量。

<a name="environment-file-security"></a>
#### 环境文件安全

你的`.env`文件不应该提交到版本管理器中，首先，使用应用程序的每个开发人员 / 服务器可能需要不同的环境配置。其次，如果入侵者获得了对版本管理器的访问权限，这将成为一个安全风险，他将能看到配置文件中的敏感数据。

但是，可以使用 Laravel 的内置 [加密环境](#encrypting-environment-files)。加密环境文件可以安全地放置在源代码管理中。

<a name="additional-environment-files"></a>
#### 附加环境文件

在加载应用程序的环境变量之前，Laravel 会确定是否已经从外部提供了`APP_ENV`环境变量，或者是否指定了`--env`CLI 参数。如果是这样，Laravel 将尝试加载一个`.env.[APP_ENV]`文件（如果它存在）。 如果它不存在，将加载默认的`.env`文件。

<a name="environment-variable-types"></a>
### 环境变量类型

`.env`文件中的所有变量通常都被解析为字符串，因此创建了一些保留值以允许你从`env()`函数返回更广泛的类型：

| `.env` Value | `env()` Value |
|--------------|---------------|
| true         | (bool) true   |
| (true)       | (bool) true   |
| false        | (bool) false  |
| (false)      | (bool) false  |
| empty        | (string) ''   |
| (empty)      | (string) ''   |
| null         | (null) null   |
| (null)       | (null) null   |

如果你需要使用包含空格的值定义环境变量，可以通过将值括在双引号中来实现：

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### 获取环境配置

当应用程序收到请求时`.env`文件中列出的所有变量将被加载到 PHP 的超级全局变量`$_ENV`中。你可以使用`env`函数检索这些变量的值。实际上，如果你看过 Laravel 的配置文件，就能注意到有数个选项已经使用了这个函数：

    'debug' => env('APP_DEBUG', false),

`env`函数的第二个参数是「默认值」。 当没有找到对应环境变量时将返回 「默认值」。

<a name="determining-the-current-environment"></a>
### 获取当前环境配置

当前应用的环境配置是从你的`.env`文件中的`APP_ENV`变量配置的。你可以通过`App` [facade](/docs/laravel/10.x/facades) 的`environment`函数获取：

    use Illuminate\Support\Facades\App;

    $environment = App::environment();

你还可以将参数传递给`environment` 函数，以确定当前环境是否匹配给定的值。当环境匹配给参数它将返回`true`

    if (App::environment('local')) {
        // 当前环境是 local
    }

    if (App::environment(['local', 'staging'])) {
        // 当前环境是 local 或 staging ...
    }

> **技巧**
> 当前应用程序的环境检测，可以通过定义服务器级`APP_ENV`环境变量来覆盖。

<a name="encrypting-environment-files"></a>
### 环境文件加密

未加密的环境文件不应该被存储在源码控制中. 然而, Laravel允许你加密你的环境文件, 这样他们就可以安全地与你的应用程序的其他部分一起被添加到源码控制中.

<a name="encryption"></a>
#### 加密

为了加密环境文件，你可以使用`env:encrypt`命令。

```shell
php artisan env:encrypt
```

运行`env:encrypt`命令将加密你的`.env`文件，并将加密的内容放在`.env.encrypted`文件中。解密密钥将出现在命令的输出中，并应存储在一个安全的密码管理器中。如果你想提供你自己的加密密钥，你可以在调用该命令时使用`--key`选项:

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> **注意**  
> 所提供的密钥的长度应该与所使用的加密密码所要求的密钥长度相匹配. 默认情况下, Laravel会使用`AES-256-CBC`密码, 需要一个32个字符的密钥. 你可以自由地使用Laravel的 [encrypter](/docs/laravel/10.x/encryption) 所支持的任何密码，只要在调用该命令时传递`--cipher`选项即可。

如果你的应用程序有多个环境文件，如`.env`和`.env.staging`，你可以通过`--env`选项提供环境名称来指定应该被加密的环境文件:

```shell
php artisan env:encrypt --env=staging
```

<a name="decryption"></a>
#### 解密

要解密一个环境文件, 你可以使用`env:decrypt`命令. 这个命令需要一个解密密钥, Laravel会从`LARAVEL_ENV_ENCRYPTION_KEY`环境变量中获取.:

```shell
php artisan env:decrypt
```

或者，密钥也可以通过 --key 选项直接提供给命令：

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

当执行 `env:decrypt` 命令时，Laravel 将解密 	`.env.encrypted` 文件的内容，并将解密后的内容放置在 `.env` 文件中。

可以通过 `--cipher` 选项提供自定义加密算法的名称给 `env:decrypt` 命令：

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

如果你的应用程序有多个环境文件，例如 `.env` 和 	`.env.staging`，可以通过 `--env` 选项提供环境名称来指定应该解密的环境文件：

```shell
php artisan env:decrypt --env=staging
```

为了覆盖现有的环境文件，可以在 `env:decrypt` 命令中提供 `--force` 选项：

```shell
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## 访问配置值

你可以在应用程序的任何地方使用全局 `config` 函数轻松访问你的配置值。可以使用 "点" 语法来访问配置值，其中包括你希望访问的文件和选项的名称。如果配置选项不存在，则可以指定默认值，如果不存在则返回默认值：

    $value = config('app.timezone');

    // 如果配置值不存在，则检索默认值...
    $value = config('app.timezone', 'Asia/Seoul');

要在运行时设置配置值，请将数组传递给 `config` 函数：

    config(['app.timezone' => 'America/Chicago']);

<a name="configuration-caching"></a>
## 配置缓存

为了提高应用程序的速度，你应该使用 `config:cache` Artisan 命令将所有配置文件缓存到一个文件中。 这会将应用程序的所有配置选项组合到一个文件中，框架可以快速加载该文件。

你通常应该在生产部署过程中运行`php artisan config:cache` 命令。 该命令不应在本地开发期间运行，因为在应用程序开发过程中经常需要更改配置选项。

一旦配置被缓存，应用程序的。`.env`文件将不会在请求或 Artisan 命令期间被框架加载；因此， `env`函数将只返回外部的系统级环境变量。

因此，应确保仅从应用程序的配置`config`文件中调用`env`函数。通过检查 Laravel 的默认配置文件，你可以看到许多示例。可以使用`config`函数从应用程序中的任何位置访问配置值 [如上所述](#accessing-configuration-values)。

> **注意**
> 如果你在部署过程中执行`config:cache`命令，则应确保仅从配置文件中调用`env`函数。一旦配置被缓存，`.env`文件将不会被加载；因此，`env`函数只会返回外部的系统级环境变量。

<a name="debug-mode"></a>
## 调试模式

`config/app.php`配置文件中的`debug`选项决定了实际向用户显示的错误信息量。 默认情况下，此选项设置为尊重`APP_DEBUG`环境变量的值，该变量存储在你的`.env`文件中。

对于本地开发，你应该将`APP_DEBUG`环境变量设置为`true`。 **I在你的生产环境中，此值应始终为`false`。 如果在生产环境中将该变量设置为`true` ，你可能会将敏感的配置值暴露给应用程序的最终用户。**

<a name="maintenance-mode"></a>
## 维护模式

当你的应用程序处于维护模式时，将为你的应用程序的所有请求显示一个自定义视图。 这使得在更新或执行维护时可以轻松「禁用」你的应用程序。 维护模式检查包含在应用程序的默认中间件堆栈中。 如果应用程序处于维护模式，则会抛出一个`Symfony\Component\HttpKernel\Exception\HttpException`实例，状态码为 503。

要启用维护模式，请执行`down` Artisan 命令：

```shell
php artisan down
```

如果你希望`Refresh` HTTP 标头与所有维护模式响应一起发送，你可以在调用`down`命令时提供`refresh`选项。`Refresh` 标头将指示浏览器在指定秒数后自动刷新页面：

```shell
php artisan down --refresh=15
```

你还可以为`down`命令提供`retry` 选项，该选项将设置为`Retry-After` HTTP 标头的值，尽管浏览器通常会忽略此标头：

```shell
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### 绕过维护模式

即使在维护模式下，你也可以使用`secret`选项来指定维护模式绕过令牌：

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

将应用程序置于维护模式后，你可以访问与该令牌匹配的应用程序 URL，Laravel 将为你的浏览器颁发一个维护模式绕过 cookie：
```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```
当访问此隐藏路由时，你将被重定向到应用程序的`/`路径。一旦 cookie 被颁发到你的浏览器，你就可以像维护模式不存在一样正常浏览应用程序。

> **技巧**
> 你的维护模式 secret 通常应由字母数字字符和可选的破折号组成。应避免使用 URL 中具有特殊含义的字符，例如 `?`。

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 预渲染维护模式视图

如果在部署期间中使用 `php artisan down` 命令，当你的 Composer 依赖或其基础组件更新的时候，你的用户也可能遇到偶然性的错误。这是因为 Laravel 框架的重要部分必须启动才能确定应用程序处于维护模式，并使用模板引擎呈现维护模式视图。

因此，Laravel 允许你预渲染一个维护模式视图，该视图将在请求周期的最开始返回。此视图在加载应用程序的任何依赖项之前呈现。可以使用 `down` 命令的 `render` 选项预渲染所选模板：

```shell
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### 重定向维护模式请求

在维护模式下，Laravel 将显示用户试图访问的所有应用程序 url 的维护模式视图。如果你愿意，你可以指示 Laravel 重定向所有请求到一个特定的 URL。这可以使用 `redirect` 选项来实现。例如，你可能希望将所有请求重定向到 `/` URI：

```shell
php artisan down --redirect=/
```

<a name="disabling-maintenance-mode"></a>
#### 禁用维护模式

要禁用维护模式，请使用 `up` 命令：

```shell
php artisan up
```

> **技巧**
> 你可以通过在 `resources/views/errors/503.blade.php` 中定义自己的维护模式模板。

<a name="maintenance-mode-queues"></a>
#### 维护模式 & 队列

当应用程序处于维护模式时，将不会处理任何 [队列任务](/docs/laravel/10.x/queues)。一旦应用程序退出维护模式，像往常一样继续处理。

<a name="alternatives-to-maintenance-mode"></a>
#### 维护模式的替代方法

由于维护模式要求你的应用程序有几秒钟的停机时间，因此你可以考虑使用 [Laravel Vapor](https://vapor.laravel.com) 和 [Envoyer](https://envoyer.io) 等替代方案来实现 Laravel 零停机部署。

