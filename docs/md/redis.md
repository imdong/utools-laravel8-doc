# Redis

- [安装](#introduction)
- [配置](#configuration)
    - [集群](#clusters)
    - [Predis](#predis)
    - [phpredis](#phpredis)
- [与 Redis 交互](#interacting-with-redis)
    - [事务](#transactions)
    - [管道命令](#pipelining-commands)
- [发布与订阅](#pubsub)

<a name="introduction"></a>
## 简介

[Redis](https://redis.io) 是一个开源的，高级键值对存储数据库。 包含的数据类型有 [字符串](https://redis.io/topics/data-types#strings), [hash](https://redis.io/topics/data-types#hashes), [列表](https://redis.io/topics/data-types#lists), [集合](https://redis.io/topics/data-types#sets), 和 [有序集合](https://redis.io/topics/data-types#sorted-sets).

在将 Redis 与 Laravel 一起使用前，我们鼓励你通过 PECL 安装并使用  [PhpRedis](https://github.com/phpredis/phpredis) 尽管扩展安装起来更复杂，但对于大量使用 Redis 的应用程序可能会产生更好的性能。

如果你正在使用 [Laravel Sail](/docs/laravel/9.x/sail), 这个扩展已经实现安装好在你的 Docker 容器中了。

如果你不能安装 PHPRedis 扩展，你或许可以使用 composer 安装 `predis/predis` 包。Predis 是一个完全用 PHP 编写的 Redis 客户端，不需要任何额外的扩展：

```shell
composer require predis/predis
```

<a name="configuration"></a>
## 配置

在你的应用中配置 Redis 信息，你要在 `config/database.php` 文件中进行配置。在该文件中，你将看到一个 `Redis` 数组包含了你的 Redis 配置信息。

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'default' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', 6379),
            'database' => env('REDIS_DB', 0),
        ],

        'cache' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', 6379),
            'database' => env('REDIS_CACHE_DB', 1),
        ],

    ],



在你的配置文件里定义的每个 Redis 服务器，除了用 URL 来表示的 Redis 连接，都必需要指定名称  、 host （主机）和 port （端口）字段：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'default' => [
            'url' => 'tcp://127.0.0.1:6379?database=0',
        ],

        'cache' => [
            'url' => 'tls://user:password@127.0.0.1:6380?database=1',
        ],

    ],

<a name="configuring-the-connection-scheme"></a>
#### 配置连接方案

默认情况下，Redis 客户端使用`tcp`方案连接Redis服务器。另外，你也可以在你的 Redis 服务配置数组中指定一个`scheme`配置项，来使用 TLS/SSL 加密：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'default' => [
            'scheme' => 'tls',
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', 6379),
            'database' => env('REDIS_DB', 0),
        ],

    ],

<a name="clusters"></a>
### 集群

如果你的应用使用 Redis 集群，你应该在 Redis 配置文件中用`clusters`键来定义集群。这个配置键默认没有，所以你需要在`config/database.php`配置文件中手动创建：

    'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        'default' => [
            [
                'host' => env('REDIS_HOST', 'localhost'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', 6379),
                'database' => 0,
            ],
        ],
    ],

默认情况下，集群可以在节点上实现客户端分片，允许你实现节点池以及创建大量可用内存。这里要注意，客户端共享不会处理失败的情况；因此，这个功能主要适用于从另一个主数据库获取的缓存数据。
如果要使用 Redis 原生集群，需要把`config/database.php`配置文件下的`options.cluster`配置项的值设置为`redis`：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
        ],

        'clusters' => [
            // ...
        ],

    ],

<a name="predis"></a>
### Predis

要使用 Predis 扩展去连接 Redis， 请确保环境变量 `REDIS_CLIENT` 的值为 `predis`：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'predis'),

        // 重设 Redis 配置项...
    ],

除默认的 `host`，`port`，`database` 和 `password` 这些服务配置选项外， Predis 还支持为每个 Redis 服务器定义其它的 [连接参数](https://github.com/nrk/predis/wiki/Connection-Parameters)。如果要使用这些额外的配置项，可以在 `config/database.php` 配置文件中将任意选项添加到 Redis 服务器配置内：

    'default' => [
        'host' => env('REDIS_HOST', 'localhost'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
        'read_write_timeout' => 60,
    ],

<a name="the-redis-facade-alias"></a>
#### Redis Facade 别名

Laravel 的 `config/app.php` 配置文件包含了 `aliases` 数组，该数组可用于定义通过框架注册的所有类别名。方便起见，Laravel 提供了一份包含了所有 [facade](/docs/laravel/9.x/facades) 的别名入口；不过，`Redis` 别名不能在这里使用，因为这与 phpredis 扩展提供的 `Redis` 类名冲突。如果正在使用 Predis 客户端并确实想要用这个别名，你可以在 `config/app.php` 配置文件中取消对此别名的注释。

<a name="phpredis"></a>
### phpredis

Laravel 默认使用 phpredis 扩展与 Redis 通信。Laravel 用于与 Redis 通信的客户端由 `redis.client` 配置项决定，这个配置通常为环境变量 `REDIS_CLIENT` 的值：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        // 重设 Redis 配置项...
    ],


除默认的 `scheme`, `host`, `port`, `database` 和 `password` 的服务器配置选项外，phpredis 还支持以下额外的连接参数：`name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout` 和 `context`。 您可以在 `config/database.php` 配置文件中将任意选项添加到 Redis 服务器配置内：

    'default' => [
        'host' => env('REDIS_HOST', 'localhost'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
        'read_timeout' => 60,
        'context' => [
            // 'auth' => ['username', 'secret'],
            // 'stream' => ['verify_peer' => false],
        ],
    ],

<a name="phpredis-serialization"></a>
#### phpredis 序列化和压缩

phpredis 扩展可以配置使用各种序列化和压缩算法。可以通过设置 Redis 配置中的 `options` 数组进行配置：

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'serializer' => Redis::SERIALIZER_MSGPACK,
            'compression' => Redis::COMPRESSION_LZ4,
        ],

        // 重设 Redis 配置项...
    ],

当前支持的序列化算法包括： `Redis::SERIALIZER_NONE` （默认）,  `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY` 和 `Redis::SERIALIZER_MSGPACK` 。

支持的压缩算法包括： `Redis::COMPRESSION_NONE` （默认）,  `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD` 和 `Redis::COMPRESSION_LZ4` 。

<a name="interacting-with-redis"></a>
## 与 Redis 交互

你可以通过调用 `Redis` [facade](/docs/laravel/8.5/facades) 上的各种方法来与 Redis 进行交互。 `Redis` facade 支持动态方法，所以你可以在 facade 上调用各种 [Redis 命令](https://redis.io/commands) ，这些命令将直接传递给 Redis 。在本例中，我们将调用 `Redis` facade 的 `get` 方法，来调用 Redis `GET` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Redis;

    class UserController extends Controller
    {
        /**
         * 显示给定用户的配置文件
         *
         * @param  int  $id
         * @return \Illuminate\Http\Response
         */
        public function show($id)
        {
            return view('user.profile', [
                'user' => Redis::get('user:profile:'.$id)
            ]);
        }
    }

如上所述，你可以在 `Redis` facade 上调用任意 Redis 命令。 Laravel 使用魔术方法将命令传递给 Redis 服务器。如果一个 Redis 命令需要参数，则应将这些参数传递给 `Redis` facade 的相应方法：

    use Illuminate\Support\Facades\Redis;

    Redis::set('name', 'Taylor');

    $values = Redis::lrange('names', 5, 10);

或者，你也可以使用 `Redis` facade 上的 `command` 方法将命令传递给服务器，它接受命令的名称作为其第一个参数，并将值的数组作为其第二个参数：

    $values = Redis::command('lrange', ['name', 5, 10]);

<a name="using-multiple-redis-connections"></a>
#### 使用多个 Redis 连接

你应用里的 `config/database.php` 配置文件允许你去定义多个 Redis 连接或者服务器。你可以使用 `Redis` facade 上的 `connection` 方法获得指定的 Redis 连接：

    $redis = Redis::connection('connection-name');

要获取获取一个默认的 Redis 连接，你可以调用 `connection` 方法时，不带任何参数：

    $redis = Redis::connection();

<a name="transactions"></a>
### 事务

`Redis` facade 上的 `transaction` 方法对 Redis 原生的 `MULTI` 和 `EXEC` 命令进行了封装。 `transaction` 方法接受一个闭包作为其唯一参数。这个闭包将接收一个 Redis 连接实例，并可能向这个实例发出想要的任何命令。闭包中发出的所有Redis命令都将在单个原子性事务中执行：

    use Illuminate\Support\Facades\Redis;

    Redis::transaction(function ($redis) {
        $redis->incr('user_visits', 1);
        $redis->incr('total_visits', 1);
    });

> 注意：定义一个 Redis 事务时，你不能从 Redis 连接中获取任何值。请记住，事务是作为单个原子性操作执行的，在整个闭包执行完其命令之前，不会执行该操作。

#### Lua 脚本

`eval` 方法提供了另外一种原子性执行多条 Redis 命令的方式。但是，`eval` 方法的好处是能够在操作期间与 Redis 键值交互并检查它们。 Redis 脚本是用 [Lua 编程语言](https://www.lua.org) 编写的。
`eval` 方法一开始可能有点令人劝退，所以我们将用一个基本示例来明确它的使用方法。 `eval` 方法需要几个参数。第一，在方法中传递一个 Lua 脚本（作为一个字符串）。第二，在方法中传递脚本交互中用到的键的数量（作为一个整数）。第三，在方法中传递所有键名。最后，你可以传递一些脚本中用到的其他参数。

在本例中，我们要对第一个计数器进行递增，检查它的新值，如果该计数器的值大于5，那么递增第二个计数器。最终，我们将返回第一个计数器的值：

    $value = Redis::eval(<<<'LUA'
        local counter = redis.call("incr", KEYS[1])

        if counter > 5 then
            redis.call("incr", KEYS[2])
        end

        return counter
    LUA, 2, 'first-counter', 'second-counter');

> 注意：请参考 [Redis 文档](https://redis.io/commands/eval) 更多关于 Redis 脚本的信息。

<a name="pipelining-commands"></a>
### 管道命令

当你需要执行很多个 Redis 命令时，你可以使用 `pipeline` 方法一次性提交所有命令，而不需要每条命令都与 Redis 服务器建立一次网络连接。 `pipeline` 方法只接受一个参数：接收一个 Redis 实例的闭包。你可以将所有命令发给这个 Redis 实例，它们将同时发送到 Redis 服务器，以减少到服务器的网络访问。这些命令仍然会按照发出的顺序执行：

    use Illuminate\Support\Facades\Redis;

    Redis::pipeline(function ($pipe) {
        for ($i = 0; $i < 1000; $i++) {
            $pipe->set("key:$i", $i);
        }
    });


<a name="pubsub"></a>
## 发布 / 订阅

Laravel 为 Redis 的 `publish` 和 `subscribe` 命令提供了方便的接口。你可以用这些 Redis 命令监听指定「频道」上的消息。你也可以从一个应用程序发消息给另一个应用程序，哪怕它是用其它编程语言开发的，让应用程序和进程之间能够轻松进行通信。
首先，用 `subscribe` 方法设置一个频道监听器。我们将这个方法调用放到一个 [Artisan 命令](/docs/laravel/8.5/artisan) 中，因为调用 `subscribe` 方法会启动一个常驻进程：

    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Support\Facades\Redis;

    class RedisSubscribe extends Command
    {
        /**
         * 控制台命令的名称和签名
         *
         * @var string
         */
        protected $signature = 'redis:subscribe';

        /**
         * 控制台命令的描述
         *
         * @var string
         */
        protected $description = 'Subscribe to a Redis channel';

        /**
         * 执行控制台命令
         *
         * @return mixed
         */
        public function handle()
        {
            Redis::subscribe(['test-channel'], function ($message) {
                echo $message;
            });
        }
    }



现在我们可以使用 `publish` 方法将消息发布到频道：

    use Illuminate\Support\Facades\Redis;

    Route::get('/publish', function () {
        // ...

        Redis::publish('test-channel', json_encode([
            'name' => 'Adam Wathan'
        ]));
    });

<a name="wildcard-subscriptions"></a>
#### 通配符订阅

使用 `psubscribe` 方法，你可以订阅一个通配符频道，用来获取所有频道中的所有消息，频道名称将作为第二个参数传递给提供的回调闭包：

    Redis::psubscribe(['*'], function ($message, $channel) {
        echo $message;
    });

    Redis::psubscribe(['users.*'], function ($message, $channel) {
        echo $message;
    });

