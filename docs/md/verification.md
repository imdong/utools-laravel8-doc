
# Email 认证

- [简介](#introduction)
    - [准备模型](#model-preparation)
    - [准备数据库](#database-preparation)
- [路由](#verification-routing)
    - [Email 认证通知](#the-email-verification-notice)
    - [Email 认证处理](#the-email-verification-handler)
    - [重新发送 Email 认证](#resending-the-verification-email)
    - [保护路由](#protecting-routes)
- [自定义](#customization)
- [事件](#events)

<a name="introduction"></a>
## 简介

很多 Web 应用会要求用户在使用之前进行 Email 地址验证。Laravel 不会强迫你在每个应用中重复实现它，而是提供了便捷的方法来发送和校验电子邮件的验证请求。

> **技巧**
> 想快速上手吗？你可以在全新的应用中安装 [Laravel 应用入门套件](/docs/laravel/10.x/starter-kits) 。入门套件将帮助你搭建整个身份验证系统，包括电子邮件验证支持。

<a name="model-preparation"></a>
### 准备模型

在开始之前，需要检查你的 `App\Models\User` 模型是否实现了 `Illuminate\Contracts\Auth\MustVerifyEmail` 契约：

    <?php

    namespace App\Models;

    use Illuminate\Contracts\Auth\MustVerifyEmail;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable implements MustVerifyEmail
    {
        use Notifiable;

        // ...
    }

一旦这一接口被添加到模型中，新注册的用户将自动收到一封包含电子邮件验证链接的电子邮件。检查你的 `App\Providers\EventServiceProvider` 可以看到，Laravel 已经为 `Illuminate\Auth\Events\Registered` 事件注册了一个 `SendEmailVerificationNotification` [监听器](/docs/laravel/10.x/events) 。这个事件监听器会通过邮件发送验证链接给用户。
如果在应用中你没有使用 [入门套件](/docs/laravel/10.x/starter-kits) 而是手动实现的注册，你需要确保在用户注册成功后手动分发 `Illuminate\Auth\Events\Registered` 事件：

    use Illuminate\Auth\Events\Registered;

    event(new Registered($user));



<a name="database-preparation"></a>
### 数据库准备

接下来，你的 `users` 表必须有一个 `email_verified_at` 字段，用来存储用户邮箱验证的日期和时间。Laravel 框架自带的 `users` 表以及默认包含了该字段。因此，你只需运行数据库迁移即可：

```shell
php artisan migrate
```

<a name="verification-routing"></a>
## 路由

为了实现完整的电子邮件验证流程，你将需要定义三个路由。首先，需要定义一个路由向用户显示通知，告诉用户应该点击注册之后， Laravel 向他们发送的验证邮件中的链接。

其次，需要一个路由来处理用户点击邮件中验证链接时发来的请求。

第三，如果用户没有收到验证邮件，则需要一路由来重新发送验证邮件。

<a name="the-email-verification-notice"></a>
### 邮箱验证通知

如上所述，应该定义一条路由，该路由将返回一个视图，引导用户点击注册后 Laravel 发送给他们邮件中的验证链接。当用户尝试访问网站的其它页面而没有先完成邮箱验证时，将向用户显示此视图。请注意，只要您的 `App\Models\User` 模型实现了 `MustVerifyEmail` 接口，就会自动将该链接发邮件给用户：

    Route::get('/email/verify', function () {
        return view('auth.verify-email');
    })->middleware('auth')->name('verification.notice');

显示邮箱验证的路由，应该命名为 `verification.notice`。配置这个命名路由很重要，因为如果用户邮箱验证未通过，Laravel 自带的[`verified` 中间件](#protecting-routes) 将会自动重定向到该命名路由上。

> **注意**  
> 手动实现邮箱验证过程时，你需要自己定义验证通知视图。如果你希望包含所有必要的身份验证和验证视图，请查看 [Laravel 应用入门套件](/docs/laravel/10.x/starter-kits)



<a name="the-email-verification-handler"></a>
### Email 认证处理

接下来，我们需要定义一个路由，该路由将处理当用户点击验证链接时发送的请求。该路由应命名为 `verification.verify` ，并添加了 `auth` 和 `signed` 中间件

    use Illuminate\Foundation\Auth\EmailVerificationRequest;

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect('/home');
    })->middleware(['auth', 'signed'])->name('verification.verify');

在继续之前，让我们仔细看一下这个路由。首先，您会注意到我们使用的是 `EmailVerificationRequest` 请求类型，而不是通常的 `Illuminate\Http\Request` 实例。 `EmailVerificationRequest` 是 Laravel 中包含的 [表单请求](/docs/laravel/10.x/validation#form-request-validation)。此请求将自动处理验证请求的 id 和 hash 参数。

接下来，我们可以直接在请求上调用 `fulfill` 方法。该方法将在经过身份验证的用户上调用 `markEmailAsVerified` 方法，并会触发 `Illuminate\Auth\Events\Verified` 事件。通过 `Illuminate\Foundation\Auth\User` 基类，`markEmailAsVerified` 方法可用于默认的 `App\Models\User` 模型。验证用户的电子邮件地址后，您可以将其重定向到任意位置。

<a name="resending-the-verification-email"></a>
### 重新发送 Email 认证邮件

有时候，用户可能输错了电子邮件地址或者不小心删除了验证邮件。为了解决这种问题，您可能会想定义一个路由实现用户重新发送验证邮件。您可以通过在 [验证通知视图](#the-email-verification-notice) 中放置一个简单的表单来实现此功能。

    use Illuminate\Http\Request;

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('message', 'Verification link sent!');
    })->middleware(['auth', 'throttle:6,1'])->name('verification.send');



<a name="protecting-routes"></a>
### 保护路由

[路由中间件](/docs/laravel/10.x/middleware)可用于仅允许经过验证的用户访问给定路由。Laravel 附带了一个 `verified` 中间件别名，它是 `Illuminate\Auth\Middleware\EnsureEmailIsVerified` 类的别名。由于该中间件已经在你的应用程序的 HTTP 内核中注册，所以你只需要将中间件附加到路由定义即可。通常，此中间件与 `auth` 中间件配对使用。

    Route::get('/profile', function () {
        // 仅经过验证的用户可以访问此路由。。。
    })->middleware(['auth', 'verified']);

如果未经验证的用户尝试访问已被分配了此中间件的路由，他们将自动重定向到`verification.notice` [命名路由](/docs/laravel/10.x/routing#named-routes)。

<a name="customization"></a>
## 自定义

<a name="verification-email-customization"></a>
#### 验证邮件自定义

虽然默认的电子邮件验证通知应该能够满足大多数应用程序的要求，但 Laravel 允许你自定义如何构建电子邮件验证邮件消息。

要开始自定义邮件验证消息，你需要将一个闭包传递给 `Illuminate\Auth\Notifications\VerifyEmail` 通知提供的 `toMailUsing` 方法。该闭包将接收到通知的可通知模型实例以及用户必须访问以验证其电子邮件地址的已签名电子邮件验证 URL。该闭包应返回 `Illuminate\Notifications\Messages\MailMessage` 的实例。通常，你应该从应用程序的 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中调用 `toMailUsing` 方法：

    use Illuminate\Auth\Notifications\VerifyEmail;
    use Illuminate\Notifications\Messages\MailMessage;

    /**
     * 注册任何身份验证/授权服务。
     */
    public function boot(): void
    {
        // ...

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verify Email Address')
                ->line('Click the button below to verify your email address.')
                ->action('Verify Email Address', $url);
        });
    }

> 技巧：要了解更多有关邮件通知的信息，请参阅 [
邮件通知文档](/docs/laravel/10.x/notifications#mail-notifications)。



<a name="events"></a>
## 事件

如果你是使用 [Laravel 应用入门套件](/docs/laravel/10.x/starter-kits) 的话，Laravel 在电子邮件验证通过后会派发 [事件](/docs/laravel/10.x/events) 。如果你想接收到这个事件并进行手动处理的话，你应该在 `EventServiceProvider` 中注册监听器：

    use App\Listeners\LogVerifiedUser;
    use Illuminate\Auth\Events\Verified;
    
    /**
     * 应用的事件监听器
     *
     * @var array
     */
    protected $listen = [
        Verified::class => [
            LogVerifiedUser::class,
        ],
    ];

