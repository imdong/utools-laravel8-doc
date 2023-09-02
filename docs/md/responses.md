
# 响应

- [创建响应](#creating-responses)
    - [添加响应头](#attaching-headers-to-responses)
    - [添加响应 Cookies](#attaching-cookies-to-responses)
    - [Cookies & 加密](#cookies-and-encryption)
- [重定向](#redirects)
    - [重定向到命名路由](#redirecting-named-routes)
    - [重定向到控制器方法](#redirecting-controller-actions)
    - [重定向到外部域名](#redirecting-external-domains)
    - [重定向并使用闪存的 Session 数据](#redirecting-with-flashed-session-data)
- [其它响应类型](#other-response-types)
    - [视图响应](#view-responses)
    - [JSON 响应](#json-responses)
    - [文件下载](#file-downloads)
    - [文件响应](#file-responses)
- [响应宏](#response-macros)

<a name="creating-responses"></a>
## 创建响应

<a name="strings-arrays"></a>
#### 字符串 & 数组

所有路由和控制器处理完业务逻辑之后都会返回响应到用户的浏览器，Laravel 提供了多种不同的响应方式，其中最基本就是从路由或控制器返回一个简单的字符串，框架会自动将这个字符串转化为一个完整的 HTTP 响应：

    Route::get('/', function () {
        return 'Hello World';
    });

除了从路由和控制器返回字符串之外，你还可以返回数组。 框架会自动将数组转换为 JSON 响应：

    Route::get('/', function () {
        return [1, 2, 3];
    });

> **技巧**  
> 你知道从路由或控制器还可以返回 [Eloquent 集合](/docs/laravel/10.x/eloquent-collections)吗？他们也会自动转化为 JSON 响应！

<a name="response-objects"></a>
#### Response 对象

通常情况下会只返回简单的字符串或数组，大多数时候，需要返回一个完整的`Illuminate\Http\Response`实例或是[视图](/docs/laravel/10.x/views).

返回一个完整的`Response` 实例允许你自定义返回的 HTTP 状态码和返回头信息。`Response`实例继承自`Symfony\Component\HttpFoundation\Response`类，该类提供了各种构建 HTTP 响应的方法：

    Route::get('/home', function () {
        return response('Hello World', 200)
                      ->header('Content-Type', 'text/plain');
    });



<a name="eloquent-models-and-collections"></a>
#### Eloquent 模型 和 集合

你也可以直接从你的路由和控制器返回 [Eloquent ORM](/docs/laravel/10.x/eloquent) 模型和集合。当你这样做时，Laravel 将自动将模型和集合转换为 JSON 响应，同时遵循模型的 [隐藏属性](/docs/laravel/10.x/eloquent-serialization#hiding-attributes-from-json):

    use App\Models\User;

    Route::get('/user/{user}', function (User $user) {
        return $user;
    });

<a name="attaching-headers-to-responses"></a>
### 在响应中附加 Header 信息

请记住，大多数响应方法都是可以链式调用的，它允许你流畅地构建响应实例。例如，在将响应发送回用户之前，可以使用 `header` 方法将一系列头添加到响应中：

    return response($content)
                ->header('Content-Type', $type)
                ->header('X-Header-One', 'Header Value')
                ->header('X-Header-Two', 'Header Value');

或者，你可以使用 `withHeaders` 方法指定要添加到响应的标头数组：

    return response($content)
                ->withHeaders([
                    'Content-Type' => $type,
                    'X-Header-One' => 'Header Value',
                    'X-Header-Two' => 'Header Value',
                ]);

<a name="cache-control-middleware"></a>
#### 缓存控制中间件

Laravel 包含一个 `cache.headers` 中间件，可用于快速设置一组路由的 `Cache-Control` 标头。指令应使用相应缓存控制指令的 蛇形命名法 等效项提供，并应以分号分隔。如果在指令列表中指定了 `etag` ，则响应内容的 MD5 哈希将自动设置为 ETag 标识符：

    Route::middleware('cache.headers:public;max_age=2628000;etag')->group(function () {
        Route::get('/privacy', function () {
            // ...
        });

        Route::get('/terms', function () {
            // ...
        });
    });



<a name="attaching-cookies-to-responses"></a>
### 在响应中附加 Cookie 信息

可以使用 `cookie` 方法将 cookie 附加到传出的 `illumize\Http\Response` 实例。你应将 cookie 的名称、值和有效分钟数传递给此方法：

    return response('Hello World')->cookie(
        'name', 'value', $minutes
    );

`cookie` 方法还接受一些使用频率较低的参数。通常，这些参数的目的和意义与 PHP 的原生 [setcookie](https://secure.php.net/manual/en/function.setcookie.php) 的参数相同

    return response('Hello World')->cookie(
        'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
    );

如果你希望确保 cookie 与传出响应一起发送，但你还没有该响应的实例，则可以使用 `Cookie` facade 将 cookie 加入队列，以便在发送响应时附加到响应中。`queue` 方法接受创建 cookie 实例所需的参数。在发送到浏览器之前，这些 cookies 将附加到传出的响应中：

    use Illuminate\Support\Facades\Cookie;

    Cookie::queue('name', 'value', $minutes);

<a name="generating-cookie-instances"></a>
#### 生成 Cookie 实例

如果要生成一个 `Symfony\Component\HttpFoundation\Cookie` 实例，打算稍后附加到响应实例中，你可以使用全局 `cookie` 助手函数。此 cookie 将不会发送回客户端，除非它被附加到响应实例中：

    $cookie = cookie('name', 'value', $minutes);

    return response('Hello World')->cookie($cookie);



<a name="expiring-cookies-early"></a>
#### 提前过期 Cookies

你可以通过响应中的`withoutCookie`方法使 cookie 过期，用于删除 cookie ：

    return response('Hello World')->withoutCookie('name');

如果尚未有创建响应的实例，则可以使用`Cookie` facade 中的`expire` 方法使 Cookie 过期：

    Cookie::expire('name');

<a name="cookies-and-encryption"></a>
### Cookies 和 加密

默认情况下，由 Laravel 生成的所有 cookie 都经过了加密和签名，因此客户端无法篡改或读取它们。如果要对应用程序生成的部分 cookie 禁用加密，可以使用`App\Http\Middleware\EncryptCookies`中间件的`$except`属性，该属性位于`app/Http/Middleware`目录中：

    /**
     * 这个名字的 Cookie 将不会加密。
     *
     * @var array
     */
    protected $except = [
        'cookie_name',
    ];

<a name="redirects"></a>
## 重定向

重定向响应是`Illuminate\Http\RedirectResponse` 类的实例，包含将用户重定向到另一个 URL 所需的适当 HTTP 头。Laravel 有几种方法可以生成`RedirectResponse`实例。最简单的方法是使用全局`redirect`助手函数：

    Route::get('/dashboard', function () {
        return redirect('home/dashboard');
    });

有时你可能希望将用户重定向到以前的位置，例如当提交的表单无效时。你可以使用全局 back 助手函数来执行此操作。由于此功能使用 [session](/docs/laravel/10.x/session)，请确保调用`back` 函数的路由使用的是`web`中间件组：

    Route::post('/user/profile', function () {
        // 验证请求参数

        return back()->withInput();
    });



<a name="redirecting-named-routes"></a>
### 重定向到指定名称的路由

当你在没有传递参数的情况下调用 `redirect` 助手函数时，将返回 `Illuminate\Routing\Redirector` 的实例，允许你调用 `Redirector` 实例上的任何方法。例如，要对命名路由生成 `RedirectResponse` ，可以使用 `route` 方法：

    return redirect()->route('login');

如果路由中有参数，可以将其作为第二个参数传递给 `route` 方法：

    // 对于具有以下URI的路由: /profile/{id}

    return redirect()->route('profile', ['id' => 1]);

<a name="populating-parameters-via-eloquent-models"></a>
#### 通过 Eloquent 模型填充参数

如果你要重定向到使用从 Eloquent 模型填充 「ID」 参数的路由，可以直接传递模型本身。ID 将会被自动提取：

    // 对于具有以下URI的路由: /profile/{id}

    return redirect()->route('profile', [$user]);

如果你想要自定义路由参数，你可以指定路由参数 (`/profile/{id:slug}`) 或者重写 Eloquent 模型上的 `getRouteKey` 方法：

    /**
     * 获取模型的路由键值。
     */
    public function getRouteKey(): mixed
    {
        return $this->slug;
    }

<a name="redirecting-controller-actions"></a>
### 重定向到控制器行为

也可以生成重定向到 [controller actions](/docs/laravel/10.x/controllers)。只要把控制器和 action 的名称传递给 `action` 方法：

    use App\Http\Controllers\UserController;

    return redirect()->action([UserController::class, 'index']);

如果控制器路由有参数，可以将其作为第二个参数传递给 `action` 方法：

    return redirect()->action(
        [UserController::class, 'profile'], ['id' => 1]
    );



<a name="redirecting-external-domains"></a>
### 重定向到外部域名

有时候你需要重定向到应用外的域名。可以通过调用`away`方法，它会创建一个不带有任何额外的 URL 编码、有效性校验和检查`RedirectResponse`实例：

    return redirect()->away('https://www.google.com');

<a name="redirecting-with-flashed-session-data"></a>
### 重定向并使用闪存的 Session 数据

重定向到新的 URL 的同时[传送数据给 seesion](/docs/laravel/10.x/session#flash-data) 是很常见的。 通常这是在你将消息发送到 session 后成功执行操作后完成的。为了方便，你可以创建一个`RedirectResponse`实例并在链式方法调用中将数据传送给 session：

    Route::post('/user/profile', function () {
        // ...

        return redirect('dashboard')->with('status', 'Profile updated!');
    });

在用户重定向后，你可以显示 [session](/docs/laravel/10.x/session)。例如，你可以使用[ Blade 模板语法](/docs/laravel/10.x/blade)：

    @if (session('status'))
        <div class="alert alert-success">
            {{ session('status') }}
        </div>
    @endif

<a name="redirecting-with-input"></a>
#### 使用输入重定向

你可以使用`RedirectResponse`实例提供的`withInput`方法将当前请求输入的数据发送到 session ，然后再将用户重定向到新位置。当用户遇到验证错误时，通常会执行此操作。每当输入数据被发送到 session , 你可以很简单的在下一次重新提交的表单请求中[取回它](/docs/laravel/10.x/requests#retrieving-old-input)：

    return back()->withInput();

<a name="other-response-types"></a>


## 其他响应类型

`response` 助手可用于生成其他类型的响应实例。当不带参数调用 `response` 助手时，会返回 `Illuminate\Contracts\Routing\ResponseFactory` [contract](/docs/laravel/10.x/contracts) 的实现。 该契约提供了几种有用的方法来生成响应。

<a name="view-responses"></a>
### 响应视图

如果你需要控制响应的状态和标头，但还需要返回 [view](/docs/laravel/10.x/views) 作为响应的内容，你应该使用 `view` 方法：

    return response()
                ->view('hello', $data, 200)
                ->header('Content-Type', $type);

当然，如果你不需要传递自定义 HTTP 状态代码或自定义标头，则可以使用全局 `view` 辅助函数。

<a name="json-responses"></a>
### JSON Responses

`json` 方法会自动将 `Content-Type` 标头设置为 `application/json`，并使用 `json_encode` PHP 函数将给定的数组转换为 JSON：

    return response()->json([
        'name' => 'Abigail',
        'state' => 'CA',
    ]);

如果你想创建一个 JSONP 响应，你可以结合使用 `json` 方法和 `withCallback` 方法：

    return response()
                ->json(['name' => 'Abigail', 'state' => 'CA'])
                ->withCallback($request->input('callback'));

<a name="file-downloads"></a>
### 文件下载

`download` 方法可用于生成强制用户浏览器在给定路径下载文件的响应。`download` 方法接受文件名作为该方法的第二个参数，这将确定下载文件的用户看到的文件名。 最后，你可以将一组 HTTP 标头作为该方法的第三个参数传递：

    return response()->download($pathToFile);

    return response()->download($pathToFile, $name, $headers);

> 注意：管理文件下载的 Symfony HttpFoundation 要求正在下载的文件具有 ASCII 文件名。


<a name="streamed-downloads"></a>
#### 流式下载

有时你可能希望将给定操作的字符串响应转换为可下载的响应，而不必将操作的内容写入磁盘。在这种情况下，你可以使用`streamDownload`方法。此方法接受回调、文件名和可选的标头数组作为其参数：

    use App\Services\GitHub;

    return response()->streamDownload(function () {
        echo GitHub::api('repo')
                    ->contents()
                    ->readme('laravel', 'laravel')['contents'];
    }, 'laravel-readme.md');

<a name="file-responses"></a>
### 文件响应

`file`方法可用于直接在用户的浏览器中显示文件，例如图像或 PDF，而不是启动下载。这个方法接受文件的路径作为它的第一个参数和一个头数组作为它的第二个参数：

    return response()->file($pathToFile);

    return response()->file($pathToFile, $headers);

<a name="response-macros"></a>
## 响应宏

如果你想定义一个可以在各种路由和控制器中重复使用的自定义响应，你可以使用`Response` facade 上的`macro`方法。通常，你应该从应用程序的[服务提供者](/docs/laravel/10.x/providers)，如`App\Providers\AppServiceProvider`服务提供程序的`boot`方法调用此方法：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Response;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 启动一个应用的服务
         */
        public function boot(): void
        {
            Response::macro('caps', function (string $value) {
                return Response::make(strtoupper($value));
            });
        }
    }

`macro`函数接受名称作为其第一个参数，并接受闭包作为其第二个参数。当从`ResponseFactory`实现或`response`助手函数调用宏名称时，将执行宏的闭包：

    return response()->caps('foo');

