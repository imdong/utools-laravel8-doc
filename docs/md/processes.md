# 进程管理

- [介绍](#introduction)
- [调用过程](#invoking-processes)
    - [进程选项](#process-options)
    - [进程输出](#process-output)
- [异步进程](#asynchronous-processes)
    - [进程 ID 和信号](#process-ids-and-signals)
    - [异步进程输出](#asynchronous-process-output)
- [并行进程](#concurrent-processes)
    - [命名进程池中的进程](#naming-pool-processes)
    - [进程池进程 ID 和信号](#pool-process-ids-and-signals)
- [测试](#testing)
    - [伪造进程](#faking-processes)
    - [伪造指定进程](#faking-specific-processes)
    - [伪造进程序列](#faking-process-sequences)
    - [伪造异步进程的生命周期](#faking-asynchronous-process-lifecycles)
    - [可用的断言](#available-assertions)
    - [防止运行未被伪造的进程](#preventing-stray-processes)

<a name="introduction"></a>
## 介绍

Laravel 通过 [Symfony Process 组件](https://symfony.com/doc/current/components/process.html) 提供了一个小而美的 API，让你可以方便地从 Laravel 应用程序中调用外部进程。 Laravel 的进程管理功能专注于提供最常见的用例和提升开发人员体验。

<a name="invoking-processes"></a>
## 调用过程

在调用过程中，你可以使用 `进程管理` facade 提供的 `run` 和 `start` 方法。 `run` 方法将调用一个进程并等待进程执行完毕，而 `start` 方法用于异步进程执行。我们将在本文档中探究这两种方法。首先，让我们了解一下如何调用基本的同步进程并检查其结果：

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

当然，由 `run` 方法返回的 `Illuminate\Contracts\Process\ProcessResult` 实例提供了多种有用的方法，用于检查进程处理结果：

```php
$result = Process::run('ls -la');

$result->successful();
$result->failed();
$result->exitCode();
$result->output();
$result->errorOutput();
```

<a name="throwing-exceptions"></a>
#### 抛出异常

如果你有一个进程结果，并且希望在退出代码大于零（以此表明失败）的情况下抛出`Illuminate\Process\Exceptions\ProcessFailedException`的一个实例，你可以使用`throw` 和 `throwIf` 方法。 如果进程没有失败，将返回进程结果实例：

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### 进程选项

当然，你可能需要在调用进程之前自定义进程的行为。幸运的是，Laravel允许你调整各种进程特性，比如工作目录、超时和环境变量。

<a name="working-directory-path"></a>
#### 工作目录路径

你可以使用 `path` 方法指定进程的工作目录。如果不调用这个方法，进程将继承当前正在执行的PHP脚本的工作目录

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### 输入

你可以使用 `input` 方法通过进程的“标准输入”提供输入：

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### 超时

默认情况下，进程在执行超过60秒后将抛出`Illuminate\Process\Exceptions\ProcessTimedOutException` 实例。但是，你可以通过 `timeout` 方法自定义此行为：

```php
$result = Process::timeout(120)->run('bash import.sh');
```

或者，如果要完全禁用进程超时，你可以调用 `forever` 方法：

```php
$result = Process::forever()->run('bash import.sh');
```

` idleTimeout`  方法可用于指定进程在不返回任何输出的情况下最多运行的秒数：

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### 环境变量

可以通过 ` env ` 方法向进程提供环境变量。 调用的进程还将继承系统定义的所有环境变量：

```php
$result = Process::forever()
            ->env(['IMPORT_PATH' => __DIR__])
            ->run('bash import.sh');
```

如果你希望从调用的进程中删除继承的环境变量，则可以为该环境变量提供值为 false：

```php
$result = Process::forever()
            ->env(['LOAD_PATH' => false])
            ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### TTY 模式

`tty` 方法可以用于为你的进程启用 TTY 模式。 TTY 模式将进程的输入和输出连接到你的程序的输入和输出，允许你的进程作为一个进程打开编辑器（如 Vim 或 Nano）：

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### 进程输出

如前所述，进程输出可以使用进程结果的 ` output` （标准输出）和 ` errorOutput` （标准错误输出）方法访问：

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

但是，通过将闭包作为 ` run`  方法的第二个参数，输出也可以实时收集。闭包将接收两个参数：输出的“类型”（stdout 或 stderr）和输出字符串本身：

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

Laravel 还提供了 `seeInOutput` 和 `seeInErrorOutput`方法，这提供了一种方便的方式来确定进程输出中是否包含给定的字符串：

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### 禁用进程输出

如果你的进程写入了大量你不感兴趣的输出，则可以通过在构建进程时调用 `quietly` 方法来禁用输出检索。为此，请执行以下操作：

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="asynchronous-processes"></a>
## 异步进程

`start` 方法可以用来异步地调用进程，与之相对的是同步的 `run` 方法。使用 `start` 方法可以让进程在后台运行，而不会阻塞应用的其他任务。一旦进程被调用，你可以使用 `running` 方法来检查进程是否仍在运行：

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

你可以使用 `wait`方法来等待进程执行完毕，并检索进程的执行结果实例：

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### 进程 ID 和信号

`id` 方法可以用来检索正在运行进程的操作系统分配的进程 ID：

```php
$process = Process::start('bash import.sh');

return $process->id();
```

你可以使用 `signal` 方法向正在运行的进程发送“信号”。在 [PHP 文档中可以找到预定义的信号常量列表](https://www.php.net/manual/en/pcntl.constants.php):

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### 异步进程输出

当异步进程在运行时，你可以使用 `output` 和 `errorOutput` 方法访问其整个当前输出；但是，你可以使用`latestOutput` 和 `latestErrorOutput` 方法访问自上次检索输出以来的进程输出：

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

与 `run` 方法一样，也可以通过在 `start` 方法的第二个参数中传递一个闭包来从异步进程中实时收集输出。闭包将接收两个参数：输出类型（`stdout` 或 `stderr`）和输出字符串本身：

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

<a name="concurrent-processes"></a>
## 并行处理

Laravel 还可以轻松地管理一组并发的异步进程，使你能够轻松地同时执行多个任务。要开始，请调用 pool 方法，该方法接受一个闭包，该闭包接收 Illuminate\Process\Pool 实例。

在此闭包中，你可以定义属于该池的进程。一旦通过 `start` 方法启动了进程池，你可以通过 `running` 方法访问正在运行的进程 [集合](/docs/laravel/10.x/collections)：

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

可以看到，你可以通过 `wait` 方法等待所有池进程完成执行并解析它们的结果。`wait` 方法返回一个可访问进程结果实例的数组对象，通过其键可以访问池中每个进程的进程结果实例：

```php
$results = $pool->wait();

echo $results[0]->output();
```

或者，为方便起见，可以使用 `concurrently` 方法启动异步进程池并立即等待其结果。结合 PHP 的数组解构功能，这可以提供特别表达式的语法：

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### 命名进程池中的进程

通过数字键访问进程池结果不太具有表达性，因此 Laravel 允许你通过 `as` 方法为进程池中的每个进程分配字符串键。该键也将传递给提供给 `start` 方法的闭包，使你能够确定输出属于哪个进程：

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a name="pool-process-ids-and-signals"></a>
### 进程池进程 ID 和信号

由于进程池的 `running` 方法提供了一个包含池中所有已调用进程的集合，因此你可以轻松地访问基础池进程 ID：

```php
$processIds = $pool->running()->each->id();
```

为了方便起见，你可以在进程池上调用 `signal` 方法，向池中的每个进程发送信号：

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## 测试

许多 Laravel 服务都提供功能，以帮助你轻松、有表达力地编写测试，Laravel 的进程服务也不例外。`Process` 门面的 `fake` 方法允许你指示 Laravel 在调用进程时返回存根/伪造结果。

<a name="faking-processes"></a>
### 伪造进程

在探索 Laravel 的伪造进程能力时，让我们想象一下调用进程的路由：

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

在测试这个路由时，我们可以通过在 `Process` 门面上调用无参数的 `fake` 方法，让 Laravel 返回一个伪造的成功进程结果。此外，我们甚至可以断言某个进程“已运行”：

```php
<?php

namespace Tests\Feature;

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/');

        // 简单的流程断言...
        Process::assertRan('bash import.sh');

        // 或者，检查流程配置...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

如前所述，在 `Process` 门面上调用 `fake` 方法将指示 Laravel 始终返回一个没有输出的成功进程结果。但是，你可以使用 `Process` 门面的 `result` 方法轻松指定伪造进程的输出和退出码：

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a name="faking-specific-processes"></a>
### 伪造指定进程

在你测试的过程中，如果要伪造不同的进程执行结果，你可以通过传递一个数组给 `fake` 方法来实现。

数组的键应该表示你想伪造的命令模式及其相关结果。星号 `*` 字符可用作通配符，任何未被伪造的进程命令将会被实际执行。你可以使用 `Process` Facade的 `result` 方法为这些命令构建 stub/fake 结果：

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

如果不需要自定义伪造进程的退出码或错误输出，你可以更方便地将伪造进程结果指定为简单字符串：

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### 伪造进程序列

如果你测试的代码调用了多个相同命令的进程，你可能希望为每个进程调用分配不同的伪造进程结果。你可以使用 `Process` Facade 的 `sequence`方法来实现这一点：

```php
Process::fake([
    'ls *' => Process::sequence()
                ->push(Process::result('First invocation'))
                ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### 伪造异步进程的生命周期

到目前为止，我们主要讨论了伪造使用 `run` 方法同步调用的进程。但是，如果你正在尝试测试与通过 `start` 调用的异步进程交互的代码，则可能需要更复杂的方法来描述伪造进程。

例如，让我们想象以下使用异步进程交互的路由：

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

为了正确地伪造这个进程，我们需要能够描述 `running` 方法应返回 `true` 的次数。此外，我们可能想要指定多行顺序返回的输出。为了实现这一点，我们可以使用 `Process` Facade 的 `describe` 方法：

```php
Process::fake([
    'bash import.sh' => Process::describe()
            ->output('First line of standard output')
            ->errorOutput('First line of error output')
            ->output('Second line of standard output')
            ->exitCode(0)
            ->iterations(3),
]);
```

让我们深入研究上面的例子。使用 `output` 和 `errorOutput` 方法，我们可以指定顺序返回的多行输出。`exitCode` 方法可用于指定伪造进程的最终退出码。最后，`iterations` 方法可用于指定 `running` 方法应返回 `true` 的次数。

<a name="available-assertions"></a>
### 可用的断言

 [如前所述](#faking-processes)，Laravel 为你的功能测试提供了几个进程断言。我们将在下面讨论每个断言。

<a name="assert-process-ran"></a>
#### assertRan

断言已经执行了给定的进程：

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

`assertRan` 方法还接受一个闭包，该闭包将接收一个进程实例和一个进程结果，使你可以检查进程的配置选项。如果此闭包返回 `true`，则断言将“通过”：

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

传递给 `assertRan` 闭包的 `$process` 是 `Illuminate\Process\PendingProcess` 的实例，而 $result 是 `Illuminate\Contracts\Process\ProcessResult` 的实例。

<a name="assert-process-didnt-run"></a>
#### assertDidntRun 

断言给定的进程没有被调用：

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

与 `assertRan` 方法类似，`assertDidntRun` 方法也接受一个闭包，该闭包将接收一个进程实例和一个进程结果，允许你检查进程的配置选项。如果此闭包返回 `true`，则断言将“失败”：

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

断言给定的进程被调用了指定的次数：

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

`assertRanTimes` 方法也接受一个闭包，该闭包将接收一个进程实例和一个进程结果，允许你检查进程的配置选项。如果此闭包返回 `true` 并且进程被调用了指定的次数，则断言将“通过”：

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### 防止运行未被伪造的进程

如果你想确保在单个测试或完整的测试套件中，所有被调用的进程都已经被伪造，你可以调用`preventStrayProcesses` 方法。调用此方法后，任何没有相应的伪造结果的进程都将引发异常，而不是启动实际进程：

    use Illuminate\Support\Facades\Process;

    Process::preventStrayProcesses();

    Process::fake([
        'ls *' => 'Test output...',
    ]);

    // 返回假响应...
    Process::run('ls -la');

    // 抛出一个异常...
    Process::run('bash import.sh');

