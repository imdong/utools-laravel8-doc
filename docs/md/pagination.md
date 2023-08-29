# 数据库：分页

- [介绍](#介绍)
- [基本用法](#基本用法)
    - [对查询构造器结果进行分页](#对查询构造器结果进行分页)
    - [Eloquent ORM 分页](#EloquentORM分页)
    - [游标分页](#游标分页)
    - [手动创建分页](#手动创建分页)
    - [自定义分页 URL](#自定义分页URL)
- [显示分页结果](#显示分页结果)
    - [调整分页链接窗口](#调整分页链接窗口)
    - [将结果转换为 JSON](#将结果转换为JSON)
- [自定义分页视图](#自定义分页视图)
    - [使用 Bootstrap](#使用Bootstrap)
- [分页器实例方法](#分页器实例方法)
- [游标分页器实例方法](#游标分页器实例方法)

<a name="介绍"></a>
## 介绍
在其他框架中，分页可能非常痛苦，我们希望 Laravel 的分页方法像一股新鲜空气。 Laravel 的分页器集成了 [query builder](/docs/laravel/10.x/queries) 和 [Eloquent ORM](/docs/laravel/10.x/eloquent)，并提供了方便、易于使用的无需任何配置的数据库记录分页。

默认情况下，由分页器生成的 HTML 与 [Tailwind CSS 框架](https://tailwindcss.com/) 兼容，然而，引导分页支持也是可用的。

<a name="tailwind-jit"></a>
#### Tailwind JIT

如果你使用 Laravel 的默认 Tailwind 视图和 Tailwind JIT 引擎，你应该确保你的应用程序的 `tailwind.config.js` 文件的 `content` 关键引用 Laravel 的分页视图，这样它们的 Tailwind 类就不会被清除：

```js
content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
],
```

<a name="基础用法"></a>
## 基础用法

<a name="对查询构造器结果进行分页"></a>
### 对查询构造器结果进行分页
有几种方法可以对结果进行分页，最简单的方法是在 [query builder](/docs/laravel/10.x/queries) 或 [Eloquent query](/docs/laravel/10.x/eloquent) 上使用 `paginate` 方法， `paginate` 方法根据用户查看的当前页面自动设置查询的「limit」和「offset」，默认情况下，通过 HTTP 请求中的 `page` 查询字符串参数的值检测当前页面，Laravel会自动检测这个值，它也会自动插入到分页器生成的链接中。


在下面的例子中，传递给 <code>paginate</code> 方法的唯一参数是你想要在一页中显示的记录数。在此例中，我们希望「每页」显示 <code>15</code> 条数据：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 显示应用中所有用户列表
         */
        public function index(): View
        {
            return view('user.index', [
                'users' => DB::table('users')->paginate(15)
            ]);
        }
    }

<a name="simple-pagination"></a>
#### 简单分页

该 <code>paginate</code> 方法会在查询数据库之前先计算与查询匹配的记录总数，从而让分页器知道总共需要有多少个页面来显示所有的记录。不过，如果你不打算在界面上显示总页数的话，那么计算记录总数是没有意义的。

因此，如果你只需要显示一个简单的「上一页」和「下一页」链接的话， <code>simplePaginate</code> 方法是一个更高效的选择：


    $users = DB::table('users')->simplePaginate(15);

<a name="paginating-eloquent-results"></a>
### Eloquent ORM 分页

你也可以对 [Eloquent](/docs/laravel/10.x/eloquent) 查询结果进行分页. 在下面的例子中，我们将 <code>App\Models\User</code> 模型按每页 15 条记录进行分页。如你所见，其语法与查询构造器分页基本相同：

    use App\Models\User;

    $users = User::paginate(15);

当然，你也可以在调用 <code>paginate</code> 方法之前为查询添加其他约束，例如 <code>where</code> 子句：

    $users = User::where('votes', '>', 100)->paginate(15);



你也可以在 Eloquent ORM 分页中使用 `simplePaginate`：

    $users = User::where('votes', '>', 100)->simplePaginate(15);

同样，您可以使用 `cursorPaginate` 方法对 Eloquent 模型进行游标分页：

    $users = User::where('votes', '>', 100)->cursorPaginate(15);

<a name="multiple-paginator-instances-per-page"></a>
#### 每页有多个 Paginator 实例

有时你可能需要在应用程序呈现的单个屏幕上呈现两个单独的分页器。 但是，如果两个分页器实例都使用 `page` 查询字符串参数来存储当前页面，则两个分页器会发生冲突。 要解决此冲突，您可以通过提供给 `paginate`、`simplePaginate` 和 `cursorPaginate` 方法的第三个参数传递你希望用于存储分页器当前页面的查询字符串参数的名称：

    use App\Models\User;

    $users = User::where('votes', '>', 100)->paginate(
        $perPage = 15, $columns = ['*'], $pageName = 'users'
    );

<a name="cursor-pagination"></a>
### 游标分页

虽然 <code>paginate</code> 和 <code>simplePaginate</code> 使用 SQL「offset」 子句创建查询，但游标分页通过构造「where」子句来工作，这些子句比较查询中包含的有序列的值，提供所有可用的最有效的数据库性能 Laravel 的分页方法。 这种分页方法特别适合大型数据集和「无限」滚动用户界面。

与基于偏移量的分页在分页器生成的 URL 的查询字符串中包含页码不同，基于游标的分页在查询字符串中放置一个「游标」字符串。游标是一个编码字符串，包含下一个分页查询应该开始分页的位置和它应该分页的方向：

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```



你可以通过查询生成器提供的 `cursorPaginate` 方法创建基于游标的分页器实例。这个方法返回一个 `Illuminate\Pagination\CursorPaginator` 的实例：

    $users = DB::table('users')->orderBy('id')->cursorPaginate(15);

检索到游标分页器实例后，你可以像使用 `paginate` 和 `simplePaginate` 方法时一样[显示分页结果](displaying-pagination-results)。更多游标分页器提供的实例方法请参考[游标分页器实例方法文档](#cursor-paginator-instance-methods).

> **注意**
> 你的查询必须包含「order by」子句才能使用游标分页。

<a name="cursor-vs-offset-pagination"></a>
#### 游标与偏移分页

为了说明偏移分页和游标分页之间的区别，让我们检查一些示例 SQL 查询。 以下两个查询都将显示按 `id` 排序的 `users` 表的「第二页」结果：

```sql
# 偏移分页...
select * from users order by id asc limit 15 offset 15;

# 游标分页...
select * from users where id > 15 order by id asc limit 15;
```

与偏移分页相比，游标分页查询具有以下优势：

- 对于大型数据集，如果「order by」列被索引，游标分页将提供更好的性能。 这是因为「offset」子句会扫描所有先前匹配的数据。

- 对于频繁写入的数据集，如果最近在用户当前查看的页面中添加或删除了结果，偏移分页可能会跳过记录或显示重复。

但是，游标分页有以下限制：

- 与 `simplePaginate` 一样，游标分页只能用于显示「下一个」和「上一个」链接，不支持生成带页码的链接。

- 它要求排序基于至少一个唯一列或唯一列的组合。 不支持具有 `null` 值的列。

-「order by」子句中的查询表达式仅在它们被别名并添加到「select」子句时才受支持。




<a name="manually-creating-a-paginator"></a>
### 手动创建分页

有时你可能希望手动创建分页，并传递一个包含数据的数组给它。这可以通过手动创建 `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator` 或者 `Illuminate\Pagination\CursorPaginator` 实例来实现，这取决于你的需要。

`Paginator` 不需要知道数据的总数。然而，你也无法通过 `Paginator` 获取最后一页的索引。而 `LengthAwarePaginator` 接受和 `Paginator` 几乎相同的参数，不过，它会计算数据的总数。

或者说，`Paginator` 相当于查询构造器或者 Eloquent ORM 分页的 `simplePaginate` 方法，而 `LengthAwarePaginator` 相当于 `paginate` 方法。

> **注意**  
> 手动创建分页器实例时，你应该手动「切片」传递给分页器的结果数组。如果你不确定如何执行此操作，请查看 [array_slice](https://secure.php.net/manual/en/function.array-slice.php) PHP 函数。

<a name="customizing-pagination-urls"></a>
### 自定义分页的 URL

默认情况下，分页器生成的链接会匹配当前的请求 URL。不过，分页器的 withPath 方法允许你自定义分页器生成链接时使用的 URL。比如说，你想要分页器生成类似 https://example.com/admin/users?page=N 的链接，你应该给 `withPath` 方法传递 `/admin/users` 参数：

    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->withPath('/admin/users');

        // ...
    });



<a name="appending-query-string-values"></a>
#### 附加参数到分页链接

你可以使用 `appends` 方法向分页链接中添加查询参数。例如，要在每个分页链接中添加 `sort=votes` ，你应该这样调用 `appends`：

    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->appends(['sort' => 'votes']);

        // ...
    });

如果你想要把当前所有的请求查询参数添加到分页链接，你可以使用 `withQueryString` 方法：

    $users = User::paginate(15)->withQueryString();

<a name="appending-hash-fragments"></a>
#### 附加 hash 片段

如果你希望向分页器的 URL 添加「哈希片段」，你可以使用 `fragment` 方法。例如，你可以使用 `fragment` 方法，为 `#user` 添加分页链接：

    $users = User::paginate(15)->fragment('users');

<a name="displaying-pagination-results"></a>
## 显示分页结果

当调用 `paginate` 方法时， 你会得到一个 `Illuminate\Pagination\LengthAwarePaginator` 实例， 而调用 `simplePaginate` 方法时，会得到一个 `Illuminate\Pagination\Paginator` 实例。 最后，调用 `cursorPaginate` 方法，会得到 `Illuminate\Pagination\CursorPaginator` 实例。

这些对象提供了数个方法来获取结果集的信息。除了这些辅助方法外，分页器的实例是迭代器，可以像数组一样遍历。所以，你可以使用 [Blade](/docs/laravel/10.x/blade) 模板来显示数据、渲染分页链接等：


```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

links 方法会渲染结果集中剩余页面的链接。每个链接都包含了 page 查询字符串变量。请记住，links 方法生成的 HTML 兼容 [Tailwind CSS 框架](https://tailwindcss.com) 。



<a name="adjusting-the-pagination-link-window"></a>
### 调整分页链接窗口

在使用分页器展示分页链接时，将展示当前页及当前页面前后各三页的链接。如果有需要，你可以通过 `onEachSide` 方法来控制每侧显示多少个链接：

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### 将结果转换为JSON

Laravel 分页器类实现了 `Illuminate\Contracts\Support\Jsonable` 接口契约，提供了 `toJson` 方法。这意味着你可以很方便地将分页结果转换为 JSON。你也可以通过直接在路由闭包或者控制器方法中返回分页实例来将其转换为 JSON：

    use App\Models\User;

    Route::get('/users', function () {
        return User::paginate();
    });

分页器生成的 JSON 会包括诸如 `total`，`current_page`，`last_page`等元数据信息。实际结果对象将通过 JSON 数组的 `data` 键提供。以下是通过自路由中分页器实例的方式创建 JSON 的例子：

    {
       "total": 50,
       "per_page": 15,
       "current_page": 1,
       "last_page": 4,
       "first_page_url": "http://laravel.app?page=1",
       "last_page_url": "http://laravel.app?page=4",
       "next_page_url": "http://laravel.app?page=2",
       "prev_page_url": null,
       "path": "http://laravel.app",
       "from": 1,
       "to": 15,
       "data":[
            {
                // 分页数据...
            },
            {
                // 分页数据...
            }
       ]
    }

<a name="customizing-the-pagination-view"></a>
## 自定义分页视图

默认情况下，分页器渲染的视图与 [Tailwind CSS](https://tailwindcss.com) 兼容。不过，如果你并非使用 Tailwind，你也可以自由地定义用于渲染这些链接的视图。在调用分页器实例的 `links` 方法时，将视图名称作为第一个参数传递给该方法：

```blade
{{ $paginator->links('view.name') }}

<!-- 向视图传递参数... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```



不过，最简单的自定义分页视图的方法依然是使用 `vendor:publish` 命令将它们导出到 `resources/views/vendor` 目录：

```shell
php artisan vendor:publish --tag=laravel-pagination
```

这个命令将会把分页视图导出到 `resources/views/vendor/pagination` 目录。该目录下的 `tailwind.blade.php` 文件就是默认的分页视图。你可以通过编辑这一文件来自定义分页视图。

如果你想要定义不同的文件作为默认的分页视图，你可以在 `App\Providers\AppServiceProvider` 服务提供者中的 `boot` 方法内调用 `defaultView` 和 `defaultSimpleView` 方法：

    <?php

    namespace App\Providers;

    use Illuminate\Pagination\Paginator;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 引导应用程序服务
         */
        public function boot(): void
        {
            Paginator::defaultView('view-name');

            Paginator::defaultSimpleView('view-name');
        }
    }

<a name="using-bootstrap"></a>
### 使用 Bootstrap

Laravel 同样包含使用 [Bootstrap CSS](https://getbootstrap.com/) 构建的分页视图。要使用这些视图来替代默认的 Tailwind 视图，你可以在 `App\Providers\AppServiceProvider` 服务提供者中的 `boot` 方法内调用分页器的 `useBootstrapFour` 或 `useBootstrapFive` 方法：

    use Illuminate\Pagination\Paginator;

    /**
     * 引导应用程序服务
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
        Paginator::useBootstrapFour();
    }

<a name="paginator-instance-methods"></a>
## 分页器实例方法

每一个分页器实例都提供了下列方法来获取分页信息：

方法  |  描述
-------  |  -----------
`$paginator->count()`  |  获取分页的总数据
`$paginator->currentPage()`  |  获取当前页码
`$paginator->firstItem()`  |  获取结果集中第一个数据的编号
`$paginator->getOptions()`  |  获取分页器选项
`$paginator->getUrlRange($start, $end)`  |  创建指定页数范围的 URL
`$paginator->hasPages()`  |  是否有足够多的数据来创建多个页面
`$paginator->hasMorePages()`  |  是否有更多的页面可供展示
`$paginator->items()`  |  获取当前页的数据项
`$paginator->lastItem()`  |  获取结果集中最后一个数据的编号
`$paginator->lastPage()`  |  获取最后一页的页码（在`simplePaginate`中不可用）
`$paginator->nextPageUrl()`  |  获取下一页的 URL
`$paginator->onFirstPage()`  |  当前页是否为第一页
`$paginator->perPage()`  |  获取每一页显示的数量总数
`$paginator->previousPageUrl()`  |  获取上一页的 URL
`$paginator->total()`  |  获取结果集中的数据总数（在 `simplePaginate`中不可用）
`$paginator->url($page)`  |  获取指定页的 URL
`$paginator->getPageName()`  |  获取用于储存页码的查询参数名
`$paginator->setPageName($name)`  |  设置用于储存页码的查询参数名



<a name="cursor-paginator-instance-methods"></a>
## 游标分页器实例方法

每一个分页器实例都提供了下列额外方法来获取分页信息:

方法  |  描述
-------  |  -----------
`$paginator->count()`  |  获取当前页的数据总数
`$paginator->cursor()`  |  获取当前分页实例
`$paginator->getOptions()`  |  获取分页参数选项
`$paginator->hasPages()`  |  判断是否有足够数据用于分页
`$paginator->hasMorePages()`  |  判断数据存储是否还有更多项目
`$paginator->getCursorName()`  |  获取用于查询实例的变量名称
`$paginator->items()`  | 获取当前页面的数据项目
`$paginator->nextCursor()`  |  获取下一页数据实例
`$paginator->nextPageUrl()`  | 获取下一页URL
`$paginator->onFirstPage()`  |  判断页面是否属于第一页
`$paginator->perPage()`  |  每页显示的数据数量
`$paginator->previousCursor()`  |  获取上一页数据实例
`$paginator->previousPageUrl()`  |  获取上一页URL
`$paginator->setCursorName()`  |  设置用于查询实例的变量名称
`$paginator->url($cursor)`  |  获取指定实例的 URL
