# 邮件

- [介绍](#introduction)
    - [配置](#configuration)
    - [驱动前提](#driver-prerequisites)
    - [故障转移配置](#failover-configuration)
- [生成 Mailables](#generating-mailables)
- [编写 Mailables](#writing-mailables)
    - [配置发送者](#configuring-the-sender)
    - [配置视图](#configuring-the-view)
    - [视图数据](#view-data)
    - [附件](#attachments)
    - [内部附件](#inline-attachments)
    - [可附着对象](#attachable-objects)
    - [标头](#headers)
    - [标记和元数据](#tags-and-metadata)
    - [自定义 Symfony 消息](#customizing-the-symfony-message)
- [Markdown 格式邮件](#markdown-mailables)
    - [生成 Markdown 格式邮件](#generating-markdown-mailables)
    - [生成 Markdown 格式邮件](#writing-markdown-messages)
    - [自定义组件](#customizing-the-components)
- [发送邮件](#sending-mail)
    - [邮件队列](#queueing-mail)
- [渲染邮件](#rendering-mailables)
    - [浏览器中预览邮件](#previewing-mailables-in-the-browser)
- [邮件本土化](#localizing-mailables)
- [测试邮件](#testing-mailables)
    - [测试邮件内容](#testing-mailable-content)
    - [测试邮件发送](#testing-mailable-sending)
- [邮件和本地开发](#mail-and-local-development)
- [事件](#events)
- [自定义传输方式](#custom-transports)
    - [附 - Symfony 传输方式](#additional-symfony-transports)

<a name="introduction"></a>
## 介绍

发送邮件并不复杂。Laravel 基于 [Symfony Mailer](https://symfony.com/doc/6.0/mailer.html) 组件提供了一个简洁、简单的邮件 API。Laravel 和 Symfony 为 Mailer SMTP 、Mailgun 、Postmark 、 Amazon SES 、 及 sendmail （发送邮件的方式）提供驱动，允许你通过本地或者云服务来快速发送邮件。

<a name="configuration"></a>
### 配置

Laravel 的邮件服务可以通过 `config/mail.php` 配置文件进行配置。邮件中的每一项都在配置文件中有单独的配置项，甚至是独有的「传输方式」，允许你的应用使用不同的邮件服务发送邮件。例如，你的应用程序在使用 Amazon SES 发送批量邮件时，也可以使用 Postmark 发送事务性邮件。

在你的 `mail` 配置文件中，你将找到 `mailers` 配置数组。该数组包含 Laravel 支持的每个邮件 驱动程序 / 传输方式 配置，而 `default` 配置值确定当你的应用程序需要发送电子邮件时，默认情况下将使用哪个邮件驱动。

<a name="driver-prerequisites"></a>
### 驱动 / 传输的前提

基于 API 的驱动，如 Mailgun 和 Postmark ，通常比 SMTP 服务器更简单快速。如果可以的话， 我们建议你使用下面这些驱动。

<a name="mailgun-driver"></a>
#### Mailgun 驱动

要使用 Mailgun 驱动，可以先通过 `composer` 来安装 `Mailgun` 函数库 ：

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

接着，在应用的 `config/mail.php` 配置文件中，将默认项设置成 `mailgun`。配置好之后，确认 `config/services.php` 配置文件中包含以下选项：

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
    ],

如果不使用 US [Mailgun region](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions) 区域终端 ，你需要在 `service` 文件中配置区域终端：

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    ],

<a name="postmark-driver"></a>
#### Postmark 驱动

要使用 `Postmark` 驱动，先通过 `composer` 来安装 `Postmark` 函数库：

```shell
composer require symfony/postmark-mailer symfony/http-client
```

接着，在应用的 `config/mail.php` 配置文件中，将默认项设置成 `postmark`。配置好之后，确认 `config/services.php` 配置文件中包含如下选项：

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

如果你要给指定邮件程序使用的 Postmark message stream，可以在配置数组中添加 `message_stream_id` 配置选项。这个配置数组在应用程序的 config/mail.php 配置文件中：

    'postmark' => [
        'transport' => 'postmark',
        'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    ],

这样，你还可以使用不同的 `message stream` 来设置多个 `Postmark 邮件驱动`。

<a name="ses-driver"></a>
#### SES 驱动

要使用 `Amazon SES` 驱动，你必须先安装 `PHP` 的 `Amazon AWS SDK` 。你可以可以通过 Composer 软件包管理器安装此库：

```shell
composer require aws/aws-sdk-php
```

然后，将 `config/mail.php` 配置文件的 `default` 选项设置成 `ses` 并确认你的 `config/services.php` 配置文件包含以下选项：

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

为了通过 session token 来使用 AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) ，你需要向应用的 SES 配置中添加一个 `token` 键：

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'token' => env('AWS_SESSION_TOKEN'),
    ],

发送邮件，如果你想传递一些 [额外的选项](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) 给 AWS SDK 的 `SendEmail` 方法，你可以在 `ses` 配置中定义一个 `options` 数组：

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'options' => [
            'ConfigurationSetName' => 'MyConfigurationSet',
            'EmailTags' => [
                ['Name' => 'foo', 'Value' => 'bar'],
            ],
        ],
    ],

<a name="failover-configuration"></a>
### 备用配置

有时，已经配置好用于发送应用程序邮件的外部服务可能已关闭。在这种情况下，定义一个或多个备份邮件传递配置非常有用，这些配置将在主传递驱动程序关闭时使用。
为此，应该在应用程序的 `mail` 配置文件中定义一个使用 `failover` 传输的邮件程序。应用程序的 `failover` 邮件程序的配置数组应包含一个 `mailers` 数组，该数组引用选择邮件驱动程序进行传递的顺序：

    'mailers' => [
        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'postmark',
                'mailgun',
                'sendmail',
            ],
        ],

        // ...
    ],

定义故障转移邮件程序后，应将此邮件程序设置为应用程序使用的`默认`邮件程序，方法是将其名称指定为应用程序 `mail` 配置文件中 `default` 配置密钥的值：

    'default' => env('MAIL_MAILER', 'failover'),

<a name="generating-mailables"></a>
## 生成 Mailables

在构建 Laravel 应用程序时，应用程序发送的每种类型的电子邮件都表示为一个 `mailable` 类。这些类存储在 app/Mail 目录中。 如果你在应用程序中看不到此目录，请不要担心，因为它会在你使用 make:mail Artisan 命令创建第一个邮件类时自然生成：

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 编写 Mailables

一旦生成了一个邮件类，就打开它，这样我们就可以探索它的内容。邮件类的配置可以通过几种方法完成，包括 `envelope`、`content` 和 `attachments` 方法。

 `envelope` 方法返回 `Illuminate\Mail\Mailables\Envelope` 对象，该对象定义邮件的主题，有时还定义邮件的收件人。`content` 方法返回 `Illuminate\Mail\Mailables\Content` 对象，该对象定义将用于生成消息内容的[Blade模板](/docs/laravel/10.x/blade)。

<a name="configuring-the-sender"></a>
### 配置发件人

<a name="using-the-envelope"></a>
#### 使用 Envelope

首先，让我们来看下如何配置电子邮件的发件人。电子邮件的「发件人」。有两种方法可以配置发送者。首先，你可以在邮件信封上指定「发件人」地址：

    use Illuminate\Mail\Mailables\Address;
    use Illuminate\Mail\Mailables\Envelope;

    /**
     * 获取邮件信封。
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('jeffrey@example.com', 'Jeffrey Way'),
            subject: '订单发货',
        );
    }

除此之外，还可以指定 `replyTo` 地址：

    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        replyTo: [
            new Address('taylor@example.com', 'Taylor Otwell'),
        ],
        subject: '订单发货',
    );

<a name="using-a-global-from-address"></a>
#### 使用全局 `from` 地址

当然，如果你的应用在任何邮件中使用的「发件人」地址都一致的话，在你生成的每一个 mailable 类中调用 `from` 方法可能会很麻烦。因此，你可以在 `config/mail.php` 文件中指定一个全局的「发件人」地址。当某个 mailable 类没有指定「发件人」时，它将使用该全局「发件人」：

    'from' => ['address' => 'example@example.com', 'name' => 'App Name'],

此外，你可以在 `config/mail.php` 配置文件中定义全局 「reply_to」 地址：

    'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],

<a name="configuring-the-view"></a>
### 配置视图

在邮件类下的 `content` 方法中使用 `view` 方法来指定在渲染邮件内容时要使用的模板。由于每封电子邮件通常使用一个 [Blade 模板](/docs/laravel/10.x/blade) 来渲染其内容。因此在构建电子邮件的 HTML 时，可以充分利用 Blade 模板引擎的功能和便利性：

    /**
     * 获取消息内容定义。
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.shipped',
        );
    }

> **技巧**
> 你可以创建一个 `resources/views/emails` 目录来存放所有的邮件模板；当然，也可以将其置于 `resources/views` 目录下的任何位置。

<a name="plain-text-emails"></a>
#### 纯文本邮件

如果要定义电子邮件的纯文本版本，可以在创建邮件的 `Content` 定义时指定纯文本模板。与 `view` 参数一样， `text` 参数是用于呈现电子邮件内容的模板名称。这样你就可以自由定义邮件的 Html 和纯文本版本：

    /**
     * 获取消息内容定义。
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.shipped',
            text: 'emails.orders.shipped-text'
        );
    }

为了清晰，`html` 参数可以用作 `view` 参数的别名：

    return new Content(
        html: 'emails.orders.shipped',
        text: 'emails.orders.shipped-text'
    );

<a name="view-data"></a>
### 视图数

<a name="via-public-properties"></a>
#### 通过 Public 属性

通常，你需要将一些数据传递给视图，以便在呈现电子邮件的 HTML 时使用。有两种方法可以使数据对视图可用。首先，在 mailable 类上定义的任何公共属性都将自动对视图可用。例如，可以将数据传递到可邮寄类的构造函数中，并将该数据设置为类上定义的公共方法：

    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Mail\Mailables\Content;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * 创建新的消息实例。
         */
        public function __construct(
            public Order $order,
        ) {}

        /**
         * 获取消息内容定义。
         */
        public function content(): Content
        {
            return new Content(
                view: 'emails.orders.shipped',
            );
        }
    }

一旦数据设置为公共属性，它将自动在视图中可用，因此可以像访问 Blade 模板中的任何其他数据一样访问它：

    <div>
        Price: {{ $order->price }}
    </div>

<a name="via-the-with-parameter"></a>
#### 通过 `with` 参数：

如果你想要在邮件数据发送到模板前自定义它们的格式，你可以使用 `with` 方法来手动传递数据到视图中。一般情况下，你还是需要通过 mailable 类的构造函数来传递数据；不过，你应该将它们定义为 `protected` 或 `private` 以防止它们被自动传递到视图中。然后，在调用 `with` 方法的时候，可以以数组的形式传递你想要传递给模板的数据：

    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Mail\Mailables\Content;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * 创建新的消息实例。
         */
        public function __construct(
            protected Order $order,
        ) {}

        /**
         * 获取消息内容定义。
         */
        public function content(): Content
        {
            return new Content(
                view: 'emails.orders.shipped',
                with: [
                    'orderName' => $this->order->name,
                    'orderPrice' => $this->order->price,
                ],
            );
        }
    }

一旦数据被传递到 `with` 方法，同样的它将自动在视图中可用，因此可以像访问 Blade 模板中的任何其他数据一样访问它：

    <div>
        Price: {{ $orderPrice }}
    </div>

<a name="attachments"></a>
### 附件

要向电子邮件添加附件，你将向邮件的 `attachments` 方法返回的数组添加附件。首先，可以通过向 `Attachment` 类提供的 `fromPath` 方法提供文件路径来添加附件：

    use Illuminate\Mail\Mailables\Attachment;

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/file'),
        ];
    }

将文件附加到邮件时，还可以使用 `as` 和 `withMime` 方法来指定附件的显示名称 / 或 MIME 类型：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }

<a name="attaching-files-from-disk"></a>
#### 从磁盘中添加附件

如果你已经在 [文件存储](/docs/laravel/10.x/filesystem) 上存储了一个文件，则可以使用 `attachFromStorage` 方法将其附加到邮件中：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file'),
        ];
    }

当然，也可以指定附件的名称和 MIME 类型：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }

如果需要指定默认磁盘以外的存储磁盘，可以使用 `attachFromStorageDisk` 方法：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('s3', '/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }

<a name="raw-data-attachments"></a>
#### 原始数据附件

`fromData` 附件方法可用于附加原始字节字符串作为附件。例如，如果你在内存中生成了PDF，并且希望将其附加到电子邮件而不将其写入磁盘，可以使用到此方法。 `fromData` 方法接受一个闭包，该闭包解析原始数据字节以及应分配给附件的名称：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
                    ->withMime('application/pdf'),
        ];
    }

<a name="inline-attachments"></a>
### 内联附件

在邮件中嵌入内联图片通常很麻烦；不过，Laravel 提供了一种将图像附加到邮件的便捷方法。可以使用邮件模板中 $message 变量的 embed 方法来嵌入内联图片。Laravel 自动使 $message 变量在全部邮件模板中可用，不需要担心手动传递它：

```blade
<body>
    这是一张图片：

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> **注意**
> 该 `$message` 在文本消息中不可用，因为文本消息不能使用内联附件。

<a name="embedding-raw-data-attachments"></a>
#### 嵌入原始数据附件

如果你已经有了可以嵌入邮件模板的原始图像数据字符串，可以使用 `$message` 变量的 `embedData` 方法，当调用 `embedData` 方法时，需要传递一个文件名：

```blade
<body>
    以下是原始数据的图像：

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### 可附着对象

虽然通过简单的字符串路径将文件附加到消息通常就足够了，但在多数情况下，应用程序中的可附加实体由类表示。例如，如果你的应用程序正在将照片附加到消息中，那么在应用中可能还具有表示该照片的 `Photo` 模型。在这种情况下，简单地将 `Photo` 模型传递给 `attach` 方法会很方便。

开始时，在可附加到邮件的对象上实现 `Illuminate\Contracts\Mail\Attachable` 接口。此接口要求类定义一个 `toMailAttachment` 方法，该方法返回一个 `Illuminate\Mail\Attachment` 实例：

    <?php

    namespace App\Models;

    use Illuminate\Contracts\Mail\Attachable;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Mail\Attachment;

    class Photo extends Model implements Attachable
    {
        /**
         * 获取模型的可附加表示。
         */
        public function toMailAttachment(): Attachment
        {
            return Attachment::fromPath('/path/to/file');
        }
    }

一旦定义了可附加对象，就可以在生成电子邮件时从 `attachments` 方法返回该对象的实例：

    /**
     * 获取邮件的附件。
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [$this->photo];
    }

当然，附件数据可以存储在远程文件存储服务（例如 Amazon S3）上。因此，Laravel 还允许你从存储在应用程序 [文件系统磁盘](/docs/laravel/10.x/filesystem) 上的数据生成附件实例：

    // 从默认磁盘上的文件创建附件。。。
    return Attachment::fromStorage($this->path);

    // 从特定磁盘上的文件创建附件。。。
    return Attachment::fromStorageDisk('backblaze', $this->path);

此外，还可以通过内存中的数据创建附件实例。为此还提供了 `fromData` 方法的闭包。但闭包应返回表示附件的原始数据：

    return Attachment::fromData(fn () => $this->content, 'Photo Name');

Laravel 还提供了其他方法，你可以使用这些方法自定义附件。例如，可以使用 `as` 和 `withMime` 方法自定义文件名和 MIME 类型：

    return Attachment::fromPath('/path/to/file')
            ->as('Photo Name')
            ->withMime('image/jpeg');

<a name="headers"></a>
### 标头

有时，你可能需要在传出消息中附加附加的标头。例如，你可能需要设置自定义 `Message-Id` 或其他任意文本标题。

如果要实现这一点，请在邮件中定义 `headers` 方法。 `headers` 方法应返回 `Illuminate\Mail\Mailables\Headers` 实例。此类接受 `messageId` 、 `references` 和 `text` 参数。当然，你可以只提供特定消息所需的参数：

    use Illuminate\Mail\Mailables\Headers;

    /**
     * 获取邮件标题。
     */
    public function headers(): Headers
    {
        return new Headers(
            messageId: 'custom-message-id@example.com',
            references: ['previous-message@example.com'],
            text: [
                'X-Custom-Header' => 'Custom Value',
            ],
        );
    }

<a name="tags-and-metadata"></a>
### 标记 和 元数据

一些第三方电子邮件提供商（如 Mailgun 和 Postmark ）支持消息「标签」和 「元数据」，可用于对应用程序发送的电子邮件进行分组和跟踪。你可以通过 `Envelope` 来定义向电子邮件添加标签和元数据：

    use Illuminate\Mail\Mailables\Envelope;

    /**
     * 获取邮件信封。
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '订单发货',
            tags: ['shipment'],
            metadata: [
                'order_id' => $this->order->id,
            ],
        );
    }

如果你的应用程序正在使用 Mailgun 驱动程序，你可以查阅 Mailgun 的文档以获取有关 [标签](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) 和 [元数据](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages) 的更多信息。同样，还可以查阅邮戳文档，了解其对 [标签](https://postmarkapp.com/blog/tags-support-for-smtp) 和 [元数据](https://postmarkapp.com/support/article/1125-custom-metadata-faq) 支持的更多信息

如果你的应用程序使用 Amazon SES 发送电子邮件，则应使用 `metadata` 方法将 [SES 「标签」](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html)附加到邮件中。

<a name="customizing-the-symfony-message"></a>
### 自定义 Symfony 消息

Laravel 的邮件功能是由 Symfony Mailer 提供的。Laravel 在你发送消息之前是由 Symfony Message 注册然后再去调用自定义实例。这让你有机会在发送邮件之前对其进行深度定制。为此，请在 `Envelope` 定义上定义 `using` 参数：


    use Illuminate\Mail\Mailables\Envelope;
    use Symfony\Component\Mime\Email;
    
    /**
     * 获取邮件信封。
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '订单发货',
            using: [
                function (Email $message) {
                    // ...
                },
            ]
        );
    }

<a name="markdown-mailables"></a>
## Markdown 格式邮件

Markdown 格式邮件允许你可以使用 mailable 中的预构建模板和 [邮件通知](/docs/laravel/10.x/notificationsmd#mail-notifications) 组件。由于消息是用 Markdown 编写，Laravel 能够渲染出美观的、响应式的 HTML 模板消息，同时还能自动生成纯文本副本。

<a name="generating-markdown-mailables"></a>
### 生成 Markdown 邮件

你可以在执行 `make:mail` 的 Artisan 命令时使用 `--markdown` 选项来生成一个 Markdown 格式模板的 mailable 类：

```shell
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
```

然后，在 `Content` 方法中配置邮寄的 `content` 定义时，使用 `markdown` 参数而不是 `view` 参数：

    use Illuminate\Mail\Mailables\Content;

    /**
     * 获取消息内容定义。
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.shipped',
            with: [
                'url' => $this->orderUrl,
            ],
        );
    }

<a name="writing-markdown-messages"></a>
### 编写 Markdown 邮件

Markdown mailable 类整合了 Markdown 语法和 Blade 组件，让你能够非常方便的使用 Laravel 预置的 UI 组件来构建邮件消息：

```blade
<x-mail::message>
# 订单发货

你的订单已发货！

<x-mail::button :url="$url">
查看订单
</x-mail::button>

谢谢,<br>
{{ config('app.name') }}
</x-mail::message>
```

> **技巧**
> 在编写 Markdown 邮件的时候，请勿使用额外的缩进。Markdown 解析器会把缩进渲染成代码块。

<a name="button-component"></a>
#### 按钮组件

按钮组件用于渲染居中的按钮链接。该组件接收两个参数，一个是 `url` 一个是可选的 `color`。 支持的颜色包括 `primary` ，`success` 和 `error`。你可以在邮件中添加任意数量的按钮组件：

```blade
<x-mail::button :url="$url" color="success">
查看订单
</x-mail::button>
```

<a name="panel-component"></a>
#### 面板组件

面板组件在面板内渲染指定的文本块，面板与其他消息的背景色略有不同。它允许你绘制一个警示文本块：

```blade
<x-mail::panel>
这是面板内容
</x-mail::panel>
```

<a name="table-component"></a>
#### 表格组件

表格组件允许你将 Markdown 表格转换成 HTML 表格。该组件接受 Markdown 表格作为其内容。列对齐支持默认的 Markdown 表格对齐语法：

```blade
<x-mail::table>
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### 自定义组件

你可以将所有 Markdown 邮件组件导出到自己的应用，用作自定义组件的模板。若要导出组件，使用 `laravel-mail` 资产标签的 `vendor:publish` Artisan 命令：

```shell
php artisan vendor:publish --tag=laravel-mail
```

此命令会将 Markdown 邮件组件导出到 `resources/views/vendor/mail` 目录。 该 `mail` 目录包含 `html` 和 `text` 子目录，分别包含各自对应的可用组件描述。你可以按照自己的意愿自定义这些组件。

<a name="customizing-the-css"></a>
#### 自定义 CSS

组件导出后，`resources/views/vendor/mail/html/themes` 目录有一个 `default.css` 文件。可以在此文件中自定义 CSS，这些样式将自动内联到 Markdown 邮件消息的 HTML 表示中。

如果想为 Laravel 的 Markdown 组件构建一个全新的主题，你可以在 `html/themes` 目录中新建一个 CSS 文件。命名并保存 CSS 文件后，并更新应用程序 `config/mail.php` 配置文件的 `theme` 选项以匹配新主题的名称。

要想自定义单个邮件主题，可以将 mailable 类的 `$theme` 属性设置为发送 mailable 时应使用的主题名称。

<a name="sending-mail"></a>
## 发送邮件

若要发送邮件，使用 `Mail` [facade](/docs/laravel/10.x/facades) 的方法。该 `to` 方法接受 邮件地址、用户实例或用户集合。如果传递一个对象或者对象集合，mailer 在设置收件人时将自动使用它们的 `email` 和 `name` 属性，因此请确保对象的这些属性可用。一旦指定了收件人，就可以将 mailable 类实例传递给 `send` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Mail\OrderShipped;
    use App\Models\Order;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Mail;

    class OrderShipmentController extends Controller
    {
        /**
         * 发送给定的订单信息。
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // 发货订单。。。

            Mail::to($request->user())->send(new OrderShipped($order));

            return redirect('/orders');
        }
    }

在发送消息时不止可以指定收件人。还可以通过链式调用「to」、「cc」、「bcc」一次性指定抄送和密送收件人：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->send(new OrderShipped($order));

<a name="looping-over-recipients"></a>
#### 遍历收件人列表

有时，你需要通过遍历一个收件人 / 邮件地址数组的方式，给一系列收件人发送邮件。但是，由于 `to` 方法会给 mailable 列表中的收件人追加邮件地址，因此，你应该为每个收件人重建 mailable 实例。

    foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
        Mail::to($recipient)->send(new OrderShipped($order));
    }

<a name="sending-mail-via-a-specific-mailer"></a>
#### 通过特定的 Mailer 发送邮件

默认情况下，Laravel 将使用 `mail` 你的配置文件中配置为 `default` 邮件程序。 但是，你可以使用 `mailer` 方法通过特定的邮件程序配置发送：

    Mail::mailer('postmark')
            ->to($request->user())
            ->send(new OrderShipped($order));

<a name="queueing-mail"></a>
### 邮件队列

<a name="queueing-a-mail-message"></a>
#### 将邮件消息加入队列

由于发送邮件消息可能大幅度延长应用的响应时间，许多开发者选择将邮件消息加入队列放在后台发送。Laravel 使用内置的 [统一队列 API](/docs/laravel/10.x/queues) 简化了这一工作。若要将邮件消息加入队列，可以在指定消息的接收者后，使用 `Mail` 门面的 `queue` 方法：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue(new OrderShipped($order));

此方法自动将作业推送到队列中以便消息在后台发送。使用此特性之前，需要 [配置队列](/docs/laravel/10.x/queues) 。

<a name="delayed-message-queueing"></a>
#### 延迟消息队列

想要延迟发送队列化的邮件消息，可以使用 `later` 方法。该 `later` 方法的第一个参数的第一个参数是标示消息何时发送的 `DateTime` 实例：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->later(now()->addMinutes(10), new OrderShipped($order));

<a name="pushing-to-specific-queues"></a>
#### 推送到指定队列

由于所有使用 `make:mail` 命令生成的 mailable 类都是用了 `Illuminate\Bus\Queueable` trait，因此你可以在任何 mailable 类实例上调用 `onQueue` 和 `onConnection` 方法来指定消息的连接和队列名：

    $message = (new OrderShipped($order))
                    ->onConnection('sqs')
                    ->onQueue('emails');

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue($message);

<a name="queueing-by-default"></a>
#### 默认队列

如果你希望你的邮件类始终使用队列，你可以给邮件类实现 `ShouldQueue` 契约，现在即使你调用了 `send` 方法，邮件依旧使用队列的方式发送

    use Illuminate\Contracts\Queue\ShouldQueue;

    class OrderShipped extends Mailable implements ShouldQueue
    {
        // ...
    }

<a name="queued-mailables-and-database-transactions"></a>
#### 队列的邮件和数据库事务

当在数据库事务中分发邮件队列时，队列可能在数据库事务提交之前处理邮件。 发生这种情况时，在数据库事务期间对模型或数据库记录所做的任何更新可能都不会反映在数据库中。另外，在事务中创建的任何模型或数据库记录都可能不存在于数据库中。如果你的邮件基于以上这些模型数据，则在处理邮件发送时，可能会发生意外错误。

如果队列连接的 `after_commit` 配置选项设置为 `false`，那么仍然可以通过在 mailable 类上定义 `afterCommit` 属性来设置提交所有打开的数据库事务之后再调度特定的邮件队列：

    Mail::to($request->user())->send(
        (new OrderShipped($order))->afterCommit()
    );

或者，你可以 `afterCommit` 从 mailable 的构造函数中调用该方法：

    <?php

    namespace App\Mail;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable implements ShouldQueue
    {
        use Queueable, SerializesModels;

        /**
         * 创建新的消息实例。
         */
        public function __construct()
        {
            $this->afterCommit();
        }
    }

> **技巧**
> 要了解有关解决这些问题的更多信息，请查看 [队列和数据库事物](/docs/laravel/10.x/queuesmd#jobs-and-database-transactions)。

<a name="rendering-mailables"></a>
## 渲染邮件

有时你可能希望捕获邮件的 HTML 内容而不发送它。为此，可以调用邮件类的 `render` 方法。此方法将以字符串形式返回邮件类的渲染内容:

    use App\Mail\InvoicePaid;
    use App\Models\Invoice;

    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))->render();

<a name="previewing-mailables-in-the-browser"></a>
### 在浏览器中预览邮件

设计邮件模板时，可以方便地在浏览器中预览邮件，就像典型的 Blade 模板一样。因此， Laravel 允许你直接从路由闭包或控制器返回任何邮件类。当邮件返回时，它将渲染并显示在浏览器中，允许你快速预览其设计，而无需将其发送到实际的电子邮件地址：

    Route::get('/mailable', function () {
        $invoice = App\Models\Invoice::find(1);

        return new App\Mail\InvoicePaid($invoice);
    });

> **注意**
> 在浏览器中预览邮件时，不会呈现 [内联附件](#inline-attachments) 要预览这些邮件，你应该将它们发送到电子邮件测试应用程序，例如 [Mailpit](https://github.com/axllent/mailpit) 或 [HELO](https://usehelo.com)。

<a name="localizing-mailables"></a>
## 本地化邮件

Laravel 允许你在请求的当前语言环境之外的语言环境中发送邮件，如果邮件在排队，它甚至会记住这个语言环境。

为此， `Mail` 门面提供了一个 `locale` 方法来设置所需的语言。评估可邮寄的模板时，应用程序将更改为此语言环境，然后在评估完成后恢复为先前的语言环境：

    Mail::to($request->user())->locale('es')->send(
        new OrderShipped($order)
    );

<a name="user-preferred-locales"></a>
### 用户首选语言环境

有时，应用程序存储每个用户的首选语言环境。 通过在一个或多个模型上实现 `HasLocalePreference` 契约，你可以指示 Laravel 在发送邮件时使用这个存储的语言环境：

    use Illuminate\Contracts\Translation\HasLocalePreference;

    class User extends Model implements HasLocalePreference
    {
        /**
         * 获取用户的区域设置。
         */
        public function preferredLocale(): string
        {
            return $this->locale;
        }
    }

一旦你实现了接口，Laravel 将在向模型发送邮件和通知时自动使用首选语言环境。 因此，使用该接口时无需调用 `locale` 方法：

    Mail::to($request->user())->send(new OrderShipped($order));

<a name="testing-mailables"></a>
## 测试邮件

<a name="testing-mailable-content"></a>
### 测试邮件内容

Laravel 提供了几种方便的方法来测试你的邮件是否包含你期望的内容。 这些方法是：`assertSeeInHtml`、`assertDontSeeInHtml`、`assertSeeInOrderInHtml`、`assertSeeInText`、`assertDontSeeInText` 和 `assertSeeInOrderInText`。

和你想的一样，「HTML」判断你的邮件的 HTML 版本中是否包含给定字符串，而「Text」是判断你的可邮寄邮件的纯文本版本是否包含给定字符串：

    use App\Mail\InvoicePaid;
    use App\Models\User;

    public function test_mailable_content(): void
    {
        $user = User::factory()->create();

        $mailable = new InvoicePaid($user);

        $mailable->assertFrom('jeffrey@example.com');
        $mailable->assertTo('taylor@example.com');
        $mailable->assertHasCc('abigail@example.com');
        $mailable->assertHasBcc('victoria@example.com');
        $mailable->assertHasReplyTo('tyler@example.com');
        $mailable->assertHasSubject('Invoice Paid');
        $mailable->assertHasTag('example-tag');
        $mailable->assertHasMetadata('key', 'value');

        $mailable->assertSeeInHtml($user->email);
        $mailable->assertSeeInHtml('Invoice Paid');
        $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

        $mailable->assertSeeInText($user->email);
        $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

        $mailable->assertHasAttachment('/path/to/file');
        $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
        $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
        $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
        $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    }

<a name="testing-mailable-sending"></a>
### 测试邮件的发送

我们建议将邮件内容和判断指定的邮件「发送」给特定用户的测试分开进行测试。通常来讲，邮件的内容与你正在测试的代码无关，只要能简单地判断 Laravel 能够发送指定的邮件就足够了。

你可以使用 `Mail`方法的 `fake` 方法来阻止邮件的发送。调用了 `Mail` 方法的 `fake`方法后，你可以判断邮件是否已被发送给指定的用户，甚至可以检查邮件收到的数据：

    <?php

    namespace Tests\Feature;

    use App\Mail\OrderShipped;
    use Illuminate\Support\Facades\Mail;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_orders_can_be_shipped(): void
        {
            Mail::fake();

            // 执行邮件发送。。。

            // 判断没有发送的邮件。。。
            Mail::assertNothingSent();

            // 判断已发送邮件。。。
            Mail::assertSent(OrderShipped::class);

            // 判断已发送两次的邮件。。。
            Mail::assertSent(OrderShipped::class, 2);

            // 判断邮件是否未发送。。。
            Mail::assertNotSent(AnotherMailable::class);
        }
    }

如果你在后台排队等待邮件的传递，则应该使用 `assertQueued` 方法而不是 `assertSent` 方法。

    Mail::assertQueued(OrderShipped::class);

    Mail::assertNotQueued(OrderShipped::class);

    Mail::assertNothingQueued();

你可以向 `assertSent`、`assertNotSent`、 `assertQueued` 或者 `assertNotQueued` 方法来传递闭包，来判断发送的邮件是否通过给定的 「真值检验」。如果至少发送了一个可以通过的邮件，就可以判断为成功。

    Mail::assertSent(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });

当调用 `Mail` 外观的判断方法时，提供的闭包所接受的邮件实例会公开检查邮件的可用方法：

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
        return $mail->hasTo($user->email) &&
               $mail->hasCc('...') &&
               $mail->hasBcc('...') &&
               $mail->hasReplyTo('...') &&
               $mail->hasFrom('...') &&
               $mail->hasSubject('...');
    });

mailable 实例还包括检查 mailable 上的附件的几种可用方法：

    use Illuminate\Mail\Mailables\Attachment;

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
        return $mail->hasAttachment(
            Attachment::fromPath('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf')
        );
    });

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
        return $mail->hasAttachment(
            Attachment::fromStorageDisk('s3', '/path/to/file')
        );
    });

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
        return $mail->hasAttachment(
            Attachment::fromData(fn () => $pdfData, 'name.pdf')
        );
    });

你可能已经注意到，有 2 种方法可以判断邮件是否发送, 即：`assertNotSent` 和 `assertNotQueued` 。有时你可能希望判断邮件没有被发送**或**排队。如果要实现这一点，你可以使用 `assertNothingOutgoing` 和 `assertNotOutgoing` 方法。

    Mail::assertNothingOutgoing();

    Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });

<a name="mail-and-local-development"></a>
## 邮件和本地开发

在开发发送电子邮件的应用程序时，你可能不希望实际将电子邮件发送到实际的电子邮件地址。 Laravel 提供了几种在本地开发期间「禁用」发送电子邮件的方法。

<a name="log-driver"></a>
#### 日志驱动

`log` 邮件驱动程序不会发送你的电子邮件，而是将所有电子邮件信息写入你的日志文件以供检查。 通常，此驱动程序仅在本地开发期间使用。有关按环境配置应用程序的更多信息，请查看 [配置文档](/docs/laravel/10.x/configurationmd#environment-configuration)。

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

或者，你可以使用 [HELO](https://usehelo.com/) 或 [Mailtrap](https://mailtrap.io/) 之类的服务和 `smtp` 驱动程序将你的电子邮件信息发送到「虚拟」邮箱。你可以通过在真正的电子邮件客户端中查看它们。这种方法的好处是允许你在 Mailtrap 的消息查看实际并检查的最终电子邮件。

如果你使用 [Laravel Sail](/docs/laravel/10.x/sail)，你可以使用 [Mailpit](https://github.com/axllent/mailpit) 预览你的消息。当 Sail 运行时，你可以访问 Mailpit 界面：`http://localhost:8025`。

<a name="using-a-global-to-address"></a>
#### 使用全局 `to` 地址

最后，你可以通过调用 `Mail` 门面提供的 `alwaysTo` 方法来指定一个全局的「收件人」地址。 通常，应该从应用程序的服务提供者之一的 `boot` 方法调用此方法：

    use Illuminate\Support\Facades\Mail;

    /**
     * 启动应用程序服务
     */
    public function boot(): void
    {
        if ($this->app->environment('local')) {
            Mail::alwaysTo('taylor@example.com');
        }
    }

<a name="events"></a>
## 事件

Laravel 在发送邮件消息的过程中会触发 2 个事件。`MessageSending` 事件在消息发送之前触发，而 `MessageSent` 事件在消息发送后触发。请记住，这些事件是在邮件**发送**时触发的，而不是在排队时触发的。你可以在你的 `App\Providers\EventServiceProvider` 服务中为这个事件注册事件监听器：

    use App\Listeners\LogSendingMessage;
    use App\Listeners\LogSentMessage;
    use Illuminate\Mail\Events\MessageSending;
    use Illuminate\Mail\Events\MessageSent;

    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        MessageSending::class => [
            LogSendingMessage::class,
        ],

        MessageSent::class => [
            LogSentMessage::class,
        ],
    ];

<a name="custom-transports"></a>
## 自定义传输

Laravel 包含多种邮件传输；但是，你可能希望编写自己的传输程序，通过 Laravel 来发送电子邮件。首先，定义一个扩展 `Symfony\Component\Mailer\Transport\AbstractTransport` 类。然后，在传输上实现 `doSend` 和 `__toString()` 方法：

    use MailchimpTransactional\ApiClient;
    use Symfony\Component\Mailer\SentMessage;
    use Symfony\Component\Mailer\Transport\AbstractTransport;
    use Symfony\Component\Mime\Address;
    use Symfony\Component\Mime\MessageConverter;

    class MailchimpTransport extends AbstractTransport
    {
        /**
         * 创建一个新的 Mailchimp 传输实例。
         */
        public function __construct(
            protected ApiClient $client,
        ) {
            parent::__construct();
        }

        /**
         * {@inheritDoc}
         */
        protected function doSend(SentMessage $message): void
        {
            $email = MessageConverter::toEmail($message->getOriginalMessage());

            $this->client->messages->send(['message' => [
                'from_email' => $email->getFrom(),
                'to' => collect($email->getTo())->map(function (Address $email) {
                    return ['email' => $email->getAddress(), 'type' => 'to'];
                })->all(),
                'subject' => $email->getSubject(),
                'text' => $email->getTextBody(),
            ]]);
        }

        /**
         * 获取传输字符串的表示形式。
         */
        public function __toString(): string
        {
            return 'mailchimp';
        }
    }

你一旦定义了自定义传输，就可以通过 `Mail` 外观提供的 `boot` 方法来注册它。通常情况下，这应该在应用程序的 `AppServiceProvider` 服务种提供的 `boot` 方法中完成。`$config` 参数将提供给 `extend` 方法的闭包。该参数将包含在应用程序中的 `config/mail.php` 来配置文件中为 mailer 定义的配置数组。

    use App\Mail\MailchimpTransport;
    use Illuminate\Support\Facades\Mail;

    /**
     * 启动应用程序服务
     */
    public function boot(): void
    {
        Mail::extend('mailchimp', function (array $config = []) {
            return new MailchimpTransport(/* ... */);
        });
    }

定义并注册自定义传输后，你可以在应用程序中的 `config/mail.php` 配置文件中新建一个利用自定义传输的邮件定义：

    'mailchimp' => [
        'transport' => 'mailchimp',
        // ...
    ],

<a name="additional-symfony-transports"></a>
### 额外的 Symfony 传输

Laravel 同样支持一些现有的 Symfony 维护的邮件传输，如 Mailgun 和 Postmark 。但是，你可能希望通过扩展 Laravel，来支持 Symfony 维护的其他传输。你可以通过 Composer 请求必要的 Symfony 邮件并向 Laravel 注册运输。例如，你可以安装并注册 Symfony 的「Sendinblue」 邮件：

```none
composer require symfony/sendinblue-mailer symfony/http-client
```

安装 Sendinblue 邮件包后，你可以将 Sendinblue API 凭据的条目添加到应用程序的「服务」配置文件中：

    'sendinblue' => [
        'key' => 'your-api-key',
    ],

最后，你可以使用 `Mail` 门面的 `extend` 方法向 Laravel 注册传输。通常，这应该在服务提供者的 `boot` 方法中完成：

    use Illuminate\Support\Facades\Mail;
    use Symfony\Component\Mailer\Bridge\Sendinblue\Transport\SendinblueTransportFactory;
    use Symfony\Component\Mailer\Transport\Dsn;

    /**
     * 启动应用程序服务。
     */
    public function boot(): void
    {
        Mail::extend('sendinblue', function () {
            return (new SendinblueTransportFactory)->create(
                new Dsn(
                    'sendinblue+api',
                    'default',
                    config('services.sendinblue.key')
                )
            );
        });
    }

你一旦注册了传输，就可以在应用程序的 `config/mail.php` 配置文件中创建一个用于新传输的 mailer 定义：

    'sendinblue' => [
        'transport' => 'sendinblue',
        // ...
    ],