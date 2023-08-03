# Laravel Cashier (Stripe)

- [简介](#introduction)
- [升级 Cashier](#upgrading-cashier)
- [安装](#installation)
    - [数据库迁移](#database-migrations)
- [配置信息](#configuration)
    - [计费模型](#billable-model)
    - [API 密钥](#api-keys)
    - [货币配置](#currency-configuration)
    - [税务配置](#tax-configuration)
    - [日志](#logging)
    - [使用自定义模型](#using-custom-models)
- [消费者](#customers)
    - [获取消费者](#retrieving-customers)
    - [创建消费者](#creating-customers)
    - [更新消费者](#updating-customers)
    - [余额](#balances)
    - [税号](#tax-ids)
    - [使用 Stripe 同步客户数据](#syncing-customer-data-with-stripe)
    - [计费门户](#billing-portal)
- [支付方式](#payment-methods)
    - [存储支付方式](#storing-payment-methods)
    - [检索支付方式](#retrieving-payment-methods)
    - [判断用户是否有支付方式](#check-for-a-payment-method)
    - [更新默认支付方式](#updating-the-default-payment-method)
    - [添加支付方式](#adding-payment-methods)
    - [删除支付方式](#deleting-payment-methods)
- [订阅内容](#subscriptions)
    - [创建订阅](#creating-subscriptions)
    - [检查订阅状态](#checking-subscription-status)
    - [修改价格](#changing-prices)
    - [订阅数量](#subscription-quantity)
    - [多个产品的订阅](#subscriptions-with-multiple-products)
    - [多方案订阅计划](#multiprice-subscriptions)
    - [计量计费](#metered-billing)
    - [订阅税](#subscription-taxes)
    - [订阅锚定日期](#subscription-anchor-date)
    - [取消订阅](#cancelling-subscriptions)
    - [恢复订阅](#resuming-subscriptions)
- [订阅试用](#subscription-trials)
    - [预先使用付款方式](#with-payment-method-up-front)
    - [没有预先付款方式](#without-payment-method-up-front)
    - [延长试用期](#extending-trials)
- [处理 Stripe Webhooks](#handling-stripe-webhooks)
    - [定义 Webhook 事件处理器](#defining-webhook-event-handlers)
    - [验证 Webhook 签名](#verifying-webhook-signatures)
- [单次收费](#single-charges)
    - [基本使用](#simple-charge)
    - [带发票的支付](#charge-with-invoice)
    - [创建支付意向](#creating-payment-intents)
    - [退款](#refunding-charges)
- [结账](#checkout)
    - [产品结账](#product-checkouts)
    - [单次支付结账](#single-charge-checkouts)
    - [订阅结账](#subscription-checkouts)
    - [收集税号](#collecting-tax-ids)
    - [访客结账](#guest-checkouts)
- [发票](#invoices)
    - [获取发票](#retrieving-invoices)
    - [即将发布的发票](#upcoming-invoices)
    - [预览订阅发票](#previewing-subscription-invoices)
    - [生成发票 PDF](#generating-invoice-pdfs)
- [处理支付失败](#handling-failed-payments)
- [强大的客户身份验证 (SCA)](#strong-customer-authentication)
    - [需要额外确认的支付](#payments-requiring-additional-confirmation)
    - [非会话支付通知](#off-session-payment-notifications)
- [Stripe SDK](#stripe-sdk)
- [测试](#testing)



<a name="introduction"></a>
## 简介

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe) 为 [Stripe](https://stripe.com) 的订阅计费服务提供了一个富有表现力、流畅的接口。它处理了几乎所有你害怕编写的订阅计费样板代码。除了基本的订阅管理，Cashier 还可以处理优惠券、交换订阅、订阅 「数量」、取消宽限期，甚至生成发票 PDF。

<a name="upgrading-cashier"></a>
## 升级 Cashier

升级到新版本的 Cashier 时，请务必仔细阅读[升级指南](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.)。

> **注意**
> 为了防止破坏性变更，Cashier 使用固定的 Stripe API 版本。 Cashier 14 使用 Stripe API 版本 `2022-11-15` 。Stripe API 版本将在次要版本上更新，以利用新的 Stripe 功能和改进。

<a name="installation"></a>
## 安装

首先，使用 Composer 为 Stripe 安装 Cashier 扩展包：

```shell
composer require laravel/cashier
```
> **注意**
> 为确保 Cashier 正确处理所有 Stripe 事件，请记得[设置 Cashier 的 webhook](#handling-stripe-webhooks)。

<a name="database-migrations"></a>
### 数据库迁移

Cashier 的服务提供器注册了自己的数据库迁移目录，因此请记住在安装此包后迁移数据库。Cashier 迁移将向 `users` 表中添加多个列，并创建一个新的 `subscriptions` 表来保存客户的所有订阅：

```shell
php artisan migrate
```

如果需要覆盖 Cashier 附带的迁移，可以使用 `vendor:publish` Artisan 命令发布它们：

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

如果你想阻止 Cashier 的迁移完全运行，可以使用 Cashier 提供的`ignoreMigrations` 方法。通常应在 `AppServiceProvider` 类的 `register` 方法中调用此方法：

    use Laravel\Cashier\Cashier;

    /**
     * 注册任何应用程序服务。
     *
     */
    public function register(): void
    {
        Cashier::ignoreMigrations();
    }

> **注意**
>  Stripe 建议用于存储 Stripe 标识符的任何列都应区分大小写。因此，在使用 MySQL 时，应该确保将 `stripe_id` 列排序规则设置为 `utf8_bin` 。更多关于这方面的信息可以在 [Stripe 文档](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible)中找到。

<a name="configuration"></a>
## 配置

<a name="billable-model"></a>
### 订单模型

在使用 Cashier 之前，需要将 `Billable` trait 添加到可订单模型定义中。通常会放在 `App\Models\User` 模型中。这个特性提供了多个方法以便执行常用支付任务，如创建订阅、应用优惠券和更新支付方法信息：

    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }

Cashier 默认假设你的 Billable 模型是 Laravel 自带的 `App\Models\User` 类。如果需要修改可以在 `useCustomerModel` 方法定义一个不同的模型。通常此方法在 `AppServiceProvider` 类的`boot`方法中被调用：

    use App\Models\Cashier\User;
    use Laravel\Cashier\Cashier;

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        Cashier::useCustomerModel(User::class);
    }

> **注意**
> 如果你使用的不是 Laravel 自带的 `App\Models\User` 模型，需要发布并修改默认的 [Cashier 迁移](#installation)文件以匹配你使用模型对应的表名。

<a name="api-keys"></a>
### API 秘钥

接下来需要在 `.env` 文件中配置 Stripe 秘钥，可以在 Stripe 后台控制面板中获取Stripe API 秘钥：

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```
> **注意**
> 你应该确保在应用程序的`.env`文件中定义了`STRIPE_WEBHOOK_SECRET`环境变量，因为该变量用于确保传入的 Webhook 确实来自 Stripe。

<a name="currency-configuration"></a>
### 货币配置

Cashier 默认货币是美元 (USD)，可以在 `.env` 中设置 `CASHIER_CURRENCY` 环境变量来修改默认的货币配置：

```ini
CASHIER_CURRENCY=eur
```

除了配置 Cashier 的货币之外，还可以在格式化用于显示在发票上的金额时指定本地化配置。在底层，Cashier 使用了 [PHP 的 `NumberFormatter` 类](https://www.php.net/manual/en/class.numberformatter.php)来设置本地货币：

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> **注意**
> 为了使用本地化配置而不是 `en`，需要确保安装了 PHP `ext-intl` PHP 扩展并在服务器上启用配置。

<a name="tax-configuration"></a>
### 税务配置

感谢[Stripe  税务](https://stripe.com/tax)，可以自动计算 Stripe 生成的所有发票的税费。 可以通过应用程序的 `App\Providers\AppServiceProvider`类的 `boot` 方法中调用 `calculateTaxes` 来启用自动税务计算：

    use Laravel\Cashier\Cashier;

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        Cashier::calculateTaxes();
    }

启动税务计算后，任何新订阅和生成的一次性发票都会进行自动税务计算。

为了使这个功能正常使用，客户的账单明细中例如客户姓名、住址、发票 ID 需要同步到 Stripe。你可以使用 Cashier 提供的[客户数据同步](#syncing-customer-data-with-stripe)和 [Tax ID](#tax-ids) 方法来完成此操作。

> **注意**
> 对于[单次收费](#single-charges)或[单次支付结账](#single-charge-checkouts)，不支持计算税费。

<a name="logging"></a>
### 日志

Cashier 允许你指定日志通道来记录所有与 Stripe 相关的异常。可以通过在  `.env` 中配置 `CASHIER_LOGGER` 来指定：

```ini
CASHIER_LOGGER=stack
```

对 Stripe 的 API 调用生成的异常将通过应用程序的默认日志通道记录。

<a name="using-custom-models"></a>
### 使用自定义模型

你可以通过定义自己的模型并扩展相应的 `Cashier` 模型来自由扩展 Cashier 内部的模型，增加一些方法：

    use Laravel\Cashier\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }

定义模型后，可以通过 `Laravel\Cashier\Cashier` 类配置 Cashier 使用自定义的模型。通常还需要在 `App\Providers\AppServiceProvider` 类的 `boot` 中注册一下：

    use App\Models\Cashier\Subscription;
    use App\Models\Cashier\SubscriptionItem;

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        Cashier::useSubscriptionModel(Subscription::class);
        Cashier::useSubscriptionItemModel(SubscriptionItem::class);
    }

<a name="customers"></a>
## 消费者

<a name="retrieving-customers"></a>
### 获取消费者

你可以使用 `Cashier::findBillable` 方法通过 Stripe ID 查询消费者信息。该方法返回的是一个 billable 模型实例：

    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($stripeId);

<a name="creating-customers"></a>
### 创建客户

有时，你可能希望在不开始订阅的情况下创建一个 Stripe 客户。 你可以使用 `createAsStripeCustomer` 方法完成此操作：

    $stripeCustomer = $user->createAsStripeCustomer();

在 Stripe 中创建客户后，你可以在以后开始订阅。 你可以提供一个可选的 `$options` 数组来传递任何额外的 [Stripe API 支持的客户创建参数](https://stripe.com/docs/api/customers/create)：

    $stripeCustomer = $user->createAsStripeCustomer($options);

如果你想为计费模型返回 Stripe 客户对象，你可以使用 `asStripeCustomer` 方法：

    $stripeCustomer = $user->asStripeCustomer();

如果你想为给定的计费模型检索 Stripe 客户对象，但不确定该计费模型是否已经是 Stripe 中的客户，则可以使用 createOrGetStripeCustomer 方法。 如果尚不存在，此方法将在 Stripe 中创建一个新客户：

    $stripeCustomer = $user->createOrGetStripeCustomer();

<a name="updating-customers"></a>
### 更新客户

有时，你可能希望直接向 Stripe 客户更新其他信息。 你可以使用 `updateStripeCustomer` 方法完成此操作。 此方法接受一组 [Stripe API 支持的客户更新选项](https://stripe.com/docs/api/customers/update)：

    $stripeCustomer = $user->updateStripeCustomer($options);

<a name="balances"></a>
### 余额

Stripe 允许你贷记或借记客户的「余额」。 稍后，此余额将在新发票上贷记或借记。 要检查客户的总余额，你可以使用计费模型上提供的「余额」方法。 `balance` 方法将返回以客户货币表示的余额的格式化字符串表示形式：

    $balance = $user->balance();

要记入客户的余额，可以为该 `creditBalance` 方法提供一个值。如果你愿意，还可以提供描述：

    $user->creditBalance(500, 'Premium customer top-up.');

为该方法提供一个值 `debitBalance` 将从客户的余额中扣除：

    $user->debitBalance(300, 'Bad usage penalty.');

`applyBalance` 方法会创建一条客户余额流水记录。可以通过调用 `balanceTransactions` 方法获取余额交易记录，这有助于提供借记或贷记记录给客户查看：

    // 检索所有交易...
    $transactions = $user->balanceTransactions();

    foreach ($transactions as $transaction) {
        // 交易量...
        $amount = $transaction->amount(); // $2.31

        // 在可用的情况下检索相关发票...
        $invoice = $transaction->invoice();
    }

<a name="tax-ids"></a>
### 税号

Cashier 提供了一种管理客户税号的简便方法。`taxIds` 例如，`taxIds` 方法可用于检索作为集合分配给客户的所有[税号](https://stripe.com/docs/api/customer_tax_ids/object)：

    $taxIds = $user->taxIds();

你还可以通过标识符检索客户的特定税号：

    $taxId = $user->findTaxId('txi_belgium');

你可以通过向 `createTaxId` 方法提供有效的 [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) 和值来创建新的税号：

    $taxId = $user->createTaxId('eu_vat', 'BE0123456789');

`createTaxId` 方法将立即将增值税 ID 添加到客户的帐户中。 [增值税 ID 的验证也由 Stripe 完成](https://stripe.com/docs/invoicing/customer/tax-ids#validation)； 然而，这是一个异步的过程。 你可以通过订阅 `customer.tax_id.updated` webhook 事件并检查 [增值税 ID `verification` 参数](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification)。 有关处理 webhook 的更多信息，请参阅[有关定义 webhook 处理程序的文档](#handling-stripe-webhooks)。

你可以使用 `deleteTaxId` 方法删除税号：

    $user->deleteTaxId('txi_belgium');

<a name="syncing-customer-data-with-stripe"></a>
### 使用 Stripe 同步客户数据

通常，当你的应用程序的用户更新他们的姓名、电子邮件地址或其他也由 Stripe 存储的信息时，你应该通知 Stripe 更新。 这样一来，Stripe 的信息副本将与你的应用程序同步。

要自动执行此操作，你可以在计费模型上定义一个事件侦听器，以响应模型的`updated` 事件。然后，在你的事件监听器中，你可以在模型上调用 `syncStripeCustomerDetails` 方法：

    use App\Models\User;
    use function Illuminate\Events\queueable;

    /**
     * 模型的「引导」方法。
     */
    protected static function booted(): void
    {
        static::updated(queueable(function (User $customer) {
            if ($customer->hasStripeId()) {
                $customer->syncStripeCustomerDetails();
            }
        }));
    }

现在，每次更新你的客户模型时，其信息都会与 Stripe 同步。 为方便起见，Cashier 会在初始创建客户时自动将你客户的信息与 Stripe 同步。

你可以通过覆盖 Cashier 提供的各种方法来自定义用于将客户信息同步到 Stripe 的列。 例如，当 Cashier 将客户信息同步到 Stripe 时，你可以重写 `stripeName` 方法来自定义应该被视为客户「姓名」的属性：

    /**
     * 获取应同步到 Stripe 的客户名称。
     */
    public function stripeName(): string|null
    {
        return $this->company_name;
    }

同样，你可以复写 `stripeEmail`、`stripePhone` 和 `stripeAddress` 方法。 当[更新 Stripe 客户对象](https://stripe.com/docs/api/customers/update)时，这些方法会将信息同步到其相应的客户参数。 如果你希望完全控制客户信息同步过程，你可以复写 `syncStripeCustomerDetails` 方法。

<a name="billing-portal"></a>
### 订单入口

Stripe 提供了一个简单的方式来[设置订单入口](https://stripe.com/docs/billing/subscriptions/customer-portal)以便用户可以管理订阅、支付方法、以及查看历史账单。你可以在控制器或路由中使用 `redirectToBillingPortal` 方法将用户重定向到账单入口：

    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal();
    });

默认情况下，当用户完成对订阅的管理后，会将能够通过 Stripe 计费门户中的链接返回到应用的 home 路由，你可以通过传递 URL 作为 `redirectToBillingPortal` 方法的参数来自定义用户返回的 URL：

    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('billing'));
    });

如果你只想要生成订单入口的 URL，可以使用 `billingPortalUrl` 方法：

    $url = $request->user()->billingPortalUrl(route('billing'));

<a name="payment-methods"></a>
## 支付方式

<a name="storing-payment-methods"></a>
### 存储支付方式

为了使用 Stripe 创建订阅或者进行「一次性」支付，你需要存储支付方法并从 Stripe 中获取对应的标识符。这种方式可用于实现你是否计划使用这个支付方法进行订阅还是单次收费，下面我们分别来介绍这两种方法。

<a name="payment-methods-for-subscriptions"></a>
#### 订阅付款方式

当存储客户的信用卡信息以备将来订阅使用时，必须使用 Stripe「Setup Intents」API 来安全地收集客户的支付方式详细信息。 「Setup Intent」向 Stripe 指示向客户的付款方式收费的目的。 Cashier 的 `Billable` 特性包括 `createSetupIntent` 方法，可轻松创建新的设置目的。 你应该从将呈现收集客户付款方式详细信息的表单的路由或控制器调用此方法：

    return view('update-payment-method', [
        'intent' => $user->createSetupIntent()
    ]);

创建设置目的并将其传递给视图后，你应该将其秘密附加到将收集付款方式的元素。 例如，考虑这个「更新付款方式」表单：

```html
<input id="card-holder-name" type="text">

<!-- Stripe 元素占位符 -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    更新付款方式
</button>
```

接下来，可以使用 Stripe.js 库将 [Stripe 元素](https://stripe.com/docs/stripe-js) 附加到表单并安全地收集客户的付款详细信息：

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

接下来，可以验证卡并使用 [Stripe 的 `confirmCardSetup` 方法](https://stripe.com/docs/js/setup_intents/confirm_card_setup)从 Stripe 检索安全的「支付方式标识符」：

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');
const clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', async (e) => {
    const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        // 向用户显示「error.message」...
    } else {
        // 卡已验证成功...
    }
});
```

#### 订阅付款方式

存储客户的银行卡信息以备将来订阅时使用，必须使用 Stripe「Setup Intents」API 来安全地收集客户的支付方式详细信息。 「设置意图」 向Stripe 指示向客户的付款方式收费的目的。 Cashier 的 `Billable` 特性包括 `createSetupIntent` 方法，可轻松创建新的设置意图。你应该从路由或控制器调用此方法，该路由或控制器将呈现收集客户付款方法详细信息的表单:

    return view('update-payment-method', [
        'intent' => $user->createSetupIntent()
    ]);

创建设置意图并将其传递给视图后，你应该将其秘密附加到将收集付款方式的元素。 例如，考虑这个「更新付款方式」表单:

```html
<input id="card-holder-name" type="text">

<!-- Stripe 元素占位符 -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    更新付款方式
</button>
```

接下来，可以使用 Stripe.js 库将 [Stripe 元素](https://stripe.com/docs/stripe-js)附加到表单并安全地收集客户的付款详细信息:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

接下来，可以从 Stripe 搜索安全的「支付方式标识符」验证银行卡并使用 [Stripe 的 `confirmCardSetup` 方法](https://stripe.com/docs/js/setup_intents/confirm_card_setup):

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');
const clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', async (e) => {
    const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        // 向用户显示「error.message」...
    } else {
        // 该银行卡已验证成功...
    }
});
```

银行卡通过 Stripe 验证后，你可以将生成的 `setupIntent.payment_method` 标识符传递给你的 Laravel 应用程序，在那里它可以附加到客户。 付款方式可以[添加为新付款方式](#adding-payment-methods)或[用于更新默认付款方式](#updating-the-default-payment-method)。 你还可以立即使用付款方式标识符来[创建新订阅](#creating-subscriptions)。

> **技巧**  
> 如果你想了解有关设置目的和收集客户付款详细信息的更多信息，请[查看 Stripe 提供的概述](https://stripe.com/docs/payments/save-and-reuse#php)。

<a name="payment-methods-for-single-charges"></a>
#### 单笔费用的支付方式

当然，在针对客户的支付方式进行单笔收费时，我们只需要使用一次支付方式标识符。 由于 Stripe 的限制，你不能使用客户存储的默认付款方式进行单笔收费。 你必须允许客户使用 Stripe.js 库输入他们的付款方式详细信息。 例如，考虑以下形式：

```html
<input id="card-holder-name" type="text">

<!-- Stripe 元素占位符 -->
<div id="card-element"></div>

<button id="card-button">
    处理付款
</button>
```

定义这样的表单后，可以使用 Stripe.js 库将[Stripe 元素](https://stripe.com/docs/stripe-js)附加到表单并安全地收集客户的付款详细信息：

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

接下来，可以验证卡并使用 [Stripe 的 `createPaymentMethod` 方法](https://stripe.com/docs/stripe-js/reference#stripe-create-payment) 从 Stripe 检索安全的「支付方式标识符」-方法）：

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');

cardButton.addEventListener('click', async (e) => {
    const { paymentMethod, error } = await stripe.createPaymentMethod(
        'card', cardElement, {
            billing_details: { name: cardHolderName.value }
        }
    );

    if (error) {
        // 向用户显示「error.message」...
    } else {
        // 卡已验证成功...
    }
});
```

银行卡通过 Stripe 验证后，你可以将生成的 `setupIntent.payment_method` 标识符传递给你的 Laravel 应用程序，在那里它可以附加到客户。付款方式可以[添加为新付款方式](#adding-payment-methods)或[用于更新默认付款方式](#updating-the-default-payment-method)。 你还可以立即使用付款方式标识符来[创建新订阅](#creating-subscriptions)。

> **笔记**
> 如果你想了解有关设置目的和收集客户付款详细信息的更多信息，请[查看 Stripe 提供的概述](https://stripe.com/docs/payments/save-and-reuse#php).

<a name="payment-methods-for-single-charges"></a>
#### 单笔费用的支付方式

当然，在针对客户的支付方式进行单笔收费时，我们只需要使用一次支付方式标识符。 由于 Stripe 的限制，你不能使用客户存储的默认付款方式进行单笔收费。 你必须允许客户使用 Stripe.js 库输入他们的付款方式详细信息。 例如，考虑以下形式：

```html
<input id="card-holder-name" type="text">

<!-- Stripe 元素占位符 -->
<div id="card-element"></div>

<button id="card-button">
    付款流程
</button>
```

在定义了这样一个表单之后，可以使用 Stripe.js 库将 [Stripe Element](https://stripe.com/docs/stripe-js) 附加到表单并安全地收集客户的付款详细信息：

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

接下来，可以验证银行卡并使用 [Stripe 的 `createPaymentMethod` 方法](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method):

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');

cardButton.addEventListener('click', async (e) => {
    const { paymentMethod, error } = await stripe.createPaymentMethod(
        'card', cardElement, {
            billing_details: { name: cardHolderName.value }
        }
    );

    if (error) {
        // 向用户显示「error.message」...
    } else {
        // 该银行卡已验证成功...
    }
});
```

如果卡验证成功，你可以将 `paymentMethod.id` 传递给你的 Laravel 应用程序并处理[单次收费](#simple-charge)。

<a name="retrieving-payment-methods"></a>
### 检索付款方式

计费模型实例上的 `paymentMethods` 方法返回 `Laravel\Cashier\PaymentMethod` 实例的集合：

    $paymentMethods = $user->paymentMethods();

默认情况下，此方法将返回 `card` 类型的支付方式。要检索不同类型的付款方式，你可以将 `type` 作为参数传递给该方法：

    $paymentMethods = $user->paymentMethods('sepa_debit');

要检索客户的默认付款方式，可以使用 `defaultPaymentMethod` 方法：

    $paymentMethod = $user->defaultPaymentMethod();

你可以使用 `findPaymentMethod` 方法检索附加到计费模型的特定付款方式：

    $paymentMethod = $user->findPaymentMethod($paymentMethodId);

<a name="check-for-a-payment-method"></a>
### 确定用户是否有付款方式

要确定计费模型是否有附加到其帐户的默认付款方式，请调用 `hasDefaultPaymentMethod` 方法：

    if ($user->hasDefaultPaymentMethod()) {
        // ...
    }

你可以使用 `hasPaymentMethod` 方法来确定计费模型是否至少有一种支付方式附加到他们的账户：

    if ($user->hasPaymentMethod()) {
        // ...
    }

此方法将确定计费模型是否具有 `card` 类型的支付方式。 要确定该模型是否存在另一种类型的支付方式，你可以将 `type` 作为参数传递给该方法：

    if ($user->hasPaymentMethod('sepa_debit')) {
        // ...
    }

<a name="updating-the-default-payment-method"></a>
### 更新默认付款方式

`updateDefaultPaymentMethod` 方法可用于更新客户的默认支付方式信息。 此方法接受 Stripe 支付方式标识符，并将新支付方式指定为默认支付方式：

    $user->updateDefaultPaymentMethod($paymentMethod);

如果银行卡验证成功，你可以将`paymentMethod.id` 传递给你的 Laravel 应用程序并处理 [单次收费](#simple-charge).

<a name="retrieving-payment-methods"></a>
### 搜索付款方式

计费模型实例上的 `paymentMethods` 方法返回一组 `Laravel\Cashier\PaymentMethod` 实例：

    $paymentMethods = $user->paymentMethods();

默认情况下，此方法将返回 `card` 类型的支付方式。 要搜索不同类型的付款方式，你可以将 `type` 作为参数传递给该方法：

    $paymentMethods = $user->paymentMethods('sepa_debit');

要搜索客户的默认付款方式，可以使用 `defaultPaymentMethod` 方法：

    $paymentMethod = $user->defaultPaymentMethod();

你可以使用 `findPaymentMethod` 方法搜索附加到计费模型的特定付款方式：

    $paymentMethod = $user->findPaymentMethod($paymentMethodId);

<a name="check-for-a-payment-method"></a>
### 确定用户是否有付款方式

要确定计费模型是否有附加到其帐户的默认付款方式，请调用 `hasDefaultPaymentMethod` 方法：

    if ($user->hasDefaultPaymentMethod()) {
        // ...
    }

你可以 `hasPaymentMethod` 方法来确定计费模型是否至少有一种支付方式附加到他们的帐户：

    if ($user->hasPaymentMethod()) {
        // ...
    }

此方法将确定计费模型是否具有 `card` 类型的支付方式。 要确定该模型是否存在另一种类型的支付方式，你可以将 `type` 作为参数传递给该方法：

    if ($user->hasPaymentMethod('sepa_debit')) {
        // ...
    }

<a name="updating-the-default-payment-method"></a>
### 更新默认付款方式

`updateDefaultPaymentMethod` 方法可用于更新客户的默认支付方式信息。 此方法接受 Stripe 付款方式标识符，并将新付款方式指定为默认付款方式：

    $user->updateDefaultPaymentMethod($paymentMethod);

要将你的默认支付方式信息与客户在 Stripe 中的默认支付方式信息同步，你可以使用 `updateDefaultPaymentMethodFromStripe` 方法：

    $user->updateDefaultPaymentMethodFromStripe();

> **注意**  
> 客户的默认付款方式只能用于开具发票和创建新订阅。 由于 Stripe 施加的限制，它可能无法用于单次收费。

<a name="adding-payment-methods"></a>
### 添加付款方式

要添加新的支付方式，你可以在计费模型上调用 `addPaymentMethod` 方法，并传递支付方式标识符：

    $user->addPaymentMethod($paymentMethod);

> **技巧**  
> 要了解如何检索付款方式标识符，请查看[付款方式存储文档](#storing-payment-methods)。

<a name="deleting-payment-methods"></a>
### 删除付款方式

要删除付款方式，你可以在要删除的 `Laravel\Cashier\PaymentMethod` 实例上调用 `delete` 方法：

    $paymentMethod->delete();

`deletePaymentMethod` 方法将从计费模型中删除特定的支付方式：

    $user->deletePaymentMethod('pm_visa');

`deletePaymentMethods` 方法将删除计费模型的所有付款方式信息：

    $user->deletePaymentMethods();

默认情况下，此方法将删除 `card` 类型的支付方式。 要删除不同类型的付款方式，你可以将 `type` 作为参数传递给该方法：

    $user->deletePaymentMethods('sepa_debit');

> **注意**  
> 如果用户有一个有效的订阅，你的应用程序不应该允许他们删除他们的默认支付方式。

<a name="subscriptions"></a>
## 订阅

订阅提供了一种为你的客户设置定期付款的方法。 Cashier 管理的 Stripe 订阅支持多种订阅价格、订阅数量、试用等。

<a name="creating-subscriptions"></a>
### 创建订阅

要创建订阅，首先检索你的计费模型的实例，通常是 `App\Models\User` 的实例。 检索到模型实例后，你可以使用 `newSubscription` 方法创建模型的订阅：

    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription(
            'default', 'price_monthly'
        )->create($request->paymentMethodId);

        // ...
    });

传递给 `newSubscription` 方法的第一个参数应该是订阅的内部名称。 如果你的应用程序仅提供单一订阅，你可以称其为 `default` 或 `primary`。 此订阅名称仅供内部应用程序使用，无意向用户显示。 此外，它不应包含空格，并且在创建订阅后绝不能更改。 第二个参数是用户订阅的具体价格。 该值应对应于 Stripe 中的价格标识符。

`create` 方法接受 [Stripe 支付方式标识](#storing-payment-methods)或 Stripe `PaymentMethod` 对象，将开始订阅并使用计费模型的 Stripe 客户 ID 和其他相关信息更新你的数据库账单信息。

> **注意**  
> 将支付方式标识符直接传递给 `create` 订阅方法也会自动将其添加到用户存储的支付方式中。

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### 通过发票电子邮件收取定期付款

你可以指示 Stripe 在每次定期付款到期时通过电子邮件向客户发送发票，而不是自动收取客户的经常性付款。 然后，客户可以在收到发票后手动支付。 通过发票收取经常性付款时，客户无需预先提供付款方式：

    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice();

客户在取消订阅之前必须支付发票的时间由 `days_until_due` 选项决定。 默认情况下，这是 30 天； 但是，如果你愿意，可以为此选项提供特定值：

    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
        'days_until_due' => 30
    ]);

<a name="subscription-quantities"></a>
#### 数量

如果你想在创建订阅时为价格设置特定的[数量](https://stripe.com/docs/billing/subscriptions/quantities)，你应该在创建之前调用订阅构建器上的 `quantity` 方法 订阅：

    $user->newSubscription('default', 'price_monthly')
         ->quantity(5)
         ->create($paymentMethod);

<a name="additional-details"></a>
#### 其它详细信息

如果你想指定支持的其他[客户](https://stripe.com/docs/api/customers/create)或[订阅](https://stripe.com/docs/api/subscriptions/create)选项 通过 Stripe，你可以通过将它们作为第二个和第三个参数传递给 `create` 方法来实现：

    $user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
        'email' => $email,
    ], [
        'metadata' => ['note' => 'Some extra information.'],
    ]);

<a name="coupons"></a>
#### 优惠券

如果你想在创建订阅时使用优惠券，你可以使用 `withCoupon` 方法：

    $user->newSubscription('default', 'price_monthly')
         ->withCoupon('code')
         ->create($paymentMethod);

或者，如果你想应用 [Stripe 促销代码](https://stripe.com/docs/billing/subscriptions/discounts/codes)，你可以使用 `withPromotionCode` 方法：

    $user->newSubscription('default', 'price_monthly')
         ->withPromotionCode('promo_code_id')
         ->create($paymentMethod);

给定的促销代码 ID 应该是分配给促销代码的 Stripe API ID，而不是面向客户的促销代码。 如果你需要根据给定的面向客户的促销代码查找促销代码 ID，你可以使用 `findPromotionCode` 方法：

    // 通过面向客户的代码查找促销代码 ID...
    $promotionCode = $user->findPromotionCode('SUMMERSALE');

    // 通过面向客户的代码查找有效的促销代码 ID...
    $promotionCode = $user->findActivePromotionCode('SUMMERSALE');



在上面的示例中，返回的 `$promotionCode` 对象是 `Laravel\Cashier\PromotionCode` 的一个实例。 这个类装饰了一个底层的 `Stripe\PromotionCode` 对象。 你可以通过调用 `coupon` 方法来检索与促销代码相关的优惠券：

    $coupon = $user->findPromotionCode('SUMMERSALE')->coupon();

优惠券实例允许你确定折扣金额以及优惠券是代表固定折扣还是基于百分比的折扣：

    if ($coupon->isPercentage()) {
        return $coupon->percentOff().'%'; // 21.5%
    } else {
        return $coupon->amountOff(); // $5.99
    }

你还可以检索当前应用于客户或订阅的折扣：

    $discount = $billable->discount();

    $discount = $subscription->discount();

返回的 `Laravel\Cashier\Discount` 实例装饰底层的 `Stripe\Discount` 对象实例。 你可以通过调用 `coupon` 方法获取与此折扣相关的优惠券：

    $coupon = $subscription->discount()->coupon();

如果你想将新的优惠券或促销代码应用于客户或订阅，你可以通过 `applyCoupon` 或 `applyPromotionCode` 方法进行：

    $billable->applyCoupon('coupon_id');
    $billable->applyPromotionCode('promotion_code_id');

    $subscription->applyCoupon('coupon_id');
    $subscription->applyPromotionCode('promotion_code_id');

请记住，你应该使用分配给促销代码的 Stripe API ID，而不是面向客户的促销代码。 在给定时间只能将一个优惠券或促销代码应用于客户或订阅。

有关此主题的更多信息，请参阅有关[优惠券](https://stripe.com/docs/billing/subscriptions/coupons)和[促销代码](https://stripe.com/docs/billing)的 Stripe 文档 /订阅/优惠券/代码）。

<a name="adding-subscriptions"></a>
#### 添加订阅

如果你想向已有默认付款方式的客户添加订阅，你可以在订阅构建器上调用 `add` 方法：

    use App\Models\User;

    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->add();

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### 从 Stripe 仪表板创建订阅

你还可以从 Stripe 仪表板本身创建订阅。 这样做时，Cashier 将同步新添加的订阅并为其分配一个名称 `default`。 要自定义分配给仪表板创建的订阅的订阅名称，[扩展 `WebhookController`](#defining-webhook-event-handlers)并覆盖 `newSubscriptionName` 方法。

此外，你只能通过 Stripe 仪表板创建一种类型的订阅。 如果你的应用程序提供多个使用不同名称的订阅，则只能通过 Stripe 仪表板添加一种类型的订阅。

最后，你应该始终确保你的应用程序提供的每种订阅类型只添加一个活动订阅。 如果客户有两个 `default` 订阅，Cashier 只会使用最近添加的订阅，即使两者都会与你的应用程序数据库同步。

<a name="checking-subscription-status"></a>
### 检查订阅状态

客户订阅你的应用程序后，你可以使用各种方便的方法轻松检查他们的订阅状态。 首先，如果客户有有效订阅， `subscribed` 方法会返回 `true` ，即使该订阅当前处于试用期内。 `subscribed` 方法接受订阅的名称作为它的第一个参数：

    if ($user->subscribed('default')) {
        // ...
    }

`subscribed` 方法也非常适合[路由中间件](/docs/laravel/10.x/middleware)，允许你根据用户的订阅状态过滤对路由和控制器的访问：

    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureUserIsSubscribed
    {
        /**
         * 处理传入请求。
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            if ($request->user() && ! $request->user()->subscribed('default')) {
                // 该用户不是付费客户...
                return redirect('billing');
            }

            return $next($request);
        }
    }

如果你想确定用户是否仍在试用期内，你可以使用 `onTrial` 方法。 此方法可用于确定是否应向用户显示他们仍在试用期的警告：

    if ($user->subscription('default')->onTrial()) {
        // ...
    }

`subscribedToProduct` 方法可用于根据给定的 Stripe 产品标识符确定用户是否订阅了给定的产品。 在 Stripe 中，产品是价格的集合。 在此示例中，我们将确定用户的 `default` 订阅是否主动订阅了应用程序的「高级」产品。 给定的 Stripe 产品标识符应与你在 Stripe 仪表板中的产品标识符之一相对应：

    if ($user->subscribedToProduct('prod_premium', 'default')) {
        // ...
    }

通过将数组传递给 `subscribedToProduct` 方法，你可以确定用户的 `default` 订阅是否主动订阅了应用程序的「基本」或「高级」产品：

    if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
        // ...
    }

`subscribedToPrice` 方法可用于确定客户的订阅是否对应于给定的价格 ID：

    if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
        // ...
    }

`recurring` 方法可用于确定用户当前是否已订阅并且不再处于试用期内：

    if ($user->subscription('default')->recurring()) {
        // ...
    }

> **注意**  
> 如果用户有两个同名订阅，则 `subscription` 方法将始终返回最近的订阅。 例如，一个用户可能有两个名为 `default`的订阅记录； 但是，其中一个订阅可能是旧的、过期的订阅，而另一个是当前的、有效的订阅。 最近的订阅将始终返回，而较旧的订阅将保留在数据库中以供历史审查。

<a name="cancelled-subscription-status"></a>
#### 取消订阅状态

要确定用户是否曾经是活跃订阅者但已取消订阅，你可以使用 `canceled` 方法：

    if ($user->subscription('default')->canceled()) {
        // ...
    }

你还可以确定用户是否已取消他们的订阅，但在订阅完全到期之前是否仍处于「宽限期」。 例如，如果用户在 3 月 5 日取消了原定于 3 月 10 日到期的订阅，则用户在 3 月 10 日之前处于「宽限期」。 请注意，`subscribed` 方法在此期间仍会返回 `true`：

    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }

要确定用户是否已取消订阅并且不再处于「宽限期」内，你可以使用 `ended` 方法：

    if ($user->subscription('default')->ended()) {
        // ...
    }

<a name="incomplete-and-past-due-status"></a>
#### 不完整和逾期状态

如果订阅在创建后需要二次支付操作，订阅将被标记为「不完整」。 订阅状态存储在 Cashier 的 `subscriptions` 数据库表的 `stripe_status` 列中。

同样，如果在交换价格时需要二次支付操作，订阅将被标记为 `past_due` 。 当你的订阅处于这些状态中的任何一种时，在客户确认付款之前，它不会激活。 可以使用计费模型或订阅实例上的  `hasIncompletePayment` 方法来确定订阅是否有未完成的付款：

    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }

当订阅有未完成的付款时，你应该将用户引导至 Cashier 的付款确认页面，并传递 `latestPayment` 标识符。 你可以使用订阅实例上可用的 `latestPayment` 方法来检索此标识符：

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    请确认你的付款。
</a>
```

如果你希望订阅在处于 `past_due` 或 `incomplete` 状态时仍被视为有效，你可以使用 Cashier 提供的 `keepPastDueSubscriptionsActive` 和 `keepIncompleteSubscriptionsActive` 方法。 通常，应在 `App\Providers\AppServiceProvider` 的 `register` 方法中调用这些方法：

    use Laravel\Cashier\Cashier;

    /**
     * 注册任何应用程序服务。
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
        Cashier::keepIncompleteSubscriptionsActive();
    }

> **注意**  
> 当订阅处于 `incomplete` 状态时，在确认付款之前无法更改。 因此，当订阅处于 `incomplete` 状态时， `swap` 和 `updateQuantity` 方法将抛出异常。

<a name="subscription-scopes"></a>
#### 订阅范围

大多数订阅状态也可用作查询范围，以便你可以轻松查询数据库以查找处于给定状态的订阅：

    // 获取所有活动订阅...
    $subscriptions = Subscription::query()->active()->get();

    // 获取用户所有已取消的订阅...
    $subscriptions = $user->subscriptions()->canceled()->get();

可用范围的完整列表如下：

    Subscription::query()->active();
    Subscription::query()->canceled();
    Subscription::query()->ended();
    Subscription::query()->incomplete();
    Subscription::query()->notCanceled();
    Subscription::query()->notOnGracePeriod();
    Subscription::query()->notOnTrial();
    Subscription::query()->onGracePeriod();
    Subscription::query()->onTrial();
    Subscription::query()->pastDue();
    Subscription::query()->recurring();

<a name="changing-prices"></a>
### 更改价格

客户订阅你的应用程序后，他们可能偶尔想要更改为新的订阅价格。 要将客户换成新价格，请将 Stripe 价格的标识符传递给 `swap` 方法。 交换价格时，假设用户想要重新激活他们的订阅（如果之前已取消订阅）。 给定的价格标识符应对应于 Stripe 仪表板中可用的 Stripe 价格标识符：

    use App\Models\User;

    $user = App\Models\User::find(1);

    $user->subscription('default')->swap('price_yearly');

如果客户处于试用期，则将保持试用期。 此外，如果订阅存在「数量」，则也将保留该数量。

如果你想交换价格并取消客户当前的任何试用期，你可以调用 `skipTrial` 方法：

    $user->subscription('default')
            ->skipTrial()
            ->swap('price_yearly');

如果你想交换价格并立即向客户开具发票而不是等待他们的下一个结算周期，你可以使用 `swapAndInvoice` 方法：

    $user = User::find(1);

    $user->subscription('default')->swapAndInvoice('price_yearly');

<a name="prorations"></a>
#### 按比例分配

默认情况下，Stripe 在价格之间交换时按比例分配费用。 `noProrate` 方法可用于在不按比例分配费用的情况下更新订阅价格：

    $user->subscription('default')->noProrate()->swap('price_yearly');

有关订阅按比例分配的更多信息，请参阅 [Stripe 文档](https://stripe.com/docs/billing/subscriptions/prorations)。

> **注意**  
> 在 `swapAndInvoice` 方法之前执行 `noProrate` 方法将不会影响按比例分配。 将始终开具发票。

<a name="subscription-quantity"></a>
### 认购数量

有时订阅会受到「数量」的影响。 例如，项目管理应用程序可能对每个项目收取每月 10 美元的费用。 你可以使用 `incrementQuantity` 和 `decrementQuantity` 方法轻松增加或减少你的订阅数量：

    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->incrementQuantity();

    // 向订阅的当前数量添加五个...
    $user->subscription('default')->incrementQuantity(5);

    $user->subscription('default')->decrementQuantity();

    // 从订阅的当前数量中减去五...
    $user->subscription('default')->decrementQuantity(5);

或者，你可以使用 `updateQuantity` 方法设置特定数量：

    $user->subscription('default')->updateQuantity(10);

`noProrate` 方法可用于在不按比例分配费用的情况下更新订阅的数量：

    $user->subscription('default')->noProrate()->updateQuantity(10);

有关订阅数量的更多信息，请参阅 [Stripe 文档](https://stripe.com/docs/subscriptions/quantities)。

<a name="quantities-for-subscription-with-multiple-products"></a>
#### 多个产品的订阅数量

如果你的订阅是[包含多个产品的订阅](#subscriptions-with-multiple-products)，你应该将你希望增加或减少的数量的价格 ID 作为第二个参数传递给增量/减量方法：

    $user->subscription('default')->incrementQuantity(1, 'price_chat');

<a name="subscriptions-with-multiple-products"></a>
### 订阅多个产品

[订阅多个产品](https://stripe.com/docs/billing/subscriptions/multiple-products)允许你将多个计费产品分配给一个订阅。 例如，假设你正在构建一个客户服务「帮助台」应用程序，其基本订阅价格为每月 10 美元，但提供实时聊天附加产品，每月额外收费 15 美元。 包含多个产品的订阅信息存储在 Cashier 的 `subscription_items` 数据库表中。

你可以通过将价格数组作为第二个参数传递给 `newSubscription` 方法来为给定订阅指定多个产品：

    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', [
            'price_monthly',
            'price_chat',
        ])->create($request->paymentMethodId);

        // ...
    });

在上面的例子中，客户将有两个附加到他们的 `default` 订阅的价格。 两种价格都将按各自的计费间隔收取。 如有必要，你可以使用 `quantity` 方法为每个价格指定具体数量：

    $user = User::find(1);

    $user->newSubscription('default', ['price_monthly', 'price_chat'])
        ->quantity(5, 'price_chat')
        ->create($paymentMethod);

如果你想为现有订阅添加另一个价格，你可以调用订阅的 `addPrice` 方法：

    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat');

上面的示例将添加新价格，客户将在下一个计费周期为此付费。 如果你想立即向客户开具账单，你可以使用 `addPriceAndInvoice` 方法：

    $user->subscription('default')->addPriceAndInvoice('price_chat');

如果你想添加具有特定数量的价格，你可以将数量作为 `addPrice` 或 `addPriceAndInvoice` 方法的第二个参数传递：

    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat', 5);

你可以使用 `removePrice` 方法从订阅中删除价格：

    $user->subscription('default')->removePrice('price_chat');

> **注意**  
> 你不得删除订阅的最后价格。 相反，你应该简单地取消订阅。

<a name="swapping-prices"></a>
#### 交换价格

你还可以更改附加到具有多个产品的订阅的价格。 例如，假设客户订阅了带有 `price_chat` 附加产品的 `price_basic` 订阅，而你想要将客户从 `price_basic` 升级到 `price_pro` 价格：

    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->swap(['price_pro', 'price_chat']);

执行上述示例时，删除带有 `price_basic` 的基础订阅项，保留带有 `price_chat` 的订阅项。 此外，还会为 `price_pro` 创建一个新的订阅项目。

你还可以通过将键/值对数组传递给 `swap` 方法来指定订阅项选项。 例如，你可能需要指定订阅价格数量：

    $user = User::find(1);

    $user->subscription('default')->swap([
        'price_pro' => ['quantity' => 5],
        'price_chat'
    ]);

如果你想交换订阅的单一价格，你可以在订阅项目本身上使用 `swap` 方法。 如果你想保留订阅的其他价格的所有现有元数据，此方法特别有用：

    $user = User::find(1);

    $user->subscription('default')
            ->findItemOrFail('price_basic')
            ->swap('price_pro');

<a name="proration"></a>
#### 按比例分配

默认情况下，Stripe 会在为多个产品的订阅添加或删除价格时按比例收费。 如果你想在不按比例分配的情况下进行价格调整，你应该将 `noProrate` 方法链接到你的价格操作中：

    $user->subscription('default')->noProrate()->removePrice('price_chat');

<a name="swapping-quantities"></a>
#### 数量

如果你想更新单个订阅价格的数量，你可以使用[现有数量方法](#subscription-quantity) 将价格名称作为附加参数传递给该方法：

    $user = User::find(1);

    $user->subscription('default')->incrementQuantity(5, 'price_chat');

    $user->subscription('default')->decrementQuantity(3, 'price_chat');

    $user->subscription('default')->updateQuantity(10, 'price_chat');

> **注意**  
> 当订阅有多个价格时，`Subscription` 模型上的 `stripe_price` 和 `quantity` 属性将为 `null`。 要访问单个价格属性，你应该使用 `Subscription` 模型上可用的 `items` 关系。

<a name="subscription-items"></a>
#### 订阅项目

当订阅有多个价格时，它会在数据库的 `subscription_items` 表中存储多个订阅 `items`。 你可以通过订阅上的 `items` 关系访问这些：

    use App\Models\User;

    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->items->first();

    // 检索特定商品的 Stripe 价格和数量...
    $stripePrice = $subscriptionItem->stripe_price;
    $quantity = $subscriptionItem->quantity;

你还可以使用 `findItemOrFail` 方法检索特定价格：

    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');

<a name="multiple-subscriptions"></a>
### 多个订阅

Stripe 允许你的客户同时拥有多个订阅。 例如，你可能经营一家提供游泳订阅和举重订阅的健身房，并且每个订阅可能有不同的定价。 当然，客户应该能够订阅其中一个或两个计划。

当你的应用程序创建订阅时，你可以将订阅的名称提供给 `newSubscription` 方法。 该名称可以是表示用户正在启动的订阅类型的任何字符串：

    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $request->user()->newSubscription('swimming')
            ->price('price_swimming_monthly')
            ->create($request->paymentMethodId);

        // ...
    });

在此示例中，我们为客户发起了每月一次的游泳订阅。 但是，他们以后可能想换成按年订阅。 在调整客户的订阅时，我们可以简单地交换 `swimming` 订阅的价格：

    $user->subscription('swimming')->swap('price_swimming_yearly');

当然，你也可以完全取消订阅：

    $user->subscription('swimming')->cancel();

<a name="metered-billing"></a>
### 计量计费

[计量计费](https://stripe.com/docs/billing/subscriptions/metered-billing) 允许你根据客户在计费周期内的产品使用情况向客户收费。 例如，你可以根据客户每月发送的短信或电子邮件的数量向客户收费。

要开始使用计量计费，你首先需要在 Stripe 控制面板中创建一个具有计量价格的新产品。 然后，使用 `meteredPrice` 将计量价格 ID 添加到客户订阅：

    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default')
            ->meteredPrice('price_metered')
            ->create($request->paymentMethodId);

        // ...
    });

你还可以通过 [Stripe Checkout](#checkout) 开始计量订阅：

    $checkout = Auth::user()
            ->newSubscription('default', [])
            ->meteredPrice('price_metered')
            ->checkout();

    return view('your-checkout-view', [
        'checkout' => $checkout,
    ]);

<a name="reporting-usage"></a>
#### 报告使用情况

当你的客户使用你的应用程序时，你将向 Stripe 报告他们的使用情况，以便他们可以准确地计费。 要增加计量订阅的使用，你可以使用 `reportUsage` 方法：

    $user = User::find(1);

    $user->subscription('default')->reportUsage();

默认情况下，「使用数量」1 会添加到计费周期。 或者，你可以传递特定数量的「使用量」以添加到客户在计费期间的使用量中：

    $user = User::find(1);

    $user->subscription('default')->reportUsage(15);

如果你的应用程序在单个订阅中提供多个价格，你将需要使用 `reportUsageFor` 方法来指定你要报告使用情况的计量价格：

    $user = User::find(1);

    $user->subscription('default')->reportUsageFor('price_metered', 15);

有时，你可能需要更新之前报告的使用情况。 为此，你可以将时间戳或 `DateTimeInterface` 实例作为第二个参数传递给 `reportUsage`。 这样做时，Stripe 将更新在给定时间报告的使用情况。 你可以继续更新以前的使用记录，因为给定的日期和时间仍在当前计费周期内：

    $user = User::find(1);

    $user->subscription('default')->reportUsage(5, $timestamp);

<a name="retrieving-usage-records"></a>
#### 检索使用记录

要检索客户过去的使用情况，你可以使用订阅实例的 `usageRecords` 方法：

    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecords();

如果你的应用程序为单个订阅提供多个价格，你可以使用 `usageRecordsFor` 方法指定你希望检索使用记录的计量价格：

    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');

`usageRecords` 和 `usageRecordsFor` 方法返回一个包含使用记录关联数组的 Collection 实例。 你可以遍历此数组以显示客户的总使用量：

    @foreach ($usageRecords as $usageRecord)
        - Period Starting: {{ $usageRecord['period']['start'] }}
        - Period Ending: {{ $usageRecord['period']['end'] }}
        - Total Usage: {{ $usageRecord['total_usage'] }}
    @endforeach

有关返回的所有使用数据的完整参考以及如何使用 Stripe 基于游标的分页，请参阅[官方 Stripe API 文档](https://stripe.com/docs/api/usage_records/subscription_item_summary_list)。

<a name="subscription-taxes"></a>
### 订阅税

> **注意**  
> 你可以[使用 Stripe Tax 自动计算税费](#tax-configuration)，而不是手动计算税率

要指定用户为订阅支付的税率，你应该在计费模型上实施 `taxRates` 方法并返回一个包含 Stripe 税率 ID 的数组。你可以在[你的 Stripe 控制面板](https://dashboard.stripe.com/test/tax-rates) 中定义这些税率：

    /**
     * 适用于客户订阅的税率。
     *
     * @return array<int, string>
     */
    public function taxRates(): array
    {
        return ['txr_id'];
    }

`taxRates` 方法使你能够在逐个客户的基础上应用税率，这对于跨越多个国家和税率的用户群可能会有所帮助。

如果你提供多种产品的订阅，你可以通过在计费模型上实施 `priceTaxRates` 方法为每个价格定义不同的税率：

    /**
     * 适用于客户订阅的税率。
     *
     * @return array<string, array<int, string>>
     */
    public function priceTaxRates(): array
    {
        return [
            'price_monthly' => ['txr_id'],
        ];
    }

> **注意**  
> `taxRates` 方法仅适用于订阅费用。 如果你使用 Cashier 进行「一次性」收费，你将需要手动指定当时的税率。

<a name="syncing-tax-rates"></a>
#### 同步税率

当更改由 `taxRates` 方法返回的硬编码税率 ID 时，用户任何现有订阅的税收设置将保持不变。 如果你希望使用新的 `taxRates` 值更新现有订阅的税值，你应该在用户的订阅实例上调用  `syncTaxRates` 方法：

    $user->subscription('default')->syncTaxRates();

这还将同步具有多个产品的订阅的任何项目税率。 如果你的应用程序提供多种产品的订阅，你应该确保你的计费模型实施 `priceTaxRates` 方法[如上所述](#subscription-taxes)。

<a name="tax-exemption"></a>
#### 免税

Cashier 还提供 `isNotTaxExempt`、`isTaxExempt` 和 `reverseChargeApplies` 方法来确定客户是否免税。 这些方法将调用 Stripe API 来确定客户的免税状态：

    use App\Models\User;

    $user = User::find(1);

    $user->isTaxExempt();
    $user->isNotTaxExempt();
    $user->reverseChargeApplies();

> **注意**  
> 这些方法也适用于任何 `Laravel\Cashier\Invoice` 对象。 但是，当在 `Invoice` 对象上调用时，这些方法将确定发票创建时的豁免状态。

<a name="subscription-anchor-date"></a>
### 订阅锚定日期

默认情况下，计费周期锚是创建订阅的日期，或者如果使用试用期，则为试用结束的日期。 如果你想修改计费锚点日期，你可以使用 `anchorBillingCycleOn` 方法：

    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $anchor = Carbon::parse('first day of next month');

        $request->user()->newSubscription('default', 'price_monthly')
                    ->anchorBillingCycleOn($anchor->startOfDay())
                    ->create($request->paymentMethodId);

        // ...
    });

有关管理订阅计费周期的更多信息，请参阅 [Stripe 计费周期文档](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a name="cancelling-subscriptions"></a>
### 取消订阅

要取消订阅，请在用户的订阅上调用 `cancel` 方法：

    $user->subscription('default')->cancel();

当订阅被取消时，Cashier 将自动在你的 `subscriptions` 数据库表中设置 `ends_at` 列。 此列用于了解 `subscribed` 方法何时应开始返回 `false`。

例如，如果客户在 3 月 1 日取消订阅，但订阅计划要到 3 月 5 日才结束，则 `subscribed` 方法将继续返回 `true` 直到 3 月 5 日。 这样做是因为通常允许用户继续使用应用程序，直到他们的计费周期结束。

你可以使用 `onGracePeriod` 方法确定用户是否已取消订阅但仍处于「宽限期」：

    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }

如果你希望立即取消订阅，请在用户的订阅上调用 `cancelNow` 方法：

    $user->subscription('default')->cancelNow();

如果你希望立即取消订阅并为任何剩余的未开具发票的计量使用或新的/待定的按比例分配发票项目开具发票，请在用户的订阅上调用 `cancelNowAndInvoice` 方法：

    $user->subscription('default')->cancelNowAndInvoice();

你也可以选择在特定时间取消订阅：

    $user->subscription('default')->cancelAt(
        now()->addDays(10)
    );

<a name="resuming-subscriptions"></a>
### 恢复订阅

如果客户取消了他们的订阅，而你希望恢复订阅，你可以在订阅上调用 `resume` 方法。 客户必须仍在「宽限期」内才能恢复订阅：

    $user->subscription('default')->resume();

如果客户取消订阅，然后在订阅完全到期之前恢复订阅，则不会立即向客户收费。 相反，他们的订阅将被重新激活，并且他们将按照原始计费周期进行计费。

<a name="subscription-trials"></a>
## 订阅试用

<a name="with-payment-method-up-front"></a>
### 预先支付方式

如果你想为客户提供试用期，同时仍然预先收集付款方式信息，则应在创建订阅时使用 `trialDays` 方法：

    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', 'price_monthly')
                    ->trialDays(10)
                    ->create($request->paymentMethodId);

        // ...
    });

此方法将在数据库中的订阅记录上设置试用期结束日期，并指示 Stripe 在该日期之前不要开始向客户收费。 使用 `trialDays` 方法时，Cashier 将覆盖为 Stripe 中的价格配置的任何默认试用期。

> **注意**  
> 如果客户的订阅在试用结束日期之前没有取消，他们将在试用期满后立即收费，因此你应该确保通知你的用户他们的试用结束日期。

`trialUntil` 方法允许你提供一个 `DateTime` 实例，指定试用期何时结束：

    use Carbon\Carbon;

    $user->newSubscription('default', 'price_monthly')
                ->trialUntil(Carbon::now()->addDays(10))
                ->create($paymentMethod);

你可以使用用户实例的 `onTrial` 方法或订阅实例的 `onTrial` 方法来确定用户是否在试用期内。 下面的两个例子是等价的：

    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->onTrial()) {
        // ...
    }

你可以使用 `endTrial` 方法立即结束订阅试用：

    $user->subscription('default')->endTrial();

要确定现有试用版是否已过期，你可以使用 `hasExpiredTrial` 方法：

    if ($user->hasExpiredTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->hasExpiredTrial()) {
        // ...
    }

<a name="defining-trial-days-in-stripe-cashier"></a>
#### 在 Stripe / Cashier 中定义试用日

你可以选择在 Stripe 仪表板中定义你的价格接收的试用天数，或者始终使用 Cashier 明确传递它们。 如果你选择在 Stripe 中定义价格的试用日，你应该知道新订阅，包括过去有订阅的客户的新订阅，将始终收到试用期，除非你明确调用 `skipTrial()` 方法 。

<a name="without-payment-method-up-front"></a>
### 没有预先付款方式

如果你想在不预先收集用户付款方式信息的情况下提供试用期，你可以将用户记录中的 `trial_ends_at` 列设置为你想要的试用结束日期。 这通常在用户注册期间完成：

    use App\Models\User;

    $user = User::create([
        // ...
        'trial_ends_at' => now()->addDays(10),
    ]);

> **注意**  
> 请务必在计费模型的类定义中为 `trial_ends_at` 属性添加 [date cast](/docs/laravel/10.x/eloquent-mutators#date-casting)。

Cashier 将这种类型的试用称为「通用试用」，因为它不附加到任何现有订阅。 如果当前日期没有超过 `trial_ends_at` 的值，计费模型实例上的 `onTrial` 方法将返回 `true`：

    if ($user->onTrial()) {
        // 用户在试用期内…
    }

一旦你准备好为用户创建一个实际的订阅，你可以像往常一样使用 `newSubscription` 方法：

    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->create($paymentMethod);

要检索用户的试用结束日期，你可以使用 `trialEndsAt` 方法。 如果用户正在试用，此方法将返回一个 Carbon 日期实例，否则将返回 `null`。 如果你想获取特定订阅而非默认订阅的试用结束日期，你还可以传递一个可选的订阅名称参数：

    if ($user->onTrial()) {
        $trialEndsAt = $user->trialEndsAt('main');
    }

如果你希望明确知道用户处于他们的「通用」试用期并且尚未创建实际订阅，你也可以使用 `onGenericTrial` 方法：

    if ($user->onGenericTrial()) {
        // 用户正处于「通用」试用期内…
    }

<a name="extending-trials"></a>
### 延长试验

`extendTrial` 方法允许你在创建订阅后延长订阅的试用期。 如果试用期已经过期并且已经向客户收取订阅费用，你仍然可以为他们提供延长试用期。 在试用期内花费的时间将从客户的下一张发票中扣除：

    use App\Models\User;

    $subscription = User::find(1)->subscription('default');

    // 从现在起 7 天结束试用...
    $subscription->extendTrial(
        now()->addDays(7)
    );

    // 试用期再延长 5 天...
    $subscription->extendTrial(
        $subscription->trial_ends_at->addDays(5)
    );

<a name="handling-stripe-webhooks"></a>
## 处理 Stripe Webhook

> **技巧**  
> 你可以使用 [Stripe CLI](https://stripe.com/docs/stripe-cli) 在本地开发期间帮助测试 webhook。

Stripe 可以通过 webhook 通知你的应用程序各种事件。 默认情况下，指向 Cashier 的 webhook 控制器的路由由 Cashier 服务提供商自动注册。 该控制器将处理所有传入的 webhook 请求。

默认情况下，Cashier webhook 控制器将自动处理取消订阅失败次数过多（由你的 Stripe 设置定义）、客户更新、客户删除、订阅更新和付款方式更改； 然而，我们很快就会发现，你可以扩展这个控制器来处理你喜欢的任何 Stripe webhook 事件。

为确保你的应用程序可以处理 Stripe webhook，请务必在 Stripe 控制面板中配置 webhook URL。 默认情况下，Cashier 的 webhook 控制器响应 `/stripe/webhook` URL 路径。 你应该在 Stripe 控制面板中启用的所有 webhooks 的完整列表是：

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_action_required`

为方便起见，Cashier 包含一个 `cashier:webhook` Artisan 命令。 此命令将在 Stripe 中创建一个 webhook，用于侦听 Cashier 所需的所有事件：

```shell
php artisan cashier:webhook
```

默认情况下，创建的 webhook 将指向由 `APP_URL` 环境变量和 Cashier 包含的 `cashier.webhook` 路由定义的 URL。 如果你想使用不同的 URL，你可以在调用命令时提供 `--url` 选项：

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

创建的 webhook 将使用与你的 Cashier 版本兼容的 Stripe API 版本。 如果你想使用不同的 Stripe 版本，你可以提供 `--api-version` 选项：

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

创建后，webhook 将立即激活。 如果你想创建 webhook 但在你准备好之前将其禁用，你可以在调用命令时提供 `--disabled` 选项：

```shell
php artisan cashier:webhook --disabled
```

> **注意**  
> 确保使用 Cashier 包含的 [webhook 签名验证](#verifying-webhook-signatures)中间件保护传入的 Stripe webhook 请求。

<a name="webhooks-csrf-protection"></a>
#### Webhook 和 CSRF 保护

由于 Stripe webhooks 需要绕过 Laravel 的 [CSRF 保护](/docs/laravel/10.x/csrf)，请务必在应用程序的 `App\Http\Middleware\VerifyCsrfToken` 中间件中将 URI 列为异常或列出路由 在 `web` 中间件组之外：

    protected $except = [
        'stripe/*',
    ];

<a name="defining-webhook-event-handlers"></a>
### 定义 Webhook 事件处理程序

Cashier 自动处理失败收费和其他常见 Stripe webhook 事件的订阅取消。 但是，如果你有其他想要处理的 webhook 事件，你可以通过收听以下由 Cashier 调度的事件来实现：

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

这两个事件都包含 Stripe webhook 的完整负载。 例如，如果你希望处理 `invoice.payment_succeeded` webhook，你可以注册一个 [listener](/docs/laravel/10.x/events#defining-listeners) 来处理该事件：

    <?php

    namespace App\Listeners;

    use Laravel\Cashier\Events\WebhookReceived;

    class StripeEventListener
    {
        /**
         * 处理收到的 Stripe webhooks。
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['type'] === 'invoice.payment_succeeded') {
                // 处理传入事件...
            }
        }
    }

定义监听器后，你可以在应用程序的 `EventServiceProvider` 中注册它：

    <?php

    namespace App\Providers;

    use App\Listeners\StripeEventListener;
    use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
    use Laravel\Cashier\Events\WebhookReceived;

    class EventServiceProvider extends ServiceProvider
    {
        protected $listen = [
            WebhookReceived::class => [
                StripeEventListener::class,
            ],
        ];
    }

<a name="verifying-webhook-signatures"></a>
### 验证 Webhook 签名

为了保护你的 webhook，你可以使用 [Stripe 的 webhook 签名](https://stripe.com/docs/webhooks/signatures)。为方便起见，Cashier 自动包含一个中间件，用于验证传入的 Stripe webhook 请求是否有效。

要启用 webhook 验证，请确保在应用程序的 `.env` 文件中设置了 `STRIPE_WEBHOOK_SECRET` 环境变量。 Webhook `secret` 可以从你的 Stripe 帐户仪表板中检索。

<a name="single-charges"></a>
## 单次收费

<a name="simple-charge"></a>
### 简单收费

如果你想对客户进行一次性收费，你可以在计费模型实例上使用 charge 方法。 你需要[提供支付方式标识符](#payment-methods-for-single-charges)作为 `charge` 方法的第二个参数：

    use Illuminate\Http\Request;

    Route::post('/purchase', function (Request $request) {
        $stripeCharge = $request->user()->charge(
            100, $request->paymentMethodId
        );

        // ...
    });

`charge` 方法接受一个数组作为它的第三个参数，允许你将你希望的任何选项传递给底层的 Stripe 费用创建。 有关创建费用时可用选项的更多信息，请参见 [Stripe 文档](https://stripe.com/docs/api/charges/create)：

    $user->charge(100, $paymentMethod, [
        'custom_option' => $value,
    ]);

你也可以在没有基础客户或用户的情况下使用 `charge` 方法。 为此，请在应用程序的计费模型的新实例上调用 `charge` 方法：

    use App\Models\User;

    $stripeCharge = (new User)->charge(100, $paymentMethod);

如果收费失败， `charge` 方法将抛出异常。 如果收费成功，`Laravel\Cashier\Payment` 的实例将从该方法返回：

    try {
        $payment = $user->charge(100, $paymentMethod);
    } catch (Exception $e) {
        // ...
    }

> **注意**  
> `charge` 方法接受以你的应用程序使用的货币的最低分母表示的付款金额。 例如，如果客户以美元付款，则应以美分指定金额。

<a name="charge-with-invoice"></a>
### 用发票收费

有时你可能需要一次性收费并向客户提供 PDF 收据。 `invoicePrice` 方法可以让你做到这一点。例如，让我们为客户开具5件新衬衫的发票：

    $user->invoicePrice('price_tshirt', 5);

发票将立即根据用户的默认付款方式收取。`invoicePrice` 方法也接受一个数组作为它的第三个参数。 此数组包含发票项目的计费选项。该方法接受的第四个参数也是一个数组，其中应包含发票本身的计费选项：

    $user->invoicePrice('price_tshirt', 5, [
        'discounts' => [
            ['coupon' => 'SUMMER21SALE']
        ],
    ], [
        'default_tax_rates' => ['txr_id'],
    ]);

与 `invoicePrice` 类似，你可以使用 `tabPrice` 方法为多个项目（每张发票最多250个项目）创建一次性收费，将它们添加到客户的「标签」，然后向客户开具发票。例如，我们可以为客户开具5件衬衫和2个杯子的发票：

    $user->tabPrice('price_tshirt', 5);
    $user->tabPrice('price_mug', 2);
    $user->invoice();

或者，你可以使用 `invoiceFor` 方法对客户的默认付款方式进行「一次性」收费：

    $user->invoiceFor('One Time Fee', 500);

虽然 `invoiceFor` 方法可供你使用，但建议你使用具有预定义价格的 `invoicePrice` 和 `tabPrice` 方法。通过这样做，你可以在 Stripe 仪表板中获得更好的分析和数据，以了解你在每个产品的基础上的销售情况。

> **注意**  
> `invoice`、`invoicePrice` 和 `invoiceFor` 方法将创建一个 Stripe 发票，失败的发票会继续尝试扣费。如果你不希望失败的发票继续尝试扣费，则需要在第一次扣费失败后使用 Stripe API 关闭它们。

<a name="creating-payment-intents"></a>
### 创建付款意向

你可以通过在计费模型实例上调用 `pay` 方法来创建新的 Stripe 支付意图。 调用此方法将创建一个包装在 `Laravel\Cashier\Payment` 实例中的支付意图：

    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->pay(
            $request->get('amount')
        );

        return $payment->client_secret;
    });

创建支付意图后，你可以将客户端密码返回到应用程序的前端，以便用户可以在其浏览器中完成支付。 要阅读有关使用 Stripe 支付意图构建整个支付流程的更多信息，请参阅 [Stripe 文档](https://stripe.com/docs/payments/accept-a-payment?platform=web)。

使用 `pay` 方法时，你的 Stripe 控制面板中启用的默认付款方式将可供客户使用。 或者，如果你只想允许使用某些特定的支付方式，你可以使用 `payWith` 方法：

    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->payWith(
            $request->get('amount'), ['card', 'bancontact']
        );

        return $payment->client_secret;
    });

> **注意**  
> `pay` 和 `payWith` 方法接受以你的应用程序使用的货币的最低分母表示的付款金额。 例如，如果客户以美元付款，则应以美分指定金额。

<a name="refunding-charges"></a>
### 退还费用

如果你需要退还 Stripe 费用，你可以使用 refund 方法。 此方法接受 Stripe [payment intent ID](#payment-methods-for-single-charges) 作为其第一个参数：

    $payment = $user->charge(100, $paymentMethodId);

    $user->refund($payment->id);

<a name="invoices"></a>
## 发票

<a name="retrieving-invoices"></a>
### 检索发票

你可以使用 `invoices` 方法轻松检索可计费模型的发票数组。 `invoices` 方法返回 `Laravel\Cashier\Invoice` 实例的集合：

    $invoices = $user->invoices();

如果你想在结果中包含待处理的发票，你可以使用 `invoicesIncludingPending` 方法：

    $invoices = $user->invoicesIncludingPending();

你可以使用 `findInvoice` 方法通过其 ID 检索特定发票：

    $invoice = $user->findInvoice($invoiceId);

<a name="displaying-invoice-information"></a>
#### 显示发票信息

在为客户列出发票时，你可以使用发票的方法显示相关的发票信息。 例如，你可能希望在表格中列出每张发票，以便用户轻松下载其中任何一张：

    <table>
        @foreach ($invoices as $invoice)
            <tr>
                <td>{{ $invoice->date()->toFormattedDateString() }}</td>
                <td>{{ $invoice->total() }}</td>
                <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
            </tr>
        @endforeach
    </table>

<a name="upcoming-invoices"></a>
### 即将收到的发票

要检索客户即将收到的发票，你可以使用 `upcomingInvoice` 方法：

    $invoice = $user->upcomingInvoice();

类似地，如果客户有多个订阅，你还可以检索特定订阅的即将到来的发票：

    $invoice = $user->subscription('default')->upcomingInvoice();

<a name="previewing-subscription-invoices"></a>
### 预览订阅发票

使用 `previewInvoice` 方法，你可以在更改价格之前预览发票。 这将允许你确定在进行给定价格更改时客户发票的外观：

    $invoice = $user->subscription('default')->previewInvoice('price_yearly');

你可以将一组价格传递给 `previewInvoice` 方法，以便预览具有多个新价格的发票：

    $invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);

<a name="generating-invoice-pdfs"></a>
### 生成发票 PDF

在生成发票 PDF 之前，你应该用 Composer 安装 Dompdf 库，它是 Cashier 的默认发票渲染器：

```php
composer require dompdf/dompdf
```

在路由或控制器中，你可以使用 `downloadInvoice` 方法生成给定发票的 PDF 下载。此方法将自动生成下载发票所需的正确 HTTP 响应：

    use Illuminate\Http\Request;

    Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId);
    });

默认情况下，发票上的所有数据都来自存储在 Stripe 中的客户和发票数据。文件名是基于你的 `app.name` 配置值。但是，你可以通过提供一个数组作为 `downloadInvoice` 方法的第二个参数来自定义其中的一些数据。 此数组允许你自定义信息，例如你的公司和产品详细信息：

    return $request->user()->downloadInvoice($invoiceId, [
        'vendor' => 'Your Company',
        'product' => 'Your Product',
        'street' => 'Main Str. 1',
        'location' => '2000 Antwerp, Belgium',
        'phone' => '+32 499 00 00 00',
        'email' => 'info@example.com',
        'url' => 'https://example.com',
        'vendorVat' => 'BE123456789',
    ]);

`downloadInvoice` 方法还允许通过其第三个参数自定义文件名。此文件名将自动以 `.pdf` 为后缀：

    return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');

<a name="custom-invoice-render"></a>
#### 自定义发票渲染器

Cashier 还可以使用自定义发票渲染器。 默认情况下，Cashier 使用 `DompdfInvoiceRenderer` 实现，它利用 [dompdf](https://github.com/dompdf/dompdf) PHP 库来生成 Cashier 的发票。但是，你可以通过实现 `Laravel\Cashier\Contracts\InvoiceRenderer` 接口来使用任何你想要的渲染器。 例如，你可能希望使用对第三方 PDF 呈现服务的 API 调用来呈现发票 PDF：

    use Illuminate\Support\Facades\Http;
    use Laravel\Cashier\Contracts\InvoiceRenderer;
    use Laravel\Cashier\Invoice;

    class ApiInvoiceRenderer implements InvoiceRenderer
    {
        /**
         * 呈现给定的发票并返回原始 PDF 字节。
         */
        public function render(Invoice $invoice, array $data = [], array $options = []): string
        {
            $html = $invoice->view($data)->render();

            return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
        }
    }

一旦你实现了发票渲染器合约，你应该在你的应用程序的 `config/cashier.php` 配置文件中更新 `cashier.invoices.renderer` 配置值。 此配置值应设置为自定义渲染器实现的类名。

<a name="checkout"></a>
## 结账

Cashier Stripe 还提供对 [Stripe Checkout](https://stripe.com/payments/checkout) 的支持。 Stripe Checkout 通过提供预构建的托管支付页面，消除了实施自定义页面以接受付款的痛苦。

以下文档包含有关如何开始使用 Stripe Checkout with Cashier 的信息。 要了解有关 Stripe Checkout 的更多信息，你还应该考虑查看 [Stripe 自己的 Checkout 文档](https://stripe.com/docs/payments/checkout) 。

<a name="product-checkouts"></a>
### 产品结账

你可以在计费模型上使用 `checkout` 方法对已在 Stripe 仪表板中创建的现有产品执行结帐。 `checkout` 方法将启动一个新的 Stripe Checkout 会话。 默认情况下，你需要传递 Stripe Price ID：

    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout('price_tshirt');
    });

如果需要，你还可以指定产品数量：

    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 15]);
    });

当客户访问此路由时，他们将被重定向到 Stripe 的结帐页面。 默认情况下，当用户成功完成或取消购买时，他们将被重定向到你的 `home` 路由位置，但你可以使用 `success_url` 和 `cancel_url` 参数指定自定义回调 URL：

    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });

在定义 `success_url` 结帐选项时，你可以指示 Stripe 在调用 URL 时将结帐会话 ID 添加为查询字符串参数。为此，请将文字字符串 `{CHECKOUT_SESSION_ID}` 添加到你的 `success_url` 查询字符串。Stripe 将用实际的结帐会话 ID 替换此占位符：

    use Illuminate\Http\Request;
    use Stripe\Checkout\Session;
    use Stripe\Customer;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout-cancel'),
        ]);
    });

    Route::get('/checkout-success', function (Request $request) {
        $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

        return view('checkout.success', ['checkoutSession' => $checkoutSession]);
    })->name('checkout-success');

<a name="checkout-promotion-codes"></a>
#### 优惠码

默认情况下，Stripe Checkout 不允许[用户可兑换促销代码](https://stripe.com/docs/billing/subscriptions/discounts/codes) 。幸运的是，有一种简单的方法可以为你的结帐页面启用这些功能。为此，你可以调用 `allowPromotionCodes` 方法：

    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()
            ->allowPromotionCodes()
            ->checkout('price_tshirt');
    });

<a name="single-charge-checkouts"></a>
### 单次收费结账

你还可以对尚未在 Stripe 仪表板中创建的临时产品进行简单收费。为此，你可以在计费模型上使用 `checkoutCharge` 方法，并向其传递可计费金额、产品名称和可选数量。当客户访问此路由时，他们将被重定向到 Stripe 的结帐页面：

    use Illuminate\Http\Request;

    Route::get('/charge-checkout', function (Request $request) {
        return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
    });

> **注意**  
> 当使用 `checkoutCharge` 方法时，Stripe 将始终在你的 Stripe 仪表板中创建新产品和价格。因此，我们建议你在 Stripe 仪表板中预先创建产品，并改用 `checkout` 方法。

<a name="subscription-checkouts"></a>
### 订阅结帐

> **注意**  
> 使用 Stripe Checkout 进行订阅需要你在 Stripe 仪表板中启用 `customer.subscription.created` webhook。 此 webhook 将在你的数据库中创建订阅记录并存储所有相关的订阅项。

你也可以使用 Stripe Checkout 来启动订阅。 在使用 Cashier 的订阅构建器方法定义你的订阅后，你可以调用 `checkout` 方法。 当客户访问此路由时，他们将被重定向到 Stripe 的结帐页面：

    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout();
    });

与产品结帐一样，你可以自定义成功和取消 URL：

    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout([
                'success_url' => route('your-success-route'),
                'cancel_url' => route('your-cancel-route'),
            ]);
    });

当然，你也可以为订阅结帐启用优惠码：

    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->allowPromotionCodes()
            ->checkout();
    });

> **注意**  
> 不幸的是，在开始订阅时，Stripe Checkout 不支持所有订阅计费选项。在订阅生成器上使用 `anchorBillingCycleOn` 方法、设置按比例分配行为或设置支付行为在 Stripe Checkout 会话期间不会有任何影响。请查阅 [Stripe Checkout Session API 文档](https://stripe.com/docs/api/checkout/sessions/create)以查看可用的参数。

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout 和试用期

当然，你可以在构建将使用 Stripe Checkout 完成的订阅时定义一个试用期：

    $checkout = Auth::user()->newSubscription('default', 'price_monthly')
        ->trialDays(3)
        ->checkout();

但是，试用期必须至少为 48 小时，这是 Stripe Checkout 支持的最短试用时间。

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### 订阅和 Webhooks

请记住，Stripe 和 Cashier 通过 webhook 更新订阅状态，因此当客户在输入付款信息后返回应用程序时，订阅可能尚未激活。要处理这种情况，你可能希望显示一条消息，通知用户他们的付款或订阅处于待处理状态。

<a name="collecting-tax-ids"></a>
### 收集税号 ID

Checkout 还支持收集客户的税号。要在结帐会话上启用此功能，请在创建会话时调用 `collectTaxIds` 方法：

    $checkout = $user->collectTaxIds()->checkout('price_tshirt');

调用此方法时，客户会显示一个新的复选框，允许他们选择是否作为公司进行采购。如果选择是，他们可以提供他们的税号。

> **注意**  
> 如果你已经在应用程序的服务提供者中配置了 [自动征税](#tax-configuration) ，那么该功能将自动启用，无需调用 `collectTaxIds` 方法。

<a name="guest-checkouts"></a>
### 访客结账

使用 `Checkout::guest` 方法，你可以为你的应用程序中没有注册过「账户」的访客启动结账会话：

    use Illuminate\Http\Request;
    use Laravel\Cashier\Checkout;

    Route::get('/product-checkout', function (Request $request) {
        return Checkout::guest()->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });

与为现有用户创建结账会话类似，你可以利用 `Laravel\Cashier\CheckoutBuilder` 实例上的其他方法来定制访客结账会话：

    use Illuminate\Http\Request;
    use Laravel\Cashier\Checkout;

    Route::get('/product-checkout', function (Request $request) {
        return Checkout::guest()
            ->withPromotionCode('promo-code')
            ->create('price_tshirt', [
                'success_url' => route('your-success-route'),
                'cancel_url' => route('your-cancel-route'),
            ]);
    });

在访客结账完成后，Stripe 会发送一个 `checkout.session.completed` 的 webhook 事件，所以请确保[配置你的 Stripe webhook](https://dashboard.stripe.com/webhooks) 以实际发送这个事件到你的应用程序。一旦 webhook 在 Stripe 仪表板中被启用，你就可以[用 Cashier 处理 webhook ](#handling-stripe-webhooks) 。webhook 负载中包含的对象将是一个[`checkout` 对象](https://stripe.com/docs/api/checkout/sessions/object) ，你可以检查它以完成你的客户的订单。

<a name="handling-failed-payments"></a>
## 处理失败的付款

有时，订阅或单笔费用的付款可能会失败。当这种情况发生时，Cashier 会抛出一个 `Laravel\Cashier\Exceptions\IncompletePayment` 异常，通知你发生了这种情况。捕获此异常后，你有两个选择如何继续。

首先，你可以将你的客户重定向到 Cashier 附带的专用付款确认页面。该页面已经有一个通过 Cashier 的服务提供商注册的关联命名路由。因此，你可能会捕获 `IncompletePayment` 异常并将用户重定向到付款确认页面：

    use Laravel\Cashier\Exceptions\IncompletePayment;

    try {
        $subscription = $user->newSubscription('default', 'price_monthly')
                                ->create($paymentMethod);
    } catch (IncompletePayment $exception) {
        return redirect()->route(
            'cashier.payment',
            [$exception->payment->id, 'redirect' => route('home')]
        );
    }

在付款确认页面上，将提示客户再次输入他们的信用卡信息并执行 Stripe 要求的任何其他操作，例如 「3D Secure」确认。 确认付款后，用户将被重定向到上面指定的 `redirect` 参数提供的 URL 。重定向后， `message` （字符串）和 `success` （整数）查询字符串变量将被添加到 URL 。支付页面目前支持以下支付方式类型：

<div class="content-list" markdown="1">

- Credit Cards
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

或者，你可以让 Stripe 为你处理付款确认。 在这种情况下，你可以在 Stripe 控制面板中[设置 Stripe 的自动计费电子邮件](https://dashboard.stripe.com/account/billing/automatic) ，而不是重定向到付款确认页面。 但是，如果捕获到 `IncompletePayment` 异常，你仍应通知用户他们将收到一封包含进一步付款确认说明的电子邮件。

以下方法可能会抛出支付异常：使用 `Billable` 特性的模型上的 `charge` 、 `invoiceFor` 和 `invoice`。 与订阅交互时，`SubscriptionBuilder` 上的`create` 方法以及`Subscription` 和`SubscriptionItem` 模型上的`incrementAndInvoice` 和`swapAndInvoice` 方法可能会抛出未完成支付异常。

可以使用计费模型或订阅实例上的 `hasIncompletePayment` 方法来确定现有订阅是否有未完成的付款：

    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }

你可以通过检查异常实例上的 `payment` 属性来获取未完成付款的具体状态：

    use Laravel\Cashier\Exceptions\IncompletePayment;

    try {
        $user->charge(1000, 'pm_card_threeDSecure2Required');
    } catch (IncompletePayment $exception) {
        // 获取支付意目标状态...
        $exception->payment->status;

        // 检查具体条件...
        if ($exception->payment->requiresPaymentMethod()) {
            // ...
        } elseif ($exception->payment->requiresConfirmation()) {
            // ...
        }
    }

<a name="strong-customer-authentication"></a>
## 强大的客户认证

如果你的企业或你的客户之一位于欧洲，你将需要遵守欧盟的强客户认证 (SCA) 法规。 欧盟于 2019 年 9 月实施了这些规定，以防止支付欺诈。 幸运的是，Stripe 和 Cashier 已准备好构建符合 SCA 的应用程序。

> **注意**
> 在开始之前，请查看 [Stripe 关于 PSD2 和 SCA 的指南](https://stripe.com/guides/strong-customer-authentication)以及他们的[关于新 SCA API 的文档](https://stripe.com/docs/strong-customer-authentication).

<a name="payments-requiring-additional-confirmation"></a>
### 需要额外确认的付款

SCA 法规通常需要额外验证以确认和处理付款。 发生这种情况时，Cashier 将抛出一个 `Laravel\Cashier\Exceptions\IncompletePayment` 异常，通知你需要额外的验证。 有关如何处理这些异常的更多信息，请参阅有关的 [handling failed payments](#handling-failed-payments) 文档。

Stripe 或 Cashier 显示的支付确认屏幕可能会根据特定银行或发卡机构的支付流程进行定制，并且可能包括额外的银行卡确认、临时小额收费、单独的设备身份验证或其他形式的验证。

<a name="incomplete-and-past-due-state"></a>
#### 未完成和逾期状态

当付款需要额外确认时，订阅将保持在 `incomplete` 或 `past_due` 状态，如其  `stripe_status` 数据库列所示。 付款确认完成后，Cashier 将自动激活客户的订阅，并且 Stripe 通过 webhook 通知你的应用程序已完成。

有关 `incomplete` 和 `past_due` 状态的更多信息，请参阅[我们关于这些状态的附加文档](#incomplete-and-past-due-status)。

<a name="off-session-payment-notifications"></a>
### 非会话付款通知

由于 SCA 法规要求客户偶尔验证他们的付款细节，即使他们的订阅处于活动状态，Cashier 也可以在需要非会话付款确认时向客户发送通知。 例如，这可能在订阅续订时发生。 可以通过将 `CASHIER_PAYMENT_NOTIFICATION` 环境变量设置为通知类来启用收银员的付款通知。 默认情况下，此通知处于禁用状态。 当然，Cashier 包含一个你可以用于此目的的通知类，但如果需要，你可以自由提供自己的通知类：

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

为确保发送会话外付款确认通知，请验证你的应用程序的 [Stripe webhooks 已配置](#handling-stripe-webhooks)并且在你的 Stripe 仪表板中启用了 `invoice.payment_action_required` 。 此外，你的 `Billable` 模型还应该使用 Laravel 的 `Illuminate\Notifications\Notifiable` 特性。

> **注意**
> 即使客户手动进行需要额外确认的付款，也会发送通知。 不幸的是，Stripe 无法知道付款是手动完成的还是「离线」完成的。 但是，如果客户在确认付款后访问付款页面，他们只会看到「付款成功」消息。 不允许客户不小心确认两次相同的付款而招致意外的二次扣款。

<a name="stripe-sdk"></a>
## Stripe SDK

Cashier 的许多对象都是 Stripe SDK 对象的包装器。 如果你想直接与 Stripe 对象交互，你可以使用 `asStripe` 方法方便地搜索它们：:

    $stripeSubscription = $subscription->asStripeSubscription();

    $stripeSubscription->application_fee_percent = 5;

    $stripeSubscription->save();

你还可以使用 `updateStripeSubscription` 方法直接更新 Stripe 订阅：

    $subscription->updateStripeSubscription(['application_fee_percent' => 5]);

如果你想直接使用 `Stripe\StripeClient` 客户端，你可以调用 `Cashier` 类的 `stripe` 方法。 例如，你可以使用此方法访问「StripeClient」实例并从你的 Stripe 帐户中搜索价格列表：

    use Laravel\Cashier\Cashier;

    $prices = Cashier::stripe()->prices->all();

<a name="testing"></a>
## 测试

在测试使用 Cashier 的应用程序时，你可以模拟对 Stripe API 的实际 HTTP 请求； 但是，这需要你重新实现部分地 Cashier 自己的行为。 因此，我们建议让你的测试命中实际的 Stripe API。 虽然速度较慢，但它可以让你更加确信你的应用程序正在按预期工作，并且任何缓慢的测试都可以放在他们自己的 PHPUnit 测试组中。

测试时，请记住 Cashier 本身已经有一个很棒的测试套件，因此你应该只专注于测试自己的应用程序的订阅和支付流程，而不是每个底层的 Cashier 行为。

首先，将 Stripe 密钥的 **testing** 版本添加到你的 `phpunit.xml` 文件中：

    <env name="STRIPE_SECRET" value="sk_test_<your-key>"/>

现在，每当你在测试时与 Cashier 交互时，它都会向你的 Stripe 测试环境发送实际的 API 请求。为方便起见，你应该使用可能在测试期间使用的订阅 / 计划预先填写你的 Stripe 测试帐户。

> **技巧**  
> 为了测试各种计费场景，例如信用卡拒付和失败，你可以使用 Stripe 提供的大量的[测试卡号和令牌](https://stripe.com/docs/testing) 。

