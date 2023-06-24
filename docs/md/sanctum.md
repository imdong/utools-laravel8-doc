# Laravel Sanctum

- [介绍](#introduction)
    - [工作原理](#how-it-works)
- [安装](#installation)
- [配置](#configuration)
    - [覆盖默认模型](#overriding-default-models)
- [API 令牌认证](#api-token-authentication)
    - [发行 API 令牌](#issuing-api-tokens)
    - [令牌能力](#token-abilities)
    - [保护路由](#protecting-routes)
    - [撤销令牌](#revoking-tokens)
	- [令牌有效期](#token-expiration)
- [SPA 认证](#spa-authentication)
    - [配置](#spa-configuration)
    - [认证](#spa-authenticating)
    - [保护路由](#protecting-spa-routes)
    - [授权私人广播频道](#authorizing-private-broadcast-channels)
- [移动应用认证](#mobile-application-authentication)
    - [发行 API 令牌](#issuing-mobile-api-tokens)
    - [保护路由](#protecting-mobile-api-routes)
    - [撤销令牌](#revoking-mobile-api-tokens)
- [测试](#testing)

<a name="introduction"></a>
## 介绍

[Laravel Sanctum](https://github.com/laravel/sanctum) 为 SPA（单页应用程序）、移动应用程序和基于令牌的、简单的 API 提供轻量级身份验证系统。Sanctum 允许应用程序的每个用户为他们的帐户生成多个 API 令牌。这些令牌可以被授予指定允许令牌执行哪些操作的能力 / 范围。

<a name="how-it-works"></a>
### 工作原理

Laravel Sanctum 是为了解决两个独立问题而生。在深入研究之前，我们先来讨论一下。

<a name="how-it-works-api-tokens"></a>
#### API 令牌

首先，它是一个简单的包，用于向用户发出 API 令牌，而不涉及 OAuth。这个功能的灵感来自 GitHub 的「访问令牌」。例如，假设应用程序的「帐户设置」有一个界面，用户可以在其中为其帐户生成 API 令牌。你可以使用 Sanctum 来生成和管理这些令牌。这些令牌通常有很长的过期时间（以年计），当然用户可以随时手动将其撤销。


Laravel Sanctum 的这个特性是通过将用户 API 令牌存储在单个数据库表中，并通过包含了有效 API 令牌的 `Authorization` 标识头对传入的请求进行身份验证而实现的。

<a name="how-it-works-spa-authentication"></a>
#### SPA 身份验证

其次，Sanctum 提供了一种简单的方法来认证需要与基于 Laravel 的 API 进行通信的单页应用程序 (SPAs)。这些 SPAs 可能与 Laravel 应用程序存在于同一仓库中，也可能是一个完全独立的仓库，例如使用 Vue CLI 或者 Next.js 创建的单页应用。

对于此功能，Sanctum 不使用任何类型的令牌。相反，Sanctum 使用 Laravel 内置的基于 cookie 的会话身份验证服务。这提供了 CSRF 保护，会话身份验证以及防止因 XSS 攻击而泄漏身份验证凭据。仅当传入请求来自您自己的 SPA 前端时，Sanctum 才会尝试使用 Cookie 进行身份验证。通常，Sanctum 利用 Laravel 的 web 身份验证保护来实现这一点。这提供了 CSRF 保护、会话身份验证以及防止通过 XSS 攻击而泄漏身份验证凭据。

Sanctum 处理你自己的 SPA 前端的请求时，只会尝试使用 cookie 进行身份验证。当 Sanctum 检查传入的 HTTP 请求时，它将首先检查验证身份的 cookie，如果不存在，Sanctum 将检查 `Authorization` 标识头以获取有效的 API 令牌。

> 技巧：仅将 Sanctum 用于API令牌身份验证或仅用于 SPA 身份验证也是完全可以的。因为你使用 Sanctum 并不意味着你必须同时使用它提供的两种功能。

<a name="installation"></a>
## 安装

> 技巧：最新版本的 Laravel 已经包含了 Laravel Sanctum，但是，如果您的应用程序中 composer.json 文件里不包含 `"laravel/sanctum"` 的话，您可以按照下面的说明进行安装。



您可以通过Composer软件包管理器安装Laravel Sanctum：

```shell
composer require laravel/sanctum
```
接下来，你需要使用 `vendor:publish` Artisan 命令发布 Sanctum 的配置和迁移文件。Sanctum 的配置文件将会保存在 `config` 文件夹中：

```shell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

最后，您应该运行数据库迁移。 Sanctum 将创建一个数据库表来存储 API 令牌：

```shell
php artisan migrate
```

接下来，如果您想利用 Sanctum 对 SPA 进行身份验证，您应该将 Sanctum 的中间件添加到您应用的 `app/Http/Kernel.php` 文件中的 `api` 中间件组中：

    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

<a name="migration-customization"></a>
#### 自定义迁移

如果你不想使用 Sanctum 的默认迁移，你应该在 ` App\Providers\AppServiceProvider` 类的 register 方法中调用 `Sanctum::ignoreMigrations` 方法。 您可以通过执行以下命令导出默认迁移：`php artisan vendor:publish --tag=sanctum-migrations`

<a name="configuration"></a>
## 配置

<a name="overriding-default-models"></a>
### 重写默认模型

尽管通常不需要，但您可以自由扩展 Sanctum 内部使用的 `PersonalAccessToken` 模型：

    use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

    class PersonalAccessToken extends SanctumPersonalAccessToken
    {
        // ...
    }

然后，您可以通过 Sanctum 提供的 `usePersonalAccessTokenModel` 方法指示 Sanctum 使用您的自定义模型。 通常，您应该在应用程序的服务提供器的 `boot` 方法中调用此方法：

    use App\Models\Sanctum\PersonalAccessToken;
    use Laravel\Sanctum\Sanctum;

    /**
     * 引导应用程序服务。
     *
     * @return void
     */
    public function boot()
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }



<a name="api-token-authentication"></a>
## API 令牌认证

> 技巧：你不应使用 API 令牌来验证自己的第一方 SPA。 而应使用 Sanctum 的内置 [SPA 身份验证功能](#spa-authentication)。

<a name="issuing-api-tokens"></a>
### 发布 API Tokens

Sanctum 允许你发布 API 令牌／个人访问令牌，用于对你的应用程序的 API 请求进行身份验证。 使用 API 令牌发出请求时，令牌应作为 `Bearer` 令牌包含在 `Authorization` 请求头中。

要开始为用户颁发令牌，你的 User 模型应使用 `Laravel\Sanctum\HasApiTokens` trait：

    use Laravel\Sanctum\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }

要发布令牌，你可以使用 `createToken` 方法。 `createToken` 方法返回一个 `Laravel\Sanctum\NewAccessToken` 实例。 在存入数据库之前，API 令牌已使用 SHA-256 哈希加密过，但你可以使用 `NewAccessToken` 实例的 `plainTextToken` 属性访问令牌的纯文本值。创建令牌后，你应该立即向用户显示此值：

    use Illuminate\Http\Request;

    Route::post('/tokens/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });

你可以使用 `HasApiTokens` trait 提供的 `tokens` Eloquent 关系访问用户的所有令牌：

    foreach ($user->tokens as $token) {
        //
    }

<a name="token-abilities"></a>
### 令牌能力

Sanctum 允许你将 「能力」分配给令牌。能力的用途与 OAuth 的「Scope」类似。你可以将字符串能力数组作为第二个参数传递给 `createToken` 方法：

    return $user->createToken('token-name', ['server:update'])->plainTextToken;



在处理由 Sanctum 验证的传入请求时，你可以使用 `tokenCan` 方法确定令牌是否具有给定的能力：

    if ($user->tokenCan('server:update')) {
        //
    }

<a name="token-ability-middleware"></a>
#### 令牌能力中间件

Sanctum 还包括两个中间件，可用于验证传入请求是否使用已被授予给定能力的令牌进行身份验证。首先，将以下中间件添加到应用程序的 `app/Http/Kernel.php` 文件的 `$routeMiddleware` 属性中：

    'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
    'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,

`abilities` 中间件可以分配给一个路由，以验证传入请求的令牌是否具有所有列出的能力：

    Route::get('/orders', function () {
        // Token has both "check-status" and "place-orders" abilities...
    })->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);

`ability` 中间件可以分配给一个路由，以验证传入请求的令牌是否具有*至少一个*列出的能力：

    Route::get('/orders', function () {
        // Token has the "check-status" or "place-orders" ability...
    })->middleware(['auth:sanctum', 'ability:check-status,place-orders']);

<a name="first-party-ui-initiated-requests"></a>
#### 第一方 UI 发起的请求

为方便起见，如果传入的经过身份验证的请求来自你的第一方 SPA，并且你正在使用 Sanctum 的内置 [SPA 身份验证](#spa-authentication)，则 `tokenCan` 方法将始终返回 `true`。

但是，这并不一定意味着你的应用必须允许用户执行操作。通常，你的应用的 [授权策略](/docs/laravel/9.x/authorization#creating-policies) 将确定令牌是否已被授予执行能力的权限，并检查是否应允许用户实例本身来执行操作。



例如，假设我们有一个管理服务器的应用，那就要检查令牌是否有权更新服务器 **和** 服务器是否属于用户：

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

起初，允许调用 `tokenCan` 方法并始终为第一方 UI 发起的请求返回 `true` 可能看起来很奇怪； 但是，能够始终假设 API 令牌可用并且可以通过 `tokenCan` 方法进行检查是很方便的。 通过采用这种方法，你可以始终在应用程序的授权策略中调用 `tokenCan` 方法，而无需担心请求是从应用程序的 UI 触发还是由 API 的第三方使用者之一发起。

<a name="protecting-routes"></a>
### 保护路由

为了保护路由，所有传入请求都必须经过身份验证，你应该将 `sanctum` 身份验证看守器附加到 `routes/web.php` 和 `routes/api.php` 中的受保护路由。 如果请求来自第三方，此看守器将确保传入请求被验证为有状态的 cookie 验证请求或包含有效的 API 令牌请求头。

你可能想知道为什么我们建议你使用 `sanctum` 看守器来验证应用程序的 `routes/web.php` 文件中的路由。 请记住，Sanctum 将首先尝试使用 Laravel 的典型 session 身份验证 cookie 对传入请求进行身份验证。 如果该 cookie 不存在，则 Sanctum 将尝试使用请求的 `Authorization` 请求头中的令牌来验证请求。 此外，使用 Sanctum 对所有请求进行身份验证可确保我们始终可以在当前经过身份验证的用户实例上调用 `tokenCan` 方法：

    use Illuminate\Http\Request;

    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });



<a name="revoking-tokens"></a>
### 撤销令牌

你可以通过使用 `Laravel\Sanctum\HasApiTokens` trait 提供的 `tokens` 关联关系从数据库中删除令牌，以达到「撤销」令牌的目的：

    // 撤销所有令牌...
    $user->tokens()->delete();

    // 撤销用于验证当前请求的令牌...
    $request->user()->currentAccessToken()->delete();

    // 撤销指定令牌...
    $user->tokens()->where('id', $tokenId)->delete();

<a name="token-expiration"></a>
### 令牌有效期

默认情况下，`sanctum` 的`token`无过期时限并且仅能通过[撤销令牌](#revoking-tokens)来使它无效。当然如果您想在您的程序里设置`token`的有效期也是可以的。修改`sanctum`的配置文件中的`expiration`选项（默认为null），此选项设置的数字表示多少分钟后过期：

	// 365天后过期
	'expiration'  =>  525600,

如果您的程序中配置了`token`的过期时间，那您多半会希望能用[任务调度](/docs/laravel/9.x/scheduling)自动删除过期了的`token`数据。有个好消息，`sanctum` 提供了一个`Artisan`命令，可以实现这个想法：
```sh
	php artisan sanctum:prune-expired
```
比如，您可以设置一个调度任务用于删除你数据库中所有过期超过24小时的`token`记录：

	$schedule->command('sanctum:prune-expired --hours=24')->daily();

<a name="spa-authentication"></a>
## SPA 认证

Sanctum 还提供了一种简单的方法来验证需要与 Laravel 支持的 API 通信的单页应用程序 （SPA）。 这些 SPA 可能与 Laravel 应用程序存在于同一个存储库中，也可能是一个完全独立的存储库。

对于此功能，Sanctum 不使用任何类型的令牌。 相反，Sanctum 使用 Laravel 内置的基于 cookie 的 session 身份验证服务。 这种身份验证方法提供了 CSRF 保护、session 身份验证以及防止身份验证凭据通过 XSS 泄漏的好处。

> 注意：为了进行身份验证，你的 SPA 和 API 必须共享同一个顶级域。但是，它们可能被放置在不同的子域中。此外，你应确保随请求发送 `Accept: application/json` 请求头。

<a name="spa-configuration"></a>
### 配置 

<a name="configuring-your-first-party-domains"></a>
#### 配置你的第一个域

首先，你应该配置你的 SPA 将从哪些域发出请求。 你可以使用 `sanctum` 配置文件中的 `stateful` 选项来配置这些域。 此配置设置确定哪些域将在向你的 API 发出请求时使用 Laravel session cookie 维护「有状态的」身份验证。

> 注意：如果你通过包含端口 （`127.0.0.1:8000`）的 URL 访问应用程序，则应确保在域中包含端口号。



<a name="sanctum-middleware"></a>
#### Sanctum 中间件

接下来，你应该将 Sanctum 的中间件添加到你的 `app/Http/Kernel.php` 文件中的 `api` 中间件组中。 这个中间件负责确保来自 SPA 的传入请求可以使用 Laravel 的会话 cookie 进行身份验证，同时仍然允许来自第三方或移动应用程序的请求使用 API 令牌进行身份验证：

    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

<a name="cors-and-cookies"></a>
#### CORS & Cookies

如果你无法从在单独子域上执行的 SPA 对你的应用程序进行身份验证，则你可能错误配置了 CORS（跨源资源共享）或会话 cookie 设置。

你应该确保应用程序的 CORS 配置返回的 `Access-Control-Allow-Credentials` 请求头的值为 `true`。 这可以通过将应用程序的 `config/cors.php` 配置文件中的 `supports_credentials` 选项设置为 `true` 来实现。

此外，你应该在应用程序的全局 `axios` 实例上启用 `withCredentials` 选项。 通常，这应该在你的 `resources/js/bootstrap.js` 文件中执行。 如果你没有使用 Axios 从你的前端发出 HTTP 请求，你应该在你自己的 HTTP 客户端上执行等效的配置：

```js
axios.defaults.withCredentials = true;
```

最后，你应该确保应用程序的会话 cookie 域配置支持根域的任何子域。 你可以通过在应用程序的 `config/session.php` 配置文件中使用前导 `.` 作为域的前缀来实现此目的：

    'domain' => '.domain.com',

<a name="spa-authenticating"></a>
### 验证

<a name="csrf-protection"></a>
#### CSRF 保护



要验证你的 SPA，你的 SPA 的 「登录」页面应首先向 `/sanctum/csrf-cookie` 发出请求以初始化应用程序的 CSRF 保护：

```js
axios.get('/sanctum/csrf-cookie').then(response => {
        // 登录...
});
```

在此请求期间，Laravel 将设置一个包含当前 CSRF 令牌的 `XSRF-TOKEN` cookie。然后，此令牌应在后续请求的 `X-XSRF-TOKEN` 请求头中传递，某些 HTTP 客户端库（如 Axios 和 Angular HttpClient）将自动为你执行此操作。如果你的 JavaScript HTTP 库没有为你设置该值，你将需要手动设置 `X-XSRF-TOKEN` 请求头以匹配此路由设置的 `XSRF-TOKEN` cookie 的值。

<a name="logging-in"></a>
#### 登录

一旦 CSRF 保护被初始化，你应该向 Laravel 应用程序的 `/login` 路由发出 `POST` 请求。这个 `/login` 路由可以 [手动实现](/docs/laravel/9.x/authentication#authenticating-users) 或使用无请求头身份验证包，如 [Laravel Fortify](/docs/laravel/9.x/fortify)。

如果登录请求成功，你将通过身份验证，随后对你的应用程序路由的请求将通过 Laravel 应用程序发布给你的客户端的会话 cookie 自动进行身份验证。此外，由于你的应用程序已经向 `/sanctum/csrf-cookie` 路由发出请求，只要你的 JavaScript HTTP 客户端发送 `XSRF-TOKEN` cookie 的值，后续请求应该会自动接受 CSRF 保护 `X-XSRF-TOKEN` 请求头。

当然，如果你的用户 session 由于缺乏活动而过期，后续对 Laravel 应用程序的请求可能会收到 401 或 419 HTTP 错误响应。在这种情况下，你应该将用户重定向到 SPA 的登录页面。

> 注意：你可以自由编写自己的 `/login` 端点；但是，你应该确保它使用标准的 [Laravel 提供的基于 session 的身份验证服务](/docs/laravel/8.x/authentication#authenticating-users) 对用户进行身份验证。通常，这意味着使用 「web」身份验证看守器。



<a name="protecting-spa-routes"></a>
### 路由保护

为了保护路由，以便所有传入的请求都必须经过身份验证，你应该将 `sanctum` 身份验证看守器附加到 `routes/api.php` 文件中的 API 路由。此看守器将确保传入请求被验证为来自你的 SPA 的有状态的已验证请求，或者如果请求来自第三方，则包含有效的 API 令牌请求头：

    use Illuminate\Http\Request;

    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });

<a name="authorizing-private-broadcast-channels"></a>
### 授权私有广播频道

如果你的单页面应用需要通过 [私有 / presence 广播频道](/docs/laravel/9.x/broadcasting#authorizing-channels) 进行身份认证，你需要在你的 `routes/api.php` 文件中调用 `Broadcast::routes` 方法：

    Broadcast::routes(['middleware' => ['auth:sanctum']]);

接下来，为了让 Pusher 的授权请求成功，你需要在初始化 [Laravel Echo](/docs/laravel/9.x/broadcasting#installing-laravel-echo) 时提供一个自定义的 Pusher `authorizer`。这允许你的应用程序配置 Pusher 以使用 [为跨域请求正确配置](#cors-and-cookies) 的 `axios` 实例：

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: process.env.MIX_PUSHER_APP_KEY,
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
## 移动应用身份验证

你可以使用 Sanctum 令牌来验证你的移动应用程序对 API 的请求。验证移动应用请求的过程类似于验证第三方 API 请求；但是，在发布 API 令牌的方式上存在细微差别。



<a name="issuing-mobile-api-tokens"></a>
### 发行 API 令牌

首先，创建一个接受用户电子邮件/用户名、密码和设备名称的路由，然后将这些凭据交换为新的 Sanctum 令牌。赋予此端点的「设备名称」仅供参考，可以是你希望的任何值。通常，设备名称值应该是用户可以识别的名称，例如「Nuno's iPhone 12」。

通常，你将从移动应用程序的「登录」屏幕向令牌端点发出请求。端点将返回纯文本 API 令牌，然后可以将其存储在移动设备上并用于发出其他 API 请求：

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

当移动设备使用令牌向你的应用程序发出 API 请求时，它应将令牌作为 `Bearer` 令牌传递到 `Authorization` 请求头中。

> 技巧：在为移动应用程序发行令牌时，你还可以自由指定 [token abilities](#token-abilities)。

<a name="protecting-mobile-api-routes"></a>
### 路由保护

如前所述，你需要保护路由，因此必须通过在路由上附加 `Sanctum` 身份验证看守器来对所有传入请求进行身份验证。

    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });



<a name="revoking-mobile-api-tokens"></a>
### 撤销令牌

为了允许用户撤销发给移动设备的 API 令牌，你可以在 Web 应用程序 UI 的「帐户设置」部分中按名称列出它们，并附带 「撤销」按钮。 当用户点击「撤销」按钮时，你可以从数据库中删除令牌。 请记住，你可以通过 `Laravel\Sanctum\HasApiTokens` trait 提供的 `tokens` 关系访问用户的 API 令牌：

    // 撤销所有令牌...
    $user->tokens()->delete();

    // 撤销特定令牌...
    $user->tokens()->where('id', $tokenId)->delete();

<a name="testing"></a>
## 测试

在测试时，`Sanctum::actingAs` 方法可用于验证用户并指定为其令牌授予哪些能力：

    use App\Models\User;
    use Laravel\Sanctum\Sanctum;

    public function test_task_list_can_be_retrieved()
    {
        Sanctum::actingAs(
            User::factory()->create(),
            ['view-tasks']
        );

        $response = $this->get('/api/task');

        $response->assertOk();
    }

如果你想授予令牌所有的能力，你应该在提供给 `actingAs` 方法的能力列表中包含 `*`：

    Sanctum::actingAs(
        User::factory()->create(),
        ['*']
    );

