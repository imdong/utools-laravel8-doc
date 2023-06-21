# 请求 请求

- [简介](#introduction)
- [与请求交互](#interacting-with-the-request)
    - [访问请求](#accessing-the-request)
    - [请求路径和方法](#request-path-and-method)
    - [请求头](#request-headers)
    - [请求 IP 地址](#request-ip-address)
    - [内容协商](#content-negotiation)
    - [PSR-7 请求](#psr7-requests)
- [接收数据](#input)
    - [检索数据](#retrieving-input)
    - [确定是否存在数据](#determining-if-input-is-present)
    - [合并新增数据](#merging-additional-input)
    - [旧数据](#old-input)
    - [Cookies](#cookies)
    - [输入整理和规范化](#nput-trimming-and-normalization)
- [文件](#files)
    - [检索上传的文件](#retrieving-uploaded-files)
    - [存储上传的文件](#storing-uploaded-files)
- [配置受信任的代理](#configuring-trusted-proxies)
- [配置受信任的主机](#configuring-trusted-hosts)

<a name="introduction"></a>
## 简介

Laravel 的 `Illuminate\Http\Request`  类提供了一种面向对象的方法,可以与应用程序处理的当前 HTTP 请求进行交互, 以及检索与请求一起提交的输入内容，cookies 和文件。

<a name="interacting-with-the-request"></a>
## 与请求交互

<a name="accessing-the-request"></a>
### 访问请求

要通过依赖注入获得当前 HTTP 请求的实例，您应该在路由闭包或控制器方法上导入 `Illuminate\Http\Request` 类。 传入的请求实例将由 Laravel [服务容器](/docs/laravel/9.x/container) 自动注入：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 存储一个新用户.
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            $name = $request->input('name');

            //
        }
    }

如上所述，你也可以在路由闭包上导入`Illuminate\Http\Request` 类。服务容器在执行时将自动传入请求注入到闭包中：

    use Illuminate\Http\Request;

    Route::get('/', function (Request $request) {
        //
    });



<a name="dependency-injection-route-parameters"></a>
#### 依赖注入和路由参数

如果控制器方法也需要路由的参数传入，则应在其引入的依赖后面列出路由参数。您的路由应该定义如下：

    use App\Http\Controllers\UserController;

    Route::put('/user/{id}', [UserController::class, 'update']);

您应该注入 `Illuminate\Http\Request`, 并通过如下定义控制器方法，来访问 `id` 路由参数：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 更新指定用户
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  string  $id
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, $id)
        {
            //
        }
    }

<a name="request-path-and-method"></a>
### 请求路径和方法

`Illuminate\Http\Request` 实例提供了多种方法来检查传入的 Http 请求，并扩展了 `Symfony\Component\HttpFoundation\Request` 类。下面我们将讨论几个最重要的方法。

<a name="retrieving-the-request-path"></a>
#### 检索请求路径

`path` 方法返回请求的路径信息。因此，如果传入请求的目标是 `http://example.com/foo/bar`，则 `path` 方法将返回 `foo/bar`：

    $uri = $request->path();

<a name="inspecting-the-request-path"></a>
#### 检查请求路径 / 路由

`is` 方法允许您验证传入的请求路径是否与给定的模式匹配。使用此方法时，可以使用 `*` 字符作为通配符：

    if ($request->is('admin/*')) {
        //
    }

使用 `routeIs` 方法，可以确定传入请求是否与[命名路由](/docs/laravel/9.x/routing#named-routes)匹配：

    if ($request->routeIs('admin.*')) {
        //
    }



<a name="retrieving-the-request-url"></a>
#### 检索请求 URL

要检索传入请求的完整 URL，你可以使用 `url` 或 `fullUrl` 方法。`url` 方法将返回不包含查询字符串的 URL，而 `fullUrl` 方法包含查询字符串：

    $url = $request->url();

    $urlWithQueryString = $request->fullUrl();

如果要将查询字符串数据附加到当前URL，可以调用 `fullUrlWithQuery` 方法。此方法将给定的查询字符串变量数组与当前查询字符串合并：

    $request->fullUrlWithQuery(['type' => 'phone']);

<a name="retrieving-the-request-method"></a>
#### 检索请求方法

`method` 方法将返回请求的 HTTP 动词。你可以使用 `isMethod` 方法来验证 HTTP 动词是否匹配给定的字符串：

    $method = $request->method();

    if ($request->isMethod('post')) {
        //
    }

<a name="request-headers"></a>
### 请求头

你可以使用 `header` 方法从 `Illuminate\Http\Request` 实例中检索一个请求头。如果请求中不存在该头，将返回 `null`。然而，`header` 方法接受一个可选的第二个参数，如果请求中不存在该头，将返回该参数：

    $value = $request->header('X-Header-Name');

    $value = $request->header('X-Header-Name', 'default');

`hasHeader` 方法可用来确定请求是否包含一个给定的头：

    if ($request->hasHeader('X-Header-Name')) {
        //
    }

为了方便起见，`bearerToken` 方法可用来从 `Authorization` 头中检索一个 bearer 令牌。如果这样的头不存在，将返回一个空字符串：

    $token = $request->bearerToken();

<a name="request-ip-address"></a>


### 请求 IP 地址

`ip` 方法可用来检索向你的应用程序发出请求的客户机的 `IP` 地址：

    $ipAddress = $request->ip();

<a name="content-negotiation"></a>
### 请求协商

`Laravel` 提供一些通过 `Accept` 头检查传入请求的请求内容类型的方法。首先，`getAcceptableContentTypes` 方法将返回一个包含通过请求接受的所有内容类型的数组：

    $contentTypes = $request->getAcceptableContentTypes();

`accepts` 方法接受内容类型的数组，如果请求接受任何内容类型，则返回 `true`。否则，将返回 `false`：

    if ($request->accepts(['text/html', 'application/json'])) {
        // ...
    }

你可以使用 `prefers` 方法来确定给定内容类型数组中哪种内容类型最受请求青睐。如果请求不接受任何提供的内容类型，则将返回 `null`：

    $preferred = $request->prefers(['text/html', 'application/json']);

由于许多应用程序仅提供 `HTML` 或 `JSON`，因此你可以使用 `expectsJson` 方法来快速确定传入的请求是否需要 `JSON` 响应：

    if ($request->expectsJson()) {
        // ...
    }

<a name="psr7-requests"></a>
### PSR-7 Requests

[PSR-7 标准](https://www.php-fig.org/psr/psr-7/) 指定 HTTP 消息的接口，包括请求和响应。如果要获取 PSR-7 请求的实例而不是 Laravel 请求，则首先需要安装一些库。Laravel 使用 *Symfony HTTP Message Bridge* 组件将典型的 Laravel 请求和响应转换为 PSR-7 兼容的实现：

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```



一旦安装了这些库，就可以通过在路由闭包或控制器方法上键入请求接口的类型来获取 PSR-7 请求：

    use Psr\Http\Message\ServerRequestInterface;

    Route::get('/', function (ServerRequestInterface $request) {
        //
    });

> 技巧：如果从路由或控制器返回 PSR-7 响应实例，它将自动转换回 Laravel 响应实例并由框架显示。

<a name="input"></a>
## 输入

<a name="retrieving-input"></a>
### 检索输入

<a name="retrieving-all-input-data"></a>
#### 检索所有输入数据

可以使用 `all` 方法以 `array` 的形式检索所有传入请求的输入数据。无论传入的请求是来自 HTML 表单还是 XHR 请求，都可以使用此方法。

    $input = $request->all();

使用 `collect` 方法，您可以将所有传入请求的输入数据检索为[collection](/docs/laravel/9.x/collections)：

    $input = $request->collect();

`collect` 方法还允许您以集合的形式检索传入请求输入的子集：

    $request->collect('users')->each(function ($user) {
        // ...
    });

<a name="retrieving-an-input-value"></a>
#### 检索一个输入值

使用一些简单的方法，可以从 `Illuminate\Http\Request` 实例获取所有的用户输入数据，而不用在意用户使用的是哪种 HTTP 动词。不管是什么 HTTP 动词， `input` 方法都可以用来获取用户的输入数据：

    $name = $request->input('name');

可以将默认值作为第二个参数传递给 `input` 方法。如果请求中不存在第一个参数指定的字段的输入值，则将返回此值：

    $name = $request->input('name', 'Sally');



当使用包含数组输入的表单时，请使用「.」符号来访问数组：

    $name = $request->input('products.0.name');

    $names = $request->input('products.*.name');

可以不带任何参数地调用 `input` 方法，以便将所有输入值作为关联数组进行检索：

    $input = $request->input();

<a name="retrieving-input-from-the-query-string"></a>
#### 从查询字符串中检索输入

当 `input` 方法从整个请求有效负载（包括查询字符串）中检索值时，`query` 方法将仅从查询字符串中检索值：

    $name = $request->query('name');

如果请求的查询字符串的值不存在，则将返回此方法的第二个参数：

    $name = $request->query('name', 'Helen');

你可以不带任何参数地调用 `query` 方法，以将所有查询字符串值作为关联数组来检索：

    $query = $request->query();

<a name="retrieving-json-input-values"></a>
#### 检索 JSON 输入值

向应用程序发送 JSON 请求时，只要将请求的 `Content-Type` 标头正确设置为 `application/json`，就可以通过 `input` 方法访问 JSON 数据。甚至可以使用 `.` 语法来检索嵌套在 JSON 数组中的值：

    $name = $request->input('user.name');

<a name="retrieving-boolean-input-values"></a>
#### 检索布尔输入值

当处理诸如复选框之类的 HTML 元素时，你的应用程序可能会收到实际上是字符串的「true」值。例如，「true」或「on」。为了方便起见，你可以使用 boolean 方法将这些值作为布尔值检索。`boolean` 方法为 1，「1」，true，「true」，「on」和「yes」返回 `true`。所有其他值将返回 `false`：

    $archived = $request->boolean('archived');



<a name="retrieving-date-input-values"></a>
#### 检索日期输入值

为方便起见，包含日期/时间的输入值可以使用 `date` 方法作为实例检索。如果请求不包含具有给定名称的输入值，则返回 `null`：

    $birthday = $request->date('birthday');

`date` 方法接受的第二个和第三个参数可分别用于指定日期的格式和时区：

    $elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');

如果输入值存在，但格式无效，将抛出 `InvalidArgumentException`；因此，建议您在调用 `date` 方法之前验证输入。

<a name="retrieving-input-via-dynamic-properties"></a>
#### 通过动态属性检索输入

您还可以使用 `Illuminate\Http\Request` 实例上的动态属性访问用户输入。例如，如果你的应用程序形式之一包含一个 `name` 字段，则可以像下面这样访问该字段的值：

    $name = $request->name;

使用动态属性时，Laravel 将首先在请求有效负载中查找参数的值。如果不存在，Laravel 将在匹配的路线参数中搜索该字段。

<a name="retrieving-a-portion-of-the-input-data"></a>
#### 检索输入数据的一部分

如果需要检索输入数据的子集，则可以使用 `only` 和 `except` 方法。这两种方法都接受单个 `数组` 或动态参数列表：

    $input = $request->only(['username', 'password']);

    $input = $request->only('username', 'password');

    $input = $request->except(['credit_card']);

    $input = $request->except('credit_card');

> 注意：`only` 方法返回你请求的所有键 / 值对；但是，它不会返回请求中不存在的键 / 值对。



<a name="determining-if-input-is-present"></a>
### 判断输入值是否存在

你可以使用 `has` 来判断当前请求中是否含有指定的值。如果请求中存在该值则 `has` 方法将会返回 `true`：

    if ($request->has('name')) {
        //
    }

当给定一个数组时，`has` 将会判断指定的值是否全部存在：

    if ($request->has(['name', 'email'])) {
        //
    }

如果请求中存在该值则 `whenHas` 方法将会执行指定的闭包：

    $request->whenHas('name', function ($input) {
        //
    });

第二个闭包可以传递给 `whenHas` 方法，如果请求中不存在指定的值，则将执行该方法：

    $request->whenHas('name', function ($input) {
        // "name" 值存在...
    }, function () {
        // "name" 值不存在...
    });

`hasAny` 方法将会在指定的值有一个存在的情况下返回 `true`：

    if ($request->hasAny(['name', 'email'])) {
        //
    }

如果你想要判断一个值在请求中是否存在，并且不为空，可以使用 `filled` 方法：

    if ($request->filled('name')) {
        //
    }

如果请求中存在该值且不为空则 `whenFilled` 方法将会执行指定的闭包：

    $request->whenFilled('name', function ($input) {
        //
    });

第二个闭包可以传递给 `WhenFilled` 方法，如果指定的值不存在或为空，则将执行该方法：

    $request->whenFilled('name', function ($input) {
        // "name" 存在且不为空...
    }, function () {
        // "name" 不存在或为空...
    });

如果你想要判断一个值在请求中是否缺失，可以使用 `missing` 方法：

    if ($request->missing('name')) {
        //
    }



<a name="merging-additional-input"></a>
### 合并附加输入

有时您可能需要手动将其他输入合并到请求的现有输入数据中。为此，您可以使用 `merge` 方法：

    $request->merge(['votes' => 0]);

如果请求的输入数据中不存在相应的键，则可以使用 `mergeIfMissing` 方法将输入合并到请求中：

    $request->mergeIfMissing(['votes' => 0]);

<a name="old-input"></a>
### 旧数据

Laravel 允许你在两次请求之间保持数据。这个特性在有效性校验出错后重新填充表单时非常有用。不过，如果你使用 Laravel 自带的 [表单验证](/docs/laravel/9.x/validation)，不需要自己手动调用这些方法，因为一些 Laravel 内置的验证功能会自动调用它们。

<a name="flashing-input-to-the-session"></a>
#### 将输入数据闪存到 Session

`Illuminate\Http\Request` 类的 `flash` 方法可以把当前的输入闪存到 [session](/docs/laravel/9.x/session)，因此在用户向应用发起的下一次请求时它们仍然可用：

    $request->flash();

你也可以使用 `flashOnly` 方法和 `flashExcept` 方法将请求数据的子集传送给 Session。这些方法在将密码之类的敏感数据排除在 Session 外的情况下非常有用：

    $request->flashOnly(['username', 'email']);

    $request->flashExcept('password');

<a name="flashing-input-then-redirecting"></a>
#### 闪存数据并跳转

如果你需要经常保存输入到 Session 然后重定向到之前的页面，可以通过在跳转函数后链式调用 `withInput` 方法轻易地实现：

    return redirect('form')->withInput();

    return redirect()->route('user.create')->withInput();

    return redirect('form')->withInput(
        $request->except('password')
    );



<a name="retrieving-old-input"></a>
#### 获取旧数据

若要获取上一次请求所保存的旧数据，可以使用 `Illuminate\Http\Request` 实例的 `old` 方法。`old` 方法会从 [Session](/docs/laravel/9.x/session) 取出之前被闪存的输入数据：

    $username = $request->old('username');

Laravel 也提供了全局辅助函数 `old`。如果你要在 [Blade 模板](/docs/laravel/9.x/blade) 中显示旧的输入，使用 `old` 辅助函数将会更加方便。如果给定字段没有旧的输入，则会返回 `null`：

    <input type="text" name="username" value="{{ old('username') }}">

<a name="cookies"></a>
### Cookies

<a name="retrieving-cookies-from-requests"></a>
#### 从请求中获取 Cookie

Laravel 框架创建的所有 `cookie` 均已加密并使用身份验证代码签名，这意味着如果客户端更改了它们，它们将被视为无效。若要从请求中检索 `cookie` 值，请在 `Illuminate\Http\Request` 实例上使用 `cookie` 方法：

    $value = $request->cookie('name');

<a name="input-trimming-and-normalization"></a>
## 输入过滤 & 规范化

默认情况下，Laravel 在应用程序的全局中间件堆栈中包含 `App\Http\Middleware\TrimStrings` 和 `App\Http\Middleware\ConvertEmptyStringsToNull` 中间件。 这些中间件在 `App\Http\Kernel` 类的全局中间件堆栈中列出。 这些中间件将自动修剪请求中的所有传入字符串字段，并将所有空字符串字段转换为 `null`。 这使您不必担心路由和控制器中的这些规范化问题。

如果您想禁用此行为，则可以通过从 `App\Http\Kernel` 类的 `$middleware` 属性中删除这两个中间件，将它们从应用程序的中间件堆栈中删除。



<a name="files"></a>
## 文件

<a name="retrieving-uploaded-files"></a>
### 获取上传的文件

您可以使用 `file` 方法或使用动态属性从 `Illuminate\Http\Request` 实例中访问上传的文件。 该 `file` 方法返回 `Illuminate\Http\UploadedFile` 的实例，该类继承了 PHP 的 `SplFileInfo` 类的同时也提供了各种与文件交互的方法：

    $file = $request->file('photo');

    $file = $request->photo;

当然你也可以使用 `hasFile` 确认请求中是否存在文件：

    if ($request->hasFile('photo')) {
        //
    }

<a name="validating-successful-uploads"></a>
#### 验证成功上传

除了检查上传的文件是否存在外，你也可以通过 `isValid` 方法验证上传的文件是否有效：

    if ($request->file('photo')->isValid()) {
        //
    }

<a name="file-paths-extensions"></a>
#### 文件路径和扩展名

`UploadedFile` 类还包含用于访问文件的全限定路径及其扩展名的方法。 `extension` 方法会根据文件内容判断文件的扩展名。该扩展名可能会和客户端提供的扩展名不同：

    $path = $request->photo->path();

    $extension = $request->photo->extension();

<a name="other-file-methods"></a>
#### 其他文件方法

`UploadedFile` 实例上还有许多可用的方法。可以查看该类的 [API 文档](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) 了解这些方法的详细信息。

<a name="storing-uploaded-files"></a>
### 存储上传的文件

要存储上传的文件，通常会使用已配置的 [文件系统](/docs/laravel/9.x/filesystem)。你可以使用 `UploadedFile` 的 `store` 方法把上传文件移动到你的某个磁盘上，该文件可能是本地文件系统中的一个位置，甚至像 Amazon S3 这样的云存储位置。



`store` 方法接受相对于文件系统配置的根目录应存储文件的路径。 该路径不能包含文件名，因为将自动生成一个唯一的 ID 作为文件名。

`store` 方法还接受一个可选的第二个参数作为应用于存储文件的磁盘的名称。 该方法将返回文件相对于磁盘根目录的路径：

    $path = $request->photo->store('images');

    $path = $request->photo->store('images', 's3');

如果您不希望自动生成文件名，则可以使用 `storeAs` 方法，它接受路径、文件名和磁盘名作为其参数：

    $path = $request->photo->storeAs('images', 'filename.jpg');

    $path = $request->photo->storeAs('images', 'filename.jpg', 's3');

> 技巧：有关 Laravel 中文件存储的更多信息，请查看完整的 [文件存储文档](/docs/laravel/9.x/filesystem)。

<a name="configuring-trusted-proxies"></a>
## 配置受信任的代理

在终止 TLS / SSL 证书的负载平衡器后面运行应用程序时，您可能会注意到，使用 `url` 帮助程序时，应用程序有时不会生成 HTTPS 链接。通常，这是因为正在从端口 `80` 上的负载平衡器转发应用程序的流量，并且不知道它应该生成安全链接。

为了解决这个问题，您可以使用 Laravel 应用程序中包含的 `App\Http\Middleware\TrustProxies` 中间件，该中间件可让您快速自定义应用程序应信任的负载均衡器或代理。您的受信任代理应该在此中间件的 `$proxies` 属性上以数组形式列出。 除了配置受信任的代理外，您还可以配置应受信任的代理 `$headers` ：

    <?php

    namespace App\Http\Middleware;

    use Illuminate\Http\Middleware\TrustProxies as Middleware;
    use Illuminate\Http\Request;

    class TrustProxies extends Middleware
    {
        /**
         * 此应用程序的受信任代理。
         *
         * @var string|array
         */
        protected $proxies = [
            '192.168.1.1',
            '192.168.1.2',
        ];

        /**
         * 应用于检测代理的标头。
         *
         * @var int
         */
        protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
    }

> 技巧：如果你使用 AWS 弹性负载平衡，你的 `$headers` 值应该是 `Request::HEADER_X_FORWARDED_AWS_ELB`。如果您想查看更多可用于 `$headers` 的属性信息，请查阅 Symfony 的文档 [信任代理](https://symfony.com/doc/current/deployment/proxies.html)。


<a name="trusting-all-proxies"></a>
#### 信任所有代理

如果你正在使用 Amazon AWS 或者其它「云」的负载均衡服务，当你不知道负载均衡的实际 IP 地址时，你可以使用 `*` 来信任所有代理：

    /**
     * 当前应用的可信代理
     *
     * @var string|array
     */
    protected $proxies = '*';

<a name="configuring-trusted-hosts"></a>
## 配置受信任的 Host

默认情况下，Laravel 将响应它收到的所有请求，而不管 HTTP 请求的 `Host` 头的内容如何。此外，在 web 请求期间生成应用程序的绝对 URL 时，将使用 `Host` 头的值。

通常，您应该将 web 服务器（如 Nginx 或 Apache）配置为只向应用程序发送与给定主机名匹配的请求。但是，如果您无法直接自定义 web 服务器，并且需要指示 Laravel 仅响应某些主机名，则可以通过为应用程序启用`App\Http\Middleware\TrustHosts` 中间件来实现。

`TrustHosts` 中间件已包含在应用程序的 `$middleware` 堆栈中；但是，您应该取消注释以使其变为活动状态。在此中间件的 `hosts` 方法中，您可以指定应用程序应响应的主机名。带有其他 `Host` 值标头的传入请求将被拒绝：

    /**
     * 获取应该信任的主机模式。
     *
     * @return array
     */
    public function hosts()
    {
        return [
            'laravel.test',
            $this->allSubdomainsOfApplicationUrl(),
        ];
    }

`allSubdomainsOfApplicationUrl` 辅助方法将返回一个正则表达式，匹配应用程序的 `app.url` 配置值的所有子域。在构建使用通配符子域的应用程序时，此帮助方法提供了一种方便的方法来允许应用程序的所有子域。



