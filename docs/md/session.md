
# HTTP 会话机制

- [简介](#introduction)
    - [配置](#configuration)
    - [驱动程序先决条件](#driver-prerequisites)
- [使用 Session](#interacting-with-the-session)
    - [获取数据](#retrieving-data)
    - [存储数据](#storing-data)
    - [闪存数据](#flash-data)
    - [删除数据](#deleting-data)
    - [重新生成 Session ID](#regenerating-the-session-id)
- [Session Blocking](#session-blocking)
- [添加自定义 Session 驱动](#adding-custom-session-drivers)
    - [实现驱动](#implementing-the-driver)
    - [注册驱动](#registering-the-driver)

<a name="introduction"></a>
## 简介

由于 HTTP 驱动的应用程序是无状态的，Session 提供了一种在多个请求之间存储有关用户信息的方法，这类信息一般都存储在后续请求可以访问的持久存储 / 后端中。

Laravel 通过同一个可读性强的 API 处理各种自带的后台驱动程序。支持诸如比较热门的[Memcached](https://memcached.org)、 [Redis](https://redis.io)和数据库。

<a name="configuration"></a>
### 配置

Session 的配置文件存储在`config/session.php`文件中。请务必查看此文件中对于你而言可用的选项。默认情况下，Laravel 为绝大多数应用程序配置的 Session 驱动为`file` 驱动，它适用于大多数程序。如果你的应用程序需要在多个 Web 服务器之间进行负载平衡，你应该选择一个所有服务器都可以访问的集中式存储，例如 Redis 或数据库。

Session`driver`的配置预设了每个请求存储 Session 数据的位置。Laravel 自带了几个不错而且开箱即用的驱动：

<div class="content-list" markdown="1">

- `file` - Sessions 存储在`storage/framework/sessions`。
- `cookie` - Sessions 被存储在安全加密的 cookie 中。
- `database` - Sessions 被存储在关系型数据库中。
- `memcached` / `redis` - Sessions 被存储在基于高速缓存的存储系统中。
- `dynamodb` - Sessions 被存储在 AWS DynamoDB 中。
- `array` - Sessions 存储在 PHP 数组中，但不会被持久化。

</div>

> **技巧**  
> 数组驱动一般用于[测试](/docs/laravel/10.x/testing)并且防止存储在 Session 中的数据被持久化。



<a name="driver-prerequisites"></a>
### 驱动先决条件

<a name="database"></a>
#### 数据库

使用`database`Session 驱动时，你需要创建一个记录 Session 的表。下面是`Schema`的声明示例：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::create('sessions', function (Blueprint $table) {
        $table->string('id')->primary();
        $table->foreignId('user_id')->nullable()->index();
        $table->string('ip_address', 45)->nullable();
        $table->text('user_agent')->nullable();
        $table->text('payload');
        $table->integer('last_activity')->index();
    });

你可以使用 Artisan 命令`session:table`生成这个迁移。了解更多数据库迁移，请查看完整的文档[迁移文档](/docs/laravel/10.x/migrations):

```shell
php artisan session:table

php artisan migrate
```

<a name="redis"></a>
#### Redis

在 Laravel 使用 Redis Session 驱动前，你需要安装 PhpRedis PHP 扩展，可以通过 PECL 或者 通过 Composer 安装这个`predis/predis`包 (~1.0)。更多关于 Redis 配置信息，查询 Laravel 的 [Redis 文档](/docs/laravel/10.x/redis#configuration).

> **技巧**  
> 在`session`配置文件里，`connection`选项可以用来设置 Session 使用 Redis 连接方式。

<a name="interacting-with-the-session"></a>
## 使用 Session

<a name="retrieving-data"></a>
### 获取数据

在 Laravel 中有两种基本的 Session 使用方式：全局`session`助手函数和通过`Request`实例。首先看下通过`Request`实例访问 Session , 它可以隐式绑定路由闭包或者控制器方法。记住，Laravel 会自动注入控制器方法的依赖。[服务容器](/docs/laravel/10.x/container)：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 显示指定用户个人资料。
         */
        public function show(Request $request, string $id): View
        {
            $value = $request->session()->get('key');

            // ...

            $user = $this->users->find($id);

            return view('user.profile', ['user' => $user]);
        }
    }



当你从 Session 获取数据时，你也可以在`get`方法第二个参数里传递一个 default 默认值，如果 Session 里不存在键值对 key 的数据结果，这个默认值就会返回。如果你传递给`get`方法一个闭包作为默认值，这个闭包会被执行并且返回结果：

    $value = $request->session()->get('key', 'default');

    $value = $request->session()->get('key', function () {
        return 'default';
    });

<a name="the-global-session-helper"></a>
#### 全局 Session 助手函数

你也可以在 Session 里使用 PHP 全局`session`函数获取和储存数据。当这个`session`函数以一个单独的字符串形式被调用时，它将会返回这个 Session 键值对的结果。当函数以 key / value 数组形式被调用时，这些值会被存储在 Session 里：

    Route::get('/home', function () {
        // 从 Session 获取数据 ...
        $value = session('key');

        // 设置默认值...
        $value = session('key', 'default');

        // 在Session 里存储一段数据 ...
        session(['key' => 'value']);
    });

> **技巧**  
> 通过 HTTP 请求实例与通过`session`助手函数方式使用 Session 之间没有实际区别。两种方式都是[可的测试](/docs/laravel/10.x/testing)，你所有的测试用例中都可以通过 `assertSessionHas`方法进行断言。

<a name="retrieving-all-session-data"></a>
#### 获取所有 Session 数据

如果你想要从 Session 里获取所有数据，你可以使用`all`方法：

    $data = $request->session()->all();



<a name="determining-if-an-item-exists-in-the-session"></a>
#### 判断 Session 里是否存在条目

判断 Session 里是否存在一个条目，你可以使用`has`方法。如果条目存在`has`，方法返回`true`不存在则返回`null`：

    if ($request->session()->has('users')) {
        // ...
    }

判断 Session 里是否存在一个即使结果值为`null`的条目，你可以使用`exists`方法：

    if ($request->session()->exists('users')) {
        // ...
    }

要确定某个条目是否在会话中不存在，你可以使用 `missing`方法。如果条目不存在，`missing`方法返回`true`：

    if ($request->session()->missing('users')) {
        // ...
    }

<a name="storing-data"></a>
### 存储数据

Session 里存储数据，你通常将使用 Request 实例中的`put`方法或者`session`助手函数：

    // 通过 Request 实例存储 ...
    $request->session()->put('key', 'value');

    // 通过全局 Session 助手函数存储 ...
    session(['key' => 'value']);

<a name="pushing-to-array-session-values"></a>
#### Session 存储数组

`push`方法可以把一个新值推入到以数组形式存储的 session 值里。例如：如果`user.teams`键值对有一个关于团队名字的数组，你可以推入一个新值到这个数组里：

    $request->session()->push('user.teams', 'developers');

<a name="retrieving-deleting-an-item"></a>
#### 获取 & 删除条目

`pull`方法会从 Session 里获取并且删除一个条目，只需要一步如下：

    $value = $request->session()->pull('key', 'default');

<a name="#incrementing-and-decrementing-session-values"></a>
#### 递增 / 递减会话值



如果你的 Session 数据里有整形你希望进行加减操作，可以使用`increment`和`decrement`方法：

    $request->session()->increment('count');

    $request->session()->increment('count', $incrementBy = 2);

    $request->session()->decrement('count');

    $request->session()->decrement('count', $decrementBy = 2);

<a name="flash-data"></a>
### 闪存数据

有时你可能想在 Session 里为下次请求存储一些条目。你可以使用`flash`方法。使用这个方法，存储在 Session 的数据将立即可用并且会保留到下一个 HTTP 请求期间，之后会被删除。闪存数据主要用于短期的状态消息：

    $request->session()->flash('status', 'Task was successful!');

如果你需要为多次请求持久化闪存数据，可以使用`reflash`方法，它会为一个额外的请求保持住所有的闪存数据，如果你仅需要保持特定的闪存数据，可以使用`keep`方法：

    $request->session()->reflash();

    $request->session()->keep(['username', 'email']);

如果你仅为了当前的请求持久化闪存数据，可以使用`now` 方法：

    $request->session()->now('status', 'Task was successful!');

<a name="deleting-data"></a>
### 删除数据

`forget`方法会从 Session 删除一些数据。如果你想删除所有 Session 数据，可以使用`flush`方法：

    // 删除一个单独的键值对 ...
    $request->session()->forget('name');

    // 删除多个 键值对 ...
    $request->session()->forget(['name', 'status']);

    $request->session()->flush();



<a name="regenerating-the-session-id"></a>
### 重新生成 Session ID

重新生成 Session ID 经常被用来阻止恶意用户使用 [session fixation](https://owasp.org/www-community/attacks/Session_fixation) 攻击你的应用。

如果你正在使用[入门套件](/docs/laravel/10.x/starter-kits)或 [Laravel Fortify](/docs/laravel/10.x/fortify)中的任意一种， Laravel 会在认证阶段自动生成 Session ID；然而如果你需要手动重新生成 Session ID ，可以使用`regenerate`方法：

    $request->session()->regenerate();

如果你需要重新生成 Session ID 并同时删除所有 Session 里的数据，可以使用`invalidate`方法：

    $request->session()->invalidate();

<a name="session-blocking"></a>
## Session 阻塞

> **注意**  
> 应用 Session 阻塞功能，你的应用必须使用一个支持[原子锁 ](/docs/laravel/10.x/cache#atomic-locks)的缓存驱动。目前，可用的缓存驱动有`memcached`、 `dynamodb`、 `redis`和`database`等。另外，你可能不会使用`cookie` Session 驱动。

默认情况下，Laravel 允许使用同一 Session 的请求并发地执行，举例来说，如果你使用一个 JavaScript HTTP 库向你的应用执行两次 HTTP 请求，它们将同时执行。对多数应用这不是问题，然而 在一小部分应用中可能出现 Session 数据丢失，这些应用会向两个不同的应用端并发请求，并同时写入数据到 Session。

为了解决这个问题，Laravel 允许你限制指定 Session 的并发请求。首先，你可以在路由定义时使用`block`链式方法。在这个示例中，一个到`/profile`的路由请求会拿到一把 Session 锁。当它处在锁定状态时，任何使用相同 Session ID 的到`/profile`或`/order`的路由请求都必须等待，直到第一个请求处理完成后再继续执行：

    Route::post('/profile', function () {
        // ...
    })->block($lockSeconds = 10, $waitSeconds = 10)

    Route::post('/order', function () {
        // ...
    })->block($lockSeconds = 10, $waitSeconds = 10)



`block`方法接受两个可选参数。`block`方法接受的第一个参数是 Session 锁释放前应该持有的最大秒数。当然，如果请求在此时间之前完成执行，锁将提前释放。

`block`方法接受的第二个参数是请求在试图获得 Session 锁时应该等待的秒数。如果请求在给定的秒数内无法获得会话锁，将抛出`Illuminate\Contracts\Cache\LockTimeoutException`异常。

如果不传参，那么 Session 锁默认锁定最大时间是 10 秒，请求锁最大的等待时间也是 10 秒：

    Route::post('/profile', function () {
        // ...
    })->block()

<a name="adding-custom-session-drivers"></a>
## 添加自定义 Session 驱动

<a name="implementing-the-driver"></a>
#### 实现驱动

如果现存的 Session 驱动不能满足你的需求，Laravel 允许你自定义 Session Handler。你的自定义驱动应实现 PHP 内置的`SessionHandlerInterface`。这个接口仅包含几个方法。以下是 MongoDB 驱动实现的代码片段：

    <?php

    namespace App\Extensions;

    class MongoSessionHandler implements \SessionHandlerInterface
    {
        public function open($savePath, $sessionName) {}
        public function close() {}
        public function read($sessionId) {}
        public function write($sessionId, $data) {}
        public function destroy($sessionId) {}
        public function gc($lifetime) {}
    }

> **技巧**  
> Laravel 没有内置存放扩展的目录，你可以放置在任意目录下，这个示例里，我们创建了一个`Extensions`目录存放`MongoSessionHandler`。



由于这些方法的含义并非通俗易懂，因此我们快速浏览下每个方法：

<div class="content-list" markdown="1">

- `open`方法通常用于基于文件的 Session 存储系统。因为 Laravel 附带了一个`file`  Session 驱动。你无须在里面写任何代码。可以简单地忽略掉。
- `close`方法跟`open`方法很像，通常也可以忽略掉。对大多数驱动来说，它不是必须的。
- `read` 方法应返回与给定的`$sessionId`关联的 Session 数据的字符串格式。在你的驱动中获取或存储 Session 数据时，无须作任何序列化和编码的操作，Laravel 会自动为你执行序列化。
- `write`方法将与`$sessionId`关联的给定的`$data`字符串写入到一些持久化存储系统，如 MongoDB 或者其他你选择的存储系统。再次，你无须进行任何序列化操作，Laravel 会自动为你处理。
- `destroy`方法应可以从持久化存储中删除与`$sessionId`相关联的数据。
- `gc`方法应可以销毁给定的`$lifetime`（UNIX 时间戳格式 ）之前的所有 Session 数据。对于像 Memcached 和 Redis 这类拥有过期机制的系统来说，本方法可以置空。

</div>

<a name="registering-the-driver"></a>
#### 注册驱动

一旦你的驱动实现了，需要注册到 Laravel 。在 Laravel 中添加额外的驱动到 Session 后端 ，你可以使用`Session` [Facade](/docs/laravel/10.x/facades) 提供的`extend`方法。你应该在[服务提供者](/docs/laravel/10.x/providers)中的`boot`方法中调用`extend`方法。可以通过已有的`App\Providers\AppServiceProvider`或创建一个全新的服务提供者执行此操作：

    <?php

    namespace App\Providers;

    use App\Extensions\MongoSessionHandler;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Support\Facades\Session;
    use Illuminate\Support\ServiceProvider;

    class SessionServiceProvider extends ServiceProvider
    {
        /**
         * 注册任意应用服务。
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 启动任意应用服务。
         */
        public function boot(): void
        {
            Session::extend('mongo', function (Application $app) {
                // 返回一个 SessionHandlerInterface 接口的实现 ...
                return new MongoSessionHandler;
            });
        }
    }



一旦 Session 驱动注册完成，就可以在`config/session.php`配置文件选择使用`mongo` 驱动。

