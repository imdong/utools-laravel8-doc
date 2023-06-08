# Eloquent: API 资源

- [简介](#introduction)
- [生成资源](#generating-resources)
- [概念综述](#concept-overview)
    - [资源集合](#resource-collections)
- [编写资源](#writing-resources)
    - [数据包裹](#data-wrapping)
    - [分页](#pagination)
    - [条件属性](#conditional-attributes)
    - [条件关系](#conditional-relationships)
    - [添加元数据](#adding-meta-data)
- [资源响应](#resource-responses)

<a name="introduction"></a>
## 简介

在构建 API 时，你往往需要一个转换层来联结你的 Eloquent 模型和实际返回给用户的 JSON 响应。比如，你可能希望显示部分用户属性而不是全部，或者你可能希望在模型的 JSON 中包括某些关系。Eloquent 的资源类能够让你以更直观简便的方式将模型和模型集合转化成 JSON。

当然，你可以始终使用 Eloquent 模型或集合的 `toJson` 方法将其转换为 JSON ；但是，Eloquent 的资源提供了对模型及其关系的 JSON 序列化更加精细和更加健壮的控制。

<a name="generating-resources"></a>
## 生成资源

你可以使用 `make:resource` artisan 命令来生成一个资源类。默认情况下，资源将放在应用程序的 `app/Http/Resources` 目录下。资源继承自 `Illuminate\Http\Resources\Json\JsonResource` 类：

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### 资源集合

除了生成转换单个模型的资源之外，你还可以生成负责转换模型集合的资源。这允许你的响应 JSON 包含与给定资源的整个集合相关的其他信息。


你应该在创建资源集合时使用 `--collection` 标志来表明你要生成一个资源集合。或者，在资源名称中包含 `Collection` 一词将向 Laravel 表明它应该生成一个资源集合。资源集合继承自 `Illuminate\Http\Resources\Json\ResourceCollection` 类：

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 概念综述

> 提示：这是对资源和资源集合的高度概述。强烈建议您阅读本文档的其他部分，以深入了解如何更好地自定义和使用资源。

在深入了解如何定制化编写你的资源之前，让我们首先从高层次上了解 Laravel 中如何使用资源。一个资源类表示一个单一模型需要被转换成 JSON 格式。例如，下面是一个简单的 `UserResource` 资源类：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * 将资源转换为数组。
         * 
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }

每个资源类都定义了一个 `toArray` 方法，当资源从路由或控制器方法作为响应被调用返回时，该方法返回应该转换为 JSON 的属性数组。

注意，我们可以直接使用 `$this` 变量访问模型属性。这是因为资源类将自动代理属性和方法访问到底层模型以方便访问。一旦定义了资源，你可以从路由或控制器中调用并返回它。资源通过其构造函数接受底层模型实例：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function ($id) {
        return new UserResource(User::findOrFail($id));
    });



<a name="resource-collections"></a>
### 资源集合

如果你要返回一个资源集合或一个分页响应，你应该在路由或控制器中创建资源实例时使用你的资源类提供的 `collection` 方法

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });

当然了，使用如上方法你将不能添加任何附加的元数据和集合一起返回。如果你需要自定义资源集合响应，你需要创建一个专用的资源来表示集合：

```shell
php artisan make:resource UserCollection
```

此时，你就可以轻松地自定义响应中应该包含的任何元数据：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * 将资源集合转换为数组
		 *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }

你可以在路由或者控制器中返回已定义的资源集合：

    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });

<a name="preserving-collection-keys"></a>
#### 保护集合的键

当从路由返回一个资源集合时，Laravel 会重置集合的键，使它们按数字顺序排列。但是，您可以在资源类中添加 `preserveKeys` 属性，以指示是否应该保留集合的原始键：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * 指示是否应保留资源的集合原始键。
         *
         * @var bool
         */
        public $preserveKeys = true;
    }



如果 `preserveKeys` 属性设置为 `true` ，那么从路由或控制器返回集合时，集合的键将会被保留：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all()->keyBy->id);
    });

<a name="customizing-the-underlying-resource-class"></a>
#### 自定义基础资源类

通常，资源集合的 `$this->collection` 属性会被自动填充，结果是将集合的每个项映射到其单个资源类。单个资源类被假定为资源的类名，但没有类名末尾的 `Collection` 部分。 此外，根据您的个人偏好，单个资源类可以带着后缀 `Resource` ，也可以不带。

