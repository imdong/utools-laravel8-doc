# 中间件

- [介绍](#introduction)
- [定义中间件](#defining-middleware)
- [注册中间件](#registering-middleware)
     - [全局中间件](#global-middleware)
     - [将中间件分配给路由](#assigning-middleware-to-routes)
     - [中间件组](#middleware-groups)
     - [排序中间件](#sorting-middleware)
- [中间件参数](#middleware-parameters)
- [可终止的中间件](#terminable-middleware)

<a name="introduction"></a>
## 介绍

中间件提供了一种方便的机制来检查和过滤进入应用程序的 HTTP 请求。 例如，Laravel 包含一个中间件，用于验证您的应用程序的用户是否经过身份验证。 如果用户未通过身份验证，中间件会将用户重定向到应用程序的登录屏幕。 但是，如果用户通过了身份验证，中间件将允许请求进一步进入应用程序。

除了身份验证之外，还可以编写其他中间件来执行各种任务。例如，日志中间件可能会将所有传入请求记录到您的应用程序。Laravel 框架中包含了几个中间件，包括用于身份验证和 CSRF 保护的中间件。 所有这些中间件都位于 `app/Http/Middleware` 目录中。

<a name="defining-middleware"></a>
## 定义中间件

要创建新的中间件，请使用 `make:middleware` Artisan 命令：

```shell
php artisan make:middleware EnsureTokenIsValid
```

此命令将在您的 `app/Http/Middleware` 目录中放置一个新的 `EnsureTokenIsValid` 类。在这个中间件中，如果提供的 `token` 输入匹配指定的值，我们将只允许访问路由。否则，我们会将用户重定向回 `home` URI：

    <?php

    namespace App\Http\Middleware;

    use Closure;

    class EnsureTokenIsValid
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Closure  $next
         * @return mixed
         */
        public function handle($request, Closure $next)
        {
            if ($request->input('token') !== 'my-secret-token') {
                return redirect('home');
            }

            return $next($request);
        }
    }



如您所见，如果给定的 `token` 与我们的秘密令牌不匹配，中间件将向客户端返回 HTTP 重定向； 否则，请求将被进一步传递到应用程序中。要将请求更深入地传递到应用程序中（允许中间件「通过」），您应该使用 `$request` 调用 `$next` 回调。

最好将中间件设想为一系列「层」HTTP 请求在到达您的应用程序之前必须通过。每一层都可以检查请求，甚至完全拒绝它。

> 技巧：所有中间件都通过 [服务容器](/docs/laravel/9.x/container) 解析，因此您可以在中间件的构造函数中键入提示您需要的任何依赖项。

<a name="before-after-middleware"></a>
<a name="middleware-and-responses"></a>
#### 中间件和响应

当然，中间件可以在将请求更深入地传递到应用程序之前或之后执行任务。 例如，以下中间件将在应用程序处理请求之前**执行一些任务**：

    <?php

    namespace App\Http\Middleware;

    use Closure;

    class BeforeMiddleware
    {
        public function handle($request, Closure $next)
        {
            // 执行操作

            return $next($request);
        }
    }

但是，此中间件将在**请求由应用程序处理后**执行其任务：

    <?php

    namespace App\Http\Middleware;

    use Closure;

    class AfterMiddleware
    {
        public function handle($request, Closure $next)
        {
            $response = $next($request);

            // 执行操作

            return $response;
        }
    }

<a name="registering-middleware"></a>
## 注册中间件

<a name="global-middleware"></a>
### 全局中间件

如果您希望在对应用程序的每个 HTTP 请求期间运行中间件，请在 `app/Http/Kernel.php` 类的 `$middleware` 属性中列出中间件类。

<a name="assigning-middleware-to-routes"></a>
### 将中间件分配给路由

如果您想将中间件分配给特定的路由，您应该首先在应用程序的 `app/Http/Kernel.php` 文件中为中间件分配一个键。默认情况下，该类的 `$routeMiddleware` 属性包含 Laravel 中包含的中间件的条目。 您可以将自己的中间件添加到此列表中，并为其分配您选择的键：

    // 在 App\Http\Kernel 类中...

    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];

一旦在 HTTP 内核中定义了中间件，您就可以使用 `middleware` 方法将中间件分配给路由：

    Route::get('/profile', function () {
        //
    })->middleware('auth');

您可以通过将一组中间件名称传递给 `middleware` 方法来为路由分配多个中间件：

    Route::get('/', function () {
        //
    })->middleware(['first', 'second']);

分配中间件时，您还可以传递完全限定的类名：

    use App\Http\Middleware\EnsureTokenIsValid;

    Route::get('/profile', function () {
        //
    })->middleware(EnsureTokenIsValid::class);

<a name="excluding-middleware"></a>
#### 排除中间件

将中间件分配给一组路由时，您可能偶尔需要阻止将中间件应用于组内的单个路由。您可以使用 `withoutMiddleware` 方法完成此操作：

    use App\Http\Middleware\EnsureTokenIsValid;

    Route::middleware([EnsureTokenIsValid::class])->group(function () {
        Route::get('/', function () {
            //
        });

        Route::get('/profile', function () {
            //
        })->withoutMiddleware([EnsureTokenIsValid::class]);
    });

您还可以从整个 [组](/docs/laravel/9.x/routing#route-groups) 路由定义中排除一组给定的中间件：

    use App\Http\Middleware\EnsureTokenIsValid;

    Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
        Route::get('/profile', function () {
            //
        });
    });

`withoutMiddleware` 方法只能移除路由中间件，不适用于[全局中间件](#global-middleware)。

<a name="middleware-groups"></a>
### 中间件组

有时您可能希望将多个中间件组合在一个键下，以使它们更容易分配给路由。您可以使用 HTTP 内核的 `$middlewareGroups` 属性来完成此操作。

开箱即用，Laravel 带有 `web` 和 `api` 中间件组，其中包含您可能希望应用于 Web 和 API 路由的常见中间件。请记住，这些中间件组会由应用程序的 `App\Providers\RouteServiceProvider` 服务提供者自动应用于相应的 `web` 和 `api` 路由文件中的路由：

    /**
     * 应用程序的路由中间件组。
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

可以使用与单个中间件相同的语法将中间件组分配给路由和控制器操作。同样，中间件组使一次将许多中间件分配给路由更加方便：

    Route::get('/', function () {
        //
    })->middleware('web');

    Route::middleware(['web'])->group(function () {
        //
    });

> 技巧：开箱即用，`web` 和 `api` 中间件组会通过 `App\Providers\RouteServiceProvider` 自动应用于应用程序对应的 `routes/web.php` 和 `routes/api.php` 文件。

<a name="sorting-middleware"></a>
### 排序中间件

很少，您可能需要您的中间件按特定顺序执行，但在将它们分配给路由时无法控制它们的顺序。 在这种情况下，您可以使用 `app/Http/Kernel.php` 文件的 `$middlewarePriority` 属性指定中间件优先级。默认情况下，您的 HTTP 内核中可能不存在此属性。如果它不存在，您可以在下面复制其默认定义：

    /**
     * 中间件的优先级排序列表。
     *
     * 这会强制非全局中间件始终按给定顺序排列。
     *
     * @var string[]
     */
    protected $middlewarePriority = [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Session\Middleware\AuthenticateSession::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ];

<a name="middleware-parameters"></a>
## 中间件参数

中间件也可以接收额外的参数。例如，如果您的应用程序需要在执行给定操作之前验证经过身份验证的用户是否具有给定的「角色」，您可以创建一个 `EnsureUserHasRole` 中间件，该中间件接收角色名称作为附加参数。

额外的中间件参数将在 `$next` 参数之后传递给中间件：

    <?php

    namespace App\Http\Middleware;

    use Closure;

    class EnsureUserHasRole
    {
        /**
         * 处理传入的请求。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Closure  $next
         * @param  string  $role
         * @return mixed
         */
        public function handle($request, Closure $next, $role)
        {
            if (! $request->user()->hasRole($role)) {
                // 重定向...
            }

            return $next($request);
        }

    }

在定义路由时，可以指定中间件参数，方法是使用 `:` 分隔中间件名称和参数。多个参数应以逗号分隔：

    Route::put('/post/{id}', function ($id) {
        //
    })->middleware('role:editor');

<a name="terminable-middleware"></a>
## 可终止的中间件

有时，在将 HTTP 响应发送到浏览器之后，中间件可能需要做一些工作。如果您在中间件上定义了一个 `terminate` 方法，并且您的 Web 服务器使用 FastCGI，则在将响应发送到浏览器后会自动调用 `terminate` 方法：

    <?php

    namespace Illuminate\Session\Middleware;

    use Closure;

    class TerminatingMiddleware
    {
        /**
         * 处理传入的请求。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Closure  $next
         * @return mixed
         */
        public function handle($request, Closure $next)
        {
            return $next($request);
        }

        /**
         * 在响应发送到浏览器后处理任务。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Illuminate\Http\Response  $response
         * @return void
         */
        public function terminate($request, $response)
        {
            // ...
        }
    }

`terminate` 方法应该同时接收请求和响应。一旦你定义了一个可终止的中间件，你应该将它添加到 `app/Http/Kernel.php` 文件中的路由或全局中间件列表中。

当在中间件上调用 `terminate` 方法时，Laravel 会从 [服务容器](/docs/laravel/9.x/container) 解析一个新的中间件实例。如果您想在调用 `handle` 和 `terminate` 方法时使用相同的中间件实例，请使用容器的 `singleton` 方法向容器注册中间件。 通常这应该在你的 AppServiceProvider 的 register 方法中完成：

    use App\Http\Middleware\TerminatingMiddleware;

    /**
     * 注册任何应用程序服务。
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(TerminatingMiddleware::class);
    }


[//]: <> (什么鬼啊，没有东西，又提交不了)

<a name="before-after-middleware"></a>
<a name="middleware-and-responses"></a>
