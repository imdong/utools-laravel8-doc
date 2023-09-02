# Laravel Sanctum

-   [介绍](#introduction)
    -   [工作原理](#how-it-works)
-   [安装](#installation)
-   [配置](#configuration)
    -   [覆盖默认模型](#overriding-default-models)
-   [API 令牌认证](#api-token-authentication)
    -   [发出 API 令牌](#issuing-api-tokens)
    -   [令牌权限](#token-abilities)
    -   [保护路由](#protecting-routes)
    -   [吊销令牌](#revoking-tokens)
    -   [令牌过期](#token-expiration)
-   [SPA 认证](#spa-authentication)
    -   [配置](#spa-configuration)
    -   [认证](#spa-authenticating)
    -   [保护路由](#protecting-spa-routes)
    -   [授权私有广播频道](#authorizing-private-broadcast-channels)
-   [移动应用程序认证](#mobile-application-authentication)
    -   [发出 API 令牌](#issuing-mobile-api-tokens)
    -   [保护路由](#protecting-mobile-api-routes)
    -   [吊销令牌](#revoking-mobile-api-tokens)
-   [测试](#testing)

<a name="introduction"></a>

## 介绍

[Laravel Sanctum](https://github.com/laravel/sanctum) 提供了一个轻量级的认证系统，可用于 SPA（单页应用程序）、移动应用程序和基于简单令牌的 API。Sanctum 允许的应用程序中的每个用户为他们的账户生成多个 API 令牌。这些令牌可以被授予权限/范围，以指定令牌允许执行哪些操作。

<a name="how-it-works"></a>

### 工作原理

Laravel Sanctum 旨在解决两个不同的问题。在深入探讨该库之前，让我们先讨论一下每个问题。

<a name="how-it-works-api-tokens"></a>

#### API 令牌

首先，Sanctum 是一个简单的包，你可以使用它向你的用户发出 API 令牌，而无需 OAuth 的复杂性。这个功能受到 GitHub 和其他应用程序发出「访问令牌」的启发。例如，假如你的应用程序的「账户设置」有一个界面，用户可以在其中为他们的账户生成 API 令牌。你可以使用 Sanctum 生成和管理这些令牌。这些令牌通常具有非常长的过期时间（以年计），但用户可以随时手动撤销它们。

Laravel Sanctum 通过将用户 API 令牌存储在单个数据库表中，并通过应该包含有效 API 令牌的 `Authorization` 标头对传入的 HTTP 请求进行身份验证来提供此功能。

<a name="how-it-works-spa-authentication"></a>

#### SPA 认证

第二个功能，Sanctum 存在的目的是为需要与 Laravel 支持的 API 通信的单页应用程序 (SPAs) 提供一种简单的身份验证方式。这些 SPAs 可能存在于与 Laravel 应用程序相同的存储库中，也可能是一个完全独立的存储库，例如使用 Vue CLI 创建的 SPA 或 Next.js 应用程序。

对于此功能，Sanctum 不使用任何类型的令牌。相反，Sanctum 使用 Laravel 内置基于 cookie 的会话身份验证服务。通常，Sanctum 使用 Laravel 的 `web` 认证保护方式实现这一点。这提供了 CSRF 保护、会话身份验证以及防止通过 XSS 泄漏身份验证凭据的好处。

只有在传入请求来自你自己的 SPA 前端时，Sanctum 才会尝试使用 cookies 进行身份验证。当 Sanctum 检查传入的 HTTP 请求时，它首先会检查身份验证 cookie，如果不存在，则 Sanctum 会检查 `Authorization` 标头是否包含有效的 API 令牌。

> **注意**
> 完全可以只使用 Sanctum 进行 API 令牌身份验证或只使用 Sanctuary 进行 SPA 身份验证。仅因为你使用 Sanctum 并不意味着你必须使用它提供的两个功能。

<a name="installation"></a>

## 安装

> **注意**
> 最近的 Laravel 版本已经包括 Laravel Sanctum。但如果你的应用程序的 `composer.json` 文件不包括 `laravel/sanctum`，你可以遵循下面的安装说明。

你可以通过 Composer 包管理器安装 Laravel Sanctum：

```shell
composer require laravel/sanctum
```

接下来，你应该使用 `vendor:publish` Artisan 命令发布 Sanctum 配置文件和迁移文件。`sanctum` 配置文件将被放置在你的应用程序的 `config` 目录中：

```shell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

最后，你应该运行数据库迁移。Sanctum 会创建一个数据库表来存储 API 令牌：

```shell
php artisan migrate
```

接下来，如果你打算使用 Sanctum 来对 SPA 单页应用程序进行认证，则应该将 Sanctum 的中间件添加到你的应用程序的 `app/Http/Kernel.php` 文件中的 `api` 中间件组中：

```
'api' => [
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
   \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
   \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="migration-customization"></a>

#### 自定义迁移

如果你不打算使用 Sanctum 的默认迁移文件，则应该在 `App\Providers\AppServiceProvider` 类的 `register` 方法中调用 `Sanctum::ignoreMigrations` 方法。你可以通过执行以下命令导出默认的迁移文件：`php artisan vendor:publish --tag=sanctum-migrations`

<a name="configuration"></a>

## 配置

<a name="overriding-default-models"></a>

### 覆盖默认模型

虽然通常不需要，但你可以自由扩展 Sanctum 内部使用的 `PersonalAccessToken` 模型:

```
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

然后，你可以通过 Sanctum 提供的 `usePersonalAccessTokenModel` 方法来指示 Sanctum 使用你的自定义模型。通常，你应该在一个应用程序的服务提供者的 `boot` 方法中调用此方法：

```
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * 引导任何应用程序服务。
 */
public function boot(): void
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a name="api-token-authentication"></a>

## API 令牌认证

> **注意**
> 你不应该使用 API 令牌来认证你自己的第一方单页应用程序。而应该使用 Sanctum 内置的 [SPA 身份验证功能](#spa-authentication)。

<a name="issuing-api-tokens"></a>

### 发行 API 令牌

Sanctum 允许你发行 API 令牌/个人访问令牌，可用于对你的应用程序的 API 请求进行身份验证。使用 API 令牌发出请求时，应将令牌作为 `Bearer` 令牌包括在 `Authorization` 头中。

要开始为用户发行令牌，你的用户模型应该使用 `Laravel\Sanctum\HasApiTokens` trait：

```
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

要发行令牌，你可以使用 `createToken` 方法。`createToken` 方法会返回一个 `Laravel\Sanctum\NewAccessToken` 实例。在将 API 令牌存储到数据库之前，令牌将使用 SHA-256 哈希进行哈希处理，但是你可以通过 `NewAccessToken` 实例的 `plainTextToken` 属性访问令牌的明文值。你应该在令牌被创建后立即将其值显示给用户：

```
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});

```
你可以使用 `HasApiTokens` trait 提供的 `tokens` Eloquent 关联来访问用户的所有令牌：

```
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>

### 令牌能力

Sanctum 允许你为令牌分配「能力」 。能力的作用类似于 OAuth 的「Scope」 。你可以将一个字符串能力数组作为 `createToken` 方法的第二个参数传递：

```
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

当处理由 Sanctum 验证的入站请求时，你可以使用 `tokenCan` 方法确定令牌是否具有给定的能力：

```
if ($user->tokenCan('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>

#### 令牌能力中间件

Sanctum 还包括两个中间件，可用于验证传入的请求是否使用授予了给定能力的令牌进行了身份验证。首先，请将以下中间件添加到应用程序的 `app/Http/Kernel.php` 文件的 `$middlewareAliases` 属性中：

```
'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
```

可以将 `abilities` 中间件分配给路由，以验证传入请求的令牌是否具有所有列出的能力：

```
Route::get('/orders', function () {
    // 令牌具有「check-status」和「place-orders」能力...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);

```

可以将 `ability` 中间件分配给路由，以验证传入请求的令牌是否至少具有一个列出的能力：

```
Route::get('/orders', function () {
    // 令牌具有「check-status」或「place-orders」能力...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);

```

<a name="first-party-ui-initiated-requests"></a>

#### 第一方 UI 启动的请求

为了方便起见，如果入站身份验证请求来自你的第一方 SPA ，并且你正在使用 Sanctum 内置的 [SPA 认证](#spa-authentication)，`tokenCan` 方法将始终返回 `true`。

然而，这并不一定意味着你的应用程序必须允许用户执行该操作。通常，你的应用程序的[授权策略](/docs/laravel/10.x/authorization#creating-policies) 将确定是否已授予令牌执行能力的权限，并检查用户实例本身是否允许执行该操作。

例如，如果我们想象一个管理服务器的应用程序，这可能意味着检查令牌是否被授权更新服务器**并且**服务器属于用户：

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

首先允许 `tokenCan` 方法被调用并始终为第一方 UI 启动的请求返回 `true` 可能看起来很奇怪。然而，能够始终假设 API 令牌可用并可通过 `tokenCan` 方法进行检查非常方便。通过采用这种方法，你可以始终在应用程序的授权策略中调用 `tokenCan` 方法，而不用再担心请求是从应用程序的 UI 触发还是由 API 的第三方使用者发起的。

<a name="protecting-routes"></a>

### 保护路由

为了保护路由，使所有入站请求必须进行身份验证，你应该在你的 `routes/web.php` 和 `routes/api.php` 路由文件中，将 `sanctum` 认证守卫附加到受保护的路由上。如果该请求来自第三方，该守卫将确保传入的请求经过身份验证，要么是具有状态的 Cookie 身份验证请求，要么是包含有效的 API 令牌标头的请求。

你可能想知道我们为什么建议你使用 `sanctum` 守卫在应用程序的 `routes/web.php` 文件中对路由进行身份验证。请记住，Sanctum 首先将尝试使用 Laravel 的典型会话身份验证 cookie 对传入请求进行身份验证。如果该 cookie 不存在，则 Sanctum 将尝试使用请求的 `Authorization` 标头中的令牌来验证请求。此外，使用 Sanctum 对所有请求进行身份验证，确保我们可以始终在当前经过身份验证的用户实例上调用 `tokenCan` 方法：

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-tokens"></a>

### 撤销令牌

你可以通过使用 `Laravel\Sanctum\HasApiTokens` trait 提供的 `tokens` 关系，从数据库中删除它们来达到「撤销」令牌的目的：

```
// 撤销所有令牌...
$user->tokens()->delete();

// 撤销用于验证当前请求的令牌...
$request->user()->currentAccessToken()->delete();

// 撤销特定的令牌...
$user->tokens()->where('id', $tokenId)->delete();

```

<a name="token-expiration"></a>

### 令牌有效期

默认情况下，Sanctum 令牌永不过期，并且只能通过[撤销令牌](#revoking-tokens)进行无效化。但是，如果你想为你的应用程序 API 令牌配置过期时间，可以通过在应用程序的 `sanctum` 配置文件中定义的 `expiration` 配置选项进行配置。此配置选项定义发放的令牌被视为过期之前的分钟数：

```php
// 365天后过期
'expiration' => 525600,
```

如果你已为应用程序配置了令牌过期时间，你可能还希望[任务调度](/docs/laravel/10.x/scheduling)来删除应用程序过期的令牌。幸运的是，Sanctum 包括一个 `sanctum:prune-expired` Artisan 命令，你可以使用它来完成此操作。例如，你可以配置计划任务来删除所有过期至少24小时的令牌数据库记录：

```php
$schedule->command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>

## SPA 身份验证

Sanctum 还提供一种简单的方法来验证需要与 Laravel API 通信的单页面应用程序（SPA）。这些 SPA 可能存在于与你的 Laravel 应用程序相同的存储库中，也可能是一个完全独立的存储库。

对于此功能，Sanctum 不使用任何类型的令牌。相反，Sanctum 使用 Laravel 内置的基于 cookie 的 session 身份验证服务。此身份验证方法提供了 CSRF 保护、session 身份验证以及防止身份验证凭据通过 XSS 泄漏的好处。

> **警告**
> 为了进行身份验证，你的 SPA 和 API 必须共享相同的顶级域。但是，它们可以放置在不同的子域中。此外，你应该确保你的请求中发送 `Accept: application/json` 头文件。

<a name="spa-configuration"></a>

### 配置

<a name="configuring-your-first-party-domains"></a>

#### 配置你的第一个域

首先，你应该通过 `sanctum` 配置文件中的 `stateful` 配置选项来配置你的 SPA 将从哪些域发出请求。此配置设置确定哪些域将在向你的 API 发送请求时使用 Laravel session cookie 维护「有状态的」身份验证。

> **警告**
> 如果你通过包含端口的 URL（`127.0.0.1:8000`）访问应用程序，你应该确保在域名中包括端口号。

<a name="sanctum-middleware"></a>

#### Sanctum 中间件

接下来，你应该将 Sanctum 中间件添加到你的 `app/Http/Kernel.php` 文件中的 `api` 中间件组中。此中间件负责确保来自你的 SPA 的传入请求可以使用 Laravel 会话 cookie 进行身份验证，同时仍允许来自第三方或移动应用程序使用 API 令牌进行身份验证：

```
'api' => [ \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
   \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
   \Illuminate\Routing\Middleware\SubstituteBindings::class,
],

```

<a name="cors-and-cookies"></a>

#### CORS 和 Cookies

如果你无法从执行在单独子域上的 SPA 中进行应用程序身份验证的话，你可能已错误配置了 CORS（跨域资源共享）或会话 cookie 设置。

你应该确保你的应用程序的 CORS 配置返回的 `Access-Control-Allow-Credentials` 请求头的值为 `True` 。这可以通过在应用程序的 `config/cors.php` 配置文件中设置 `supports_credentials` 选项为 `true` 来完成。

此外，你应该在应用程序的全局 `axios` 实例中启用 `withCredentials` 选项。通常，这应该在你的 `resources/js/bootstrap.js` 文件中进行。如果你没有使用 Axios 从前端进行 HTTP 请求，你应该使用自己的 HTTP 客户端进行等效配置：

```js
axios.defaults.withCredentials = true;
```

最后，你应该确保应用程序的会话 cookie 域配置支持根域的任何子域。你可以通过在应用程序的 `config/session.php` 配置文件中使用前导 `.` 作为域的前缀来实现此目的：

```
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>

### 身份验证

<a name="csrf-protection"></a>

#### CSRF 保护

要验证你的 SPA，你的 SPA 的「登录」页面应首先向 `/sanctum/csrf-cookie` 发出请求以初始化应用程序的 CSRF 保护：

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

在此请求期间，Laravel 将设置一个包含当前 CSRF 令牌的 `XSRF-TOKEN` cookie。然后，此令牌应在随后的请求中通过 `X-XSRF-TOKEN` 标头传递，其中某些 HTTP 客户端库（如 Axios 和 Angular HttpClient）将自动为你执行此操作。如果你的 JavaScript HTTP 库没有为你设置值，你将需要手动设置 `X-XSRF-TOKEN` 请求头以匹配此路由设置的  `XSRF-TOKEN` cookie 的值。

<a name="logging-in"></a>

#### 登录

一旦已经初始化了 CSRF 保护，你应该向 Laravel 应用程序的 `/login` 路由发出 `POST` 请求。这个 `/login` 路由可以通过[手动实现](/docs/laravel/10.x/authentication#authenticating-users)或使用像 [Laravel Fortify](/docs/laravel/10.x/fortify) 这样的无请求头身份验证包来实现。

如果登录请求成功，你将被验证，随后对应用程序路由的后续请求将通过 Laravel 应用程序发出的会话 cookie 自动进行身份验证。此外，由于你的应用程序已经发出了对 `/sanctum/csrf-cookie` 路由的请求，因此只要你的 JavaScript HTTP 客户端在 `X-XSRF-TOKEN` 标头中发送了 `XSRF-TOKEN` cookie 的值，后续的请求应该自动接受 CSRF 保护。

当然，如果你的用户会话因缺乏活动而过期，那么对 Laravel 应用程序的后续请求可能会收到 401 或 419 HTTP 错误响应。在这种情况下，你应该将用户重定向到你 SPA 的登录页面。

> **警告**
> 你可以自己编写 `/login` 端点；但是，你应该确保使用 Laravel 提供的标准基于[会话的身份验证服务](/docs/laravel/10.x/authentication#authenticating-users)来验证用户。通常，这意味着使用 `web` 身份验证 Guard。

<a name="protecting-spa-routes"></a>

### 保护路由

为了保护路由，以便所有传入的请求必须进行身份验证，你应该将 `sanctum` 身份验证 guard 附加到 `routes/api.php` 文件中的 API 路由上。这个 guard 将确保传入的请求被验证为来自你的 SPA 的有状态身份验证请求，或者如果请求来自第三方，则包含有效的 API 令牌标头：

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="authorizing-private-broadcast-channels"></a>

### 授权私有广播频道

如果你的 SPA 需要对[私有/存在 broadcast 频道进行身份验证](/docs/laravel/10.x/broadcasting#authorizing-channels)，你应该在 `routes/api.php` 文件中调用 `Broadcast::routes` 方法：

```
Broadcast::routes(['middleware' => ['auth:sanctum']]);

```

接下来，为了让 Pusher 的授权请求成功，你需要在初始化 [Laravel Echo](/docs/laravel/10.x/broadcasting#client-side-installation) 时提供自定义的 Pusher `authorizer`。这允许你的应用程序配置 Pusher 以使用[为跨域请求正确配置的](#cors-and-cookies) `axios` 实例：

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="mobile-application-authentication"></a>

## 移动应用程序身份验证

你也可以使用 Sanctum 令牌来验证你的移动应用程序对 API 的请求。验证移动应用程序请求的过程类似于验证第三方 API 请求；但是，你将发布 API 令牌的方式有所不同。

<a name="issuing-mobile-api-tokens"></a>

### 发布 API 令牌

首先，请创建一个路由，该路由接受用户的电子邮件/用户名、密码和设备名称，然后将这些凭据交换为新的 Sanctum 令牌。给此端点提供「设备名称」的目的是为了记录信息，仅供参考。通常来说，设备名称值应该是用户能够识别的名称，例如「Nuno’s iPhone 12」。

通常，你将从你的移动应用程序的「登录」页面向令牌端点发出请求。此端点将返回纯文本的 API 令牌，可以存储在移动设备上，并用于进行额外的 API 请求：

```
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});

```

当移动应用程序使用令牌向你的应用程序发出 API 请求时，它应该将令牌作为 `Bearer` 令牌放在 `Authorization` 标头中传递。

> **注意**
> 当为移动应用程序发布令牌时，你可以自由指定[令牌权限](#token-abilities)。

<a name="protecting-mobile-api-routes"></a>

### 路由保护

如之前所述，你可以通过使用 `sanctum` 认证守卫附加到路由上来保护路由，以便所有传入请求都必须进行身份验证：

```
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

```

<a name="revoking-mobile-api-tokens"></a>

### 撤销令牌

为了允许用户撤销发放给移动设备的 API 令牌，你可以在 Web 应用程序 UI 的 「帐户设置」部分中按名称列出它们，并提供一个「撤销」按钮。当用户点击「撤销」按钮时，你可以从数据库中删除令牌。请记住，你可以通过 `Laravel\Sanctum\HasApiTokens` 特性提供的 `tokens` 关系访问用户的 API 令牌：

```
// 撤销所有令牌...
$user->tokens()->delete();

// 撤销特定令牌...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 测试

在测试时，`Sanctum::actingAs` 方法可用于验证用户并指定为其令牌授予哪些能力：

    use App\Models\User;
    use Laravel\Sanctum\Sanctum;

    public function test_task_list_can_be_retrieved(): void
    {
        Sanctum::actingAs(
            User::factory()->create(),
            ['view-tasks']
        );

        $response = $this->get('/api/task');

        $response->assertOk();
    }

如果你想授予令牌所有的能力，你应该在提供给 `actingAs` 方法的能力列表中包含 `*` ：

    Sanctum::actingAs(
        User::factory()->create(),
        ['*']
    );

