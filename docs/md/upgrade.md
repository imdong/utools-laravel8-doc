# 升级指南

- [从 9.x 升级到 10.0](#upgrade-10.0)

<a name="high-impact-changes"></a>
## 高影响变化

<div class="content-list" markdown="1">

- [更新依赖项](#updating-dependencies)
- [更新最小稳定性](#updating-minimum-stability)

</div>

<a name="medium-impact-changes"></a>
## 中等影响变化

<div class="content-list" markdown="1">

- [数据库表达式](#database-expressions)
- [模型「日期」属性](#model-dates-property)
- [Monolog 3](#monolog-3)
- [Redis缓存标签](#redis-cache-tags)
- [服务模拟](#service-mocking)
- [语言目录](#language-directory)
</div>

<a name="low-impact-changes"></a>
## 较小影响变化

<div class="content-list" markdown="1">

- [Closure 验证规则消息](#closure-validation-rule-messages)
- [Public 路径绑定](#public-path-binding)
- [Query 异常构造函数](#query-exception-constructor)
- [Rate Limiter 返回值](#rate-limiter-return-values)
- [关系 `getBaseQuery` 方法](#relation-getbasequery-method)
- [`Redirect::home` 方法](#redirect-home)
- [`Bus::dispatchNow` 方法](#dispatch-now)
- [`registerPolicies` 方法](#register-policies)
- [ULID 列](#ulid-columns)

</div>

<a name="upgrade-10.0"></a>
## 从 9.x 升级到 10.0

<a name="estimated-upgrade-time-??-minutes"></a>
#### 预计升级时间：10 分钟

> **注意**
> 我们试图记录每一个可能的破坏性变更。由于其中一些破坏性变更位于框架的底层部分，因此只有其中一部分变更实际上会影响你的应用程序。想节省时间吗？你可以使用 [Laravel Shift](https://laravelshift.com/) 来帮助自动升级你的应用程序。

<a name="updating-dependencies"></a>
### 更新依赖项

**影响可能性：高**

#### 要求 PHP 8.1.0

Laravel 现在要求 PHP 8.1.0 或更高版本。

#### 要求 Composer 2.2.0

Laravel 现在要求 [Composer](https://getcomposer.org) 2.2.0 或更高版本。

#### 更新 Composer 依赖项

你应该在应用程序的 `composer.json` 文件中更新以下依赖项：

<div class="content-list" markdown="1">

- `laravel/framework` 更新到 `^10.0`
- `laravel/sanctum` 更新到 `^3.2`
- `doctrine/dbal` 更新到 `^3.0`
- `spatie/laravel-ignition` 更新到 `^2.0`

</div>



如果你从 2.x 发布系列升级到 Sanctum 3.x，请参考 [Sanctum 升级指南](https://github.com/laravel/sanctum/blob/3.x/UPGRADE.)。

此外，如果你想使用 [PHPUnit 10](https://phpunit.de/announcements/phpunit-10.html)，则应该从应用程序的 `phpunit.xml` 配置文件的 `<coverage>` 部分中删除 `processUncoveredFiles` 属性。然后，更新应用程序的 `composer.json` 文件中的以下依赖项：

<div class="content-list" markdown="1">

- `nunomaduro/collision` 更新到 `^7.0`
- `phpunit/phpunit` 更新到 `^10.0`

</div>

最后，检查应用程序使用的任何其他第三方包，并验证你正在使用 Laravel 10 支持的适当版本。

<a name="updating-minimum-stability"></a>
#### 最小稳定性

你应该将应用程序的 `composer.json` 文件中的 `minimum-stability` 设置更新为 `stable`：

```json
"minimum-stability": "stable",
```

### 应用程序

<a name="public-path-binding"></a>
#### 绑定公共路径

**影响可能性：低**

如果你的应用程序将通过 `path.public` 绑定到容器来自定义其「公共路径」，则应该更新你的代码以调用 `Illuminate\Foundation\Application` 对象提供的 `usePublicPath` 方法：

```php
app()->usePublicPath(__DIR__.'/public');
```

### 授权

<a name="register-policies"></a>
### `registerPolicies` 方法

**影响可能性：低**

框架会自动调用 `AuthServiceProvider` 的 `registerPolicies` 方法。因此，你可以从应用程序的 `AuthServiceProvider` 的 `boot` 方法中删除对此方法的调用。

### 缓存

<a name="redis-cache-tags"></a>
#### Redis 缓存标签

**影响可能性：中等**

Redis 的 [缓存标签](/docs/laravel/10.x/cache#cache-tags) 支持已被重新编写，以提供更好的性能和存储效率。在 Laravel 的之前的版本中，如果使用 Redis 作为应用程序的缓存驱动程序，则会在缓存中累积旧的缓存标签。


然而，为了正确地删除过时的缓存标记项，Laravel 新的 `cache:prune-stale-tags` Artisan 命令应该在你的应用程序的 `App\Console\Kernel` 类中 [预定](/docs/laravel/10.x/scheduling)：

```
$schedule->command('cache:prune-stale-tags')->hourly();

```

### 数据库

<a name="database-expressions"></a>

#### 数据库表达式

**影响可能性：中等**

Laravel 10.x 重新编写了数据库「表达式」（通常是通过 `DB::raw` 生成），以便在未来提供额外的功能。需要注意的是，语法的原始字符串值现在必须通过表达式的 `getValue(Grammar $grammar)` 方法检索。现在不再支持将表达式强制转换为字符串使用 `(string)` 。

**通常，这不会影响最终用户的应用程序**；但是，如果你的应用程序正在手动将数据库表达式强制转换为字符串使用 `(string)` 或直接调用表达式的 `__toString` 方法，则应该更新你的代码以调用 `getValue` 方法：

```php
use Illuminate\Support\Facades\DB;

$expression = DB::raw('select 1');

$string = $expression->getValue(DB::connection()->getQueryGrammar());
```

<a name="query-exception-constructor"></a>

#### 查询异常构造函数

**影响可能性：非常低**

`Illuminate\Database\QueryException` 构造函数现在接受一个字符串连接名称作为其第一个参数。如果你的应用程序正在手动抛出此异常，则应相应调整你的代码。

<a name="ulid-columns"></a>

#### ULID 列

**影响可能性：低**

当迁移调用 `ulid` 方法而没有任何参数时，列现在将被命名为 `ulid`。在 Laravel 的以前版本中，调用此方法而没有任何参数会创建一个错误命名为 `uuid` 的列：

```
$table->ulid();

```

在调用 `ulid` 方法时显式指定列名，可以将列名传递给该方法：

```
$table->ulid('ulid');
```

### Eloquent

<a name="model-dates-property"></a>
#### 模型「Dates」属性

**影响可能性：中等**

已删除 Eloquent 模型中已过时属性。现在，你的应用程序应该使用`$casts` 属性：

```php
protected $casts = [
    'deployed_at' => 'datetime',
];
```

<a name="relation-getbasequery-method"></a>

#### 关系 `getBaseQuery` 方法

**影响可能性：非常低**

在 `Illuminate\Database\Eloquent\Relations\Relation` 类中的 `getBaseQuery` 方法已更名为 `toBase`。

### 本地化

<a name="language-directory"></a>

#### 语言目录

**影响可能性：无**

虽然不涉及现有应用程序，但 Laravel 应用程序骨架不再默认包含 `lang` 目录。相反，在编写新的 Laravel 应用程序时，可以使用 `lang:publish` Artisan 命令进行发布：

```shell
php artisan lang:publish
```

### 日志

<a name="monolog-3"></a>

#### Monolog 3

**影响可能性：中等**

Laravel 的 Monolog 依赖项已更新为 Monolog 3.x。如果你正在直接与 Monolog 交互，则应该查看 Monolog 的[升级指南](https://github.com/Seldaek/monolog/blob/main/UPGRADE.)。

如果你正在使用 BugSnag 或 Rollbar 等第三方日志记录服务，请确保将这些第三方包升级到支持 Monolog 3.x 和 Laravel 10.x 版本的版本。

### 队列

<a name="dispatch-now"></a>

#### `Bus::dispatchNow` 方法

**影响可能性：低**

已删除过时的 `Bus::dispatchNow` 和 `dispatch_now` 方法。目前你的应用程序应该分别使用 `Bus::dispatchSync` 和 `dispatch_sync` 方法。

### 路由

<a name="middleware-aliases"></a>

#### 中间件别名

**影响可能性：非强制**

在新的 Laravel 应用程序中，`App\Http\Kernel` 类的 `$routeMiddleware` 属性已更名为 `$middlewareAliases`，以更好地反映其用途。你可以在现有应用程序中重命名此属性，但不是强制的。


<a name="rate-limiter-return-values"></a>

#### 限速器返回值

**影响可能性: 低**

调用 `RateLimiter::attempt` 方法时，该方法现在将返回由提供的闭包返回的值。如果没有返回任何值或返回 `null`，则 `attempt` 方法将返回 `true`：

```php
$value = RateLimiter::attempt('key', 10, fn () => ['example'], 1);

$value; // ['example']
```

<a name="redirect-home"></a>

#### `Redirect::home` 方法

**影响可能性: 非常低**

已删除不推荐使用的 `Redirect::home` 方法。相反，你的应用程序应该重定向到一个明确命名的路由：

```php
return Redirect::route('home');
```

### 测试

<a name="service-mocking"></a>

#### 服务模拟

**影响可能性: 中等**

已从框架中删除不推荐使用的 `MocksApplicationServices` 特性。该特性提供了类似于 `expectsEvents`、`expectsJobs` 和 `expectsNotifications` 这样的测试方法。

如果你的应用程序使用这些方法，我们建议你过渡到 `Event::fake`、`Bus::fake` 和 `Notification::fake`。你可以通过相应组件的文档了解有关模拟的更多信息。

### 验证

<a name="closure-validation-rule-messages"></a>

#### 闭包验证规则消息

**影响可能性: 非常低**

当编写基于闭包的自定义验证规则时，调用 `$fail` 回调超过一次，现在会将消息附加到数组中，而不是覆盖先前的消息。通常，这不会影响你的应用程序。

此外，`$fail` 回调现在返回一个对象。如果你之前对验证闭包的返回类型进行了类型提示，这可能需要你更新你的类型提示：

```php
public function rules()
{
    'name' => [
        function ($attribute, $value, $fail) {
            $fail('validation.translation.key')->translate();
        },
    ],
}
```

<a name="miscellaneous"></a>
### 其他

我们还鼓励你查看 `laravel/laravel` [GitHub 存储库](https://github.com/laravel/laravel) 中的更改。虽然这些更改中许多都不是必需的，但你可能希望将这些文件与你的应用程序保持同步。本次升级指南将覆盖部分更改，但其他的更改，例如对配置文件或注释的更改，不会被覆盖。

你可以使用 [GitHub 比较工具](https://github.com/laravel/laravel/compare/9.x...10.x) 轻松查看更改，并选择哪些更新对你重要。但是，GitHub 比较工具显示的许多更改都是由于我们的组织采用了 PHP 本地类型。这些更改是向后兼容的，迁移到 Laravel 10 期间采用它们是可选的。
