# Eloquent: 关联

- [简介](#introduction)
- [定义关联](#defining-relationships)
    - [一对一](#one-to-one)
    - [一对多](#one-to-many)
    - [一对多(反向)/属于](#one-to-many-inverse)
    - [一对多检索](#has-one-of-many)
    - [远程一对一](#has-one-through)
    - [远程一对多](#has-many-through)
- [多对多关联](#many-to-many)
    - [获取中间表字段](#retrieving-intermediate-table-columns)
    - [通过中间表字段过滤查询](#filtering-queries-via-intermediate-table-columns)
    - [通过中间表字段排序查询](#ordering-queries-via-intermediate-table-columns)
    - [自定义中间表模型](#defining-custom-intermediate-table-models)
- [多态关联](#polymorphic-relationships)
    - [一对一](#one-to-one-polymorphic-relations)
    - [一对多](#one-to-many-polymorphic-relations)
    - [一对多检索](#one-of-many-polymorphic-relations)
    - [多对多](#many-to-many-polymorphic-relations)
    - [自定义多态模型](#custom-polymorphic-types)
- [动态关联](#dynamic-relationships)
- [查询关联](#querying-relations)
    - [关联方法与动态属性](#relationship-methods-vs-dynamic-properties)
    - [基于存在的关联查询](#querying-relationship-existence)
    - [基于不存在的关联查询](#querying-relationship-absence)
    - [基于多态的关联查询](#querying-morph-to-relationships)
- [统计关联模型](#aggregating-related-models)
    - [关联模型计数](#counting-related-models)
    - [其他统计函数](#other-aggregate-functions)
    - [多态关联数据计数](#counting-related-models-on-morph-to-relationships)
- [预加载](#eager-loading)
    - [约束预加载](#constraining-eager-loads)
    - [延迟预加载](#lazy-eager-loading)
    - [阻止延迟加载](#preventing-lazy-loading)
- [插入及更新关联模型](#inserting-and-updating-related-models)
    - [ save 方法](#the-save-method)
    - [ create 方法](#the-create-method)
    - [属于关联](#updating-belongs-to-relationships)
    - [多对多关联](#updating-many-to-many-relationships)
- [更新父级时间戳](#touching-parent-timestamps)

<a name="introduction"></a>
## 简介

数据库表通常相互关联。例如，一篇博客文章可能有许多评论，或者一个订单对应一个下单用户。`Eloquent` 让这些关联的管理和使用变得简单，并支持多种常用的关联类型：

<div class="content-list" markdown="1">

- [一对一](#one-to-one)
- [一对多](#one-to-many)
- [多对多](#many-to-many)
- [远程一对一](#has-one-through)
- [远程一对多](#has-many-through)
- [多态一对一](#one-to-one-polymorphic-relations)
- [多态一对多](#one-to-many-polymorphic-relations)
- [多态多对多](#many-to-many-polymorphic-relations)

</div>



<a name="defining-relationships"></a>
## 定义关联

Eloquent 关联在 Eloquent 模型类中以方法的形式呈现。如同 Eloquent 模型本身，关联也可以作为强大的[查询语句构造器](/docs/laravel/10.x/queries)，使用，提供了强大的链式调用和查询功能。例如，我们可以在 `posts` 关联的链式调用中附加一个约束条件：

    $user->posts()->where('active', 1)->get();

不过在深入使用关联之前，让我们先学习如何定义每种关联类型。

<a name="one-to-one"></a>
### 一对一

一对一是最基本的数据库关系。 例如，一个 `User` 模型可能与一个 `Phone` 模型相关联。为了定义这个关联关系，我们要在 `User` 模型中写一个 `phone` 方法。 在 `phone` 方法中调用 `hasOne` 方法并返回其结果。  `hasOne` 方法被定义在 `Illuminate\Database\Eloquent\Model` 这个模型基类中：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOne;

    class User extends Model
    {
        /**
         * 获取与用户相关的电话记录
         */
        public function phone(): HasOne
        {
            return $this->hasOne(Phone::class);
        }
    }

`hasOne` 方法的第一个参数是关联模型的类名。一旦定义了模型关联，我们就可以使用 Eloquent 的动态属性获得相关的记录。动态属性允许你访问该关联方法，就像访问模型中定义的属性一样：

    $phone = User::find(1)->phone;

Eloquent 基于父模型 `User` 的名称来确定关联模型 `Phone` 的外键名称。在本例中，会自动假定 `Phone` 模型有一个 `user_id` 的外键。如果你想重写这个约定，可以传递第二个参数给 `hasOne` 方法：

    return $this->hasOne(Phone::class, 'foreign_key');



另外，Eloquent 假设外键的值是与父模型的主键（Primary Key）相同的。换句话说，Eloquent 将会通过 `Phone` 记录的 `user_id` 列中查找与用户表的 `id` 列相匹配的值。如果你希望使用自定义的主键值，而不是使用 `id` 或者模型中的 `$primaryKey` 属性，你可以给 `hasOne` 方法传递第三个参数：

    return $this->hasOne(Phone::class, 'foreign_key', 'local_key');

<a name="定义反向关联"></a>
#### 定义反向关联

我们已经能从 `User` 模型访问到 `Phone` 模型了。接下来，让我们再在 `Phone` 模型上定义一个关联，它能让我们访问到拥有该电话的用户。我们可以使用 `belongsTo` 方法来定义反向关联， `belongsTo` 方法与 `hasOne` 方法相对应：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Phone extends Model
    {
        /**
         * 获取拥有此电话的用户
         */
        public function user(): BelongsTo
        {
            return $this->belongsTo(User::class);
        }
    }

在调用 `user` 方法时，Eloquent 会尝试查找一个 `User` 模型，该 `User` 模型上的 `id` 字段会与 `Phone` 模型上的 `user_id` 字段相匹配。

Eloquent 通过关联方法（`user`）的名称并使用 `_id` 作为后缀名来确定外键名称。因此，在本例中，Eloquent 会假设 `Phone` 模型有一个 `user_id` 字段。但是，如果 `Phone` 模型的外键不是 `user_id`，这时你可以给 `belongsTo` 方法的第二个参数传递一个自定义键名：

    /**
     * 获取拥有此电话的用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key');
    }



如果父模型的主键未使用 `id` 作为字段名，或者你想要使用其他的字段来匹配相关联的模型，那么你可以向 `belongsTo` 方法传递第三个参数，这个参数是在父模型中自己定义的字段名称：

    /**
     * 获取当前手机号的用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
    }

<a name="one-to-many"></a>
### 一对多

当要定义一个模型是其他 （一个或者多个）模型的父模型这种关系时，可以使用一对多关联。例如，一篇博客可以有很多条评论。和其他模型关联一样，一对多关联也是在 Eloquent 模型文件中用一个方法来定义的：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasMany;

    class Post extends Model
    {
        /**
         * 获取这篇博客的所有评论
         */
        public function comments(): HasMany
        {
            return $this->hasMany(Comment::class);
        }
    }

注意，Eloquent 将会自动为 `Comment` 模型选择一个合适的外键。通常，这个外键是通过使用父模型的「蛇形命名」方式，然后再加上 `_id`. 的方式来命名的。因此，在上面这个例子中，Eloquent 将会默认 `Comment` 模型的外键是 `post_id` 字段。

如果关联方法被定义，那么我们就可以通过 `comments` 属性来访问相关的评论 [集合](/docs/laravel/10.x/eloquent-collections)。注意，由于 Eloquent 提供了「动态属性」，所以我们就可以像访问模型属性一样来访问关联方法：

    use App\Models\Post;

    $comments = Post::find(1)->comments;

    foreach ($comments as $comment) {
        // ...
    }



由于所有的关系都可以看成是查询构造器，所以你也可以通过链式调用的方式，在 `comments` 方法中继续添加条件约束：

    $comment = Post::find(1)->comments()
                        ->where('title', 'foo')
                        ->first();

像 `hasOne` 方法一样，你也可以通过将附加参数传递给 `hasMany` 方法来覆盖外键和本地键：

    return $this->hasMany(Comment::class, 'foreign_key');

    return $this->hasMany(Comment::class, 'foreign_key', 'local_key');

<a name="one-to-many-inverse"></a>
### 一对多 (反向) / 属于

目前我们可以访问一篇文章的所有评论，下面我们可以定义一个关联关系，从而让我们可以通过一条评论来获取到它所属的文章。这个关联关系是 `hasMany` 的反向，可以在子模型中通过 `belongsTo` 方法来定义这种关联关系：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Comment extends Model
    {
        /**
         * 获取这条评论所属的文章。
         */
        public function post(): BelongsTo
        {
            return $this->belongsTo(Post::class);
        }
    }

如果定义了这种关联关系，那么我们就可以通过 `Comment` 模型中的 `post` 「动态属性」来获取到这条评论所属的文章：

    use App\Models\Comment;

    $comment = Comment::find(1);

    return $comment->post->title;

在上面这个例子中，Eloquent 将会尝试寻找 `Post` 模型中的 `id` 字段与 `Comment` 模型中的 `post_id` 字段相匹配。

Eloquent 通过检查关联方法的名称，从而在关联方法名称后面加上 `_` ，然后再加上父模型 （Post）的主键名称，以此来作为默认的外键名。因此，在上面这个例子中，Eloquent 将会默认 `Post` 模型在 `comments` 表中的外键是 `post_id`。


但是，如果你的外键不遵循这种约定的话，那么你可以传递一个自定义的外键名来作为 `belongsTo` 方法的第二个参数：

    /**
     * 获取这条评论所属的文章。
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key');
    }

如果你的父表不使用 `id` 作为主键，或者你希望使用不同的列来关联模型，你可以将第三个参数传递给 `belongsTo` 方法，指定父表的自定义键：

    /**
     * 获取这条评论所属的文章。
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
    }

<a name="default-models"></a>
#### 默认模型

当 `belongsTo`，`hasOne`，`hasOneThrough` 和 `morphOne` 这些关联方法返回 `null` 的时候，你可以定义一个默认的模型返回。该模式通常被称为 [空对象模式](https://en.wikipedia.org/wiki/Null_Object_pattern)，它可以帮你省略代码中的一些条件判断。在下面这个例子中，如果 `Post` 模型中没有用户，那么 `user` 关联关系将会返回一个空的 `App\Models\User` 模型：

    /**
     * 获取文章的作者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }

可以向 `withDefault` 方法传递数组或者闭包来填充默认模型的属性。

    /**
     * 获取文章的作者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'Guest Author',
        ]);
    }

    /**
     * 获取文章的作者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
            $user->name = 'Guest Author';
        });
    }



<a name="querying-belongs-to-relationships"></a>
#### 查询所属关系

在查询「所属」的子模型时，可以构建 `where` 语句来检索相应的 Eloquent 模型：

    use App\Models\Post;

    $posts = Post::where('user_id', $user->id)->get();

但是，你会发现使用 `whereBelongsTo` 方法更方便，它会自动确定给定模型的正确关系和外键：

    $posts = Post::whereBelongsTo($user)->get();

你还可以向 `whereBelongsTo` 方法提供一个 [集合](/docs/laravel/10.x/eloquent-collections) 实例。 这样 Laravel 将检索属于集合中任何父模型的子模型：

    $users = User::where('vip', true)->get();

    $posts = Post::whereBelongsTo($users)->get();

默认情况下，Laravel 将根据模型的类名来确定给定模型的关联关系； 你也可以通过将关系名称作为 `whereBelongsTo` 方法的第二个参数来手动指定关系名称：

    $posts = Post::whereBelongsTo($user, 'author')->get();

<a name="has-one-of-many"></a>
### 一对多检索

有时一个模型可能有许多相关模型，如果你想很轻松的检索「最新」或「最旧」的相关模型。例如，一个 `User` 模型可能与许多 `Order` 模型相关，但你想定义一种方便的方式来与用户最近下的订单进行交互。 可以使用 `hasOne` 关系类型结合 `ofMany` 方法来完成此操作：

```php
/**
 * 获取用户最新的订单。
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```



同样，你可以定义一个方法来检索 「oldest」或第一个相关模型：

```php
/**
 * 获取用户最早的订单。
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

默认情况下，`latestOfMany` 和 `oldestOfMany` 方法将根据模型的主键检索最新或最旧的相关模型，该主键必须是可排序的。 但是，有时你可能希望使用不同的排序条件从更大的关系中检索单个模型。

例如，使用 `ofMany` 方法，可以检索用户最昂贵的订单。 `ofMany` 方法接受可排序列作为其第一个参数，以及在查询相关模型时应用哪个聚合函数（`min` 或 `max`）：

```php
/**
 * 获取用户最昂贵的订单。
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> **注意**
> 因为 PostgreSQL 不支持对 UUID 列执行 `MAX` 函数，所以目前无法将一对多关系与 PostgreSQL UUID 列结合使用。

<a name="advanced-has-one-of-many-relationships"></a>
#### 进阶一对多检索

可以构建更高级的「一对多检索」关系。例如，一个 `Product` 模型可能有许多关联的 `Price` 模型，即使在新定价发布后，这些模型也会保留在系统中。此外，产品的新定价数据能够通过 `published_at` 列提前发布，以便在未来某日生效。

因此，我们需要检索最新的发布定价。 此外，如果两个价格的发布日期相同，我们优先选择 ID 更大的价格。 为此，我们必须将一个数组传递给 `ofMany` 方法，其中包含确定最新价格的可排序列。此外，将提供一个闭包作为 `ofMany` 方法的第二个参数。此闭包将负责向关系查询添加额外的发布日期约束：

```php
/**
 * 获取产品的当前定价。
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```



<a name="has-one-through"></a>
### 远程一对一

「远程一对一」关联定义了与另一个模型的一对一的关联。然而，这种关联是声明的模型通过第三个模型来与另一个模型的一个实例相匹配。

例如，在一个汽车维修的应用程序中，每一个 `Mechanic` 模型都与一个 `Car` 模型相关联，同时每一个 `Car` 模型也和一个 `Owner` 模型相关联。虽然维修师（mechanic）和车主（owner）在数据库中并没有直接的关联，但是维修师可以通过 `Car` 模型来找到车主。让我们来看看定义这种关联所需要的数据表：

    mechanics
        id - integer
        name - string

    cars
        id - integer
        model - string
        mechanic_id - integer

    owners
        id - integer
        name - string
        car_id - integer

既然我们已经了解了远程一对一的表结构，那么我们就可以在 `Mechanic` 模型中定义这种关联：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOneThrough;

    class Mechanic extends Model
    {
        /**
         * 获取汽车的主人。
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(Owner::class, Car::class);
        }
    }

传递给 `hasOneThrough` 方法的第一个参数是我们希望访问的最终模型的名称，而第二个参数是中间模型的名称。

或者，如果相关的关联已经在关联中涉及的所有模型上被定义，你可以通过调用 `through` 方法和提供这些关联的名称来流式定义一个「远程一对一」关联。例如，`Mechanic` 模型有一个 `cars` 关联，`Car` 模型有一个 `owner` 关联，你可以这样定义一个连接维修师和车主的「远程一对一」关联：

```php
// 基于字符串的语法...
return $this->through('cars')->has('owner');

// 动态语法...
return $this->throughCars()->hasOwner();
```



<a name="has-one-through-key-conventions"></a>
#### 键名约定

当使用远程一对一进行关联查询时，Eloquent 将会使用约定的外键名。如果你想要自定义相关联的键名的话，可以传递两个参数来作为「hasOneThrough」 方法的第三个和第四个参数。第三个参数是中间表的外键名。第四个参数是最终想要访问的模型的外键名。第五个参数是当前模型的本地键名，第六个参数是中间模型的本地键名：

    class Mechanic extends Model
    {
        /**
         * Get the car's owner.
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(
                Owner::class,
                Car::class,
                'mechanic_id', // 机械师表的外键...
                'car_id', // 车主表的外键...
                'id', // 机械师表的本地键...
                'id' // 汽车表的本地键...
            );
        }
    }

如果所涉及的模型已经定义了相关关系，可以调用 `through` 方法并提供关系名来定义「远程一对一」关联。该方法的优点是重复使用已有关系上定义的主键约定：
```php
// 基本语法...
return $this->through('cars')->has('owner');

// 动态语法...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### 远程一对多

「远程一对多」关联是可以通过中间关系来实现远程一对多的。例如，我们正在构建一个像 [Laravel Vapor](https://vapor.laravel.com)这样的部署平台。一个 `Project` 模型可以通过一个中间的 `Environment` 模型来访问许多个 `Deployment` 模型。就像上面的这个例子，可以在给定的 environment 中很方便的获取所有的 deployments。下面是定义这种关联关系所需要的数据表：

    projects
        id - integer
        name - string

    environments
        id - integer
        project_id - integer
        name - string

    deployments
        id - integer
        environment_id - integer
        commit_hash - string



既然我们已经检查了关系的表结构，现在让我们在 `Project` 模型上定义该关系：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasManyThrough;

    class Project extends Model
    {
        /**
         * 获取该项目的所有部署。
         */
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(Deployment::class, Environment::class);
        }
    }

`hasManyThrough` 方法中传递的第一个参数是我们希望访问的最终模型名称，而第二个参数是中间模型的名称。

或者，所有模型上都定义好了关系，你可以通过调用 `through` 方法并提供这些关系的名称来定义「has-many-through」关系。例如，如果  `Project` 模型具有 `environments` 关系，而 `Environment` 模型具有 `deployments` 关系，则可以定义连接 project 和 deployments 的「has-many-through」关系，如下所示：

```php
// 基于字符串的语法。。。
return $this->through('environments')->has('deployments');

// 动态语法。。。
return $this->throughEnvironments()->hasDeployments();
```
虽然 `Deployment` 模型的表格不包含 `project_id` 列，但 `hasManyThrough` 关系通过 `$project->deployments` 提供了访问项目的部署方式。为了检索这些模型，Eloquent 在中间的 `Environment` 模型表中检查 `project_id` 列。在找到相关的 environment ID 后，它们被用来查询 `Deployment` 模型。

<a name="has-many-through-key-conventions"></a>
#### 键名约定

在执行关系查询时，通常会使用典型的 Eloquent 外键约定。如果你想要自定义关系键名，可以将它们作为 `hasManyThrough` 方法的第三个和第四个参数传递。第三个参数是中间模型上的外键名称。第四个参数是最终模型上的外键名称。第五个参数是本地键，而第六个参数是中间模型的本地键：

    class Project extends Model
    {
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(
                Deployment::class,
                Environment::class,
                'project_id', // 在 environments 表上的外键...
                'environment_id', // 在 deployments 表上的外键...
                'id', // 在 projects 表上的本地键...
                'id' // 在 environments 表格上的本地键...
            );
        }
    }



或者，如前所述，如果涉及关系的相关关系已经在所有模型上定义，你可以通过调用 `through` 方法并提供这些关系的名称来定义「has-many-through」关系。这种方法的优点是可以重复使用已经定义在现有关系上的键约定：

```php
// 基于字符串的语法。。。
return $this->through('environments')->has('deployments');

// 动态语法。。。
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## 多对多关联

多对多关联比 `hasOne` 和 `hasMany` 关联略微复杂。举个例子，一个用户可以拥有多个角色，同时这些角色也可以分配给其他用户。例如，一个用户可是「作者」和「编辑」；当然，这些角色也可以分配给其他用户。所以，一个用户可以拥有多个角色，一个角色可以分配给多个用户。

<a name="many-to-many-table-structure"></a>
#### 表结构

要定义这种关联，需要三个数据库表: `users`, `roles` 和 `role_user`。`role_user` 表的命名是由关联的两个模型按照字母顺序来的，并且包含了 `user_id` 和 `role_id` 字段。该表用作链接 `users` 和 `roles` 的中间表

特别提醒，由于角色可以属于多个用户，因此我们不能简单地在 `roles` 表上放置 `user_id` 列。如果这样，这意味着角色只能属于一个用户。为了支持将角色分配给多个用户，需要使用 `role_user` 表。我们可以这样定义表结构：

    users
        id - integer
        name - string

    roles
        id - integer
        name - string

    role_user
        user_id - integer
        role_id - integer



<a name="many-to-many-model-structure"></a>
#### 模型结构

多对多关联是通过调用 `belongsToMany` 方法结果的方法来定义的。 `belongsToMany` 方法由 `Illuminate\Database\Eloquent\Model` 基类提供，所有应用程序的 Eloquent 模型都使用该基类。 例如，让我们在 `User` 模型上定义一个 `roles` 方法。 传递给此方法的第一个参数是相关模型类的名称：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class User extends Model
    {
        /**
         * 用户所拥有的角色
         */
        public function roles(): BelongsToMany
        {
            return $this->belongsToMany(Role::class);
        }
    }

定义关系后，可以使用 `roles` 动态关系属性访问用户的角色：

    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        // ...
    }

由于所有的关系也可以作为查询构建器，你可以通过调用 `roles()` 方法查询来为关系添加约束：

    $roles = User::find(1)->roles()->orderBy('name')->get();

为了确定关系的中间表的表名，Eloquent 会按字母顺序连接两个相关的模型名。 你也可以随意覆盖此约定。 通过将第二个参数传递给 `belongsToMany` 方法来做到这一点：

    return $this->belongsToMany(Role::class, 'role_user');

除了自定义连接表的表名，你还可以通过传递额外的参数到 `belongsToMany` 方法来定义该表中字段的键名。第三个参数是定义此关联的模型在连接表里的外键名，第四个参数是另一个模型在连接表里的外键名:

    return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');



<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### 定义反向关联

要定义多对多的反向关联，只需要在关联模型中调用 `belongsToMany` 方法。我们在 `Role` 模型中定义 `users` 方法:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * 拥有此角色的用户
         */
        public function users(): BelongsToMany
        {
            return $this->belongsToMany(User::class);
        }
    }

如你所见，除了引用 `App\Models\User` 模型之外，该关系的定义与其对应的 `User` 模型完全相同。 由于我们复用了 `belongsToMany` 方法，所以在定义多对多关系的「反向」关系时，所有常用的表和键自定义选项都可用。

<a name="retrieving-intermediate-table-columns"></a>
### 获取中间表字段

如上所述，处理多对多关系需要一个中间表。 Eloquent 提供了一些非常有用的方式来与它进行交互。 假设我们的 `User` 对象关联了多个 `Role` 对象。在获得这些关联对象后，可以使用模型的 `pivot` 属性访问中间表的属性：

    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        echo $role->pivot->created_at;
    }

需要注意的是，我们获取的每个 `Role` 模型对象，都会被自动赋予 `pivot` 属性，它代表中间表的一个模型对象，并且可以像其他的 Eloquent 模型一样使用。

默认情况下，`pivot` 对象只包含两个关联模型的主键，如果你的中间表里还有其他额外字段，你必须在定义关联时明确指出：

    return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');



如果你想让中间表自动维护 `created_at` 和 `updated_at` 时间戳，那么在定义关联时附加上 `withTimestamps` 方法即可：

    return $this->belongsToMany(Role::class)->withTimestamps();

> **注意**
> 使用 Eloquent 自动维护时间戳的中间表需要同时具有 `created_at` 和 `updated_at`时间戳字段。

<a name="customizing-the-pivot-attribute-name"></a>
#### 自定义 pivot 属性名称

如前所述，可以通过 `pivot` 属性在模型上访问中间表中的属性。 但是，你可以随意自定义此属性的名称，以更好地反映其在应用程序中的用途。

例如，如果你的应用程序包含可能订阅播客的用户，则用户和播客之间可能存在多对多关系。 如果是这种情况，你可能希望将中间表属性重命名为 `subscription` 而不是 `pivot`。 这可以在定义关系时使用 `as` 方法来完成：

    return $this->belongsToMany(Podcast::class)
                    ->as('subscription')
                    ->withTimestamps();

一旦定义完成，你可以使用自定义名称访问中间表数据：

    $users = User::with('podcasts')->get();

    foreach ($users->flatMap->podcasts as $podcast) {
        echo $podcast->subscription->created_at;
    }

<a name="filtering-queries-via-intermediate-table-columns"></a>
### 通过中间表过滤查询

你还可以在定义关系时使用 `wherePivot`、`wherePivotIn`、`wherePivotNotIn`、`wherePivotBetween`、`wherePivotNotBetween`、`wherePivotNull` 和 `wherePivotNotNull` 方法过滤 `belongsToMany` 关系查询返回的结果：

    return $this->belongsToMany(Role::class)
                    ->wherePivot('approved', 1);

    return $this->belongsToMany(Role::class)
                    ->wherePivotIn('priority', [1, 2]);

    return $this->belongsToMany(Role::class)
                    ->wherePivotNotIn('priority', [1, 2]);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNull('expired_at');

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNotNull('expired_at');



<a name="ordering-queries-via-intermediate-table-columns"></a>
### 通过中间表字段排序

你可以使用 `orderByPivot` 方法对 `belongsToMany` 关系查询返回的结果进行排序。在下面的例子中，我们将检索用户的最新徽章：

    return $this->belongsToMany(Badge::class)
                    ->where('rank', 'gold')
                    ->orderByPivot('created_at', 'desc');

<a name="defining-custom-intermediate-table-models"></a>
### 自定义中间表模型

如果你想定义一个自定义模型来表示多对多关系的中间表，你可以在定义关系时调用 `using` 方法。

自定义多对多中间表模型都必须继承 `Illuminate\Database\Eloquent\Relations\Pivot` 类，自定义多对多（多态）中间表模型必须继承 `Illuminate\Database\Eloquent\Relations\MorphPivot` 类。例如，我们在写 `Role` 模型的关联时，使用自定义中间表模型 `RoleUser`：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * 属于该角色的用户。
         */
        public function users(): BelongsToMany
        {
            return $this->belongsToMany(User::class)->using(RoleUser::class);
        }
    }

当定义 `RoleUser` 模型时，我们要继承 `Illuminate\Database\Eloquent\Relations\Pivot` 类：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Relations\Pivot;

    class RoleUser extends Pivot
    {
        // ...
    }

> **注意**
> Pivot 模型不可以使用 `SoftDeletes` trait。 如果需要软删除数据关联记录，请考虑将数据关联模型转换为实际的 Eloquent 模型。


<a name="custom-pivot-models-and-incrementing-ids"></a>


#### 自定义中间模型和自增 ID

如果你用一个自定义的中继模型定义了多对多的关系，而且这个中继模型拥有一个自增的主键，你应当确保这个自定义中继模型类中定义了一个 `incrementing` 属性且其值为 `true`。

    /**
     * 标识 ID 是否自增
     *
     * @var bool
     */
    public $incrementing = true;

<a name="polymorphic-relationships"></a>
## 多态关系

多态关联允许子模型使用单个关联属于多种类型的模型。例如，假设你正在构建一个应用程序，允许用户共享博客文章和视频。在这样的应用程序中，`Comment` 模型可能同时属于 `Post` 和 `Video` 模型。

<a name="one-to-one-polymorphic-relations"></a>
### 一对一 (多态)

<a name="one-to-one-polymorphic-table-structure"></a>
#### 表结构

一对一多态关联类似于典型的一对一关系，但是子模型可以使用单个关联属于多个类型的模型。例如，一个博客 `Post` 和一个 `User` 可以共享到一个 `Image` 模型的多态关联。使用一对一多态关联允许你拥有一个唯一图像的单个表，这些图像可以与帖子和用户关联。首先，让我们查看表结构：

    posts
        id - integer
        name - string

    users
        id - integer
        name - string

    images
        id - integer
        url - string
        imageable_id - integer
        imageable_type - string

请注意 `images` 表上的 `imageable_id` 和 `imageable_type` 两列。`imageable_id` 列将包含帖子或用户的ID值，而 `imageable_type` 列将包含父模型的类名。`imageable_type` 列用于 Eloquent 在访问 `imageable` 关联时确定要返回哪种类型的父模型。在本例中，该列将包含 `App\Models\Post` 或 `App\Models\User`。



<a name="one-to-one-polymorphic-model-structure"></a>
#### 模型结构

接下来，让我们来看一下构建这个关系所需的模型定义：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class Image extends Model
    {
        /**
         * 获取父级 imageable 模型（用户或帖子）。
         */
        public function imageable(): MorphTo
        {
            return $this->morphTo();
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphOne;

    class Post extends Model
    {
        /**
         * 获取文章图片
         */
        public function image(): MorphOne
        {
            return $this->morphOne(Image::class, 'imageable');
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphOne;

    class User extends Model
    {
        /**
         * 获取用户的图片。
         */
        public function image(): MorphOne
        {
            return $this->morphOne(Image::class, 'imageable');
        }
    }

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### 检索关联关系

一旦定义了表和模型，就可以通过模型访问此关联。比如，要获取文章图片，可以使用 `image` 动态属性：

    use App\Models\Post;

    $post = Post::find(1);

    $image = $post->image;

还可以通过访问执行 `morphTo` 调用的方法名来从多态模型中获知父模型。在这个例子中，就是 `Image` 模型的 `imageable` 方法。所以，我们可以像动态属性那样访问这个方法：

    use App\Models\Image;

    $image = Image::find(1);

    $imageable = $image->imageable;

`Image` 模型上的 `imageable` 关系将返回 `Post` 实例或 `User` 实例，具体取决于模型拥有图像的类型。

<a name="morph-one-to-one-key-conventions"></a>
#### 键名约定

如有需要，你可以指定多态子模型中使用的 `id` 和 `type` 列的名称。 如果这样做，请确保始终将关联名称作为第一个参数传递给 `morphTo` 方法。 通常，此值应与方法名称匹配，因此你可以使用 PHP 的 `__FUNCTION__` 常量：

    /**
     * 获取 image 实例所属的模型
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
    }



<a name="one-to-many-polymorphic-relations"></a>
### 一对多（多态）

<a name="one-to-many-polymorphic-table-structure"></a>
#### 表结构

一对多多态关联与简单的一对多关联类似，不过，目标模型可以在一个关联中从属于多个模型。假设应用中的用户可以同时「评论」文章和视频。使用多态关联，可以用单个 `comments` 表同时满足这些情况。我们还是先来看看用来构建这种关联的表结构：

    posts
        id - integer
        title - string
        body - text

    videos
        id - integer
        title - string
        url - string

    comments
        id - integer
        body - text
        commentable_id - integer
        commentable_type - string

<a name="one-to-many-polymorphic-model-structure"></a>
#### 模型结构

接下来，看看构建这种关联的模型定义：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class Comment extends Model
    {
        /**
         * 获取拥有此评论的模型（Post 或 Video）。
         */
        public function commentable(): MorphTo
        {
            return $this->morphTo();
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphMany;

    class Post extends Model
    {
        /**
         * 获取此文章的所有评论
         */
        public function comments(): MorphMany
        {
            return $this->morphMany(Comment::class, 'commentable');
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphMany;

    class Video extends Model
    {
        /**
         * 获取此视频的所有评论
         */
        public function comments(): MorphMany
        {
            return $this->morphMany(Comment::class, 'commentable');
        }
    }

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### 获取关联

一旦定义了数据库表和模型，就可以通过模型访问关联。例如，可以使用 `comments` 动态属性访问文章的全部评论：

    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->comments as $comment) {
        // ...
    }



你还可以通过访问执行对 `morphTo` 的调用的方法名来从多态模型获取其所属模型。在我们的例子中，这就是 `Comment` 模型上的 `commentable` 方法。因此，我们将以动态属性的形式访问该方法：

    use App\Models\Comment;

    $comment = Comment::find(1);

    $commentable = $comment->commentable;

`Comment` 模型的 `commentable` 关联将返回 `Post` 或 `Video` 实例，其结果取决于评论所属的模型。

<a name="one-of-many-polymorphic-relations"></a>
### 一对多检索（多态）

有时一个模型可能有许多相关模型，要检索关系的「最新」或「最旧」相关模型。 例如，一个 `User` 模型可能与许多 `Image` 模型相关，如果你想自定义一种方便的方式来与用户上传的最新图像进行交互。 可以使用 `morphOne` 关系类型结合 `ofMany` 方法来完成此操作：

```php
/**
 * 获取用户最近上传的图像。
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

同样，你也可以定义一个方法来检索关系的「最早」或第一个相关模型：

```php
/**
 * 获取用户最早上传的图像。
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

默认情况下，`latestOfMany` 和 `oldestOfMany` 方法将基于模型的主键（必须可排序）检索最新或最旧的相关模型。但是，有时你可能希望使用不同的排序条件从较大的关系中检索单个模型。


例如，使用 `ofMany` 方法，可以检索用户点赞最高的图像。`ofMany` 方法接受可排序列作为其第一个参数，以及在查询相关模型时应用哪个聚合函数（`min` 或 `max`）：

```php
/**
 * 获取用户最受欢迎的图像。
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> **提示**
> 要构建更高级的「一对多」关系。 请查看 [进阶一对多检索](#advanced-has-one-of-many-relationships).

<a name="many-to-many-polymorphic-relations"></a>
### 多对多（多态）

<a name="many-to-many-polymorphic-table-structure"></a>
#### 表结构

多对多多态关联比 `morphOne` 和 `morphMany` 关联略微复杂一些。例如，`Post` 和 `Video` 模型能够共享关联到 `Tag` 模型的多态关系。在这种情况下使用多对多多态关联允许使用一个唯一标签在博客文章和视频间共享。以下是多对多多态关联的表结构：

    posts
        id - integer
        name - string

    videos
        id - integer
        name - string

    tags
        id - integer
        name - string

    taggables
        tag_id - integer
        taggable_id - integer
        taggable_type - string

> **提示**
> 在深入研究多态多对多关系之前，阅读 [多对多关系](#many-to-many) 的文档会对你有帮助。


<a name="many-to-many-polymorphic-model-structure"></a>
#### 模型结构

接下来，我们可以定义模型之间的关联。`Post` 和 `Video` 模型都将包含一个 `tags` 方法，该方法调用了基础 Eloquent 模型类提供的 `morphToMany` 方法。



`morphToMany` 方法接受相关模型的名称以及“关系名称”。根据我们分配给中间表的名称及其包含的键，我们将将关系称为 「taggable」：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphToMany;

    class Post extends Model
    {
        /**
         * 获取帖子的所有标签。
         */
        public function tags(): MorphToMany
        {
            return $this->morphToMany(Tag::class, 'taggable');
        }
    }

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### 定义多对多（多态）反向关系

接下来, 在这个 `Tag` 模型中, 你应该为每个可能的父模型定义一个方法. 所以, 在这个例子中, 我们将会定义一个  `posts` 方法 和 一个 `videos` 方法. 这两个方法都应该返回 `morphedByMany`  结果。

`morphedByMany` 方法接受相关模型的名称以及「关系名称」。根据我们分配给中间表名的名称及其包含的键，我们将该关系称为「taggable」：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphToMany;

    class Tag extends Model
    {
        /**
         * 获取分配给此标签的所有帖子。
         */
        public function posts(): MorphToMany
        {
            return $this->morphedByMany(Post::class, 'taggable');
        }

        /**
         * 获取分配给此视频的所有帖子.
         */
        public function videos(): MorphToMany
        {
            return $this->morphedByMany(Video::class, 'taggable');
        }
    }

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### 获取关联

一旦定义了数据库表和模型，你就可以通过模型访问关系。 例如，要访问帖子的所有标签，你可以使用 `tags` 动态关系属性：

    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->tags as $tag) {
        // ...
    }



还可以访问执行 `morphedByMany` 方法调用的方法名来从多态模型获取其所属模型。在这个示例中，就是 `Tag` 模型的 `posts` 或 `videos` 方法。可以像动态属性一样访问这些方法：

    use App\Models\Tag;

    $tag = Tag::find(1);

    foreach ($tag->posts as $post) {
        // ...
    }

    foreach ($tag->videos as $video) {
        // ...
    }

<a name="custom-polymorphic-types"></a>
### 自定义多态类型

默认情况下，Laravel 将使用完全限定的类名来存储相关模型的「类型」。 例如，给定上面的一对多关系示例，其中 `Comment` 模型可能属于 `Post` 或 `Video`模型，默认的 `commentable_type` 将分别是 `App\Models\Post` 或 `App\Models\Video`。 但是，你可能希望将这些值与应用程序的内部结构解耦。

例如，我们可以使用简单的字符串，例如 `post` 和 `video`，而不是使用模型名称作为「类型」。 通过这样做，即使模型被重命名，我们数据库中的多态「类型」列值也将保持有效：

    use Illuminate\Database\Eloquent\Relations\Relation;

    Relation::enforceMorphMap([
        'post' => 'App\Models\Post',
        'video' => 'App\Models\Video',
    ]);

你可以在 `App\Providers\AppServiceProvider` 类的 `boot` 方法中调用 `enforceMorphMap` 方法，或者你也可以创建一个单独的服务提供者。

你可以在运行时使用 `getMorphClass` 方法确定给定模型的别名。相反，可以使用 `Relation::getMorphedModel` 方法来确定与别名相关联的类名：

    use Illuminate\Database\Eloquent\Relations\Relation;

    $alias = $post->getMorphClass();

    $class = Relation::getMorphedModel($alias);

> **注意**
> 向现有应用程序添加「变形映射」时，数据库中仍包含完全限定类的每个可变形 `*_type` 列值都需要转换为其「映射」名称。



<a name="dynamic-relationships"></a>
### 动态关联

你可以使用 `resolveRelationUsing` 方法在运行时定义 Eloquent 模型之间的关系。虽然通常不建议在常规应用程序开发中使用它，但是在开发 Laravel 软件包时，这有时可能会很有用。

`resolveRelationUsing` 方法的第一个参数是关联名称。传递给该方法的第二个参数应该是一个闭包，闭包接受模型实例并返回一个有效的 Eloquent 关联定义。通常情况下，你应该在[服务提供器](https://learnku.com/docs/laravel/10.x/providersmd/14843)的启动方法中配置动态关联:

    use App\Models\Order;
    use App\Models\Customer;

    Order::resolveRelationUsing('customer', function (Order $orderModel) {
        return $orderModel->belongsTo(Customer::class, 'customer_id');
    });

> **注意**  
> 定义动态关系时，始终为 Eloquent 关系方法提供显式的键名参数。

<a name="querying-relations"></a>
## 查询关联

因为所有的 Eloquent 关联都是通过方法定义的，你可以调用这些方法来获取关联的实例，而无需真实执行查询来获取相关的模型。此外，所有的 Eloquent 关联也可以用作[查询构造器](https://learnku.com/docs/laravel/10.x/queriesmd/14883)，允许你在最终对数据库执行 SQL 查询之前，继续通过链式调用添加约束条件。

例如，假设有一个博客系统，它的 `User` 模型有许多关联的 `Post` 模型:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasMany;

    class User extends Model
    {
        /**
         * 获取该用户的所有文章.
         */
        public function posts(): HasMany
        {
            return $this->hasMany(Post::class);
        }
    }

你可以查询 `posts` 关联，并给它添加额外的约束条件，如下例所示:

    use App\Models\User;

    $user = User::find(1);

    $user->posts()->where('active', 1)->get();



你可以在关联上使用任意的 [查询构造器]([查询构造器 | 《Laravel 10 中文文档》 (learnku.com)](https://learnku.com/docs/laravel/10.x/queriesmd/14883)) 方法，所以一定要阅读查询构造器的文档，了解它的所有方法，这会对你非常有用。

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### 在关联之后链式添加 `orWhere` 子句

如上例所示，你可以在查询关联时，自由的给关联添加额外的约束条件。但是，在将 `orWhere` 子句链接到关联上时，一定要小心，因为 `orWhere` 子句将在逻辑上与关联约束处于同一级别：

    $user->posts()
            ->where('active', 1)
            ->orWhere('votes', '>=', 100)
            ->get();

上面的例子将生成以下 SQL。像你看到的那样， 这个 `or` 子句的查询指令，将返回大于 100 票的任一用户，查询不再限于特定的用户：

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

在大多数情况下，你应该使用 [逻辑分组]([查询构造器 | 《Laravel 10 中文文档》 (learnku.com)](https://learnku.com/docs/laravel/10.x/queriesmd/14883#logical-grouping)) 在括号中对条件检查进行分组：

    use Illuminate\Database\Eloquent\Builder;

    $user->posts()
            ->where(function (Builder $query) {
                return $query->where('active', 1)
                             ->orWhere('votes', '>=', 100);
            })
            ->get();

上面的示例将生成以下 SQL。 请注意，逻辑分组已正确分组约束，并且查询仍然受限于特定用户：

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### 关联方法 VS 动态属性

如果你不需要向 Eloquent 关联查询添加额外的约束，你可以像访问属性一样访问关联。 例如，继续使用我们的 `User` 和 `Post` 示例模型，我们可以像这样访问用户的所有帖子：

    use App\Models\User;

    $user = User::find(1);

    foreach ($user->posts as $post) {
        // ...
    }



动态属性是 「懒加载」 的，只有实际访问到才会加载关联数据。因此，通常用 [预加载](#eager-loading) 来准备模型需要用到的关联数据。预加载能大量减少因加载模型关联执行的 SQL 语句。 

<a name="querying-relationship-existence"></a>
### 基于存在的关联查询

在检索模型记录时，你可能希望基于关系的存在限制结果。例如，假设你想检索至少有一条评论的所有博客文章。为了实现这一点，你可以将关系名称传递给 `has` 和 `orHas` 方法：

    use App\Models\Post;

    // 检索所有至少有一条评论的文章...
    $posts = Post::has('comments')->get();

也可以指定运算符和数量来进一步自定义查询：

    // 检索所有有三条或更多评论的文章...
    $posts = Post::has('comments', '>=', 3)->get();

可以使用用「.」语法构造嵌套的 `has` 语句。例如，你可以检索包含至少一张图片的评论的所有文章：

    // 查出至少有一条带图片的评论的文章...
    $posts = Post::has('comments.images')->get();

如果你需要更多的功能，你可以使用 `whereHas` 和 `orWhereHas` 方法在 `has` 查询中定义额外的查询约束，例如检查评论的内容：

    use Illuminate\Database\Eloquent\Builder;

    // 检索至少有一条评论包含类似于 code% 单词的文章...
    $posts = Post::whereHas('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();

    // 检索至少有十条评论包含类似于 code% 单词的文章...
    $posts = Post::whereHas('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }, '>=', 10)->get();

> **注意**
> Eloquent 目前不支持跨数据库查询关系是否存在。 这些关系必须存在于同一数据库中。



<a name="inline-relationship-existence-queries"></a>
#### 内联关系存在查询

如果你想使用附加到关系查询简单的 where 条件来确认关系是否存在，使用 `whereRelation`, `orWhereRelation`, `whereMorphRelation`和 `orWhereMorphRelation` 方法更方便. 例如，查询所有评论未获批准的帖子:

    use App\Models\Post;

    $posts = Post::whereRelation('comments', 'is_approved', false)->get();

当然，就像调用查询构建器的 `where` 方法一样，你也可以指定一个运算符：

    $posts = Post::whereRelation(
        'comments', 'created_at', '>=', now()->subHour()
    )->get();

<a name="querying-relationship-absence"></a>
### 查询不存在的关联

检索模型记录时，你可能会根据不存在关系来限制结果。例如，要检索所有**没有**任何评论的所有博客文章。 可以将关系的名称传递给 `doesntHave` 和 `orDoesntHave` 方法：

    use App\Models\Post;

    $posts = Post::doesntHave('comments')->get();

如果需要更多功能，可以使用 `whereDoesntHave` 和 `orWhereDoesntHave` 方法将「where」 条件加到 `doesntHave` 查询上。这些方法允许你向关联加入自定义限制，比如检测评论内容：

    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();

你可以使用「点」符号对嵌套关系执行查询。例如，以下查询将检索所有没有评论的帖子；但是，有未被禁止的作者评论的帖子将包含在结果中:

    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
        $query->where('banned', 0);
    })->get();



<a name="querying-morph-to-relationships"></a>
### 查询多态关联

要查询「多态关联」的存在，可以使用 `whereHasMorph` 和 `whereDoesntHaveMorph` 方法。这些方法接受关联名称作为它们的第一个参数。接下来，这些方法接受你希望在查询中包含的相关模型的名称。最后，你可以提供一个闭包来自定义关联查询。

    use App\Models\Comment;
    use App\Models\Post;
    use App\Models\Video;
    use Illuminate\Database\Eloquent\Builder;

    // 检索与标题类似于 code% 的帖子或视频相关的评论。
    $comments = Comment::whereHasMorph(
        'commentable',
        [Post::class, Video::class],
        function (Builder $query) {
            $query->where('title', 'like', 'code%');
        }
    )->get();

    // 检索与标题不类似于 code% 的帖子相关的评论。
    $comments = Comment::whereDoesntHaveMorph(
        'commentable',
        Post::class,
        function (Builder $query) {
            $query->where('title', 'like', 'code%');
        }
    )->get();

你可能需要根据相关多态模型的「类型」添加查询约束。传递给 `whereHasMorph` 方法的闭包可以接收 `$type` 值作为其第二个参数。此参数允许你检查正在构建的查询的「类型」：

    use Illuminate\Database\Eloquent\Builder;

    $comments = Comment::whereHasMorph(
        'commentable',
        [Post::class, Video::class],
        function (Builder $query, string $type) {
            $column = $type === Post::class ? 'content' : 'title';

            $query->where($column, 'like', 'code%');
        }
    )->get();

<a name="querying-all-morph-to-related-models"></a>
#### 查询所有相关模型

你可以使用通配符 `*` 代替多态模型的数组，这将告诉 Laravel 从数据库中检索所有可能的多态类型。为了执行此操作，Laravel 将执行额外的查询：

    use Illuminate\Database\Eloquent\Builder;

    $comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
        $query->where('title', 'like', 'foo%');
    })->get();



<a name="aggregating-related-models"></a>
## 聚合相关模型

<a name="counting-related-models"></a>
### 计算相关模型的数量

有时候你可能想要计算给定关系的相关模型的数量，而不实际加载模型。为了实现这一点，你可以使用 `withCount` 方法。`withCount` 方法将在生成的模型中放置一个 `{relation}_count` 属性：

    use App\Models\Post;

    $posts = Post::withCount('comments')->get();

    foreach ($posts as $post) {
        echo $post->comments_count;
    }

通过将数组传递给 withCount 方法，你可以同时添加多个关系的 "计数"，并向查询添加其他约束：

    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }])->get();

    echo $posts[0]->votes_count;
    echo $posts[0]->comments_count;

你还可以给关系计数结果起别名，从而在同一关系上进行多个计数：

    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount([
        'comments',
        'comments as pending_comments_count' => function (Builder $query) {
            $query->where('approved', false);
        },
    ])->get();

    echo $posts[0]->comments_count;
    echo $posts[0]->pending_comments_count;

<a name="deferred-count-loading"></a>
#### 延迟计数加载

使用 `loadCount` 方法，你可以在获取父模型后加载关系计数：

    $book = Book::first();

    $book->loadCount('genres');

如果你需要在计数查询上设置其他查询约束，你可以传递一个以你想要计数的关系为键的数组。数组的值应该是接收查询构建器实例的闭包：

    $book->loadCount(['reviews' => function (Builder $query) {
        $query->where('rating', 5);
    }])



<a name="relationship-counting-and-custom-select-statements"></a>
#### 关联计数和自定义查询字段

如果你的查询同时包含 `withCount` 和 `select`，请确保 `withCount` 一定在 `select` 之后调用：

    $posts = Post::select(['title', 'body'])
                    ->withCount('comments')
                    ->get();

<a name="other-aggregate-functions"></a>
### 其他聚合函数

除了 `withCount` 方法外，Eloquent 还提供了 `withMin`, `withMax`, `withAvg` 和 `withSum` 等聚合方法。
这些方法会通过 `{relation}_{function}_{column}` 的命名方式将聚合结果添加到获取到的模型属性中：

    use App\Models\Post;

    $posts = Post::withSum('comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->comments_sum_votes;
    }

如果你想使用其他名称访问聚合函数的结果，可以自定义的别名：

    $posts = Post::withSum('comments as total_comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->total_comments;
    }

与 `loadCount` 方法类似，这些方法也有延迟调用的方法。这些延迟方法可在已获取到的 Eloquent 模型上调用：


    $post = Post::first();

    $post->loadSum('comments', 'votes');

如果你将这些聚合方法和一个 `select` 语句组合在一起，确保你在 `select` 方法之后调用聚合方法:

    $posts = Post::select(['title', 'body'])
                    ->withExists('comments')
                    ->get();

<a name="counting-related-models-on-morph-to-relationships"></a>
### 多态关联计数

如果你想预加载多态关联关系以及这个关联关系关联的其他关联关系的计数统计，可以通过将 `with` 方法与 `morphTo` 关系和 `morphWithCount` 方法结合来实现。

在这个例子中，我们假设 `Photo` 和 `Post` 模型可以创建 `ActivityFeed` 模型。 我们将假设 `ActivityFeed`模型定义了一个名为`parentable`的多态关联关系，它允许我们为给定的 `ActivityFeed` 实例检索父级 `Photo` 或 `Post` 模型。 此外，让我们假设 `Photo` 模型有很多 `Tag` 模型、`Post` 模型有很多 `Comment` 模型。



假如我们想要检索 `ActivityFeed` 实例并为每个 `ActivityFeed` 实例预先加载 `parentable` 父模型。 此外，我们想要检索与每张父照片关联的标签数量以及与每个父帖子关联的评论数量：

    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $activities = ActivityFeed::with([
        'parentable' => function (MorphTo $morphTo) {
            $morphTo->morphWithCount([
                Photo::class => ['tags'],
                Post::class => ['comments'],
            ]);
        }])->get();

<a name="morph-to-deferred-count-loading"></a>
#### 延迟计数加载

假设我们已经检索了一组 `ActivityFeed` 模型，现在我们想要加载与活动提要关联的各种 `parentable` 模型的嵌套关系计数。 可以使用 `loadMorphCount` 方法来完成此操作：

    $activities = ActivityFeed::with('parentable')->get();

    $activities->loadMorphCount('parentable', [
        Photo::class => ['tags'],
        Post::class => ['comments'],
    ]);

<a name="eager-loading"></a>
## 预加载

当将 Eloquent 关系作为属性访问时，相关模型是延迟加载的。 这意味着在你第一次访问该属性之前不会实际加载关联数据。 但是，Eloquent 可以在查询父模型时主动加载关联关系。 预加载减轻了 `N + 1` 查询问题。 为了说明 `N + 1` 查询问题，请参考属于 `Author` 模型的 `Book` 模型：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Book extends Model
    {
        /**
         * 获取写了这本书的作者。
         */
        public function author(): BelongsTo
        {
            return $this->belongsTo(Author::class);
        }
    }

现在，让我们检索所有书籍及其作者：

    use App\Models\Book;

    $books = Book::all();

    foreach ($books as $book) {
        echo $book->author->name;
    }



该循环将执行一个查询以检索数据库表中的所有书籍，然后对每本书执行另一个查询以检索该书的作者。 因此，如果我们有 25 本书，上面的代码将运行 26 个查询：一个查询原本的书籍信息，另外 25 个查询来检索每本书的作者。

值得庆幸的是，我们可以使用预加载将这个操作减少到两个查询。 在构建查询时，可以使用 `with` 方法指定应该预加载哪些关系： 

    $books = Book::with('author')->get();

    foreach ($books as $book) {
        echo $book->author->name;
    }

对于此操作，将只执行两个查询 - 一个查询检索书籍，一个查询检索所有书籍的作者：

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### 预加载多个关联

有时，你可能需要在单一操作中预加载几个不同的关联。要达成此目的，只要向 `with` 方法传递多个关联名称构成的数组参数：

    $books = Book::with(['author', 'publisher'])->get();

<a name="nested-eager-loading"></a>
#### 嵌套预加载

可以使用 「.」 语法预加载嵌套关联。比如在一个 Eloquent 语句中预加载所有书籍作者及其联系方式：

    $books = Book::with('author.contacts')->get();

另外，你可以通过向 `with` 方法提供嵌套数组来指定嵌套的预加载关系，这在预加载多个嵌套关系时非常方便。

    $books = Book::with([
        'author' => [
            'contacts',
            'publisher',
        ],
    ])->get();



<a name="nested-eager-loading-morphto-relationships"></a>
#### 嵌套预加载 `morphTo` 关联

如果你希望加载一个 `morphTo` 关系，以及该关系可能返回的各种实体的嵌套关系，可以将 `with` 方法与 `morphTo` 关系的 `morphWith` 方法结合使用。为了说明这种方法，让我们参考以下模型：

    <?php

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class ActivityFeed extends Model
    {
        /**
         * 获取活动记录的父记录。
         */
        public function parentable(): MorphTo
        {
            return $this->morphTo();
        }
    }

在这个例子中，我们假设 `Event`，`Photo` 和 `Post` 模型可以创建 `ActivityFeed` 模型。 另外，我们假设 `Event` 模型属于 `Calendar` 模型，`Photo` 模型与 `Tag` 模型相关联，`Post` 模型属于 `Author` 模型。

使用这些模型定义和关联，我们可以查询 `ActivityFeed` 模型实例并预加载所有 `parentable` 模型及其各自的嵌套关系：

    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $activities = ActivityFeed::query()
        ->with(['parentable' => function (MorphTo $morphTo) {
            $morphTo->morphWith([
                Event::class => ['calendar'],
                Photo::class => ['tags'],
                Post::class => ['author'],
            ]);
        }])->get();

<a name="eager-loading-specific-columns"></a>
#### 预加载指定列

并不是总需要获取关系的每一列。在这种情况下，Eloquent 允许你为关联指定想要获取的列:

    $books = Book::with('author:id,name,book_id')->get();

> **注意**
> 使用此功能时，应始终在要检索的列列表中包括 `id` 列和任何相关的外键列。



<a name="eager-loading-by-default"></a>
#### 默认预加载

有时可能希望在查询模型时始终加载某些关联。 为此，你可以在模型上定义 `$with` 属性

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Book extends Model
    {
        /**
         * 默认预加载的关联。
         *
         * @var array
         */
        protected $with = ['author'];

        /**
         * 获取书籍作者。
         */
        public function author(): BelongsTo
        {
            return $this->belongsTo(Author::class);
        }

        /**
         * 获取书籍类型。
         */
        public function genre(): BelongsTo
        {
            return $this->belongsTo(Genre::class);
        }
    }

如果你想从单个查询的 `$with` 属性中删除一个预加载，你可以使用 `without` 方法：

    $books = Book::without('author')->get();

如果你想要覆盖 `$with` 属性中所有项，仅针对单个查询，你可以使用 `withOnly` 方法：

    $books = Book::withOnly('genre')->get();

<a name="constraining-eager-loads"></a>
### 约束预加载

有时，你可能希望预加载一个关联，同时为预加载查询添加额外查询条件。你可以通过将一个关联数组传递给 `with` 方法来实现这一点，其中数组键是关联名称，数组值是一个闭包，它为预先加载查询添加了额外的约束：

    use App\Models\User;

    $users = User::with(['posts' => function (Builder $query) {
        $query->where('title', 'like', '%code%');
    }])->get();

在这个例子中，Eloquent 只会预加载帖子的 `title` 列包含单词 `code` 的帖子。 你可以调用其他 [查询构造器](/docs/laravel/10.x/queries) 方法来自定义预加载操作：

    $users = User::with(['posts' => function (Builder $query) {
        $query->orderBy('created_at', 'desc');
    }])->get();

> **注意**
> 在约束预加载时，不能使用 limit 和 take 查询构造器方法。



<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### `morphTo` 关联预加载添加约束

如果你在使用 Eloquent 进行 `morphTo` 关联的预加载时，Eloquent 将运行多个查询以获取每种类型的相关模型。你可以使用 `MorphTo` 关联的 `constrain` 方法向每个查询添加附加约束条件：

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
        $morphTo->constrain([
            Post::class => function (Builder $query) {
                $query->whereNull('hidden_at');
            },
            Video::class => function (Builder $query) {
                $query->where('type', 'educational');
            },
        ]);
    }])->get();

在这个例子中，Eloquent 只会预先加载未被隐藏的帖子，并且视频的 `type` 值为 `educational`。

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### 基于存在限制预加载

有时候，你可能需要同时检查关系的存在性并根据相同条件加载关系。例如，你可能希望仅查询具有符合给定条件的子模型 `Post` 的 `User` 模型，同时也预加载匹配的文章。你可以使用 Laravel 中的 `withWhereHas` 方法来实现这一点。

    use App\Models\User;
    use Illuminate\Database\Eloquent\Builder;

    $users = User::withWhereHas('posts', function (Builder $query) {
        $query->where('featured', true);
    })->get();

<a name="lazy-eager-loading"></a>
### 延迟预加载

有时你可能需要在查询父模型之后预加载关联。例如，如果你需要动态地决定是否加载相关模型，则这可能非常有用：

    use App\Models\Book;

    $books = Book::all();

    if ($someCondition) {
        $books->load('author', 'publisher');
    }



如果要在渴求式加载的查询语句中进行条件约束，可以通过数组的形式去加载，键为对应的关联关系，值为 `Closure` 闭包函数，该闭包的参数为一个查询实例：

    $author->load(['books' => function (Builder $query) {
        $query->orderBy('published_date', 'asc');
    }]);

如果希望仅加载未被加载的关联关系时，你可以使用 `loadMissing` 方法：

    $book->loadMissing('author');

<a name="nested-lazy-eager-loading-morphto"></a>
#### 嵌套延迟预加载 & `morphTo`

如果要预加载 `morphTo` 关系，以及该关系可能返回的各种实体上的嵌套关系，你可以使用 `loadMorph` 方法。

这个方法接受 `morphTo` 关系的名称作为它的第一个参数，第二个参数接收模型数组、关系数组。例如:

    <?php

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class ActivityFeed extends Model
    {
        /**
         * 获取活动提要记录的父项。
         */
        public function parentable(): MorphTo
        {
            return $this->morphTo();
        }
    }

在这个例子中，让我们假设 `Event` 、`Photo` 和 `Post` 模型可以创建 `ActivityFeed` 模型。此外，让我们假设 `Event` 模型属于 `Calendar` 模型，`Photo` 模型与 `Tag` 模型相关联，`Post` 模型属于 `Author` 模型。

使用这些模型定义和关联关系，我们方可以检索 `ActivityFeed` 模型实例，并立即加载所有 `parentable` 模型及其各自的嵌套关系：

    $activities = ActivityFeed::with('parentable')
        ->get()
        ->loadMorph('parentable', [
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);



<a name="preventing-lazy-loading"></a>
### 防止延迟加载

如前所述，预加载关系可以为应用程序提供显著的性能优势。 但你也可以指示 Laravel 始终防止延迟加载关系。 你可以调用基本 Eloquent 模型类提供的 `preventLazyLoading` 方法。 通常，你应该在应用程序的 `AppServiceProvider` 类的 `boot` 方法中调用此方法。

`preventLazyLoading` 方法接受一个可选的布尔类型的参数，表示是否阻止延迟加载。例如，你可能希望只在非生产环境中禁用延迟加载，这样即使在生产环境代码中意外出现了延迟加载关系，你的生产环境也能继续正常运行。

```php
use Illuminate\Database\Eloquent\Model;

/**
 * 引导应用程序服务。
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

在阻止延迟加载之后，当你的应用程序尝试延迟加载任何 Eloquent 关系时，Eloquent 将抛出 `Illuminate\Database\LazyLoadingViolationException` 异常。

你可以使用 `handleLazyLoadingViolationsUsing` 方法自定义延迟加载的违规行为。例如，使用此方法，你可以指示违规行为只被记录，而不是使用异常中断应用程序的执行：

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = get_class($model);

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## 插入 & 更新关联模型

<a name="the-save-method"></a>
### `save` 方法

Eloquent 提供了向关系中添加新模型的便捷方法。例如，你可能需要向一篇文章（`Post` 模型）添加一条新的评论（`Comment` 模型），你不用手动设置 `Comment` 模型上的 `post_id` 属性，你可以直接使用关联模型中的 `save` 方法：

    use App\Models\Comment;
    use App\Models\Post;

    $comment = new Comment(['message' => 'A new comment.']);

    $post = Post::find(1);

    $post->comments()->save($comment);



注意，我们没有将 `comments` 关联作为动态属性访问，相反，我们调用了 `comments` 方法来来获得关联实例， `save` 方法会自动添加适当的 `post_id` 值到新的 `Comment` 模型中。

如果需要保存多个关联模型，你可以使用 `saveMany` 方法：

    $post = Post::find(1);

    $post->comments()->saveMany([
        new Comment(['message' => 'A new comment.']),
        new Comment(['message' => 'Another new comment.']),
    ]);

`save` 和 `saveMany` 方法不会将新模型（`Comment`）加载到父模型（`Post`) 上， 如果你计划在使用 `save` 或 `saveMany` 方法后访问该关联模型（`Comment`），你需要使用 `refresh` 方法重新加载模型及其关联，这样你就可以访问到所有评论，包括新保存的评论了：

    $post->comments()->save($comment);

    $post->refresh();

    // 所有评论，包括新保存的评论...
    $post->comments;

<a name="the-push-method"></a>
#### 递归保存模型和关联数据

如果你想 `save` 模型及其所有关联数据，你可以使用 `push` 方法，在此示例中，将保存 `Post` 模型及其评论和评论作者：

    $post = Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();

`pushQuietly` 方法可用于保存模型及其关联关系，而不触发任何事件：

    $post->pushQuietly();

<a name="the-create-method"></a>
###  `create` 方法

除了 `save` 和 `saveMany` 方法外，你还可以使用 `create` 方法。它接受一个属性数组，同时会创建模型并插入到数据库中。 还有， `save` 和 `create` 方法的不同之处在于， `save` 方法接受一个完整的 Eloquent 模型实例，而 `create` 则接受普通的 PHP 数组：

    use App\Models\Post;

    $post = Post::find(1);

    $comment = $post->comments()->create([
        'message' => 'A new comment.',
    ]);



你还可以使用 `createMany` 方法去创建多个关联模型：

    $post = Post::find(1);

    $post->comments()->createMany([
        ['message' => 'A new comment.'],
        ['message' => 'Another new comment.'],
    ]);

还可以使用 `createQuietly` 和 `createManyQuietly`方法创建模型，而无需调度任何事件：

    $user = User::find(1);

    $user->posts()->createQuietly([
        'title' => 'Post title.',
    ]);
	
    $user->posts()->createManyQuietly([
        ['title' => 'First post.'],
        ['title' => 'Second post.'],
    ]);

你还可以使用 `findOrNew`, `firstOrNew`, `firstOrCreate` 和 `updateOrCreate` 方法来 [创建和更新关系模型](/docs/laravel/10.x/eloquent#upserts)。

> **注意**：在使用 `create` 方法前，请务必确保查看过本文档的 [批量赋值](/docs/laravel/10.x/eloquent#mass-assignment) 章节。

<a name="updating-belongs-to-relationships"></a>
### Belongs To 关联

如果你想将子模型分配给新的父模型，你可以使用 `associate` 方法。在这个例子中，`User` 模型定义了一个与 `Account` 模型的 `belongsTo` 关系。 这个 `associate` 方法将在子模型上设置外键：

    use App\Models\Account;

    $account = Account::find(10);

    $user->account()->associate($account);

    $user->save();

要从子模型中删除父模型，你可以使用 `dissociate` 方法。此方法会将关联外键设置为 `null`：

    $user->account()->dissociate();

    $user->save();

<a name="updating-many-to-many-relationships"></a>
### 多对多关联

<a name="attaching-detaching"></a>
#### 附加 / 分离

Eloquent 也提供了一些额外的辅助方法，使相关模型的使用更加方便。例如，我们假设一个用户可以拥有多个角色，并且每个角色都可以被多个用户共享。给某个用户附加一个角色是通过向中间表插入一条记录实现的，可以使用 `attach` 方法完成该操作：

    use App\Models\User;

    $user = User::find(1);

    $user->roles()->attach($roleId);



在将关系附加到模型时，还可以传递一组要插入到中间表中的附加数据：

    $user->roles()->attach($roleId, ['expires' => $expires]);

当然，有时也需要移除用户的角色。可以使用 `detach` 移除多对多关联记录。`detach` 方法将会移除中间表对应的记录。但是这两个模型都将会保留在数据库中:

    // 移除用户的一个角色...
    $user->roles()->detach($roleId);

    // 移除用户的所有角色...
    $user->roles()->detach();

为了方便起见，`attach` 和 `detach` 也允许传递一个 IDs 数组：

    $user = User::find(1);

    $user->roles()->detach([1, 2, 3]);

    $user->roles()->attach([
        1 => ['expires' => $expires],
        2 => ['expires' => $expires],
    ]);

<a name="syncing-associations"></a>
#### 同步关联

你也可以使用 `sync` 方法构建多对多关联。`sync` 方法接收一个 IDs 数组以替换中间表的记录。中间表记录中，所有未在 IDs 数组中的记录都将会被移除。所以该操作结束后，只有给出数组的 IDs 会被保留在中间表中：

    $user->roles()->sync([1, 2, 3]);

你也可以通过 IDs 传递额外的附加数据到中间表：

    $user->roles()->sync([1 => ['expires' => true], 2, 3]);

如果你想为每个同步的模型 IDs 插入相同的中间表，你可以使用 `syncWithPivotValues` 方法：

    $user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);

如果你不想移除现有的 IDs，可以使用 `syncWithoutDetaching` 方法：

    $user->roles()->syncWithoutDetaching([1, 2, 3]);



<a name="toggling-associations"></a>
#### 切换关联

多对多关联也提供了 `toggle` 方法用于「切换」给定 ID 数组的附加状态。 如果给定的 ID 已被附加在中间表中，那么它将会被移除，同样，如果给定的 ID 已被移除，它将会被附加：

    $user->roles()->toggle([1, 2, 3]);

你还可以将附加的中间表值与ID 一起传递：

    $user->roles()->toggle([
        1 => ['expires' => true],
        2 => ['expires' => true],
    ]);

<a name="updating-a-record-on-the-intermediate-table"></a>
#### 更新中间表上的记录

如果你需要在中间表中更新一条已存在的记录，可以使用 `updateExistingPivot` 方法。 此方法接收中间表的外键与要更新的数据数组进行更新：

    $user = User::find(1);

    $user->roles()->updateExistingPivot($roleId, [
        'active' => false,
    ]);

<a name="touching-parent-timestamps"></a>
## 更新父级时间戳

当一个模型属 `belongsTo` 或者 `belongsToMany` 另一个模型时， 例如 `Comment` 属于 `Post` ，有时更新子模型导致更新父模型时间戳非常有用。

例如，当 `Comment` 模型被更新时，你需要自动「触发」父级 `Post` 模型的 `updated_at` 时间戳的更新。`Eloquent` 让它变得简单。只要在子模型加一个包含关联名称的 `touches` 属性即可：:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Comment extends Model
    {
        /**
         * 需要触发的所有关联关系。
         *
         * @var array
         */
        protected $touches = ['post'];

        /**
         * 获取评论所属文章。
         */
        public function post(): BelongsTo
        {
            return $this->belongsTo(Post::class);
        }
    }

> **注意**：只有使用 `Eloquent` 的 `save` 方法更新子模型时，才会触发更新父模型时间戳。

