# 数据库：快速入门

- [简介](#introduction)
    - [配置](#configuration)
    - [读写分离](#read-and-write-connections)
- [运行原生 SQL 查询](#running-queries)
    - [使用多个数据库连接](#using-multiple-database-connections)
    - [监听查询事件](#listening-for-query-events)
- [数据库事务](#database-transactions)
- [连接到数据库 CLI](#connecting-to-the-database-cli)

<a name="introduction"></a>
## 简介

几乎所有的应用程序都需要和数据库进行交互。Laravel 为此提供了一套非常简单易用的数据库交互方式。开发者可以使用原生 SQL、[查询构造器](/docs/laravel/9.x/queries)以及 [Eloquent ORM](/docs/laravel/9.x/eloquent) 等方式与数据库交互。目前，Laravel 为以下四种数据库提供了官方支持：

<div class="content-list" markdown="1">
- MariaDB 10.2+（[版本政策](https://mariadb.org/about/#maintenance-policy)）
- MySQL 5.7+ ([版本策略](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([版本策略](https://www.postgresql.org/support/versioning/))
- SQLite 3.8.8+
- SQL Server 2017+ ([版本策略](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

<a name="configuration"></a>
### 配置

数据库的配置文件在 `config/database.php` 文件中。你可以在这个文件中配置所有的数据库连接，并指定默认的数据库连接。该文件中的大部分配置都基于项目的环境变量，且提供了大部分 Laravel 所支持的数据库配置示例。

在默认情况下，Laravel 的示例 [环境配置](/docs/laravel/9.x/configuration#environment-configuration) 使用了 [Laravel Sail](/docs/laravel/9.x/sail)，Laravel Sail 是一种用于在本地开发 Laravel 应用的 Docker 配置。但你依然可以根据本地数据库的需要修改数据库配置。



<a name="sqlite-configuration"></a>
#### SQLite 配置

SQLite 数据库本质上只是一个存在你文件系统上的文件。你可以通过 `touch` 命令来建立一个新的 SQLite 数据库，如： `touch database/database.sqlite`. 建立数据库之后，你就可以很简单地使用数据库的绝对路径来配置 `DB_DATABASE` 环境变量，使其指向这个新创建的数据库：

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

若要为 SQLite 连接启用外键约束，应将 `DB_FOREIGN_KEYS` 环境变量设置为 `true`：

```ini
DB_FOREIGN_KEYS=true
```

<a name="mssql-configuration"></a>
#### Microsoft SQL Server 配置

在使用 SQL Server 数据库前，你需要先确保你已安装并启用了 `sqlsrv` 和 `pdo_sqlsrv` PHP 扩展以及它们所需要的依赖项，例如 Microsoft SQL ODBC 驱动。

<a name="configuration-using-urls"></a>
#### URL 形式配置

通常，数据库连接使用多个配置项进行配置，例如 `host`、 `database`、 `username`、 `password` 等。这些配置项都拥有对应的环境变量。这意味着你需要在生产服务器上管理多个不同的环境变量。

部分数据库托管平台（如 AWS 和 Heroku）会提供了包含所有连接信息的数据库「URL」。它们通常看起来像这样：

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

这些 URL 通常遵循标准模式约定：

```html
driver://username:password@host:port/database?options
```



为了方便起见，Laravel 支持使用这些 URL 替代传统的配置项来配置你的数据库。如果配置项 `url` （或其对应的环境变量 `DATABASE_URL` ）存在，那么 Laravel 将会尝试从 URL 中提取数据库连接以及凭证信息。

<a name="read-and-write-connections"></a>
### 读写分离

有时候你可能会希望使用一个数据库连接来执行 `SELECT` 语句，而 `INSERT`、`UPDATE` 和 `DELETE` 语句则由另一个数据库连接来执行。在 Laravel 中，无论你是使用原生 SQL 查询、查询构造器 或是 `Eloquent ORM`，都能轻松实现读写分离。

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

请注意，我们在数据库配置中加入了三个键，分别是： `read`, `write` 以及 `sticky`。`read` 和 `write` 的值是一个只包含 `host` 键的数组。这代表其他的数据库选项将会从主 `mysql` 配置中获取。

如果你想要覆写主 `mysql` 配置，只需要将需要覆写的值放到 `read` 和 `write` 数组里即可。所以，在这个例子中，`192.168.1.1` 将会被用作「读」连接主机，而 `192.168.1.3` 将作为「写」连接主机。这两个连接将共享 `mysql` 数组中的各项配置，如数据库凭证（用户名、密码）、前缀、字符编码等。如果 `host` 数组中存在多个值，`Laravel` 将会为每个连接随机选取所使用的数据库主机。



<a name="the-sticky-option"></a>
#### `sticky` 选项

`sticky` 是一个 *可选* 值，它用于允许 Laravel 立即读取在当前请求周期内写入到数据库的记录。若 `sticky` 选项被启用，且在当前请求周期中执行过「写」操作，那么在这之后的所有「读」操作都将使用「写」连接。这样可以确保同一个请求周期中写入的数据库可以被立即读取到，从而避免主从同步延迟导致的数据不一致。不过是否启用它取决于项目的实际需求。

<a name="running-queries"></a>
## 执行原生 SQL 查询

一旦配置好数据库连接，你就可以使用 `DB` Facade 来执行查询。`DB` Facade 为每种类型的查询都提供了相应的方法：`select`、`update`、`insert`、`delete` 以及 `statement`。

<a name="running-a-select-query"></a>
#### 执行 SELECT 查询

你可以使用 `DB` Facade 的 `select` 方法来执行一个基础的 SELECT 查询：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;

    class UserController extends Controller
    {
        /**
         * 展示用户列表
         *
         * @return \Illuminate\Http\Response
         */
        public function index()
        {
            $users = DB::select('SELECT * FROM `users` WHERE `active` = ?', [1]);

            return view('user.index', ['users' => $users]);
        }
    }

传递给 `select` 方法的第一个参数是一个原生 SQL 查询语句，而第二个参数则是需要绑定到查询中的参数值。通常，这些值用于约束 `where` 语句。使用参数绑定可以有效防止 SQL 注入。

`select` 方法将始终返回一个包含查询结果的数组。数组中的每个结果都对应一个数据库记录的 `stdClass` 对象：

    use Illuminate\Support\Facades\DB;

    $users = DB::select('select * from users');

    foreach ($users as $user) {
        echo $user->name;
    }

#### 使用命名绑定

除了使用 `?` 表示参数绑定外，你还可以使用命名绑定的形式来执行一个查询：

    $results = DB::select('select * from users where id = :id', ['id' => 1]);

#### 执行 Insert 语句

你可以使用 `DB` Facade 的 `insert` 方法来执行 `insert` 语句。跟 `select` 方法一样，该方法的第一个和第二个参数分别是原生 SQL 语句和绑定的数据：

    use Illuminate\Support\Facades\DB;

    DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);

#### 执行 Update 语句

`update` 方法用于更新数据库中现有的记录。该方法将会返回受到本次操作影响的记录行数：

    use Illuminate\Support\Facades\DB;

    $affected = DB::update(
        'update users set votes = 100 where name = ?',
        ['Anita']
    );

#### 执行 Delete 语句

`delete` 方法用于从数据库中删除现有的记录。与 `update` 方法一样，将返回受到本次操作影响的记录行数：

    use Illuminate\Support\Facades\DB;

    $deleted = DB::delete('delete from users');

#### 执行 General 语句

部分数据库语句没有返回值。对于这些语句，你可以使用 `DB` Facade 的 `statement` 方法：

    DB::statement('drop table users');



<a name="running-an-unprepared-statement"></a>
#### 执行未预处理的查询

有时你可能希望查询语句在不绑定任何参数的情况下执行。对于这些类型的操作，你可以使用 `DB` Facade 的 `unprepared` 方法：

    DB::unprepared('update users set votes = 100 where name = "Dries"');

> 注意：由于通过以上方式执行的语句不会进行预处理，即不会绑定任何参数值，它们非常容易遭到 SQL 注入攻击。请永远不要让用户输入的值出现在未预处理的语句里。

<a name="implicit-commits-in-transactions"></a>
#### Implicit Commits

当在事务中使用 `DB` Facade 的 `statement` 和 `unprepared` 方法时，请务必留意会导致 [隐式提交](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)的语句。这些语句将会导致数据库引擎间接提交整个事务，从而让 Laravel 不知道数据库的事务级别。其中一个例子是创建数据表：

    DB::unprepared('create table a (col varchar(1) null)');

你可以参考 MySQL 手册以获取所有可以触发隐式提交的 [语句列表](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html) 

<a name="using-multiple-database-connections"></a>
### 使用多数据库连接

如果你在配置文件 `config/database.php` 中定义了多个数据库连接的话，你可以通过 `DB` Facade 的 `connection` 方法来使用它们。传递给 `connection` 方法的连接名称应该是你在 `config/database.php` 里或者通过 `config` 助手函数在运行时配置的连接之一：

    use Illuminate\Support\Facades\DB;

    $users = DB::connection('sqlite')->select(...);

你也可以使用一个连接实例上的 `getPdo` 方法来获取底层的 PDO 实例：

    $pdo = DB::connection()->getPdo();



<a name="listening-for-query-events"></a>
### 监听查询事件

如果你想要获取程序执行的每一条 SQL 语句，可以使用 `listen` 方法。该方法对查询日志和调试非常有用，你可以在 [服务提供者](/docs/laravel/9.x/providers) 中注册查询监听器。

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任意应用服务
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 引导任意应用服务
         *
         * @return void
         */
        public function boot()
        {
            DB::listen(function ($query) {
                // $query->sql;
                // $query->bindings;
                // $query->time;
            });
        }
    }

<a name="database-transactions"></a>
## 数据库事务

想要在数据库事务中运行一系列操作，你可以使用 `DB` 门面的 `transaction` 方法。如果在事务的闭包中出现了异常，事务将会自动回滚。如果闭包执行成功，事务将会自动提交。在使用 `transaction` 方法时不需要手动回滚或提交：

    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    });

<a name="handling-deadlocks"></a>
#### 处理死锁

 `transaction` 方法接受一个可选的第二个参数，该参数定义发生死锁时事务应重试的次数。一旦这些尝试用尽，就会抛出一个异常：

    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    }, 5);



<a name="manually-using-transactions"></a>
#### 手动执行事务

如果你想要手动处理事务并完全控制回滚和提交，可以使用 `DB` 门面提供的 `beginTransaction` 方法：

    use Illuminate\Support\Facades\DB;

    DB::beginTransaction();

你可以通过 `rollBack` 方法回滚事务：

    DB::rollBack();

最后，你可以通过 `commit` 方法提交事务：

    DB::commit();

> 技巧：`DB` 门面的事务方法还可以用于控制 [查询构造器](/docs/laravel/9.x/queries) 和 [Eloquent ORM](/docs/laravel/9.x/eloquent) 的事务。

<a name="connecting-to-the-database-cli"></a>
## 连接到数据库 CLI

如果您想连接到数据库的 CLI，则可以使用 `db` Artisan 命令：

```shell
php artisan db
```

如果需要，您可以指定数据库连接名称以连接到不是默认连接的数据库连接：

```shell
php artisan db mysql
```


