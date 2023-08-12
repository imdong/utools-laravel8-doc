
# CSRF 保护

- [简介](#csrf-introduction)
- [阻止 CSRF 请求](#preventing-csrf-requests)
    - [排除 URLS](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 简介

跨站点请求伪造是一种恶意利用，利用这种手段，代表经过身份验证的用户执行未经授权的命令。值得庆幸的是，Laravel 可以轻松保护您的应用程序免受[跨站点请求伪造](https://en.wikipedia.org/wiki/Cross-site_request_forgery)（CSRF）攻击。

<a name="csrf-explanation"></a>
#### 漏洞的解释

如果你不熟悉跨站点请求伪造，我们讨论一个利用此漏洞的示例。假设您的应用程序有一个 `/user/email` 路由，它接受 POST 请求来更改经过身份验证用户的电子邮件地址。最有可能的情况是，此路由希望 `email` 输入字段包含用户希望开始使用的电子邮件地址。

没有 CSRF 保护，恶意网站可能会创建一个 HTML 表单，指向您的应用程序 `/user/email` 路由，并提交恶意用户自己的电子邮件地址：

```html
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

 如果恶意网站在页面加载时自动提交了表单，则恶意用户只需要诱使您的应用程序的一个毫无戒心的用户访问他们的网站，他们的电子邮件地址就会在您的应用程序中更改。

 为了防止这种漏洞，我们需要检查每一个传入的 `POST`，`PUT`，`PATCH` 或 `DELETE` 请求以获取恶意应用程序无法访问的秘密会话值。



<a name="preventing-csrf-requests"></a>
## 阻止 CSRF 请求

Laravel 为应用程序管理的每个活动 [用户会话](/docs/laravel/10.x/session) 自动生成 CSRF 「令牌」。此令牌用于验证经过身份验证的用户是实际向应用程序发出请求的人。由于此令牌存储在用户的会话中，并且每次重新生成会话时都会更改，因此恶意应用程序将无法访问它。

当前会话的 CSRF 令牌可以通过请求的会话或通过 `csrf_token` 辅助函数进行访问：

    use Illuminate\Http\Request;

    Route::get('/token', function (Request $request) {
        $token = $request->session()->token();

        $token = csrf_token();

        // ...
    });

无论何时在应用程序中定义 `POST` 、`PUT` 、`PATCH` 或 `DELETE` HTML表单，都应在表单中包含隐藏的CSRF `_token` 字段，以便CSRF保护中间件可以验证请求。为方便起见，可以使用 `@csrf` Blade指令生成隐藏的令牌输入字段：

```html
<form method="POST" action="/profile">
    @csrf

    <!-- 相当于。。。 -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

默认情况下包含在 `web` 中间件组中的`App\Http\Middleware\VerifyCsrfToken` [中间件](/docs/laravel/10.x/middleware)将自动验证请求输入中的令牌是否与会话中存储的令牌匹配。当这两个令牌匹配时，我们知道身份验证的用户是发起请求的用户。

<a name="csrf-tokens-and-spas"></a>
### CSRF Tokens & SPAs

如果你正在构建一个将 Laravel 用作 API 后端的 SPA，你应该查阅 [Laravel Sanctum 文档](/docs/laravel/10.x/sanctum)，以获取有关使用 API 进行身份验证和防范 CSRF 漏洞的信息。



<a name="csrf-excluding-uris"></a>
### 从 CSRF 保护中排除 URI

有时你可能希望从 CSRF 保护中排除一组 URIs。例如，如果你使用  [Stripe](https://stripe.com)  处理付款并使用他们的 webhook 系统，则需要将你的 Stripe webhook 处理程序路由从 CSRF 保护中排除，因为 Stripe 不会知道要向您的路由发送什么 CSRF 令牌。

通常，你应该将这些类型的路由放在 `App\Providers\RouteServiceProvider` 应用于 routes/web.php 文件中的所有路由的 `web` 中间件组之外。但是，现在也可以通过将路由的 URIs 添加到 `VerifyCsrfToken` 中间件的 `$except` 属性来排除路由：

    <?php

    namespace App\Http\Middleware;

    use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

    class VerifyCsrfToken extends Middleware
    {
        /**
         * 从 CSRF 验证中排除的 URIs。
         *
         * @var array
         */
        protected $except = [
            'stripe/*',
            'http://example.com/foo/bar',
            'http://example.com/foo/*',
        ];
    }

>技巧：为方便起见，[运行测试](/docs/laravel/10.x/testing).时自动禁用所有路由的 CSRF 中间件。

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

除了检查 CSRF 令牌作为 POST 参数外， `App\Http\Middleware\VerifyCsrfToken` 中间件还将检查 `X-CSRF-TOKEN` 请求标头。 例如，你可以将令牌存储在 HTML 的  `meta` 标签中：

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

然后，你可以指示 jQuery 之类的库自动将令牌添加到所有请求标头。 这为使用传统 JavaScript 技术的基于 AJAX 的应用程序提供了简单、方便的 CSRF 保护：

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```



<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravel 将当前CSRF令牌存储在加密的 `XSRF-TOKEN` cookie 中，该 cookie 包含在框架生成的每个响应中。您可以使用 cookie 值设置 `X-XSRF-TOKEN` 请求标头。

由于一些 JavaScript 框架和库（如 Angular 和 Axios ）会自动将其值放置在同一源请求的 `X-XSRF-TOKEN` 标头中，因此发送此 cookie 主要是为了方便开发人员。

> 技巧：默认情况下，`resources/js/bootstrap.js` 文件包含 Axios HTTP 库，它会自动为您发送 `X-XSRF-TOKEN` 标头。

