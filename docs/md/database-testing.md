# 数据库测试

- [介绍](#introduction)
    - [每次测试后重置数据库](#resetting-the-database-after-each-test)
- [模型工厂](#model-factories)
- [运行 Seeders](#running-seeders)
- [可用的断言](#available-assertions)

<a name="introduction"></a>
## 介绍

Laravel 提供了各种有用的工具和断言，从而让测试数据库驱动变得更加容易。除此之外，Laravel 模型工厂和 Seeders 可以轻松地使用应用程序的 Eloquent 模型和关系来创建测试数据库记录。

<a name="resetting-the-database-after-each-test"></a>
### 每次测试后重置数据库

在进行测试之前，让我们讨论一下如何在每次测试后重置数据库，以便让先前测试的数据不会干扰后续测试。 Laravel 包含的 `Illuminate\Foundation\Testing\RefreshDatabase` trait 会为你解决这个问题。只需在您的测试类上使用该 Trait：

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * 一个基本的功能测试例子。
         */
        public function test_basic_example(): void
        {
            $response = $this->get('/');

            // ...
        }
    }

如果你的数据库结构是最新的，那么这个 Trait`Illuminate\Foundation\Testing\RefreshDatabase` 并不会迁移数据库。相反，它只会在一个数据库事务中执行测试。因此，任何由测试用例添加到数据库的记录，如果不使用这个 Trait，可能仍然存在于数据库中。

如果你想使用迁移来完全重置数据库，可以使用这个 Trait `Illuminate\Foundation\Testing\DatabaseMigrations` 来替代。然而，`DatabaseMigrations` 这个 Trait 明显比 `RefreshDatabase` Trait 要慢。



<a name="model-factories"></a>
## 模型工厂

当我们测试的时候，可能需要在执行测试之前向数据库插入一些数据。Laravel 允许你使用 [模型工厂](/docs/laravel/10.x/eloquent-factories) 为每个 [Eloquent 模型](/docs/laravel/10.x/eloquent) 定义一组默认值，而不是在创建测试数据时手动指定每一列的值。

要学习有关创建和使用模型工厂来创建模型的更多信息，请参阅完整的 [模型工厂文档](/docs/laravel/10.x/eloquent-factories)。定义模型工厂后，你可以在测试中使用该工厂来创建模型：

    use App\Models\User;

    public function test_models_can_be_instantiated(): void
    {
        $user = User::factory()->create();

        // ...
    }

<a name="running-seeders"></a>
## 运行 seeders

如果你在功能测试时希望使用 [数据库 seeders](/docs/laravel/10.x/seeding) 来填充你的数据库， 你可以调用 `seed` 方法。 默认情况下，  `seed` 方法将会执行 `DatabaseSeeder`， 它将会执行你的所有其他 seeders。或者，你传递指定的 seeder 类名给 `seed` 方法：

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
         * 测试创建新订单。
         */
        public function test_orders_can_be_created(): void
        {
            // 运行 DatabaseSeeder...
            $this->seed();

            // 运行指定 seeder...
            $this->seed(OrderStatusSeeder::class);

            // ...

            // 运行指定的 seeders...
            $this->seed([
                OrderStatusSeeder::class,
                TransactionStatusSeeder::class,
                // ...
            ]);
        }
    }

或者通过 `RefreshDatabase` trait 在每次测试之前自动为数据库填充数据。你也可以通过在测试类上定义 `$seed` 属性来实现：

    <?php

    namespace Tests;

    use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

    abstract class TestCase extends BaseTestCase
    {
        use CreatesApplication;

        /**
         * Indicates whether the default seeder should run before each test.
         *
         * @var bool
         */
        protected $seed = true;
    }



当 `$seed` 属性为 `true` 时，这个测试将在每个使用 `RefreshDatabase` trait 的测试之前运行 `Database\Seeders\DatabaseSeeder` 类。但是，你可以通过在测试类上定义 `$seeder` 属性来指定要执行的 seeder：

    use Database\Seeders\OrderStatusSeeder;

    /**
     * 在测试前指定要运行的 seeder
     *
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

 `assertSoftDeleted` 方法断言给定的 Eloquent 模型已被「软删除」的记录：

    $this->assertSoftDeleted($user);
    
<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

`assertNotSoftDeleted` 方法断言给定的 Eloquent 模型没有被「软删除」的记录：

    $this->assertNotSoftDeleted($user);

<a name="assert-model-exists"></a>
#### assertModelExists

断言数据库中存在给定的模型：

    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);

<a name="assert-model-missing"></a>
#### assertModelMissing

断言数据库中不存在给定的模型：

    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

可以在测试开始时调用 `expectsDatabaseQueryCount` 方法，以指定你希望在测试期间运行的数据库查询总数。如果实际执行的查询数量与这个预期不完全匹配，那么测试将失败：

    $this->expectsDatabaseQueryCount(5);

    // Test...

