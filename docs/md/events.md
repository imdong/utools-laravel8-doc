# 事件系统
- [介绍](#introduction)
- [注册事件和监听器](#registering-events-and-listeners)
    - [生成事件和监听器](#generating-events-and-listeners)
    - [手动注册事件](#manually-registering-events)
    - [事件发现](#event-discovery)
- [定义事件](#defining-events)
- [定义监听器](#defining-listeners)
- [队列事件监听器](#queued-event-listeners)
    - [手动与队列交互](#manually-interacting-with-the-queue)
    - [队列事件监听器和数据库事务](#queued-event-listeners-and-database-transactions)
    - [处理失败的队列](#handling-failed-jobs)
- [调度事件](#dispatching-events)
- [事件订阅者](#event-subscribers)
    - [编写事件订阅者](#writing-event-subscribers)
    - [注册事件订阅者](#registering-event-subscribers)
- [测试](#testing)
    - [模拟一部分事件](#faking-a-subset-of-events)
    - [作用域事件模拟](#scoped-event-fakes)

<a name="introduction"></a>
## 介绍

Laravel 的事件系统提供了一个简单的观察者模式的实现，允许你能够订阅和监听在你的应用中的发生的各种事件。事件类一般来说存储在 `app/Events` 目录，监听者的类存储在 `app/Listeners` 目录。不要担心在你的应用中没有看到这两个目录，因为通过 Artisan 命令行来创建事件和监听者的时候目录会同时被创建。

事件系统可以作为一个非常棒的方式来解耦你的系统的方方面面，因为一个事件可以有多个完全不相关的监听者。例如，你希望每当有订单发出的时候都给你发送一个 Slack 通知。你大可不必将你的处理订单的代码和发送 slack 消息的代码放在一起，你只需要触发一个 App\Events\OrderShipped 事件，然后事件监听者可以收到这个事件然后发送 slack 通知

<a name="registering-events-and-listeners"></a>
## 注册事件和监听器

在系统的服务提供者 `App\Providers\EventServiceProvider` 中提供了一个简单的方式来注册你所有的事件监听者。属性 `listen` 包含所有的事件 (作为键) 和对应的监听器 (值)。你可以添加任意多系统需要的监听器在这个数组中，让我们添加一个 `OrderShipped` 事件：

    use App\Events\OrderShipped;
    use App\Listeners\SendShipmentNotification;

    /**
     * 系统中的事件和监听器的对应关系。
     *
     * @var array
     */
    protected $listen = [
        OrderShipped::class => [
            SendShipmentNotification::class,
        ],
    ];

> **注意**
> 可以使用 `event:list` 命令显示应用程序


<a name="generating-events-and-listeners"></a>
### 生成事件和监听器

当然，为每个事件和监听器手动创建文件是很麻烦的。相反，将监听器和事件添加到 `EventServiceProvider` 并使用 `event:generate` Artisan 命令。此命令将生成 `EventServiceProvider` 中列出的、尚不存在的任何事件或侦听器：

```shell
php artisan event:generate
```

或者，你可以使用 `make:event` 以及 `make:listener` 用于生成单个事件和监听器的 Artisan 命令：

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

<a name="manually-registering-events"></a>
### 手动注册事件

通常，事件应该通过 `EventServiceProvider` `$listen` 数组注册；但是，你也可以在 `EventServiceProvider` 的 `boot` 方法中手动注册基于类或闭包的事件监听器：

    use App\Events\PodcastProcessed;
    use App\Listeners\SendPodcastNotification;
    use Illuminate\Support\Facades\Event;

    /**
     * 注册任意的其他事件和监听器。
     */
    public function boot(): void
    {
        Event::listen(
            PodcastProcessed::class,
            [SendPodcastNotification::class, 'handle']
        );

        Event::listen(function (PodcastProcessed $event) {
            // ...
        });
    }

<a name="queuable-anonymous-event-listeners"></a>
#### 可排队匿名事件监听器

手动注册基于闭包的事件监听器时，可以将监听器闭包包装在 `Illuminate\Events\queueable` 函数中，以指示 Laravel 使用 [队列](/docs/laravel/10.x/queues) 执行侦听器：

    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;

    /**
     * 注册任意的其他事件和监听器。
     */
    public function boot(): void
    {
        Event::listen(queueable(function (PodcastProcessed $event) {
            // ...
        }));
    }

与队列任务一样，可以使用 `onConnection`、`onQueue` 和 `delay` 方法自定义队列监听器的执行：

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));



如果你想处理匿名队列监听器失败，你可以在定义 `queueable` 监听器时为 `catch` 方法提供一个闭包。这个闭包将接收导致监听器失败的事件实例和 `Throwable` 实例：

    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;
    use Throwable;

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->catch(function (PodcastProcessed $event, Throwable $e) {
        // 队列监听器失败了
    }));

<a name="wildcard-event-listeners"></a>
#### 通配符事件监听器

你甚至可以使用 `*` 作为通配符参数注册监听器，这允许你在同一个监听器上捕获多个事件。通配符监听器接收事件名作为其第一个参数，整个事件数据数组作为其第二个参数：

    Event::listen('event.*', function (string $eventName, array $data) {
        // ...
    });

<a name="event-discovery"></a>
### 事件的发现

你可以启用自动事件发现，而不是在 `EventServiceProvider` 的 `$listen` 数组中手动注册事件和侦听器。当事件发现启用，Laravel 将自动发现和注册你的事件和监听器扫描你的应用程序的 `Listeners` 目录。此外，在 `EventServiceProvider` 中列出的任何显式定义的事件仍将被注册。

Laravel 通过使用 PHP 的反射服务扫描监听器类来查找事件监听器。当 Laravel 发现任何以 `handle` 或 `__invoke` 开头的监听器类方法时，Laravel 会将这些方法注册为该方法签名中类型暗示的事件的事件监听器：

    use App\Events\PodcastProcessed;

    class SendPodcastNotification
    {
        /**
         * 处理给定的事件
         */
        public function handle(PodcastProcessed $event): void
        {
            // ...
        }
    }



事件发现在默认情况下是禁用的，但你可以通过重写应用程序的 `EventServiceProvider` 的 `shouldDiscoverEvents` 方法来启用它：

    /**
     * 确定是否应用自动发现事件和监听器。
     */
    public function shouldDiscoverEvents(): bool
    {
        return true;
    }

默认情况下，应用程序 `app/listeners` 目录中的所有监听器都将被扫描。如果你想要定义更多的目录来扫描，你可以重写 `EventServiceProvider` 中的 `discoverEventsWithin` 方法：

    /**
     * 获取应用于发现事件的监听器目录。
     *
     * @return array<int, string>
     */
    protected function discoverEventsWithin(): array
    {
        return [
            $this->app->path('Listeners'),
        ];
    }

<a name="event-discovery-in-production"></a>
#### 生产中的事件发现

在生产环境中，框架在每个请求上扫描所有监听器的效率并不高。因此，在你的部署过程中，你应该运行 `event:cache` Artisan 命令来缓存你的应用程序的所有事件和监听器清单。框架将使用该清单来加速事件注册过程。`event:clear` 命令可以用来销毁缓存。

<a name="defining-events"></a>
## 定义事件

事件类本质上是一个数据容器，它保存与事件相关的信息。例如，让我们假设一个 `App\Events\OrderShipped` 事件接收到一个 [Eloquent ORM](/docs/laravel/10.x/eloquent) 对象：

    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;

        /**
         * 创建一个新的事件实例。
         */
        public function __construct(
            public Order $order,
        ) {}
    }

如你所见，这个事件类不包含逻辑。它是一个被购买的 `App\Models\Order` 实例容器。 如果事件对象是使用 PHP 的 `SerializesModels` 函数序列化的，事件使用的 `SerializesModels` trait 将会优雅地序列化任何 Eloquent 模型，比如在使用 [队列侦听器](#queued-event-listeners)。


<a name="defining-listeners"></a>
## 定义监听器

接下来，让我们看一下示例事件的监听器。事件监听器在其 `handle` 方法中接收事件实例。Artisan 命令 `event:generate` 和 `make:listener` 会自动导入正确的事件类，并在 `handle` 方法上对事件进行类型提示。在 `handle` 方法中，你可以执行任何必要的操作来响应事件：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;

    class SendShipmentNotification
    {
        /**
         * 创建事件监听器
         */
        public function __construct()
        {
            // ...
        }

        /**
         * 处理事件
         */
        public function handle(OrderShipped $event): void
        {
            // 使用 $event->order 来访问订单 ...
        }
    }

> **技巧**
> 事件监听器还可以在构造函数中加入任何依赖关系的类型提示。所有的事件监听器都是通过 Laravel 的 [服务容器](/docs/laravel/10.x/container) 解析的，因此所有的依赖都将会被自动注入。

<a name="stopping-the-propagation-of-an-event"></a>
#### 停止事件传播

有时，你可能希望停止将事件传播到其他监听器。你可以通过从监听器的 `handle` 方法中返回 `false` 来做到这一点。

<a name="queued-event-listeners"></a>
## 队列事件监听器

如果你的监听器要执行一个缓慢的任务，如发送电子邮件或进行 HTTP 请求，那么队列化监听器就很有用了。在使用队列监听器之前，请确保 [配置你的队列](/docs/laravel/10.x/queues) 并在你的服务器或本地开发环境中启动一个队列 worker。

要指定监听器启动队列，请将 `ShouldQueue` 接口添加到监听器类。 由 Artisan 命令 `event:generate` 和 `make:listener` 生成的监听器已经将此接口导入当前命名空间，因此你可以直接使用：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        // ...
    }



就是这样！ 现在，当此监听器处理的事件被调度时，监听器将使用 Laravel 的 [队列系统](/docs/laravel/10.x/queues) 自动由事件调度器排队。 如果监听器被队列执行时没有抛出异常，队列中的任务处理完成后会自动删除。

<a name="customizing-the-queue-connection-queue-name"></a>
#### 自定义队列连接和队列名称

如果你想自定义事件监听器的队列连接、队列名称或队列延迟时间，可以在监听器类上定义 `$connection`、`$queue` 或 `$delay` 属性：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        /**
         * 任务发送到的连接的名称。
         *
         * @var string|null
         */
        public $connection = 'sqs';

        /**
         * 任务发送到的队列的名称。
         *
         * @var string|null
         */
        public $queue = 'listeners';

        /**
         * 处理作业前的时间（秒）。
         *
         * @var int
         */
        public $delay = 60;
    }

如果你想在运行时定义监听器的队列连接或队列名称，可以在监听器上定义 `viaConnection` 或 `viaQueue` 方法：

    /**
     * 获取侦听器的队列连接的名称。
     */
    public function viaConnection(): string
    {
        return 'sqs';
    }

    /**
     * 获取侦听器队列的名称。
     */
    public function viaQueue(): string
    {
        return 'listeners';
    }

<a name="conditionally-queueing-listeners"></a>
#### 有条件地队列监听器

有时，你可能需要根据一些仅在运行时可用的数据来确定是否应将侦听器排队。 为此，可以将「shouldQueue」方法添加到侦听器以确定是否应将侦听器排队。 如果 `shouldQueue` 方法返回 `false`，监听器将不会被执行：

    <?php

    namespace App\Listeners;

    use App\Events\OrderCreated;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class RewardGiftCard implements ShouldQueue
    {
        /**
         * 奖励客户一张礼品卡。
         */
        public function handle(OrderCreated $event): void
        {
            // ...
        }

        /**
         * 确定侦听器是否应排队。
         */
        public function shouldQueue(OrderCreated $event): bool
        {
            return $event->order->subtotal >= 5000;
        }
    }



<a name="manually-interacting-with-the-queue"></a>
### 手动与队列交互

如果你需要手动访问侦听器的底层队列作业的 delete 和 release 方法，可以使用 `Illuminate\Queue\InteractsWithQueue` 特性来实现。 这个 trait 默认导入生成的侦听器并提供对这些方法的访问：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * Handle the event.
         */
        public function handle(OrderShipped $event): void
        {
            if (true) {
                $this->release(30);
            }
        }
    }

<a name="queued-event-listeners-and-database-transactions"></a>
### 队列事件监听器和数据库事务

当排队的侦听器在数据库事务中被分派时，它们可能在数据库事务提交之前由队列处理。 发生这种情况时，在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。 此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。 如果你的侦听器依赖于这些模型，则在处理调度排队侦听器的作业时可能会发生意外错误。

如果你的队列连接的 `after_commit` 配置选项设置为 `false`，你仍然可以通过在侦听器类上定义 `$afterCommit` 属性来指示在提交所有打开的数据库事务后应该调度特定的排队侦听器：

    <?php

    namespace App\Listeners;

    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        public $afterCommit = true;
    }

> **注意**
> 要了解有关解决这些问题的更多信息，请查看有关[队列作业和数据库事务](/docs/laravel/10.x/queuesmd#jobs-and-database-transactions) 的文档。



<a name="handling-failed-jobs"></a>
### 处理失败的队列

有时队列的事件监听器可能会失败。如果排队的监听器超过了队列工作者定义的最大尝试次数，则将对监听器调用 `failed` 方法。`failed` 方法接收导致失败的事件实例和 `Throwable`：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Throwable;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * 事件处理。
         */
        public function handle(OrderShipped $event): void
        {
            // ...
        }

        /**
         * 处理失败任务。
         */
        public function failed(OrderShipped $event, Throwable $exception): void
        {
            // ...
        }
    }

<a name="specifying-queued-listener-maximum-attempts"></a>
#### 指定队列监听器的最大尝试次数

如果队列中的某个监听器遇到错误，你可能不希望它无限期地重试。因此，Laravel 提供了各种方法来指定监听器的尝试次数或尝试时间。

你可以在监听器类上定义 `$tries` 属性，以指定监听器在被认为失败之前可能尝试了多少次：

    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * 尝试队列监听器的次数。
         *
         * @var int
         */
        public $tries = 5;
    }

作为定义侦听器在失败之前可以尝试多少次的替代方法，你可以定义不再尝试侦听器的时间。这允许在给定的时间范围内尝试多次监听。若要定义不再尝试监听器的时间，请在你的监听器类中添加 `retryUntil` 方法。此方法应返回一个 `DateTime` 实例：

    use DateTime;

    /**
     * 确定监听器应该超时的时间。
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }



<a name="dispatching-events"></a>
## 调度事件

要分派一个事件，你可以在事件上调用静态的 `dispatch` 方法。这个方法是通过 `Illuminate\Foundation\Events\Dispatchable` 特性提供给事件的。 传递给 `dispatch` 方法的任何参数都将被传递给事件的构造函数：

    <?php

    namespace App\Http\Controllers;

    use App\Events\OrderShipped;
    use App\Http\Controllers\Controller;
    use App\Models\Order;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class OrderShipmentController extends Controller
    {
        /**
         * 运送给定的订单。
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // 订单出货逻辑...

            OrderShipped::dispatch($order);

            return redirect('/orders');
        }
    }

你可以使用 `dispatchIf` 和 `dispatchUnless` 方法根据条件分派事件：

    OrderShipped::dispatchIf($condition, $order);

    OrderShipped::dispatchUnless($condition, $order);

> **提示**  
> 在测试时，断言某些事件是在没有实际触发其侦听器的情况下被分派的，这可能会有所帮助。 Laravel 的 [内置助手](#testing) 让它变得很简单。

<a name="event-subscribers"></a>
## 事件订阅者

<a name="writing-event-subscribers"></a>
### 构建事件订阅者

事件订阅者是可以从订阅者类本身中订阅多个事件的类，允许你在单个类中定义多个事件处理程序。订阅者应该定义一个 `subscribe` 方法，它将被传递一个事件分派器实例。你可以在给定的分派器上调用 `listen` 方法来注册事件监听器：

    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * 处理用户登录事件。
         */
        public function handleUserLogin(string $event): void {}

        /**
         * 处理用户退出事件。
         */
        public function handleUserLogout(string $event): void {}

        /**
         * 为订阅者注册侦听器。
         */
        public function subscribe(Dispatcher $events): void
        {
            $events->listen(
                Login::class,
                [UserEventSubscriber::class, 'handleUserLogin']
            );

            $events->listen(
                Logout::class,
                [UserEventSubscriber::class, 'handleUserLogout']
            );
        }
    }



如果你的事件侦听器方法是在订阅者本身中定义的，你可能会发现从订阅者的「订阅」方法返回一组事件和方法名称会更方便。 Laravel 会在注册事件监听器时自动判断订阅者的类名：

    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * 处理用户登录事件。
         */
        public function handleUserLogin(string $event): void {}

        /**
         * 处理用户注销事件。
         */
        public function handleUserLogout(string $event): void {}

        /**
         * 为订阅者注册监听器。
         *
         * @return array<string, string>
         */
        public function subscribe(Dispatcher $events): array
        {
            return [
                Login::class => 'handleUserLogin',
                Logout::class => 'handleUserLogout',
            ];
        }
    }

<a name="registering-event-subscribers"></a>
### 注册事件订阅者

编写订阅者后，你就可以将其注册到事件调度程序。 可以使用 `EventServiceProvider` 上的 `$subscribe` 属性注册订阅者。 例如，让我们将 `UserEventSubscriber` 添加到列表中：

    <?php

    namespace App\Providers;

    use App\Listeners\UserEventSubscriber;
    use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

    class EventServiceProvider extends ServiceProvider
    {
        /**
         * The event listener mappings for the application.
         *
         * @var array
         */
        protected $listen = [
            // ...
        ];

        /**
         * The subscriber classes to register.
         *
         * @var array
         */
        protected $subscribe = [
            UserEventSubscriber::class,
        ];
    }

<a name="testing"></a>
## 测试

当测试分发事件的代码时，你可能希望指示 Laravel 不要实际执行事件的监听器，因为监听器的代码可以直接和分发相应事件的代码分开测试。 当然，要测试监听器本身，你可以实例化一个监听器实例并直接在测试中调用 handle 方法。



使用 `Event` 门面的 `fake` 方法，你可以阻止侦听器执行，执行测试代码，然后使用 `assertDispatched`、`assertNotDispatched` 和 `assertNothingDispatched` 方法断言你的应用程序分派了哪些事件：

    <?php

    namespace Tests\Feature;

    use App\Events\OrderFailedToShip;
    use App\Events\OrderShipped;
    use Illuminate\Support\Facades\Event;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 测试订单发货。
         */
        public function test_orders_can_be_shipped(): void
        {
            Event::fake();

            // 执行订单发货...

            // 断言事件已发送...
            Event::assertDispatched(OrderShipped::class);

            // 断言一个事件被发送了两次......
            Event::assertDispatched(OrderShipped::class, 2);

            // 断言事件未被发送...
            Event::assertNotDispatched(OrderFailedToShip::class);

            // 断言没有事件被发送...
            Event::assertNothingDispatched();
        }
    }

你可以将闭包传递给 `assertDispatched` 或 `assertNotDispatched` 方法，以断言已派发的事件通过了给定的「真实性测试」。 如果至少发送了一个通过给定真值测试的事件，则断言将成功：

    Event::assertDispatched(function (OrderShipped $event) use ($order) {
        return $event->order->id === $order->id;
    });

如果你只想断言事件侦听器正在侦听给定事件，可以使用 `assertListening` 方法：

    Event::assertListening(
        OrderShipped::class,
        SendShipmentNotification::class
    );

> **警告**
> 调用 `Event::fake()` 后，不会执行任何事件侦听器。 因此，如果你的测试使用依赖于事件的模型工厂，例如在模型的「创建」事件期间创建 UUID，则您应该在使用您的工厂**之后**调用“Event::fake()”。

<a name="faking-a-subset-of-events"></a>
### 伪造一部分事件

如果你只想为一组特定的事件伪造事件监听器，你可以将它们传递给 `fake` 或 `fakeFor` 方法：

    /**
     * 测试订单流程。
     */
    public function test_orders_can_be_processed(): void
    {
        Event::fake([
            OrderCreated::class,
        ]);

        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        // 其他事件正常发送...
        $order->update([...]);
    }



你可以使用 `except` 方法排除指定事件：

    Event::fake()->except([
        OrderCreated::class,
    ]);

<a name="scoped-event-fakes"></a>
### Fakes 作用域事件

如果你只想为测试的一部分创建事件侦听器，你可以使用 `fakeFor` 方法：

    <?php

    namespace Tests\Feature;

    use App\Events\OrderCreated;
    use App\Models\Order;
    use Illuminate\Support\Facades\Event;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 测试订单程序
         */
        public function test_orders_can_be_processed(): void
        {
            $order = Event::fakeFor(function () {
                $order = Order::factory()->create();

                Event::assertDispatched(OrderCreated::class);

                return $order;
            });

            // 事件按正常方式调度，观察者将会运行...
            $order->update([...]);
        }
    }

