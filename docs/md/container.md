# 服务容器

- [介绍](#introduction)
    - [零配置解决方案](#zero-configuration-resolution)
    - [何时使用容器](#when-to-use-the-container)
- [绑定](#binding)
    - [绑定基础](#binding-basics)
    - [接口到实现的绑定](#binding-interfaces-to-implementations)
    - [上下文绑定](#contextual-binding)
    - [绑定原语](#binding-primitives)
    - [绑定变长参数类型](#binding-typed-variadics)
    - [标签](#tagging)
    - [继承绑定](#extending-bindings)
- [解析](#resolving)
    - [make 方法](#the-make-method)
    - [自动注入](#automatic-injection)
- [方法调用 & 注入](#method-invocation-and-injection)
- [容器事件](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## 简介

Laravel 服务容器是一个用于管理类依赖以及实现依赖注入的强有力工具。依赖注入这个名词表面看起来花哨，实质上是指：通过构造函数，或者某些情况下通过「setter」方法将类依赖「注入」到类中。
我们来看一个简单的例子：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Repositories\UserRepository;
    use App\Models\User;

    class UserController extends Controller
    {
        /**
         * user 仓库的实现
         *
         * @var UserRepository
         */
        protected $users;

        /**
         * 创建一个新的控制器实例
         *
         * @param  UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }

        /**
         * 展示给定用户的信息
         *
         * @param  int  $id
         * @return Response
         */
        public function show($id)
        {
            $user = $this->users->find($id);

            return view('user.profile', ['user' => $user]);
        }
    }

在此示例中，`UserController` 控制器需要从数据源中获取 `users`。 因此，我们可以注入一个能够获取 users 的服务。 在这种情况下，我们的存储仓库 `UserRepository` 极有可能使用 [Eloquent](/docs/laravel/9.x/eloquent) 从数据库中检索用户信息。 然而，由于仓库是通过 UserRepository 注入的，我们可以轻易的将其切换为另一个实现。 另外，这种方式的便利之处也体现在：当需要为应用编写测试的时候，我们也可以很轻松地 “模拟” 或者创建一个 UserRepository 存储层的伪实现来操作。


深入理解服务容器，对于构建一个强大的、大型的应用，以及对 Laravel 核心本身的贡献都是至关重要的。

<a name="zero-configuration-resolution"></a>
### 零配置解决方案

如果一个类没有依赖项或只依赖于其他具体类（而不是接口），则不需要指定容器如何解析该类。例如，您可以将以下代码放在 `routes/web.php` 文件中：

    <?php

    class Service
    {
        //
    }

    Route::get('/', function (Service $service) {
        die(get_class($service));
    });

在这个例子中，点击应用程序的 `/` 路由将自动解析 `Service` 类并将其注入到路由的处理程序中。 这是一个有趣的改变。 这意味着您可以开发应用程序并利用依赖注入，而不必担心臃肿的配置文件。

很荣幸的通知您,在构建 Laravel 应用程序时，您将要编写的许多类都可以通过容器自动接收它们的依赖关系，包括 [控制器](/docs/laravel/9.x/controllers)、[事件监听器](/docs/laravel/9.x/events)、 [中间件](/docs/laravel/9.x/middleware) 等等。 此外，您可以在 [队列系统](/docs/laravel/9.x/queues) 的 `handle` 方法中键入提示依赖项。 一旦你尝到了自动和零配置依赖注入的力量，你就会觉得没有它是不可以开发的。

<a name="when-to-use-the-container"></a>
### 何时使用容器

得益于零配置解决方案，通常情况下，你只需要在路由、控制器、事件侦听器和其他地方键入提示依赖项，而不必手动与容器打交道。例如，可以在路由定义中键入 `Illuminate\Http\Request` 对象，以便轻松访问当前请求的 Request 类。尽管我们不必与容器交互来编写此代码，但它在幕后管理着这些依赖项的注入：

    use Illuminate\Http\Request;

    Route::get('/', function (Request $request) {
        // ...
    });



在许多情况下，由于自动依赖注入和 [facades](/docs/laravel/9.x/facades)，你在构建 Laravel 应用程序的时候无需手动绑定或解析容器中的任何内容。那么，你将在什么时候手动与容器打交道呢？让我们来看看下面两种情况。

首先，如果您编写了一个实现接口的类，并希望在路由或类的构造函数上键入该接口的提示，则必须 [告诉容器如何解析该接口](#binding-interfaces-to-implementations)。第二，如果您正在 [编写一个 Laravel包](/docs/laravel/9.x/packages) 计划与其他 Laravel 开发人员共享，那么您可能需要将包的服务绑定到容器中。

<a name="binding"></a>
## 绑定

<a name="binding-basics"></a>
### 基础绑定

<a name="simple-bindings"></a>
#### 简单绑定

几乎所有的服务容器绑定都会在 [服务提供者](/docs/laravel/9.x/providers) 中注册，下面示例中的大多数将演示如何在该上下文（服务提供者）中使用容器。

在服务提供者中，你总是可以通过 `$this->app` 属性访问容器。我们可以通过容器的 `bind` 方法注册绑定，`bind` 方法的第一个参数为要绑定的类或接口名，第二个参数是一个返回类实例的闭包：

    use App\Services\Transistor;
    use App\Services\PodcastParser;

    $this->app->bind(Transistor::class, function ($app) {
        return new Transistor($app->make(PodcastParser::class));
    });

注意，我们接受容器本身作为解析器的参数。然后，我们可以使用容器来解析正在构建的对象的子依赖。

如前所述，您通常会在服务提供者内部与容器进行交互；但是，如果您希望在服务提供者外部与容器进行交互，则可以通过 `App` [facade](/docs/laravel/9.x/facades) 进行:

    use App\Services\Transistor;
    use Illuminate\Support\Facades\App;

    App::bind(Transistor::class, function ($app) {
        // ...
    });

> 技巧：如果类不依赖于任何接口，则不需要将它们绑定到容器中。不需要指示容器如何构建这些对象，因为它可以使用反射自动解析这些对象。



<a name="binding-a-singleton"></a>
#### 单例的绑定

`singleton` 方法将类或接口绑定到只应解析一次的容器中。解析单例绑定后，后续调用容器时将返回相同的对象实例：

    use App\Services\Transistor;
    use App\Services\PodcastParser;

    $this->app->singleton(Transistor::class, function ($app) {
        return new Transistor($app->make(PodcastParser::class));
    });

<a name="binding-scoped"></a>
#### 绑定作用域单例

该 `scoped` 方法将一个类或接口绑定到容器中，该容器只应在给定的 Laravel 请求/作业生命周期内解析一次。虽然该方法与 `singleton` 方法类似，但是当 Laravel 应用程序开始一个新的 “生命周期” 时， 使用 `scoped` 方法注册的实例 将被刷新，例如当 [Laravel Octane](/docs/laravel/9.x/octane) 工作者处理新请求或 Laravel [队列工作者](/docs/laravel/9.x/queues) 处理新作业时：

    use App\Services\Transistor;
    use App\Services\PodcastParser;

    $this->app->scoped(Transistor::class, function ($app) {
        return new Transistor($app->make(PodcastParser::class));
    });

<a name="binding-instances"></a>
#### 绑定实例

还可以使用 `instance` 方法将现有对象实例绑定到容器中。给定实例将始终在后续调用容器时返回：

    use App\Services\Transistor;
    use App\Services\PodcastParser;

    $service = new Transistor(new PodcastParser);

    $this->app->instance(Transistor::class, $service);

<a name="binding-interfaces-to-implementations"></a>
### 绑定接口至实现

服务容器的一个非常强大的特性是它能够将接口绑定到给定的实现。例如，假设我们有一个  `EventPusher` 接口和一个 `RedisEventPusher` 实现。一旦我们对这个接口的 `RedisEventPusher` 实现进行了编码，我们就可以像这样在服务容器中注册它：

    use App\Contracts\EventPusher;
    use App\Services\RedisEventPusher;

    $this->app->bind(EventPusher::class, RedisEventPusher::class);



此语句告诉容器，当类需要 `EventPusher` 的实现时，它应该注入 `RedisEventPusher`。现在我们可以在容器解析的类的构造函数中加上 `EventPusher` 接口作为类型提示。请记住，控制器、事件侦听器、中间件和 Laravel 应用程序中的各种其他的类始终使用容器进行解析：

    use App\Contracts\EventPusher;

    /**
     * 创建一个新的实例
     *
     * @param  \App\Contracts\EventPusher  $pusher
     * @return void
     */
    public function __construct(EventPusher $pusher)
    {
        $this->pusher = $pusher;
    }

<a name="contextual-binding"></a>
### 上下文绑定

> 译者注：所谓「上下文绑定」就是根据上下文进行动态的绑定，指依赖的上下文关系。

有时你可能有两个类使用相同的接口，但是你希望将不同的实现分别注入到各自的类中。例如，两个控制器可能依赖于 `Illuminate\Contracts\Filesystem\Filesystem` [契约](/docs/laravel/9.x/contracts) 的不同实现。Laravel 提供了一个简单流畅的方式来定义这种行为：

    use App\Http\Controllers\PhotoController;
    use App\Http\Controllers\UploadController;
    use App\Http\Controllers\VideoController;
    use Illuminate\Contracts\Filesystem\Filesystem;
    use Illuminate\Support\Facades\Storage;

    $this->app->when(PhotoController::class)
              ->needs(Filesystem::class)
              ->give(function () {
                  return Storage::disk('local');
              });

    $this->app->when([VideoController::class, UploadController::class])
              ->needs(Filesystem::class)
              ->give(function () {
                  return Storage::disk('s3');
              });

<a name="binding-primitives"></a>
### 绑定原语

有时您可能有一个类接收一些注入的类，但也需要一个注入的原语值，如整数。您可以轻松地使用上下文绑定来注入类可能需要的任何值：

    $this->app->when('App\Http\Controllers\UserController')
              ->needs('$variableName')
              ->give($value);



有时一个类可能依赖于一组 [标记的](#tagging) 实例。使用 `giveTagged` 方法，您可以轻松地使用该标记注入所有容器绑定：

    $this->app->when(ReportAggregator::class)
        ->needs('$reports')
        ->giveTagged('reports');

如果您需要从应用程序的某个配置文件中注入一个值，您可以使用 `giveConfig` 方法：

    $this->app->when(ReportAggregator::class)
        ->needs('$timezone')
        ->giveConfig('app.timezone');

<a name="binding-typed-variadics"></a>
### 绑定变长参数类型

有时，您可能有一个使用可变构造函数参数接收类型对象数组的类：

    <?php

    use App\Models\Filter;
    use App\Services\Logger;

    class Firewall
    {
        /**
         *  日志实例
         *
         * @var \App\Services\Logger
         */
        protected $logger;

        /**
         * 过滤器实例组
         *
         * @var array
         */
        protected $filters;

        /**
         * 创建一个类实例
         *
         * @param  \App\Services\Logger  $logger
         * @param  array  $filters
         * @return void
         */
        public function __construct(Logger $logger, Filter ...$filters)
        {
            $this->logger = $logger;
            $this->filters = $filters;
        }
    }

使用上下文绑定，您可以通过为 `give` 方法提供一个闭包来解析此依赖关系，该闭包返回一个已解析的 `Filter` 实例数组：

    $this->app->when(Firewall::class)
              ->needs(Filter::class)
              ->give(function ($app) {
                    return [
                        $app->make(NullFilter::class),
                        $app->make(ProfanityFilter::class),
                        $app->make(TooLongFilter::class),
                    ];
              });

为方便起见，您也可以只提供一个类名数组，以便在 `Firewall` 需要 `Filter` 实例时由容器解析：

    $this->app->when(Firewall::class)
              ->needs(Filter::class)
              ->give([
                  NullFilter::class,
                  ProfanityFilter::class,
                  TooLongFilter::class,
              ]);

<a name="variadic-tag-dependencies"></a>
#### 变长参数的关联标签

有时，一个类可能具有类型提示为给定类的可变依赖项（`Report ...$reports`）。使用 `needs` 和 `giveTagged` 方法，您可以轻松地为给定依赖项注入所有带有该 [标签](#tagging) 的所有容器绑定：

    $this->app->when(ReportAggregator::class)
        ->needs(Report::class)
        ->giveTagged('reports');



<a name="tagging"></a>
### 标签

有时，您可能需要解决所有特定“类别”的绑定。例如，也许您正在构建一个报告分析器，它接收许多不同的 `Report` 接口实现的数组。注册 `Report` 实现后，您可以使用 `tag` 方法为它们分配标签：

    $this->app->bind(CpuReport::class, function () {
        //
    });

    $this->app->bind(MemoryReport::class, function () {
        //
    });

    $this->app->tag([CpuReport::class, MemoryReport::class], 'reports');

一旦服务被打上标签，你就可以通过容器的 `tagged` 方法轻松地解析它们：

    $this->app->bind(ReportAnalyzer::class, function ($app) {
        return new ReportAnalyzer($app->tagged('reports'));
    });

<a name="extending-bindings"></a>
### 继承绑定

`extend` 方法允许修改已解析的服务。例如，解析服务时，可以运行其他代码来修饰或配置服务。 `extend` 方法接受闭包，该闭包应返回修改后的服务作为其唯一参数。闭包接收正在解析的服务和容器实例：

    $this->app->extend(Service::class, function ($service, $app) {
        return new DecoratedService($service);
    });

<a name="resolving"></a>
## 解析

<a name="the-make-method"></a>
### `make` 方法

您可以使用 `make` 方法从容器中解析类实例。`make` 方法接受您希望解析的类或接口的名称：

    use App\Services\Transistor;

    $transistor = $this->app->make(Transistor::class);

如果您的某些类的依赖项无法通过容器解析，您可以通过将它们作为关联数组传递给 `makeWith` 方法来注入它们。例如，我们可以手动传递 `Transistor` 服务所需的`$id` 构造函数参数：

    use App\Services\Transistor;

    $transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);

如果你在服务提供商之外的代码位置无法访问 `$app` 变量，则可以使用 `App` [facade](/docs/laravel/9.x/facades) 从容器解析类实例：

    use App\Services\Transistor;
    use Illuminate\Support\Facades\App;

    $transistor = App::make(Transistor::class);

如果希望将 Laravel 容器实例本身注入到由容器解析的类中，可以在你的类的构造函数中添加 `Illuminate\container\container`：

    use Illuminate\Container\Container;

    /**
     * 实例化一个类
     *
     * @param  \Illuminate\Container\Container  $container
     * @return void
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
    }

<a name="自动注入"></a>
### 自动注入

另外，并且更重要的是，你可以简单地使用「类型提示」的方式在类的构造函数中注入那些需要容器解析的依赖项，包括 [控制器](/docs/laravel/9.x/controllers)，[事件监听](/docs/laravel/9.x/events)，[中间件](/docs/laravel/9.x/middleware) 等 。此外，你也可以在 [队列任务](/docs/laravel/9.x/queues) 的 `handle` 方法中使用「类型提示」注入依赖。实际上，这才是大多数对象应该被容器解析的方式。

例如，你可以在控制器的构造函数中添加一个 repository 的类型提示，然后这个 repository 将会被自动解析并注入类中：

    <?php

    namespace App\Http\Controllers;

    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * user 仓库实例
         *
         * @var \App\Repositories\UserRepository
         */
        protected $users;

        /**
         * 创建一个控制器实例
         *
         * @param  \App\Repositories\UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }

        /**
         * 使用给定的 ID 显示 user
         *
         * @param  int  $id
         * @return \Illuminate\Http\Response
         */
        public function show($id)
        {
            //
        }
    }



<a name="method-invocation-and-injection"></a>
## 方法调用和注入

有时您可能希望调用对象实例上的方法，同时允许容器自动注入该方法的依赖项。例如，给定以下类：

    <?php

    namespace App;

    use App\Repositories\UserRepository;

    class UserReport
    {
        /**
         * 生成新的用户报告
         *
         * @param  \App\Repositories\UserRepository  $repository
         * @return array
         */
        public function generate(UserRepository $repository)
        {
            // ...
        }
    }

您可以通过容器调用 `generate` 方法，如下所示：

    use App\UserReport;
    use Illuminate\Support\Facades\App;

    $report = App::call([new UserReport, 'generate']);

`call` 方法接受任何可调用的 PHP 方法。容器的 `call` 方法甚至可以用于调用闭包，同时自动注入其依赖项：

    use App\Repositories\UserRepository;
    use Illuminate\Support\Facades\App;

    $result = App::call(function (UserRepository $repository) {
        // ...
    });

<a name="container-events"></a>
## 容器事件

服务容器每次解析对象时都会触发一个事件。您可以使用 `resolving` 方法监听此事件：

    use App\Services\Transistor;

    $this->app->resolving(Transistor::class, function ($transistor, $app) {
        // 当容器解析 "Transistor" 类型的对象时调用...
    });

    $this->app->resolving(function ($object, $app) {
        // 当容器解析任何类型的对象时调用...
    });

如您所见，正在解析的对象将被传递给回调，从而允许您在对象提供给其使用者之前设置对象的任何其他属性。

<a name="psr-11"></a>
## PSR-11

Laravel 的服务容器实现了 [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md) 接口。因此，您可以添加 PSR-11 容器接口的类型提示来获取 Laravel 容器的实例：

    use App\Services\Transistor;
    use Psr\Container\ContainerInterface;

    Route::get('/', function (ContainerInterface $container) {
        $service = $container->get(Transistor::class);

        //
    });

如果无法解析给定的标识符，将引发异常。如果标识符从未绑定，则异常将是`Psr\Container\NotFoundExceptionInterface` 的实例。如果标识符已绑定但无法解析，则将抛出`Psr\Container\ContainerExceptionInterface` 的实例。

