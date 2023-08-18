# Facades

- [简介](#introduction)
- [何时使用 Facades](#when-to-use-facades)
    - [Facades Vs 依赖注入](#facades-vs-dependency-injection)
    - [Facades Vs 助手函数](#facades-vs-helper-functions)
- [Facades 工作原理](#how-facades-work)
- [实时 Facades](#real-time-facades)
- [Facade 参考类](#facade-class-reference)

<a name="introduction"></a>
## 简介

在整个 Laravel 文档中，你将看到通过 Facades 与 Laravel 特性交互的代码示例。Facades 为应用程序的[服务容器](/docs/laravel/10.x/container)中可用的类提供了「静态代理」。在 Laravel 这艘船上有许多 Facades，提供了几乎所有 Laravel 的特征。

Laravel Facades 充当服务容器中底层类的「静态代理」，提供简洁、富有表现力的好处，同时保持比传统静态方法更多的可测试性和灵活性。如果你不完全理解引擎盖下的 Facades 是如何工作的，那也没问题，跟着流程走，继续学习 Laravel。

Laravel 的所有 Facades 都在`Illuminate\Support\Facades`命名空间中定义。因此，我们可以很容易地访问这样一个 Facades ：

    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Facades\Route;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

在整个 Laravel 文档中，许多示例将使用 Facades 来演示框架的各种特性。

<a name="helper-functions"></a>
#### 辅助函数

为了补充 Facades，Laravel 提供了各种全局 「助手函数」，使它更容易与常见的 Laravel 功能进行交互。可以与之交互的一些常用助手函数有`view`, `response`, `url`, `config`等。Laravel 提供的每个助手函数都有相应的特性；但是，在专用的[辅助函数文档](/docs/laravel/10.x/helpers)中有一个完整的列表。



例如，我们可以使用 `response` 函数而不是 `Illuminate\Support\Facades\Response` Facade 生成 JSON 响应。由于「助手函数」是全局可用的，因此无需导入任何类即可使用它们：

```php
use Illuminate\Support\Facades\Response;

Route::get('/users', function () {
    return Response::json([
        // ...
    ]);
});

Route::get('/users', function () {
    return response()->json([
        // ...
    ]);
});
```

<a name="when-to-use-facades"></a>

## 何时使用 Facades

Facades 有很多好处。它们提供了简洁、易记的语法，让你可以使用 Laravel 的功能而不必记住必须手动注入或配置的长类名。此外，由于它们独特地使用了 PHP 的动态方法，因此它们易于测试。

然而，在使用 Facades 时必须小心。Facades 的主要危险是类的「作用域泄漏」。由于 Facades 如此易于使用并且不需要注入，因此让你的类继续增长并在单个类中使用许多 Facades 可能很容易。使用依赖注入，这种潜在问题通过构造函数变得明显，告诉你的类过于庞大。因此，在使用 Facades 时，需要特别关注类的大小，以便它的责任范围保持狭窄。如果你的类变得太大，请考虑将它拆分成多个较小的类。

<a name="facades-vs-dependency-injection"></a>

### Facades 与 依赖注入

依赖注入的主要好处之一是能够替换注入类的实现。这在测试期间很有用，因为你可以注入一个模拟或存根并断言各种方法是否在存根上调用了。

通常，真正的静态方法是不可能 mock 或 stub 的。无论如何，由于 Facades 使用动态方法对服务容器中解析出来的对象方法的调用进行了代理， 我们也可以像测试注入类实例一样测试 Facades。比如，像下面的路由：

    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

使用 Laravel 的 Facade 测试方法，我们可以编写以下测试用例来验证是否 Cache::get 使用我们期望的参数调用了该方法：

    use Illuminate\Support\Facades\Cache;

    /**
     *  一个基础功能的测试用例
     */
    public function test_basic_example(): void
    {
        Cache::shouldReceive('get')
             ->with('key')
             ->andReturn('value');

        $response = $this->get('/cache');

        $response->assertSee('value');
    }

<a name="facades-vs-helper-functions"></a>
### Facades Vs 助手函数

除了 Facades，Laravel 还包含各种「辅助函数」来实现这些常用功能，比如生成视图、触发事件、任务调度或者发送 HTTP 响应。许多辅助函数都有与之对应的 Facade。例如，下面这个 Facades 和辅助函数的作用是一样的：

    return Illuminate\Support\Facades\View::make('profile');

    return view('profile');

Facades 和辅助函数之间没有实际的区别。 当你使用辅助函数时，你可以像测试相应的 Facade 那样进行测试。例如，下面的路由：

    Route::get('/cache', function () {
        return cache('key');
    });

在底层实现，辅助函数 cache 实际是调用 Cache 这个 Facade 的 get 方法。因此，尽管我们使用的是辅助函数，我们依然可以带上我们期望的参数编写下面的测试代码来验证该方法：

    use Illuminate\Support\Facades\Cache;

    /**
     * 一个基础功能的测试用例
     */
    public function test_basic_example(): void
    {
        Cache::shouldReceive('get')
             ->with('key')
             ->andReturn('value');

        $response = $this->get('/cache');

        $response->assertSee('value');
    }



<a name="how-facades-work"></a>
## Facades 工作原理

在 Laravel 应用程序中，Facades 是一个提供从容器访问对象的类。完成这项工作的部分属于 `Facade` 类。Laravel 的 Facade、以及你创建的任何自定义 Facade，都继承自 `Illuminate\Support\Facades\Facade` 类。

`Facade` 基类使用 `__callStatic()` 魔术方法将来自 Facade 的调用推迟到从容器解析出对象后。在下面的示例中，调用了 Laravel 缓存系统。看一眼这段代码，人们可能会假设静态的 `get` 方法正在 `Cache` 类上被调用：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         */
        public function showProfile(string $id): View
        {
            $user = Cache::get('user:'.$id);

            return view('profile', ['user' => $user]);
        }
    }

请注意，在文件顶部附近，我们正在「导入」`Cache` Facade。这个 Facade 作为访问 `Illuminate\Contracts\Cache\Factory` 接口底层实现的代理。我们使用 Facade 进行的任何调用都将传递给 Laravel 缓存服务的底层实例。

如果我们查看 `Illuminate\Support\Facades\Cache` 类，你会发现没有静态方法 `get`：

    class Cache extends Facade
    {
        /**
         * Get the registered name of the component.
         */
        protected static function getFacadeAccessor(): string
        {
            return 'cache';
        }
    }

相反，`Cache` Facade 继承了 `Facade` 基类并定义了 `getFacadeAccessor()` 方法。此方法的工作是返回服务容器绑定的名称。当用户引用 `Cache` Facade 上的任何静态方法时，Laravel 会从 [服务容器](/docs/laravel/10.x/container) 中解析 `cache` 绑定并运行该对象请求的方法（在这个例子中就是 `get` 方法）



<a name="real-time-facades"></a>
## 实时 Facades

使用实时 Facade, 你可以将应用程序中的任何类视为 Facade。为了说明这是如何使用的， 让我们首先看一下一些不使用实时 Facade 的代码。例如，假设我们的 `Podcast` 模型有一个 `publish 方法`。 但是，为了发布 `Podcast`，我们需要注入一个 `Publisher` 实例：

    <?php

    namespace App\Models;

    use App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
         */
        public function publish(Publisher $publisher): void
        {
            $this->update(['publishing' => now()]);

            $publisher->publish($this);
        }
    }

将 publisher 的实现注入到该方法中，我们可以轻松地测试这种方法，因为我们可以模拟注入的 publisher 。但是，它要求我们每次调用 `publish` 方法时始终传递一个 publisher 实例。 使用实时的 Facades, 我们可以保持同样的可测试性，而不需要显式地通过 `Publisher` 实例。要生成实时 Facade，请在导入类的名称空间中加上 `Facades`：

    <?php

    namespace App\Models;

    use Facades\App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
         */
        public function publish(): void
        {
            $this->update(['publishing' => now()]);

            Publisher::publish($this);
        }
    }

当使用实时 Facade 时， publisher 实现将通过使用 `Facades` 前缀后出现的接口或类名的部分来解决服务容器的问题。在测试时，我们可以使用 Laravel 的内置 Facade 测试辅助函数来模拟这种方法调用：

    <?php

    namespace Tests\Feature;

    use App\Models\Podcast;
    use Facades\App\Contracts\Publisher;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Tests\TestCase;

    class PodcastTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * A test example.
         */
        public function test_podcast_can_be_published(): void
        {
            $podcast = Podcast::factory()->create();

            Publisher::shouldReceive('publish')->once()->with($podcast);

            $podcast->publish();
        }
    }



<a name="facade-class-reference"></a>
## Facade 类参考

在下面你可以找到每个 facade 类及其对应的底层类。这是一个快速查找给定 facade 类的 API 文档的工具。[服务容器绑定](/docs/laravel/10.x/container) 的关键信息也包含在内。

<div class="overflow-auto">

Facade  |  Class  |  Service Container Binding|
------------- | ------------- | -------------|
App  |  [Illuminate\Foundation\Application](https://laravel.com/api/10.x/Illuminate/Foundation/Application.html)  |  `app`|
Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/10.x/Illuminate/Contracts/Console/Kernel.html)  |  `artisan`|
Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/10.x/Illuminate/Auth/AuthManager.html)  |  `auth`|
Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/10.x/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver`|
Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/10.x/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler`|
Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/10.x/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp;|
Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/10.x/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp;|
Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/10.x/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp;|
Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/10.x/Illuminate/Cache/CacheManager.html)  |  `cache`|
Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/10.x/Illuminate/Cache/Repository.html)  |  `cache.store`|
Config  |  [Illuminate\Config\Repository](https://laravel.com/api/10.x/Illuminate/Config/Repository.html)  |  `config`|
Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/10.x/Illuminate/Cookie/CookieJar.html)  |  `cookie`|
Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/10.x/Illuminate/Encryption/Encrypter.html)  |  `encrypter`|
Date  |  [Illuminate\Support\DateFactory](https://laravel.com/api/10.x/Illuminate/Support/DateFactory.html)  |  `date`|
DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/10.x/Illuminate/Database/DatabaseManager.html)  |  `db`|
DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/10.x/Illuminate/Database/Connection.html)  |  `db.connection`|
Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/10.x/Illuminate/Events/Dispatcher.html)  |  `events`|
File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/10.x/Illuminate/Filesystem/Filesystem.html)  |  `files`|
Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/10.x/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp;|
Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/10.x/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash`|
Http  |  [Illuminate\Http\Client\Factory](https://laravel.com/api/10.x/Illuminate/Http/Client/Factory.html)  |  &nbsp;|
Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/10.x/Illuminate/Translation/Translator.html)  |  `translator`|
Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/10.x/Illuminate/Log/LogManager.html)  |  `log`|
Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/10.x/Illuminate/Mail/Mailer.html)  |  `mailer`|
Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/10.x/Illuminate/Notifications/ChannelManager.html)  |  &nbsp;|
Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/10.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password`|
Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/10.x/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker`|
Pipeline (Instance)  |  [Illuminate\Pipeline\Pipeline](https://laravel.com/api/10.x/Illuminate/Pipeline/Pipeline.html)  |  &nbsp;|
Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/10.x/Illuminate/Queue/QueueManager.html)  |  `queue`|
Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/10.x/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection`|
Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/10.x/Illuminate/Queue/Queue.html)  |  &nbsp;|
Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/10.x/Illuminate/Routing/Redirector.html)  |  `redirect`|
Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/10.x/Illuminate/Redis/RedisManager.html)  |  `redis`|
Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/10.x/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection`|
Request  |  [Illuminate\Http\Request](https://laravel.com/api/10.x/Illuminate/Http/Request.html)  |  `request`|
Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/10.x/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp;|
Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/10.x/Illuminate/Http/Response.html)  |  &nbsp;|
Route  |  [Illuminate\Routing\Router](https://laravel.com/api/10.x/Illuminate/Routing/Router.html)  |  `router`|
Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/10.x/Illuminate/Database/Schema/Builder.html)  |  &nbsp;|
Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/10.x/Illuminate/Session/SessionManager.html)  |  `session`|
Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/10.x/Illuminate/Session/Store.html)  |  `session.store`|
Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/10.x/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem`|
Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/10.x/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk`|
URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/10.x/Illuminate/Routing/UrlGenerator.html)  |  `url`|
Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/10.x/Illuminate/Validation/Factory.html)  |  `validator`|
Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/10.x/Illuminate/Validation/Validator.html)  |  &nbsp;|
View  |  [Illuminate\View\Factory](https://laravel.com/api/10.x/Illuminate/View/Factory.html)  |  `view`|
View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/10.x/Illuminate/View/View.html)  |  &nbsp;|
Vite  |  [Illuminate\Foundation\Vite](https://laravel.com/api/10.x/Illuminate/Foundation/Vite.html)  |  &nbsp;|

</div>

