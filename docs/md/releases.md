# 发行说明

- [版本控制方案](/docs/laravel/10.x/releases/#versioning-scheme)

- [支持政策](/docs/laravel/10.x/releases/#support-policy)
测试
- [Laravel 10](/docs/laravel/10.x/releases/#laravel-10)

<a name="versioning-scheme"></a>

## 版本控制方案

Laravel 及其其他第一方软件包遵循 [语义化版本控制](https://semver.org/)。主要框架版本释出是每年 (~Q1)，而较小和补丁版本则可能每周释出一次。较小和补丁版本决不能包含破坏性更改。

当从你的应用程序或软件包引用 Laravel 框架或其组件时，应始终使用类似 `^10.0` 的版本约束，因为 Laravel 的主要版本包含破坏性更改。但是，我们始终努力确保你可以在一天或更短时间内更新到新的主要版本。

<a  name="named-arguments"></a>

#### 命名参数

[命名参数](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments) 未被 Laravel 的向后兼容性指导方针所覆盖。我们可能会在必要时重命名函数参数，以改进 Laravel 代码库。因此，当调用 Laravel 方法时使用命名参数应该谨慎进行，并且要知道参数名称可能会在未来更改。

<a  name="support-policy"></a>

## 支持政策

对于所有 Laravel 版本，修复错误将提供 18 个月支持，而安全修复将提供 2 年支持。对于所有其他库，包括 Lumen，在更新最新的主要发布版本之前只提供 bug 修复。此外，请查看 [Laravel 支持的数据库版本](/docs/laravel/10.x/databasemd/14882#e05dce)。

| 版本 | PHP (\*) | 发布日期 | Bug 修复截止日期 | 安全修复截止日期 |
| ---- | --------- | ------------------ | ------------------ | ------------------ |
| 8 | 7.3 - 8.1 | 2020 年 9 月 8 日 | 2022 年 7 月 26 日 | 2023 年 1 月 24 日 |
| 9 | 8.0 - 8.2 | 2022 年 2 月 8 日 | 2023 年 8 月 8 日 | 2024 年 2 月 6 日 |
| 10 | 8.1 - 8.2 | 2023 年 2 月 14 日 | 2024 年 8 月 6 日 | 2025 年 2 月 4 日 |
| 11 | 8.2 | 2024 年 Q1 | 2025 年 8 月 5 日 | 2026 年 2 月 3 日 |

(\*) 支持的 PHP 版本

<a name="laravel-10"></a>

## Laravel 10

正如你可能已经知道的那样，Laravel 在发布 Laravel 8 后转向每年发布一次。之前，每 6 个月发布一个主要版本。这种转变旨在减轻社区的维护负担，并挑战我们的开发团队在不引入破坏性变化的情况下发布令人惊叹、功能强大的新功能。因此，我们为 Laravel 9 提供了许多强大的功能，而不会破坏向后兼容性。

因此，这种致力于在当前发布期间发布出色新功能的承诺可能会导致未来的「主要」版本主要用于诸如升级上游依赖项之类的「维护」任务，这些可以在这些发布说明中看到。

Laravel 10 继续在 Laravel 9.x 中所做的改进，通过向所有应用程序骨架方法和所有存根文件引入参数和返回类型，以及向外部进程启动和交互引入了一种新的开发人员友好的抽象层。此外，引入了 Laravel Pennant，为管理你的应用程序的「特性标志」提供了一种奇妙的方法。

<a name="php-8"></a>

### PHP 8.1

Laravel 10.x 要求至少使用 PHP 版本 8.1。

<a  name="types"></a>

### Types

_应用程序骨架和存根的类型提示由 [Nuno Maduro](https://github.com/nunomaduro) 提供。_

在最初发布时，Laravel 利用了 PHP 当时提供的所有类型提示特性。然而，在随后的几年中，PHP 添加了许多新的功能，包括额外的基本类型提示、返回类型和联合类型。

Laravel 10.x 彻底更新了应用程序骨架和框架使用的所有存根，以向所有方法签名引入参数和返回类型。此外，已删除冗余的 「doc block」 类型提示信息。

这个更改完全向后兼容现有应用程序。因此，没有这些类型提示的现有应用程序将继续正常运行。

<a name="laravel-pennant"></a>

### Laravel Pennant

_Laravel Pennant 由 [Tim MacDonald](https://github.com/timacdonald) 贡献。_

发布了一个新的第一方软件包，Laravel Pennant。Laravel Pennant 提供了一种轻量级、简洁的方法来管理应用程序的特性标志。Pennant 出厂时包括一个内存中的 `array` 驱动程序和一个 `database` 驱动程序，用于持久化特性存储。

可以通过 `Feature::define` 方法轻松地定义特性：

```
use Laravel\Pennant\Feature;

use Illuminate\Support\Lottery;

Feature::define('new-onboarding-flow', function () {

return Lottery::odds(1, 10);

});

```

定义特性后，你可以轻松地确定当前用户是否有访问给定特性的权限：

```
if (Feature::active('new-onboarding-flow')) {

// ...

}

```

当然，为了方便起见，Blade 指令也可用：

```
@feature('new-onboarding-flow')

<div>

<!-- ... -->

</div>

@endfeature

```

Pennant 提供了各种更高级的特性和 API。有关更多信息，请参阅 [详细的 Pennant 文档](/docs/laravel/10.x/pennantmd/14911)。

<a name="process"></a>

### 进程交互

_进程抽象层由 [Nuno Maduro](https://github.com/nunomaduro) 和 [Taylor Otwell](https://github.com/taylorotwell) 贡献。_

Laravel 10.x 引入了一个美丽的抽象层，用于通过新的 `Process` 门面启动和与外部进程交互：

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return  $result->output();

```

甚至可以在池中启动进程，允许方便地执行和管理并发进程：

```php
use Illuminate\Process\Pool;

use Illuminate\Support\Facades\Process;

[$first, $second, $third] =  Process::concurrently(function (Pool  $pool) {

$pool->command('cat first.txt');

$pool->command('cat second.txt');

$pool->command('cat third.txt');

});

return  $first->output();

```

这一变化完全向后兼容现有的应用程序。因此，没有这些类型提示的现有应用程序将继续正常运行。

此外，进程可能会被虚构，以方便测试：

```php
Process::fake();

// ...

Process::assertRan('ls -la');

```

有关与进程交互的更多信息，请参阅 [详细的进程管理文档](/docs/laravel/10.x/processesmd/14872)。

<a name="test-profiling"></a>

### 测试分析

_测试分析由 [Nuno Maduro](https://github.com/nunomaduro) 贡献。_

Artisan 的 `test` 命令现在具有一个新的 `--profile` 选项，使你可以轻松识别应用程序中最慢的测试：

```shell
php artisan  test  --profile

```

为了方便起见，最慢的测试将直接显示在 CLI 输出中：

<p align="center">

<img width="100%" src="https://user-images.githubusercontent.com/5457236/217328439-d8d983ec-d0fc-4cde-93d9-ae5bccf5df14.png"/>

</p>

<a  name="pest-scaffolding"></a>

### Pest 脚手架

现在，新的 Laravel 项目可以默认使用 Pest 测试脚手架。要启用此功能，请在通过 Laravel 安装程序创建新应用程序时提供 `--pest` 标志：

```shell
laravel new  example-application  --pest

```

<a name="generator-cli-prompts"></a>

### 生成器 CLI 提示

_生成器 CLI 提示由 [Jess Archer](https://github.com/jessarcher) 贡献。_

为了改进框架的开发体验，Laravel 内置的所有 make 命令现在不需要任何输入。如果调用命令时没有输入，你将被提示提供所需的参数：

```shell
php artisan  make:controller

```

<a name="horizon-telescope-facelift"></a>

### Horizon / Telescope 界面更新

[Horizon](https://learnku.com/docs/laravel/10.x/horizonmd/14906) 和 [Telescope](https://learnku.com/docs/laravel/10.x/telescopemd/14917) 已经通过改进版式、间距和设计更新为新的现代外观：

<img src="https://laravel.com/img/docs/horizon-example.png">