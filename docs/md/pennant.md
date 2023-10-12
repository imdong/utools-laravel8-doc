# Laravel Pennant

- [介绍](#introduction)
- [安装](#installation)
- [配置 ](#configuration)
- [定义特性](#defining-features)
    - [基于类的特性](#class-based-features)
- [检查特性](#checking-features)
    - [条件执行](#conditional-execution)
    - [HasFeatures Trait](#the-has-features-trait)
    - [Blade 指令](#blade-directive)
    - [中间件](#middleware)
    - [内存缓存](#in-memory-cache)
- [作用域](#scope)
    - [指定作用域](#specifying-the-scope)
    - [默认作用域](#default-scope)
    - [空作用域](#nullable-scope)
    - [标识作用域](#identifying-scope)
- [富特征值](#rich-feature-values)
- [获取多个特性](#retrieving-multiple-features)
- [预加载](#eager-loading)
- [更新特征值](#updating-values)
    - [批量更新](#bulk-updates)
    - [清除特性](#purging-features)
- [测试 ](#testing)
- [添加自定义 Pennant 驱动](#adding-custom-pennant-drivers)
    - [实现驱动](#implementing-the-driver)
    - [注册驱动](#registering-the-driver)
- [事件](#events)

<a name="introduction"></a>

## 介绍

[Laravel Pennant](https://github.com/laravel/pennant) 是一个简单轻量的特性标志包，没有臃肿。特性标志使你可以有信心地逐步推出新的应用程序功能，测试新的界面设计，支持基干开发策略等等。

<a name="installation"></a>

## 安装

首先，使用 Composer 包管理器将 Pennant 安装到你的项目中：

```shell
composer require laravel/pennant
```

接下来，你应该使用 `vendor:publish` Artisan 命令发布 Pennant 配置和迁移文件： `vendor:publish` Artisan command:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

最后，你应该运行应用程序的数据库迁移。这将创建一个 `features` 表，`Pennant` 使用它来驱动其 `database` 驱动程序：

```shell
php artisan migrate
```

<a name="configuration"></a>

## 配置

在发布 Pennant 资源之后，配置文件将位于 `config/pennant.php`。此配置文件允许你指定 Pennant 用于存储已解析的特性标志值的默认存储机制。

Pennant 支持使用 `array` 驱动程序在内存数组中存储已解析的特性标志值。或者，Pennant 可以使用 `database` 驱动程序在关系数据库中持久存储已解析的特性标志值，这是 Pennant 使用的默认存储机制。

<a name="defining-features"></a>

## 定义特性

要定义特性，你可以使用 `Feature` 门面提供的 `define` 方法。你需要为该特性提供一个名称以及一个闭包，用于解析该特性的初始值。

通常，特性是在服务提供程序中使用 `Feature` 门面定义的。闭包将接收特性检查的“作用域”。最常见的是，作用域是当前已认证的用户。在此示例中，我们将定义一个功能，用于逐步向应用程序用户推出新的 API：

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

正如你所看到的，我们对我们的特性有以下规则：
- 所有内部团队成员应使用新 API。
- 任何高流量客户不应使用新 API。
- 否则，该特性应在具有 1/100 概率激活的用户中随机分配。

首次检查给定用户的 `new-api`特性时，存储驱动程序将存储闭包的结果。下一次针对相同用户检查特性时，将从存储中检索该值，不会调用闭包。

为方便起见，如果特性定义仅返回一个 Lottery，你可以完全省略闭包：

    Feature::define('site-redesign', Lottery::odds(1, 1000));

<a name="class-based-features"></a>

### 基于类的特性

Pennant 还允许你定义基于类的特性。不像基于闭包的特性定义，不需要在服务提供者中注册基于类的特性。为了创建一个基于类的特性，你可以调用 `pennant:feature` Artisan 命令。默认情况下，特性类将被放置在你的应用程序的 `app/Features` 目录中：

```shell
php artisan pennant:feature NewApi
```

在编写特性类时，你只需要定义一个 `resolve` 方法，用于为给定的范围解析特性的初始值。同样，范围通常是当前经过身份验证的用户：

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * 解析特性的初始值.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

> **注** 特性类是通过[容器](/docs/laravel/10.x/container),解析的，因此在需要时可以在特性类的构造函数中注入依赖项。

<a name="checking-features"></a>

## 检查特性

要确定一个特性是否处于活动状态，你可以在 `Feature` 门面上使用 `active` 方法。默认情况下，特性针对当前已认证的用户进行检查：

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 显示资源的列表.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }
    // ...
}
```

为了方便起见，如果一个特征定义只返回一个抽奖结果，你可以完全省略闭包:

    Feature::define('site-redesign', Lottery::odds(1, 1000));

<a name="class-based-features"></a>

### 基于类的特征

Pennant 还允许你定义基于类的特征。与基于闭包的特征定义不同，无需在服务提供者中注册基于类的特征。要创建基于类的特征，你可以调用 pennant:feature Artisan 命令。默认情况下，特征类将被放置在你的应用程序的 app/Features 目录中。:

```php
php artisan pennant:feature NewApi
```

编写特征类时，你只需要定义一个 `resolve` 方法，该方法将被调用以解析给定作用域的特征的初始值。同样，该作用域通常是当前已验证的用户。:

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * 解析特征的初始值.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

> **注意** 特征类通过 [容器](/docs/laravel/10.x/container), 解析，因此在需要时，你可以将依赖项注入到特征类的构造函数中.

<a name="checking-features"></a>

## Checking Features

要确定特征是否处于活动状态，你可以在 Feature 门面上使用 `active` 方法。默认情况下，特征将针对当前已验证的用户进行检查。:

```php

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     *显示资源的列表.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }
    // ...
}
```

虽然默认情况下特性针对当前已认证的用户进行检查，但你可以轻松地针对其他用户或范围检查特性。为此，使用 `Feature` 门面提供的 `for` 方法：

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

Pennant 还提供了一些额外的方便方法，在确定特性是否活动或不活动时可能非常有用：

```php
//确定所有给定的特性是否都活动...
Feature::allAreActive(['new-api', 'site-redesign']);

// 确定任何给定的特性是否都活动...
Feature::someAreActive(['new-api', 'site-redesign']);

// 确定特性是否处于非活动状态...
Feature::inactive('new-api');

// 确定所有给定的特性是否都处于非活动状态...
Feature::allAreInactive(['new-api', 'site-redesign']);

// 确定任何给定的特性是否都处于非活动状态...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> **注**

>当在 HTTP 上下文之外使用 Pennant（例如在 Artisan 命令或排队作业中）时，你通常应[明确指定特性的作用域](#specifying-the-scope)。或者，你可以定义一个[默认作用域](#default-scope)，该作用域考虑到已认证的 HTTP 上下文和未经身份验证的上下文。

<a name="checking-class-based-features"></a>

#### 检查基于类的特性

对于基于类的特性，应该在检查特性时提供类名：

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{

    /**
     * 显示资源的列表.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }
    // ...
}
```

<a name="conditional-execution"></a>

### 条件执行

`when` 方法可用于在特性激活时流畅地执行给定的闭包。此外，可以提供第二个闭包，如果特性未激活，则将执行它：

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 显示资源的列表.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }
    // ...
}
```

`unless` 方法是 `when` 方法的相反，如果特性未激活，则执行第一个闭包：

    return Feature::unless(NewApi::class,

        fn () => $this->resolveLegacyApiResponse($request),

        fn () => $this->resolveNewApiResponse($request),

    );

<a name="the-has-features-trait"></a>

### HasFeatures Trait

Pennant 的 `HasFeatures` Trait 可以添加到你的应用的 `User` 模型（或其他具有特性的模型）中，以提供一种流畅、方便的方式从模型直接检查特性：

```php

<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;
    // ...
}
```

一旦将 HasFeatures Trait 添加到你的模型中，你可以通过调用 `features` 方法轻松检查特性：

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

当然，`features` 方法提供了许多其他方便的方法来与特性交互：

```php
// 值...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// 状态...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);
$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// 条件执行...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a name="blade-directive"></a>

### Blade 指令

为了使在 Blade 中检查特性的体验更加流畅，Pennant提供了一个 `@feature` 指令：

```blade
@feature('site-redesign')
<!-- 'site-redesign' 活跃中 -->
@else
<!-- 'site-redesign' 不活跃-->
@endfeature
```

<a name="middleware"></a>

### 中间件

Pennant 还包括一个[中间件](/docs/laravel/10.x/middleware)，它可以在路由调用之前验证当前认证用户是否有访问功能的权限。首先，你应该将 `EnsureFeaturesAreActive` 中间件的别名添加到你的应用程序的 `app/Http/Kernel.php` 文件中：

```php

use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

protected $middlewareAliases = [
    // ...
 'features' => EnsureFeaturesAreActive::class,
];
```

接下来，你可以将中间件分配给一个路由并指定需要访问该路由的功能。如果当前认证用户的任何指定功能未激活，则路由将返回 `400 Bad Request` HTTP 响应。可以使用逗号分隔的列表指定多个功能：

```php
Route::get('/api/servers', function () {
    // ...
})->middleware(['features:new-api,servers-api']);
```

<a name="customizing-the-response"></a>

#### 自定义响应

如果你希望在未激活列表中的任何一个功能时自定义中间件返回的响应，可以使用 `EnsureFeaturesAreActive` 中间件提供的 `whenInactive` 方法。通常，这个方法应该在应用程序的服务提供者的 boot 方法中调用：

```php

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * 加载服务.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );
    // ...
}
```

<a name="in-memory-cache"></a>

### 内存缓存

当检查特性时，Pennant 将创建一个内存缓存以存储结果。如果你使用的是 `database` 驱动程序，则在单个请求中重新检查相同的功能标志将不会触发额外的数据库查询。这也确保了该功能在请求的持续时间内具有一致的结果。

如果你需要手动刷新内存缓存，可以使用 `Feature` 门面提供的 `flushCache` 方法：

    Feature::flushCache();

<a name="scope"></a>

## 作用域

<a name="specifying-the-scope"></a>

### 指定作用域

如前所述，特性通常会针对当前已验证的用户进行检查。但这可能并不总是适合你的需求。因此，你可以通过 `Feature` 门面的 `for` 方法来指定要针对哪个作用域检查给定的特性：

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

当然，特性作用域不限于“用户”。假设你构建了一个新的结算体验，你要将其推出给整个团队而不是单个用户。也许你希望年龄最大的团队的推出速度比年轻的团队慢。你的特性解析闭包可能如下所示：

```php

use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

你会注意到，我们定义的闭包不需要 `User`，而是需要一个 `Team` 模型。要确定该特性是否对用户的团队可用，你应该将团队传递给 `Feature` 门面提供的 `for` 方法：

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}
// ...
```

<a name="default-scope"></a>

### 默认作用域

还可以自定义 Pennant 用于检查特性的默认作用域。例如，你可能希望所有特性都针对当前认证用户的团队进行检查，而不是针对用户。你可以在应用程序的服务提供程序中指定此作用域。通常，应该在一个应用程序的服务提供程序中完成这个过程:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 加载程序服务.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);
        // ...
    }
}
```

如果没有通过 `for` 方法显式提供作用域，则特性检查将使用当前认证用户的团队作为默认作用域：

```php
Feature::active('billing-v2');

// 目前等价于...
Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>

### 空作用域

如果你检查特性时提供的作用域范围为 `null`，且特性定义中不支持 `null`（即不是 nullable type 或者没有在 union type 中包含`null`），那么 Pennant 将自动返回 `false` 作为特性的结果值。

因此，如果你传递给特性的作用域可能为 null 并且你想要特性值的解析器被调用，你应该在特性定义逻辑中处理 `null` 范围值。在一个 Artisan 命令、排队作业或未经身份验证的路由中检查特性可能会出现 `null` 作用域。因为在这些情况下通常没有经过身份验证的用户，所以默认的作用域将为 `null`。

如果你不总是[明确指定特性作用域](#specifying-the-scope)，则应确保范围类型为"nullable"，并在特性定义逻辑中处理 `null` 范围值:

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a name="identifying-scope"></a>

### 标识作用域

Pennant 的内置 `array` 和 `database` 存储驱动程序可以正确地存储所有 PHP 数据类型以及 Eloquent 模型的作用域标识符。但是，如果你的应用程序使用第三方的 Pennant 驱动程序，该驱动程序可能不知道如何正确地存储 Eloquent 模型或应用程序中其他自定义类型的标识符。

因此，Pennant 允许你通过在应用程序中用作 Pennant 作用域的对象上实现 `FeatureScopeable` 协议来格式化存储范围值。

例如，假设你在单个应用程序中使用了两个不同的特性驱动程序：内置 `database` 驱动程序和第三方的“Flag Rocket”驱动程序。 "Flag Rocket"驱动程序不知道如何正确地存储 Eloquent 模型。相反，它需要一个`FlagRocketUser` 实例。通过实现 `FeatureScopeable` 协议中的 `toFeatureIdentifier` 方法，我们可以自定义提供给应用程序中每个驱动程序的可存储范围值：

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 将对象强制转换为给定驱动程序的功能范围标识符.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
 		'database' => $this,
 		'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a name="rich-feature-values"></a>

## 丰富的特征值

到目前为止，我们主要展示了特性的二进制状态，即它们是「活动的」还是「非活动的」，但是 Pennant 也允许你存储丰富的值。

例如，假设你正在测试应用程序的「立即购买」按钮的三种新颜色。你可以从特性定义中返回一个字符串，而不是 `true` 或 `false`：

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
 'blue-sapphire',
 'seafoam-green',
 'tart-orange',
]));

```

你可以使用 `value` 方法检索 `purchase-button` 特性的值：

```php
$color = Feature::value('purchase-button');
```

Pennant 提供的 Blade 指令也使得根据特性的当前值条件性地呈现内容变得容易：

```blade
@feature('purchase-button', 'blue-sapphire')
<!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
<!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
<!-- 'tart-orange' is active -->
@endfeature
```

> 使用丰富值时，重要的是要知道，只要特性具有除 `false` 以外的任何值，它就被视为「活动」。

在调用[条件](#conditional-execution) `when` 方法时，特性的丰富值将提供给第一个闭包：

    Feature::when('purchase-button',
        fn ($color) => /* ... */,
        fn () => /* ... */,
    );

同样，当调用条件 `unless` 方法时，特性的丰富值将提供给可选的第二个闭包：

    Feature::unless('purchase-button',
        fn () => /* ... */,
        fn ($color) => /* ... */,
    );

<a name="retrieving-multiple-features"></a>

## 获取多个特性

`values` 方法允许检索给定作用域的多个特征：

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
// 'billing-v2' => false,
// 'purchase-button' => 'blue-sapphire',
// ]
```

或者，你可以使用 `all` 方法检索给定范围内所有已定义功能的值：

```php
Feature::all();

// [
// 'billing-v2' => false,
// 'purchase-button' => 'blue-sapphire',
// 'site-redesign' => true,
// ]
```

但是，基于类的功能是动态注册的，直到它们被显式检查之前，Pennant并不知道它们的存在。这意味着，如果在当前请求期间尚未检查过应用程序的基于类的功能，则这些功能可能不会出现在 `all` 方法返回的结果中。

如果你想确保使用 `all` 方法时始终包括功能类，你可以使用Pennant的功能发现功能。要开始使用，请在你的应用程序的任何服务提供程序之一中调用 `discover` 方法：

    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Pennant\Feature;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Feature::discover();
            // ...
        }
    }

`discover` 方法将注册应用程序 `app/Features` 目录中的所有功能类。`all` 方法现在将在其结果中包括这些类，无论它们是否在当前请求期间进行了检查：

```php
Feature::all();

// [
// 'App\Features\NewApi' => true,
// 'billing-v2' => false,
// 'purchase-button' => 'blue-sapphire',
// 'site-redesign' => true,
// ]
```

<a name="eager-loading"></a>

## 预加载

尽管 Pennant 在单个请求中保留了所有已解析功能的内存缓存，但仍可能遇到性能问题。为了缓解这种情况，Pennant 提供了预加载功能。

为了说明这一点，想象一下我们正在循环中检查功能是否处于活动状态：

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

假设我们正在使用数据库驱动程序，此代码将为循环中的每个用户执行数据库查询-执行潜在的数百个查询。但是，使用 Pennant 的 `load` 方法，我们可以通过预加载一组用户或作用域的功能值来消除这种潜在的性能瓶颈：

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

为了仅在尚未加载功能值时加载它们，你可以使用 `loadMissing` 方法：

```php
Feature::for($users)->loadMissing([
 'new-api',
 'purchase-button',
 'notifications-beta',
]);
```

<a name="updating-values"></a>

## 更新值

当首次解析功能的值时，底层驱动程序将把结果存储在存储中。这通常是为了确保在请求之间为你的用户提供一致的体验。但是，有时你可能想手动更新功能的存储值。

为了实现这一点，你可以使用 `activate` 和 `deactivate` 方法来切换功能的 「打开」或「关闭」状态：

```php
use Laravel\Pennant\Feature;

// 激活默认作用域的功能...
Feature::activate('new-api');

// 在给定的范围中停用功能...
Feature::for($user->team)->deactivate('billing-v2');
```

还可以通过向 `activate` 方法提供第二个参数来手动设置功能的丰富值：

```php
Feature::activate('purchase-button', 'seafoam-green');
```

要指示 Pennant 忘记功能的存储值，你可以使用 `forget` 方法。当再次检查功能时，Pennant 将从其功能定义中解析功能的值：

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>

### 批量更新

要批量更新存储的功能值，你可以使用 `activateForEveryone` 和 `deactivateForEveryone` 方法。

例如，假设你现在对 `new-api` 功能的稳定性有信心，并为结帐流程找到了最佳的「purchase-button」颜色-你可以相应地更新所有用户的存储值：

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');
Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

或者，你可以停用所有用户的该功能：

```php
Feature::deactivateForEveryone('new-api');
```

> **注意：**这将仅更新已由 Pennant 存储驱动程序存储的已解析功能值。你还需要更新应用程序中的功能定义。

<a name="purging-features"></a>

### 清除功能

有时，清除存储中的整个功能可以非常有用。如果你已从应用程序中删除了功能或已对功能的定义进行了调整，并希望将其部署到所有用户，则通常需要这样做。

你可以使用 `purge` 方法删除功能的所有存储值：

```php
// 清除单个功能...
Feature::purge('new-api');

// 清除多个功能...
Feature::purge(['new-api', 'purchase-button']);
```

如果你想从存储中清除所有功能，则可以调用 `purge` 方法而不带任何参数：

```php
Feature::purge();
```

由于在应用程序的部署流程中清除功能可能非常有用，因此 Pennant 包括一个`pennant:purge` Artisan命令：

```sh
php artisan pennant:purge new-api
php artisan pennant:purge new-api purchase-button
```

<a name="testing"></a>

## 测试

当测试与功能标志交互的代码时，控制测试中返回的功能标志的最简单方法是简单地重新定义该功能。例如，假设你在应用程序的一个服务提供程序中定义了以下功能：

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
 'blue-sapphire',
 'seafoam-green',
 'tart-orange',
]));
```

要在测试中修改功能的返回值，你可以在测试开始时重新定义该功能。以下测试将始终通过，即使 `Arr::random()` 实现仍然存在于服务提供程序中：

```php
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');
    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

相同的方法也可以用于基于类的功能：

```php
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);
    $this->assertTrue(Feature::value(NewApi::class));
}
```

如果你的功能返回一个 `Lottery` 实例，那么有一些有用的[测试辅助函数可用](/docs/laravel/10.x/helpers#testing-lotteries)。

<a name="store-configuration"></a>

#### 存储配置

你可以通过在应用程序的 `phpunit.xml` 文件中定义 `PENNANT_STORE` 环境变量来配置 Pennant 在测试期间使用的存储：

```xml
<?xml version="1.0"  encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
<env name="PENNANT_STORE"  value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a name="adding-custom-pennant-drivers"></a>

## 添加自定义Pennant驱动程序

<a name="implementing-the-driver"></a>

#### 实现驱动程序

如果 Pennant 现有的存储驱动程序都不符合你的应用程序需求，则可以编写自己的存储驱动程序。你的自定义驱动程序应实现 `Laravel\Pennant\Contracts\Driver` 接口：

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

现在，我们只需要使用 Redis 连接实现这些方法。可以在 [Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php) 源代码中查看如何实现这些方法的示例。

> **注意**

> Laravel 不附带包含扩展的目录。你可以自由地将它们放在任何你喜欢的位置。在这个示例中，我们创建了一个 `Extensions` 目录来存放 `RedisFeatureDriver`。

<a name="registering-the-driver"></a>

#### 注册驱动

一旦你的驱动程序被实现，就可以将其注册到 Laravel 中。要向 Pennant 添加其他驱动程序，可以使用 `Feature` 门面提供的 `extend` 方法。应该在应用程序的 [服务提供者](/docs/laravel/10.x/providers) 的 `boot` 方法中调用 `extend` 方法：

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 注册任何应用程序服务。
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

一旦驱动程序被注册，就可以在应用程序的 `config/pennant.php` 配置文件中使用 `redis` 驱动程序：

```php
'stores' => [
	'redis' => [
		'driver' => 'redis',
		'connection' => null,
	],
    // ...
],
```

<a name="events"></a>
## 事件

Pennant 分发了各种事件，这些事件在跟踪应用程序中的特性标志时非常有用。

### `Laravel\Pennant\Events\RetrievingKnownFeature`

该事件在请求特定作用域的已知特征值第一次被检索时被触发。此事件可用于创建和跟踪应用程序中使用的特征标记的度量标准。

### `Laravel\Pennant\Events\RetrievingUnknownFeature`

当在请求特定作用域的情况下第一次检索未知特性时，将分派此事件。如果你打算从应用程序中删除功能标志，但可能在整个应用程序中留下了某些零散的引用，此事件可能会有用。你可能会发现有用的是监听此事件并在其发生时 `report` 或抛出异常：

例如，你可能会发现在监听到此事件并出现此情况时，使用 `report` 或引发异常会很有用：

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use Laravel\Pennant\Events\RetrievingUnknownFeature;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register any other events for your application.
     */
    public function boot(): void
    {
        Event::listen(function (RetrievingUnknownFeature $event) {
            report("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyDefiningFeature`

当在请求期间首次动态检查基于类的特性时，将分派此事件。