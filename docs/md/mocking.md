
# Mocking

- [简介](#introduction)
- [模拟对象](#mocking-objects)
- [模拟 Facades](#mocking-facades)
    - [Facade Spies](#facade-spies)
- [设置时间](#interacting-with-time)

<a name="introduction"></a>
## 介绍

在 Laravel 应用程序测试中，你可能希望「模拟」应用程序的某些功能的行为，从而避免该部分在测试中真正执行。例如：在控制器执行过程中会触发事件，您可能希望模拟事件监听器，从而避免该事件在测试时真正执行。这允许你在仅测试控制器 HTTP 响应的情况时，而不必担心触发事件，因为事件侦听器可以在它们自己的测试用例中进行测试。

Laravel 针对事件、任务和 Facades 的模拟，提供了开箱即用的辅助函数。这些函数基于 `Mockery` 封装而成，使用非常方便，无需手动调用复杂的 `Mockery` 函数。

<a name="mocking-objects"></a>
## 模拟对象

当模拟一个对象将通过 Laravel 的 [服务容器](/docs/laravel/10.x/container) 注入到应用中时，你将需要将模拟实例作为 `instance` 绑定到容器中。这将告诉容器使用对象的模拟实例，而不是构造对象的本身：

    use App\Service;
    use Mockery;
    use Mockery\MockInterface;

    public function test_something_can_be_mocked(): void
    {
        $this->instance(
            Service::class,
            Mockery::mock(Service::class, function (MockInterface $mock) {
                $mock->shouldReceive('process')->once();
            })
        );
    }

为了让以上过程更便捷，你可以使用 Laravel 的基本测试用例类提供的 `mock` 方法。例如，下面的例子跟上面的例子的执行效果是一样的：

    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->mock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });



当你只需要模拟对象的几个方法时，可以使用 `partialMock` 方法。 未被模拟的方法将在调用时正常执行：

    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->partialMock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });

同样，如果你想 [监控](http://docs.mockery.io/en/latest/reference/spies.html) 一个对象，Laravel 的基本测试用例类提供了一个便捷的 `spy` 方法作为 `Mockery::spy` 的替代方法。`spies` 与模拟类似。但是，`spies` 会记录 `spy` 与被测试代码之间的所有交互，从而允许您在执行代码后做出断言：

    use App\Service;

    $spy = $this->spy(Service::class);

    // ...

    $spy->shouldHaveReceived('process');

<a name="mocking-facades"></a>
## Facades 模拟

与传统静态方法调用不同的是，[facades](/docs/laravel/10.x/facades) (包含的 [real-time facades](/docs/laravel/10.x/facades#real-time-facades)) 也可以被模拟。相较传统的静态方法而言，它具有很大的优势，同时提供了与传统依赖注入相同的可测试性。在测试中，你可能想在控制器中模拟对 Laravel Facade 的调用。比如下面控制器中的行为：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * 显示该应用程序的所有用户的列表。
         */
        public function index(): array
        {
            $value = Cache::get('key');

            return [
                // ...
            ];
        }
    }

我们可以使用 `shouldReceive` 方法模拟对 `Cache` Facade 的调用，该方法将返回一个 [Mockery](https://github.com/padraic/mockery) 模拟的实例。由于 Facades 实际上是由 Laravel [服务容器](/docs/laravel/10.x/container) 解析和管理的，因此它们比传统的静态类具有更好的可测试性。例如，让我们模拟对 `Cache` Facade 的 `get` 方法的调用：

    <?php

    namespace Tests\Feature;

    use Illuminate\Support\Facades\Cache;
    use Tests\TestCase;

    class UserControllerTest extends TestCase
    {
        public function test_get_index(): void
        {
            Cache::shouldReceive('get')
                        ->once()
                        ->with('key')
                        ->andReturn('value');

            $response = $this->get('/users');

            // ...
        }
    }

> **注意**
> 你不应该模拟 `Request` facade。相反，在运行测试时将你想要的输入传递到 [HTTP 测试方法](/docs/laravel/10.x/http-tests) 中，例如 `get` 和 `post` 方法。同样也不要模拟 `Config` facade，而是在测试中调用 `Config::set` 方法。


<a name="facade-spies"></a>
### Facade Spies

如果你想 [监控](http://docs.mockery.io/en/latest/reference/spies.html) 一个 facade，你可以在相应的 facade 上调用 `spy` 方法。`spies` 类似于 `mocks`；但是，`spies` 会记录 `spy` 和被测试代码之间的所有交互，允许你在代码执行后做出断言：

    use Illuminate\Support\Facades\Cache;

    public function test_values_are_be_stored_in_cache(): void
    {
        Cache::spy();

        $response = $this->get('/');

        $response->assertStatus(200);

        Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
    }

<a name="interacting-with-time"></a>
## 设置时间

当我们测试时，有时可能需要修改诸如 `now` 或 `Illuminate\Support\Carbon::now()` 之类的助手函数返回的时间。 Laravel 的基本功能测试类包中包含了一些助手函数，可以让你设置当前时间：

    use Illuminate\Support\Carbon;

    public function test_time_can_be_manipulated(): void
    {
        // 设置未来的时间...
        $this->travel(5)->milliseconds();
        $this->travel(5)->seconds();
        $this->travel(5)->minutes();
        $this->travel(5)->hours();
        $this->travel(5)->days();
        $this->travel(5)->weeks();
        $this->travel(5)->years();

        // 设置过去的时间...
        $this->travel(-5)->hours();

        // 设置一个确切的时间...
        $this->travelTo(now()->subHours(6));

        // 返回现在的时间...
        $this->travelBack();
    }

你还可以为各种设置时间方法写一个闭包。闭包将在指定的时间被冻结调用。一旦闭包执行完毕，时间将恢复正常:

    $this->travel(5)->days(function () {
        // 在5天之后测试...
    });
    
    $this->travelTo(now()->subDays(10), function () {
        // 在指定的时间测试...
    });



`freezeTime` 方法可用于冻结当前时间。与之类似地，`freezeSecond` 方法也可以秒为单位冻结当前时间：

    use Illuminate\Support\Carbon;

    // 冻结时间并在完成后恢复正常时间...
    $this->freezeTime(function (Carbon $time) {
        // ...
    });

    // 冻结以秒为单位的时间并在完成后恢复正常时间...
    $this->freezeSecond(function (Carbon $time) {
        // ...
    })

正如你期望的一样，上面讨论的所有方法都主要用于测试对时间敏感的应用程序的行为，比如锁定论坛上不活跃的帖子:

    use App\Models\Thread;
    
    public function test_forum_threads_lock_after_one_week_of_inactivity()
    {
        $thread = Thread::factory()->create();
        
        $this->travel(1)->week();
        
        $this->assertTrue($thread->isLockedByInactivity());
    }

