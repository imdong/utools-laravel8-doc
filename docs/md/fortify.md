# Laravel Fortify

- [介绍](#introduction)
    - [Fortify 是什么?](#what-is-fortify)
    - [何时使用 Fortify?](#when-should-i-use-fortify)
- [安装](#installation)
    - [服务提供者](#the-fortify-service-provider)
    - [Fortify 功能](#fortify-features)
    - [禁用视图](#disabling-views)
- [认证](#authentication)
    - [自定义用户认证](#customizing-user-authentication)
    - [自定义身份验证渠道](#customizing-the-authentication-pipeline)
    - [自定义重定向](#customizing-authentication-redirects)
- [双重认证](#two-factor-authentication)
    - [启用双重认证](#enabling-two-factor-authentication)
    - [使用双重认证](#authenticating-with-two-factor-authentication)
    - [禁用双重认证](#disabling-two-factor-authentication)
- [注册](#registration)
    - [自定义注册](#customizing-registration)
- [重置密码](#password-reset)
    - [请求重置密码连接](#requesting-a-password-reset-link)
    - [重置密码](#resetting-the-password)
    - [自定义重置密码](#customizing-password-resets)
- [邮件认证](#email-verification)
    - [保护路由](#protecting-routes)
- [确认密码](#password-confirmation)

<a name="introduction"></a>
## 介绍

[Laravel Fortify](https://github.com/laravel/fortify) 是一个与前端无关的身份认证后端实现。Fortify 注册了所有实现 Laravel 身份验证功能所需的路由和控制器，包括登录，注册，重置密码，邮件认证等。安装 Fortify 之后，你可以运行 Artisan 命令 `route:list` 来查看 Fortify 已注册的路由。

由于 Fortify 不提供其自己的用户界面，因此应与你自己的用户界面配对，该用户界面向其注册的路由发出请求。在本文档的其余部分中，我们将进一步讨论如何向这些路由发出请求。

> 技巧：请记住，Fortify 是一个软件包，旨在使你能够快速开始实施 Laravel 的身份验证功能。你不必非要使用它不可。 你始终可以按照以下说明中提供的文档，自由地与 Laravel 的身份认证服务进行交互，[用户认证](/docs/laravel/9.x/authentication)， [重置密码](/docs/laravel/9.x/passwords) 和 [邮箱认证](/docs/laravel/9.x/verification) documentation. 文档。



<a name="what-is-fortify"></a>
### Fortify 是什么？

如上所述，Laravel Fortify 是一个与前端无关的身份认证后端实现，Fortify 注册了所有实现 Laravel 身份验证功能所需的路由和控制器，包括登录，注册，重置密码，邮件认证等。

**你不必使用 Fortify，也可以使用 Laravel 的身份认证功能。** 你始终可以按照 [用户认证](/docs/laravel/9.x/authentication)，[重置密码](/docs/laravel/9.x/passwords) 和 [邮箱认证](/docs/laravel/9.x/verification) 文档中提供的文档来手动与 Laravel 的身份验证服务进行交互。

如果你是一名新手，在使用 Laravel Fortify 之前不妨尝试使用 [Laravel Breeze](/docs/laravel/9.x/starter-kits) 应用入门套件。Laravel Breeze 为你的应用提供身份认证支架，其中包括使用 [Tailwind CSS](https://tailwindcss.com)。与 Fortify 不同，Breeze 将其路由和控制器直接发布到你的应用程序中。这使你可以学习并熟悉 Laravel 的身份认证功能，然后再允许 Laravel Fortify 为您实现这些功能。

Laravel Fortify 本质上是采用了 Laravel Breeze 的路由和控制器，且提供了不包含用户界面的扩展。这样，你可以快速搭建应用程序身份认证层的后端实现，而不必依赖于任何特定的前端实现。

<a name="when-should-i-use-fortify"></a>
### 何时使用 Fortify？

你可能想知道何时使用 Laravel Fortify。 首先，如果你正在使用 Laravel 的 [应用入门套件](/docs/laravel/9.x/starter-kits)，你不需要安装 Laravel Fortify，因为它已经提供了完整的身份认证实现。



如果你不使用应用入门套件，并且你的应用需要身份认证功能，则有两个选择：手动实现应用的身份认证功能或使用由 Laravel Fortify 提供这些功能的后端实现。

如果你选择安装 Fortify，你的用户界面将向 Fortify 的身份验证路由发出请求，本文档中对此进行了详细介绍，以便对用户进行身份认证和注册。

如果你选择手动与 Laravel 的身份认证服务进行交互而不是使用 Fortify，可以按照 [用户认证](/docs/laravel/9.x/authentication)，[重置密码](/docs/laravel/9.x/passwords) 和 [邮箱认证](/docs/laravel/9.x/verification) 文档中提供的说明进行操作。

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify & Laravel Sanctum

一些开发人员对 [Laravel Sanctum](/docs/laravel/9.x/sanctum) 和 Laravel Fortify 两者之间的区别感到困惑。由于这两个软件包解决了两个不同但相关的问题，因此 Laravel Fortify 和 Laravel Sanctum 并非互斥或竞争的软件包。

Laravel Sanctum 只关心管理 API 令牌和使用会话 cookie 或令牌来认证现有用户。 Sanctum 不提供任何处理用户注册，重置密码等相关的路由。

如果你尝试为提供 API 或用作单页应用的后端的应用手动构建身份认证层，那么完全有可能同时使用 Laravel Fortify（用于用户注册，重置密码等）和 Laravel Sanctum（API 令牌管理，会话身份认证）。

<a name="installation"></a>
## 安装

首先，使用 Composer 软件包管理器安装 Fortify：

```shell
composer require laravel/fortify
```



下一步，使用 `vendor:publish` 命令来发布 Fortify 的资源：

```shell
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

该命令会将 Fortify 的行为类发布到您的 `app/Actions` 目录，如果该目录不存在，则会创建该目录。此外，还将发布 Fortify 的配置和迁移文件。

下一步，你应该迁移数据库：

```shell
php artisan migrate
```

<a name="the-fortify-service-provider"></a>
### Fortify 服务提供商

上面讨论的 `vendor:publish` 命令还将发布 `App\Providers\FortifyServiceProvider` 类。你应该确保该类已在应用程序的 `config/app.php` 配置文件的 `providers` 数组中注册。

Fortify 服务提供商注册了 Fortify 所发布的行为类，并指导 Fortify 在执行各自的任务时使用它们。

<a name="fortify-features"></a>
### Fortify 包含的功能

该 `fortify` 配置文件包含一个 `features` 配置数组。该数组默路定义了 Fortify 的路由和功能。如果你不打算将 Fortify 与 [Laravel Jetstream](https://jetstream.laravel.com) 配合使用，我们建议你仅启用以下功能，这是大多数 Laravel 应用提供的基本身份认证功能：

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### 禁用视图

默认情况下，Fortify 定义用于返回视图的路由，例如登录或注册。但是，如果要构建 JavaScript 驱动的单页应用，那么可能不需要这些路由。因此，你可以通过将 `config/fortify.php` 配置文件中的  `views` 配置值设为 `false` 来禁用这些路由：

```php
'views' => false,
```



<a name="disabling-views-and-password-reset"></a>
#### 禁用视图 & 重置密码

如果你选择禁用 Fortify 的视图，并且将为你的应用实现重置密码功能，这时你仍然需要定义一个名为 `password.reset` 的路由，该路由负责显示应用的「重置密码」视图。这是必要的，因为 Laravel 的 `Illuminate\Auth\Notifications\ResetPassword` 通知将通过名为 `password.reset` 的路由生成重置密码 URL。

<a name="authentication"></a>
## 身份认证

首先，我们需要指导 Fortify 如何返回「登录」视图。记住，Fortify 是一个无头认证扩展。如果你想要一个已经为你完成的 Laravel 身份认证功能的前端实现， 你应该使用 [应用入门套件](/docs/laravel/9.x/starter-kits)。

所有的身份认证视图逻辑，都可以使用 `Laravel\Fortify\Fortify` 类提供的方法来自定义。通常，你应该从应用的 `App\Providers\FortifyServiceProvider` 的 `boot` 方法中调用此方法。Fortify 将负责定义返回此视图的 `/login` 路由：

    use Laravel\Fortify\Fortify;

    /**
     * 引导任何应用服务。
     *
     * @return void
     */
    public function boot()
    {
        Fortify::loginView(function () {
            return view('auth.login');
        });

        // ...
    }

你的登录模板应包括一个向 `/login` 发出 POST 请求的表单。 `/login` 表单需要一个 `email` / `username` 和 `password`。 `email` / `username` 字段与 `config/fortify.php` 配置文件中的 `username` 值相匹配。另外，可以提供布尔值 `remember` 字段来指导用户想要使用 Laravel 提供的「记住我」功能。



如果登录尝试成功，Fortify 会将您重定向到通过应用程序 `fortify` 配置文件中的 `home` 配置选项配置的 URI。 如果登录请求是 XHR 请求，将返回 200 HTTP 响应。

如果请求不成功，用户将被重定向回登录页，验证错误将通过共享的 `$errors` [Blade 模板变量](/docs/laravel/9.x/validation#quick-displaying-the-validation-errors) 提供给你。 或者，在 XHR 请求的情况下，验证错误将与 422 HTTP 响应一起返回。

<a name="customizing-user-authentication"></a>
### 自定义用户认证

Fortify 将根据提供的凭据和为您的应用程序配置的身份验证保护自动检索和验证用户。 但是，您有时可能希望对登录凭据的身份验证和用户的检索方式进行完全自定义。 幸运的是，Fortify 允许您使用 `Fortify::authenticateUsing` 方法轻松完成此操作。

此方法接受接收传入 HTTP 请求的闭包。 闭包负责验证附加到请求的登录凭据并返回关联的用户实例。 如果凭据无效或找不到用户，则闭包应返回 `null` 或 `false` 。 通常，这个方法应该从你的 `FortifyServiceProvider` 的 `boot` 方法中调用：

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * 引导应用服务
 *
 * @return void
 */
public function boot()
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```



<a name="authentication-guard"></a>
#### 身份验证看守器

您可以在应用程序的 `fortify` 文件中自定义 Fortify 使用的身份验证看守器。 但是，您应该确保配置的看守器是 `Illuminate\Contracts\Auth\StatefulGuard` 的实现。 如果您尝试使用 Laravel Fortify 对 SPA 进行身份验证，您应该将 Laravel 的默认 `web` 防护与 [Laravel Sanctum](https://laravel.com/docs/sanctum) 结合使用。

<a name="customizing-the-authentication-pipeline"></a>
### 自定义身份验证管道

Laravel Fortify通过可调用类的管道对登录请求进行身份验证。如果您愿意，您可以定义一个自定义的类管道，登录请求应该通过管道传输。每个类都应该有一个 `__invoke` 方法，该方法接收传入 `Illuminate\Http\Request` 实例的方法，并且像 [中间件](/docs/laravel/9.x/middleware) 一样，调用一个 `$next` 变量，以便将请求传递给管道中的下一个类。

要定义自定义管道，可以使用 `Fortify::authenticateThrough` 方法。此方法接受一个闭包，该闭包应返回类数组，以通过管道传递登录请求。通常，应该从 `App\Providers\FortifyServiceProvider` 的 `boot` 方法调用此方法。

下面的示例包含默认管道定义，您可以在自己进行修改时将其用作开始：

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```



<a name="customizing-authentication-redirects"></a>
### 自定义跳转

如果登录尝试成功，Fortify 会将您重定向到您应用程序 `Fortify` 的配置文件中的 `home` 配置选项的 URI 值. 如果登录请求是 XHR 请求，将返回 200 HTTP 响应。用户注销应用程序后，该用户将被重定向到 `/` 地址。

如果需要对这种行为进行高级定制，可以将 `LoginResponse` 和 `LogoutResponse` 契约的实现绑定到 Laravel [服务容器](/docs/laravel/9.x/container) 。通常，这应该在你应用程序的 `App\Providers\FortifyServiceProvider` 类的 `register` 方法中完成：

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * 注册任何应用程序服务。
 *
 * @return void
 */
public function register()
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a name="two-factor-authentication"></a>
## 双因素认证

当 Fortify 的双因素身份验证功能启用时，用户需要在身份验证过程中输入一个六位数的数字令牌。该令牌使用基于时间的一次性密码（TOTP）生成，该密码可以从任何与 TOTP 兼容的移动认证应用程序（如Google Authenticator）中检索。

在开始之前，您应该首先确保应用程序的 `App\Models\User` 模型使用 `Laravel\Fortify\TwoFactorAuthenticatable` trait：

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
 ```

接下来，您应该在应用程序中构建一个页面，用户可以在其中管理他们的双因素身份验证设置。该页面应允许用户启用和禁用双因素身份验证，以及重新生成双因素身份验证恢复的代码。

> 默认情况下， `fortify` 配置文件的 `features` 数组管理着 Fortify 的双因素身份验证设置在修改前需要密码确认。因此，在使用之前，你的应用程序应该实现 Fortify 的 [密码确认](#password-confirmation) 功能 。

<a name="enabling-two-factor-authentication"></a>
### 启用双因素身份验证

要启用双重身份验证，你的应用程序应向 Fortify 定义的 `/user/two-factor-authentication` 发出 POST 请求。 如果请求成功，用户将被重定向回之前的 URL，并且 `status` session 变量将设置为 `two-factor-authentication-enabled`。 你可以在模板中检测这个 `status` session 变量以显示适当的成功消息。 如果请求是 XHR 请求，将返回  `200` HTTP 响应：

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm text-green-600">
        Two factor authentication has been enabled.
    </div>
@endif
```

接下来，你应该显示双重身份验证二维码，供用户扫描到他们的身份验证器应用程序中。 如果你使用 Blade 呈现应用程序的前端，则可以使用用户实例上可用的 `twoFactorQrCodeSvg` 方法检索二维码 SVG：

```php
$request->user()->twoFactorQrCodeSvg();
```

如果你正在构建由 JavaScript 驱动的前端，你可以向 `/user/two-factor-qr-code` 发出 XHR GET 请求以检索用户的双重身份验证二维码。 将返回一个包含 `svg` 键的 JSON 对象。

<a name="displaying-the-recovery-codes"></a>
#### 显示恢复代码

你还应该显示用户的两个因素恢复代码。这些恢复代码允许用户在无法访问其移动设备时进行身份验证。如果你使用 Blade 来渲染应用程序的前端，你可以通过经过身份验证的用户实例访问恢复代码：

```php
(array) $request->user()->recoveryCodes()
```

如果你正在构建一个 JavaScript 驱动的前端，你可以向 `/user/two-factor-recovery-codes` 端点发出 XHR GET 请求。此端点将返回一个包含用户恢复代码的 JSON 数组。


要重新生成用户的恢复代码，您的应用程序应向 `/user/two-factor-recovery-codes` 端点发出 POST 请求。

<a name="authenticating-with-two-factor-authentication"></a>
### 使用双因素身份验证进行身份验证

在身份验证过程中，Fortify 将自动将用户重定向到您的应用程序的双因素身份验证检查页面。 但是，如果您的应用程序正在发出 XHR 登录请求，则在成功进行身份验证尝试后返回的 JSON 响应将包含一个具有 `two_factor` 布尔属性的 JSON 对象。 您应该检查此值以了解是否应该重定向到应用程序的双因素身份验证检查页面。

要开始实现两因素身份验证功能，我们需要指示 Fortify 如何返回我们的双因素身份验证检查页面。 Fortify 的所有身份验证视图渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从应用程序的 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

Fortify 将负责定义返回此视图的 `/two-factor-challenge` 路由。 您的 `two-factor-challenge` 模板应包含一个向 `/two-factor-challenge` 端点发出 POST 请求的表单。 `/two-factor-challenge` 操作需要包含有效 TOTP 令牌的 `code` 字段或包含用户恢复代码之一的 `recovery_code` 字段。

如果登录尝试成功，Fortify 会将用户重定向到通过应用程序的 `fortify` 配置文件中的 `home` 配置选项配置的 URI。 如果登录请求是 XHR 请求，将返回 204 HTTP 响应。



如果请求不成功，用户将被重定向回两因素挑战屏幕，验证错误将通过共享的 `$errors` [Blade 模板变量](/docs/laravel/9.x/验证#快速显示验证错误）。 或者，在 XHR 请求的情况下，验证错误将返回 422 HTTP 响应。

<a name="禁用双因素身份验证"></a>
### 禁用两因素身份验证

要禁用双因素身份验证，您的应用程序应向 `/user/two-factor-authentication` 端点发出 DELETE 请求。 请记住，Fortify 的两个因素身份验证端点在被调用之前需要 [密码确认](#password-confirmation)。

<a name="registration"></a>
## 注册

要开始实现我们应用程序的注册功能，我们需要指示 Fortify 如何返回我们的“注册”视图。 请记住，Fortify 是一个无头身份验证库。 如果你想要一个已经为你完成的 Laravel 身份验证功能的前端实现，你应该使用 [application starter kit](/docs/laravel/9.x/starter-kits)。

Fortify 的所有视图渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify 将负责定义返回此视图的 `/register` 路由。 您的 `register` 模板应包含一个向 Fortify 定义的 `/register` 端点发出 POST 请求的表单。

`/register` 端点需要一个字符串 `name`、字符串电子邮件地址/用户名、`password` 和 `password_confirmation` 字段。 电子邮件/用户名字段的名称应与应用程序的“fortify”配置文件中定义的“用户名”配置值匹配。



如果注册尝试成功，Fortify 会将用户重定向到通过应用程序的 `fortify` 配置文件中的 `home` 配置选项配置的 URI。 如果登录请求是 XHR 请求，将返回 200 HTTP 响应。

如果请求不成功，用户将被重定向回注册屏幕，验证错误将通过共享的 `$errors` [Blade 模板变量](/docs/laravel/9.x/validation#快速显示验证错误）。 或者，在 XHR 请求的情况下，验证错误将返回 422 HTTP 响应。

<a name="customizing-registration"></a>
### 定制注册

可以通过修改安装 Laravel Fortify 时生成的 `App\Actions\Fortify\CreateNewUser` 操作来自定义用户验证和创建过程。

<a name="password-reset"></a>
## 重设密码

<a name="requesting-a-password-reset-link"></a>
### 请求密码重置链接

要开始实现我们应用程序的密码重置功能，我们需要指示 Fortify 如何返回我们的“忘记密码”视图。 请记住，Fortify 是一个无头身份验证库。 如果你想要一个已经为你完成的 Laravel 身份验证功能的前端实现，你应该使用 [application starter kit](/docs/laravel/9.x/starter-kits)。

Fortify 的所有视图渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从应用程序的 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```



Fortify 将负责定义返回此视图的 `/forgot-password` 端点。 你的 `forgot-password` 模板应该包含一个向 `/forgot-password` 端点发出 POST 请求的表单。

`/forgot-password` 端点需要一个字符串 `email` 字段。 此字段/数据库列的名称应与应用程序的 `fortify` 配置文件中的 `email` 配置值匹配。

<a name="handling-the-password-reset-link-request-response"></a>
#### 处理密码重置链接请求响应

如果密码重置链接请求成功，Fortify 会将用户重定向回 `/forgot-password` 端点，并向用户发送一封电子邮件，其中包含可用于重置密码的安全链接。 如果请求是 XHR 请求，将返回 200 HTTP 响应。

在成功请求后被重定向回 `/forgot-password` 端点后，`status` 会话变量可用于显示密码重置链接请求尝试的状态。 此会话变量的值将匹配应用程序的“密码”[语言文件](/docs/laravel/9.x/localization) 中定义的翻译字符串之一：

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

如果请求不成功，用户将被重定向回请求密码重置链接屏幕，验证错误将通过共享的 `$errors` [Blade 模板变量](/docs/laravel/9.x) 提供给您/validation#quick-displaying-the-validation-errors）。 或者，在 XHR 请求的情况下，验证错误将返回 422 HTTP 响应。

<a name="resetting-the-password"></a>
### 重设密码

为了完成应用程序的密码重置功能，我们需要指示 Fortify 如何返回我们的“重置密码”视图。



Fortify 的所有视图渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从应用程序的 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::resetPasswordView(function ($request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify 将负责定义显示此视图的路线。 您的 `reset-password` 模板应该包含一个向 `/reset-password` 发出 POST 请求的表单。

`/reset-password` 端点需要一个字符串`email` 字段、一个`password` 字段、一个`password_confirmation` 字段和一个名为`token` 的隐藏字段，其中包含`request()->route(' 的值令牌'）`。 “email”字段/数据库列的名称应与应用程序的“fortify”配置文件中定义的“email”配置值匹配。

<a name="handling-the-password-reset-response"></a>
#### 处理密码重置响应

如果密码重置请求成功，Fortify 将重定向回 `/login` 路由，以便用户可以使用新密码登录。 此外，还将设置一个 `status` 会话变量，以便您可以在登录屏幕上显示重置的成功状态：

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

如果请求是 XHR 请求，将返回 200 HTTP 响应。

如果请求不成功，用户将被重定向回重置密码屏幕，验证错误将通过共享的 `$errors` [Blade 模板变量](/docs/laravel/9.x/validation #快速显示验证错误）。 或者，在 XHR 请求的情况下，验证错误将返回 422 HTTP 响应。



<a name="customizing-password-resets"></a>
### 自定义密码重置

可以通过修改安装 Laravel Fortify 时生成的 `App\Actions\ResetUserPassword` 操作来自定义密码重置过程。

<a name="email-verification"></a>
## 电子邮件验证

注册后，您可能希望用户在继续访问您的应用程序之前验证他们的电子邮件地址。 要开始使用，请确保在 `fortify` 配置文件的 `features` 数组中启用了 `emailVerification` 功能。 接下来，你应该确保你的 App\Models\User 类实现了 Illuminate\Contracts\Auth\MustVerifyEmail 接口。

完成这两个设置步骤后，新注册的用户将收到一封电子邮件，提示他们验证其电子邮件地址的所有权。 但是，我们需要通知 Fortify 如何显示电子邮件验证屏幕，通知用户他们需要点击电子邮件中的验证链接。

Fortify 的所有视图的渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从应用程序的 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导所有应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

当用户被 Laravel 内置的 `verified` 中间件重定向到 `/email/verify` 端点时，Fortify 将负责定义显示此视图的路由。

您的“验证电子邮件”模板应包含一条信息性消息，指示用户单击发送到其电子邮件地址的电子邮件验证链接。

<a name="resending-email-verification-links"></a>


#### 重新发送电子邮件验证链接

如果您愿意，您可以在应用程序的 `verify-email` 模板中添加一个按钮，该按钮会触发对 `/email/verification-notification` 端点的 POST 请求。 当此端点收到请求时，将通过电子邮件将新的验证电子邮件链接发送给用户，如果先前的验证链接被意外删除或丢失，则允许用户获取新的验证链接。

如果重新发送验证链接电子邮件的请求成功，Fortify 将使用 `status` 会话变量将用户重定向回 `/email/verify` 端点，允许您向用户显示信息性消息，通知他们操作已完成成功的。 如果请求是 XHR 请求，将返回 202 HTTP 响应：

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        新的电子邮件验证链接已通过电子邮件发送给您！
    </div>
@endif
```

<a name="protecting-routes"></a>
### 保护路线

要指定一个路由或一组路由要求用户验证他们的电子邮件地址，您应该将 Laravel 的内置 `verified` 中间件附加到该路由。 该中间件在您的应用程序的 `App\Http\Kernel` 类中注册：

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## 确认密码

在构建应用程序时，您可能偶尔会有一些操作需要用户在执行操作之前确认其密码。 通常，这些路由受到 Laravel 内置的 `password.confirm` 中间件的保护。

要开始实现密码确认功能，我们需要指示 Fortify 如何返回应用程序的“密码确认”视图。 请记住，Fortify 是一个无头身份验证库。 如果你想要一个已经为你完成的 Laravel 身份验证功能的前端实现，你应该使用 [application starter kit](/docs/laravel/9.x/starter-kits)。



Fortify 的所有视图渲染逻辑都可以使用通过 `Laravel\Fortify\Fortify` 类提供的适当方法进行自定义。 通常，您应该从应用程序的 `App\Providers\FortifyServiceProvider` 类的 `boot` 方法调用此方法：

```php
use Laravel\Fortify\Fortify;

/**
 * 引导所有应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify 将负责定义返回此视图的 `/user/confirm-password` 端点。 您的 `confirm-password` 模板应包含一个表单，该表单向 `/user/confirm-password` 端点发出 POST 请求。 `/user/confirm-password` 端点需要一个包含用户当前密码的 `password` 字段。

如果密码与用户的当前密码匹配，Fortify 会将用户重定向到他们尝试访问的路由。 如果请求是 XHR 请求，将返回 201 HTTP 响应。

如果请求不成功，用户将被重定向回确认密码屏幕，验证错误将通过共享的 `$errors` Blade 模板变量提供给您。 或者，在 XHR 请求的情况下，验证错误将返回 422 HTTP 响应。

