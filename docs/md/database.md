
# 数据库: 快速入门

- [简介](#introduction)
    - [配置](#configuration)
    - [读写分离](#read-and-write-connections)
- [运行原生 SQL 查询](#running-queries)
    - [使用多个数据库连接](#using-multiple-database-connections)
    - [监听查询事件](#listening-for-query-events)
    - [监控累计查询时间](#monitoring-cumulative-query-time)
- [数据库事务](#database-transactions)
- [连接到数据库 CLI](#connecting-to-the-database-cli)
- [检查数据库](#inspecting-your-databases)
- [监控数据库](#monitoring-your-databases)

<a name="introduction"></a>
## 简介

几乎所有的应用程序都需要和数据库进行交互。Laravel 为此提供了一套非常简单易用的数据库交互方式。开发者可以使用原生 SQL，[查询构造器](/docs/laravel/10.x/queries)，以及 [Eloquent ORM](/docs/laravel/10.x/eloquent) 等方式与数据库交互。目前，Laravel 为以下五种数据库提供了官方支持：:


<div class="content-list" markdown="1">

- MariaDB 10.3+ ([版本策略](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([版本策略](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([版本策略](https://www.postgresql.org/support/versioning/))
- SQLite 3.8.8+
- SQL Server 2017+ ([版本策略](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

<a name="configuration"></a>
### 配置

Laravel数据库服务的配置位于应用程序的`config/database.php`配置文件中。在此文件中，您可以定义所有数据库连接，并指定默认情况下应使用的连接。此文件中的大多数配置选项由应用程序环境变量的值驱动。本文件提供了Laravel支持的大多数数据库系统的示例。

在默认情况下，Laravel 的示例 [环境配置](/docs/laravel/10.x/configuration#environment-configuration) 使用了 [Laravel Sail](/docs/laravel/10.x/sail)，Laravel Sail 是一种用于在本地开发 Laravel 应用的 Docker 配置。但你依然可以根据本地数据库的需要修改数据库配置。



<a name="sqlite-configuration"></a>
#### SQLite 配置

SQLite 数据库本质上只是一个存在你文件系统上的文件。你可以通过 <code>touch</code> 命令来建立一个新的 SQLite 数据库，如： <code>touch database/database.sqlite </code>. 建立数据库之后，你就可以很简单地使用数据库的绝对路径来配置 <code>DB_DATABASE</code> 环境变量，使其指向这个新创建的数据库：


```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

若要为 SQLite 连接启用外键约束，应将 <code>DB_FOREIGN_KEYS</code> 环境变量设置为 <code>true</code> ：

```ini
DB_FOREIGN_KEYS=true
```

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 配置

在使用 SQL Server 数据库前，你需要先确保你已安装并启用了 <code>sqlsrv</code> 和 <code>pdo_sqlsrv</code> PHP 扩展以及它们所需要的依赖项，例如 Microsoft SQL ODBC 驱动。

<a name="configuration-using-urls"></a>
#### URL 形式配置

通常，数据库连接使用多个配置项进行配置，例如 <code>host</code> 、<code>database</code> 、 <code>username</code> 、 <code>password</code> 等。这些配置项都拥有对应的环境变量。这意味着你需要在生产服务器上管理多个不同的环境变量。

部分数据库托管平台（如 AWS 和 Heroku）会提供了包含所有连接信息的数据库「URL」。它们通常看起来像这样：


```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

这些 URL 通常遵循标准模式约定：

```html
driver://username:password@host:port/database?options
```



为了方便起见，Laravel 支持使用这些 URL 替代传统的配置项来配置你的数据库。如果配置项 <code>url</code> （或其对应的环境变量 <code>DATABASE_URL</code> ）存在，那么 Laravel 将会尝试从 URL 中提取数据库连接以及凭证信息。

<a name="read-and-write-connections"></a>
### 读写分离

有时候你可能会希望使用一个数据库连接来执行 <code>SELECT</code> 语句，而 <code>INSERT</code>、<code>UPDATE</code> 和 <code>DELETE</code> 语句则由另一个数据库连接来执行。在 Laravel 中，无论你是使用原生 SQL 查询、查询构造器 或是 <code>Eloquent ORM</code>，都能轻松实现读写分离。

为了弄明白如何配置读写分离，我们先来看个例子：

    'mysql' => [
        'read' => [
            'host' => [
                '192.168.1.1',
                '196.168.1.2',
            ],
        ],
        'write' => [
            'host' => [
                '196.168.1.3',
            ],
        ],
        'sticky' => true,
        'driver' => 'mysql',
        'database' => 'database',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ],

请注意，我们在数据库配置中加入了三个键，分别是： <code>read</code>, <code>write</code> 以及 <code>sticky</code> 。<code>read</code> 和 <code>write</code> 的值是一个只包含 <code>host</code> 键的数组。这代表其他的数据库选项将会从主 <code>mysql</code> 配置中获取。

如果你想要覆写主 <code>mysql</code> 配置，只需要将需要覆写的值放到 <code>read</code> 和 <code>write</code> 数组里即可。所以，在这个例子中，<code>192.168.1.1</code> 将会被用作「读」连接主机，而 <code>192.168.1.3</code> 将作为「写」连接主机。这两个连接将共享 <code>mysql</code> 数组中的各项配置，如数据库凭证（用户名、密码）、前缀、字符编码等。如果 <code>host</code> 数组中存在多个值，<code>Laravel</code> 将会为每个连接随机选取所使用的数据库主机。




<a name="the-sticky-option"></a>
#### <code>sticky</code> 选项

<code>sticky</code> 是一个 可选 值，它用于允许 Laravel 立即读取在当前请求周期内写入到数据库的记录。若 <code>sticky</code> 选项被启用，且在当前请求周期中执行过「写」操作，那么在这之后的所有「读」操作都将使用「写」连接。这样可以确保同一个请求周期中写入的数据库可以被立即读取到，从而避免主从同步延迟导致的数据不一致。不过是否启用它取决于项目的实际需求。


<a name="running-queries"></a>
## 执行原生SQL查询

一旦配置好数据库连接，你就可以使用 <code>DB</code> Facade 来执行查询。<code>DB</code> Facade 为每种类型的查询都提供了相应的方法：<code>select</code>、<code>update</code>、<code>insert</code>、<code>delete</code> 以及 <code>statement</code>。


<a name="running-a-select-query"></a>
#### 执行 SELECT 查询

你可以使用 <code>DB</code> Facade 的 <code>select</code> 方法来执行一个基础的 SELECT 查询：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * 展示应用程序所有的用户列表.
         */
        public function index(): View
        {
            $users = DB::select('select * from users where active = ?', [1]);

            return view('user.index', ['users' => $users]);
        }
    }

传递给 <code>select</code> 方法的第一个参数是一个原生 SQL 查询语句，而第二个参数则是需要绑定到查询中的参数值。通常，这些值用于约束 <code>where</code> 语句。使用参数绑定可以有效防止 SQL 注入。



`select`方法将始终返回一个包含查询结果的数组。数组中的每个结果都对应一个数据库记录的`stdClass`对象：

    use Illuminate\Support\Facades\DB;

    $users = DB::select('select * from users');

    foreach ($users as $user) {
        echo $user->name;
    }

<a name="selecting-scalar-values"></a>
#### 选择标量值

有时你的数据库查询可能得到一个单一的标量值。而不是需要从记录对象中检索查询的标量结果，Laravel 允许你直接使用`scalar`方法检索此值:

    $burgers = DB::scalar(
        "select count(case when food = 'burger' then 1 end) as burgers from menu"
    );

<a name="using-named-bindings"></a>
#### 使用命名绑定

除了使用`?`表示参数绑定外，你还可以使用命名绑定的形式来执行一个查询：

    $results = DB::select('select * from users where id = :id', ['id' => 1]);

<a name="running-an-insert-statement"></a>
#### 执行 Insert 语句

你可以使用`DB` Facade 的`insert`方法来执行语句。跟`select`方法一样，该方法的第一个和第二个参数分别是原生 SQL 语句和绑定的数据：

    use Illuminate\Support\Facades\DB;

    DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);

<a name="running-an-update-statement"></a>
#### 执行 Update 语句

`update`方法用于更新数据库中现有的记录。该方法将会返回受到本次操作影响的记录行数：

    use Illuminate\Support\Facades\DB;

    $affected = DB::update(
        'update users set votes = 100 where name = ?',
        ['Anita']
    );

<a name="running-a-delete-statement"></a>
#### 执行 Delete 语句



`delete` 函数被用于删除数据库中的记录。它的返回值与 `update` 函数相同，返回本次操作受影响的总行数。

    use Illuminate\Support\Facades\DB;

    $deleted = DB::delete('delete from users');

<a name="执行指定的 SQL"></a>
#### 执行指定的 SQL

部分 SQL 语句不返回任何值。在这种情况下，你可能需要使用 `DB::statement($sql)` 来执行你的 SQL 语句。

    DB::statement('drop table users');

<a name="直接执行 SQL"></a>
#### 直接执行 SQL

有时候你可能想执行一段 SQL 语句，但不需要进行 SQL 预处理绑定。这种情况下你可以使用 `DB::unprepared($sql)` 来执行你的 SQL 语句。

    DB::unprepared('update users set votes = 100 where name = "Dries"');

> **注意**  
> 未经过预处理 SQL 的语句不绑定参数，它们可能容易受到 SQL 注入的攻击。在没有必要的理由的情况下，你不应直接在 SQL 中使用用户传入的数据。

<a name="在事务中的隐式提交"></a>
#### 在事务中的隐式提交

在事务中使用 `DB::statement($sql)` 与 `DB::unprepared($sql)` 时，你必须要谨慎处理，避免 SQL 语句产生[隐式提交](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)。这些语句会导致数据库引擎间接地提交整个事务, 让 Laravel 丢失数据库当前的事务级别。下面是一个会产生隐式提交的示例 SQL：创建一个数据库表。

    DB::unprepared('create table a (col varchar(1) null)');

请参考[MySQL 官方手册](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)以了解更多隐式提交的信息。

<a name="使用多数据库连接"></a>
### 使用多数据库连接



如果你在配置文件 `config/database.php` 中定义了多个数据库连接的话，你可以通过 DB Facade 的 `connection` 方法来使用它们。传递给 `connection` 方法的连接名称应该是你在 `config/database.php` 里或者通过 `config` 助手函数在运行时配置的连接之一：


    use Illuminate\Support\Facades\DB;

    $users = DB::connection('sqlite')->select(/* ... */);

你也可以使用一个连接实例上的 `getPdo` 方法来获取底层的 PDO 实例：

    $pdo = DB::connection()->getPdo();

<a name="listening-for-query-events"></a>
### 监听查询事件

如果你想要获取程序执行的每一条 SQL 语句，可以使用 `Db` facade 的 `listen` 方法。该方法对查询日志和调试非常有用，你可以在 [服务提供者](/docs/laravel/10.x/providers) 中使用 `boot` 方法注册查询监听器。

    <?php

    namespace App\Providers;

    use Illuminate\Database\Events\QueryExecuted;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任意应用服务
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任意应用服务
         */
        public function boot(): void
        {
            DB::listen(function (QueryExecuted $query) {
                // $query->sql;
                // $query->bindings;
                // $query->time;
            });
        }
    }

<a name="monitoring-cumulative-query-time"></a>
### 监控累积查询时间

现代web应用程序的一个常见性能瓶颈是查询数据库所花费的时间。幸运的是，当Laravel在单个请求中花费了太多时间查询数据库时，它可以调用你定义的闭包或回调。要使用它，你可以调用 `whenQueryingForLongerThan` 方法并提供查询时间阀值(以毫秒为单位)和一个闭包作为参数。你可以在[服务提供者](/docs/laravel/10.x/providers) 的 `boot` 方法中调用此方法：

    <?php

    namespace App\Providers;

    use Illuminate\Database\Connection;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Database\Events\QueryExecuted;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任意应用服务
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任意应用服务
         */
        public function boot(): void
        {
            DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
                // 通知开发团队...
            });
        }
    }



<a name="database-transactions"></a>
##  数据库事务

想要在数据库事务中运行一系列操作，你可以使用 <code>DB</code> 门面的 <code>transaction</code> 方法。如果在事务的闭包中出现了异常，事务将会自动回滚。如果闭包执行成功，事务将会自动提交。在使用 <code>transaction</code> 方法时不需要手动回滚或提交：


    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    });

<a name="handling-deadlocks"></a>
#### 处理死锁

<code>transaction</code> 方法接受一个可选的第二个参数，该参数定义发生死锁时事务应重试的次数。一旦这些尝试用尽，就会抛出一个异常：

    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    }, 5);

<a name="manually-using-transactions"></a>
#### 手动执行事务

如果你想要手动处理事务并完全控制回滚和提交，可以使用 <code>DB</code> 门面提供的 <code>beginTransaction</code> 方法：

    use Illuminate\Support\Facades\DB;

    DB::beginTransaction();

你可以通过 <code>rollBack</code> 方法回滚事务：

    DB::rollBack();

最后，你可以通过 <code>commit</code> 方法提交事务：

    DB::commit();

> **技巧**  
> <code>DB</code> 门面的事务方法还可以用于控制 [查询构造器](/docs/laravel/10.x/queries) and [Eloquent ORM](/docs/laravel/10.x/eloquent).

<a name="connecting-to-the-database-cli"></a>
## 连接到数据库 CLI



如果你想连接到数据库的 CLI，则可以使用 <code>db</code> Artisan 命令：

```shell
php artisan db
```

如果需要，你可以指定数据库连接名称以连接到不是默认连接的数据库连接：

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## 检查你的数据库

使用 <code>db:show</code> 和 <code>db:table</code> Artisan 命令，你可以深入了解数据库及其相关的表。要查看数据库的概述，包括它的大小、类型、打开的连接数以及表的摘要，你可以使用 <code>db:show</code> 命令：

```shell
php artisan db:show
```

你可以通过 <code>--database</code> 选项向命令提供数据库连接名称来指定应该检查哪个数据库连接:


```shell
php artisan db:show --database=pgsql
```

如果希望在命令的输出中包含表行计数和数据库视图详细信息，你可以分别提供 <code>--counts</code> 和 <code>--views</code> 选项。在大型数据库上，检索行数和视图详细信息可能很慢:

```shell
php artisan db:show --counts --views
```

<a name="table-overview"></a>
#### 表的摘要信息

如果你想获得数据库中单张表的概览，你可以执行 <code>db:table</code> Artisan命令。这个命令提供了一个数据库表的概览，包括它的列、类型、属性、键和索引:

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## 监视数据库

使用 <code>db:monitor</code> Artisan命令，如果你的数据库正在管理超过指定数量的打开连接，可以通过 Laravel 调度触发 <code>Illuminate\Database\Events\DatabaseBusy</code> 事件。



开始, 你应该将 `db:monitor` 命令安排为 [每分钟运行一次](/docs/laravel/10.x/scheduling)。 该命令接受要监视的数据库连接配置的名称，以及在分派事件之前应允许的最大打开连接数：

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

仅调度此命令不足以触发通知，提醒你打开的连接数。当命令遇到打开连接计数超过阈值的数据库时，将调度 `DatabaseBusy` 事件。你应该在应用程序的 `EventServiceProvider` 中侦听此事件，以便向你或你的开发团队发送通知

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * 为应用程序注册任何其他事件。
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
                ->notify(new DatabaseApproachingMaxConnections(
                    $event->connectionName,
                    $event->connections
                ));
    });
}
```

