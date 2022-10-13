# 数据填充

- [简介](#introduction)
- [编写 Seeders](#writing-seeders)
    - [使用模型工厂](#using-model-factories)
    - [调用其他 Seeders](#calling-additional-seeders)
    - [禁用模型事件](#muting-model-events)
- [运行 Seeders](#running-seeders)

<a name="introduction"></a>
## 简介

Laravel 内置了一个可为你的数据库填充测试数据的填充类。所有的填充类都放在  `database/seeds` 目录下。Laravel 默认定义了一个 `DatabaseSeeder` 类。通过这个类，你可以用 `call` 方法来运行其他的 seed 类，从而控制数据填充的顺序。

> 技巧：使用数据填充时会自动禁用 [批量赋值保护](/docs/laravel/9.x/eloquent#mass-assignment)。

<a name="writing-seeders"></a>
## 编写 Seeders

运行 [Artisan 命令](/docs/laravel/9.x/artisan) `make:seeder` 可以生成 Seeder，框架生成的 seeders 都放在 `database/seeders` 目录下：

```shell
php artisan make:seeder UserSeeder
```

Seeder 类只包含一个默认方法：`run`。这个方法会在执行 `db:seed` 这个 [Artisan command](/docs/laravel/9.x/artisan) 时被调用。在 `run` 方法里，你可以按需在数据库中插入数据。你也可以用 [构造查询器](/docs/laravel/9.x/queries) 或 [Eloquent 模型工厂](/docs/laravel/9.x/database-testing#defining-model-factories) 来手动插入数据。

如下所示, 在默认的 `DatabaseSeeder` 类中的 `run` 方法中添加一条数据插入语句：

    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Str;

    class DatabaseSeeder extends Seeder
    {
        /**
         * 执行数据填充
         *
         * @return void
         */
        public function run()
        {
            DB::table('users')->insert([
                'name' => Str::random(10),
                'email' => Str::random(10).'@gmail.com',
                'password' => Hash::make('password'),
            ]);
        }
    }

> 技巧：你在 `run` 方法签名中可以用类型来约束你需要的依赖。它们会被 Laravel [服务容器](/docs/laravel/9.x/container) 自动解析。



<a name="using-model-factories"></a>
### 使用模型工厂

当然，手动为每个模型填充指定属性很麻烦，你可以使用 [模型工厂](/docs/laravel/9.x/database-testing#defining-model-factories) 轻松地生成大量数据库数据。首先，阅读 [模型工厂文档](/docs/laravel/9.x/database-testing#defining-model-factories) 来学习如何定义工厂文件。

例如，创建 50 个用户并为每个用户创建关联：

    use App\Models\User;

    /**
     * 执行数据填充
     *
     * @return void
     */
    public function run()
    {
        User::factory()
                ->count(50)
                ->hasPosts(1)
                ->create();
    }

<a name="calling-additional-seeders"></a>
### 调用其他 Seeders

在 `DatabaseSeeder` 类中，你可以使用 `call` 方法来运行其他的 seed 类。使用 `call` 方法可以将数据填充拆分成多个文件，这样就不会使单个 seeder 文件变得非常大。 只需向 `call` 方法中传递要运行的 seeder 类名称即可：

    /**
     * 执行数据填充
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            PostSeeder::class,
            CommentSeeder::class,
        ]);
    }

<a name="muting-model-events"></a>
### 禁用模型事件

在运行 Seeders 时，你可能希望阻止模型调用事件。你可以使用 `WithoutModelEvents` 特征来实现这一点。使用 `WithoutModelEvents` trait 可确保不调用模型事件，即使通过 `call` 方法执行了额外的 seed 类：

    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Database\Console\Seeds\WithoutModelEvents;

    class DatabaseSeeder extends Seeder
    {
        use WithoutModelEvents;

        /**
     * 执行数据填充
         *
         * @return void
         */
        public function run()
        {
            $this->call([
                UserSeeder::class,
            ]);
        }
    }

<a name="running-seeders"></a>
## 运行 Seeders

你可以使用 Artisan 命令 `db:seed` 来填充数据库。默认情况下， `db:seed` 命令将运行 `Database\Seeders\DatabaseSeeder` 类，这个类又可以调用其他 seed 类。不过，你也可以使用 `--class` 选项来指定一个特定的 seeder 类：

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```



你还可以使用 `migrate:fresh` 命令结合 `--seed` 选项，这将删除数据库中所有表并重新运行所有迁移。此命令对于完全重建数据库非常有用：

```shell
php artisan migrate:fresh --seed
```

<a name="forcing-seeding-production"></a>
#### 在生产环境中强制运行填充

一些填充操作可能会导致原有数据的更新或丢失。为了保护生产环境数据库的数据，在 `生产环境` 中运行填充命令前会进行确认。可以添加 `--force` 选项来强制运行填充命令：

```shell
php artisan db:seed --force
```