例如，`UserCollection` 会尝试将给定的用户实例映射到 `User` 或 `UserResource` 资源。想要自定义该行为，你可以重写资源集合中的 `$collects` 属性指定自定义的资源：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * The resource that this resource collects.
         * 自定义资源类名
         *
         * @var string
         */
        public $collects = Member::class;
    }

<a name="writing-resources"></a>
## 编写资源

> 技巧：如果您还没有阅读 [概念综述](#concept-overview)，那么在继续阅读本文档前，强烈建议您去阅读一下，会更容易理解本节的内容。

从本质上说，资源的作用很简单，它只需将一个给定的模型转换为一个数组。因此，每个资源都包含一个 `toArray` 方法，这个方法会将模型的属性转换为一个 API 友好的数组，然后将该数组通过路由或控制器返回给用户：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * Transform the resource into an array.
         * 将资源转换为数组
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }



当 `preserveKeys` 属性设置为 `true` 时，当集合从路由或控制器返回时，集合的原始键将被保留

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all()->keyBy->id);
    });

<a name="customizing-the-underlying-resource-class"></a>
#### 自定义基础资源类

通常，资源集合的 `$this->collection` 属性会自动填充该集合的每个项目到其单一资源类的映射结果。单一资源类被假定为集合的类名，不包含类名末尾的 `Collection`  部分。此外，根据你的个人偏好，单一资源类可以带有或不带有 `Resource` 后缀。

例如，`UserCollection` 将尝试将给定的用户实例映射到 `UserResource` 资源中。想要自定义这个行为，你可以重写资源集合的 `$collects` 属性：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * The resource that this resource collects.
		 * collects 属性定义了资源类
         *
         * @var string
         */
        public $collects = Member::class;
    }
<a name="relationships"></a>
#### 关联关系

如果想在响应中返回关联的资源，你可以在资源类的 `toArray` 方法中将关联关系添加上。下面的例子会展示如何将文章资源类 `PostResource` 添加到用户资源类 `UserResource` 中：

    use App\Http\Resources\PostResource;

    /**
     * Transform the resource into an array.
     * 将资源转换为数组
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => PostResource::collection($this->posts),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

> 技巧：如果你希望只在关联关系被加载时才会返回，点这里查看文档 [conditional relationships](#条件关联).

<a name="writing-resource-collections"></a>
#### 资源集合

API 资源类将单个模型转到数组，同理，资源集合是用来将模型集合转为数组的。当然，你并不是必须要为每个类都定义一个资源集合类，因为资源类提供了 `collection` 方法用来动态的生成「临时」资源集合：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });

如果你需要自定义资源集合返回的元数据，那就需要自己创建资源集合类：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         * 将资源集合转换成数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }



一旦资源被定义，它可以直接从路由或控制器返回：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function ($id) {
        return new UserResource(User::findOrFail($id));
    });

<a name="relationships"></a>
#### 关联关系

如果你想在你的响应中包含关联的资源，你可以将它们添加到你的资源的 `toArray` 方法返回的数组中。在下面的例子中，我们将使用 `PostResource` 资源的 `collection` 方法来将用户的博客文章添加到资源响应中：

    use App\Http\Resources\PostResource;

    /**
     * Transform the resource into an array.
	 * 将资源转换为数组。
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => PostResource::collection($this->posts),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

> 技巧：如果你只希望在已经加载的关联关系中包含它们，点这里查看 [条件关联](#conditional-relationships)。

<a name="writing-resource-collections"></a>
#### 资源集合

当资源将单个模型转换为数组时，资源集合将模型集合转换为数组。当然，你并不是必须要为每个类都定义一个资源集合类，因为所有的资源都提供了一个 `collection ` 方法来动态地生成一个「临时」资源集合：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });

当然，如果你需要自定义资源集合返回的元数据，那就需要自己创建资源集合类：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
		 * 将资源集合转换为数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }



和单个资源一样，你可以在路由或控制器中直接返回资源集合：

    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });

<a name="data-wrapping"></a>
### 数据包裹

默认情况下，当资源响应被转换为 JSON 时，最外层的资源被包裹在 `data` 键中。因此一个典型的资源收集响应如下所示：

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ]
}
```

如果你想使用自定义键而不是 `data`，你可以在资源类上定义一个 `$wrap` 属性：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * 应该应用的「数据」包装器。
         *
         * @var string
         */
        public static $wrap = 'user';
    }

