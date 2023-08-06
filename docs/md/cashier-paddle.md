
# Laravel 交易工具包 (Paddle)

- [介绍](#introduction)
- [升级 Cashier](#upgrading-cashier)
- [安装](#installation)
    - [Paddle 沙盒](#paddle-sandbox)
    - [数据迁移](#database-migrations)
- [配置](#configuration)
    - [Billable 模型](#billable-model)
    - [API Keys](#api-keys)
    - [Paddle JS](#paddle-js)
    - [货币配置](#currency-configuration)
    - [扩展默认模型](#overriding-default-models)
- [核心概念](#core-concepts)
    - [支付链接](#pay-links)
    - [內联结账](#inline-checkout)
    - [用户鉴定](#user-identification)
- [价格](#prices)
- [用户](#customers)
    - [用户默认设置](#customer-defaults)
- [订阅](#subscriptions)
    - [创建订阅](#creating-subscriptions)
    - [检查订阅状态](#checking-subscription-status)
    - [订阅一次性收费](#subscription-single-charges)
    - [更新交易信息](#updating-payment-information)
    - [更新计划](#changing-plans)
    - [订阅量](#subscription-quantity)
    - [更新订阅](#subscription-modifiers)
    - [多个订阅](#multiple-subscriptions)
    - [暂停订阅](#pausing-subscriptions)
    - [取消订阅](#cancelling-subscriptions)
- [订阅试用](#subscription-trials)
    - [预付款方式](#with-payment-method-up-front)
    - [非预付款方式](#without-payment-method-up-front)
- [处理 Paddle Webhooks](#handling-paddle-webhooks)
    - [定义 Webhook 事件处理程序](#defining-webhook-event-handlers)
    - [校验 Webhook 签名](#verifying-webhook-signatures)
- [一次性收费](#single-charges)
    - [简单收费](#simple-charge)
    - [收费产品](#charging-products)
    - [退款订单](#refunding-orders)
- [收据](#receipts)
    - [过去和未来的付款](#past-and-upcoming-payments)
- [处理失败交易](#handling-failed-payments)
- [测试](#testing)

<a name="introduction"></a>
## 介绍

[Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) 为 [Paddle's](https://paddle.com) 订阅计费服务提供了一个富有表现力、流畅的界面。它几乎能够处理所有你所恐惧的各种订阅计费逻辑和代码。除了基本的订阅管理，Cashier 还可以处理：优惠券、交换订阅、订阅「数量」、取消宽限期等。

在使用 Cashier 时，推荐你回顾一下 Paddle 的[用户手册](https://developer.paddle.com/guides) and [API 文档](https://developer.paddle.com/api-reference/intro)。


<a name="upgrading-cashier"></a>
## 升级 Cashier

当升级到一个新版本的 Cashier 时，推荐仔细回顾下 [升级指南](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.) 这非常重要。

<a name="installation"></a>
## 安装

首先，使用 Composer 包管理器安装 Paddle 的 Cashier 包：

```shell
composer require laravel/cashier-paddle
```

> 注意：为了确保 Cashier 正确处理所有 Paddle 事件，请记得 [配置 Cashier 的 webhook 处理](#handling-paddle-webhooks)。

<a name="paddle-sandbox"></a>
### Paddle 沙盒

在本地和预发布开发环境中，应该 [注册一个 Paddle 沙盒账号](https://developer.paddle.com/getting-started/sandbox)。这个账号将为你提供一个沙盒环境来测试和开发你的应用，而不会产生真实的交易。你也许会使用 Paddle 的 [测试卡号](https://developer.paddle.com/getting-started/sandbox#test-cards) 来模拟各种交易场景。

在使用 Pable 沙盒环境时，你应在应用程序的 `.env` 环境文件中将 `PADDLE_SANDBOX` 环境变量设置为 `true` ：

```ini
PADDLE_SANDBOX=true
```

在你已经完成你的应用开发之后，你也许会 [申请一个 Paddle 正式账号](https://paddle.com/) 。 在你的应用程序投入生产环境之前，Paddle 需要批准你的应用程序的域。

<a name="database-migrations"></a>
### 数据迁移

Cashier 服务提供者注册它自己的数据迁移目录，所以你记得在安装扩展包之后执行数据迁移。Cashier 数据迁移将生成新的 `customers` 表。另外，新的 `subscriptions` 表将被创建，来存储所有你的用户的订阅。最后，新的 `receipts` 表也将被创建，来存储所有你的收据信息:

```shell
php artisan migrate
```



如果你需要重写 Cashier 中的数据迁移，你可以使用 `vendor:publish` Artisan 命令来发布它们：

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

如果你想阻止 Cashier 的数据迁移全部执行，你可以使用 Cashier 提供的 `ignoreMigrations`。通常，这个方法会在 `AppServiceProvider` 的 `register` 方法中被调用：

    use Laravel\Paddle\Cashier;

    /**
     * 注册服务。
     */
    public function register(): void
    {
        Cashier::ignoreMigrations();
    }

<a name="configuration"></a>
## 配置

<a name="billable-model"></a>
### Billable 模型

在使用 Cashier 之前，你必须将 `Billable` trait 添加到你的用户模型定义中。 这里的 trait 提供了多种方法来允许你执行常见的计费任务，例如创建订阅、应用优惠券和更新付款方式信息：

    use Laravel\Paddle\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }

如果你有非用户的计费实体，你还可以将特征添加到这些类中：

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Paddle\Billable;

    class Team extends Model
    {
        use Billable;
    }

<a name="api-keys"></a>
### API Keys

接下来，你应该在应用程序的 `.env` 文件中配置你的 Paddle 。 你可以从 Paddle 控制面板检索你的 Paddle API 密钥：

```ini
PADDLE_VENDOR_ID=your-paddle-vendor-id
PADDLE_VENDOR_AUTH_CODE=your-paddle-vendor-auth-code
PADDLE_PUBLIC_KEY="your-paddle-public-key"
PADDLE_SANDBOX=true
```

当你使用 [Paddle 的沙箱环境](#paddle-sandbox) 时，`PADDLE_SANDBOX` 环境变量应该设置为 `true`。如果你将应用程序部署到生产环境并使用 Paddle 的实时供应商环境，则 `PADDLE_SANDBOX` 变量应该设置为 `false`。


<a name="paddle-js"></a>
### Paddle JS

Paddle 依赖其自己的 JavaScript 库来启动 Paddle 结账小部件。你可以通过在应用程序布局中的 `</head>` 标签关闭之前放置 `@paddleJS` Blade 指令来加载 JavaScript 库：

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### 货币配置

默认 Cashier 货币是美元（USD）。你可以在 `.env` 文件中定义 `CASHIER_CURRENCY` 环境变量来更改默认货币：

```ini
CASHIER_CURRENCY=EUR
```

除了配置 Cashier 的货币之外，你还可以指定在格式化货币值以显示在发票上时要使用的区域。Cashier 内部利用 [PHP 的 NumberFormatter 类](https://www.php.net/manual/en/class.numberformatter.php)来设置货币区域：

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> 注意：为了使用 `en` 以外的语言环境，请确保你的服务器上安装并配置了 `ext-intl` PHP 扩展。

<a name="overriding-default-models"></a>
### 覆盖默认模型

你可以通过定义自己的模型并继承相应的 Cashier 模型来自由扩展 Cashier 模型：

    use Laravel\Paddle\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }

定义模型后，你可以通过 `Laravel\Paddle\Cashier` 类指示 Cashier 使用你的自定义模型。通常，你应该在应用的 `App\Providers\AppServiceProvider` 类的 `boot` 方法中通知 Cashier 关于你的自定义模型：

    use App\Models\Cashier\Receipt;
    use App\Models\Cashier\Subscription;

    /**
     * 启动应用服务。
     */
    public function boot(): void
    {
        Cashier::useReceiptModel(Receipt::class);
        Cashier::useSubscriptionModel(Subscription::class);
    }



<a name="core-concepts"></a>
## 核心概念

<a name="pay-links"></a>
### 支付链接

Paddle 缺乏广泛的 CRUD API 来执行订阅状态更改。因此，与 Paddle 的大多数交互都是通过其 [结帐小部件](https://developer.paddle.com/guides/how-tos/checkout/paddle-checkout) 完成的。在使用结账小部件之前，我们必须使用 Cashier 生成一个 「支付链接」。 「支付链接」将通知结账小部件我们希望执行的计费操作：

    use App\Models\User;
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $payLink = $request->user()->newSubscription('default', $premium = 34567)
            ->returnTo(route('home'))
            ->create();

        return view('billing', ['payLink' => $payLink]);
    });

Cashier 包括一个 `paddle-button` [Blade 组件](/docs/laravel/10.x/blade#components)。 我们可以将支付链接 URL 作为 「prop」传递给该组件。 单击此按钮时，将显示 Paddle 的结帐小部件：

```html
<x-paddle-button :url="$payLink" class="px-8 py-4">
    订阅
</x-paddle-button>
```

默认情况下，这将显示一个具有标准 Paddle 样式的按钮。 你可以通过向组件添加 `data-theme="none"` 属性来删除所有 Paddle 样式：

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="none">
    订阅
</x-paddle-button>
```

Paddle 结账小部件是异步的。 一旦用户在小部件中创建或更新订阅，Paddle 将发送你的应用程序 webhook，以便你可以在我们自己的数据库中正确更新订阅状态。 因此，正确 [设置 webhooks](#handling-paddle-webhook) 以同步 Paddle 的状态变化非常重要。

有关支付链接的更多信息，你可以查看 [有关支付链接生成的 Paddle API 文档](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink)。

> 注意：订阅状态更改后，接收相应 webhook 的延迟通常很小，但你应该在应用程序中考虑到这一点，因为你的用户订阅在完成结帐后可能不会立即生效。



<a name="manually-rendering-pay-links"></a>
#### 手动呈现支付链接

你也可以在不使用 Laravel 内置的 Blade 组件的情况下手动渲染支付链接。 首先，生成支付链接 URL，如先前所示：

    $payLink = $request->user()->newSubscription('default', $premium = 34567)
        ->returnTo(route('home'))
        ->create();

接下来，只需将支付链接 URL 附加到 HTML 中的 `a` 元素：

    <a href="#!" class="ml-4 paddle_button" data-override="{{ $payLink }}">
        Paddle 支付
    </a>

<a name="payments-requiring-additional-confirmation"></a>
#### 需要额外确认的付款

有时需要额外的验证才能确认和处理付款。发生这种情况时，Paddle 将显示付款确认屏幕。Paddle 或 Cashier 显示的付款确认屏幕可能会针对特定银行或发卡机构的付款流程进行定制，并且可能包括额外的卡确认、临时小额费用、单独的设备身份验证或其他形式的验证。

<a name="inline-checkout"></a>
### 内联结账

如果你不想使用 Paddle 的 「叠加」样式结帐小部件，Paddle 还提供了内嵌显示小部件的选项。 虽然这种方法不允许你调整任何结帐的 HTML 字段，但它允许你将小部件嵌入到你的应用中。

为了让你轻松开始内联结账，Cashier 包含一个 `paddle-checkout` Blade 组件。 首先，你应该 [生成支付链接](#pay-links)并将支付链接传递给组件的 `override` 属性：

```blade
<x-paddle-checkout :override="$payLink" class="w-full" />
```

要调整内联结帐组件的高度，你可以将 `height` 属性传递给 Blade 组件：

```blade
<x-paddle-checkout :override="$payLink" class="w-full" height="500" />
```



<a name="inline-checkout-without-pay-links"></a>
#### 没有支付链接的内联结账

或者，你可以使用自定义选项而不是使用支付链接来自定义小部件：

```blade
@php
$options = [
    'product' => $productId,
    'title' => 'Product Title',
];
@endphp

<x-paddle-checkout :options="$options" class="w-full" />
```

请参阅 Paddle 的 [Inline Checkout 指南](https://developer.paddle.com/guides/how-tos/checkout/inline-checkout) 以及他们的 [参数参考](https://developer.paddle.com/reference/paddle-js/parameters) 以获取有关内联结帐可用选项的更多详细信息。

> 注意：如果你想在指定自定义选项时也使用 passthrough 选项，你应该提供一个键 / 值数组作为其值。Cashier 将自动处理将数组转换为 JSON 字符串。 此外，`customer_id` passthrough 选项保留供内部 Cashier 使用。

<a name="manually-rendering-an-inline-checkout"></a>
#### 手动呈现内联结账

你也可以在不使用 Laravel 的内置 Blade 组件的情况下手动渲染内联结账。 首先，生成支付链接 URL [如前面示例中所示](#pay-links)。

接下来，你可以使用 Paddle.js 来初始化结帐。 为了让这个例子简单，我们将使用 [Alpine.js](https://github.com/alpinejs/alpine) 来演示； 但是，你可以自由地将此示例转换为你自己的前端技术栈：

```alpine
<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open({
        override: {{ $payLink }},
        method: 'inline',
        frameTarget: 'paddle-checkout',
        frameInitialHeight: 366,
        frameStyle: 'width: 100%; background-color: transparent; border: none;'
    });
">
</div>
```

<a name="user-identification"></a>
### 用户识别

与 Stripe 相比，Paddle 用户在所有 Paddle 中都是独一无二的，而不是每个 Paddle 帐户都是独一无二的。因此，Paddle 的 API 目前不提供更新用户详细信息（例如电子邮件地址）的方法。在生成支付链接时，Paddle 使用 `customer_email` 参数识别用户。创建订阅时，Paddle 将尝试将用户提供的电子邮件与现有 Paddle 用户进行匹配。


鉴于这种行为，在使用 Cashier 和 Paddle 时需要记住一些重要的事情。首先，你应该知道，即使 Cashier 中的订阅绑定到同一个应用程序用户，**它们也可能绑定到 Paddle 内部系统中的不同用户**。其次，每个订阅都有自己的连接支付方式信息，并且在 Paddle 的内部系统中也可能有不同的电子邮件地址（取决于创建订阅时分配给用户的电子邮件）。

因此，在显示订阅时，你应该始终告知用户哪些电子邮件地址或付款方式信息与订阅相关联。可以使用 `Laravel\Paddle\Subscription` 模型提供的以下方法检索这些信息：

    $subscription = $user->subscription('default');

    $subscription->paddleEmail();
    $subscription->paymentMethod();
    $subscription->cardBrand();
    $subscription->cardLastFour();
    $subscription->cardExpirationDate();

当前，没有办法通过 Paddle API 修改用户的电子邮件地址。当用户想在 Paddle 内更新他们的电子邮件地址时，他们唯一的方法是联系 Paddle 客户支持。在与 Paddle 沟通时，他们需要提供订阅的 `paddleEmail`，这样 Paddle 就可以更新正确的用户。

<a name="prices"></a>
## 定价

Paddle 允许你自定义每种货币对应的价格，也就是说 Paddle 允许你为不同国家和地区配置不同的价格。Cashier Paddle 允许你使用 `productPrices` 方法检索一个特定产品的所有价格。这个方法接受你希望检索价格的产品的产品 ID：

    use Laravel\Paddle\Cashier;

    $prices = Cashier::productPrices([123, 456]);



货币将根据请求的 IP 地址来确定，当然你也可以传入一个可选的国家和地区参数来检索特定国家和地区的价格：

    use Laravel\Paddle\Cashier;

    $prices = Cashier::productPrices([123, 456], ['customer_country' => 'BE']);

检索出价格后，你可以根据需要显示它们：

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

你也可以显示净价（不含税）并将税额显示分离：

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->net() }} (+ {{ $price->price()->tax() }} tax)</li>
    @endforeach
</ul>
```

如果你检索了订阅的价格，你可以分别显示其原始价格和连续订阅价格：

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - Initial: {{ $price->initialPrice()->gross() }} - Recurring: {{ $price->recurringPrice()->gross() }}</li>
    @endforeach
</ul>
```

更多相关信息，请 [查看 Paddle 的价格 API 文档](https://developer.paddle.com/api-reference/checkout-api/prices/getprices)。

<a name="prices-customers"></a>
#### 客户

如果用户已经是客户并且你希望显示适用于该客户的价格，你可以通过直接从客户实例检索价格来实现：

    use App\Models\User;

    $prices = User::find(1)->productPrices([123, 456]);

在内部，Cashier 将使用用户的 [`paddleCountry` 方法](#customer-defaults) 来检索以他们的货币表示的价格。例如，居住在美国的用户将看到以美元为单位的价格，而位于比利时的用户将看到以欧元为单位的价格。如果找不到匹配的货币，则将使用产品的默认货币。你可以在 Paddle 控制面板中自定义产品或订阅计划的所有价格。



<a name="prices-coupons"></a>
#### 优惠券

你也可以展示选择优惠券后的折扣价。 在调用 `productPrices` 方法时，优惠券可以作为逗号分隔的字符串传递：

    use Laravel\Paddle\Cashier;

    $prices = Cashier::productPrices([123, 456], [
        'coupons' => 'SUMMERSALE,20PERCENTOFF'
    ]);

然后，使用 `price` 方法显示计算出的价格：

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->price()->gross() }}</li>
    @endforeach
</ul>
```

你可以使用 `listPrice` 方法显示原价（没有优惠券折扣）：

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product_title }} - {{ $price->listPrice()->gross() }}</li>
    @endforeach
</ul>
```

> 注意：使用价格 API 时，Paddle 仅允许将优惠券应用于一次性购买的产品，而不允许应用于订阅计划。

<a name="customers"></a>
## 客户

<a name="customer-defaults"></a>
### 客户默认值

Cashier 允许你在创建支付链接时为你的客户定义一些默认值。 设置这些默认值允许你预先填写客户的电子邮件地址、国家 / 地区和邮政编码，以便他们可以立即转到结帐小部件的付款部分。 你可以通过覆盖计费模型上的以下方法来设置这些默认值：

    /**
     * 获取客户的电子邮件地址以与 Paddle 关联。
     */
    public function paddleEmail(): string|null
    {
        return $this->email;
    }

    /**
     * 获取客户的国家与 Paddle 关联。
     *
     * 这需要一个 2 个字母的代码。 有关支持的国家 / 地区，请参阅以下链接。
     *
     * @link https://developer.paddle.com/reference/platform-parameters/supported-countries
     */
    public function paddleCountry(): string|null
    {
        // ...
    }

    /**
     * 获取客户的邮政编码以与 Paddle 关联。
     *
     * 有关需要此功能的国家 / 地区，请参阅以下链接。
     *
     * @link https://developer.paddle.com/reference/platform-parameters/supported-countries#countries-requiring-postcode
     */
    public function paddlePostcode(): string|null
    {
        // ...
    }



这些默认值将用于 Cashier 中生成 [支付链接](#pay-links) 的每个操作。

<a name="subscriptions"></a>
## 订阅

<a name="creating-subscriptions"></a>
### 创建订阅

要创建订阅，请首先检索计费模型的实例，该实例通常是 `App\Models\User` 的实例。检索模型实例后，你可以使用 `newSubscription` 方法来创建模型的订阅支付链接：

    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $payLink = $request->user()->newSubscription('default', $premium = 12345)
            ->returnTo(route('home'))
            ->create();

        return view('billing', ['payLink' => $payLink]);
    });

传递给 `newSubscription` 方法的第一个参数应该是订阅的名称。 如果你的应用只提供一个订阅，你可以将其称为 `default` 或 `primary`。第二个参数是用户订阅的特定计划。 该值应对应于 Paddle 中的计划标识符。`returnTo` 方法接受一个 URL，你的用户在成功完成结帐后将被重定向到该 URL。

`create` 方法将创建一个支付链接，你可以使用它来生成一个支付按钮。可以使用 Cashier Paddle 附带的 `paddle-button` [Blade 组件](/docs/laravel/10.x/blade#components) 生成支付按钮：

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    订阅
</x-paddle-button>
```



用户完成结帐后，将从 Paddle 发送一个 `subscription_created` webhook。 Cashier 将收到此 webhook 并为你的客户设置订阅。为了确保你的应用程序正确接收和处理所有 webhook，请确保你正确地 [设置 webhook 处理](#handling-paddle-webhooks)。

<a name="additional-details"></a>
#### 额外细节

如果你想指定额外的客户或订阅详细信息，你可以通过将它们作为键 / 值对数组传递给 `create` 方法来实现。要了解有关 Paddle 支持的其他字段的更多信息，请查看 Paddle 关于 [生成支付链接](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink) 的文档：

    $payLink = $user->newSubscription('default', $monthly = 12345)
        ->returnTo(route('home'))
        ->create([
            'vat_number' => $vatNumber,
        ]);

<a name="subscriptions-coupons"></a>
#### 优惠券

如果你想在创建订阅时申请优惠券，你可以使用 `withCoupon` 方法：

    $payLink = $user->newSubscription('default', $monthly = 12345)
        ->returnTo(route('home'))
        ->withCoupon('code')
        ->create();

<a name="metadata"></a>
#### 元数据

你还可以使用 `withMetadata` 方法传递元数据数组：

    $payLink = $user->newSubscription('default', $monthly = 12345)
        ->returnTo(route('home'))
        ->withMetadata(['key' => 'value'])
        ->create();

> 注意：提供元数据时，请避免使用 `subscription_name` 作为元数据键。 此密钥保留供 Cashier 内部使用。

<a name="checking-subscription-status"></a>
### 检查订阅状态

一旦用户订阅了你的应用程序，你就可以使用各种便利的方法检查他们的订阅状态。 首先，如果用户有活动订阅，`subscribed` 方法返回 `true`，即使订阅当前处于试用期：

    if ($user->subscribed('default')) {
        // ...
    }



该 `subscribed` 方法也非常适合 [路由中间件](/docs/laravel/10.x/middleware)，允许你根据用户的订阅状态来过滤对路由和控制器的访问：

    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureUserIsSubscribed
    {
        /**
         * 处理请求。
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            if ($request->user() && ! $request->user()->subscribed('default')) {
                // 该用户不是付费用户。。。
                return redirect('billing');
            }

            return $next($request);
        }
    }

如果你想确定用户是否仍在试用期内，你可以使用 `onTrial` 方法。这个方法用于确定是否应向用户显示他们仍在试用期的警告：

    if ($user->subscription('default')->onTrial()) {
        // ...
    }

该 `subscribedToPlan` 方法可用于根据给定的 Paddle 计划 ID 来确定用户是否订阅了给定的计划。 在这个例子中，我们将确定用户的 `default` 订阅是否订阅了包月计划：

    if ($user->subscribedToPlan($monthly = 12345, 'default')) {
        // ...
    }

通过将数组传递给 `subscribedToPlan` 方法，你可以确定用户的 `default` 订阅是订阅月度计划或是年度计划：

    if ($user->subscribedToPlan([$monthly = 12345, $yearly = 54321], 'default')) {
        // ...
    }

该 `recurring` 方法可用于确定用户当前是否已订阅并且不是处于试用期：

    if ($user->subscription('default')->recurring()) {
        // ...
    }

<a name="cancelled-subscription-status"></a>


#### 已取消订阅状态

要确定用户是否曾经是订阅者但现在已取消订阅，你可以使用 `cancelled` 方法：

    if ($user->subscription('default')->cancelled()) {
        // ...
    }

你还可以确定用户是否已取消订阅，但在订阅完全到期之前会处于 「宽限期」。 例如，如果用户在 3 月 5 日取消原定于 3 月 10 日到期的订阅，则用户将处于「宽限期」，直到 3 月 10 日。 请注意，在此期间 `subscribed` 方法仍然返回 `true`：

    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }

确定用户是否已取消订阅并且不处于「宽限期」内，你可以使用 `ended` 方法：

    if ($user->subscription('default')->ended()) {
        // ...
    }

<a name="past-due-status"></a>
#### 逾期状态

如果订阅的付款失败，它将被标记为 `past_due`。当你的订阅处于此状态时，在客户更新其付款信息之前，它不会处于活动状态。你可以使用订阅实例上的 `pastDue` 方法来确定订阅是否过期：

    if ($user->subscription('default')->pastDue()) {
        // ...
    }

当订阅过期时，你应该指示用户 [更新他们的付款信息](#updating-payment-information)。 你可以在 [Paddle 订阅设置](https://vendors.paddle.com/subscription-settings) 中配置逾期订阅的处理方式。

如果你希望订阅在 `past_due` 时仍被视为活动，你可以使用 Cashier 提供的 `keepPastDueSubscriptionsActive` 方法。通常，此方法应在你的 `AppServiceProvider` 的 `register` 方法中调用：

    use Laravel\Paddle\Cashier;

    /**
     * 注册应用服务。
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
    }

> 注意：当订阅处于 `past_due` 状态时，在付款信息更新之前无法更改。 因此，当订阅处于 `past_due` 状态时，`swap` 和 `updateQuantity` 方法将抛出异常。



<a name="subscription-scopes"></a>
#### 订阅范围

大多数订阅状态也可用作查询范围，以便你可以轻松查询数据库中处于给定状态的订阅：

    // 获取所有有效订阅。。。
    $subscriptions = Subscription::query()->active()->get();

    // 获取给定用户的所有已取消订阅。。。
    $subscriptions = $user->subscriptions()->cancelled()->get();

可用范围的完整列表如下：

    Subscription::query()->active();
    Subscription::query()->onTrial();
    Subscription::query()->notOnTrial();
    Subscription::query()->pastDue();
    Subscription::query()->recurring();
    Subscription::query()->ended();
    Subscription::query()->paused();
    Subscription::query()->notPaused();
    Subscription::query()->onPausedGracePeriod();
    Subscription::query()->notOnPausedGracePeriod();
    Subscription::query()->cancelled();
    Subscription::query()->notCancelled();
    Subscription::query()->onGracePeriod();
    Subscription::query()->notOnGracePeriod();

<a name="subscription-single-charges"></a>
### 订阅单次收费

订阅单次收费允许你在订阅的基础上向订阅者收取一次性费用：

    $response = $user->subscription('default')->charge(12.99, 'Support Add-on');

与 [单一费用](#single-charges) 相比，此方法将立即向客户存储的订阅付款方式收费。 收费金额应始终以订阅的货币定义。

<a name="updating-payment-information"></a>
### 更新付款信息

Paddle 始终为每个订阅保存一种付款方式。 如果要更新订阅的默认付款方式，则应首先使用订阅模型上的 `updateUrl` 方法生成订阅 「更新 URL」：

    use App\Models\User;

    $user = User::find(1);

    $updateUrl = $user->subscription('default')->updateUrl();

然后，你可以将生成的 URL 与 Cashier 提供的 `paddle-button` Blade 组件结合使用，以允许用户启动 Paddle 小部件并更新他们的付款信息：

```html
<x-paddle-button :url="$updateUrl" class="px-8 py-4">
    更新付款信息
</x-paddle-button>
```



当用户更新完他们的信息后，Paddle 将发送一个 `subscription_updated` webhook，订阅详细信息将在你的应用数据库中更新。

<a name="changing-plans"></a>
### 改变计划

用户订阅你的应用程序后，他们可能偶尔想要更改为新的订阅计划。 要为用户更新订阅计划时，你应该将 Paddle 计划的标识符传递给订阅的 `swap` 方法：

    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->swap($premium = 34567);

如果你想变更计划并立即为用户开具发票，而不是等待他们的下一个计费周期，你可以使用 `swapAndInvoice` 方法：

    $user = User::find(1);

    $user->subscription('default')->swapAndInvoice($premium = 34567);

> 注意：试用活动期间不能变更计划。有关此限制的更多信息，请参阅 [Paddle 文档](https://developer.paddle.com/api-reference/subscription-api/users/updateuser#usage-notes)。

<a name="prorations"></a>
#### 按比例分配

默认情况下，Paddle 在计划变更时按比例分配费用。 `noProrate` 方法可用于在不按比例分配费用的情况下更新订阅：

    $user->subscription('default')->noProrate()->swap($premium = 34567);

<a name="subscription-quantity"></a>
### 订阅数量

有时订阅会受到 「数量」的影响。例如，项目管理应用可能对每个项目每月收费 10 美元。 要增加或减少订阅数量，请使用 `incrementQuantity` 和 `decrementQuantity` 方法：

    $user = User::find(1);

    $user->subscription('default')->incrementQuantity();

    // 订阅增加 5 个。。。
    $user->subscription('default')->incrementQuantity(5);

    $user->subscription('default')->decrementQuantity();

    // 订阅减少 5 个。。。
    $user->subscription('default')->decrementQuantity(5);



或者，你以使用 `updateQuantity` 方法设置特定数量：

    $user->subscription('default')->updateQuantity(10);

该 `noProrate` 方法可用于更新订阅数量而不按比例分配费用：

    $user->subscription('default')->noProrate()->updateQuantity(10);

<a name="subscription-modifiers"></a>
### 订阅修改器

订阅修改器允许你实施 [按量计费](https://developer.paddle.com/guides/how-tos/subscriptions/metered-billing#using-subscription-price-modifiers) 或使用附加组件扩展订阅。

例如，你可能想为标准订阅提供 「高级支持」附加组件。 你可以像这样创建这个修改器：

    $modifier = $user->subscription('default')->newModifier(12.99)->create();

The example above will add a $12.99 add-on to the subscription. By default, this charge will recur on every interval you have configured for the subscription. If you would like, you can add a readable description to the modifier using the modifier's `description` method:
上例将向订阅添加 $12.99 的附加组件。默认情况下，此费用将在你为订阅配置的每个时间周期内重复收取。 如果你愿意，可以使用修改器的 `description` 方法向修改器添加可读的描述：

    $modifier = $user->subscription('default')->newModifier(12.99)
        ->description('Premium Support')
        ->create();

为了说明如何使用修改器实现计量计费，假设你的应用程序要对用户发送的每条 SMS 消息收费。首先，你应该在 Paddle 仪表板中创建一个 $0 的计划。 用户订阅此计划后，你可以向订阅添加代表每个单独费用的修改器：

    $modifier = $user->subscription('default')->newModifier(0.99)
        ->description('New text message')
        ->oneTime()
        ->create();

如你所见，我们在创建此调节器时调用了 `oneTime` 方法。此方法将确保修改器只收费一次，并且不会在每个计费周期重复。

<a name="retrieving-modifiers"></a>
#### 检索修改器



你可以通过 `modifiers` 方法检索订阅的所有修改器列表：

    $modifiers = $user->subscription('default')->modifiers();

    foreach ($modifiers as $modifier) {
        $modifier->amount(); // $0.99
        $modifier->description; // 新的短信。
    }

<a name="deleting-modifiers"></a>
#### 删除修改器

修改器可以通过调用 `Laravel\Paddle\Modifier` 实例上的 `delete` 方法来删除：

    $modifier->delete();

<a name="multiple-subscriptions"></a>
### 多个订阅

Paddle 允许你的客户同时拥有多个订阅。例如，你可能经营一家健身房，提供游泳订阅和举重订阅，每个订阅可能有不同的定价。当然，客户应该能够订阅其中一项或两项计划。

当你的应用程序创建订阅时，你可以向 `newSubscription` 方法提供订阅的名称。该名称可以是表示用户正在发起的订阅类型的任何字符串：

    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $request->user()
            ->newSubscription('swimming', $swimmingMonthly = 12345)
            ->create($request->paymentMethodId);

        // ...
    });

在本例中，我们为客户发起了每月一次的游泳订阅。然而，他们可能想在以后换成每年订阅一次。当调整客户的订阅时，我们可以简单地交换`游泳`订阅的价格：

    $user->subscription('swimming')->swap($swimmingYearly = 34567);

当然，你也可以完全取消订阅：

    $user->subscription('swimming')->cancel();

<a name="pausing-subscriptions"></a>
### 暂停订阅

要暂停订阅，请调用用户订阅的 `pause` 方法：

    $user->subscription('default')->pause();

当订阅暂停时，Cashier 将自动在你的数据库中设置 `paused_from` 列。此列用于确定 `paused` 方法何时应该开始返回 `true`。例如，如果客户在 3 月 1 日暂停订阅，但该订阅直到 3 月 5 日才计划重复发生，则 `paused` 方法将继续返回 `false` ，直到 3 月 5 日。这样做是因为用户可以继续使用应用程序，直到他们的计费周期结束。


你可以使用 `onPausedGracePeriod` 方法确定用户是否已暂停订阅但仍处于 「宽限期」：

    if ($user->subscription('default')->onPausedGracePeriod()) {
        // ...
    }

要恢复暂停的订阅，你可以调用用户订阅的 `unpause` 方法：

    $user->subscription('default')->unpause();

> 注意：订阅暂停时无法修改。 如果你想切换到不同的计划或更新数量，你必须先恢复订阅。

<a name="cancelling-subscriptions"></a>
### 取消订阅

要取消订阅，请调用用户订阅的 `cancel` 方法：

    $user->subscription('default')->cancel();

当订阅被取消时，Cashier 将自动在你的数据库中设置 `ends_at` 列。 此列用于确定 `subscribed` 方法应该何时开始返回 `false`。例如，如果客户在 3 月 1 日取消订阅，但订阅计划在 3 月 5 日之前结束，则 `subscribed` 方法将在 3 月 5 日之前继续返回 `true`。这样做是因为通常允许用户继续使用应用程序，直到他们的计费周期结束。

你可以使用 `onGracePeriod` 方法确定用户是否已取消订阅但仍处于「宽限期」：

    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }

如果你想立即取消订阅，你可以调用用户订阅的 `cancelNow` 方法：

    $user->subscription('default')->cancelNow();

> 注意：取消后无法恢复 Paddle 的订阅。 如果你的客户希望恢复订阅，则他们必须重新订阅。



<a name="subscription-trials"></a>
## 订阅试用

<a name="with-payment-method-up-front"></a>
### 预先收集付费方式

> 注意：在预先试用和收集付款方式详细信息时，Paddle 会阻止任何订阅更改，例如更换计划或更新数量。 如果你想允许客户在试用期间更换计划，则必须取消并重新创建订阅。

如果你想为你的客户提供试用期，同时仍然预先收集付款方式信息，你应该在创建订阅付款链接时使用 `trialDays` 方法：

    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $payLink = $request->user()->newSubscription('default', $monthly = 12345)
                    ->returnTo(route('home'))
                    ->trialDays(10)
                    ->create();

        return view('billing', ['payLink' => $payLink]);
    });

此方法将在你的应用数据库中的订阅记录上设置试用期结束日期，并指示 Paddle 在此日期之后才开始向客户收费。

> 注意：如果客户的订阅未在试用结束日期之前取消，他们将在试用到期后立即收费，因此你务必将试用结束日期通知你的用户。

你可以使用用户实例的 `onTrial` 方法或订阅实例的 `onTrial` 方法来确定用户是否在试用期内。 下面的两个例子是一样的：

    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->onTrial()) {
        // ...
    }

要确定试用期是否已过期，你可以使用 `hasExpiredTrial` 方法：

    if ($user->hasExpiredTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->hasExpiredTrial()) {
        // ...
    }



<a name="defining-trial-days-in-paddle-cashier"></a>
#### 在 Paddle / Cashier 中定义试用天数

你可以选择在 Paddle 仪表板中定义你的计划接收的试用天数，或者始终使用 Cashier 明确传递它们。如果你选择在 Paddle 中定义计划的试用天数，你应该知道新订阅，包括过去订阅过的客户的新订阅，将始终获得试用期，除非你明确调用 `trialDays(0)` 方法。

<a name="without-payment-method-up-front"></a>
### 未预先收集付款方式

如果你想提供试用期而不预先收集用户的付款方式信息，你可以将附加到你的用户的客户记录上的 `trial_ends_at` 列设置为你想要的试用结束日期。这通常在用户注册期间完成：

    use App\Models\User;

    $user = User::create([
        // ...
    ]);

    $user->createAsCustomer([
        'trial_ends_at' => now()->addDays(10)
    ]);

Cashier 将这种类型的试用称为「通用试用」，因为它不附属于任何现有订阅。如果当前日期未超过 `trial_ends_at` 的值，则 `User` 实例上的 `onTrial` 方法将返回 `true`：

    if ($user->onTrial()) {
        // 用户在试用期内。。。
    }

一旦你准备好为用户创建一个实际的订阅，你可以像往常一样使用 `newSubscription` 方法：

    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $payLink = $user->newSubscription('default', $monthly = 12345)
            ->returnTo(route('home'))
            ->create();

        return view('billing', ['payLink' => $payLink]);
    });

要检索用户的试用结束日期，你可以使用 `trialEndsAt` 方法。如果用户正在试用，则此方法将返回一个 Carbon 日期实例，否则将返回 `null` 。如果你想获取特定订阅而不是默认订阅的试用结束日期，你还可以传递一个可选的订阅名称参数：

    if ($user->onTrial()) {
        $trialEndsAt = $user->trialEndsAt('main');
    }



如果你希望明确知道用户处于 「通用」试用期内并且尚未创建实际订阅，则可以使用 `onGenericTrial` 方法：

    if ($user->onGenericTrial()) {
        // 用户在通用试用期内。。。
    }

> 注意：创建 Paddle 订阅后，无法延长或修改其试用期。

<a name="handling-paddle-webhooks"></a>
## 处理 Paddle Webhooks

Paddle 可以通过 webhook 通知你的应用各种事件。默认情况下，指向 Cashier 的 webhook 控制器的路由由 Cashier 服务提供商注册。
该控制器将处理所有传入的 webhook 请求。

默认情况下，此控制器将自动处理付费失败过多的取消订阅（[由你的 Paddle 订阅设置定义](https://vendors.paddle.com/subscription-settings)）、订阅更新和付款方式更改；但是，我们很快就会发现，你可以扩展这个控制器来处理你喜欢的任何 Paddle webhook 事件。

为确保你的应用可以处理 Paddle webhooks，请务必 [在 Paddle 控制面板中配置 webhook URL](https://vendors.paddle.com/alerts-webhooks)。默认情况下，Cashier 的 webhook 控制器响应 `/paddle/webhook` URL 路径。你应该在 Paddle 控制面板中启用的所有 webhook 的完整列表是：

- 订阅创建
- 订阅更新
- 订阅取消
- 付款成功
- 订阅付款成功

> 注意：确保使用 Cashier 包含的 [webhook 签名验证](/docs/laravel/10.x/cashier-paddle#verifying-webhook-signatures) 中间件保护传入请求。

<a name="webhooks-csrf-protection"></a>
#### Webhook 和 CSRF 保护

由于 Paddle webhooks 需要绕过 Laravel 的 [CSRF 保护](/docs/laravel/10.x/csrf)，请务必在你的 `App\Http\Middleware\VerifyCsrfToken` 中间件中将 URI 作为例外列出或列出外面的路由 `web` 中间件组的：

    protected $except = [
        'paddle/*',
    ];



<a name="webhooks-local-development"></a>
#### Webhook 和本地开发

为了让 Paddle 能够在本地开发期间发送你的应用程序 webhook，你需要通过站点共享服务公开你的应用程序，例如 [Ngrok](https://ngrok.com/) 或 [Expose](https://expose.dev/docs/introduction)。如果你使用 [Laravel Sail](/docs/laravel/10.x/sail) 在本地开发应用程序，你可以使用 Sail 的 [站点共享命令](/docs/laravel/10.x/sail#sharing-your-site)。

<a name="defining-webhook-event-handlers"></a>
### 定义 webhook 事件处理程序

Cashier 会自动处理因收费失败和其他常见的 paddle webhook 取消订阅。 但是，如果你有其他想要处理的 webhook 事件，你可以通过监听 Cashier 调度的以下事件来实现：

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

这两个事件都包含 Paddle webhook 的完整负载。例如，如果你想处理 `invoice.payment_succeeded` webhook，你可以注册一个 [listener](/docs/laravel/10.x/events#defining-listeners) 来处理事件：

    <?php

    namespace App\Listeners;

    use Laravel\Paddle\Events\WebhookReceived;

    class PaddleEventListener
    {
        /**
         * 处理收到的 Paddle webhook。
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['alert_name'] === 'payment_succeeded') {
                // 处理传入事件。。。
            }
        }
    }

一旦你的监听器被定义，你可以在你的应用程序的 `EventServiceProvider` 中注册它：

    <?php

    namespace App\Providers;

    use App\Listeners\PaddleEventListener;
    use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
    use Laravel\Paddle\Events\WebhookReceived;

    class EventServiceProvider extends ServiceProvider
    {
        protected $listen = [
            WebhookReceived::class => [
                PaddleEventListener::class,
            ],
        ];
    }

Cashier 还会发出专用于接收到的 webhook 类型的事件。除了来自 Paddle 的完整有效负载之外，它们还包含用于处理 webhook 的相关模型，例如计费模型、订阅或收据：

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\PaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionPaymentSucceeded`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionCancelled`

</div>



你还可以通过在应用程序的 `.env` 文件中定义 `CASHIER_WEBHOOK` 环境变量来覆盖默认的内置 webhook 路由。此值应该是你的 webhook 路由中的完整 URL，并且需要和你在 Paddle 控制面板中设置的 URL 相匹配：

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### 验证 Webhook 签名

为了保护你的 webhook，你可以使用 [Paddle 的 webhook 签名](https://developer.paddle.com/webhook-reference/verifying-webhooks)。 为方便起见，Cashier 自动包含一个中间件，用于验证传入的 Paddle webhook 请求是否有效。

要启用 webhook 验证，请确保在应用程序的 .env 文件中定义了`PADDLE_PUBLIC_KEY` 环境变量。 可以从你的 Paddle 帐户仪表板中检索公钥。

<a name="single-charges"></a>
## 一次性收费

<a name="simple-charge"></a>
### 简单收费

如果你想对客户进行一次性收费，你可以在可计费模型实例上使用 `charge` 方法来生成收费的支付链接。`charge` 方法接受费用金额（浮点数）作为它的第一个参数和一个费用描述作为它的第二个参数：

    use Illuminate\Http\Request;

    Route::get('/store', function (Request $request) {
        return view('store', [
            'payLink' => $user->charge(12.99, 'Action Figure')
        ]);
    });

生成支付链接后，你可以使用 Cashier 提供的 `paddle-button` Blade 组件让用户启动 Paddle 小部件并完成收费：

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    Buy
</x-paddle-button>
```

`charge` 方法接受一个数组作为其第三个参数，允许你将任何你希望的选项传递给底层 Paddle 支付链接创建。请查阅 [Paddle 文档](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink) 了解更多关于创建费用时可用的选项：

    $payLink = $user->charge(12.99, 'Action Figure', [
        'custom_option' => $value,
    ]);



费用以 `cashier.currency` 配置选项中指定的货币进行。 默认设置是美元。 你可以通过在应用程序的 `.env` 文件中定义 `CASHIER_CURRENCY` 环境变量来覆盖默认货币：

```ini
CASHIER_CURRENCY=EUR
```

你还可以使用 Paddle 的动态定价匹配系统 [覆盖每种货币的价格](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink#price-overrides)。为此，请通过价格数组而不是固定金额：

    $payLink = $user->charge([
        'USD:19.99',
        'EUR:15.99',
    ], 'Action Figure');

<a name="charging-products"></a>
### 收费产品

如果你想对 Paddle 中配置的特定产品进行一次性收费，你可以在计费模型实例上使用 `chargeProduct` 方法来生成付款链接：

    use Illuminate\Http\Request;

    Route::get('/store', function (Request $request) {
        return view('store', [
            'payLink' => $request->user()->chargeProduct($productId = 123)
        ]);
    });

然后，你可以提供 `paddle-button` 组件的支付链接，以允许用户初始化 Paddle 小部件：

```blade
<x-paddle-button :url="$payLink" class="px-8 py-4">
    购买
</x-paddle-button>
```

`chargeProduct` 方法接受一个数组作为其第二个参数，允许你将任何你希望的选项传递给底层 Paddle 支付链接创建。 请查阅 [Paddle 文档](https://developer.paddle.com/api-reference/product-api/pay-links/createpaylink) 关于创建费用时可用的选项：

    $payLink = $user->chargeProduct($productId, [
        'custom_option' => $value,
    ]);

<a name="refunding-orders"></a>
### 退款订单

如果你需要对桨订单进行退款，你可以使用 `refund` 方法。 此方法接受 Paddle 订单 ID 作为其第一个参数。 你可以使用 `receipts` 方法检索给定计费模型的收据：

    use App\Models\User;

    $user = User::find(1);

    $receipt = $user->receipts()->first();

    $refundRequestId = $user->refund($receipt->order_id);



你可以选择指定具体的退款金额以及退款原因：

    $receipt = $user->receipts()->first();

    $refundRequestId = $user->refund(
        $receipt->order_id, 5.00, 'Unused product time'
    );

> 技巧：联系 Paddle 支持时，你可以使用 `$refundRequestId` 作为退款参考。

<a name="receipts"></a>
## 收据
你可以通过 `receipts` 属性轻松检索可计费模型的收据数组：

use App\Models\User;

    use App\Models\User;

    $user = User::find(1);

    $receipts = $user->receipts;

在为客户列出收据时，你可以使用收据实例的方法来显示相关的收据信息。 例如，你可能希望在表格中列出每张收据，以便用户轻松下载任何收据：

```html
<table>
    @foreach ($receipts as $receipt)
        <tr>
            <td>{{ $receipt->paid_at->toFormattedDateString() }}</td>
            <td>{{ $receipt->amount() }}</td>
            <td><a href="{{ $receipt->receipt_url }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="past-and-upcoming-payments"></a>
### 过去和未来的付款

你可以使用 `lastPayment` 和 `nextPayment` 方法来检索和显示客户过去或即将进行的定期订阅付款：

    use App\Models\User;

    $user = User::find(1);

    $subscription = $user->subscription('default');

    $lastPayment = $subscription->lastPayment();
    $nextPayment = $subscription->nextPayment();

这两种方法都会返回一个 `Laravel\Paddle\Payment` 的实例； 但是，当计费周期结束时（例如取消订阅时），`nextPayment` 将返回 `null`：

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="handling-failed-payments"></a>
## 处理失败的付款

订阅支付失败的原因有多种，例如卡过期或卡资金不足。 发生这种情况时，我们建议你让 Paddle 为你处理付款失败。具体来说，你可以在你的 Paddle 仪表板中 [设置 Paddle 的自动计费电子邮件](https://vendors.paddle.com/subscription-settings)





或者，你可以通过捕获 [`subscription_payment_failed`](https://developer.paddle.com/webhook-reference/subscription-alerts/subscription-payment-failed) webhook 并启用 “订阅付款失败” 来执行更精确的自定义 Paddle 仪表板的 Webhook 设置中的选项：

    <?php

    namespace App\Listeners;

    use Laravel\Paddle\Events\WebhookReceived;

    class PaddleEventListener
    {
        /**
         * 处理订阅付款失败。
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['alert_name'] === 'subscription_payment_failed') {
                // 处理订阅付款失败。。。
            }
        }
    }

一旦定义了监听器，就得在应用程序的 `EventServiceProvider` 中注册它：

    <?php

    namespace App\Providers;

    use App\Listeners\PaddleEventListener;
    use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
    use Laravel\Paddle\Events\WebhookReceived;

    class EventServiceProvider extends ServiceProvider
    {
        protected $listen = [
            WebhookReceived::class => [
                PaddleEventListener::class,
            ],
        ];
    }

<a name="testing"></a>
## 测试

在测试时，你应该手动测试你的计费流程，以确保你的集成按预期工作。

对于自动化测试，包括在 CI 环境中执行的测试，你可以使用 [Laravel 的 HTTP 客户端](/docs/laravel/10.x/http-client#testing) 来伪造对 Paddle 的 HTTP 调用。 尽管这不会测试来自 Paddle 的实际响应，但它确实提供了一种无需实际调用 Paddle API 即可测试你应用程序的方法。
