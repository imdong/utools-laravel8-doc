# 错误处理

- [介绍](#introduction)
- [配置](#configuration)
- [异常处理](#the-exception-handler)
    - [异常报告](#reporting-exceptions)
    - [忽略指定类型异常](#ignoring-exceptions-by-type)
    - [渲染异常](#rendering-exceptions)
    - [Reportable & Renderable 异常](#renderable-exceptions)
- [HTTP 异常](#http-exceptions)
    - [自定义 HTTP 错误页面](#custom-http-error-pages)

<a name="introduction"></a>
## 介绍

当你开始一个新的 `Laravel` 项目时，它已经为您配置了错误和异常处理。 `App\Exceptions\Handler` 类用于记录应用程序触发的所有异常，然后将其呈现回用户。我们将在本文中深入讨论这个类。

<a name="configuration"></a>
## 配置

你的 `config/app.php` 配置文件中的 `debug` 选项决定了对于一个错误实际上将显示多少信息给用户。默认情况下，该选项的设置将遵照存储在 `.env` 文件中的 `APP_DEBUG` 环境变量的值。

对于本地开发，你应该将 `APP_DEBUG` 环境变量的值设置为 `true`。**在生产环境中，该值应始终为 `false`。如果在生产中将该值设置为 `true`，则可能会将敏感配置值暴露给应用程序的终端用户。**

<a name="the-exception-handler"></a>
## 异常处理

<a name="reporting-exceptions"></a>
### 异常报告

所有异常都是由 `App\Exceptions\Handler` 类处理。此类包含一个 `register` 方法，可以在其中注册自定义异常报告程序和渲染器回调。我们将详细研究每个概念。异常报告用于记录异常或将其发送到如 [Flare](https://flareapp.io)、[Bugsnag](https://bugsnag.com) 或 [Sentry](https://github.com/getsentry/sentry-laravel) 等外部服务。默认情况下，将根据你的 [日志](/docs/laravel/9.x/logging) 配置来记录异常。不过，你可以用任何自己喜欢的方式来记录异常。



例如，如果您需要以不同的方式报告不同类型的异常，您可以使用 `reportable` 方法注册一个闭包，当需要报告给定的异常的时候便会执行它。 Laravel 将通过检查闭包的类型提示来判断闭包报告的异常类型：

    use App\Exceptions\InvalidOrderException;

    /**
     * 为应用程序注册异常处理回调
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (InvalidOrderException $e) {
            //
        });
    }

当您使用 reportable 方法注册一个自定义异常报告回调时， Laravel 依然会使用默认的日志配置记录下应用异常。 如果您想要在默认的日志堆栈中停止这个行为，您可以在定义报告回调时使用 stop 方法：

    $this->reportable(function (InvalidOrderException $e) {
        //
    })->stop();

    $this->reportable(function (InvalidOrderException $e) {
        return false;
    });

> 技巧：要为给定的异常自定义异常报告，您可以使用 [可报告异常](/docs/laravel/9.x/errors#renderable-exceptions)。

<a name="global-log-context"></a>
#### 全局日志上下文

在可用的情况下， Laravel 会自动将当前用户的编号作为数据添加到每一条异常日志信息中。您可以通过重写 App\Exceptions\Handler 类中的 context 方法来定义您自己的全局上下文数据（环境变量）。此后，每一条异常日志信息都将包含这个信息：

    /**
     * 获取默认日志的上下文变量
     *
     * @return array
     */
    protected function context()
    {
        return array_merge(parent::context(), [
            'foo' => 'bar',
        ]);
    }

<a name="exception-log-context"></a>


#### 异常日志上下文

虽然为每条日志消息添加上下文可能很有用，但有时特定异常可能具有您希望包含在日志中的独特上下文。通过在应用程序的自定义异常上定义 `context` 方法，您可以指定应添加到异常日志条目中的与该异常相关的任何数据：

    <?php

    namespace App\Exceptions;

    use Exception;

    class InvalidOrderException extends Exception
    {
        // ...

        /**
         * Get the exception's context information.
         *
         * @return array
         */
        public function context()
        {
            return ['order_id' => $this->orderId];
        }
    }

<a name="the-report-helper"></a>
#### `report` 助手函数

有时您可能需要报告异常但继续处理当前请求。 `report` 辅助函数允许您通过异常处理程序快速报告异常，而无需向用户呈现错误页面：

    public function isValid($value)
    {
        try {
            // 验证...
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

<a name="ignoring-exceptions-by-type"></a>
### 按类型忽略异常

在构建应用时，会有一些类型的异常您只想忽略并且永远不会报告。应用的异常处理程序包含一个 `$dontReport` 属性，该属性被初始化为一个空数组。您添加到此属性的任何类都不会被报告；但是，它们可能仍然具有自定义呈现逻辑：

    use App\Exceptions\InvalidOrderException;

    /**
     * 不应上报的异常类型列表。
     *
     * @var array
     */
    protected $dontReport = [
        InvalidOrderException::class,
    ];

> 提示：在幕后，Laravel 已经为你忽略了某些类型的错误，例如由 404 HTTP「未找到」错误导致的异常或由无效 CSRF 令牌生成的 419 HTTP 响应。

<a name="rendering-exceptions"></a>
### 渲染异常

默认情况下，Laravel 异常处理器会为你把异常转换为 HTTP 响应。然而，你可以自由地为特定类型的异常注册一个自定义的渲染闭包来实现。

传递给  `renderable` 方法的闭包函数应返回一个 `Illuminate\Http\Response` 的实例，它可以通过  `response` 助手函数生成。 Laravel 将会根据闭包的类型提示来推断闭包渲染的异常类型：

    use App\Exceptions\InvalidOrderException;

    /**
     * 注册异常处理回调
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (InvalidOrderException $e, $request) {
            return response()->view('errors.invalid-order', [], 500);
        });
    }

你也可以使用 `renderable` 方法来覆盖 Laravel 或 Symfony 内置异常的渲染行为，例如 `NotFoundHttpException`。如果 `renderable` 方法的闭包没有返回值，将使用 Laravel 的默认异常渲染：

    use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

    /**
     * 为应用程序注册异常处理回调。
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Record not found.'
                ], 404);
            }
        });
    }

<a name="renderable-exceptions"></a>
### Reportable & Renderable 异常

除了在异常控制器的 `register`方法中检查异常类型外，你可以直接地在自定义异常里定义 `report` 和 `render` 。当这些方法存在时，它们将被框架自动调用：

    <?php

    namespace App\Exceptions;

    use Exception;

    class InvalidOrderException extends Exception
    {
        /**
         * 报告异常。
         *
         * @return bool|null
         */
        public function report()
        {
            //
        }

        /**
         *渲染异常为 HTTP 响应。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function render($request)
        {
            return response(...);
        }
    }



如果你的异常扩展了一个已经可以渲染的异常，比如内置的 Laravel 或 Symfony 异常，你可以从异常的 `render` 方法返回 `false` 来渲染异常的默认 HTTP 响应：

    /**
     * 将异常渲染为 HTTP 响应。
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function render($request)
    {
        // 判断异常是否需要自定义报告...

        return false;
    }

如果你的异常中包含了仅在满足特定条件才报告的自定义报告逻辑，你可能需要指示 Laravel 使用默认的异常处理配置报告异常。你可以在异常的 `report` 方法中返回 `false` 实现这个：

    /**
     * 报告异常。
     *
     * @return bool|null
     */
    public function report()
    {
        // 判断异常是否需要自定义报告...

        return false;
    }

> 技巧：你可以通过类型提示输入 `report` 方法所需的依赖项，Laravel的 [服务容器](/docs/laravel/9.x/container) 会自动把它们注入到此方法中。

<a name="http-exceptions"></a>
## HTTP 异常

某些异常描述了服务器的 HTTP 错误代码。例如，可能是 「 页面未找到 」 错误 （404），「 未经授权的错误 」（401）或者甚至是开发者造成的 500 错误。要在应用的任意地方生成此类响应，你可以使用 `abort` 辅助函数：

    abort(404);

<a name="custom-http-error-pages"></a>
### 自定义 HTTP 错误页

Laravel 创建了可以轻松显示各种 HTTP 状态码的自定义错误页面。例如，如果你想自定义 404 HTTP 状态码页面，只需创建一个 `resources/views/errors/404.blade.php` 文件。它会用来处理所有应用程序产生的 404 错误。视图目录下所有文件命名都应和它们所响应的 HTTP 状态码一一对应。`abort` 方法会调用 `Symfony\Component\HttpKernel\Exception\HttpException` 的实例，它将被作为 `$exception` 变量传递给视图：

    <h2>{{ $exception->getMessage() }}</h2>



你可以使用 Artisan 命令 `vendor:publish` 发布模板，然后根据自己的喜好进行自定义：

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### 回退 HTTP 错误页面

你还可以为给定的一系列 HTTP 状态代码定义「回退」错误页面。如果发生的特定 HTTP 状态代码没有对应的页面，则将呈现此页面。为此，请在应用程序的 `resources/views/errors` 目录中定义一个 `4xx.blade.php` 模板和一个 `5xx.blade.php` 模板。

