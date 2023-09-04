
# 测试：入门

- [介绍](#introduction)
- [环境](#environment)
- [创建测试](#creating-tests)
- [运行测试](#running-tests)
    - [并行运行测试](#running-tests-in-parallel)
    - [测试覆盖率报告](#reporting-test-coverage)
    - [性能分析测试](#profiling-tests)

<a name="introduction"></a>
## 介绍

`Laravel` 在构建时考虑到了测试。实际上，对 `PHPUnit` 测试的支持是开箱即用的，并且已经为你的应用程序设置了一个 `phpunit.xml` 文件。 `Laravel`还附带了方便的帮助方法，允许你对应用程序进行富有表现力的测试。

默认情况下，你应用程序的`tests`目录下包含两个子目录：`Feature` 和 `Unit`。**单元测试**（`Unit`）是针对你的代码中非常少，而且相对独立的一部分代码来进行的测试。实际上，大部分单元测试都是针对单个方法进行的。在你的 `Unit` 测试目录中进行测试，不会启动你的 `Laravel` 应用程序，因此无法访问你的应用程序的数据库或其他框架服务。

**功能测试**（`Feature`）能测试你的大部分代码，包括多个对象如何相互交互，甚至是对 `JSON` 端点的完整 `HTTP` 请求。 **通常，你的大多数测试应该是功能测试。这些类型的测试可以最大程度地确保你的系统作为一个整体按预期运行。**

`Feature` 和 `Unit` 测试目录中都提供了一个 `ExampleTest.php` 文件。 安装新的 Laravel 应用程序后，执行 `vendor/bin/phpunit` 或 `php artisan test` 命令来运行你的测试。

<a name="environment"></a>
## 环境

运行测试时，由于 `phpunit.xml` 文件中定义了 [环境变量](/docs/laravel/10.x/configuration#environment-configuration) ，`Laravel` 会自动配置环境变量为 `testing`。`Laravel` 还会在测试时自动将会话和缓存配置到 `array` 驱动程序，这意味着在测试时不会持久化会话或缓存数据。



你可以根据需要自由定义其他测试环境配置值。 `testing` 环境变量可以在应用程序的 `phpunit.xml` 文件中配置，但请确保在运行测试之前使用 `config:clear` Artisan 命令清除配置缓存！

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 环境配置文件

此外，你可以在项目的根目录中创建一个 `.env.testing` 文件。 当运行 `PHPUnit` 测试或使用 `--env=testing` 选项执行 Artisan 命令时，将不会使用 `.env` 文件，而是使用此文件。

<a name="the-creates-application-trait"></a>
#### `CreatesApplication` Trait

Laravel 包含一个 `CreatesApplication` Trait，该`Trait`应用于应用程序的基类 `TestCase` 。 这个 `trait` 包含一个 `createApplication` 方法，它在运行测试之前引导 Laravel 应用程序。 重要的是，应将此 `trait` 保留在其原始位置，因为某些功能（例如 `Laravel` 的并行测试功能）依赖于它。

<a name="creating-tests"></a>
## 创建测试

要创建新的测试用例，请使用Artisan 命令： `make:test` 。 默认情况下，测试将放置在 `tests/Feature` 目录中：

```shell
php artisan make:test UserTest
```

如果想在 `tests/Unit` 目录中创建一个测试，你可以在执行 `make:test` 命令时使用 `--unit` 选项：

```shell
php artisan make:test UserTest --unit
```

如果想创建一个 [Pest PHP](https://pestphp.com) 测试, 你可以为 `make:test` 命令提供 `--pest` 选项：

```shell
php artisan make:test UserTest --pest
php artisan make:test UserTest --unit --pest
```

> **技巧**  
> 可以使用 [Stub 定制](/docs/laravel/10.x/artisan#stub-customization)来自定义测试。



生成测试后，你可以像通常使用 [PHPUnit](https://phpunit.de/) 那样定义测试方法。要运行测试，请从终端执行 `vendor/bin/phpunit`或 `php artisan test` 命令：

```
<?php

namespace Tests\\Unit;

use PHPUnit\\Framework\\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 基础测试样例
     *
     * @return void
     */
    public function test_basic_test()
    {
        $this->assertTrue(true);
    }
}

```

>注意：如果你在测试类中定义自己的 `setUp`  或 `tearDown`  方法，请务必在父类上调用各自的 `parent::setUp()`  或 `parent::tearDown()`  方法。

****运行测试****

正如前面提到的，编写测试后，可以使用 `phpunit`  命令来执行测试：
```shell
./vendor/bin/phpunit
```

除了 `phpunit`  命令，你还可以使用 `test`  Artisan 命令来运行你的测试。 Artisan 测试运行器提供了详细的测试报告，以简化开发和调试：
```shell
php artisan test
```
任何可以传递给 `phpunit`  命令的参数也可以传递给 Artisan `test`  命令：

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

****并行运行测试****

默认情况下，`Laravel`  和 `PHPUnit`  在执行测试时，是在单进程中按照先后顺序执行的。除此之外，通过多个进程同时运行测试，则可以大大减少运行测试所需的时间。首先，请确保你的应用程序已依赖于 `^5.3`  或更高版本的 `nunomaduro/collision`  依赖包。然后，在执行 `test`  Artisan 命令时，请加入 `--parallel`  选项：
```shell
php artisan test --parallel
```
默认情况下，`Laravel`  将创建与计算机上可用 CPU 内核数量一样多的进程。但是，你可以使用 `--processes`  选项来调整进程数：
```shell
php artisan test --parallel --processes=4
```

>注意：在并行测试时，某些 PHPUnit 选项（例如 `--do-not-cache-result` ）可能不可用。



### **并行测试和数据库**

`Laravel` 在执行并行测试时，自动为每个进程创建并迁移生成一个测试数据库。这些测试数据库将以每个进程唯一的进程令牌作为后缀。例如，如果你有两个并行的测试进程，`Laravel` 将创建并使用 `your_db_test_1` 和 `your_db_test_2` 测试数据库。

默认情况下，在多次调用 `test` Artisan 命令时，上一次的测试数据库依然存在，以便下一次的 `test` 命令可以再次使用它们。但是，你可以使用 `--recreate-databases` 选项重新创建它们：

```
php artisan test --parallel --recreate-databases

```

### **并行测试钩子**

有时，你可能需要为应用程序测试准备某些资源，以便可以将它们安全地用于多个测试进程。

使用 `ParallelTesting` 门面，你就可以在进程或测试用例的 `setUp` 和 `tearDown` 上指定要执行的代码。给定的闭包将分别接收包含进程令牌和当前测试用例的 `$token` 和 `$testCase` 变量：
```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 引导任何应用程序服务。
     *
     * @return void
     */
    public function boot()
    {
        ParallelTesting::setUpProcess(function ($token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function ($token, $testCase) {
            // ...
        });

        // 在创建测试数据库时执行……
        ParallelTesting::setUpTestDatabase(function ($database, $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function ($token, $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function ($token) {
            // ...
        });
    }
}
```

### **访问并行测试令牌**

如果你想从应用程序的测试代码中的任何其他位置访问当前的并行进程的 `token`，则可以使用 `token` 方法。该令牌（`token`）是单个测试进程的唯一字符串标识符，可用于在并行测试过程中划分资源。例如，`Laravel` 自动用此令牌值作为每个并行测试进程创建的测试数据库名的后缀：

```
$token = ParallelTesting::token();

```

### **报告测试覆盖率**

> 注意：这个功能需要 Xdebug 或 PCOV。

在运行测试时，你可能需要确定测试用例是否真的测到了某些程序代码，以及在运行测试时究竟使用了多少应用程序代码。要实现这一点，你可以在调用 `test` 命令时，增加一个 `--coverage` 选项：
```
php artisan test --coverage
```

### **最小覆盖率阈值限制**

你可以使用 `--min` 选项来为你的应用程序定义一个最小测试覆盖率阈值。如果不满足此阈值，测试套件将失败：

```
php artisan test --coverage --min=80.3

```

### 测试性能分析

Artisan 测试运行器还提供了一个方便的机制用于列出你的应用程序中最慢的测试。使用`--profile`选项调用测试命令，可以看到10个最慢的测试列表，这可以让你很容易地识别哪些测试可以被改进，以加快你的测试套件。

```
php artisan test --profile
```
