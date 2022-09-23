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
- [依赖注入 & 控制器](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 介绍

您可能希望使用“控制器”类来组织此行为，而不是将所有请求处理逻辑定义为路由文件中的闭包。 控制器可以将相关的请求处理逻辑分组到一个类中。 例如，一个 `UserController` 类可能会处理所有与用户相关的传入请求，包括显示、创建、更新和删除用户。 默认情况下，控制器存储在 `app/Http/Controllers` 目录中。

<a name="writing-controllers"></a>
## 编写控制器

<a name="basic-controllers"></a>
### 基本控制器

让我们看一个基本控制器的例子。 请注意，控制器扩展了 Laravel 中包含的基本控制器类 `App\Http\Controllers\Controller`：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;

    class UserController extends Controller
    {
        /**
         * 显示给定用户的个人资料。
         *
         * @param  int  $id
         * @return \Illuminate\View\View
         */
        public function show($id)
        {
            return view('user.profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }

您可以像这样定义此控制器方法的路由：

    use App\Http\Controllers\UserController;

    Route::get('/user/{id}', [UserController::class, 'show']);

当传入的请求与指定的路由 URI 匹配时，将调用 `App\Http\Controllers\UserController` 类的 `show` 方法，并将路由参数传递给该方法。

> 技巧：控制器并不是 **必须** 继承基础类。如果控制器没有继承基础类，你将无法使用一些便捷的功能，比如 `middleware` 和 `authorize` 方法。



<a name="single-action-controllers"></a>
### 单动作控制器

如果控制器动作特别复杂，您可能会发现将整个控制器类专用于该单个动作很方便。为此，您可以在控制器中定义一个 `__invoke` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;

    class ProvisionServer extends Controller
    {
        /**
         * 配置新的 Web 服务器。
         *
         * @return \Illuminate\Http\Response
         */
        public function __invoke()
        {
            // ...
        }
    }

为单动作控制器注册路由时，不需要指定控制器方法。相反，您可以简单地将控制器的名称传递给路由器：

    use App\Http\Controllers\ProvisionServer;

    Route::post('/server', ProvisionServer::class);

您可以使用 `make:controller` Artisan 命令的 `--invokable` 选项生成可调用控制器：

```shell
php artisan make:controller ProvisionServer --invokable
```

> 技巧：可以使用 [stub 定制](/docs/laravel/9.x/artisan#stub-customization) 自定义控制器模板。

<a name="controller-middleware"></a>
## 控制器中间件

[中间件](/docs/laravel/9.x/middleware) 可以在您的路由文件中分配给控制器的路由：

    Route::get('profile', [UserController::class, 'show'])->middleware('auth');

或者，您可能会发现在控制器的构造函数中指定中间件很方便。使用控制器构造函数中的 `middleware` 方法，您可以将中间件分配给控制器的操作：

    class UserController extends Controller
    {
        /**
         * Instantiate a new controller instance.
         *
         * @return void
         */
        public function __construct()
        {
            $this->middleware('auth');
            $this->middleware('log')->only('index');
            $this->middleware('subscribed')->except('store');
        }
    }

控制器还允许您使用闭包注册中间件。这提供了一种方便的方法来为单个控制器定义内联中间件，而无需定义整个中间件类：

    $this->middleware(function ($request, $next) {
        return $next($request);
    });



<a name="resource-controllers"></a>
## 资源型控制器

如果你将应用程序中的每个 Eloquent 模型都视为资源，那么通常对应用程序中的每个资源都执行相同的操作。例如，假设你的应用程序中包含一个 `Photo` 模型和一个 `Movie` 模型。用户可能可以创建，读取，更新或者删除这些资源。

Laravel 的资源路由通过单行代码即可将典型的「CURD (增删改查)」路由分配给控制器。首先，我们可以使用 Artisan 命令 `make:controller` 的 `--resource` 选项来快速创建一个控制器：

```shell
php artisan make:controller PhotoController --resource
```

这个命令将会生成一个控制器 `app/Http/Controllers/PhotoController.php`。其中包括每个可用资源操作的方法。接下来，你可以给控制器注册一个资源路由：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class);

这个单一的路由声明创建了多个路由来处理资源上的各种行为。生成的控制器为每个行为保留了方法，而且你可以通过运行 Artisan 命令 `route:list` 来快速了解你的应用程序。

你可以通过将数组传参到 resources 方法中的方式来一次性的创建多个资源控制器：

    Route::resources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);

<a name="资源控制器操作处理"></a>
#### 资源控制器操作处理

Verb      | URI                    | Action       | Route Name
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

<a name="specifying-the-resource-model"></a>
#### 指定资源模型

如果你使用了路由模型的绑定 [路由模型绑定](https://learnku.com/docs/laravel/8.5/routing#route-model-binding) 并且想在资源控制器的方法中使用类型提示，你可以在生成控制器的时候使用 `--model` 选项：

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 生成表单请求

您可以在生成资源控制器时提供 `--requests` 选项来让 Artisan 为控制器的 storage 和 update 方法生成 [表单请求类](/docs/laravel/9.x/validation#form-request-validation) ：

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

当声明用于 API 的资源路由时，通常需要排除显示 HTML 模板的路由。例如 `create` 和 `edit`。为了方便，你可以使用 `apiResource` 方法来排除这两个路由：

    use App\Http\Controllers\PhotoController;

    Route::apiResource('photos', PhotoController::class);

你也可以传递一个数组给 `apiResources` 方法来同时注册多个 API 资源控制器：

    use App\Http\Controllers\PhotoController;
    use App\Http\Controllers\PostController;

    Route::apiResources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);

要快速生成不包含 `create` 或 `edit` 方法的 API 资源控制器，你可以在执行 `make:controller` 命令时使用 `--api` 参数：

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 嵌套资源

有时可能需要定义一个嵌套的资源型路由。例如，照片资源可能被添加了多个评论。那么可以在路由中使用 `.` 符号来声明资源型控制器：

    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class);

该路由会注册一个嵌套资源，可以使用如下 URI 访问：

    /photos/{photo}/comments/{comment}

<a name="scoping-nested-resources"></a>
#### 限定嵌套资源的范围

Laravel 的 [隐式模型绑定](/docs/laravel/9.x/routing#implicit-model-binding-scoping) 特性可以自动限定嵌套绑定的范围，以便确认已解析的子模型会自动属于父模型。定义嵌套路由时，使用 `scoped` 方法，可以开启自动范围限定，也可以指定 Laravel 应该按照哪个字段检索子模型资源，有关如何完成此操作的更多信息，请参见有关 [范围资源路由](#restful-scoping-resource-routes) 的文档。



<a name="shallow-nesting"></a>
#### 浅层嵌套

通常，并不是在所有情况下都需要在 URI 中同时拥有父 ID 和子 ID，因为子 ID 已经是唯一的标识符。当使用唯一标识符（如自动递增的主键）来标识 URL 中的模型时，可以选择使用「浅嵌套」的方式定义路由：

    use App\Http\Controllers\CommentController;

    Route::resource('photos.comments', CommentController::class)->shallow();

上面的路由定义方式会定义以下路由：

Verb      | URI                               | Action       | Route Name
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

默认情况下，所有的资源控制器行为都有一个路由名称。你可以传入 `names` 数组来覆盖这些名称：

    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->names([
        'create' => 'photos.build'
    ]);

<a name="restful-naming-resource-route-parameters"></a>
### 命名资源路由参数

默认情况下，`Route::resource` 会根据资源名称的「单数」形式创建资源路由的路由参数。你可以使用 `parameters` 方法来轻松地覆盖资源路由名称。传入 `parameters` 方法应该是资源名称和参数名称的关联数组：

    use App\Http\Controllers\AdminUserController;

    Route::resource('users', AdminUserController::class)->parameters([
        'users' => 'admin_user'
    ]);

 

上面的示例将会为资源的 `show` 路由生成以下的 URL：

    /users/{admin_user}

<a name="restful-scoping-resource-routes"></a>
### 限定范围的资源路由

Laravel 的 [作用域隐式模型绑定](/docs/laravel/9.x/routing#implicit-model-binding-scoping) 功能可以自动确定嵌套绑定的范围，以便确认已解析的子模型属于父模型。通过在定义嵌套资源时使用 `scoped` 方法，你可以启用自动范围界定，并指示 Laravel 应该通过以下方式来检索子资源的哪个字段：

    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class)->scoped([
        'comment' => 'slug',
    ]);

此路由将注册一个有范围的嵌套资源，该资源可以通过以下 URI 进行访问：

    /photos/{photo}/comments/{comment:slug}

当使用一个自定义键的隐式绑定作为嵌套路由参数时，Laravel 会自动限定查询范围，按照约定的命名方式去父类中查找关联方法，然后检索到对应的嵌套模型。在这种情况下，将假定 `Photo` 模型有一个叫 `comments`（路由参数名的复数）的关联方法，通过这个方法可以检索到 `Comment` 模型。

<a name="restful-localizing-resource-uris"></a>
### 本地化资源 URIs

默认情况下，`Route::resource` 将会用英文动词创建资源 URIs。如果需要自定义 `create` 和 `edit` 行为的动名词，你可以在 `App\Providers\RouteServiceProvider` 的 `boot` 方法中使用 `Route::resourceVerbs` 方法实现：

    /**
     * 定义你的路由模型绑定，模式过滤器等
     *
     * @return void
     */
    public function boot()
    {
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);

        // ...
    }



一旦这些动词被定义，资源路由注册，例如`route::resource('fotos', PhotoController::class)`将产生以下URI：

    /fotos/crear

    /fotos/{foto}/editar

<a name="restful-supplementing-resource-controllers"></a>
### 补充资源控制器

如果您需要向资源控制器添加超出默认资源路由集的其他路由，则应在调用 `Route::resource` 方法之前定义这些路由；否则，由 `resource` 方法定义的路由可能会无意中优先于您的补充路由：

    use App\Http\Controller\PhotoController;

    Route::get('/photos/popular', [PhotoController::class, 'popular']);
    Route::resource('photos', PhotoController::class);

> 技巧：请记住让您的控制器保持集中。如果您发现自己经常需要典型资源操作集之外的方法，请考虑将控制器拆分为两个更小的控制器。

<a name="dependency-injection-and-controllers"></a>
## 依赖注入和控制器

<a name="constructor-injection"></a>
#### 构造函数注入

Laravel [服务容器](/docs/laravel/9.x/container) 用于解析所有 Laravel 控制器。因此，您可以在其构造函数中对控制器可能需要的任何依赖项进行类型提示。声明的依赖项将自动解析并注入到控制器实例中：

    <?php

    namespace App\Http\Controllers;

    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * 用户存储库实例。
         */
        protected $users;

        /**
         * 创建一个新的控制器实例。
         *
         * @param  \App\Repositories\UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }
    }

<a name="method-injection"></a>
#### 方法注入

除了构造函数注入之外，您还可以类型提示依赖于控制器的方法。方法注入的一个常见用例是将 `Illuminate\Http\Request` 实例注入到控制器方法中：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 存储一个新用户。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            $name = $request->name;

            //
        }
    }



如果你的控制器方法要从路由参数中获取输入内容，请在你的依赖项之后列出你的路由参数。例如，你可以像下方这样定义路由：

    use App\Http\Controllers\UserController;

    Route::put('/user/{id}', [UserController::class, 'update']);

如下所示，您依然可以类型提示 `Illuminate\Http\Request` 并通过定义您的控制器方法访问 `id` 参数：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * 修改指定的用户。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  string  $id
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, $id)
        {
            //
        }
    }

