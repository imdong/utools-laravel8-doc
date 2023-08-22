# HTTP Client

- [简介](#introduction)
- [创建请求](#making-requests)
    - [请求数据](#request-data)
    - [请求头](#headers)
    - [认证](#authentication)
    - [超时](#timeout)
    - [重试](#retries)
    - [错误处理](#error-handling)
    - [Guzzle 中间件](#guzzle-middleware)
    - [Guzzle 选项](#guzzle-options)
- [并发请求](#concurrent-requests)
- [宏](#macros)
- [测试](#testing)
    - [模拟响应](#faking-responses)
    - [注入请求](#inspecting-requests)
    - [防止意外请求](#preventing-stray-requests)
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

你可以使用 `Http` Facade 提供的 `head`, `get`, `post`, `put`, `patch`，以及 `delete` 方法来创建请求。首先，让我们先看一下如何发出一个基础的 GET 请求：

    use Illuminate\Support\Facades\Http;

    $response = Http::get('http://example.com');

`get` 方法返回一个 `Illuminate\Http\Client\Response` 的实例，该实例提供了大量的方法来检查请求的响应：

    $response->body() : string;
    $response->json($key = null, $default = null) : array|mixed;
    $response->object() : object;
    $response->collect($key = null) : Illuminate\Support\Collection;
    $response->status() : int;
    $response->successful() : bool;
    $response->redirect(): bool;
    $response->failed() : bool;
    $response->clientError() : bool;
    $response->header($header) : string;
    $response->headers() : array;

`Illuminate\Http\Client\Response` 对象同样实现了 PHP 的 `ArrayAccess` 接口，这代表着你可以直接访问响应的 JSON 数据：

    return Http::get('http://example.com/users/1')['name'];

除了上面列出的响应方法之外，还可以使用以下方法来确定响应是否具有相映的状态码：

    $response->ok() : bool;                  // 200 OK
    $response->created() : bool;             // 201 Created
    $response->accepted() : bool;            // 202 Accepted
    $response->noContent() : bool;           // 204 No Content
    $response->movedPermanently() : bool;    // 301 Moved Permanently
    $response->found() : bool;               // 302 Found
    $response->badRequest() : bool;          // 400 Bad Request
    $response->unauthorized() : bool;        // 401 Unauthorized
    $response->paymentRequired() : bool;     // 402 Payment Required
    $response->forbidden() : bool;           // 403 Forbidden
    $response->notFound() : bool;            // 404 Not Found
    $response->requestTimeout() : bool;      // 408 Request Timeout
    $response->conflict() : bool;            // 409 Conflict
    $response->unprocessableEntity() : bool; // 422 Unprocessable Entity
    $response->tooManyRequests() : bool;     // 429 Too Many Requests
    $response->serverError() : bool;         // 500 Internal Server Error

<a name="uri-templates"></a>
#### URI 模版

HTTP客户端还允许你使用 [URI 模板规范](https://www.rfc-editor.org/rfc/rfc6570) 构造请求URL. 要定义URI查询参数，你可以使用 `withUrlParameters` 方法：

    Http::withUrlParameters([
        'endpoint' => 'https://laravel.com',
        'page' => 'docs',
        'version' => '9.x',
        'topic' => 'validation',
    ])->get('{+endpoint}/{page}/{version}/{topic}');

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

在创建 `GET` 请求时，你可以通过直接向 URL 添加查询字符串或是将键值对作为第二个参数传递给 `get` 方法：

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

你可以通过 `withHeaders` 方法添加请求头。该 `withHeaders` 方法接受一个数组格式的键 / 值对：

    $response = Http::withHeaders([
        'X-First' => 'foo',
        'X-Second' => 'bar'
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
    ]);

你可以使用 `accept` 方法指定应用程序响应你的请求所需的内容类型：

    $response = Http::accept('application/json')->get('http://example.com/users');

为方便起见，你可以使用 `acceptJson` 方法快速指定应用程序需要 `application/json` 内容类型来响应你的请求：

    $response = Http::acceptJson()->get('http://example.com/users');

<a name="authentication"></a>
### 认证

你可以使用 `withBasicAuth` 和 `withDigestAuth` 方法来分别指定使用 Basic 或是 Digest 认证方式：

    // Basic 认证方式...
    $response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

    // Digest 认证方式...
    $response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);

<a name="bearer-tokens"></a>
#### Bearer 令牌

如果你想要为你的请求快速添加 `Authorization` Token 令牌请求头，你可以使用 `withToken` 方法：

    $response = Http::withToken('token')->post(/* ... */);

<a name="timeout"></a>
### 超时

该 `timeout` 方法用于指定响应的最大等待秒数：

    $response = Http::timeout(3)->get(/* ... */);

如果响应时间超过了指定的超时时间，将会抛出 `Illuminate\Http\Client\ConnectionException` 异常。

你可以尝试使用 `connectTimeout` 方法指定连接到服务器时等待的最大秒数：

    $response = Http::connectTimeout(3)->get(/* ... */);

<a name="retries"></a>
### 重试

如果你希望 HTTP 客户端在发生客户端或服务端错误时自动进行重试，你可以使用 retry 方法。该 retry 方法接受两个参数：重新尝试次数以及重试间隔（毫秒）：

    $response = Http::retry(3, 100)->post(/* ... */);

如果需要，你可以将第三个参数传递给该 `retry` 方法。第三个参数应该是一个可调用的，用于确定是否应该实际尝试重试。例如，你可能希望仅在初始请求遇到以下情况时重试请求 `ConnectionException`：

    use Exception;
    use Illuminate\Http\Client\PendingRequest;

    $response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
        return $exception instanceof ConnectionException;
    })->post(/* ... */);

如果请求失败，你可以在新请求之前更改请求。你可以通过修改 `retry` 方法的第三个请求参数来实现这一点。例如，当请求返回身份验证错误，则可以使用新的授权令牌重试请求：

    use Exception;
    use Illuminate\Http\Client\PendingRequest;

    $response = Http::withToken($this->getToken())->retry(2, 0, function (Exception $exception, PendingRequest $request) {
        if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
            return false;
        }

        $request->withToken($this->getNewToken());

        return true;
    })->post(/* ... */);

所有请求都失败时，将会抛出一个`Illuminate\Http\Client\RequestException`实例。如果不想抛出错误，你需要设置请求方法的`throw`参数为`false`。禁止后，当所有的请求都尝试完成后，最后一个响应将会return回来：

    $response = Http::retry(3, 100, throw: false)->post(/* ... */);

> **注意**   
> 如果所有的请求都因为连接问题失败， 即使 `throw`属性设置为`false`，`Illuminate\Http\Client\ConnectionException`错误依旧会被抛出。

<a name="error-handling"></a>
### 错误处理

与 Guzzle 的默认处理方式不同，Laravel 的 HTTP 客户端在客户端或者服务端出现4xx或者5xx错误时并不会抛出错误。你应该通过`successful`、 `clientError`或 `serverError`方法来校验返回的响应是否有错误信息:

    // 判断状态码是否是 2xx
    $response->successful();

    // 判断错误码是否是 4xx或5xx
    $response->failed();

    // 判断错误码是4xx
    $response->clientError();

    // 判断错误码是5xx
    $response->serverError();

    // 如果出现客户端或服务器错误，则执行给定的回调
    $response->onError(callable $callback);

<a name="throwing-exceptions"></a>
#### 主动抛出错误

如果你想在收到的响应是客户端或者服务端错误时抛出一个`Illuminate\Http\Client\RequestException`实例，你可以使用`throw` 或 `throwIf` 方法：

    use Illuminate\Http\Client\Response;

    $response = Http::post(/* ... */);

    // 当收到服务端或客户端错误时抛出
    $response->throw();

    // 当满足condition条件是抛出错误
    $response->throwIf($condition);

    // 当给定的闭包执行结果是true时抛出错误
    $response->throwIf(fn (Response $response) => true);

    // 当给定条件是false是抛出错误
    $response->throwUnless($condition);

    // 当给定的闭包执行结果是false时抛出错误
    $response->throwUnless(fn (Response $response) => false);

    // 当收到的状态码是403时抛出错误
    $response->throwIfStatus(403);

    // 当收到的状态码不是200时抛出错误
    $response->throwUnlessStatus(200);

    return $response['user']['id'];

`Illuminate\Http\Client\RequestException` 实例拥有一个  `$response` 公共属性，该属性允许你检查返回的响应。

如果没有发生错误，`throw` 方法返回响应实例，你可以将其他操作链接到 `throw` 方法：

    return Http::post(/* ... */)->throw()->json();

如果你希望在抛出异常前进行一些操作，你可以向 `throw` 方法传递一个闭包。异常将会在闭包执行完成后自动抛出，你不必在闭包内手动抛出异常：

    use Illuminate\Http\Client\Response;
    use Illuminate\Http\Client\RequestException;

    return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
        // ...
    })->json();

<a name="guzzle-middleware"></a>
### Guzzle 中间件

由于 Laravel 的 HTTP 客户端是由 Guzzle 提供支持的, 你可以利用 [Guzzle 中间件](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html) 来操作发出的请求或检查传入的响应。要操作发出的请求，需要通过 `withMiddleware` 方法和 Guzzle 的 `mapRequest` 中间件工厂注册一个 Guzzle 中间件：

    use GuzzleHttp\Middleware;
    use Illuminate\Support\Facades\Http;
    use Psr\Http\Message\RequestInterface;

    $response = Http::withMiddleware(
        Middleware::mapRequest(function (RequestInterface $request) {
            $request = $request->withHeader('X-Example', 'Value');
            
            return $request;
        })
    )->get('http://example.com');

同样地，你可以通过 `withMiddleware` 方法结合 Guzzle 的 `mapResponse` 中间件工厂注册一个中间件来检查传入的 HTTP 响应：

    use GuzzleHttp\Middleware;
    use Illuminate\Support\Facades\Http;
    use Psr\Http\Message\ResponseInterface;

    $response = Http::withMiddleware(
        Middleware::mapResponse(function (ResponseInterface $response) {
            $header = $response->getHeader('X-Example');

            // ...
            
            return $response;
        })
    )->get('http://example.com');

<a name="guzzle-options"></a>
### Guzzle 选项

你可以使用 `withOptions` 方法来指定额外的 [Guzzle 请求配置](http://docs.guzzlephp.org/en/stable/request-options.html)。`withOptions` 方法接受数组形式的键 / 值对：

    $response = Http::withOptions([
        'debug' => true,
    ])->get('http://example.com/users');

<a name="concurrent-requests"></a>
## 并发请求

有时，你可能希望同时发出多个 HTTP 请求。换句话说，你希望同时分派多个请求，而不是按顺序发出请求。当与慢速 HTTP API 交互时，这可以显着提高性能。

值得庆幸的是，你可以使用该 `pool` 方法完成此操作。`pool` 方法接受一个接收 `Illuminate\Http\Client\Pool` 实例的闭包，能让你轻松地将请求添加到请求池以进行调度：

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

如你所见，每个响应实例可以按照添加到池中的顺序来访问。你可以使用 `as` 方法命名请求，该方法能让你按名称访问相应的响应：

    use Illuminate\Http\Client\Pool;
    use Illuminate\Support\Facades\Http;

    $responses = Http::pool(fn (Pool $pool) => [
        $pool->as('first')->get('http://localhost/first'),
        $pool->as('second')->get('http://localhost/second'),
        $pool->as('third')->get('http://localhost/third'),
    ]);

    return $responses['first']->ok();

<a name="macros"></a>
## 宏

Laravel HTTP客户端允许你定义「宏」（macros），这可以作为一种流畅、表达力强的机制，在与应用程序中的服务交互时配置常见的请求路径和标头。要开始使用，你可以在应用程序的 `App\Providers\AppServiceProvider` 类的 `boot` 方法中定义宏：

    use Illuminate\Support\Facades\Http;

    /**
     * 引导应用程序服务。
     */
    public function boot(): void
    {
        Http::macro('github', function () {
            return Http::withHeaders([
                'X-Example' => 'example',
            ])->baseUrl('https://github.com');
        });
    }

一旦你配置了宏，你可以在应用程序的任何地方调用它，以使用指定的配置创建一个挂起的请求：

    $response = Http::github()->get('/');

<a name="testing"></a>
## 测试

许多 Laravel 服务提供功能来帮助你轻松、表达性地编写测试，而 Laravel 的 HTTP 客户端也不例外。`Http` 门面的 `fake` 方法允许你指示 HTTP 客户端在发出请求时返回存根/虚拟响应。

<a name="faking-responses"></a>
### 伪造响应

例如，要指示 HTTP 客户端在每个请求中返回空的 `200` 状态码响应，你可以调用 `fake` 方法而不传递参数：

    use Illuminate\Support\Facades\Http;

    Http::fake();

    $response = Http::post(/* ... */);

<a name="faking-specific-urls"></a>
#### 伪造特定的URL

另外，你可以向 `fake` 方法传递一个数组。该数组的键应该代表你想要伪造的 URL 模式及其关联的响应。`*` 字符可以用作通配符。任何请求到未伪造的 URL 的请求将会被实际执行。你可以使用 `Http` 门面的 `response` 方法来构建这些端点的存根/虚拟响应：

    Http::fake([
        // 为 GitHub 端点存根一个 JSON 响应...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

        // 为 Google 端点存根一个字符串响应...
        'google.com/*' => Http::response('Hello World', 200, $headers),
    ]);

如果你想指定一个后备 URL 模式来存根所有不匹配的 URL，你可以使用单个 `*` 字符：

    Http::fake([
        // 为 GitHub 端点存根 JSON 响应……
        'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

        // 为其他所有端点存根字符串响应……
        '*' => Http::response('Hello World', 200, ['Headers']),
    ]);

<a name="faking-response-sequences"></a>
#### 伪造响应序列

有时候，你可能需要为单个 URL 指定其一系列的伪造响应的返回顺序。你可以使用 `Http::sequence` 方法来构建响应，以实现这个功能：

    Http::fake([
        // 存根 GitHub端点的一系列响应……
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->pushStatus(404),
    ]);

当响应序列中的所有响应都被消费完后，后续的任何请求都将导致相应序列抛出一个异常。如果你想要在响应序列为空时指定一个默认的响应，则可以使用 `whenEmpty` 方法：

    Http::fake([
        // 为 GitHub 端点存根一系列响应
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->whenEmpty(Http::response()),
    ]);

如果你想要伪造一个响应序列，但你又期望在伪造的时候无需指定一个特定的 URL 匹配模式，那么你可以使用 `Http::fakeSequence` 方法：

    Http::fakeSequence()
            ->push('Hello World', 200)
            ->whenEmpty(Http::response());

<a name="fake-callback"></a>
#### Fake 回调

如果你需要更为复杂的逻辑来确定某些端点返回什么响应，你需要传递一个闭包给 `fake` 方法。这个闭包应该接受一个 `Illuminate\Http\Client\Request` 实例且返回一个响应实例。在闭包中你可以执行任何必要的逻辑来确定要返回的响应类型：

    use Illuminate\Http\Client\Request;

    Http::fake(function (Request $request) {
        return Http::response('Hello World', 200);
    });

<a name="preventing-stray-requests"></a>
### 避免「流浪的」请求（确保请求总是伪造的）

如果你想确保通过 HTTP 客户端发送的所有请求在整个单独的测试或完整的测试套件中都是伪造的，那么你可以调用 `preventStrayRequests` 方法。在调用该方法后，如果一个请求没有与之相匹配的伪造的响应，则将会抛出一个异常而不是发起一个真实的请求：

    use Illuminate\Support\Facades\Http;

    Http::preventStrayRequests();

    Http::fake([
        'github.com/*' => Http::response('ok'),
    ]);

    // 将会返回 OK 响应……
    Http::get('https://github.com/laravel/framework');

    // 抛出一个异常……
    Http::get('https://laravel.com');

<a name="inspecting-requests"></a>
### 检查请求

在伪造响应时，你可能希望检查客户端收到的请求，以确保你的应用程序发出了正确的数据和标头。你可以在调用 `Http::fake` 方法后调用 `Http::assertSent` 方法来实现这个功能。

`assertSent` 方法接受一个闭包，该闭包应当接收一个 `Illuminate\Http\Client\Request` 实例且返回一个布尔值，该布尔值指示请求是否符合预期。为了使得测试通过，必须至少发出一个符合给定预期的请求：

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

如果有需要，你可以使用 `assertNotSent` 方法来断言未发出指定的请求：

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

你可以使用 `assertSentCount` 方法来断言在测试过程中发出的请求数量：

    Http::fake();

    Http::assertSentCount(5);

或者，你也可以使用 `assertNothingSent` 方法来断言在测试过程中没有发出任何请求：

    Http::fake();

    Http::assertNothingSent();

<a name="recording-requests-and-responses"></a>
#### 记录请求和响应

你可以使用 `recorded` 方法来收集所有的请求及其对应的响应。`recorded` 方法返回一个数组集合，其中包含了 `Illuminate\Http\Client\Request` 实例和 `Illuminate\Http\Client\Response` 实例：

    Http::fake([
        'https://laravel.com' => Http::response(status: 500),
        'https://nova.laravel.com/' => Http::response(),
    ]);

    Http::get('https://laravel.com');
    Http::get('https://nova.laravel.com/');

    $recorded = Http::recorded();

    [$request, $response] = $recorded[0];

此外，`recorded` 函数也接受一个闭包，该闭包接受一个 `Illuminate\Http\Client\Request` 和 `Illuminate\Http\Client\Response` 实例，该闭包可以用来按照你的期望来过滤请求和响应：

    use Illuminate\Http\Client\Request;
    use Illuminate\Http\Client\Response;

    Http::fake([
        'https://laravel.com' => Http::response(status: 500),
        'https://nova.laravel.com/' => Http::response(),
    ]);

    Http::get('https://laravel.com');
    Http::get('https://nova.laravel.com/');

    $recorded = Http::recorded(function (Request $request, Response $response) {
        return $request->url() !== 'https://laravel.com' &&
               $response->successful();
    });

<a name="events"></a>
## 事件

Laravel 在发出 HTTP 请求的过程中将会触发三个事件。在发送请求前将会触发 `RequestSending` 事件，在接收到了指定请求对应的响应时将会触发 `ResponseReceived` 事件。如果没有收到指定请求对应的响应则会触发 `ConnectionFailed` 事件。

`RequestSending` 和 `ConnectionFailed` 事件都包含一个公共的 `$request` 属性，你可以使用它来检查 `Illuminate\Http\Client\Request` 实例。 同样，`ResponseReceived` 事件包含一个 `$request` 属性以及一个 `$response` 属性，可用于检查 `Illuminate\Http\Client\Response` 实例。 你可以在你的 `App\Providers\EventServiceProvider` 服务提供者中为这个事件注册事件监听器：

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