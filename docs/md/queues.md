# 队列

- [简介](#introduction)
    - [连接 Vs. 驱动](#connections-vs-queues)
    - [驱动程序说明 & 先决条件](#driver-prerequisites)
- [创建任务](#creating-jobs)
    - [生成任务类](#generating-job-classes)
    - [任务类结构](#class-structure)
    - [唯一任务](#unique-jobs)
- [任务中间件](#job-middleware)
    - [访问限制](#rate-limiting)
    - [防止任务重复](#preventing-job-overlaps)
    - [限制异常](#throttling-exceptions)
- [任务调度](#dispatching-jobs)
    - [延迟调度](#delayed-dispatching)
    - [同步调度](#synchronous-dispatching)
    - [任务 & 数据库事务](#jobs-and-database-transactions)
    - [任务链](#job-chaining)
    - [自定义队列 & 连接](#customizing-the-queue-and-connection)
    - [指定任务最大尝试次数 / 超时值](#max-job-attempts-and-timeout)
    - [错误处理](#error-handling)
- [任务批处理](#job-batching)
    - [定义可批处理任务](#defining-batchable-jobs)
    - [分派批处理](#dispatching-batches)
    - [将任务添加到批处理](#adding-jobs-to-batches)
    - [校验批处理](#inspecting-batches)
    - [取消批处理](#cancelling-batches)
    - [批处理失败](#batch-failures)
    - [批量清理](#pruning-batches)
- [队列闭包](#queueing-closures)
- [运行队列处理器](#running-the-queue-worker)
    - [`queue:work` 命令](#the-queue-work-command)
    - [队列优先级](#queue-priorities)
    - [队列处理器 & 部署](#queue-workers-and-deployment)
    - [任务过期 & 超时](#job-expirations-and-timeouts)
- [Supervisor 配置](#supervisor-configuration)
- [处理失败任务](#dealing-with-failed-jobs)
    - [清理失败任务](#cleaning-up-after-failed-jobs)
    - [重试失败任务](#retrying-failed-jobs)
    - [忽略缺失的模型](#ignoring-missing-models)
    - [清理失败的任务](#pruning-failed-jobs)
    - [在 DynamoDB 中存储失败的任务](#storing-failed-jobs-in-dynamodb)
    - [禁用失败的任务存储](#disabling-failed-job-storage)
    - [任务失败事件](#failed-job-events)
- [清理队列任务](#clearing-jobs-from-queues)
- [监控你的队列](#monitoring-your-queues)
- [测试](#testing)
    - [伪造任务的一个子集](#faking-a-subset-of-jobs)
    - [测试任务链](#testing-job-chains)
    - [测试任务批处理](#testing-job-batches)
- [任务事件](#job-events)

<a name="introduction"></a>
## 简介

在构建 Web 应用程序时，你可能需要执行一些任务，例如解析和存储上传的 CSV 文件，这些任务在典型的 Web 请求期间需要很长时间才能执行。 值得庆幸的是，Laravel 允许你轻松创建可以在后台处理的队列任务。 通过将时间密集型任务移至队列，你的应用程序可以以极快的速度响应 Web 请求，并为你的客户提供更好的用户体验。

Laravel 队列为各种不同的队列驱动提供统一的队列 API，例如 [Amazon SQS](https://aws.amazon.com/sqs/)，[Redis](https://redis.io)，甚至关系数据库。

Laravel 队列的配置选项存储在 `config/queue.php` 文件中。 在这个文件中，你可以找到框架中包含的每个队列驱动的连接配置，包括数据库， [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io)， 和 [Beanstalkd](https://beanstalkd.github.io/) 驱动，以及一个会立即执行作业的同步驱动（用于本地开发）。还包括一个用于丢弃排队任务的 `null` 队列驱动。

> **技巧**  
> Laravel 提供了 Horizon ，适用于 Redis 驱动队列。 Horizon 是一个拥有漂亮仪表盘的配置系统。如需了解更多信息请查看完整的 [Horizon 文档](/docs/laravel/10.x/horizon)。

<a name="connections-vs-queues"></a>
### 连接 Vs. 驱动

在开始使用 Laravel 队列之前，理解「连接」和「队列」之间的区别非常重要。 在 `config/queue.php` 配置文件中，有一个 `connections` 连接选项。 此选项定义连接某个驱动（如 Amazon SQS、Beanstalk 或 Redis）。然而，任何给定的队列连接都可能有多个「队列」，这些「队列」可能被认为是不同的堆栈或成堆的排队任务。

请注意， `queue` 配置文件中的每个连接配置示例都包含一个 `queue` 属性。

这是将任务发送到给定连接时将被分配到的默认队列。换句话说，如果你没有显式地定义任务应该被发送到哪个队列，那么该任务将被放置在连接配置的 `queue` 属性中定义的队列上：

    use App\Jobs\ProcessPodcast;

    // 这个任务将被推送到默认队列...

    ProcessPodcast::dispatch();

	// 这个任务将被推送到「emails」队列...

    ProcessPodcast::dispatch()->onQueue('emails');

有些应用程序可能不需要将任务推到多个队列中，而是倾向于使用一个简单的队列。然而，如果希望对任务的处理方式进行优先级排序或分段时，将任务推送到多个队列就显得特别有用，因为 Laravel 队列工作程序允许你指定哪些队列应该按优先级处理。例如，如果你将任务推送到一个 `high` 队列，你可能会运行一个赋予它们更高处理优先级的 worker：

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>

### 驱动程序说明和先决条件

<a name="database"></a>

#### 数据库

要使用 `database` 队列驱动程序，你需要一个数据库表来保存任务。要生成创建此表的迁移，请运行 `queue:table` Artisan 命令。一旦迁移已经创建，你可以使用 `migrate` 命令迁移你的数据库：

```shell
php artisan queue:table

php artisan migrate
```

最后，请不要忘记通过修改`.env` 文件中的 `QUEUE_CONNECTION` 变量从而将 `database` 作为你的应用队列驱动程序:

 QUEUE_CONNECTION=database

<a name="redis"></a>

#### Redis

要使用 `redis` 队列驱动程序，需要在 `config/database.php` 配置文件中配置一个 redis 数据库连接。

**Redis 集群**

如果你的 Redis 队列当中使用了 Redis 集群，那么你的队列名称就必须包含一个 [key hash tag](https://redis.io/topics/cluster-spec#keys-hash-tags)。这是为了确保一个给定队列的所有 Redis 键都被放在同一个哈希插槽：

    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => '{default}',
        'retry_after' => 90,
    ],

**阻塞**

在使用 Redis 队列时，你可以使用 block_for 配置选项来指定在遍历 worker 循环和重新轮询 Redis 数据库之前，驱动程序需要等待多长时间才能使任务变得可用。

根据你的队列负载调整此值要比连续轮询 Redis 数据库中的新任务更加有效。例如，你可以将值设置为 5 以指示驱动程序在等待任务变得可用时应该阻塞 5 秒：

    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'default',
        'retry_after' => 90,
        'block_for' => 5,
    ],

> **注意**
> 将 block_for 设置为 0 将导致队列 workers 一直阻塞，直到某一个任务变得可用。这还能防止在下一个任务被处理之前处理诸如 SIGTERM 之类的信号。

<a name="other-driver-prerequisites"></a>

#### 其他驱动的先决条件

列出的队列驱动需要如下的依赖，这些依赖可通过 Composer 包管理器进行安装：

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~4.0`
- Redis: `predis/predis ~1.0` or phpredis PHP extension

</div>

<a name="creating-jobs"></a>
## 创建任务

<a name="generating-job-classes"></a>
### 生成任务类

默认情况下，应用程序的所有的可排队任务都被存储在了 app/Jobs 目录中。如果 app/Jobs 目录不存在，当你运行 make:job Artisan 命令时，将会自动创建该目录：

```shell
php artisan make:job ProcessPodcast
```

生成的类将会实现 Illuminate\Contracts\Queue\ShouldQueue 接口， 告诉 Laravel ，该任务应该推入队列以异步的方式运行。

> **技巧**
> 你可以使用 [stub publishing](/docs/laravel/10.x/artisanmd#stub-customization) 来自定义任务 stub 。

<a name="class-structure"></a>
### 任务类结构

任务类非常简单，通常只包含一个 `handle` 方法，在队列处理任务时将会调用它。让我们看一个任务类的示例。在这个例子中，我们假设我们管理一个 podcast 服务，并且需要在上传的 podcast 文件发布之前对其进行处理：

    <?php

    namespace App\Jobs;

    use App\Models\Podcast;
    use App\Services\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * 创建一个新的任务实例
         */
        public function __construct(
            public Podcast $podcast,
        ) {}

        /**
         * 运行任务
         */
        public function handle(AudioProcessor $processor): void
        {
            // 处理上传的 podcast...
        }
    }

在本示例中，请注意，我们能够将一个 [Eloquent model](/docs/laravel/10.x/eloquent)  直接传递到已排队任务的构造函数中。由于任务所使用的 `SerializesModels` ，在任务处理时，Eloquent 模型及其加载的关系将被优雅地序列化和反序列化。

如果你的队列任务在其构造函数中接受一个 Eloquent 模型，那么只有模型的标识符才会被序列化到队列中。当实际处理任务时，队列系统将自动重新从数据库中获取完整的模型实例及其加载的关系。这种用于模型序列化的方式允许将更小的作业有效负载发送给你的队列驱动程序。

<a name="handle-method-dependency-injection"></a>
#### `handle` 方法依赖注入

当任务由队列处理时，将调用 `handle` 方法。注意，我们可以对任务的 `handle` 方法进行类型提示依赖。Laravel [服务容器](/docs/laravel/10.x/container) 会自动注入这些依赖项。

如果你想完全控制容器如何将依赖注入  `handle` 方法，你可以使用容器的 `bindMethod`  方法。 `bindMethod` 方法接受一个可接收任务和容器的回调。在回调中，你可以在任何你想用的地方随意调用 `handle` 方法。 通常， 你应该从你的 `App\Providers\AppServiceProvider` [服务提供者](/docs/laravel/10.x/providers)  中来调用该方法:

    use App\Jobs\ProcessPodcast;
    use App\Services\AudioProcessor;
    use Illuminate\Contracts\Foundation\Application;

    $this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
        return $job->handle($app->make(AudioProcessor::class));
    });

> **注意**
> 二进制数据，例如原始图像内容，应该在传递到队列任务之前通过 `base64_encode` 函数传递。否则，在将任务放入队列时，可能无法正确地序列化为 JSON。

<a name="handling-relationships"></a>
#### 队列关系

因为加载的关系也会被序列化，所以处理序列化任务的字符串有时会变得相当大。为了防止该关系被序列化，可以在设置属性值时对模型调用 `withoutRelations` 方法。此方法将返回没有加载关系的模型实例：

    /**
     * 创建新的任务实例
     */
    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast->withoutRelations();
    }

此外，当反序列化任务并从数据库中重新检索模型关系时，它们将被完整检索。反序列化任务时，将不会应用在任务排队过程中序列化模型之前应用的任何先前关系约束。因此，如果你希望使用给定关系的子集，则应在排队任务中重新限制该关系。

<a name="unique-jobs"></a>
### 唯一任务

> 注意：唯一任务需要支持 [locks](/docs/laravel/10.x/cachemd#atomic-locks) 的缓存驱动程序。 目前，`memcached`、`redis`、`dynamodb`、`database`、`file`和`array`缓存驱动支持原子锁。 此外，独特的任务约束不适用于批次内的任务。

有时，你可能希望确保在任何时间点队列中只有一个特定任务的实例。你可以通过在你的工作类上实现 `ShouldBeUnique` 接口来做到这一点。这个接口不需要你在你的类上定义任何额外的方法：

    <?php

    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUnique;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        ...
    }

以上示例中，`UpdateSearchIndex` 任务是唯一的。因此，如果任务的另一个实例已经在队列中并且尚未完成处理，则不会分派该任务。

在某些情况下，你可能想要定义一个使任务唯一的特定「键」，或者你可能想要指定一个超时时间，超过该时间任务不再保持唯一。为此，你可以在任务类上定义 `uniqueId` 和 `uniqueFor` 属性或方法：

    <?php

    use App\Product;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUnique;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        /**
         * 产品实例
         *
         * @var \App\Product
         */
        public $product;

        /**
         * 任务的唯一锁将被释放的秒数
         *
         * @var int
         */
        public $uniqueFor = 3600;

        /**
         * 任务的唯一 ID
         */
        public function uniqueId(): string
        {
            return $this->product->id;
        }
    }

以上示例中， `UpdateSearchIndex` 任务中的 product ID 是唯一的。因此，在现有任务完成处理之前，任何具有相同 product ID 的任务都将被忽略。此外，如果现有任务在一小时内没有得到处理，则释放唯一锁，并将具有相同唯一键的另一个任务分派到该队列。

> **注意**
> 如果你的应用程序从多个 web 服务器或容器分派任务，你应该确保你的所有服务器都与同一个中央缓存服务器通信，以便Laravel能够准确确定任务是否唯一。

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### 在任务处理开始前保证唯一

默认情况下，在任务完成处理或所有重试尝试均失败后，唯一任务将被「解锁」。但是，在某些情况下，你可能希望任务在处理之前立即解锁。为此，你的任务类可以实现  `ShouldBeUniqueUntilProcessing`  接口，而不是实现 `ShouldBeUnique` 接口：

    <?php

    use App\Product;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
    {
        // ...
    }

<a name="unique-job-locks"></a>
#### 唯一任务锁

在底层实现中，当分发 `ShouldBeUnique` 任务时，Laravel 尝试使用`uniqueId` 键获取一个   [锁](/docs/laravel/10.x/cachemd#atomic-locks) 。如果未获取到锁，则不会分派任务。当任务完成处理或所有重试尝试失败时，将释放此锁。默认情况下，Laravel 将使用默认的缓存驱动程序来获取此锁。但是，如果你希望使用其他驱动程序来获取锁，则可以定义一个 `uniqueVia` 方法，该方法返回一个缓存驱动对象：

    use Illuminate\Contracts\Cache\Repository;
    use Illuminate\Support\Facades\Cache;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        ...

        /**
         * 获取唯一任务锁的缓存驱动程序
         */
        public function uniqueVia(): Repository
        {
            return Cache::driver('redis');
        }
    }

> 技巧：如果只需要限制任务的并发处理，请改用 [`WithoutOverlapping`](/docs/laravel/10.x/queuesmd#preventing-job-overlaps) 任务中间件。

<a name="job-middleware"></a>
## 任务中间件

任务中间件允许你围绕排队任务的执行封装自定义逻辑，从而减少了任务本身的样板代码。例如，看下面的  `handle` 方法，它利用了 Laravel 的 Redis 速率限制特性，允许每 5 秒只处理一个任务：

    use Illuminate\Support\Facades\Redis;

    /**
     * 执行任务
     */
    public function handle(): void
    {
        Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
            info('取得了锁...');

            // 处理任务...
        }, function () {
            // 无法获取锁...

            return $this->release(5);
        });
    }

虽然这段代码是有效的， 但是 `handle` 方法的结构却变得杂乱，因为它掺杂了 Redis 速率限制逻辑。此外，其他任务需要使用速率限制的时候，只能将限制逻辑复制一次。

我们可以定义一个处理速率限制的任务中间件，而不是在 handle 方法中定义速率限制。Laravel 没有任务中间件的默认位置，所以你可以将任务中间件放置在你喜欢的任何位置。在本例中，我们将把中间件放在  `app/Jobs/Middleware`  目录：

    <?php

    namespace App\Jobs\Middleware;

    use Closure;
    use Illuminate\Support\Facades\Redis;

    class RateLimited
    {
        /**
         * 处理队列任务
         *
         * @param  \Closure(object): void  $next
         */
        public function handle(object $job, Closure $next): void
        {
            Redis::throttle('key')
                    ->block(0)->allow(1)->every(5)
                    ->then(function () use (object $job, Closure $next) {
                        // 已获得锁...

                        $next($job);
                    }, function () use ($job) {
                        // 没有获取到锁...

                        $job->release(5);
                    });
        }
    }

正如你看到的，类似于 [路由中间件](/docs/laravel/10.x/middleware)，任务中间件接收正在处理队列任务以及一个回调来继续处理队列任务。

在任务中间件被创建以后，他们可能被关联到通过从任务的 `middleware`方法返回的任务。这个方法并不存在于 `make:job`  Artisan 命令搭建的任务中，所以你需要将它添加到你自己的任务类的定义中：

    use App\Jobs\Middleware\RateLimited;

    /**
     * 获取一个可以被传递通过的中间件任务
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited];
    }

> **技巧**
> 任务中间件也可以分配其他可队列处理的监听事件当中，比如邮件，通知等。

<a name="rate-limiting"></a>
### 访问限制

尽管我们刚刚演示了如何编写自己的访问限制的任务中间件，但 Laravel 实际上内置了一个访问限制中间件，你可以利用它来限制任务。与 [路由限流器](/docs/laravel/10.x/routingmd/14845#defining-rate-limiters) 一样，任务访问限制器是使用 `RateLimiter` facade 的 `for` 方法定义的。

例如，你可能希望允许用户每小时备份一次数据，但不对高级客户施加此类限制。为此，可以在 `RateLimiter` 的 `boot` 方法中定义 `AppServiceProvider`：

    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Support\Facades\RateLimiter;

    /**
     * 注册应用程序服务
     */
    public function boot(): void
    {
        RateLimiter::for('backups', function (object $job) {
            return $job->user->vipCustomer()
                        ? Limit::none()
                        : Limit::perHour(1)->by($job->user->id);
        });
    }

在上面的例子中，我们定义了一个小时访问限制；但是，你可以使用 `perMinute` 方法轻松定义基于分钟的访问限制。此外，你可以将任何值传递给访问限制的 `by` 方法，但是，这个值通常用于按客户来区分不同的访问限制：

    return Limit::perMinute(50)->by($job->user->id);

定义速率限制后，你可以使用 `Illuminate\Queue\Middleware\RateLimited` 中间件将速率限制器附加到备份任务。 每次任务超过速率限制时，此中间件都会根据速率限制持续时间以适当的延迟将任务释放回队列。

    use Illuminate\Queue\Middleware\RateLimited;

    /**
     * 获取任务时，应该通过的中间件
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited('backups')];
    }

将速率受限的任务释放回队列仍然会增加任务的 「尝试」总数。你可能希望相应地调整你的任务类上的 `tries` 和 `maxExceptions` 属性。或者，你可能希望使用 `retryUntil` [方法](#time-based-attempts) 来定义不再尝试任务之前的时间量。

如果你不想在速率限制时重试任务，你可以使用 `dontRelease` 方法：

    /**
     * 获取任务时，应该通过的中间件
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new RateLimited('backups'))->dontRelease()];
    }

> **技巧**
> 如果你使用 Redis，你可以使用 Illuminate\Queue\Middleware\RateLimitedWithRedis 中间件，它针对 Redis 进行了微调，比基本的限速中间件更高效。

<a name="preventing-job-overlaps"></a>
### 防止任务重叠

Laravel 包含一个 `Illuminate\Queue\Middleware\WithoutOverlapping` 中间件，允许你根据任意键防止任务重叠。当排队的任务正在修改一次只能由一个任务修改的资源时，这会很有帮助。

例如，假设你有一个更新用户信用评分的排队任务，并且你希望防止同一用户 ID 的信用评分更新任务重叠。为此，你可以从任务的 `middleware` 方法返回 `WithoutOverlapping` 中间件：

    use Illuminate\Queue\Middleware\WithoutOverlapping;

    /**
     * 获取任务时，应该通过的中间件
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping($this->user->id)];
    }

任何重叠的任务都将被释放回队列。你还可以指定再次尝试释放的任务之前必须经过的秒数：

    /**
     * 获取任务时，应该通过的中间件
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
    }

如果你想立即删除任何重叠的任务，你可以使用 `dontRelease` 方法，这样它们就不会被重试：

    /**
     * 获取任务时，应该通过的中间件。
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->dontRelease()];
    }

`WithoutOverlapping` 中间件由 Laravel 的原子锁特性提供支持。有时，你的任务可能会以未释放锁的方式意外失败或超时。因此，你可以使用 expireAfter 方法显式定义锁定过期时间。例如，下面的示例将指示 Laravel 在任务开始处理三分钟后释放 WithoutOverlapping 锁：

    /**
     * 获取任务时，应该通过的中间件。
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
    }

> **注意**
> `WithoutOverlapping` 中间件需要支持 [locks](/docs/laravel/10.x/cachemd#atomic-locks) 的缓存驱动程序。目前，`memcached`、`redis`、`dynamodb`、`database`、`file` 和 `array` 缓存驱动支持原子锁。

<a name="sharing-lock-keys"></a>
#### 跨任务类别共享锁

默认情况下，`WithoutOverlapping` 中间件只会阻止同一类的重叠任务。 因此，尽管两个不同的任务类可能使用相同的锁，但不会阻止它们重叠。 但是，你可以使用 `shared` 方法指示 Laravel 跨任务类应用锁：

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...


    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...


    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### 节流限制异常

Laravel 包含一个 `Illuminate\Queue\Middleware\ThrottlesExceptions` 中间件，允许你限制异常。一旦任务抛出给定数量的异常，所有进一步执行该任务的尝试都会延迟，直到经过指定的时间间隔。该中间件对于与不稳定的第三方服务交互的任务特别有用。

例如，让我们想象一个队列任务与开始抛出异常的第三方 API 交互。要限制异常，你可以从任务的 `middleware` 方法返回 `ThrottlesExceptions` 中间件。通常，此中间件应与实现 [基于时间的尝试](#time-based-attempts) 的任务配对：

    use DateTime;
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * 获取任务时，应该通过的中间件。
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new ThrottlesExceptions(10, 5)];
    }

    /**
     * 确定任务应该超时的时间。
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }

中间件接受的第一个构造函数参数是任务在被限制之前可以抛出的异常数，而第二个构造函数参数是在任务被限制后再次尝试之前应该经过的分钟数。在上面的代码示例中，如果任务在 5 分钟内抛出 10 个异常，我们将等待 5 分钟，然后再次尝试该任务。

当任务抛出异常但尚未达到异常阈值时，通常会立即重试该任务。但是，你可以通过在将中间件附加到任务时调用 `backoff` 方法来指定此类任务应延迟的分钟数：

    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * 获取任务时，应该通过的中间件。
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 5))->backoff(5)];
    }

在内部，这个中间件使用 Laravel 的缓存系统来实现速率限制，并利用任务的类名作为缓存 「键」。 在将中间件附加到任务时，你可以通过调用 `by` 方法来覆盖此键。 如果你有多个任务与同一个第三方服务交互并且你希望它们共享一个共同的节流 「桶」，这可能会很有用：

    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * 获取任务时，应该通过的中间件。
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 10))->by('key')];
    }

> **技巧**  
> 如果你使用 Redis，你可以使用 `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` 中间件，它针对 Redis 进行了微调，比基本的异常节流中间件更高效。

<a name="dispatching-jobs"></a>
## 调度任务

一旦你写好了你的任务类，你可以使用任务本身的 `dispatch` 方法来调度它。传递给 `dispatch` 方法的参数将被提供给任务的构造函数：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * 存储一个新的播客。
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // ...

            ProcessPodcast::dispatch($podcast);

            return redirect('/podcasts');
        }
    }

如果你想有条件地分派任务，你可以使用 `dispatchIf` 和 `dispatchUnless` 方法：

    ProcessPodcast::dispatchIf($accountActive, $podcast);

    ProcessPodcast::dispatchUnless($accountSuspended, $podcast);

在新的 Laravel 应用程序中，`sync` 是默认的队列驱动程序。 该驱动程序会在当前请求的前台同步执行任务，这在本地开发时通常会很方便。 如果你想在后台处理排队任务，你可以在应用程序的 `config/queue.php` 配置文件中指定一个不同的队列驱动程序。


<a name="delayed-dispatching"></a>
### 延迟调度

如果你想指定任务不应立即可供队列工作人员处理，你可以在调度任务时使用 `delay` 方法。例如，让我们指定一个任务在分派后 10 分钟内不能用于处理

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * 储存一个新的播客
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // ...

            ProcessPodcast::dispatch($podcast)
                        ->delay(now()->addMinutes(10));

            return redirect('/podcasts');
        }
    }

> **注意**  
> Amazon SQS 队列服务的最大延迟时间为 15 分钟。

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### 响应发送到浏览器后调度

或者，`dispatchAfterResponse` 方法延迟调度任务，直到 HTTP 响应发送到用户的浏览器之后。 即使排队的任务仍在执行，这仍将允许用户开始使用应用程序。这通常应该只用于需要大约一秒钟的工作，例如发送电子邮件。由于它们是在当前 HTTP 请求中处理的，因此以这种方式分派的任务不需要运行队列工作者来处理它们：

    use App\Jobs\SendNotification;

    SendNotification::dispatchAfterResponse();

你也可以 `dispatch` 一个闭包并将 `afterResponse` 方法链接到 `dispatch` 帮助器以在 HTTP 响应发送到浏览器后执行一个闭包

    use App\Mail\WelcomeMessage;
    use Illuminate\Support\Facades\Mail;

    dispatch(function () {
        Mail::to('taylor@example.com')->send(new WelcomeMessage);
    })->afterResponse();

<a name="synchronous-dispatching"></a>
### 同步调度

如果你想立即（同步）调度任务，你可以使用 `dispatchSync` 方法。使用此方法时，任务不会排队，会在当前进程内立即执行：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * 储存一个新的播客。
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // 创建播客

            ProcessPodcast::dispatchSync($podcast);

            return redirect('/podcasts');
        }
    }

<a name="jobs-and-database-transactions"></a>
### 任务 & 数据库事务

虽然在数据库事务中分派任务非常好，但你应该特别注意确保你的任务实际上能够成功执行。在事务中调度任务时，任务可能会在父事务提交之前由工作人员处理。发生这种情况时，你在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。

值得庆幸的是，Laravel 提供了几种解决这个问题的方法。首先，你可以在队列连接的配置数组中设置 `after_commit` 连接选项：

    'redis' => [
        'driver' => 'redis',
        // ...
        'after_commit' => true,
    ],

当 `after_commit` 选项为 true 时，你可以在数据库事务中分发任务；Laravel 会等到所有打开的数据库事务都已提交，然后才会开始分发任务。当然，如果当前没有打开的数据库事务，任务将被立即调度。

如果事务因事务期间发生异常而回滚，则在该事务期间分发的已分发任务将被丢弃。

> **技巧**  
> 将 `after_commit` 配置选项设置为 `true` 还会导致所有排队的事件监听器、邮件、通知和广播事件在所有打开的数据库事务提交后才被调度。

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### 内联指定提交调度

如果你没有将 `after_commit` 队列连接配置选项设置为 `true`，你可能需要在所有打开的数据库事务提交后才调度特定的任务。为此，你可以将 `afterCommit` 方法放到你的调度操作上：

    use App\Jobs\ProcessPodcast;

    ProcessPodcast::dispatch($podcast)->afterCommit();

同样，如果 `after_commit` 配置选项设置为 `true`，则可以指示应立即调度特定作业，而无需等待任何打开的数据库事务提交：

    ProcessPodcast::dispatch($podcast)->beforeCommit();

<a name="job-chaining"></a>
### 任务链

任务链允许你指定一组应在主任务成功执行后按顺序运行的排队任务。如果序列中的一个任务失败，其余的任务将不会运行。要执行一个排队的任务链，你可以使用 `Bus` facade 提供的 `chain` 方法：

    use App\Jobs\OptimizePodcast;
    use App\Jobs\ProcessPodcast;
    use App\Jobs\ReleasePodcast;
    use Illuminate\Support\Facades\Bus;

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->dispatch();

除了链接任务类实例之外，你还可以链接闭包：

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        function () {
            Podcast::update(/* ... */);
        },
    ])->dispatch();

> **注意**  
> 在任务中使用 `$this->delete()` 方法删除任务不会阻止链式任务的处理。只有当链中的任务失败时，链才会停止执行。

<a name="chain-connection-queue"></a>
#### 链式连接 & 队列

如果要指定链接任务应使用的连接和队列，可以使用 `onConnection` 和 `onQueue` 方法。这些方法指定应使用的队列连接和队列名称，除非为排队任务显式分配了不同的连接 / 队列：

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->onConnection('redis')->onQueue('podcasts')->dispatch();

<a name="chain-failures"></a>
#### 链故障

链接任务时，你可以使用 `catch` 方法指定一个闭包，如果链中的任务失败，则应调用该闭包。给定的回调将接收导致任务失败的 `Throwable` 实例：

    use Illuminate\Support\Facades\Bus;
    use Throwable;

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->catch(function (Throwable $e) {
        // 链中的任务失败了...
    })->dispatch();

> **注意**  
> 由于链式回调由 Laravel 队列稍后序列化并执行，因此你不应在链式回调中使用 `$this` 变量。

<a name="customizing-the-queue-and-connection"></a>
### 自定义队列 & 连接

<a name="dispatching-to-a-particular-queue"></a>
#### 分派到特定队列

通过将任务推送到不同的队列，你可以对排队的任务进行「分类」，甚至可以优先考虑分配给各个队列的工作人员数量。请记住，这不会将任务推送到队列配置文件定义的不同队列「连接」，而只会推送到单个连接中的特定队列。要指定队列，请在调度任务时使用 `onQueue` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * 存储一个播客。
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // 创建播客...

            ProcessPodcast::dispatch($podcast)->onQueue('processing');

            return redirect('/podcasts');
        }
    }

或者，你可以通过在任务的构造函数中调用 `onQueue` 方法来指定任务的队列：

    <?php

    namespace App\Jobs;

     use Illuminate\Bus\Queueable;
     use Illuminate\Contracts\Queue\ShouldQueue;
     use Illuminate\Foundation\Bus\Dispatchable;
     use Illuminate\Queue\InteractsWithQueue;
     use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * 创建一个新的任务实例
         */
        public function __construct()
        {
            $this->onQueue('processing');
        }
    }

<a name="dispatching-to-a-particular-connection"></a>
#### 调度到特定连接

如果你的应用程序与多个队列连接交互，你可以使用 `onConnection` 方法指定将任务推送到哪个连接：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * 储存新的播客
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // 创建播客...

            ProcessPodcast::dispatch($podcast)->onConnection('sqs');

            return redirect('/podcasts');
        }
    }

你可以将 `onConnection` 和 `onQueue` 方法链接在一起，以指定任务的连接和队列：

    ProcessPodcast::dispatch($podcast)
                  ->onConnection('sqs')
                  ->onQueue('processing');

或者，你可以通过在任务的构造函数中调用 `onConnection` 方法来指定任务的连接

    <?php

    namespace App\Jobs;

     use Illuminate\Bus\Queueable;
     use Illuminate\Contracts\Queue\ShouldQueue;
     use Illuminate\Foundation\Bus\Dispatchable;
     use Illuminate\Queue\InteractsWithQueue;
     use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * 创建一个新的任务实例。
         */
        public function __construct()
        {
            $this->onConnection('sqs');
        }
    }

<a name="max-job-attempts-and-timeout"></a>
### 指定最大任务尝试 / 超时值

<a name="max-attempts"></a>
#### 最大尝试次数

如果你的一个队列任务遇到了错误，你可能不希望无限制的重试。因此 Laravel 提供了各种方法来指定一个任务可以尝试多少次或多长时间。

指定任务可尝试的最大次数的其中一个方法是，通过 Artisan 命令行上的 `--tries` 开关。这将适用于调度作业的所有任务，除非正在处理的任务指定了最大尝试次数。

```shell
php artisan queue:work --tries=3
```

如果一个任务超过其最大尝试次数，将被视为「失败」的任务。有关处理失败任务的更多信息，可以参考 [处理失败队列](/docs/laravel/10.x/queuesmd/14873#dealing-with-failed-jobs)。如果将 `--tries=0` 提供给 `queue:work` 命令，任务将无限期地重试。

你可以采取更细化的方法来定义任务类本身的最大尝试次数。如果在任务上指定了最大尝试次数，它将优先于命令行上提供的 `--tries` 开关设定的值：

    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * 任务可尝试的次数。
         *
         * @var int
         */
        public $tries = 5;
    }

<a name="time-based-attempts"></a>
#### 基于时间的尝试

除了定义任务失败前尝试的次数之外，还可以定义任务应该超时的时间。这允许在给定的时间范围内尝试任意次数的任务。要定义任务超时的时间，请在任务类中添加 `retryUntil` 方法。这个方法应返回一个 `DateTime` 实例：

    use DateTime;

    /**
     * 确定任务应该超时的时间。
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }

> **技巧**  
> 你也可以在 [队列事件监听器](/docs/laravel/10.x/eventsmd#queued-event-listeners) 上定义一个 `tries` 属性或 `retryUntil` 方法。

<a name="max-exceptions"></a>
#### 最大尝试

有时你可能希望指定一个任务可能会尝试多次，但如果重试由给定数量的未处理异常触发（而不是直接由 `release` 方法释放），则应该失败。为此，你可以在任务类上定义一个 `maxExceptions` 属性：

    <?php

    namespace App\Jobs;

    use Illuminate\Support\Facades\Redis;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * 可以尝试任务的次数
         *
         * @var int
         */
        public $tries = 25;

        /**
         * 失败前允许的最大未处理异常数
         *
         * @var int
         */
        public $maxExceptions = 3;

        /**
         * 执行
         */
        public function handle(): void
        {
            Redis::throttle('key')->allow(10)->every(60)->then(function () {
                // 获得锁，处理播客...
            }, function () {
                // 无法获取锁...
                return $this->release(10);
            });
        }
    }

在此示例中，如果应用程序无法获得 Redis 锁，则该任务将在 10 秒后被释放，并将继续重试最多 25 次。但是，如果任务抛出三个未处理的异常，则任务将失败。

<a name="timeout"></a>
#### 超时

> **注意**  
> 必须安装 `pcntl` PHP 扩展以指定任务超时。

通常，你大致知道你预计排队的任务需要多长时间。出于这个原因，Laravel 允许你指定一个「超时」值。 如果任务的处理时间超过超时值指定的秒数，则处理该任务的任务进程将退出并出现错误。 通常，任务程序将由在你的[服务器上配置的进程管理器](#supervisor-configuration)自动重新启动。

同样，任务可以运行的最大秒数可以使用 Artisan 命令行上的 `--timeout` 开关来指定：

```shell
php artisan queue:work --timeout=30
```

如果任务因不断超时而超过其最大尝试次数，则它将被标记为失败。

你也可以定义允许任务在任务类本身上运行的最大秒数。如果在任务上指定了超时，它将优先于在命令行上指定的任何超时:

    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * 在超时之前任务可以运行的秒数.
         *
         * @var int
         */
        public $timeout = 120;
    }

有些时候，诸如 socket 或在 HTTP 连接之类的 IO 阻止进程可能不会遵守你指定的超时。因此，在使用这些功能时，也应始终尝试使用其 API 指定超时。例如，在使用 Guzzle 时，应始终指定连接并请求的超时时间。

<a name="failing-on-timeout"></a>
#### 超时失败

如果你希望在超时时将任务标记为 [failed](#dealing-with-failed-jobs)，可以在任务类上定义 `$failOnTimeout` 属性：

```php
/**
 * 标示是否应在超时时标记为失败.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### 错误处理

如果在处理任务时抛出异常，任务将自动释放回队列，以便再次尝试。 任务将继续发布，直到尝试达到你的应用程序允许的最大次数为止。最大尝试次数由 `queue:work` Artisan 命令中使用的 `--tries` 开关定义。或者，可以在任务类本身上定义最大尝试次数。有关运行队列处理器的更多信息 [可以在下面找到](#running-the-queue-worker)。

<a name="manually-releasing-a-job"></a>
#### 手动发布

有时你可能希望手动将任务发布回队列，以便稍后再次尝试。你可以通过调用 `release` 方法来完成此操作：

    /**
     * 执行任务。
     */
    public function handle(): void
    {
        // ...

        $this->release();
    }

默认情况下，`release` 方法会将任务发布回队列以供立即处理。但是，通过向 `release` 方法传递一个整数，你可以指示队列在给定的秒数过去之前不使任务可用于处理：

    $this->release(10);

<a name="manually-failing-a-job"></a>
#### 手动使任务失败

有时，你可能需要手动将任务标记为 「failed」。为此，你可以调用 `fail` 方法：

    /**
     * 执行任务。
     */
    public function handle(): void
    {
        // ...

        $this->fail();
    }

如果你捕获了一个异常，你想直接将你的任务标记为失败，你可以将异常传递给 `fail` 方法。 或者，为方便起见，你可以传递一个字符串来表示错误异常信息：

    $this->fail($exception);

    $this->fail('Something went wrong.');

> **技巧**  
> 有关失败任务的更多信息，请查看 [处理任务失败的文档](#dealing-with-failed-jobs).

<a name="job-batching"></a>
## 任务批处理

Laravel 的任务批处理功能允许你轻松地执行一批任务，然后在这批任务执行完毕后执行一些操作。 在开始之前，你应该创建一个数据库迁移以构建一个表来包含有关你的任务批次的元信息，例如它们的完成百分比。 可以使用 `queue:batches-table` Artisan 命令来生成此迁移：

```shell
php artisan queue:batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### 定义可批处理任务

要定义可批处理的任务，你应该像往常一样[创建可排队的任务](#creating-jobs)； 但是，你应该将 `Illuminate\Bus\Batchable` 特性添加到任务类中。 此 `trait` 提供对 `batch` 方法的访问，该方法可用于检索任务正在执行的当前批次：

    <?php

    namespace App\Jobs;

    use Illuminate\Bus\Batchable;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class ImportCsv implements ShouldQueue
    {
        use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * 执行任务。
         */
        public function handle(): void
        {
            if ($this->batch()->cancelled()) {
                // 确定批次是否已被取消...

                return;
            }

            // 导入 CSV 文件的一部分...
        }
    }

<a name="dispatching-batches"></a>
### 调度批次

要调度一批任务，你应该使用 `Bus` 门面的 `batch` 方法。 当然，批处理主要在与完成回调结合使用时有用。 因此，你可以使用 `then`、`catch` 和 `finally` 方法来定义批处理的完成回调。 这些回调中的每一个在被调用时都会收到一个 `Illuminate\Bus\Batch` 实例。 在这个例子中，我们假设我们正在排队一批任务，每个任务处理 CSV 文件中给定数量的行：

    use App\Jobs\ImportCsv;
    use Illuminate\Bus\Batch;
    use Illuminate\Support\Facades\Bus;
    use Throwable;

    $batch = Bus::batch([
        new ImportCsv(1, 100),
        new ImportCsv(101, 200),
        new ImportCsv(201, 300),
        new ImportCsv(301, 400),
        new ImportCsv(401, 500),
    ])->then(function (Batch $batch) {
        // 所有任务均已成功完成...
    })->catch(function (Batch $batch, Throwable $e) {
        // 检测到第一批任务失败...
    })->finally(function (Batch $batch) {
        // 批处理已完成执行...
    })->dispatch();

    return $batch->id;

批次的 ID 可以通过 `$batch->id` 属性访问，可用于 [查询 Laravel 命令总线](#inspecting-batches) 以获取有关批次分派后的信息。

> **注意**  
> 由于批处理回调是由 Laravel 队列序列化并在稍后执行的，因此你不应在回调中使用 `$this` 变量。

<a name="naming-batches"></a>
#### 命名批次

Laravel Horizon 和 Laravel Telescope 等工具如果命名了批次，可能会为批次提供更用户友好的调试信息。要为批处理分配任意名称，你可以在定义批处理时调用 `name` 方法：

    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // 所有任务均已成功完成...
    })->name('Import CSV')->dispatch();

<a name="batch-connection-queue"></a>
#### 批处理连接 & 队列

如果你想指定应用于批处理任务的连接和队列，你可以使用 `onConnection` 和 `onQueue` 方法。 所有批处理任务必须在相同的连接和队列中执行：

    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // 所有任务均已成功完成...
    })->onConnection('redis')->onQueue('imports')->dispatch();

<a name="chains-within-batches"></a>
#### 批量内链

你可以通过将链接的任务放在数组中来在批处理中定义一组 [链接的任务](#job-chaining)。 例如，我们可以并行执行两个任务链，并在两个任务链都完成处理后执行回调：

    use App\Jobs\ReleasePodcast;
    use App\Jobs\SendPodcastReleaseNotification;
    use Illuminate\Bus\Batch;
    use Illuminate\Support\Facades\Bus;

    Bus::batch([
        [
            new ReleasePodcast(1),
            new SendPodcastReleaseNotification(1),
        ],
        [
            new ReleasePodcast(2),
            new SendPodcastReleaseNotification(2),
        ],
    ])->then(function (Batch $batch) {
        // ...
    })->dispatch();

<a name="adding-jobs-to-batches"></a>
### 批量添加任务

有些时候，批量向批处理中添加任务可能很有用。当你需要批量处理数千个任务时，这种模式非常好用，而这些任务在 Web 请求期间可能需要很长时间才能调度。因此，你可能希望调度初始批次的「加载器」任务，这些任务与更多任务相结合：

    $batch = Bus::batch([
        new LoadImportBatch,
        new LoadImportBatch,
        new LoadImportBatch,
    ])->then(function (Batch $batch) {
        // 所有任务都成功完成... 
    })->name('Import Contacts')->dispatch();

在这个例子中，我们将使用 `LoadImportBatch` 实例为批处理添加其他任务。为了实现这个功能，我们可以对批处理实例使用 `add` 方法，该方法可以通过 `batch` 实例访问：

    use App\Jobs\ImportContacts;
    use Illuminate\Support\Collection;

    /**
     * 执行任务。
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            return;
        }

        $this->batch()->add(Collection::times(1000, function () {
            return new ImportContacts;
        }));
    }

> **注意**  
> 你只能将任务添加到当前任务所属的批处理中。

<a name="inspecting-batches"></a>
### 校验批处理

为批处理完成后提供回调的 `Illuminate\Bus\Batch` 实例中具有多种属性和方法，可以帮助你与指定的批处理业务进行交互和检查：

    // 批处理的UUID...
    $batch->id;

    // 批处理的名称（如果已经设置的话）...
    $batch->name;

    // 分配给批处理的任务数量...
    $batch->totalJobs;

    // 队列还没处理的任务数量...
    $batch->pendingJobs;

    // 失败的任务数量...
    $batch->failedJobs;

    // 到目前为止已经处理的任务数量...
    $batch->processedJobs();

    // 批处理已经完成的百分比（0-100）...
    $batch->progress();

    // 批处理是否已经完成执行...
    $batch->finished();

    // 取消批处理的运行...
    $batch->cancel();

    // 批处理是否已经取消...
    $batch->cancelled();

<a name="returning-batches-from-routes"></a>
#### 从路由返回批次

所有 `Illuminate\Bus\Batch` 实例都是 JSON 可序列化的，这意味着你可以直接从应用程序的一个路由返回它们，以检索包含有关批处理的信息的 JSON 有效负载，包括其完成进度。这样可以方便地在应用程序的 UI 中显示有关批处理完成进度的信息。

要通过 ID 检索批次，你可以使用 `Bus` 外观的 `findBatch` 方法：

    use Illuminate\Support\Facades\Bus;
    use Illuminate\Support\Facades\Route;

    Route::get('/batch/{batchId}', function (string $batchId) {
        return Bus::findBatch($batchId);
    });

<a name="cancelling-batches"></a>
### 取消批次

有时你可能需要取消给定批处理的执行。这可以通过调用 `Illuminate\Bus\Batch` 实例的 `cancel` 方法来完成：

    /**
     * 执行任务。
     */
    public function handle(): void
    {
        if ($this->user->exceedsImportLimit()) {
            return $this->batch()->cancel();
        }

        if ($this->batch()->cancelled()) {
            return;
        }
    }

正如你在前面的示例中可能已经注意到的那样，批处理任务通常应在继续执行之前确定其相应的批处理是否已被取消。 但是，为了方便起见，你可以将 `SkipIfBatchCancelled` [中间件](#job-middleware) 分配给作业。 顾名思义，如果相应的批次已被取消，此中间件将指示 Laravel 不处理该作业：

    use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

    /**
     * 获取任务应通过的中间件。
     */
    public function middleware(): array
    {
        return [new SkipIfBatchCancelled];
    }

<a name="batch-failures"></a>
### 批处理失败

当批处理任务失败时，将调用 `catch` 回调（如果已分配）。此回调仅针对批处理中失败的第一个任务调用。

<a name="allowing-failures"></a>
#### 允许失败

当批处理中的某个任务失败时，Laravel 会自动将该批处理标记为「已取消」。如果你愿意，你可以禁用此行为，以便任务失败不会自动将批处理标记为已取消。这可以通过在调度批处理时调用 `allowFailures` 方法来完成：

    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // 所有任务均已成功完成...
    })->allowFailures()->dispatch();

<a name="retrying-failed-batch-jobs"></a>
#### 重试失败的批处理任务

为方便起见，Laravel 提供了一个 `queue:retry-batch` Artisan 命令，允许你轻松重试给定批次的所有失败任务。 `queue:retry-batch` 命令接受应该重试失败任务的批处理的 UUID：

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### 修剪批次

如果不进行修剪，`job_batches` 表可以非常快速地积累记录。为了缓解这种情况，你应该 [schedule](/docs/laravel/10.x/scheduling) `queue:prune-batches` Artisan 命令每天运行：

    $schedule->command('queue:prune-batches')->daily();

默认情况下，将修剪所有超过 24 小时的已完成批次。你可以在调用命令时使用 `hours` 选项来确定保留批处理数据的时间。例如，以下命令将删除 48 小时前完成的所有批次：

    $schedule->command('queue:prune-batches --hours=48')->daily();

有时，你的 `jobs_batches` 表可能会累积从未成功完成的批次的批次记录，例如任务失败且该任务从未成功重试的批次。 你可以使用 `unfinished` 选项指示 `queue:prune-batches` 命令修剪这些未完成的批处理记录：

    $schedule->command('queue:prune-batches --hours=48 --unfinished=72')->daily();

同样，你的 `jobs_batches` 表也可能会累积已取消批次的批次记录。 你可以使用 `cancelled` 选项指示 `queue:prune-batches` 命令修剪这些已取消的批记录：

    $schedule->command('queue:prune-batches --hours=48 --cancelled=72')->daily();

<a name="queueing-closures"></a>
## 队列闭包

除了将任务类分派到队列之外，你还可以分派一个闭包。这对于需要在当前请求周期之外执行的快速、简单的任务非常有用。当向队列分派闭包时，闭包的代码内容是加密签名的，因此它不能在传输过程中被修改：

    $podcast = App\Podcast::find(1);

    dispatch(function () use ($podcast) {
        $podcast->publish();
    });

使用 `catch` 方法，你可以提供一个闭包，如果排队的闭包在耗尽所有队列的[配置的重试次数](#max-job-attempts-and-timeout) 后未能成功完成，则应执行该闭包：

    use Throwable;

    dispatch(function () use ($podcast) {
        $podcast->publish();
    })->catch(function (Throwable $e) {
        // 这个任务失败了...
    });

> **注意**  
> 由于 `catch` 回调由 Laravel 队列稍后序列化并执行，因此你不应在 `catch` 回调中使用 `$this` 变量。

<a name="running-the-queue-worker"></a>
## 运行队列工作者

<a name="the-queue-work-command"></a>
### `queue:work` 命令

Laravel 包含一个 Artisan 命令，该命令将启动队列进程并在新任务被推送到队列时处理它们。 你可以使用 `queue:work` Artisan 命令运行任务进程。请注意，一旦 `queue:work` 命令启动，它将继续运行，直到手动停止或关闭终端：

```shell
php artisan queue:work
```

> **技巧**  
> 要保持 `queue:work` 进程在后台永久运行，你应该使用 [Supervisor](#supervisor-configuration) 等进程监视器来确保队列工作进程不会停止运行。



如果你希望处理的任务 ID 包含在命令的输出中，则可以在调用 `queue:work` 命令时包含 -v 标志：

```shell
php artisan queue:work -v
```

请记住，队列任务工作者是长期存在的进程，并将启动的应用程序状态存储在内存中。 因此，他们在启动后不会注意到你的代码库中的更改。 因此，在你的部署过程中，请务必[重新启动你的任务队列进程](#queue-workers-and-deployment)。 此外，请记住，你的应用程序创建或修改的任何静态状态都不会在任务启动之间自动重置。

或者，你可以运行 `queue:listen` 命令。 使用 `queue:listen` 命令时，当你想要重新加载更新后的代码或重置应用程序状态时，无需手动重启 worker； 但是，此命令的效率明显低于 `queue:work` 命令：

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### 运行多个队列进程

要将多个 worker 分配到一个队列并同时处理任务，你应该简单地启动多个 `queue:work` 进程。 这可以通过终端中的多个选项卡在本地完成，也可以使用流程管理器的配置设置在生产环境中完成。 [使用 Supervisor 时](#supervisor-configuration)，你可以使用 `numprocs` 配置值。

<a name="specifying-the-connection-queue"></a>
#### 指定连接 & 队列

你还可以指定工作人员应使用哪个队列连接。 传递给 `work` 命令的连接名称应对应于 `config/queue.php` 配置文件中定义的连接之一：

```shell
php artisan queue:work redis
```

默认情况下，`queue:work` 命令只处理给定连接上默认队列的任务。 但是，你可以通过仅处理给定连接的特定队列来进一步自定义你的队列工作者。 例如，如果你的所有电子邮件都在你的 `redis` 队列连接上的 `emails` 队列中处理，你可以发出以下命令来启动只处理该队列的工作程序：

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### Processing A Specified Number Of Jobs

`--once` 选项可用于指定进程仅处理队列中的单个任务

```shell
php artisan queue:work --once
```

`--max-jobs` 选项可用于指示 worker 处理给定数量的任务然后退出。 此选项在与 [Supervisor](#supervisor-configuration) 结合使用时可能很有用，这样你的工作人员在处理给定数量的任务后会自动重新启动，释放他们可能积累的任何内存：

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### 处理所有排队的任务然后退出

`--stop-when-empty` 选项可用于指定进程处理所有作业，然后正常退出。如果你希望在队列为空后关闭容器，则此选项在处理 Docker 容器中的 Laravel 队列时很有用

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### 在给定的秒数内处理任务

`--max-time` 选项可用于指示进程给定的秒数内处理作业，然后退出。 当与 [Supervisor](#supervisor-configuration) 结合使用时，此选项可能很有用，这样你的工作人员在处理作业给定时间后会自动重新启动，释放他们可能积累的任何内存：

```shell
# 处理进程一小时，然后退出...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### 进程睡眠时间

当队列中有任务可用时，进程将继续处理作业，而不会在它们之间产生延迟。但是，`sleep` 选项决定了如果没有可用的新任务，进程将 `sleep` 多少秒。 睡眠时，进程不会处理任何新的作业 - 任务将在进程再次唤醒后处理。

```shell
php artisan queue:work --sleep=3
```

<a name="resource-considerations"></a>
#### 资源注意事项

守护进程队列在处理每个任务之前不会 `reboot` 框架。因此，你应该在每个任务完成后释放所有繁重的资源。例如，如果你正在使用 GD 库进行图像处理，你应该在处理完图像后使用 `imagedestroy` 释放内存。

<a name="queue-priorities"></a>
### 队列优先级

有时你可能希望优先处理队列的处理方式。例如，在 `config/queue.php` 配置文件中，你可以将 `redis` 连接的默认 `queue` 设置为 `low`。 但是，有时你可能希望将作业推送到 `high` 优先级队列，如下所示：

    dispatch((new Job)->onQueue('high'));

要启动一个进程，在继续处理 `low` 队列上的任何任务之前验证所有 `high` 队列任务是否已处理，请将队列名称的逗号分隔列表传递给 `work` 命令：

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### 队列进程 & 部署

由于队列任务是长期存在的进程，如果不重新启动，他们不会注意到代码的更改。因此，使用队列任务部署应用程序的最简单方法是在部署过程中重新启动任务。你可以通过发出 `queue:restart` 命令优雅地重新启动所有进程：

```shell
php artisan queue:restart
```

此命令将指示所有队列进程在处理完当前任务后正常退出，以免丢失现有任务。由于队列任务将在执行 `queue:restart` 命令时退出，你应该运行诸如 [Supervisor](#supervisor-configuration) 之类的进程管理器来自动重新启动队列任务。

>**注意**
>队列使用 [cache](/docs/laravel/10.x/cache)  来存储重启信号，因此你应该在使用此功能之前验证是否为你的应用程序正确配置了缓存驱动程序。

<a name="job-expirations-and-timeouts"></a>
### 任务到期 & 超时

<a name="job-expiration"></a>
#### 任务到期

在`config/queue.php`配置文件中，每个队列连接都定义了一个`retry_after`选项。该选项指定队列连接在重试正在处理的作业之前应该等待多少秒。例如，如果`retry_after`的值设置为`90`，如果作业已经处理了90秒而没有被释放或删除，则该作业将被释放回队列。通常，你应该将`retry_after`值设置为作业完成处理所需的最大秒数。

>**警告**
>唯一不包含 `retry_after` 值的队列连接是Amazon SQS。SQS将根据AWS控制台内管理的 [默认可见性超时](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) 重试作业。

<a name="worker-timeouts"></a>
#### 进程超时

`queue:work` Artisan命令公开了一个`--timeout`选项。默认情况下，`--timeout`值为60秒。如果任务的处理时间超过超时值指定的秒数，则处理该任务的进程将退出并出现错误。通常，工作程序将由 [你的服务器上配置的进程管理器](#supervisor-configuration) 自动重新启动：

```shell
php artisan queue:work --timeout=60
```

`retry_after` 配置选项和 `--timeout` CLI 选项是不同的，但它们协同工作以确保任务不会丢失并且任务仅成功处理一次。
> **警告**
> `--timeout` 值应始终比 `retry_after` 配置值至少短几秒钟。 这将确保处理冻结任务的进程始终在重试任务之前终止。 如果你的 `--timeout` 选项比你的 `retry_after` 配置值长，你的任务可能会被处理两次。

<a name="supervisor-configuration"></a>
## Supervisor 配置

在生产中，你需要一种方法来保持 `queue:work` 进程运行。 `queue:work` 进程可能会因多种原因停止运行，例如超过 worker 超时或执行 `queue:restart` 命令。
出于这个原因，你需要配置一个进程监视器，它可以检测你的 `queue:work` 进程何时退出并自动重新启动它们。此外，进程监视器可以让你指定要同时运行多少个 `queue:work` 进程。Supervisor 是 Linux 环境中常用的进程监视器，我们将在下面的文档中讨论如何配置它。

<a name="installing-supervisor"></a>
#### 安装 Supervisor

Supervisor 是 Linux 操作系统的进程监视器，如果它们失败，它将自动重新启动你的 `queue:work` 进程。要在 Ubuntu 上安装 Supervisor，你可以使用以下命令：

```shell
sudo apt-get install supervisor
```
>**注意**
>如果你自己配置和管理 Supervisor 听起来很费力，请考虑使用 [Laravel Forge](https://forge.laravel.com)，它会自动为你的生产 Laravel 项目安装和配置 Supervisor。

<a name="configuring-supervisor"></a>
#### 配置 Supervisor

Supervisor 配置文件通常存储在 `/etc/supervisor/conf.d` 目录中。在这个目录中，你可以创建任意数量的配置文件来指示 Supervisor 应该如何监控你的进程。例如，让我们创建一个启动和监控 `queue:work` 进程的 `laravel-worker.conf` 文件：

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

在这个例子中，`numprocs` 指令将指示 Supervisor 运行 8 个 `queue:work` 进程并监控所有进程，如果它们失败则自动重新启动它们。你应该更改配置的「命令」指令以反映你所需的队列连接和任务选项。

> **警告**
> 你应该确保 `stopwaitsecs` 的值大于运行时间最长的作业所消耗的秒数。否则，Supervisor 可能会在作业完成处理之前将其终止。

<a name="starting-supervisor"></a>
#### 开始 Supervisor

创建配置文件后，你可以使用以下命令更新 Supervisor 配置并启动进程：

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start laravel-worker:*
```

有关 Supervisor 的更多信息，请参阅 [Supervisor 文档](http://supervisord.org/index.html)。

<a name="dealing-with-failed-jobs"></a>
## 处理失败的任务

有时，你队列的任务会失败。别担心，事情并不总是按计划进行！ Laravel 提供了一种方便的方法来 [指一个任务应该尝试的最大次数](#max-job-attempts-and-timeout)。在异步任务超过此尝试次数后，它将被插入到 `failed_jobs` 数据库表中。 失败的 [同步调度的任务](/docs/laravel/10.x/queuesmd#synchronous-dispatching) 不存储在此表中，它们的异常由应用程序立即处理。


创建 `failed_jobs` 表的迁移通常已经存在于新的 Laravel 应用程序中。但是，如果你的应用程序不包含此表的迁移，你可以使用 `queue:failed-table` 命令来创建迁移：

```shell
php artisan queue:failed-table

php artisan migrate
```

运行 [queue worker](#running-the-queue-worker) 进程时，你可以使用 `queue:work` 命令上的 `--tries` 开关指定任务应尝试的最大次数。如果你没有为 `--tries` 选项指定值，则作业将仅尝试一次或与任务类的 `$tries` 属性指定的次数相同：

```shell
php artisan queue:work redis --tries=3
```

使用 `--backoff` 选项，你可以指定 Laravel 在重试遇到异常的任务之前应该等待多少秒。默认情况下，任务会立即释放回队列，以便可以再次尝试：

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

如果你想配置 Laravel 在重试每个任务遇到异常的任务之前应该等待多少秒，你可以通过在你的任务类上定义一个 `backoff` 属性来实现：

    /**
     * 重试任务前等待的秒数
     *
     * @var int
     */
    public $backoff = 3;

如果你需要更复杂的逻辑来确定任务的退避时间，你可以在你的任务类上定义一个 `backoff` 方法：

    /**
    * 计算重试任务之前要等待的秒数
    */
    public function backoff(): int
    {
        return 3;
    }

你可以通过从 `backoff` 方法返回一组退避值来轻松配置 “exponential” 退避。在此示例中，第一次重试的重试延迟为 1 秒，第二次重试为 5 秒，第三次重试为 10 秒：

    /**
    * 计算重试任务之前要等待的秒数
    *
    * @return array<int, int>
    */
    public function backoff(): array
    {
        return [1, 5, 10];
    }

<a name="cleaning-up-after-failed-jobs"></a>
### 任务失败后清理

当特定任务失败时，你可能希望向用户发送警报或恢复该任务部分完成的任何操作。为此，你可以在任务类上定义一个 `failed` 方法。导致作业失败的 `Throwable` 实例将被传递给 `failed` 方法：

    <?php

    namespace App\Jobs;

    use App\Models\Podcast;
    use App\Services\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;
    use Throwable;

    class ProcessPodcast implements ShouldQueue
    {
        use InteractsWithQueue, Queueable, SerializesModels;

        /**
         * 创建新任务实例
         */
        public function __construct(
            public Podcast $podcast,
        ) {}

        /**
         * 执行任务
         */
        public function handle(AudioProcessor $processor): void
        {
            // 处理上传的播客...
        }

        /**
         * 处理失败作业
         */
        public function failed(Throwable $exception): void
        {
            // 向用户发送失败通知等...
        }
    }

> **注意**  
> 在调用 `failed` 方法之前实例化任务的新实例；因此，在 `handle` 方法中可能发生的任何类属性修改都将丢失。

<a name="retrying-failed-jobs"></a>
### 重试失败的任务

要查看已插入到你的 `failed_jobs` 数据库表中的所有失败任务，你可以使用 `queue:failed` Artisan 命令：

```shell
php artisan queue:failed
```

`queue:failed` 命令将列出任务 ID、连接、队列、失败时间和有关任务的其他信息。任务 ID 可用于重试失败的任务。例如，要重试 ID 为 `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece` 的失败任务，请发出以下命令：

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

如有必要，可以向命令传递多个 ID:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

还可以重试指定队列的所有失败任务：

```shell
php artisan queue:retry --queue=name
```

重试所有失败任务，可以执行 `queue:retry` 命令，并将 `all` 作为 ID 传递：

```shell
php artisan queue:retry all
```

如果要删除指定的失败任务，可以使用 `queue:forget` 命令：

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> **技巧**  
> 使用 [Horizon](/docs/laravel/10.x/horizon) 时，应该使用 `Horizon:forget` 命令来删除失败任务，而不是 `queue:forget` 命令。

删除 `failed_jobs` 表中所有失败任务，可以使用 `queue:flush` 命令:

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### 忽略缺失的模型

向任务中注入 `Eloquent` 模型时，模型会在注入队列之前自动序列化，并在处理任务时从数据库中重新检索。但是，如果在任务等待消费时删除了模型，则任务可能会失败，抛出 `ModelNotFoundException` 异常。

为方便起见，可以把将任务的 `deleteWhenMissingModels` 属性设置为 `true`，这样会自动删除缺少模型的任务。当此属性设置为 `true` 时，Laravel 会放弃该任务，并且不会引发异常：

    /**
     * 如果任务的模型不存在，则删除该任务
     *
     * @var bool
     */
    public $deleteWhenMissingModels = true;

<a name="pruning-failed-jobs"></a>
### 删除失败的任务

你可以通过调用 `queue:prune-failed` Artisan 命令删除应用程序的 `failed_jobs` 表中的所有记录：

```shell
php artisan queue:prune-failed
```

默认情况下，将删除所有超过 24 小时的失败任务记录，如果为命令提供 `--hours` 选项，则仅保留在过去 N 小时内插入的失败任务记录。例如，以下命令将删除超过 48 小时前插入的所有失败任务记录：

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### 在 DynamoDB 中存储失败的任务

Laravel 还支持将失败的任务记录存储在 [DynamoDB](https://aws.amazon.com/dynamodb) 而不是关系数据库表中。但是，你必须创建一个 DynamoDB 表来存储所有失败的任务记录。通常，此表应命名为 `failed_jobs`，但你应根据应用程序的 `queue` 配置文件中的 `queue.failed.table` 配置值命名该表。

`failed_jobs` 表应该有一个名为 `application` 的字符串主分区键和一个名为 uuid 的字符串主排序键。键的 `application` 部分将包含应用程序的名称，该名称由应用程序的 `app` 配置文件中的 `name` 配置值定义。由于应用程序名称是 DynamoDB 表键的一部分，因此你可以使用同一个表来存储多个 Laravel 应用程序的失败任务。

此外，请确保你安装了 AWS 开发工具包，以便你的 Laravel 应用程序可以与 Amazon DynamoDB 通信：

```shell
composer require aws/aws-sdk-php
```

接下来，`queue.failed.driver` 配置选项的值设置为 `dynamodb`。此外，你应该在失败的作业配置数组中定义 `key`、`secret` 和 `region` 配置选项。 这些选项将用于向 AWS 进行身份验证。 当使用 `dynamodb` 驱动程序时，`queue.failed.database` 配置选项不是必须的：

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a name="disabling-failed-job-storage"></a>
### 禁用失败的任务存储

你可以通过将 `queue.failed.driver` 配置选项的值设置为 `null` 来指示 Laravel 丢弃失败的任务而不存储它们。通过 `QUEUE_FAILED_DRIVER` 环境变量来完成：

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### 失败的任务事件

如果你想注册一个在作业失败时调用的事件监听器，你可以使用 `Queue` facade的 failing 方法。例如，我们可以从 Laravel 中包含的 `AppServiceProvider` 的 `boot` 方法为这个事件附加一个闭包：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Queue\Events\JobFailed;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任何应用程序服务
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任何应用程序服务
         */
        public function boot(): void
        {
            Queue::failing(function (JobFailed $event) {
                // $event->connectionName
                // $event->job
                // $event->exception
            });
        }
    }

<a name="clearing-jobs-from-queues"></a>
## 从队列中清除任务

> **技巧**
> 使用 [Horizon](/docs/laravel/10.x/horizon) 时，应使用 `horizon:clear` 命令从队列中清除作业，而不是使用 `queue:clear` 命令。

如果你想从默认连接的默认队列中删除所有任务，你可以使用 `queue:clear` Artisan 命令来执行此操作：

```shell
php artisan queue:clear
```

你还可以提供 `connection` 参数和 `queue` 选项以从特定连接和队列中删除任务：

```shell
php artisan queue:clear redis --queue=emails
```

> **注意**
> 从队列中清除任务仅适用于 SQS、Redis 和数据库队列驱动程序。 此外，SQS 消息删除过程最多需要 60 秒，因此在你清除队列后 60 秒内发送到 SQS 队列的任务也可能会被删除。

<a name="monitoring-your-queues"></a>
## 监控你的队列

如果你的队列突然涌入了大量的任务，它会导致队列任务繁重，从而增加了任务的完成时间，想你所想， Laravel 可以在队列执行超过设定的阈值时候提醒你。

在开始之前， 你需要通过 `queue:monitor` 命令配置它 [每分钟执行一次](/docs/laravel/10.x/scheduling)。这个命令可以设定任务的名称，以及你想要设定的任务阈值：

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

当你的任务超过设定阈值时候，仅通过这个方法还不足以触发通知，此时会触发一个 `Illuminate\Queue\Events\QueueBusy` 事件。你可以在你的应用 `EventServiceProvider` 来监听这个事件，从而将监听结果通知给你的开发团队：

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 为你的应用程序注册其他更多事件
 */
public function boot(): void
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
                ->notify(new QueueHasLongWaitTime(
                    $event->connection,
                    $event->queue,
                    $event->size
                ));
    });
}
```

<a name="testing"></a>
## 测试

当测试调度任务的代码时，你可能希望指示 Laravel 不要实际执行任务本身，因为任务的代码可以直接和独立于调度它的代码进行测试。 当然，要测试任务本身，你可以实例化一个任务实例并在测试中直接调用 `handle` 方法。

你可以使用 `Queue` facade 的 `fake` 方法来防止排队的任务实际被推送到队列中。 在调用 `Queue` facade 的 `fake` 方法后，你可以断言应用程序试图将任务推送到队列中：

    <?php

    namespace Tests\Feature;

    use App\Jobs\AnotherJob;
    use App\Jobs\FinalJob;
    use App\Jobs\ShipOrder;
    use Illuminate\Support\Facades\Queue;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped(): void
        {
            Queue::fake();

            // 执行订单发货...

            // 断言没有任务被推送......
            Queue::assertNothingPushed();

            // 断言一个任务被推送到一个给定的队列...
            Queue::assertPushedOn('queue-name', ShipOrder::class);

            // 断言任务被推了两次...
            Queue::assertPushed(ShipOrder::class, 2);

            // 断言任务没有被推送...
            Queue::assertNotPushed(AnotherJob::class);

            // 断言闭包被推送到队列中...
            Queue::assertClosurePushed();
        }
    }

你可以将闭包传递给 `assertPushed` 或 `assertNotPushed` 方法，以断言已推送通过给定「真实性测试」的任务。 如果至少有一项任务被推送并通过了给定的真值测试，则断言将成功：

    Queue::assertPushed(function (ShipOrder $job) use ($order) {
        return $job->order->id === $order->id;
    });

<a name="faking-a-subset-of-jobs"></a>
### 伪造任务的一个子集

如果你只需要伪造特定的任务，同时允许你的其他任务正常执行，你可以将应该伪造的任务的类名传递给 fake 方法：

    public function test_orders_can_be_shipped(): void
    {
        Queue::fake([
            ShipOrder::class,
        ]);

        // 执行订单发货...

        // 断言任务被推了两次......
        Queue::assertPushed(ShipOrder::class, 2);
    }

你可以使用 `except` 方法伪造除一组指定任务之外的所有任务：

    Queue::fake()->except([
        ShipOrder::class,
    ]);

<a name="testing-job-chains"></a>
### 测试任务链

要测试任务链，你需要利用 `Bus` 外观的伪造功能。 `Bus` 门面的 `assertChained` 方法可用于断言 [任务链](/docs/laravel/10.x/queues#job-chaining) 已被分派。 `assertChained` 方法接受一个链式任务数组作为它的第一个参数：

    use App\Jobs\RecordShipment;
    use App\Jobs\ShipOrder;
    use App\Jobs\UpdateInventory;
    use Illuminate\Support\Facades\Bus;

    Bus::fake();

    // ...

    Bus::assertChained([
        ShipOrder::class,
        RecordShipment::class,
        UpdateInventory::class
    ]);

正如你在上面的示例中看到的，链式任务数组可能是任务类名称的数组。 但是，你也可以提供一组实际的任务实例。 这样做时，Laravel 将确保任务实例属于同一类，并且与你的应用程序调度的链式任务具有相同的属性值：

    Bus::assertChained([
        new ShipOrder,
        new RecordShipment,
        new UpdateInventory,
    ]);

你可以使用 `assertDispatchedWithoutChain` 方法来断言一个任务是在没有任务链的情况下被推送的：

    Bus::assertDispatchedWithoutChain(ShipOrder::class);

<a name="testing-job-batches"></a>
### 测试任务批处理

`Bus` 门面的 `assertBatched` 方法可用于断言 [批处理任务](/docs/laravel/10.x/queuesmd#job-batching) 已分派。 给 `assertBatched` 方法的闭包接收一个 `Illuminate\Bus\PendingBatch` 的实例，它可用于检查批处理中的任务：

    use Illuminate\Bus\PendingBatch;
    use Illuminate\Support\Facades\Bus;

    Bus::fake();

    // ...

    Bus::assertBatched(function (PendingBatch $batch) {
        return $batch->name == 'import-csv' &&
               $batch->jobs->count() === 10;
    });

<a name="testing-job-batch-interaction"></a>
#### 测试任务 / 批处理交互

此外，你可能偶尔需要测试单个任务与其基础批处理的交互。 例如，你可能需要测试任务是否取消了对其批次的进一步处理。 为此，你需要通过 `withFakeBatch` 方法为任务分配一个假批次。 `withFakeBatch` 方法返回一个包含任务实例和假批次的元组：

    [$job, $batch] = (new ShipOrder)->withFakeBatch();

    $job->handle();

    $this->assertTrue($batch->cancelled());
    $this->assertEmpty($batch->added);

<a name="job-events"></a>
## 任务事件

使用 `Queue` [facade](/docs/laravel/10.x/facades) 上的 `before` 和 `after` 方法，你可以指定要在处理排队任务之前或之后执行的回调。 这些回调是为仪表板执行额外日志记录或增量统计的绝佳机会。 通常，你应该从 [服务提供者](/docs/laravel/10.x/providers) 的 `boot` 方法中调用这些方法。 例如，我们可以使用 Laravel 自带的 `AppServiceProvider`：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Queue\Events\JobProcessed;
    use Illuminate\Queue\Events\JobProcessing;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任何应用程序服务。
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任何应用程序服务。
         */
        public function boot(): void
        {
            Queue::before(function (JobProcessing $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });

            Queue::after(function (JobProcessed $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });
        }
    }

通过使用 `Queue` [facade](/docs/laravel/10.x/facades) 的 `looping` 方法 ，你可以在 worker 尝试从队列获取任务之前执行指定的回调。例如，你可以注册一个闭包，用以回滚之前失败任务打开的任何事务：

    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Queue;

    Queue::looping(function () {
        while (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
    });

