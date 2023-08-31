
# 服务提供者

- [简介](#introduction)
- [编写服务提供者](#writing-service-providers)
    - [注册方法](#the-register-method)
    - [引导方法](#the-boot-method)
- [注册提供者](#registering-providers)
- [延迟加载提供者](#deferred-providers)

<a name="introduction"></a>
## 简介

服务提供者是所有 Laravel 应用程序的引导中心。你的应用程序，以及通过服务器引导的 Laravel 核心服务都是通过服务提供器引导。

但是，「引导」是什么意思呢？通常，我们可以理解为**注册**，比如注册服务容器绑定，事件监听器，中间件，甚至是路由。服务提供者是配置应用程序的中心。

当你打开 Laravel 的`config/app.php`  文件时，你会看到 `providers`数组。数组中的内容是应用程序要加载的所有服务提供者的类。当然，其中有很多「延迟」提供者，他们并不会在每次请求的时候都加载，只有他们的服务实际被需要时才会加载。

本篇你将会学到如何编写自己的服务提供者，并将其注册到你的 Laravel 应用程序中。

> **技巧 **
> 如果你想了解有关 Laravel 如何处理请求并在内部工作的更多信息，请查看有关 Laravel 的文档 [请求生命周期](/docs/laravel/10.x/lifecycle)。

<a name="writing-service-providers"></a>
## 编写服务提供者

所有的服务提供者都会继承`Illuminate\Support\ServiceProvider`类。大多服务提供者都包含一个 register 和一个`boot`方法。在`register`方法中，你只需要将服务绑定到 `register` 方法中， 你只需要 **将服务绑定到 [服务容器](/docs/laravel/10.x/container)**。而不要尝试在`register`方法中注册任何监听器，路由，或者其他任何功能。



使用 Artisan 命令行工具，通过 `make:provider` 命令可以生成一个新的提供者：

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### 注册方法

如上所述，在 `register` 方法中，你只需要将服务绑定到 [服务容器](/docs/laravel/9.x/container) 中。而不要尝试在 `register` 方法中注册任何监听器，路由，或者其他任何功能。否则，你可能会意外地使用到尚未加载的服务提供者提供的服务。

让我们来看一个基础的服务提供者。在任何服务提供者方法中，你总是通过 $app 属性来访问服务容器：

    <?php

    namespace App\Providers;

    use App\Services\Riak\Connection;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Support\ServiceProvider;

    class RiakServiceProvider extends ServiceProvider
    {
        /**
         * 注册应用服务
         */
        public function register(): void
        {
            $this->app->singleton(Connection::class, function (Application $app) {
                return new Connection(config('riak'));
            });
        }
    }

这个服务提供者只是定义了一个 `register` 方法，并且使用这个方法在服务容器中定义了一个 `Riak\Connection` 接口。如果你不理解服务容器的工作原理，请查看其 [文档](/docs/laravel/10.x/container).

<a name="bindings 和 singletons 的特性"></a>
#### bindings 和 singletons 的特性

如果你的服务提供器注册了许多简单的绑定，你可能想用 `bindings` 和 `singletons` 属性替代手动注册每个容器绑定。当服务提供器被框架加载时，将自动检查这些属性并注册相应的绑定：

    <?php

    namespace App\Providers;

    use App\Contracts\DowntimeNotifier;
    use App\Contracts\ServerProvider;
    use App\Services\DigitalOceanServerProvider;
    use App\Services\PingdomDowntimeNotifier;
    use App\Services\ServerToolsProvider;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         *  所有需要注册的容器绑定
         *
         * @var array
         */
        public $bindings = [
            ServerProvider::class => DigitalOceanServerProvider::class,
        ];

        /**
         * 所有需要注册的容器单例
         *
         * @var array
         */
        public $singletons = [
            DowntimeNotifier::class => PingdomDowntimeNotifier::class,
            ServerProvider::class => ServerToolsProvider::class,
        ];
    }



<a name="引导方法"></a>
### 引导方法

如果我们要在服务提供者中注册一个 [视图合成器](/docs/laravel/10.x/views#view-composers) 该怎么做？这就需要用到 `boot` 方法了。**该方法在所有服务提供者被注册以后才会被调用**，这就是说我们可以在其中访问框架已注册的所有其它服务：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\View;
    use Illuminate\Support\ServiceProvider;

    class ComposerServiceProvider extends ServiceProvider
    {
        /**
         * 启动所有的应用服务
         */
        public function boot(): void
        {
            View::composer('view', function () {
                // ...
            });
        }
    }

<a name="启动方法的依赖注入"></a>
#### 启动方法的依赖注入

你可以为服务提供者的 `boot` 方法设置类型提示。[服务容器](/docs/laravel/10.x/container) 会自动注入你所需要的依赖：

    use Illuminate\Contracts\Routing\ResponseFactory;

    /**
     * 引导所有的应用服务
     */
    public function boot(ResponseFactory $response): void
    {
        $response->macro('serialized', function (mixed $value) {
            // ...
        });
    }

<a name="注册服务提供者"></a>
## 注册服务提供者

所有服务提供者都是通过配置文件 `config/app.php` 进行注册。该文件包含了一个列出所有服务提供者名字的 `providers` 数组，默认情况下，其中列出了所有核心服务提供者，这些服务提供者启动 Laravel 核心组件，比如邮件、队列、缓存等等。

要注册提供器，只需要将其添加到数组：

    'providers' => [
        // 其他服务提供者

        App\Providers\ComposerServiceProvider::class,
    ],

<a name="延迟加载提供者"></a>
## 延迟加载提供者

如果你的服务提供者 **只** 在 [服务容器](/docs/laravel/10.x/container)中注册，可以选择延迟加载该绑定直到注册绑定的服务真的需要时再加载，延迟加载这样的一个提供者将会提升应用的性能，因为它不会在每次请求时都从文件系统加载。



Laravel 编译并保存延迟服务提供者提供的所有服务的列表，以及其服务提供者类的名称。因此，只有当你在尝试解析其中一项服务时，Laravel 才会加载服务提供者。

要延迟加载提供者，需要实现 `\Illuminate\Contracts\Support\DeferrableProvider` 接口并置一个 `provides` 方法。这个 `provides` 方法返回该提供者注册的服务容器绑定：

    <?php

    namespace App\Providers;

    use App\Services\Riak\Connection;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Contracts\Support\DeferrableProvider;
    use Illuminate\Support\ServiceProvider;

    class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
    {
        /**
         * 注册所有的应用服务
         */
        public function register(): void
        {
            $this->app->singleton(Connection::class, function (Application $app) {
                return new Connection($app['config']['riak']);
            });
        }

        /**
         * 获取服务提供者的服务
         *
         * @return array<int, string>
         */
        public function provides(): array
        {
            return [Connection::class];
        }
    }

