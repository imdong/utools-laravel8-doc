# Laravel Passport

- [介绍](#introduction)
    - [选择 Passport 还是 Sanctum？](#passport-or-sanctum)
- [安装](#installation)
    - [部署 Passport](#deploying-passport)
    - [自定义迁移](#migration-customization)
    - [升级 Passport](#upgrading-passport)
- [配置](#configuration)
    - [客户端密钥 Hashing](#client-secret-hashing)
    - [Token 生命周期](#token-lifetimes)
    - [重载默认模型](#overriding-default-models)
- [发布访问令牌](#issuing-access-tokens)
    - [客户端管理](#managing-clients)
    - [请求令牌](#requesting-tokens)
    - [刷新令牌](#refreshing-tokens)
    - [撤销令牌](#revoking-tokens)
    - [清除令牌](#purging-tokens)
- [通过 PKCE 发布令牌](#code-grant-pkce)
    - [创建客户端](#creating-a-auth-pkce-grant-client)
    - [请求令牌](#requesting-auth-pkce-grant-tokens)
- [密码授权方式的令牌](#password-grant-tokens)
    - [创建密码授权方式客户端](#creating-a-password-grant-client)
    - [请求令牌](#requesting-password-grant-tokens)
    - [请求所有的作用域](#requesting-all-scopes)
    - [自定义用户提供者](#customizing-the-user-provider)
    - [自定义用户名字段](#customizing-the-username-field)
    - [自定义密码验证](#customizing-the-password-validation)
- [隐式授权令牌](#implicit-grant-tokens)
- [客户端授权令牌](#client-credentials-grant-tokens)
- [个人访问令牌](#personal-access-tokens)
    - [创建个人访问令牌的客户端](#creating-a-personal-access-client)
    - [管理个人访问令牌](#managing-personal-access-tokens)
- [路由保护](#protecting-routes)
    - [通过中间件](#via-middleware)
    - [传递访问令牌](#passing-the-access-token)
- [令牌作用域](#token-scopes)
    - [定义作用域](#defining-scopes)
    - [默认作用域](#default-scope)
    - [给令牌分配作用域](#assigning-scopes-to-tokens)
    - [检查作用域](#checking-scopes)
- [使用 JavaScript 接入 API](#consuming-your-api-with-javascript)
- [事件](#events)
- [测试](#testing)

<a name="introduction"></a>
## 介绍

[Laravel Passport](https://github.com/laravel/passport) 可以在几分钟之内为你的应用程序提供完整的 OAuth2 服务端实现。Passport 是基于由 Andy Millington 和 Simon Hamp 维护的 [League OAuth2 server](https://github.com/thephpleague/oauth2-server) 建立的。

> 注意：本文档假定你已熟悉 OAuth2 。如果你并不了解 OAuth2 ，阅读之前请先熟悉下 OAuth2 的 [常用术语](https://oauth2.thephpleague.com/terminology/) 和特性。



<a name="passport-or-sanctum"></a>
### Passport 还是 Sanctum?

在开始之前，我们希望您先确认下是 Laravel Passport 还是 [Laravel Sanctum](/docs/laravel/9.x/sanctum) 能为您的应用提供更好的服务。如果您的应用确确实实需要支持 OAuth2，那没疑问，你需要选用 Laravel Passport。

然而，如果你只是试图要去认证一个单页应用，或者手机应用，或者发布 API 令牌，您应该选用 [Laravel Sanctum](/docs/laravel/9.x/sanctum)。 Laravel Sanctum 不支持 OAuth2，它提供了更为简单的 API 授权开发体验。

<a name="installation"></a>
## 安装

在开始使用之前，使用 Composer 包管理器安装 Passport：

```shell
composer require laravel/passport
```

Passport 的 [服务提供器](/docs/laravel/9.x/providers) 注册了自己的数据库迁移脚本目录， 所以你应该在安装软件包完成后迁移你自己的数据库。 Passport 的迁移脚本将为你的应用创建用于存储 OAuth2 客户端和访问令牌的数据表：

```shell
php artisan migrate
```

接下来，你需要执行 Artisan 命令 `passport:install `。这个命令将会创建一个用于生成安全访问令牌的加密秘钥。另外，这个命令也将创建用于生成访问令牌的 “个人访问” 客户端和 “密码授权” 客户端 ：

```shell
php artisan passport:install
```

> 技巧：如果你想用使用 UUIDS 作为 Passport `Client` 模型的主键，代替默认的自动增长整形字段，请在安装 Passport 时使用 [`uuids` 参数](#client-uuids) 参数。

在执行 `passport:install` 命令后， 添加 `Laravel\Passport\HasApiTokens` trait 到你的 `App\Models\User` 模型中。 这个 trait 会提供一些帮助方法用于检查已认证用户的令牌和权限范围。如果您的模型已经在使用 `Laravel\Sanctum\HasApiTokens` trait，您可以删除该 trait：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }



然后，在你应用的配置文件 `config/auth.php` 中， 将 api 的授权看守器 guards 的 `driver` 参数的值设置为 `passport`。此调整会让你的应用程序使用 Passport 的 `TokenGuard` 鉴权 API 接口请求：

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'passport',
            'provider' => 'users',
        ],
    ],

<a name="client-uuids"></a>
#### UUIDS 客户端

你也可以在使用 `passport:install` 命令时带上 `--uuids` 参数。这个参数将促使 Passport 使用 UUIDS 代替默认的自增长整形字段作为 Passport `Client` 模型的主键。 在你带上 `--uuids` 参数执行 `passport:install` 命令后，你将得到关于禁用 Passport 默认迁移的相关指令说明。

```shell
php artisan passport:install --uuids
```

<a name="deploying-passport"></a>
### 部署 Passport

当你第一次部署 Passport 到你的应用服务器，你需要运行 `passport:keys` 命令。命令将生成一个 Passport 需要的加密秘钥，用于生成访问令牌。生成的秘钥不建议放到源码管理中：

```shell
php artisan passport:keys
```

如有必要，您可以定义应该从中加载 Passport 密钥的路径。 您可以使用 `Passport::loadKeysFrom` 方法来完成此操作。 通常，应该从应用程序的 `App\Providers\AuthServiceProvider` 类的 `boot` 方法调用此方法：

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
    }

<a name="loading-keys-from-the-environment"></a>
#### 从环境中加载秘钥

或者你可以使用 Artisan 命令 `vendor:publish` 发布 Passport 的配置文件：

```shell
php artisan vendor:publish --tag=passport-config
```

配置文件发布好后，可以将加密秘钥定义成环境变量，再加载它们：

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="migration-customization"></a>
### 自定义迁移

如果你不想使用 Passport 的默认迁移，你需要在 `App\Providers\AppServiceProvider` 类中的 `register` 方法中调用 `Passport::ignoreMigrations` 方法。你可以使用 Artisan 命令 `vendor:publish` 导出默认的迁移文件：

```shell
php artisan vendor:publish --tag=passport-migrations
```

<a name="upgrading-passport"></a>
### Passport 的升级

当升级到 Passport 新的主要版本时，你一定要仔细查看[升级指南](https://github.com/laravel/passport/blob/master/UPGRADE.md)。

<a name="configuration"></a>
## 配置

<a name="client-secret-hashing"></a>
### 客户端秘钥的 hash 加密

如果你希望客户端秘钥在存储到数据库时被 hash 加密， 你需要在 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中调用 `Passport::hashClientSecrets` 方法：

    use Laravel\Passport\Passport;

    Passport::hashClientSecrets();



如果开启 hash 加密，所有的客户端秘钥将只会在创建时显示。因为明文的客户秘钥没有存储在数据库中，所以一旦秘钥丢失，就不可能再恢复。

<a name="token-lifetimes"></a>
### Token 生命周期

默认情况下，Passport 会发行生命周期一年的长期 token 。如果要配置更长或更短生命周期的 token，可以使用 `tokensExpireIn` 、`refreshTokensExpireIn` 和 `personalAccessTokensExpireIn` 方法。这些方法需要在应用的 `App\Providers\AuthServiceProvider` 的 `boot` 方法中调用：

    /**
     * 注册身份验证/授权服务
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
    }
> 注意：Passport 数据库表上的 expires_at 列是只读的，只用于显示。在生成 token 时，Passport 将过期信息存储在签名和加密的 token 中。如果你需要使一个令牌失效，你应该 [撤销](#revoking-tokens)它。

<a name="overriding-default-models"></a>
### 重载默认模型

可以通过自定义模型来扩展 Passport 使用的默认模型:

    use Laravel\Passport\Client as PassportClient;

    class Client extends PassportClient
    {
        // ...
    }

在自定义模型后，可以通过 Laravel\Passport\Passport 类引导 Passport 使用自定义模型。通常情况下，你应该在应用程序 App\Providers\AuthServiceProvider 类的 `boot` 方法中定义 Passport 使用自定义模型

    use App\Models\Passport\AuthCode;
    use App\Models\Passport\Client;
    use App\Models\Passport\PersonalAccessClient;
    use App\Models\Passport\Token;

    /**
     * 注册身份验证/授权服务
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::useTokenModel(Token::class);
        Passport::useClientModel(Client::class);
        Passport::useAuthCodeModel(AuthCode::class);
        Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
    }



<a name="issuing-access-tokens"></a>
## 发布访问令牌

通过授权码使用 OAuth2 是大多数开发人员熟悉的方式。使用授权码方式时，客户端应用程序会将用户重定向到你的服务器，在那里他们会批准或拒绝向客户端发出访问令牌的请求。

<a name="managing-clients"></a>
### 客户端管理

首先，开发者如果想要搭建一个与你的服务端接口交互的应用端，需要在服务端这边注册一个 “客户端”。通常，这需要开发者提供应用程序的名称和一个 URL，在应用软件的使用者授权请求后，应用程序会被重定向到该 URL。

<a name="the-passportclient-command"></a>
#### `passport:client` 命令

使用 Artisan 命令 `passport:client` 是一种最简单的创建客户端的方式。 这个命令可以创建你自己私有的客户端，用于 Oauth2 功能测试。 当你执行 `client` 命令后， Passport 将会给你更多关于客户端的提示，以及生成的客户端 ID

```shell
php artisan passport:client
```

**多重定向 URL 地址的设置**

如果你想为你的客户端提供多个重定向 URL ，你可以在执行 `Passport:client` 命令出现提示输入 URL 地址的时候，输入用逗号分割的多个 URL 。任何包含逗号的 URL 都需要先执行 URL 转码：

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### JSON API

因为应用程序的开发者是无法使用 `client` 命令的，所以 Passport 提供了 JSON 格式的 API ，用于创建客户端。 这解决了你还要去手动创建控制器代码（代码用于添加，更新，删除客户端）的麻烦。



但是，你需要结合 Passport 的 JSON API 接口和你的前端面板管理页面， 为你的用户提供客户端管理功能。接下里，我们会回顾所有用于管理客户端的的 API 接口。方便起见，我们使用 [Axios](https://github.com/axios/axios) 模拟对端点的 HTTP 请求。

这些 JSON API 接口被 `web` 和 `auth` 两个中间件保护着，因此，你只能从你的应用中调用。 外部来源的调用是被禁止的。

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

下面的路由将为授权用户返回所有的客户端。最主要的作用是列出所有的用户客户端，接下来就可以编辑或删除它们了：

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

下面的路由用于创建新的客户端。 它需要两个参数： `客户端名称`和`重定向URL` 地址。 `重定向URL` 地址是使用者在授权或者拒绝授权后被重定向到的地方。

客户端被创建后，将会生成客户端 ID 和客户端秘钥。 这对值用于从你的应用获取访问令牌。 调用下面的客户端创建路由将创建新的客户端实例：

```js
const data = {
    name: 'Client Name',
    redirect: 'http://example.com/callback'
};

axios.post('/oauth/clients', data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`



下面的路由用来更新客户端。它需要两个参数： 客户端名称和重定向 URL 地址。 重定向 URL 地址是用户在授权或者拒绝授权后被重定向到的地方。路由将返回更新后的客户端实例：

```js
const data = {
    name: 'New Client Name',
    redirect: 'http://example.com/callback'
};

axios.put('/oauth/clients/' + clientId, data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

下面的路由用于删除客户端：

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        //
    });
```

<a name="requesting-tokens"></a>
### 请求令牌

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 授权重定向

客户端创建好后，开发者使用 client ID 和秘钥向你的应用服务器发送请求，以便获取授权码和访问令牌。 首先，接收到请求的业务端服务器会重定向到你应用的 `/oauth/authorize` 路由上，如下所示：

    use Illuminate\Http\Request;
    use Illuminate\Support\Str;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });

> 技巧：请记住，`/oauth/authorize` 路由默认已经在 `Passport::route` 方法中定义，你无需手动定义它。

<a name="approving-the-request"></a>
#### 请求认证

当接收到一个请求后， Passport 会自动展示一个模板页面给用户，用户可以选择授权或者拒绝授权。如果请求被认证，用户将被重定向到之前业务服务器设置的`重定向地址`上去。 这个`重定向地址`就是客户端在创建时提供的重定向地址参数。



如果你想自定义授权页面，你可以先使用 Artisan 命令 `vendor:publish` 发布 Passport 的视图页面。 被发布的视图页面位于 `resources/views/vendor/passport` 路径下：

```shell
php artisan vendor:publish --tag=passport-views
```

有时，您可能希望跳过授权提示，比如在授权第一梯队客户端的时候。您可以通过 [继承 `Client` 模型](#overriding-default-models)并实现 `skipsAuthorization` 方法。如果 `skipsAuthorization` 方法返回 `true`， 客户端就会直接被认证并立即重定向到设置的重定向地址：

    <?php

    namespace App\Models\Passport;

    use Laravel\Passport\Client as BaseClient;

    class Client extends BaseClient
    {
        /**
         * 确定客户端是否应跳过授权提示。
         *
         * @return bool
         */
        public function skipsAuthorization()
        {
            return $this->firstParty();
        }
    }

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 授权码到授权令牌的转化

如果用户授权了访问，他们会被重定向到业务服务端。首先，业务端服务需要检查 `state` 参数是否和重定向之前存储的值一致。 如果 state 参数的值正确，业务端服务器需要对你的应用发起获取 access token 的 `POST` 请求。 请求需要携带有授权码，授权码就是之前用户授权后由你的应用服务器生成的码：

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Http;

    Route::get('/callback', function (Request $request) {
        $state = $request->session()->pull('state');

        throw_unless(
            strlen($state) > 0 && $state === $request->state,
            InvalidArgumentException::class
        );

        $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'code' => $request->code,
        ]);

        return $response->json();
    });



调用路由 `/oauth/token` 将返回一串 json 字符串，包含了 `access_token`, `refresh_token` 和 `expires_in` 属性。`expires_in` 属性的值是 access_token 剩余的有效时间。

> 技巧：就和 `/oauth/authorize` 路由一样， `/oauth/token` 路由已经在 `Passport::routes` 方法中定义，你无需再自定义这个路由。

<a name="tokens-json-api"></a>
#### JSON API

Passport 同样包含了一个 JSON API 接口用来管理授权访问令牌。你可以使用该接口为用户搭建一个管理访问令牌的控制面板。方便来着，我们将使用 [Axios](https://github.com/mzabriskie/axios) 模拟 HTTP 对端点发起请求。由于 JSON API 被中间件 `web` 和 `auth` 保护着，我们只能在应用内部调用。

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

下面的路由包含了授权用户创建的所有授权访问令牌。接口的主要作用是列出用户所有可撤销的令牌：

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

下面的路由用于撤销授权访问令牌以及相关的刷新令牌：

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### 刷新令牌

如果你的应用发布的是短生命周期访问令牌，用户需要使用刷新令牌来延长访问令牌的生命周期，刷新令牌是在生成访问令牌时同时生成的：

    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'refresh_token',
        'refresh_token' => 'the-refresh-token',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'scope' => '',
    ]);

    return $response->json();

调用路由 `/oauth/token` 将返回一串 json 字符串，包含了 `access_token`, `refresh_token` 和 `expires_in` 属性。`expires_in` 属性的值是 access_token 剩余的有效时间。



<a name="revoking-tokens"></a>
### 撤销令牌

你可以使用 `Laravel\Passport\TokenRepository` 类的 `revokeAccessToken` 方法撤销令牌。你可以使用 `Laravel\Passport\RefreshTokenRepository` 类的 `revokeRefreshTokensByAccessTokenId` 方法撤销刷新令牌。这两个类可以通过 Laravel 的[服务容器](/docs/laravel/9.x/container)得到：

    use Laravel\Passport\TokenRepository;
    use Laravel\Passport\RefreshTokenRepository;

    $tokenRepository = app(TokenRepository::class);
    $refreshTokenRepository = app(RefreshTokenRepository::class);

    // Revoke an access token...
    $tokenRepository->revokeAccessToken($tokenId);

    // Revoke all of the token's refresh tokens...
    $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);

<a name="purging-tokens"></a>
### 清除令牌

如果令牌已经被撤销或者已经过期了，你可能希望把它们从数据库中清理掉。Passport 提供了 Artisan 命令 `passport:purge` 帮助你实现这个操作

```shell
# 清除已经撤销或者过期的令牌以及授权码
php artisan passport:purge

# 只清理撤销的令牌以及授权码
php artisan passport:purge --revoked

# 只清理过期的令牌以及授权码
php artisan passport:purge --expired
```

你可以在应用的 `App\Console\Kernel` 类中配置一个[定时任务](/docs/laravel/9.x/scheduling)，每天自动的清理令牌：

    /**
     * 定义应用程序的命令调度。
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('passport:purge')->hourly();
    }

<a name="code-grant-pkce"></a>
## 通过 PKCE 发布授权码

通过 PKCE (Proof Key for Code Exchange, 中文译为” 代码交换的证明密钥”) 发放授权码是对单页面应用或原生应用进行认证以便访问 API 接口的安全方式。这种发放授权码是用于不能保证客户端密码被安全储存，或为降低攻击者拦截授权码的威胁。在这种模式下，当授权码获取令牌时，用 “验证码”(code verifier) 和 “质疑码”（code challenge, “challenge”，名词可译为’挑战；异议；质疑’等）的组合来交换客户端访问密钥。



<a name="creating-a-auth-pkce-grant-client"></a>
### 创建客户端

在使用 PKCE 方式发布令牌之前，你需要先创建一个启用了 PKCE 的客户端。你可以使用 Artisan 命令 `passport:client` 并带上 `--public` 参数来完成该操作：

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 请求令牌

<a name="code-verifier-code-challenge"></a>
#### 验证码（Code Verifier ）和质疑码（Code Challenge）

这种授权方式不提供授权秘钥，开发者需要创建一个验证码和质疑码的组合来请求得到一个令牌。

验证码是一串包含 43 位到 128 位字符的随机字符串。可用字符包括字母，数字以及下面这些字符：`"-"`, `"."`, `"_"`, `"~"` 。 可参考 [RFC 7636 specification](https://tools.ietf.org/html/rfc7636) 定义。

质疑码是一串 Base64 编码包含 URL 和文件名安全字符的字符串，字符串结尾的 `=` 号需要删除，并且不能包含换行符，空白符或其他附加字符。

    $encoded = base64_encode(hash('sha256', $code_verifier, true));

    $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 授权重定向

客户端创建完后，你可以使用客户端 ID 以及生成的验证码，质疑码从你的应用请求获取授权码和访问令牌。首先，业务端应用需要向服务端路由 `/oauth/authorize` 发起重定向请求：

    use Illuminate\Http\Request;
    use Illuminate\Support\Str;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $request->session()->put(
            'code_verifier', $code_verifier = Str::random(128)
        );

        $codeChallenge = strtr(rtrim(
            base64_encode(hash('sha256', $code_verifier, true))
        , '='), '+/', '-_');

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });



<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 验证码到访问令牌的转换

用户授权访问后，将重定向到业务端服务。正如标准授权定义那样，业务端需要验证回传的 `state` 参数的值和在重定向之前设置的值是否一致。

如果 state 的值验证通过，业务接入端需要向应用端发起一个获取访问令牌的 `POST` 请求。请求的参数需要包括之前用户授权通过后你的应用生成的授权码，以及之前生成的验证码：

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Http;

    Route::get('/callback', function (Request $request) {
        $state = $request->session()->pull('state');

        $codeVerifier = $request->session()->pull('code_verifier');

        throw_unless(
            strlen($state) > 0 && $state === $request->state,
            InvalidArgumentException::class
        );

        $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'code_verifier' => $codeVerifier,
            'code' => $request->code,
        ]);

        return $response->json();
    });

<a name="password-grant-tokens"></a>
## 密码授权方式的令牌

> 注意：我们不再建议使用密码授予令牌。相反，你应该选择
 [OAuth2服务器当前推荐的授权类型](https://oauth2.thephpleague.com/authorization-server/which-grant/).

OAuth2 的密码授权方式允许你自己的客户端（比如手机端应用），通过使用邮箱 / 用户名和密码获取访问秘钥。这样你就可以安全的为自己发放令牌，而不需要完整地走 OAuth2 的重定向授权访问流程。

<a name="creating-a-password-grant-client"></a>
### 创建密码授权方式客户端

在你使用密码授权方式发布令牌前，你需要先创建密码授权方式的客户端。你可以通过 Artisan 命令 `passport:client` ， 并加上 `--password` 参数来创建这样的客户端。 **如果你已经运行过 `passport:install` 命令，则不需要再运行下面的命令:**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 请求令牌

密码授权方式的客户端创建好后，你就可以使用用户邮箱和密码向 `/oauth/token` 路由发起 `POST` 请求，以获取访问令牌。请记住，该路由已经在 `Passport::routes` 方法中定义，你无需再手动实现它。如果请求成功，你将在返回 JSON 串中获取到 `access_token` 和 `refresh_token` :

```
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'password',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'username' => 'taylor@laravel.com',
        'password' => 'my-password',
        'scope' => '',
    ]);

    return $response->json();
```

> 技巧：记住，默认情况下 access token 都是长生命周期的，但是如果有需要的话，你可以主动去 [设置 access token 的过期时间](#configuration) 。

<a name="requesting-all-scopes"></a>
### 请求所有的作用域

当使用密码授权（password grant）或者客户端认证授权（client credentials grant）方式时, 你可能希望将应用所有的作用域范围都授权给令牌。你可以通过设置 scope 参数为 `*` 来实现。 一旦你这样设置了，所有的 `can` 方法都将返回 `true` 值。 此范围只能在密码授权 `password` 或客户端认证授权 `client_credentials` 下使用：

```
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'password',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'username' => 'taylor@laravel.com',
        'password' => 'my-password',
        'scope' => '*',
    ]);
```


<a name="customizing-the-user-provider"></a>
### 自定义用户提供者

如果您的应用程序使用多个 [authentication user provider](/docs/laravel/9.x/authentication#introduction)，您可以通过在创建客户端通过 `artisan passport:client --password` 命令。 给定的提供者名称应与应用程序的 `config/auth.php` 配置文件中定义的有效提供者匹配。 然后，您可以 [使用中间件保护您的路线](#via-middleware) 以确保只有来自守卫指定提供商的用户才被授权。

<a name="customizing-the-username-field"></a>
### 自定义用户名字段

当使用密码授权进行身份验证时，Passport 将使用可验证模型的“电子邮件”属性作为“用户名”。 但是，您可以通过在模型上定义 `findForPassport` 方法来自定义此行为：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;

        /**
         * 查找给定用户名的用户实例。
         *
         * @param  string  $username
         * @return \App\Models\User
         */
        public function findForPassport($username)
        {
            return $this->where('username', $username)->first();
        }
    }

<a name="customizing-the-password-validation"></a>
### 自定义密码验证

当使用密码授权进行身份验证时，Passport 将使用模型的“密码”属性来验证给定的密码。 如果您的模型没有 `password` 属性或者您希望自定义密码验证逻辑，您可以在模型上定义 `validateForPassportPasswordGrant` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Support\Facades\Hash;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;

        /**
         * 验证用户的密码以获得 Passport 密码授权。
         *
         * @param  string  $password
         * @return bool
         */
        public function validateForPassportPasswordGrant($password)
        {
            return Hash::check($password, $this->password);
        }
    }



<a name="implicit-grant-tokens"></a>
## 隐式授权令牌

> 注意：我们不再推荐使用隐式授权令牌。 相反，您应该选择 [OAuth2 服务器当前推荐的授权类型](https://oauth2.thephpleague.com/authorization-server/which-grant/)。

隐式授权类似于授权码授权； 但是，令牌会在不交换授权码的情况下返回给客户端。 此授权最常用于无法安全存储客户端凭据的 JavaScript 或移动应用程序。 要启用授权，请在应用程序的 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中调用 `enableImplicitGrant` 方法：

    /**
     * 注册任何身份验证/授权服务。
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::enableImplicitGrant();
    }

启用授权后，开发人员可以使用他们的客户端 ID 从您的应用程序请求访问令牌。 消费应用程序应该向应用程序的 `/oauth/authorize` 路由发出重定向请求，如下所示：

    use Illuminate\Http\Request;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'token',
            'scope' => '',
            'state' => $state,
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });

> 技巧：请记住，`/oauth/authorize` 路由已经由`Passport::routes` 方法定义。 您无需手动定义此路由。

<a name="client-credentials-grant-tokens"></a>
## 客户凭证授予令牌

客户端凭据授予适用于机器对机器身份验证。 例如，您可以在通过 API 执行维护任务的计划作业中使用此授权。



要想让应用程序可以通过客户端凭据授权发布令牌，首先，您需要创建一个客户端凭据授权客户端。你可以使用 `passport:client` Artisan 命令的 `--client` 选项来执行此操作：

```shell
php artisan passport:client --client
```

接下来，要使用这种授权，你首先需要在 `app/Http/Kernel.php` 的`$routeMiddleware` 属性中添加 `CheckClientCredentials` 中间件：

    use Laravel\Passport\Http\Middleware\CheckClientCredentials;

    protected $routeMiddleware = [
        'client' => CheckClientCredentials::class,
    ];

之后，在路由上附加中间件：

    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client');

要将对路由的访问限制为特定范围，你可以在将 `client` 中间件附加到路由时提供所需范围的逗号分隔列表：

    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client:check-status,your-scope');

<a name="retrieving-tokens"></a>
### 检索令牌

要使用此授权类型检索令牌，请向 `oauth/token` 端点发出请求：

    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'client_credentials',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'scope' => 'your-scope',
    ]);

    return $response->json()['access_token'];

<a name="personal-access-tokens"></a>
## 个人访问令牌

有时，你的用户要在不经过传统的授权码重定向流程的情况下向自己颁发访问令牌。允许用户通过应用程序用户界面对自己发布令牌，有助于用户体验你的 API，或者也可以将其作为一种更简单的发布访问令牌的方式。

> 提示：如果您的应用程序主要使用 Passport 来发布个人访问令牌，请考虑使用 Laravel 的轻量级第一方库 [Laravel Sanctum](/docs/laravel/9.x/sanctum) 来发布 API 访问令牌。



<a name="creating-a-personal-access-client"></a>
### 创建个人访问客户端

在应用程序发出个人访问令牌前，你需要在 `passport:client` 命令后带上 `--personal` 参数来创建对应的客户端。如果你已经运行了 `passport:install` 命令，则无需再运行此命令:

```shell
php artisan passport:client --personal
```

创建个人访问客户端后，将客户端的 ID 和纯文本密钥放在应用程序的 `.env` 文件中:

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### 管理个人令牌

创建个人访问客户端后, 你可以使用 `App\Models\User` 模型实例的 `createToken` 方法来为给定用户发布令牌。`createToken` 方法接受令牌的名称作为其第一个参数和可选的 [作用域](#token-scopes) 数组作为其第二个参数:

    use App\Models\User;

    $user = User::find(1);

    // 创建没有作用域的令牌...
    $token = $user->createToken('Token Name')->accessToken;

    // 创建具有作用域的令牌...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;

<a name="personal-access-tokens-json-api"></a>
#### JSON API

Passport 中还有一个用于管理个人访问令牌的 JSON API。你可以将其与你自己的前端配对，为你的用户提供一个用于管理个人访问令牌的仪表板。下面，我们将回顾所有用于管理个人访问令牌的 API 。为了方便起见，我们将使用 [Axios](https://github.com/mzabriskie/axios) 来演示向 API 发出 HTTP 请求。



JSON API 由 `web` 和 `auth` 这两个中间件保护。因此，只能从你自己的应用程序中调用它。无法从外部源调用它。

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

此路由会返回应用中定义的所有 [作用域](#token-scopes) 。你可以使用此路由列出用户可以分配给个人访问令牌的范围:

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

此路由返回认证用户创建的所有个人访问令牌。这主要用于列出用户的所有令牌，以便他们可以编辑和撤销它们:

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

此路由创建新的个人访问令牌. 它需要两个数据: 令牌的 `name` 和 `scopes` 。

```js
const data = {
    name: 'Token Name',
    scopes: []
};

axios.post('/oauth/personal-access-tokens', data)
    .then(response => {
        console.log(response.data.accessToken);
    })
    .catch (response => {
        // 列出响应的错误...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

此路由可用于撤销个人访问令牌：

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## 路由保护

<a name="via-middleware"></a>
### 通过中间件

Passport 包含一个 [验证保护机制](/docs/laravel/9.x/authentication#adding-custom-guards) 验证请求中传入的访问令牌。  若配置 `api` 的看守器使用 `passport` 驱动，你只要在需要有效访问令牌的路由上指定 `auth:api` 中间件即可：

    Route::get('/user', function () {
        //
    })->middleware('auth:api');

> 注意：如果你正在使用 [客户端授权令牌](#client-credentials-grant-tokens)，你应该使用 [`client` 中间件](#client-credentials-grant-tokens) 来保护你的路由，而不是使用 `auth:api` 中间件。



<a name="multiple-authentication-guards"></a>
#### 多个身份验证 guard

如果你的应用程序可能使用完全不同的 `Eloquent` 模型、不同类型的用户进行身份验证，则可能需要为应用程序中的每种用户设置 `guard`。 这使您可以保护特定 `guard` 的请求。 例如，设置以下 `guard` `config/auth.php` 配置文件：

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],

以下路由将使用 `customers` 用户提供者的 `api-customers` guard 来验证传入的请求：

    Route::get('/customer', function () {
        //
    })->middleware('auth:api-customers');

> 技巧：For more information on using multiple user providers with Passport, please consult the [password grant documentation](#customizing-the-user-provider).

<a name="passing-the-access-token"></a>
### 传递访问令牌

当调用 Passport 保护下的路由时，接入的 API 应用需要将访问令牌作为 `Bearer` 令牌放在请求头 `Authorization 中`。例如，使用 Guzzle HTTP 库时：

    use Illuminate\Support\Facades\Http;

    $response = Http::withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '.$accessToken,
    ])->get('https://passport-app.test/api/user');

    return $response->json();

<a name="token-scopes"></a>
## 令牌作用域

作用域可以让 API 客户端在请求账户授权时请求特定的权限。例如，如果你正在构建电子商务应用程序，并不是所有接入的 API 应用都需要下订单的功能。你可以让接入的 API 应用只被允许授权访问订单发货状态。换句话说，作用域允许应用程序的用户限制第三方应用程序执行的操作。


<a name="defining-scopes"></a>
### 定义作用域

你可以在 `App\Providers\AuthServiceProvider` 的 `boot` 方法中使用 `Passport::tokensCan` 方法来定义 API 的作用域。`tokensCan` 方法接受一个包含作用域名称和描述的数组作为参数。作用域描述将会在授权确认页中直接展示给用户，你可以将其定义为任何你需要的内容：

    /**
     * 注册身份验证/授权服务。
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::tokensCan([
            'place-orders' => 'Place orders',
            'check-status' => 'Check order status',
        ]);
    }

<a name="default-scope"></a>
### 默认作用域

如果客户端没有请求任何特定的范围，你可以在 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中使用 `setDefaultScope` 方法来定义默认的作用域。

    use Laravel\Passport\Passport;

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);

    Passport::setDefaultScope([
        'check-status',
        'place-orders',
    ]);

<a name="assigning-scopes-to-tokens"></a>
### 给令牌分配作用域

<a name="when-requesting-authorization-codes"></a>
#### 请求授权码

使用授权码请求访问令牌时，接入的应用需为 `scope` 参数指定所需作用域。 `scope` 参数包含多个作用域时，名称之间使用空格分割：

    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'code',
            'scope' => 'place-orders check-status',
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });

<a name="when-issuing-personal-access-tokens"></a>
#### 分发个人访问令牌

使用 `App\Models\User` 模型的 `createToken` 方法发放个人访问令牌时，可以将所需作用域的数组作为第二个参数传给此方法：

    $token = $user->createToken('My Token', ['place-orders'])->accessToken;



<a name="checking-scopes"></a>
### 检查作用域

Passport 包含两个中间件，可用于验证传入的请求是否包含访问指定作用域的令牌。 使用之前，需要将下面的中间件添加到 `app/Http/Kernel.php` 文件的 `$routeMiddleware` 属性中：

    'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
    'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,

<a name="check-for-all-scopes"></a>
#### 检查所有作用域

路由可以使用 `scopes`  中间件来检查当前请求是否拥有指定的 *所有* 作用域：

    Route::get('/orders', function () {
        // 访问令牌具有 "check-status" 和 "place-orders" 作用域...
    })->middleware(['auth:api', 'scopes:check-status,place-orders']);

<a name="check-for-any-scopes"></a>
#### 检查任意作用域

路由可以使用 `scope` 中间件来检查当前请求是否拥有指定的 *任意* 作用域：

    Route::get('/orders', function () {
        // 访问令牌具有 "check-status" 或 "place-orders" 作用域...
    })->middleware(['auth:api', 'scope:check-status,place-orders']);

<a name="checking-scopes-on-a-token-instance"></a>
#### 检查令牌实例上的作用域

就算含有访问令牌验证的请求已经通过应用程序的验证，你仍然可以使用当前授权 `App\Models\User`  实例上的 `tokenCan` 方法来验证令牌是否拥有指定的作用域：

    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        if ($request->user()->tokenCan('place-orders')) {
            //
        }
    });

<a name="additional-scope-methods"></a>
#### 附加作用域方法

`scopeIds` 方法将返回所有已定义 ID / 名称的数组：

    use Laravel\Passport\Passport;

    Passport::scopeIds();



`scopes` 方法将返回一个包含所有已定义作用域数组的 `Laravel\Passport\Scope` 实例：

    Passport::scopes();

`scopesFor` 方法将返回与给定 ID / 名称匹配的 `Laravel\Passport\Scope` 实例数组：

    Passport::scopesFor(['place-orders', 'check-status']);

你可以使用 `hasScope` 方法确定是否已定义给定作用域：

    Passport::hasScope('place-orders');

<a name="consuming-your-api-with-javascript"></a>
## 使用 JavaScript 接入 API

在构建 API 时， 如果能通过 JavaScript 应用接入自己的 API 将会给开发过程带来极大的便利。这种 API 开发方法允许你使用自己的应用程序的 API 和别人共享的 API 。你的 Web 应用程序、移动应用程序、第三方应用程序以及可能在各种软件包管理器上发布的任何 SDK 都可能会使用相同的 API 。

通常，如果要在 JavaScript 应用程序中使用 API ，需要手动向应用程序发送访问令牌，并将其传递给应用程序。但是， Passport 有一个可以处理这个问题的中间件。将 `CreateFreshApiToken` 中间件添加到 `app/Http/Kernel.php` 文件中的 `web` 中间件组就可以了：

    'web' => [
        // 其他中间件...
        \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
    ],

> 注意：你需要确保 `CreateFreshApiToken` 中间件是你的中间件堆栈中的最后一个中间件。

该中间件会将 `laravel_token` cookie 附加到您的响应中。该 cookie 将包含一个加密后的 JWT ， Passport 将用来验证来自 JavaScript 应用程序的 API 请求。JWT 的生命周期等于您的 `session.lifetime` 配置值。至此，您可以在不明确传递访问令牌的情况下向应用程序的 API 发出请求：

    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });



<a name="customizing-the-cookie-name"></a>
#### 自定义 Cookie 名称

如果需要，你可以在 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中使用 `Passport::cookie` 方法来自定义 `laravel_token` cookie 的名称:

    /**
     * 注册认证 / 授权服务
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();


        Passport::cookie('custom_name');
    }

<a name="csrf-protection"></a>
#### CSRF 保护

当使用这种授权方法时，您需要确认请求中包含有效的 CSRF 令牌。默认的 Laravel JavaScript 脚手架会包含一个 Axios 实例，该实例是自动使用加密的 `XSRF-TOKEN` cookie 值在同源请求上发送 `X-XSRF-TOKEN` 请求头。

> 技巧：如果您选择发送 `X-CSRF-TOKEN` 请求头而不是 `X-XSRF-TOKEN` ，则需要使用 `csrf_token()` 提供的未加密令牌。

<a name="events"></a>
## 事件

Passport 在发出访问令牌和刷新令牌时引发事件。 您可以使用这些事件来修改或撤消数据库中的其他访问令牌。如果您愿意，您可以在应用程序的 `App\Providers\EventServiceProvider` 类中将侦听器附加到这些事件：

    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        'Laravel\Passport\Events\AccessTokenCreated' => [
            'App\Listeners\RevokeOldTokens',
        ],

        'Laravel\Passport\Events\RefreshTokenCreated' => [
            'App\Listeners\PruneOldTokens',
        ],
    ];

<a name="testing"></a>
## 测试

Passport 的 `actingAs` 方法可以指定当前已认证用户及其作用域。`actingAs` 方法的第一个参数是用户实例，第二个参数是用户令牌作用域数组：

    use App\Models\User;
    use Laravel\Passport\Passport;

    public function test_servers_can_be_created()
    {
        Passport::actingAs(
            User::factory()->create(),
            ['create-servers']
        );

        $response = $this->post('/api/create-server');

        $response->assertStatus(201);
    }



Passport 的 `actingAsClient` 方法可以指定当前已认证用户及其作用域。 `actingAsClient` 方法的第一个参数是用户实例，第二个参数是用户令牌作用域数组：

    use Laravel\Passport\Client;
    use Laravel\Passport\Passport;

    public function test_orders_can_be_retrieved()
    {
        Passport::actingAsClient(
            Client::factory()->create(),
            ['check-status']
        );

        $response = $this->get('/api/orders');

        $response->assertStatus(200);
    }

