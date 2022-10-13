# 生成 URL

- [简介](#introduction)
- [基础](#the-basics)
    - [生成基础 URL](#generating-basic-urls)
    - [访问当前 URL](#accessing-the-current-url)
- [命名路由的URL](#urls-for-named-routes)
    - [签名 URL](#signed-urls)
- [控制器行为的URL](#urls-for-controller-actions)
- [默认值](#default-values)

<a name="introduction"></a>
## 简介

Laravel 提供了几个辅助函数来为应用程序生成 URL。主要用于在模板和 API 响应中构建 URL 或者在应用程序的其它部分生成重定向响应。

<a name="the-basics"></a>
## 基础

<a name="generating-basic-urls"></a>
### 生成基础 URL

辅助函数 `url` 可以用于应用的任何一个 URL。生成的 URL 将自动使用当前请求中的方案 (HTTP 或 HTTPS) 和主机：

    $post = App\Models\Post::find(1);

    echo url("/posts/{$post->id}");

    // http://example.com/posts/1

<a name="accessing-the-current-url"></a>
### 访问当前 URL

如果没有给辅助函数 `url` 提供路径，则会返回一个 `Illuminate\Routing\UrlGenerator` 实例，来允许你访问有关当前 URL 的信息：

    // 获取当前 URL 没有 query string...
    echo url()->current();

    // 获取当前 URL 包括 query string...
    echo url()->full();

    // 获取上个请求 URL
    echo url()->previous();

上面的这些方法都可以通过 `URL` [facade](/docs/laravel/9.x/facades) 访问：

    use Illuminate\Support\Facades\URL;

    echo URL::current();

<a name="urls-for-named-routes"></a>
## 命名路由的 URL

辅助函数 `route` 可以用于生成指定 [命名路由](/docs/laravel/9.x/routing#named-routes) 的 URL。命名路由生成的 URL 不与路由上定义的 URL 相耦合。因此，就算路由的 URL 有任何改变，都不需要对 `route` 函数调用进行任何更改。例如，假设你的应用程序包含以下路由：

    Route::get('/post/{post}', function (Post $post) {
        //
    })->name('post.show');



要生成此路由的 URL ，可以像这样使用辅助函数 `route` ：

    echo route('post.show', ['post' => 1]);

    // http://example.com/post/1

当然，辅助函数 `route` 也可以用于为具有多个参数的路由生成 URL：

    Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
        //
    })->name('comment.show');

    echo route('comment.show', ['post' => 1, 'comment' => 3]);

    // http://example.com/post/1/comment/3

任何与路由定义参数对应不上的附加数组元素都将添加到 URL 的查询字符串中：

    echo route('post.show', ['post' => 1, 'search' => 'rocket']);

    // http://example.com/post/1?search=rocket

<a name="eloquent-models"></a>
#### Eloquent Models

你通常使用 [Eloquent 模型](/docs/laravel/9.x/eloquent) 的主键生成 URL。因此，您可以将 Eloquent 模型作为参数值传递。`route` 辅助函数将自动提取模型的主键：

    echo route('post.show', ['post' => $post]);

<a name="signed-urls"></a>
### 签名 URL

Laravel 允许你轻松地为命名路径创建「签名」URL，这些 URL 在查询字符串后附加了「签名」哈希，允许 Laravel 验证 URL 自创建以来未被修改过。签名 URL 对于可公开访问但需要一层防止 URL 操作的路由特别有用。

例如，你可以使用签名 URL 来实现通过电子邮件发送给客户的公共「取消订阅」链接。要创建指向路径的签名 URL ，请使用 `URL` facade 的 `signedRoute` 方法：

    use Illuminate\Support\Facades\URL;

    return URL::signedRoute('unsubscribe', ['user' => 1]);



如果要生成具有有效期的临时签名路由 URL，可以使用以下 `temporarySignedRoute` 方法，当 Laravel 验证一个临时的签名路由 URL 时，它会确保编码到签名 URL 中的过期时间戳没有过期：

    use Illuminate\Support\Facades\URL;

    return URL::temporarySignedRoute(
        'unsubscribe', now()->addMinutes(30), ['user' => 1]
    );

<a name="validating-signed-route-requests"></a>
#### 验证签名路由请求

要验证传入请求是否具有有效签名，你应该对传入的 `Illuminate\Http\Request` 实例中调用 `hasValidSignature` 方法：

    use Illuminate\Http\Request;

    Route::get('/unsubscribe/{user}', function (Request $request) {
        if (! $request->hasValidSignature()) {
            abort(401);
        }

        // ...
    })->name('unsubscribe');

有时，你可能需要允许你的应用程序前端将数据附加到签名 URL，例如在执行客户端分页时。因此，你可以指定在使用 `hasValidSignatureWhileIgnoring` 方法验证签名 URL 时应忽略的请求查询参数。请记住，忽略参数将允许任何人根据请求修改这些参数：

    if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
        abort(401);
    }

或者，你可以将 `Illuminate\Routing\Middleware\ValidateSignature` [中间件](/docs/laravel/9.x/middleware) 分配给路由。如果它不存在，则应该在 HTTP 内核的 `routeMiddleware` 数组中为此中间件分配一个键：

    /**
     * 应用程序的路由中间件
     *
     * 这些中间件可以分配给组或单独使用
     *
     * @var array
     */
    protected $routeMiddleware = [
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    ];

一旦在内核中注册了中间件，就可以将其附加到路由。如果传入的请求没有有效的签名，中间件将自动返回 `403` HTTP 响应：

    Route::post('/unsubscribe/{user}', function (Request $request) {
        // ...
    })->name('unsubscribe')->middleware('signed');



<a name="responding-to-invalid-signed-routes"></a>
#### 响应无效的签名路由

当有人访问已过期的签名 URL 时，他们将收到一个通用的错误页面，显示 `403` HTTP 状态代码。然而，你可以通过在异常处理程序中为 `InvalidSignatureException` 异常定义自定义“可渲染”闭包来自定义此行为。这个闭包应该返回一个 HTTP 响应：


    use Illuminate\Routing\Exceptions\InvalidSignatureException;

    /**
     * 为应用程序注册异常处理回调
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (InvalidSignatureException $e) {
            return response()->view('error.link-expired', [], 403);
        });
    }

<a name="urls-for-controller-actions"></a>
## 控制器行为的 URL

`action` 功能可以为给定的控制器行为生成 URL。

    use App\Http\Controllers\HomeController;

    $url = action([HomeController::class, 'index']);

如果控制器方法接收路由参数，你可以通过第二个参数传递：

    $url = action([UserController::class, 'profile'], ['id' => 1]);

<a name="default-values"></a>
## 默认值

对于某些应用程序，你可能希望为某些 URL 参数的请求范围指定默认值。例如，假设有些路由定义了 `{locale}` 参数：

    Route::get('/{locale}/posts', function () {
        //
    })->name('post.index');

每次都通过 `locale` 来调用辅助函数 `route` 也是一件很麻烦的事情。因此，使用 `URL::defaults` 方法定义这个参数的默认值，可以让该参数始终存在当前请求中。然后就能从 [路由中间件](/docs/laravel/9.x/middleware#assigning-middleware-to-routes) 调用此方法来访问当前请求：

    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Support\Facades\URL;

    class SetDefaultLocaleForUrls
    {
        /**
         * 处理传入的请求
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Closure  $next
         * @return \Illuminate\Http\Response
         */
        public function handle($request, Closure $next)
        {
            URL::defaults(['locale' => $request->user()->locale]);

            return $next($request);
        }
    }



一旦设置了 `locale` 参数的默认值，你就不再需要通过辅助函数 `route` 生成 URL 时传递它的值。

<a name="url-defaults-middleware-priority"></a>
#### 默认 URL & 中间件优先级

设置 URL 的默认值会影响 Laravel 对隐式模型绑定的处理。因此，你应该通过[设置中间件优先级](/docs/9.x/middleware#sorting-middleware)来确保在 Laravel 自己的 `SubstituteBindings` 中间件执行之前设置 URL 的默认值。你可以通过在您的应用的 HTTP kernel 文件中的 `$middlewarePriority` 属性里把您的中间件放在 `SubstituteBindings` 中间件之前。

`$middlewarePriority` 这个属性在 `Illuminate\Foundation\Http\Kernel` 这个基类里。你可以复制一份到你的应用程序的 HTTP kernel 文件中以便做修改:

    /**
     * 根据优先级排序的中间件列表
     *
     * 这将保证非全局中间件按照既定顺序排序
     *
     * @var array
     */
    protected $middlewarePriority = [
        // ...
         \App\Http\Middleware\SetDefaultLocaleForUrls::class,
         \Illuminate\Routing\Middleware\SubstituteBindings::class,
         // ...
    ];