如果你想禁用最外层资源的包裹，你应该调用基类 `Illuminate\Http\Resources\Json\JsonResource` 的 `withoutWrapping` 方法。通常，你应该从你的 `AppServiceProvider` 或其他在程序每一个请求中都会被加载的 [服务提供者](/docs/laravel/9.x/providers) 中调用这个方法：

    <?php

    namespace App\Providers;

    use Illuminate\Http\Resources\Json\JsonResource;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任何应用程序服务。
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 引导任何应用程序服务。
         *
         * @return void
         */
        public function boot()
        {
            JsonResource::withoutWrapping();
        }
    }

> 注意：`withoutWrapping` 方法只会禁用最外层资源的包裹，不会删除你手动添加到资源集合中的 `data` 键。



<a name="wrapping-nested-resources"></a>
#### 包裹嵌套资源

你可以完全自由地决定资源关联如何被包裹。如果你希望无论怎样嵌套，所有的资源集合都包裹在一个 `data` 键中，你应该为每个资源定义一个资源集合类，并将返回的集合包裹在 `data` 键中。

你可能会担心这是否会导致最外层的资源包裹在两层 `data` 键中。别担心， Laravel 永远不会让你的资源被双层包裹，所以你不必担心资源集合被多重嵌套的问题：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class CommentsCollection extends ResourceCollection
    {
        /**
         * 将资源集合转换成数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return ['data' => $this->collection];
        }
    }

<a name="data-wrapping-and-pagination"></a>
#### 数据包裹和分页

当通过资源响应返回分页集合时，即使你调用了 `withoutWrapping` 方法，Laravel 也会将你的资源数据包裹在 `data` 键中。这是因为分页响应总会有 `meta` 和 `links` 键包含关于分页状态的信息：

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ],
    "links":{
        "first": "http://example.com/pagination?page=1",
        "last": "http://example.com/pagination?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/pagination",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### 分页

你可以将 Laravel 分页实例传递给资源的 `collection` 方法或自定义资源集合：

    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::paginate());
    });



分页响应中总有 `meta` 和 `links` 键包含着分页状态信息：

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ],
    "links":{
        "first": "http://example.com/pagination?page=1",
        "last": "http://example.com/pagination?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/pagination",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="conditional-attributes"></a>
### 条件属性

有些时候，你可能希望在给定条件满足时添加属性到资源响应里。例如，你可能希望如果当前用户是「管理员」时添加某个值到资源响应中。在这种情况下 Laravel 提供了一些辅助方法来帮助你解决问题。`when`方法可以被用来有条件地向资源响应添加属性：

    use Illuminate\Support\Facades\Auth;

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'secret' => $this->when(Auth::user()->isAdmin(), 'secret-value'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

在上面这个例子中，只有当`isAdmin`方法返回 `true` 时，`secret` 键才会最终在资源响应中被返回。如果该方法返回 `false`键将会在资源响应被发送给客户端之前被删除。 `when`方法可以使你避免使用条件语句拼接数组，转而用更优雅的方式来编写你的资源。

`when` 方法也接受闭包作为其第二个参数，只有在给定条件为`true` 时，才从闭包中计算返回的值：

    'secret' => $this->when(Auth::user()->isAdmin(), function () {
        return 'secret-value';
    }),



<a name="merging-conditional-attributes"></a>
#### 有条件地合并数据

有些时候，你可能希望在给定条件满足时添加多个属性到资源响应里。在这种情况下，你可以使用`mergeWhen`方法在给定的条件为`true`时将多个属性添加到响应中：

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            $this->mergeWhen(Auth::user()->isAdmin(), [
                'first-secret' => 'value',
                'second-secret' => 'value',
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

同理，如果给定的条件为`false`时，则这些属性将会在资源响应被发送给客户端之前被移除。

> 注意：`mergeWhen` 方法不应该被使用在混合字符串和数字键的数组中。此外，它也不应该被使用在不按顺序排列的数字键的数组中。

<a name="conditional-relationships"></a>
### 条件关联

除了有条件地加载属性之外，你还可以根据模型关联是否已加载来有条件地在你的资源响应中包含关联。这允许你在控制器中决定加载哪些模型关联，这样你的资源可以在模型关联被加载后才添加它们。最终，这样做可以使你的资源轻松避免「N+1」查询问题。

可以使用`whenLoaded`方法来有条件的加载关联。为了避免加载不必要的关联，此方法接受关联的名称而不是关联本身作为其参数：

    use App\Http\Resources\PostResource;

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => PostResource::collection($this->whenLoaded('posts')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }



在上面这个例子中，如果关联没有被加载，则`posts`键将会在资源响应被发送给客户端之前被删除。

<a name="conditional-pivot-information"></a>
#### 条件中间表信息

除了在你的资源响应中有条件地包含关联外，你还可以使用 `whenPivotLoaded` 方法有条件地从多对多关联的中间表中添加数据。`whenPivotLoaded` 方法接受的第一个参数为中间表的名称。第二个参数是一个闭包，它定义了在模型上如果中间表信息可用时要返回的值：

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expires_at' => $this->whenPivotLoaded('role_user', function () {
                return $this->pivot->expires_at;
            }),
        ];
    }

如果你的关联使用的是 [自定义中间表](/docs/laravel/9.x/eloquent-relationships#defining-custom-intermediate-table-models)，你可以将中间表模型的实例作为 `whenPivotLoaded` 方法的第一个参数:

    'expires_at' => $this->whenPivotLoaded(new Membership, function () {
        return $this->pivot->expires_at;
    }),

如果你的中间表使用的是 `pivot` 以外的访问器，你可以使用 `whenPivotLoadedAs`  方法：

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
                return $this->subscription->expires_at;
            }),
        ];
    }

<a name="adding-meta-data"></a>
### 添加元数据

一些 JSON API 标准需要你在资源和资源集合响应中添加元数据。这通常包括资源或相关资源的 `links` ，或一些关于资源本身的元数据。如果你需要返回有关资源的其他元数据，只需要将它们包含在 `toArray` 方法中即可。例如在转换资源集合时你可能需要添加 `link` 信息：

    /**
     * 将资源转换成数组
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }



当添加额外的元数据到你的资源中时，你不必担心会覆盖 Laravel 在返回分页响应时自动添加的 `links` 或 `meta` 键。你添加的任何其他 `links` 会与分页响应添加的 `links` 相合并。

<a name="top-level-meta-data"></a>
#### 顶层元数据

有时候，你可能希望当资源被作为顶层资源返回时添加某些元数据到资源响应中。这通常包括整个响应的元信息。你可以在资源类中添加 `with` 方法来定义元数据。此方法应返回一个元数据数组，当资源被作为顶层资源渲染时，这个数组将会被包含在资源响应中：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * 将资源集合转换成数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return parent::toArray($request);
        }

        /**
         * 返回应该和资源一起返回的其他数据数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function with($request)
        {
            return [
                'meta' => [
                    'key' => 'value',
                ],
            ];
        }
    }

<a name="adding-meta-data-when-constructing-resources"></a>
#### 构造资源时添加元数据

你还可以在路由或者控制器中构造资源实例时添加顶层数据。所有资源都可以使用 `additional` 方法来接受应该被添加到资源响应中的数据数组：

    return (new UserCollection(User::all()->load('roles')))
                    ->additional(['meta' => [
                        'key' => 'value',
                    ]]);

<a name="resource-responses"></a>


## 响应资源

就像你知道的那样，资源可以直接在路由和控制器中被返回：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function ($id) {
        return new UserResource(User::findOrFail($id));
    });

但有些时候，在发送给客户端前你可能需要自定义 HTTP 响应。你有两种办法。第一，你可以链式调用 `response` 方法。此方法将会返回  `Illuminate\Http\JsonResponse`  实例，允许你自定义响应头信息：

    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user', function () {
        return (new UserResource(User::find(1)))
                    ->response()
                    ->header('X-Value', 'True');
    });

另外，你还可以在资源中定义一个 `withResponse` 方法。此方法将会在资源被作为顶层资源在响应时被调用：

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * 将资源转换为数组。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
            ];
        }

        /**
         * 自定义响应信息。
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \Illuminate\Http\Response  $response
         * @return void
         */
        public function withResponse($request, $response)
        {
            $response->header('X-Value', 'True');
        }
    }

