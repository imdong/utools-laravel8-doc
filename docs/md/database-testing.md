# 数据库测试

- [介绍](#introduction)
    - [每次测试后重置数据库](#resetting-the-database-after-each-test)
- [定义模型的工厂](#defining-model-factories)
    - [概念概述](#concept-overview)
    - [创建工厂](#generating-factories)
    - [工厂状态](#factory-states)
    - [工厂回调](#factory-callbacks)
- [使用工厂创建模型](#creating-models-using-factories)
    - [实例化模型](#instantiating-models)
    - [持久化模型](#persisting-models)
    - [序列](#sequences)
- [工厂关系](#factory-relationships)
    - [一对多关系](#has-many-relationships)
    - [一对多（反向）关系](#belongs-to-relationships)
    - [多对多关系](#many-to-many-relationships)
    - [多态关系](#polymorphic-relationships)
    - [定义工厂内部关系](#defining-relationships-within-factories)
- [运行 Seeders](#running-seeders)
- [可用断言](#available-assertions)

<a name="introduction"></a>
## 介绍

Laravel 提供了各种有用的工具和断言，使测试数据库驱动的应用程序更加容易。此外，Laravel 模型工厂和 Seeders 可以轻松地使用应用程序的 Eloquent 模型和关系创建测试数据库记录。我们将在下面的文档中讨论所有这些强大的功能。

<a name="resetting-the-database-after-each-test"></a>
### 每次测试后重置数据库

在继续进行之前，让我们讨论如何在每个测试之后重置数据库，以便前一个测试的数据不会干扰后续测试。Laravel 包含的 Trait`Illuminate\Foundation\Testing\RefreshDatabase` 将为你解决这一问题。只需在测试类上使用这个 Trait：

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * 一个基本的功能测试示例。
         *
         * @return void
         */
        public function test_basic_example()
        {
            $response = $this->get('/');

            // ...
        }
    }

如果你的数据库模式（Schema）是最新的，那么这个 Trait`Illuminate\Foundation\Testing\RefreshDatabase` 并不会迁移数据库。相反，它将只在一个数据库事务中执行测试。因此，任何由测试用例添加到数据库的记录，如果不使用这个 Trait，可能仍然存在于数据库中。


如果你想使用迁移来完全重置数据库，可以使用 Trait `Illuminate\Foundation\Testing\DatabaseMigrations` 来代替。然而，`DatabaseMigrations`Trait 明显比 `RefreshDatabase` Trait 慢。

<a name="defining-model-factories"></a>
## 定义模型工厂

<a name="concept-overview"></a>
### 概念概述

首先，让我们谈谈 Eloquent 模型工厂。测试时，你可能需要在执行测试之前向数据库中插入一些记录。 Laravel 允许你使用模型工厂为每个 [Eloquent 模型](/docs/laravel/9.x/eloquent) 定义一组默认属性，而不是在创建测试数据时手动指定每一列的值。

要了解如何编写工厂的示例，请查看应用程序中的 `database/factories/UserFactory.php` 文件。这个工厂包含在所有新的 Laravel 源码程序中，并包含以下工厂定义：

    namespace Database\Factories;

    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Factory;
    use Illuminate\Support\Str;

    class UserFactory extends Factory
    {
        /**
         * 定义模型的默认值。
         *
         * @return array
         */
        public function definition()
        {
            return [
                'name' => $this->faker->name,
                'email' => $this->faker->unique()->safeEmail,
                'email_verified_at' => now(),
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'remember_token' => Str::random(10),
            ];
        }
    }

正如你所见，在最基本的形式中，factories 是继承 Laravel 的基础 factory 类和定义 `definition` 方法的类。`definition` 方法返回使用 factory 创建模型时应用的默认属性值集合。

通过 `faker` 属性， factories 可以访问 [Faker](https://github.com/FakerPHP/Faker)  PHP 函数库，它允许你便捷的生成各种随机数据来进行测试。

> 技巧：你也可以在 `config/app.php` 配置文件中添加 `faker_locale` 选项来设置 Faker 的语言环境。

<a name="generating-factories"></a>
### 创建工厂

要创建工厂，请使用 [Artisan 命令](/docs/laravel/9.x/artisan) `make:factory`：

```shell
php artisan make:factory PostFactory
```

新工厂将放置在你的 `database/factories` 目录下。

<a name="factory-and-model-discovery-conventions"></a>
#### 模型和工厂的关联约定

定义工厂后，可以在模型中使用 `Illuminate\Database\Eloquent\Factories\HasFactory` 特性提供的 `factory` 静态方法，来为模型实例化工厂。

`HasFactory` 特性的 `factory` 方法将按约定来为模型确定合适的工厂。具体来说，该方法将在 `Database\Factorys` 的命名空间下查找类名与模型名相匹配，并以 `Factory` 为后缀的工厂。如果当前约定不适用于你的特定应用程序或工厂，你可以重写模型中的 `newFactory` 方法，返回模型实际对应的工厂实例：

    use Database\Factories\Administration\FlightFactory;

    /**
     * 为当前模型创建一个工厂实例
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    protected static function newFactory()
    {
        return FlightFactory::new();
    }

接下来，在对应的工厂中定义 `model` 属性：

    use App\Administration\Flight;
    use Illuminate\Database\Eloquent\Factories\Factory;

    class FlightFactory extends Factory
    {
        /**
         * 工厂对应的模型名称
         *
         * @var string
         */
        protected $model = Flight::class;
    }

<a name="factory-states"></a>
### 工厂状态

你可以定义各自独立的状态操作方法，并可以任意组合应用于你的模型工厂。例如，你的 `Database\Factories\UserFactory` 工厂可能包含修改其默认属性值的 `suspended` 状态方法



状态转换方法通常会调用 Laravel 的基础工厂类提供的 `state` 方法 。 `state` 方法接收一个闭包，该闭包将收到工厂的原始属性数组，并应该返回要修改的属性数组：

    /**
     * 标识用户已停用
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function suspended()
    {
        return $this->state(function (array $attributes) {
            return [
                'account_status' => 'suspended',
            ];
        });
    }

<a name="factory-callbacks"></a>
### 工厂回调

工厂回调是通过 `afterMaking` 和 `afterCreating` 方法来注册的，并且允许你在创建模型之后执行其他任务。 你应该通过在工厂类上定义 `configure` 方法来注册这些回调。 实例化工厂后，Laravel 将自动调用此方法：

    namespace Database\Factories;

    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Factory;
    use Illuminate\Support\Str;

    class UserFactory extends Factory
    {
        /**
         * 配置模型工厂
         *
         * @return $this
         */
        public function configure()
        {
            return $this->afterMaking(function (User $user) {
                //
            })->afterCreating(function (User $user) {
                //
            });
        }

        // ...
    }

<a name="creating-models-using-factories"></a>
## 使用工厂创建模型

<a name="instantiating-models"></a>
### 实例化模型

一旦你定义了工厂，就可以使用 `Illuminate\Database\Eloquent\Factories\HasFactory` 特性为你的模型提供的 `factory` 静态方法来实例化工厂。让我们来看几个创建模型的例子。首先，我们将使用 `make` 方法来创建模型而且不需要将它们持久化到数据库中：

    use App\Models\User;

    public function test_models_can_be_instantiated()
    {
        $user = User::factory()->make();

        // 在测试中使用模型...
    }



你可以使用 `count` 方法创建许多模型的集合：

    $users = User::factory()->count(3)->make();

<a name="applying-states"></a>
#### 应用各种状态

你也可以应用你的任何一个 [states](#factory-states) 到模型. 如果你想向模型应用多个状态转换，则可以直接调用状态转换方法：

    $users = User::factory()->count(5)->suspended()->make();

<a name="overriding-attributes"></a>
#### 覆盖属性

如果你想覆盖模型的一些默认值, 你可以将数组传递给`make`方法. 只有指定的属性将被替换，而这些属性的其余部分保持设置为其默认值，则为出厂指定：

    $user = User::factory()->make([
        'name' => 'Abigail Otwell',
    ]);

或者，可以直接在出厂实例上调用`state`方法以执行内联状态转换：

    $user = User::factory()->state([
        'name' => 'Abigail Otwell',
    ])->make();

> 技巧：[批量分配保护](/docs/laravel/9.x/eloquent#mass-assignment) 使用工厂创建模型时会自动禁用.

<a name="persisting-models"></a>
### 持久化模型

`create` 方法创建模型实例，并使用  Eloquent 的 `save` 方法其持久化到数据库中：

    use App\Models\User;

    public function test_models_can_be_persisted()
    {
        // 创建单个 App\Models\User 实例...
        $user = User::factory()->create();

        // 创建三个 App\Models\User 实例...
        $users = User::factory()->count(3)->create();

        // 在测试中使用模型...
    }

你可以通过将属性数组传递给 `create` 方法来覆盖模型上的属性：

    $user = User::factory()->create([
        'name' => 'Abigail',
    ]);



<a name="sequences"></a>
### 序列

有时，你可能希望为每个创建的模型替换给定模型属性的值。 你可以通过将状态转换定义为 Sequence 实例来完成此操作。 例如，我们可能希望为每个创建的用户在 User 模型上的 `admin` 列的值在 `Y` 和 `N` 之间切换：

    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Sequence;

    $users = User::factory()
                    ->count(10)
                    ->state(new Sequence(
                        ['admin' => 'Y'],
                        ['admin' => 'N'],
                    ))
                    ->create();

在本例中，将创建 5 个用户 `admin` 值为 `Y`，创建另外 5 个用户 `admin` 值为 `N`。

如有必要，你可以引入闭包作为 sequence 的值，每次 sequence 需要新值的时候这个闭包都会被调用。

    $users = User::factory()
                    ->count(10)
                    ->state(new Sequence(
                        fn ($sequence) => ['role' => UserRoles::all()->random()],
                    ))
                    ->create();

在序列闭包中，你可以访问注入闭包的序列实例的 `$index` 或 `$count` 属性。 `$index` 属性包含到目前为止已发生的序列的迭代次数，而 `$count` 属性包含将调用序列的总次数：

    $users = User::factory()
                    ->count(10)
                    ->sequence(fn ($sequence) => ['name' => 'Name '.$sequence->index])
                    ->create();

<a name="factory-relationships"></a>
## 工厂关系

<a name="has-many-relationships"></a>
### 一对多关系

接下来，让我们探索使用 Laravel 流畅的工厂方法建立 Eloquent 模型关系。 首先，假设我们的应用程序具有 `App\Models\User` 模型和 `App\Models\Post` 模型。同样，假设 `User` 模型定义了与 `Post` 的 `hasMany` 关系 。 我们可以通过 Laravel 的工厂提供的 `has` 方法创建一个拥有三个帖子的用户。 `has` 方法接受工厂实例：

    use App\Models\Post;
    use App\Models\User;

    $user = User::factory()
                ->has(Post::factory()->count(3))
                ->create();



按照惯例，在将 `Post` 模型传递给 `has` 方法时，Laravel 会假设 `User` 模型必须有一个定义关系的 `posts` 方法。如有必要，你可以明确指定要操作的关系的名称：

    $user = User::factory()
                ->has(Post::factory()->count(3), 'posts')
                ->create();

当然，你可以对相关模型执行状态操作。此外，如果状态更改需要访问父模型，则可以传递基于闭包的状态转换：

    $user = User::factory()
                ->has(
                    Post::factory()
                            ->count(3)
                            ->state(function (array $attributes, User $user) {
                                return ['user_type' => $user->type];
                            })
                )
                ->create();

<a name="has-many-relationships-using-magic-methods"></a>
#### 使用魔术方法

为了方便起见 ，你可以使用 Laravel 的 魔术工厂关系方法来构建关系。例如，以下示例将使用约定来确定应通过 `User` 模型上的 `posts` 关系方法创建相关模型：

    $user = User::factory()
                ->hasPosts(3)
                ->create();

在使用魔术方法创建工厂关系时，你可以传递要在相关模型上覆盖的属性数组：

    $user = User::factory()
                ->hasPosts(3, [
                    'published' => false,
                ])
                ->create();

如果状态更改需要访问父模型，你可以提供基于闭包的状态转换：

    $user = User::factory()
                ->hasPosts(3, function (array $attributes, User $user) {
                    return ['user_type' => $user->type];
                })
                ->create();

<a name="belongs-to-relationships"></a>
### 从属关系

既然我们已经探索了如何使用工厂构建「has many」关系，那么让我们来看看该关系的反面。`for` 方法可用于定义工厂创建的模型所属的父模型。例如，我们可以创建三个属于单个用户的 `App\Models\Post` 模型实例：

    use App\Models\Post;
    use App\Models\User;

    $posts = Post::factory()
                ->count(3)
                ->for(User::factory()->state([
                    'name' => 'Jessica Archer',
                ]))
                ->create();



如果你已经有一个应该与你正在创建的模型相关联的父模型实例，可以传递这个模型实例给 `for` 方法：

    $user = User::factory()->create();

    $posts = Post::factory()
                ->count(3)
                ->for($user)
                ->create();

<a name="belongs-to-relationships-using-magic-methods"></a>
#### 从属关系使用魔法方法

为方便起见，你可以使用工厂的魔术关系方法来定义「属于」关系。例如，下面的示例将使用约定来确定这三个帖子应该属于 `Post` 模型上的 `user` 关系：

    $posts = Post::factory()
                ->count(3)
                ->forUser([
                    'name' => 'Jessica Archer',
                ])
                ->create();

<a name="many-to-many-relationships"></a>
### 多对多关系

像 [一对多关系](#has-many-relationships),一样，可以使用 ` has` 方法创建「多对多」关系：

    use App\Models\Role;
    use App\Models\User;

    $user = User::factory()
                ->has(Role::factory()->count(3))
                ->create();

<a name="pivot-table-attributes"></a>
#### Pivot (中转) 表属性

如果需要定义应该在链接模型的中转表 / 中间表上设置的属性，可以使用 `hasAttached` 方法。此方法接受中转表属性名称和值的数组作为其第二个参数：

    use App\Models\Role;
    use App\Models\User;

    $user = User::factory()
                ->hasAttached(
                    Role::factory()->count(3),
                    ['active' => true]
                )
                ->create();

如果你的状态更改需要访问相关模型，则可以提供基于闭包的状态转换：

    $user = User::factory()
                ->hasAttached(
                    Role::factory()
                        ->count(3)
                        ->state(function (array $attributes, User $user) {
                            return ['name' => $user->name.' Role'];
                        }),
                    ['active' => true]
                )
                ->create();



你可以通过将模型实例传递给 `hasAttached` 方法的形式，将其附加到正在创建的模型实例中。下面示例中是将三个相同的角色附加到三个用户：

    $roles = Role::factory()->count(3)->create();

    $user = User::factory()
                ->count(3)
                ->hasAttached($roles, ['active' => true])
                ->create();

<a name="many-to-many-relationships-using-magic-methods"></a>
#### 多对多关系使用魔术方法

为方便起见，你可以使用工厂的魔术关系方法来定义多对多关系。例如，下面的示例将使用约定来确定应通过  `User` 模型上的 `Roles` 关系方法创建相关模型：

    $user = User::factory()
                ->hasRoles(1, [
                    'name' => 'Editor'
                ])
                ->create();

<a name="polymorphic-relationships"></a>
### 多态关系

[多态关系](/docs/laravel/9.x/eloquent-relationships#polymorphic-relationships) 也可以使用工厂创建。多态的 「morph many」关系的创建方式与典型的 「has many」 关系的创建方式相同。例如，如果 `App\Models\Post` 模型与 `App\Models\Comment` 模型存在 `morMany` 关系：

    use App\Models\Post;

    $post = Post::factory()->hasComments(3)->create();

<a name="morph-to-relationships"></a>
#### 变形关系

魔术方法不能用于创建 `morTo` 关系。相反，必须直接使用 `for` 方法，并且必须显式提供关系的名称。例如，假设 `Comment` 模型有一个 `commentable` 方法，该方法定义了一个 `morTo` 关系。在这种情况下，我们可以直接使用 `for` 方法创建属于单个帖子的三条评论：

    $comments = Comment::factory()->count(3)->for(
        Post::factory(), 'commentable'
    )->create();



<a name="polymorphic-many-to-many-relationships"></a>
#### 多态多对多关系

可以像创建非多态的 「多对多」(`morphToMany` / `morphedByMany`) 关系一样创建多态的「多对多」关系：

    use App\Models\Tag;
    use App\Models\Video;

    $videos = Video::factory()
                ->hasAttached(
                    Tag::factory()->count(3),
                    ['public' => true]
                )
                ->create();

当然，魔术 `has` 方法也可以用于创建多态「多对多」关系：

    $videos = Video::factory()
                ->hasTags(3, ['public' => true])
                ->create();

<a name="defining-relationships-within-factories"></a>
### 定义工厂内的关系

要在模型工厂中定义关系，通常会将新工厂实例分配给关系的外键。这通常用于「反向」关系，像 `belongsTo` 和 `morphTo` 关系。例如，如果你想在创建帖子的同时创建一个新用户，你可以执行以下操作：

    use App\Models\User;

    /**
     * 定义模型的默认状态
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->title(),
            'content' => $this->faker->paragraph(),
        ];
    }

如果关系的列依赖于定义它的工厂，你可以为属性分配一个闭包。闭包将接收工厂的评估属性数组：

    /**
     * 定义模型的默认状态
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'user_type' => function (array $attributes) {
                return User::find($attributes['user_id'])->type;
            },
            'title' => $this->faker->title(),
            'content' => $this->faker->paragraph(),
        ];
    }

<a name="running-seeders"></a>
## 运行填充

如果你在功能测试时希望使用 [数据库填充](/docs/laravel/9.x/seeding) 来填充你的数据库， 你可以调用 `seed` 方法。 默认情况下，  `seed` 方法将会执行 `DatabaseSeeder`， 它应该执行你的所有其他种子器。或者，你传递指定的种子器类名给 `seed` 方法：

    <?php

    namespace Tests\Feature;

    use Database\Seeders\OrderStatusSeeder;
    use Database\Seeders\TransactionStatusSeeder;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * 测试创建新订单
         *
         * @return void
         */
        public function test_orders_can_be_created()
        {
            // 运行 DatabaseSeeder...
            $this->seed();

            // 运行指定填充...
            $this->seed(OrderStatusSeeder::class);

            // ...

            // 运行指定数组内填充...
            $this->seed([
                OrderStatusSeeder::class,
                TransactionStatusSeeder::class,
                // ...
            ]);
        }
    }



或者，你可以指示 `RefreshDatabase` trait 在每次测试之前自动为数据库填充数据。你可以通过在测试类上定义 `$seed` 属性来实现：

    <?php

    namespace Tests;

    use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

    abstract class TestCase extends BaseTestCase
    {
        use CreatesApplication;

        /**
         * 指示是否应在每次测试之前运行默认数据填充
         *
         * @var bool
         */
        protected $seed = true;
    }

当 `$seed` 属性为 `true` 时，测试将在每个使用 `RefreshDatabase` trait 的测试之前运行 `Database\Seeders\DatabaseSeeder` 类。但是，你可以通过在测试类上定义 `$seeder` 属性来指定应该执行的特定数据填充：

    use Database\Seeders\OrderStatusSeeder;

    /**
     * 每次测试前运行指定数据填充     *
     * @var string
     */
    protected $seeder = OrderStatusSeeder::class;

<a name="available-assertions"></a>
## 可用的断言

Laravel 为你的 [PHPUnit](https://phpunit.de/) 功能测试提供了几个数据库断言。我们将在下面逐个讨论。

<a name="assert-database-count"></a>
#### assertDatabaseCount

断言数据库中的表包含给定数量的记录：

    $this->assertDatabaseCount('users', 5);

<a name="assert-database-has"></a>
#### assertDatabaseHas

断言数据库中的表包含给定键/值查询约束的记录：

    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com',
    ]);

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

断言数据库中的表不包含给定键/值查询约束的记录：

    $this->assertDatabaseMissing('users', [
        'email' => 'sally@example.com',
    ]);

<a name="assert-deleted"></a>
#### assertSoftDeleted

 `assertSoftDeleted` 断言给定的 Eloquent 模型已被「软删除」：

    $this->assertSoftDeleted($user);

<a name="assert-model-exists"></a>
#### assertModelExists

断言给定模型存在于数据库中：

    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);

<a name="assert-model-missing"></a>
#### assertModelMissing

断言数据库中不存在给定模型：

    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);

