# 发行说明

- [版本化方案](#versioning-scheme)
- [支持策略](#support-policy)
- [Laravel 9](#laravel-9)

<a name="versioning-scheme"></a>
## 版本化方案

Laravel 及官方发布的包皆遵循 [语义化版本](https://semver.org)。主要的框架版本每年「2 月」发布，而次要的和补丁版本可能每周发布一次。次要版本和修补程序版本应 **从不** 包含非兼容性的更改。

你从应用或包中引用 Laravel 框架或其组件时，应始终使用版本约束，如 `^9.0`，因为 Laravel 的主要版本确实包含非兼容性更改。但是，我们努力确保您可以在一天或更短的时间内更新到新的主要版本。

<a name="named-arguments"></a>
#### 命名参数

目前，PHP 的 [命名参数](https://www.php.net/manual/zh/functions.arguments.php#functions.named-arguments)  功能还没有被 Laravel 的向后兼容性指南所涵盖。我们可以在必要时选择重命名函数参数，以改进 Laravel 代码库。因此，在调用 Laravel 方法时使用命名参数应该谨慎，并且要理解参数名将来可能会改变。

<a name="support-policy"></a>
## 支持策略

对于所有 Laravel 发行版本，BUG 修复的期限为 18 个月，安全修复的期限为 2 年。对于包括 Lumen 在内的所有额外的库，只有最新的版本才会得到 BUG 修复。此外，请查阅 Laravel 支持的 [数据库版本](/docs/laravel/9.x/database#introduction)。



<table><tbody>
    <tr>
        <th>版本</th><th> PHP (*) </th><th>发行时间</th><th>Bug 修复截止时间</th><th>安全修复截止时间</th>
    </tr>
    <tr>
        <td style="background:rgb(244 157 55); ">6 (LTS)  </td>
        <td>7.2 - 8.0</td>
        <td>2019年9月3日  </td>
		<td>2022年1月25日 </td>
        <td>2022年9月6日 </td>
    </tr>
    <tr>
        <td style ="background:rgba(249 50 44);">7</td>
        <td> 7.2 - 8.0</td>
         <td>2020年3月3日  </td>
		<td>2020年10月6日 </td>
        <td>2021年3月3日 </td>
    </tr>
	 <tr>
        <td >8</td>
        <td> 7.3 - 8.1</td>
         <td>2020年9月8日  </td>
		<td>2022年7月26日 </td>
        <td>2023年1月24日 </td>
    </tr>
	<tr>
        <td >9</td>
        <td>8.0 - 8.1</td>
         <td>2022年2月8日  </td>
		<td>2023年8月8日 </td>
        <td>2024年2月8日 </td>
    </tr>
<tr>
        <td >10</td>
        <td>8.0 - 8.1</td>
         <td>2023年2月7日  </td>
		<td>2024年8月7日 </td>
        <td>2025年2月7日 </td>
    </tr>
</table>
        <span><div style="height:0.75rem; margin-right:0.5rem; width:0.75rem;background:rgba(249 50 44);display:inline-block; "></div>
		<div style=" display:inline;">生命周期结束</div></span>
        <div style="height:0.75rem; margin-right:0.5rem; width:0.75rem;background:rgb(244 157 55); display:inline-block; "></div>
        <div style=" display:inline;">仅安全修复</div>
		
(*) 支持的PHP版本

<a name="laravel-9"></a>
## Laravel 9

正如你所知，随着 Laravel 8 的发布，Laravel 已经过渡到了年度发布。以前，主要版本每6个月发布一次。这一转变旨在减轻社区的维护负担，并挑战我们的开发团队在不引入突破性更改的情况下提供惊人、强大的新功能。因此，我们在不破坏向后兼容性的情况下，向 Laravel 8 提供了各种强大的功能，例如并行测试支持、改进的 Breeze starter 工具包、HTTP 客户端改进，甚至还有新的 Eloquent  关联关系类型，例如`oFMany`(一对多检索)。

因此，在当前版本中发布新功能的承诺可能会导致未来的「主要」版本主要用于「维护」任务，例如升级上游依赖项，这可以在这些发行说明中看到。

Laravel 9 延续了 Laravel 8.x 的改进通过引入对 Symfony 6.0 组件、Symfony Mailer、Flysystem 3.0、改进的 `routes:list` 输出、Laravel Scout 数据库驱动程序、新的 Eloquent 访问器 / 修改器语法、通过枚举的隐式路由绑定，以及其他各种错误修复和可用性改进。

<a name="php-8"></a>
### PHP 8.0

Laravel 9.x 至少需要 PHP8.0.2。

<a name="symfony-mailer"></a>
### Symfony Mailer

_Symfony Mailer 的支持是由 [Dries Vints](https://github.com/driesvints)_, [James Brooks](https://github.com/jbrooksuk), 和 [Julius Kiekbusch](https://github.com/Jubeki).

Laravel 以前的版本使用了 [Swift Mailer](https://swiftmailer.symfony.com/docs/introduction.html) 库发送外发邮件。然而，该库已不再维护，由 Symfony Mailer 继承。



请查看 [升级指南](/docs/laravel/9.x/upgrade#symfony-mailer) 以了解有关确保您的应用程序与 Symfony Mailer 兼容的更多信息。

<a name="flysystem-3"></a>
### Flysystem 3.x

Flysystem 3.x 的支持由 [Dries Vints](https://github.com/driesvints) 提供。
Laravel 9.x 将我们上游的 Flysystem 依赖升级到 Flysystem 3.x。 Flysystem 为 `Storage` 门面提供的所有文件系统交互提供支持。

请查看 [升级指南](/docs/laravel/9.x/upgrade#flysystem-3) 以了解有关确保您的应用程序与 Flysystem 3.x 兼容的更多信息。

<a name="eloquent-accessors-and-mutators"></a>
### Eloquent 访问器/修改器 改进

改进的 Eloquent 访问器/修改器由 [Taylor Otwell](https://github.com/taylorotwell) 贡献。

Laravel 9.x 提供了一种新的方式来定义 Eloquent [访问器和修改器](/docs/laravel/9.x/eloquent-mutators#accessors-and-mutators)。在以前的 Laravel 版本中，定义访问器和修改器的唯一方法是在模型上定义前缀方法，如下所示：

```php
public function getNameAttribute($value)
{
    return strtoupper($value);
}

public function setNameAttribute($value)
{
    $this->attributes['name'] = $value;
}
```

然而，在 Laravel 9.x 中，你可以使用一个不带前缀的方法定义访问器和修改器，该方法的返回类型是`Illuminate\Database\Eloquent\Casts\Attribute`：

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

public function name(): Attribute
{
    return new Attribute(
        get: fn ($value) => strtoupper($value),
        set: fn ($value) => $value,
    );
}
```

此外，这种定义访问器的新方法将缓存由属性返回的对象值，就像 [自定义转换类](/docs/laravel/9.x/eloquent-mutators#custom-casts)：

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

public function address(): Attribute
{
    return new Attribute(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```



<a name="enum-casting"></a>
### Enum Eloquent 属性转换

> 注意：枚举转换仅适用于 PHP 8.1+。

枚举转换由 [Mohamed Said](https://github.com/themsaid) 贡献。

Eloquent 现在允许您将属性值转换为 PHP ["backed" enums](https://www.php.net/manual/en/language.enumerations.backed.php)。 为此，您可以在模型的 `$casts` 属性数组中指定要转换的属性和枚举：

    use App\Enums\ServerStatus;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'status' => ServerStatus::class,
    ];

一旦你在你的模型上定义了转换，当你与属性交互时，指定的属性将自动转换为枚举：

    if ($server->status == ServerStatus::provisioned) {
        $server->status = ServerStatus::ready;

        $server->save();
    }

<a name="implicit-route-bindings-with-enums"></a>
### 使用枚举的隐式路由绑定

隐式路由绑定由 [Nuno Maduro](https://github.com/nunomaduro)贡献。

PHP 8.1 引入了对 [Enums](https://www.php.net/manual/en/language.enumerations.backed.php) 的支持。 Laravel 9.x 引入了在路由定义中键入提示 Enum 的能力，并且 Laravel 只会在该路由段是 URI 中的有效 Enum 值时调用该路由。 否则，将自动返回 HTTP 404 响应。 例如，给定以下枚举：

```php
enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

你可以定义一个只有在 `{category}` 路由段是 `fruits` 或 `people` 时才会被调用的路由。 否则，将返回 HTTP 404 响应：

```php
Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```



<a name="forced-scoping-of-route-bindings"></a>
### 路由绑定的强制作用域

路由绑定的强制作用域由 [Claudio Dekker](https://github.com/claudiodekker)贡献.

在之前的 Laravel 版本中，您可能希望在路由定义中限定第二个 Eloquent 模型，使其必须是之前 Eloquent 模型的子模型。 例如，考虑这个通过 slug 为特定用户检索博客文章的路由定义：

    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
        return $post;
    });

当使用自定义键控隐式绑定作为嵌套路由参数时，Laravel 将自动限定查询范围以通过其父级检索嵌套模型，使用约定来猜测父级上的关系名称。 但是，当自定义键用于子路由绑定时，Laravel 之前仅支持此行为。

然而，在 Laravel 9.x 中，即使没有提供自定义键，你现在也可以指示 Laravel 限定“子”绑定。 为此，您可以在定义路由时调用 `scopeBindings` 方法：

    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    })->scopeBindings();

或者，您可以指示整个路由定义组使用范围绑定：

    Route::scopeBindings()->group(function () {
        Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
            return $post;
        });
    });

<a name="controller-route-groups"></a>
### 控制器路由组

控制器路由组改进由 [Luke Downing](https://github.com/lukeraymonddowning)贡献.



您现在可以使用 `controller` 方法为组内的所有路由定义公共控制器。 然后，在定义路由时，您只需要提供它们调用的控制器方法：

    use App\Http\Controllers\OrderController;

    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders/{id}', 'show');
        Route::post('/orders', 'store');
    });

<a name="full-text"></a>
### 全文索引 / Where 子句

全文索引和"where"子句由 [Taylor Otwell](https://github.com/taylorotwell) 和 [Dries Vints](https://github.com/driesvints)贡献。

使用 MySQL 或 PostgreSQL 时，现在可以将 `fullText` 方法添加到列定义中以生成全文索引：

    $table->text('bio')->fullText();

此外，`whereFullText` 和 `orWhereFullText` 方法可用于将全文“where”子句添加到具有[全文索引]的列的查询中（/docs/laravel/9.x/migrations#available-index -类型）。 这些方法将被 Laravel 转换成适合底层数据库系统的 SQL。 例如，将为使用 MySQL 的应用程序生成一个 `MATCH AGAINST` 子句：

    $users = DB::table('users')
               ->whereFullText('bio', 'web developer')
               ->get();

<a name="laravel-scout-database-engine"></a>
### Laravel Scout 数据库引擎

Laravel Scout 数据库引擎由 [Taylor Otwell](https://github.com/taylorotwell) and [Dries Vints](https://github.com/driesvints)贡献。

如果您的应用程序与中小型数据库交互或工作量较小，您现在可以使用 Scout 的“数据库”引擎，而不是 Algolia 或 MeiliSearch 等专用搜索服务。 数据库引擎将在过滤现有数据库的结果时使用“where like”子句和全文索引，以确定查询的适用搜索结果。



要了解有关 Scout 数据库引擎的更多信息，请参阅 [Scout 文档](/docs/laravel/9.x/scout)。

<a name="rendering-inline-blade-templates"></a>
### 渲染内联 Blade 模板

渲染内联 Blade 模板由 [Jason Beggs](https://github.com/jasonlbeggs) 和 [Toby Zerner](https://github.com/tobyzerner)贡献。

有时您可能需要将原始 Blade 模板字符串转换为有效的 HTML。 您可以使用 `Blade` 门面提供的 `render` 方法来完成此操作。 `render` 方法接受 Blade 模板字符串和提供给模板的可选数据数组：

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

类似地，`renderComponent` 方法可用于通过将组件实例传递给该方法来渲染给定的类组件：

```php
use App\View\Components\HelloComponent;

return Blade::renderComponent(new HelloComponent('Julian Bashir'));
```

<a name="slot-name-shortcut"></a>
### Slot 名称快捷方式

Slot 名称快捷方式由 [Caleb Porzio](https://github.com/calebporzio)贡献。

在以前的 Laravel 版本中，slot名称是使用 `x-slot` 标签上的 `name` 属性提供的：

```blade
<x-alert>
    <x-slot name="title">
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

但是，从 Laravel 9.x 开始，您可以使用更方便、更短的语法来指定slot的名称：

```xml
<x-slot:title>
    Server Error
</x-slot>
```

<a name="checked-selected-blade-directives"></a>
### Checked / Selected blade指令

Checked and selected Blade 指令由 [Ash Allen](https://github.com/ash-jc-allen) 和 [Taylor Otwell](https://github.com/taylorotwell)贡献。

为方便起见，您现在可以使用 `@checked` 指令轻松指示给定的 HTML 复选框输入是否已“选中”。 如果提供的条件评估为 `true`，则此指令将回显 `checked`：

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```



同样，`@selected` 指令可用于指示是否应该“选择”给定的选择选项：

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

<a name="bootstrap-5-pagination-views"></a>
### Bootstrap 5 分页视图

Bootstrap 5 分页视图由 [Jared Lewis](https://github.com/jrd-lewis)贡献。

Laravel 现在包含使用 [Bootstrap 5](https://getbootstrap.com/) 构建的分页视图。 要使用这些视图而不是默认的 Tailwind 视图，您可以在 `App\Providers\AppServiceProvider` 类的 `boot` 方法中调用分页器的 `useBootstrapFive` 方法：

    use Illuminate\Pagination\Paginator;

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Paginator::useBootstrapFive();
    }

<a name="improved-validation-of-nested-array-data"></a>
### 改进了嵌套数组数据的验证

嵌套数组数据的验证由 [Steve Bauman](https://github.com/stevebauman)贡献。

有时，在为属性分配验证规则时，您可能需要访问给定嵌套数组元素的值。 您现在可以使用 `Rule::forEach` 方法完成此操作。 `forEach` 方法接受一个闭包，该闭包将为验证中的数组属性的每次迭代调用，并将接收属性的值和显式的、完全扩展的属性名称。 闭包应该返回一个规则数组来分配给数组元素：

    use App\Rules\HasPermission;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    $validator = Validator::make($request->all(), [
        'companies.*.id' => Rule::forEach(function ($value, $attribute) {
            return [
                Rule::exists(Company::class, 'id'),
                new HasPermission('manage-company', $value),
            ];
        }),
    ]);

<a name="laravel-breeze-api"></a>
### Laravel Breeze API & Next.js



Laravel Breeze API 和 Next.js 由 [Taylor Otwell](https://github.com/taylorotwell) and [Miguel Piedrafita](https://twitter.com/m1guelpf)贡献。

[Laravel Breeze](/docs/laravel/9.x/starter-kits#breeze-and-next) 入门套件已获得“API”脚手架模式和免费 [Next.js](https://nextjs.org ) [前端实现](https://github.com/laravel/breeze-next)。 这个初学者工具包脚手架可用于快速启动用作后端的 Laravel 应用程序，以及用于 JavaScript 前端的 Laravel Sanctum 认证 API。

<a name="exception-page"></a>
### 改进 Ignition 错误页面

Ignition由 [Spatie](https://spatie.be/)贡献。

Spatie 创建的开源异常调试页面 Ignition 已经从头开始重新设计。 新的、改进的 Ignition 随 Laravel 9.x 一起提供，包括浅色/深色主题、可定制的“在编辑器中打开”功能等等。

<p align="center">
<img width="100%" src="https://cdn.learnku.com/uploads/images/202202/18/25486/juwOpUFX7p.png!large"/>
</p>

<a name="improved-route-list"></a>
### 改进的 `route:list` CLI 输出

改进的 `route:list` CLI 输出由 [Nuno Maduro](https://github.com/nunomaduro)贡献。

`route:list` CLI 输出在 Laravel 9.x 版本中得到了显着改进，在探索你的路由定义时提供了一个美妙的新体验。

<p align="center">
<img src="https://cdn.learnku.com/uploads/images/202202/18/25486/rbbkbh2QKT.png!large"/>
</p>

<a name="test-coverage-support-on-artisan-test-Command"></a>
### 使用 Artisan `test` 命令测试覆盖率

使用 Artisan `test` 命令时的测试覆盖率由 [Nuno Maduro](https://github.com/nunomaduro)贡献。

Artisan `test` 命令收到了一个新的 `--coverage` 选项，您可以使用它来探索您的测试为您的应用程序提供的代码覆盖率：

```shell
php artisan test --coverage
```



测试覆盖率结果将直接显示在 CLI 输出中。

<p align="center">
<img width="100%" src="https://cdn.learnku.com/uploads/images/202202/18/30138/GnM8gJDNhu.png!large"/>
</p>

此外，如果您想指定测试覆盖率必须满足的最低阈值，您可以使用该 `--min` 选项。如果未达到给定的最小阈值，则测试套件将失败：

```shell
php artisan test --coverage --min=80.3
```

<p align="center">
<img width="100%" src="https://cdn.learnku.com/uploads/images/202202/18/30138/06IIcEzXFN.png!large"/>
</p>

<a name="soketi-echo-server"></a>
### Soketi Echo 服务器

_Soketi Echo 服务器由 [Alex Renoki](https://github.com/rennokki)_ 开发。

虽然不是 Laravel 9.x 独有的，但 Laravel 最近协助编写了 Soketi 的文档，这是一个为 Node.js 编写的与 [Laravel Echo](/docs/laravel/9.x/broadcasting) 兼容的 Web Socket 服务器。Soketi 为那些喜欢管理自己的 Web Socket 服务器的应用程序提供了一个很好的、开源的替代 Pusher 和 Ably。

有关使用 Soketi 的更多信息，请参阅 [广播文档](/docs/laravel/9.x/broadcasting) 和 [Soketi 文档](https://docs.soketi.app/)。

<a name="improved-collections-ide-support"></a>
### 改进的集合 IDE 支持

_[Nuno Maduro](https://github.com/nunomaduro)_ 贡献了改进的集合 IDE 支持。

Laravel 9.x 为集合组件添加了改进的“通用”样式类型定义，改进了 IDE 和静态分析支持。 [PHPStorm](https://blog.jetbrains.com/phpstorm/2021/12/phpstorm-2021-3-release/#support_for_future_laravel_collections) 或 [PHPStan](https://phpstan.org) 等 IDE 静态分析工具现在可以更好地理解 Laravel 集合。

<p align="center">
<img width="100%" src="https://cdn.learnku.com/uploads/images/202202/18/30138/zzM0Yn3RSa.gif!large"/>
</p>



<a name="new-helpers"></a>
### 新助手

Laravel 9.x 引入了两个新的、方便的辅助函数，你可以在自己的应用程序中使用它们。

<a name="new-helpers-str"></a>
#### `str`

该 `str` 函数返回 `Illuminate\Support\Stringable` 给定字符串的新实例。这个函数等价于 `Str::of` 方法：

    $string = str('Taylor')->append(' Otwell');

    // 'Taylor Otwell'

如果没有为 `str` 函数提供参数，则函数返回 `Illuminate\Support\Str` 的实例：

    $snake = str()->snake('LaravelFramework');

    // 'laravel_framework'

<a name="new-helpers-to-route"></a>
#### `to_route`

该 `to_route` 函数为给定的命名路由生成重定向 HTTP 响应，提供了一种从路由和控制器重定向到命名路由的表达方式：

    return to_route('users.show', ['user' => 1]);

如有必要，您可以将应分配给重定向的 HTTP 状态代码和任何其他响应标头作为第三和第四个参数传递给 to_route 方法：

    return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);

