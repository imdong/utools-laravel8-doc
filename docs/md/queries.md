# 数据库：查询生成器

-   [介绍](#introduction)
-   [运行数据库查询](#running-database-queries)
    -   [分块结果](#chunking-results)
    -   [延迟流式处理结果](#streaming-results-lazily)
    -   [聚合](#aggregates)
-   [Select 语句](#select-statements)
-   [原始表达式](#raw-expressions)
-   [Joins](#joins)
-   [Unions](#unions)
-   [基础 Where 语句](#basic-where-clauses)
    -   [条件查询语句](#where-clauses)
    -   [Or Where 语句](#or-where-clauses)
    -   [Where Not 语句](#where-not-clauses)
    -   [JSON Where 语句](#json-where-clauses)
    -   [附加 Where 语句](#additional-where-clauses)
    -   [逻辑分组](#logical-grouping)
-   [高级 Where 语句](#advanced-where-clauses)
    -   [Where Exists 语句](#where-exists-clauses)
    -   [子查询 Where 语句](#subquery-where-clauses)
    -   [全文 Where 子句](#full-text-where-clauses)
-   [排序、分组、限制和偏移量](#ordering-grouping-limit-and-offset)
    -   [排序](#ordering)
    -   [分组](#grouping)
    -   [Limit（限制） & Offset（偏移量）](#limit-and-offset)
-   [条件语句](#conditional-clauses)
-   [插入语句](#insert-statements)
    -   [更新插入](#upserts)
-   [更新语句](#update-statements)
    -   [更新 JSON 列](#updating-json-columns)
    -   [自增和自减](#increment-and-decrement)
-   [删除语句](#delete-statements)
-   [悲观锁](#pessimistic-locking)
-   [调试](#debugging)

<a name="introduction"></a>

## 介绍

Laravel 的数据库查询生成器提供了一种便捷、流畅的接口来创建和运行数据库查询。它可用于执行应用程序中的大多数数据库操作，并与 Laravel 支持的所有数据库系统完美配合使用。

Laravel 查询生成器使用 PDO 参数绑定来保护你的应用程序免受 SQL 注入攻击。无需清理或净化传递给查询生成器的字符串作为查询绑定。

> **警告**
> PDO 不支持绑定列名。因此，你不应该允许用户输入来决定查询引用的列名，包括 「order by」 列名。

<a name="running-database-queries"></a>

## 运行数据库查询

<a name="retrieving-all-rows-from-a-table"></a>
#### 从表中检索所有行

你可以使用 <code>DB</code> facade 提供的 <code>table</code> 方法开始查询。table 方法为指定的表返回一个链式查询构造器实例，允许在查询上链接更多约束，最后使用 <code>get</code> 方法检索查询结果：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 展示应用程序所有用户的列表
         */
        public function index(): View
        {
            $users = DB::table('users')->get();

            return view('user.index', ['users' => $users]);
        }
    }

<code>get</code> 方法返回包含查询结果的 <code>Illuminate\Support\Collection</code> 实例，每个结果都是 PHP <code>stdClass</code> 实例。可以将列作为对象的属性来访问每列的值：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->get();

    foreach ($users as $user) {
        echo $user->name;
    }

> **技巧:**  
> Laravel 集合提供了各种及其强大的方法来映射和裁剪数据。有关 Laravel 集合的更多信息，请查看 [集合文档](/docs/laravel/10.x/collections).

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 从表中检索单行或单列

如果只需要从数据表中检索单行，可以使用 <code>DB</code> facade 中的 <code>first</code> 方法。 此方法将返回单个 <code>stdClass</code> 对象

    $user = DB::table('users')->where('name', 'John')->first();

    return $user->email;



如果不想要整行，可以使用 `value` 方法从纪录中提取单个值。此方法将直接返回列的值：

    $email = DB::table('users')->where('name', 'John')->value('email');

如果要通过 `id` 字段值获取单行数据，可以使用 `find` 方法：

    $user = DB::table('users')->find(3);

<a name="retrieving-a-list-of-column-values"></a>
#### 获取某一列的值

如果要获取包含单列值的 `Illuminate\Support\Collection` 实例，则可以使用 `pluck` 方法。在下面的例子中，我们将获取角色表中标题的集合：

    use Illuminate\Support\Facades\DB;

    $titles = DB::table('users')->pluck('title');

    foreach ($titles as $title) {
        echo $title;
    }

你可以通过向 `pluck` 方法提供第二个参数来指定结果集中要作为键的列：

    $titles = DB::table('users')->pluck('title', 'name');

    foreach ($titles as $name => $title) {
        echo $title;
    }

<a name="chunking-results"></a>
### 分块结果

如果需要处理成千上万的数据库记录，请考虑使用 `DB` 提供的 `chunk` 方法。这个方法一次检索一小块结果，并将每个块反馈到闭包函数中进行处理。例如，让我们以一次 100 条记录的块为单位检索整个 `users` 表：

    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\DB;

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        foreach ($users as $user) {
            // ...
        }
    });

你可以通过从闭包中返回 `false` 来停止处理其余的块:

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        // 处理分块...

        return false;
    });



如果在对结果进行分块时更新数据库记录，那分块结果可能会以意想不到的方式更改。如果你打算在分块时更新检索到的记录，最好使用 `chunkById` 方法。此方法将根据记录的主键自动对结果进行分页:

    DB::table('users')->where('active', false)
        ->chunkById(100, function (Collection $users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['active' => true]);
            }
        });

> **注意**  
> 当在更新或删除块回调中的记录时，对主键或外键的任何更改都可能影响块查询。这可能会导致记录未包含在分块结果中。

<a name="streaming-results-lazily"></a>
### Lazily 流式传输结果

`lazy` 方法的工作方式类似于 [`chunk` 方法](#chunking-results)，因为它以块的形式执行查询。但是，`lazy()` 方法不是将每个块传递给回调，而是返回一个 [`LazyCollection`](/docs/laravel/10.x/collections#lazy-collections)，它可以让你与结果进行交互单个流：

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```
再一次，如果你打算在迭代它们时更新检索到的记录，最好使用 `lazyById` 或 `lazyByIdDesc` 方法。 这些方法将根据记录的主键自动对结果进行分页：

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> **注意**  
>在迭代记录时更新或删除记录时，对主键或外键的任何更改都可能影响块查询。这可能会导致记录不包含在结果中。



<a name="aggregates"></a>
### 聚合函数

查询构建器还提供了多种检索聚合值的方法，例如 `count`， `max`， `min`，`avg`和 `sum`。你可以在构建查询后调用这些方法中的任何一个：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->count();

    $price = DB::table('orders')->max('price');

当然，你可以将这些方法与其他子句结合起来，以优化计算聚合值的方式：

    $price = DB::table('orders')
                    ->where('finalized', 1)
                    ->avg('price');

<a name="determining-if-records-exist"></a>
#### 判断记录是否存在

除了通过 `count` 方法可以确定查询条件的结果是否存在之外，还可以使用  `exists` 和 `doesntExist` 方法：

    if (DB::table('orders')->where('finalized', 1)->exists()) {
        // ...
    }

    if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
        // ...
    }

<a name="select-statements"></a>
## Select 语句

<a name="specifying-a-select-clause"></a>
#### 指定一个 Select 语句

可能你并不总是希望从数据库表中获取所有列。 使用 `select` 方法，可以自定义一个 「select」 查询语句来查询指定的字段：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->select('name', 'email as user_email')
                ->get();

`distinct` 方法会强制让查询返回的结果不重复：

    $users = DB::table('users')->distinct()->get();

如果你已经有了一个查询构造器实例，并且希望在现有的查询语句中加入一个字段，那么你可以使用 `addSelect` 方法：

    $query = DB::table('users')->select('name');

    $users = $query->addSelect('age')->get();



<a name="raw-expressions"></a>
## 原生表达式

当你需要在查询中插入任意的字符串时，你可以使用 `DB` 门面提供的 `raw` 方法以创建原生表达式。

    $users = DB::table('users')
                 ->select(DB::raw('count(*) as user_count, status'))
                 ->where('status', '<>', 1)
                 ->groupBy('status')
                 ->get();

> **警告**  
> 原生语句作为字符串注入到查询中，因此必须格外小心避免产生 SQL 注入漏洞。

<a name="raw-methods"></a>
### 原生方法。

可以使用以下方法代替 `DB::raw`，将原生表达式插入查询的各个部分。**请记住，Laravel 无法保证所有使用原生表达式的查询都不受到 SQL 注入漏洞的影响。**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 方法可以用来代替 `addSelect(DB::raw(/* ... */))`。此方法接受一个可选的绑定数组作为其第二个参数：

    $orders = DB::table('orders')
                    ->selectRaw('price * ? as price_with_tax', [1.0825])
                    ->get();

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw` 和 `orWhereRaw` 方法可用于将原始 「where」子句注入你的查询。这些方法接受一个可选的绑定数组作为它们的第二个参数：

    $orders = DB::table('orders')
                    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                    ->get();

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw` 和 `orHavingRaw` 方法可用于提供原始字符串作为 「having」子句的值。这些方法接受一个可选的绑定数组作为它们的第二个参数：

    $orders = DB::table('orders')
                    ->select('department', DB::raw('SUM(price) as total_sales'))
                    ->groupBy('department')
                    ->havingRaw('SUM(price) > ?', [2500])
                    ->get();



<a name="orderbyraw"></a>
#### `orderByRaw`

orderByRaw 方法可用于将原生字符串设置为「order by」子句的值：

    $orders = DB::table('orders')
                    ->orderByRaw('updated_at - created_at DESC')
                    ->get();

<a name="groupbyraw"></a>
### `groupByRaw`

groupByRaw 方法可以用于将原生字符串设置为 `group by` 子句的值：

    $orders = DB::table('orders')
                    ->select('city', 'state')
                    ->groupByRaw('city, state')
                    ->get();

<a name="joins"></a>
## Joins

<a name="inner-join-clause"></a>
#### Inner Join 语句

查询构造器也还可用于向查询中添加连接子句。若要执行基本的「inner join」，你可以对查询构造器实例使用 `join` 方法。传递给 `join` 方法的第一个参数是需要你连接到的表的名称，而其余参数指定连接的列约束。你甚至还可以在一个查询中连接多个表：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->join('contacts', 'users.id', '=', 'contacts.user_id')
                ->join('orders', 'users.id', '=', 'orders.user_id')
                ->select('users.*', 'contacts.phone', 'orders.price')
                ->get();

<a name="left-join-right-join-clause"></a>
#### Left Join / Right Join 语句

如果你想使用「left join」或者「right join」代替「inner join」，可以使用 `leftJoin` 或者 `rightJoin` 方法。这两个方法与 `join` 方法用法相同：

    $users = DB::table('users')
                ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();

    $users = DB::table('users')
                ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();



<a name="cross-join-clause"></a>
#### Cross Join 语句

你可以使用 `crossJoin` 方法执行「交叉连接」。交叉连接在第一个表和被连接的表之间会生成笛卡尔积：

    $sizes = DB::table('sizes')
                ->crossJoin('colors')
                ->get();

<a name="advanced-join-clauses"></a>
#### 高级 Join 语句

你还可以指定更高级的联接子句。首先，将闭包作为第二个参数传递给 `join` 方法。闭包将收到一个 `Illuminate\Database\Query\JoinClause` 实例，该实例允许你指定对 `join` 子句的约束：

    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
            })
            ->get();

如果你想要在连接上使用「where」风格的语句，你可以在连接上使用 `JoinClause` 实例中的 `where` 和 `orWhere` 方法。这些方法会将列和值进行比较，而不是列和列进行比较：

    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')
                     ->where('contacts.user_id', '>', 5);
            })
            ->get();

<a name="subquery-joins"></a>
#### 子连接查询

你可以使用 `joinSub`，`leftJoinSub` 和 `rightJoinSub` 方法关联一个查询作为子查询。他们每一种方法都会接收三个参数：子查询、表别名和定义关联字段的闭包。如下面这个例子，获取含有用户最近一次发布博客时的 `created_at` 时间戳的用户集合：

    $latestPosts = DB::table('posts')
                       ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
                       ->where('is_published', true)
                       ->groupBy('user_id');

    $users = DB::table('users')
            ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
                $join->on('users.id', '=', 'latest_posts.user_id');
            })->get();



<a name="unions"></a>
## 联合

查询构造器还提供了一种简洁的方式将两个或者多个查询「联合」在一起。例如，你可以先创建一个查询，然后使用 `union` 方法来连接更多的查询：

    use Illuminate\Support\Facades\DB;

    $first = DB::table('users')
                ->whereNull('first_name');

    $users = DB::table('users')
                ->whereNull('last_name')
                ->union($first)
                ->get();

查询构造器不仅提供了 `union` 方法，还提供了一个 `unionAll` 方法。当查询结合 `unionAll` 方法使用时，将不会删除重复的结果。`unionAll` 方法的用法和 `union` 方法一样。

<a name="basic-where-clauses"></a>
## 基础的 Where 语句

<a name="where-clauses"></a>
### Where 语句

你可以在 `where` 语句中使用查询构造器的 `where` 方法。调用 `where` 方法需要三个基本参数。第一个参数是字段的名称。第二个参数是一个操作符，它可以是数据库中支持的任意操作符。第三个参数是与字段比较的值。

例如。在 `users` 表中查询 `votes` 字段等于 `100` 并且 `age` 字段大于 `35` 的数据：

    $users = DB::table('users')
                    ->where('votes', '=', 100)
                    ->where('age', '>', 35)
                    ->get();

为了方便起见。如果你想要比较一个字段的值是否 `等于` 给定的值。你可以将这个给定的值作为第二个参数传递给 `where` 方法。那么，Laravel 会默认使用 `=` 操作符：

    $users = DB::table('users')->where('votes', 100)->get();



如上所述，你可以使用数据库支持的任意操作符：

    $users = DB::table('users')
                    ->where('votes', '>=', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('votes', '<>', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('name', 'like', 'T%')
                    ->get();

你也可以将一个条件数组传递给 `where` 方法。数组的每个元素都应该是一个数组，其中包是传递给 `where` 方法的三个参数：

    $users = DB::table('users')->where([
        ['status', '=', '1'],
        ['subscribed', '<>', '1'],
    ])->get();

> **注意**
> PDO 不支持绑定字段名。因此，你不应该允许让用户输入字段名进行查询引用，包括结果集「order by」语句。

<a name="or-where-clauses"></a>
### Or Where 语句

当链式调用多个 `where` 方法的时候，这些「where」语句将会被看成是 `and` 关系。另外，你也可以在查询语句中使用 `orWhere` 方法来表示 `or` 关系。orWhere 方法接收的参数和 where 方法接收的参数一样：

    $users = DB::table('users')
                        ->where('votes', '>', 100)
                        ->orWhere('name', 'John')
                        ->get();

如果你需要在括号内对 「or」 条件进行分组，那么可以传递一个闭包作为 `orWhere` 方法的第一个参数：

    $users = DB::table('users')
                ->where('votes', '>', 100)
                ->orWhere(function(Builder $query) {
                    $query->where('name', 'Abigail')
                          ->where('votes', '>', 50);
                })
                ->get();

上面的示例将生成以下 SQL：

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> **注意**
> 为避免全局作用域应用时出现意外，你应始终对 `orWhere` 调用进行分组。


<a name="where-not-clauses"></a>
### Where Not 语句

`whereNot` 和 `orWhereNot` 方法可用于否定一组给定的查询条件。例如, 下面的查询排除了正在清仓甩卖或价格低于 10 的产品：

    $products = DB::table('products')
                    ->whereNot(function (Builder $query) {
                        $query->where('clearance', true)
                              ->orWhere('price', '<', 10);
                    })
                    ->get();

<a name="json-where-clauses"></a>
### JSON Where 语句

Laravel 也支持 JSON 类型的字段查询，前提是数据库也支持 JSON 类型。目前，有 MySQL 5.7+、PostgreSQL、SQL Server 2016 和 SQLite 3.39.0 支持 JSON 类型 (with the [JSON1 extension](https://www.sqlite.org/json1.html))。可以使用 `->` 操作符来查询 JSON 字段：

    $users = DB::table('users')
                    ->where('preferences->dining->meal', 'salad')
                    ->get();

你可以使用 `whereJsonContains` 方法来查询 JSON 数组。但是 SQLite 数据库版本低于3.38.0时不支持该功能：

    $users = DB::table('users')
                    ->whereJsonContains('options->languages', 'en')
                    ->get();

如果你的应用使用的是 MySQL 或者 PostgreSQL 数据库，那么你可以向 `whereJsonContains` 方法中传递一个数组类型的值：

    $users = DB::table('users')
                    ->whereJsonContains('options->languages', ['en', 'de'])
                    ->get();

你可以使用 `whereJsonLength` 方法来查询 JSON 数组的长度：

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', 0)
                    ->get();

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', '>', 1)
                    ->get();

<a name="additional-where-clauses"></a>
### 其他 Where 语句

**whereBetween / orWhereBetween**

`whereBetween` 方法是用来验证字段的值是否在给定的两个值之间：

    $users = DB::table('users')
               ->whereBetween('votes', [1, 100])
               ->get();



**whereNotBetween / orWhereNotBetween**

`whereNotBetween`方法用于验证字段的值是否不在给定的两个值范围之中：

    $users = DB::table('users')
                        ->whereNotBetween('votes', [1, 100])
                        ->get();

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

`whereBetweenColumns` 方法用于验证字段是否在给定的两个字段的值的范围中：


    $patients = DB::table('patients')
                           ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();

`whereNotBetweenColumns` 方法用于验证字段是否不在给定的两个字段的值的范围中：

    $patients = DB::table('patients')
                           ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

`whereIn` 方法用于验证字段是否在给定的值数组中：

    $users = DB::table('users')
                        ->whereIn('id', [1, 2, 3])
                        ->get();

`whereIn` 方法用于验证字段是否不在给定的值数组中：

    $users = DB::table('users')
                        ->whereNotIn('id', [1, 2, 3])
                        ->get();

你也可以为`whereIn` 方法的第二个参数提供一个子查询：

    $activeUsers = DB::table('users')->select('id')->where('is_active', 1);

    $users = DB::table('comments')
                        ->whereIn('user_id', $activeUsers)
                        ->get();

上面的例子将会转换为下面的 SQL 查询语句：

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> **注意**  
> 如果你需要判断一个整数的大数组 `whereIntegerInRaw` 或 `whereIntegerNotInRaw`方法可能会更适合，这种用法的内存占用更小。

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

`whereNull` 方法用于判断指定的字段的值是否是`NULL`：

    $users = DB::table('users')
                    ->whereNull('updated_at')
                    ->get();



`whereNotNull` 方法是用来验证给定字段的值是否不为 `NULL`:

    $users = DB::table('users')
                    ->whereNotNull('updated_at')
                    ->get();

**whereDate / whereMonth / whereDay / whereYear / whereTime**

`whereDate`  方法是用来比较字段的值与给定的日期值是否相等:

    $users = DB::table('users')
                    ->whereDate('created_at', '2016-12-31')
                    ->get();

`whereMonth` 方法是用来比较字段的值与给定的月是否相等:

    $users = DB::table('users')
                    ->whereMonth('created_at', '12')
                    ->get();

`whereDay` 方法是用来比较字段的值与给定的日是否相等:

    $users = DB::table('users')
                    ->whereDay('created_at', '31')
                    ->get();

`whereYear`  方法是用来比较字段的值与给定的年是否相等:

    $users = DB::table('users')
                    ->whereYear('created_at', '2016')
                    ->get();

`whereTime` 方法是用来比较字段的值与给定的时间是否相等:

    $users = DB::table('users')
                    ->whereTime('created_at', '=', '11:20:45')
                    ->get();

**whereColumn / orWhereColumn**

`whereColumn` 方法是用来比较两个给定字段的值是否相等:

    $users = DB::table('users')
                    ->whereColumn('first_name', 'last_name')
                    ->get();

你也可以将比较运算符传递给 `whereColumn` 方法:

    $users = DB::table('users')
                    ->whereColumn('updated_at', '>', 'created_at')
                    ->get();

你还可以向 `whereColumn` 方法中传递一个数组。这些条件将使用 `and` 运算符联接:

    $users = DB::table('users')
                    ->whereColumn([
                        ['first_name', '=', 'last_name'],
                        ['updated_at', '>', 'created_at'],
                    ])->get();



<a name="logical-grouping"></a>
### 逻辑分组

有时你可能需要将括号内的几个「where」子句分组，以实现查询所需的逻辑分组。实际上应该将 `orWhere` 方法的调用分组到括号中，以避免不可预料的查询逻辑误差。因此可以传递闭包给 `where` 方法：

    $users = DB::table('users')
               ->where('name', '=', 'John')
               ->where(function (Builder $query) {
                   $query->where('votes', '>', 100)
                         ->orWhere('title', '=', 'Admin');
               })
               ->get();

你可以看到， 通过一个闭包写入 `where` 方法 构建一个查询构造器来约束一个分组。这个闭包接收一个查询实例，你可以使用这个实例来设置应该包含的约束。上面的例子将生成以下 SQL：

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> **注意**  
> 你应该用 `orWhere` 调用这个分组，以避免应用全局作用时出现意外。

<a name="advanced-where-clauses"></a>
### 高级 Where 语句

<a name="where-exists-clauses"></a>
### Where Exists 语句

`whereExists` 方法允许你使用 `where exists` SQL 语句。 `whereExists` 方法接收一个闭包参数，该闭包获取一个查询构建器实例，从而允许你定义放置在 `exists` 子句中查询:

    $users = DB::table('users')
               ->whereExists(function (Builder $query) {
                   $query->select(DB::raw(1))
                         ->from('orders')
                         ->whereColumn('orders.user_id', 'users.id');
               })
               ->get();

或者，可以向 `whereExists` 方法提供一个查询对象，替换上面的闭包：

    $orders = DB::table('orders')
                    ->select(DB::raw(1))
                    ->whereColumn('orders.user_id', 'users.id');

    $users = DB::table('users')
                        ->whereExists($orders)
                        ->get();



上面的两个示例都会生成如下的 `SQL` 语句

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### 子查询 Where 语句

有时候，你可能需要构造一个 `where` 子查询，将子查询的结果与给定的值进行比较。你可以通过向 `where` 方法传递闭包和值来实现此操作。例如，下面的查询将检索最后一次「会员」购买记录是「Pro」类型的所有用户；

    use App\Models\User;
    use Illuminate\Database\Query\Builder;

    $users = User::where(function (Builder $query) {
        $query->select('type')
            ->from('membership')
            ->whereColumn('membership.user_id', 'users.id')
            ->orderByDesc('membership.start_date')
            ->limit(1);
    }, 'Pro')->get();

或者，你可能需要构建一个 `where` 子句，将列与子查询的结果进行比较。你可以通过将列、运算符和闭包传递给 `where` 方法来完成此操作。例如，以下查询将检索金额小于平均值的所有收入记录；

    use App\Models\Income;
    use Illuminate\Database\Query\Builder;

    $incomes = Income::where('amount', '<', function (Builder $query) {
        $query->selectRaw('avg(i.amount)')->from('incomes as i');
    })->get();

<a name="full-text-where-clauses"></a>
### 全文 Where 子句

> **注意**  
> MySQL 和 PostgreSQL 目前支持全文 where 子句。

可以使用 `where FullText` 和 `orWhere FullText` 方法将全文「where」 子句添加到具有 [full text indexes](/docs/laravel/10.x/migrations#available-index-types) 的列的查询中。这些方法将由Laravel转换为适用于底层数据库系统的SQL。例如，使用MySQL的应用会生成 `MATCH AGAINST` 子句

    $users = DB::table('users')
               ->whereFullText('bio', 'web developer')
               ->get();



<a name="ordering-grouping-limit-and-offset"></a>
## Ordering, Grouping, Limit & Offset

<a name="ordering"></a>
### 排序

<a name="orderby"></a>
#### `orderBy` 方法

`orderBy` 方法允许你按给定列对查询结果进行排序。`orderBy` 方法接受的第一个参数应该是你希望排序的列，而第二个参数确定排序的方向，可以是 `asc` 或 `desc`：

    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->get();

要按多列排序，你以根据需要多次调用 `orderBy`：

    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->orderBy('email', 'asc')
                    ->get();

<a name="latest-oldest"></a>
#### `latest` 和 `oldest` 方法

`latest` 和 `oldest` 方法可以方便让你把结果根据日期排序。查询结果默认根据数据表的 `created_at` 字段进行排序 。或者，你可以传一个你想要排序的列名，通过:

    $user = DB::table('users')
                    ->latest()
                    ->first();

<a name="random-ordering"></a>
#### 随机排序

`inRandomOrder` 方法被用来将查询结果随机排序。例如，你可以使用这个方法去获得一个随机用户:

    $randomUser = DB::table('users')
                    ->inRandomOrder()
                    ->first();

<a name="removing-existing-orderings"></a>
#### 移除已存在的排序

`reorder` 方法会移除之前已经被应用到查询里的排序:

    $query = DB::table('users')->orderBy('name');

    $unorderedUsers = $query->reorder()->get();

当你调用 `reorder` 方法去移除所有已经存在的排序的时候，你可以传递一个列名和排序方式去重新排序整个查询:

    $query = DB::table('users')->orderBy('name');

    $usersOrderedByEmail = $query->reorder('email', 'desc')->get();



<a name="grouping"></a>
### 分组

<a name="groupby-having"></a>
#### `groupBy` 和 `having` 方法

如你所愿，`groupBy` 和 `having` 方法可以将查询结果分组。`having` 方法的使用方法类似于 `where` 方法:

    $users = DB::table('users')
                    ->groupBy('account_id')
                    ->having('account_id', '>', 100)
                    ->get();

你可以使用 `havingBetween` 方法在一个给定的范围内去过滤结果:

    $report = DB::table('orders')
                    ->selectRaw('count(id) as number_of_orders, customer_id')
                    ->groupBy('customer_id')
                    ->havingBetween('number_of_orders', [5, 15])
                    ->get();

你可以传多个参数给 `groupBy` 方法将多列分组:

    $users = DB::table('users')
                    ->groupBy('first_name', 'status')
                    ->having('account_id', '>', 100)
                    ->get();

想要构造更高级的 `having` 语句, 看 [`havingRaw`](#raw-methods) 方法。

<a name="limit-and-offset"></a>
### 限制和偏移量

<a name="skip-take"></a>
#### `skip` 和 `take` 方法

你可以使用 `skip` 和 `take` 方法去限制查询结果的返回数量或者在查询结果中跳过给定数量:

    $users = DB::table('users')->skip(10)->take(5)->get();

或者，你可以使用 `limit` 和 `offset` 方法。这些方法在功能上等同于 `take` 和 `skip` 方法, 如下

    $users = DB::table('users')
                    ->offset(10)
                    ->limit(5)
                    ->get();

<a name="conditional-clauses"></a>
## 条件语句

有时，可能希望根据另一个条件将某些查询子句应用于查询。例如，当传入 HTTP 请求有一个给定的值的时候你才需要使用一个`where` 语句。你可以使用 `when` 方法去实现:

    $role = $request->string('role');

    $users = DB::table('users')
                    ->when($role, function (Builder $query, string $role) {
                        $query->where('role_id', $role);
                    })
                    ->get();



`when` 方法只有当第一个参数为 `true` 时才执行给定的闭包。如果第一个参数是 `false` ，闭包将不会被执行。因此，在上面的例子中，只有在传入的请求包含 `role` 字段且结果为 `true` 时，`when` 方法里的闭包才会被调用。

你可以将另一个闭包作为第三个参数传递给 `when` 方法。这个闭包则旨在第一个参数结果为 `false` 时才会执行。为了说明如何使用该功能，我们将使用它来配置查询的默认排序：

    $sortByVotes = $request->boolean('sort_by_votes');

    $users = DB::table('users')
                    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
                        $query->orderBy('votes');
                    }, function (Builder $query) {
                        $query->orderBy('name');
                    })
                    ->get();

<a name="insert-statements"></a>
## 插入语句

查询构造器也提供了一个 `insert` 方法来用于插入记录到数据库表中。`insert` 方法接受一个列名和值的数组：

    DB::table('users')->insert([
        'email' => 'kayla@example.com',
        'votes' => 0
    ]);

你可以通过传递一个二维数组来实现一次插入多条记录。每一个数组都代表了一个应当插入到数据表中的记录：

    DB::table('users')->insert([
        ['email' => 'picard@example.com', 'votes' => 0],
        ['email' => 'janeway@example.com', 'votes' => 0],
    ]);

`insertOrIgnore` 方法将会在插入数据库的时候忽略发生的错误。当使用该方法时，你应当注意，重复记录插入的错误和其他类型的错误都将被忽略，这取决于数据库引擎。例如， `insertOrIgnore` 将会 [绕过 MySQL 的严格模式](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution) ：

    DB::table('users')->insertOrIgnore([
        ['id' => 1, 'email' => 'sisko@example.com'],
        ['id' => 2, 'email' => 'archer@example.com'],
    ]);



`insertUsing` 方法将在表中插入新记录，同时用子查询来确定应插入的数据：

    DB::table('pruned_users')->insertUsing([
        'id', 'name', 'email', 'email_verified_at'
    ], DB::table('users')->select(
        'id', 'name', 'email', 'email_verified_at'
    )->where('updated_at', '<=', now()->subMonth()));

<a name="auto-incrementing-ids"></a>
#### 自增 IDs

如果数据表有自增 ID ，使用 `insertGetId` 方法来插入记录可以返回 ID 值：

    $id = DB::table('users')->insertGetId(
        ['email' => 'john@example.com', 'votes' => 0]
    );

> **注意**  
> 当使用 PostgreSQL 时，`insertGetId` 方法将默认把 `id` 作为自动递增字段的名称。如果你要从其他「字段」来获取 ID ，则需要将字段名称作为第二个参数传递给 `insertGetId` 方法。

<a name="upserts"></a>
### 更新插入

`upsert` 方法是是插入不存在的记录和为已经存在记录更新值。该方法的第一个参数包含要插入或更新的值，而第二个参数列出了在关联表中唯一标识记录的列。 该方法的第三个也是最后一个参数是一个列数组，如果数据库中已经存在匹配的记录，则应该更新这些列：

    DB::table('flights')->upsert(
        [
            ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
            ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
        ],
        ['departure', 'destination'],
        ['price']
    );

在上面的例子中，Laravel 会尝试插入两条记录。如果已经存在具有相同 `departure` 和 `destination` 列值的记录，Laravel 将更新该记录的 `price` 列。

> **注意**  
> 除 SQL Server 之外的所有数据库都要求 `upsert` 方法的第二个参数中的列具有「主」或「唯一」索引。 此外，MySQL 数据库驱动程序忽略 `upsert` 方法的第二个参数，并始终使用表的「主」和「唯一」索引来检测现有记录。



<a name="update-statements"></a>
## 更新语句

除了插入记录到数据库之外，查询构造器也可以使用 `update` 方法来更新已经存在的记录。`update` 方法像 `insert` 方法一样，接受一个列名和值的数组作为参数，它表示要更新的列和数据。`update` 方法返回受影响的行数。你可以使用 `where` 子句来限制 `update` 查询：

    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['votes' => 1]);

<a name="update-or-insert"></a>
#### 更新或插入

有时你可能希望更新数据库中的记录，但如果指定记录不存在的时候则创建它。在这种情况下，可以使用 `updateOrInsert` 方法。`updateOrInsert` 方法接受两个参数：一个用于查找记录的条件数组，以及一个包含要更改记录的键值对数组。

`updateOrInsert` 方法将尝试使用第一个参数的列名和值来定位匹配的数据库记录。如果记录存在，则使用第二个参数更新其值。如果找不到指定记录，则会合并两个参数的属性来创建一条记录并将其插入：

    DB::table('users')
        ->updateOrInsert(
            ['email' => 'john@example.com', 'name' => 'John'],
            ['votes' => '2']
        );

<a name="updating-json-columns"></a>
### 更新 JSON 字段

当更新一个 JSON 列的收，你可以使用 `->` 语法来更新 JSON 对象中恰当的键。此操作需要 MySQL 5.7+ 和 PostgreSQL 9.5+ 的数据库：

    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['options->enabled' => true]);



<a name="increment-and-decrement"></a>
### 自增与自减

查询构造器还提供了方便的方法来增加或减少给定列的值。这两种方法都至少接受一个参数：要修改的列。可以提供第二个参数来指定列应该增加或减少的数量：

    DB::table('users')->increment('votes');

    DB::table('users')->increment('votes', 5);

    DB::table('users')->decrement('votes');

    DB::table('users')->decrement('votes', 5);

你还可以在操作期间指定要更新的其他列：

    DB::table('users')->increment('votes', 1, ['name' => 'John']);

此外，你可以使用 <code>incrementEach</code> 和 <code>decrementEach</code> 方法同时增加或减少多个列:

    DB::table('users')->incrementEach([
        'votes' => 5,
        'balance' => 100,
    ]);

<a name="delete-statements"></a>
## 删除语句

查询构建器的 <code>delete</code> 方法可用于从表中删除记录。 <code>delete</code> 方法返回受影响的行数。你可以通过在调用 <code>delete</code> 方法之前添加 <code>where</code> 子句来限制 <code>delete</code> 语句：

    $deleted = DB::table('users')->delete();

    $deleted = DB::table('users')->where('votes', '>', 100)->delete();

如果你希望截断整个表，这将从表中删除所有记录并将自动递增 ID 重置为零，你可以使用 <code>truncate</code> 方法：

    DB::table('users')->truncate();

<a name="table-truncation-and-postgresql"></a>
#### 截断表 & PostgreSQL

截断 PostgreSQL 数据库时，将应用 <code>CASCADE</code> 行为。这意味着其他表中所有与外键相关的记录也将被删除。



<a name="悲观锁"></a>
## 悲观锁

查询构建器还包括一些函数，可帮助你在执行 `select` 语句时实现「悲观锁」。 要使用「共享锁」执行语句，你可以调用 `sharedLock` 方法。共享锁可防止选定的行被修改，直到你的事务被提交：

    DB::table('users')
            ->where('votes', '>', 100)
            ->sharedLock()
            ->get();

或者，你可以使用 `lockForUpdate` 方法。「update」锁可防止所选记录被修改或被另一个共享锁选中：

    DB::table('users')
            ->where('votes', '>', 100)
            ->lockForUpdate()
            ->get();

<a name="调试"></a>
## 调试

你可以在构建查询时使用 `dd` 和 `dump` 方法来转储当前查询绑定和 SQL。 `dd` 方法将显示调试信息，然后停止执行请求。 `dump` 方法将显示调试信息，但允许请求继续执行：

    DB::table('users')->where('votes', '>', 100)->dd();

    DB::table('users')->where('votes', '>', 100)->dump();

