# 消息通知
-   [介绍](#introduction)
-   [生成通知](#generating-notifications)
-   [发送通知](#sending-notifications)
    -   [使用可通知特征](#using-the-notifiable-trait)
    -   [使用通知门面](#using-the-notification-facade)
    -   [指定传送渠道](#specifying-delivery-channels)
    -   [通知排队](#queueing-notifications)
    -   [按需通知](#on-demand-notifications)
-   [邮件通知](#mail-notifications)
    -   [格式化邮件消息](#formatting-mail-messages)
    -   [自定义发件人](#customizing-the-sender)
    -   [自定义收件人](#customizing-the-recipient)
    -   [自定义主题](#customizing-the-subject)
    -   [自定义邮件程序](#customizing-the-mailer)
    -   [自定义模板](#customizing-the-templates)
    -   [附件](#mail-attachments)
    -   [添加标签和元数据](#adding-tags-metadata)
    -   [自定义 Symfony 消息](#customizing-the-symfony-message)
    -   [使用 Mailables](#using-mailables)
    -   [预览邮件通知](#previewing-mail-notifications)
-   [Markdown 邮件通知](#markdown-mail-notifications)
    -   [生成消息](#generating-the-message)
    -   [撰写消息](#writing-the-message)
    -   [自定义组件](#customizing-the-components)
-   [数据库通知](#database-notifications)
    -   [先决条件](#database-prerequisites)
    -   [格式化数据库通知](#formatting-database-notifications)
    -   [访问通知](#accessing-the-notifications)
    -   [将通知标记为已读](#marking-notifications-as-read)
-   [广播通知](#broadcast-notifications)
    -   [先决条件](#broadcast-prerequisites)
    -   [格式化广播通知](#formatting-broadcast-notifications)
    -   [监听通知](#listening-for-notifications)
-   [短信通知](#sms-notifications)
    -   [先决条件](#sms-prerequisites)
    -   [格式化短信通知](#formatting-sms-notifications)
    -   [格式化短代码通知](#formatting-shortcode-notifications)
    -   [自定义「来源」号码](#customizing-the-from-number)
    -   [添加客户参考](#adding-a-client-reference)
    -   [路由短信通知](#routing-sms-notifications)
-   [Slack 通知](#slack-notifications)
    -   [先决条件](#slack-prerequisites)
    -   [格式化 Slack 通知](#formatting-slack-notifications)
    -   [Slack 附件](#slack-attachments)
    -   [路由 Slack 通知](#routing-slack-notifications)
-   [本地化通知](#localizing-notifications)
-   [测试](#testing)
-   [通知事件](#notification-events)
-   [自定义渠道](#custom-channels)

<a name="introduction"></a>
## 介绍

除了支持 [发送电子邮件](/docs/laravel/10.x/mail) 之外，Laravel还提供了支持通过多种传递渠道发送通知的功能，包括电子邮件、短信（通过 [Vonage](https://www.vonage.com/communications-apis/)，前身为Nexmo）和 [Slack](https://slack.com/)。此外，已经创建了多种 [社区构建的通知渠道](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)，用于通过数十个不同的渠道发送通知！通知也可以存储在数据库中，以便在你的Web界面中显示。

通常，通知应该是简短的信息性消息，用于通知用户应用中发生的事情。例如，如果你正在编写一个账单应用，则可以通过邮件和短信频道向用户发送一个「支付凭证」通知。

<a name="generating-notifications"></a>
## 创建通知

Laravel 中，通常每个通知都由一个存储在 `app/Notifications` 目录下的一个类表示。如果在你的应用中没有看到这个目录，不要担心，当运行 `make:notification` 命令时它将为你创建：

```shell
php artisan make:notification InvoicePaid
```

这个命令会在 `app/Notifications` 目录下生成一个新的通知类。每个通知类都包含一个 `via` 方法以及一个或多个消息构建的方法比如 `toMail` 或 `toDatabase`，它们会针对特定的渠道把通知转换为对应的消息。

<a name="sending-notifications"></a>
## 发送通知

<a name="using-the-notifiable-trait"></a>
### 使用 Notifiable Trait

通知可以通过两种方式发送： 使用 `Notifiable` 特性的 `notify` 方法或使用 `Notification` [facade](/docs/laravel/10.x/facades)。 该 `Notifiable` 特性默认包含在应用程序的 `App\Models\User` 模型中：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;
    }

此 `notify` 方法需要接收一个通知实例参数：

    use App\Notifications\InvoicePaid;

    $user->notify(new InvoicePaid($invoice));

> **技巧**
> 请记住，你可以在任何模型中使用 `Notifiable` trait。而不仅仅是在 `User` 模型中。

<a name="using-the-notification-facade"></a>
### 使用 Notification Facade

另外，你可以通过 `Notification` [facade](/docs/laravel/10.x/facades) 来发送通知。它主要用在当你需要给多个可接收通知的实体发送的时候，比如给用户集合发送通知。使用 Facade 发送通知的话，要把可接收通知实例和通知实例传递给 `send` 方法：

    use Illuminate\Support\Facades\Notification;

    Notification::send($users, new InvoicePaid($invoice));

你也可以使用 `sendNow` 方法立即发送通知。即使通知实现了 `ShouldQueue` 接口，该方法也会立即发送通知：

    Notification::sendNow($developers, new DeploymentCompleted($deployment));

<a name="specifying-delivery-channels"></a>
### 发送指定频道

每个通知类都有一个 `via` 方法，用于确定将在哪些通道上传递通知。通知可以在 `mail`、`database`、`broadcast`、`vonage` 和 `slack` 频道上发送。

> **提示**
> 如果你想使用其他的频道，比如 Telegram 或者 Pusher，你可以去看下社区驱动的 [Laravel 通知频道网站](http://laravel-notification-channels.com).

`via` 方法接收一个 `$notifiable` 实例，这个实例将是通知实际发送到的类的实例。你可以用 `$notifiable` 来决定这个通知用哪些频道来发送：

    /**
     * 获取通知发送频道。
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
    }

<a name="queueing-notifications"></a>
### 通知队列化

> **注意**
> 使用通知队列前需要配置队列并 [开启一个队列任务](/docs/laravel/10.x/queues)。

发送通知可能是耗时的，尤其是通道需要调用额外的 API 来传输通知。为了加速应用的响应时间，可以将通知推送到队列中异步发送，而要实现推送通知到队列，可以让对应通知类实现 `ShouldQueue` 接口并使用 `Queueable` trait。如果通知类是通过 make:notification 命令生成的，那么该接口和 trait 已经默认导入，你可以快速将它们添加到通知类：

    <?php

    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification implements ShouldQueue
    {
        use Queueable;

        // ...
    }

一旦将 `ShouldQueue` 接口添加到你的通知中，你就可以发送通知。 Laravel 将检测类上的 `ShouldQueue` 接口并自动排队发送通知：

    $user->notify(new InvoicePaid($invoice));

排队通知时，将为每个收件人和频道组合创建一个排队的作业。比如，如果你的通知有三个收件人和两个频道，则六个作业将被分配到队列中。

<a name="delaying-notifications"></a>
#### 延迟通知

如果你需要延迟发送消息通知, 你可以在你的消息通知实例上添加 `delay` 方法:

    $delay = now()->addMinutes(10);

    $user->notify((new InvoicePaid($invoice))->delay($delay));

<a name="delaying-notifications-per-channel"></a>
#### 多个通道的延迟通知

将一个数组传递给 `delay` 方法来指定特定通道的延迟时间:

    $user->notify((new InvoicePaid($invoice))->delay([
        'mail' => now()->addMinutes(5),
        'sms' => now()->addMinutes(10),
    ]));

或者，你可以在通知类本身上定义一个 `withDelay` 方法。 `withDelay` 方法会返回包含通道名称和延迟值的数组:

    /**
     * 确定通知的传递延迟.
     *
     * @return array<string, \Illuminate\Support\Carbon>
     */
    public function withDelay(object $notifiable): array
    {
        return [
            'mail' => now()->addMinutes(5),
            'sms' => now()->addMinutes(10),
        ];
    }

<a name="customizing-the-notification-queue-connection"></a>
#### 自定义消息通知队列连接

默认情况下，排队的消息通知将使用应用程序的默认队列连接进行排队。如果你想指定一个不同的连接用于特定的通知，你可以在通知类上定义一个 `$connection` 属性:

    /**
     * 排队通知时要使用的队列连接的名称.
     *
     * @var string
     */
    public $connection = 'redis';

或者，如果你想为每个通知通道都指定一个特定的队列连接，你可以在你的通知上定义一个 `viaConnections` 方法。这个方法应该返回一个通道名称 / 队列连接名称的数组。

    /**
     * 定义每个通知通道应该使用哪个连接。
     *
     * @return array<string, string>
     */
    public function viaConnections(): array
    {
        return [
            'mail' => 'redis',
            'database' => 'sync',
        ];
    }

<a name="customizing-notification-channel-queues"></a>
#### 自定义通知通道队列

如果你想为每个通知通道指定一个特定的队列，你可以在你的通知上定义一个 `viaQueues` 。 此方法应返回通道名称 / 队列名称对的数组：

    /**
     * 定义每个通知通道应使用哪条队列。
     *
     * @return array<string, string>
     */
    public function viaQueues(): array
    {
        return [
            'mail' => 'mail-queue',
            'slack' => 'slack-queue',
        ];
    }

<a name="queued-notifications-and-database-transactions"></a>
#### 队列通知 & 数据库事务

当队列通知在数据库事务中被分发时，它们可能在数据库事务提交之前被队列处理。发生这种情况时，你在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。甚至，在事务中创建的任何模型或数据库记录可能不存在于数据库中。如果你的通知依赖于这些模型，那么在处理发送队列通知时可能会发生意外错误。

如果你的队列连接的 `after_commit` 配置选项设置为 `false`，你仍然可以通过在发送通知时调用 `afterCommit` 方法来指示应在提交所有打开的数据库事务后发送特定的排队通知：

    use App\Notifications\InvoicePaid;

    $user->notify((new InvoicePaid($invoice))->afterCommit());

或者，你可以从通知的构造函数调用 `afterCommit` 方法：

```
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * 创建一个新的通知通知实例。
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> **注意**  
> 要了解更多解决这些问题的方法，请查阅有关队列作业和 [数据库事务](/docs/laravel/10.x/queuesmd#jobs-and-database-transactions) 的文档。

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 确定是否发送排队的通知

在将排队的通知分派到后台处理的队列之后，它通常会被队列工作进程接受并发送给其目标收件人。

然而，如果你想要在队列工作进程处理后最终确定是否发送排队的通知，你可以在通知类上定义一个 `shouldSend` 方法。如果此方法返回 `false`，则通知不会被发送：

    /**
     * 定义通知是否应该被发送。
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        return $this->invoice->isPaid();
    }

<a name="on-demand-notifications"></a>
### 按需通知

有时你需要向一些不属于你应用程序的「用户」发送通知。使用 `Notification` 门面的 `route` 方法，你可以在发送通知之前指定即时的通知路由信息：

    use Illuminate\Broadcasting\Channel;
    use Illuminate\Support\Facades\Notification;

    Notification::route('mail', 'taylor@example.com')
                ->route('vonage', '5555555555')
                ->route('slack', 'https://hooks.slack.com/services/...')
                ->route('broadcast', [new Channel('channel-name')])
                ->notify(new InvoicePaid($invoice));

如果你想在向 `mail` 路由发送通知时指定收件人，你可以提供一个数组
电子邮件地址作为键，名字作为值。

    Notification::route('mail', [
        'barrett@example.com' => 'Barrett Blair',
    ])->notify(new InvoicePaid($invoice));

<a name="mail-notifications"></a>
## 邮件通知

<a name="formatting-mail-messages"></a>
### 格式化邮件

如果一个通知支持以电子邮件的形式发送，你应该在通知类中定义一个 `toMail` 方法。这个方法将接收一个 `$notifiable` 实体，并应该返回一个`Illuminate\Notifications\Messages\MailMessage` 实例。

`MailMessage` 类包含一些简单的方法来帮助你建立事务性的电子邮件信息。邮件信息可能包含几行文字以及一个「操作」。让我们来看看一个 `toMail` 方法的例子。

    /**
     * 获取通知的邮件表示形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->greeting('你好!')
                    ->line('你的一张发票已经付款了！')
                    ->lineIf($this->amount > 0, "支出金额: {$this->amount}")
                    ->action('查看发票', $url)
                    ->line('感谢你使用我们的应用程序！');
    }

> **注意**  
> 注意我们在 `toMail` 方法中使用 `$this->invoice->id`。你可以在通知的构造函数中传递任何你的通知需要生成的信息数据。

在这个例子中，我们注册了一个问候语、一行文字、一个操作，然后是另一行文字。`MailMessage` 对象所提供的这些方法使得邮件的格式化变得简单而快速。然后，邮件通道将把信息组件转换封装成一个漂亮的、响应式的HTML电子邮件模板，并有一个纯文本对应。
下面是一个由 `mail` 通道生成的电子邮件的例子。

<img src="https://laravel.com/img/docs/notification-example-2.png">

> **注意**  
> 当发送邮件通知时，请确保在你的 `config/app.php` 配置文件中设置 `name` 配置选项。
这个值将在你的邮件通知信息的标题和页脚中使用。

<a name="error-messages"></a>
#### 错误消息

一些通知会通知用户错误，比如支付失败的发票。你可以通过在构建消息时调用 `error` 方法来指示邮件消息是关于错误的。当在邮件消息上使用 `error` 方法时，操作按钮将会是红色而不是黑色：

    /**
     * 获取通知的邮件表示形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->error()
                    ->subject('发票支付失败')
                    ->line('...');
    }

<a name="other-mail-notification-formatting-options"></a>
#### 其他邮件通知格式选项
你可以使用 `view` 方法来指定应用于呈现通知电子邮件的自定义模板，而不是在通知类中定义文本「行」：

    /**
     * 获取通知的邮件表现形式
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->view(
            'emails.name', ['invoice' => $this->invoice]
        );
    }

你可以通过将视图名称作为数组的第二个元素传递给 `view` 方法来指定邮件消息的纯文本视图：

    /**
     * 获取通知的邮件表现形式
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->view(
            ['emails.name.html', 'emails.name.plain'],
            ['invoice' => $this->invoice]
        );
    }

<a name="customizing-the-sender"></a>
### 自定义发件人

默认情况下，电子邮件的发件人/寄件人地址在 `config/mail.php` 配置文件中定义。但是，你可以使用 `from` 方法为特定的通知指定发件人地址：

    /**
     * 获取通知的邮件表现形式
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->from('barrett@example.com', 'Barrett Blair')
                    ->line('...');
    }

<a name="customizing-the-recipient"></a>
### 自定义收件人

当通过 `mail` 通道发送通知时，通知系统将自动查找可通知实体的 `email` 属性。你可以通过在可通知实体上定义 `routeNotificationForMail` 方法来自定义用于传递通知的电子邮件地址：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 路由邮件通道的通知。
         *
         * @return  array<string, string>|string
         */
        public function routeNotificationForMail(Notification $notification): array|string
        {
            // 只返回电子邮件地址...
            return $this->email_address;

            // 返回电子邮件地址和姓名...
            return [$this->email_address => $this->name];
        }
    }

<a name="customizing-the-subject"></a>
### 自定义主题

默认情况下，邮件的主题是通知类的类名格式化为「标题案例」（Title Case）。因此，如果你的通知类命名为 `InvoicePaid`，则邮件的主题将是 `Invoice Paid`。如果你想为消息指定不同的主题，可以在构建消息时调用 `subject` 方法：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('通知标题')
                    ->line('...');
    }

<a name="customizing-the-mailer"></a>
### 自定义邮件程序

默认情况下，邮件通知将使用 `config/mail.php` 配置文件中定义的默认邮件程序进行发送。但是，你可以在运行时通过在构建消息时调用 `mailer` 方法来指定不同的邮件程序：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->mailer('postmark')
                    ->line('...');
    }

<a name="customizing-the-templates"></a>
### 自定义模板

你可以通过发布通知包的资源来修改邮件通知使用的 HTML 和纯文本模板。运行此命令后，邮件通知模板将位于 `resources/views/vendor/notifications` 目录中：

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 附件

要在电子邮件通知中添加附件，可以在构建消息时使用 `attach` 方法。`attach` 方法接受文件的绝对路径作为其第一个参数：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('你好!')
                    ->attach('/path/to/file');
    }

> **注意**  
> 通知邮件消息提供的 `attach` 方法还接受 [可附加对象](/docs/laravel/10.x/mailmd#attachable-objects)。请查阅全面的 [可附加对象](/docs/laravel/10.x/mailmd#attachable-objects) 文档以了解更多信息。

当附加文件到消息时，你还可以通过将 `array` 作为 `attach` 方法的第二个参数来指定显示名称和/或 MIME 类型：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('你好!')
                    ->attach('/path/to/file', [
                        'as' => 'name.pdf',
                        'mime' => 'application/pdf',
                    ]);
    }

与在可邮寄对象中附加文件不同，你不能使用 `attachFromStorage` 直接从存储磁盘附加文件。相反，你应该使用 `attach` 方法，并提供存储磁盘上文件的绝对路径。或者，你可以从 `toMail` 方法中返回一个 [可邮寄对象](/docs/laravel/10.x/mailmd#generating-mailables)：

    use App\Mail\InvoicePaid as InvoicePaidMailable;

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): Mailable
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email)
                    ->attachFromStorage('/path/to/file');
    }



必要时，可以使用 `attachMany` 方法将多个文件附加到消息中：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('你好!')
                    ->attachMany([
                        '/path/to/forge.svg',
                        '/path/to/vapor.svg' => [
                            'as' => 'Logo.svg',
                            'mime' => 'image/svg+xml',
                        ],
                    ]);
    }

<a name="raw-data-attachments"></a>
#### 原始数据附件

`attachData` 方法可以用于将原始字节数组附加为附件。在调用 `attachData` 方法时，应提供应分配给附件的文件名：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('你好!')
                    ->attachData($this->pdf, 'name.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }

<a name="adding-tags-metadata"></a>
### 添加标签和元数据

一些第三方电子邮件提供商（如 Mailgun 和 Postmark）支持消息「标签」和「元数据」，可用于分组和跟踪应用程序发送的电子邮件。可以通过 `tag` 和 `metadata` 方法将标签和元数据添加到电子邮件消息中：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('评论点赞！')
                    ->tag('点赞')
                    ->metadata('comment_id', $this->comment->id);
    }

如果你的应用程序使用 Mailgun 驱动程序，则可以查阅 Mailgun 的文档以获取有关 [标签](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 和 [元数据](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 的更多信息。同样，也可以参考 Postmark 文档了解他们对 [标签](https://postmarkapp.com/blog/tags-support-for-smtp) 和 [元数据](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 的支持。


如果你的应用程序使用 Amazon SES 发送电子邮件，则应使用 `metadata` 方法将 [SES 「标签」](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)附加到消息。
<a name="customizing-the-symfony-message"></a>
### 自定义 Symfony 消息

`MailMessage`类的`withSymfonyMessage`方法允许你注册一个闭包，在发送消息之前将调用Symfony Message实例。这给你在传递消息之前有深度自定义消息的机会：

    use Symfony\Component\Mime\Email;

    /**
     * 获取通知的邮件表示形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->withSymfonyMessage(function (Email $message) {
                        $message->getHeaders()->addTextHeader(
                            'Custom-Header', 'Header Value'
                        );
                    });
    }

<a name="using-mailables"></a>
### 使用可邮寄对象

如果需要，你可以从通知的 `toMail` 方法返回完整的 [mailable 对象](/docs/laravel/10.x/mail)。当返回 `Mailable` 而不是 `MailMessage` 时，你需要使用可邮寄对象的 `to` 方法指定消息接收者：

    use App\Mail\InvoicePaid as InvoicePaidMailable;
    use Illuminate\Mail\Mailable;

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): Mailable
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email);
    }

<a name="mailables-and-on-demand-notifications"></a>
#### 可邮寄对象和按需通知

如果你正在发送[按需通知](#on-demand-notifications)，则提供给`toMail`方法的`$notifiable`实例将是`Illuminate\Notifications\AnonymousNotifiable`的一个实例，它提供了一个`routeNotificationFor`方法，该方法可用于检索应将按需通知发送到的电子邮件地址：

    use App\Mail\InvoicePaid as InvoicePaidMailable;
    use Illuminate\Notifications\AnonymousNotifiable;
    use Illuminate\Mail\Mailable;

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): Mailable
    {
        $address = $notifiable instanceof AnonymousNotifiable
                ? $notifiable->routeNotificationFor('mail')
                : $notifiable->email;

        return (new InvoicePaidMailable($this->invoice))
                    ->to($address);
    }

<a name="previewing-mail-notifications"></a>
### 预览邮件通知

设计邮件通知模板时，可以像典型的 Blade 模板一样在浏览器中快速预览呈现的邮件消息。出于这个原因，Laravel 允许你直接从路由闭包或控制器返回由邮件通知生成的任何邮件消息。当返回一个 `MailMessage` 时，它将在浏览器中呈现和显示，让你可以快速预览其设计，无需将其发送到实际的电子邮件地址：

    use App\Models\Invoice;
    use App\Notifications\InvoicePaid;

    Route::get('/notification', function () {
        $invoice = Invoice::find(1);

        return (new InvoicePaid($invoice))
                    ->toMail($invoice->user);
    });

<a name="markdown-mail-notifications"></a>
## Markdown 邮件通知

Markdown 邮件通知允许你利用邮件通知的预构建模板，同时为你提供编写更长、定制化消息的自由。由于这些消息是用 Markdown 写的，因此 Laravel 能够为消息呈现漂亮、响应式的 HTML 模板，同时还会自动生成一个纯文本的副本。

<a name="generating-the-message"></a>
### 生成消息

要生成具有相应 Markdown 模板的通知，可以使用 `make:notification` Artisan 命令的 `--markdown` 选项：

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

与所有其他邮件通知一样，使用 Markdown 模板的通知应该在其通知类上定义一个 `toMail` 方法。但是，不要使用 `line` 和 `action` 方法构建通知，而是使用 `markdown` 方法指定应该使用的 Markdown 模板的名称。你希望提供给模板的数据数组可以作为该方法的第二个参数传递：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->subject('发票支付')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }

<a name="writing-the-message"></a>
### 编写消息

Markdown 邮件通知使用 Blade 组件和 Markdown 语法的组合，可以让你在利用 Laravel 的预构建通知组件的同时，轻松构建通知：

```blade
<x-mail::message>
# 发票支付

你的发票已支付!

<x-mail::button :url="$url">
查看发票
</x-mail::button>

谢谢，<br>
{{ config('app.name') }}
</x-mail::message>
```

<a name="button-component"></a>
#### Button 组件

Button 组件会呈现一个居中的按钮链接。该组件接受两个参数，`url` 和一个可选的 `color`。支持的颜色有 `primary`、`green` 和 `red`。你可以在通知中添加任意数量的 Button 组件：

```blade
<x-mail::button :url="$url" color="green">
查看发票
</x-mail::button>
```

<a name="panel-component"></a>
#### Panel 组件
Panel 组件会在通知中呈现给定的文本块，并在面板中以稍微不同的背景颜色呈现。这让你可以引起读者对特定文本块的注意：

```blade
<x-mail::panel>
这是面板内容。
</x-mail::panel>
```

<a name="table-component"></a>
#### Table 组件
Table 组件允许你将 Markdown 表格转换为 HTML 表格。该组件接受 Markdown 表格作为其内容。可以使用默认的 Markdown 表格对齐语法来支持表格列对齐：

```blade
<x-mail::table>
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### 定制组件
你可以将所有的 Markdown 通知组件导出到自己的应用程序进行定制。要导出组件，请使用 `vendor:publish` Artisan 命令来发布 `laravel-mail` 资源标记：


这个命令会将 Markdown 邮件组件发布到 `resources/views/vendor/mail` 目录下。`mail` 目录将包含一个 `html` 和一个 `text` 目录，每个目录都包含其可用组件的各自表示形式。你可以自由地按照自己的喜好定制这些组件。

<a name="customizing-the-css"></a>
#### 定制 CSS 样式

在导出组件之后，`resources/views/vendor/mail/html/themes` 目录将包含一个 `default.css` 文件。你可以在此文件中自定义 CSS 样式，你的样式将自动被内联到 Markdown 通知的 HTML 表示中。

如果你想为 Laravel 的 Markdown 组件构建一个全新的主题，可以在 `html/themes` 目录中放置一个 CSS 文件。命名并保存 CSS 文件后，更新 `mail` 配置文件的 `theme` 选项以匹配你的新主题的名称。

要为单个通知自定义主题，可以在构建通知的邮件消息时调用 `theme` 方法。`theme` 方法接受应该在发送通知时使用的主题名称：

    /**
     * 获取通知的邮件表现形式。
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->theme('发票')
                    ->subject('发票支付')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }

<a name="database-notifications"></a>
## 数据库通知

<a name="database-prerequisites"></a>
### 前提条件

`database` 通知渠道将通知信息存储在一个数据库表中。该表将包含通知类型以及描述通知的 JSON 数据结构等信息。


你可以查询该表，在你的应用程序用户界面中显示通知。但是，在此之前，你需要创建一个数据库表来保存你的通知。你可以使用 `notifications:table` 命令生成一个适当的表模式的 [迁移](/docs/laravel/10.x/migrations)：

```shell
php artisan notifications:table

php artisan migrate
```

<a name="formatting-database-notifications"></a>
### 格式化数据库通知

如果一个通知支持被存储在一个数据库表中，你应该在通知类上定义一个 `toDatabase` 或 `toArray` 方法。这个方法将接收一个 `$notifiable` 实体，并应该返回一个普通的 PHP 数组。返回的数组将被编码为 JSON，并存储在你的 `notifications` 表的 `data` 列中。让我们看一个 `toArray` 方法的例子：

    /**
     * 获取通知的数组表示形式。
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ];
    }

<a name="todatabase-vs-toarray"></a>
#### `toDatabase` Vs. `toArray`

`toArray` 方法也被 `broadcast` 频道用来确定要广播到你的 JavaScript 前端的数据。如果你想为 `database` 和 `broadcast` 频道定义两个不同的数组表示形式，你应该定义一个 `toDatabase` 方法，而不是一个 `toArray` 方法。

<a name="accessing-the-notifications"></a>
### 访问通知

一旦通知被存储在数据库中，你需要一个方便的方式从你的可通知实体中访问它们。`Illuminate\Notifications\Notifiable` trait 包含在 Laravel 的默认 `App\Models\User` 模型中，它包括一个 `notifications` [Eloquent 关联](/docs/laravel/10.x/eloquent-relationships)，返回实体的通知。要获取通知，你可以像访问任何其他 Eloquent 关系一样访问此方法。默认情况下，通知将按照 `created_at` 时间戳排序，最新的通知位于集合的开头：

    $user = App\Models\User::find(1);

    foreach ($user->notifications as $notification) {
        echo $notification->type;
    }

如果你想要只检索「未读」的通知，你可以使用 `unreadNotifications` 关系。同样，这些通知将按照 `created_at` 时间戳排序，最新的通知位于集合的开头：

    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        echo $notification->type;
    }

> **注意**  
> 要从你的 JavaScript 客户端访问你的通知，你应该为你的应用程序定义一个通知控制器，该控制器返回一个可通知实体的通知，如当前用户。然后，你可以从你的 JavaScript 客户端向该控制器的 URL 发送 HTTP 请求。

<a name="marking-notifications-as-read"></a>
### 将通知标记为已读

通常，当用户查看通知时，你希望将通知标记为「已读」。`Illuminate\Notifications\Notifiable` trait 提供了一个 `markAsRead` 方法，该方法将更新通知的数据库记录上的 `read_at` 列：

    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        $notification->markAsRead();
    }

然而，你可以直接在通知集合上使用 `markAsRead` 方法，而不是遍历每个通知：

    $user->unreadNotifications->markAsRead();

你也可以使用批量更新查询将所有通知标记为已读而不必从数据库中检索它们：

    $user = App\Models\User::find(1);

    $user->unreadNotifications()->update(['read_at' => now()]);

你可以使用 `delete` 方法将通知删除并从表中完全移除：

    $user->notifications()->delete();

<a name="broadcast-notifications"></a>
## 广播通知

<a name="broadcast-prerequisites"></a>
### 前提条件

在广播通知之前，你应该配置并熟悉 Laravel 的 [事件广播](/docs/laravel/10.x/broadcasting) 服务。事件广播提供了一种从你的 JavaScript 前端响应服务器端 Laravel 事件的方法。

<a name="formatting-broadcast-notifications"></a>
### 格式化广播通知

`broadcast` 频道使用 Laravel 的 [事件广播](/docs/laravel/10.x/broadcasting) 服务来广播通知，允许你的 JavaScript 前端实时捕获通知。如果通知支持广播，你可以在通知类上定义一个 `toBroadcast` 方法。该方法将接收一个 `$notifiable` 实体，并应该返回一个 `BroadcastMessage` 实例。如果 `toBroadcast` 方法不存在，则将使用 `toArray` 方法来收集应该广播的数据。返回的数据将被编码为 JSON 并广播到你的 JavaScript 前端。让我们看一个 `toBroadcast` 方法的示例：

    use Illuminate\Notifications\Messages\BroadcastMessage;

    /**
     * 获取通知的可广播表示形式。
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ]);
    }

<a name="broadcast-queue-configuration"></a>
#### 广播队列配置

所有广播通知都会被排队等待广播。如果你想配置用于排队广播操作的队列连接或队列名称，你可以使用 `BroadcastMessage` 的 `onConnection` 和 `onQueue` 方法：

    return (new BroadcastMessage($data))
                    ->onConnection('sqs')
                    ->onQueue('broadcasts');

<a name="customizing-the-notification-type"></a>
#### 自定义通知类型

除了你指定的数据之外，所有广播通知还包含一个 `type` 字段，其中包含通知的完整类名。如果你想要自定义通知的 `type`，可以在通知类上定义一个 `broadcastType` 方法：

    /**
     * 获取正在广播的通知类型。
     */
    public function broadcastType(): string
    {
        return 'broadcast.message';
    }

<a name="listening-for-notifications"></a>
### 监听通知

通知会以 `{notifiable}.{id}` 的格式在一个私有频道上广播。因此，如果你向一个 ID 为 `1` 的 `App\Models\User` 实例发送通知，通知将在 `App.Models.User.1` 私有频道上广播。当使用 [Laravel Echo](/docs/laravel/10.x/broadcastingmd#client-side-installation) 时，你可以使用 `notification` 方法轻松地在频道上监听通知：

    Echo.private('App.Models.User.' + userId)
        .notification((notification) => {
            console.log(notification.type);
        });

<a name="customizing-the-notification-channel"></a>
#### 自定义通知频道

如果你想自定义实体的广播通知在哪个频道上广播，可以在可通知实体上定义一个 `receivesBroadcastNotificationsOn` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 用户接收通知广播的频道。
         */
        public function receivesBroadcastNotificationsOn(): string
        {
            return 'users.'.$this->id;
        }
    }

<a name="sms-notifications"></a>
## 短信通知

<a name="sms-prerequisites"></a>
### 先决条件

Laravel 中发送短信通知是由 [Vonage](https://www.vonage.com/)（之前称为 Nexmo）驱动的。在通过 Vonage 发送通知之前，你需要安装 `laravel/vonage-notification-channel` 和 `guzzlehttp/guzzle` 包：

    composer require laravel/vonage-notification-channel guzzlehttp/guzzle

该包包括一个 [配置文件](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php)。但是，你不需要将此配置文件导出到自己的应用程序。你可以简单地使用 `VONAGE_KEY` 和 `VONAGE_SECRET` 环境变量来定义 Vonage 的公共和私有密钥。

定义好密钥后，你可以设置一个 `VONAGE_SMS_FROM` 环境变量，该变量定义了你发送 SMS 消息的默认电话号码。你可以在 Vonage 控制面板中生成此电话号码：

    VONAGE_SMS_FROM=15556666666

<a name="formatting-sms-notifications"></a>
### 格式化短信通知

如果通知支持作为 SMS 发送，你应该在通知类上定义一个 `toVonage` 方法。此方法将接收一个 `$notifiable` 实体并应返回一个 `Illuminate\Notifications\Messages\VonageMessage` 实例：

    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * 获取通知的 Vonage / SMS 表达式。
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('你的短信内容');
    }

<a name="unicode-content"></a>
#### Unicode 内容

如果你的 SMS 消息将包含 unicode 字符，你应该在构造 `VonageMessage` 实例时调用 `unicode` 方法：

    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * 获取通知的 Vonage / SMS 表达式。
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('你的统一码消息')
                    ->unicode();
    }

<a name="customizing-the-from-number"></a>
### 自定义「来源」号码

如果你想从一个不同于 `VONAGE_SMS_FROM` 环境变量所指定的电话号码发送通知，你可以在 `VonageMessage` 实例上调用 `from` 方法：

    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * 获取通知的 Vonage / SMS 表达式。
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('您的短信内容')
                    ->from('15554443333');
    }

<a name="adding-a-client-reference"></a>
### 添加客户关联

如果你想跟踪每个用户、团队或客户的消费，你可以在通知中添加「客户关联」。Vonage 将允许你使用这个客户关联生成报告，以便你能更好地了解特定客户的短信使用情况。客户关联可以是任何字符串，最多 40 个字符。

    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * 获取通知的 Vonage / SMS 表达式。
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->clientReference((string) $notifiable->id)
                    ->content('你的短信内容');
    }

<a name="routing-sms-notifications"></a>
### 路由短信通知

要将 Vonage 通知路由到正确的电话号码，请在你的通知实体上定义 `routeNotificationForVonage` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Vonage 通道的路由通知。
         */
        public function routeNotificationForVonage(Notification $notification): string
        {
            return $this->phone_number;
        }
    }

<a name="slack-notifications"></a>
## Slack 通知

<a name="slack-prerequisites"></a>
### 先决条件

在你可以通过 Slack 发送通知之前，你必须通过 Composer 安装 Slack 通知通道：

```shell
composer require laravel/slack-notification-channel
```

你还需要为你的团队创建一个 [Slack 应用](https://api.slack.com/apps?new_app=1)。创建应用后，你应该为工作区配置一个「传入 Webhook」。 然后，Slack 将为你提供一个 webhook URL，你可以在 [路由 Slack 通知](#routing-slack-notifications) 时使用该 URL。

<a name="formatting-slack-notifications"></a>
### 格式化 Slack 通知

如果通知支持作为 Slack 消息发送，你应在通知类上定义 `toSlack` 方法。此方法将接收一个 `$notifiable` 实体并应返回一个 `Illuminate\Notifications\Messages\SlackMessage` 实例。Slack 消息可能包含文本内容以及格式化附加文本或字段数组的「附件」。  让我们看一个基本的 `toSlack` 示例：

    use Illuminate\Notifications\Messages\SlackMessage;

    /**
     * 获取通知的 Slack 表达式。
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
                    ->content('你的一张发票已经付款了！');
    }

<a name="slack-attachments"></a>
### Slack 附件

你还可以向 Slack 消息添加「附件」。附件提供比简单文本消息更丰富的格式选项。在这个例子中，我们将发送一个关于应用程序中发生的异常的错误通知，包括一个链接，以查看有关异常的更多详细信息：

    use Illuminate\Notifications\Messages\SlackAttachment;
    use Illuminate\Notifications\Messages\SlackMessage;

    /**
     * 获取通知的 Slack 表示形式。
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        $url = url('/exceptions/'.$this->exception->id);

        return (new SlackMessage)
                    ->error()
                    ->content('哎呀！出了问题。')
                    ->attachment(function (SlackAttachment $attachment) use ($url) {
                        $attachment->title('例外：文件未找到', $url)
                                   ->content('文件 [background.jpg] 未找到。');
                    });
    }

附件还允许你指定应呈现给用户的数据数组。 给定的数据将以表格形式呈现，以便于阅读：

    use Illuminate\Notifications\Messages\SlackAttachment;
    use Illuminate\Notifications\Messages\SlackMessage;

    /**
     * 获取通知的 Slack 表示形式。
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        $url = url('/invoices/'.$this->invoice->id);

        return (new SlackMessage)
                    ->success()
                    ->content('你的一张发票已经付款了！')
                    ->attachment(function (SlackAttachment $attachment) use ($url) {
                        $attachment->title('Invoice 1322', $url)
                                   ->fields([
                                        'Title' => 'Server Expenses',
                                        'Amount' => '$1,234',
                                        'Via' => 'American Express',
                                        'Was Overdue' => ':-1:',
                                    ]);
                    });
    }

<a name="markdown-attachment-content"></a>
#### Markdown 附件内容

如果你的附件字段中包含 Markdown，则可以使用 `markdown` 方法指示 Slack 解析和显示给定的附件字段为 Markdown 格式的文本。此方法接受的值是：`pretext`、`text`和/或`fields`。有关 Slack 附件格式的更多信息，请查看 [Slack API 文档](https://api.slack.com/docs/message-formatting#message_formatting)：

    use Illuminate\Notifications\Messages\SlackAttachment;
    use Illuminate\Notifications\Messages\SlackMessage;

    /**
     * 获取通知的 Slack 表示形式。
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        $url = url('/exceptions/'.$this->exception->id);

        return (new SlackMessage)
                    ->error()
                    ->content('Whoops! Something went wrong.')
                    ->attachment(function (SlackAttachment $attachment) use ($url) {
                        $attachment->title('Exception: File Not Found', $url)
                                   ->content('File [background.jpg] was *not found*.')
                                   ->markdown(['text']);
                    });
    }

<a name="routing-slack-notifications"></a>
### 路由 Slack 通知

为了将 Slack 通知路由到正确的 Slack 团队和频道，请在你的通知实体上定义一个 `routeNotificationForSlack` 方法。它应该返回要传送通知的 Webhook URL。Webhook URL 可以通过向你的 Slack 团队添加「传入 Webhook」服务来生成：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 路由 Slack 频道的通知。
         */
        public function routeNotificationForSlack(Notification $notification): string
        {
            return 'https://hooks.slack.com/services/...';
        }
    }

<a name="localizing-notifications"></a>
## 本地化通知

Laravel 允许你在除了当前请求语言环境之外的其他语言环境中发送通知，甚至在通知被队列化的情况下也能记住此语言环境。

为了实现这一功能，`Illuminate\Notifications\Notification` 类提供了 `locale` 方法来设置所需的语言环境。在通知被评估时，应用程序将切换到此语言环境，然后在评估完成后恢复到以前的语言环境：

    $user->notify((new InvoicePaid($invoice))->locale('es'));

通过 `Notification` 门面，也可以实现多个通知实体的本地化：

    Notification::locale('es')->send(
        $users, new InvoicePaid($invoice)
    );

<a name="user-preferred-locales"></a>
### 用户首选语言环境

有时，应用程序会存储每个用户的首选区域设置。通过在你的可通知模型上实现 `HasLocalePreference` 合同，你可以指示 Laravel 在发送通知时使用此存储的区域设置：

    use Illuminate\Contracts\Translation\HasLocalePreference;

    class User extends Model implements HasLocalePreference
    {
        /**
         * 获取用户的首选语言环境。
         */
        public function preferredLocale(): string
        {
            return $this->locale;
        }
    }

翻译：一旦你实现了这个接口，当发送通知和邮件到该模型时，Laravel 会自动使用首选语言环境。因此，在使用此接口时不需要调用`locale`方法：

    $user->notify(new InvoicePaid($invoice));

<a name="testing"></a>
## 测试

你可以使用 `Notification` 门面的 `fake` 方法来阻止通知被发送。通常情况下，发送通知与你实际测试的代码无关。很可能，只需要断言 Laravel 被指示发送了给定的通知即可。

在调用 `Notification` 门面的 `fake` 方法后，你可以断言已经被告知将通知发送给用户，甚至检查通知接收到的数据：

    <?php

    namespace Tests\Feature;

    use App\Notifications\OrderShipped;
    use Illuminate\Support\Facades\Notification;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped(): void
        {
            Notification::fake();

            // 执行订单发货...

            // 断言没有发送通知...
            Notification::assertNothingSent();

            // 断言通知已发送给给定用户...
            Notification::assertSentTo(
                [$user], OrderShipped::class
            );

            // 断言未发送通知...
            Notification::assertNotSentTo(
                [$user], AnotherNotification::class
            );

            // 断言已发送给定数量的通知...
            Notification::assertCount(3);
        }
    }

你可以通过向 `assertSentTo` 或 `assertNotSentTo` 方法传递一个闭包来断言发送了符合给定「真实性测试」的通知。如果发送了至少一个符合给定真实性测试的通知，则断言将成功：

    Notification::assertSentTo(
        $user,
        function (OrderShipped $notification, array $channels) use ($order) {
            return $notification->order->id === $order->id;
        }
    );

<a name="on-demand-notifications"></a>
#### 按需通知

如果你正在测试的代码发送 [即时通知](https://chat.openai.com/chat#on-demand-notifications)，你可以使用 `assertSentOnDemand` 方法测试是否发送了即时通知：

    Notification::assertSentOnDemand(OrderShipped::class);

通过将闭包作为 `assertSentOnDemand` 方法的第二个参数传递，你可以确定是否将即时通知发送到了正确的 「route」 地址：

    Notification::assertSentOnDemand(
        OrderShipped::class,
        function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
            return $notifiable->routes['mail'] === $user->email;
        }
    );

<a name="notification-events"></a>
## 通知事件

<a name="notification-sending-event"></a>
#### 通知发送事件

发送通知时，通知系统会调度 `Illuminate\Notifications\Events\NotificationSending` [事件](/docs/laravel/10.x/events)。 这包含「可通知」实体和通知实例本身。 你可以在应用程序的 `EventServiceProvider` 中为该事件注册监听器：

    use App\Listeners\CheckNotificationStatus;
    use Illuminate\Notifications\Events\NotificationSending;
    
    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        NotificationSending::class => [
            CheckNotificationStatus::class,
        ],
    ];

如果 `NotificationSending` 事件的监听器从它的 `handle` 方法返回 `false`，通知将不会被发送：

    use Illuminate\Notifications\Events\NotificationSending;

    /**
     * 处理事件。
     */
    public function handle(NotificationSending $event): void
    {
        return false;
    }

在事件监听器中，你可以访问事件的 `notifiable`、`notification` 和 `channel` 属性，以了解有关通知接收者或通知本身的更多信息。

    /**
     * 处理事件。
     */
    public function handle(NotificationSending $event): void
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
    }

<a name="notification-sent-event"></a>
#### 通知发送事件

当通知被发送时，通知系统会触发 `Illuminate\Notifications\Events\NotificationSent` [事件](/docs/laravel/10.x/events)，其中包含 「notifiable」 实体和通知实例本身。你可以在 `EventServiceProvider` 中注册此事件的监听器：

    use App\Listeners\LogNotification;
    use Illuminate\Notifications\Events\NotificationSent;
    
    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        NotificationSent::class => [
            LogNotification::class,
        ],
    ];

> **注意**  
> 在 `EventServiceProvider` 中注册了监听器之后，可以使用 event:generate Artisan 命令快速生成监听器类。

在事件监听器中，你可以访问事件上的 `notifiable`、`notification`、`channel` 和 `response` 属性，以了解更多有关通知收件人或通知本身的信息：

    /**
     * 处理事件。
     */
    public function handle(NotificationSent $event): void
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
        // $event->response
    }

<a name="custom-channels"></a>
## 自定义频道
Laravel 提供了一些通知频道，但你可能想编写自己的驱动程序，以通过其他频道传递通知。Laravel 让这变得简单。要开始，定义一个包含 `send` 方法的类。该方法应接收两个参数：`$notifiable` 和 `$notification`。

在 `send` 方法中，你可以调用通知上的方法来检索一个由你的频道理解的消息对象，然后按照你希望的方式将通知发送给 `$notifiable` 实例：

    <?php

    namespace App\Notifications;

    use Illuminate\Notifications\Notification;

    class VoiceChannel
    {
        /**
         * 发送给定的通知
         */
        public function send(object $notifiable, Notification $notification): void
        {
            $message = $notification->toVoice($notifiable);

            // 将通知发送给 $notifiable 实例...
        }
    }

一旦你定义了你的通知频道类，你可以从你的任何通知的 `via` 方法返回该类的名称。在这个例子中，你的通知的 `toVoice` 方法可以返回你选择来表示语音消息的任何对象。例如，你可以定义自己的 `VoiceMessage` 类来表示这些消息：

    <?php

    namespace App\Notifications;

    use App\Notifications\Messages\VoiceMessage;
    use App\Notifications\VoiceChannel;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification
    {
        use Queueable;

        /**
         * 获取通知频道
         */
        public function via(object $notifiable): string
        {
            return VoiceChannel::class;
        }

        /**
         * 获取通知的语音表示形式
         */
        public function toVoice(object $notifiable): VoiceMessage
        {
            // ...
        }
    }