# Notifications

- [简介](#introduction)
- [创建通知](#generating-notifications)
- [发送通知](#sending-notifications)
    - [使用 Notifiable Trait](#using-the-notifiable-trait)
    - [使用 Notification Facade](#using-the-notification-facade)
    - [指定发送频道](#specifying-delivery-channels)
    - [通知队列化](#queueing-notifications)
    - [按需通知](#on-demand-notifications)
- [邮件通知](#mail-notifications)
    - [格式化邮件信息](#formatting-mail-messages)
    - [自定义发送者](#customizing-the-sender)
    - [自定义接收者](#customizing-the-recipient)
    - [自定义主题](#customizing-the-subject)
    - [自定义邮件驱动](#customizing-the-mailer)
    - [自定义模板](#customizing-the-templates)
    - [附件](#mail-attachments)
    - [使用Mailables](#using-mailables)
    - [预览邮件通知](#previewing-mail-notifications)
- [Markdown 邮件通知](#markdown-mail-notifications)
    - [生成消息](#generating-the-message)
    - [写消息](#writing-the-message)
    - [自定义组件](#customizing-the-components)
- [数据库通知](#database-notifications)
    - [必要条件](#database-prerequisites)
    - [格式化数据库通知](#formatting-database-notifications)
    - [访问通知](#accessing-the-notifications)
    - [标记已读通知](#marking-notifications-as-read)
- [广播通知](#broadcast-notifications)
    - [必要条件](#broadcast-prerequisites)
    - [格式化广播通知](#formatting-broadcast-notifications)
    - [监听广播通知](#listening-for-notifications)
- [短信通知](#sms-notifications)
    - [必要条件](#sms-prerequisites)
    - [格式化短信通知](#formatting-sms-notifications)
    - [格式化简码通知](#formatting-shortcode-notifications)
    - [自定义「From」号码](#customizing-the-from-number)
    - [添加客户端引用](#adding-a-client-reference)
    - [短信通知路由](#routing-sms-notifications)
- [Slack 通知](#slack-notifications)
    - [必要条件](#slack-prerequisites)
    - [格式化 Slack 通知](#formatting-slack-notifications)
    - [Slack 附件](#slack-attachments)
    - [Slack 路由](#routing-slack-notifications)
- [本地化通知](#localizing-notifications)
- [通知事件](#notification-events)
- [自定义频道](#custom-channels)

<a name="introduction"></a>
## 简介

除了支持 [发送邮件](/docs/laravel/9.x/mail) 之外，Laravel 还支持通过多种频道发送通知，包括邮件、短信（通过  [Vonage](https://www.vonage.com/communications-apis/)，原来叫 Nexmo），以及  [Slack](https://slack.com)。此外，已经创建了各种各样的 [社区通知频道](https://laravel-notification-channels.com/about/#suggesting-a-new-channel)，来在十几个不同的频道中发送通知！通知还能存储到数据库以便后续在 Web 页面中显示。

通常，通知应该是简短的信息性消息，用于通知用户应用中发生的事情。例如，如果你正在编写一个账单应用，则可以通过邮件和短信频道向用户发送一个「支付凭证」通知。

<a name="generating-notifications"></a>
## 创建通知

Laravel 中，通常每个通知都由一个存储在 `app/Notifications` 目录下的一个类表示。如果在你的应用中没有看到这个目录，不要担心，当运行 `make:notification` 命令时它将为您创建：

```shell
php artisan make:notification InvoicePaid
```

这个命令会在 `app/Notifications` 目录下生成一个新的通知类。每个通知类都包含一个 `via` 方法以及一个或多个消息构建的方法比如 `toMail` 或 `toDatabase`，它们会针对特定的渠道把通知转换为对应的消息。

<a name="sending-notifications"></a>
## 发送通知

<a name="using-the-notifiable-trait"></a>
### 使用 Notifiable Trait

通知可以通过两种方式发送： 使用 `Notifiable` 特性的 `notify` 方法或使用 `Notification` [门面](/docs/laravel/9.x/facades)。 该 `Notifiable` 默认包含在应用程序的 `App\Models\User` 模型中：

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

> 技巧：请记住，你可以在任何模型中使用 `Notifiable` trait。而不仅仅是在 `User` 模型中。



<a name="using-the-notification-facade"></a>
### 使用 Notification Facade

另外，你可以通过 `Notification` [facade](/docs/laravel/9.x/facades) 来发送通知，它主要用在当你需要给多个可接收通知的实体发送的时候，比如给用户集合发送通知。使用 Facade 发送通知的话，要把可接收通知实例和通知实例传递给 `send` 方法：

    use Illuminate\Support\Facades\Notification;

    Notification::send($users, new InvoicePaid($invoice));

您也可以使用`sendNow`方法立即发送通知。即使通知实现了`ShouldQueue`接口，该方法也会立即发送通知：

    Notification::sendNow($developers, new DeploymentCompleted($deployment));

<a name="specifying-delivery-channels"></a>
### 发送指定频道

每个通知类都有一个`via`方法，用于确定将在哪些通道上传递通知。通知可以在`mail`、`database`、`broadcast`、`vonage`和`slack`频道上发送。

> 提示：如果你想使用其他的频道，比如 Telegram 或者 Pusher，你可以去看下社区驱动的 [Laravel 通知频道网站](http://laravel-notification-channels.com)。

`via` 方法接收一个 `$notifiable` 实例，这个实例将是通知实际发送到的类的实例。你可以用 `$notifiable` 来决定这个通知用哪些频道来发送：

    /**
     * 获取通知发送频道
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
    }

<a name="queueing-notifications"></a>
### 通知队列化
> 注意：使用通知队列前需要配置队列并 [开启一个队列任务](/docs/laravel/9.x/queues)。

发送通知可能是耗时的，尤其是通道需要调用额外的 API 来传输通知。为了加速应用的响应时间，可以将通知推送到队列中异步发送，而要实现推送通知到队列，可以让对应通知类实现 `ShouldQueue` 接口并使用 `Queueable` trait。如果通知类是通过 `make:notification`  命令生成的，那么该接口和 trait 已经默认导入，你可以快速将它们添加到通知类：

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



一旦 `ShouldQueue` 接口被添加到您的通知中，您就可以像往常一样发送通知。 Laravel 将检测类上的 `ShouldQueue` 接口并自动将通知的传递排队：

    $user->notify(new InvoicePaid($invoice));

如果您想延迟通知的传递，您可以将 `delay` 方法链接到通知实例：

    $delay = now()->addMinutes(10);

    $user->notify((new InvoicePaid($invoice))->delay($delay));

您可以将数组传递给 `delay` 方法来指定特定通道的延迟量：

    $user->notify((new InvoicePaid($invoice))->delay([
        'mail' => now()->addMinutes(5),
        'sms' => now()->addMinutes(10),
    ]));

排队通知时，将为每个收件人和频道组合创建一个排队作业。例如，如果您的通知有三个收件人和两个通道，则六个作业将被分派到队列中。

<a name="customizing-the-notification-queue-connection"></a>
#### 自定义通知队列连接

默认情况下，排队通知将使用应用程序的默认队列连接进行排队。如果您想为特定通知指定一个不同的连接，您可以在通知类上定义一个 `$connection` 属性：

    /**
     * 排队通知时要使用的队列连接的名称。
     *
     * @var string
     */
    public $connection = 'redis';

<a name="customizing-notification-channel-queues"></a>
#### 自定义通知通道队列

如果你想为通知支持的每个通知通道指定一个特定的队列，你可以在你的通知上定义一个`viaQueues`方法。 此方法应返回通道名称/队列名称对的数组：

    /**
     * 确定每个通知通道应使用哪些队列。
     *
     * @return array
     */
    public function viaQueues()
    {
        return [
            'mail' => 'mail-queue',
            'slack' => 'slack-queue',
        ];
    }



<a name="queued-notifications-and-database-transactions"></a>
#### 排队通知 & 数据库事务

当在数据库事务中调度排队通知时，它们可能在数据库事务提交之前由队列处理。 发生这种情况时，您在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。 此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。 如果您的通知依赖于这些模型，则在处理发送排队通知的作业时可能会发生意外错误。

如果您的队列连接的 `after_commit` 配置选项设置为 `false`，您仍然可以通过在发送通知时调用 `afterCommit` 方法来指示应在提交所有打开的数据库事务后发送特定的排队通知：

    use App\Notifications\InvoicePaid;

    $user->notify((new InvoicePaid($invoice))->afterCommit());

或者，您可以从通知的构造函数中调用 `afterCommit` 方法：

    <?php

    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification implements ShouldQueue
    {
        use Queueable;

        /**
         * 创建一个新的通知实例。
         *
         * @return void
         */
        public function __construct()
        {
            $this->afterCommit();
        }
    }

> 技巧：要了解有关解决这些问题的更多信息，请查看有关 [队列任务和数据库事务](/docs/laravel/9.x/queues#jobs-and-database-transactions) 的文档 。

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### 确定是否应发送排队通知

在为队列分派队列通知以进行后台处理后，它通常会被队列工作人员接受并发送给其预期的接收者。



但是，如果您想在队列工作程序处理队列通知后最终确定是否应该发送它，您可以在通知类上定义一个 `shouldSend` 方法。 如果此方法返回 `false`，则不会发送通知：

    /**
     * 确定是否应发送通知。
     *
     * @param  mixed  $notifiable
     * @param  string  $channel
     * @return bool
     */
    public function shouldSend($notifiable, $channel)
    {
        return $this->invoice->isPaid();
    }

<a name="on-demand-notifications"></a>
### 按需通知

有时您可能需要向未存储为应用程序“用户”的人发送通知。使用 `Notification` 门面的 `route` 方法，您可以在发送通知之前指定 ad-hoc 通知路由信息：

    Notification::route('mail', 'taylor@example.com')
                ->route('vonage', '5555555555')
                ->route('slack', 'https://hooks.slack.com/services/...')
                ->notify(new InvoicePaid($invoice));

如果您想在向“邮件”路由发送按需通知时提供收件人的姓名，您可以提供一个数组，其中包含电子邮件地址作为键，名称作为数组中第一个元素的值：

    Notification::route('mail', [
        'barrett@example.com' => 'Barrett Blair',
    ])->notify(new InvoicePaid($invoice));

<a name="mail-notifications"></a>
## 邮件通知

<a name="formatting-mail-messages"></a>
### 格式化邮件信息

如果通知支持作为电子邮件发送，您应该在通知类上定义一个 `toMail` 方法。 此方法将接收一个 `$notifiable` 实体并应返回一个 `Illuminate\Notifications\Messages\MailMessage` 实例。

`MailMessage` 类包含一些简单的方法来帮助您构建事务性电子邮件消息。 邮件消息可能包含文本行以及「动作的调用」。让我们看一个示例 `toMail` 方法：

    /**
     * 获取通知的邮件描述。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->greeting('Hello!')
                    ->line('你的一张发票已经付款了！')
                    ->action('查看发票', $url)
                    ->line('感谢您使用我们的应用程序！');
    }

> 技巧：请注意，我们在您的 `toMail` 方法中使用了 `$this->invoice->id`。您可以将通知生成其消息所需的任何数据传递给通知构造函数。



在此示例中，我们注册了一个问候语、一行文本、一个号召性用语，然后是另一行文本。 `MailMessage` 对象提供的这些方法使格式化小型交易电子邮件变得简单快捷。 然后，邮件通道会将消息组件翻译成漂亮的响应式 HTML 电子邮件模板，并带有纯文本副本。 以下是 `mail` 频道生成的电子邮件示例：

<img src="https://laravel.com/img/docs/notification-example-2.png">

> 技巧：发送邮件通知时，请务必在 `config/app.php` 配置文件中设置 `name` 配置选项。 此值将用于邮件通知消息的页眉和页脚。

<a name="other-mail-notification-formatting-options"></a>
#### 其他邮件通知格式选项

除了在通知类中定义多行文本之外，您可以使用 `view` 方法来指定应该用于呈现通知电子邮件的自定义模板：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)->view(
            'emails.name', ['invoice' => $this->invoice]
        );
    }

您可以通过将视图名称作为数组的第二个元素传递给 `view` 方法来指定邮件消息的纯文本视图：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)->view(
            ['emails.name.html', 'emails.name.plain'],
            ['invoice' => $this->invoice]
        );
    }

<a name="error-messages"></a>
#### 错误信息



一些通知会通知用户错误，例如发票支付失败。您可以通过在构建消息时调用 `error` 方法来指示邮件消息与错误有关。在邮件消息上使用 `error` 方法时，号召性用语按钮将是红色而不是黑色：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Message
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->error()
                    ->subject('Notification Subject')
                    ->line('...');
    }

<a name="customizing-the-sender"></a>
### 自定义发件人

默认情况下，电子邮件的发件人/发件人地址在 `config/mail.php` 配置文件中定义。但是，您可以使用 `from` 方法指定特定通知的发件人地址：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->from('barrett@example.com', 'Barrett Blair')
                    ->line('...');
    }

<a name="customizing-the-recipient"></a>
### 自定义收件人

通过 `mail` 渠道发送通知时，通知系统将自动在您的应通知实体上查找 `email` 属性。您可以通过在通知实体上定义 `routeNotificationForMail` 方法来自定义用于发送通知的电子邮件地址：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 邮件通道的路由通知。
         *
         * @param  \Illuminate\Notifications\Notification  $notification
         * @return array|string
         */
        public function routeNotificationForMail($notification)
        {
            // 仅返回电子邮件地址...
            return $this->email_address;

            // 返回电子邮件地址和姓名...
            return [$this->email_address => $this->name];
        }
    }



<a name="customizing-the-subject"></a>
### 自定义主题

默认情况下，电子邮件的主题是格式为「标题风格」的通知的类名。因此，如果您的通知类名为`InvoicePaid`，则电子邮件的主题将是`Invoice Paid`。 如果您想为消息指定不同的主题，您可以在构建消息时调用 `subject` 方法：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Notification Subject')
                    ->line('...');
    }

<a name="customizing-the-mailer"></a>
### 自定义邮件程序

默认情况下，将使用 `config/mail.php` 配置文件中定义的默认邮件程序发送电子邮件通知。但是，您可以通过在构建消息时调用 `mailer` 方法在运行时指定不同的邮件程序：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->mailer('postmark')
                    ->line('...');
    }

<a name="customizing-the-templates"></a>
### 自定义模板

您可以通过发布通知包的资源来修改邮件通知使用的 HTML 和纯文本模板。运行此命令后，邮件通知模板将位于 `resources/views/vendor/notifications` 目录中：

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### 附件

要将附件添加到电子邮件通知中，请在构建消息时使用 `attach` 方法。 `attach` 方法接受文件的绝对路径作为其第一个参数：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attach('/path/to/file');
    }



将文件附加到消息时，您还可以通过将 `array` 作为第二个参数传递给 `attach` 方法来指定显示名称和 MIME 类型：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attach('/path/to/file', [
                        'as' => 'name.pdf',
                        'mime' => 'application/pdf',
                    ]);
    }

与在可邮寄对象中附加文件不同，您不能使用 `attachFromStorage` 直接从存储磁盘附加文件。 您应该使用带有存储磁盘上文件的绝对路径的 `attach` 方法。 或者，您可以从 `toMail` 方法返回 [mailable](/docs/laravel/9.x/mail#generating-mailables)：
    use App\Mail\InvoicePaid as InvoicePaidMailable;

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return Mailable
     */
    public function toMail($notifiable)
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email)
                    ->attachFromStorage('/path/to/file');
    }

<a name="raw-data-attachments"></a>
#### 原始数据附件

`attachData` 方法可用于附加原始字节字符串作为附件。调用 `attachData` 方法时，应提供应分配给附件的文件名：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attachData($this->pdf, 'name.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }

<a name="using-mailables"></a>
### 使用 Mailables

如果需要，您可以从通知的 `toMail` 方法返回一个完整的 [可邮寄对象](/docs/laravel/9.x/mail)。当返回 `Mailable` 而不是 `MailMessage` 时，您需要使用 mailable 对象的 `to` 方法指定消息收件人：

    use App\Mail\InvoicePaid as InvoicePaidMailable;

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return Mailable
     */
    public function toMail($notifiable)
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email);
    }



<a name="mailables-and-on-demand-notifications"></a>
#### 可邮寄和按需通知

如果您正在发送 [on-demand-notifications](#on-demand-notifications)，则为 `toMail` 方法提供的 `$notifiable` 实例将是 `Illuminate\Notifications\AnonymousNotifiable` 的一个实例，它提供了一个 ` routeNotificationFor` 方法，可用于检索应将按需通知发送到的电子邮件地址：

    use App\Mail\InvoicePaid as InvoicePaidMailable;
    use Illuminate\Notifications\AnonymousNotifiable;

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return Mailable
     */
    public function toMail($notifiable)
    {
        $address = $notifiable instanceof AnonymousNotifiable
                ? $notifiable->routeNotificationFor('mail')
                : $notifiable->email;

        return (new InvoicePaidMailable($this->invoice))
                    ->to($address);
    }

<a name="previewing-mail-notifications"></a>
### 预览邮件通知

在设计邮件通知模板时，可以方便地在浏览器中快速预览呈现的邮件消息，就像典型的 Blade 模板一样。 因此，Laravel 允许您直接从路由闭包或控制器返回由邮件通知生成的任何邮件消息。 当返回一个 `MailMessage` 时，它将被渲染并显示在浏览器中，让您可以快速预览其设计，而无需将其发送到实际的电子邮件地址：

    use App\Models\Invoice;
    use App\Notifications\InvoicePaid;

    Route::get('/notification', function () {
        $invoice = Invoice::find(1);

        return (new InvoicePaid($invoice))
                    ->toMail($invoice->user);
    });

<a name="markdown-mail-notifications"></a>
## Markdown 邮件通知

Markdown 邮件通知允许您利用预先构建的邮件通知模板，同时让您更自由地编写更长的自定义消息。 由于消息是用 Markdown 编写的，Laravel 能够为消息呈现漂亮的响应式 HTML 模板，同时还可以自动生成纯文本副本。



<a name="generating-the-message"></a>
### 生成消息

要使用相应的 Markdown 模板生成通知，您可以使用 `make:notification` Artisan 命令的 `--markdown` 选项：

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

与所有其他邮件通知一样，使用 Markdown 模板的通知应在其通知类上定义一个 `toMail` 方法。 但是，不要使用 `line` 和 `action` 方法来构造通知，而是使用 `markdown` 方法来指定应使用的 Markdown 模板的名称。 您希望提供给模板的数据数组可以作为方法的第二个参数传递：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->subject('Invoice Paid')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }

<a name="writing-the-message"></a>
### 写信息

Markdown 邮件通知使用 Blade 组件和 Markdown 语法的组合，允许您在利用 Laravel 预先制作的通知组件的同时轻松构建通知：

```blade
@component('mail::message')
# 已付发票

您的发票已支付！

@component('mail::button', ['url' => $url])
查看发票
@endcomponent

谢谢，<br>
{{ config('app.name') }}
@endcomponent
```

<a name="button-component"></a>
#### 按钮组件

按钮组件呈现居中的按钮链接。 该组件接受两个参数，一个 `url` 和一个可选的 `color`。 支持的颜色是`primary`、`green`和`red`。 您可以根据需要向通知中添加任意数量的按钮组件：

```blade
@component('mail::button', ['url' => $url, 'color' => 'green'])
查看发票
@endcomponent
```



<a name="panel-component"></a>
#### 面板组件

面板组件在面板中呈现给定的文本块，该面板的背景颜色与通知的其余部分略有不同。这使您可以引起对给定文本块的注意：

```blade
@component('mail::panel')
这是面板内容。
@endcomponent
```

<a name="table-component"></a>
#### 表组件

表格组件允许您将 Markdown 表格转换为 HTML 表格。 该组件接受 Markdown 表作为其内容。 使用默认的 Markdown 表格对齐语法支持表格列对齐：

```blade
@component('mail::table')
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
@endcomponent
```

<a name="customizing-the-components"></a>
### 自定义组件

您可以将所有 Markdown 通知组件导出到您自己的应用程序以进行自定义。要导出组件，请使用 `vendor:publish` Artisan 命令发布 `laravel-mail` 资产标签：

```shell
php artisan vendor:publish --tag=laravel-mail
```

此命令会将 Markdown 邮件组件发布到 `resources/views/vendor/mail` 目录。 `mail` 目录将包含一个 `html` 和一个 `text` 目录，每个目录都包含它们各自对每个可用组件的表示。 您可以随意自定义这些组件。

<a name="customizing-the-css"></a>
#### 自定义 CSS

导出组件后，`resources/views/vendor/mail/html/themes` 目录将包含一个 `default.css` 文件。 您可以自定义此文件中的 CSS，您的样式将自动内联在您的 Markdown 通知的 HTML 表示中。

如果你想为 Laravel 的 Markdown 组件构建一个全新的主题，你可以在 `html/themes` 目录中放置一个 CSS 文件。命名并保存 CSS 文件后，更新 `mail` 配置文件的 `theme` 选项以匹配新主题的名称。



要为单个通知自定义主题，您可以在构建通知的邮件消息时调用 `theme` 方法。 `theme` 方法接受发送通知时应该使用的主题名称：

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->theme('invoice')
                    ->subject('Invoice Paid')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }

<a name="database-notifications"></a>
## 数据库通知

<a name="database-prerequisites"></a>
### 必要条件

`database` 通知通道将通知信息存储在数据库表中。此表将包含通知类型等信息以及描述通知的 JSON 数据结构。

您可以查询该表以在应用程序的用户界面中显示通知。但是，在您这样做之前，您需要创建一个数据库表来保存您的通知。您可以使用 `notifications:table` 命令生成具有正确表模式的 [migration](/docs/laravel/9.x/migrations)：

```shell
php artisan notifications:table

php artisan migrate
```

<a name="formatting-database-notifications"></a>
### 格式化数据库通知

如果通知支持存储在数据库表中，则应在通知类上定义 `toDatabase` 或 `toArray` 方法。这个方法将接收一个 `$notifiable` 实体并且应该返回一个普通的 PHP 数组。 返回的数组将被编码为 JSON 并存储在 `notifications` 表的 `data` 列中。让我们看一个示例 `toArray` 方法：

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ];
    }



<a name="todatabase-vs-toarray"></a>
#### `toDatabase` 对比 `toArray`

`broadcast` 通道也使用 `toArray` 方法来确定将哪些数据广播到 JavaScript 驱动的前端。如果您想为 `database` 和 `broadcast` 通道提供两种不同的数组表示，您应该定义一个 `toDatabase` 方法而不是 `toArray` 方法。

<a name="accessing-the-notifications"></a>
### 访问通知

一旦通知存储在数据库中，您需要一种方便的方式从您的通知实体访问它们。 `Illuminate\Notifications\Notifiable` trait 包含在 Laravel 的默认 `App\Models\User` 模型中，包括一个 `notifications` [Eloquent 关系](/docs/laravel/9.x/eloquent-relationships)，它返回 实体的通知。要获取通知，您可以像访问任何其他 Eloquent 关系一样访问此方法。默认情况下，通知将按 `created_at` 时间戳排序，最近的通知位于集合的开头：

    $user = App\Models\User::find(1);

    foreach ($user->notifications as $notification) {
        echo $notification->type;
    }

如果您只想检索「未读」通知，可以使用 `unreadNotifications` 关系。同样，这些通知将按`created_at`时间戳排序，最近的通知位于集合的开头：

    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        echo $notification->type;
    }

> 技巧：要从 JavaScript 客户端访问通知，您应该为应用程序定义一个通知控制器，该控制器返回通知实体的通知，例如当前用户。 然后，您可以从 JavaScript 客户端向该控制器的 URL 发出 HTTP 请求。



<a name="marking-notifications-as-read"></a>
### 将通知标记为已读

通常，您希望在用户查看通知时将其标记为“已读”。 `Illuminate\Notifications\Notifiable` trait 提供了 `markAsRead` 方法，它更新通知数据库记录中的 `read_at` 列：

    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        $notification->markAsRead();
    }

但是，您可以直接在通知集合上使用 `markAsRead` 方法，而不是循环遍历每个通知：

    $user->unreadNotifications->markAsRead();

您还可以使用批量更新查询将所有通知标记为已读，而无需从数据库中检索它们：

    $user = App\Models\User::find(1);

    $user->unreadNotifications()->update(['read_at' => now()]);

您可以 `delete` 通知以将它们从表中完全删除：

    $user->notifications()->delete();

<a name="broadcast-notifications"></a>
## 广播通知

<a name="broadcast-prerequisites"></a>
### 必要条件

在广播通知之前，您应该配置并熟悉 Laravel 的 [事件广播](/docs/laravel/9.x/broadcasting) 服务。事件广播提供了一种从 JavaScript 驱动的前端对服务器端 Laravel 事件做出反应的方法。

<a name="formatting-broadcast-notifications"></a>
### 格式化广播通知

`broadcast` 频道使用 Laravel 的 [事件广播](/docs/laravel/9.x/broadcasting) 服务广播通知，允许您的 JavaScript 驱动的前端实时捕获通知。如果通知支持广播，您可以在通知类上定义一个 `toBroadcast` 方法。此方法将接收一个 `$notifiable` 实体并应返回一个 `BroadcastMessage` 实例。如果 `toBroadcast` 方法不存在，`toArray` 方法将用于收集应该广播的数据。返回的数据将被编码为 JSON 并广播到您的 JavaScript 驱动的前端。让我们看一个示例 `toBroadcast` 方法：

    use Illuminate\Notifications\Messages\BroadcastMessage;

    /**
     * Get the broadcastable representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ]);
    }



<a name="broadcast-queue-configuration"></a>
#### 广播队列配置

所有广播通知都排队等待广播。如果您想配置用于排队广播操作的队列连接或队列名称，您可以使用 `BroadcastMessage` 的 `onConnection` 和 `onQueue` 方法：

    return (new BroadcastMessage($data))
                    ->onConnection('sqs')
                    ->onQueue('broadcasts');

<a name="customizing-the-notification-type"></a>
#### 自定义通知类型

除了您指定的数据外，所有广播通知还有一个 `type` 字段，其中包含通知的完整类名。如果你想自定义通知的 `type`，你可以在通知类上定义一个`broadcastType`方法：

    use Illuminate\Notifications\Messages\BroadcastMessage;

    /**
     * 获取正在广播的通知的类型。
     *
     * @return string
     */
    public function broadcastType()
    {
        return 'broadcast.message';
    }

<a name="listening-for-notifications"></a>
### 监听通知

通知将在使用 `{notifiable}.{id}` 约定格式化的私人频道上广播。因此，如果您要向 ID 为 1 的 App\Models\User 实例发送通知，则通知将在 `App.Models.User.1` 私有频道上广播。使用 [Laravel Echo](/docs/laravel/9.x/broadcasting#client-side-installation) 时，您可以使用 `notification` 方法轻松地监听频道上的通知：

    Echo.private('App.Models.User.' + userId)
        .notification((notification) => {
            console.log(notification.type);
        });

<a name="customizing-the-notification-channel"></a>
#### 自定义通知通道

如果你想自定义一个实体的广播通知在哪个频道上广播，你可以在通知实体上定义一个`receivesBroadcastNotificationsOn`方法：

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
         *
         * @return string
         */
        public function receivesBroadcastNotificationsOn()
        {
            return 'users.'.$this->id;
        }
    }



<a name="sms-notifications"></a>
## 短信通知

<a name="sms-prerequisites"></a>
### 必要条件

在 Laravel 中发送 SMS 通知由 [Vonage](https://www.vonage.com/)（以前称为 Nexmo）提供支持。在通过 Vonage 发送通知之前，您需要安装 `laravel/vonage-notification-channel` 和 `guzzlehttp/guzzle` 包：

    composer require laravel/vonage-notification-channel guzzlehttp/guzzle

该软件包包括一个[配置文件]（https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php）。 但是，您不需要将此配置文件导出到您自己的应用程序。您可以简单地使用 `VONAGE_KEY` 和 `VONAGE_SECRET` 环境变量来定义您的 Vonage 公钥和密钥。

定义好密钥后，您可以设置一个 `VONAGE_SMS_FROM` 环境变量，该变量定义了您的 SMS 消息默认发送的电话号码。您可以在 Vonage 控制面板中生成此电话号码：

    VONAGE_SMS_FROM=15556666666

<a name="formatting-sms-notifications"></a>
### 格式化短信通知

如果通知支持作为 SMS 发送，您应该在通知类上定义一个 `toVonage` 方法。此方法将接收一个 `$notifiable` 实体并应返回一个 `Illuminate\Notifications\Messages\VonageMessage` 实例：

    /**
     * 获取通知的 Vonage / SMS 表示。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\VonageMessage
     */
    public function toVonage($notifiable)
    {
        return (new VonageMessage)
                    ->content('Your SMS message content');
    }

<a name="unicode-content"></a>
#### 统一码内容

如果您的 SMS 消息将包含 unicode 字符，则应在构造 `VonageMessage` 实例时调用 `unicode` 方法：

    /**
     * 获取通知的Vonage/SMS表示形式。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\VonageMessage
     */
    public function toVonage($notifiable)
    {
        return (new VonageMessage)
                    ->content('Your unicode message')
                    ->unicode();
    }



<a name="customizing-the-from-number"></a>
### 自定义“发件人”号码

如果您想从与您的 `VONAGE_SMS_FROM` 环境变量指定的电话号码不同的电话号码发送一些通知，您可以在 `VonageMessage` 实例上调用 `from` 方法：

    /**
     * 获取通知的 Vonage / SMS 表示。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\VonageMessage
     */
    public function toVonage($notifiable)
    {
        return (new VonageMessage)
                    ->content('您的短信内容')
                    ->from('15554443333');
    }

<a name="adding-a-client-reference"></a>
### 添加客户参考

如果您想跟踪每个用户、团队或客户的成本，您可以在通知中添加「客户参考」。 Vonage 将允许您使用此客户端参考生成报告，以便您更好地了解特定客户的 SMS 使用情况。 客户端引用可以是最多 40 个字符的任何字符串：

    /**
     * 获取通知的Vonage/SMS表示形式。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\VonageMessage
     */
    public function toVonage($notifiable)
    {
        return (new VonageMessage)
                    ->clientReference((string) $notifiable->id)
                    ->content('您的短信内容');
    }

<a name="routing-sms-notifications"></a>
### 路由短信通知

要将Vonage通知路由到正确的电话号码，请在您的应报告实体上定义“routeNotificationForVonage”方法：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Vonage频道的路由通知。
         *
         * @param  \Illuminate\Notifications\Notification  $notification
         * @return string
         */
        public function routeNotificationForVonage($notification)
        {
            return $this->phone_number;
        }
    }

<a name="slack-notifications"></a>
## 延迟通知

<a name="slack-prerequisites"></a>


### 必要条件

在您可以通过 Slack 发送通知之前，您必须通过 Composer 安装 Slack 通知通道：

```shell
composer require laravel/slack-notification-channel
```

您还需要为您的团队创建一个 [Slack 应用程序](https://api.slack.com/apps?new_app=1)。 创建应用程序后，您应该为工作区配置一个「传入 Webhook」。 然后，Slack 将为您提供一个 webhook URL，您可以在 [路由 Slack 通知](#routing-slack-notifications) 时使用该 URL。

<a name="formatting-slack-notifications"></a>
### 格式化 Slack 通知

如果通知支持作为 Slack 消息发送，则应在通知类上定义 `toSlack` 方法。此方法将接收一个 `$notifiable` 实体并应返回一个 `Illuminate\Notifications\Messages\SlackMessage` 实例。 Slack 消息可能包含文本内容以及格式化附加文本或字段数组的“附件”。 让我们看一个基本的 `toSlack` 示例：

    /**
     * 获取通知的 Slack 表示。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\SlackMessage
     */
    public function toSlack($notifiable)
    {
        return (new SlackMessage)
                    ->content('One of your invoices has been paid!');
    }

<a name="slack-attachments"></a>
### Slack 附件

您还可以在邮件中添加「附件」。附件提供了比简单文本消息更丰富的格式选项。在本例中，我们将发送一个有关应用程序中发生的异常的错误通知，其中包括一个链接，用于查看有关该异常的更多详细信息：

    /**
     * 获取通知的Slake表示形式。
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\SlackMessage
     */
    public function toSlack($notifiable)
    {
        $url = url('/exceptions/'.$this->exception->id);

        return (new SlackMessage)
                    ->error()
                    ->content('哎呀！ 有些不对劲。')
                    ->attachment(function ($attachment) use ($url) {
                        $attachment->title('Exception: 找不到文件', $url)
                                   ->content('File [background.jpg] 没有找到。');
                    });
    }



附件还允许您指定应呈现给用户的数据数组。 给定的数据将以表格形式呈现，以便于阅读：

    /**
     * 获取通知的 Slack 表现形式。
     *
     * @param  mixed  $notifiable
     * @return SlackMessage
     */
    public function toSlack($notifiable)
    {
        $url = url('/invoices/'.$this->invoice->id);

        return (new SlackMessage)
                    ->success()
                    ->content('One of your invoices has been paid!')
                    ->attachment(function ($attachment) use ($url) {
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

如果您的某些附件字段包含 Markdown，您可以使用 `markdown` 方法指示 Slack 将给定的附件字段解析并显示为 Markdown 格式的文本。 此方法接受的值是：`pretext`、`text` 和/或`fields`。 有关 Slack 附件格式的更多信息，请查看 [Slack API 文档](https://api.slack.com/docs/message-formatting#message_formatting)：

    /**
     * 获取通知的 Slack 表示。
     *
     * @param  mixed  $notifiable
     * @return SlackMessage
     */
    public function toSlack($notifiable)
    {
        $url = url('/exceptions/'.$this->exception->id);

        return (new SlackMessage)
                    ->error()
                    ->content('哎呀！ 有些不对劲。')
                    ->attachment(function ($attachment) use ($url) {
                        $attachment->title('Exception: 文件未找到', $url)
                                   ->content('File [background.jpg] was *not found*.')
                                   ->markdown(['text']);
                    });
    }

<a name="routing-slack-notifications"></a>
### 路由 Slack 通知

要将 Slack 通知路由到适当的 Slack 团队和频道，请在您的通知实体上定义一个 `routeNotificationForSlack` 方法。这应该返回通知应该发送到的 webhook URL。可以通过向您的 Slack 团队添加「传入 Webhook」服务来生成 Webhook URL：

    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 路由 Slack 频道的通知。
         *
         * @param  \Illuminate\Notifications\Notification  $notification
         * @return string
         */
        public function routeNotificationForSlack($notification)
        {
            return 'https://hooks.slack.com/services/...';
        }
    }



<a name="localizing-notifications"></a>
## 本地化通知

Laravel 允许您在 HTTP 请求的当前语言环境之外的语言环境中发送通知，如果通知在排队，它甚至会记住这个语言环境。

为此，`Illuminate\Notifications\Notification` 类提供了一个 `locale` 方法来设置所需的语言。应用程序将在评估通知时更改为此区域设置，然后在评估完成后恢复为先前的区域设置：

    $user->notify((new InvoicePaid($invoice))->locale('es'));

多个通知条目的本地化也可以通过 `Notification` 门面实现：

    Notification::locale('es')->send(
        $users, new InvoicePaid($invoice)
    );

<a name="user-preferred-locales"></a>
### 用户首选语言环境

有时，应用程序存储每个用户的首选语言环境。通过在你的通知模型上实现 `HasLocalePreference` 合约，你可以指示 Laravel 在发送通知时使用这个存储的语言环境：

    use Illuminate\Contracts\Translation\HasLocalePreference;

    class User extends Model implements HasLocalePreference
    {
        /**
         * 获取用户的首选语言环境。
         *
         * @return string
         */
        public function preferredLocale()
        {
            return $this->locale;
        }
    }

一旦你实现了接口，Laravel 将在向模型发送通知和邮件时自动使用首选语言环境。因此，使用该接口时无需调用 `locale` 方法：

    $user->notify(new InvoicePaid($invoice));

<a name="notification-events"></a>
## 通知事件

<a name="notification-sending-event"></a>
#### 通知发送事件

发送通知时，通知系统会调度 `Illuminate\Notifications\Events\NotificationSending` [event](/docs/laravel/9.x/events)。 这包含“可通知”实体和通知实例本身。您可以在应用程序的 `EventServiceProvider` 中为此事件注册监听器：

    /**
     * 应用程序的事件监听器映射。
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Notifications\Events\NotificationSending' => [
            'App\Listeners\CheckNotificationStatus',
        ],
    ];



如果 `NotificationSending` 事件的事件侦听器从其 `handle` 方法返回 `false`，则不会发送通知：

    use Illuminate\Notifications\Events\NotificationSending;

    /**
     * 处理事件。
     *
     * @param  \Illuminate\Notifications\Events\NotificationSending  $event
     * @return void
     */
    public function handle(NotificationSending $event)
    {
        return false;
    }

在事件侦听器中，您可以访问事件的 `notifiable`、`notification` 和 `channel` 属性，以了解有关通知接收者或通知本身的更多信息：

    /**
     * 处理事件。
     *
     * @param  \Illuminate\Notifications\Events\NotificationSending  $event
     * @return void
     */
    public function handle(NotificationSending $event)
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
    }

<a name="notification-sent-event"></a>
#### 通知发送事件

发送通知时，通知系统会调度 `Illuminate\Notifications\Events\NotificationSent` [event](/docs/laravel/9.x/events)。这包含「可通知」实体和通知实例本身。您可以在 `EventServiceProvider` 中为此事件注册监听器：

    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Notifications\Events\NotificationSent' => [
            'App\Listeners\LogNotification',
        ],
    ];

> 技巧：在您的 `EventServiceProvider` 中注册监听器后，使用 `event:generate` Artisan 命令快速生成监听器类。

在事件侦听器中，您可以访问事件的 `notifiable`、`notification`、`channel` 和 `response` 属性，以了解有关通知接收者或通知本身的更多信息：

    /**
     * 处理事件。
     *
     * @param  \Illuminate\Notifications\Events\NotificationSent  $event
     * @return void
     */
    public function handle(NotificationSent $event)
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
        // $event->response
    }

<a name="custom-channels"></a>
## 自定义频道

Laravel 附带了一些通知通道，但你可能想编写自己的驱动程序来通过其他通道传递通知。 Laravel 让它变得简单。首先，定义一个包含 `send` 方法的类。该方法应该接收两个参数：一个`$notifiable`和一个`$notification`。



在 `send` 方法中，您可以调用通知上的方法来检索您的频道可以理解的消息对象，然后将通知发送到 `$notifiable` 实例，但是您希望：

    <?php

    namespace App\Notifications;

    use Illuminate\Notifications\Notification;

    class VoiceChannel
    {
        /**
         * 发送给定的通知。
         *
         * @param  mixed  $notifiable
         * @param  \Illuminate\Notifications\Notification  $notification
         * @return void
         */
        public function send($notifiable, Notification $notification)
        {
            $message = $notification->toVoice($notifiable);

            // 向 $notifiable 实例发送通知...
        }
    }

一旦定义了通知通道类，您可以从任何通知的 `via` 方法返回类名。在此示例中，通知的 `toVoice` 方法可以返回您选择表示语音消息的任何对象。例如，您可以定义自己的 `VoiceMessage` 类来表示这些消息：

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
         * 获取通知频道。
         *
         * @param  mixed  $notifiable
         * @return array|string
         */
        public function via($notifiable)
        {
            return [VoiceChannel::class];
        }

        /**
         * 获取通知的语音表示。
         *
         * @param  mixed  $notifiable
         * @return VoiceMessage
         */
        public function toVoice($notifiable)
        {
            // ...
        }
    }

