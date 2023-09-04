# 数据填充

- [简介](#introduction)
- [编写 Seeders](#writing-seeders)
    - [使用模型工厂](#using-model-factories)
    - [调用其他 Seeders](#calling-additional-seeders)
    - [禁用模型事件](#muting-model-events)
- [运行 Seeders](#running-seeders)

<a name="introduction"></a>
## 简介

Laravel 内置了一个可为你的数据库填充测试数据的数据填充类。所有的数据填充类都应该放在 `database/seeds` 目录下。Laravel 默认定义了一个 `DatabaseSeeder` 类。通过这个类，你可以用 `call` 方法来运行其他的 `seed` 类，从而控制数据填充的顺序。

> **注意**  
> 在数据库填充期间，[批量赋值保护](/docs/laravel/10.x/eloquentmd#mass-assignment)被自动禁用。

<a name="writing-seeders"></a>
## 编写 Seeders

运行 [Artisan 命令](/docs/laravel/10.x/artisan) `make:seeder` 可以生成 Seeder，生成的 seeders 都放在 `database/seeders` 目录下：

```shell
php artisan make:seeder UserSeeder
```

一个数据填充类默认只包含一个方法：`run` ，当执行 `db:seed` [Artisan命令](/docs/laravel/10.x/artisan) 时，被调用。在 `run` 方法中, 可以按需将数据插入数据库中。 也可以使用[查询构造器](/docs/laravel/10.x/queries)来手动插入数据，或者可以使用 [Eloquent 数据工厂](/docs/laravel/10.x/eloquent-factories)。

例如，在默认 `DatabaseSeeder` 类的 `run` 方法中添加一个数据库插入语句：

    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Str;

    class DatabaseSeeder extends Seeder
    {
        /**
         * 运行数据填充
         */
        public function run(): void
        {
            DB::table('users')->insert([
                'name' => Str::random(10),
                'email' => Str::random(10).'@gmail.com',
                'password' => Hash::make('password'),
            ]);
        }
    }

> **注意**  
> 可以在 `run` 方法的参数中键入你需要的任何依赖性,它们将自动通过 Laravel [服务容器](/docs/laravel/10.x/container)注入。



<a name="using-model-factories"></a>
### 使用模型工厂

当然，手动指定每个模型填充的属性是很麻烦的。因此可以使用 [Eloquent 数据工厂](/docs/laravel/10.x/eloquent-factories)来更方便地生成大量的数据库记录。首先，查看 [Eloquent 数据工厂](/docs/laravel/10.x/eloquent-factories)，了解如何定义工厂。

例如，创建50个用户，每个用户有一个相关的帖子：

    use App\Models\User;

    /**
     * 运行数据库迁移
     */
    public function run(): void
    {
        User::factory()
                ->count(50)
                ->hasPosts(1)
                ->create();
    }

<a name="calling-additional-seeders"></a>
### 调用其他 Seeders

在 `DatabaseSeeder` 类中，可以使用 `call` 方法来执行其他的填充类。使用 `call` 方法可以将数据库迁移分成多个文件，这样就不会出现单个数据填充类过大。`call` 方法接受一个由数据填充类组成的数组：

    /**
     * 运行数据库迁移
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PostSeeder::class,
            CommentSeeder::class,
        ]);
    }

<a name="muting-model-events"></a>
### 禁用模型事件

在运行时，你可能想阻止模型调用事件，可以使用 `WithoutModelEvents` 特性。使用 `WithoutModelEvents` trait 可确保不调用模型事件，即使通过 `call` 方法执行了额外的 seed 类：

    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Database\Console\Seeds\WithoutModelEvents;

    class DatabaseSeeder extends Seeder
    {
        use WithoutModelEvents;

        /**
         * 运行数据库迁移
         */
        public function run(): void
        {
            $this->call([
                UserSeeder::class,
            ]);
        }
    }

<a name="running-seeders"></a>
## 运行 Seeders

执行 `db:seed` Artisan 命令来为数据库填充数据。默认情况下，`db:seed` 命令会运行 `Database\Seeders\DatabaseSeeder` 类来调用其他数据填充类。当然，也可以使用 `--class` 选项来指定一个特定的填充类：

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```



你还可以使用 `migrate:fresh` 命令结合 `--seed` 选项，这将删除数据库中所有表并重新运行所有迁移。此命令对于完全重建数据库非常有用。 `--seeder` 选项可以用来指定要运行的填充文件：

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### 在生产环境中强制运行填充

一些填充操作可能会导致原有数据的更新或丢失。为了保护生产环境数据库的数据，在 `生产环境` 中运行填充命令前会进行确认。可以添加 `--force` 选项来强制运行填充命令：

```shell
php artisan db:seed --force
```

