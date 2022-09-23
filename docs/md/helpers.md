# 辅助函数

- [简介](#introduction)
- [可用方法](#available-methods)

<a name="introduction"></a>
## 简介

Laravel 包含各种各样的全局 PHP 「辅助」函数，框架本身也大量的使用了这些功能函数；如果你觉的方便，你可以在你的应用中任意使用这些函数。

<a name="available-methods"></a>
## 可用方法

<style>
    .collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

<a name="arrays-and-objects-method-list"></a>
### 数组 & 对象

<div class="collection-method-list" markdown="1">

[Arr::accessible](#method-array-accessible)
[Arr::add](#method-array-add)
[Arr::collapse](#method-array-collapse)
[Arr::crossJoin](#method-array-crossjoin)
[Arr::divide](#method-array-divide)
[Arr::dot](#method-array-dot)
[Arr::except](#method-array-except)
[Arr::exists](#method-array-exists)
[Arr::first](#method-array-first)
[Arr::flatten](#method-array-flatten)
[Arr::forget](#method-array-forget)
[Arr::get](#method-array-get)
[Arr::has](#method-array-has)
[Arr::hasAny](#method-array-hasany)
[Arr::isAssoc](#method-array-isassoc)
[Arr::isList](#method-array-islist)
[Arr::keyBy](#method-array-keyby)
[Arr::last](#method-array-last)
[Arr::only](#method-array-only)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::pull](#method-array-pull)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sort](#method-array-sort)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[head](#method-head)
[last](#method-last)

</div>

<a name="paths-method-list"></a>
### 路径

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[mix](#method-mix)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a name="strings-method-list"></a>
### 字符串

<div class="collection-method-list" markdown="1">

[\__](#method-__)
[class_basename](#method-class-basename)
[e](#method-e)
[preg_replace_array](#method-preg-replace-array)
[Str::after](#method-str-after)
[Str::afterLast](#method-str-after-last)
[Str::ascii](#method-str-ascii)
[Str::before](#method-str-before)
[Str::beforeLast](#method-str-before-last)
[Str::between](#method-str-between)
[Str::camel](#method-camel-case)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::endsWith](#method-ends-with)
[Str::excerpt](#method-excerpt)
[Str::finish](#method-str-finish)
[Str::headline](#method-str-headline)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::length](#method-str-length)
[Str::limit](#method-str-limit)
[Str::lower](#method-str-lower)
[Str::markdown](#method-str-markdown)
[Str::mask](#method-str-mask)
[Str::orderedUuid](#method-str-ordered-uuid)
[Str::padBoth](#method-str-padboth)
[Str::padLeft](#method-str-padleft)
[Str::padRight](#method-str-padright)
[Str::plural](#method-str-plural)
[Str::pluralStudly](#method-str-plural-studly)
[Str::random](#method-str-random)
[Str::remove](#method-str-remove)
[Str::replace](#method-str-replace)
[Str::replaceArray](#method-str-replace-array)
[Str::replaceFirst](#method-str-replace-first)
[Str::replaceLast](#method-str-replace-last)
[Str::reverse](#method-str-reverse)
[Str::singular](#method-str-singular)
[Str::slug](#method-str-slug)
[Str::snake](#method-snake-case)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::swap](#method-str-swap)
[Str::title](#method-title-case)
[Str::toHtmlString](#method-str-to-html-string)
[Str::ucfirst](#method-str-ucfirst)
[Str::upper](#method-str-upper)
[Str::uuid](#method-str-uuid)
[Str::wordCount](#method-str-word-count)
[Str::words](#method-str-words)
[str](#method-str)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a name="fluent-strings-method-list"></a>
### 字符流处理

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[camel](#method-fluent-str-camel)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[dirname](#method-fluent-str-dirname)
[endsWith](#method-fluent-str-ends-with)
[excerpt](#method-fluent-str-excerpt)
[exactly](#method-fluent-str-exactly)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[ltrim](#method-fluent-str-ltrim)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[padBoth](#method-fluent-str-padboth)
[padLeft](#method-fluent-str-padleft)
[padRight](#method-fluent-str-padright)
[pipe](#method-fluent-str-pipe)
[plural](#method-fluent-str-plural)
[prepend](#method-fluent-str-prepend)
[remove](#method-fluent-str-remove)
[replace](#method-fluent-str-replace)
[replaceArray](#method-fluent-str-replace-array)
[replaceFirst](#method-fluent-str-replace-first)
[replaceLast](#method-fluent-str-replace-last)
[replaceMatches](#method-fluent-str-replace-matches)
[rtrim](#method-fluent-str-rtrim)
[scan](#method-fluent-str-scan)
[singular](#method-fluent-str-singular)
[slug](#method-fluent-str-slug)
[snake](#method-fluent-str-snake)
[split](#method-fluent-str-split)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[swap](#method-fluent-str-swap)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[trim](#method-fluent-str-trim)
[ucfirst](#method-fluent-str-ucfirst)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUuid](#method-fluent-str-when-is-uuid)
[whenTest](#method-fluent-str-when-test)
[wordCount](#method-fluent-str-word-count)
[words](#method-fluent-str-words)

</div>

<a name="urls-method-list"></a>
### URLs

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
[to_route](#method-to-route)
[url](#method-url)

</div>

<a name="miscellaneous-method-list"></a>
### 其他

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[decrypt](#method-decrypt)
[dd](#method-dd)
[dispatch](#method-dispatch)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[filled](#method-filled)
[info](#method-info)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[today](#method-today)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)

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

<a name="arrays"></a>
## 数组 & 对象

<a name="method-array-accessible"></a>
#### `Arr::accessible()` {.collection-method .first-collection-method}

`Arr::accessible` 函数检查给定的值是否可数组式访问：

    use Illuminate\Support\Arr;
    use Illuminate\Support\Collection;

    $isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

    // true

    $isAccessible = Arr::accessible(new Collection);

    // true

    $isAccessible = Arr::accessible('abc');

    // false

    $isAccessible = Arr::accessible(new stdClass);

    // false

<a name="method-array-add"></a>
#### `Arr::add()` {.collection-method}

如果给定的键在数组中不存在或给定的键的值被设置为 `null` ，那么 `Arr::add` 函数将会把给定的键值对添加到数组中：

    use Illuminate\Support\Arr;

    $array = Arr::add(['name' => 'Desk'], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]

    $array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]


<a name="method-array-collapse"></a>
#### `Arr::collapse()` {.collection-method}

`Arr::collapse` 函数将多个数组合并为一个数组：

    use Illuminate\Support\Arr;

    $array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    // [1, 2, 3, 4, 5, 6, 7, 8, 9]

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

`Arr::crossJoin` 函数交叉连接给定的数组，返回具有所有可能排列的笛卡尔乘积：

    use Illuminate\Support\Arr;

    $matrix = Arr::crossJoin([1, 2], ['a', 'b']);

    /*
        [
            [1, 'a'],
            [1, 'b'],
            [2, 'a'],
            [2, 'b'],
        ]
    */

    $matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

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

<a name="method-array-divide"></a>
#### `Arr::divide()` {.collection-method}

`Arr::divide` 函数返回一个二维数组，一个值包含原数组的键，另一个值包含原数组的值：

    use Illuminate\Support\Arr;

    [$keys, $values] = Arr::divide(['name' => 'Desk']);

    // $keys: ['name']

    // $values: ['Desk']



<a name="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

`Arr::dot` 函数将多维数组中所有的键平铺到一维数组中，新数组使用「.」符号表示层级包含关系：

    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    $flattened = Arr::dot($array);

    // ['products.desk.price' => 100]

<a name="method-array-except"></a>
#### `Arr::except()` {.collection-method}

`Arr::except` 函数从数组中删除指定的键值对：

    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100];

    $filtered = Arr::except($array, ['price']);

    // ['name' => 'Desk']

<a name="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

`Arr::exists` 检查给定的键是否存在提供的数组中：

    use Illuminate\Support\Arr;

    $array = ['name' => 'John Doe', 'age' => 17];

    $exists = Arr::exists($array, 'name');

    // true

    $exists = Arr::exists($array, 'salary');

    // false

<a name="method-array-first"></a>
#### `Arr::first()` {.collection-method}

`Arr::first` 函数返回数组中满足指定条件的第一个元素：

    use Illuminate\Support\Arr;

    $array = [100, 200, 300];

    $first = Arr::first($array, function ($value, $key) {
        return $value >= 150;
    });

    // 200

将默认值作为第三个参数传递给该方法，如果没有值满足条件，则返回该默认值：

    use Illuminate\Support\Arr;

    $first = Arr::first($array, $callback, $default);

<a name="method-array-flatten"></a>
#### `Arr::flatten()` {.collection-method}

 `Arr::flatten` 函数将多维数组中数组的值取出平铺为一维数组：

    use Illuminate\Support\Arr;

    $array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

    $flattened = Arr::flatten($array);

    // ['Joe', 'PHP', 'Ruby']

<a name="method-array-forget"></a>
#### `Arr::forget()` {.collection-method}

`Arr::forget` 函数使用「.」符号从深度嵌套的数组中删除给定的键值对：

    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::forget($array, 'products.desk');

    // ['products' => []]



<a name="method-array-get"></a>
#### `Arr::get()` {.collection-method}

`Arr::get` 函数使用「.」符号从深度嵌套的数组根据指定键检索值：

    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    $price = Arr::get($array, 'products.desk.price');

    // 100

`Arr::get` 函数也可以接受一个默认值，如果没有找到特定的键，将返回默认值：

    use Illuminate\Support\Arr;

    $discount = Arr::get($array, 'products.desk.discount', 0);

    // 0

<a name="method-array-has"></a>
#### `Arr::has()` {.collection-method}

`Arr::has` 函数使用「.」符号判断数组中是否存在指定的一个或多个键：

    use Illuminate\Support\Arr;

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];

    $contains = Arr::has($array, 'product.name');

    // true

    $contains = Arr::has($array, ['product.price', 'product.discount']);

    // false

<a name="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

`Arr::hasAny` 函数使用「.」符号判断数组中是否存在给定集合中的任一值作为键：

    use Illuminate\Support\Arr;

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];

    $contains = Arr::hasAny($array, 'product.name');

    // true

    $contains = Arr::hasAny($array, ['product.name', 'product.discount']);

    // true

    $contains = Arr::hasAny($array, ['category', 'product.discount']);

    // false

<a name="method-array-isassoc"></a>
#### `Arr::isAssoc()` {.collection-method}

如果给定数组是关联数组，则 `Arr::isAssoc` 函数返回 `true`，如果数组没有以零开头的连续数字键，则将其视为「关联」：

    use Illuminate\Support\Arr;

    $isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

    // true

    $isAssoc = Arr::isAssoc([1, 2, 3]);

    // false

<a name="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

如果给定数组的键是从零开始的连续整数，则 `Arr::isList` 方法返回 `true`：

    use Illuminate\Support\Arr;

    $isAssoc = Arr::isList(['foo', 'bar', 'baz']);

    // true

    $isAssoc = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

    // false

<a name="method-array-keyby"></a>

#### `Arr::keyBy()` {.collection-method}

> 注意：自 Laravel 9.2 引入

The `Arr::keyBy` method keys the array by the given key. If multiple items have the same key, only the last one will appear in the new array:

    use Illuminate\Support\Arr;

    $array = [

        ['product_id' => 'prod-100', 'name' => 'Desk'],

        ['product_id' => 'prod-200', 'name' => 'Chair'],

    ];

    $keyed = Arr::keyBy($array, 'product_id');

    /*

        [

            'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],

            'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],

        ]

    */

<a name="method-array-last"></a>
#### `Arr::last()` {.collection-method}

`Arr::last` 函数返回数组中满足指定条件的最后一个元素：

    use Illuminate\Support\Arr;

    $array = [100, 200, 300, 110];

    $last = Arr::last($array, function ($value, $key) {
        return $value >= 150;
    });

    // 300

将默认值作为第三个参数传递给该方法，如果没有值满足条件，则返回该默认值：

    use Illuminate\Support\Arr;

    $last = Arr::last($array, $callback, $default);

<a name="method-array-only"></a>
#### `Arr::only()` {.collection-method}

`Arr::only` 函数只返回给定数组中指定的键值对：

    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

    $slice = Arr::only($array, ['name', 'price']);

    // ['name' => 'Desk', 'price' => 100]

<a name="method-array-pluck"></a>
#### `Arr::pluck()` {.collection-method}

`Arr::pluck` 函数从数组中检索给定键的所有值：

    use Illuminate\Support\Arr;

    $array = [
        ['developer' => ['id' => 1, 'name' => 'Taylor']],
        ['developer' => ['id' => 2, 'name' => 'Abigail']],
    ];

    $names = Arr::pluck($array, 'developer.name');

    // ['Taylor', 'Abigail']

你也可以指定结果的键：

    use Illuminate\Support\Arr;

    $names = Arr::pluck($array, 'developer.name', 'developer.id');

    // [1 => 'Taylor', 2 => 'Abigail']

<a name="method-array-prepend"></a>
#### `Arr::prepend()` {.collection-method}

`Arr::prepend` 函数将一个值插入到数组的开始位置：

    use Illuminate\Support\Arr;

    $array = ['one', 'two', 'three', 'four'];

    $array = Arr::prepend($array, 'zero');

    // ['zero', 'one', 'two', 'three', 'four']

你也可以指定插入值的键：

    use Illuminate\Support\Arr;

    $array = ['price' => 100];

    $array = Arr::prepend($array, 'Desk', 'name');

    // ['name' => 'Desk', 'price' => 100]



<a name="method-array-pull"></a>
#### `Arr::pull()` {.collection-method}

`Arr::pull` 函数从数组中返回指定键的值并删除此键值对：

    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100];

    $name = Arr::pull($array, 'name');

    // $name: Desk

    // $array: ['price' => 100]

默认值可以作为第三个参数传递给该方法，如果键不存在，则返回该值：

    use Illuminate\Support\Arr;

    $value = Arr::pull($array, $key, $default);

<a name="method-array-query"></a>
#### `Arr::query()` {.collection-method}

`Arr::query` 函数将数组转换为查询字符串：

    use Illuminate\Support\Arr;

    $array = [
        'name' => 'Taylor',
        'order' => [
            'column' => 'created_at',
            'direction' => 'desc'
        ]
    ];

    Arr::query($array);

    // name=Taylor&order[column]=created_at&order[direction]=desc

<a name="method-array-random"></a>
#### `Arr::random()` {.collection-method}

`Arr::random`  函数从数组中随机返回一个值：

    use Illuminate\Support\Arr;

    $array = [1, 2, 3, 4, 5];

    $random = Arr::random($array);

    // 4 - (retrieved randomly)

你也可以将返回值的数量作为可选的第二个参数传递给该方法，请注意，提供这个参数会返回一个数组，即使是你只需要一项：

    use Illuminate\Support\Arr;

    $items = Arr::random($array, 2);

    // [2, 5] - (retrieved randomly)

<a name="method-array-set"></a>
#### `Arr::set()` {.collection-method}

`Arr::set` 函数使用「.」符号在多维数组中设置指定键的值：

    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::set($array, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()` {.collection-method}

`Arr::shuffle` 函数将数组中值进行随机排序：

    use Illuminate\Support\Arr;

    $array = Arr::shuffle([1, 2, 3, 4, 5]);

    // [3, 2, 5, 1, 4] - (generated randomly)



<a name="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

`Arr::sort`  函数根据数组的值大小进行排序：

    use Illuminate\Support\Arr;

    $array = ['Desk', 'Table', 'Chair'];

    $sorted = Arr::sort($array);

    // ['Chair', 'Desk', 'Table']

你也可以根据给定回调函数返回的结果对数组进行排序：

    use Illuminate\Support\Arr;

    $array = [
        ['name' => 'Desk'],
        ['name' => 'Table'],
        ['name' => 'Chair'],
    ];

    $sorted = array_values(Arr::sort($array, function ($value) {
        return $value['name'];
    }));

    /*
        [
            ['name' => 'Chair'],
            ['name' => 'Desk'],
            ['name' => 'Table'],
        ]
    */

<a name="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()` {.collection-method}

`Arr::sortRecursive` 函数使用 `sort` 函数对数值子数组进行递归排序，使用 `ksort` 函数对关联子数组进行递归排序：

    use Illuminate\Support\Arr;

    $array = [
        ['Roman', 'Taylor', 'Li'],
        ['PHP', 'Ruby', 'JavaScript'],
        ['one' => 1, 'two' => 2, 'three' => 3],
    ];

    $sorted = Arr::sortRecursive($array);

    /*
        [
            ['JavaScript', 'PHP', 'Ruby'],
            ['one' => 1, 'three' => 3, 'two' => 2],
            ['Li', 'Roman', 'Taylor'],
        ]
    */

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()` {.collection-method}

`Arr::toCssClasses` 函数根据给定的条件编译并返回 CSS 类字符串。该方法接受一个类数组，其中数组键包含你希望添加的一个或多个 CSS Class，而值是一个布尔表达式。如果数组元素有一个数字键，它将始终包含在呈现的类列表中：

    use Illuminate\Support\Arr;

    $isActive = false;
    $hasError = true;

    $array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

    $classes = Arr::toCssClasses($array);

    /*
        'p-4 bg-red'
    */

Laravel 基于该函数实现[条件类](/docs/laravel/9.x/blade#conditionally-merge-classes) 以及 `@class` [Blade 指令](/docs/laravel/9.x/blade#conditional-classes)。

<a name="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

`Arr::undot` 函数将使用「点表示法」的一维数组扩展为多维数组：

    use Illuminate\Support\Arr;

    $array = [
        'user.name' => 'Kevin Malone',
        'user.occupation' => 'Accountant',
    ];

    $array = Arr::undot($array);

    // ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]



<a name="method-array-where"></a>
#### `Arr::where()` {.collection-method}

`Arr::where` 函数使用给定的回调函数返回的结果过滤数组：

    use Illuminate\Support\Arr;

    $array = [100, '200', 300, '400', 500];

    $filtered = Arr::where($array, function ($value, $key) {
        return is_string($value);
    });

    // [1 => '200', 3 => '400']

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()` {.collection-method}

`Arr::whereNotNull` 函数将从给定数组中删除所有 `null` 值：

    use Illuminate\Support\Arr;

    $array = [0, null];

    $filtered = Arr::whereNotNull($array);

    // [0 => 0]

<a name="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

`Arr::wrap` 函数可以将给定值转换为一个数组，如果给定的值已经是一个数组，它将原样返回：

    use Illuminate\Support\Arr;

    $string = 'Laravel';

    $array = Arr::wrap($string);

    // ['Laravel']

如果给定值是 `null`，将返回一个空数组：

    use Illuminate\Support\Arr;

    $array = Arr::wrap(null);

    // []

<a name="method-data-fill"></a>
#### `data_fill()` {.collection-method}

`data_fill` 函数使用「.」符号给多维数组或对象设置缺少的值：

    $data = ['products' => ['desk' => ['price' => 100]]];

    data_fill($data, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 100]]]

    data_fill($data, 'products.desk.discount', 10);

    // ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]

此函数也可以接收「*」作为通配符，设置相应缺少的值：

    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2'],
        ],
    ];

    data_fill($data, 'products.*.price', 200);

    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 100],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */

<a name="method-data-get"></a>
#### `data_get()` {.collection-method}

`data_get`  函数使用「.」符号从多维数组或对象中根据指定键检索值：

    $data = ['products' => ['desk' => ['price' => 100]]];

    $price = data_get($data, 'products.desk.price');

    // 100



该函数也接受一个默认值，如果没有找到指定的键，将返回默认值：

    $discount = data_get($data, 'products.desk.discount', 0);

    // 0

该函数还接受「*」为通配符,来指向数组或对象的任何键：

    $data = [
        'product-one' => ['name' => 'Desk 1', 'price' => 100],
        'product-two' => ['name' => 'Desk 2', 'price' => 150],
    ];

    data_get($data, '*.name');

    // ['Desk 1', 'Desk 2'];

<a name="method-data-set"></a>
#### `data_set()` {.collection-method}

`data_set` 函数使用「.」符号从多维数组或对象中根据指定键设置值：

    $data = ['products' => ['desk' => ['price' => 100]]];

    data_set($data, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]

同 `data_get`一样, 函数也支持使用「*」作为通配符给相应键名赋值：

    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 150],
        ],
    ];

    data_set($data, 'products.*.price', 200);

    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 200],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */

通常情况下，已存在的值将会被覆盖。如果只是希望设置一个目前不存在的值，你可以增加一个 `false` 作为函数的第四个参数：

    $data = ['products' => ['desk' => ['price' => 100]]];

    data_set($data, 'products.desk.price', 200, $overwrite = false);

    // ['products' => ['desk' => ['price' => 100]]]

<a name="method-head"></a>
#### `head()` {.collection-method}

`head` 函数将返回数组中的第一个值：

    $array = [100, 200, 300];

    $first = head($array);

    // 100

<a name="method-last"></a>
#### `last()` {.collection-method}

`last` 函数将返回数组中的最后一个值：

    $array = [100, 200, 300];

    $last = last($array);

    // 300

<a name="paths"></a>
## 路径

<a name="method-app-path"></a>
#### `app_path()` {.collection-method}

`app_path` 函数返回 app 目录的完整路径。你也可以使用 app_path 函数来生成应用目录下特定文件的完整路径：

    $path = app_path();

    $path = app_path('Http/Controllers/Controller.php');



<a name="method-base-path"></a>
#### `base_path()` {.collection-method}

`base_path` 函数返回项目根目录的完整路径。你也可以使用 `base_path` 函数生成项目根目录下特定文件的完整路径：

    $path = base_path();

    $path = base_path('vendor/bin');

<a name="method-config-path"></a>
#### `config_path()` {.collection-method}

`config_path`  函数返回 项目配置目录(config)的完整路径。你也可以使用 `config_path` 函数来生成应用配置目录中的特定文件的完整路径：

    $path = config_path();

    $path = config_path('app.php');

<a name="method-database-path"></a>
#### `database_path()` {.collection-method}

`database_path`函数返回 `database` 目录的完整路径。你也可以使用 `database_path` 函数来生成数据库目录下特定文件的完整路径：

    $path = database_path();

    $path = database_path('factories/UserFactory.php');

<a name="method-mix"></a>
#### `mix()` {.collection-method}

`mix`函数返回 [编译前端资源（Mix）](/docs/laravel/9.x/mix)的路径,便于加载 css，js 等静态文件：

    $path = mix('css/app.css');

<a name="method-public-path"></a>
#### `public_path()` {.collection-method}

`public_path` 函数返回 `public` 目录的完整路径。你可以使用 `public_path` 函数来生成 `public` 目录下特定文件的完整路径：

    $path = public_path();

    $path = public_path('css/app.css');

<a name="method-resource-path"></a>
#### `resource_path()` {.collection-method}

 `resource_path` 函数返回 `resources` 目录的完整路径。你也可以用`resource_path` 函数来生成位于资源路径中的特定文件路径：

    $path = resource_path();

    $path = resource_path('sass/app.scss');



<a name="method-storage-path"></a>
#### `storage_path()` {.collection-method}

`storage_path` 函数返回 `storage` 目录的完整路径。 你也可以用`storage_path` 函数来生成位于资源路径中的特定文件路径：

    $path = storage_path();

    $path = storage_path('app/file.txt');

<a name="strings"></a>
## 字符串函数

<a name="method-__"></a>
#### `__()` {.collection-method}

 `__` 函数可使用 [本地化文件](/docs/laravel/9.x/localization/9378) 来翻译指定的字符串或特定的key：

    echo __('Welcome to our application');

    echo __('messages.welcome');

如果给定翻译的字符串或者key不存在， 则 `__` 会返回你指定的值. 所以上述例子中， 如果给定翻译的字符串或者key不存在，则 `__` 函数会返回`messages.welcome`。

<a name="method-class-basename"></a>
#### `class_basename()` {.collection-method}

 `class_basename` 函数返回不带命名空间的特定类的类名：

    $class = class_basename('Foo\Bar\Baz');

    // Baz

<a name="method-e"></a>
#### `e()` {.collection-method}

`e` 函数运行PHP的`htmlspecialchars` 函数，且 `double_encode` 默认设定为 `true`：

    echo e('<html>foo</html>');

    // &lt;html&gt;foo&lt;/html&gt;

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()` {.collection-method}

`preg_replace_array` 函数替换给定顺序模式下字符串中的一个数组：

    $string = 'The event will take place between :start and :end';

    $replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

    // The event will take place between 8:30 and 9:00

<a name="method-str-after"></a>
#### `Str::after()` {.collection-method}

`Str::after` 方法返回字符串中指定值之后的所有内容。如果字符串中不存在这个值，它将返回整个字符串：

    use Illuminate\Support\Str;

    $slice = Str::after('This is my name', 'This is');

    // ' my name'



<a name="method-str-after-last"></a>
#### `Str::afterLast()` {.collection-method}

`Str::afterLast` 方法返回字符串中指定值最后一次出现后的所有内容。如果字符串中不存在这个值，它将返回整个字符串：

    use Illuminate\Support\Str;

    $slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

    // 'Controller'

<a name="method-str-ascii"></a>
#### `Str::ascii()` {.collection-method}

`Str::ascii` 方法尝试将字符串转换为 ASCII 值：

    use Illuminate\Support\Str;

    $slice = Str::ascii('û');

    // 'u'

<a name="method-str-before"></a>
#### `Str::before()` {.collection-method}

`Str::before` 方法返回字符串中指定值之前的所有内容：

    use Illuminate\Support\Str;

    $slice = Str::before('This is my name', 'my name');

    // 'This is '

<a name="method-str-before-last"></a>
#### `Str::beforeLast()` {.collection-method}

`Str::beforeLast` 方法返回字符串中指定值最后一次出现前的所有内容：

    use Illuminate\Support\Str;

    $slice = Str::beforeLast('This is my name', 'is');

    // 'This '

<a name="method-str-between"></a>
#### `Str::between()` {.collection-method}

`Str::between`  方法返回字符串在指定两个值之间的内容：

    use Illuminate\Support\Str;

    $slice = Str::between('This is my name', 'This', 'name');

    // ' is my '

<a name="method-camel-case"></a>
#### `Str::camel()` {.collection-method}

`Str::camel` 方法将指定字符串转换为 `驼峰式` 表示方法：

    use Illuminate\Support\Str;

    $converted = Str::camel('foo_bar');

    // fooBar

<a name="method-str-contains"></a>
#### `Str::contains()` {.collection-method}

`Str::contains` 方法判断指定字符串中是否包含另一指定字符串（区分大小写）：

    use Illuminate\Support\Str;

    $contains = Str::contains('This is my name', 'my');

    // true



你也可以传递数组的值的形式来判断指定字符串是否包含数组中的任一值：

    use Illuminate\Support\Str;

    $contains = Str::contains('This is my name', ['my', 'foo']);

    // true

<a name="method-str-contains-all"></a>
#### `Str::containsAll()` {.collection-method}

`Str::containsAll` 方法用于判断指定字符串是否包含指定数组中的所有值：

    use Illuminate\Support\Str;

    $containsAll = Str::containsAll('This is my name', ['my', 'name']);

    // true

<a name="method-ends-with"></a>
#### `Str::endsWith()` {.collection-method}

`Str::endsWith` 方法用于判断指定字符串是否以另一指定字符串结尾：

    use Illuminate\Support\Str;

    $result = Str::endsWith('This is my name', 'name');

    // true

你也可以传递数组的值的形式来判断指定字符串是否包含指定数组中的任一值：

    use Illuminate\Support\Str;

    $result = Str::endsWith('This is my name', ['name', 'foo']);

    // true

    $result = Str::endsWith('This is my name', ['this', 'foo']);

    // false

<a name="method-excerpt"></a>
#### `Str::excerpt()` {.collection-method}

`Str::excerpt` 方法用于从给定字符串中提取与该字符串中短语的第一个实例匹配的片段：

    use Illuminate\Support\Str;

    $excerpt = Str::excerpt('This is my name', 'my', [
        'radius' => 3
    ]);

    // '...is my na...'

`radius` 选项默认为 `100`，允许你定义应出现在截断字符串前后的字符数。

此外，你可以使用 `omission` 选项来定义将附加到截断字符串的字符串：

    use Illuminate\Support\Str;

    $excerpt = Str::excerpt('This is my name', 'name', [
        'radius' => 3,
        'omission' => '(...) '
    ]);

    // '(...) my name'



<a name="method-str-finish"></a>
#### `Str::finish()` {.collection-method}

`Str::finish` 方法将指定的字符串修改为以指定的值结尾的形式：

    use Illuminate\Support\Str;

    $adjusted = Str::finish('this/string', '/');

    // this/string/

    $adjusted = Str::finish('this/string/', '/');

    // this/string/

<a name="method-str-headline"></a>
#### `Str::headline()` {.collection-method}

`Str::headline` 方法会将由大小写、连字符或下划线分隔的字符串转换为空格分隔的字符串，同时保证每个单词的首字母大写：

    use Illuminate\Support\Str;

    $headline = Str::headline('steve_jobs');

    // Steve Jobs

    $headline = Str::headline('EmailNotificationSent');

    // Email Notification Sent

<a name="method-str-is"></a>
#### `Str::is()` {.collection-method}

`Str::is` 方法用来判断字符串是否与指定模式匹配。星号 `*` 可用于表示通配符：

    use Illuminate\Support\Str;

    $matches = Str::is('foo*', 'foobar');

    // true

    $matches = Str::is('baz*', 'foobar');

    // false

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()` {.collection-method}

`Str::isAscii` 方法用于判断字符串是否是 7 位 ASCII：

    use Illuminate\Support\Str;

    $isAscii = Str::isAscii('Taylor');

    // true

    $isAscii = Str::isAscii('ü');

    // false

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()` {.collection-method}

`Str::isUuid` 方法用于判断指定字符串是否是有效的 UUID ：

    use Illuminate\Support\Str;

    $isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

    // true

    $isUuid = Str::isUuid('laravel');

    // false

<a name="method-kebab-case"></a>
#### `Str::kebab()` {.collection-method}

`Str::kebab` 方法将字符串转换为 `烤串式（ kebab-case ）` 表示方法：

    use Illuminate\Support\Str;

    $converted = Str::kebab('fooBar');

    // foo-bar



<a name="method-str-length"></a>
#### `Str::length()` {.collection-method}

`Str::length` 方法返回指定字符串的长度：

    use Illuminate\Support\Str;

    $length = Str::length('Laravel');

    // 7

<a name="method-str-limit"></a>
#### `Str::limit()` {.collection-method}

`Str::limit` 方法将字符串以指定长度进行截断：

    use Illuminate\Support\Str;

    $truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

    // The quick brown fox...

你也可通过第三个参数来改变追加到末尾的字符串：

    use Illuminate\Support\Str;

    $truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

    // The quick brown fox (...)

<a name="method-str-lower"></a>
#### `Str::lower()` {.collection-method}

`Str::lower` 方法用于将字符串转换为小写：

    use Illuminate\Support\Str;

    $converted = Str::lower('LARAVEL');

    // laravel

<a name="method-str-markdown"></a>
#### `Str::markdown()` {.collection-method}

`Str::markdown` 方法可以将 `GitHub` 风格的 `Markdown` 转换为 `HTML`：

    use Illuminate\Support\Str;

    $html = Str::markdown('# Laravel');

    // <h1>Laravel</h1>

    $html = Str::markdown('# Taylor <b>Otwell</b>', [
        'html_input' => 'strip',
    ]);

    // <h1>Taylor Otwell</h1>

<a name="method-str-mask"></a>
#### `Str::mask()` {.collection-method}

`Str::mask` 方法会使用重复的字符掩盖字符串的一部分，并可用于混淆字符串段，例如电子邮件地址和电话号码：

    use Illuminate\Support\Str;

    $string = Str::mask('taylor@example.com', '*', 3);

    // tay***************

你可以提供一个负数作为 `mask` 方法的第三个参数，这将指示该方法在距字符串末尾的给定距离处开始屏蔽：

    $string = Str::mask('taylor@example.com', '*', -15, 3);

    // tay***@example.com



<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()` {.collection-method}

`Str::orderedUuid` 方法用于生成一个「时间戳优先」的 UUID ，它可作为数据库索引列的有效值。使用此方法生成的每个 UUID 将排在之前使用该方法生成的 UUID 后面：

    use Illuminate\Support\Str;

    return (string) Str::orderedUuid();

<a name="method-str-padboth"></a>
#### `Str::padBoth()` {.collection-method}

`Str::padBoth` 方法包装了 PHP 的 `str_pad 函数`，在指定字符串的两侧填充上另一字符串：

    use Illuminate\Support\Str;

    $padded = Str::padBoth('James', 10, '_');

    // '__James___'

    $padded = Str::padBoth('James', 10);

    // '  James   '

<a name="method-str-padleft"></a>
#### `Str::padLeft()` {.collection-method}

`Str::padLeft` 方法包装了 PHP 的 `str_pad` 函数，在指定字符串的左侧填充上另一字符串：

    use Illuminate\Support\Str;

    $padded = Str::padLeft('James', 10, '-=');

    // '-=-=-James'

    $padded = Str::padLeft('James', 10);

    // '     James'

<a name="method-str-padright"></a>
#### `Str::padRight()` {.collection-method}

`Str::padRight` 方法包装了 PHP 的 str_pad 函数，在指定字符串的右侧填充上另一字符串：

    use Illuminate\Support\Str;

    $padded = Str::padRight('James', 10, '-');

    // 'James-----'

    $padded = Str::padRight('James', 10);

    // 'James     '

<a name="method-str-plural"></a>
#### `Str::plural()` {.collection-method}

`Str::plural` 方法将单数形式的字符串转换为复数形式。目前该函数仅支持英语：

    use Illuminate\Support\Str;

    $plural = Str::plural('car');

    // cars

    $plural = Str::plural('child');

    // children

你可以提供一个整数作为函数的第二个参数来检索字符串的单数或复数形式：

    use Illuminate\Support\Str;

    $plural = Str::plural('child', 2);

    // children

    $singular = Str::plural('child', 1);

    // child



<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()` {.collection-method}

`Str::pluralStudly` 方法将以驼峰格式的单数字符串转化为其复数形式。目前该函数仅支持英语：

    use Illuminate\Support\Str;

    $plural = Str::pluralStudly('VerifiedHuman');

    // VerifiedHumans

    $plural = Str::pluralStudly('UserFeedback');

    // UserFeedback

你可以提供一个整数作为函数的第二个参数来检索字符串的单数或复数形式：

    use Illuminate\Support\Str;

    $plural = Str::pluralStudly('VerifiedHuman', 2);

    // VerifiedHumans

    $singular = Str::pluralStudly('VerifiedHuman', 1);

    // VerifiedHuman

<a name="method-str-random"></a>
#### `Str::random()` {.collection-method}

`Str::random` 方法用于生成指定长度的随机字符串。这个函数使用了PHP的 `random_bytes` 函数：

    use Illuminate\Support\Str;

    $random = Str::random(40);

<a name="method-str-remove"></a>
#### `Str::remove()` {.collection-method}

`Str::remove` 方法从字符串中删除给定值或给定数组内的所有值：

    use Illuminate\Support\Str;

    $string = 'Peter Piper picked a peck of pickled peppers.';

    $removed = Str::remove('e', $string);

    // Ptr Pipr pickd a pck of pickld ppprs.

你还可以将 `false` 作为第三个参数传递给 `remove` 方法以在删除字符串时忽略大小写。

<a name="method-str-replace"></a>
#### `Str::replace()` {.collection-method}

`Str::replace` 方法用于替换字符串中的给定字符串：

    use Illuminate\Support\Str;

    $string = 'Laravel 8.x';

    $replaced = Str::replace('8.x', '9.x', $string);

    // Laravel 9.x

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()` {.collection-method}

`Str::replaceArray` 方法使用数组有序的替换字符串中的特定字符：

    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

    // The event will take place between 8:30 and 9:00



<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()` {.collection-method}

`Str::replaceFirst` 函数替换字符串中给定值的第一个匹配项 ：

    use Illuminate\Support\Str;

    $replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // a quick brown fox jumps over the lazy dog

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()` {.collection-method}

`Str::replaceLast`  函数替换字符串中最后一次出现的给定值：

    use Illuminate\Support\Str;

    $replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // the quick brown fox jumps over a lazy dog


<a name="method-str-reverse"></a>
#### `Str::reverse()` {.collection-method}

`Str::reverse` 方法用于反转给定的字符串：

    use Illuminate\Support\Str;

    $reversed = Str::reverse('Hello World');

    // dlroW olleH

<a name="method-str-singular"></a>
#### `Str::singular()` {.collection-method}

`Str::singular` 方法将字符串转换为单数形式。该函数目前仅支持英文：

    use Illuminate\Support\Str;

    $singular = Str::singular('cars');

    // car

    $singular = Str::singular('children');

    // child

<a name="method-str-slug"></a>
#### `Str::slug()` {.collection-method}

`Str::slug` 方法将给定的字符串生成一个 URL 友好的「slug」：

    use Illuminate\Support\Str;

    $slug = Str::slug('Laravel 5 Framework', '-');

    // laravel-5-framework

<a name="method-snake-case"></a>
#### `Str::snake()` {.collection-method}

`Str::snake` 方法是将驼峰的函数名或者字符串转换成 `_` 命名的函数或者字符串，例如 `snakeCase` 转换成 `snake_case`

    use Illuminate\Support\Str;

    $converted = Str::snake('fooBar');

    // foo_bar

    $converted = Str::snake('fooBar', '-');

    // foo-bar

<a name="method-str-start"></a>
#### `Str::start()` {.collection-method}

`Str::start` 方法是将给定的值添加到字符串的开始位置，例如：

    use Illuminate\Support\Str;

    $adjusted = Str::start('this/string', '/');

    // /this/string

    $adjusted = Str::start('/this/string', '/');

    // /this/string



<a name="method-starts-with"></a>
#### `Str::startsWith()` {.collection-method}

`Str::startsWith` 方法用来判断给定的字符串是否为给定值的开头：

    use Illuminate\Support\Str;

    $result = Str::startsWith('This is my name', 'This');

    // true

如果传递了一个可能值的数组且字符串以任何给定值开头，则 `startsWith` 方法将返回 `true`：

    $result = Str::startsWith('This is my name', ['This', 'That', 'There']);

    // true

<a name="method-studly-case"></a>
#### `Str::studly()` {.collection-method}

`Str::studly` 方法将给定的字符串转换为 `驼峰命名` 的字符串：

    use Illuminate\Support\Str;

    $converted = Str::studly('foo_bar');

    // FooBar

<a name="method-str-substr"></a>
#### `Str::substr()` {.collection-method}

`Str::substr` 方法与 php 自带的字符串 `substr` 截取函数相同：

    use Illuminate\Support\Str;

    $converted = Str::substr('The Laravel Framework', 4, 7);

    // Laravel

<a name="method-str-substrcount"></a>
#### `Str::substrCount()` {.collection-method}

`Str::substrCount` 方法返回给定字符串中给定值出现的次数：

    use Illuminate\Support\Str;

    $count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

    // 2

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()` {.collection-method}

`Str::substrReplace` 方法在字符串的一部分中替换文本，从第三个参数指定的位置开始替换第四个参数指定的字符数。将 `0` 传递给方法的第四个参数将在指定位置插入字符串，而不替换字符串中的任何现有字符：

    use Illuminate\Support\Str;

    $result = Str::substrReplace('1300', ':', 2); 
    // 13:

    $result = Str::substrReplace('1300', ':', 2, 0); 
    // 13:00



<a name="method-str-swap"></a>
#### `Str::swap()` {.collection-method}

`Str::swap` 方法使用 PHP 的 `strtr` 函数替换给定字符串中的多个值：

    use Illuminate\Support\Str;

    $string = Str::swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ], 'Tacos are great!');

    // Burritos are fantastic!

<a name="method-title-case"></a>
#### `Str::title()` {.collection-method}

`Str::title` 方法是把指定的字符串，每个单词首字母大写：

    use Illuminate\Support\Str;

    $converted = Str::title('a nice title uses the correct case');

    // A Nice Title Uses The Correct Case

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()` {.collection-method}

`Str::toHtmlString` 方法将字符串实例转换为 `Illuminate\Support\HtmlString` 的实例，它可以显示在 Blade 模板中：

    use Illuminate\Support\Str;

    $htmlString = Str::of('Nuno Maduro')->toHtmlString();

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()` {.collection-method}

`Str::ucfirst` 方法是把指定的字符串首字母大写：

    use Illuminate\Support\Str;

    $string = Str::ucfirst('foo bar');

    // Foo bar

<a name="method-str-upper"></a>
#### `Str::upper()` {.collection-method}

`Str::upper` 函数用于将指定字符串转换为大写：

    use Illuminate\Support\Str;

    $string = Str::upper('laravel');

    // LARAVEL

<a name="method-str-uuid"></a>
#### `Str::uuid()` {.collection-method}

`Str::uuid` 方法用于生成一个 UUID （第 4 版）：

    use Illuminate\Support\Str;

    return (string) Str::uuid();

<a name="method-str-word-count"></a>
#### `Str::wordCount()` {.collection-method}

`Str::wordCount` 方法返回字符串包含的单词数：

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-words"></a>
#### `Str::words()` {.collection-method}

`Str::words` 方法用于限制字符串中的单词数。 可以通过它的第三个参数将另一个字符串传递给此方法，以指定应将哪个字符串附加到截断的字符串的末尾：

    use Illuminate\Support\Str;

    return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

    // Perfectly balanced, as >>>



<a name="method-str"></a>
#### `str()` {.collection-method}

`str` 函数返回给定字符串的新 `Illuminate\Support\Stringable` 实例。这个函数等价于 `Str::of` 方法：

    $string = str('Taylor')->append(' Otwell');

    // 'Taylor Otwell'

如果没有为 `str` 函数提供参数，则该函数返回 `Illuminate\Support\Str` 的实例：

    $snake = str()->snake('FooBar');

    // 'foo_bar'

<a name="method-trans"></a>
#### `trans()` {.collection-method}

The `trans` 函数使用你的 [本地化文件](/docs/laravel/9.x/localization) 翻译给定键：

    echo trans('messages.welcome');

如果指定的翻译键不存在，`trans` 函数将返回给定的键. 因此在上方的例子中，如果翻译键不存在，`trans` 函数将返回 `messages.welcome`。

<a name="method-trans-choice"></a>
#### `trans_choice()` {.collection-method}

`trans_choice` 函数将根据词形变化来翻译给定的翻译键：

    echo trans_choice('messages.notifications', $unreadCount);

如果给定的翻译键不存在，`trans_choice` 函数将返回给定键。因此在上方的例子中，若翻译键不存在，`trans_choice` 函数将返回 `messages.notifications`。

<a name="fluent-strings"></a>
## 字符流处理

字符流处理（Fluent strings）提供了一种更流畅的、拥有面向对象接口形式的字符串处理方式，它允许使用比传统字符串操作更具可读性的语法来进行多字符串的链式操作。

<a name="method-fluent-str-after"></a>
#### `after` {.collection-method}

`after` 方法将返回字符串中指定值后的所有内容。如果字符串中不存在这个值，它将返回整个字符串：

    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->after('This is');

    // ' my name'



<a name="method-fluent-str-after-last"></a>
#### `afterLast` {.collection-method}

`afterLast`方法返回字符串中指定值最后一次出现后的所有内容。如果字符串中不存在这个值，它将返回整个字符串：

    use Illuminate\Support\Str;

    $slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

    // 'Controller'

<a name="method-fluent-str-append"></a>
#### `append` {.collection-method}

`append` 方法为字符串附加上指定的值：

    use Illuminate\Support\Str;

    $string = Str::of('Taylor')->append(' Otwell');

    // 'Taylor Otwell'

<a name="method-fluent-str-ascii"></a>
#### `ascii` {.collection-method}

`ascii` 方法尝试将字符串转换为 ASCII 值：

    use Illuminate\Support\Str;

    $string = Str::of('ü')->ascii();

    // 'u'

<a name="method-fluent-str-basename"></a>
#### `basename` {.collection-method}

`basename`方法将返回指定字符串的结尾部分：

    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->basename();

    // 'baz'

如果有必要，你也可以提供提供一个「扩展名」，将从尾部的组件中移除它。

    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

    // 'baz'

<a name="method-fluent-str-before"></a>
#### `before` {.collection-method}

`before`方法返回字符串中指定值之前的所有内容：

    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->before('my name');

    // 'This is '

<a name="method-fluent-str-before-last"></a>
#### `beforeLast` {.collection-method}

`beforeLast` 方法返回字符串中指定值最后一次出现前的所有内容：

    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->beforeLast('is');

    // 'This '



<a name="method-fluent-str-between"></a>
#### `between` {.collection-method}

`between` 方法返回两个值之间的字符串部分：

    use Illuminate\Support\Str;

    $converted = Str::of('This is my name')->between('This', 'name');

    // ' is my '

<a name="method-fluent-str-camel"></a>
#### `camel` {.collection-method}

`camel` 方法将指定字符串转换为 `驼峰式` 表示方法：

    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->camel();

    // fooBar

<a name="method-fluent-str-contains"></a>
#### `contains` {.collection-method}

`contains` 方法判断指定字符串中是否包含另一指定字符串（区分大小写）：

    use Illuminate\Support\Str;

    $contains = Str::of('This is my name')->contains('my');

    // true

你也可以传递数组的值的形式来判断指定字符串是否包含数组中的任一值：

    use Illuminate\Support\Str;

    $contains = Str::of('This is my name')->contains(['my', 'foo']);

    // true

<a name="method-fluent-str-contains-all"></a>
#### `containsAll` {.collection-method}

`containsAll` 方法用于判断指定字符串是否包含指定数组中的所有值：

    use Illuminate\Support\Str;

    $containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

    // true

<a name="method-fluent-str-dirname"></a>
#### `dirname` {.collection-method}

`dirname` 方法用于返回指定字符串的父级目录部分：

    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname();

    // '/foo/bar'

你也可以指定你想要从字符串中删除多少个目录级别，该参数是可选的：

    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname(2);

    // '/foo'

<a name="method-fluent-str-excerpt"></a>
#### `excerpt` {.collection-method}

`excerpt` 方法从字符串中提取与该字符串中短语的第一个实例匹配的片段：

    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('my', [
        'radius' => 3
    ]);

    // '...is my na...'



`radius` 选项默认为 `100`，允许你定义应出现在截断字符串两侧的字符数。

此外，你也可以使用 `omission` 选项来更改将附加到截断字符串的字符串：

    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('name', [
        'radius' => 3,
        'omission' => '(...) '
    ]);

    // '(...) my name'

<a name="method-fluent-str-ends-with"></a>
#### `endsWith` {.collection-method}

`endsWith` 方法用于判断指定字符串是否以另一指定字符串结尾：

    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith('name');

    // true

你也可以传递数组的值的形式来判断指定字符串是否包含指定数组中的任一值：

    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith(['name', 'foo']);

    // true

    $result = Str::of('This is my name')->endsWith(['this', 'foo']);

    // false

<a name="method-fluent-str-exactly"></a>
#### `exactly` {.collection-method}

`exactly` 方法用于判断指定字符串是否与另一字符串完全匹配：

    use Illuminate\Support\Str;

    $result = Str::of('Laravel')->exactly('Laravel');

    // true

<a name="method-fluent-str-explode"></a>
#### `explode` {.collection-method}

`explode` 方法使用指定的分割符分割字符串，并返回包含字符串每个部分的集合：

    use Illuminate\Support\Str;

    $collection = Str::of('foo bar baz')->explode(' ');

    // collect(['foo', 'bar', 'baz'])

<a name="method-fluent-str-finish"></a>
#### `finish` {.collection-method}

`finish` 方法用于判断指定字符串末尾是否有特定字符，若没有，则将其添加到字符串末尾：

    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->finish('/');

    // this/string/

    $adjusted = Str::of('this/string/')->finish('/');

    // this/string/



<a name="method-fluent-str-is"></a>
#### `is` {.collection-method}

`is` 方法用于判断字符串是否与指定模式匹配。星号 `*` 用于表示通配符：

    use Illuminate\Support\Str;

    $matches = Str::of('foobar')->is('foo*');

    // true

    $matches = Str::of('foobar')->is('baz*');

    // false

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii` {.collection-method}

`isAscii` 方法用于判断指定字符串是否是 ASCII 字符串：

    use Illuminate\Support\Str;

    $result = Str::of('Taylor')->isAscii();

    // true

    $result = Str::of('ü')->isAscii();

    // false

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty` {.collection-method}

`isEmpty` 方法用于判断指定字符串是否为空：

    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isEmpty();

    // true

    $result = Str::of('Laravel')->trim()->isEmpty();

    // false

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty` {.collection-method}

`isNotEmpty` 方法用于判断指定字符串是否不为空：

    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isNotEmpty();

    // false

    $result = Str::of('Laravel')->trim()->isNotEmpty();

    // true

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid` {.collection-method}

`isUuid` 方法确定给定字符串是否为 UUID：

    use Illuminate\Support\Str;

    $result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

    // true

    $result = Str::of('Taylor')->isUuid();

    // false

<a name="method-fluent-str-kebab"></a>
#### `kebab` {.collection-method}

`kebab` 方法将指定字符串转换为 `烤串式( kebab-case )` 表示形式：

    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->kebab();

    // foo-bar

<a name="method-fluent-str-length"></a>
#### `length` {.collection-method}

`length` 方法返回指定字符串的长度：

    use Illuminate\Support\Str;

    $length = Str::of('Laravel')->length();

    // 7



<a name="method-fluent-str-limit"></a>
#### `limit` {.collection-method}

`limit` 方法用于将指定字符串切割为指定长度：

    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

    // The quick brown fox...

你也可以通过第二个参数来改变追加到末尾的字符串：

    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

    // The quick brown fox (...)

<a name="method-fluent-str-lower"></a>
#### `lower` {.collection-method}

`lower` 方法将指定字符串转换为小写：

    use Illuminate\Support\Str;

    $result = Str::of('LARAVEL')->lower();

    // 'laravel'

<a name="method-fluent-str-ltrim"></a>
#### `ltrim` {.collection-method}

`ltrim` 方法移除字符串左端指定的字符：

    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->ltrim();

    // 'Laravel  '

    $string = Str::of('/Laravel/')->ltrim('/');

    // 'Laravel/'

<a name="method-fluent-str-markdown"></a>
#### `markdown` {.collection-method}

`markdown` 方法将 Github 风格的 Markdown 转换为 HTML：

    use Illuminate\Support\Str;

    $html = Str::of('# Laravel')->markdown();

    // <h1>Laravel</h1>

    $html = Str::of('# Taylor <b>Otwell</b>')->markdown([
        'html_input' => 'strip',
    ]);

    // <h1>Taylor Otwell</h1>

<a name="method-fluent-str-mask"></a>
#### `mask` {.collection-method}

`mask` 方法用重复字符掩盖字符串的一部分，并可用于混淆字符串段，例如电子邮件地址和电话号码：

    use Illuminate\Support\Str;

    $string = Str::of('taylor@example.com')->mask('*', 3);

    // tay***************

如果需要，你可以提供一个负数作为 `mask` 方法的第三个参数，这将指示该方法在距字符串末尾的给定距离处开始屏蔽：

    $string = Str::of('taylor@example.com')->mask('*', -15, 3);

    // tay***@example.com



<a name="method-fluent-str-match"></a>
#### `match` {.collection-method}

`match` 方法将会返回字符串和指定正则表达式匹配的部分：

    use Illuminate\Support\Str;

    $result = Str::of('foo bar')->match('/bar/');

    // 'bar'

    $result = Str::of('foo bar')->match('/foo (.*)/');

    // 'bar'

<a name="method-fluent-str-match-all"></a>
#### `matchAll` {.collection-method}

`matchAll` 方法将会返回一个集合，该集合包含了指定字符串中与指定正则表达式匹配的部分：

    use Illuminate\Support\Str;

    $result = Str::of('bar foo bar')->matchAll('/bar/');

    // collect(['bar', 'bar'])

如果你在正则表达式中指定了一个匹配组， Laravel 将会返回与该组匹配的集合：

    use Illuminate\Support\Str;

    $result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

    // collect(['un', 'ly']);

如果没有找到任何匹配项，则返回空集合。

<a name="method-fluent-str-padboth"></a>
#### `padBoth` {.collection-method}

`padBoth` 方法包装了 PHP 的 `str_pad` 函数，在指定字符串的两侧填充上另一字符串，直至该字符串到达指定的长度：

    use Illuminate\Support\Str;

    $padded = Str::of('James')->padBoth(10, '_');

    // '__James___'

    $padded = Str::of('James')->padBoth(10);

    // '  James   '

<a name="method-fluent-str-padleft"></a>
#### `padLeft` {.collection-method}

The `padLeft` 方法包装了 PHP 的 `str_pad` 函数，在指定字符串的左侧填充上另一字符串，直至该字符串到达指定的长度：

    use Illuminate\Support\Str;

    $padded = Str::of('James')->padLeft(10, '-=');

    // '-=-=-James'

    $padded = Str::of('James')->padLeft(10);

    // '     James'



<a name="method-fluent-str-padright"></a>
#### `padRight` {.collection-method}

`padRight` 方法包装了 PHP 的 str_pad 函数，在指定字符串的右侧填充上另一字符串，直至该字符串到达指定的长度：

    use Illuminate\Support\Str;

    $padded = Str::of('James')->padRight(10, '-');

    // 'James-----'

    $padded = Str::of('James')->padRight(10);

    // 'James     '

<a name="method-fluent-str-pipe"></a>
#### `pipe` {.collection-method}

`pipe` 方法通过将字符串的当前值传递给给定的匿名函数来转换字符串：

    use Illuminate\Support\Str;

    $hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

    // 'Checksum: a5c95b86291ea299fcbe64458ed12702'

    $closure = Str::of('foo')->pipe(function ($str) {
        return 'bar';
    });

    // 'bar'

<a name="method-fluent-str-plural"></a>
#### `plural` {.collection-method}

`plural` 方法将单数形式的字符串转换为复数形式。目前该函数仅支持英语：

    use Illuminate\Support\Str;

    $plural = Str::of('car')->plural();

    // cars

    $plural = Str::of('child')->plural();

    // children

你也可以给该函数提供一个整数作为第二个参数用于检索单数或复数形式：

    use Illuminate\Support\Str;

    $plural = Str::of('child')->plural(2);

    // children

    $plural = Str::of('child')->plural(1);

    // child

<a name="method-fluent-str-prepend"></a>
#### `prepend` {.collection-method}

`prepend` 方法用于在指定字符串的开头插入另一指定字符串：

    use Illuminate\Support\Str;

    $string = Str::of('Framework')->prepend('Laravel ');

    // Laravel Framework

<a name="method-fluent-str-remove"></a>
#### `remove` {.collection-method}

`remove` 方法从字符串中删除给定的值或值数组：

    use Illuminate\Support\Str;

    $string = Str::of('Arkansas is quite beautiful!')->remove('quite');

    // Arkansas is beautiful!



你还可以传递 `false` 作为第二个参数以在删除字符串时忽略大小写。

<a name="method-fluent-str-replace"></a>
#### `replace` {.collection-method}

`replace` 方法用于将字符串中的指定字符串替换为另一指定字符串：

    use Illuminate\Support\Str;

    $replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

    // Laravel 7.x

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray` {.collection-method}

`replaceArray` 方法使用数组顺序替换字符串中的给定值：

    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

    // The event will take place between 8:30 and 9:00

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst` {.collection-method}

`replaceFirst`方法替换字符串中给定值的第一个匹配项：

    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

    // a quick brown fox jumps over the lazy dog

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast` {.collection-method}

`replaceLast`方法替换字符串中给定值的最后一次出现：

    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

    // the quick brown fox jumps over a lazy dog

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches` {.collection-method}

`replaceMatches`方法用给定的替换字符串替换与模式匹配的字符串的所有部分：

    use Illuminate\Support\Str;

    $replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

    // '15015551000'

`replaceMatches`方法还接受一个闭包，该闭包将被与给定模式匹配的字符串的每个部分调用，从而允许你在闭包中执行替换逻辑并返回替换的值：

    use Illuminate\Support\Str;

    $replaced = Str::of('123')->replaceMatches('/\d/', function ($match) {
        return '['.$match[0].']';
    });

    // '[1][2][3]'



<a name="method-fluent-str-rtrim"></a>
#### `rtrim` {.collection-method}

`rtrim`方法修剪给定字符串的右侧：

    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->rtrim();

    // '  Laravel'

    $string = Str::of('/Laravel/')->rtrim('/');

    // '/Laravel'

<a name="method-fluent-str-scan"></a>
#### `scan` {.collection-method}

`scan` 方法根据 [`sscanf` PHP function](https://www.php.net/manual/en/function.sscanf.php) 支持的格式将字符串中的输入解析为集合：

    use Illuminate\Support\Str;

    $collection = Str::of('filename.jpg')->scan('%[^.].%s');

    // collect(['filename', 'jpg'])

<a name="method-fluent-str-singular"></a>
#### `singular` {.collection-method}

`singular` 方法将字符串转换为其单数形式。此函数当前仅支持英语：

    use Illuminate\Support\Str;

    $singular = Str::of('cars')->singular();

    // car

    $singular = Str::of('children')->singular();

    // child

<a name="method-fluent-str-slug"></a>
#### `slug` {.collection-method}

`slug` 方法从给定字符串生成URL友好的 `slug`：

    use Illuminate\Support\Str;

    $slug = Str::of('Laravel Framework')->slug('-');

    // laravel-framework

<a name="method-fluent-str-snake"></a>
#### `snake` {.collection-method}

`snake`方法将给定字符串转换为`snake_case`：

    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->snake();

    // foo_bar

<a name="method-fluent-str-split"></a>
#### `split` {.collection-method}

`split` 方法使用正则表达式将字符串拆分为集合：

    use Illuminate\Support\Str;

    $segments = Str::of('one, two, three')->split('/[\s,]+/');

    // collect(["one", "two", "three"])

<a name="method-fluent-str-start"></a>
#### `start` {.collection-method}

`start` 方法将给定值的单个实例添加到字符串中，前提是该字符串尚未以该值开头：

    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->start('/');

    // /this/string

    $adjusted = Str::of('/this/string')->start('/');

    // /this/string



<a name="method-fluent-str-starts-with"></a>
#### `startsWith` {.collection-method}

`startsWith`方法确定给定字符串是否以给定值开头：

    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->startsWith('This');

    // true

<a name="method-fluent-str-studly"></a>
#### `studly` {.collection-method}

`studly`方法将给定字符串转换为`StudlyCase`：

    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->studly();

    // FooBar

<a name="method-fluent-str-substr"></a>
#### `substr` {.collection-method}

`substr`方法返回由给定的起始参数和长度参数指定的字符串部分：

    use Illuminate\Support\Str;

    $string = Str::of('Laravel Framework')->substr(8);

    // Framework

    $string = Str::of('Laravel Framework')->substr(8, 5);

    // Frame

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace` {.collection-method}

`substrReplace` 方法在字符串的一部分中替换文本，从第二个参数指定的位置开始替换第三个参数指定的字符数。将 `0` 传递给方法的第三个参数将在指定位置插入字符串，而不替换字符串中的任何现有字符：

    use Illuminate\Support\Str;

    $string = Str::of('1300')->substrReplace(':', 2);

    // 13:

    $string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

    // The Laravel Framework

<a name="method-fluent-str-swap"></a>
#### `swap` {.collection-method}

`swap` 方法使用 PHP 的 `strtr` 函数替换字符串中的多个值：

    use Illuminate\Support\Str;

    $string = Str::of('Tacos are great!')
        ->swap([
            'Tacos' => 'Burritos',
            'great' => 'fantastic',
        ]);

    // Burritos are fantastic!

<a name="method-fluent-str-tap"></a>
#### `tap` {.collection-method}

`tap`方法将字符串传递给给定的闭包，允许你在不影响字符串本身的情况下检查字符串并与之交互。`tap`方法返回原始字符串，而不管闭包返回什么：

    use Illuminate\Support\Str;

    $string = Str::of('Laravel')
        ->append(' Framework')
        ->tap(function ($string) {
            dump('String after append: ' . $string);
        })
        ->upper();

    // LARAVEL FRAMEWORK



<a name="method-fluent-str-test"></a>
#### `test` {.collection-method}

`test` 方法确定字符串是否与给定的正则表达式模式匹配：

    use Illuminate\Support\Str;

    $result = Str::of('Laravel Framework')->test('/Laravel/');

    // true

<a name="method-fluent-str-title"></a>
#### `title` {.collection-method}

`title`方法将给定字符串转换为`title Case`：

    use Illuminate\Support\Str;

    $converted = Str::of('a nice title uses the correct case')->title();

    // A Nice Title Uses The Correct Case

<a name="method-fluent-str-trim"></a>
#### `trim` {.collection-method}

`trim`方法修剪给定字符串：

    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->trim();

    // 'Laravel'

    $string = Str::of('/Laravel/')->trim('/');

    // 'Laravel'

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst` {.collection-method}

`ucfirst`方法返回第一个字符大写的给定字符串：

    use Illuminate\Support\Str;

    $string = Str::of('foo bar')->ucfirst();

    // Foo bar

<a name="method-fluent-str-upper"></a>
#### `upper` {.collection-method}

`upper`方法将给定字符串转换为大写：

    use Illuminate\Support\Str;

    $adjusted = Str::of('laravel')->upper();

    // LARAVEL

<a name="method-fluent-str-when"></a>
#### `when` {.collection-method}

如果给定的条件为`true`，则`when`方法调用给定的闭包。闭包将接收一个流畅字符串实例：

    use Illuminate\Support\Str;

    $string = Str::of('Taylor')
                    ->when(true, function ($string) {
                        return $string->append(' Otwell');
                    });

    // 'Taylor Otwell'

如果需要，可以将另一个闭包作为第三个参数传递给`when`方法。如果条件参数的计算结果为`false`，则将执行此闭包。

<a name="method-fluent-str-when-contains"></a>
#### `whenContains` {.collection-method}

`whenContains` 方法会在字符串包含给定的值的前提下，调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('tony stark')
                ->whenContains('tony', function ($string) {
                    return $string->title();
                });

    // 'Tony Stark'

如有必要，你可以将另一个闭包作为第三个参数传递给 `when` 方法。如果字符串不包含给定值，则此闭包将执行。


你还可以传递一个值数组来确定给定的字符串是否包含数组中的任何值：

    use Illuminate\Support\Str;

    $string = Str::of('tony stark')
                ->whenContains(['tony', 'hulk'], function ($string) {
                    return $string->title();
                });

    // Tony Stark

<a name="method-fluent-str-when-contains-all"></a>
#### `whenContainsAll` {.collection-method}

`whenContainsAll` 方法会在字符串包含所有给定的子字符串时，调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('tony stark')
                    ->whenContainsAll(['tony', 'stark'], function ($string) {
                        return $string->title();
                    });

    // 'Tony Stark'

如有必要，你可以将另一个闭包作为第三个参数传递给 `when` 方法。如果条件参数评估为 `false`，则此闭包将执行。

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty` {.collection-method}

如果字符串为空，`whenEmpty`方法将调用给定的闭包。如果闭包返回一个值，`whenEmpty`方法也将返回该值。如果闭包不返回值，则将返回字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('  ')->whenEmpty(function ($string) {
        return $string->trim()->prepend('Laravel');
    });

    // 'Laravel'

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty` {.collection-method}

如果字符串不为空，`whenNotEmpty` 方法会调用给定的闭包。如果闭包返回一个值，那么 `whenNotEmpty` 方法也将返回该值。如果闭包没有返回值，则返回字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('Framework')->whenNotEmpty(function ($string) {
        return $string->prepend('Laravel ');
    });

    // 'Laravel Framework'



<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith` {.collection-method}

如果字符串以给定的子字符串开头，`whenStartsWith` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('disney world')->whenStartsWith('disney', function ($string) {
        return $string->title();
    });

    // 'Disney World'

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith` {.collection-method}

如果字符串以给定的子字符串结尾，`whenEndsWith` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('disney world')->whenEndsWith('world', function ($string) {
        return $string->title();
    });

    // 'Disney World'

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly` {.collection-method}

如果字符串与给定字符串完全匹配，`whenExactly` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('laravel')->whenExactly('laravel', function ($string) {
        return $string->title();
    });

    // 'Laravel'

<a name="method-fluent-str-when-is"></a>
#### `whenIs` {.collection-method}

如果字符串匹配给定的模式，`whenIs` 方法会调用给定的闭包。星号可用作通配符值。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('foo/bar')->whenIs('foo/*', function ($string) {
        return $string->append('/baz');
    });

    // 'foo/bar/baz'

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii` {.collection-method}

如果字符串是 7 位 ASCII，`whenIsAscii` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('foo/bar')->whenIsAscii('laravel', function ($string) {
        return $string->title();
    });

    // 'Laravel'

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid` {.collection-method}



如果字符串是有效的 UUID，`whenIsUuid` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('foo/bar')->whenIsUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', function ($string) {
        return $string->substr(0, 8);
    });

    // 'a0a2a2d2'

<a name="method-fluent-str-when-test"></a>
#### `whenTest` {.collection-method}

如果字符串匹配给定的正则表达式，`whenTest` 方法会调用给定的闭包。闭包将接收字符流处理实例：

    use Illuminate\Support\Str;

    $string = Str::of('laravel framework')->whenTest('/laravel/', function ($string) {
        return $string->title();
    });

    // 'Laravel Framework'

<a name="method-fluent-str-word-count"></a>
#### `wordCount` {.collection-method}

`wordCount` 方法返回字符串包含的单词数：

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words` {.collection-method}

`words`方法限制字符串中的字数。如有必要，可以指定附加到截断字符串的附加字符串：

    use Illuminate\Support\Str;

    $string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

    // Perfectly balanced, as >>>

<a name="urls"></a>
## URLs

<a name="method-action"></a>
#### `action()` {.collection-method}

`action`函数为给定的控制器操作生成URL：

    use App\Http\Controllers\HomeController;

    $url = action([HomeController::class, 'index']);

如果该方法接受路由参数，则可以将它们作为第二个参数传递给该方法：

    $url = action([UserController::class, 'profile'], ['id' => 1]);

<a name="method-asset"></a>
#### `asset()` {.collection-method}



`asset`函数使用请求的当前方案（HTTP或HTTPS）为资产生成URL：

    $url = asset('img/photo.jpg');

你可以通过在`.env`文件中设置`ASSET_URL`变量来配置资产URL主机。如果你将资产托管在外部服务（如 Amazon S3 或其他 CDN）上，这将非常有用：

    // ASSET_URL=http://example.com/assets

    $url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg

<a name="method-route"></a>
#### `route()` {.collection-method}

`route`函数为给定的 [命名路由](/docs/laravel/9.x/routing#named-routes)：

    $url = route('route.name');

如果路由接受参数，则可以将其作为第二个参数传递给函数：

    $url = route('route.name', ['id' => 1]);

默认情况下，`route`函数生成一个绝对URL。如果要生成相对URL，可以将`false`作为第三个参数传递给函数：

    $url = route('route.name', ['id' => 1], false);

<a name="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

The `secure_asset` function generates a URL for an asset using HTTPS:

    $url = secure_asset('img/photo.jpg');

<a name="method-secure-url"></a>
#### `secure_url()` {.collection-method}

`secure_url` 函数为给定路径生成一个完全限定的 HTTPS URL。额外的 URL 段可以在函数的第二个参数中传递：

    $url = secure_url('user/profile');

    $url = secure_url('user/profile', [1]);

<a name="method-to-route"></a>
#### `to_route()` {.collection-method}

`to_route` 函数为给定的 [命名路由](/docs/laravel/9.x/routing#named-routes) 生成 [重定向 HTTP 响应](/docs/laravel/9.x/responses#redirects)：

    return to_route('users.show', ['user' => 1]);



如有必要，你可以将应分配给重定向的 HTTP 状态代码和任何其他响应头作为第三和第四个参数传递给 `to_route` 方法：

    return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);

<a name="method-url"></a>
#### `url()` {.collection-method}

使用 `url` 辅助方法生成指定路径的全路径 URL：

    $url = url('user/profile');

    $url = url('user/profile', [1]);

如果没有指定路径，则返回 `Illuminate\Routing\UrlGenerator` 实例：

    $current = url()->current();

    $full = url()->full();

    $previous = url()->previous();

<a name="miscellaneous"></a>
## 杂项

<a name="method-abort"></a>
#### `abort()` {.collection-method}

使用 `abort` 方法抛出[一个 HTTP 异常](/docs/laravel/9.x/errors#http-exceptions)交给[异常处理](/docs/laravel/9.x/errors#the-exception-handler)：

    abort(403);

你还可以提供应发送到浏览器的异常消息和自定义 HTTP 响应标头：

    abort(403, 'Unauthorized.', $headers);

<a name="method-abort-if"></a>
#### `abort_if()` {.collection-method}

如果给定的布尔表达式评估为`true`，`abort_if`函数将引发HTTP异常：

    abort_if(! Auth::user()->isAdmin(), 403);

像`abort`方法一样，你也可以将异常的响应文本作为第三个参数，并将自定义响应标头的数组作为该函数的第四个参数。

<a name="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

如果给定的布尔表达式评估为` false`，则`abort_unless`函数将引发 HTTP 异常：

    abort_unless(Auth::user()->isAdmin(), 403);

像`abort`方法一样，你也可以将异常的响应文本作为第三个参数，并将自定义响应标头的数组作为该函数的第四个参数。



<a name="method-app"></a>
#### `app()` 

`app` 方法返回 [服务容器](/docs/laravel/9.x/container) 实例：

    $container = app();

你可以传递类或接口名称来从容器中解析它：

    $api = app('HelpSpot\API');

<a name="method-auth"></a>
#### `auth()` {.collection-method}

`auth` 函数返回一个 [认证器](/docs/laravel/9.x/authentication) 实例. 你可以使用它来替代 `Auth` 门面：

    $user = auth()->user();

如果需要，你可以指定你想要访问的认证实例：

    $user = auth('admin')->user();

<a name="method-back"></a>
#### `back()` {.collection-method}

`back` 函数生成一个 [重定向 HTTP 响应](/docs/laravel/9.x/responses#redirects) 到用户之前的位置

    return back($status = 302, $headers = [], $fallback = '/');

    return back();

<a name="method-bcrypt"></a>
#### `bcrypt()` {.collection-method}

The `bcrypt` 函数 [哈希](/docs/laravel/9.x/hashing) 使用 Bcrypt 对给定的值进行散列。 你可以使用它替代 `Hash` 门面：

    $password = bcrypt('my-secret-password');

<a name="method-blank"></a>
#### `blank()` {.collection-method}

`blank` 函数判断给定的值是否为空：

    blank('');
    blank('   ');
    blank(null);
    blank(collect());

    // true

    blank(0);
    blank(true);
    blank(false);

    // false

如果想使用与 `blank`, 函数相反的方法，请看 [`filled`](#method-filled) 函数.

<a name="method-broadcast"></a>
#### `broadcast()` {.collection-method}

`broadcast` 函数将 [广播](/docs/laravel/9.x/broadcasting) 给定的 [事件](/docs/laravel/9.x/events) 到它的监听器：

    broadcast(new UserRegistered($user));

    broadcast(new UserRegistered($user))->toOthers();

<a name="method-cache"></a>
#### `cache()` {.collection-method}

`cache` 函数可以从 [缓存](/docs/laravel/9.x/cache) 中获取值, 如果缓存中给定的键不存在，将返回一个可选的默认值：

    $value = cache('key');

    $value = cache('key', 'default');



你可以通过向函数添加键值对数组来设置缓存项。与此同时，你还应该传递有效的秒数或者缓存的持续时间来设置缓存过期时间 ：

    cache(['key' => 'value'], 300);

    cache(['key' => 'value'], now()->addSeconds(10));

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {.collection-method}

`class_uses_recursive` 函数返回一个类使用的所有 traits, 包括它所有父类使用的 traits ：

    $traits = class_uses_recursive(App\Models\User::class);

<a name="method-collect"></a>
#### `collect()` {.collection-method}

`collect` 函数根据给定的值创建一个 [collection](/docs/laravel/9.x/collections) 实例：

    $collection = collect(['taylor', 'abigail']);

<a name="method-config"></a>
#### `config()` {.collection-method}

`config` 函数获取 [configuration](/docs/laravel/9.x/configuration) 变量的值。 可以使用「点」语法访问配置的值，其中包括文件的名称和访问的选项，如果访问的配置选项不存在，你可以指定一个默认值并且返回这个默认值：

    $value = config('app.timezone');

    $value = config('app.timezone', $default);

你也可以在运行时通过传递一个键／值对数组来设置配置变量, 但是，请注意，此函数仅影响当前请求的配置值，不会更新实际的配置值：

    config(['app.debug' => true]);

<a name="method-cookie"></a>
#### `cookie()` {.collection-method}

`cookie`  函数创建一个新的 [cookie](/docs/laravel/9.x/requests#cookies) 实例 ：

    $cookie = cookie('name', 'value', $minutes);

<a name="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

`csrf_field` 函数生成一个包含 CSRF 令牌值的 HTML 输入表单字段 `hidden` 。例如，使用 [Blade](/docs/laravel/9.x/blade)语法：

    {{ csrf_field() }}



<a name="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

`csrf_token` 函数获取当前 CSRF 令牌的值：

    $token = csrf_token();

<a name="method-decrypt"></a>
#### `decrypt()` {.collection-method}

`decrypt` 函数 [解密](/docs/laravel/9.x/encryption) 给定的值。你可以使用这个函数作为 `Crypt` 门面的替代：

    $password = decrypt($value);

<a name="method-dd"></a>
#### `dd()` {.collection-method}

`dd` 函数打印输出给定的变量并且结束脚本运行：

    dd($value);

    dd($value1, $value2, $value3, ...);

如果你不停止执行脚本，那么可以使用 [`dump`](#method-dump) 函数。

<a name="method-dispatch"></a>
#### `dispatch()` {.collection-method}

`dispatch` 函数将给定的 [任务](/docs/laravel/9.x/queues#creating-jobs) 推送到 Laravel [任务队列](/docs/laravel/9.x/queues)：

    dispatch(new App\Jobs\SendEmails);

<a name="method-dump"></a>
#### `dump()` {.collection-method}

`dump` 打印给定的变量：

    dump($value);

    dump($value1, $value2, $value3, ...);

如果你想要在打印后停止执行脚本，可以使用 [`dd`](#method-dd) 函数。

<a name="method-encrypt"></a>
#### `encrypt()` {.collection-method}

`encrypt` 函数 [加密](/docs/laravel/9.x/encryption) 给定的值。你可以使用这个函数作为 `Crypt`  门面的替代：

    $secret = encrypt('my-secret-value');

<a name="method-env"></a>
#### `env()` {.collection-method}

`env` 函数可以获取 [环境变量](/docs/laravel/9.x/configuration#environment-configuration) 配置的值或者返回默认值：

    $env = env('APP_ENV');

    $env = env('APP_ENV', 'production');

> 注意：如果你在部署过程中执行了 `config:cache` 命令 , 那么你应该确保只从配置文件中调用 `env` 函数. 一旦配置被缓存， `.env` 文件将不再次加载，所有对 `env` 函数的调用将返回 `null`。



<a name="method-event"></a>
#### `event()` {.collection-method}

`event`函数向监听器派发给定 [事件](/docs/laravel/9.x/events) ：

    event(new UserRegistered($user));

<a name="method-filled"></a>
#### `filled()` {.collection-method}

`filled` 函数返回是否不为「空」：

    filled(0);
    filled(true);
    filled(false);

    // true

    filled('');
    filled('   ');
    filled(null);
    filled(collect());

    // false

对于作用与 `filled`, 相反的方法，可以查看 [`blank`](#method-blank) 方法。

<a name="method-info"></a>
#### `info()` {.collection-method}

`info` 函数将信息写入 [log](/docs/laravel/9.x/logging)：

    info('Some helpful information!');

可以将上下文数据数组传递给此函数：

    info('User login attempt failed.', ['id' => $user->id]);

<a name="method-logger"></a>
#### `logger()` {.collection-method}

`logger` 函数可以被用于将 `debug` 级别的消息写入 [log](/docs/laravel/9.x/logging)：

    logger('Debug message');

上下文数据数组也可以传递给函数：

    logger('User has logged in.', ['id' => $user->id]);

如果不带参数调用此函数，它将返回 [logger](/docs/laravel/9.x/errors#logging) 实例：

    logger()->error('You are not allowed here.');

<a name="method-method-field"></a>
#### `method_field()` {.collection-method}

`method_field` 函数生成包含模仿表单 HTTP 动作的 HTML `hidden` 域。下面的例子使用了 [Blade 语法](/docs/laravel/9.x/blade)：

    <form method="POST">
        {{ method_field('DELETE') }}
    </form>

<a name="method-now"></a>
#### `now()` {.collection-method}

`now` 函数为当前时间创建一个新的 `Illuminate\Support\Carbon` 实例：

    $now = now();

<a name="method-old"></a>


#### `old()` {.collection-method}

`old` 函数 [获取](/docs/laravel/9.x/requests#retrieving-input) 写入 `session` 的 [旧的输入值](/docs/laravel/9.x/requests#old-input) ：

    $value = old('value');

    $value = old('value', 'default');

<a name="method-optional"></a>
#### `optional()` {.collection-method}

`optional` 函数接受任何参数，并允许你访问该对象的属性或调用方法。如果给定的对象为 null，属性和方法将返回 null 而不是导致错误：

    return optional($user->address)->street;

    {!! old('name', optional($user)->name) !!}

`optional` 函数也接受闭包作为第二个参数。如果第一个参数提供的值不为空，闭包将被调用：

    return optional(User::find($id), function ($user) {
        return $user->name;
    });

<a name="method-policy"></a>
#### `policy()` {.collection-method}

`policy` 方法为给定的类获取 [policy](/docs/laravel/9.x/authorization#creating-policies) 实例

    $policy = policy(App\Models\User::class);

<a name="method-redirect"></a>
#### `redirect()` {.collection-method}

`redirect` 函数返回 [重定向 HTTP 响应](/docs/laravel/9.x/responses#redirects)，如果不带参数调用则返回重定向器实例：

    return redirect($to = null, $status = 302, $headers = [], $https = null);

    return redirect('/home');

    return redirect()->route('route.name');

<a name="method-report"></a>
#### `report()` {.collection-method}

`report` 函数使用 [异常处理器](/docs/laravel/9.x/errors#the-exception-handler) 的 `report` 方法报告异常：

    report($e);

`report` 函数也接受一个字符串作为参数。当给函数一个字符串时，函数将创建一个异常，并将该字符串作为其消息：

    report('Something went wrong.');



<a name="method-request"></a>
#### `request()` {.collection-method}

`request` 函数返回当前的 [request](/docs/laravel/9.x/requests)实例或从当前请求中获取输入字段的值：

    $request = request();

    $value = request('key', $default);

<a name="method-rescue"></a>
#### `rescue()` {.collection-method}

`rescue` 函数执行给定的闭包，并且捕获其执行过程中引发的任何异常。捕获的所有异常都将传递给 [异常处理器](/docs/laravel/9.x/errors#the-exception-handler)；然后继续处理此次请求：

    return rescue(function () {
        return $this->method();
    });

还可以为其传递第二个参数。这个参数将作为执行闭包引发异常时的「默认」值：

    return rescue(function () {
        return $this->method();
    }, false);

    return rescue(function () {
        return $this->method();
    }, function () {
        return $this->failure();
    });

<a name="method-resolve"></a>
#### `resolve()` {.collection-method}

`resolve` 使用 [服务容器](/docs/laravel/9.x/container) 解析给定名称的类或接口的实例：

    $api = resolve('HelpSpot\API');

<a name="method-response"></a>
#### `response()` {.collection-method}

`response` 函数创建 [响应](/docs/laravel/9.x/responses) 实例，或者获取响应工厂的实例：

    return response('Hello World', 200, $headers);

    return response()->json(['foo' => 'bar'], 200, $headers);

<a name="method-retry"></a>
#### `retry()` {.collection-method}

`retry` 函数尝试执行给定的回调，直到达到给定的最大尝试阈值。如果回调没有抛出异常，回调返回值将被返回。如果回调抛出异常，将自动重试。达到最大尝试次数，将抛出异常：

    return retry(5, function () {
        // Attempt 5 times while resting 100ms between attempts...
    }, 100);



如果你想手动计算两次尝试之间休眠的毫秒数，您可以将闭包作为第三个参数传递给 `retry` 函数：

    return retry(5, function () {
        // ...
    }, function ($attempt) {
        return $attempt * 100;
    });

方便起见，你可以提供一个数组作为 `retry` 函数的第一个参数。该数组将用于确定后续尝试之间要休眠的毫秒数：

    return retry([100, 200] function () {
        // Sleep for 100ms on first retry, 200ms on second retry...
    });

要仅在特定条件下重试，你可以将闭包作为第四个参数传递给 `retry` 函数：

    return retry(5, function () {
        // ...
    }, 100, function ($exception) {
        return $exception instanceof RetryException;
    });

<a name="method-session"></a>
#### `session()` {.collection-method}

`session` 函数用于获取或设置 [session](/docs/laravel/9.x/session) 值：

    $value = session('key');

可以向该函数传递键值对数组来设置 session 值：

    session(['chairs' => 7, 'instruments' => 3]);

不带参数调用此函数，则返回 session 实例：

    $value = session()->get('key');

    session()->put('key', $value);

<a name="method-tap"></a>
#### `tap()` {.collection-method}

`tap` 函数接受两个参数： 任意 `$value` 和闭包。 `$value` 将被传递给闭包，并被 `tap` 函数返回。与闭包的返回值无关：

    $user = tap(User::first(), function ($user) {
        $user->name = 'taylor';

        $user->save();
    });

如果没有向 `tap` 函数传递闭包，可以调用给定 `$value` 的任意方法。调用此方法的返回值永远是 `$value` ，无论方法在其定义中返回什么。例如，Eloquent 的 `update` 方法指定返回一个整数。但是，我们可以通过 `tap` 函数链式调用 `update` 方法强制其返回模型自身：

    $user = tap($user)->update([
        'name' => $name,
        'email' => $email,
    ]);



要向类中添加 `tap` 方法，可以将 `Illuminate\Support\Traits\Tappable` 特征添加到类中。 此特征的 `tap` 方法接受闭包作为其唯一参数。 对象实例本身将传递给闭包，然后由 `tap` 方法返回：

    return $user->tap(function ($user) {
        //
    });

<a name="method-throw-if"></a>
#### `throw_if()` {.collection-method}

在给定的布尔表达式结果为 `true` 时，`throw_if` 函数抛出给定的异常：

    throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

    throw_if(
        ! Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page.'
    );

<a name="method-throw-unless"></a>
#### `throw_unless()` {.collection-method}

在给定的布尔表达式结果为 `false` 时，`throw_unless` 函数抛出给定的异常：

    throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

    throw_unless(
        Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page.'
    );

<a name="method-today"></a>
#### `today()` {.collection-method}

`today` 函数根据当前日期创建新的 `Illuminate\Support\Carbon` 实例：

    $today = today();

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.collection-method}

`trait_uses_recursive` 返回被 `trait` 使用的全部 `trait`：

    $traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);

<a name="method-transform"></a>
#### `transform()` {.collection-method}

`transform` 函数执行基于（非[空](#method-blank)）给定值的 闭包，并返回闭包的结果：

    $callback = function ($value) {
        return $value * 2;
    };

    $result = transform(5, $callback);

    // 10

还可以传递一个默认值或闭包作为该函数的第三个参数。如果给定的值为空时，返回该值：

    $result = transform(null, $callback, 'The value is blank');

    // The value is blank



<a name="method-validator"></a>
#### `validator()` {.collection-method}

`validator` 函数根据指定的参数创建一个新的 [验证器](/docs/laravel/9.x/validation) 实例。方便起见可以用它来代替 `Validator` facade：

    $validator = validator($data, $rules, $messages);

<a name="method-value"></a>
#### `value()` {.collection-method}

`value` 函数返回给定值。如果传递闭包给此函数，将执行闭包并返回闭包调用的结果：

    $result = value(true);

    // true

    $result = value(function () {
        return false;
    });

    // false

<a name="method-view"></a>
#### `view()` {.collection-method}

`view` 函数获取一个 [视图](/docs/laravel/9.x/views) 实例：

    return view('auth.login');

<a name="method-with"></a>
#### `with()` {.collection-method}

`with` 函数返回给定的值。如果传递了一个 `闭包` 给第二个参数，那么会返回 `闭包` 执行的结果：

    $callback = function ($value) {
        return is_numeric($value) ? $value * 2 : 0;
    };

    $result = with(5, $callback);

    // 10

    $result = with(null, $callback);

    // 0

    $result = with(5, null);

    // 5

