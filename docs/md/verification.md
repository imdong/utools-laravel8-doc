# Email 认证

- [简介](#introduction)
    - [模型准备](#model-preparation)
    - [数据库准备](#database-preparation)
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

> 技巧：想快速上手吗？你可以在全新的应用中安装 [Laravel 应用入门套件](/docs/laravel/9.x/starter-kits) 。入门套件将帮助你搭建整个身份验证系统，包括电子邮件验证支持。

<a name="model-preparation"></a>
### 模型准备

在开始之前，需要检查你的 `App\Models\User` 模型是否实现了 `Illuminate\Contracts\Auth\MustVerifyEmail` 契约：

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

一旦这一接口被添加到模型中，新注册的用户将自动收到一封包含电子邮件验证链接的电子邮件。检查你的 `App\Providers\EventServiceProvider` 可以看到，Laravel 已经为 `Illuminate\Auth\Events\Registered` 事件附加了一个 `SendEmailVerificationNotification` [监听器](/docs/laravel/9.x/events) 。

如果在应用中你没有使用 [入门套件](/docs/laravel/9.x/starter-kits) 而是手动实现的注册，你需要确保在用户注册成功后手动分发 `Illuminate\Auth\Events\Registered` 事件：

    use Illuminate\Auth\Events\Registered;

    event(new Registered($user));



<a name="database-preparation"></a>
### 数据库准备

接下来，你的 `user` 表必须包含一个 `email_verified_at` 字段用来存储 Email 地址通过验证的时间。默认情况下，Laravel 框架中 `users` 表的数据迁移已经包含了这个字段。所以，您需要做的就只是执行数据库迁移：

```shell
php artisan migrate
```

<a name="verification-routing"></a>
## 路由

为了实现完整的电子邮件验证流程，你将需要定义三个路由。首先，需要定义一个路由向用户显示通知，告诉他们应该点击 Laravel 注册后向他们发送邮件中的验证链接。

其次，需要一个路由来处理用户点击邮件中验证链接时发来的请求。

第三，如果用户没有收到验证邮件，则需要一条路由来重新发送验证邮件。

<a name="the-email-verification-notice"></a>
### Email 认证通知

正如上面所说，应该定义一条路由，该路由将返回一个视图，引导用户点击注册后 Laravel 发送给他们邮件中的验证链接。当用户尝试访问网站的其它页面而没有先完成邮箱验证时，将向用户显示此视图。请注意，只要您的 `App\Models\User` 模型实现了 `MustVerifyEmail` 接口，就会自动发送电子邮件给用户。

    Route::get('/email/verify', function () {
        return view('auth.verify-email');
    })->middleware('auth')->name('verification.notice');

显示邮箱验证通知的路由应该命名为 `verification.notice`。配置这个命名路由很重要，因为如果用户邮箱验证未通过， `verified` 中间件 [包含在 Laravel 中](#protecting-routes) 将会自动重定向到该命名路由上。

> 技巧：手动实现邮箱验证时，需要您自己定义验证通知视图的内容。如果您希望包含所有必要的身份验证和验证视图，请查看 [Laravel 应用入门套件](/docs/laravel/9.x/starter-kits)。



<a name="the-email-verification-handler"></a>
### Email 认证处理

接下来，我们需要定义一个路由，该路由将处理当用户点击验证链接时发送的请求。该路由应命名为 `verification.verify` ，并添加了 `auth` 和 `signed` 中间件

    use Illuminate\Foundation\Auth\EmailVerificationRequest;

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect('/home');
    })->middleware(['auth', 'signed'])->name('verification.verify');

在继续之前，让我们仔细看一下这个路由。首先，您会注意到我们使用的是 `EmailVerificationRequest` 而不是传统的 `Illuminate\Http\Request` 实例。`EmailVerificationRequest` 是 Laravel 附带的[表单请求](/docs/laravel/9.x/validation#form-request-validation)。该请求将自动处理验证请求的 id 和 hash 参数。

接下来，我们可以直接在请求上调用 `fulfill` 方法。该方法将在经过身份验证的用户上调用 `markEmailAsVerified` 方法，并会触发 `Illuminate\Auth\Events\Verified` 事件。通过 `Illuminate\Foundation\Auth\User` 基类，`markEmailAsVerified` 方法可用于默认的 `App\Models\User` 模型。验证用户的电子邮件地址后，您可以将其重定向到任意位置。

<a name="resending-the-verification-email"></a>
### 重新发送 Email 认证邮件

有时候，用户可能输错了电子邮件地址或者不小心删除了验证邮件。为了解决这种问题，您可能会想定义一个路由实现用户重新发送验证邮件。您可以通过在 [验证通知视图](#the-email-verification-notice) 中放置一个简单的表单来实现此功能。

    use Illuminate\Http\Request;

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('message', 'Verification link sent!');
    })->middleware(['auth', 'throttle:6,1'])->name('verification.send');



<a name="protecting-routes"></a>
### 保护路由

[路由中间件](/docs/laravel/9.x/middleware) 可以阻止未通过邮箱验证的用户进行访问。Laravel 附带了 `verified` 中间件，它定义在 `Illuminate\Auth\Middleware\EnsureEmailIsVerified`。由于此中间件已在应用程序的 HTTP 内核中注册，因此您需要做的就是将中间件附加到路由定义：

    Route::get('/profile', function () {
        // 只有经过验证的用户才能进入...
    })->middleware('verified');

如果验证未通过的用户尝试访问已加了此中间件的路由，他们会被自动重定向到 `verification.notice` [命名路由](/docs/laravel/9.x/routing#named-routes)。

<a name="customization"></a>
## 自定义

<a name="verification-email-customization"></a>
#### 自定义 Email 认证

尽管默认邮箱验证通知应该满足大多数应用程序的要求，但是 Laravel 允许您自定义邮箱验证邮件的方式

首先，将闭包传递给 `Illuminate\Auth\Notifications\VerifyEmail` 提供的 `toMailUsing` 方法。闭包将接收可通知模型的实例，以及用户必须访问的包含签名的验证 URL。闭包将返回一个 `Illuminate\Notifications\Messages\MailMessage` 实例 。通常您应该在应用中的 `App\Providers\AuthServiceProvider` 类的 `boot` 方法中调用 `toMailUsing` 方法：

    use Illuminate\Auth\Notifications\VerifyEmail;
    use Illuminate\Notifications\Messages\MailMessage;

    /**
     * 注册任何身份验证/授权服务
     *
     * @return void
     */
    public function boot()
    {
        // ...

        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            return (new MailMessage)
                ->subject('Verify Email Address')
                ->line('Click the button below to verify your email address.')
                ->action('Verify Email Address', $url);
        });
    }

> 技巧：如果你想了解关于邮件通知的更多信息，请查阅 [邮件通知文档](/docs/laravel/9.x/notifications#mail-notifications)。



<a name="events"></a>
## 事件

如果你是使用 [Laravel 应用入门套件](/docs/laravel/9.x/starter-kits)的话，Laravel 在电子邮件验证通过后会派发 [事件](/docs/laravel/9.x/events) 。如果你想接收到这个事件并进行手动处理的话，你应该在 `EventServiceProvider` 中注册监听者：

    /**
     * 应用程序的事件监听器
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Auth\Events\Verified' => [
            'App\Listeners\LogVerifiedUser',
        ],
    ];

