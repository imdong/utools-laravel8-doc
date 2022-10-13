 # 路由

- [基本路由](#basic-routing)
    - [路由重定向](#redirect-routes)
    - [路由视图](#view-routes)
- [路由参数](#route-parameters)
    - [必选参数](#required-parameters)
    - [可选参数](#parameters-optional-parameters)
    - [正则约束](#parameters-regular-expression-constraints)
- [路由命名](#named-routes)
- [路由分组](#route-groups)
    - [中间件](#route-group-middleware)
    - [Controllers](#route-group-controllers)
    - [子域名路由](#route-group-subdomain-routing)
    - [路由前缀](#route-group-prefixes)
    - [路由前缀命名](#route-group-name-prefixes)
- [路由模型绑定](#route-model-binding)
    - [隐式绑定](#implicit-binding)
    - [隐式枚举绑定](#implicit-enum-binding)
    - [显式绑定](#explicit-binding)
- [回退路由](#fallback-routes)
- [限流](#rate-limiting)
    - [定义限流器](#defining-rate-limiters)
    - [独立访客和认证用户的限流](#attaching-rate-limiters-to-routes)
- [伪造表单方法](#form-method-spoofing)
- [访问当前路由](#accessing-the-current-route)
- [跨源资源共享 (CORS)](#cors)
- [路由缓存](#route-caching)

<a name="basic-routing"></a>
## 基本路由

最基本的Laravel路由接受一个 URI 和一个闭包，提供了一个简单优雅的方法来定义路由和行为，而不需要复杂的路由配置文件：

    use Illuminate\Support\Facades\Route;

    Route::get('/greeting', function () {
        return 'Hello World';
    });

<a name="the-default-route-files"></a>
#### 默认路由文件

所有 Laravel 路由都定义在你的路由文件中，它位于 `routes` 目录。这些文件会被你的应用程序中的 `App\Providers\RouteServiceProvider` 自动加载。`routes/web.php` 文件用于定义 `web` 界面的路由。这些路由被分配给 `web` 中间件组, 它提供了 SESSION 状态和 CSRF 保护等功能。定义在 `routes/api.php` 中的路由都是无状态的，并且被分配了 `api` 中间件组。

对于大多数应用程序，都是以在 `routes/web.php` 文件定义路由开始的。可以通过在浏览器中输入定义的路由 URL 来访问 `routes/web.php` 中定义的路由。例如，你可以在浏览器中输入 `http://example.com/user` 来访问以下路由：

    use App\Http\Controllers\UserController;

    Route::get('/user', [UserController::class, 'index']);



定义在 `routes/api.php` 文件中的路由是被 `RouteServiceProvider` 嵌套在一个路由组内。 在这个路由组内, 将自动应用 `/api` URI 前缀，所以你无需手动将其应用于文件中的每个路由。你可以通过修改 `RouteServiceProvider` 类来修改前缀和其他路由组选项。

<a name="available-router-methods"></a>
#### 可用的路由方法

路由器允许你注册能响应任何 HTTP 请求的路由：

    Route::get($uri, $callback);
    Route::post($uri, $callback);
    Route::put($uri, $callback);
    Route::patch($uri, $callback);
    Route::delete($uri, $callback);
    Route::options($uri, $callback);

有的时候你可能需要注册一个可响应多个 HTTP 请求的路由，这时你可以使用 `match` 方法，也可以使用 `any` 方法注册一个实现响应所有 HTTP 请求的路由：

    Route::match(['get', 'post'], '/', function () {
        //
    });

    Route::any('/', function () {
        //
    });

> 技巧：当定义多个相同路由时，使用 `get`， `post`， `put`， `patch`， `delete`， 和 `options` 方法的路由应该在使用 `any`， `match`， 和 `redirect` 方法的路由之前定义，这样可以确保请求与正确的路由匹配。

<a name="dependency-injection"></a>
#### 依赖注入

你可以在路由的回调方法中，以形参的方式声明路由所需要的任何依赖项。这些依赖会被 Laravel 的 [容器](/docs/laravel/9.x/container) 自动解析并注入。 例如, 你可以在闭包中声明 `Illuminate\Http\Request` 类，让当前的 HTTP 请求自动注入依赖到你的路由回调中：

    use Illuminate\Http\Request;

    Route::get('/users', function (Request $request) {
        // ...
    });



<a name="csrf-protection"></a>
#### CSRF 保护

请记住，指向 `POST`、`PUT`、`PATCH`、或 `DELETE` 路由的任何 HTML 表单都应该包含一个 CSRF 令牌字段，否则，这个请求将会被拒绝。可以在 [CSRF 文档](/docs/laravel/9.x/csrf) 中阅读有关 CSRF 更多的信息：

    <form method="POST" action="/profile">
        @csrf
        ...
    </form>

<a name="redirect-routes"></a>
### 重定向路由

如果要定义重定向到另一个 URI 的路由，可以使用 `Route::redirect` 方法。这个方法可以快速的实现重定向，而不再需要去定义完整的路由或者控制器：

    Route::redirect('/here', '/there');

默认情况下，`Route::redirect` 返回 `302` 状态码。你可以使用可选的第三个参数来定制状态码：

    Route::redirect('/here', '/there', 301);

或者，你可以使用 `Route::permanentRedirect` 方法返回 `301` 状态码：

    Route::permanentRedirect('/here', '/there');

> 注意：在重定向路由中使用路由参数时，以下参数由 Laravel 保留，不能使用：  `destination` 和 `status`

<a name="view-routes"></a>
### 视图路由

如果你的路由只需要返回一个 [视图](/docs/laravel/9.x/views)，可以使用 `Route::view` 方法。它和 `redirect` 一样方便，不需要定义完整的路由或控制器。`view` 方法有三个参数，其中前两个是必填参数，分别是 URI 和视图名称。第三个参数选填，可以传入一个数组，数组中的数据会被传递给视图：

    Route::view('/welcome', 'welcome');

    Route::view('/welcome', 'welcome', ['name' => 'Taylor']);

> 注意：当在视图路由使用路由参数，下面的参数是由 Laravel 保留，不能使用：`view`， `data`，`status`，和 `headers`



<a name="route-parameters"></a>
## 路由参数

<a name="required-parameters"></a>
### 必填参数

有时你将需要捕获路由内的 URI 段。例如，你可能需要从 URL 中捕获用户的 ID。你可以通过定义路由参数来做到这一点：

    Route::get('/user/{id}', function ($id) {
        return 'User '.$id;
    });

也可以根据你的需要在路由中定义多个参数：

    Route::get('/posts/{post}/comments/{comment}', function ($postId, $commentId) {
        //
    });

路由的参数通常都会被放在 `{}` ，并且参数名只能为字母。下划线 (`_`) 也可以用于路由参数名中。路由参数会按路由定义的顺序依次注入到路由回调或者控制器中，而不受回调或者控制器的参数名称的影响。

<a name="parameters-and-dependency-injection"></a>
#### 参数和依赖注入

如果你的路由具有依赖关系，而你希望 Laravel 服务容器自动注入到路由的回调中，则应在依赖关系之后列出路由参数：

    use Illuminate\Http\Request;

    Route::get('/user/{id}', function (Request $request, $id) {
        return 'User '.$id;
    });

<a name="parameters-optional-parameters"></a>
### 可选参数

有时，你可能需要指定一个路由参数，但你希望这个参数是可选的。你可以在参数后面加上 `?` 标记来实现，但前提是要确保路由的相应变量有默认值：

    Route::get('/user/{name?}', function ($name = null) {
        return $name;
    });

    Route::get('/user/{name?}', function ($name = 'John') {
        return $name;
    });

<a name="parameters-regular-expression-constraints"></a>


### 正则表达式约束

你可以使用路由实例上的 where 方法来限制路由参数的格式。 where 方法接受参数的名称和定义如何约束参数的正则表达式：

    Route::get('/user/{name}', function ($name) {
        //
    })->where('name', '[A-Za-z]+');

    Route::get('/user/{id}', function ($id) {
        //
    })->where('id', '[0-9]+');

    Route::get('/user/{id}/{name}', function ($id, $name) {
        //
    })->where(['id' => '[0-9]+', 'name' => '[a-z]+']);

为方便起见，一些常用的正则表达式模式具有帮助方法，可让你快速将模式约束添加到路由：

    Route::get('/user/{id}/{name}', function ($id, $name) {
        //
    })->whereNumber('id')->whereAlpha('name');

    Route::get('/user/{name}', function ($name) {
        //
    })->whereAlphaNumeric('name');

    Route::get('/user/{id}', function ($id) {
        //
    })->whereUuid('id');

如果传入的请求与路由模式约束不匹配，将返回 404 HTTP 响应。

<a name="parameters-global-constraints"></a>
#### 全局约束

如果你希望路由参数始终受给定正则表达式的约束，你可以使用 `pattern` 方法。 你应该在 `App\Providers\RouteServiceProvider` 类的 `boot` 方法中定义这些模式：

    /**
     * 定义路由模型绑定、模式过滤器等。
     *
     * @return void
     */
    public function boot()
    {
        Route::pattern('id', '[0-9]+');
    }

一旦定义了模式，它就会自动应用到使用该参数名称的所有路由：

    Route::get('/user/{id}', function ($id) {
        // 仅当{id}是数字时执行。。。
    });



<a name="parameters-encoded-forward-slashes"></a>
#### 编码正斜杠

Laravel 路由组件允许除 `/` 之外的所有字符出现在路由参数值中。 你必须使用 `where` 条件正则表达式明确允许 `/` 成为占位符的一部分：

    Route::get('/search/{search}', function ($search) {
        return $search;
    })->where('search', '.*');

> 注意：仅在最后一个路由段中支持编码的正斜杠。

<a name="named-routes"></a>
## 命名路由

命名路由允许为特定路由方便地生成URL或重定向。通过将	`name` 方法链接到路由定义上，可以指定路由的名称：

    Route::get('/user/profile', function () {
        //
    })->name('profile');

你还可以为控制器操作指定路由名称：

    Route::get(
        '/user/profile',
        [UserProfileController::class, 'show']
    )->name('profile');

> 注意：路由名称应始终是唯一的。

<a name="generating-urls-to-named-routes"></a>
#### 生成命名路由的 URL

一旦你为给定的路由分配了一个名字，你可以在通过 Laravel 的 `route` 和 `redirect` 辅助函数生成 URL 或重定向时使用该路由的名称：

    // 正在生成 URL...
    $url = route('profile');

    // 正在生成重定向...
    return redirect()->route('profile');

如果命名路由定义了参数，你可以将参数作为第二个参数传递给 `route` 函数。 给定的参数将自动插入到生成的 URL 的正确位置：

    Route::get('/user/{id}/profile', function ($id) {
        //
    })->name('profile');

    $url = route('profile', ['id' => 1]);

如果你在数组中传递其他参数，这些键/值对将自动添加到生成的 URL 的查询字符串中：

    Route::get('/user/{id}/profile', function ($id) {
        //
    })->name('profile');

    $url = route('profile', ['id' => 1, 'photos' => 'yes']);

    // /user/1/profile?photos=yes

> 技巧：有时，你可能希望为 URL 参数指定请求范围的默认值，例如当前语言环境。 为此，你可以使用 [`URL::defaults` 方法](/docs/laravel/9.x/urls#default-values)。



<a name="inspecting-the-current-route"></a>
#### 检查当前路由

如果你想确定当前请求是否路由到给定的命名路由，你可以在 Route 实例上使用 `named` 方法。 例如，你可以从路由中间件检查当前路由名称：

    /**
     * 处理传入的请求。
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->route()->named('profile')) {
            //
        }

        return $next($request);
    }

<a name="route-groups"></a>
## 路由组

路由组允许你共享路由属性，例如中间件，而无需在每个单独的路由上定义这些属性。

嵌套组尝试智能地将属性与其父组「合并」。中间件和 `where` 条件合并，同时附加名称和前缀。 URI 前缀中的命名空间分隔符和斜杠会在适当的地方自动添加。

<a name="route-group-middleware"></a>
### 路由中间件

要将 [middleware](/docs/laravel/9.x/middleware) 分配给组内的所有路由，你可以在定义组之前使用 `middleware` 方法。 中间件按照它们在数组中列出的顺序执行：

    Route::middleware(['first', 'second'])->group(function () {
        Route::get('/', function () {
            // 使用第一个和第二个中间件...
        });

        Route::get('/user/profile', function () {
            // 使用第一个和第二个中间件...
        });
    });

<a name="route-group-controllers"></a>
### 控制器

如果一组路由都使用相同的 [控制器](/docs/laravel/9.x/controllers)，你可以使用 `controller` 方法为组内的所有路由定义公共控制器。然后，在定义路由时，你只需要提供它们调用的控制器方法：

    use App\Http\Controllers\OrderController;

    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders/{id}', 'show');
        Route::post('/orders', 'store');
    });



<a name="route-group-subdomain-routing"></a>
### 子域路由

路由组也可以用来处理子域路由。子域可以像路由 uri 一样被分配路由参数，允许你捕获子域的一部分以便在路由或控制器中使用。子域可以在定义组之前调用 `domain` 方法来指定:

    Route::domain('{account}.example.com')->group(function () {
        Route::get('user/{id}', function ($account, $id) {
            //
        });
    });

> 注意：为了确保子域路由是可以访问的，你应该在注册根域路由之前注册子域路由。这将防止根域路由覆盖具有相同 URI 路径的子域路由。

<a name="route-group-prefixes"></a>
### 路由前缀

`prefix` 方法可以用给定的 URI 为组中的每个路由做前缀。例如，你可能想要在组内的所有路由 uri 前面加上 `admin` 前缀：

    Route::prefix('admin')->group(function () {
        Route::get('/users', function () {
            // Matches The "/admin/users" URL
        });
    });

<a name="route-group-name-prefixes"></a>
### 路由名称前缀

`name` 方法可以用给定字符串作为组中的每个路由名的前缀。例如，你可能想要用 `admin` 作为所有分组路由的前缀。因为给定字符串的前缀与指定的路由名完全一致，所以我们一定要提供末尾 `.` 字符在前缀中：

    Route::name('admin.')->group(function () {
        Route::get('/users', function () {
            // Route assigned name "admin.users"...
        })->name('users');
    });

<a name="route-model-binding"></a>


## 路由模型绑定

将模型 ID 注入到路由或控制器操作时，你通常会查询数据库以检索与该 ID 对应的模型。Laravel 路由模型绑定提供了一种方便的方法来自动将模型实例直接注入到你的路由中。例如，你可以注入与给定 ID 匹配的整个 `User` 模型实例，而不是注入用户的 ID。

<a name="implicit-binding"></a>
### 隐式绑定

Laravel 自动解析定义在路由或控制器操作中的 Eloquent 模型，其类型提示的变量名称与路由段名称匹配。例如：

    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        return $user->email;
    });

由于 `$user` 变量被类型提示为 `App\Models\User` Eloquent 模型，并且变量名称与 `{user}` URI 段匹配，Laravel 将自动注入 ID 匹配相应的模型实例 来自请求 URI 的值。如果在数据库中没有找到匹配的模型实例，将自动生成 404 HTTP 响应。

当然，使用控制器方法时也可以使用隐式绑定。同样，请注意 `{user}` URI 段与控制器中的 `$user` 变量匹配，该变量包含 `App\Models\User` 类型提示：

    use App\Http\Controllers\UserController;
    use App\Models\User;

    // Route definition...
    Route::get('/users/{user}', [UserController::class, 'show']);

    // Controller method definition...
    public function show(User $user)
    {
        return view('user.profile', ['user' => $user]);
    }

<a name="implicit-soft-deleted-models"></a>
#### 软删除模型

通常，隐式模型绑定不会检索已 [软删除](/docs/laravel/9.x/eloquent#soft-deleting) 的模型。但是，你可以通过将 `withTrashed` 方法链接到你的路由定义来指示隐式绑定来检索这些模型：

    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        return $user->email;
    })->withTrashed();

<a name="customizing-the-key"></a>
<a name="customizing-the-default-key-name"></a>
#### 自定义密钥

有时你可能希望使用 id 以外的列来解析 Eloquent 模型。为此，你可以在路由参数定义中指定列：

    use App\Models\Post;

    Route::get('/posts/{post:slug}', function (Post $post) {
        return $post;
    });

如果你希望模型绑定在检索给定模型类时始终使用 `id` 以外的数据库列，则可以覆盖 Eloquent 模型上的 `getRouteKeyName` 方法：

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

<a name="implicit-model-binding-scoping"></a>
#### 自定义键和范围

当在单个路由定义中隐式绑定多个 Eloquent 模型时，你可能希望限定第二个 Eloquent 模型的范围，使其必须是前一个 Eloquent 模型的子模型。例如，考虑这个通过 slug 为特定用户检索博客文章的路由定义：

    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
        return $post;
    });

当使用自定义键控隐式绑定作为嵌套路由参数时，Laravel 将自动限定查询范围以通过其父级检索嵌套模型，使用约定来猜测父级上的关系名称。 在这种情况下，假设 `User` 模型有一个名为 `posts` 的关系（路由参数名称的复数形式），可用于检索 `Post` 模型。

如果你愿意，即使未提供自定义键，你也可以指示 Laravel 限定「子」绑定的范围。为此，你可以在定义路由时调用 `scopeBindings` 方法：

    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    })->scopeBindings();

或者，你可以指示整个路由定义组使用范围绑定：

    Route::scopeBindings()->group(function () {
        Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
            return $post;
        });
    });

<a name="customizing-missing-model-behavior"></a>
#### 自定义缺失模型行为

通常，如果未找到隐式绑定模型，则会生成 404 HTTP 响应。但是，你可以通过在定义路由时调用 `missing` 方法来自定义此行为。`missing` 方法接受一个闭包，如果找不到隐式绑定模型，则将调用该闭包：

    use App\Http\Controllers\LocationsController;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Redirect;

    Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
            ->name('locations.view')
            ->missing(function (Request $request) {
                return Redirect::route('locations.index');
            });

<a name="implicit-enum-binding"></a>
### 隐式枚举绑定

PHP 8.1 引入了对 [Enums](https://www.php.net/manual/en/language.enumerations.backed.php) 的支持。为了补充这个特性，Laravel 允许你在你的路由定义中键入一个 Enum，并且 Laravel 只会在该路由段对应于一个有效的 Enum 值时调用该路由。否则，将自动返回 404 HTTP 响应。例如，给定以下枚举：

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

你可以定义一个只有在 `{category}` 路由段是 `fruits` 或 `people` 时才会被调用的路由。 否则，Laravel 将返回 404 HTTP 响应：

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 显式绑定

你不需要使用 Laravel 隐式的、基于约定的模型解析来使用模型绑定。你还可以显式定义路由参数与模型的对应方式。要注册显式绑定，请使用路由器的“模型”方法为给定参数指定类。 你应该在 RouteServiceProvider 类的 boot 方法的开头定义显式模型绑定：

    use App\Models\User;
    use Illuminate\Support\Facades\Route;

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        Route::model('user', User::class);

        // ...
    }

接下来，定义一个包含 `{user}` 参数的路由：

    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        //
    });

由于我们已将所有 `{user}` 参数绑定到 `App\Models\User` 模型，该类的一个实例将被注入到路由中。 因此，例如，对 `users/1` 的请求将从 ID 为 `1` 的数据库中注入 `User` 实例。

如果在数据库中没有找到匹配的模型实例，则会自动生成 404 HTTP 响应。

<a name="customizing-the-resolution-logic"></a>
#### 自定义解析逻辑

如果你想定义你自己的模型绑定解析逻辑，你可以使用 `Route::bind` 方法。传递给 `bind` 方法的闭包将接收 URI 段的值，并应返回应注入路由的类的实例。同样，这种定制应该在应用程序的 `RouteServiceProvider` 的 `boot` 方法中进行：

    use App\Models\User;
    use Illuminate\Support\Facades\Route;

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        Route::bind('user', function ($value) {
            return User::where('name', $value)->firstOrFail();
        });

        // ...
    }

或者，你可以覆盖 Eloquent 模型上的 `resolveRouteBinding` 方法。此方法将接收 URI 段的值，并应返回应注入路由的类的实例：

    /**
     * Retrieve the model for a bound value.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('name', $value)->firstOrFail();
    }

如果路由正在使用 [implicit binding scoping](#implicit-model-binding-scoping)，则 `resolveChildRouteBinding` 方法将用于解析父模型的子绑定：

    /**
     * Retrieve the child model for a bound value.
     *
     * @param  string  $childType
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveChildRouteBinding($childType, $value, $field)
    {
        return parent::resolveChildRouteBinding($childType, $value, $field);
    }

<a name="fallback-routes"></a>
## fallback 路由

使用 `Route::fallback` 方法，你可以定义一个在没有其他路由匹配传入请求时将执行的路由。 通常，未处理的请求将通过应用程序的异常处理程序自动呈现「404」页面。但是，由于你通常会在 `routes/web.php` 文件中定义 `fallback` 路由，因此 `web` 中间件组中的所有中间件都将应用于该路由。你可以根据需要随意向此路由添加额外的中间件：

    Route::fallback(function () {
        //
    });

> 注意：fallback路由应该始终是你的应用程序注册的最后一个路由。

<a name="rate-limiting"></a>
## 速率限制

<a name="defining-rate-limiters"></a>
### 定义速率限制器

Laravel 包含强大且可自定义的速率限制服务，你可以利用这些服务来限制给定路由或一组路由的流量。首先，你应该定义满足应用程序需求的速率限制器配置。通常，这应该在应用程序的 `App\Providers\RouteServiceProvider` 类的 `configureRateLimiting` 方法中完成。

速率限制器是使用 `RateLimiter` 外观的 `for` 方法定义的。 `for` 方法接受一个速率限制器名称和一个闭包，该闭包返回应该应用于分配给速率限制器的路由的限制配置。限制配置是 `Illuminate\Cache\RateLimiting\Limit` 类的实例。此类包含有用的「构建器」方法，以便你可以快速定义限制。速率限制器名称可以是你希望的任何字符串：

    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Support\Facades\RateLimiter;

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(1000);
        });
    }

如果传入的请求超过指定的速率限制，Laravel 将自动返回一个带有 429 HTTP 状态码的响应。如果你想定义自己的响应，应该由速率限制返回，你可以使用 `response` 方法：

    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000)->response(function () {
            return response('Custom response...', 429);
        });
    });

由于速率限制器回调接收传入的 HTTP 请求实例，你可以根据传入的请求或经过身份验证的用户动态构建适当的速率限制：

    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()->vipCustomer()
                    ? Limit::none()
                    : Limit::perMinute(100);
    });

<a name="segmenting-rate-limits"></a>
#### 分段速率限制

有时你可能希望按某个任意值对速率限制进行分段。例如，你可能希望每个 IP 地址每分钟允许用户访问给定路由 100 次。为此，你可以在构建速率限制时使用 `by` 方法：

    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()->vipCustomer()
                    ? Limit::none()
                    : Limit::perMinute(100)->by($request->ip());
    });

为了使用另一个示例来说明此功能，我们可以将每个经过身份验证的用户 ID 的路由访问限制为每分钟 100 次，或者对于访客来说，每个 IP 地址每分钟访问 10 次：

    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()
                    ? Limit::perMinute(100)->by($request->user()->id)
                    : Limit::perMinute(10)->by($request->ip());
    });

<a name="multiple-rate-limits"></a>
#### 多个速率限制

如果需要，你可以返回给定速率限制器配置的速率限制数组。将根据路由在数组中的放置顺序评估每个速率限制：

    RateLimiter::for('login', function (Request $request) {
        return [
            Limit::perMinute(500),
            Limit::perMinute(3)->by($request->input('email')),
        ];
    });

<a name="attaching-rate-limiters-to-routes"></a>
### 将速率限制器附加到路由

可以使用 `throttle` [middleware](/docs/laravel/9.x/middleware) 将速率限制器附加到路由或路由组。路由中间件接受你希望分配给路由的速率限制器的名称：

    Route::middleware(['throttle:uploads'])->group(function () {
        Route::post('/audio', function () {
            //
        });

        Route::post('/video', function () {
            //
        });
    });

<a name="throttling-with-redis"></a>
#### 使用 Redis 节流

通常，`throttle` 中间件映射到 `Illuminate\Routing\Middleware\ThrottleRequests` 类。 此映射在应用程序的 HTTP 内核 (`App\Http\Kernel`) 中定义。但是，如果你使用 Redis 作为应用程序的缓存驱动程序，你可能希望更改此映射以使用 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 类。这个类在使用 Redis 管理速率限制方面更有效：

    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,

<a name="form-method-spoofing"></a>
## 伪造表单方法

HTML 表单不支持「PUT」，「PATCH」或「DELETE」请求。所以，当定义「PUT」，「PATCH」或「DELETE」路由用在 HTML 表单时，你将需要一个隐藏的加「_method」字段在表单中。该「_method」字段的值将会与 HTTP 请求一起发送。

    <form action="/example" method="POST">
        <input type="hidden" name="_method" value="PUT">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
    </form>

为方便起见，你可以使用 `@method` [Blade 指令](/docs/laravel/9.x/blade) 生成 `_method` 输入字段：

    <form action="/example" method="POST">
        @method('PUT')
        @csrf
    </form>

<a name="accessing-the-current-route"></a>
## 访问当前路由

你可以使用 `Route Facade` 的 `current`、`currentRouteName` 和 `currentRouteAction` 方法来访问有关处理传入请求的路由的信息：

    use Illuminate\Support\Facades\Route;

    $route = Route::current(); // Illuminate\Routing\Route
    $name = Route::currentRouteName(); // string
    $action = Route::currentRouteAction(); // string

你可以参考[Route facade 的底层类](https://laravel.com/api/laravel/9.x/Illuminate/Routing/Router.html) 和 [Route 实例](https://laravel.com/api/laravel/9.x/Illuminate/Routing/Route.html) 的 API 文档查看路由器和路由类上可用的所有方法。

<a name="cors"></a>
## 跨域资源共享 (CORS)

Laravel 可以使用你配置的值自动响应 CORS `OPTIONS` HTTP 请求。所有 CORS 设置都可以在应用程序的 `config/cors.php` 配置文件中进行配置。 `OPTIONS` 请求将由默认包含在全局中间件堆栈中的 `HandleCors` [中间件](/docs/laravel/9.x/middleware) 自动处理。你的全局中间件堆栈位于应用程序的 HTTP 内核 (`App\Http\Kernel`) 中。

> 技巧：有关 CORS 和 CORS 标头的更多信息，请参阅 [MDN 关于 CORS 的 Web 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)。

<a name="route-caching"></a>
## 路由缓存

在将应用程序部署到生产环境时，你应该利用 Laravel 的路由缓存。使用路由缓存将大大减少注册所有应用程序路由所需的时间。要生成路由缓存，请执行 `route:cache` Artisan 命令：

```shell
php artisan route:cache
```

运行此命令后，你的缓存路由文件将在每个请求上加载。请记住，如果你添加任何新路线，你将需要生成新的路线缓存。因此，你应该只在项目部署期间运行 `route:cache` 命令。

你可以使用 `route:clear` 命令清除路由缓存：

```shell
php artisan route:clear
```


<a name="自定义秘钥"></a>
<a name="自定义键和范围"></a>
