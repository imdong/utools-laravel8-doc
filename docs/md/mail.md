# 邮件

- [简介](#introduction)
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
    - [自定义Symfony消息](#customizing-the-symfony-message)
- [Markdown格式邮件](#markdown-mailables)
    - [生成Markdown格式邮件](#generating-markdown-mailables)
    - [编写Markdown格式邮件](#writing-markdown-messages)
    - [自定义组件](#customizing-the-components)
- [发送邮件](#sending-mail)
    - [邮件队列](#queueing-mail)
- [渲染邮件](#rendering-mailables)
    - [浏览器中预览邮件](#previewing-mailables-in-the-browser)
- [邮件本土化](#localizing-mailables)
- [测试邮件](#testing-mailables)
- [邮件与本地开发](#mail-and-local-development)
- [事件](#events)
- [自定义传输方式](#custom-transports)
    - [附-Symfony传输方式](#additional-symfony-transports)

<a name="introduction"></a>
## 简介
发送邮件并不复杂。Laravel基于 [Symfony Mailer](https://symfony.com/doc/6.0/mailer.html) 组件提供了一个简洁、简单的邮件API。Laravel和Symfony 为  Mailer SMTP 、Mailgun 、Postmark 、 Amazon SES 、 及` sendmail ` （发送邮件的方式）提供驱动，允许你通过本地或者云服务来快速发送邮件。

<a name="configuration"></a>
### 配置
Laravel的邮件服务可以通过`config/mail.php`配置文件进行配置。
邮件中的每一项都在配置文件中有单独的配置项，甚至是独有的「传输方式」，允许你的应用使用不同的邮件服务发送邮件。例如，你的应用程序在使用 Amazon SES 发送批量邮件时，也可以使用 Postmark 发送事务性邮件。
在你的` mail `配置文件中，你将找到` mailers `配置数组。 该数组包含 Laravel 支持的每个邮件 驱动程序 / 传输方式 配置，而 `default `配置值确定当您的应用程序需要发送电子邮件时，默认情况下将使用哪个邮件驱动。

<a name="driver-prerequisites"></a>
### 驱动/传输的前提
基于 API 的驱动，如 Mailgun 和 Postmark ，通常比 SMTP 服务器更简单快速。如果可以的话， 我们建议您使用下面这些驱动。

<a name="mailgun-driver"></a>
#### Mailgun驱动
要使用Mailgun驱动，可以先通过`composer`来安装`Mailgun`函数库 ：

```shell
composer require symfony/mailgun-mailer symfony/http-client
```
接着，在应用的`config/mail.php`配置文件中，将默认项设置成`mailgun`。配置好之后，确认`config/services.php`配置文件中包含以下选项：

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
    ],

如果不使用 US [Mailgun region](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions)区域终端 ，您需要在`service`文件中配置区域终端：

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    ],

<a name="postmark-driver"></a>
#### Postmark 驱动
要使用`Postmark`驱动，先通过`composer`来安装`Postmark`函数库：

```shell
composer require symfony/postmark-mailer symfony/http-client
```

接着，在应用的`config/mail.php`配置文件中，将默认项设置成`postmark`。配置好之后，确认`config/services.php`配置文件中包含如下选项：

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

如果你要给指定邮件程序使用的 Postmark message stream，可以在配置数组中添加 `message_stream_id` 配置选项。 这个配置数组在应用程序的 `config/mail.php `配置文件中：

    'postmark' => [
        'transport' => 'postmark',
        'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    ],



这样，你还可以使用不同的 message stream 来设置多个 Postmark 邮件驱动。

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

为了通过session token来使用AWS [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) ，您需要向应用的SES配置中添加一个 `token` 键：

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'token' => env('AWS_SESSION_TOKEN'),
    ],

发送邮件，如果你想传递一些 [额外的选项](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) 给AWS SDK的 `SendEmail`方法，你可以在`ses` 配置中定义一个`options`数组：

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
有时候，已经配置好的，用来发送邮件的服务可能会失败/失效，这种情况下，定义一个或多个备用邮件配置项会非常有用，当你的主配置失效时，其它的将会起作用。


为此，您应该在应用程序的 `mail` 配置文件中定义一个使用 `failover` 传输的邮件程序。 应用程序的 `failover` 邮件程序的配置数组应该包含一个 `mailers` 数组，这些邮件程序引用应该选择邮件驱动程序进行传递的顺序：

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

一旦定义了故障转移邮件程序，您应该将此邮件程序设置为应用程序使用的默认邮件程序，方法是将其名称指定为应用程序 `mail` 配置文件中的 `default` 配置键的值：

    'default' => env('MAIL_MAILER', 'failover'),

<a name="generating-mailables"></a>
## 生成 Mailables

在构建 Laravel 应用程序时，应用程序发送的每种类型的电子邮件都表示为一个 `mailable` 类。 这些类存储在 `app/Mail` 目录中。 如果您在应用程序中看不到此目录，请不要担心，因为它会在您使用 `make:mail` Artisan 命令创建第一个可邮寄类时为您生成：

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## 编写 Mailables

一旦你生成了一个 mailable 的类，打开它，这样我们就可以探索它的内容了。 首先，请注意所有可邮寄类的配置都是在 `build` 方法中完成的。 在此方法中，您可以调用各种方法，例如 `from`、`subject`、`view` 和 `attach` 来配置电子邮件的呈现和传递。

> 技巧：您可以键入提示依赖于可邮寄的 `build` 方法。 Laravel [服务容器](/docs/laravel/9.x/container) 会自动注入这些依赖项。

<a name="configuring-the-sender"></a>


### 配置发件人

<a name="using-the-from-method"></a>
#### 使用 `from` 方法

首先，让我们浏览一下邮件的发件人的配置。或者，换句话说，邮件来自谁。有两种方法配置发件人。第一种，你可以在 mailable 类的 `from` 方法中使用 `build` 方法：

    /**
     * 构建消息
     *
     * @return $this
     */
    public function build()
    {
        return $this->from('example@example.com', 'Example')
                    ->view('emails.orders.shipped');
    }

<a name="using-a-global-from-address"></a>
#### 使用全局 `from` 地址

当然，如果你的应用在任何邮件中使用的「发件人」地址都一致的话，在你生成的每一个 mailable 类中调用 `from` 方法可能会很麻烦。因此，你可以在 `config/mail.php` 文件中指定一个全局的「发件人」地址。当某个 mailable 类没有指定「发件人」时，它将使用该全局「发件人」：

    'from' => ['address' => 'example@example.com', 'name' => 'App Name'],

此外，你可以在 `config/mail.php` 配置文件中定义一个全局的「回复」地址：

    'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],

<a name="configuring-the-view"></a>
### 配置视图

你可以在 mailable 类的 `build` 方法中使用 `view` 方法来指定在渲染邮件内容时要使用的模板。由于每封邮件通常使用 [Blade 模板](/docs/laravel/9.x/blade) 来渲染其内容，因此在构建邮件 HTML 内容时你可以使用 Blade 模板引擎提供的所有功能及享受其带来的便利性：

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.orders.shipped');
    }

> 技巧：你可以创建一个 `resources/views/emails` 目录来存放你的所有邮件模板；当然，你也可以将其置于 `resources/views` 目录下的任何位置。



<a name="plain-text-emails"></a>
#### 纯文本邮件

你可以使用 `text` 方法来定义一个纯文本格式的邮件。和 `view` 方法一样， 该 `text` 方法接受一个模板名，模板名指定了在渲染邮件内容时你想使用的模板。你既可以定义纯文本格式亦可定义 HTML 格式：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.orders.shipped')
                    ->text('emails.orders.shipped_plain');
    }

<a name="view-data"></a>
### 视图数据

<a name="via-public-properties"></a>
#### 通过 Public 属性

通常情况下，你可能想要在渲染邮件的 HTML 内容时传递一些数据到视图中。有两种方法传递数据到视图中。第一种，你在 mailable 类中定义的所有 public 的属性都将自动传递到视图中。因此，举个例子，你可以将数据传递到你的 mailable 类的构造函数中，并将其设置为类的 public 属性：

    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * 订单实例.
         *
         * @var \App\Models\Order
         */
        public $order;

        /**
         * 创建一个消息实例.
         *
         * @param  \App\Models\Order  $order
         * @return void
         */
        public function __construct(Order $order)
        {
            $this->order = $order;
        }

        /**
         * 构建消息.
         *
         * @return $this
         */
        public function build()
        {
            return $this->view('emails.orders.shipped');
        }
    }

当数据被设置成为 public 属性之后，它将被自动传递到你的视图中，因此你可以像您在 Blade 模板中那样访问它们：

    <div>
        Price: {{ $order->price }}
    </div>



<a name="via-the-with-method"></a>
#### 通过  `with` 方法：

如果你想要在邮件数据发送到模板前自定义它们的格式，你可以使用 `with` 方法来手动传递数据到视图中。一般情况下，你还是需要通过 mailable 类的构造函数来传递数据；不过，你应该将它们定义为  `protected` 或 `private` 以防止它们被自动传递到视图中。然后，在您调用 `with` 方法的时候，你可以以数组的形式传递你想要传递给模板的数据：

    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * 订单实例.
         *
         * @var \App\Models\Order
         */
        protected $order;

        /**
         * 创建消息实例.
         *
         * @param  \App\Models\Order  $order
         * @return void
         */
        public function __construct(Order $order)
        {
            $this->order = $order;
        }

        /**
         * 构建消息.
         *
         * @return $this
         */
        public function build()
        {
            return $this->view('emails.orders.shipped')
                        ->with([
                            'orderName' => $this->order->name,
                            'orderPrice' => $this->order->price,
                        ]);
        }
    }

当数据使用 `with` 法传递后，你便可以在视图中使用它们，此时，便可以像 Blade 模板的方式来访问它们：

    <div>
        Price: {{ $orderPrice }}
    </div>

<a name="attachments"></a>
### 附件

要在邮件中加入附件，在 `build` 方法中使用 `attach` 方法。 该 `attach` 方法接受文件的绝对路径作为它的第一个参数：

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.orders.shipped')
                    ->attach('/path/to/file');
    }



当附加文件到消息时，你也可以传递一个 `array` 给 `attach` 方法作为第二个参数，以指定显示名称和 / 或是 MIME 类型：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.orders.shipped')
                    ->attach('/path/to/file', [
                        'as' => 'name.pdf',
                        'mime' => 'application/pdf',
                    ]);
    }

<a name="attaching-files-from-disk"></a>
#### 从磁盘中添加附件

如果你已经在 [文件存储](/docs/laravel/9.x/filesystem) 上存储了一个文件，则可以使用 `attachFromStorage` 方法将其附加到邮件中：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
       return $this->view('emails.orders.shipped')
                   ->attachFromStorage('/path/to/file');
    }

如有必要，你可以使用 `attachFromStorage` 方法的第二个和第三个参数指定文件的附件名称和其他选项：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
       return $this->view('emails.orders.shipped')
                   ->attachFromStorage('/path/to/file', 'name.pdf', [
                       'mime' => 'application/pdf'
                   ]);
    }

如果需要指定默认磁盘以外的存储磁盘，可以使用 `attachFromStorageDisk` 方法：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
       return $this->view('emails.orders.shipped')
                   ->attachFromStorageDisk('s3', '/path/to/file');
    }

<a name="raw-data-attachments"></a>
#### 原始数据附件

该 `attachData` 可以使用字节数据作为附件。例如，你可以使用这个方法将内存中生成而没有保存到磁盘中的 PDF 附加到邮件中。 `attachData` 方法第一个参数接收原始字节数据，第二个参数为文件名，第三个参数接受一个数组以指定其他参数：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.orders.shipped')
                    ->attachData($this->pdf, 'name.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }



<a name="inline-attachments"></a>
### 内联附件

在邮件中嵌入内联图片通常很麻烦；不过，Laravel 提供了一种将图像附加到邮件的便捷方法。可以使用邮件模板中 `$message` 变量的 `embed` 方法来嵌入内联图片。Laravel 自动使 `$message` 变量在全部邮件模板中可用，不需要担心手动传递它：

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> 注意：该 `$message` 在文本消息中不可用，因为文本消息不能使用内联附件。

<a name="embedding-raw-data-attachments"></a>
#### 嵌入原始数据附件

如果你已经有了可以嵌入邮件模板的原始图像数据字符串，可以使用 `$message` 变量的  `embedData` 方法，当调用 `embedData` 方法时，需要传递一个文件名：

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="customizing-the-symfony-message"></a>
### 自定义 Symfony 消息

该 `Mailable` 基类的 `withSymfonyMessage` 方法允许您注册一个闭包，在发送消息之前将使用 Symfony 消息实例调用该闭包。这使您有机会在消息传递之前对其进行深度自定义：

    use Symfony\Component\Mime\Email;
    
    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
        $this->view('emails.orders.shipped');

        $this->withSymfonyMessage(function (Email $message) {
            $message->getHeaders()->addTextHeader(
                'Custom-Header', 'Header Value'
            );
        });

        return $this;
    }



<a name="markdown-mailables"></a>
## Markdown 格式邮件

Markdown 格式邮件允许你可以使用 mailable 中的预构建模板和 [邮件通知](/docs/laravel/9.x/notifications#mail-notifications) 组件。由于消息是用 Markdown 编写，Laravel 能够渲染出美观的、响应式的 HTML 模板消息，同时还能自动生成纯文本副本。

<a name="generating-markdown-mailables"></a>
### 生成 Markdown 邮件

你可以在执行 `make:mail`  的 Artisan 命令时使用 `--markdown` 选项来生成一个 Markdown 格式模板的 mailable 类：

```shell
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
```

然后，在它的 `build` 方法中配置 mailable 类时，请使用 `markdown` 方法来代替 `view` 方法。 该 `markdown` 方法接受 Markdown 模板的名称和想要传递给模板的可选的数组形式的数据：

    /**
     * 构建消息.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from('example@example.com')
                    ->markdown('emails.orders.shipped', [
                        'url' => $this->orderUrl,
                    ]);
    }

<a name="writing-markdown-messages"></a>
### 编写 Markdown 邮件

Markdown mailable 类整合了 Markdown 语法和 Blade 组件，让你能够非常方便的使用 Laravel 预置的 UI 组件来构建邮件消息：

```blade
@component('mail::message')
# Order Shipped

Your order has been shipped!

@component('mail::button', ['url' => $url])
View Order
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

> 技巧：在编写 Markdown 邮件的时候，请勿使用额外的缩进。Markdown 解析器会把缩进渲染成代码块。

<a name="button-component"></a>
#### 按钮组件

按钮组件用于渲染居中的按钮链接。该组件接收两个参数，一个是 `url` 一个是可选的 `color`。  支持的颜色包括 `primary` ，`success` 和 `error`。你可以在邮件中添加任意数量的按钮组件：

```blade
@component('mail::button', ['url' => $url, 'color' => 'success'])
View Order
@endcomponent
```



<a name="panel-component"></a>
#### 面板组件

面板组件在面板内渲染指定的文本块，面板与其他消息的背景色略有不同。它允许你绘制一个警示文本块：

```blade
@component('mail::panel')
This is the panel content.
@endcomponent
```

<a name="table-component"></a>
#### 表格组件

表格组件允许你将 Markdown 表格转换成 HTML 表格。该组件接受 Markdown 表格作为其内容。列对齐支持默认的 Markdown 表格对齐语法：

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

可以将所有 Markdown 邮件组件导出到自己的应用，用作自定义组件的模板。若要导出组件，使用 `laravel-mail` 资产标签的 `vendor:publish` Artisan 命令：

```shell
php artisan vendor:publish --tag=laravel-mail
```

此命令会将 Markdown 邮件组件导出到 `resources/views/vendor/mail` 目录。 该 `mail` 目录包含 `html` 和 `text` 子目录， 分别包含各自对应的可用组件描述。可以按照自己的意愿自定义这些组件。

<a name="customizing-the-css"></a>
#### 自定义 CSS

组件导出后，`resources/views/vendor/mail/html/themes` 目录有一个 `default.css` 文件。可以在此文件中自定义 CSS，这些样式将自动内联到 Markdown 邮件消息的 HTML 表示中。



如果想为 Laravel 的 Markdown 组件构建一个全新的主题，你可以在 `html/themes` 目录中新建一个 CSS 文件。 命名并保存 CSS 文件后，并更新应用程序 `config/mail.php` 配置文件的 `theme` 选项以匹配新主题的名称。

要为单个邮件自定义主题，可以将 mailable 类的 `$theme` 属性设置为发送 mailable 时应使用的主题名称。

<a name="sending-mail"></a>
## 发送邮件

若要发送邮件，使用 `Mail` [门面](/docs/laravel/9.x/facades) 的方法。该 `to` 方法接受 邮件地址、用户实例或用户集合。如果传递一个对象或者对象集合，mailer 在设置收件人时将自动使用它们的 `email` 和 `name` 属性，因此请确保对象的这些属性可用。一旦指定了收件人，就可以将 mailable 类实例传递给 `send` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Mail\OrderShipped;
    use App\Models\Order;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Mail;

    class OrderShipmentController extends Controller
    {
        /**
         * 发送给定的订单.
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            $order = Order::findOrFail($request->order_id);

            // Ship the order...

            Mail::to($request->user())->send(new OrderShipped($order));
        }
    }

在发送消息时不止可以指定收件人。还可以通过链式调用「to」、「cc」、「bcc」一次性指定抄送和密送收件人：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->send(new OrderShipped($order));



<a name="looping-over-recipients"></a>
#### 遍历收件人列表

有时，你需要通过遍历一个收件人 / 邮件地址数组的方式，给一系列收件人发送邮件。但是，由于 `to` 方法会给 mailable 列表中的收件人追加邮件地址，因此，你应该为每个收件人重建 mailable 实例。

    foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
        Mail::to($recipient)->send(new OrderShipped($order));
    }

<a name="sending-mail-via-a-specific-mailer"></a>
#### 通过特定的 Mailer 发送邮件

默认情况下，Laravel 将使用 `mail` 你的配置文件中配置为 `default` 邮件程序。 但是，你可以使用 `mailer` 方法通过特定的邮件程序配置发送：

    Mail::mailer('postmark')
            ->to($request->user())
            ->send(new OrderShipped($order));

<a name="queueing-mail"></a>
### 邮件队列

<a name="queueing-a-mail-message"></a>
#### 将邮件消息加入队列

由于发送邮件消息可能大幅度延长应用的响应时间，许多开发者选择将邮件消息加入队列放在后台发送。Laravel 使用内置的 [统一队列 API](/docs/laravel/9.x/queues)简化了这一工作。若要将邮件消息加入队列，可以在指定消息的接收者后，使用 `Mail` 门面的 `queue` 方法：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue(new OrderShipped($order));

此方法自动将作业推送到队列中以便消息在后台发送。使用此特性之前，需要 [配置队列](/docs/laravel/9.x/queues) 。



<a name="delayed-message-queueing"></a>
#### 延迟消息队列

想要延迟发送队列化的邮件消息，可以使用 `later` 方法。该 `later` 方法的第一个参数的第一个参数是标示消息何时发送的 `DateTime` 实例：

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->later(now()->addMinutes(10), new OrderShipped($order));

<a name="pushing-to-specific-queues"></a>
#### 推送到指定队列

由于所有使用 `make:mail` 命令生成的 mailable 类都是用了 `Illuminate\Bus\Queueable` trait，因此你可以在任何 mailable 类实例上调用 `onQueue` 和 `onConnection` 方法来指定消息的连接和队列名：

    $message = (new OrderShipped($order))
                    ->onConnection('sqs')
                    ->onQueue('emails');

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue($message);

<a name="queueing-by-default"></a>
#### 默认队列

如果你希望你的邮件类始终使用队列，你可以给邮件类实现 `ShouldQueue` 契约，现在即使你调用了 `send` 方法，邮件依旧使用队列的方式发送

    use Illuminate\Contracts\Queue\ShouldQueue;

    class OrderShipped extends Mailable implements ShouldQueue
    {
        //
    }

<a name="queued-mailables-and-database-transactions"></a>
#### 队列的邮件和数据库事务

当在数据库事务中分发邮件队列时，队列可能在数据库事务提交之前处理邮件。 发生这种情况时，您在数据库事务期间对模型或数据库记录所做的任何更新可能都不会反映在数据库中。 另外，在事务中创建的任何模型或数据库记录都可能不存在于数据库中。 如果您的邮件基于这些模型数据，则在处理邮件发生时，可能会发生意外错误。



如果队列连接的 `after_commit` 配置选项设置为 `false`，则仍然可以通过在 mailable 类上定义 `afterCommit` 属性来设置提交所有打开的数据库事务之后再调度特定的邮件队列：

    Mail::to($request->user())->send(
        (new OrderShipped($order))->afterCommit()
    );

或者，您可以 `afterCommit` 从 mailable 的构造函数中调用该方法：

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
         * Create a new message instance.
         *
         * @return void
         */
        public function __construct()
        {
            $this->afterCommit();
        }
    }

> 技巧：要了解有关解决这些问题的更多信息，请查看有关 [队列和数据库事物](/docs/laravel/9.x/queues#jobs-and-database-transactions)。

<a name="rendering-mailables"></a>
## 渲染邮件

有时您可能希望捕获邮件的 HTML 内容而不发送它。为此，可以调用邮件类的 `render` 方法。此方法将以字符串形式返回邮件类的渲染内容:

    use App\Mail\InvoicePaid;
    use App\Models\Invoice;

    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))->render();

<a name="previewing-mailables-in-the-browser"></a>
### 在浏览器中预览邮件

设计邮件模板时，可以方便地在浏览器中预览邮件，就像典型的 `Blade` 模板一样。因此， Laravel 允许您直接从路由闭包或控制器返回任何邮件类。当邮件返回时，它将渲染并显示在浏览器中，允许您快速预览其设计，而无需将其发送到实际的电子邮件地址：

    Route::get('/mailable', function () {
        $invoice = App\Models\Invoice::find(1);

        return new App\Mail\InvoicePaid($invoice);
    });

> 注意：在浏览器中预览邮件时，不会呈现[内联附件](#inline-attachments) 要预览这些邮件，您应该将它们发送到电子邮件测试应用程序，例如 [MailHog](https://github.com/mailhog/MailHog) 或 [HELO](https://usehelo.com)。



<a name="localizing-mailables"></a>
## 本地化邮件

Laravel 允许您在请求的当前语言环境之外的语言环境中发送邮件，如果邮件在排队，它甚至会记住这个语言环境。

为此，“Mail”门面提供了一个“locale”方法来设置所需的语言。 评估可邮寄的模板时，应用程序将更改为此语言环境，然后在评估完成后恢复为先前的语言环境：

    Mail::to($request->user())->locale('es')->send(
        new OrderShipped($order)
    );

<a name="user-preferred-locales"></a>
### 用户首选语言环境

有时，应用程序存储每个用户的首选语言环境。 通过在一个或多个模型上实现 `HasLocalePreference` 契约，你可以指示 Laravel 在发送邮件时使用这个存储的语言环境：

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

一旦你实现了接口，Laravel 将在向模型发送邮件和通知时自动使用首选语言环境。 因此，使用该接口时无需调用 `locale` 方法：

    Mail::to($request->user())->send(new OrderShipped($order));

<a name="testing-mailables"></a>
## 测试邮件

Laravel 提供了几种方便的方法来测试你的邮件是否包含你期望的内容。 这些方法是：`assertSeeInHtml`、`assertDontSeeInHtml`、`assertSeeInOrderInHtml`、`assertSeeInText`、`assertDontSeeInText`和`assertSeeInOrderInText`。

如您所料，「HTML」断言您的可邮寄邮件的 HTML 版本包含给定字符串，而「Text」断言您的可邮寄邮件的纯文本版本包含给定字符串：

    use App\Mail\InvoicePaid;
    use App\Models\User;

    public function test_mailable_content()
    {
        $user = User::factory()->create();

        $mailable = new InvoicePaid($user);

        $mailable->assertSeeInHtml($user->email);
        $mailable->assertSeeInHtml('Invoice Paid');
        $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

        $mailable->assertSeeInText($user->email);
        $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);
    }



<a name="testing-mailable-sending"></a>
#### 测试可邮寄的发送

我们建议将您的邮件内容与断言给定邮件已“发送”给特定用户的测试分开测试。 要了解如何测试邮件是否已发送，请查看我们在 [Mail fake](/docs/laravel/9.x/mocking#mail-fake) 上的文档。

<a name="mail-and-local-development"></a>
## 邮件和本地发展

在开发发送电子邮件的应用程序时，您可能不希望实际将电子邮件发送到实时电子邮件地址。 Laravel 提供了几种在本地开发期间「禁用」实际发送电子邮件的方法。

<a name="log-driver"></a>
#### 日志驱动程序

`log` 邮件驱动程序不会发送您的电子邮件，而是将所有电子邮件信息写入您的日志文件以供检查。 通常，此驱动程序仅在本地开发期间使用。有关按环境配置应用程序的更多信息，请查看 [配置文档](/docs/laravel/9.x/configuration#environment-configuration)。

<a name="mailtrap"></a>
#### HELO / Mailtrap / MailHog

或者，您可以使用 [HELO](https://usehelo.com) 或 [Mailtrap](https://mailtrap.io) 之类的服务和 `smtp` 驱动程序将您的电子邮件信息发送到「虚拟」邮箱 您可以在真正的电子邮件客户端中查看它们。这种方法的好处是允许您在 Mailtrap 的消息查看器中实际检查最终电子邮件。

如果你使用 [Laravel Sail](/docs/laravel/9.x/sail)，你可以使用 [MailHog](https://github.com/mailhog/MailHog) 预览你的消息。当 Sail 运行时，您可以访问 MailHog 界面：`http://localhost:8025`。

<a name="using-a-global-to-address"></a>
#### 使用全局 `to` 地址



最后，您可以通过调用 `Mail` 门面提供的 `alwaysTo` 方法来指定一个全局「收件人」地址。 通常，应该从应用程序的服务提供者之一的 `boot` 方法调用此方法：

    use Illuminate\Support\Facades\Mail;

    /**
     * Bootstrap 应用程序服务。
     *
     * @return void
     */
    public function boot()
    {
        if ($this->app->environment('local')) {
            Mail::alwaysTo('taylor@example.com');
        }
    }

<a name="events"></a>
## 事件

Laravel 在发送邮件消息的过程中会触发两个事件。 `MessageSending` 事件在消息发送之前触发，而 `MessageSent` 事件在消息发送后触发。请记住，这些事件是在邮件*发送*时触发的，而不是在排队时触发的。你可以在你的 App\Providers\EventServiceProvider 服务提供者中为这个事件注册事件监听器：

    /**
     * 应用程序的事件侦听器映射。
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Mail\Events\MessageSending' => [
            'App\Listeners\LogSendingMessage',
        ],
        'Illuminate\Mail\Events\MessageSent' => [
            'App\Listeners\LogSentMessage',
        ],
    ];

<a name="custom-transports"></a>
## 自定义传输

Laravel 包含多种邮件传输；但是，您可能希望编写自己的传输以通过 Laravel 开箱即用不支持的其他服务发送电子邮件。首先，定义一个扩展 `Symfony\Component\Mailer\Transport\AbstractTransport` 类的类。然后，在你的传输上实现 `doSend` 和 `__toString()` 方法：

    use MailchimpTransactional\ApiClient;
    use Symfony\Component\Mailer\SentMessage;
    use Symfony\Component\Mailer\Transport\AbstractTransport;
    use Symfony\Component\Mime\MessageConverter;

    class MailchimpTransport extends AbstractTransport
    {
        /**
         * Mailchimp API 客户端。
         *
         * @var \MailchimpTransactional\ApiClient
         */
        protected $client;

        /**
         * 创建一个新的 Mailchimp 传输实例。
         *
         * @param  \MailchimpTransactional\ApiClient  $client
         * @return void
         */
        public function __construct(ApiClient $client)
        {
            $this->client = $client
        }

        /**
         * {@inheritDoc}
         */
        protected function doSend(SentMessage $message): void
        {
            $email = MessageConverter::toEmail($message->getOriginalMessage());

            $this->client->messages->send(['message' => [
                'from_email' => $email->getFrom(),
                'to' => collect($email->getTo())->map(function ($email) {
                    return ['email' => $email->getAddress(), 'type' => 'to'];
                })->all(),
                'subject' => $email->getSubject(),
                'text' => $email->getTextBody(),
            ]]);
        }

        /**
         * 获取传输的字符串表示形式。
         *
         * @return string
         */
        public function __toString(): string
        {
            return 'mailchimp';
        }
    }



一旦你定义了你的自定义传输，你可以通过 `Mail` 门面提供的 `extend` 方法注册它。通常，这应该在应用程序的 `AppServiceProvider` 服务提供者的 `boot` 方法中完成。 `$config` 参数将被传递给提供给`extend` 方法的闭包。此参数将包含在应用程序的 `config/mail.php` 配置文件中为邮件程序定义的配置数组：

    use App\Mail\MailchimpTransport;
    use Illuminate\Support\Facades\Mail;

    /**
     * 引导任何应用程序服务。
     *
     * @return void
     */
    public function boot()
    {
        Mail::extend('mailchimp', function (array $config = []) {
            return new MailchimpTransport(...);
        })
    }

一旦定义并注册了自定义传输，您就可以在应用程序的 `config/mail.php` 配置文件中创建一个使用新传输的邮件定义：

    'mailchimp' => [
        'transport' => 'mailchimp',
        // ...
    ],

<a name="additional-symfony-transports"></a>
### 额外的 Symfony 传输

Laravel 支持一些现有的 Symfony 维护的邮件传输，比如 Mailgun 和 Postmark。但是，您可能希望扩展 Laravel 以支持额外的 Symfony 维护的传输。您可以通过 Composer 要求必要的 Symfony 邮件程序并使用 Laravel 注册传输来做到这一点。例如，您可以安装并注册“Sendinblue”Symfony 邮件程序：

```none
composer require symfony/sendinblue-mailer
```

安装 Sendinblue 邮件程序包后，您可以将 Sendinblue API 凭据的条目添加到应用程序的「服务」配置文件中：

    'sendinblue' => [
        'key' => 'your-api-key',
    ],

最后，你可以使用 `Mail` 门面的 `extend` 方法向 Laravel 注册传输。通常，这应该在服务提供者的 `boot` 方法中完成：

    use Illuminate\Support\Facades\Mail;
    use Symfony\Component\Mailer\Bridge\Sendinblue\Transport\SendinblueTransportFactory;
    use Symfony\Component\Mailer\Transport\Dsn;

    /**
     * 引导任何应用程序服务。
     *
     * @return void
     */
    public function boot()
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

