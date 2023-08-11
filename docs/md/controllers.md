# 控制器

- [介绍](#introduction)
- [编写控制器](#writing-controllers)
    - [基本控制器](#basic-controllers)
    - [单动作控制器](#single-action-controllers)
- [控制器中间件](#controller-middleware)
- [资源控制器](#resource-controllers)
    - [部分资源路由](#restful-partial-resource-routes)
    - [嵌套资源](#restful-nested-resources)
    - [命名资源路由](#restful-naming-resource-routes)
    - [命名资源路由参数](#restful-naming-resource-route-parameters)
    - [范围资源路由](#restful-scoping-resource-routes)
    - [本地化资源 URI](#restful-localizing-resource-uris)
    - [补充资源控制器](#restful-supplementing-resource-controllers)
    - [单例资源控制器](#singleton-resource-controllers)
- [依赖注入和控制器](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 介绍

你可能希望使用「controller」类来组织此行为，而不是将所有请求处理逻辑定义为路由文件中的闭包。控制器可以将相关的请求处理逻辑分组到一个类中。 例如，一个 `UserController` 类可能会处理所有与用户相关的传入请求，包括显示、创建、更新和删除用户。 默认情况下，控制器存储在 `app/Http/Controllers` 目录中。

<a name="writing-controllers"></a>
## 编写控制器

<a name="basic-controllers"></a>
### 基本控制器

如果要快速生成新控制器，可以使用 `make:controller` Artisan 命令。默认情况下，应用程序的所有控制器都存储在`app/Http/Controllers` 目录中：

```shell
php artisan make:controller UserController
```

让我们来看一个基本控制器的示例。控制器可以有任意数量的公共方法来响应传入的HTTP请求：

    <?php

    namespace App\Http\Controllers;
    
    use App\Models\User;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 显示给定用户的配置文件。
         */
        public function show(string $id): View
        {
            return view('user.profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }



编写控制器类和方法后，可以定义到控制器方法的路由，如下所示：

    use App\Http\Controllers\UserController;

    Route::get('/user/{id}', [UserController::class, 'show']);

当传入的请求与指定的路由 URI 匹配时，将调用 `App\Http\Controllers\UserController` 类的 `show` 方法，并将路由参数传递给该方法。

>技巧：控制器并不是 **必需** 继承基础类。如果控制器没有继承基础类，你将无法使用一些便捷的功能，比如 `middleware` 和 `authorize` 方法。

<a name="single-action-controllers"></a>
### 单动作控制器

如果控制器动作特别复杂，你可能会发现将整个控制器类专用于该单个动作很方便。为此，您可以在控制器中定义一个 `__invoke` 方法：

    <?php

    namespace App\Http\Controllers;
    
    use App\Models\User;
    use Illuminate\Http\Response;

    class ProvisionServer extends Controller
    {
        /**
         * 设置新的web服务器。
         */
        public function __invoke()
        {
            // ...
        }
    }

为单动作控制器注册路由时，不需要指定控制器方法。相反，你可以简单地将控制器的名称传递给路由器：

    use App\Http\Controllers\ProvisionServer;

    Route::post('/server', ProvisionServer::class);

你可以使用 `make:controller` Artisan 命令的 `--invokable` 选项生成可调用控制器：

```shell
php artisan make:controller ProvisionServer --invokable
```

>技巧：可以使用 [stub 定制](/docs/laravel/10.x/artisan#stub-customization) 自定义控制器模板。

<a name="controller-middleware"></a>
## 控制器中间件

[中间件](/docs/laravel/10.x/middleware) 可以在你的路由文件中分配给控制器的路由：

    Route::get('profile', [UserController::class, 'show'])->middleware('auth');



或者，你可能会发现在控制器的构造函数中指定中间件很方便。使用控制器构造函数中的 `middleware` 方法，你可以将中间件分配给控制器的操作：

    class UserController extends Controller
    {
        /**
         * Instantiate a new controller instance.
         */
        public function __construct()
        {
            $this->middleware('auth');
            $this->middleware('log')->only('index');
            $this->middleware('subscribed')->except('store');
        }
    }

控制器还允许你使用闭包注册中间件。这提供了一种方便的方法来为单个控制器定义内联中间件，而无需定义整个中间件类：

    use Closure;
    use Illuminate\Http\Request;

    $this->middleware(function (Request $request, Closure $next) {
        return $next($request);
    });

<a name="resource-controllers"></a>
## 资源型控制器

如果你将应用程序中的每个 Eloquent 模型都视为资源，那么通常对应用程序中的每个资源都执行相同的操作。例如，假设你的应用程序中包含一个 `Photo` 模型和一个 `Movie` 模型。用户可能可以创建，读取，更新或者删除这些资源。

Laravel 的资源路由通过单行代码即可将典型的增删改查（“CURD”）路由分配给控制器。首先，我们可以使用 Artisan 命令 `make:controller` 的 `--resource` 选项来快速创建一个控制器:

```shell
php artisan make:controller PhotoController --resource
```

这个命令将会生成一个控制器 `app/Http/Controllers/PhotoController.php`。其中包括每个可用资源操作的方法。接下来，你可以给控制器注册一个资源路由：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class);



这个单一的路由声明创建了多个路由来处理资源上的各种行为。生成的控制器为每个行为保留了方法，而且你可以通过运行 Artisan 命令 `route:list` 来快速了解你的应用程序。

你可以通过将数组传参到 `resources` 方法中的方式来一次性的创建多个资源控制器：

    Route::resources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);

<a name="actions-handled-by-resource-controller"></a>
#### 资源控制器操作处理

|请求方式      | 请求URI                    | 行为       | 路由名称
----------|------------------------|--------------|---------------------
GET       | `/photos`              | index        | photos.index
GET       | `/photos/create`       | create       | photos.create
POST      | `/photos`              | store        | photos.store
GET       | `/photos/{photo}`      | show         | photos.show
GET       | `/photos/{photo}/edit` | edit         | photos.edit
PUT/PATCH | `/photos/{photo}`      | update       | photos.update
DELETE    | `/photos/{photo}`      | destroy      | photos.destroy

<a name="customizing-missing-model-behavior"></a>
#### 自定义缺失模型行为

通常，如果未找到隐式绑定的资源模型，则会生成状态码为 404 的 HTTP 响应。 但是，你可以通过在定义资源路由时调用 `missing` 的方法来自定义该行为。`missing` 方法接受一个闭包，如果对于任何资源的路由都找不到隐式绑定模型，则将调用该闭包：

    use App\Http\Controllers\PhotoController;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Redirect;

    Route::resource('photos', PhotoController::class)
            ->missing(function (Request $request) {
                return Redirect::route('photos.index');
            });

<a name="soft-deleted-models"></a>
#### 软删除模型

通常情况下，隐式模型绑定将不会检索已经进行了 [软删除](/docs/laravel/10.x/eloquent#soft-deleting) 的模型，并且会返回一个 404 HTTP 响应。但是，你可以在定义资源路由时调用 `withTrashed` 方法来告诉框架允许软删除的模型：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->withTrashed();



当不传递参数调用 `withTrashed` 时，将在 `show`、`edit` 和 `update` 资源路由中允许软删除的模型。你可以通过一个数组指定这些路由的子集传递给 `withTrashed` 方法：

    Route::resource('photos', PhotoController::class)->withTrashed(['show']);

<a name="specifying-the-resource-model"></a>
#### 指定资源模型

如果你使用了路由模型的绑定 [路由模型绑定](/docs/laravel/10.x/routing#route-model-binding) 并且想在资源控制器的方法中使用类型提示，你可以在生成控制器的时候使用 `--model` 选项：

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 生成表单请求

你可以在生成资源控制器时提供 `--requests`  选项来让 Artisan 为控制器的 storage 和 update 方法生成 [表单请求类](/docs/laravel/10.x/validation#form-request-validation)：

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 部分资源路由

当声明资源路由时，你可以指定控制器处理的部分行为，而不是所有默认的行为：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->only([
        'index', 'show'
    ]);

    Route::resource('photos', PhotoController::class)->except([
        'create', 'store', 'update', 'destroy'
    ]);

<a name="api-resource-routes"></a>
#### API 资源路由

当声明用于 API 的资源路由时，通常需要排除显示 HTML 模板的路由，例如 `create` 和 `edit`。为了方便，你可以使用 `apiResource` 方法来排除这两个路由：

    use App\Http\Controllers\PhotoController;

    Route::apiResource('photos', PhotoController::class);



你也可以传递一个数组给 `apiResources` 方法来同时注册多个 API 资源控制器：

    use App\Http\Controllers\PhotoController;
    use App\Http\Controllers\PostController;

    Route::apiResources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);

要快速生成不包含 `create` 或 `edit` 方法的 API 资源控制器，你可以在执行 `make:controller` 命令时使用 `--api` 参数：

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 嵌套资源

有时可能需要定义一个嵌套的资源型路由。例如，照片资源可能被添加了多个评论。那么可以在路由中使用 `.` 符号来声明资源型控制器：

    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class);

该路由会注册一个嵌套资源，可以使用如下 URI 访问：

    /photos/{photo}/comments/{comment}

<a name="scoping-nested-resources"></a>
#### 限定嵌套资源的范围

Laravel 的 [隐式模型绑定](/docs/laravel/10.x/routing#implicit-model-binding-scoping) 特性可以自动限定嵌套绑定的范围，以便确认已解析的子模型会自动属于父模型。定义嵌套路由时，使用 scoped 方法，可以开启自动范围限定，也可以指定 Laravel 应该按照哪个字段检索子模型资源，有关如何完成此操作的更多信息，请参见有关 [范围资源路由](#restful-scoping-resource-routes) 的文档。

<a name="shallow-nesting"></a>
#### 浅层嵌套

通常，并不是在所有情况下都需要在 URI 中同时拥有父 ID 和子 ID，因为子 ID 已经是唯一的标识符。当使用唯一标识符（如自动递增的主键）来标识 URL 中的模型时，可以选择使用「浅嵌套」的方式定义路由：

    use App\Http\Controllers\CommentController;

    Route::resource('photos.comments', CommentController::class)->shallow();



上面的路由定义方式会定义以下路由：

|请求方式       | 请求URI                               | 行为       | 路由名称
----------|-----------------------------------|--------------|---------------------
GET       | `/photos/{photo}/comments`        | index        | photos.comments.index
GET       | `/photos/{photo}/comments/create` | create       | photos.comments.create
POST      | `/photos/{photo}/comments`        | store        | photos.comments.store
GET       | `/comments/{comment}`             | show         | comments.show
GET       | `/comments/{comment}/edit`        | edit         | comments.edit
PUT/PATCH | `/comments/{comment}`             | update       | comments.update
DELETE    | `/comments/{comment}`             | destroy      | comments.destroy

<a name="restful-naming-resource-routes"></a>
### 命名资源路由

默认情况下，所有的资源控制器行为都有一个路由名称。你可以传入 `names` 数组来覆盖这些名称：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->names([
        'create' => 'photos.build'
    ]);

<a name="restful-naming-resource-route-parameters"></a>
### 命名资源路由参数

默认情况下，`Route::resource` 会根据资源名称的「单数」形式创建资源路由的路由参数。你可以使用 `parameters` 方法来轻松地覆盖资源路由名称。传入 `parameters` 方法应该是资源名称和参数名称的关联数组：

    use App\Http\Controllers\AdminUserController;

    Route::resource('users', AdminUserController::class)->parameters([
        'users' => 'admin_user'
    ]);

上面的示例将会为资源的 `show` 路由生成以下的 URL：

    /users/{admin_user}

<a name="restful-scoping-resource-routes"></a>
### 限定范围的资源路由

Laravel 的 [作用域隐式模型绑定](/docs/laravel/10.x/routing#implicit-model-binding-scoping) 功能可以自动确定嵌套绑定的范围，以便确认已解析的子模型属于父模型。通过在定义嵌套资源时使用 `scoped` 方法，你可以启用自动范围界定，并指示 Laravel 应该通过以下方式来检索子资源的哪个字段：

    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class)->scoped([
        'comment' => 'slug',
    ]);



此路由将注册一个有范围的嵌套资源，该资源可以通过以下 URI 进行访问：

    /photos/{photo}/comments/{comment:slug}

当使用一个自定义键的隐式绑定作为嵌套路由参数时，Laravel 会自动限定查询范围，按照约定的命名方式去父类中查找关联方法，然后检索到对应的嵌套模型。在这种情况下，将假定 `Photo` 模型有一个叫 `comments` （路由参数名的复数）的关联方法，通过这个方法可以检索到 `Comment` 模型。

<a name="restful-localizing-resource-uris"></a>
### 本地化资源 URIs

默认情况下，`Route::resource` 将会用英文动词创建资源 URIs。如果需要自定义 `create` 和 `edit` 行为的动名词，你可以在 `App\Providers\RouteServiceProvider` 的 `boot` 方法中使用 `Route::resourceVerbs` 方法实现：

    /**
     * 定义你的路由模型绑定，模式过滤器等
     */
    public function boot(): void
    {
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);

        // ...
    }

Laravel 的复数器支持[配置几种不同的语言](/docs/laravel/10.x/localization#pluralization-language)。自定义动词和复数语言后，诸如 `Route::resource('publicacion', PublicacionController::class)` 之类的资源路由注册将生成以下URI：

    /publicacion/crear

    /publicacion/{publicaciones}/editar

<a name="restful-supplementing-resource-controllers"></a>
### 补充资源控制器

如果你需要向资源控制器添加超出默认资源路由集的其他路由，则应在调用 `Route::resource` 方法之前定义这些路由；否则，由 `resource` 方法定义的路由可能会无意中优先于您的补充路由：
单例资源
    use App\Http\Controller\PhotoController;

    Route::get('/photos/popular', [PhotoController::class, 'popular']);
    Route::resource('photos', PhotoController::class);

> 技巧：请记住让你的控制器保持集中。如果你发现自己经常需要典型资源操作集之外的方法，请考虑将控制器拆分为两个更小的控制器。



<a name="singleton-resource-controllers"></a>
### 单例资源控制器

有时候，应用中的资源可能只有一个实例。比如，用户「个人资料」可被编辑或更新，但是一个用户只会有一份「个人资料」。同样，一张图片也只有一个「缩略图」。这些资源就是所谓「单例资源」，这意味着该资源有且只能有一个实例存在。这种情况下，你可以注册成单例(signleton)资源控制器:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

上例中定义的单例资源会注册如下所示的路由。如你所见，单例资源中「新建」路由没有被注册；并且注册的路由不接收路由参数，因为该资源中只有一个实例存在：

|请求方式      | 请求 URI                               | 行为       | 路由名称
----------|-----------------------------------|--------------|---------------------
GET       | `/profile`                        | show         | profile.show
GET       | `/profile/edit`                   | edit         | profile.edit
PUT/PATCH | `/profile`                        | update       | profile.update

单例资源也可以在标准资源内嵌套使用：

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

上例中， `photo` 资源将接收所有的[标准资源路由](#actions-handled-by-resource-controller)；不过，`thumbnail` 资源将会是个单例资源，它的路由如下所示：

| 请求方式      | 请求 URI                              | 行为  | 路由名称               |
|-----------|----------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail`      | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit` | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update  | photos.thumbnail.update  |

<a name="creatable-singleton-resources"></a>
#### Creatable 单例资源

有时，你可能需要为单例资源定义 create 和 storage 路由。要实现这一功能，你可以在注册单例资源路由时，调用 `creatable` 方法：

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```



如下所示，将注册以下路由。还为可创建的单例资源注册 `DELETE` 路由：

| Verb      | URI                                | Action  | Route Name               |
|-----------|------------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy |

如果希望 Laravel 为单个资源注册 `DELETE` 路由，但不注册创建或存储路由，则可以使用 `destroyable` 方法：

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 单例资源

`apiSingleton` 方法可用于注册将通过API操作的单例资源，从而不需要 `create` 和 `edit`  路由：

```php
Route::apiSingleton('profile', ProfileController::class);
```

当然， API 单例资源也可以是 `可创建的` ，它将注册 `store` 和 `destroy` 资源路由：

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 依赖注入和控制器

<a name="constructor-injection"></a>
#### 构造函数注入

Laravel [服务容器](/docs/laravel/10.x/container) 用于解析所有 Laravel 控制器。因此，可以在其构造函数中对控制器可能需要的任何依赖项进行类型提示。声明的依赖项将自动解析并注入到控制器实例中：

    <?php

    namespace App\Http\Controllers;

    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * 创建新控制器实例。
         */
        public function __construct(
            protected UserRepository $users,
        ) {}
    }



<a name="method-injection"></a>
#### 方法注入

除了构造函数注入，还可以在控制器的方法上键入提示依赖项。方法注入的一个常见用例是将 `Illuminate\Http\Request` 实例注入到控制器方法中：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 存储新用户。
         */
        public function store(Request $request): RedirectResponse
        {
            $name = $request->name;

            // 存储用户。。。

            return redirect('/users');
        }
    }

如果控制器方法也需要路由参数，那就在其他依赖项之后列出路由参数。例如，路由是这样定义的：

    use App\Http\Controllers\UserController;

    Route::put('/user/{id}', [UserController::class, 'update']);

如下所示，你依然可以类型提示 `Illuminate\Http\Request` 并通过定义您的控制器方法访问 `id` 参数：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 更新给定用户。
         */
        public function update(Request $request, string $id): RedirectResponse
        {
            // 更新用户。。。

            return redirect('/users');
        }
    }

