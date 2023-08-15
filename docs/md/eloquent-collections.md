# Eloquent：集合

- [介绍](#introduction)
- [可用的方法](#available-methods)
- [自定义集合](#custom-collections)

<a name="introduction"></a>
## 介绍

所有以多个模型为查询结果的 Eloquent 方法的返回值都是 `Illuminate\Database\Eloquent\Collection` 类的实例, 其中包括了通过 `get` 方法和关联关系获取的结果。Eloquent 集合对象扩展了 Laravel 的[基础集合类](/docs/laravel/10.x/collections)，因此它自然地继承了许多用于流畅地处理 Eloquent 模型的底层数组的方法。请务必查看 Laravel 集合文档以了解所有这些有用的方法！

所有的集合都可作为迭代器，你可以像遍历普通的 PHP 数组一样来遍历它们:

    use App\Models\User;

    $users = User::where('active', 1)->get();

    foreach ($users as $user) {
        echo $user->name;
    }

然而，正如前面所提到的，集合远比数组要强大，而且暴露了一系列直观的、可用于链式调用的 map/reduce 方法。打个比方，我们可以删除所有不活跃的模型，然后收集余下的所有用户的名字。

    $names = User::all()->reject(function (User $user) {
        return $user->active === false;
    })->map(function (User $user) {
        return $user->name;
    });

<a name="eloquent-collection-conversion"></a>
#### Eloquent 集合转换

在大多数 Eloquent 集合方法返回一个新的 Eloquent 集合实例的前提下，`collapse`，`flatten`，`flip`， `keys`，`pluck`，以及 `zip` 方法返回一个[基础集合类](/docs/laravel/10.x/collections)的实例。 如果一个 `map` 方法返回了一个不包含任何模型的 Eloquent 集合，它也会被转换成一个基础集合实例。

<a name="available-methods"></a>
## 可用的方法

所有 Eloquent 的集合都继承了 [Laravel collection](/docs/laravel/10.x/collectionsmd#available-methods) 对象；因此， 他们也继承了所有集合基类提供的强大的方法。

另外， `Illuminate\Database\Eloquent\Collection` 类提供了一套上层的方法来帮你管理你的模型集合。大多数方法返回 `Illuminate\Database\Eloquent\Collection` 实例；然而，也会有一些方法， 例如 `modelKeys`， 它们会返回基于 `Illuminate\Support\Collection` 类的实例。

<style>
    .collection-method-list > p {
        columns: 14.4em 1; -moz-columns: 14.4em 1; -webkit-columns: 14.4em 1;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div class="collection-method-list" markdown="1">

[append](#method-append)
[contains](#method-contains)
[diff](#method-diff)
[except](#method-except)
[find](#method-find)
[fresh](#method-fresh)
[intersect](#method-intersect)
[load](#method-load)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[only](#method-only)
[setVisible](#method-setVisible)
[setHidden](#method-setHidden)
[toQuery](#method-toquery)
[unique](#method-unique)

</div>

<a name="method-append"></a>
#### `append($attributes)` {.collection-method .first-collection-method}

可以使用`append`方法来为集合中的模型[追加属性](/docs/laravel/10.x/eloquent-serializationmd#appending-values-to-json)。 可以是数组或单个属性追加:

    $users->append('team');

    $users->append(['team', 'is_admin']);

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)` {.collection-method}

`contains` 方法可用于判断集合中是否包含指定的模型实例。这个方法接收一个主键或者模型实例：

    $users->contains(1);

    $users->contains(User::find(1));

<a name="method-diff"></a>
#### `diff($items)` {.collection-method}

`diff` 方法返回不在给定集合中的所有模型：

    use App\Models\User;

    $users = $users->diff(User::whereIn('id', [1, 2, 3])->get());



<a name="method-except"></a>
#### `except($keys)` {.collection-method}

`except` 方法返回给定主键外的所有模型：

    $users = $users->except([1, 2, 3]);

<a name="method-find"></a>
#### `find($key)` {.collection-method}

`find` 方法查找给定主键的模型。如果 `$key` 是一个模型实例， `find` 将会尝试返回与主键匹配的模型。 如果 `$key` 是一个关联数组， `find` 将返回所有数组主键匹配的模型：

    $users = User::all();

    $user = $users->find(1);

<a name="method-fresh"></a>
#### `fresh($with = [])` {.collection-method}

`fresh` 方法用于从数据库中检索集合中每个模型的新实例。此外，还将加载任何指定的关联关系：

    $users = $users->fresh();

    $users = $users->fresh('comments');

<a name="method-intersect"></a>
#### `intersect($items)` {.collection-method}

`intersect` 方法返回给定集合与当前模型的交集：

    use App\Models\User;

    $users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());

<a name="method-load"></a>
#### `load($relations)` {.collection-method}

`load` 方法为集合中的所有模型加载给定关联关系：

    $users->load(['comments', 'posts']);

    $users->load('comments.author');

    $users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);

<a name="method-loadMissing"></a>
#### `loadMissing($relations)` {.collection-method}

如果尚未加载关联关系，则 `loadMissing` 方法将加载集合中所有模型的给定关联关系：

    $users->loadMissing(['comments', 'posts']);

    $users->loadMissing('comments.author');

    $users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);

<a name="method-modelKeys"></a>


#### `modelKeys()` {.collection-method}

`modelKeys` 方法返回集合中所有模型的主键：

    $users->modelKeys();

    // [1, 2, 3, 4, 5]

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)` {.collection-method}

`makeVisible` 方法[使模型上的隐藏属性可见](/docs/laravel/10.x/eloquent-serializationmd#hiding-attributes-from-json) ：

    $users = $users->makeVisible(['address', 'phone_number']);

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)` {.collection-method}

`makeHidden` 方法[隐藏模型属性](/docs/laravel/10.x/eloquent-serializationmd#hiding-attributes-from-json) ：

    $users = $users->makeHidden(['address', 'phone_number']);

<a name="method-only"></a>
#### `only($keys)` {.collection-method}

`only` 方法返回具有给定主键的所有模型：

    $users = $users->only([1, 2, 3]);

<a name="method-setVisible"></a>
#### `setVisible($attributes)` {.collection-method}

`setVisible`方法[临时覆盖](/docs/laravel/10.x/eloquent-serializationmd#temporarily-modifying-attribute-visibility)集合中每个模型的所有可见属性:

    $users = $users->setVisible(['id', 'name']);

<a name="method-setHidden"></a>
#### `setHidden($attributes)` {.collection-method}

`setHidden`方法[临时覆盖](/docs/laravel/10.x/eloquent-serializationmd#temporarily-modifying-attribute-visibility)集合中每个模型的所有隐藏属性:

    $users = $users->setHidden(['email', 'password', 'remember_token']);

<a name="method-toquery"></a>
#### `toQuery()` {.collection-method}

`toQuery` 方法返回一个 Eloquent 查询生成器实例，该实例包含集合模型主键上的 `whereIn` 约束：

    use App\Models\User;

    $users = User::where('status', 'VIP')->get();

    $users->toQuery()->update([
        'status' => 'Administrator',
    ]);

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)` {.collection-method}

`unique` 方法返回集合中所有不重复的模型，若模型在集合中存在相同类型且相同主键的另一模型，该模型将被删除：

    $users = $users->unique();

<a name="custom-collections"></a>
## 自定义集合

如果你想在与模型交互时使用一个自定义的 `Collection` 对象，你可以通过在模型中定义 `newCollection` 方法来实现：

    <?php

    namespace App\Models;

    use App\Support\UserCollection;
    use Illuminate\Database\Eloquent\Collection;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 创建新的Elquent Collection实例。
         *
         * @param  array<int, \Illuminate\Database\Eloquent\Model>  $models
         * @return \Illuminate\Database\Eloquent\Collection<int, \Illuminate\Database\Eloquent\Model>
         */
        public function newCollection(array $models = []): Collection
        {
            return new UserCollection($models);
        }
    }

一旦在模型中定义了一个 `newCollection` 方法，每当 Eloquent 需要返回一个 `Illuminate\Database\Eloquent\Collection` 实例的时候，将会返回自定义集合的实例取代之。如果你想使每一个模型都使用自定义的集合，可以在一个模型基类中定义一个 `newCollection` 方法，然后让其它模型派生于此基类。

