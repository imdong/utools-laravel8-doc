# Laravel Socialite

- [简介](#introduction)
- [安装](#installation)
- [升级](#upgrading-socialite)
- [配置](#configuration)
- [认证](#authentication)
    - [路由](#routing)
    - [身份验证和存储](#authentication-and-storage)
    - [访问范围](#access-scopes)
    - [可选参数](#optional-parameters)
- [检索用户详细信息](#retrieving-user-details)

<a name="introduction"></a>
## 简介

除了典型的基于表单的身份验证之外，Laravel 还提供了一种使用 [Laravel Socialite](https://github.com/laravel/socialite)对 OAuth providers 进行身份验证的简单方便的方法。 Socialite 目前支持 Facebook，Twitter，LinkedIn，Google，GitHub，GitLab 和 Bitbucket 的身份验证。

> 技巧：其他平台的驱动器可以在 [Socialite Providers](https://socialiteproviders.com/) 社区驱动网站查找。

<a name="installation"></a>
## 安装

在开始使用 Socialite 之前，通过 Composer 软件包管理器将软件包添加到项目的依赖项中:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## 升级

升级到 Socialite 的新主要版本时，请务必仔细查看 [the upgrade guide](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a name="configuration"></a>
## 配置

在使用 Socialite 之前，需要为应用程序使用的 OAuth 服务添加凭据。这些凭证应该放在你的 `config/services.php` 配置文件中， 并且应该使用 `facebook`， `twitter`，`linkedin`， `google`， `github`， `gitlab`， 或 `bitbucket`作为键名，取决于应用程序所需的 Providers 。例如:

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => 'http://example.com/callback-url',
    ],

> 技巧：如果 `redirect` 项的值包含一个相对路径，它将会自动解析为全称 URL。



<a name="authentication"></a>
## 认证

<a name="routing"></a>
### 路由

要使用 OAuth 提供程序对用户进行身份验证，你需要两个路由：一个用于将用户重定向到 OAuth provider，另一个用于在身份验证后接收来自 provider 的回调。下面的示例控制器演示了这两个路由的实现：

    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/redirect', function () {
        return Socialite::driver('github')->redirect();
    });

    Route::get('/auth/callback', function () {
        $user = Socialite::driver('github')->user();

        // $user->token
    });

`redirect` 提供的方法 `Socialite` facade 负责将用户重定向到 OAuth provider，而该 user 方法将读取传入的请求并在身份验证后从提供程序中检索用户的信息。

<a name="authentication-and-storage"></a>
### 身份验证和存储

从 OAuth 提供程序检索到用户后，你可以确定该用户是否存在于应用程序的数据库中并[验证用户](/docs/laravel/9.x/authentication#authenticate-a-user-instance)。如果用户在应用程序的数据库中不存在，通常会在数据库中创建一条新记录来代表该用户：

    use App\Models\User;
    use Illuminate\Support\Facades\Auth;
    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/callback', function () {
        $githubUser = Socialite::driver('github')->user();

        $user = User::where('github_id', $githubUser->id)->first();

        if ($user) {
            $user->update([
                'github_token' => $githubUser->token,
                'github_refresh_token' => $githubUser->refreshToken,
            ]);
        } else {
            $user = User::create([
                'name' => $githubUser->name,
                'email' => $githubUser->email,
                'github_id' => $githubUser->id,
                'github_token' => $githubUser->token,
                'github_refresh_token' => $githubUser->refreshToken,
            ]);
        }

        Auth::login($user);

        return redirect('/dashboard');
    });

> 技巧：有关特定 OAuth 提供商提供哪些用户信息的更多信息，请参阅有关 [检索用户详细信息](#retrieving-user-details) 的文档。


<a name="access-scopes"></a>
### 访问作用域

在重定向用户之前，你还可以使用 `scopes` 方法在请求中添加其他「作用域」。此方法会将所有现有作用域与你提供的作用域合并：

    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('github')
        ->scopes(['read:user', 'public_repo'])
        ->redirect();

你可以使用 `setScopes` 方法覆盖所有现有范围：

    return Socialite::driver('github')
        ->setScopes(['read:user', 'public_repo'])
        ->redirect();

<a name="optional-parameters"></a>
### 可选参数

许多 OAuth providers 支持重定向请求中的可选参数。 要在请求中包含任何可选参数，请使用关联数组调用 `with` 方法：

    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')
        ->with(['hd' => 'example.com'])
        ->redirect();

> 注意：使用  `with` 方法时, 注意不要传递任何保留的关键字，例如 `state` 或 `response_type`。

<a name="retrieving-user-details"></a>
## 检索用户详细信息

在将用户重定向回你的身份验证回调路由之后，你可以使用 Socialite 的 `user` 方法检索用户的详细信息。`user` 方法为返回的用户对象提供了各种属性和方法，你可以使用这些属性和方法在你自己的数据库中存储有关该用户的信息。你可以使用不同的属性和方法这取决于要进行身份验证的 OAuth 提供程序是否支持 OAuth 1.0 或 OAuth 2.0：

    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/callback', function () {
        $user = Socialite::driver('github')->user();

        // OAuth 2.0 providers...
        $token = $user->token;
        $refreshToken = $user->refreshToken;
        $expiresIn = $user->expiresIn;

        // OAuth 1.0 providers...
        $token = $user->token;
        $tokenSecret = $user->tokenSecret;

        // All providers...
        $user->getId();
        $user->getNickname();
        $user->getName();
        $user->getEmail();
        $user->getAvatar();
    });



<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 从令牌中检索用户详细信息 (OAuth2)

如果你已经有了一个用户的有效访问令牌，你可以使用 Socialite 的 `userFromToken` 方法检索其详细信息：

    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('github')->userFromToken($token);

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### 从令牌和秘钥中检索用户的详细信息 (OAuth1)

如果你已经有了一对有效的用户令牌/秘钥，你可以使用 Socialite 的 `userFromTokenAndSecret` 方法检索他们的详细信息：

    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);

<a name="stateless-authentication"></a>
#### 无认证状态

`stateless` 方法可用于禁用会话状态验证。 这在向 API 添加社交身份验证时非常有用：

    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')->stateless()->user();

> 注意：Twitter 驱动程序不支持无状态身份验证，它使用 OAuth 1.0 进行身份验证

