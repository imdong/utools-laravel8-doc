# 集合

- [介绍](#introduction)
     - [创建集合](#creating-collections)
     - [扩展集合](#extending-collections)
- [可用方法](#available-methods)
- [高阶消息](#higher-order-messages)
- [惰性集合](#lazy-collections)
     - [介绍](#lazy-collection-introduction)
     - [创建惰性集合](#creating-lazy-collections)
     - [枚举契约](#the-enumerable-contract)
     - [惰性集合方法](#lazy-collection-methods)

<a name="introduction"></a>
## 介绍

`Illuminate\Support\Collection` 类为处理数据数组提供了一个流畅、方便的包装器。 例如，查看以下代码。 我们将使用 `collect` 助手从数组中创建一个新的集合实例，对每个元素运行 `strtoupper` 函数，然后删除所有空元素：

    $collection = collect(['taylor', 'abigail', null])->map(function (string $name) {
        return strtoupper($name);
    })->reject(function (string $name) {
        return empty($name);
    });

如你所见，`Collection` 类允许你链接其方法以执行流畅的映射和减少底层数组。一般来说，集合是不可变的，这意味着每个 `Collection` 方法都会返回一个全新的 `Collection` 实例。

<a name="creating-collections"></a>
### 创建集合

如上所述，`collect` 帮助器为给定数组返回一个新的 `Illuminate\Support\Collection` 实例。因此，创建一个集合非常简单：

    $collection = collect([1, 2, 3]);

> **技巧：**[Eloquent](/docs/laravel/10.x/eloquent) 查询的结果总是作为 `Collection` 实例返回。

<a name="extending-collections"></a>
### 扩展集合

集合是「可宏化的」，它允许你在运行时向 `Collection` 类添加其他方法。 `Illuminate\Support\Collection` 类的 `macro` 方法接受一个闭包，该闭包将在调用宏时执行。宏闭包可以通过 `$this` 访问集合的其他方法，就像它是集合类的真实方法一样。例如，以下代码在 `Collection` 类中添加了 `toUpper` 方法：

    use Illuminate\Support\Collection;
    use Illuminate\Support\Str;

    Collection::macro('toUpper', function () {
        return $this->map(function (string $value) {
            return Str::upper($value);
        });
    });

    $collection = collect(['first', 'second']);

    $upper = $collection->toUpper();

    // ['FIRST', 'SECOND']



通常，你应该在[服务提供者](/docs/laravel/10.x/providers)的 `boot` 方法中声明集合宏。

<a name="macro-arguments"></a>
#### 宏参数

如有必要，可以定义接受其他参数的宏：

    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\Lang;

    Collection::macro('toLocale', function (string $locale) {
        return $this->map(function (string $value) use ($locale) {
            return Lang::get($value, [], $locale);
        });
    });

    $collection = collect(['first', 'second']);

    $translated = $collection->toLocale('es');

<a name="available-methods"></a>
## 可用的方法

对于剩余的大部分集合文档，我们将讨论 `Collection` 类中可用的每个方法。请记住，所有这些方法都可以链式调用，以便流畅地操作底层数组。此外，几乎每个方法都会返回一个新的 `Collection` 实例，允许你在必要时保留集合的原始副本：

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsOneItem](#method-containsoneitem)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>



<a name="method-listing"></a>
## 方法列表

<style>
    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="method-all"></a>
#### `all()` {.collection-method .first-collection-method}

`all` 方法返回由集合表示的底层数组：

    collect([1, 2, 3])->all();

    // [1, 2, 3]

<a name="method-average"></a>
#### `average()` {.collection-method}

[`avg`](#method-avg) 方法的别名。

<a name="method-avg"></a>
#### `avg()` {.collection-method}

`avg` 方法返回给定键的 [平均值](https://en.wikipedia.org/wiki/Average)：

    $average = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->avg('foo');

    // 20

    $average = collect([1, 1, 2, 4])->avg();

    // 2

<a name="method-chunk"></a>
#### `chunk()` {.collection-method}

`chunk` 方法将集合分成多个给定大小的较小集合：

    $collection = collect([1, 2, 3, 4, 5, 6, 7]);

    $chunks = $collection->chunk(4);

    $chunks->all();

    // [[1, 2, 3, 4], [5, 6, 7]]

当使用诸如 [Bootstrap](https://getbootstrap.com/docs/4.1/layout/grid/) 之类的网格系统时，此方法在 [views](/docs/laravel/10.x/views) 中特别有用。例如，假设你有一组 [Eloquent](/docs/laravel/10.x/eloquent) 模型要在网格中显示：

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-chunkwhile"></a>
#### `chunkWhile()` {.collection-method}

`chunkWhile` 方法根据给定回调的评估将集合分成多个更小的集合。传递给闭包的 `$chunk` 变量可用于检查前一个元素：

    $collection = collect(str_split('AABBCCCD'));

    $chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
        return $value === $chunk->last();
    });

    $chunks->all();

    // [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]

<a name="method-collapse"></a>


#### `collapse()` {.collection-method}

`collapse` 方法将数组集合折叠成一个单一的平面集合：

    $collection = collect([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ]);

    $collapsed = $collection->collapse();

    $collapsed->all();

    // [1, 2, 3, 4, 5, 6, 7, 8, 9]

<a name="method-collect"></a>
#### `collect()` {.collection-method}

`collect` 方法返回一个新的 `Collection` 实例，其中包含当前集合中的项目：

    $collectionA = collect([1, 2, 3]);

    $collectionB = $collectionA->collect();

    $collectionB->all();

    // [1, 2, 3]

`collect` 方法主要用于将 [惰性集合](#lazy-collections) 转换为标准的 `Collection` 实例：

    $lazyCollection = LazyCollection::make(function () {
        yield 1;
        yield 2;
        yield 3;
    });

    $collection = $lazyCollection->collect();

    get_class($collection);

    // 'Illuminate\Support\Collection'

    $collection->all();

    // [1, 2, 3]

> **技巧：**当你有一个 `Enumerable` 的实例并且需要一个非惰性集合实例时，`collect` 方法特别有用。由于 `collect()` 是 `Enumerable` 合约的一部分，你可以安全地使用它来获取 `Collection` 实例。

<a name="method-combine"></a>
#### `combine()` {.collection-method}

`combine` 方法将集合的值作为键与另一个数组或集合的值组合：

    $collection = collect(['name', 'age']);

    $combined = $collection->combine(['George', 29]);

    $combined->all();

    // ['name' => 'George', 'age' => 29]

<a name="method-concat"></a>
#### `concat()` {.collection-method}

`concat` 方法将给定的 `array` 或集合的值附加到另一个集合的末尾：

    $collection = collect(['John Doe']);

    $concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

    $concatenated->all();

    // ['John Doe', 'Jane Doe', 'Johnny Doe']

`concat` 方法在数字上重新索引连接到原始集合上的项目的键。要维护关联集合中的键，请参阅 [merge](#method-merge) 方法。

<a name="method-contains"></a>
#### `contains()` {.collection-method}

`contains` 方法确定集合是否包含给定项目。你可以将闭包传递给 `contains` 方法，以确定集合中是否存在与给定真值测试匹配的元素：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->contains(function (int $value, int $key) {
        return $value > 5;
    });

    // false



或者，你可以将字符串传递给 `contains` 方法，以确定集合是否包含给定的项目值：

    $collection = collect(['name' => 'Desk', 'price' => 100]);

    $collection->contains('Desk');

    // true

    $collection->contains('New York');

    // false

你还可以将键/值对传递给 `contains` 方法，该方法将确定给定对是否存在于集合中：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->contains('product', 'Bookcase');

    // false

`contains` 方法在检查项目值时使用“松散”比较，这意味着具有整数值的字符串将被视为等于具有相同值的整数。使用 [`containsStrict`](#method-containsstrict) 方法使用“严格”比较进行过滤。

对于 `contains` 的逆操作，请参见 [doesntContain](#method-doesntcontain) 方法。

<a name="method-containsoneitem"></a>
#### `containsOneItem()` {.collection-method}

`containsOneItem` 方法决定了集合是否包含一个项目。

    collect([])->containsOneItem();

    // false

    collect(['1'])->containsOneItem();

    // true

    collect(['1', '2'])->containsOneItem();

    // false

<a name="method-containsstrict"></a>
#### `containsStrict()` {.collection-method}

此方法与 [`contains`](#method-contains) 方法具有相同的签名；但是，所有值都使用「严格」比较进行比较。

> **技巧：**使用 [Eloquent Collections](/docs/laravel/10.x/eloquent-collections#method-contains) 时会修改此方法的行为。

<a name="method-count"></a>
#### `count()` {.collection-method}

`count` 方法返回集合中的项目总数：

    $collection = collect([1, 2, 3, 4]);

    $collection->count();

    // 4

<a name="method-countBy"></a>
#### `countBy()` {.collection-method}

`countBy` 方法计算集合中值的出现次数。默认情况下，该方法计算每个元素的出现次数，允许你计算集合中元素的某些“类型”：

    $collection = collect([1, 2, 2, 2, 3]);

    $counted = $collection->countBy();

    $counted->all();

    // [1 => 1, 2 => 3, 3 => 1]



你将闭包传递给 `countBy` 方法以按自定义值计算所有项目：

    $collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

    $counted = $collection->countBy(function (string $email) {
        return substr(strrchr($email, "@"), 1);
    });

    $counted->all();

    // ['gmail.com' => 2, 'yahoo.com' => 1]

<a name="method-crossjoin"></a>
#### `crossJoin()` {.collection-method}

`crossJoin` 方法在给定的数组或集合中交叉连接集合的值，返回具有所有可能排列的笛卡尔积：

    $collection = collect([1, 2]);

    $matrix = $collection->crossJoin(['a', 'b']);

    $matrix->all();

    /*
        [
            [1, 'a'],
            [1, 'b'],
            [2, 'a'],
            [2, 'b'],
        ]
    */

    $collection = collect([1, 2]);

    $matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

    $matrix->all();

    /*
        [
            [1, 'a', 'I'],
            [1, 'a', 'II'],
            [1, 'b', 'I'],
            [1, 'b', 'II'],
            [2, 'a', 'I'],
            [2, 'a', 'II'],
            [2, 'b', 'I'],
            [2, 'b', 'II'],
        ]
    */

<a name="method-dd"></a>
#### `dd()` {.collection-method}

`dd` 方法转储集合的项目并结束脚本的执行：

    $collection = collect(['John Doe', 'Jane Doe']);

    $collection->dd();

    /*
        Collection {
            #items: array:2 [
                0 => "John Doe"
                1 => "Jane Doe"
            ]
        }
    */

如果你不想停止执行脚本，请改用 [`dump`](#method-dump) 方法。

<a name="method-diff"></a>
#### `diff()` {.collection-method}

`diff` 方法根据集合的值将集合与另一个集合或普通 PHP `array` 进行比较。此方法将返回给定集合中不存在的原始集合中的值：

    $collection = collect([1, 2, 3, 4, 5]);

    $diff = $collection->diff([2, 4, 6, 8]);

    $diff->all();

    // [1, 3, 5]

> **技巧：**此方法的行为在使用 [Eloquent Collections](/docs/laravel/10.x/eloquent-collections#method-diff) 时被修改。

<a name="method-diffassoc"></a>
#### `diffAssoc()` {.collection-method}

`diffAssoc` 方法根据其键和值将集合与另一个集合或普通 PHP `array` 进行比较。此方法将返回给定集合中不存在的原始集合中的键/值对：

    $collection = collect([
        'color' => 'orange',
        'type' => 'fruit',
        'remain' => 6,
    ]);

    $diff = $collection->diffAssoc([
        'color' => 'yellow',
        'type' => 'fruit',
        'remain' => 3,
        'used' => 6,
    ]);

    $diff->all();

    // ['color' => 'orange', 'remain' => 6]



<a name="method-diffkeys"></a>
#### `diffKeys()` {.collection-method}

`diffKeys` 方法将集合与另一个集合或基于其键的普通 PHP `array` 进行比较。此方法将返回给定集合中不存在的原始集合中的键/值对：

    $collection = collect([
        'one' => 10,
        'two' => 20,
        'three' => 30,
        'four' => 40,
        'five' => 50,
    ]);

    $diff = $collection->diffKeys([
        'two' => 2,
        'four' => 4,
        'six' => 6,
        'eight' => 8,
    ]);

    $diff->all();

    // ['one' => 10, 'three' => 30, 'five' => 50]

<a name="method-doesntcontain"></a>
#### `doesntContain()` {.collection-method}

`doesntContain` 方法确定集合是否不包含给定项目。你可以将闭包传递给 `doesntContain` 方法，以确定集合中是否不存在与给定真值测试匹配的元素：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->doesntContain(function (int $value, int $key) {
        return $value < 5;
    });

    // false

或者，你可以将字符串传递给 `doesntContain` 方法，以确定集合是否不包含给定的项目值：

    $collection = collect(['name' => 'Desk', 'price' => 100]);

    $collection->doesntContain('Table');

    // true

    $collection->doesntContain('Desk');

    // false

你还可以将键/值对传递给 `doesntContain` 方法，该方法将确定给定对是否不存在于集合中：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->doesntContain('product', 'Bookcase');

    // true

`doesntContain` 方法在检查项目值时使用「松散」比较，这意味着具有整数值的字符串将被视为等于具有相同值的整数。

<a name="method-dump"></a>
#### `dump()` {.collection-method}

`dump` 方法转储集合的项目：

    $collection = collect(['John Doe', 'Jane Doe']);

    $collection->dump();

    /*
        Collection {
            #items: array:2 [
                0 => "John Doe"
                1 => "Jane Doe"
            ]
        }
    */

如果要在转储集合后停止执行脚本，请改用 [`dd`](#method-dd) 方法。



<a name="method-duplicates"></a>
#### `duplicates()` {.collection-method}

`duplicates` 方法从集合中检索并返回重复值：

    $collection = collect(['a', 'b', 'a', 'c', 'b']);

    $collection->duplicates();

    // [2 => 'a', 4 => 'b']

如果集合包含数组或对象，你可以传递要检查重复值的属性的键：

    $employees = collect([
        ['email' => 'abigail@example.com', 'position' => 'Developer'],
        ['email' => 'james@example.com', 'position' => 'Designer'],
        ['email' => 'victoria@example.com', 'position' => 'Developer'],
    ]);

    $employees->duplicates('position');

    // [2 => 'Developer']

<a name="method-duplicatesstrict"></a>
#### `duplicatesStrict()` {.collection-method}

此方法与 [`duplicates`](#method-duplicates) 方法具有相同的签名；但是，所有值都使用「严格」比较进行比较。

<a name="method-each"></a>
#### `each()` {.collection-method}

`each` 方法遍历集合中的项目并将每个项目传递给闭包：

    $collection = collect([1, 2, 3, 4]);

    $collection->each(function (int $item, int $key) {
        // ...
    });

如果你想停止遍历这些项目，你可以从你的闭包中返回 `false`：

    $collection->each(function (int $item, int $key) {
        if (/* condition */) {
            return false;
        }
    });

<a name="method-eachspread"></a>
#### `eachSpread()` {.collection-method}

`eachSpread` 方法迭代集合的项目，将每个嵌套项目值传递给给定的回调：

    $collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

    $collection->eachSpread(function (string $name, int $age) {
        // ...
    });

你可以通过从回调中返回 `false` 来停止遍历项目：

    $collection->eachSpread(function (string $name, int $age) {
        return false;
    });

<a name="method-every"></a>
#### `every()` {.collection-method}

`every` 方法可用于验证集合的所有元素是否通过给定的真值测试：

    collect([1, 2, 3, 4])->every(function (int $value, int $key) {
        return $value > 2;
    });

    // false



如果集合为空，`every` 方法将返回 true：

    $collection = collect([]);

    $collection->every(function (int $value, int $key) {
        return $value > 2;
    });

    // true

<a name="method-except"></a>
#### `except()` {.collection-method}

`except` 方法返回集合中的所有项目，除了具有指定键的项目：

    $collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

    $filtered = $collection->except(['price', 'discount']);

    $filtered->all();

    // ['product_id' => 1]

对于 `except` 的反义词，请参见 [only](#method-only) 方法。

> 技巧：此方法的行为在使用 [Eloquent Collections](/docs/laravel/10.x/eloquent-collections#method-except) 时被修改。

<a name="method-filter"></a>
#### `filter()` {.collection-method}

`filter` 方法使用给定的回调过滤集合，只保留那些通过给定真值测试的项目：

    $collection = collect([1, 2, 3, 4]);

    $filtered = $collection->filter(function (int $value, int $key) {
        return $value > 2;
    });

    $filtered->all();

    // [3, 4]

如果没有提供回调，则集合中所有相当于 `false` 的条目都将被删除：

    $collection = collect([1, 2, 3, null, false, '', 0, []]);

    $collection->filter()->all();

    // [1, 2, 3]

对于 `filter` 的逆操作，请参见 [reject](#method-reject) 方法。

<a name="method-first"></a>
#### `first()` {.collection-method}

`first` 方法返回集合中通过给定真值测试的第一个元素：

    collect([1, 2, 3, 4])->first(function (int $value, int $key) {
        return $value > 2;
    });

    // 3

你也可以调用不带参数的 `first` 方法来获取集合中的第一个元素。如果集合为空，则返回 `null`：

    collect([1, 2, 3, 4])->first();

    // 1

<a name="method-first-or-fail"></a>
#### `firstOrFail()` {.collection-method}

`firstOrFail` 方法与 `first` 方法相同；但是，如果没有找到结果，将抛出 `Illuminate/Support/ItemNotFoundException` 异常。

    collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
        return $value > 5;
    });

    // Throws ItemNotFoundException...



你也可以调用 `firstOrFail` 方法，没有参数，以获得集合中的第一个元素。如果集合是空的，将抛出一个 `Illuminate\Support\ItemNotFoundException` 异常。

    collect([])->firstOrFail();

    // Throws ItemNotFoundException...

<a name="method-first-where"></a>
#### `firstWhere()` {.collection-method}

`firstWhere` 方法返回集合中具有给定键/值对的第一个元素：

    $collection = collect([
        ['name' => 'Regena', 'age' => null],
        ['name' => 'Linda', 'age' => 14],
        ['name' => 'Diego', 'age' => 23],
        ['name' => 'Linda', 'age' => 84],
    ]);

    $collection->firstWhere('name', 'Linda');

    // ['name' => 'Linda', 'age' => 14]

你还可以使用比较运算符调用 `firstWhere` 方法：

    $collection->firstWhere('age', '>=', 18);

    // ['name' => 'Diego', 'age' => 23]

与 [where](#method-where) 方法一样，你可以将一个参数传递给 `firstWhere` 方法。在这种情况下，`firstWhere` 方法将返回给定项目键值为「真」的第一个项目：

    $collection->firstWhere('age');

    // ['name' => 'Linda', 'age' => 14]

<a name="method-flatmap"></a>
#### `flatMap()` {.collection-method}

`flatMap` 方法遍历集合并将每个值传递给给定的闭包。闭包可以自由修改项目并将其返回，从而形成一个新的修改项目集合。然后，数组被展平一层：

    $collection = collect([
        ['name' => 'Sally'],
        ['school' => 'Arkansas'],
        ['age' => 28]
    ]);

    $flattened = $collection->flatMap(function (array $values) {
        return array_map('strtoupper', $values);
    });

    $flattened->all();

    // ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];

<a name="method-flatten"></a>
#### `flatten()` {.collection-method}

`flatten` 方法将多维集合展平为一维：

    $collection = collect([
        'name' => 'taylor',
        'languages' => [
            'php', 'javascript'
        ]
    ]);

    $flattened = $collection->flatten();

    $flattened->all();

    // ['taylor', 'php', 'javascript'];

如有必要，你可以向 `flatten` 方法传递一个「深度」参数：

    $collection = collect([
        'Apple' => [
            [
                'name' => 'iPhone 6S',
                'brand' => 'Apple'
            ],
        ],
        'Samsung' => [
            [
                'name' => 'Galaxy S7',
                'brand' => 'Samsung'
            ],
        ],
    ]);

    $products = $collection->flatten(1);

    $products->values()->all();

    /*
        [
            ['name' => 'iPhone 6S', 'brand' => 'Apple'],
            ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
        ]
    */



在此示例中，调用 `flatten` 而不提供深度也会使嵌套数组变平，从而导致 `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`。提供深度允许你指定嵌套数组将被展平的级别数。

<a name="method-flip"></a>
#### `flip()` {.collection-method}

`flip` 方法将集合的键与其对应的值交换：

    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $flipped = $collection->flip();

    $flipped->all();

    // ['taylor' => 'name', 'laravel' => 'framework']

<a name="method-forget"></a>
#### `forget()` {.collection-method}

该 `forget` 方法将通过指定的键来移除集合中对应的元素：

    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $collection->forget('name');

    $collection->all();

    // ['framework' => 'laravel']

> **注意：**与大多数集合的方法不同的是， `forget` 不会返回修改后的新集合；它会直接修改原集合。

<a name="method-forpage"></a>
#### `forPage()` {.collection-method}

该 `forPage` 方法返回一个含有指定页码数集合项的新集合。这个方法接受页码数作为其第一个参数，每页显示的项数作为其第二个参数：

    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    $chunk = $collection->forPage(2, 3);

    $chunk->all();

    // [4, 5, 6]

<a name="method-get"></a>
#### `get()` {.collection-method}

该 `get` 方法返回指定键的集合项，如果该键在集合中不存在，则返回 null：

    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $value = $collection->get('name');

    // taylor

你可以任选一个默认值作为第二个参数传递：

    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $value = $collection->get('age', 34);

    // 34

你甚至可以将一个回调函数作为默认值传递。如果指定的键不存在，就会返回回调函数的结果：

    $collection->get('email', function () {
        return 'taylor@example.com';
    });

    // taylor@example.com



<a name="method-groupby"></a>
#### `groupBy()` {.collection-method}

该 `groupBy` 方法根据指定键对集合项进行分组：

    $collection = collect([
        ['account_id' => 'account-x10', 'product' => 'Chair'],
        ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ['account_id' => 'account-x11', 'product' => 'Desk'],
    ]);

    $grouped = $collection->groupBy('account_id');

    $grouped->all();

    /*
        [
            'account-x10' => [
                ['account_id' => 'account-x10', 'product' => 'Chair'],
                ['account_id' => 'account-x10', 'product' => 'Bookcase'],
            ],
            'account-x11' => [
                ['account_id' => 'account-x11', 'product' => 'Desk'],
            ],
        ]
    */

你可以传递回调，而不是传递字符串 `key`。回调应返回你希望通过以下方式键入组的值：

    $grouped = $collection->groupBy(function (array $item, int $key) {
        return substr($item['account_id'], -3);
    });

    $grouped->all();

    /*
        [
            'x10' => [
                ['account_id' => 'account-x10', 'product' => 'Chair'],
                ['account_id' => 'account-x10', 'product' => 'Bookcase'],
            ],
            'x11' => [
                ['account_id' => 'account-x11', 'product' => 'Desk'],
            ],
        ]
    */

多个分组标准可以作为数组传递。每个数组元素将应用于多维数组中的相应级别：

    $data = new Collection([
        10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
    ]);

    $result = $data->groupBy(['skill', function (array $item) {
        return $item['roles'];
    }], preserveKeys: true);

    /*
    [
        1 => [
            'Role_1' => [
                10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
                20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
            ],
            'Role_2' => [
                20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
            ],
            'Role_3' => [
                10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            ],
        ],
        2 => [
            'Role_1' => [
                30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
            ],
            'Role_2' => [
                40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
            ],
        ],
    ];
    */

<a name="method-has"></a>
#### `has()` {.collection-method}

`has` 方法确定集合中是否存在给定键：

    $collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

    $collection->has('product');

    // true

    $collection->has(['product', 'amount']);

    // true

    $collection->has(['amount', 'price']);

    // false



<a name="method-hasany"></a>
#### `hasAny()` {.collection-method}

`hasAny` 方法确定在集合中是否存在任何给定的键。

    $collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

    $collection->hasAny(['product', 'price']);

    // true

    $collection->hasAny(['name', 'price']);

    // false

<a name="method-implode"></a>
#### `implode()` {.collection-method}

`implode` 方法连接集合中的项目。它的参数取决于集合中项目的类型。如果集合包含数组或对象，你应该传递你希望加入的属性的键，以及你希望放置在值之间的「胶水」字符串：

    $collection = collect([
        ['account_id' => 1, 'product' => 'Desk'],
        ['account_id' => 2, 'product' => 'Chair'],
    ]);

    $collection->implode('product', ', ');

    // Desk, Chair

如果集合包含简单的字符串或数值，则应将「胶水」作为唯一参数传递给该方法：

    collect([1, 2, 3, 4, 5])->implode('-');

    // '1-2-3-4-5'

如果你想对被内部处理的值进行格式化，你可以给 `implode` 方法传递一个闭包。

    $collection->implode(function (array $item, int $key) {
        return strtoupper($item['product']);
    }, ', ');

    // DESK, CHAIR

<a name="method-intersect"></a>
#### `intersect()` {.collection-method}

`intersect` 方法从原始集合中删除任何不存在于给定 `array` 或集合中的值。生成的集合将保留原始集合的键：

    $collection = collect(['Desk', 'Sofa', 'Chair']);

    $intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

    $intersect->all();

    // [0 => 'Desk', 2 => 'Chair']

> 技巧：使用 [Eloquent Collections](/docs/laravel/10.x/eloquent-collections#method-intersect) 时会修改此方法的行为。

<a name="method-intersectAssoc"></a>
#### `intersectAssoc()` {.collection-method}

`intersectAssoc` 方法将原始集合与另一个集合或`array`进行比较，返回所有给定集合中存在的键/值对:

    $collection = collect([
        'color' => 'red',
        'size' => 'M',
        'material' => 'cotton'
    ]);

    $intersect = $collection->intersectAssoc([
        'color' => 'blue',
        'size' => 'M',
        'material' => 'polyester'
    ]);

    $intersect->all();

    // ['size' => 'M']



<a name="method-intersectbykeys"></a>
#### `intersectByKeys()` {.collection-method}

`intersectByKeys` 方法删除了原始集合中不存在于给定的 `array` 或集合中的任何键和其相应的值。

    $collection = collect([
        'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
    ]);

    $intersect = $collection->intersectByKeys([
        'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
    ]);

    $intersect->all();

    // ['type' => 'screen', 'year' => 2009]

<a name="method-isempty"></a>
#### `isEmpty()` {.collection-method}

如果集合为空，`isEmpty` 方法返回 `true`；否则，返回 `false`：

    collect([])->isEmpty();

    // true

<a name="method-isnotempty"></a>
#### `isNotEmpty()` {.collection-method}

如果集合不为空，`isNotEmpty` 方法返回 `true`；否则，返回 `false`：

    collect([])->isNotEmpty();

    // false

<a name="method-join"></a>
#### `join()` {.collection-method}

`join` 方法将集合的值与字符串连接起来。使用此方法的第二个参数，你还可以指定最终元素应如何附加到字符串：

    collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
    collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
    collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
    collect(['a'])->join(', ', ' and '); // 'a'
    collect([])->join(', ', ' and '); // ''

<a name="method-keyby"></a>
#### `keyBy()` {.collection-method}

`keyBy` 方法通过给定键对集合进行键控。如果多个项目具有相同的键，则只有最后一个会出现在新集合中：

    $collection = collect([
        ['product_id' => 'prod-100', 'name' => 'Desk'],
        ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $keyed = $collection->keyBy('product_id');

    $keyed->all();

    /*
        [
            'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
            'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
        ]
    */



你也可以将回调传递给该方法。回调应通过以下方式返回值以作为集合的键：

    $keyed = $collection->keyBy(function (array $item, int $key) {
        return strtoupper($item['product_id']);
    });

    $keyed->all();

    /*
        [
            'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
            'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
        ]
    */

<a name="method-keys"></a>
#### `keys()` {.collection-method}

`keys` 方法返回集合的所有键：

    $collection = collect([
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $keys = $collection->keys();

    $keys->all();

    // ['prod-100', 'prod-200']

<a name="method-last"></a>
#### `last()` {.collection-method}

`last` 方法返回集合中通过给定真值测试的最后一个元素：

    collect([1, 2, 3, 4])->last(function (int $value, int $key) {
        return $value < 3;
    });

    // 2

你也可以调用不带参数的`last`方法来获取集合中的最后一个元素。如果集合为空，则返回 `null`：

    collect([1, 2, 3, 4])->last();

    // 4

<a name="method-lazy"></a>
#### `lazy()` {.collection-method}


`lazy` 方法从底层的项目数组中返回一个新的 [`LazyCollection`](#lazy-collections) 实例。

    $lazyCollection = collect([1, 2, 3, 4])->lazy();

    get_class($lazyCollection);

    // Illuminate\Support\LazyCollection

    $lazyCollection->all();

    // [1, 2, 3, 4]

当你需要对一个包含许多项目的巨大 `Collection` 进行转换时，这一点特别有用。

    $count = $hugeCollection
        ->lazy()
        ->where('country', 'FR')
        ->where('balance', '>', '100')
        ->count();

通过将集合转换为 `LazyCollection`，我们避免了分配大量的额外内存。虽然原始集合仍然在内存中保留 _它的_ 值，但后续的过滤器不会。因此，在过滤集合的结果时，几乎没有额外的内存被分配。



<a name="method-macro"></a>
#### `macro()` {.collection-method}

静态`macro()`方法允许你在运行时向「集合」类添加方法。有关详细信息，请参阅有关 [扩展集合](#extending-collections) 的文档。

<a name="method-make"></a>
#### `make()` {.collection-method}

静态 `make` 方法可以创建一个新的集合实例。请参照 [创建集合](#creating-collections) 部分。

<a name="method-map"></a>
#### `map()` {.collection-method}

静态 `make` 方法可以创建一个新的集合实例。请参照 [创建集合](#creating-collections) 部分。

    $collection = collect([1, 2, 3, 4, 5]);

    $multiplied = $collection->map(function (int $item, int $key) {
        return $item * 2;
    });

    $multiplied->all();

    // [2, 4, 6, 8, 10]

> **注意：**与其他大多数集合方法一样， `map` 会返回一个新的集合实例；它不会修改原集合。如果你想修改原集合，请使用 [`transform`](#method-transform) 方法。

<a name="method-mapinto"></a>
#### `mapInto()` {.collection-method}

该 `mapInto()` 方法可以迭代集合，通过将值传递给构造函数来创建给定类的新实例：

    class Currency
    {
        /**
         * Create a new currency instance.
         */
        function __construct(
            public string $code
        ) {}
    }

    $collection = collect(['USD', 'EUR', 'GBP']);

    $currencies = $collection->mapInto(Currency::class);

    $currencies->all();

    // [Currency('USD'), Currency('EUR'), Currency('GBP')]

<a name="method-mapspread"></a>
#### `mapSpread()` {.collection-method}

该 `mapSpread` 方法可以迭代集合，将每个嵌套项值给指定的回调函数。该回调函数可以自由修改该集合项并返回，从而生成被修改过集合项的新集合：

    $collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    $chunks = $collection->chunk(2);

    $sequence = $chunks->mapSpread(function (int $even, int $odd) {
        return $even + $odd;
    });

    $sequence->all();

    // [1, 5, 9, 13, 17]



<a name="method-maptogroups"></a>
#### `mapToGroups()` {.collection-method}

该 `mapToGroups` 方法通过给定的回调函数对集合项进行分组。该回调函数应该返回一个包含单个键 / 值对的关联数组，从而生成一个分组值的新集合：

    $collection = collect([
        [
            'name' => 'John Doe',
            'department' => 'Sales',
        ],
        [
            'name' => 'Jane Doe',
            'department' => 'Sales',
        ],
        [
            'name' => 'Johnny Doe',
            'department' => 'Marketing',
        ]
    ]);

    $grouped = $collection->mapToGroups(function (array $item, int $key) {
        return [$item['department'] => $item['name']];
    });

    $grouped->all();

    /*
        [
            'Sales' => ['John Doe', 'Jane Doe'],
            'Marketing' => ['Johnny Doe'],
        ]
    */

    $grouped->get('Sales')->all();

    // ['John Doe', 'Jane Doe']

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()` {.collection-method}

`mapWithKeys` 方法遍历集合并将每个值传递给给定的回调。回调应返回包含单个键/值对的关联数组：

    $collection = collect([
        [
            'name' => 'John',
            'department' => 'Sales',
            'email' => 'john@example.com',
        ],
        [
            'name' => 'Jane',
            'department' => 'Marketing',
            'email' => 'jane@example.com',
        ]
    ]);

    $keyed = $collection->mapWithKeys(function (array $item, int $key) {
        return [$item['email'] => $item['name']];
    });

    $keyed->all();

    /*
        [
            'john@example.com' => 'John',
            'jane@example.com' => 'Jane',
        ]
    */

<a name="method-max"></a>
#### `max()` {.collection-method}

`max` 方法返回给定键的最大值：

    $max = collect([
        ['foo' => 10],
        ['foo' => 20]
    ])->max('foo');

    // 20

    $max = collect([1, 2, 3, 4, 5])->max();

    // 5

<a name="method-median"></a>
#### `median()` {.collection-method}

`median` 方法返回给定键的 [中值](https://en.wikipedia.org/wiki/Median)：

    $median = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->median('foo');

    // 15

    $median = collect([1, 1, 2, 4])->median();

    // 1.5

<a name="method-merge"></a>
#### `merge()` {.collection-method}

`merge` 方法将给定的数组或集合与原始集合合并。如果给定项目中的字符串键与原始集合中的字符串键匹配，则给定项目的值将覆盖原始集合中的值：

    $collection = collect(['product_id' => 1, 'price' => 100]);

    $merged = $collection->merge(['price' => 200, 'discount' => false]);

    $merged->all();

    // ['product_id' => 1, 'price' => 200, 'discount' => false]



如果给定项目的键是数字，则值将附加到集合的末尾：

    $collection = collect(['Desk', 'Chair']);

    $merged = $collection->merge(['Bookcase', 'Door']);

    $merged->all();

    // ['Desk', 'Chair', 'Bookcase', 'Door']

<a name="method-mergerecursive"></a>
#### `mergeRecursive()` {.collection-method}

`mergeRecursive` 方法将给定的数组或集合递归地与原始集合合并。如果给定项目中的字符串键与原始集合中的字符串键匹配，则这些键的值将合并到一个数组中，这是递归完成的：

    $collection = collect(['product_id' => 1, 'price' => 100]);

    $merged = $collection->mergeRecursive([
        'product_id' => 2,
        'price' => 200,
        'discount' => false
    ]);

    $merged->all();

    // ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]

<a name="method-min"></a>
#### `min()` {.collection-method}

`min` 方法返回给定键的最小值：

    $min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

    // 10

    $min = collect([1, 2, 3, 4, 5])->min();

    // 1

<a name="method-mode"></a>
#### `mode()` {.collection-method}

`mode` 方法返回给定键的 [mode 值](https://en.wikipedia.org/wiki/Mode_(statistics))：

    $mode = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->mode('foo');

    // [10]

    $mode = collect([1, 1, 2, 4])->mode();

    // [1]

    $mode = collect([1, 1, 2, 2])->mode();

    // [1, 2]

<a name="method-nth"></a>
#### `nth()` {.collection-method}

`nth` 方法创建一个由每个第 n 个元素组成的新集合：

    $collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

    $collection->nth(4);

    // ['a', 'e']

你可以选择将起始偏移量作为第二个参数传递：

    $collection->nth(4, 1);

    // ['b', 'f']

<a name="method-only"></a>
#### `only()` {.collection-method}

`only` 方法返回集合中具有指定键的项目：

    $collection = collect([
        'product_id' => 1,
        'name' => 'Desk',
        'price' => 100,
        'discount' => false
    ]);

    $filtered = $collection->only(['product_id', 'name']);

    $filtered->all();

    // ['product_id' => 1, 'name' => 'Desk']



关于 `only` 的反义词，见[except](#method-except) 方法。

> **技巧：**使用 [Eloquent Collections](/docs/laravel/9.x/eloquent-collections#method-only) 时会修改此方法的行为。

<a name="method-pad"></a>
#### `pad()` {.collection-method}

`pad` 方法将用给定的值填充数组，直到数组达到指定的大小。此方法的行为类似于 [array_pad](https://secure.php.net/manual/en/function.array-pad.php) PHP 函数。

要向左填充，你应该指定一个负尺寸。如果给定大小的绝对值小于或等于数组的长度，则不会发生填充：

    $collection = collect(['A', 'B', 'C']);

    $filtered = $collection->pad(5, 0);

    $filtered->all();

    // ['A', 'B', 'C', 0, 0]

    $filtered = $collection->pad(-5, 0);

    $filtered->all();

    // [0, 0, 'A', 'B', 'C']

<a name="method-partition"></a>
#### `partition()` {.collection-method}

该 `partition` 方法可以与 PHP 数组解构相结合，以将通过给定真值测试的元素与未通过的元素分开：

    $collection = collect([1, 2, 3, 4, 5, 6]);

    [$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
        return $i < 3;
    });

    $underThree->all();

    // [1, 2]

    $equalOrAboveThree->all();

    // [3, 4, 5, 6]

<a name="method-pipe"></a>
#### `pipe()` {.collection-method}

该 `pipe` 可以把集合放到回调参数中并返回回调的结果：

    $collection = collect([1, 2, 3]);

    $piped = $collection->pipe(function (Collection $collection) {
        return $collection->sum();
    });

    // 6

<a name="method-pipeinto"></a>
#### `pipeInto()` {.collection-method}

该 `pipeInto` 方法创建一个给定类的新实例，并将集合传递给构造函数：

    class ResourceCollection
    {
        /**
         * Create a new ResourceCollection instance.
         */
        public function __construct(
          public Collection $collection,
        ) {}
    }

    $collection = collect([1, 2, 3]);

    $resource = $collection->pipeInto(ResourceCollection::class);

    $resource->collection->all();

    // [1, 2, 3]

<a name="method-pipethrough"></a>


#### `pipeThrough()` {.collection-method}

该 `pipeThrough` 方法将集合传递给给定的闭包数组并返回执行的闭包的结果：

    use Illuminate\Support\Collection;

    $collection = collect([1, 2, 3]);

    $result = $collection->pipeThrough([
        function (Collection $collection) {
            return $collection->merge([4, 5]);
        },
        function (Collection $collection) {
            return $collection->sum();
        },
    ]);

    // 15

<a name="method-pluck"></a>
#### `pluck()` {.collection-method}

该 `pluck` 可以获取集合中指定键对应的所有值：

    $collection = collect([
        ['product_id' => 'prod-100', 'name' => 'Desk'],
        ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $plucked = $collection->pluck('name');

    $plucked->all();

    // ['Desk', 'Chair']

你也可以通过传入第二个参数来指定生成集合的 key（键）：

    $plucked = $collection->pluck('name', 'product_id');

    $plucked->all();

    // ['prod-100' => 'Desk', 'prod-200' => 'Chair']

该 `pluck` 也支持利用「.」标记的方法取出多维数组的键值：

    $collection = collect([
        [
            'name' => 'Laracon',
            'speakers' => [
                'first_day' => ['Rosa', 'Judith'],
            ],
        ],
        [
            'name' => 'VueConf',
            'speakers' => [
                'first_day' => ['Abigail', 'Joey'],
            ],
        ],
    ]);

    $plucked = $collection->pluck('speakers.first_day');

    $plucked->all();

    // [['Rosa', 'Judith'], ['Abigail', 'Joey']]

如果存在重复键，则将最后一个匹配元素插入到 plucked 集合中：

    $collection = collect([
        ['brand' => 'Tesla',  'color' => 'red'],
        ['brand' => 'Pagani', 'color' => 'white'],
        ['brand' => 'Tesla',  'color' => 'black'],
        ['brand' => 'Pagani', 'color' => 'orange'],
    ]);

    $plucked = $collection->pluck('color', 'brand');

    $plucked->all();

    // ['Tesla' => 'black', 'Pagani' => 'orange']

<a name="method-pop"></a>
#### `pop()` {.collection-method}

`pop` 方法删除并返回集合中的最后一项：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->pop();

    // 5

    $collection->all();

    // [1, 2, 3, 4]

你可以将整数传递给 `pop` 方法以从集合末尾删除并返回多个项目：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->pop(3);

    // collect([5, 4, 3])

    $collection->all();

    // [1, 2]

<a name="method-prepend"></a>
#### `prepend()` {.collection-method}



`prepend` 方法将一个项目添加到集合的开头：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->prepend(0);

    $collection->all();

    // [0, 1, 2, 3, 4, 5]

你还可以传递第二个参数来指定前置项的键：

    $collection = collect(['one' => 1, 'two' => 2]);

    $collection->prepend(0, 'zero');

    $collection->all();

    // ['zero' => 0, 'one' => 1, 'two' => 2]

<a name="method-pull"></a>
#### `pull()` {.collection-method}

`pull` 方法通过它的键从集合中移除并返回一个项目：

    $collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

    $collection->pull('name');

    // 'Desk'

    $collection->all();

    // ['product_id' => 'prod-100']

<a name="method-push"></a>
#### `push()` {.collection-method}

`push` 方法将一个项目附加到集合的末尾：

    $collection = collect([1, 2, 3, 4]);

    $collection->push(5);

    $collection->all();

    // [1, 2, 3, 4, 5]

<a name="method-put"></a>
#### `put()` {.collection-method}

`put` 方法在集合中设置给定的键和值：

    $collection = collect(['product_id' => 1, 'name' => 'Desk']);

    $collection->put('price', 100);

    $collection->all();

    // ['product_id' => 1, 'name' => 'Desk', 'price' => 100]

<a name="method-random"></a>
#### `random()` {.collection-method}

`random` 方法从集合中返回一个随机项：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->random();

    // 4 - (retrieved randomly)

你可以将一个整数传递给 `random`，以指定要随机检索的项目数。当明确传递你希望接收的项目数时，始终返回项目集合：

    $random = $collection->random(3);

    $random->all();

    // [2, 4, 5] - (retrieved randomly)

如果集合实例的项目少于请求的项目，则 `random` 方法将抛出 `InvalidArgumentException`。

`random` 方法也接受一个闭包，它将接收当前集合实例。

    use Illuminate\Support\Collection;

    $random = $collection->random(fn (Collection $items) => min(10, count($items)));

    $random->all();

    // [1, 2, 3, 4, 5] - (retrieved randomly)



<a name="method-range"></a>
#### `range()` {.collection-method}

`range` 方法返回一个包含指定范围之间整数的集合：

    $collection = collect()->range(3, 6);

    $collection->all();

    // [3, 4, 5, 6]

<a name="method-reduce"></a>
#### `reduce()` {.collection-method}

`reduce` 方法将集合减少为单个值，将每次迭代的结果传递给后续迭代：

    $collection = collect([1, 2, 3]);

    $total = $collection->reduce(function (int $carry, int $item) {
        return $carry + $item;
    });

    // 6

`$carry` 在第一次迭代时的值为 `null`；但是，你可以通过将第二个参数传递给 `reduce` 来指定其初始值：

    $collection->reduce(function (int $carry, int $item) {
        return $carry + $item;
    }, 4);

    // 10

`reduce` 方法还将关联集合中的数组键传递给给定的回调：

    $collection = collect([
        'usd' => 1400,
        'gbp' => 1200,
        'eur' => 1000,
    ]);

    $ratio = [
        'usd' => 1,
        'gbp' => 1.37,
        'eur' => 1.22,
    ];

    $collection->reduce(function (int $carry, int $value, int $key) use ($ratio) {
        return $carry + ($value * $ratio[$key]);
    });

    // 4264

<a name="method-reduce-spread"></a>
#### `reduceSpread()` {.collection-method}

`reduceSpread` 方法将集合缩减为一个值数组，将每次迭代的结果传递给后续迭代。此方法类似于 `reduce` 方法；但是，它可以接受多个初始值：

    [$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
        ->get()
        ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
            if ($creditsRemaining >= $image->creditsRequired()) {
                $batch->push($image);

                $creditsRemaining -= $image->creditsRequired();
            }

            return [$creditsRemaining, $batch];
        }, $creditsAvailable, collect());

<a name="method-reject"></a>
#### `reject()` {.collection-method}

`reject` 方法使用给定的闭包过滤集合。如果应从结果集合中删除项目，则闭包应返回 `true`：

    $collection = collect([1, 2, 3, 4]);

    $filtered = $collection->reject(function (int $value, int $key) {
        return $value > 2;
    });

    $filtered->all();

    // [1, 2]



对于 `reject` 方法的逆操作，请参见 [`filter`](#method-filter) 方法。

<a name="method-replace"></a>
#### `replace()` {.collection-method}



    $collection = collect(['Taylor', 'Abigail', 'James']);

    $replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

    $replaced->all();

    // ['Taylor', 'Victoria', 'James', 'Finn']

<a name="method-replacerecursive"></a>
#### `replaceRecursive()` {.collection-method}

此方法的工作方式类似于 `replace`，但它会重复出现在数组中并对内部值应用相同的替换过程：

    $collection = collect([
        'Taylor',
        'Abigail',
        [
            'James',
            'Victoria',
            'Finn'
        ]
    ]);

    $replaced = $collection->replaceRecursive([
        'Charlie',
        2 => [1 => 'King']
    ]);

    $replaced->all();

    // ['Charlie', 'Abigail', ['James', 'King', 'Finn']]

<a name="method-reverse"></a>
#### `reverse()` {.collection-method}

`reverse` 方法反转集合项的顺序，保留原始键：

    $collection = collect(['a', 'b', 'c', 'd', 'e']);

    $reversed = $collection->reverse();

    $reversed->all();

    /*
        [
            4 => 'e',
            3 => 'd',
            2 => 'c',
            1 => 'b',
            0 => 'a',
        ]
    */

<a name="method-search"></a>
#### `search()` {.collection-method}

`search` 方法在集合中搜索给定值，如果找到则返回其键。如果未找到该项目，则返回 `false`：

    $collection = collect([2, 4, 6, 8]);

    $collection->search(4);

    // 1

搜索是使用「松散」比较完成的，这意味着具有整数值的字符串将被视为等于具有相同值的整数。要使用「严格」比较，请将 `true` 作为第二个参数传递给方法：

    collect([2, 4, 6, 8])->search('4', $strict = true);

    // false

或者，你可以提供自己的闭包来搜索通过给定真值测试的第一个项目：

    collect([2, 4, 6, 8])->search(function (int $item, int $key) {
        return $item > 5;
    });

    // 2



<a name="method-shift"></a>
#### `shift()` {.collection-method}

`shift` 方法从集合中移除并返回第一项：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->shift();

    // 1

    $collection->all();

    // [2, 3, 4, 5]

你可以将整数传递给 `shift` 方法以从集合的开头删除并返回多个项目：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->shift(3);

    // collect([1, 2, 3])

    $collection->all();

    // [4, 5]

<a name="method-shuffle"></a>
#### `shuffle()` {.collection-method}

`shuffle` 方法随机打乱集合中的项目：

    $collection = collect([1, 2, 3, 4, 5]);

    $shuffled = $collection->shuffle();

    $shuffled->all();

    // [3, 2, 5, 1, 4] - (generated randomly)

<a name="method-skip"></a>
#### `skip()` {.collection-method}

`skip` 方法返回一个新的集合，并从集合的开始删除指定数量的元素。

    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $collection = $collection->skip(4);

    $collection->all();

    // [5, 6, 7, 8, 9, 10]

<a name="method-skipuntil"></a>
#### `skipUntil()` {.collection-method}

`skipUntil` 方法跳过集合中的项目，直到给定的回调返回 `true`，然后将集合中的剩余项目作为新的集合实例返回：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipUntil(function (int $item) {
        return $item >= 3;
    });

    $subset->all();

    // [3, 4]

你还可以将一个简单的值传递给 `skipUntil` 方法以跳过所有项目，直到找到给定值：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipUntil(3);

    $subset->all();

    // [3, 4]

> **注意：**如果没有找到给定的值或者回调从未返回 `true`，`skipUntil` 方法将返回一个空集合。

<a name="method-skipwhile"></a>
#### `skipWhile()` {.collection-method}

`skipWhile` 方法在给定回调返回 `true` 时跳过集合中的项目，然后将集合中的剩余项目作为新集合返回：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipWhile(function (int $item) {
        return $item <= 3;
    });

    $subset->all();

    // [4]

> **注意：**如果回调从未返回 `false`，`skipWhile` 方法将返回一个空集合。



<a name="method-slice"></a>
#### `slice()` {.collection-method}

`slice` 方法返回从给定索引开始的集合的一个片断。

    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $slice = $collection->slice(4);

    $slice->all();

    // [5, 6, 7, 8, 9, 10]

如果你想限制返回切片的大小，请将所需的大小作为第二个参数传给该方法。

    $slice = $collection->slice(4, 2);

    $slice->all();

    // [5, 6]

返回的切片将默认保留键值。如果你不希望保留原始键，你可以使用 [`values`](#method-values) 方法来重新索引它们。

<a name="method-sliding"></a>
#### `sliding()` {.collection-method}

`sliding` 方法返回一个新的块集合，表示集合中项目的「滑动窗口」视图：

    $collection = collect([1, 2, 3, 4, 5]);

    $chunks = $collection->sliding(2);

    $chunks->toArray();

    // [[1, 2], [2, 3], [3, 4], [4, 5]]

这与 [`eachSpread`](#method-eachspread) 方法结合使用特别有用：

    $transactions->sliding(2)->eachSpread(function (Collection $previous, Collection $current) {
        $current->total = $previous->total + $current->amount;
    });

你可以选择传递第二个「步长」值，该值确定每个块的第一项之间的距离：

    $collection = collect([1, 2, 3, 4, 5]);

    $chunks = $collection->sliding(3, step: 2);

    $chunks->toArray();

    // [[1, 2, 3], [3, 4, 5]]

<a name="method-sole"></a>
#### `sole()` {.collection-method}

`sole` 方法返回集合中第一个通过给定真值测试的元素，但只有在真值测试正好匹配一个元素的情况下。

    collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
        return $value === 2;
    });

    // 2

你也可以向 `sole` 方法传递一个键/值对，它将返回集合中第一个与给定对相匹配的元素，但只有当它正好有一个元素相匹配时。

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->sole('product', 'Chair');

    // ['product' => 'Chair', 'price' => 100]



另外，如果只有一个元素，你也可以调用没有参数的 `sole` 方法来获得集合中的第一个元素。

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
    ]);

    $collection->sole();

    // ['product' => 'Desk', 'price' => 200]

如果集合中没有应该由 `sole` 方法返回的元素，则会抛出 `\Illuminate\Collections\ItemNotFoundException` 异常。如果应该返回多个元素，则会抛出 `\Illuminate\Collections\MultipleItemsFoundException`。

<a name="method-some"></a>
#### `some()` {.collection-method}

[`contains`](#method-contains) 方法的别名。

<a name="method-sort"></a>
#### `sort()` {.collection-method}

`sort` 方法对集合进行排序。排序后的集合保留了原始数组键，因此在下面的示例中，我们将使用 [`values`](#method-values) 方法将键重置为连续编号的索引：

    $collection = collect([5, 3, 1, 2, 4]);

    $sorted = $collection->sort();

    $sorted->values()->all();

    // [1, 2, 3, 4, 5]

如果你的排序需求更高级，你可以使用自己的算法将回调传递给「排序」。参考 PHP 文档[`uasort`](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters)，就是集合的`sort`方法 调用内部使用。

> **技巧：**如果你需要对嵌套数组或对象的集合进行排序，请参阅 [`sortBy`](#method-sortby) 和 [`sortByDesc`](#method-sortbydesc) 方法。

<a name="method-sortby"></a>
#### `sortBy()` {.collection-method}

`sortBy` 方法按给定键对集合进行排序。排序后的集合保留了原始数组键，因此在下面的示例中，我们将使用 [`values`](#method-values) 方法将键重置为连续编号的索引：

    $collection = collect([
        ['name' => 'Desk', 'price' => 200],
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
    ]);

    $sorted = $collection->sortBy('price');

    $sorted->values()->all();

    /*
        [
            ['name' => 'Chair', 'price' => 100],
            ['name' => 'Bookcase', 'price' => 150],
            ['name' => 'Desk', 'price' => 200],
        ]
    */



`sortBy` 方法接受 [sort flags](https://www.php.net/manual/en/function.sort.php) 作为其第二个参数：

    $collection = collect([
        ['title' => 'Item 1'],
        ['title' => 'Item 12'],
        ['title' => 'Item 3'],
    ]);

    $sorted = $collection->sortBy('title', SORT_NATURAL);

    $sorted->values()->all();

    /*
        [
            ['title' => 'Item 1'],
            ['title' => 'Item 3'],
            ['title' => 'Item 12'],
        ]
    */

或者，你可以传递自己的闭包来确定如何对集合的值进行排序：

    $collection = collect([
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]);

    $sorted = $collection->sortBy(function (array $product, int $key) {
        return count($product['colors']);
    });

    $sorted->values()->all();

    /*
        [
            ['name' => 'Chair', 'colors' => ['Black']],
            ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
            ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
        ]
    */

如果你想按多个属性对集合进行排序，可以将排序操作数组传递给 `sortBy` 方法。每个排序操作都应该是一个数组，由你希望排序的属性和所需排序的方向组成：

    $collection = collect([
        ['name' => 'Taylor Otwell', 'age' => 34],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Abigail Otwell', 'age' => 32],
    ]);

    $sorted = $collection->sortBy([
        ['name', 'asc'],
        ['age', 'desc'],
    ]);

    $sorted->values()->all();

    /*
        [
            ['name' => 'Abigail Otwell', 'age' => 32],
            ['name' => 'Abigail Otwell', 'age' => 30],
            ['name' => 'Taylor Otwell', 'age' => 36],
            ['name' => 'Taylor Otwell', 'age' => 34],
        ]
    */

当按多个属性对集合进行排序时，你还可以提供定义每个排序操作的闭包：

    $collection = collect([
        ['name' => 'Taylor Otwell', 'age' => 34],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Abigail Otwell', 'age' => 32],
    ]);

    $sorted = $collection->sortBy([
        fn (array $a, array $b) => $a['name'] <=> $b['name'],
        fn (array $a, array $b) => $b['age'] <=> $a['age'],
    ]);

    $sorted->values()->all();

    /*
        [
            ['name' => 'Abigail Otwell', 'age' => 32],
            ['name' => 'Abigail Otwell', 'age' => 30],
            ['name' => 'Taylor Otwell', 'age' => 36],
            ['name' => 'Taylor Otwell', 'age' => 34],
        ]
    */



<a name="method-sortbydesc"></a>
#### `sortByDesc()` {.collection-method}

此方法与 [`sortBy`](#method-sortby) 方法具有相同的签名，但将以相反的顺序对集合进行排序。

<a name="method-sortdesc"></a>
#### `sortDesc()` {.collection-method}

此方法将按照与 [`sort`](#method-sort) 方法相反的顺序对集合进行排序：

    $collection = collect([5, 3, 1, 2, 4]);

    $sorted = $collection->sortDesc();

    $sorted->values()->all();

    // [5, 4, 3, 2, 1]

与 `sort` 不同，你不能将闭包传递给 `sortDesc`。相反，你应该使用 [`sort`](#method-sort) 方法并反转比较。

<a name="method-sortkeys"></a>
#### `sortKeys()` {.collection-method}

`sortKeys` 方法通过底层关联数组的键对集合进行排序：

    $collection = collect([
        'id' => 22345,
        'first' => 'John',
        'last' => 'Doe',
    ]);

    $sorted = $collection->sortKeys();

    $sorted->all();

    /*
        [
            'first' => 'John',
            'id' => 22345,
            'last' => 'Doe',
        ]
    */

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()` {.collection-method}

此方法与 [`sortKeys`](#method-sortkeys) 方法具有相同的签名，但将以相反的顺序对集合进行排序。

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()` {.collection-method}

`sortKeysUsing` 方法使用回调通过底层关联数组的键对集合进行排序：

    $collection = collect([
        'ID' => 22345,
        'first' => 'John',
        'last' => 'Doe',
    ]);

    $sorted = $collection->sortKeysUsing('strnatcasecmp');

    $sorted->all();

    /*
        [
            'first' => 'John',
            'ID' => 22345,
            'last' => 'Doe',
        ]
    */

回调必须是返回小于、等于或大于零的整数的比较函数。有关更多信息，请参阅 [`uksort`](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters) 上的 PHP 文档，这是 PHP 函数 `sortKeysUsing` 方法在内部使用。

<a name="method-splice"></a>
#### `splice()` {.collection-method}

`splice` 方法删除并返回从指定索引开始的项目切片：

    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2);

    $chunk->all();

    // [3, 4, 5]

    $collection->all();

    // [1, 2]



你可以传递第二个参数来限制结果集合的大小：

    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2, 1);

    $chunk->all();

    // [3]

    $collection->all();

    // [1, 2, 4, 5]

此外，你可以传递包含新项目的第三个参数来替换从集合中删除的项目：

    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2, 1, [10, 11]);

    $chunk->all();

    // [3]

    $collection->all();

    // [1, 2, 10, 11, 4, 5]

<a name="method-split"></a>
#### `split()` {.collection-method}

`split` 方法将集合分成给定数量的组：

    $collection = collect([1, 2, 3, 4, 5]);

    $groups = $collection->split(3);

    $groups->all();

    // [[1, 2], [3, 4], [5]]

<a name="method-splitin"></a>
#### `splitIn()` {.collection-method}

`splitIn` 方法将集合分成给定数量的组，在将剩余部分分配给最终组之前完全填充非终端组：

    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $groups = $collection->splitIn(3);

    $groups->all();

    // [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]

<a name="method-sum"></a>
#### `sum()` {.collection-method}

`sum` 方法返回集合中所有项目的总和：

    collect([1, 2, 3, 4, 5])->sum();

    // 15

如果集合包含嵌套数组或对象，则应传递一个键，用于确定要对哪些值求和：

    $collection = collect([
        ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
        ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
    ]);

    $collection->sum('pages');

    // 1272

此外，你可以传递自己的闭包来确定要对集合的哪些值求和：

    $collection = collect([
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]);

    $collection->sum(function (array $product) {
        return count($product['colors']);
    });

    // 6

<a name="method-take"></a>
#### `take()` {.collection-method}

`take` 方法返回一个具有指定数量项目的新集合：

    $collection = collect([0, 1, 2, 3, 4, 5]);

    $chunk = $collection->take(3);

    $chunk->all();

    // [0, 1, 2]

你还可以传递一个负整数以从集合末尾获取指定数量的项目：

    $collection = collect([0, 1, 2, 3, 4, 5]);

    $chunk = $collection->take(-2);

    $chunk->all();

    // [4, 5]



<a name="method-takeuntil"></a>
#### `takeUntil()` {.collection-method}

`takeUntil` 方法返回集合中的项目，直到给定的回调返回 `true`：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeUntil(function (int $item) {
        return $item >= 3;
    });

    $subset->all();

    // [1, 2]

你还可以将一个简单的值传递给 `takeUntil` 方法以获取项目，直到找到给定值：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeUntil(3);

    $subset->all();

    // [1, 2]

> **注意：**如果未找到给定值或回调从未返回 `true`，则 `takeUntil` 方法将返回集合中的所有项目。

<a name="method-takewhile"></a>
#### `takeWhile()` {.collection-method}

`takeWhile` 方法返回集合中的项目，直到给定的回调返回 `false`：

    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeWhile(function (int $item) {
        return $item < 3;
    });

    $subset->all();

    // [1, 2]

> **注意：**如果回调从不返回 `false`，则 `takeWhile` 方法将返回集合中的所有项目。

<a name="method-tap"></a>
#### `tap()` {.collection-method}

`tap` 方法将集合传递给给定的回调，允许你在特定点「点击」到集合中并在不影响集合本身的情况下对项目执行某些操作。然后集合由 `tap` 方法返回：

    collect([2, 4, 3, 1, 5])
        ->sort()
        ->tap(function (Collection $collection) {
            Log::debug('Values after sorting', $collection->values()->all());
        })
        ->shift();

    // 1

<a name="method-times"></a>
#### `times()` {.collection-method}

静态 `times` 方法通过调用给定次数的回调函数来创建新集合：

    $collection = Collection::times(10, function (int $number) {
        return $number * 9;
    });

    $collection->all();

    // [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]

<a name="method-toarray"></a>
#### `toArray()` {.collection-method}

该 `toArray` 方法将集合转换成 PHP `array`。如果集合的值是 [Eloquent](/docs/laravel/10.x/eloquent) 模型，那也会被转换成数组：

    $collection = collect(['name' => 'Desk', 'price' => 200]);

    $collection->toArray();

    /*
        [
            ['name' => 'Desk', 'price' => 200],
        ]
    */

> **注意：**`toArray` 也会将 `Arrayable` 的实例、所有集合的嵌套对象转换为数组。如果你想获取原数组，可以使用 [`all`](#method-all) 方法。


<a name="method-tojson"></a>
#### `toJson()` {.collection-method}

该 `toJson` 方法将集合转换成 JSON 字符串：

    $collection = collect(['name' => 'Desk', 'price' => 200]);

    $collection->toJson();

    // '{"name":"Desk", "price":200}'

<a name="method-transform"></a>
#### `transform()` {.collection-method}

该 `transform` 方法会遍历整个集合，并对集合中的每个元素都会调用其回调函数。集合中的元素将被替换为回调函数返回的值：

    $collection = collect([1, 2, 3, 4, 5]);

    $collection->transform(function (int $item, int $key) {
        return $item * 2;
    });

    $collection->all();

    // [2, 4, 6, 8, 10]

> **注意：**与大多数集合方法不同，`transform` 会修改集合本身。如果你想创建新集合，可以使用 [`map`](#method-map) 方法。

<a name="method-undot"></a>
#### `undot()` {.collection-method}

`undot()` 方法将使用「点」表示法的一维集合扩展为多维集合：

    $person = collect([
        'name.first_name' => 'Marie',
        'name.last_name' => 'Valentine',
        'address.line_1' => '2992 Eagle Drive',
        'address.line_2' => '',
        'address.suburb' => 'Detroit',
        'address.state' => 'MI',
        'address.postcode' => '48219'
    ]);

    $person = $person->undot();

    $person->toArray();

    /*
        [
            "name" => [
                "first_name" => "Marie",
                "last_name" => "Valentine",
            ],
            "address" => [
                "line_1" => "2992 Eagle Drive",
                "line_2" => "",
                "suburb" => "Detroit",
                "state" => "MI",
                "postcode" => "48219",
            ],
        ]
    */

<a name="method-union"></a>
#### `union()` {.collection-method}

该 `union` 方法将给定数组添加到集合中。如果给定的数组含有与原集合一样的键，则首选原始集合的值：

    $collection = collect([1 => ['a'], 2 => ['b']]);

    $union = $collection->union([3 => ['c'], 1 => ['d']]);

    $union->all();

    // [1 => ['a'], 2 => ['b'], 3 => ['c']]

<a name="method-unique"></a>
#### `unique()` {.collection-method}

该 `unique` 方法返回集合中所有唯一项。返回的集合保留着原数组的键，所以在这个例子中，我们使用 [`values`](#method-values) 方法把键重置为连续编号的索引：

    $collection = collect([1, 1, 2, 2, 3, 4, 2]);

    $unique = $collection->unique();

    $unique->values()->all();

    // [1, 2, 3, 4]



当处理嵌套数组或对象时，你可以指定用于确定唯一性的键：

    $collection = collect([
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]);

    $unique = $collection->unique('brand');

    $unique->values()->all();

    /*
        [
            ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
            ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ]
    */

最后，你还可以将自己的闭包传递给该 `unique` 方法，以指定哪个值应确定项目的唯一性：

    $unique = $collection->unique(function (array $item) {
        return $item['brand'].$item['type'];
    });

    $unique->values()->all();

    /*
        [
            ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
            ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
            ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
            ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
        ]
    */

该 `unique` 方法在检查项目值时使用「宽松」模式比较，意味着具有整数值的字符串将被视为等于相同值的整数。你可以使用  [`uniqueStrict`](#method-uniquestrict)  方法做「严格」模式比较。

> **技巧：**这个方法的行为在使用 [Eloquent 集合](/docs/laravel/10.x/eloquent-collections#method-unique) 时被修改。

<a name="method-uniquestrict"></a>
#### `uniqueStrict()` {.collection-method}

这个方法与 [`unique`](#method-unique) 方法一样，然而，所有的值是用「严格」模式来比较的。

<a name="method-unless"></a>
#### `unless()` {.collection-method}

该 `unless` 方法当传入的第一个参数不为 `true` 的时候，将执行给定的回调函数：

    $collection = collect([1, 2, 3]);

    $collection->unless(true, function (Collection $collection) {
        return $collection->push(4);
    });

    $collection->unless(false, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]



可以将第二个回调传递给该 `unless` 方法。 `unless` 当给方法的第一个参数计算结果为时，将执行第二个回调 `true`:

    $collection = collect([1, 2, 3]);

    $collection->unless(true, function (Collection $collection) {
        return $collection->push(4);
    }, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]

与 `unless` 相反的，请参见 [`when`](#method-when) 方法。

<a name="method-unlessempty"></a>
#### `unlessEmpty()` {.collection-method}

[`whenNotEmpty`](#method-whennotempty) 的别名方法。

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {.collection-method}

[`whenEmpty`](#method-whenempty) 的别名方法。

<a name="method-unwrap"></a>
#### `unwrap()` {.collection-method}

静态 `unwrap` 方法返回集合内部的可用元素：

    Collection::unwrap(collect('John Doe'));

    // ['John Doe']

    Collection::unwrap(['John Doe']);

    // ['John Doe']

    Collection::unwrap('John Doe');

    // 'John Doe'

<a name="method-value"></a>
#### `value()` {.collection-method}

`value` 方法从集合的第一个元素中检索一个给定的值。

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Speaker', 'price' => 400],
    ]);

    $value = $collection->value('price');

    // 200

<a name="method-values"></a>
#### `values()` {.collection-method}

该 `values` 方法返回键被重置为连续编号的新集合：

    $collection = collect([
        10 => ['product' => 'Desk', 'price' => 200],
        11 => ['product' => 'Desk', 'price' => 200],
    ]);

    $values = $collection->values();

    $values->all();

    /*
        [
            0 => ['product' => 'Desk', 'price' => 200],
            1 => ['product' => 'Desk', 'price' => 200],
        ]
    */

<a name="method-when"></a>
#### `when()` {.collection-method}

当 `when` 方法的第一个参数传入为 `true` 时，将执行给定的回调函数。
集合实例和给到 `when` 方法的第一个参数将被提供给闭包。

    $collection = collect([1, 2, 3]);

    $collection->when(true, function (Collection $collection, int $value) {
        return $collection->push(4);
    });

    $collection->when(false, function (Collection $collection, int $value) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 4]



可以将第二个回调传递给该 `when` 方法。当给 `when` 方法的第一个参数计算结果为 `false` 时，将执行第二个回调：

    $collection = collect([1, 2, 3]);

    $collection->when(false, function (Collection $collection, int $value) {
        return $collection->push(4);
    }, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]

与 `when` 相反的方法，请查看 [`unless`](#method-unless) 方法。

<a name="method-whenempty"></a>
#### `whenEmpty()` {.collection-method}

该 `whenEmpty` 方法是当集合为空时，将执行给定的回调函数：

    $collection = collect(['Michael', 'Tom']);

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    });

    $collection->all();

    // ['Michael', 'Tom']


    $collection = collect();

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    });

    $collection->all();

    // ['Adam']

当集合不为空时，可以将第二个闭包传递给 `whenEmpty` 将要执行的方法：

    $collection = collect(['Michael', 'Tom']);

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    }, function (Collection $collection) {
        return $collection->push('Taylor');
    });

    $collection->all();

    // ['Michael', 'Tom', 'Taylor']

与 `whenEmpty` 相反的方法，请查看 [`whenNotEmpty`](#method-whennotempty) 方法。

<a name="method-whennotempty"></a>
#### `whenNotEmpty()` {.collection-method}

该 `whenNotEmpty` 方法当集合不为空时，将执行给定的回调函数：

    $collection = collect(['michael', 'tom']);

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    });

    $collection->all();

    // ['michael', 'tom', 'adam']


    $collection = collect();

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    });

    $collection->all();

    // []

可以将第二个闭包传递给 `whenNotEmpty` 将在集合为空时执行的方法：

    $collection = collect();

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    }, function (Collection $collection) {
        return $collection->push('taylor');
    });

    $collection->all();

    // ['taylor']



与 `whenNotEmpty` 相反的方法，请查看 [`whenEmpty`](#method-whenempty) 方法。

<a name="method-where"></a>
#### `where()` {.collection-method}

该 `where` 方法通过给定的键 / 值对查询过滤集合的结果：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->where('price', 100);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 100],
            ['product' => 'Door', 'price' => 100],
        ]
    */

该 `where` 方法在检查集合项值时使用「宽松」模式比较，这意味着具有整数值的字符串会被认为等于相同值的整数。你可以使用 [`whereStrict`](#method-wherestrict) 方法进行「严格」模式比较。

而且，你还可以将一个比较运算符作为第二个参数传递。
支持的运算符是有 '===', '！==', '！=', '==', '=', '<>', '>', '<', '>=', 和 '<='。

    $collection = collect([
        ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
        ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
        ['name' => 'Sue', 'deleted_at' => null],
    ]);

    $filtered = $collection->where('deleted_at', '!=', null);

    $filtered->all();

    /*
        [
            ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
            ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
        ]
    */

<a name="method-wherestrict"></a>
#### `whereStrict()` {.collection-method}

此方法和 [`where`](#method-where) 方法使用相似；但是它是「严格」模式去匹配值和类型。

<a name="method-wherebetween"></a>
#### `whereBetween()` {.collection-method}

该 `whereBetween` 方法会筛选给定范围的集合：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Pencil', 'price' => 30],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereBetween('price', [100, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Desk', 'price' => 200],
            ['product' => 'Bookcase', 'price' => 150],
            ['product' => 'Door', 'price' => 100],
        ]
    */



<a name="method-wherein"></a>
#### `whereIn()` {.collection-method}

该 `whereIn` 方法会根据包含给定数组的键 / 值对来过滤集合：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereIn('price', [150, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Desk', 'price' => 200],
            ['product' => 'Bookcase', 'price' => 150],
        ]
    */

`whereIn` 方法在检查项目值时使用 "loose" 比较，这意味着具有整数值的字符串将被视为等于相同值的整数。使用 [`whereInStrict`](#method-whereinstrict) 方法使用「strict」比较进行过滤。

<a name="method-whereinstrict"></a>
#### `whereInStrict()` {.collection-method}

此方法与 [`whereIn`](#method-wherein) 方法具有相同的签名；但是，所有值都使用「strict」比较进行比较。

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()` {.collection-method}

`whereInstanceOf` 方法按给定的类类型过滤集合：

    use App\Models\User;
    use App\Models\Post;

    $collection = collect([
        new User,
        new User,
        new Post,
    ]);

    $filtered = $collection->whereInstanceOf(User::class);

    $filtered->all();

    // [App\Models\User, App\Models\User]

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()` {.collection-method}

`whereNotBetween` 方法通过确定指定项的值是否超出给定范围来过滤集合：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Pencil', 'price' => 30],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereNotBetween('price', [100, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 80],
            ['product' => 'Pencil', 'price' => 30],
        ]
    */

<a name="method-wherenotin"></a>
#### `whereNotIn()` {.collection-method}

`whereNotIn` 方法从集合中删除具有给定数组中包含的指定项值的元素：

    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereNotIn('price', [150, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 100],
            ['product' => 'Door', 'price' => 100],
        ]
    */



`whereNotIn` 方法在检查项目值时使用「loose」比较，这意味着具有整数值的字符串将被视为等于具有相同值的整数。使用 [`whereNotInStrict`](#method-wherenotinstrict) 方法使用「strict」比较进行过滤。

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {.collection-method}

这个方法与 [`whereNotIn`](#method-wherenotin) 方法类似；不同的是会使用「严格」模式比较。

<a name="method-wherenotnull"></a>
#### `whereNotNull()` {.collection-method}

该 `whereNotNull` 方法筛选给定键不为 `null`的项：

    $collection = collect([
        ['name' => 'Desk'],
        ['name' => null],
        ['name' => 'Bookcase'],
    ]);

    $filtered = $collection->whereNotNull('name');

    $filtered->all();

    /*
        [
            ['name' => 'Desk'],
            ['name' => 'Bookcase'],
        ]
    */

<a name="method-wherenull"></a>
#### `whereNull()` {.collection-method}

该 `whereNull` 方法筛选给定键为 `null`的项：

    $collection = collect([
        ['name' => 'Desk'],
        ['name' => null],
        ['name' => 'Bookcase'],
    ]);

    $filtered = $collection->whereNull('name');

    $filtered->all();

    /*
        [
            ['name' => null],
        ]
    */


<a name="method-wrap"></a>
#### `wrap()` {.collection-method}

静态 `wrap` 方法会将给定值封装到集合中：

    use Illuminate\Support\Collection;

    $collection = Collection::wrap('John Doe');

    $collection->all();

    // ['John Doe']

    $collection = Collection::wrap(['John Doe']);

    $collection->all();

    // ['John Doe']

    $collection = Collection::wrap(collect('John Doe'));

    $collection->all();

    // ['John Doe']

<a name="method-zip"></a>
#### `zip()` {.collection-method}

该 `zip` 方法在与集合的值对应的索引处合并给定数组的值：

    $collection = collect(['Chair', 'Desk']);

    $zipped = $collection->zip([100, 200]);

    $zipped->all();

    // [['Chair', 100], ['Desk', 200]]

<a name="higher-order-messages"></a>
## Higher Order Messages

集合也提供对「高阶消息传递」的支持，即集合常见操作的快捷方式。支持高阶消息传递的集合方法有： [`average`](#method-average)、[`avg`](#method-avg)、[`contains`](#method-contains)、[`each`](#method-each)、[`every`](#method-every)、[`filter`](#method-filter)、[`first`](#method-first)、[`flatMap`](#method-flatmap)、[`groupBy`](#method-groupby)、[`keyBy`](#method-keyby)、[`map`](#method-map)、[`max`](#method-max)、[`min`](#method-min)、[`partition`](#method-partition)、[`reject`](#method-reject)、[`skipUntil`](#method-skipuntil)、[`skipWhile`](#method-skipwhile)、[`some`](#method-some)、[`sortBy`](#method-sortby)、[`sortByDesc`](#method-sortbydesc)、[`sum`](#method-sum)、[`takeUntil`](#method-takeuntil)、[`takeWhile`](#method-takeewhile) 和 [`unique`](#method-unique)。


每个高阶消息都可以作为集合实例上的动态属性进行访问。例如，让我们使用 `each` 高阶消息来调用集合中每个对象的方法：

    use App\Models\User;

    $users = User::where('votes', '>', 500)->get();

    $users->each->markAsVip();

同样，我们可以使用 `sum` 高阶消息来收集用户集合的「votes」总数：

    $users = User::where('group', 'Development')->get();

    return $users->sum->votes;

<a name="lazy-collections"></a>
## 惰性集合

<a name="lazy-collection-introduction"></a>
### 介绍

> **注意：**在进一步了解 Laravel 的惰性集合之前，花点时间熟悉一下 [PHP 生成器](https://www.php.net/manual/en/language.generators.overview.php).

为了补充已经强大的 `Collection` 类，`LazyCollection` 类利用 PHP 的 [generators](https://www.php.net/manual/en/language.generators.overview.php) 允许你使用非常 大型数据集，同时保持较低的内存使用率。

例如，假设你的应用程序需要处理数 GB 的日志文件，同时利用 Laravel 的集合方法来解析日志。可以使用惰性集合在给定时间仅将文件的一小部分保留在内存中，而不是一次将整个文件读入内存：

    use App\Models\LogEntry;
    use Illuminate\Support\LazyCollection;

    LazyCollection::make(function () {
        $handle = fopen('log.txt', 'r');

        while (($line = fgets($handle)) !== false) {
            yield $line;
        }
    })->chunk(4)->map(function (array $lines) {
        return LogEntry::fromLines($lines);
    })->each(function (LogEntry $logEntry) {
        // Process the log entry...
    });



或者，假设你需要遍历 10,000 个 Eloquent 模型。使用传统 Laravel 集合时，所有 10,000 个 Eloquent 模型必须同时加载到内存中：

    use App\Models\User;

    $users = User::all()->filter(function (User $user) {
        return $user->id > 500;
    });

但是，查询构建器的 `cursor` 方法返回一个 `LazyCollection` 实例。这允许你仍然只对数据库运行一个查询，而且一次只在内存中加载一个 Eloquent 模型。在这个例子中，`filter` 回调在我们实际单独遍历每个用户之前不会执行，从而可以大幅减少内存使用量：

    use App\Models\User;

    $users = User::cursor()->filter(function (User $user) {
        return $user->id > 500;
    });

    foreach ($users as $user) {
        echo $user->id;
    }

<a name="creating-lazy-collections"></a>
### 创建惰性集合

要创建惰性集合实例，你应该将 PHP 生成器函数传递给集合的 `make` 方法：

    use Illuminate\Support\LazyCollection;

    LazyCollection::make(function () {
        $handle = fopen('log.txt', 'r');

        while (($line = fgets($handle)) !== false) {
            yield $line;
        }
    });

<a name="the-enumerable-contract"></a>
### 枚举契约

`Collection` 类上几乎所有可用的方法也可以在 `LazyCollection` 类上使用。这两个类都实现了 `Illuminate\Support\Enumerable` 契约，它定义了以下方法：

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

> **注意：**改变集合的方法（例如 `shift`、`pop`、`prepend` 等）在 `LazyCollection` 类中**不**可用。


<a name="lazy-collection-methods"></a>
### 惰性集合方法

除了在 `Enumerable` 契约中定义的方法外， `LazyCollection` 类还包含以下方法：

<a name="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()` {.collection-method}

`takeUntilTimeout` 方法返回新的惰性集合，它会在给定时间前去枚举集合值，之后集合将停止枚举：

    $lazyCollection = LazyCollection::times(INF)
        ->takeUntilTimeout(now()->addMinute());

    $lazyCollection->each(function (int $number) {
        dump($number);

        sleep(1);
    });

    // 1
    // 2
    // ...
    // 58
    // 59

为了具体阐述此方法，请设想一个使用游标从数据库提交发票的例子。你可以定义一个 [计划任务](/docs/laravel/10.x/scheduling)，它每十五分钟执行一次，并且只执行发票提交操作的最大时间是 14 分钟：

    use App\Models\Invoice;
    use Illuminate\Support\Carbon;

    Invoice::pending()->cursor()
        ->takeUntilTimeout(
            Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
        )
        ->each(fn (Invoice $invoice) => $invoice->submit());

<a name="method-tapEach"></a>
#### `tapEach()` {.collection-method}

当 `each` 方法为集合中每一个元素调用给定回调时， `tapEach` 方法仅调用给定回调，因为这些元素正在逐个从列表中拉出：

    // 没有任何输出
    $lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
        dump($value);
    });

    // 打印出三条数据
    $array = $lazyCollection->take(3)->all();

    // 1
    // 2
    // 3

<a name="method-remember"></a>
#### `remember()` {.collection-method}

`remember` 方法返回一个新的惰性集合，这个集合已经记住（缓存）已枚举的所有值，当再次枚举该集合时不会获取它们：

    // 没执行任何查询
    $users = User::cursor()->remember();

    //  执行了查询操作
    // The first 5 users are hydrated from the database...
    $users->take(5)->all();

    // 前 5 个用户数据从缓存中获取
    // The rest are hydrated from the database...
    $users->take(20)->all();

