# 数据库: 迁移

- [介绍](#introduction)
- [生成迁移](#generating-migrations)
    - [整合迁移](#squashing-migrations)
- [迁移结构](#migration-structure)
- [执行迁移](#running-migrations)
    - [回滚迁移](#rolling-back-migrations)
- [数据表](#tables)
    - [创建数据表](#creating-tables)
    - [更新数据表](#updating-tables)
    - [重命名 / 删除表](#renaming-and-dropping-tables)
- [字段](#columns)
    - [创建字段](#creating-columns)
    - [可用的字段类型](#available-column-types)
    - [字段修饰符](#column-modifiers)
    - [修改字段](#modifying-columns)
    - [重命名字段](#renaming-columns)
    - [删除字段](#dropping-columns)
- [索引](#indexes)
    - [创建索引](#creating-indexes)
    - [重命名索引](#renaming-indexes)
    - [删除索引](#dropping-indexes)
    - [外键约束](#foreign-key-constraints)
- [事件](#events)

<a name="introduction"></a>
## 介绍

迁移就像数据库的版本控制，允许你的团队定义和共享应用程序的数据库架构定义。 如果你曾经不得不告诉团队成员在从代码控制中拉取更新后手动添加字段到他们的本地数据库，那么你就遇到了数据库迁移解决的问题。

Laravel `Schema` [facade](/docs/laravel/10.x/facades) 为所有 Laravel 支持的数据库系统的创建和操作表提供了不依赖于数据库的支持。通常情况下，迁移会使用 facade 来创建和修改数据表和字段。

<a name="generating-migrations"></a>
## 生成迁移

你可以使用 `make:migration` [Artisan 命令](/docs/laravel/10.x/artisan) 来生成数据库迁移。新的迁移文件将放在你的 `database/migrations` 目录下。每个迁移文件名都包含一个时间戳来使 Laravel 确定迁移的顺序：

```shell
php artisan make:migration create_flights_table
```

Laravel 将使用迁移文件的名称来猜测表名以及迁移是否会创建一个新表。如果 Laravel 能够从迁移文件的名称中确定表的名称，它将在生成的迁移文件中预填入指定的表，或者，你也可以直接在迁移文件中手动指定表名。


如果要为生成的迁移指定自定义路径，你可以在执行 `make:migration` 命令时使用 `--path` 选项。给定的路径应该相对于应用程序的基本路径。

> **技巧**  
> 可以使用 [stub publishing](/docs/laravel/10.x/artisanmd#stub-customization) 自定义发布。

<a name="squashing-migrations"></a>
### 整合迁移

在构建应用程序时，可能会随着时间的推移积累越来越多的迁移。这可能会导致你的 `database/migrations` 目录因为数百次迁移而变得臃肿。你如果愿意的话，可以将迁移「压缩」到单个 SQL 文件中。如果你想这样做，请先执行`schema:dump` 命令：

```shell
php artisan schema:dump

# 转储当前数据库架构并删除所有现有迁移...
php artisan schema:dump --prune
```

执行此命令时，Laravel 将向应用程序的 `database/schema` 目录写入一个「schema」文件。现在，当你尝试迁移数据库而没有执行其他迁移时，Laravel 将首先执行模式文件的 SQL 语句。在执行数据库结构文件的语句之后，Laravel 将执行不属于数据库结构的剩余的所有迁移。

如果你的应用程序的测试使用的数据库连接与你在本地开发过程中通常使用的不同，你应该确保你已经使用该数据库连接转储了一个 schema 文件，以便你的测试能够建立你的数据库。你可能希望在切换（dump）你在本地开发过程中通常使用的数据库连接之后再做这件事。

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```



你应该将数据库模式文件提交给源代码管理，以便团队中的其他新开发人员可以快速创建应用程序的初始数据库结构。

> **注意**  
> 整合迁移仅适用于 MySQL、PostgreSQL 和 SQLite 数据库，并使用数据库命令行的客户端。另外，数据库结构不能还原到内存中的 SQLite 数据库。

<a name="migration-structure"></a>
## 迁移结构

迁移类包含两个方法：`up` 和 `down` 。`up` 方法用于向数据库中添加新表、列或索引，而 down 方法用于撤销 `up` 方法执行的操作。.

在这两种方法中，可以使用 Laravel 模式构建器来富有表现力地创建和修改表。要了解 `Schema` 构建器上可用的所有方法，[查看其文档](#creating-tables)。例如，以下迁移会创建一个 `flights` 表：

    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * 执行迁移
         */
        public function up(): void
        {
            Schema::create('flights', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('airline');
                $table->timestamps();
            });
        }

        /**
         * 回滚迁移
         */
        public function down(): void
        {
            Schema::drop('flights');
        }
    };

<a name="setting-the-migration-connection"></a>
#### 设置迁移连接

如果你的迁移将与应用程序默认数据库连接以外的数据库连接进行交互，你应该设置迁移的 `$connection` 属性：

    /**
     * The database connection that should be used by the migration.
     *
     * @var string
     */
    protected $connection = 'pgsql';

    /**
     * 执行迁移
     */
    public function up(): void
    {
        // ...
    }



<a name="running-migrations"></a>
## 执行迁移

执行 Artisan 命令 `migrate`，来运行所有未执行过的迁移：

```shell
php artisan migrate
```

如果你想查看目前已经执行了哪些迁移，可以使用 `migrate:status` Artisan 命令：

```shell
php artisan migrate:status
```

如果你希望在不实际运行迁移的情况下看到将被执行的SQL语句，你可以在 `migrate` 命令中提供 `--pretend` 选项。

```shell
php artisan migrate --pretend
```

#### 在隔离的环境中执行迁移

如果你在多个服务器上部署你的应用程序，并在部署过程中运行迁移，你可能不希望两个服务器同时尝试迁移数据库。为了避免这种情况，你可以在调用 `migrate` 命令时使用 `isolated` 选项。

当提供 `isolated` 选项时, Laravel 将使用你的应用程序缓存驱动获得一个原子锁，然后再尝试运行你的迁移。所有其他试图运行 `migrate` 命令的尝试在锁被持有时都不会执行; 然而, 命令仍然会以成功的退出状态码退出:

```shell
php artisan migrate --isolated
```

> **注意**  
> 要使用这个功能，你的应用程序必须使用 `memcached` / `redis` / `dynamodb` / `database` / `file`  或 `array` 缓存驱动作为你应用程序的默认缓存驱动。此外，所有的服务器必须与同一个中央缓存服务器进行通信。

<a name="forcing-migrations-to-run-in-production"></a>
#### 在生产环境中执行强制迁移

有些迁移操作是破坏性的，这意味着它们可能会导致数据丢失。为了防止你对生产数据库运行这些命令，在执行这些命令之前，系统将提示你进行确认。如果要在运行强制命令的时候去掉提示，需要加上 `--force` 标志：

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### 回滚迁移

如果要回滚最后一次迁移操作，可以使用 Artisan 命令 `rollback`。该命令会回滚最后「一批」的迁移，这可能包含多个迁移文件：

```shell
php artisan migrate:rollback
```

通过向 `rollback` 命令加上 `step` 参数，可以回滚指定数量的迁移。例如，以下命令将回滚最后五个迁移：

```shell
php artisan migrate:rollback --step=5
```

你可以通过向 `rollback` 命令提供 `batch` 选项来回滚特定的批次迁移，其中 `batch` 选项对应于应用程序中 `migrations` 数据库表中的一个批次值。例如，下面的命令将回滚第三批中的所有迁移。

```shell
php artisan migrate:rollback --batch=3
```

命令 `migrate:reset` 会回滚应用已运行过的所有迁移：

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### 使用单个命令同时进行回滚和迁移操作

命令 `migrate:refresh` 首先会回滚已运行过的所有迁移，随后会执行 `migrate`。这一命令可以高效地重建你的整个数据库：

```shell
php artisan migrate:refresh

# 重置数据库，并运行所有的 seeds...
php artisan migrate:refresh --seed
```

通过在命令 `refresh` 中使用 `step` 参数，你可以回滚并重新执行指定数量的迁移操作。例如，下列命令会回滚并重新执行最后五个迁移操作：

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### 删除所有表然后执行迁移

命令 `migrate:fresh` 会删去数据库中的所有表，随后执行命令 `migrate`：

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

> **注意**  
> 该命令 `migrate:fresh` 在删去所有数据表的过程中，会无视它们的前缀。如果数据库涉及到其它应用，使用该命令须十分小心。

<a name="tables"></a>
## 数据表

<a name="creating-tables"></a>
### 创建数据表

接下来我们将使用 Schema 的 `create` 方法创建一个新的数据表。`create` 接受两个参数：第一个参数是表名，而第二个参数是一个闭包，该闭包接受一个用来定义新数据表的 `Blueprint` 对象：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->timestamps();
    });

创建表时，可以使用数据库结构构建器的 [列方法](#creating-columns) 来定义表的列。

<a name="checking-for-table-column-existence"></a>
#### 检查表 / 列是否存在

你可以使用 `hasTable` 和 `hasColumn` 方法检查表或列是否存在：

    if (Schema::hasTable('users')) {
        // 「users」表存在...
    }

    if (Schema::hasColumn('users', 'email')) {
        // 「users」表存在，并且有「email」列...
    }

<a name="database-connection-table-options"></a>
#### 数据库连接和表选项

如果要对不是应用程序默认的数据库连接执行数据库结构的操作，请使用 `connection` 方法：

    Schema::connection('sqlite')->create('users', function (Blueprint $table) {
        $table->id();
    });

此外，还可以使用其他一些属性和方法来定义表创建的其他地方。使用 MySQL 时，可以使用 `engine` 属性指定表的存储引擎：

    Schema::create('users', function (Blueprint $table) {
        $table->engine = 'InnoDB';

        // ...
    });

`charset` 和 `collation` 属性可用于在使用 MySQL 时为创建的表指定字符集和排序规则：

    Schema::create('users', function (Blueprint $table) {
        $table->charset = 'utf8mb4';
        $table->collation = 'utf8mb4_unicode_ci';

        // ...
    });

`temporary` 方法可用于将表标识为「临时」状态。临时表仅对当前连接的数据库会话可见，当连接关闭时会自动删除：

    Schema::create('calculations', function (Blueprint $table) {
        $table->temporary();

        // ...
    });

如果你想给数据库表添加「注释」，你可以在表实例上调用`comment`方法。目前只有 MySQL 和 Postgres 支持表注释：

    Schema::create('calculations', function (Blueprint $table) {
        $table->comment('Business calculations');

        // ...
    });

<a name="更新数据表"></a>
### 更新数据表

`Schema` 门面的 `table` 方法可用于更新现有表。与 `create` 方法一样，`table` 方法接受两个参数：表的名称和接收可用于向表添加列或索引的 `Blueprint` 实例的闭包：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });

<a name="renaming-and-dropping-tables"></a>
### 重命名 / 删除表

要重命名已存在的数据表，使用 `rename` 方法：

    use Illuminate\Support\Facades\Schema;

    Schema::rename($from, $to);

要删除已存在的表，你可以使用 `drop` 或 `dropIfExists` 方法：

    Schema::drop('users');

    Schema::dropIfExists('users');

<a name="renaming-tables-with-foreign-keys"></a>
#### 使用外键重命名表

在重命名表之前，应该确认表的所有外键约束在迁移文件中有一个显式的名称，而不是让 Laravel 去指定。否则，外键约束名称将引用旧表名。

<a name="columns"></a>
## 字段

<a name="creating-columns"></a>
### 创建字段

门面 `Schema` 的 `table` 方法可用于更新表。与 `create` 方法一样， `table` 方法接受两个参数：表名和一个闭包，该闭包接收一个 `illumb\Database\Schema\Blueprint` 实例，可以使用该实例向表中添加列：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });

<a name="可用的字段类型"></a>
### 可用的字段类型

Schema 构建器 `Illuminate\Database\Schema\Blueprint` 提供了多种方法，用来创建表中对应类型的列。下面列出了所有可用的方法：

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

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[binary](#column-method-binary)
[boolean](#column-method-boolean)
[char](#column-method-char)
[dateTimeTz](#column-method-dateTimeTz)
[dateTime](#column-method-dateTime)
[date](#column-method-date)
[decimal](#column-method-decimal)
[double](#column-method-double)
[enum](#column-method-enum)
[float](#column-method-float)
[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[geometryCollection](#column-method-geometryCollection)
[geometry](#column-method-geometry)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[ipAddress](#column-method-ipAddress)
[json](#column-method-json)
[jsonb](#column-method-jsonb)
[lineString](#column-method-lineString)
[longText](#column-method-longText)
[macAddress](#column-method-macAddress)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[mediumText](#column-method-mediumText)
[morphs](#column-method-morphs)
[multiLineString](#column-method-multiLineString)
[multiPoint](#column-method-multiPoint)
[multiPolygon](#column-method-multiPolygon)
[nullableMorphs](#column-method-nullableMorphs)
[nullableTimestamps](#column-method-nullableTimestamps)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)
[point](#column-method-point)
[polygon](#column-method-polygon)
[rememberToken](#column-method-rememberToken)
[set](#column-method-set)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[softDeletesTz](#column-method-softDeletesTz)
[softDeletes](#column-method-softDeletes)
[string](#column-method-string)
[text](#column-method-text)
[timeTz](#column-method-timeTz)
[time](#column-method-time)
[timestampTz](#column-method-timestampTz)
[timestamp](#column-method-timestamp)
[timestampsTz](#column-method-timestampsTz)
[timestamps](#column-method-timestamps)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[tinyText](#column-method-tinyText)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedDecimal](#column-method-unsignedDecimal)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)
[ulidMorphs](#column-method-ulidMorphs)
[uuidMorphs](#column-method-uuidMorphs)
[ulid](#column-method-ulid)
[uuid](#column-method-uuid)
[year](#column-method-year)

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()` {.collection-method .first-collection-method}

`bigIncrements` 方法用于在数据表中创建一个自增的 `UNSIGNED BIGINT` 类型（主键）的列：

    $table->bigIncrements('id');

<a name="column-method-bigInteger"></a>
#### `bigInteger()` {.collection-method}

`bigInteger` 方法用于在数据表中创建一个 `BIGINT` 类型的列：

    $table->bigInteger('votes');

<a name="column-method-binary"></a>
#### `binary()` {.collection-method}

`binary` 方法用于在数据表中创建一个 `BLOB` 类型的列：

    $table->binary('photo');

<a name="column-method-boolean"></a>
#### `boolean()` {.collection-method}

`boolean` 方法用于在数据表中创建一个 `BOOLEAN` 类型的列：

    $table->boolean('confirmed');

<a name="column-method-char"></a>
#### `char()` {.collection-method}

`char` 方法用于在数据表中创建一个 `CHAR` 类型的列，长度由参数指定：

    $table->char('name', 100);

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()` {.collection-method}

`dateTimeTz` 方法用于在数据表中创建一个 `DATETIME` 类型（附有 timezone）的列，可选参数为精度的总位数：

    $table->dateTimeTz('created_at', $precision = 0);

<a name="column-method-dateTime"></a>
#### `dateTime()` {.collection-method}

`dateTime` 方法用于在数据表中创建一个 `DATETIME` 类型的列，可选参数为精度的总位数：

    $table->dateTime('created_at', $precision = 0);

<a name="column-method-date"></a>
#### `date()` {.collection-method}

`date` 方法用于在数据表中创建一个 `DATE` 类型的列：

    $table->date('created_at');

<a name="column-method-decimal"></a>
#### `decimal()` {.collection-method}

`decimal` 方法用于在数据表中创建一个 `DECIMAL` 类型的列，可选参数分别为有效字数总位数、小数部分总位数：

    $table->decimal('amount', $precision = 8, $scale = 2);

<a name="column-method-double"></a>
#### `double()` {.collection-method}

`double` 方法用于在数据表中创建一个 `DOUBLE` 类型的列，可选参数分别为有效字数总位数、小数部分总位数：

    $table->double('amount', 8, 2);

<a name="column-method-enum"></a>
#### `enum()` {.collection-method}

`enum` 方法用于在数据表中创建一个 `ENUM` 类型的列，合法的值列表由参数指定：

    $table->enum('difficulty', ['easy', 'hard']);

<a name="column-method-float"></a>
#### `float()` {.collection-method}

 `float` 方法用于在数据表中创建一个 `FLOAT` 类型的列，可选参数分别为有效字数总位数、小数部分总位数：

    $table->float('amount', 8, 2);

<a name="column-method-foreignId"></a>
#### `foreignId()` {.collection-method}

`foreignId` 方法是 `unsignedBigInteger` 的别名：

    $table->foreignId('user_id');

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()` {.collection-method}

`foreignIdFor` 方法为给定模型类添加了 `{column}_id UNSIGNED BIGINT` 等效列：

    $table->foreignIdFor(User::class);
<a name="column-method-foreignUlid"></a>
#### `foreignUlid()` {.collection-method}

`foreignUlid` 方法创建一个 `ULID` 等效列：

    $table->foreignUlid('user_id');

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()` {.collection-method}
`foreignUuid` 方法创建一个 `UUID` 等效列：
```
$table->foreignUuid('user_id');
```

<a name="column-method-geometryCollection"></a>
#### `geometryCollection()` {.collection-method}

`geometryCollection` 方法相当于 `GEOMETRYCOLLECTION` :

    $table->geometryCollection('positions');

<a name="column-method-geometry"></a>
#### `geometry()` {.collection-method}

`geometry` 方法相当于 `GEOMETRY` :

    $table->geometry('positions');

<a name="column-method-id"></a>
#### `id()` {.collection-method}

 `id` 方法是`bigIncrements` 的别名。默认情况下，该方法将创建一个 `id` 列; 但是，如果要为列指定不同的名称，则可以传递列名：

    $table->id();

<a name="column-method-increments"></a>
#### `increments()` {.collection-method}

`increments` 方法创建一个自动递增相当于 `UNSIGNED INTEGER` 的列作为主键：

    $table->increments('id');

<a name="column-method-integer"></a>
#### `integer()` {.collection-method}

`integer` 方法相当于 `INTEGER` ：

    $table->integer('votes');

<a name="column-method-ipAddress"></a>
#### `ipAddress()` {.collection-method}

`ipAddress` 方法相当于 `VARCHAR` ：

    $table->ipAddress('visitor');

<a name="column-method-json"></a>
#### `json()` {.collection-method}

`json` 方法相当于 `JSON`：

    $table->json('options');

<a name="column-method-jsonb"></a>
#### `jsonb()` {.collection-method}

`jsonb` 方法相当于 `JSONB`：

    $table->jsonb('options');

<a name="column-method-lineString"></a>
#### `lineString()` {.collection-method}

 `lineString` 方法相当于 `LINESTRING`：

    $table->lineString('positions');

<a name="column-method-longText"></a>
#### `longText()` {.collection-method}

 `longText` 方法相当于 `LONGTEXT`：

    $table->longText('description');

<a name="column-method-macAddress"></a>
#### `macAddress()` {.collection-method}

`macAddress` 方法创建一个用于保存 MAC 地址的列。一些数据库系统（如 PostgreSQL），为这种类型的数据提供了专用的类型。其他数据库系统相当于使用字符串类型：

    $table->macAddress('device');

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()` {.collection-method}

 `mediumIncrements` 方法用于创建一个 `UNSIGNED MEDIUMINT` 类型的自动递增的列作为主键：

    $table->mediumIncrements('id');

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()` {.collection-method}

 `mediumInteger` 方法用于创建一个 `MEDIUMINT` 类型的列：

    $table->mediumInteger('votes');

<a name="column-method-mediumText"></a>
#### `mediumText()` {.collection-method}

`mediumText` 方法用于创建一个 `MEDIUMTEXT` 类型的列：

    $table->mediumText('description');

<a name="column-method-morphs"></a>
#### `morphs()` {.collection-method}

 `morphs` 方法用于快速创建一个名称为 `{column}_id` ，类型为 `UNSIGNED BIGINT` 的列和一个名称为 `{column}_type` ，类型为 `VARCHAR` 的列。

这个方法在定义[多态关联](/docs/laravel/10.x/eloquent-relationships)所需的列时使用。在下面的例子中， `taggable_id` 和 `taggable_type` 这两个列会被创建：

    $table->morphs('taggable');

<a name="column-method-multiLineString"></a>
#### `multiLineString()` {.collection-method}

 `multiLineString` 方法用于创建一个 `MULTILINESTRING` 类型的列：

    $table->multiLineString('positions');

<a name="column-method-multiPoint"></a>
#### `multiPoint()` {.collection-method}

 `multiPoint` 方法用于创建一个 `MULTIPOINT` 类型的列：

    $table->multiPoint('positions');

<a name="column-method-multiPolygon"></a>
#### `multiPolygon()` {.collection-method}

 `multiPolygon` 方法用于创建一个 `MULTIPOLYGON` 类型的列：

    $table->multiPolygon('positions');

<a name="column-method-nullableTimestamps"></a>
#### `nullableTimestamps()` {.collection-method}

这个方法和 [timestamps](#column-method-timestamps) 方法类似；需要注意的是此方法创建的列是 `nullable` 的：

    $table->nullableTimestamps(0);

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()` {.collection-method}

这个方法和 [morphs](#column-method-morphs) 方法类似；需要注意的是此方法创建的列是 `nullable` 的：

    $table->nullableMorphs('taggable');

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()` {.collection-method}

这个方法和 [ulidMorphs](#column-method-ulidMorphs) 方法类似；需要注意的是此方法创建的列是 `nullable`。

    $table->nullableUlidMorphs('taggable');

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()` {.collection-method}

这个方法和 [uuidMorphs](#column-method-uuidMorphs) 方法类似；需要注意的是此方法创建的列是 `nullable` 的：

    $table->nullableUuidMorphs('taggable');

<a name="column-method-point"></a>
#### `point()` {.collection-method}

`point` 方法相当于 `POINT`：

    $table->point('position');

<a name="column-method-polygon"></a>
#### `polygon()` {.collection-method}

The `polygon` method creates a `POLYGON` equivalent column:

    $table->polygon('position');

<a name="column-method-rememberToken"></a>
#### `rememberToken()` {.collection-method}

添加一个允许空值的 `VARCHAR (100)` 类型的 `remember_token` 字段，用于存储 [记住用户](/docs/laravel/10.x/authentication#remembering-users)：

    $table->rememberToken();

<a name="column-method-set"></a>
#### `set()` {.collection-method}

`set` 方法使用给定的有效值列表创建一个 `SET` 等效列：

    $table->set('flavors', ['strawberry', 'vanilla']);

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()` {.collection-method}

`smallIncrements` 方法创建一个自动递增的 `UNSIGNED SMALLINT` 等效列作为主键：

    $table->smallIncrements('id');

<a name="column-method-smallInteger"></a>
#### `smallInteger()` {.collection-method}

`smallInteger` 方法创建一个 `SMALLINT` 等效列：

    $table->smallInteger('votes');

<a name="column-method-softDeletesTz"></a>


#### `softDeletesTz()` {.collection-method}

`softDeletesTz` 方法添加了一个可为空的 `deleted_at` `TIMESTAMP`（带时区）等效列，具有可选精度（总位数）。此列旨在存储 Eloquent 的“软删除”功能所需的 `deleted_at` 时间戳：

    $table->softDeletesTz($column = 'deleted_at', $precision = 0);

<a name="column-method-softDeletes"></a>
#### `softDeletes()` {.collection-method}

`softDeletes` 方法添加了一个可为空的 `deleted_at` `TIMESTAMP` 等效列，具有可选精度（总位数）。此列旨在存储 Eloquent 的「软删除」功能所需的 `deleted_at` 时间戳，相当于为软删除添加一个可空的 `deleted_at` 字段：

    $table->softDeletes($column = 'deleted_at', $precision = 0);

<a name="column-method-string"></a>
#### `string()` {.collection-method}

`string` 方法创建一个给定长度的 `VARCHAR` 等效列，相当于指定长度的 VARCHAR：

    $table->string('name', 100);

<a name="column-method-text"></a>
#### `text()` {.collection-method}

`text` 方法创建一个 `TEXT` 等效列：

    $table->text('description');

<a name="column-method-timeTz"></a>
#### `timeTz()` {.collection-method}

`timeTz` 方法创建一个具有可选精度（总位数）的 `TIME`（带时区）等效列：

    $table->timeTz('sunrise', $precision = 0);

<a name="column-method-time"></a>
#### `time()` {.collection-method}

`time` 方法创建一个具有可选精度（总位数）的 `TIME` 等效列：

    $table->time('sunrise', $precision = 0);

<a name="column-method-timestampTz"></a>
#### `timestampTz()` {.collection-method}

`timestampTz` 方法创建一个具有可选精度（总位数）的 `TIMESTAMP`（带时区）等效列：

    $table->timestampTz('added_at', $precision = 0);

<a name="column-method-timestamp"></a>
#### `timestamp()` {.collection-method}

`timestamp` 方法创建一个具有可选精度（总位数）的 `TIMESTAMP` 等效列：

    $table->timestamp('added_at', $precision = 0);

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()` {.collection-method}

`timestampsTz` 方法创建 `created_at` 和 `updated_at` `TIMESTAMP`（带时区）等效列，具有可选精度（总位数）：

    $table->timestampsTz($precision = 0);

<a name="column-method-timestamps"></a>
#### `timestamps()` {.collection-method}

`timestamps` 方法创建具有可选精度（总位数）的 `created_at` 和 `updated_at` `TIMESTAMP` 等效列：

    $table->timestamps($precision = 0);

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()` {.collection-method}

`tinyIncrements` 方法创建一个自动递增的 `UNSIGNED TINYINT` 等效列作为主键：

    $table->tinyIncrements('id');

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()` {.collection-method}

`tinyInteger` 方法用于创建一个 `TINYINT` 等效列：

    $table->tinyInteger('votes');

<a name="column-method-tinyText"></a>
#### `tinyText()` {.collection-method}

`tinyText` 方法用于创建一个 `TINYTEXT` 等效列：

    $table->tinyText('notes');

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()` {.collection-method}

`unsignedBigInteger` 方法用于创建一个 `UNSIGNED BIGINT` 等效列：

    $table->unsignedBigInteger('votes');

<a name="column-method-unsignedDecimal"></a>
#### `unsignedDecimal()` {.collection-method}

`unsignedDecimal` 方法用于创建一个 `UNSIGNED DECIMAL` 等效列，具有可选的精度（总位数）和小数位数（小数位数）：

    $table->unsignedDecimal('amount', $precision = 8, $scale = 2);

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()` {.collection-method}

`unsignedInteger` 方法用于创建一个 `UNSIGNED INTEGER` 等效列：

    $table->unsignedInteger('votes');

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()` {.collection-method}

`unsignedMediumInteger` 方法用于创建一个 `UNSIGNED MEDIUMINT` 等效列：

    $table->unsignedMediumInteger('votes');

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()` {.collection-method}

`unsignedSmallInteger` 方法用于创建一个 `UNSIGNED SMALLINT` 等效列：

    $table->unsignedSmallInteger('votes');

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()` {.collection-method}

`unsignedTinyInteger` 方法用于创建一个 `UNSIGNED TINYINT` 等效列：

    $table->unsignedTinyInteger('votes');

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()` {.collection-method}

`ulidMorphs` 方法用于快速创建一个名称为 `{column}_id` ，类型为 `CHAR(26)` 的列和一个名称为 `{column}_type` ，类型为  `VARCHAR` 的列。

这个方法用于定义使用 UUID 标识符的[多态关联](/docs/laravel/10.x/eloquent-relationships)所需的列时使用。在下面的例子中，`taggable_id` 和 `taggable_type` 这两个列将会被创建：

    $table->ulidMorphs('taggable');

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()` {.collection-method}

`uuidMorphs` 方法用于快速创建一个名称为 `{column}_id` ，类型为 `CHAR(36)` 的列和一个名称为 `{column}_type` ，类型为  `VARCHAR` 的列。

这个方法用于定义使用 UUID 标识符的[多态关联](/docs/laravel/10.x/eloquent-relationships)所需的列时使用。在下面的例子中，`taggable_id` 和 `taggable_type` 这两个列将会被创建：

    $table->uuidMorphs('taggable');

<a name="column-method-ulid"></a>
#### `ulid()` {.collection-method}

`ulid` 方法用于创建一个 `ULID` 类型的列：

    $table->ulid('id');

<a name="column-method-uuid"></a>
#### `uuid()` {.collection-method}

`uuid` 方法用于创建一个 `UUID` 类型的列：

    $table->uuid('id');

<a name="column-method-year"></a>
#### `year()` {.collection-method}

`year` 方法用于创建一个 `YEAR` 类型的列：

    $table->year('birth_year');

<a name="column-modifiers"></a>
### 字段修饰符

除了上面列出的列类型外，在向数据库表添加列时还有几个可以使用的「修饰符」。例如，如果要把列设置为要使列为「可空」，你可以使用 `nullable` 方法：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->nullable();
    });

下表时所有可用的列修饰符。此列表不包括[索引修饰符](#creating-indexes):

修饰符  |  说明
--------  |  -----------
`->after('column')`  |  将该列放在其它字段「之后」(MySQL)
`->autoIncrement()`  |  设置 INTEGER 类型的列为自动递增 (主键)
`->charset('utf8mb4')`  |  为该列指定字符集 (MySQL)
`->collation('utf8mb4_unicode_ci')`  |  为该列指定排序规则 (MySQL/PostgreSQL/SQL Server)
`->comment('my comment')`  |  为该列添加注释 (MySQL/PostgreSQL)
`->default($value)`  |  为该列指定一个「默认值」
`->first()`  |  将该列放在该表「首位」 (MySQL)
`->from($integer)`  |  设置自动递增字段的起始值 (MySQL / PostgreSQL)
`->invisible()`  |  使列对「SELECT \*」查询不可见（MySQL）。
`->nullable($value = true)`  |  允许 NULL 值插入到该列
`->storedAs($expression)`  |  创建一个存储生成的列 (MySQL)
`->unsigned()`  |  设置 INTEGER 类型的字段为 UNSIGNED (MySQL)
`->useCurrent()`  |  设置 TIMESTAMP 类型的列使用 CURRENT_TIMESTAMP 作为默认值
`->useCurrentOnUpdate()`  |  将 TIMESTAMP 类型的列设置为在更新时使用 CURRENT_TIMESTAMP 作为新值
`->virtualAs($expression)`  |  创建一个虚拟生成的列 (MySQL)
`->generatedAs($expression)`  |  使用指定的序列选项创建标识列 (PostgreSQL)
`->always()`  |  定义序列值优先于标识列的输入 (PostgreSQL)
`->isGeometry()`  |  将空间列类型设置为 `geometry` - 默认类型为 `geography` (PostgreSQL)。

<a name="default-expressions"></a>
#### 默认值表达式

`default` 修饰符接收一个变量或者一个 `\Illuminate\Database\Query\Expression` 实例。使用 `Expression` 实例可以避免使用包含在引号中的值，并且允许你使用特定数据库函数。这在当你需要给 `JSON` 字段指定默认值的时候特别有用：

    <?php

    use Illuminate\Support\Facades\Schema;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Query\Expression;
    use Illuminate\Database\Migrations\Migration;

    return new class extends Migration
    {
        /**
         * 运行迁移
         */
        public function up(): void
        {
            Schema::create('flights', function (Blueprint $table) {
                $table->id();
                $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
                $table->timestamps();
            });
        }
    };

> **注意**  
> 支持哪些默认值的表示方式取决于你的数据库驱动、数据库版本、还有字段类型。请参考合适的文档使用。还有一点要注意的是，使用数据库特定函数，可能会将你绑牢到特定的数据库驱动上。

<a name="column-order"></a>
#### 字段顺序

使用 MySQL 数据库时，可以使用 `after` 方法在模式中的现有列后添加列：

    $table->after('password', function (Blueprint $table) {
        $table->string('address_line1');
        $table->string('address_line2');
        $table->string('city');
    });

<a name="modifying-columns"></a>
### 修改字段

`change` 方法可以将现有的字段类型修改为新的类型或修改属性。比如，你可能想增加 `string` 字段的长度，可以使用 `change` 方法把 `name` 字段的长度从 25 增加到 50。所以，我们可以简单的更新字段属性然后调用  `change` 方法：

    Schema::table('users', function (Blueprint $table) {
        $table->string('name', 50)->change();
    });

当修改一个列时，你必须明确包括所有你想在列定义上保留的修改器 —— 任何缺失的属性都将被丢弃。例如，为了保留 `unsigned`、`default` 和 `comment`  属性，你必须在修改列时明确每个属性的修改。

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
    });

<a name="modifying-columns-on-sqlite"></a>
#### 在 SQLite 上修改列

如果应用程序使用的是 SQLite 数据库，请确保你已经通过 Composer 包管理器安装了 `doctrine/dbal` 包。Doctrine DBAL 库用于确定字段的当前状态，并创建对该字段进行指定调整所需的 SQL 查询：

    composer require doctrine/dbal

如果你打算修改 `timestamp` 方法来创建列，你还需要将以下配置添加到应用程序的`config/database.php`配置文件中：

```php
use Illuminate\Database\DBAL\TimestampType;

'dbal' => [
    'types' => [
        'timestamp' => TimestampType::class,
    ],
],
```

> **注意**  
> 当使用 `doctrine/dbal` 包时，你可以修改以下列类型：`bigInteger`、`binary`、`boolean`、`char`、`date`、`dateTime`、`dateTimeTz`、`decimal`、`double`、`integer`、`json`、`longText`、`mediumText`、`smallInteger`、`string`、`text`、`time`、`tinyText`、`unsignedBigInteger`、`unsignedInteger`、`unsignedSmallInteger`、`ulid`、和 `uuid`。

<a name="renaming-columns"></a>
#### 重命名字段

要重命名一个列，你可以使用模式构建器提供的 `renameColumn` 方法：

    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('from', 'to');
    });

<a name="renaming-columns-on-legacy-databases"></a>
#### 在较低版本数据库上重命名列

如果你运行的数据库低于以下版本，你应该确保在重命名列之前通过 Composer 软件包管理器安装了 `doctrine/dbal` 库。

<div class="content-list" markdown="1">

- MySQL < `8.0.3`
- MariaDB < `10.5.2`
- SQLite < `3.25.0`

</div>

<a name="dropping-columns"></a>
### 删除字段

要删除一个列，你可以使用 `dropColumn` 方法。

    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('votes');
    });

你可以传递一个字段数组给 `dropColumn` 方法来删除多个字段：

    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['votes', 'avatar', 'location']);
    });

<a name="dropping-columns-on-legacy-databases"></a>
#### 在较低版本的数据库中删除列的内容

如果你运行的 SQLite 版本在 `3.35.0` 之前，你必须通过 Composer  软件包管理器安装 `doctrine/dbal` 包，然后才能使用 `dropColumn` 方法。不支持在使用该包时在一次迁移中删除或修改多个列。

<a name="available-command-aliases"></a>
#### 可用的命令别名

Laravel 提供了几种常用的删除相关列的便捷方法。如下表所示：

命令  |  说明
-------  |  -----------
`$table->dropMorphs('morphable');`  |  删除 `morphable_id` 和 `morphable_type` 字段
`$table->dropRememberToken();`  |  删除 `remember_token` 字段
`$table->dropSoftDeletes();`  |  删除 `deleted_at` 字段
`$table->dropSoftDeletesTz();`  |  `dropSoftDeletes()` 方法的别名
`$table->dropTimestamps();`  |  删除 `created_at` 和 `updated_at` 字段
`$table->dropTimestampsTz();` |  `dropTimestamps()` 方法别名

<a name="indexes"></a>
## 索引

<a name="creating-indexes"></a>
### 创建索引

结构生成器支持多种类型的索引。下面的例子中新建了一个值唯一的 `email` 字段。我们可以将 `unique` 方法链式地添加到字段定义上来创建索引：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->unique();
    });

或者，你也可以在定义完字段之后创建索引。为此，你应该调用结构生成器上的 `unique` 方法，此方法应该传入唯一索引的列名称：

    $table->unique('email');

你甚至可以将数组传递给索引方法来创建一个复合（或合成）索引：

    $table->index(['account_id', 'created_at']);

创建索引时，Laravel 会自动生成一个合理的索引名称，但你也可以传递第二个参数来自定义索引名称：

    $table->unique('email', 'unique_email');

<a name="available-index-types"></a>
#### 可用的索引类型

Laravel 的结构生成器提供了 Laravel 支持的所有类型的索引方法。每个索引方法都接受一个可选的第二个参数来指定索引的名称。如果省略，名称将根据表和列的名称生成。下面是所有可用的索引方法：

命令  |  说明
-------  |  -----------
`$table->primary('id');`  |  添加主键
`$table->primary(['id', 'parent_id']);`  |   添加复合主键
`$table->unique('email');`  |  添加唯一索引
`$table->index('state');`  | 添加普通索引
`$table->fullText('body');`  |  添加全文索引 (MySQL/PostgreSQL)
`$table->fullText('body')->language('english');`  |  添加指定语言 (PostgreSQL) 的全文索引
`$table->spatialIndex('location');`  |  添加空间索引（不支持 SQLite）

<a name="index-lengths-mysql-mariadb"></a>
#### 索引长度 & MySQL / MariaDB

默认情况下，Laravel 使用 `utf8mb4` 编码。如果你是在版本低于 5.7.7 的 MySQL 或者版本低于 10.2.2 的 MariaDB 上创建索引，那你就需要手动配置数据库迁移的默认字符串长度。也就是说，你可以通过在 `App\Providers\AppServiceProvider` 类的 `boot` 方法中调用 `Schema::defaultStringLength` 方法来配置默认字符串长度：

    use Illuminate\Support\Facades\Schema;

    /**
     * 引导任何应用程序「全局配置」
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }

当然，你也可以选择开启数据库的 `innodb_large_prefix` 选项。至于如何正确开启，请自行查阅数据库文档。

<a name="renaming-indexes"></a>
### 重命名索引

若要重命名索引，你需要调用 `renameIndex` 方法。此方法接受当前索引名称作为其第一个参数，并将所需名称作为其第二个参数：

    $table->renameIndex('from', 'to')

> **注意**  
> 如果你的应用程序使用的是 SQLite 数据库，你必须通过 Composer 软件包管理器安装 `doctrine/dbal` 包，然后才能使用 `renameIndex` 方法。

<a name="dropping-indexes"></a>
### 删除索引

若要删除索引，则必须指定索引的名称。Laravel 默认会自动将数据表名称、索引的字段名及索引类型简单地连接在一起作为名称。举例如下：


命令  |  说明
-------  |  -----------
`$table->dropPrimary('users_id_primary');`  |  从「users」表中删除主键
`$table->dropUnique('users_email_unique');`  |  从「users」表中删除 unique 索引
`$table->dropIndex('geo_state_index');`  |  从「geo」表中删除基本索引
`$table->dropFullText('posts_body_fulltext');`  |  从「post」表中删除一个全文索引
`$table->dropSpatialIndex('geo_location_spatialindex');`  | 从「geo」表中删除空间索引（不支持 SQLite）


如果将字段数组传给 `dropIndex` 方法，会删除根据表名、字段和键类型生成的索引名称。

    Schema::table('geo', function (Blueprint $table) {
        $table->dropIndex(['state']); // 删除 'geo_state_index' 索引
    });

<a name="foreign-key-constraints"></a>
### 外键约束

Laravel 还支持创建用于在数据库层中的强制引用完整性的外键约束。例如，让我们在 `posts` 表上定义一个引用 `users` 表的 `id` 字段的 `user_id` 字段：

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('posts', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id');

        $table->foreign('user_id')->references('id')->on('users');
    });

由于这种外键约束的定义方式过于繁复，Laravel 额外提供了更简洁的方法，基于约定来提供更好的开发人员体验。当使用 `foreignId` 方法来创建列时，上面的示例还可以这么写：

    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained();
    });

`foreignId` 方法是 `unsignedBigInteger` 的别名，而 `constrained` 方法将使用约定来确定所引用的表名和列名。如果表名与约定不匹配，可以通过将表名作为参数传递给 `constrained` 方法来指定表名：

    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained('users');
    });

你可以为约束的「on delete」和「on update」属性指定所需的操作：

    $table->foreignId('user_id')
          ->constrained()
          ->onUpdate('cascade')
          ->onDelete('cascade');

还为这些操作提供了另一种表达性语法：

方法  |  说明
-------  |  -----------
`$table->cascadeOnUpdate();` | 更新应该级联
`$table->restrictOnUpdate();`| 应该限制更新
`$table->cascadeOnDelete();` | 删除应该级联
`$table->restrictOnDelete();`| 应该限制删除
`$table->nullOnDelete();`    | 删除应将外键值设置为空

当使用任意 [字段修饰符](#column-modifiers) 的时候，必须在调用 `constrained` 之前调用：

    $table->foreignId('user_id')
          ->nullable()
          ->constrained();

<a name="dropping-foreign-keys"></a>
#### 删除外键

要删除一个外键，你需要使用 `dropForeign` 方法，将要删除的外键约束作为参数传递。外键约束采用的命名方式与索引相同。即，将数据表名称和约束的字段连接起来，再加上 `_foreign` 后缀：

    $table->dropForeign('posts_user_id_foreign');

或者，可以给 `dropForeign` 方法传递一个数组，该数组包含要删除的外键的列名。数组将根据  Laravel 的 结构生成器使用的约束名称约定自动转换：

    $table->dropForeign(['user_id']);

<a name="toggling-foreign-key-constraints"></a>
#### 更改外键约束

你可以在迁移文件中使用以下方法来开启或关闭外键约束：

    Schema::enableForeignKeyConstraints();

    Schema::disableForeignKeyConstraints();

    Schema::withoutForeignKeyConstraints(function () {
        // 闭包中禁用的约束…
    });

> 注意：SQLite 默认禁用外键约束。使用 SQLite 时，请确保在数据库配置中[启用外键支持](/docs/laravel/10.x/databasemd#configuration) 然后再尝试在迁移中创建它们。另外，SQLite 只在创建表时支持外键，并且[将在修改表时不会支持](https://www.sqlite.org/omitted.html)。

<a name="事件"></a>
## 事件

为方便起见，每个迁移操作都会派发一个 [事件](/docs/laravel/10.x/events)。以下所有事件都扩展了基础 `Illuminate\Database\Events\MigrationEvent` 类：

类 | 描述
-------|-------
`Illuminate\Database\Events\MigrationsStarted` | 即将执行一批迁移。 |
`Illuminate\Database\Events\MigrationsEnded` | 一批迁移已完成执行。 |
`Illuminate\Database\Events\MigrationStarted` | 即将执行单个迁移。 |
`Illuminate\Database\Events\MigrationEnded` | 单个迁移已完成执行。 |
`Illuminate\Database\Events\SchemaDumped` | 数据库结构转储已完成。 |
`Illuminate\Database\Events\SchemaLoaded` | 已加载现有数据库结构转储。 |
