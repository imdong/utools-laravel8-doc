# Artisan 命令行

- [简介](#introduction)
  - [Tinker 命令 (REPL)](#tinker)
- [编写命令](#writing-commands)
    - [生成命令](#generating-commands)
    - [命令结构](#command-structure)
    - [闭包命令](#closure-commands)
- [定义输入期望](#defining-input-expectations)
    - [参数](#arguments)
    - [选项](#options)
    - [输入数组](#input-arrays)
    - [输入说明](#input-descriptions)
- [I/O 命令](#command-io)
    - [检索输入](#retrieving-input)
    - [交互式输入](#prompting-for-input)
    - [编写输出](#writing-output)
- [注册命令](#registering-commands)
- [在程序中执行命令](#programmatically-executing-commands)
    - [从其他命令调用命令](#calling-commands-from-other-commands)
- [信号处理](#signal-handling)
- [Stub 定制](#stub-customization)
- [响应](#events)

<a name="introduction"></a>
## 简介

Artisan 是 Laravel 附带的命令行接口。Artisan 以 `artisan` 脚本的形式存在于应用的根目录，并提供了许多有用的命令，这些命令可以在构建应用时为你提供帮助。你可以通过 `list` 命令查看所有可用的 Artisan 命令：

```shell
php artisan list
```

每个命令都包含了「help」界面，它会显示和概述命令的可用参数及选项。只需要在命令前加上 `help` 即可查看命令帮助界面：

```shel
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

如果你将 [Laravel Sail](/docs/laravel/9.x/sail) 用作本地开发环境，记得使用 `sail` 命令行来调用 Artisan 命令。Sail 将在应用的 Docker 容器中执行 Artisan 命令：

```shell
./sail artisan list
```

<a name="tinker"></a>
### Tinker 命令 (REPL)

Laravel Tinker 是为 Laravel 提供的强大的 REPL（交互式解释器），由 [PsySH](https://github.com/bobthecow/psysh) 提供支持。

<a name="installation"></a>
#### 安装

所有 Laravel 应用都默认包含了 Tinker。如果你之前已经将 Tinker 从应用中删除，可以使用 Composer 进行手动安装：

```shell
composer require laravel/tinker
```

> 技巧：正在寻找一个能与 Laravel 交互的图形用户界面吗？试试 [Tinkerwell](https://tinkerwell.app)!

<a name="usage"></a>
#### 用法

Tinker 让你可以在命令行与你的整个 Laravel 应用进行交互。包括但不限于 Eloquent 模型、任务、事件等。通过运行 Artisan 命令 `tinker` 进入 Tinker 环境。

```shell
php artisan tinker
```

你可以通过 `vendor:publish` 命令发布 Tinker 配置文件：

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> 注意：`dispatch`辅助函数和`Dispatchable`类上的`dispatch`方法都依赖于垃圾回收来将任务放置到队列中。因此，当你使用 Tinker 时，请使用 `Bus::dispatch` 或 `Queue::push` 来分发任务。

<a name="command-allow-list"></a>
#### 命令白名单

Tinker 采用白名单来确定允许哪些 Artisan 命令可以在 shell 中运行。默认情况下，你可以运行 `clear-compiled`、`down`、`env`、`inspire`、`migrate`、`optimize` 和 `up` 命令。如果你想将命令添加到白名单，请将该命令添加到 `tinker.php` 配置文件的 `commands` 数组中：

    'commands' => [
        // App\Console\Commands\ExampleCommand::class,
    ],

<a name="classes-that-should-not-be-aliased"></a>
#### 别名黑名单

大多数情况下，Tinker 会在你引入类时自动为其添加别名。然而，你可能不希望为某些类添加别名。你可以在 `tinker.php` 配置文件中的 `dont_alias` 数组里列举这些类来完成此操作：

    'dont_alias' => [
        App\Models\User::class,
    ],

<a name="writing-commands"></a>
## 编写命令

除 Artisan 提供的命令外，你也可以编写自己的自定义命令。命令在多数情况下位于 `app/Console/Commands` 目录中。不过，只要你的命令可以由 Composer 加载，你就可以自由选择自己的存储位置。

<a name="generating-commands"></a>
### 生成命令

要创建新命令，可以使用 `make:command` Artisan 命令。该命令将在 `app/Console/Commands` 目录中创建一个新的命令类。如果你的应用程序中不存在此目录，请不要担心，它将在你第一次运行 `make:command` 命令时自动创建：

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 命令结构

生成命令后，应为该类的 `signature` 和 `description` 属性定义适当的值。当在 `list` 屏幕上显示命令时，将使用这些属性。 `signature` 属性还允许你定义 [命令的输入期望值](#defining-input-expectations)。 `handle` 执行命令时将调用该方法。你可以将命令逻辑放在此方法中。

让我们看一个示例命令。请注意，我们能够通过命令的 `handle` 方法请求我们需要的任何依赖项。Laravel [服务容器](/docs/laravel/9.x/container) 将自动注入此方法签名中带有类型提示的所有依赖项：

    <?php

    namespace App\Console\Commands;

    use App\Models\User;
    use App\Support\DripEmailer;
    use Illuminate\Console\Command;

    class SendEmails extends Command
    {
        /**
         * 命令名称及签名.
         *
         * @var string
         */
        protected $signature = 'mail:send {user}';

        /**
         * 命令描述.
         *
         * @var string
         */
        protected $description = 'Send a marketing email to a user';

        /**
         * 创建命令.
         *
         * @return void
         */
        public function __construct()
        {
            parent::__construct();
        }

        /**
         * 执行命令.
         *
         * @param  \App\Support\DripEmailer  $drip
         * @return mixed
         */
        public function handle(DripEmailer $drip)
        {
            $drip->send(User::find($this->argument('user')));
        }
    }

> 技巧：为了更好地复用代码，请尽量让你的命令类保持轻量并且能够延迟到应用服务中完成。在上面的示例中，我们注入了一个服务类来进行发送电子邮件的「繁重工作」。

<a name="closure-commands"></a>
### 闭包命令

基于闭包的命令为将控制台命令定义为类提供了一种替代方法。与路由闭包可以替代控制器一样，可以将命令闭包视为命令类的替代。在 `app/Console/Kernel.php` 文件的  `commands` 方法中，Laravel 加载 `routes/console.php` 文件：

    /**
     * 注册闭包命令
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }

尽管该文件没有定义 HTTP 路由，但它定义了进入应用程序的基于控制台的入口 (routes) 。在这个文件中，你可以使用 `Artisan::command` 方法定义所有的闭包路由。 `command` 方法接受两个参数： [命令名称](#defining-input-expectations) 和可调用的闭包，闭包接收命令的参数和选项：

    Artisan::command('mail:send {user}', function ($user) {
        $this->info("Sending email to: {$user}!");
    });

该闭包绑定到基础命令实例，因此你可以完全访问通常可以在完整命令类上访问的所有辅助方法。

<a name="type-hinting-dependencies"></a>
#### 类型约束依赖

除了接受命令参数及选项外，命令闭包也可以使用类型约束从 [服务容器](/docs/laravel/9.x/container) 中解析其他的依赖关系：

    use App\Models\User;
    use App\Support\DripEmailer;

    Artisan::command('mail:send {user}', function (DripEmailer $drip, $user) {
        $drip->send(User::find($user));
    });

<a name="closure-command-descriptions"></a>
#### 闭包命令说明

在定义基于闭包的命令时，可以使用 `purpose` 方法向命令添加描述。当你运行 `php artisan list` 或 `php artisan help` 命令时，将显示以下描述：

    Artisan::command('mail:send {user}', function ($user) {
        // ...
    })->purpose('Send a marketing email to a user');

<a name="defining-input-expectations"></a>
## 定义输入期望

在编写控制台命令时，通常是通过参数和选项来收集用户输入的。Laravel 让你可以非常方便地在 `signature` 属性中定义你期望用户输入的内容。`signature` 属性允许使用单一且可读性高，类似路由的语法来定义命令的名称、参数和选项。

<a name="arguments"></a>
### 参数

用户提供的所有参数和选项都用花括号括起来。在下面的示例中，该命令定义了一个必需的参数 `user`:

    /**
     * 命令的名称及其标识
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

你亦可创建可选参数或为参数定义默认值：

    // 可选参数...
    'mail:send {user?}'

    // 带有默认值的可选参数...
    'mail:send {user=foo}'

<a name="options"></a>
### 选项

选项类似于参数，是用户输入的另一种形式。在命令行中指定选项的时候，它们以两个短横线 (--) 作为前缀。这有两种类型的选项：接收值和不接受值。不接收值的选项就像是一个布尔「开关」。我们来看一下这种类型的选项的示例：

    /**
     * 命令的名称及其标识
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue}';

在这个例子中，在调用 Artisan 命令时可以指定 `--queue` 的开关。如果传递了 `--queue` 选项，该选项的值将会是 `true`。否则，其值将会是 `false`：

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 带值的选项

接下来，我们来看一下需要带值的选项。如果用户需要为一个选项指定一个值，则需要在选项名称的末尾追加一个 `=` 号：

    /**
     * 命令名称及标识
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue=}';

在这个例子中，用户可以像如下所时的方式传递该选项的值。如果在调用命令时未指定该选项，则其值为 `null`：

```shell
php artisan mail:send 1 --queue=default
```

你还可以在选项名称后指定其默认值。如果用户没有传递值给选项，将使用默认的值：

    'mail:send {user} {--queue=default}'

<a name="option-shortcuts"></a>
#### 选项简写

要在定义选项的时候指定一个简写，你可以在选项名前面使用 `|` 隔符将选项名称与其简写分隔开来：

    'mail:send {user} {--Q|queue}'

在终端上调用命令时，选项简写的前缀只用一个连字符：

```shell
php artisan mail:send 1 -Q
```

<a name="input-arrays"></a>
### 输入数组

如果你想要接收数组数组的参数或者选项，你可以使用 `*` 字符。首先，让我们看一下指定了一个数组参数的例子：

    'mail:send {user*}'

当调用这个方法的时候，`user` 参数的输入参数将按顺序传递给命令。例如，以下命令将会设置 `user` 的值为 `foo` 和 `bar` ：

```shell
php artisan mail:send foo bar
```

 `*` 字符可以与可选的参数结合使用，允许你定义零个或多个参数实例：

    'mail:send {user?*}'

<a name="option-arrays"></a>
#### 选项数组

当定义需要多个输入值的选项时，传递给命令的每个选项值都应以选项名称作为前缀：

    'mail:send {user} {--id=*}'

这样的命令可以通过传递多个 `--id` 参数来调用：

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 输入说明

你可以通过使用冒号将参数名称与描述分隔来为输入参数和选项指定说明。如果你需要一些额外的空间来定义命令，可以将它自由的定义在多行中：

    /**
     * 控制台命令的名称和签名。
     *
     * @var string
     */
    protected $signature = 'mail:send
                            {user : The ID of the user}
                            {--queue : Whether the job should be queued}';

<a name="command-io"></a>
## 命令 I/O

<a name="retrieving-input"></a>
### 检索输入

当命令在执行时，你可能需要访问命令所接受的参数和选项的值。为此，你可以使用 `argument` 和 `option` 方法。如果选项或参数不存在，将会返回`null`：

    /**
     * 执行控制台命令。
     *
     * @return int
     */
    public function handle()
    {
        $userId = $this->argument('user');

        //
    }

如果你需要检索所有的参数做为 `array`，请调用 `arguments` 方法：

    $arguments = $this->arguments();

选项的检索与参数一样容易，使用 `option` 方法即可。如果要检索所有的选项做为数组，请调用 `options` 方法：

    // 检索一个指定的选项...
    $queueName = $this->option('queue');

    // 检索所有选项做为数组...
    $options = $this->options();

<a name="prompting-for-input"></a>
### 交互式输入

除了显示输出以外，你还可以要求用户在执行命令期间提供输入。`ask` 方法将询问用户指定的问题来接收用户输入，然后用户输入将会传到你的命令中：

    /**
     * 执行命令指令
     *
     * @return mixed
     */
    public function handle()
    {
        $name = $this->ask('What is your name?');
    }

`secret` 方法与 `ask` 相似，区别在于用户的输入将不可见。这个方法在需要输入一些诸如密码之类的敏感信息时是非常有用的：

    $password = $this->secret('What is the password?');

<a name="asking-for-confirmation"></a>
#### 请求确认

如果你需要请求用户进行一个简单的确认，可以使用 `confirm` 方法来实现。默认情况下，这个方法会返回 `false`。当然，如果用户输入 `y` 或 `yes`，这个方法将会返回 `true`。

    if ($this->confirm('Do you wish to continue?')) {
        //
    }

如有必要，你可以通过将 `true` 作为第二个参数传递给 `confirm` 方法，这样就可以在默认情况下返回 `true`：

    if ($this->confirm('Do you wish to continue?', true)) {
        //
    }

<a name="auto-completion"></a>
#### 自动补全

`anticipate` 方法可用于为可能的选项提供自动补全功能。用户依然可以忽略自动补全的提示，进行任意回答：

    $name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);

或者，你可以将一个闭包作为第二个参数传递给 `anticipate` 方法。每当用户键入字符时，闭包函数都会被调用。闭包函数应该接受一个包含用户输入的字符串形式的参数，并返回一个可供自动补全的选项的数组：

    $name = $this->anticipate('What is your address?', function ($input) {
        // 返回自动完成配置...
    });

<a name="multiple-choice-questions"></a>
#### 多选择问题

当询问问题时，如果你需要给用户一个预定义的选择，你可以使用 `choice` 方法。如果没有选项被选择，你可以设置数组索引的默认值去返回，通过这个方法的第三个参数去传入索引：

    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex
    );

此外， `choice` 方法接受第四和第五可选参数，用于确定选择有效响应的最大尝试次数以及是否允许多次选择：

    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex,
        $maxAttempts = null,
        $allowMultipleSelections = false
    );

<a name="writing-output"></a>
### 文字输出

你可以使用 `line`，`info`，`comment`，`question` 和 `error` 方法，发送输出到控制台。这些方法中的每一个都会使用合适的 ANSI 颜色以展示不同的用途。例如，我们要为用户展示一些常规信息。通常，`info` 将会以绿色文本在控制台展示。

    /**
     * 执行控制台命令
     *
     * @return mixed
     */
    public function handle()
    {
        // ...

        $this->info('The command was successful!');
    }

输出错误信息，使用 `error` 方法。错误信息通常使用红色字体显示：

    $this->error('Something went wrong!');

你可以使用 `line` 方法输出无色文本：

    $this->line('Display this on the screen');

你可以使用 `newLine` 方法输出空白行：

    // 输出单行空白...
    $this->newLine();

    // 输出三行空白...
    $this->newLine(3);

<a name="tables"></a>
#### 表格

`table` 方法可以轻松正确地格式化多行/多列数据。你需要做的就是提供表的列名和数据，Laravel 会自动为你计算合适的表格宽度和高度：

    use App\Models\User;

    $this->table(
        ['Name', 'Email'],
        User::all(['name', 'email'])->toArray()
    );

<a name="progress-bars"></a>
#### 进度条

对于长时间运行的任务，显示一个进度条来告知用户任务的完成情况会很有帮助。使用 `withProgressBar` 方法，Laravel 将显示一个进度条，并在给定的可迭代值上推进每次迭代的进度：

    use App\Models\User;

    $users = $this->withProgressBar(User::all(), function ($user) {
        $this->performTask($user);
    });

有时，你可能需要更多手动控制进度条的前进方式。首先，定义流程将迭代的步骤总数。然后，在处理完每个项目后推进进度条：

    $users = App\Models\User::all();

    $bar = $this->output->createProgressBar(count($users));

    $bar->start();

    foreach ($users as $user) {
        $this->performTask($user);

        $bar->advance();
    }

    $bar->finish();

> 技巧：有关更多高级选项，请查看 [Symfony 进度条组件文档](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a name="registering-commands"></a>
## 注册命令

你的所有控制台命令都在你的应用程序的 `App\Console\Kernel` 类中注册，这是你的应用程序的「控制台内核」。在此类的 `commands` 方法中，你将看到对内核的 `load` 方法的调用。 `load` 方法将扫描 `app/Console/Commands` 目录并自动将其中包含的每个命令注册到 Artisan。你甚至可以自由地调用 `load` 方法来扫描其他目录以查找 Artisan 命令：

    /**
     * 注册应用程序的命令。
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        $this->load(__DIR__.'/../Domain/Orders/Commands');

        // ...
    }

如有必要，你可以通过将命令的类名添加到 `App\Console\Kernel` 类中的 `$commands` 属性来手动注册命令。如果你的内核上尚未定义此属性，则应手动定义它。当 Artisan 启动时，此属性中列出的所有命令将由 [服务容器](/docs/laravel/9.x/container) 解析并注册到 Artisan：

    protected $commands = [
        Commands\SendEmails::class
    ];

<a name="programmatically-executing-commands"></a>
## 以编程方式执行命令

有时你可能希望在 CLI 之外执行 Artisan 命令。例如，你可能希望从路由或控制器执行 Artisan 命令。你可以使用 `Artisan` 外观上的 `call` 方法来完成此操作。 `call` 方法接受命令的签名名称或类名作为其第一个参数，以及一个命令参数数组作为第二个参数。将返回退出代码：

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function ($user) {
        $exitCode = Artisan::call('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        //
    });

或者，你可以将整个 Artisan 命令作为字符串传递给 `call` 方法：

    Artisan::call('mail:send 1 --queue=default');

<a name="passing-array-values"></a>
#### 传递数组值

如果你的命令定义了一个接受数组的选项，你可以将一组值传递给该选项：

    use Illuminate\Support\Facades\Artisan;

    Route::post('/mail', function () {
        $exitCode = Artisan::call('mail:send', [
            '--id' => [5, 13]
        ]);
    });

<a name="passing-boolean-values"></a>
#### 传递布尔值

如果你需要指定不接受字符串值的选项的值，例如 `migrate:refresh` 命令上的 `--force` 标志，则应传递 `true` 或 `false` 作为 选项：

    $exitCode = Artisan::call('migrate:refresh', [
        '--force' => true,
    ]);

<a name="queueing-artisan-commands"></a>
#### 队列 Artisan 命令

使用 `Artisan` 门面的 `queue` 方法，你甚至可以对 Artisan 命令进行排队，以便你的 [队列工作者](/docs/laravel/9.x/queues) 在后台处理它们。在使用此方法之前，请确保你已配置队列并正在运行队列侦听器：

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function ($user) {
        Artisan::queue('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        //
    });

使用 `onConnection` 和 `onQueue` 方法，你可以指定 Artisan 命令应分派到的连接或队列：

    Artisan::queue('mail:send', [
        'user' => 1, '--queue' => 'default'
    ])->onConnection('redis')->onQueue('commands');

<a name="calling-commands-from-other-commands"></a>
### 从其他命令调用命令

有时你可能希望从现有的 Artisan 命令调用其他命令。你可以使用 `call` 方法来执行此操作。这个 `call` 方法接受命令名称和命令参数/选项数组：

    /**
     * 执行控制台命令。
     *
     * @return mixed
     */
    public function handle()
    {
        $this->call('mail:send', [
            'user' => 1, '--queue' => 'default'
        ]);

        //
    }

如果你想调用另一个控制台命令并禁止其所有输出，你可以使用 `callSilently` 方法。 `callSilently` 方法与 `call` 方法具有相同的签名：

    $this->callSilently('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

<a name="signal-handling"></a>
## 信号处理

为 Artisan 控制台提供动力的 Symfony 控制台组件允许你指示你的命令处理哪些进程信号（如果有）。例如，你可以指示你的命令处理「SIGINT」和「SIGTERM」信号。

首先，你应该在你的 Artisan 命令类上实现 `Symfony\Component\Console\Command\SignalableCommandInterface` 接口。这个接口需要你定义两个方法：`getSubscribedSignals`和`handleSignal`：

```php
<?php

use Symfony\Component\Console\Command\SignalableCommandInterface;

class StartServer extends Command implements SignalableCommandInterface
{
    // ...

    /**
     * 获取命令处理的信号列表。
     *
     * @return array
     */
    public function getSubscribedSignals(): array
    {
        return [SIGINT, SIGTERM];
    }

    /**
     * 处理传入信号。
     *
     * @param  int  $signal
     * @return void
     */
    public function handleSignal(int $signal): void
    {
        if ($signal === SIGINT) {
            $this->stopServer();

            return;
        }
    }
}
```

正如你所料，`getSubscribedSignals` 方法应该返回命令可以处理的信号数组，而 `handleSignal` 方法接收信号并可以做出相应地响应。

<a name="stub-customization"></a>
## Stub 定制

Artisan 控制台的 `make` 命令用于创建各种类，例如控制器、作业、迁移和测试。这些类是使用「stub」文件生成的，这些文件中会根据你的输入填充值。但是，你可能需要对 Artisan 生成的文件进行少量更改。为此，你可以使用以下 `stub:publish` 命令将最常见的 Stub 命令发布到你的应用程序中，以便可以自定义它们：

```shell
php artisan stub:publish
```

已发布的 stub 将存放于你的应用根目录下的 `stubs` 目录中。对这些 stub 进行任何改动都将在你使用 Artisan `make` 命令生成相应的类的时候反映出来。

## 事件

Artisan 在运行命令时会调度三个事件： `Illuminate\Console\Events\ArtisanStarting`，`Illuminate\Console\Events\CommandStarting` 和  `Illuminate\Console\Events\CommandFinished`。当 Artisan 开始运行时，会立即调度 `ArtisanStarting` 事件。接下来，在命令运行之前立即调度  `CommandStarting` 事件。最后，一旦命令执行完毕，就会调度  `CommandFinished` 事件。
