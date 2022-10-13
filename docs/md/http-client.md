# HTTP 客户端

- [简介](#introduction)
- [创建请求](#making-requests)
    - [请求数据](#request-data)
    - [请求头](#headers)
    - [认证](#authentication)
    - [超时](#timeout)
    - [重试](#retries)
    - [错误处理](#error-handling)
    - [Guzzle 选项](#guzzle-options)
- [并发请求](#concurrent-requests)
- [宏](#macros)
- [测试](#testing)
    - [模拟响应](#faking-responses)
    - [注入请求](#inspecting-requests)
- [事件](#events)

<a name="introduction"></a>
## 简介

Laravel 为 [Guzzle HTTP 客户端](http://docs.guzzlephp.org/en/stable/) 提供了一套语义化且轻量的 API，让你可用快速地使用 HTTP 请求与其他 Web 应用进行通信。该 API 专注于其在常见用例中的快速实现以及良好的开发者体验。

在开始之前，你需要确保你的项目已经安装了 Guzzle 包作为依赖项。默认情况下，Laravel 已经包含了 Guzzle 包。但如果你此前手动移除了它，你也可以通过 Composer 重新安装它：

```shell
composer require guzzlehttp/guzzle
```

<a name="making-requests"></a>
## 创建请求

你可以使用 `Http` Facade 提供的 `head`, `get`, `post`, `put`, `patch`，以及 `delete` 方法来创建请求。首先，让我们先看一下如何发出一个基础的 `GET` 请求：

    use Illuminate\Support\Facades\Http;

    $response = Http::get('http://example.com');

`get` 方法返回一个 `Illuminate\Http\Client\Response`的实例，该实例提供了大量的方法来检查请求的响应：

    $response->body() : string;
    $response->json($key = null) : array|mixed;
    $response->object() : object;
    $response->collect($key = null) : Illuminate\Support\Collection;
    $response->status() : int;
    $response->ok() : bool;
    $response->successful() : bool;
    $response->redirect(): bool;
    $response->failed() : bool;
    $response->serverError() : bool;
    $response->clientError() : bool;
    $response->header($header) : string;
    $response->headers() : array;



`Illuminate\Http\Client\Response` 对象同样实现了 PHP 的 `ArrayAccess` 接口，这代表着你可以直接访问响应的 JSON 数据：

    return Http::get('http://example.com/users/1')['name'];

<a name="dumping-requests"></a>
#### 打印请求信息

如果要在发送请求之前打印输出请求信息并且结束脚本运行，你应该在创建请求前调用 `dd` 方法：

    return Http::dd()->get('http://example.com');

<a name="request-data"></a>
### 请求数据

大多数情况下，`POST`、 `PUT` 和 `PATCH` 携带着额外的请求数据是相当常见的。所以，这些方法的第二个参数接受一个包含着请求数据的数组。默认情况下，这些数据会使用 `application/json` 类型随请求发送：

    use Illuminate\Support\Facades\Http;

    $response = Http::post('http://example.com/users', [
        'name' => 'Steve',
        'role' => 'Network Administrator',
    ]);

<a name="get-request-query-parameters"></a>
#### GET 请求查询参数

在创建 `GET` 请求时，你可以通过直接向 URL 添加查询字符串 或是 将键值对作为第二个参数传递给 `get` 方法：

    $response = Http::get('http://example.com/users', [
        'name' => 'Taylor',
        'page' => 1,
    ]);

<a name="sending-form-url-encoded-requests"></a>
#### 发送 URL 编码请求

如果你希望使用 `application/x-www-form-urlencoded` 作为请求的数据类型，你应该在创建请求前调用 `asForm` 方法：

    $response = Http::asForm()->post('http://example.com/users', [
        'name' => 'Sara',
        'role' => 'Privacy Consultant',
    ]);

<a name="sending-a-raw-request-body"></a>
#### 发送原始数据（Raw）请求

如果你想使用一个原始请求体发送请求，你可以在创建请求前调用 `withBody` 方法。你还可以将数据类型作为第二个参数传递给 `withBody` 方法：

    $response = Http::withBody(
        base64_encode($photo), 'image/jpeg'
    )->post('http://example.com/photo');



<a name="multi-part-requests"></a>
#### Multi-Part 请求

如果你希望将文件作为 Multipart 请求发送，你应该在创建请求前调用 `attach` 方法。该方法接受文件的名字（相当于 HTML Input 的 name 属性）以及它对应的内容。你也可以在第三个参数传入自定义的文件名称，这不是必须的。如果有需要，你也可以通过第三个参数来指定文件的文件名：

    $response = Http::attach(
        'attachment', file_get_contents('photo.jpg'), 'photo.jpg'
    )->post('http://example.com/attachments');

除了传递文件的原始内容，你也可以传递 Stream 流数据：

    $photo = fopen('photo.jpg', 'r');

    $response = Http::attach(
        'attachment', $photo, 'photo.jpg'
    )->post('http://example.com/attachments');

<a name="headers"></a>
### 请求头

你可以通过 `withHeaders` 方法添加请求头。该 `withHeaders` 方法接受一个数组格式的键 / 值对：

    $response = Http::withHeaders([
        'X-First' => 'foo',
        'X-Second' => 'bar'
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
    ]);

您可以使用 `accept` 方法指定应用程序响应您的请求所需的内容类型：

    $response = Http::accept('application/json')->get('http://example.com/users');

为方便起见，您可以使用 `acceptJson` 方法快速指定应用程序需要 `application/json` 内容类型来响应您的请求：

    $response = Http::acceptJson()->get('http://example.com/users');

<a name="authentication"></a>
### 认证

你可以使用 `withBasicAuth` 和 `withDigestAuth` 方法来分别指定使用 Basic 或是 Digest 认证方式：

    // Basic 认证方式...
    $response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(...);

    // Digest 认证方式...
    $response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(...);

<a name="bearer-tokens"></a>


#### Bearer 令牌

如果你想要为你的请求快速添加 `Authorization` Token 令牌请求头，你可以使用 `withToken`  方法：

    $response = Http::withToken('token')->post(...);

<a name="timeout"></a>
### 超时

该 `timeout` 方法用于指定响应的最大等待秒数：

    $response = Http::timeout(3)->get(...);

如果响应时间超过了指定的超时时间，将会抛出 `Illuminate\Http\Client\ConnectionException` 异常。

您可以尝试使用 `connectTimeout` 方法指定连接到服务器时等待的最大秒数：

    $response = Http::connectTimeout(3)->get(...);

<a name="retries"></a>
### 重试

如果你希望 HTTP 客户端在发生客户端或服务端错误时自动进行重试，你可以使用 `retry` 方法。该`retry` 方法接受两个参数：重新尝试次数以及重试间隔（毫秒）：

    $response = Http::retry(3, 100)->post(...);

如果需要，您可以将第三个参数传递给该 `retry` 方法。第三个参数应该是一个可调用的，用于确定是否应该实际尝试重试。例如，您可能希望仅在初始请求遇到以下情况时重试请求 `ConnectionException`：

    $response = Http::retry(3, 100, function ($exception) {
        return $exception instanceof ConnectionException;
    })->post(...);

如果所有的请求都失败了， `Illuminate\Http\Client\RequestException` 异常将会被抛出。如果您想禁用此行为，您可以提供 `throw` 一个值为 `false` 的参数。禁用时，客户端收到的最后一个响应将在尝试所有重试后返回：

    $response = Http::retry(3, 100, throw: false)->post(...);



<a name="error-handling"></a>
### 错误处理

跟 Guzzle 的默认行为不同，Laravel HTTP 客户端并不会在客户端或服务端错误时抛出异常（`400` 及 `500` 状态码）。你可以通过 `successful`、 `clientError` 或是 `serverError` 方法来判断是否发生错误：

    // 如果状态码在 200 - 300之间
    $response->successful();

    // 如果状态码 大于 400...
    $response->failed();

    // 如果状态码是 400 级别的错误...
    $response->clientError();

    // 如果状态码是 500 级别的错误...
    $response->serverError();

    // 如果出现客户端或服务器错误，请立即执行给定的回调...
    $response->onError(callable $callback);

<a name="throwing-exceptions"></a>
#### 抛出异常

如果你希望请求在发生客户端或服务端错误时抛出 `Illuminate\Http\Client\RequestException` 异常，你可以在请求实例上调用 `throw` 或 `throwIf` 方法：

    $response = Http::post(...);

    // 在客户端或服务端错误发生时抛出异常...
    $response->throw();

    // 如果发生错误且给定条件为true，则引发异常...
    $response->throwIf($condition);

    return $response['user']['id'];

该 `Illuminate\Http\Client\RequestException` 实例拥有一个 `$response` 公共属性，该属性允许你检查返回的响应。

如果没有发生错误， `throw` 该方法返回响应实例，允许您将其他操作链接到该 `throw` 方法：

    return Http::post(...)->throw()->json();

如果你希望在抛出异常前进行一些操作，你可以向 `throw` 方法传递一个闭包。异常将会在闭包执行完成后自动抛出，你不必在闭包内手动抛出异常：

    return Http::post(...)->throw(function ($response, $e) {
        //
    })->json();



<a name="guzzle-options"></a>
### Guzzle 选项

你可以使用 `withOptions` 方法来指定额外的 [Guzzle 请求配置](http://docs.guzzlephp.org/en/stable/request-options.html) 。该 `withOptions` 方法接受数组形式的键 / 值对：

    $response = Http::withOptions([
        'debug' => true,
    ])->get('http://example.com/users');

<a name="concurrent-requests"></a>
## 并发请求

有时，您可能希望同时发出多个 HTTP 请求。换句话说，您希望同时分派多个请求，而不是按顺序发出请求。当与慢速 HTTP API 交互时，这可以显着提高性能。

值得庆幸的是，您可以使用该 `pool` 方法完成此操作。该 `pool` 方法接受一个接收 `Illuminate\Http\Client\Pool` 实例的闭包，允许您轻松地将请求添加到请求池以进行调度：

    use Illuminate\Http\Client\Pool;
    use Illuminate\Support\Facades\Http;

    $responses = Http::pool(fn (Pool $pool) => [
        $pool->get('http://localhost/first'),
        $pool->get('http://localhost/second'),
        $pool->get('http://localhost/third'),
    ]);

    return $responses[0]->ok() &&
           $responses[1]->ok() &&
           $responses[2]->ok();

如您所见，可以根据添加到池中的顺序访问每个响应实例。如果您愿意，您可以使用该 `as` 方法命名请求，该方法允许您按名称访问相应的响应：

    use Illuminate\Http\Client\Pool;
    use Illuminate\Support\Facades\Http;

    $responses = Http::pool(fn (Pool $pool) => [
        $pool->as('first')->get('http://localhost/first'),
        $pool->as('second')->get('http://localhost/second'),
        $pool->as('third')->get('http://localhost/third'),
    ]);

    return $responses['first']->ok();



<a name="macros"></a>
## Macros

Laravel HTTP 客户端允许您定义「macros」，它可以作为一种流畅的、富有表现力的机制，在与整个应用程序中的服务交互时配置常见的请求路径和标头。首先，您可以在应用程序的 `App\Providers\AppServiceProvider` 类的 `boot` 方法中定义 `macro` ：

```php
use Illuminate\Support\Facades\Http;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

配置好宏后，您可以从应用程序中的任何位置调用它，以创建具有指定配置的待处理请求：

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## 测试

许多 Laravel 服务都提供了帮助您轻松且富有表现力地编写测试的功能，Laravel 的 HTTP 包装器也不例外。 `Http` 门面的 `fake` 方法允许您指示 HTTP 客户端在发出请求时返回存根/虚拟响应。

<a name="faking-responses"></a>
### 伪造响应

例如，要指示HTTP客户端为每个请求返回空的`200`状态码响应，您可以调用不带参数的`fake`方法：

    use Illuminate\Support\Facades\Http;

    Http::fake();

    $response = Http::post(...);

<a name="faking-specific-urls"></a>
#### 伪造特定URL

或者，您也可以将数组传递给`fake`方法。
数组的键应该表示您希望伪造的URL模式及其相关响应。
字符`*‘可以用作通配符。
对未被伪造的URL发出的任何请求都将实际执行。
您可以使用`Http`外观的`response`方法为这些端点构造存根/假响应：

    Http::fake([
        // 为 GitHub 端点存根 JSON 响应...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

        // 为 Google 端点存根字符串响应...
        'google.com/*' => Http::response('Hello World', 200, $headers),
    ]);



如果你想指定一个后备 URL 模式来存根所有不匹配的 URL，你可以使用单个 `*` 字符：

    Http::fake([
        // 为 GitHub 端点存根 JSON 响应...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

        // 为所有其他端点存根字符串响应...
        '*' => Http::response('Hello World', 200, ['Headers']),
    ]);

<a name="faking-response-sequences"></a>
#### 伪造响应序列

有时您可能需要指定单个 URL 应按特定顺序返回一系列虚假响应。您可以使用 `Http::sequence` 方法来构建响应来完成此操作：

    Http::fake([
        // 为 GitHub 端点存根一系列响应...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->pushStatus(404),
    ]);

当一个响应序列中的所有响应都被消费完后，任何进一步的请求都会导致响应序列抛出异常。如果您想指定在序列为空时应返回的默认响应，您可以使用 `whenEmpty` 方法：

    Http::fake([
        // 为 GitHub 端点存根一系列响应...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->whenEmpty(Http::response()),
    ]);

如果您想伪造一系列响应，但不需要指定应该伪造的特定 URL 模式，您可以使用 `Http::fakeSequence` 方法：

    Http::fakeSequence()
            ->push('Hello World', 200)
            ->whenEmpty(Http::response());

<a name="fake-callback"></a>
#### Fake 回调

如果您需要更复杂的逻辑来确定为某些端点返回什么响应，您可以将闭包传递给 `fake` 方法。 这个闭包将接收一个 `Illuminate\Http\Client\Request` 的实例并且应该返回一个响应实例。 在您的闭包中，您可以执行任何必要的逻辑来确定要返回的响应类型：

    Http::fake(function ($request) {
        return Http::response('Hello World', 200);
    });



<a name="inspecting-requests"></a>
### 检查请求

在伪造响应时，您可能偶尔希望检查客户端收到的请求，以确保您的应用程序正在发送正确的数据或标头。您可以在调用 `Http::fake` 后调用 `Http::assertSent` 方法来完成此操作。

`assertSent` 方法接受一个闭包，该闭包将接收一个 `Illuminate\Http\Client\Request` 实例，并应返回一个布尔值，指示请求是否符合您的期望。为了使测试通过，必须至少发出一个符合给定期望的请求：

    use Illuminate\Http\Client\Request;
    use Illuminate\Support\Facades\Http;

    Http::fake();

    Http::withHeaders([
        'X-First' => 'foo',
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
        'role' => 'Developer',
    ]);

    Http::assertSent(function (Request $request) {
        return $request->hasHeader('X-First', 'foo') &&
               $request->url() == 'http://example.com/users' &&
               $request['name'] == 'Taylor' &&
               $request['role'] == 'Developer';
    });

如果需要，您可以使用 `assertNotSent` 方法断言未发送特定请求：

    use Illuminate\Http\Client\Request;
    use Illuminate\Support\Facades\Http;

    Http::fake();

    Http::post('http://example.com/users', [
        'name' => 'Taylor',
        'role' => 'Developer',
    ]);

    Http::assertNotSent(function (Request $request) {
        return $request->url() === 'http://example.com/posts';
    });

您可以使用 `assertSentCount` 方法来断言在测试期间“发送”了多少请求：

    Http::fake();

    Http::assertSentCount(5);

或者，您可以使用 `assertNothingSent` 方法断言在测试期间没有发送任何请求：

    Http::fake();

    Http::assertNothingSent();

<a name="events"></a>
## 事件

Laravel 在发送 HTTP 请求的过程中会触发三个事件。 `RequestSending` 事件在发送请求之前触发，而 `ResponseReceived` 事件在收到给定请求的响应后触发。 如果没有收到给定请求的响应，则会触发 `ConnectionFailed` 事件。



`RequestSending` 和 `ConnectionFailed` 事件都包含一个公共的 `$request` 属性，您可以使用它来检查 `Illuminate\Http\Client\Request` 实例。 同样，`ResponseReceived`事件包含一个`$request`属性以及一个`$response`属性，可用于检查`Illuminate\Http\Client\Response`实例。 你可以在你的 App\Providers\EventServiceProvider 服务提供者中为这个事件注册事件监听器：

    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Http\Client\Events\RequestSending' => [
            'App\Listeners\LogRequestSending',
        ],
        'Illuminate\Http\Client\Events\ResponseReceived' => [
            'App\Listeners\LogResponseReceived',
        ],
        'Illuminate\Http\Client\Events\ConnectionFailed' => [
            'App\Listeners\LogConnectionFailed',
        ],
    ];

