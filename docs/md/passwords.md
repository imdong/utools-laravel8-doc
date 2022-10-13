# 重置密码

- [介绍](#introduction)
    - [模型准备](#model-preparation)
    - [数据库准备](#database-preparation)
    - [配置可信主机](#configuring-trusted-hosts)
- [路由](#routing)
    - [请求重置密码链接](#requesting-the-password-reset-link)
    - [重置密码](#resetting-the-password)
- [删除过期令牌](#deleting-expired-tokens)
- [自定义](#password-customization)

<a name="introduction"></a>
## 介绍

大多数 Web 应用程序都会为用户提供重置密码的功能。 Laravel 已经提供了便捷的服务来发送密码重置链接和安全重置密码，而不需要您为每个应用程序重新实现此功能。

> 技巧：想快速上手？在新的 Laravel 应用程序中安装 Laravel [入门套件](/docs/laravel/9.x/starter-kits) 。Laravel 入门套件会为您搭建完整的身份验证系统，包括重置密码功能。

<a name="model-preparation"></a>
### 模型准备

在使用 Laravel 的重置密码功能之前，确认 `App\Models\User` 模型已经使用了 `Illuminate\Notifications\Notifiable` trait。通常，在新创建的 Laravel 应用程序的 `App\Models\User` 模型中默认引入了该 trait 。

接下来，验证 `App\Models\User` 模型是否继承了 `Illuminate\Contracts\Auth\CanResetPassword` 接口。 框架中包含的 `App\Models\User` 模型默认继承了此接口，并使用 `Illuminate\Auth\Passwords\CanResetPassword` trait 来实现了接口中的方法。

<a name="database-preparation"></a>
### 数据库准备

必须创建一个表来存储应用程序的密码重置令牌。此表的迁移包含在默认的 Laravel 应用程序中，因此您只需迁移您的数据库即可创建此表：

```shell
php artisan migrate
```



<a name="configuring-trusted-hosts"></a>
### 配置可信主机

默认情况下，无论 HTTP 请求的 `Host` 标头的内容如何，Laravel 都会响应它收到的所有请求。 此外，在 Web 请求期间生成应用程序的绝对 URL 时，将使用 `Host` 标头的值。

通常，您应该将 Web 服务器（例如 Nginx 或 Apache）配置为仅向您的应用程序发送与给定主机名匹配的请求。然而，如果你没有能力直接自定义你的 web 服务器并且需要指示 Laravel 只响应某些主机名，你可以通过为你的应用程序启用 `App\Http\Middleware\TrustHosts` 中间件来实现。当您的应用程序提供密码重置功能时，这一点尤其重要

要了解有关此中间件的更多信息，请咨询 [`TrustHosts` 中间件文档](/docs/laravel/9.x/requests#configuring-trusted-hosts).

<a name="routing"></a>
## 路由

为了正确实现对允许用户重置密码的支持，我们需要定义几个路由。首先，我们需要一对路由来处理允许用户通过他们的电子邮件地址请求密码重置链接。其次，一旦用户访问通过电子邮件发送给他们的密码重置链接并完成密码重置表单，我们将需要一对路由来处理实际重置密码

<a name="requesting-the-password-reset-link"></a>
### 请求密码重置链接

<a name="the-password-reset-link-request-form"></a>
#### 密码重置链接申请表

首先，我们将定义请求密码重置链接所需的路由。首先，我们将定义一个路由，该路由返回一个带有密码重置链接请求表单的视图：

    Route::get('/forgot-password', function () {
        return view('auth.forgot-password');
    })->middleware('guest')->name('password.request');



此路由返回的视图应该有一个包含 `email` 字段的表单，该字段允许用户请求给定电子邮件地址的密码重置链接。
<a name="password-reset-link-handling-the-form-submission"></a>
#### 处理表单提交

接下来，我们将定义一个路由，该路由将从「忘记密码」视图处理表单提交请求。此路由将负责验证电子邮件地址并将密码重置请求发送给相应用户：

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Password;

    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
                    ? back()->with(['status' => __($status)])
                    : back()->withErrors(['email' => __($status)]);
    })->middleware('guest')->name('password.email');

在继续之前，让我们更详细地检查一下这条路由。首先，验证请求的 `email` 属性。接下来，我们将使用 Laravel 内置的 `Password` 门面向用户发送一个密码重置链接。密码代理将负责按给定字段（在本例中是电子邮件地址）检索用户，并通过 Laravel 的内置 [消息通知系统](/docs/laravel/9.x/notifications) 向用户发送密码重置链接。

该 `sendResetLink` 方法返回一个状态标识。可以使用 Laravel 的 [本地化](/docs/laravel/9.x/localization) 助手来转换此状态，以便向用户显示有关请求状态的用户友好提示。密码重置状态的转换由应用程序的 `lang/{lang}/passwords.php` 语言文件确定。状态 slug 的每个可能值的条目位于 `passwords` 语言文件中。



您可能想知道，Laravel 在调用 `Password` 门面的 `sendResetLink`  方法时，Laravel 怎么知道如何从应用程序数据库中检索用户记录。Laravel 密码代理利用身份验证系统的「用户提供者」来检索数据库记录。密码代理使用的用户提供程序是在 `passwords` 配置文件的 `config/auth.php` 配置数组中配置的。要了解有关编写自定义用户提供程序的更多信息，请参阅 [身份验证文档](/docs/laravel/9.x/authentication#adding-custom-user-providers)。

> 技巧：当手动实现密码重置时，您需要自己定义视图和路由的内容。如果您想要包含所有必要的身份验证和验证逻辑的脚手架，请查看 [Laravel 应用程序入门工具包](/docs/laravel/9.x/starter-kits)。

<a name="resetting-the-password"></a>
### 重置密码

<a name="the-password-reset-form"></a>
#### 重置密码表单

接下来，我们将定义用户点击重置密码邮件中的链接，进行重置密码所需要的一些路由。第一步，先定义一个获取重置密码表单的路由。这个路由需要一个 `token` 来验证请求：

    Route::get('/reset-password/{token}', function ($token) {
        return view('auth.reset-password', ['token' => $token]);
    })->middleware('guest')->name('password.reset');

通过路由返回的视图应该显示一个含有 `email` 字段， `password` 字段，`password_confirmation` 字段和一个隐藏的值通过路由参数获取的 `token` 字段。



<a name="password-reset-handling-the-form-submission"></a>
#### 处理表单提交的数据

当然，我们需要定义一个路由来接受表单提交的数据。这个路由会检查传过来的参数并更新数据库中用户的密码：

    use Illuminate\Auth\Events\PasswordReset;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Facades\Password;
    use Illuminate\Support\Str;

    Route::post('/reset-password', function (Request $request) {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
                    ? redirect()->route('login')->with('status', __($status))
                    : back()->withErrors(['email' => [__($status)]]);
    })->middleware('guest')->name('password.update');

在继续之前，我们再详细地检查下这条路由。 首先，验证请求的 `token`，`email` 和 `password` 属性。 接下来，我们将使用 Laravel 的内置「密码代理」 (通过 `Password` 门面) 来验证密码重置请求凭据。

如果提供给密码代理的令牌、电子邮件地址和密码有效，则将调用传递给 `reset` 方法的闭包。 在这个接收用户实例和纯文本密码的闭包中，我们可以更新数据库中用户的密码。

该 `reset` 方法返回一个「状态」标识。 此状态可以使用 Laravel 的 [本地化](/docs/laravel/9.x/localization) 助手来翻译此状态，以便向用户显示有关其请求状态的用户友好消息。密码重置状态的翻译由应用程序的 `lang/{lang}/passwords.php` 语言文件决定。状态段的每个可能值的条目位于 `passwords` 语言文件中。



在继续之前，您可能想知道 Laravel 如何在调用 `Password` 门面的 `reset` 方法时如何知道如何从应用程序的数据库中检索用户记录。Laravel 密码代理利用您的身份验证系统的「用户提供者」来检索数据库记录。密码代理使用的用户提供程序在配置文件的 `config/auth.php` 配置文件的 `passwords` 配置数组中配置。 要了解有关编写自定义用户提供程序的更多信息，请参阅 [身份验证文档](/docs/laravel/9.x/authentication#adding-custom-user-providers)。

<a name="deleting-expired-tokens"></a>
## 删除过期令牌

已过期的密码重置令牌仍将存在于您的数据库中。然而，您可以使用 `auth:clear-resets` Artisan 命令轻松删除这些记录：

```shell
php artisan auth:clear-resets
```

如果您想使该过程自动化，请考虑将命令添加到应用程序的 [调度程序](/docs/laravel/9.x/scheduling)：

    $schedule->command('auth:clear-resets')->everyFifteenMinutes();

<a name="password-customization"></a>
## 自定义

<a name="reset-link-customization"></a>
#### 重置链接自定义

您可以使用 `ResetPassword` 通知类提供的 `createUrlUsing` 方法自定义密码重置链接 URL。 此方法接受一个闭包，该闭包接收正在接收通知的用户实例以及密码重置链接令牌。 通常，您应该从 `App\Providers\AuthServiceProvider` 服务提供者的 `boot` 方法中调用此方法：

    use Illuminate\Auth\Notifications\ResetPassword;

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        ResetPassword::createUrlUsing(function ($user, string $token) {
            return 'https://example.com/reset-password?token='.$token;
        });
    }

<a name="reset-email-customization"></a>
#### 重置邮件自定义

您可以轻松修改用于向用户发送密码重置链接的通知类。 首先，覆盖您的 `App\Models\User` 模型上的 `sendPasswordResetNotification` 方法。 在此方法中，您可以使用您自己创建的任何 [通知类](/docs/laravel/9.x/notifications) 发送通知。 密码重置 `$token` 是该方法收到的第一个参数。 你可以使用这个 `$token` 来构建你选择的密码重置 URL 并将你的通知发送给用户：

    use App\Notifications\ResetPasswordNotification;

    /**
     * 发送密码重置通知给用户
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $url = 'https://example.com/reset-password?token='.$token;

        $this->notify(new ResetPasswordNotification($url));
    }

