
# Mocking

- [简介](#introduction)
- [模拟对象](#mocking-objects)
- [模拟 Facades](#mocking-facades)
    - [Facade Spies](#facade-spies)
- [任务模拟](#bus-fake)
    - [任务链](#bus-job-chains)
    - [批量任务](#job-batches)
- [事件模拟](#event-fake)
    - [Scoped 事件模拟](#scoped-event-fakes)
- [HTTP 模拟](#http-fake)
- [邮件模拟](#mail-fake)
- [通知模拟](#notification-fake)
- [队列模拟](#queue-fake)
    - [任务链](#job-chains)
- [存储模拟](#storage-fake)
- [时间交互](#interacting-with-time)

<a name="introduction"></a>
## 简介
在 Laravel 应用程序测试中，你可能希望「模拟」应用程序的某些功能的行为，从而避免该部分在测试中真正执行。例如：在控制器执行过程中会触发事件，您可能希望模拟事件监听器，从而避免该事件在测试时真正执行。这允许你在仅测试控制器 HTTP 响应的情况时，而不必担心触发事件，因为事件侦听器可以在它们自己的测试用例中进行测试。

Laravel 针对事件、任务和 Facades 的模拟，提供了开箱即用的辅助函数。这些函数基于 Mocker 封装而成，使用非常方便，无需手动调用复杂的 Mockery 函数。

<a name="mocking-objects"></a>
## 模拟对象

当模拟一个对象将通过 Laravel 的 [服务容器](/docs/laravel/9.x/container) 注入到应用中时，你将需要将模拟实例作为 `instance` 绑定到容器中。这将告诉容器使用对象的模拟实例，而不是构造对象的真身：

    use App\Service;
    use Mockery;
    use Mockery\MockInterface;

    public function test_something_can_be_mocked()
    {
        $this->instance(
            Service::class,
            Mockery::mock(Service::class, function (MockInterface $mock) {
                $mock->shouldReceive('process')->once();
            })
        );
    }



为了让以上过程更加便捷，你可以使用 Laravel 的基本测试用例类提供 `mock` 方法：

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

同样，如果你想侦查一个对象，Laravel 的基本测试用例类提供了一个便捷的 [spy](http://docs.mockery.io/en/latest/reference/spies.html) 方法作为 `Mockery::spy` 的替代方法,但是，spy会记录spy与被测试代码之间的任何交互，从而允许您在执行代码后做出断言：

    use App\Service;

    $spy = $this->spy(Service::class);

    // ...

    $spy->shouldHaveReceived('process');

<a name="mocking-facades"></a>
## Facades模拟

与传统静态方法调用不同的是，[facades](/docs/laravel/9.x/facades) (including [real-time facades](/docs/laravel/9.x/facades#real-time-facades)) 也可以被模拟。相较传统的静态方法而言，它具有很大的优势，即便你使用依赖注入，可测试性不逊半分。在测试中，你可能想在控制器中模拟对 Laravel Facade 的调用。比如下面控制器中的行为：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * 显示该应用程序的所有用户的列表.
         *
         * @return \Illuminate\Http\Response
         */
        public function index()
        {
            $value = Cache::get('key');

            //
        }
    }


我们可以使用 `shouldReceive` 方法模拟对 `Cache` Facade 的调用，该方法将返回一个 [Mockery](https://github.com/padraic/mockery) 模拟的实例。由于 Facades 实际上是由 Laravel [服务容器](/docs/laravel/9.x/container) 解析和管理的，因此它们比传统的静态类具有更好的可测试性。例如，让我们模拟对 `Cache` Facade 的 `get` 方法的调用：


    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Cache;
    use Tests\TestCase;

    class UserControllerTest extends TestCase
    {
        public function testGetIndex()
        {
            Cache::shouldReceive('get')
                        ->once()
                        ->with('key')
                        ->andReturn('value');

            $response = $this->get('/users');

            // ...
        }
    }

> 注意：你不应该模拟 `Request` facade。相反，在运行测试时将您想要的输入传递到 [HTTP 测试方法](/docs/laravel/9.x/http-tests) 中，例如 `get` 和 `post`。同样，不要模拟 `Config` facade，而是在测试中调用 `Config::set` 方法。

<a name="facade-spies"></a>
### Facade Spies

如果你想 [spy](http://docs.mockery.io/en/latest/reference/spies.html) 一个 facade，你可以在相应的 facade 上调用 `spy` 方法。spy 类似于模拟；但是，spy 记录 spy 和被测试代码之间的所有交互，允许你在代码执行后做出断言：

    use Illuminate\Support\Facades\Cache;

    public function test_values_are_be_stored_in_cache()
    {
        Cache::spy();

        $response = $this->get('/');

        $response->assertStatus(200);

        Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
    }

<a name="bus-fake"></a>


## Bus Fake

在测试分发任务的代码时，您通常希望断言已分发给定任务，但实际不进入队列或执行任务。这是因为任务的执行通常可以在单独的测试类中进行测试。

您可以使用 `Bus` facade 的 `fake` 方法来防止将任务分发到队列。然后，在执行测试代码后，您可以使用 `assertDispatched` 和 `assertNotDispatched` 方法检查应用试图分发的任务：

    <?php

    namespace Tests\Feature;

    use App\Jobs\ShipOrder;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Bus;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped()
        {
            Bus::fake();

            // 执行订单发货……

            // 断言任务被分发……
            Bus::assertDispatched(ShipOrder::class);

            // 断言任务没有被分发
            Bus::assertNotDispatched(AnotherJob::class);
        }
    }

您可以将闭包传递给 `assertDispatched` 或 `assertNotDispatched` 方法，以断言已分发的任务通过了给定的「真实性测试」。如果至少分发了一个通过给定真实性测试的任务，则断言将成功。例如，您可能希望声明已为特定订单分发任务：

    Bus::assertDispatched(function (ShipOrder $job) use ($order) {
        return $job->order->id === $order->id;
    });



<a name="bus-job-chains"></a>
### 任务链
`Bus` facade 的 `assertChained` 方法可用于断言 [任务链](/docs/laravel/9.x/queues#job-chaining) 已被调度。 `assertChained` 方法接受一个链式任务数组作为它的第一个参数：

    use App\Jobs\RecordShipment;
    use App\Jobs\ShipOrder;
    use App\Jobs\UpdateInventory;
    use Illuminate\Support\Facades\Bus;

    Bus::assertChained([
        ShipOrder::class,
        RecordShipment::class,
        UpdateInventory::class
    ]);




如上例所示，链式任务的数组可是任务类名的数组。但是，您也可以提供实际任务实例的数组。执行此操作时，Laravel 将确保任务实例属于同一类，并且具有与应用分发的任务链相同的属性值：

    Bus::assertChained([
        new ShipOrder,
        new RecordShipment,
        new UpdateInventory,
    ]);

<a name="job-batches"></a>
### 任务批处理

`Bus` facade 的 `assertBatched` 方法可以用来断言 [批量任务](/docs/laravel/9.x/queues#job-batches) 被分发。提供给 `assertBatched` 方法的闭包接收一个 `Illuminate\Bus\PendingBatch` 的实例，它可用于检查批处理中的任务：

    use Illuminate\Bus\PendingBatch;
    use Illuminate\Support\Facades\Bus;

    Bus::assertBatched(function (PendingBatch $batch) {
        return $batch->name == 'import-csv' &&
               $batch->jobs->count() === 10;
    });

<a name="event-fake"></a>
## 事件模拟

在测试分发事件的代码时，您可能希望指示 Laravel 不要执行事件的监听器。 使用 `Event` facade 的 `fake` 方法可以阻止监听器执行，执行测试代码后使用 `assertDispatched` 、`assertNotDispatched` 和 `assertNothingDispatched` 方法断言应用分发了哪些事件：

    <?php

    namespace Tests\Feature;

    use App\Events\OrderFailedToShip;
    use App\Events\OrderShipped;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Event;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 测试订单发货
         */
        public function test_orders_can_be_shipped()
        {
            Event::fake();

            // 指定订单发货……

            // 断言事件被分发……
            Event::assertDispatched(OrderShipped::class);

            // 断言事件被分发了两次……
            Event::assertDispatched(OrderShipped::class, 2);

            // 断言事件未被分发……
            Event::assertNotDispatched(OrderFailedToShip::class);

            // 断言没有任务事件被分发……
            Event::assertNothingDispatched();
        }
    }



您可以将闭包传递给 `assertDispatched` 或 `assertNotDispatched` 方法，以断言已分发的事件通过了给定的「真实性测试」。如果至少分发了一个通过给定真实性测试的事件，则断言将成功

    Event::assertDispatched(function (OrderShipped $event) use ($order) {
        return $event->order->id === $order->id;
    });


> 注意：调用 `Event::fake()` 后不会执行事件监听器。所以，如果你的测试用到了依赖于事件的模型工厂，例如，在模型的 `creating` 事件中创建 UUID ，那么你应该在使用模型工厂   **之后** 调用 `Event::fake()`。

<a name="faking-a-subset-of-events"></a>
#### 模拟事件的子集

如果你只想为特定的一组事件模拟事件监听器，你可以将它们传递给 `fake` 或 `fakeFor` 方法：

    /**
     * 测试订单流程。
     */
    public function test_orders_can_be_processed()
    {
        Event::fake([
            OrderCreated::class,
        ]);

        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        // 其他事件照常分发……
        $order->update([...]);
    }

<a name="scoped-event-fakes"></a>
### Scoped 事件模拟

如果你只想为部分测试模拟事件监听，则可以使用 `fakeFor` 方法：

    <?php

    namespace Tests\Feature;

    use App\Events\OrderCreated;
    use App\Models\Order;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Support\Facades\Event;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 测试订单流程。
         */
        public function test_orders_can_be_processed()
        {
            $order = Event::fakeFor(function () {
                $order = Order::factory()->create();

                Event::assertDispatched(OrderCreated::class);

                return $order;
            });

            // 事件照常分发，且观察者将运行 ...
            $order->update([...]);
        }
    }



<a name="http-fake"></a>
## HTTP 模拟

`Http` facade 的 `fake` 方法允许您指示 HTTP 客户端在发出请求时返回虚拟响应。有关伪造发出 HTTP 请求的更多信息，请参阅 [HTTP客户端测试文档](/docs/laravel/9.x/http-client#testing)。

<a name="mail-fake"></a>
## 邮件模拟


您可以使用 `Mail` facade 的 `fake` 方法阻止邮件发送。通常，发送邮件与实际测试的代码无关。一般只要断言发送了给定的邮件就足够了。

调用 `Mail` facade 的 `fake` 方法后，您可以断言 [mailables](/docs/laravel/9.x/Mail) 被指示发送给用户，甚至检查 mailables 收到的数据：

    <?php

    namespace Tests\Feature;

    use App\Mail\OrderShipped;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Mail;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped()
        {
            Mail::fake();

            // 执行订单发货……

            // 断言没有发送任何邮件……
            Mail::assertNothingSent();

            // 断言发送了邮件……
            Mail::assertSent(OrderShipped::class);

            // 断言邮件发送了两遍……
            Mail::assertSent(OrderShipped::class, 2);

            // 断言邮件未发送……
            Mail::assertNotSent(AnotherMailable::class);
        }
    }

如果你用后台任务执行邮件发送队列，你应该使用 `assertQueued` 代替 `assertSent`：

    Mail::assertQueued(OrderShipped::class);

    Mail::assertNotQueued(OrderShipped::class);

    Mail::assertNothingQueued();

你可以将闭包传递给 `assertSent`, `assertNotSent`, `assertQueued` 或 `assertNotQueued` 方法，以断言发送的邮件通过了给定的 「真实性测试」。如果至少发送了一封通过给定真实性测试的邮件，则断言将成功：

    Mail::assertSent(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });



调用 `Mail` facade 的断言方法时, 所提供的闭包接受的 mailable 实例公开了检查 mailable   的收件人的实用方法：

    Mail::assertSent(OrderShipped::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email) &&
               $mail->hasCc('...') &&
               $mail->hasBcc('...');
    });

你可能已经注意到，有两种方法可以断言邮件没有被发送：`assertNotSent` 和 `assertNotQueued`。有时你可能希望断言没有邮件被发送 **或** 存入队列。为了达到这个目的，你可以使用`assertNothingOutgoing`和`assertNotOutgoing`方法。

    Mail::assertNothingOutgoing();

    Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });

<a name="notification-fake"></a>
## 通知模拟
你可以使用 `Notification` facade 的 `fake`方法来阻止发送通知。通常，发送通知与实际测试的代码无关。一般，只要断言 Laravel 发送给定的通知就足够了。

调用了 `Notification` facade 的 `fake` 方法之后，你可以断言 [通知](/docs/laravel/9.x/notifications) 被发送给用户， 甚至可以检查 notifications 收到的数据：

    <?php

    namespace Tests\Feature;

    use App\Notifications\OrderShipped;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Notification;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped()
        {
            Notification::fake();

            // 执行订单发货……

            // 断言没有发送任何通知……
            Notification::assertNothingSent();

            // 断言通知被发送给指定用户……
            Notification::assertSentTo(
                [$user], OrderShipped::class
            );

            // 断言通知未发送……
            Notification::assertNotSentTo(
                [$user], AnotherNotification::class
            );
        }
    }



您可以将闭包传递给 `assertSentTo` 或 `assertNotSentTo` 方法，以断言发送的通知通过了给定的 「真实性测试」。如果至少发送了一个通过给定真实性测试的通知，则断言将成功：

    Notification::assertSentTo(
        $user,
        function (OrderShipped $notification, $channels) use ($order) {
            return $notification->order->id === $order->id;
        }
    );



<a name="on-demand-notifications"></a>
#### 按需通知

如果您正在测试发送 [按需通知](/docs/laravel/9.x/notifications#on-demand-notifications)，则您需要断言通知已发送到 `Illuminate\Notifications\AnonymousNotifiable` 实例：

    use Illuminate\Notifications\AnonymousNotifiable;

    Notification::assertSentTo(
        new AnonymousNotifiable, OrderShipped::class
    );

通过将闭包作为第三个参数传递给通知断言方法，您可以确定是否已将按需通知发送到正确的「路由」地址：

    Notification::assertSentTo(
        new AnonymousNotifiable,
        OrderShipped::class,
        function ($notification, $channels, $notifiable) use ($user) {
            return $notifiable->routes['mail'] === $user->email;
        }
    );

<a name="queue-fake"></a>
## 队列模拟
可以使用 `Queue` facade 的 `fake` 方法来防止任务被推送到队列中。通常，只要断言将给定的任务推送到队列就足够了，因为队列任务本身可以在另一个测试类中进行测试。

调用 `Queue` facade 的 `fake` 方法后，您可以断言应用试图将任务推送到队列：

    <?php

    namespace Tests\Feature;

    use App\Jobs\AnotherJob;
    use App\Jobs\FinalJob;
    use App\Jobs\ShipOrder;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Support\Facades\Queue;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped()
        {
            Queue::fake();

            // 执行订单发货……

            // 断言没有任务被推送……
            Queue::assertNothingPushed();

            // 断言任务被推送到指定队列……
            Queue::assertPushedOn('queue-name', ShipOrder::class);

            //  断言任务被推送了两次……
            Queue::assertPushed(ShipOrder::class, 2);

            // 断言任务未被推送……
            Queue::assertNotPushed(AnotherJob::class);
        }
    }



您可以将闭包传递给 `assertPushed` 或 `assertNotPushed` 方法，以断言推送的任务通过了给定的 「真实性测试」。如果至少推送了一个通过给定真实性测试的任务，则断言将成功：

    Queue::assertPushed(function (ShipOrder $job) use ($order) {
        return $job->order->id === $order->id;
    });

<a name="job-chains"></a>
### 任务链

`Queue` facade 的 `assertPushedWithChain` 和 `assertPushedWithoutChain` 方法可用于检查推送任务的任务链。 `assertPushedWithChain` 方法接受主任务作为第一个参数，接受链式任务数组作为第二个参数：


    use App\Jobs\RecordShipment;
    use App\Jobs\ShipOrder;
    use App\Jobs\UpdateInventory;
    use Illuminate\Support\Facades\Queue;

    Queue::assertPushedWithChain(ShipOrder::class, [
        RecordShipment::class,
        UpdateInventory::class
    ]);

如上例所示，链式任务的数组可能是任务类名的数组。但是，您也可以提供实际任务实例的数组。执行此操作时，Laravel 将确保任务实例属于同一类，并且具有应用调度的任务链的相同属性值：

    Queue::assertPushedWithChain(ShipOrder::class, [
        new RecordShipment,
        new UpdateInventory,
    ]);

您可以使用 `assertPushedWithoutChain` 方法断言在没有任务链的情况下推送任务：


    Queue::assertPushedWithoutChain(ShipOrder::class);

<a name="storage-fake"></a>
## 存储模拟

你可以使用 `Storage` Facade 的 `fake` 方法，轻松的生成一个模拟磁盘，结合 `Illuminate\Http\UploadedFile` 类的文件生成工具，极大的简化了文件上传测试。例如：

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Http\UploadedFile;
    use Illuminate\Support\Facades\Storage;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_albums_can_be_uploaded()
        {
            Storage::fake('photos');

            $response = $this->json('POST', '/photos', [
                UploadedFile::fake()->image('photo1.jpg'),
                UploadedFile::fake()->image('photo2.jpg')
            ]);

            // 断言一个或多个文件已存储……
            Storage::disk('photos')->assertExists('photo1.jpg');
            Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

            //  断言一个或多个文件未存储……
            Storage::disk('photos')->assertMissing('missing.jpg');
            Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);
        }
    }



有关测试文件上传的更多信息，您可以参考 [HTTP测试文档的文件上传信息](/docs/laravel/9.x/http-tests#testing-file-uploads)。



> 技巧：默认情况下，`fake` 方法将删除临时目录下所有文件。如果你想保留这些文件，你可以使用 「persistentFake」。

<a name="interacting-with-time"></a>
## 时间交互

测试时，有时可能需要修改诸如 `now` 或 `Illuminate\Support\Carbon::now()` 之类的助手返回的时间。 值得庆幸的是，Laravel 的基本功能测试类包括一些帮助程序，可让您操纵当前时间：


    public function testTimeCanBeManipulated()
    {
        // 调至未来……
        $this->travel(5)->milliseconds();
        $this->travel(5)->seconds();
        $this->travel(5)->minutes();
        $this->travel(5)->hours();
        $this->travel(5)->days();
        $this->travel(5)->weeks();
        $this->travel(5)->years();

        // 调至过去……
        $this->travel(-5)->hours();

        // 调至一个明确的时间……
        $this->travelTo(now()->subHours(6));

        // 返回现在……
        $this->travelBack();
    }

