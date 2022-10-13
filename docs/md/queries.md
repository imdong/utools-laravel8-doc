# 数据库: 查询构造器

- [简介](#简介)
- [获取结果](#获取结果)
    - [分块结果](#分块结果)
	- [Lazily 流式传输结果](#streaming-results-lazily)
    - [聚合函数](#聚合函数)
- [Select 语句](#select-statements)
- [原生表达式](#原生表达式)
- [Joins](#joins)
- [Unions](#unions)
- [基础 where 语句](#basic-where-clauses)
    - [条件查询语句](#where-clauses)
    - [Or Where 语句](#or-where-clauses)
    - [JSON Where 语句](#json-where-clauses)
    - [其他 Where 语句](#additional-where-clauses)
    - [逻辑分组](#logical-grouping)
- [高级 Where 语句](#advanced-where-clauses)
    - [Where Exists 语句](#where-exists-clauses)
    - [子查询 Where 语句](#subquery-where-clauses)
    - [全文 Where 子句](#full-text-where-clauses)
- [Ordering, Grouping, Limit & Offset](#ordering-grouping-limit-and-offset)
    - [排序](#ordering)
    - [分组](#grouping)
    - [Limit & Offset](#limit-and-offset)
- [条件语句](#conditional-clauses)
- [插入语句](#插入语句)
    - [自增ID](#auto-incrementing-ids)
- [更新语句](#update-statements)
    - [更新 JSON](#updating-json-columns)
    - [自增 & 自减](#increment-and-decrement)
- [删除语句](#删除语句)
- [悲观锁](#悲观锁)
- [调试](#调试)

<a name="introduction"></a>
## 简介

Laravel的数据库查询生成器为创建和运行数据库查询提供了方便、流畅的界面。它可以用于执行应用程序中的大多数数据库操作，并与Laravel支持的所有数据库系统完美配合。

Laravel 9 查询生成器使用PDO参数绑定来保护应用程序免受SQL注入攻击。无需清理或清理作为查询绑定传递给查询生成器的字符串。

> 注意：PDO不支持绑定列名。因此，永远不要允许用户输入指定查询引用的列名，包括「order by」列。

<a name="running-database-queries"></a>
## 获取结果

<a name="retrieving-all-rows-from-a-table"></a>


#### 从表中检索所有行

你可以使用 `DB` facade 提供的 `table` 方法开始查询。`table` 方法为指定的表返回一个链式查询构造器实例，允许在查询上链接更多约束，最后使用 `get` 方法检索查询结果：

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;

    class UserController extends Controller
    {
        /**
         * 显示所有应用程序用户的列表。
         *
         * @return \Illuminate\Http\Response
         */
        public function index()
        {
            $users = DB::table('users')->get();

            return view('user.index', ['users' => $users]);
        }
    }
```

`get` 方法返回包含查询结果的 `Illuminate\Support\Collection` 实例，每个结果都是 PHP  `stdClass` 实例。可以将列作为对象的属性来访问每列的值：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->get();

    foreach ($users as $user) {
        echo $user->name;
    }

> 技巧：Laravel 集合提供了各种及其强大的方法来映射和裁剪数据。有关 Laravel 集合的更多信息，请查看[集合文档](/docs/laravel/9.x/collections)。

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### 从表中检索单行或单列

如果只需要从数据表中检索单行，可以使用 `DB` facade 中的 `first` 方法。 此方法将返回单个 `stdClass` 对象

    $user = DB::table('users')->where('name', 'John')->first();

    return $user->email;

如果不想要整行，可以使用 `value` 方法从纪录中提取单个值。此方法将直接返回列的值：

    $email = DB::table('users')->where('name', 'John')->value('email');



如果要通过 `id` 字段值获取单行数据，可以使用 `find` 方法：

    $user = DB::table('users')->find(3);

<a name="retrieving-a-list-of-column-values"></a>
#### 获取某一列的值

如果您想获取包含单列值的集合，则可以使用 `pluck` 方法。在下面的例子中，我们将获取角色表中标题的集合：

    use Illuminate\Support\Facades\DB;

    $titles = DB::table('users')->pluck('title');

    foreach ($titles as $title) {
        echo $title;
    }

您可以通过向 `pluck` 方法提供第二个参数来指定结果集中要作为键的列：

    $titles = DB::table('users')->pluck('title', 'name');

    foreach ($titles as $name => $title) {
        echo $title;
    }

<a name="chunking-results"></a>
### 分块结果

如果您需要处理成千上万的数据库记录，请考虑使用 `DB` 提供的 `chunk` 方法。这个方法一次检索一小块结果，并将每个块反馈到闭包函数中进行处理。例如，让我们以一次 100 条记录的块为单位检索整个 `users` 表。

    use Illuminate\Support\Facades\DB;

    DB::table('users')->orderBy('id')->chunk(100, function ($users) {
        foreach ($users as $user) {
            //
        }
    });

您可以通过从闭包中返回 `false` 来停止处理其余的块:

    DB::table('users')->orderBy('id')->chunk(100, function ($users) {
        // Process the records...

        return false;
    });

如果在对结果进行分块时更新数据库记录，那分块结果可能会以意想不到的方式更改。如果您打算在分块时更新检索到的记录，最好使用 `chunkById` 方法。此方法将根据记录的主键自动对结果进行分页:

    DB::table('users')->where('active', false)
        ->chunkById(100, function ($users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['active' => true]);
            }
        });

> 注意：当在更新或删除块回调中的记录时，对主键或外键的任何更改都可能影响块查询。这可能会导致记录未包含在分块结果中。



<a name="streaming-results-lazily"></a>
### Lazily 流式传输结果

`lazy` 方法的工作方式类似于 [`chunk` 方法](#chunking-results)，因为它以块的形式执行查询。但是，`lazy()` 方法不是将每个块传递给回调，而是返回一个 [`LazyCollection`](/docs/laravel/9.x/collections#lazy-collections)，它可以让您与结果进行交互单个流：

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function ($user) {
    //
});
```

再一次，如果您打算在迭代它们时更新检索到的记录，最好使用 `lazyById` 或 `lazyByIdDesc` 方法。 这些方法将根据记录的主键自动对结果进行分页：

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function ($user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> 注意：在迭代记录时更新或删除记录时，对主键或外键的任何更改都可能影响块查询。这可能会导致记录不包含在结果中。

<a name="aggregates"></a>
### 聚合函数

查询构建器还提供了多种检索聚合值的方法，例如 `count`, `max`, `min`, `avg`,和 `sum`。您可以在构建查询后调用这些方法中的任何一个：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->count();

    $price = DB::table('orders')->max('price');

当然，您可以将这些方法与其他子句结合使用，以微调您的合计值的计算方式：

    $price = DB::table('orders')
                    ->where('finalized', 1)
                    ->avg('price');



<a name="determining-if-records-exist"></a>
#### 判断记录是否存在

除了通过 `count` 方法可以确定查询条件的结果是否存在之外，还可以使用 `exists` 和 `doesntExist` 方法：

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

当然你可能不是总是希望从数据库表中获取所有列。使用 `select` 方法，你可以自定义一个 「select」 查询语句来查询指定的字段：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->select('name', 'email as user_email')
                ->get();

`distinct` 方法会强制让查询返回的结果不重复：

    $users = DB::table('users')->distinct()->get();

如果你已经有了一个查询构造器实例，并且希望在现有的查询语句中加入一个字段，那么你可以使用 `addSelect` 方法

    $query = DB::table('users')->select('name');

    $users = $query->addSelect('age')->get();

<a name="raw-expressions"></a>
## 原生表达式

有时可能需要在查询中插入任意字符串。要创建原始字符串表达式，可以使用 `DB` facade提供的`raw`方法：

    $users = DB::table('users')
                 ->select(DB::raw('count(*) as user_count, status'))
                 ->where('status', '<>', 1)
                 ->groupBy('status')
                 ->get();

> 注意：原生表达式将会被当做字符串注入到查询中，因此你应该极度小心避免创建 SQL 注入的漏洞。



<a name="raw-methods"></a>
### 原生表达式

可以使用以下方法代替 `DB::raw`，将原生表达式插入查询的各个部分。**注意，Laravel 无法保证所有使用原生表达式的查询都受到防 SQL 注入漏洞保护。**

<a name="selectraw"></a>
#### `selectRaw`

`selectRaw` 方法可以代替 `addSelect(DB::raw(...))`。该方法的第二个参数是可选项，值是一个绑定参数的数组：

    $orders = DB::table('orders')
                    ->selectRaw('price * ? as price_with_tax', [1.0825])
                    ->get();

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

`whereRaw` 和 `orWhereRaw` 方法将原生的「where」注入到你的查询中。这两个方法的第二个参数是可选项，值是一个绑定参数的数组：

    $orders = DB::table('orders')
                    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                    ->get();

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

`havingRaw` 和 `orHavingRaw` 方法可以用于将原生字符串作为「having」语句的值。这两个方法的第二个参数是可选项，值是一个绑定参数的数组：

    $orders = DB::table('orders')
                    ->select('department', DB::raw('SUM(price) as total_sales'))
                    ->groupBy('department')
                    ->havingRaw('SUM(price) > ?', [2500])
                    ->get();

<a name="orderbyraw"></a>
#### `orderByRaw`

`orderByRaw` 方法可用于将原生字符串设置为「order by」语句的值：

    $orders = DB::table('orders')
                    ->orderByRaw('updated_at - created_at DESC')
                    ->get();

<a name="groupbyraw"></a>
### `groupByRaw`

`groupByRaw` 方法可以用于将原生字符串设置为 `group by` 语句的值：

    $orders = DB::table('orders')
                    ->select('city', 'state')
                    ->groupByRaw('city, state')
                    ->get();



<a name="joins"></a>
## Joins

<a name="inner-join-clause"></a>
#### Inner Join  语句

查询构造器也还可用于向查询中添加连接子句。若要执行基本的「内链接」，你可以对查询构造器实例使用 `join` 方法。传递给 `join` 方法的第一个参数是需要连接到的表的名称，而其余参数指定连接的列约束。您甚至还可以在一个查询中连接多个表：

    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->join('contacts', 'users.id', '=', 'contacts.user_id')
                ->join('orders', 'users.id', '=', 'orders.user_id')
                ->select('users.*', 'contacts.phone', 'orders.price')
                ->get();

<a name="left-join-right-join-clause"></a>
#### Left Join / Right Join  语句

如果你想使用 `left join`或者 `right join` 代替 `inner join` ，可以使用 `leftJoin` 或者 `rightJoin` 方法。这两个方法与 `join` 方法用法相同：

    $users = DB::table('users')
                ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();

    $users = DB::table('users')
                ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();

<a name="cross-join-clause"></a>
#### Cross Join  语句

你可以使用 `crossJoin` 方法执行「交叉连接」。交叉连接在第一个表和被连接的表之间会生成笛卡尔积：

    $sizes = DB::table('sizes')
                ->crossJoin('colors')
                ->get();

<a name="advanced-join-clauses"></a>
#### 高级 Join 语句

您还可以指定更高级的联接子句。首先，将闭包作为第二个参数传递给 `join` 方法。闭包将收到一个`illumb\Database\Query\JoinClause`实例，该实例允许您指定对`join`子句的约束：

    DB::table('users')
            ->join('contacts', function ($join) {
                $join->on('users.id', '=', 'contacts.user_id')->orOn(...);
            })
            ->get();



如果你想要在连接上使用「where」风格的语句，你可以在连接上使用 <code>JoinClause</code> 实例中的 <code>where</code> 和 <code>orWhere</code> 方法。这些方法会将列和值进行比较，而不是列和列进行比较：

    DB::table('users')
            ->join('contacts', function ($join) {
                $join->on('users.id', '=', 'contacts.user_id')
                     ->where('contacts.user_id', '>', 5);
            })
            ->get();

<a name="subquery-joins"></a>
#### 子连接查询

你可以使用 <code>joinSub</code>，<code>leftJoinSub</code> 和 <code>rightJoinSub</code> 方法关联一个查询作为子查询。他们每一种方法都会接收三个参数：子查询，表别名和定义关联字段的闭包。
如下面这个例子，获取含有用户最近一次发布博客时的 <code>created_at</code> 时间戳的用户集合：

    $latestPosts = DB::table('posts')
                       ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
                       ->where('is_published', true)
                       ->groupBy('user_id');

    $users = DB::table('users')
            ->joinSub($latestPosts, 'latest_posts', function ($join) {
                $join->on('users.id', '=', 'latest_posts.user_id');
            })->get();

<a name="unions"></a>
## Unions

查询构造器还提供了一种简洁的方式将两个或者多个查询「联合」在一起。例如，你可以先创建一个查询，然后使用 <code>union</code> 方法来连接更多的查询：

    use Illuminate\Support\Facades\DB;

    $first = DB::table('users')
                ->whereNull('first_name');

    $users = DB::table('users')
                ->whereNull('last_name')
                ->union($first)
                ->get();
查询构造器不仅提供了 <code>union</code> 方法，还提供了一个 <code>unionAll</code> 方法。当查询结合 <code>unionAll</code> 方法使用时，将不会删除重复的结果。<code>unionAll</code> 方法的用法和 <code>union</code> 方法一样。



<a name="basic-where-clauses"></a>
## 基础的 Where 语句

<a name="where-clauses"></a>
### Where 语句

你可以在 where 语句中使用查询构造器的 <code>where</code> 方法。调用 <code>where</code> 方法需要三个基本参数。第一个参数是字段的名称。第二个参数是一个操作符，它可以是数据库中支持的任意操作符。第三个参数是与字段比较的值。

例如。在 users 表中查询 <code>votes</code> 字段等于 <code>100</code> 并且 <code>age</code> 字段大于 <code>35</code> 的数据：

    $users = DB::table('users')
                    ->where('votes', '=', 100)
                    ->where('age', '>', 35)
                    ->get();

为了方便起见。如果你想要比较一个字段的值是否 <code>等于</code> 给定的值。你可以将这个给定的值作为第二个参数传递给 where 方法。那么，Laravel 会默认使用 <code>=</code> 操作符：

    $users = DB::table('users')->where('votes', 100)->get();

如上所述，您可以使用数据库支持的任意操作符：

    $users = DB::table('users')
                    ->where('votes', '>=', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('votes', '<>', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('name', 'like', 'T%')
                    ->get();

您也可以将一个条件数组传递给 <code>where</code> 方法。通常传递给 <code>where</code> 方法的数组中的每一个元素都应该包含 3 个元素：

    $users = DB::table('users')->where([
        ['status', '=', '1'],
        ['subscribed', '<>', '1'],
    ])->get();

> 注意：PDO 不支持绑定字段名。因此，你不应该允许让用户输入字段名进行查询引用，包括结果集「排序」语句。



<a name="or-where-clauses"></a>
### Or Where 语句

当链式调用多个 `where` 方法的时候，这些「where」语句将会被看成是 `and` 关系。另外，您也可以在查询语句中使用 `orWhere` 方法来表示 `or` 关系。`orWhere` 方法接收的参数和 `where` 方法接收的参数一样：

    $users = DB::table('users')
                        ->where('votes', '>', 100)
                        ->orWhere('name', 'John')
                        ->get();

如果您需要在括号内对 `or` 条件进行分组，那么可以传递一个闭包作为 `orWhere` 方法的第一个参数：


    $users = DB::table('users')
                ->where('votes', '>', 100)
                ->orWhere(function($query) {
                    $query->where('name', 'Abigail')
                          ->where('votes', '>', 50);
                })
                ->get();

上面的示例将生成以下SQL：

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> 注意：为了避免应用全局作用出现意外，您应该用 orWhere 调用这个分组。

<a name="json-where-clauses"></a>
### JSON Where 语句

Laravel 也支持 JSON 类型的字段查询，前提是数据库也支持 JSON 类型。目前，有 MySQL 5.7+、PostgreSQL、SQL Server 2016 和 SQLite 3.9.0 支持 JSON 类型 (with the [JSON1 extension](https://www.sqlite.org/json1.html))。可以使用 `->` 操作符来查询 JSON 字段：

    $users = DB::table('users')
                    ->where('preferences->dining->meal', 'salad')
                    ->get();

您可以使用 `whereJsonContains` 方法来查询 JSON 数组。但是 SQLite 数据库不支持该功能：

    $users = DB::table('users')
                    ->whereJsonContains('options->languages', 'en')
                    ->get();

如果您的应用使用的是 MySQL 或者 PostgreSQL 数据库，那么您可以向 `whereJsonContains` 方法中传递一个数组类型的值：

    $users = DB::table('users')
                    ->whereJsonContains('options->languages', ['en', 'de'])
                    ->get();



你可以使用 <code>whereJsonLength</code> 方法来查询 JSON 数组的长度：

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', 0)
                    ->get();

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', '>', 1)
                    ->get();

<a name="additional-where-clauses"></a>
### 其他 Where 语句

**whereBetween / orWhereBetween**

<code>whereBetween</code> 方法是用来验证字段的值是否在给定的两个值之间：

    $users = DB::table('users')
               ->whereBetween('votes', [1, 100])
               ->get();

**whereNotBetween / orWhereNotBetween**

<code>whereNotBetween</code> 方法是用来验证字段的值是否不在给定的两个值之间：

    $users = DB::table('users')
                        ->whereNotBetween('votes', [1, 100])
                        ->get();

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

<code>whereIn</code> 方法是用来验证一个字段的值是否在给定的数组中：

    $users = DB::table('users')
                        ->whereIn('id', [1, 2, 3])
                        ->get();

<code>whereNotIn</code> 方法是用来验证一个字段的值是否不在给定的数组中：

    $users = DB::table('users')
                        ->whereNotIn('id', [1, 2, 3])
                        ->get();

> 注意：如果您在查询中用到了一个很大的数组，那么可以使用 <code>whereIntegerInRaw</code> 方法或者 <code>whereIntegerNotInRaw</code> 方法来减少内存的使用量。

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

<code>whereNull</code> 方法是用来验证给定字段的值是否为 <code>NULL</code>：

    $users = DB::table('users')
                    ->whereNull('updated_at')
                    ->get();

<code>whereNotNull</code> 方法是用来验证给定字段的值是否不为 <code>NULL</code>

    $users = DB::table('users')
                    ->whereNotNull('updated_at')
                    ->get();

**whereDate / whereMonth / whereDay / whereYear / whereTime**

<code>whereDate</code> 方法是用来比较字段的值与给定的日期值是否相等 （年 - 月 - 日）：

    $users = DB::table('users')
                    ->whereDate('created_at', '2016-12-31')
                    ->get();

<code>whereMonth</code> 方法是用来比较字段的值与给定的月份是否相等（月）：

    $users = DB::table('users')
                    ->whereMonth('created_at', '12')
                    ->get();



 `whereDay` 方法可用于将列的值与当月的特定日期进行比较：

    $users = DB::table('users')
                    ->whereDay('created_at', '31')
                    ->get();

 `whereYear`方法可用于将列的值与特定年份进行比较：

    $users = DB::table('users')
                    ->whereYear('created_at', '2016')
                    ->get();

`WhereTime`方法可用于将列的值与特定时间进行比较：

    $users = DB::table('users')
                    ->whereTime('created_at', '=', '11:20:45')
                    ->get();

**whereColumn / orWhereColumn**

`whereColumn` 方法是用来比较两个给定的字段的值是否相等：

    $users = DB::table('users')
                    ->whereColumn('first_name', 'last_name')
                    ->get();

您也可以将比较运算符传递给`whereColumn`方法：

    $users = DB::table('users')
                    ->whereColumn('updated_at', '>', 'created_at')
                    ->get();

您还可以向 `whereColumn` 方法中传递一个数组。这些条件将使用 `and` 运算符联接：

    $users = DB::table('users')
                    ->whereColumn([
                        ['first_name', '=', 'last_name'],
                        ['updated_at', '>', 'created_at'],
                    ])->get();

<a name="logical-grouping"></a>
### 逻辑分组

有时您可能需要将括号内的几个「where」子句分组，以实现查询所需的逻辑分组。实际上应该将 `orWhere` 方法的调用分组到括号中，以避免不可预料的查询逻辑误差。因此可以传递闭包给 `where` 方法：

    $users = DB::table('users')
               ->where('name', '=', 'John')
               ->where(function ($query) {
                   $query->where('votes', '>', 100)
                         ->orWhere('title', '=', 'Admin');
               })
               ->get();



你可以看到， 通过一个 `闭包` 写入 `where` 方法 构建一个查询构造器来约束一个分组。这个 `闭包` 接收一个查询实例，你可以使用这个实例来设置应该包含的约束。上面的例子将生成以下 SQL：

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> 提示：你应该用 `orWhere` 调用这个分组，以避免应用全局作用时出现意外。

<a name="advanced-where-clauses"></a>
### 高级 Where 语句

<a name="where-exists-clauses"></a>
### Where Exists 语句

`whereExists` 方法允许你使用 `where exists` SQL 语句。 `whereExists` 方法接收一个 `闭包` 参数，该闭包获取一个查询构建器实例，从而允许你定义放置在 `exists` 子句中查询:

    $users = DB::table('users')
               ->whereExists(function ($query) {
                   $query->select(DB::raw(1))
                         ->from('orders')
                         ->whereColumn('orders.user_id', 'users.id');
               })
               ->get();

上面的查询将产生如下的 `SQL` 语句：:

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

    $users = User::where(function ($query) {
        $query->select('type')
            ->from('membership')
            ->whereColumn('membership.user_id', 'users.id')
            ->orderByDesc('membership.start_date')
            ->limit(1);
    }, 'Pro')->get();



或者，您可能需要构建一个 `where` 子句，将列与子查询的结果进行比较。您可以通过将列、运算符和闭包传递给 `where` 方法来完成此操作。例如，以下查询将检索金额小于平均值的所有收入记录；

    use App\Models\Income;

    $incomes = Income::where('amount', '<', function ($query) {
        $query->selectRaw('avg(i.amount)')->from('incomes as i');
    })->get();

<a name="full-text-where-clauses"></a>
### 全文 Where 子句

> 注意：MySQL 和 PostgreSQL 目前支持全文 where 子句。

可以使用`where FullText`和`orWhere FullText`方法将全文“WHERE”子句添加到具有[Full Text indexes](/docs/laravel/9.x/migrations#available-index-types)的列的查询中。这些方法将由Laravel转换为适用于底层数据库系统的SQL。例如，使用MySQL的应用会生成`Match AGAINST`子句：

    $users = DB::table('users')
               ->whereFullText('bio', 'web developer')
               ->get();

<a name="ordering-grouping-limit-and-offset"></a>
## Ordering, Grouping, Limit & Offset

<a name="ordering"></a>
### 排序

<a name="orderby"></a>
#### `orderBy` 方法

`orderBy` 方法允许您按给定列对查询结果进行排序。`orderBy` 方法接受的第一个参数应该是您希望排序的列，而第二个参数确定排序的方向，可以是 `asc` 或 `desc`：

    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->get();

要按多列排序，您可以根据需要多次调用 `orderBy`：

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
### Limit 和 Offset

<a name="skip-take"></a>
####  `skip` 和 `take` 方法

你可以使用 `skip` 和 `take` 方法去限制查询结果的返回数量或者在查询结果中跳过给定数量:

    $users = DB::table('users')->skip(10)->take(5)->get();

或者，你可以使用 `limit` 和 `offset` 方法。这些方法在功能上等同于 `take` 和 `skip` 方法, 如下:

    $users = DB::table('users')
                    ->offset(10)
                    ->limit(5)
                    ->get();

<a name="conditional-clauses"></a>
## 条件语句

有时，您可能希望根据另一个条件将某些查询子句应用于查询。例如，当传入 HTTP 请求有一个给定的值的时候你才需要使用一个`where` 语句。你可以使用 `when` 方法去实现:

    $role = $request->input('role');

    $users = DB::table('users')
                    ->when($role, function ($query, $role) {
                        return $query->where('role_id', $role);
                    })
                    ->get();

 `when` 方法只有当第一个参数为 `true` 的时候才执行给定的闭包。如果第一个参数是 `false`，闭包将不会被执行。因此，在上面的例子中，只要在传入的请求中存在 `role` 字段，并且结果为 `true` 的时候， `when` 方法里的闭包才会被调用。



你可以将另一个闭包作为第三个参数传递给 `when` 方法。只有当第一个参数的计算结果为 `false`时，这个闭包才会执行。为了说明如何使用此功能，我们将使用它来配置查询的默认排序：

    $sortByVotes = $request->input('sort_by_votes');

    $users = DB::table('users')
                    ->when($sortByVotes, function ($query, $sortByVotes) {
                        return $query->orderBy('votes');
                    }, function ($query) {
                        return $query->orderBy('name');
                    })
                    ->get();

<a name="insert-statements"></a>
## 插入语句

查询构建器还提供了一个「插入」方法，可用于将记录插入到数据库表中。 `insert` 方法接受一个列名和值的数组：

    DB::table('users')->insert([
        'email' => 'kayla@example.com',
        'votes' => 0
    ]);

你可以通过传递数组数组一次插入多条记录。每个数组代表一个应该插入到表中的记录：

    DB::table('users')->insert([
        ['email' => 'picard@example.com', 'votes' => 0],
        ['email' => 'janeway@example.com', 'votes' => 0],
    ]);

`insertOrIgnore` 方法将在将记录插入数据库时忽略错误：

    DB::table('users')->insertOrIgnore([
        ['id' => 1, 'email' => 'sisko@example.com'],
        ['id' => 2, 'email' => 'archer@example.com'],
    ]);

> 注意：`insertOrIgnore` 将忽略重复记录，也可能会忽略其他类型的错误，具体取决于数据库引擎。例如，`insertOrIgnore` 将 [绕过 MySQL 的严格模式](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution).

<a name="auto-incrementing-ids"></a>
#### 自增 IDs

如果数据表有自增 ID ，使用 insertGetId 方法来插入记录可以返回 ID 值：

    $id = DB::table('users')->insertGetId(
        ['email' => 'john@example.com', 'votes' => 0]
    );

> 注意：当使用 PostgreSQL 时，`insertGetId` 方法将默认把 `id` 作为自动递增字段的名称。如果你要从其他「字段」来获取 ID ，则需要将字段名称作为第二个参数传递给 `insertGetId` 方法。



<a name="upserts"></a>
### Upserts

`upsert` 方法将插入不存在的记录，并使用您可以指定的新值更新已经存在的记录。该方法的第一个参数包含要插入或更新的值，而第二个参数列出了在关联表中唯一标识记录的列。 该方法的第三个也是最后一个参数是一个列数组，如果数据库中已经存在匹配的记录，则应该更新这些列：

    DB::table('flights')->upsert([
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ], ['departure', 'destination'], ['price']);

在上面的例子中，Laravel 会尝试插入两条记录。如果已经存在具有相同 `departure` 和 `destination` 列值的记录，Laravel 将更新该记录的 `price` 列。

> 注意：除 SQL Server 之外的所有数据库都要求 `upsert` 方法的第二个参数中的列具有“主”或“唯一”索引。 此外，MySQL 数据库驱动程序忽略 `upsert` 方法的第二个参数，并始终使用表的“主”和“唯一”索引来检测现有记录。

<a name="update-statements"></a>
## Update 语句

除了将记录插入数据库之外，查询构建器还可以使用 `update` 方法更新现有记录。 `update` 方法与 `insert` 方法一样，接受一个列和值对数组，指示要更新的列。 `update` 方法返回受影响的行数。您可以使用 `where` 子句限制 `update` 查询：

    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['votes' => 1]);



<a name="update-or-insert"></a>
#### 更新或新增

有时您可能希望更新数据库中的现有记录，或者如果不存在匹配记录则创建它。在这种情况下，可以使用 `updateOrInsert` 方法。`updateOrInsert` 方法接受两个参数：一个用于查找记录的条件数组，以及一个包含要更该记录的键值对数组。

`updateOrInsert` 方法将尝试使用第一个参数的列和值对来定位匹配的数据库记录。如果记录存在，它将使用第二个参数中的值进行更新。如果找不到记录，将插入一条新记录，其中包含两个参数的合并属性：

    DB::table('users')
        ->updateOrInsert(
            ['email' => 'john@example.com', 'name' => 'John'],
            ['votes' => '2']
        );

<a name="updating-json-columns"></a>
### 更新 JSON 字段

更新 JSON 字段时，你可以使用 `->` 语法访问 JSON 对象中相应的值。注意，此操作只能支持 `MySQL 5.7+` 和 `PostgreSQL 9.5+` ：

    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['options->enabled' => true]);

<a name="increment-and-decrement"></a>
### 自增与自减

查询构建器还提供了方便的方法来增加或减少给定列的值。这两种方法都至少接受一个参数：要修改的列。可以提供第二个参数来指定列应该增加或减少的数量：

    DB::table('users')->increment('votes');

    DB::table('users')->increment('votes', 5);

    DB::table('users')->decrement('votes');

    DB::table('users')->decrement('votes', 5);



您还可以在操作期间指定要更新的其他列：

    DB::table('users')->increment('votes', 1, ['name' => 'John']);

<a name="delete-statements"></a>
## 删除语句

查询构建器的 `delete` 方法可用于从表中删除记录。 `delete` 方法返回受影响的行数。您可以通过在调用 `delete` 方法之前添加“where”子句来限制 `delete` 语句：

    $deleted = DB::table('users')->delete();

    $deleted = DB::table('users')->where('votes', '>', 100)->delete();

如果您希望截断整个表，这将从表中删除所有记录并将自动递增 ID 重置为零，您可以使用 `truncate` 方法：

    DB::table('users')->truncate();

<a name="table-truncation-and-postgresql"></a>
#### 截断表 & PostgreSQL

截断 PostgreSQL 数据库时，将应用 `CASCADE` 行为。这意味着其他表中所有与外键相关的记录也将被删除。

<a name="pessimistic-locking"></a>
## 悲观锁

查询构建器还包括一些函数，可帮助您在执行 `select` 语句时实现「悲观锁」。 要使用「共享锁」执行语句，您可以调用 `sharedLock` 方法。共享锁可防止选定的行被修改，直到您的事务被提交：

    DB::table('users')
            ->where('votes', '>', 100)
            ->sharedLock()
            ->get();

或者，您可以使用 `lockForUpdate` 方法。「update」锁可防止所选记录被修改或被另一个共享锁选中：

    DB::table('users')
            ->where('votes', '>', 100)
            ->lockForUpdate()
            ->get();

<a name="debugging"></a>
## 调试

您可以在构建查询时使用 `dd` 和 `dump` 方法来转储当前查询绑定和 SQL。 `dd` 方法将显示调试信息，然后停止执行请求。 `dump` 方法将显示调试信息，但允许请求继续执行：

    DB::table('users')->where('votes', '>', 100)->dd();

    DB::table('users')->where('votes', '>', 100)->dump();

