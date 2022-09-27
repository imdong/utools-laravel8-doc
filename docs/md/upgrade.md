#  升级指南

- [从 8.x 升级到 9.0](#upgrade-9.0)

<a name="high-impact-changes"></a>
## 高影响变化

<div class="content-list" markdown="1">

- [更新依赖](#updating-dependencies)
- [Flysystem 3.x](#flysystem-3)
- [Symfony Mailer](#symfony-mailer)

</div>

<a name="medium-impact-changes"></a>
## 中影响变化

<div class="content-list" markdown="1">

- [Belongs To Many `firstOrNew`, `firstOrCreate`, and `updateOrCreate` 方法](#belongs-to-many-first-or-new)
- [Custom Casts & `null`](#custom-casts-and-null)
- [Default HTTP Client Timeout](#http-client-default-timeout)
- [PHP Return Types](#php-return-types)
- [Postgres "Schema" Configuration](#postgres-schema-configuration)
- [The `assertDeleted` Method](#the-assert-deleted-method)
- [The `lang` Directory](#the-lang-directory)
- [The `password` Rule](#the-password-rule)
- [The `when` / `unless` Methods](#when-and-unless-methods)
- [Unvalidated Array Keys](#unvalidated-array-keys)

</div>

<a name="upgrade-9.0"></a>
## 从 8.x 升级到 9.0

<a name="estimated-upgrade-time-10-minutes"></a>
#### 预计升级时间: 30 分钟

> 技巧：我们应该试图记录每个可能的重大改变. 由于一些破坏性的变更位于框架的模糊部分，因此这些更改只有一部分可能会实际影响你的应用程序. 想要节省时间? 你可以看 [Laravel Shift](https://laravelshift.com/) 来帮助你的应用自动化升级。

<a name="updating-dependencies"></a>
### 更新依赖

**影响的可能性: 高**

#### 要求 PHP 8.0.2

Laravel 现在 需要 PHP 8.0.2 or 更高。

#### Composer 依赖

你应该在你应用程序的 `composer.json` 文件中更新依赖包的版本

- `laravel/framework` 至 `^9.0`
- `nunomaduro/collision` 至 `^6.1`

另外，请在 `composer.json` 文件中用 `"spatie/laravel-ignition": "^1.0"` 替换掉 `facade/ignition`

以下官方包的新版本已经支持 Laravel 9.x 。如有需要，你应该在升级前阅读它们各自的升级指南：

- [Vonage Notification Channel (v3.0)](https://github.com/laravel/vonage-notification-channel/blob/3.x/UPGRADE.md) (Replaces Nexmo)

最后，检查应用程序使用的任何其他第三方包，并验证是否使用了正确的支持 Laravel 9 的版本。

<a name="php-return-types"></a>
#### PHP 返回类型

PHP 开始过渡到要求在 PHP 方法（如 `offsetGet`、`offsetSet` 等）上定义返回类型。有鉴于此，Laravel 9 在其代码库中实现了这些返回类型。通常，这应该不会影响用户编写的代码；但是，如果您通过扩展 Laravel 的核心类来重写这些方法之一，则需要将这些返回类型添加到您自己的应用程序或包代码中：

<div class="content-list" markdown="1">

- `count(): int`
- `getIterator(): Traversable`
- `getSize(): int`
- `jsonSerialize(): array`
- `offsetExists($key): bool`
- `offsetGet($key): mixed`
- `offsetSet($key, $value): void`
- `offsetUnset($key): void`

</div>

此外，返回类型被添加到实现 PHP 的 `SessionHandlerInterface` 接口的方法中。同样，这个更改不太可能影响您自己的应用程序或包代码：

<div class="content-list" markdown="1">

- `open($savePath, $sessionName): bool`
- `close(): bool`
- `read($sessionId): string|false`
- `write($sessionId, $data): bool`
- `destroy($sessionId): bool`
- `gc($lifetime): int`

</div>

<a name="application"></a>
### Application

<a name="the-application-contract"></a>
#### `Application` 契约

**影响程度：低**

`Illuminate\Contracts\Foundation\Application` 接口的 `storagePath` 方法已更新为接受 `$path` 参数。如果要实现此接口，则应相应地更新实现代码：

    public function storagePath($path = '');
    
同样，`Illuminate\Foundation\Application` 类的 `langPath` 方法已更新为接受 `$path` 参数：

    public function langPath($path = '');



#### 异常处理程序`ignore`方法

**影响的可能性：低**

异常处理程序的 `ignore` 方法现在是 `public` 而不是 `protected`。此方法不包含在默认应用程序框架中；但是，如果您手动定义了此方法，则应将其可见性更新为“public”：

```php
public function ignore(string $class);
```

### Blade

#### 惰性集合和 `$loop` 变量

**影响的可能性：低**

当在 Blade 模板中迭代 `LazyCollection` 实例时，`$loop` 变量不再可用，因为访问该变量会导致整个 `LazyCollection` 被加载到内存中，因此在这种情况下使用惰性集合是毫无意义的。

### 集合

#### `Enumerable` 契约

**影响的可能性：低**

`Illuminate\Support\Enumerable` 合约现在定义了 `sole` 方法。如果您手动实现此接口，则应更新您的实现以显示此新方法：

```php
public function sole($key = null, $operator = null, $value = null);
```

#### `reduceWithKeys` 方法

`reduceWithKeys` 方法已被删除，因为 `reduce` 方法提供了相同的功能。你可以简单地更新你的代码来调用 `reduce` 而不是 `reduceWithKeys`。

#### `reduceMany` 方法

`reduceMany` 方法已重命名为 `reduceSpread`，以便与其他类似方法的命名保持一致。

### 容器

#### `Container` 契约

**影响的可能性：非常低**

`Illuminate\Contracts\Container\Container` 契约有两个方法定义：`scoped` 和 `scopedIf`。如果您手动实施此契约，您应该更新您的实施以显示这些新方法。

#### `ContextualBindingBuilder` 契约

**影响的可能性：非常低**

`Illuminate\Contracts\Container\ContextualBindingBuilder` 契约现在定义了 `giveConfig` 方法。如果您手动实现此接口，则应更新您的实现以显示此新方法：

```php
public function giveConfig($key, $default = null);
```

### 数据库

<a name="postgres-schema-configuration"></a>
#### Postgres "Schema" 配置选项

**影响程度：中**

在 `config/database.php` 配置文件中用配置 Postgres 连接搜索路径的 `schema` 配置选项应重命名为 `search_path`。

<a name="schema-builder-doctrine-method"></a>
#### Schema Builder `registerCustomDoctrineType` 方法

**影响程度：低**

`registerCustomDoctrineType` 方法已从 `Illuminate\Database\Schema\Builder` 类中删除。您可以在 `DB` 上使用 `registerDoctrineType` 方法，或者在 `config/database.php` 配置文件中注册自定义的 Doctrine 类型。

### Eloquent

<a name="custom-casts-and-null"></a>
#### 自定义强制转换和 `null`

**影响程度：中**

在 Laravel 的先前版本中，如果将强制转换属性设置为 `null`，则不会调用自定义强制转换类的 `set` 方法。但是，此行为与 Laravel 文档不一致。在 Laravel 9.x 中，将调用 cast 类的 `set` 方法，并使用 `null` 作为提供的 `$value` 参数。因此，应确保自定义强制转换能够充分处理这个场景：

```php
/**
 * Prepare the given value for storage.
 *
 * @param  \Illuminate\Database\Eloquent\Model  $model
 * @param  string  $key
 * @param  AddressModel  $value
 * @param  array  $attributes
 * @return array
 */
public function set($model, $key, $value, $attributes)
{
    if (! $value instanceof AddressModel) {
        throw new InvalidArgumentException('The given value is not an Address instance.');
    }

    return [
        'address_line_one' => $value->lineOne,
        'address_line_two' => $value->lineTwo,
    ];
}
```

<a name="belongs-to-many-first-or-new"></a>
#### Belongs To Many 的 `firstOrNew`、`firstOrCreate` 和 `updateOrCreate` 方法

**影响程度：中**

`belongsToMany` 关系的 `firstOrNew`、`firstOrCreate` 和 `updateOrCreate` 方法都接受一个属性数组作为其第一个参数。在 Laravel 的先前版本中，这个属性数组相当于现有记录的 `pivot` 中间表。



但是，这种行为是意料之外的，通常是不受欢迎的。相反，这些方法现在将属性数组与相关模型的表进行比较：

```php
$user->roles()->updateOrCreate([
    'name' => 'Administrator',
]);
```

此外，该 `firstOrCreate` 方法现在接受一个 `$values` 数组作为其第二个参数。 当创建相关模型时，如果该模型不存在，则该数组将与该方法的第一个参数 (`$attributes`) 合并。此更改使此方法与其他关系类型提供的 `firstOrCreate` 方法一致：

```php
$user->roles()->firstOrCreate([
    'name' => 'Administrator',
], [
    'created_by' => $user->id,
]);
```

#### `touch` 方法

**影响的可能性：低**

该 `touch` 方法现在接受要触摸的属性。如果你之前覆盖了这个方法，你应该更新你的方法签名来反映这个新参数：

```php
public function touch($attribute = null);
```

### Encryption

#### Encrypter 契约

**影响的可能性：低**

该 `Illuminate\Contracts\Encryption\Encrypter` 合约现在定义了一个方法 `getKey`。如果您手动实现此接口，则应相应地更新您的实现：

```php
public function getKey();
```

### Facades

#### `getFacadeAccessor` 方法

**影响的可能性：低**

该 `getFacadeAccessor` 方法必须始终返回容器绑定键。在之前的 Laravel 版本中，这个方法可以返回一个对象实例；但是，不再支持此行为。如果您已经编写了自己的外观，则应确保此方法返回容器绑定字符串：

```php
/**
 * Get the registered name of the component.
 *
 * @return string
 */
protected static function getFacadeAccessor()
{
    return Example::class;
}
```

### Filesystem

#### `FILESYSTEM_DRIVER` 环境变量

**影响的可能性：低**


`FILESYSTEM_DRIVER` 环境变量已重命名为 `FILESYSTEM_DISK` 以更准确地反映其用法。此更改仅影响应用程序框架； 但是，如果您愿意，欢迎您更新自己的应用程序的环境变量以反映此更改。

#### "Cloud" 磁盘

**影响的可能性：低**

`cloud` 磁盘配置选项已于 2020 年 11 月从默认应用程序骨架中删除。此更改仅影响应用程序骨架。如果您在应用程序中使用“云”磁盘，则应将此配置值保留在您自己的应用程序的框架中。

<a name="flysystem-3"></a>
### Flysystem 3.x

**影响的可能性：高**

Laravel 9.x 已从 [Flysystem](https://flysystem.thephpleague.com/v2/docs/) 1.x 迁移到 3.x。 在底层，Flysystem 支持 `Storage` 门面提供的所有文件操作方法。 鉴于此，您的应用程序中可能需要进行一些更改； 但是，我们已尝试使这种过渡尽可能无缝。

#### 驱动器前置条件

在使用 S3、FTP 或 SFTP 驱动程序之前，您需要通过 Composer 包管理器安装相应的包：

- Amazon S3: `composer require -W league/flysystem-aws-s3-v3 "^3.0"`
- FTP: `composer require league/flysystem-ftp "^3.0"`
- SFTP: `composer require league/flysystem-sftp-v3 "^3.0"`

#### 覆盖现有文件

`put`、`write`、`writeStream` 等写操作现在默认覆盖现有文件。 如果您不想覆盖现有文件，则应在执行写入操作之前手动检查文件是否存在。

#### 读取不存在的文件

在之前的 Laravel 版本中，尝试读取不存在的文件会抛出 `Illuminate\Contracts\Filesystem\FileNotFoundException`,Laravel9 则会返回`null`。



#### 删除不存在的文件

尝试 `删除` 一个不存在的文件现在返回 `true`。

#### 缓存适配器

Flysystem 不再支持“缓存适配器”。 因此，它们已从 Laravel 中删除，并且任何相关配置（例如磁盘配置中的 `cache` 键）都可以删除。

#### 自定义文件系统

对注册自定义文件系统驱动程序所需的步骤进行了轻微更改。 因此，如果您正在定义自己的自定义文件系统驱动程序，或者使用定义自定义驱动程序的包，您应该更新您的代码和依赖项。

例如，在 Laravel 8.x 中，自定义文件系统驱动程序可能会像这样注册：

```php
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

Storage::extend('dropbox', function ($app, $config) {
    $client = new DropboxClient(
        $config['authorization_token']
    );

    return new Filesystem(new DropboxAdapter($client));
});
```

但是，在 Laravel 9.x 中，给 `Storage::extend` 方法的回调应该直接返回 `Illuminate\Filesystem\FilesystemAdapter` 的实例：

```php
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

Storage::extend('dropbox', function ($app, $config) {
    $adapter = new DropboxAdapter(new DropboxClient(
        $config['authorization_token']
    ););

    return new FilesystemAdapter(
        new Filesystem($adapter, $config),
        $adapter,
        $config
    );
});
```

### Helpers

<a name="data-get-function"></a>
#### The `data_get` Helper & Iterable Objects

**`data_get` 助手和可迭代对象**

以前，`data_get` 帮助器可用于检索数组和 `Collection` 实例上的嵌套数据；然而，这个助手现在可以检索所有可迭代对象的嵌套数据。

<a name="str-function"></a>


#### `str` 助手函数

**影响的可能性：非常低**

Laravel 9.x 现在包含一个全局 `str` [辅助函数](/docs/laravel/9.x/helpers#method-str)。 如果你在你的应用程序中定义了一个全局的 `str` 助手，你应该重命名或删除它，这样它就不会与 Laravel 自己的 `str` 助手冲突。

<a name="when-and-unless-methods"></a>
#### `when` / `unless` 方法

**影响的可能性：中等**

你可能知道，`when` 和 `unless` 方法由整个框架中的各种类提供。 如果方法的第一个参数的布尔值评估为 `true` 或 `false`，则这些方法可用于有条件地执行操作：

```php
$collection->when(true, function ($collection) {
    $collection->merge([1, 2, 3]);
});
```

因此，在 Laravel 的早期版本中，将闭包传递给 `when` 或 `unless` 方法意味着条件操作将始终执行，因为与闭包对象（或任何其他对象）的松散比较总是评估为 `true` . 这通常会导致意想不到的结果，因为开发人员希望将闭包的**结果**用作确定条件操作是否执行的布尔值。

因此，在 Laravel 9.x 中，任何传递给 `when` 或 `unless` 方法的闭包都将被执行，并且闭包返回的值将被视为 `when` 和 `unless` 方法使用的布尔值：

```php
$collection->when(function ($collection) {
    // This closure is executed...
    return false;
}, function ($collection) {
    // Not executed since first closure returned "false"...
    $collection->merge([1, 2, 3]);
});
```

### HTTP 客户端

<a name="http-client-default-timeout"></a>
#### 默认超时时间

**影响的可能性：中等**

[HTTP 客户端](/docs/laravel/9.x/http-client) 现在默认超时为 30 秒。 也就是说，如果服务器在 30 秒内没有响应，就会抛出异常。以前，在 HTTP 客户端上没有配置默认超时长度，导致请求有时会无限期地“挂起”。



如果您希望为给定请求指定更长的超时时间，您可以使用 `timeout` 方法：

    $response = Http::timeout(120)->get(...);

#### HTTP Fake 和 中间件

**影响的可能性：低**

以前，当 [HTTP 客户端](/docs/laravel/9.x/http-client) 被"faked"时，Laravel 不会执行任何提供的 Guzzle HTTP 中间件。 然而，在 Laravel 9.x 中，即使 HTTP 客户端被伪造，Guzzle HTTP 中间件也会被执行。

#### HTTP Fake 和 依赖注入

**影响的可能性：低**

在之前的 Laravel 版本中，调用 `Http::fake()` 方法不会影响注入到类构造函数中的 `Illuminate\Http\Client\Factory` 实例。 然而，在 Laravel 9.x 中，`Http::fake()` 将确保通过依赖注入注入其他服务的 HTTP 客户端返回虚假响应。 这种行为更符合其他 facade 和 fake 的行为。

<a name="symfony-mailer"></a>
### Symfony Mailer

**影响的可能性：高**

Laravel 9.x 中最大的变化之一是从 SwiftMailer（截至 2021 年 12 月不再维护）到 Symfony Mailer 的过渡。 但是，我们已尝试使您的应用程序尽可能无缝地过渡。 话虽如此，请仔细查看下面的更改列表，以确保您的应用程序完全兼容。

#### 驱动程序前置条件

要继续使用 Mailgun 传输，您的应用程序应该需要 `symfony/mailgun-mailer` 和 `symfony/http-client` Composer 包：

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

`wildbit/swiftmailer-postmark` Composer 包应该从你的应用程序中删除。相反，您的应用程序应该需要 `symfony/postmark-mailer` 和 `symfony/http-client` Composer 包：

```shell
composer require symfony/postmark-mailer symfony/http-client
```



#### 更新的返回类型

该 `send`，`html`，`text` 和 `plain` 方法不再返回接收邮件的收件人数量。相反，返回一个实例 `Illuminate\Mail\SentMessage` 。 此对象包含一个 `Symfony\Component\Mailer\SentMessage` 实例，可通过 `getSymfonySentMessage` 方法或通过在对象上动态调用方法来访问。

#### 重命名为「Swift」方法

各种与 SwiftMailer 相关的方法，其中一些没有被记录，已经被重命名为它们的 Symfony Mailer 对应方法。例如，该 `withSwiftMessage` 方法已重命名为 `withSymfonyMessage`:

    // Laravel 8.x...
    $this->withSwiftMessage(function ($message) {
        $message->getHeaders()->addTextHeader(
            'Custom-Header', 'Header Value'
        );
    });

    // Laravel 9.x...
    use Symfony\Component\Mime\Email;

    $this->withSymfonyMessage(function (Email $message) {
        $message->getHeaders()->addTextHeader(
            'Custom-Header', 'Header Value'
        );
    });

> 注意：请参阅查看 [Symfony Mailer 文档](https://symfony.com/doc/6.0/mailer.html#creating-sending-messages) 以了解与 `Symfony\Component\Mime\Email` 对象的所有可能交互。

下面的列表包含重命名方法的更全面的概述。其中许多方法是用于直接与  `SwiftMailer/Symfony Mailer` 交互的低级方法，因此在大多数 Laravel 应用程序中可能不常用：

    Message::getSwiftMessage();
    Message::getSymfonyMessage();

    Mailable::withSwiftMessage($callback);
    Mailable::withSymfonyMessage($callback);

    MailMessage::withSwiftMessage($callback);
    MailMessage::withSymfonyMessage($callback);

    Mailer::getSwiftMailer();
    Mailer::getSymfonyTransport();

    Mailer::setSwiftMailer($swift);
    Mailer::setSymfonyTransport(TransportInterface $transport);

    MailManager::createTransport($config);
    MailManager::createSymfonyTransport($config);

#### 代理 `Illuminate\Mail\Message` 方法

该 `Illuminate\Mail\Message` 通常将缺少的方法代理给底层的 `Swift_Message` 实例。 但是，缺少的方法现在被代理为 `Symfony\Component\Mime\Email` 的实例。 因此，以前依赖缺失方法代理给 Swift Mailer 的任何代码都应该更新为对应的 Symfony Mailer 对应代码。



同样，许多应用程序可能不会与这些方法交互，因为它们没有记录在 Laravel 文档中：

    // Laravel 8.x...
    $message
        ->setFrom('taylor@laravel.com')
        ->setTo('example@example.org')
        ->setSubject('Order Shipped')
        ->setBody('<h1>HTML</h1>', 'text/html')
        ->addPart('Plain Text', 'text/plain');

    // Laravel 9.x...
    $message
        ->from('taylor@laravel.com')
        ->to('example@example.org')
        ->subject('Order Shipped')
        ->html('<h1>HTML</h1>')
        ->text('Plain Text');

#### 生成的消息 ID

SwiftMailer 提供了定义自定义域以通过 `mime.idgenerator.idright` 配置选项包含在生成的消息 ID 中的能力。Symfony Mailer 不支持此功能。相反，Symfony Mailer 会根据发件人自动生成一个 Message ID。
#### 强制重新连接

不再可能强制传输重新连接（例如，当邮件程序通过守护进程运行时）。相反，Symfony Mailer 将尝试自动重新连接到传输并在重新连接失败时抛出异常。

#### SMTP 流选项

不再支持为 SMTP 传输定义流选项。相反，如果支持，您必须直接在配置中定义相关选项。例如，要禁用 TLS 对等验证：

    'smtp' => [
        // Laravel 8.x...
        'stream' => [
            'ssl' => [
                'verify_peer' => false,
            ],
        ],

        // Laravel 9.x...
        'verify_peer' => false,
    ],

要了解有关可用配置选项的更多信息，请查看 [Symfony Mailer 文档](https://symfony.com/doc/6.0/mailer.html#transport-setup)。

> 注意：尽管有上述示例，但通常不建议您禁用 SSL 验证，因为它引入了「中间人」攻击的可能性。



#### SMTP `授权模式`

不再需要在 `mail` 配置文件中定义 SMTP `auth_mode`。 Symfony Mailer 和 SMTP 服务器将自动协商身份验证模式。

#### 失败的收件人

发送消息后不再检索失败的收件人列表。 相反，如果消息发送失败，则会抛出 `Symfony\Component\Mailer\Exception\TransportExceptionInterface` 异常。建议在发送消息之前验证电子邮件地址，而不是依赖于在发送消息后检索无效的电子邮件地址。

### 扩展包

<a name="the-lang-directory"></a>
#### `lang` 目录

**影响的可能性：中等**

在新的 Laravel 应用程序中，`resources/lang` 目录现在位于项目根目录（`lang`）中。如果你的包发布语言文件到这个目录，应该确保你的包发布到 `app()->langPath()` 而不是硬编码的路径。

<a name="queue"></a>
### 队列

<a name="the-opis-closure-library"></a>
#### `opis/closure` 库

**影响的可能性：低**

Laravel 对 `opis/closure` 的依赖已被 `laravel/serializable-closure` 取代。除非你直接与 `opis/closure` 库进行交互，否则这不会导致应用程序发生任何重大更改。此外，之前不推荐使用的 `Illuminate\Queue\SerializableClosureFactory` 和 `Illuminate\Queue\SerializableClosure` 类已被删除。如果你直接与 `opis/closure` 库交互或使用任何已删除的类，请改用 [Laravel Serializable Closure](https://github.com/laravel/serializable-closure)。

#### 失败的 Job Provider `flush` 方法

**影响的可能性：低**

`Illuminate\Queue\Failed\FailedJobProviderInterface` 接口定义的 `flush` 方法现在接受一个 `$hours` 参数，该参数决定失败的任务在被 `queue:flush` 刷新之前必须存在多长时间（以小时为单位） 命令。如果你手动实现 `FailedJobProviderInterface`，请更新它以反映此新参数：

```php
public function flush($hours = null);
```



### Session

####  `getSession` 方法

**影响程度: 低**

`Symfony\Component\HttpFoundaton\RequestLaravel` 类继承于 Laravel 的 `Illuminate\Http\Request` 类，它提供了 `getSession` 方法来获取当前的会话存储处理器。Laravel 没有记录此方法，因为大多数 Laravel 应用程序通过 Laravel 的 `session` 方法与 session 交互。

`getSession` 方法先前返回了 `Illuminate\Session\Store` 的实例或者 `null`；但是，由于 Symfony 6.x 版本强制返回类型为 `Symfony\Component\HttpFoundation\Session\SessionInterface`, 所以现在 `getSession` 会返回 `SessionInterface` 的实现，或者在没有可用的 session 时抛出一个 `\Symfony\Component\HttpFoundation\Exception\SessionNotFoundException` 的异常。

### 测试

<a name="the-assert-deleted-method"></a>
#### `assertDeleted` 方法

**影响程度: 中**

所有调用 `assertDeleted` 的方法应该修改为 `assertModelMissing` 。

### TrustProxies 中间件

**影响程度: 低**

如果您是通过升级 Laravel 8 至 Laravel 9 的方式来导入全新的 Laravel 9 框架，您可能需要更新应用程序的 `trusted proxy` 中间件。

在您的 `app/Http/Middleware/TrustProxies.php` 文件中，修改 `use Fideloper\Proxy\TrustProxies as Middleware` 为 `use Illuminate\Http\Middleware\TrustProxies as Middleware`。

继续在`app/Http/Middleware/TrustProxies.php`文件 修改注释中的:
	@var array|string|null
改为
	@var array<int, string>|string|null

接下来, 在 `app/Http/Middleware/TrustProxies.php`， 您需要更改 `$headers` 属性的定义:

```php
// Before...
protected $headers = Request::HEADER_X_FORWARDED_ALL;

// After...
protected $headers =
    Request::HEADER_X_FORWARDED_FOR |
    Request::HEADER_X_FORWARDED_HOST |
    Request::HEADER_X_FORWARDED_PORT |
    Request::HEADER_X_FORWARDED_PROTO |
    Request::HEADER_X_FORWARDED_AWS_ELB;
```

最后，您可以删除 `fideloper/proxy` 的 Composer 依赖项：

```shell
composer remove fideloper/proxy
```



### 验证

#### 表单请求 `validated` 方法

**影响的可能性：低**

表单请求提供的 `validated` 方法现在接受 `$key` 和 `$default` 参数。如果您手动覆盖此方法的定义，则应更新方法的签名以反映这些新参数：

```php
public function validated($key = null, $default = null)
```

<a name="the-password-rule"></a>
#### `password` 规则

**影响的可能性：中等**

验证给定输入值是否与经过身份验证的用户的当前密码匹配的 `password` 规则已重命名为 `current_password`。

<a name="unvalidated-array-keys"></a>
#### 未验证的数组键

**影响的可能性：中等**

在以前的 Laravel 版本中，您需要手动指示 Laravel 的验证器从它返回的“已验证”数据中排除未验证的数组键，尤其是结合未指定允许键列表的“数组”规则。

然而，在 Laravel 9.x 中，即使没有通过 `array` 规则指定允许的键，未验证的数组键也总是从“已验证”数据中排除。 通常，这种行为是最预期的行为，之前的 `excludeUnvalidatedArrayKeys` 方法只是作为临时措施添加到 Laravel 8.x 中，以保持向后兼容性。

尽管不建议这样做，但您可以通过在应用程序的服务提供者之一的 `boot` 方法中调用新的 `includeUnvalidatedArrayKeys` 方法来选择加入以前的 Laravel 8.x 行为：

```php
use Illuminate\Support\Facades\Validator;

/**
 * Register any application services.
 *
 * @return void
 */
public function boot()
{
    Validator::includeUnvalidatedArrayKeys();
}
```

#### Middleware

从 Laravel 8 升级到 Laravel 9 的过程中，可能会出现与 `TrustedProxy` 中间件相关的错误 `Undefined constant Illuminate\Http\Request::HEADER_X_FORWARDED_ALL` 从而导致升级中断，解决方法如下：

修改文件 `app/Http/Middleware/TrustProxies.php`中：

原文 `Use Fideloper\Proxy\TrustProxies as Middle;`

修改为 `Use Illuminate\Http\Middleware\TrustProxies as Middleware;`

修改 `$headers` 的赋值为：

```
protected $headers =
    Request::HEADER_X_FORWARDED_FOR |
    Request::HEADER_X_FORWARDED_HOST |
    Request::HEADER_X_FORWARDED_PORT |
    Request::HEADER_X_FORWARDED_PROTO |
    Request::HEADER_X_FORWARDED_AWS_ELB;
```

最后，移除旧的依赖： `composer remove fideloper/proxy` 即可继续执行升级步骤。

<a name="miscellaneous"></a>
### Miscellaneous

我们还鼓励您查看 `laravel/laravel` [GitHub 存储库](https://github.com/laravel/laravel) 中的更改 虽然其中许多更改不是必需的，但您可能希望使这些文件与您的应用程序保持同步。 本升级指南将涵盖其中一些更改，但其他更改（例如对配置文件或注释的更改）将不会涵盖。 您可以使用 [GitHub 比较工具](https://github.com/laravel/laravel/compare/8.x...9.x) 轻松查看更改并选择哪些更新对您很重要。

