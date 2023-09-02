
# HTTP 请求

-   [介绍](#introduction)
-   [与请求交互](#interacting-with-the-request)
    -   [访问请求](#accessing-the-request)
    -   [请求路径、主机和方法](#request-path-and-method)
    -   [请求头](#request-headers)
    -   [请求 IP址](#request-ip-address)
    -   [内容协商](#content-negotiation)
    -   [PSR-7 请求](#psr7-requests)
-   [输入](#input)
    -   [检索输入](#retrieving-input)
    -   [确定输入是否存在](#determining-if-input-is-present)
    -   [合并额外的输入](#merging-additional-input)
    -   [旧输入](#old-input)
    -   [Cookies](#cookies)
    -   [输入修剪和规范化](#input-trimming-and-normalization)
-   [文件](#files)
    -   [检索上传的文件](#retrieving-uploaded-files)
    -   [存储上传的文件](#storing-uploaded-files)
-   [配置可信代理](#configuring-trusted-proxies)
-   [配置可信主机](#configuring-trusted-hosts)

<a name="introduction"></a>

## 介绍

Laravel 的 `Illuminate\Http\Request` 类提供了一种面向对象的方式来与当前由应用程序处理的 HTTP 请求进行交互，并检索提交请求的输入内容、Cookie 和文件。

<a name="interacting-with-the-request"></a>

## 与请求交互

<a name="accessing-the-request"></a>

### 访问请求

要通过依赖注入获取当前的 HTTP 请求实例，您应该在路由闭包或控制器方法中导入 `Illuminate\Http\Request` 类。传入的请求实例将由 Laravel  [服务容器](/docs/laravel/10.x/container) 自动注入：

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 存储新用户。
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->input('name');

        // 存储用户……

        return redirect('/users');
    }
}

```

如上所述，您也可以在路由闭包上导入 `Illuminate\Http\Request` 类。服务容器将在执行时自动将传入请求注入闭包中：

```
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>

#### 依赖注入和路由参数

如果您的控制器方法还需要从路由参数中获取输入，则应该在其他依赖项之后列出路由参数。例如，如果您的路由定义如下：

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);

```

您仍然可以在控制器方法中使用类型提示的 `Illuminate\Http\Request` 并通过以下方式访问您的 `id` 路由参数来定义您的控制器方法：

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 更新用户...

        return redirect('/users');
    }
}

```

<a name="request-path-and-method"></a>

### 请求路径、主机和方法

`Illuminate\Http\Request` 实例提供各种方法来检查传入的 HTTP 请求，并扩展了 `Symfony\Component\HttpFoundation\Request` 类。下面我们将讨论一些最重要的方法。

<a name="retrieving-the-request-path"></a>

#### 获取请求路径

`path` 方法返回请求的路径信息。因此，如果传入的请求针对 `http://example.com/foo/bar`，则 `path` 方法将返回 `foo/bar`：

```
$uri = $request->path();

```

<a name="inspecting-the-request-path"></a>

#### 检查请求路径/路由信息

`is` 方法允许您验证传入请求路径是否与给定的模式匹配。当使用此方法时，您可以使用 `*` 字符作为通配符：

```
if ($request->is('admin/*')) {
    // ...
}

```

使用 `routeIs` 方法，您可以确定传入的请求是否与 [命名路由](/docs/laravel/10.x/routing#named-routes) 匹配：

```
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>

#### 获取请求 URL

要获取传入请求的完整 URL，您可以使用 `url` 或 `fullUrl` 方法。`url` 方法将返回不带查询字符串的 URL，而`fullUrl` 方法将包括查询字符串：

```
$url = $request->url();

$urlWithQueryString = $request->fullUrl();

```

如果您想将查询字符串数据附加到当前 URL，请调用 `fullUrlWithQuery` 方法。此方法将给定的查询字符串变量数组与当前查询字符串合并：

```
$request->fullUrlWithQuery(['type' => 'phone']);

```

<a name="retrieving-the-request-host"></a>

#### 获取请求 Host

您可以通过 `host`、`httpHost` 和 `schemeAndHttpHost` 方法获取传入请求的 「host」：

```
$request->host();
$request->httpHost();
$request->schemeAndHttpHost();

```

<a name="retrieving-the-request-method"></a>

#### 获取请求方法

`method` 方法将返回请求的 HTTP 动词。您可以使用 `isMethod` 方法来验证 HTTP 动词是否与给定的字符串匹配：

```
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}

```

<a name="request-headers"></a>

### 请求头

您可以使用`header` 方法从 `Illuminate\Http\Request` 实例中检索请求标头。如果请求中没有该标头，则返回 `null`。但是，`header` 方法接受两个可选参数，如果该标头在请求中不存在，则返回第二个参数：

```
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');

```

`hasHeader` 方法可用于确定请求是否包含给定的标头：

```
if ($request->hasHeader('X-Header-Name')) {
    // ...
}

```

为了方便起见，`bearerToken` 方法可用于从 `Authorization` 标头检索授权标记。如果不存在此类标头，将返回一个空字符串：

```
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>

### 请求 IP 地址

`ip` 方法可用于检索向您的应用程序发出请求的客户端的 IP 地址：

```
$ipAddress = $request->ip();

```

<a name="content-negotiation"></a>

### 内容协商

Laravel 提供了几种方法，通过 `Accept` 标头检查传入请求的请求内容类型。首先，`getAcceptableContentTypes` 方法将返回包含请求接受的所有内容类型的数组：

```
$contentTypes = $request->getAcceptableContentTypes();

```

`accepts` 方法接受一个内容类型数组，并在请求接受任何内容类型时返回 `true`。否则，将返回 `false`：

```
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}

```

您可以使用 `prefers` 方法确定给定内容类型数组中的哪种内容类型由请求最具优势。如果请求未接受任何提供的内容类型，则返回 `null`：

```
$preferred = $request->prefers(['text/html', 'application/json']);

```

由于许多应用程序仅提供 HTML 或 JSON，因此您可以使用 `expectsJson` 方法快速确定传入请求是否期望获得 JSON 响应：

```
if ($request->expectsJson()) {
    // ...
}

```

<a name="psr7-requests"></a>

### PSR-7 请求

[PSR-7 标准](https://www.php-fig.org/psr/psr-7/) 指定了 HTTP 消息的接口，包括请求和响应。如果您想要获取 PSR-7 请求的实例而不是 Laravel 请求，您首先需要安装一些库。Laravel 使用 *Symfony HTTP Message Bridge* 组件将典型的 Laravel 请求和响应转换为 PSR-7 兼容的实现：

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

安装这些库之后，您可以通过在路由闭包或控制器方法上的请求接口进行类型提示来获取 PSR-7 请求：

```
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});

```

> **注意**
> 如果您从路由或控制器返回 PSR-7 响应实例，它将自动转换回 Laravel 响应实例，并由框架显示。

<a name="input"></a>

## 输入

<a name="retrieving-input"></a>

### 检索输入

<a name="retrieving-all-input-data"></a>

#### 检索所有输入数据

您可以使用 `all` 方法将所有传入请求的输入数据作为 `array` 检索。无论传入请求是否来自 HTML 表单或 XHR 请求，都可以使用此方法：

```
$input = $request->all();

```

使用 `collect` 方法，您可以将所有传入请求的输入数据作为 [集合](/docs/laravel/10.x/collections) 检索：

```
$input = $request->collect();

```

`collect` 方法还允许您将传入请求的子集作为集合检索：

```
$request->collect('users')->each(function (string $user) {
    // ...
});

```

<a name="retrieving-an-input-value"></a>

#### 检索输入值

使用几个简单的方法，无论请求使用了哪种 HTTP 动词，都可以从您的 `Illuminate\Http\Request` 实例访问所有用户输入。`input` 方法可用于检索用户输入：

```
$name = $request->input('name');

```

您可以将默认值作为第二个参数传递给 `input` 方法。如果请求中不存在所请求的输入值，则返回此值：

```
$name = $request->input('name', 'Sally');
```

处理包含数组输入的表单时，请使用「.」符号访问数组：

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');

```

您可以调用不带任何参数的 `input` 方法，以将所有输入值作为关联数组检索出来：

```
$input = $request->input();

```

<a name="retrieving-input-from-the-query-string"></a>

#### 从查询字符串检索输入

虽然 `input` 方法从整个请求消息载荷（包括查询字符串）检索值，但 `query` 方法仅从查询字符串检索值：

```
$name = $request->query('name');

```

如果请求的查询字符串值数据不存在，则将返回此方法的第二个参数：

```
$name = $request->query('name', 'Helen');

```

您可以调用不带任何参数的 `query` 方法，以将所有查询字符串值作为关联数组检索出来：

```
$query = $request->query();

```

<a name="retrieving-json-input-values"></a>

#### 检索 JSON 输入值

当向您的应用程序发送 JSON 请求时，只要请求的 `Content-Type` 标头正确设置为 `application/json`，您就可以通过 `input` 方法访问 JSON 数据。您甚至可以使用「.」语法来检索嵌套在 JSON 数组/对象中的值：

```
$name = $request->input('user.name');

```

<a name="retrieving-stringable-input-values"></a>

#### 检索可字符串化的输入值

您可以使用 `string` 方法将请求的输入数据检索为 [`Illuminate\Support\Stringable`](/docs/laravel/10.x/helpers#fluent-strings) 的实例，而不是将其作为基本 `string` 检索：

```
$name = $request->string('name')->trim();

```

<a name="retrieving-boolean-input-values"></a>

#### 检索布尔值输入

处理类似复选框的 HTML 元素时，您的应用程序可能会接收到实际上是字符串的「true」。例如，「true」或「on」。为了方便起见，您可以使用 `boolean` 方法将这些值作为布尔值检索。`boolean` 方法对于 1，「1」，true，「true」，「on」和「yes」，返回 `true`。所有其他值将返回 `false`：

```
$archived = $request->boolean('archived');

```

<a name="retrieving-date-input-values"></a>

#### 检索日期输入值

为了方便起见，包含日期 / 时间的输入值可以使用 `date` 方法检索为 Carbon 实例。如果请求中不包含给定名称的输入值，则返回 `null`：

```
$birthday = $request->date('birthday');

```

`date` 方法可接受的第二个和第三个参数可用于分别指定日期的格式和时区：

```
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');

```

如果输入值存在但格式无效，则会抛出一个 `InvalidArgumentException` 异常；因此，在调用 `date` 方法之前建议对输入进行验证。

<a name="retrieving-enum-input-values"></a>

#### 检索枚举输入值

还可以从请求中检索对应于 [PHP 枚举](https://www.php.net/manual/en/language.types.enumerations.php) 的输入值。如果请求中不包含给定名称的输入值或枚举没有与输入值匹配的备份值，则返回 `null`。`enum` 方法接受输入值的名称和枚举类作为其第一个和第二个参数：

```
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>

#### 通过动态属性检索输入

您也可以使用 `Illuminate\Http\Request` 实例上的动态属性访问用户输入。例如，如果您的应用程序的表单之一包含一个 `name` 字段，则可以像这样访问该字段的值：

```php
$name = $request->name;

```

使用动态属性时，Laravel 首先会在请求负载中查找参数的值，如果不存在，则会在匹配路由的参数中搜索该字段。

<a name="retrieving-a-portion-of-the-input-data"></a>

#### 检索输入数据的一部分

如果您需要检索输入数据的子集，则可以使用 `only` 和 `except` 方法。这两个方法都接受一个单一的 `array` 或动态参数列表：

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');

```

> **警告**
> `only` 方法返回您请求的所有键 / 值对；但是，它不会返回请求中不存在的键 / 值对。

<a name="determining-if-input-is-present"></a>

### 判断输入是否存在

您可以使用 `has` 方法来确定请求中是否存在某个值。如果请求中存在该值则 `has` 方法返回 `true`：

```
if ($request->has('name')) {
    // ...
}

```

当给定一个数组时，`has` 方法将确定所有指定的值是否都存在：

```
if ($request->has(['name', 'email'])) {
    // ...
}

```

`whenHas` 方法将在请求中存在一个值时执行给定的闭包：

```
$request->whenHas('name', function (string $input) {
    // ...
});
```

可以通过向 `whenHas` 方法传递第二个闭包来执行，在请求中没有指定值的情况下：

```
$request->whenHas('name', function (string $input) {
    // "name" 值存在...
}, function () {
    // "name" 值不存在...
});

```

`hasAny` 方法返回 `true`，如果任一指定的值存在，则它返回 `true`：

```
if ($request->hasAny(['name', 'email'])) {
    // ...
}

```

如果您想要确定请求中是否存在一个值且不是一个空字符串，则可以使用 `filled` 方法：

```
if ($request->filled('name')) {
    // ...
}

```

`whenFilled` 方法将在请求中存在一个值且不是空字符串时执行给定的闭包：

```
$request->whenFilled('name', function (string $input) {
    // ...
});

```

可以通过向 `whenFilled` 方法传递第二个闭包来执行，在请求中没有指定值的情况下：

```
$request->whenFilled('name', function (string $input) {
    // "name" 值已填写...
}, function () {
    // "name" 值未填写...
});

```

要确定给定的键是否不存在于请求中，可以使用 `missing` 和 `whenMissing` 方法：

```
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function (array $input) {
    // "name" 值缺失...
}, function () {
    // "name" 值存在...
});

```

<a name="merging-additional-input"></a>

### 合并其他输入

有时，您可能需要手动将其他输入合并到请求的现有输入数据中。为此，可以使用 `merge` 方法。如果给定的输入键已经存在于请求中，它将被提供给 `merge` 方法的数据所覆盖：

```
$request->merge(['votes' => 0]);
```

如果请求的输入数据中不存在相应的键，则可以使用 `mergeIfMissing` 方法将输入合并到请求中：

```
$request->mergeIfMissing(['votes' => 0]);

```

<a name="old-input"></a>

### 旧输入

Laravel 允许你在两次请求之间保留数据。这个特性在检测到验证错误后重新填充表单时特别有用。但是，如果您使用 Laravel 的包含的 [表单验证](/docs/laravel/10.x/validation)，不需要自己手动调用这些方法，因为 Laravel 的一些内置验证功能将自动调用它们。

<a name="flashing-input-to-the-session"></a>

#### 闪存输入到 Session

在 `Illuminate\Http\Request` 类上的 `flash` 方法将当前输入闪存到 [session](/docs/laravel/10.x/session)，以便在下一次用户请求应用程序时使用：

```
$request->flash();

```

您还可以使用 `flashOnly` 和 `flashExcept` 方法闪存一部分请求数据到  Session。这些方法对于将敏感信息（如密码）排除在 Session 外的情况下非常有用：

```
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');

```

<a name="flashing-input-then-redirecting"></a>

#### 闪存输入后重定向

由于您通常希望闪存输入到 Session，然后重定向到以前的页面，因此您可以使用 `withInput` 方法轻松地将输入闪存到重定向中：

```
return redirect('form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);

```

<a name="retrieving-old-input"></a>

#### 检索旧输入值

若要获取上一次请求所保存的旧输入数据，可以在 `Illuminate\Http\Request` 的实例上调用 `old` 方法。`old` 方法会从 [session](/docs/laravel/10.x/session) 中检索先前闪存的输入数据：

```
$username = $request->old('username');

```

此外，Laravel 还提供了一个全局辅助函数 `old`。如果您在 [Blade 模板](/docs/laravel/10.x/blade) 中显示旧的输入，则更方便使用 `old` 辅助函数重新填充表单。如果给定字段没有旧输入，则会返回 `null`：

```
<input type="text" name="username" value="{{ old('username') }}">

```

<a name="cookies"></a>

### Cookies

<a name="retrieving-cookies-from-requests"></a>

#### 检索请求中的 Cookies

Laravel 框架创建的所有 cookies 都经过加密并签名，这意味着如果客户端更改了 cookie 值，则这些 cookie 将被视为无效。要从请求中检索 cookie 值，请在 `Illuminate\Http\Request` 实例上使用 `cookie` 方法：

```
$value = $request->cookie('name');

```

<a name="input-trimming-and-normalization"></a>

## 输入过滤和规范化

默认情况下，Laravel 在应用程序的全局中间件栈中包含 `App\Http\Middleware\TrimStrings` 和 `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` 中间件。这些中间件在 `App\Http\Kernel` 类的全局中间件栈中列出。这些中间件将自动修剪请求中的所有字符串字段，并将任何空字符串字段转换为 `null`。这使您不必在路由和控制器中担心这些规范化问题。

#### 禁用输入规范化

如果要禁用所有请求的该行为，可以从 `App\Http\Kernel` 类的 `$middleware` 属性中删除这两个中间件，从而将它们从应用程序的中间件栈中删除。

如果您想要禁用应用程序的一部分请求的字符串修剪和空字符串转换，可以使用中间件提供的 `skipWhen` 方法。该方法接受一个闭包，该闭包应返回 `true` 或 `false`，以指示是否应跳过输入规范化。通常情况下，需要在应用程序的 `AppServiceProvider` 的 `boot` 方法中调用 `skipWhen` 方法。

```php
use App\Http\Middleware\TrimStrings;
use Illuminate\Http\Request;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    TrimStrings::skipWhen(function (Request $request) {
        return $request->is('admin/*');
    });

    ConvertEmptyStringsToNull::skipWhen(function (Request $request) {
        // ...
    });
}
```

<a name="files"></a>

## 文件

<a name="retrieving-uploaded-files"></a>

### 检索上传的文件

您可以使用 `file` 方法或动态属性从 `Illuminate\Http\Request` 实例中检索已上传的文件。`file` 方法返回 `Illuminate\Http\UploadedFile` 类的实例，该类扩展了 PHP 的 `SplFileInfo` 类，并提供了各种用于与文件交互的方法：

```php
$file = $request->file('photo');

$file = $request->photo;

```

您可以使用 `hasFile` 方法检查请求中是否存在文件：

```php
if ($request->hasFile('photo')) {
    // ...
}

```

<a name="validating-successful-uploads"></a>

#### 验证成功上传的文件

除了检查文件是否存在之外，您还可以通过 `isValid` 方法验证上传文件时是否存在问题：

```php
if ($request->file('photo')->isValid()) {
    // ...
}

```

<a name="file-paths-extensions"></a>

#### 文件路径和扩展名

`UploadedFile` 类还包含访问文件的完全限定路径及其扩展名的方法。`extension` 方法将尝试基于其内容猜测文件的扩展名。此扩展名可能与客户端提供的扩展名不同：

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>

#### 其他文件方法

`UploadedFile` 实例有许多其他可用的方法。有关这些方法的更多信息，请查看该类的 [API文档](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) 。

<a name="storing-uploaded-files"></a>

### 存储上传的文件

要存储已上传的文件，通常会使用您配置的一个[文件系统](/docs/laravel/10.x/filesystem) 。`UploadedFile` 类具有一个 `store` 方法，该方法将上传的文件移动到您的磁盘中的一个位置，该位置可以是本地文件系统上的位置，也可以是像 Amazon S3 这样的云存储位置。

`store` 方法接受存储文件的路径，该路径相对于文件系统的配置根目录。此路径不应包含文件名，因为将自动生成唯一的 ID 作为文件名。

`store` 方法还接受一个可选的第二个参数，用于指定应用于存储文件的磁盘的名称。该方法将返回相对于磁盘根目录的文件路径：

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');

```

如果您不希望自动生成文件名，则可以使用 `storeAs` 方法，该方法接受路径、文件名和磁盘名称作为其参数：

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');

```

> **注意**
> 有关在 Laravel 中存储文件的更多信息，请查看完整的 [文件存储文档](/docs/laravel/10.x/filesystem) 。

<a name="configuring-trusted-proxies"></a>

## 配置受信任的代理

在终止 TLS / SSL 证书的负载平衡器后面运行应用程序时，您可能会注意到，使用 `url` 帮助程序时，应用程序有时不会生成 HTTPS 链接。通常，这是因为正在从端口 `80` 上的负载平衡器转发应用程序的流量，并且不知道它应该生成安全链接。

为了解决这个问题，您可以使用 `App\Http\Middleware\TrustProxies` 中间件，这个中间件已经包含在 Laravel 应用程序中，它允许您快速定制应用程序应信任的负载均衡器或代理。您信任的代理应该被列在此中间件的 `$proxies` 属性上的数组中。除了配置受信任的代理之外，您还可以配置应该信任的代理 `$headers`：

```php
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

```

> **注意**
> 如果您正在使用 AWS 弹性负载平衡，请将 `$headers` 值设置为 `Request::HEADER_X_FORWARDED_AWS_ELB`。有关可在 `$headers` 属性中使用的常量的更多信息，请查看 Symfony 关于 [信任代理](https://symfony.com/doc/current/deployment/proxies.html) 的文档。

<a name="trusting-all-proxies"></a>

#### 信任所有代理

如果您使用的是 Amazon AWS 或其他「云」负载均衡器提供商，则可能不知道实际负载均衡器的 IP 地址。在这种情况下，您可以使用 `*` 来信任所有代理：

```
/**
 * 应用所信任的代理。
 *
 * @var string|array
 */
protected $proxies = '*';

```

<a name="configuring-trusted-hosts"></a>

## 配置可信任的 Host

默认情况下，Laravel 将响应它接收到的所有请求，而不管 HTTP 请求的 `Host` 标头的内容是什么。此外，在 web 请求期间生成应用程序的绝对 URL 时，将使用 `Host` 头的值。

通常情况下，您应该配置您的 Web 服务器（如 Nginx 或 Apache）仅向匹配给定主机名的应用程序发送请求。然而，如果您没有直接自定义您的 Web 服务器的能力，需要指示 Laravel 仅响应特定主机名的请求，您可以为您的应用程序启用 `App\Http\Middleware\TrustHosts` 中间件。

`TrustHosts` 中间件已经包含在应用程序的 `$middleware` 堆栈中；但是，您应该将其取消注释以使其生效。在此中间件的 `hosts` 方法中，您可以指定您的应用程序应该响应的主机名。具有其他 `Host` 值标头的传入请求将被拒绝：

```
/**
 * 获取应被信任的主机模式。
 *
 * @return array<int, string>
 */
public function hosts(): array
{
    return [
        'laravel.test',
        $this->allSubdomainsOfApplicationUrl(),
    ];
}

```

`allSubdomainsOfApplicationUrl` 帮助程序方法将返回与您的应用程序 `app.url` 配置值的所有子域相匹配的正则表达式。在构建利用通配符子域的应用程序时，这个帮助程序提供了一种方便的方法来允许所有应用程序的子域。
