# 缓存系统

- [简介](#introduction)
- [配置](#configuration)
    - [驱动的前提条件](#driver-prerequisites)
- [缓存使用](#cache-usage)
    - [获取缓存实例](#obtaining-a-cache-instance)
    - [从缓存获取数据](#retrieving-items-from-the-cache)
    - [向缓存存储数据](#storing-items-in-the-cache)
    - [从缓存删除数据](#removing-items-from-the-cache)
    - [Cache 辅助函数](#the-cache-helper)
- [缓存标记](#cache-tags)
    - [存储被标记的缓存数据](#storing-tagged-cache-items)
    - [访问被标记的缓存数据](#accessing-tagged-cache-items)
    - [删除被标记的缓存数据](#removing-tagged-cache-items)
- [原子锁](#atomic-locks)
    - [驱动的前提条件](#lock-driver-prerequisites)
    - [管理锁](#managing-locks)
    - [跨进程管理锁](#managing-locks-across-processes)
- [添加自定义缓存驱动](#adding-custom-cache-drivers)
    - [编写驱动](#writing-the-driver)
    - [注册驱动](#registering-the-driver)
- [事件](#events)

<a name="introduction"></a>
## 简介

在某些应用中，一些查询数据或处理任务的操作会在某段时间里短时间内大量进行，或是一个操作花费好几秒钟。当出现这种情况时，通常会将检索到的数据缓存起来，从而为后面请求同一数据的请求迅速返回结果。这些缓存数据通常会储存在极快的存储系统中，例如 [Memcached](https://memcached.org) 和 [Redis](https://redis.io)。

Laravel 为各种缓存后端提供了富有表现力且统一的 API，以便你利用它们极快的查询数据来加快你的应用。

<a name="configuration"></a>
## 配置

缓存配置文件位于 `config/cache.php`。在这个文件中，你可以指定应用默认使用哪个缓存驱动。Laravel 支持的缓存后端包括 [Memcached](https://memcached.org)、[Redis](https://redis.io)、[DynamoDB](https://aws.amazon.com/dynamodb)，以及现成的关系型数据库。此外，还支持基于文件的缓存驱动，以及方便自动化测试的缓存驱动 `array` 和 `null` 。



缓存配置文件还包含文件中记录的各种其他选项，因此请务必阅读这些选项。默认情况下，Laravel 配置为使用 `file` 缓存驱动程序，它将序列化的缓存对象存储在服务器的文件系统上。对于较大的应用程序，建议您使用更健壮的驱动程序，例如 Memcached 或 Redis。您甚至可以为同一个驱动程序配置多个缓存配置。

<a name="driver-prerequisites"></a>
### 驱动程序必备条件

<a name="prerequisites-database"></a>
#### 数据库

当使用 `database` 缓存驱动程序时，您需要设置一个表来包含缓存项。您将在下表中找到一个示例 `Schema` 声明：

    Schema::create('cache', function ($table) {
        $table->string('key')->unique();
        $table->text('value');
        $table->integer('expiration');
    });

> 技巧：您还可以使用 `php artisan cache:table` Artisan 命令生成具有正确模式的迁移。

<a name="memcached"></a>
#### Memcached

使用 Memcached 驱动需要安装【Memcached PECL 包】(https://pecl.php.net/package/memcached)。您可以在 `config/cache.php` 配置文件中列出所有 Memcached 服务器。 该文件已经包含一个 `memcached.servers` 条目以帮助您入门：

    'memcached' => [
        'servers' => [
            [
                'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                'port' => env('MEMCACHED_PORT', 11211),
                'weight' => 100,
            ],
        ],
    ],

如果需要，您可以将 `host` 选项设置为 UNIX 套接字路径。如果你这样做，`port` 选项应该设置为 `0`：

    'memcached' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],

<a name="redis"></a>
#### Redis

在将 Redis 缓存与 Laravel 一起使用之前，您需要通过 PECL 安装 PhpRedis PHP 扩展或通过 Composer 安装 `predis/predis` 包（~1.0）。[Laravel Sail](/docs/laravel/9.x/sail) 已经包含了这个扩展。另外，Laravel 官方部署平台如 [Laravel Forge](https://forge.laravel.com) 和 [Laravel Vapor](https://vapor.laravel.com) 默认安装了 PhpRedis 扩展。



有关配置 Redis 的更多信息，请参阅其 [Laravel 文档页面](/docs/laravel/9.x/redis#configuration)。

<a name="dynamodb"></a>
#### DynamoDB

在使用 [DynamoDB](https://aws.amazon.com/dynamodb) 缓存驱动程序之前，您必须创建一个 DynamoDB 表来存储所有缓存的数据。通常，此表应命名为「缓存」。但是，您应该根据应用程序的 `cache` 配置文件中的 `stores.dynamodb.table` 配置值来命名表。

该表还应该有一个字符串分区键，其名称对应于应用程序的 `cache` 配置文件中的 `stores.dynamodb.attributes.key` 配置项的值。 默认情况下，分区键应命名为 `key`。

<a name="cache-usage"></a>
## 缓存使用

<a name="obtaining-a-cache-instance"></a>
### 获取缓存实例

要获取缓存存储实例，您可以使用 `Cache` Facade，我们将在本文档中使用它。`Cache` Facade 提供了对 Laravel 缓存合约底层实现的方便、简洁的访问：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * 显示应用程序的所有用户的列表。
         *
         * @return Response
         */
        public function index()
        {
            $value = Cache::get('key');

            //
        }
    }

<a name="accessing-multiple-cache-stores"></a>
#### 访问多个缓存存储

使用 `Cache` Facade，您可以通过 `store` 方法访问各种缓存存储。传递给 `store` 方法的键应该对应于 `cache` 配置文件中的 `stores` 配置数组中列出的存储之一：

    $value = Cache::store('file')->get('foo');

    Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutes



<a name="retrieving-items-from-the-cache"></a>
### 从缓存中检索项目

`Cache` 门面的 `get` 方法用于从缓存中检索项目。如果缓存中不存在该项目，则将返回 `null`。如果您愿意，您可以将第二个参数传递给 `get` 方法，指定您希望在项目不存在时返回的默认值：

    $value = Cache::get('key');

    $value = Cache::get('key', 'default');

您甚至可以将闭包作为默认值传递。如果指定的项在缓存中不存在，则返回闭包的结果。传递闭包允许您推迟从数据库或其他外部服务中检索默认值：

    $value = Cache::get('key', function () {
        return DB::table(...)->get();
    });

<a name="checking-for-item-existence"></a>
#### 检查项目是否存在

`has` 方法可用于确定缓存中是否存在项目。如果项目存在但其值为 `null`，此方法也将返回 `false`：

    if (Cache::has('key')) {
        //
    }

<a name="incrementing-decrementing-values"></a>
#### 递增/递减值

`increment` 和 `decrement` 方法可用于调整缓存中整数项的值。这两种方法都接受一个可选的第二个参数，指示增加或减少项目值的数量：

    Cache::increment('key');
    Cache::increment('key', $amount);
    Cache::decrement('key');
    Cache::decrement('key', $amount);

<a name="retrieve-store"></a>
#### 检索和存储

有时您可能希望从缓存中检索一个项目，但如果请求的项目不存在，也存储一个默认值。例如，您可能希望从缓存中检索所有用户，或者，如果它们不存在，则从数据库中检索它们并将它们添加到缓存中。您可以使用 `Cache::remember` 方法执行此操作：

    $value = Cache::remember('users', $seconds, function () {
        return DB::table('users')->get();
    });



如果缓存中不存在该项，则传递给 `remember` 方法的闭包将被执行，并将其结果放入缓存中。

您可以使用 `rememberForever` 方法从缓存中检索一个项目，或者如果它不存在则永久存储它：

    $value = Cache::rememberForever('users', function () {
        return DB::table('users')->get();
    });

<a name="retrieve-delete"></a>
#### 检索和删除

如果您需要从缓存中检索一个项目然后删除该项目，您可以使用 `pull` 方法。 与 `get` 方法一样，如果缓存中不存在该项，则将返回 `null`：

    $value = Cache::pull('key');

<a name="storing-items-in-the-cache"></a>
### 在缓存中存储项目

您可以使用 `Cache` Facade 上的 `put` 方法将项目存储在缓存中：

    Cache::put('key', 'value', $seconds = 10);

如果存储时间没有传递给 `put` 方法，该项目将被无限期存储：

    Cache::put('key', 'value');

除了将秒数作为整数传递之外，您还可以传递一个表示缓存项所需过期时间的 `DateTime` 实例：

    Cache::put('key', 'value', now()->addMinutes(10));

<a name="store-if-not-present"></a>
#### 如果不存在则存储

`add` 方法只会将缓存存储中不存在的项目添加到缓存中。如果项目实际添加到缓存中，该方法将返回 `true`。 否则，该方法将返回 `false`。 `add` 方法是一个原子操作：

    Cache::add('key', 'value', $seconds);



<a name="storing-items-forever"></a>
#### 永久存储

`forever` 方法可用于将项目永久存储在缓存中。由于这些项目不会过期，因此必须使用 `forget` 方法手动将它们从缓存中删除：

    Cache::forever('key', 'value');

> 技巧：如果您使用的是 Memcached 驱动程序，则当缓存达到其大小限制时，可能会删除「永久」存储的项目。

<a name="removing-items-from-the-cache"></a>
### 从缓存中删除项目

您可以使用 `forget` 方法从缓存中删除项目：

    Cache::forget('key');

您还可以通过提供零或负数的过期秒数来删除项目：

    Cache::put('key', 'value', 0);

    Cache::put('key', 'value', -5);

您可以使用 `flush` 方法清除整个缓存：

    Cache::flush();

> 注意：刷新缓存不会考虑您配置的缓存「前缀」，并且会从缓存中删除所有条目。
在清除由其他应用程序共享的缓存时，请仔细考虑这一点。

<a name="the-cache-helper"></a>
### 缓存助手函数

除了使用 `Cache` 门面之外，您还可以使用全局 `cache` 函数通过缓存检索和存储数据。当使用单个字符串参数调用 `cache` 函数时，它将返回给定键的值：

    $value = cache('key');

如果您向函数提供键/值对数组和过期时间，它将在指定的持续时间内将值存储在缓存中：

    cache(['key' => 'value'], $seconds);

    cache(['key' => 'value'], now()->addMinutes(10));

当不带任何参数调用 `cache` 函数时，它会返回 `Illuminate\Contracts\Cache\Factory` 实现的实例，允许您调用其他缓存方法：

    cache()->remember('users', $seconds, function () {
        return DB::table('users')->get();
    });

> 技巧：在测试对全局 `cache` 函数的调用时，您可以使用 `Cache::shouldReceive` 方法，就像 [testing the facade](/docs/laravel/9.x/mocking#mocking-facades)。



<a name="cache-tags"></a>
## 缓存标签

> 注意：使用 `file`、`dynamodb` 或 `database` 缓存驱动程序时不支持缓存标记。 此外，当使用带有“永久”存储的缓存的多个标签时，使用诸如“memcached”之类的驱动程序会获得最佳性能，它会自动清除陈旧的记录。

<a name="storing-tagged-cache-items"></a>
### 存储缓存标签

缓存标签允许您在缓存中标记相关项目，然后刷新所有已分配给定标签的缓存值。您可以通过传入标记名称的有序数组来访问标记缓存。例如，让我们访问一个标记的缓存并将一个值「put」缓存中：

    Cache::tags(['people', 'artists'])->put('John', $john, $seconds);

    Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);

<a name="accessing-tagged-cache-items"></a>
### 访问缓存标签

要检索标记的缓存项，请将相同的有序标签列表传递给 `tags` 方法，然后使用您要检索的键调用 `get` 方法：

    $john = Cache::tags(['people', 'artists'])->get('John');

    $anne = Cache::tags(['people', 'authors'])->get('Anne');

<a name="removing-tagged-cache-items"></a>
### 删除缓存标签

您可以刷新所有分配了标签或标签列表的项目。例如，此语句将删除所有标记为「people」、「authors」或两者的缓存。 因此，`Anne` 和 `John` 都将从缓存中删除：

    Cache::tags(['people', 'authors'])->flush();

相反，此语句将仅删除带有 `authors` 标记的缓存值，因此将删除 `Anne`，但不会删除 `John`：

    Cache::tags('authors')->flush();



<a name="atomic-locks"></a>
## 原子锁

> 注意：要使用此功能，您的应用程序必须使用`memcached`、`redis`、`dynamicodb`、`database`、`file`或`array`缓存驱动程序作为应用程序的默认缓存驱动程序。
此外，所有服务器都必须与同一中央缓存服务器通信。

<a name="lock-driver-prerequisites"></a>
### 驱动程序先决条件

<a name="atomic-locks-prerequisites-database"></a>
#### 数据库

使用“数据库”缓存驱动程序时，您需要设置一个表来包含应用程序的缓存锁。您将在下表中找到一个示例 `Schema` 声明：

    Schema::create('cache_locks', function ($table) {
        $table->string('key')->primary();
        $table->string('owner');
        $table->integer('expiration');
    });

<a name="managing-locks"></a>
### 管理锁

原子锁允许操作分布式锁而不用担心竞争条件。例如，[Laravel Forge](https://forge.laravel.com) 使用原子锁来确保服务器上一次只执行一个远程任务。您可以使用 `Cache::lock` 方法创建和管理锁：

    use Illuminate\Support\Facades\Cache;

    $lock = Cache::lock('foo', 10);

    if ($lock->get()) {
        // 锁定 10 秒...

        $lock->release();
    }

`get` 方法也接受一个闭包。闭包执行后，Laravel 会自动释放锁：

    Cache::lock('foo')->get(function () {
        // 锁定无限期获得并自动释放...
    });

如果在您请求时锁不可用，您可以指示 Laravel 等待指定的秒数。如果在指定的时间限制内无法获取锁，则会抛出 `Illuminate\Contracts\Cache\LockTimeoutException`：

    use Illuminate\Contracts\Cache\LockTimeoutException;

    $lock = Cache::lock('foo', 10);

    try {
        $lock->block(5);

        // 等待最多 5 秒后获得锁定...
    } catch (LockTimeoutException $e) {
        // 无法获取锁...
    } finally {
        optional($lock)->release();
    }



上面的例子可以通过将闭包传递给 `block` 方法来简化。当一个闭包被传递给这个方法时，Laravel 将尝试在指定的秒数内获取锁，并在闭包执行后自动释放锁：

    Cache::lock('foo', 10)->block(5, function () {
        // 等待最多 5 秒后获得锁定...
    });

<a name="managing-locks-across-processes"></a>
### 跨进程管理锁

有时，您可能希望在一个进程中获取锁并在另一个进程中释放它。例如，您可能在 Web 请求期间获取锁，并希望在由该请求触发的排队作业结束时释放锁。在这种情况下，您应该将锁的作用域「owner 令牌」传递给排队的作业，以便作业可以使用给定的令牌重新实例化锁。

在下面的示例中，如果成功获取锁，我们将调度一个排队的作业。 此外，我们将通过锁的 `owner` 方法将锁的所有者令牌传递给排队的作业：

    $podcast = Podcast::find($id);

    $lock = Cache::lock('processing', 120);

    if ($lock->get()) {
        ProcessPodcast::dispatch($podcast, $lock->owner());
    }

在我们应用程序的 `ProcessPodcast` 作业中，我们可以使用所有者令牌恢复和释放锁：

    Cache::restoreLock('processing', $this->owner)->release();

如果你想释放一个锁而不考虑它的当前所有者，你可以使用 `forceRelease` 方法：

    Cache::lock('processing')->forceRelease();

<a name="adding-custom-cache-drivers"></a>
## 添加自定义缓存驱动程序

<a name="writing-the-driver"></a>


### 编写驱动程序

要创建我们的自定义缓存驱动程序，我们首先需要实现 `Illuminate\Contracts\Cache\Store` [contract](/docs/laravel/9.x/contracts)。 因此，MongoDB 缓存实现可能如下所示：

    <?php

    namespace App\Extensions;

    use Illuminate\Contracts\Cache\Store;

    class MongoStore implements Store
    {
        public function get($key) {}
        public function many(array $keys) {}
        public function put($key, $value, $seconds) {}
        public function putMany(array $values, $seconds) {}
        public function increment($key, $value = 1) {}
        public function decrement($key, $value = 1) {}
        public function forever($key, $value) {}
        public function forget($key) {}
        public function flush() {}
        public function getPrefix() {}
    }

我们只需要使用 MongoDB 连接来实现这些方法中的每一个。有关如何实现这些方法的示例，请查看 [Laravel 框架源代码](https://github.com/laravel/framework) 中的 `Illuminate\Cache\MemcachedStore`。 一旦我们的实现完成，我们可以通过调用 `Cache` 门面的 `extend` 方法来完成我们的自定义驱动程序注册：

    Cache::extend('mongo', function ($app) {
        return Cache::repository(new MongoStore);
    });

> 技巧：如果您想知道将自定义缓存驱动程序代码放在哪里，您可以在您的 `app` 目录中创建一个 `Extensions` 命名空间。 但是请记住，Laravel 没有严格的应用程序结构，您可以根据自己的喜好自由组织应用程序。

<a name="registering-the-driver"></a>
### 注册驱动程序

要向 Laravel 注册自定义缓存驱动程序，我们将使用 `Cache` 门面的 `extend` 方法。 由于其他服务提供者可能会尝试在他们的 `boot` 方法中读取缓存值，我们将在 `booting` 回调中注册我们的自定义驱动程序。 通过使用 `booting` 回调，我们可以确保在应用程序的服务提供者调用 `boot` 方法之前但在所有服务提供者调用 `register` 方法之后注册自定义驱动程序。 我们将在应用程序的 `App\Providers\AppServiceProvider` 类的 `register` 方法中注册我们的 `booting` 回调：

    <?php

    namespace App\Providers;

    use App\Extensions\MongoStore;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\ServiceProvider;

    class CacheServiceProvider extends ServiceProvider
    {
        /**
         * 注册任何应用程序服务。
         *
         * @return void
         */
        public function register()
        {
            $this->app->booting(function () {
                 Cache::extend('mongo', function ($app) {
                     return Cache::repository(new MongoStore);
                 });
             });
        }

        /**
         * 引导任何应用程序服务。
         *
         * @return void
         */
        public function boot()
        {
            //
        }
    }



传递给 `extend` 方法的第一个参数是驱动程序的名称。这将对应于 `config/cache.php` 配置文件中的 `driver` 选项。 第二个参数是一个闭包，它应该返回一个 `Illuminate\Cache\Repository` 实例。闭包将传递一个 `$app` 实例，它是 [服务容器](/docs/laravel/9.x/container) 的一个实例。

注册扩展程序后，将 `config/cache.php` 配置文件的 `driver` 选项更新为扩展程序的名称。

<a name="events"></a>
## 事件

要在每个缓存操作上执行代码，您可以侦听缓存触发的 [events](/docs/laravel/9.x/events)。 通常，您应该将这些事件侦听器放在应用程序的 `App\Providers\EventServiceProvider` 类中：

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Cache\Events\CacheHit' => [
            'App\Listeners\LogCacheHit',
        ],

        'Illuminate\Cache\Events\CacheMissed' => [
            'App\Listeners\LogCacheMissed',
        ],

        'Illuminate\Cache\Events\KeyForgotten' => [
            'App\Listeners\LogKeyForgotten',
        ],

        'Illuminate\Cache\Events\KeyWritten' => [
            'App\Listeners\LogKeyWritten',
        ],
    ];

