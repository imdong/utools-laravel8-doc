# Laravel Scout

- [简介](#introduction)
- [安装](#installation)
    - [驱动必要条件](#driver-prerequisites)
    - [队列](#queueing)
- [配置](#configuration)
    - [配置模型索引](#configuring-model-indexes)
    - [配置可搜索数据](#configuring-searchable-data)
    - [配置模型 ID](#configuring-the-model-id)
    - [配置每个模型的搜索引擎](#configuring-search-engines-per-model)
    - [识别用户](#identifying-users)
- [数据库 / 收集引擎](#database-and-collection-engines)
    - [数据库引擎](#database-engine)
    - [Collection 引擎](#collection-engine)
- [索引](#indexing)
    - [批量导入](#batch-import)
    - [添加记录](#adding-records)
    - [修改记录](#updating-records)
    - [删除记录](#removing-records)
    - [暂停索引](#pausing-indexing)
    - [有条件可搜索的模型实例](#conditionally-searchable-model-instances)
- [搜索](#searching)
    - [Where 语句](#where-clauses)
    - [分页](#pagination)
    - [软删除](#soft-deleting)
    - [自定义引擎搜索](#customizing-engine-searches)
- [自定义引擎](#custom-engines)
- [生成器宏](#builder-macros)

<a name="introduction"></a>
## 介绍

[Laravel Scout](https://github.com/laravel/scout) 为 [Eloquent models](/docs/laravel/10.x/eloquent) 的全文搜索提供了一个简单的基于驱动程序的解决方案，通过使用模型观察者，Scout 将自动同步 Eloquent 记录的搜索索引。

目前，Scout 附带 [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), 和 MySQL / PostgreSQL (`database`) 驱动程序。此外，Scout 包括一个「collection」驱动程序，该驱动程序专为本地开发使用而设计，不需要任何外部依赖项或第三方服务。此外，编写自定义驱动程序很简单，你可以使用自己的搜索实现自由扩展 Scout。

<a name="installation"></a>
## 安装

首先，通过 Composer 软件包管理器安装 Scout：

```shell
composer require laravel/scout
```

Scout 安装完成后，使用 Artisan 命令 `vendor:publish` 生成 Scout 配置文件。此命令将会在你的 `config` 目录下 生成一个 `scout.php` 配置文件:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```



最后，在你要做搜索的模型中添加 `Laravel\Scout\Searchable` trait 。这个 trait 会注册一个模型观察者来保持模型和搜索驱动的同步:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;
    }

<a name="driver-prerequisites"></a>
### 驱动的先决条件

<a name="algolia"></a>
#### Algolia

使用 Algolia 驱动时，需要在 `config/scout.php` 配置文件配置你的 `Algolia` `id` 和 `secret` 凭证。配置好凭证之后，还需要使用 Composer 安装 Algolia PHP SDK：

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
#### Meilisearch

[Meilisearch](https://www.meilisearch.com) 是一个速度极快的开源搜索引擎。如果你不确定如何在本地机器上安装 MeiliSearch，你可以使用 Laravel 官方支持的 Docker 开发环境 [Laravel Sail](/docs/laravel/10.x/sail#meilisearch)。

使用 MeiliSearch 驱动程序时，你需要通过 Composer 包管理器安装 MeiliSearch PHP SDK：

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

然后，在应用程序的 `.env` 文件中设置 `SCOUT_DRIVER` 环境变量以及你的 MeiliSearch `host` 和 `key` 凭据：

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

更多关于 MeiliSearch 的信息，请参考 [MeiliSearch 技术文档](https://docs.meilisearch.com/learn/getting_started/quick_start.html)。

此外，你应该通过查看 [MeiliSearch 关于二进制兼容性的文档](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)确保安装与你的 MeiliSearch 二进制版本兼容的 `meilisearch/meilisearch-php` 版本。

>  Meilisearch service itself.
注意：在使用 MeiliSearch 的应用程序上升级 Scout 时，你应该始终留意查看关于 MeiliSearch 升级发布的[其他重大（破坏性）更改](https://github.com/meilisearch/MeiliSearch/releases)，以保证升级顺利。



<a name="queueing"></a>
### 队列

虽然不强制要求使用 Scout，但在使用该库之前，强烈建议配置一个[队列驱动](/docs/laravel/10.x/queues)。运行队列 worker 将允许 Scout 将所有同步模型信息到搜索索引的操作都放入队列中，从而为你的应用程序的Web界面提供更快的响应时间。

一旦你配置了队列驱动程序，请将 `config/scout.php` 配置文件中的 `queue` 选项的值设置为 `true`：

    'queue' => true,

即使将 `queue` 选项设置为 `false`，也要记住有些 Scout 驱动程序（如 Algolia 和 Meilisearch）始终异步记录索引。也就是说，即使索引操作已在 Laravel 应用程序中完成，但搜索引擎本身可能不会立即反映新记录和更新记录。

要指定 Scout 使用的连接和队列，请将 `queue` 配置选项定义为数组：

    'queue' => [
        'connection' => 'redis',
        'queue' => 'scout'
    ],

<a name="configuration"></a>
## 配置

<a name="configuring-model-indexes"></a>
### 配置模型索引

每个 Eloquent 模型都与一个给定的搜索「索引」同步，该索引包含该模型的所有可搜索记录。换句话说，可以将每个索引视为 MySQL 表。默认情况下，每个模型将持久化到与模型的典型「表」名称匹配的索引中。通常，这是模型名称的复数形式；但是，你可以通过在模型上重写 `searchableAs` 方法来自定义模型的索引：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * 获取与模型关联的索引的名称.
         */
        public function searchableAs(): string
        {
            return 'posts_index';
        }
    }


<a name="configuring-searchable-data"></a>
### 配置可搜索数据

默认情况下，给定模型的 `toArray` 形式的整个内容将被持久化到其搜索索引中。如果要自定义同步到搜索索引的数据，可以重写模型上的 `toSearchableArray` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * 获取模型的可索引数据。
         *
         * @return array<string, mixed>
         */
        public function toSearchableArray(): array
        {
            $array = $this->toArray();

            // 自定义数据数组...

            return $array;
        }
    }

一些搜索引擎（如 Meilisearch）只会在正确的数据类型上执行过滤操作（`>` 、 `<` 等）。因此，在使用这些搜索引擎并自定义可搜索数据时，你应该确保数值类型被转换为正确的类型：

    public function toSearchableArray()
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
        ];
    }

<a name="configuring-filterable-data-for-meilisearch"></a>
#### 配置可过滤数据和索引设置 (Meilisearch)

与 Scout 的其他驱动程序不同，Meilisearch 要求你预定义索引搜索设置，例如可过滤属性、可排序属性和[其他支持的设置字段](https://docs.meilisearch.com/reference/api/settings.html)。

可过滤属性是你在调用 Scout 的 `where` 方法时想要过滤的任何属性，而可排序属性是你在调用 Scout 的 `orderBy` 方法时想要排序的任何属性。要定义索引设置，请调整应用程序的 `scout` 配置文件中 `meilisearch` 配置条目的 `index-settings` 部分：

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // 其他设置字段...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```



如果给定索引下的模型可以进行软删除，并且已包含在`index-settings`数组中，Scout 将自动支持在该索引上过滤软删除的模型。如果你没有其他可过滤或可排序的属性来定义软删除的模型索引，则可以简单地向该模型的`index-settings`数组添加一个空条目：

```php
'index-settings' => [
    Flight::class => []
],
```

在配置应用程序的索引设置之后，你必须调用 `scout:sync-index-settings` Artisan 命令。此命令将向 Meilisearch 通知你当前配置的索引设置。为了方便起见，你可能希望将此命令作为部署过程的一部分：

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### 配置模型ID

默认情况下，Scout 将使用模型的主键作为存储在搜索索引中的模型唯一ID/键。如果你需要自定义此行为，可以重写模型的 `getScoutKey` 和 `getScoutKeyName` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * 获取这个模型用于索引的值.
         */
        public function getScoutKey(): mixed
        {
            return $this->email;
        }

        /**
         * 获取这个模型用于索引的键.
         */
        public function getScoutKeyName(): mixed
        {
            return 'email';
        }
    }

<a name="configuring-search-engines-per-model"></a>
### 设置模型的搜索引擎

当进行搜索时，Scout 通常会使用应用程序的 `scout` 配置文件中指定的默认搜索引擎。但是，可以通过在模型上覆盖 `searchableUsing` 方法来更改特定模型的搜索引擎：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Engines\Engine;
    use Laravel\Scout\EngineManager;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * 获取这个模型用于索引的搜索引擎.
         */
        public function searchableUsing(): Engine
        {
            return app(EngineManager::class)->engine('meilisearch');
        }
    }

<a name="configuring-the-model-id"></a>
### 配置模型ID

默认情况下，Scout 将使用模型的主键作为存储在搜索索引中的模型的唯一ID /键。如果你需要自定义此行为，你可以覆盖模型上的`getScoutKey`和`getScoutKeyName`方法:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * 获取用于索引模型的值.
         */
        public function getScoutKey(): mixed
        {
            return $this->email;
        }

        /**
         * 获取用于索引模型的键名.
         */
        public function getScoutKeyName(): mixed
        {
            return 'email';
        }
    }

<a name="configuring-search-engines-per-model"></a>
### 按型号配置搜索引擎

搜索时，Scout 通常使用你应用程序的 Scout 配置文件中指定的默认搜索引擎。然而，可以通过覆盖模型上的`searchableUsing`方法来更改特定模型的搜索引擎:

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Engines\Engine;
    use Laravel\Scout\EngineManager;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * 获取用于索引模型的引擎.
         */
        public function searchableUsing(): Engine
        {
            return app(EngineManager::class)->engine('meilisearch');
        }
    }



<a name="identifying-users"></a>
### 识别用户

如果你在使用 [Algolia](https://algolia.com/) 时想要自动识别用户，Scout 可以帮助你。将已认证的用户与搜索操作相关联，可以在 Algolia 的仪表板中查看搜索分析时非常有用。你可以通过在应用程序的 `.env` 文件中将 `SCOUT_IDENTIFY` 环境变量定义为 `true` 来启用用户识别：

```ini
SCOUT_IDENTIFY=true
```

启用此功能还会将请求的 IP 地址和已验证的用户的主要标识符传递给 Algolia，以便将此数据与用户发出的任何搜索请求相关联。

<a name="database-and-collection-engines"></a>
## 数据库/集合引擎

<a name="database-engine"></a>
### 数据库引擎

> 注意：目前，数据库引擎支持 MySQL 和 PostgreSQL。

如果你的应用程序与小到中等大小的数据库交互或工作负载较轻，你可能会发现使用 Scout 的 「database」 引擎更为方便。数据库引擎将使用 「where like」子句和全文索引来过滤你现有数据库的结果，以确定适用于你查询的搜索结果。

要使用数据库引擎，你可以简单地将 `SCOUT_DRIVER` 环境变量的值设置为 `database`，或直接在你的应用程序的 `scout` 配置文件中指定 `database` 驱动程序：

```ini
SCOUT_DRIVER=database
```

一旦你已将数据库引擎指定为首选驱动程序，你必须[配置你的可搜索数据](#configuring-searchable-data)。然后，你可以开始[执行搜索查询](#searching)来查询你的模型。使用数据库引擎时，不需要进行搜索引擎索引，例如用于填充 Algolia 或 Meilisearch 索引所需的索引。



#### 自定义数据库搜索策略

默认情况下，数据库引擎将对你所[配置为可搜索的](#configuring-searchable-data)每个模型属性执行 「where like」 查询。然而，在某些情况下，这可能会导致性能不佳。因此，数据库引擎的搜索策略可以配置，以便某些指定的列利用全文搜索查询，或者仅使用 「where like」 约束来搜索字符串的前缀(`example%`)，而不是在整个字符串中搜索(`%example%`)。

为了定义这种行为，你可以将 PHP 属性赋值给你的模型的 toSearchableArray 方法。任何未被分配其他搜索策略行为的列将继续使用默认的「where like」策略：

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * 获取模型的可索引数据数组。
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> 注意：在指定列应使用全文查询约束之前，请确保已为该列分配[全文索引](/docs/laravel/10.x/migrations#available-index-types)。


<a name="collection-engine"></a>
### 集合引擎

在本地开发过程中，你可以自由地使用 Algolia 或 Meilisearch 搜索引擎，但你可能会发现使用「集合」引擎更加方便。集合引擎将使用「where」子句和集合过滤器来从你现有的数据库结果中确定适用于你查询的搜索结果。当使用此引擎时，无需对可搜索模型进行「索引」，因为它们只需从本地数据库中检索即可。



要使用收集引擎，你可以简单地将 `SCOUT_DRIVER` 环境变量的值设置为 `collection`，或者直接在你的应用的 `scout` 配置文件中指定 `collection` 驱动程序：

```ini
SCOUT_DRIVER=collection
```

一旦你将收集驱动程序指定为首选驱动程序，你就可以开始针对你的模型[执行搜索查询](#searching)。使用收集引擎时，不需要进行搜索引擎索引，如种子 Algolia 或 Meilisearch 索引所需的索引。

#### 与数据库引擎的区别

乍一看，「数据库」和「收集」引擎非常相似。它们都直接与你的数据库交互以检索搜索结果。然而，收集引擎不使用全文索引或 `LIKE` 子句来查找匹配的记录。相反，它会拉取所有可能的记录，并使用 Laravel 的 `Str::is` 助手来确定搜索字符串是否存在于模型属性值中。

收集引擎是最便携的搜索引擎，因为它适用于 Laravel 支持的所有关系型数据库（包括 SQLite 和 SQL Server）；然而，它的效率比 Scout 的数据库引擎低。

<a name="indexing"></a>
## 索引

<a name="batch-import"></a>
### 批量导入

如果你要将 Scout 安装到现有项目中，你可能已经有需要导入到你的索引中的数据库记录。Scout 提供了一个 `scout:import` Artisan 命令，你可以使用它将所有现有记录导入到你的搜索索引中：

```shell
php artisan scout:import "App\Models\Post"
```

`flush` 命令可用于从你的搜索索引中删除模型的所有记录：

```shell
php artisan scout:flush "App\Models\Post"
```



<a name="modifying-the-import-query"></a>
#### 修改导入查询

如果你想修改用于获取所有批量导入模型的查询，你可以在你的模型上定义一个`makeAllSearchableUsing`方法。这是一个很好的地方，可以在导入模型之前添加任何必要的关系加载:

    use Illuminate\Database\Eloquent\Builder;

    /**
     * 修改用于检索模型的查询，使所有模型都可搜索.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with('author');
    }

<a name="adding-records"></a>
### 添加记录

一旦你将`Laravel\Scout\Searchable` Trait添加到模型中，你所需要做的就是`保存`或`创建`一个模型实例，它将自动添加到你的搜索索引中。如果你将Scout配置为[使用队列](#queueing)，则此操作将由你的队列工作者在后台执行:

    use App\Models\Order;

    $order = new Order;

    // ...

    $order->save();

<a name="adding-records-via-query"></a>
#### 通过查询添加记录

如果你想通过Eloquent查询将模型集合添加到你的搜索索引中，你可以将`searchable`方法链接到Eloquent查询中。`searchable`方法会将查询的[结果分块](/docs/laravel/10.x/eloquent#chunking-results)并将记录添加到你的搜索索引中。同样，如果你已经配置了Scout来使用队列，那么所有的块都将由你的队列工作程序在后台导入:

    use App\Models\Order;

    Order::where('price', '>', 100)->searchable();

你也可以在Eloquent关系实例上调用`searchable`方法:

    $user->orders()->searchable();



如果你已经有一组Eloquent模型对象在内存中，可以在该集合实例上调用`searchable`方法，将模型实例添加到对应的索引中：

    $orders->searchable();

> **注意**
searchable 方法可以被视为「upsert」操作。换句话说，如果模型记录已经存在于索引中，它将被更新。如果它在搜索索引中不存在，则将其添加到索引中。

<a name="updating-records"></a>
### 更新记录

要更新可搜索的模型，只需更新模型实例的属性并将模型保存到你的数据库中。Scout 将自动将更改持久化到你的搜索索引中：

    use App\Models\Order;

    $order = Order::find(1);

    // 更新订单…

    $order->save();

你还可以在Eloquent查询实例上调用 `searchable` 方法，以更新模型的集合。如果模型不存在于搜索索引中，则将创建它们：

    Order::where('price', '>', 100)->searchable();

如果想要更新关系中所有模型的搜索索引记录，可以在关系实例上调用`searchable`方法：

    $user->orders()->searchable();

或者，如果你已经在内存中有一组 Eloquent 模型，可以在该集合实例上调用`searchable` 方法，以更新对应索引中的模型实例：

    $orders->searchable();

<a name="removing-records"></a>
### 删除记录

要从索引中删除记录，只需从数据库中删除模型即可。即使你正在使用[软删除](/docs/laravel/10.x/eloquent#soft-deleting)模型，也可以这样做：

    use App\Models\Order;

    $order = Order::find(1);

    $order->delete();



如果你不想在删除记录之前检索模型，你可以在 Eloquent 查询实例上使用 `unsearchable` 方法：

    Order::where('price', '>', 100)->unsearchable();

如果你想删除与关系中所有模型相关的搜索索引记录，你可以在关系实例上调用 `unsearchable` 方法：

    $user->orders()->unsearchable();

或者，如果你已经有一组 Eloquent 模型在内存中，你可以在集合实例上调用 `unsearchable` 方法，将模型实例从相应的索引中移除：

    $orders->unsearchable();

<a name="pausing-indexing"></a>
### 暂停索引

有时你可能需要在不将模型数据同步到搜索索引的情况下对模型执行一批 Eloquent 操作。你可以使用 `withoutSyncingToSearch` 方法来实现这一点。该方法接受一个闭包，将立即执行。在闭包内发生的任何模型操作都不会同步到模型的索引：

    use App\Models\Order;

    Order::withoutSyncingToSearch(function () {
        // 执行模型动作…
    });

<a name="conditionally-searchable-model-instances"></a>
### 有条件地搜索模型实例

有时你可能需要在某些条件下使模型可搜索。例如，假设你有一个 `App\Models\Post` 模型，它可能处于两种状态之一：「draft」（草稿）和 「published」（已发布）。你可能只想让 「published」（已发布）的帖子可以被搜索。为了实现这一点，你可以在你的模型中定义一个 `shouldBeSearchable` 方法：

    /**
     * 确定模型是否应该可搜索。
     */
    public function shouldBeSearchable(): bool
    {
        return $this->isPublished();
    }

`shouldBeSearchable` 方法仅在通过 `save` 和 `create` 方法、查询或关系操作模型时应用。直接使用 `searchable` 方法使模型或集合可搜索将覆盖 `shouldBeSearchable` 方法的结果。

> **警告**  
> 当使用 Scout 的「database」（数据库）引擎时，`shouldBeSearchable` 方法不适用，因为所有可搜索的数据都存储在数据库中。要在使用数据库引擎时实现类似的行为，你应该使用 [where 子句](#where-clauses)代替。



<a name="searching"></a>
## 搜索

你可以使用 `search` 方法开始搜索一个模型。搜索方法接受一个将用于搜索模型的字符串。然后，你应该在搜索查询上链接 `get` 方法以检索与给定搜索查询匹配的 Eloquent 模型：

    use App\Models\Order;

    $orders = Order::search('Star Trek')->get();

由于 Scout 搜索返回一组 Eloquent 模型，你甚至可以直接从路由或控制器返回结果，它们将自动转换为 JSON：

    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return Order::search($request->search)->get();
    });

如果你想在将搜索结果转换为 Eloquent 模型之前获取原始搜索结果，你可以使用 `raw` 方法：

    $orders = Order::search('Star Trek')->raw();

<a name="custom-indexes"></a>
#### 自定义索引

搜索查询通常会在模型的 [`searchableAs`](#configuring-model-indexes) 方法指定的索引上执行。然而，你可以使用 `within` 方法指定一个应该被搜索的自定义索引：

    $orders = Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();

<a name="where-clauses"></a>
### Where 子句

Scout 允许你在搜索查询中添加简单的「where」子句。目前，这些子句只支持基本的数值相等检查，主要用于通过所有者 ID 限定搜索查询：

    use App\Models\Order;

    $orders = Order::search('Star Trek')->where('user_id', 1)->get();

你可以使用 `whereIn` 方法将结果约束在给定的一组值中：

    $orders = Order::search('Star Trek')->whereIn(
        'status', ['paid', 'open']
    )->get();



由于搜索索引不是关系数据库，所以目前不支持更高级的「where」子句。

> **警告 **
> 如果你的应用程序使用了 Meilisearch，你必须在使用 Scout 的「where」子句之前配置你的应用程序的[可过滤属性](#configuring-filterable-data-for-meilisearch)。

<a name="pagination"></a>
### 分页

除了检索模型集合之外，你还可以使用 `paginate` 方法对搜索结果进行分页。此方法将返回一个 `Illuminate\Pagination\LengthAwarePaginator` 实例，就像你对[传统的 Eloquent 查询进行分页](/docs/laravel/10.x/pagination)一样：

    use App\Models\Order;

    $orders = Order::search('Star Trek')->paginate();

你可以通过将数量作为第一个参数传递给 `paginate` 方法来指定每页检索多少个模型：

    $orders = Order::search('Star Trek')->paginate(15);

一旦你检索到了结果，你可以使用 [Blade](/docs/laravel/10.x/blade) 显示结果并渲染页面链接，就像你对传统的 Eloquent 查询进行分页一样：

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

当然，如果你想将分页结果作为 JSON 检索，可以直接从路由或控制器返回分页器实例：

    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        return Order::search($request->input('query'))->paginate(15);
    });

> **警告**  
> 由于搜索引擎不了解你的 Eloquent 模型的全局作用域定义，因此在使用 Scout 分页的应用程序中，你不应该使用全局作用域。或者，你应该在通过 Scout 搜索时重新创建全局作用域的约束。


<a name="soft-deleting"></a>
### 软删除

如果你的索引模型使用了软删除并且你需要搜索已软删除的模型，请将 `config/scout.php` 配置文件中的 `soft_delete` 选项设置为 `true`。

    'soft_delete' => true,

当这个配置选项为 `true` 时，Scout 不会从搜索索引中删除已软删除的模型。相反，它会在索引记录上设置一个隐藏的 `__soft_deleted` 属性。然后，你可以使用 `withTrashed` 或 `onlyTrashed` 方法在搜索时检索已软删除的记录：

    use App\Models\Order;

    // 在检索结果时包含已删除的记录。。。
    $orders = Order::search('Star Trek')->withTrashed()->get();

    // 仅在检索结果时包含已删除的记录。。。
    $orders = Order::search('Star Trek')->onlyTrashed()->get();

> 技巧：当使用 `forceDelete` 永久删除软删除模型时，Scout 将自动从搜索索引中移除它。

<a name="customizing-engine-searches"></a>
### 自定义引擎搜索

如果你需要对一个引擎的搜索行为进行高级定制，你可以将一个闭包作为 `search` 方法的第二个参数传递进去。例如，你可以使用这个回调在搜索查询传递给 Algolia 之前将地理位置数据添加到你的搜索选项中：

    use Algolia\AlgoliaSearch\SearchIndex;
    use App\Models\Order;

    Order::search(
        'Star Trek',
        function (SearchIndex $algolia, string $query, array $options) {
            $options['body']['query']['bool']['filter']['geo_distance'] = [
                'distance' => '1000km',
                'location' => ['lat' => 36, 'lon' => 111],
            ];

            return $algolia->search($query, $options);
        }
    )->get();

<a name="customizing-the-eloquent-results-query"></a>
#### 自定义 Eloquent 结果查询

在 Scout 从你的应用程序搜索引擎中检索到匹配的 Eloquent 模型列表后，Eloquent 会使用模型的主键检索所有匹配的模型。你可以通过调用 `query` 方法来自定义此查询。`query` 方法接受一个闭包，它将接收 Eloquent 查询构建器实例作为参数：

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```


由于此回调是在从应用程序的搜索引擎中已经检索到相关模型之后调用的，因此 `query` 方法不应用于「过滤」结果。相反，你应该使用 [Scout where 子句](#where-clauses)。

<a name="custom-engines"></a>
## 自定义引擎

<a name="writing-the-engine"></a>
#### 编写引擎

如果 Scout 内置的搜索引擎不符合你的需求，你可以编写自己的自定义引擎并将其注册到 Scout。你的引擎应该继承 `Laravel\Scout\Engines\Engine` 抽象类。这个抽象类包含了你的自定义引擎必须实现的八个方法：

    use Laravel\Scout\Builder;

    abstract public function update($models);
    abstract public function delete($models);
    abstract public function search(Builder $builder);
    abstract public function paginate(Builder $builder, $perPage, $page);
    abstract public function mapIds($results);
    abstract public function map(Builder $builder, $results, $model);
    abstract public function getTotalCount($results);
    abstract public function flush($model);

你可能会发现，查看 `Laravel\Scout\Engines\AlgoliaEngine` 类上这些方法的实现会很有帮助。这个类将为你提供一个良好的起点，以学习如何在自己的引擎中实现每个方法。

<a name="registering-the-engine"></a>

#### 注册引擎
一旦你编写好自己的引擎，就可以使用 Scout 的引擎管理器的 `extend` 方法将其注册到 Scout 中。Scout 的引擎管理器可以从Laravel服务容器中解析。你应该从 `App\Providers\AppServiceProvider` 类或应用程序使用的任何其他服务提供程序的 `boot` 方法中调用 `extend` 方法：

    use App\ScoutExtensions\MySqlSearchEngine;
    use Laravel\Scout\EngineManager;

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        resolve(EngineManager::class)->extend('mysql', function () {
            return new MySqlSearchEngine;
        });
    }



引擎注册后，你可以在 `config/scout.php` , 配置文件中指定它为默认的 Scout `driver`

    'driver' => 'mysql',

<a name="builder-macros"></a>
## 生成宏命令

如果你想要自定义生成器方法，你可以使用 `Laravel\Scout\Builder` 类下的 "macro" 方法。 通常，定义「macros」时，需要实现 [service provider’s](/docs/laravel/10.x/providers) `boot` 方法:

    use Illuminate\Support\Facades\Response;
    use Illuminate\Support\ServiceProvider;
    use Laravel\Scout\Builder;

    /**
     * 引导任何应用程序服务。
     */
    public function boot(): void
    {
        Builder::macro('count', function () {
            return $this->engine()->getTotalCount(
                $this->engine()->search($this)
            );
        });
    }

`macro` 函数接受一个名字作为第一个参数，第二个参数为一个闭包函数。当调用 `Laravel\Scout\Builder` 宏命令时，调用这个函数.

    use App\Models\Order;

    Order::search('Star Trek')->count();

