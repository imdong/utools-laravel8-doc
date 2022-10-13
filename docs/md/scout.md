# Laravel Scout


- [简介](#introduction)
- [安装](#installation)
    - [驱动必要条件](#driver-prerequisites)
    - [队列](#queueing)
- [配置](#configuration)
    - [配置模型索引](#configuring-model-indexes)
    - [配置可搜索数据](#configuring-searchable-data)
    - [配置模型ID](#configuring-the-model-id)
    - [识别用户](#identifying-users)
- [数据库/收集引擎](#database-and-collection-engines)
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
- [Custom Engines](#custom-engines)
- [Builder Macros](#builder-macros)

<a name="introduction"></a>
## 介绍


[Laravel Scout](https://github.com/laravel/scout) 为 [Eloquent 模型](/docs/laravel/9.x/eloquent) 的全文搜索提供了一个简单的基于驱动程序的解决方案，通过使用模型观察者，Scout将自动同步 Eloquent 记录的搜索索引。

目前，Scout 附带 [Algolia](https://www.algolia.com/)、[MeiliSearch](https://www.meilisearch.com) 和 MySQL / PostgreSQL (`database`) 驱动程序。此外，Scout 包括一个「collection」驱动程序，该驱动程序专为本地开发使用而设计，不需要任何外部依赖项或第三方服务。此外，编写自定义驱动程序很简单，你可以使用自己的搜索实现自由扩展 Scout。

<a name="installation"></a>
## 安装

首先，通过 Composer 软件包管理器安装 Scout：

```shell
composer require laravel/scout
```

Scout 安装完成后，使用Artisan 命令 `vendor:publish` 生成 Scout 配置文件。此命令将会在你的 `config` 目录下 生成一个 `scout.php` 配置文件:

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

使用 Algolia 驱动时，需要在 `config/scout.php` 配置文件配置你的 Algolia `id` 和 `secret` 凭证。配置好凭证之后，还需要使用 Composer 安装 Algolia PHP SDK：

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
#### MeiliSearch

[MeiliSearch](https://www.meilisearch.com) 是一个速度极快的开源搜索引擎。如果你不确定如何在本地机器上安装 MeiliSearch，你可以使用 Laravel 官方支持的 Docker 开发环境 [Laravel Sail](/docs/laravel/9.x/sail#meilisearch)。

使用 MeiliSearch 驱动程序时，你需要通过 Composer 包管理器安装 MeiliSearch PHP SDK：

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

然后，在应用程序的 .env 文件中设置 `SCOUT_DRIVER` 环境变量以及你的 MeiliSearch `host` 和 `key` 凭据：

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

更多关于 MeiliSearch 的信息，请参考 [MeiliSearch 技术文档](https://docs.meilisearch.com/learn/getting_started/quick_start.html)。

此外，你应该通过查看 [MeiliSearch 关于二进制兼容性的文档](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch) 确保安装与你的 MeiliSearch 二进制版本兼容的 `meilisearch/meilisearch-php` 版本。

> 注意：在使用 MeiliSearch 的应用程序上升级 Scout 时，您应该始终留意查看关于 MeiliSearch 升级发布的 [其他重大（破坏性）更改](https://github.com/meilisearch/MeiliSearch/releases)，以保证升级顺利。


<a name="queueing"></a>
### 队列

虽然不是严格要求使用队列，但在使用库之前，你应该强烈考虑配置 [队列驱动](/docs/laravel/9.x/queues)。 运行队列 worker 将允许 Scout 将所有将你的模型信息同步到你的搜索索引的操作进行排队，从而为你的应用的 Web 界面提供更好的响应时间。

配置好队列驱动后，将 `config/scout.php` 配置文件中的 `queue` 选项的值设置为 `true`：

    'queue' => true,

<a name="configuration"></a>
## 配置

<a name="configuring-model-indexes"></a>
### 配置模型索引


每个 Eloquent 模型都与给定的搜索 「索引」同步，该索引包含该模型的所有可搜索记录。 换句话说，你可以将每个索引视为一个 MySQL 表。 默认情况下，每个模型都将持久化到与模型的典型 「表」名称匹配的索引。 通常，是模型名称的复数形式； 但你可以通过重写模型上的 `searchableAs` 方法来自由地自定义模型的索引：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * 获取与模型关联的索引的名称。
         *
         * @return string
         */
        public function searchableAs()
        {
            return 'posts_index';
        }
    }

<a name="configuring-searchable-data"></a>
### 配置可搜索数据

默认情况下，模型以完整的 `toArray` 格式持久化到搜索索引。如果要自定义同步到搜索索引的数据，可以覆盖模型上的 `toSearchableArray` 方法：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * 获取模型的可索引的数据。
         *
         * @return array
         */
        public function toSearchableArray()
        {
            $array = $this->toArray();

            // 自定义数据数组...

            return $array;
        }
    }



<a name="configuring-the-model-id"></a>
### 配置模型 ID

默认情况下，Scout 将使用模型的主键作为搜索索引中存储的唯一 ID / key。 可以通过模型上的 `getScoutKey` 和 `getScoutKeyName` 方法自定义：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * 获取用于索引模型的值
         *
         * @return mixed
         */
        public function getScoutKey()
        {
            return $this->email;
        }

        /**
         * 获取用于索引模型的键名
         *
         * @return mixed
         */
        public function getScoutKeyName()
        {
            return 'email';
        }
    }

<a name="identifying-users"></a>
### 识别用户


Scout 还允许您在使用 [Algolia](https://algolia.com) 时自动识别用户。在 Algolia 的仪表板中查看搜索分析时，将经过身份验证的用户与搜索操作相关联可能会有所帮助。您可以通过在应用程序的 `.env` 文件中将 `SCOUT_IDENTIFY` 环境变量定义为 `true` 来启用用户标识：

```ini
SCOUT_IDENTIFY=true
```

启用此功能还会将请求的 IP 地址和经过身份验证的用户的主标识符传递给 Algolia，以便将此数据与用户发出的任何搜索请求相关联。

<a name="database-and-collection-engines"></a>
## 数据库 / Collection 引擎

<a name="database-engine"></a>
### 数据库引擎

> 注意：数据库引擎目前支持 MySQL 和 PostgreSQL。

如果你的应用程序使用中小型数据库交互，且数据库本身负载较低，你可能会发现使用 Scout 的「数据库引擎」会更方便。数据库引擎将在过滤现有数据库的结果时使用「where like」子句和全文索引，以确定查询的适用搜索结果。


要使用数据库引擎，你可以简单地将 `SCOUT_DRIVER` 环境变量的值设置为 `database`，或者直接在应用程序的 `scout` 配置文件中指定 `database` 驱动程序：

```ini
SCOUT_DRIVER=database
```

一旦你将数据库引擎指定为首选驱动程序后，你必须 [配置你的可搜索数据](#configuring-searchable-data)。然后，你可以针对你的模型开始 [执行搜索查询](#searching)。使用数据库引擎时不需要搜索引擎索引，例如填充 Algolia 或 MeiliSearch 索引所需的索引。

#### 自定义数据库搜索策略

默认情况下，数据库引擎将对你已[配置为可搜索](#configuring-searchable-data) 的每个模型属性执行「where like」查询。但是，在某些情况下，这可能会导致性能不佳。因此，你可以通过配置数据库引擎的搜索策略，使某些指定的列使用全文搜索查询或仅使「where like」约束来搜索字符串的前缀（`example%`），而不是在整个字符串中搜索（`%example%`)。

要定义此行为，你可以将 PHP 属性分配给模型的 `toSearchableArray` 方法。任何未分配额外搜索策略行为的列将继续使用默认的「where like」策略：

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * 获取模型的可索引数据数组。
 *
 * @return array
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray()
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> 注意：在指定列应使用全文查询约束之前，请确保已为该列分配了 [全文索引](/docs/laravel/9.x/migrations#available-index-types)。

<a name="collection-engine"></a>
### Collection 引擎

虽然你在本地开发过程中可以自由使用 Algolia 或 MeiliSearch 搜索引擎，但你可能会发现使用「Collection」引擎更方便。Collection 引擎将对现有数据库的结果使用「where」子句和收集过滤来确定适用于你的查询的搜索结果。使用此引擎时，无需为您的可搜索模型「索引」，因为它们只会从您的本地数据库中检索。

要使用收集引擎，你可以简单地将 `SCOUT_DRIVER` 环境变量的值设置为 `collection`，或者直接在应用程序的 `scout` 配置文件中指定 `collection` 驱动程序：

```ini
SCOUT_DRIVER=collection
```

一旦你将 Collection  驱动指定为首选驱动程序，你就可以开始对你的模型[执行搜索查询](#searching)。使用 Collection 引擎时，不需要搜索引擎索引，例如填充 Algolia 或 MeiliSearch 索引所需的索引。

#### 与数据库引擎的区别

乍一看，「数据库」和「Collection 」引擎非常相似。它们都直接与你的数据库交互以检索搜索结果。但是，Collection 引擎不使用全文索引或「LIKE」子句来查找匹配记录。相反，它会提取所有可能的记录并使用 Laravel 的 `Str::is` 帮助器来确定搜索字符串是否存在于模型属性值中。

Collection 引擎是最便携的搜索引擎，因为它适用于 Laravel 支持的所有关系数据库（包括 SQLite 和 SQL Server）；但是，它的效率低于 Scout 的数据库引擎。


<a name="indexing"></a>
## 索引

<a name="batch-import"></a>
### 批量导入

如果要将 Scout 安装到现有项目中，则可能已有需要导入索引的数据库记录。Scout 提供 Artisan 命令 `scout:import`，可用于将所有现有记录导入搜索索引：

```shell
php artisan scout:import "App\Models\Post"
```

 `flush` 命令可用于从搜索索引中删除模型的所有记录：

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### 修改导入查询

如果要修改用于检索所有模型以进行批量导入的查询，可以在模型上定义 `makeAllSearchableUsing` 方法。这是一个很好的地方，可以在导入模型之前添加任何可能需要的即时关系加载：

    /**
     * 在使所有模型都可搜索时，修改用于检索模型的查询。
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function makeAllSearchableUsing($query)
    {
        return $query->with('author');
    }

<a name="adding-records"></a>
### 添加记录

一旦将 `Laravel\Scout\Searchable` trait 添加到模型中，你只需 `save` 或 `create` 模型实例，它就会自动添加到搜索索引中。如果已将 Scout 配置为 [使用队列](#queueing)，此操作将由队列 worker 进程在后台执行：

    use App\Models\Order;

    $order = new Order;

    // ...

    $order->save();

<a name="adding-records-via-query"></a>


#### 通过查询添加

如果你希望通过 Eloquent 查询将模型集合添加到搜索索引中，你也可以在 Eloquent 查询构造器上链式调用 `searchable` 方法。`searchable` 会把构造器的查询 [结果分块](/docs/laravel/9.x/eloquent#chunking-results) 并将记录添加到搜索索引中。同样，如果你已将 Scout 配置为使用队列，则队列 worker 将在后台导入所有块：

    use App\Models\Order;

    Order::where('price', '>', 100)->searchable();

你还可以在 Eloquent 关联实例上调用 `searchable` 方法：

    $user->orders()->searchable();

或者，如果内存中已经有一组 Eloquent 模型，可以调用集合实例上的 `searchable` 方法，将模型实例添加到相应的索引中：

    $orders->searchable();

> 技巧：`searchable` 方法可被视为 「upsert」操作。换句话说，如果模型记录已经在索引中，它将被更新。如果它不存在于搜索索引中，则将其添加到索引中。

<a name="updating-records"></a>
### 更新记录

要更新可搜索的模型，只需要更新模型实例的属性并将模型 `save` 到数据库。Scout 会自动将更新同步到你的搜索索引中：

    use App\Models\Order;

    $order = Order::find(1);

    // 更新订单...

    $order->save();

你也可以在 Eloquent 查询语句上使用 `searchable` 方法来更新一个模型的集合。如果这个模型不存在你检索的索引里，就会被创建：

    Order::where('price', '>', 100)->searchable();



如果要更新关系中所有模型的搜索索引记录，可以在关系实例上调用 `searchable` ：

    $user->orders()->searchable();

或者，如果内存中已经有 Eloquent 模型集合，则可以调用集合实例上的 `searchable` 方法来更新相应索引中的模型实例：

    $orders->searchable();

<a name="removing-records"></a>
### 移除记录

要从索引中删除记录，只需从数据库中 `delete` 模型即可。即使你正在使用 [软删除](/docs/laravel/9.x/eloquent#soft-deleting) 模型，也可以这样做：

    use App\Models\Order;

    $order = Order::find(1);

    $order->delete();

如果你不希望记录在删除之前被检索到，可以在 Eloquent 查询实例或集合上使用 `unsearchable` 方法：

    Order::where('price', '>', 100)->unsearchable();

如果要删除关系中所有模型的搜索索引记录，可以在关系实例上调用 `unsearchable` ：

    $user->orders()->unsearchable();

或者，如果内存中已经有 Eloquent 模型集合，则可以调用集合实例上的 `unsearchable` 方法，从相应的索引中删除模型实例：

    $orders->unsearchable();

<a name="pausing-indexing"></a>
### 暂停索引

你可能需要在执行一批 Eloquent 操作的时候，不同步模型数据到搜索索引。此时你可以使用 `withoutSyncingToSearch` 方法来执行此操作。这个方法接受一个立即执行的回调。该回调中所有的操作都不会同步到模型的索引：

    use App\Models\Order;

    Order::withoutSyncingToSearch(function () {
        // 执行模型操作...
    });



<a name="conditionally-searchable-model-instances"></a>
### 有条件的搜索模型实例

有时你可能只需要在某些条件下使模型可搜索。例如，假设你有 `App\Models\Post` 模型可能是两种状态之一：「草稿」和「已发布」。你可能只允许搜索 「已发布」的帖子。为了实现这一点，你需要在模型中定义一个 `shouldBeSearchable` 方法：

    /**
     * 确定模型是否可搜索
     *
     * @return bool
     */
    public function shouldBeSearchable()
    {
        return $this->isPublished();
    }

仅当通过 `save` 和 `create` 方法、查询或关联模型操作时，才应使用 `shouldBeSearchable` 方法。直接使用 `searchable` 方法将使模型或集合的可搜索结果覆盖 `shouldBeSearchable` 方法的结果:

> 注意：`shouldBeSearchable` 方法在使用 Scout 的“数据库”引擎时不适用，因为所有可搜索的数据始终存储在数据库中。要在使用数据库引擎时实现类似的行为，你应该改用 [where 子句](#where-clauses)。

<a name="searching"></a>
## 搜索

你可以使用 `search` 方法来搜索模型。search 方法接受一个用于搜索模型的字符串。你还需要在搜索查询上链式调用 `get` 方法，才能用给定的搜索语句查询与之匹配的 Eloquent 模型：

    use App\Models\Order;

    $orders = Order::search('Star Trek')->get();

由于 Scout 搜索返回 Eloquent 模型的集合，你甚至可以直接从路由或控制器返回结果，结果将自动转换为 JSON ：

    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return Order::search($request->search)->get();
    });



如果你想在它们转换成 Eloquent 模型前得到原始结果，你应该使用 `raw` 方法：

    $orders = Order::search('Star Trek')->raw();

<a name="custom-indexes"></a>
#### 自定义索引

搜索查询通常会在模型的 [`searchableAs`](#configuring-model-indexes) 方法指定的索引上执行。但是，你可以使用 `within` 方法指定应搜索的自定义索引：

    $orders = Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();

<a name="where-clauses"></a>
### Where 子句

Scout 允许你在搜索查询中添加简单的「where」子句。目前，这些子句仅支持基本的数值相等性检查，主要用于按所有者 ID 确定搜索查询的范围。

    use App\Models\Order;

    $orders = Order::search('Star Trek')->where('user_id', 1)->get();

你可以使用 `whereIn` 方法将结果限制在给定的一组值上：

    $orders = Order::search('Star Trek')->whereIn(
        'status', ['paid', 'open']
    )->get();

由于搜索索引不是关系数据库，因此目前不支持更高级的「where」子句。

<a name="pagination"></a>
### 分页

除了检索模型的集合，你也可以使用 `paginate` 方法对搜索结果进行分页。这个方法会返回一个就像 [传统的 Eloquent 查询分页 ](/docs/laravel/9.x/pagination) 一样的 `Illuminate\Pagination\LengthAwarePaginator` 实例：

    use App\Models\Order;

    $orders = Order::search('Star Trek')->paginate();

通过将数量作为第一个参数传递给 `paginate` 方法，可以指定每页要检索多少个模型：

    $orders = Order::search('Star Trek')->paginate(15);



检索结果后，你可以使用 [Blade](/docs/laravel/9.x/blade) 显示结果并呈现页面链接，就像对传统的 Eloquent 查询进行分页一样：

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

当然，如果希望以 JSON 形式检索分页结果，可以直接从路由或控制器返回分页器实例：

    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        return Order::search($request->input('query'))->paginate(15);
    });

<a name="soft-deleting"></a>
### 软删除

如果你索引的模型是 [软删除](/docs/laravel/9.x/eloquent#soft-deleting)，并且你需要搜索已删除的模型，请将 `config/scout.php` 配置文件中的 `soft_delete` 选项设置为  `true`：

    'soft_delete' => true,

当此配置选项为 `true` 时，Scout 不会从搜索索引中删除软删除的模型。相反，它将在索引记录上设置一个隐藏的`__soft_deleted` 属性。然后，你可以在搜索时使用 `withTrashed` 或 `onlyTrashed` 方法检索软删除记录：

    use App\Models\Order;

    // 检索结果包括已删除记录
    $orders = Order::search('Star Trek')->withTrashed()->get();

    // 仅检索已删除记录...
    $orders = Order::search('Star Trek')->onlyTrashed()->get();

> 技巧：当使用 `forceDelete` 永久删除软删除模型时，Scout 会自动将其从搜索索引中删除。

<a name="customizing-engine-searches"></a>
### 自定义搜索引擎


如果需要对引擎的搜索行为执行高级自定义，可以将闭包作为第二个参数传递给 `search`  方法。例如，在将搜索查询传递给 Algolia 之前，可以使用此回调将地理位置数据添加到搜索选项中：

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



<a name="custom-engines"></a>
## 自定义引擎

<a name="writing-the-engine"></a>
#### 编写引擎

如果内置的 Scout 搜索引擎不能满足你的需求，你可以编写自定义的引擎并且将它注册到 Scout。 你的引擎需要继承 `Laravel\Scout\Engines\Engine` 抽象类，这个抽象类包含了你自定义的引擎必须要实现的八个方法：

    use Laravel\Scout\Builder;

    abstract public function update($models);
    abstract public function delete($models);
    abstract public function search(Builder $builder);
    abstract public function paginate(Builder $builder, $perPage, $page);
    abstract public function mapIds($results);
    abstract public function map(Builder $builder, $results, $model);
    abstract public function getTotalCount($results);
    abstract public function flush($model);

在 `Laravel\Scout\Engines\AlgoliaEngine` 类里查看这些方法的实现会对你有较大的帮助。这个类会为你在学习如何在自定义引擎中实现这些方法提供一个好的起点。

<a name="registering-the-engine"></a>
#### 注册引擎


一旦你写好了自定义引擎，你可以用 Scout 引擎管理的 `extend` 方法将它注册到 Scout。你只需要从`App\Providers\AppServiceProvider`  下的 `boot` 方法或者应用中使用的任何一个服务提供器中调用 `extend` 方法。

举个例子，如果你写好了一个 `MySqlSearchEngine`，你可以像这样去注册它：

    use App\ScoutExtensions\MySqlSearchEngine
    use Laravel\Scout\EngineManager;

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        resolve(EngineManager::class)->extend('mysql', function () {
            return new MySqlSearchEngine;
        });
    }

引擎注册后，你可以在 `config/scout.php` ,配置文件中指定它为默认的 Scout  `driver` :

    'driver' => 'mysql',



<a name="builder-macros"></a>
## 生成宏命令

如果你想要自定义生成器方法，你可以使用`Laravel\Scout\Builder` 类下的"macro" 方法。 通常，定义「macros」时，需要实现 [service provider's](/docs/laravel/9.x/providers) `boot` 方法:

    use Illuminate\Support\Facades\Response;
    use Illuminate\Support\ServiceProvider;
    use Laravel\Scout\Builder;

    /**
     * 注册应用的 Scout 宏命令
     *
     * @return void
     */
    public function boot()
    {
        Builder::macro('count', function () {
            return $this->engine()->getTotalCount(
                $this->engine()->search($this)
            );
        });
    }

`macro` 函数接受一个名字作为第一个参数，第二个参数为一个闭包函数。当调用  `Laravel\Scout\Builder` 宏命令时，调用这个函数.

    use App\Models\Order;

    Order::search('Star Trek')->count();

