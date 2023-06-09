# Eloquent: 入门

- [简介](#introduction)
- [生成模型类](#generating-model-classes)
- [模型约定](#eloquent-model-conventions)
    - [表名](#table-names)
    - [主键](#primary-keys)
    - [时间戳](#timestamps)
    - [数据库链接](#database-connections)
    - [默认属性值](#default-attribute-values)
- [模型检索](#retrieving-models)
    - [集合](#collections)
    - [结果分块](#chunking-results)
    - [用 Lazy Collections 分块](#chunking-using-lazy-collections)
    - [游标](#cursors)
    - [高级子查询](#advanced-subqueries)
- [检索单个模型 / 集合](#retrieving-single-models)
    - [检索或创建模型](#retrieving-or-creating-models)
    - [检索集合](#retrieving-aggregates)
- [插入 & 更新模型](#inserting-and-updating-models)
    - [插入](#inserts)
    - [更新](#updates)
    - [批量赋值](#mass-assignment)
    - [更新或插入](#upserts)
- [删除模型](#deleting-models)
    - [软删除](#soft-deleting)
    - [查询软删除模型](#querying-soft-deleted-models)
- [定期删除模型](#pruning-models)
- [模型复制](#replicating-models)
- [查询作用域](#query-scopes)
    - [全局作用域](#global-scopes)
    - [局部作用域](#local-scopes)
- [模型对比](#comparing-models)
- [事件](#events)
    - [使用闭包](#events-using-closures)
    - [观察器](#observers)
    - [静默事件](#muting-events)

<a name="introduction"></a>
## 简介

Laravel 包含了 Eloquent，这是一个对象关系映射器（ORM），使与数据库的交互变得很愉快。使用 Eloquent 时，每个数据库表都有一个对应的「模型」，用于与该表进行交互。除了从数据库表中检索记录外，Eloquent 模型还允许您从表中插入，更新和删除记录。

> 技巧：在开始之前，请确保在应用的 `config/database.php` 配置文件中配置数据库连接。有关配置数据库的更多信息，请参阅 [数据库配置文档](/docs/laravel/9.x/database#configuration)。

<a name="generating-model-classes"></a>
## 生成模型类



首先，让我们创建一个 Eloquent 模型。模型通常位于  `app\Models` 目录中，并继承 `Illuminate\Database\Eloquent\Model` 类。您可以使用 `make:model` [Artisan 命令](/docs/laravel/9.x/artisan) 来生成新模型类：

```shell
php artisan make:model Flight
```

如果你想要在生成模型类的同时生成 [数据库迁移](/docs/laravel/9.x/migrations)，可以使用 `--migration` 或 `-m` 选项：

```shell
php artisan make:model Flight --migration
```

在生成模型的同时，你可能还想要各种其他类型的类，例如模型工厂、数据填充和控制器。这些选项可以组合在一起从而一次创建多个类：

```shell
# 生成模型和 Flight工厂类...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# 生成模型和 Flight 数据填充类...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# 生成模型和 Flight 控制器类...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# 生成模型，Flight 控制器类，资源类和表单验证类...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# 生成模型和 Flight 授权策略类...
php artisan make:model Flight --policy

# 生成模型和数据库迁移，Filght 工厂类，数据库填充类和 Flight 控制器...
php artisan make:model Flight -mfsc

# 快捷生成模型，数据库迁移，Flight 工厂类，数据库填充类，授权策略类，Flight 控制器和表单验证类...
php artisan make:model Flight --all

# 生成中间表模型...
php artisan make:model Member --pivot
```



<a name="eloquent-model-conventions"></a>
## Eloquent 模型约定

由 `make:model` 命令生成的模型会被放置在 `app/Models` 目录下。让我们检查一个基本的模型类并讨论 `Eloquent` 的一些关键约定：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        //
    }

<a name="table-names"></a>
### 数据表名称

看了上面的例子，你可能已经注意到我们没有告诉 Eloquent 哪个数据库表对应我们的 `Flight` 模型。按照约定，除非明确指定另一个名称，类名称的下划线格式的复数形态将被用作表名。因此，在这个例子中, Eloquent 将假定 `Flight` 模型将记录存储在 `flights` 表中，而 `AirTrafficController` 模型将记录存储在 `air_traffic_controllers` 表中。

如果你的模型对应的数据表不符合这个约定，你可以通过在模型上定义一个 `table` 属性来手动指定模型的表名：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 与模型关联的数据表.
         *
         * @var string
         */
        protected $table = 'my_flights';
    }

<a name="primary-keys"></a>
### 主键

Eloquent 还会假设每个模型对应的数据表都有一个名为 `id` 的列作为主键。如有必要，你可以在模型上定义一个受保护的 `$primaryKey` 属性，来指定一个不同的列名称用作模型的主键：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 与数据表关联的主键.
         *
         * @var string
         */
        protected $primaryKey = 'flight_id';
    }



此外，Eloquent 默认有一个 integer 值的主键，Eloquent 会自动转换这个主键为一个 integer 类型，如果你的主键不是自增或者不是数字类型，你可以在你的模型上定义一个 public 属性的 `$incrementing` ，并将其设置为 false：

    <?php

    class Flight extends Model
    {
        /**
         * 指明模型的 ID 不是自增。
         *
         * @var bool
         */
        public $incrementing = false;
    }

如果你模型主键不是 `integer`，应该定义一个 `protected $keyType` 属性在模型上，其值应为 `string`：

    <?php

    class Flight extends Model
    {
        /**
         * 自增 ID 的数据类型。
         *
         * @var string
         */
        protected $keyType = 'string';
    }

<a name="composite-primary-keys"></a>
#### 复合主键

Eloquent 要求每个模型至少有一个可以作为其主键的唯一标识 `ID`。它不支持「复合」主键。但是，除了表的唯一标识主键之外，还可以向数据库表添加额外的多列唯一索引。

<a name="timestamps"></a>
### 时间戳

默认情况下，Eloquent 期望 `created_at` 和 `updated_at` 列存在于模型对应的数据库表中。 创建或更新模型时，Eloquent 会自动设置这些列的值。如果您不希望 Eloquent 自动管理这些列，您应该在模型上定义一个 `$timestamps` 属性，其值为 `false`：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 指示模型是否主动维护时间戳。
         *
         * @var bool
         */
        public $timestamps = false;
    }



如果需要自定义模型时间戳的格式，请在模型上设置 `$dateFormat` 属性。以此来定义时间戳在数据库中的存储方式以及模型序列化为数组或 JSON 时的格式：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 模型日期字段的存储格式。
         *
         * @var string
         */
        protected $dateFormat = 'U';
    }

如果需要自定义用于存储时间戳的字段的名称，可以在模型上定义 `CREATED_AT` 和 `UPDATED_AT` 常量：

    <?php

    class Flight extends Model
    {
        const CREATED_AT = 'creation_date';
        const UPDATED_AT = 'updated_date';
    }

<a name="database-connections"></a>
### 数据库连接

默认情况下，所有 Eloquent 模型使用的是应用程序配置的默认数据库连接。如果想指定在与特定模型交互时应该使用的不同连接，可以在模型上定义`$connection` 属性：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 设置当前模型使用的数据库连接名。
         *
         * @var string
         */
        protected $connection = 'sqlite';
    }

<a name="default-attribute-values"></a>
### 默认属性值

默认情况下，被实例化的模型不会包含任何属性值。如果想为模型的某些属性定义默认值，可以在模型上定义一个 `$attributes` 属性：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 模型的属性默认值。
         *
         * @var array
         */
        protected $attributes = [
            'delayed' => false,
        ];
    }



<a name="retrieving-models"></a>
## 检索模型

一旦你创建了一个模型和 [其关联的数据库表](/docs/laravel/9.x/migrations#writing-migrations)，就可以开始从数据库中检索数据了。可以将每个 Eloquent 模型视为一个强大的 [查询构建器](/docs/laravel/9.x/queries)，让你能流畅地查询与该模型关联的数据库表。模型中的 `all` 方法将从模型的关联数据库表中检索所有记录：

    use App\Models\Flight;

    foreach (Flight::all() as $flight) {
        echo $flight->name;
    }

<a name="building-queries"></a>
#### 构建查询

Eloquent 的 `all()` 方法会返回模型中所有的结果。由于每个 Eloquent 模型都可以被视为 `查询构造器`，可以添加额外的查询条件，然后使用 `get()` 方法获取查询结果：

    $flights = Flight::where('active', 1)
                   ->orderBy('name')
                   ->take(10)
                   ->get();

> 技巧：由于 Eloquent 模型是查询构建器，因此你应该查看 Laravel 的 [查询构建器](/docs/laravel/9.x/queries) 提供的所有方法。在编写 Eloquent 查询时，这些是通用的。

<a name="refreshing-models"></a>
#### 刷新模型

如果已经有一个从数据库中检索到的 Eloquent 模型的实例，你可以使用 `fresh` 和 `refresh` 方法「刷新」模型。 `fresh` 方法将从数据库中重新检索模型。现有模型实例不会受到影响：

    $flight = Flight::where('number', 'FR 900')->first();

    $freshFlight = $flight->fresh();

`refresh` 方法会使用数据库中的新数据重新赋值现有的模型。此外，已经加载的关系也会被重新加载：

    $flight = Flight::where('number', 'FR 900')->first();

    $flight->number = 'FR 456';

    $flight->refresh();

    $flight->number; // "FR 900"



<a name="collections"></a>
### 集合

正如我们所见，像 `all()` 和 `get()` 这样的 Eloquent 方法从数据库中检索出多条记录。但是，这些方法不会返回一个普通的 PHP 数组。相反，会返回一个 `Illuminate\Database\Eloquent\Collection` 的实例。

Eloquent `Collection` 类扩展了 Laravel 的 `Illuminate\Support\Collection` 基类，它提供了 [大量的辅助方法](/docs/laravel/9.x/collections#available-methods) 来与数据集合交互。例如，`reject` 方法可用于根据调用闭包的结果从集合中删除模型：

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function ($flight) {
    return $flight->cancelled;
});
```

除了 Laravel 的基础集合类提供的方法之外，Eloquent 集合类还提供了 [一些额外的方法](/docs/laravel/9.x/eloquent-collections#available-methods) ，专门用于与 Eloquent 的模型。

由于 Laravel 的所有集合都实现了 PHP 的可迭代接口，因此你可以像数组一样循环遍历集合：

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### 结果分块

如果你尝试通过 `all()` 或 `get()` 方法加载数万条 Eloquent 记录，您的应用程序可能会耗尽内存。为了避免出现这种情况，「chunk」方法可以用来更有效地处理这些大量数据。

`chunk` 方法将传递 Eloquent 模型的子集，将它们交给闭包进行处理。由于一次只检索当前的 Eloquent 模型块的数据，所以当处理大量模型数据时，`chunk` 方法将显着减少内存使用：

```php
use App\Models\Flight;

Flight::chunk(200, function ($flights) {
    foreach ($flights as $flight) {
        // TODO
    }
});
```



传递给「chunk」方法的第一个参数是每个分块检索的数据数量。第二个参数传递的闭包将方法将应用到每个分块，以数据库中查询到的分块结果来作为参数。

如果要根据一个字段来过滤「chunk」方法拿到的数据，同时，这个字段的数据在遍历的时候还需要更新的话，那么可以使用「chunkById」方法。在这种场景下如果使用「chunk」方法的话，得到的结果可能和预想中的不一样。在「chunkById」 方法的内部，默认会查询 id 字段大于前一个分块中最后一个模型的 id。

```php
Flight::where('departed', true)
    ->chunkById(200, function ($flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### 使用惰性集合进行分块

`lazy` 方法的工作方式类似于 [`chunk` 方法](#chunking-results)，因为它在后台以块的形式执行查询。 然而，`lazy` 方法不是将每个块直接传递到回调中，而是返回 Eloquent 模型的扁平化 [`LazyCollection`](/docs/laravel/9.x/collections#lazy-collections)，它可以让你将结果作为单个流进行交互：

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    //
}
```

如果要根据一个字段来过滤「lazy」方法拿到的数据，同时，这个字段的数据在遍历的时候还需要更新的话，那么可以使用「lazyById」方法。在「lazyById」 方法的内部，默认会查询 id 字段大于前一个「chunk」中最后一个模型的 id 。

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

你可以使用 `lazyByIdDesc` 方法根据 `id` 的降序过滤结果。

<a name="cursors"></a>
### 游标

与 `lazy` 方法类似，`cursor` 方法可用于在查询数万条 Eloquent 模型记录时减少内存的使用。

`cursor` 方法只会执行一次数据库查询；但是，各个 Eloquent 模型在实际迭代之前不会被数据填充。因此，在遍历游标时，在任何给定时间，只有一个 Eloquent 模型保留在内存中。

> 注意：由于 `cursor` 方法一次只能在内存中保存一个 Eloquent 模型，因此它不能预加载关系。如果需要预加载关系，请考虑使用 [`lazy` 方法](#streaming-results-lazily)。

在内部，`cursor` 方法使用 PHP [generators](https://www.php.net/manual/en/language.generators.overview.php) 来实现此功能：

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    //
}
```

`cursor` 返回一个 `Illuminate\Support\LazyCollection` 实例。[惰性集合](/docs/laravel/9.x/collections#lazy-collections) 可以使用 Laravel 集合中的可用方法，同时一次仅将单个模型加载到内存中：

```php
use App\Models\User;

$users = User::cursor()->filter(function ($user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

尽管 `cursor` 方法使用的内存比常规查询要少得多（一次只在内存中保存一个 Eloquent 模型），但它最终仍会耗尽内存。这是 [由于 PHP 的 PDO 驱动程序内部将所有原始查询结果缓存在其缓冲区中](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php)。 如果要处理大量 Eloquent 记录，请考虑使用 [`lazy` 方法](#streaming-results-lazily)。



<a name="advanced-subqueries"></a>
## 高级子查询

<a name="subquery-selects"></a>
#### selects 子查询

Eloquent 还提供高级子查询支持，你可以在单条语句中从相关表中提取信息。 例如，假设我们有一个航班目的地表「destinations」和一个到达这些目的地的航班表「flights」。 `flights` 表包含一个 `arrived_at` 字段，指示航班何时到达目的地。

使用查询生成器可用的子查询功能 `select` 和 `addSelect` 方法，我们可以用单条语句查询全部目的地 `destinations` 和 抵达各目的地最后一班航班的名称：

    use App\Models\Destination;
    use App\Models\Flight;

    return Destination::addSelect(['last_flight' => Flight::select('name')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
    ])->get();

<a name="subquery-ordering"></a>
#### 子查询排序

此外，查询构建器的 `orderBy` 也同样支持子查询。继续使用我们的航班为例，根据最后一次航班到达该目的地的时间对所有目的地进行排序。这同样可以在执行单个数据库查询时完成：

    return Destination::orderByDesc(
        Flight::select('arrived_at')
            ->whereColumn('destination_id', 'destinations.id')
            ->orderByDesc('arrived_at')
            ->limit(1)
    )->get();

<a name="retrieving-single-models"></a>
## 检索单个模型/聚合

除了检索与给定查询匹配的所有记录之外，还可以使用 `find`、`first` 或 `firstWhere` 方法检索单个记录。 这些方法不是返回模型集合，而是返回单个模型实例：

    use App\Models\Flight;

    // 通过主键检索模型...
    $flight = Flight::find(1);

    // 检索与查询约束匹配的第一个模型...
    $flight = Flight::where('active', 1)->first();

    // 替代检索与查询约束匹配的第一个模型...
    $flight = Flight::firstWhere('active', 1);



有时你可能希望检索查询的第一个结果或在未找到结果时执行一些其他操作。 `firstOr` 方法将返回匹配查询的第一个结果，或者，如果没有找到结果，则执行给定的闭包。闭包返回的值将被视为 `firstOr` 方法的结果：

    $model = Flight::where('legs', '>', 3)->firstOr(function () {
        // ...
    });

<a name="not-found-exceptions"></a>
#### 未找到时抛出异常

如果找不到模型，你可能希望抛出异常。这在路由或控制器中特别有用。 `findOrFail` 和 `firstOrFail` 方法将检索查询的第一个结果；但是，如果没有找到结果，则会抛出 `Illuminate\Database\Eloquent\ModelNotFoundException`：

    $flight = Flight::findOrFail(1);

    $flight = Flight::where('legs', '>', 3)->firstOrFail();

如果没有捕获到 `ModelNotFoundException`，则会自动将 404 HTTP 响应发送回客户端：

    use App\Models\Flight;

    Route::get('/api/flights/{id}', function ($id) {
        return Flight::findOrFail($id);
    });

<a name="retrieving-or-creating-models"></a>
### 检索或创建模型

`firstOrCreate` 方法将尝试使用给定的列/值对来查找数据库记录。如果在数据库中找不到该模型，则将插入一条记录，其中包含将第一个数组参数与可选的第二个数组参数合并后产生的属性：

`firstOrNew` 方法，类似`firstOrCreate`，会尝试在数据库中找到与给定属性匹配的记录。如果没有找到，则会返回一个新的模型实例。请注意，由 `firstOrNew` 返回的模型尚未持久化到数据库中。需要手动调用 `save` 方法来保存它：

    use App\Models\Flight;

    // 按名称检索航班，如果不存在则创建它...
    $flight = Flight::firstOrCreate([
        'name' => 'London to Paris'
    ]);

    // 按名称检索航班或使用名称、延迟和到达时间属性创建它...
    $flight = Flight::firstOrCreate(
        ['name' => 'London to Paris'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );

    // 按名称检索航班或实例化一个新的航班实例...
    $flight = Flight::firstOrNew([
        'name' => 'London to Paris'
    ]);

    // 按名称检索航班或使用名称、延迟和到达时间属性实例化...
    $flight = Flight::firstOrNew(
        ['name' => 'Tokyo to Sydney'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );

### 检索单条唯一的模型
要检索一条表中唯一的记录，可以使用 `sole()` 方法，相比 `first()` 和 `find()` ，它会返回一条表中仅有的记录，如果查询结果有重复，会抛出一个断言异常。

**现有以下航班信息表**

| flight_no | name | time |
| ------------ | ------------ | ------------ |
| 001 | London to Tokyo | 4AM |
| 001 | London to Tokyo | 4AM |
| 002 | Pairs to London | 8PM |

```
use  App\Models\Flight;  

// 检索航班号，如果重复，会抛 `MultipleRecordsFoundException` 异常，并断言重复的条数...  
$flight  =  Flight::where(['flight_no'  =>  '001'])->sole();

// 检索航班号，如果不能存在，会抛 `ModelNotFoundException` 异常...
$flight  =  Flight::where(['flight_no'  =>  '003'])->sole();

// 只有当查询条件存在与表中且是表中唯一的记录，才会返回 Model...
$flight  =  Flight::where(['flight_no'  =>  '002'])->sole();
```


<a name="retrieving-aggregates"></a>
### 检索聚合

在与 Eloquent 模型交互时，您还可以使用 Laravel [查询构建器] 提供的 `count`、`sum`、`max` 和其他 [聚合方法](/docs/laravel/9.x/queries#aggregates) 。这些方法返回一个标量值而不是 Eloquent 模型实例：

    $count = Flight::where('active', 1)->count();

    $max = Flight::where('active', 1)->max('price');

<a name="inserting-and-updating-models"></a>
## 插入和更新模型

<a name="inserts"></a>
### 插入

当然，在使用 Eloquent 时，我们不仅需要从数据库中检索模型。我们还需要插入新记录。Eloquent 让它变得简单。要将新记录插入数据库，只需要实例化一个新模型实例并在模型上设置属性。然后，在模型实例上调用 `save` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Flight;
    use Illuminate\Http\Request;

    class FlightController extends Controller
    {
        /**
         * 在数据库中存储一个新航班。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            // 验证请求...

            $flight = new Flight;

            $flight->name = $request->name;

            $flight->save();
        }
    }

在此示例中，我们将传入 HTTP 请求中的「name」字段分配给 `App\Models\Flight` 模型实例的「name」属性。 当我们调用 `save` 方法时，一条记录将被插入到数据库中。模型的 `created_at` 和 `updated_at` 时间戳会在调用 `save` 方法时自动设置，无需手动设置。



或者，可以使用 `create` 方法使用单个 PHP 语句「保存」一个新模型。插入的模型实例将通过 `create` 方法返回：

    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);

但是，在使用 `create` 方法之前，您需要在模型类上指定 `fillable` 或 `guarded` 属性。这些属性是必需的，因为默认情况下，所有 Eloquent 模型都受到保护，免受批量赋值漏洞的影响。 要了解有关批量赋值的更多信息，请参阅 [批量赋值文档](#mass-assignment)。

<a name="updates"></a>
### 更新

`save` 方法也可以用来更新数据库中已经存在的模型。要更新模型，应该检索它并设置你想更新的任何属性。然后调用模型的 `save` 方法。 同样，`updated_at` 时间戳将自动更新，因此无需手动设置其值：

    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->name = 'Paris to London';

    $flight->save();

<a name="mass-updates"></a>
#### 批量更新 

还可以批量更新与给定条件匹配的所有模型。在此示例中，所有 `active` 且 `destination` 为 `San Diego` 的航班都将被标记为延迟：

    Flight::where('active', 1)
          ->where('destination', 'San Diego')
          ->update(['delayed' => 1]);

`update` 方法需要一个表示应该更新的列的列和值对数组。 `update` 方法返回受影响的行数。

> 注意：通过 Eloquent 批量更新时，不会触发模型的 `saving`、`saved`、`updating` 和 `updated` 模型事件。 这是因为在批量更新时从未真正检索到模型。



<a name="examining-attribute-changes"></a>
#### 检查属性变更

Eloquent 提供了 `isDirty`、`isClean` 和 `wasChanged` 方法来检查模型的内部状态，并确定它的属性与最初检索模型时的变化情况。

`isDirty` 方法确定模型的任何属性在检索模型后是否已更改。你可以传递特定的属性名称来确定它是否变脏。 `isClean` 方法与 `isDirty` 相反，它也接受可选的属性参数：

    use App\Models\User;

    $user = User::create([
        'first_name' => 'Taylor',
        'last_name' => 'Otwell',
        'title' => 'Developer',
    ]);

    $user->title = 'Painter';

    $user->isDirty(); // true
    $user->isDirty('title'); // true
    $user->isDirty('first_name'); // false

    $user->isClean(); // false
    $user->isClean('title'); // false
    $user->isClean('first_name'); // true

    $user->save();

    $user->isDirty(); // false
    $user->isClean(); // true

wasChanged 方法确定在当前请求周期内最后一次保存模型时是否更改了任何属性。你还可以传递属性名称以查看特定属性是否已更改：

    $user = User::create([
        'first_name' => 'Taylor',
        'last_name' => 'Otwell',
        'title' => 'Developer',
    ]);

    $user->title = 'Painter';

    $user->save();

    $user->wasChanged(); // true
    $user->wasChanged('title'); // true
    $user->wasChanged('first_name'); // false

`getOriginal` 方法返回一个包含模型原始属性的数组，忽略加载模型之后进行的任何更改。你也可以传递特定的属性名称来获取特定属性的原始值：

    $user = User::find(1);

    $user->name; // John
    $user->email; // john@example.com

    $user->name = "Jack";
    $user->name; // Jack

    $user->getOriginal('name'); // John
    $user->getOriginal(); // 原始属性数组...



<a name="mass-assignment"></a>
### 批量赋值

你可以使用「create」方法使用单个 PHP 语句「保存」一个新模型。插入的模型实例将通过该方法返回：

    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);

但是，在使用 `create` 方法之前，需要在模型类上指定 `fillable` 或 `guarded` 属性。 这些属性是必需的，因为默认情况下，所有 Eloquent 模型都受到保护，免受批量分配漏洞的影响。

当用户传递一个意外的 HTTP 请求字段并且该字段更改了你的数据库中的一个字段，而你没有预料到时，就会出现批量分配漏洞。 例如，恶意用户可能通过 HTTP 请求发送 `is_admin` 参数，然后将其传递给模型的 `create` 方法，从而允许用户将自己升级为管理员。

因此，你应该定义要使哪些模型属性可批量分配。可以使用模型上的 `$fillable` 属性来执行此操作。 例如，让 `Flight` 模型的 `name` 属性可以批量赋值：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * 可批量赋值的属性。
         *
         * @var array
         */
        protected $fillable = ['name'];
    }

一旦你指定了哪些属性是可批量分配的，可以使用`create`方法在数据库中插入一条新记录。`create` 方法返回新创建的模型实例：

    $flight = Flight::create(['name' => 'London to Paris']);

如果你已经有一个模型实例，你可以使用 `fill` 方法来填充它的属性数组：

    $flight->fill(['name' => 'Amsterdam to Frankfurt']);



<a name="mass-assignment-json-columns"></a>
#### 批量赋值 & JSON 列

分配 JSON 列时，必须在模型的 `$fillable` 数组中指定每个列的批量分配键。为了安全起见，Laravel 不支持在使用 `guarded` 属性时更新嵌套的 JSON 属性：

    /**
     * 可以批量赋值的属性
     *
     * @var array
     */
    protected $fillable = [
        'options->enabled',
    ];

<a name="allowing-mass-assignment"></a>
#### 允许批量分配

如果你想让所有属性都可以批量赋值，你可以将 $guarded 定义成一个空数组。如果你选择解除你的模型的保护，你应该时刻特别注意传递给 Eloquent 的 fill、create 和 update 方法的数组：

    /**
     * 不可以批量赋值的属性
     *
     * @var array
     */
    protected $guarded = [];

<a name="upserts"></a>
### 新增或更新

有时，如果不存在匹配的模型，您可能需要更新现有模型或创建新模型。与 `firstOrCreate` 方法一样，`updateOrCreate` 方法会持久化模型，因此无需手动调用 `save` 方法。

在下面的示例中，如果存在「departure」位置为「Oakland」且「destination」位置为「San Diego」的航班，则其「price」和「discounted」列将被更新。 如果不存在这样的航班，将创建一个新航班，该航班具有将第一个参数数组与第二个参数数组合并后的属性：

    $flight = Flight::updateOrCreate(
        ['departure' => 'Oakland', 'destination' => 'San Diego'],
        ['price' => 99, 'discounted' => 1]
    );

如果你想在单个查询中执行多个「新增或更新」，那么应该使用 `upsert` 方法。该方法的第一个参数包含要插入或更新的值，而第二个参数列出了在关联表中唯一标识记录的列。该方法的第三个也是最后一个参数是一个列数组，如果数据库中已经存在匹配的记录，则应该更新这些列。如果在模型上启用了时间戳，`upsert` 方法将自动设置 `created_at` 和 `updated_at` 时间戳：

    Flight::upsert([
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ], ['departure', 'destination'], ['price']);



<a name="deleting-models"></a>
## 删除模型

想删除模型，你可以调用模型实例的 delete 方法:

    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->delete();

你可以调用 `truncate` 方法来删除所有模型关联的数据库记录。 `truncate` 操作还将重置模型关联表上的所有自动递增 ID：

    Flight::truncate();

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### 通过其主键删除现有模型

在上面的示例中，我们在调用「删除」方法之前从数据库中检索模型。但是，如果你知道模型的主键，则可以通过调用 `destroy` 方法删除模型而无需显式检索它。除了接受单个主键之外，`destroy` 方法还将接受多个主键、主键数组或主键 [collection](/docs/laravel/9.x/collections)：

    Flight::destroy(1);

    Flight::destroy(1, 2, 3);

    Flight::destroy([1, 2, 3]);

    Flight::destroy(collect([1, 2, 3]));

> 注意：`destroy` 方法单独加载每个模型并调用 `delete` 方法，以便为每个模型正确调度 `deleting` 和 `deleted` 事件。

<a name="deleting-models-using-queries"></a>
#### 使用查询删除模型

当然，你可以构建一个 Eloquent 查询来删除所有符合您查询条件的模型。在此示例中，我们将删除所有标记为非活动的航班。与批量更新一样，批量删除不会为已删除的模型调度模型事件：

    $deleted = Flight::where('active', 0)->delete();

> 注意：通过 Eloquent 执行批量删除语句时，不会为已删除的模型调度 `deleting` 和 `deleted` 模型事件。这是因为在执行 delete 语句时从未真正检索到模型。



<a name="soft-deleting"></a>
### 软删除

除了实际从数据库中删除记录之外，Eloquent 还可以「软删除」。软删除不会真的从数据库中删除记录。相反，它在模型上设置了一个 `deleted_at` 属性，记录模型被「删除」的日期和时间。要为模型启用软删除，请将 `Illuminate\Database\Eloquent\SoftDeletes`  trait 添加到模型中：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\SoftDeletes;

    class Flight extends Model
    {
        use SoftDeletes;
    }

> 技巧：`SoftDeletes` trait 会自动将 `deleted_at` 属性转换为 `DateTime` / `Carbon` 实例。

当然，你需要把 `deleted_at` 字段添加到数据表中。`Laravel` 的 [数据迁移](/docs/laravel/9.x/migrations) 有创建这个字段的方法： 

    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('flights', function (Blueprint $table) {
        $table->softDeletes();
    });

    Schema::table('flights', function (Blueprint $table) {
        $table->dropSoftDeletes();
    });

那现在，当你在模型实例上使用 `delete` 方法，当前日期时间会写入 `deleted_at` 字段。同时，查询出来的结果也会自动排除已被软删除的记录。

判断模型实例是否已被软删除，可以使用 `trashed` 方法：

    if ($flight->trashed()) {
        //
    }

<a name="restoring-soft-deleted-models"></a>
#### 恢复软删除的模型

有时你可能希望「撤销」软删除的模型。要恢复软删除的模型，可以在模型实例上调用「restore」方法。 `restore` 方法会将模型的 `deleted_at` 列设置为 `null`：

    $flight->restore();



你也可以在查询中使用 `restore` 方法，从而快速恢复多个模型。和其他「批量」操作一样，这个操作不会触发模型的任何事件：

    Flight::withTrashed()
            ->where('airline_id', 1)
            ->restore();

`restore` 方法可以在 [关联查询](/docs/laravel/9.x/eloquent-relationships) 中使用：

    $flight->history()->restore();

<a name="permanently-deleting-models"></a>
#### 永久删除模型

有时你可能需要从数据库中真正删除模型。要从数据库中永久删除软删除的模型，请使用 `forceDelete` 方法：

    $flight->forceDelete();

`forceDelete` 同样可以用在关联查询上：

    $flight->history()->forceDelete();

<a name="querying-soft-deleted-models"></a>
### 查询软删除模型

<a name="including-soft-deleted-models"></a>
#### 包括已软删除的模型

如上所述，软删除模型将自动从查询结果中排除。但是，你也可以通过在查询上调用 `withTrashed` 方法来强制将软删除模型包含在查询结果中：

    use App\Models\Flight;

    $flights = Flight::withTrashed()
                    ->where('account_id', 1)
                    ->get();

`withTrashed` 方法可以在 [关联查询](/docs/laravel/9.x/eloquent-relationships) 中使用

    $flight->history()->withTrashed()->get();

<a name="retrieving-only-soft-deleted-models"></a>
#### 仅检索软删除的模型

`onlyTrashed` 方法将检索 **只被** 软删除模型：

    $flights = Flight::onlyTrashed()
                    ->where('airline_id', 1)
                    ->get();

<a name="pruning-models"></a>
## 修剪模型

有时你可能希望定期删除不再需要的模型。为此，您可以将 `Illuminate\Database\Eloquent\Prunable` 或 `Illuminate\Database\Eloquent\MassPrunable` trait 添加到要定期修剪的模型中。将其中一个 trait 添加到模型后，实现 `prunable` 方法，该方法返回一个 Eloquent 查询构建器，用于检索不再需要的模型数据：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Prunable;

    class Flight extends Model
    {
        use Prunable;

        /**
         * 获取可修剪模型查询构造器。
         *
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function prunable()
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }



当将模型标记为 `Prunable` 时，你还可以在模型上定义 `pruning` 方法。该方法将在模型被删除之前被调用。在从数据库中永久删除模型之前，此方法可用于删除与模型关联的任何其他资源，例如存储的文件：

    /**
     * 准备模型进行修剪。
     *
     * @return void
     */
    protected function pruning()
    {
        //
    }

配置可修剪模型后，你还应该在应用程序的 `App\Console\Kernel` 类中调度 `model:prune` Artisan 命令。你可以自由选择运行此命令的时间间隔：

    /**
     * 定义应用程序的命令计划。
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('model:prune')->daily();
    }

在后台，`model:prune` 命令会自动检测应用程序的 `app/Models` 目录中的「Prunable」模型。 如果模型位于不同的位置，可以使用 `--model` 选项来指定模型类名称：

    $schedule->command('model:prune', [
        '--model' => [Address::class, Flight::class],
    ])->daily();

如果你想在修剪所有其他检测到的模型时排除某些模型被修剪，您可以使用 `--except` 选项：

    $schedule->command('model:prune', [
        '--except' => [Address::class, Flight::class],
    ])->daily();

你可以通过执行带有 `--pretend` 选项的 `model:prune` 命令来预测你的 `prunable` 查询。预测时，`model:prune` 命令将报告该命令实际运行将修剪多少记录：

```shell
php artisan model:prune --pretend
```

> 注意：如果软删除模型与可修剪查询匹配，则它们将被永久删除（`forceDelete`）。



<a name="mass-pruning"></a>
#### 批量修剪模型

当模型被标记为 `Illuminate\Database\Eloquent\MassPrunable` 特征时，模型会使用批量删除查询从数据库中删除。因此，不会调用 `pruning` 方法，也不会触发 `deleting` 和 `deleted` 模型事件。这是因为模型在删除之前从未真正检索过，因此更高效：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\MassPrunable;

    class Flight extends Model
    {
        use MassPrunable;

        /**
         * 获取可修剪模型查询。
         *
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function prunable()
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }

<a name="replicating-models"></a>
## 复制模型

可以使用 `replicate` 方法创建现有模型实例的未保存副本。在拥有共享许多相同属性的模型实例时，此方法特别有用：

    use App\Models\Address;

    $shipping = Address::create([
        'type' => 'shipping',
        'line_1' => '123 Example Street',
        'city' => 'Victorville',
        'state' => 'CA',
        'postcode' => '90001',
    ]);

    $billing = $shipping->replicate()->fill([
        'type' => 'billing'
    ]);

    $billing->save();

要排除一个或多个属性被复制到新模型，可以将数组传递给 `replicate` 方法：

    $flight = Flight::create([
        'destination' => 'LAX',
        'origin' => 'LHR',
        'last_flown' => '2020-03-04 11:00:00',
        'last_pilot_id' => 747,
    ]);

    $flight = $flight->replicate([
        'last_flown',
        'last_pilot_id'
    ]);

<a name="query-scopes"></a>
## 查询作用域

<a name="global-scopes"></a>
## 全局作用域

全局范围可以为模型的所有查询添加约束。 Laravel 的 [软删除](#soft-deleting) 功能就是利用全局范围仅从数据库中检索「未删除」模型。编写全局范围查询可以为模型的每个查询都添加约束条件。



<a name="writing-global-scopes"></a>
#### 编写全局作用域

编写全局范围很简单。 首先，定义一个实现 `Illuminate\Database\Eloquent\Scope` 接口的类。 Laravel 没有放置作用域类的常规位置，因此您可以自由地将此类放置在您希望的任何目录中。

`Scope` 接口要求实现 `apply` 方法。 `apply` 方法可以根据需要向查询中添加 `where` 约束或其他类型的子句：

    <?php

    namespace App\Scopes;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Scope;

    class AncientScope implements Scope
    {
        /**
         * 将作用域应用于给定的 Eloquent 查询构建器。
         *
         * @param  \Illuminate\Database\Eloquent\Builder  $builder
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @return void
         */
        public function apply(Builder $builder, Model $model)
        {
            $builder->where('created_at', '<', now()->subYears(2000));
        }
    }

> 技巧：如果需要在 select 语句里添加字段，应使用 addSelect 方法，而不是 select 方法。这将有效防止无意中替换现有 select 语句的情况。

<a name="applying-global-scopes"></a>
#### 应用全局作用域

要将全局作用域分配给模型，需要重写模型的 `booted` 方法并使用 `addGlobalScope` 方法，`addGlobalScope` 方法接受作用域的一个实例作为它的唯一参数：

    <?php

    namespace App\Models;

    use App\Scopes\AncientScope;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 模型的「引导」方法。
         *
         * @return void
         */
        protected static function booted()
        {
            static::addGlobalScope(new AncientScope);
        }
    }



将上例中的作用域添加到 `App\Models\User` 模型后，调用 `User::all()` 方法将执行以下 SQL 查询：

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### 匿名全局作用域

Eloquent 同样允许使用闭包定义全局作用域，这样就不需要为一个简单的作用域而编写一个单独的类。使用闭包定义全局作用域时，你应该指定一个作用域名称作为 `addGlobalScope` 方法的第一个参数： 

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 模型的「引导」方法。
         *
         * @return void
         */
        protected static function booted()
        {
            static::addGlobalScope('ancient', function (Builder $builder) {
                $builder->where('created_at', '<', now()->subYears(2000));
            });
        }
    }

<a name="removing-global-scopes"></a>
#### 取消全局作用域

如果需要对当前查询取消全局作用域，需要使用 `withoutGlobalScope` 方法。该方法仅接受全局作用域类名作为它唯一的参数：

    User::withoutGlobalScope(AncientScope::class)->get();

或者，如果你使用闭包定义了全局作用域，则应传递分配给全局作用域的字符串名称：

    User::withoutGlobalScope('ancient')->get();

如果需要取消部分或者全部的全局作用域的话，需要使用`withoutGlobalScopes` 方法：

    // 取消全部全局作用域...
    User::withoutGlobalScopes()->get();

    // 取消部分作用域...
    User::withoutGlobalScopes([
        FirstScope::class, SecondScope::class
    ])->get();



<a name="local-scopes"></a>
### 局部作用域

局部作用域允许定义通用的约束集合以便在应用程序中重复使用。例如，你可能经常需要获取所有「流行」的用户。要定义这样一个范围，只需要在对应的 Eloquent 模型方法前添加 `scope` 前缀。

作用域总是返回一个查询构造器实例：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 只查询受欢迎的用户的作用域。
         *
         * @param  \Illuminate\Database\Eloquent\Builder  $query
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function scopePopular($query)
        {
            return $query->where('votes', '>', 100);
        }

        /**
         * 只查询 active 用户的作用域。
         *
         * @param  \Illuminate\Database\Eloquent\Builder  $query
         * @return void
         */
        public function scopeActive($query)
        {
            $query->where('active', 1);
        }
    }

<a name="utilizing-a-local-scope"></a>
#### 使用局部作用域

一旦定义了作用域，就可以在查询该模型时调用作用域方法。不过，在调用这些方法时不必包含 `scope` 前缀。甚至可以链式调用多个作用域，例如：

    use App\Models\User;

    $users = User::popular()->active()->orderBy('created_at')->get();

通过 `or` 查询运算符组合多个 Eloquent 模型作用域可能需要使用闭包来实现正确的 [逻辑分组](/docs/laravel/9.x/queries#logical-grouping)：

    $users = User::popular()->orWhere(function (Builder $query) {
        $query->active();
    })->get();

然而这可能有点麻烦，所以 Laravel 提供了一个更高阶的 orWhere 方法，允许你流畅地将作用域链接在一起，而无需使用闭包：

    $users = App\Models\User::popular()->orWhere->active()->get();



<a name="dynamic-scopes"></a>
#### 动态作用域

有时可能地希望定义一个可以接受参数的作用域。把额外参数传递给作用域就可以达到此目的。作用域参数要放在 `$query` 参数之后：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 将查询作用域限制为仅包含给定类型的用户。
         *
         * @param  \Illuminate\Database\Eloquent\Builder  $query
         * @param  mixed  $type
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function scopeOfType($query, $type)
        {
            return $query->where('type', $type);
        }
    }

一旦将预期的参数添加到作用域方法的签名中，您就可以在调用作用域时传递参数：

    $users = User::ofType('admin')->get();

<a name="comparing-models"></a>
## 模型比较

有时可能需要判断两个模型是否「相同」。`is` 和 `isNot` 方法可以用来快速校验两个模型是否拥有相同的主键、表和数据库连接：

    if ($post->is($anotherPost)) {
        //
    }

    if ($post->isNot($anotherPost)) {
        //
    }

当使用 `belongsTo`、`hasOne`、`morphTo` 和 `morphOne` [relationships](/docs/laravel/9.x/eloquent-relationships) 时，`is` 和 `isNot` 方法也可用。当您想比较相关模型而不发出查询来检索该模型时，此方法特别有用：

    if ($post->author()->is($user)) {
        //
    }

<a name="events"></a>
## Events

> 技巧：想要将 Eloquent 事件直接广播到客户端应用程序？ 查看 Laravel 的 [模型事件广播](/docs/laravel/9.x/broadcasting#model-broadcasting)。

Eloquent 模型触发几个事件，允许你挂接到模型生命周期的如下节点： `retrieved`、`creating`、`created`、`updating`、`updated`、`saving`、`saved`、`deleting`、`deleted`、`restoring`、`restored`、`replicating`。事件允许你每当特定模型保存或更新数据库时执行代码。每个事件通过其构造器接受模型实例。



当从数据库中检索到现有模型时，将调度 `retrieved` 事件。 当一个新模型第一次被保存时，`creating` 和 `created` 事件将被触发。 `updating` / `updated` 事件将在修改现有模型并调用 `save` 方法时触发。`saving` / `saved` 事件将在创建或更新模型时触发 - 即使模型的属性没有更改。以「-ing」结尾的事件名称在模型的任何更改被持久化之前被调度，而以「-ed」结尾的事件在对模型的更改被持久化之后被调度。

要开始监听模型事件，请在 Eloquent 模型上定义一个 `$dispatchesEvents` 属性。此属性将 Eloquent 模型生命周期的各个点映射到你定义的 [事件类](/docs/laravel/9.x/events)。 每个模型事件类都应该期望通过其构造函数接收受影响模型的实例：

    <?php

    namespace App\Models;

    use App\Events\UserDeleted;
    use App\Events\UserSaved;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 模型的事件映射。
         *
         * @var array
         */
        protected $dispatchesEvents = [
            'saved' => UserSaved::class,
            'deleted' => UserDeleted::class,
        ];
    }

在定义和映射了 Eloquent 事件之后，可以使用 [event listeners](/docs/laravel/9.x/events#defining-listeners) 来处理事件。

> 注意：通过 Eloquent 发出批量更新或删除查询时，不会为受影响的模型调度 `saved`、`updated`、`deleting` 和 `deleted` 模型事件。 这是因为在执行批量更新或删除时，模型从未真正被检索到。



<a name="events-using-closures"></a>
### 使用闭包

你可以注册在触发各种模型事件时执行的闭包，而不使用自定义事件类。通常，你应该在模型的 booted 方法中注册这些闭包：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 模型的“引导”方法。
         *
         * @return void
         */
        protected static function booted()
        {
            static::created(function ($user) {
                //
            });
        }
    }

如果需要，你可以在注册模型事件时使用 [队列匿名事件侦听器](/docs/laravel/9.x/events#queuable-anonymous-event-listeners)。这将指示 Laravel 使用应用程序的 [queue](/docs/laravel/9.x/queues) 在后台执行模型事件监听器：

    use function Illuminate\Events\queueable;

    static::created(queueable(function ($user) {
        //
    }));

<a name="observers"></a>
### 观察者

<a name="defining-observers"></a>
#### 定义观察者

如果在一个模型上监听了多个事件，可以使用观察者来将这些监听器组织到一个单独的类中。观察者类的方法名映射到你希望监听的 Eloquent 事件。这些方法都以模型作为其唯一参数。`make:observer` Artisan 命令可以快速建立新的观察者类：

```shell
php artisan make:observer UserObserver --model=User
```

此命令将在 `App/Observers` 文件夹放置新的观察者类。如果这个目录不存在，Artisan 将替你创建。使用如下方式开启观察者：

    <?php

    namespace App\Observers;

    use App\Models\User;

    class UserObserver
    {
        /**
         * 处理用户「创建」事件。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function created(User $user)
        {
            //
        }

        /**
         * 处理用户「更新」事件。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function updated(User $user)
        {
            //
        }

        /**
         * 处理用户「删除」事件。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function deleted(User $user)
        {
            //
        }

        /**
         * 处理用户「强制删除」事件。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function forceDeleted(User $user)
        {
            //
        }
    }



要注册观察者，需要在要观察的模型上调用「Observer」方法。你可以在应用程序的 `boot` 方法中注册观察者

`App\Providers\EventServiceProvider` 服务提供者:

    use App\Models\User;
    use App\Observers\UserObserver;

    /**
     * 为你的应用程序注册任何事件。
     *
     * @return void
     */
    public function boot()
    {
        User::observe(UserObserver::class);
    }

或者，可以在应用程序的「$observers」属性中列出你的观察者

`App\Providers\EventServiceProvider` class:

    use App\Models\User;
    use App\Observers\UserObserver;

    /**
     * 应用程序的模型观察者。
     *
     * @var array
     */
    protected $observers = [
        User::class => [UserObserver::class],
    ];

> 技巧：观察者可以监听其他事件，例如「saving」和「retrieved」。这些事件在 [events](#events) 文档中进行了描述。

<a name="observers-and-database-transactions"></a>
#### 观察者和数据库事务

在数据库事务中创建模型时，你可能希望指示观察者仅在提交数据库事务后执行其事件处理程序。可以通过在观察者上定义一个 `$afterCommit` 属性来完成此操作。如果数据库事务不在进行中，事件处理程序将立即执行：

    <?php

    namespace App\Observers;

    use App\Models\User;

    class UserObserver
    {
        /**
         * 在提交所有事务后处理事件。
         *
         * @var bool
         */
        public $afterCommit = true;

        /**
         * 处理用户「创建」事件。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function created(User $user)
        {
            //
        }
    }

<a name="muting-events"></a>
### 静默事件

也许有时候你会需要暂时将所有由模型触发的事件「静默」处理。使用 `withoutEvents` 达到目的。`withoutEvents` 方法接受一个闭包作为唯一参数。任何在闭包中执行的代码都不会被分配模型事件。
举个例子，如下代码将获取并删除一个 `App\Models\User` 实例且不会发送任何的模型事件。闭包函数返回的任何值都将被 `withoutEvents` 方法所返回：

    use App\Models\User;

    $user = User::withoutEvents(function () use () {
        User::findOrFail(1)->delete();

        return User::find(2);
    });

<a name="saving-a-single-model-without-events"></a>
#### 静默的保存单个模型

有时候，你也许会想要「保存」一个已有的模型，且不触发任何事件。那么你可用 `saveQuietly` 方法达到目的：

    $user = User::findOrFail(1);

    $user->name = 'Victoria Faith';

    $user->saveQuietly();

