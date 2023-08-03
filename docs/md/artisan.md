# Artisan 命令行

- [介绍](#introduction)
    - [Tinker 命令 (REPL)](#tinker)
- [编写命令](#writing-commands)
    - [生成命令](#generating-commands)
    - [命令结构](#command-structure)
    - [闭包命令](#closure-commands)
    - [单例命令](#isolatable-commands)
- [定义输入期望值](#defining-input-expectations)
    - [参数](#arguments)
    - [选项](#options)
    - [输入数组](#input-arrays)
    - [输入说明](#input-descriptions)
- [I/O 命令](#command-io)
    - [检索输入](#retrieving-input)
    - [输入提示](#prompting-for-input)
    - [编写输出](#writing-output)
- [注册命令](#registering-commands)
- [在程序中执行命令](#programmatically-executing-commands)
    - [从其他命令调用命令](#calling-commands-from-other-commands)
- [信号处理](#signal-handling)
- [Stub 自定义](#stub-customization)
- [事件](#events)

<a name="introduction"></a>
## 介绍

Artisan 是 Laravel 中自带的命令行接口。Artisan 以 `artisan ` 脚本的方式存在于应用的根目录中，提供了许多有用的命令，帮助开发者创建应用。使用 `list` 命令可以查看所有可用的Artisan 命令：

```shell
php artisan list
```

每个命令都与 "help" 帮助界面，它能显示和描述该命令可用的参数和选项。要查看帮助界面，请在命令前加上 `help` 即可：

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

如果你使用 [Laravel Sail](/docs/laravel/10.x/sail) 作为本地开发环境，记得使用 `sail` 命令行来调用 Artisan 命令。Sail 会在应用的 Docker容器中执行 Artisan 命令：

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

Laravel Tinker 是为 Laravel 提供的强大的 REPL（交互式解释器），由 PsySH(https://github.com/bobthecow/psysh) 驱动支持。



<a name="installation"></a>
#### 安装

所有的 Laravel 应用默认都自带 Tinker。不过，如果你此前删除了它，你可以使用 Composer 安装：

```shell
composer require laravel/tinker
```

> **注意**  
> 需要能与 Laravel 交互的图形用户界面吗？试试 [Tinkerwell](https://tinkerwell.app)!

<a name="usage"></a>
#### 使用

Tinker 允许你在命令行中和整个 Laravel 应用交互，包括 Eloquent 模型、队列、事件等等。要进入 Tinker 环境，只需运行 `tinker` Artisan 命令：

```shell
php artisan tinker
```

你可以使用 `vendor:publish` 命令发布 Tinker 的配置文件：

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> **警告**  
> `dispatch` 辅助函数及 `Dispatchable` 类中 `dispatch` 方法依赖于垃圾回收将任务放置到队列中。因此，使用 tinker 时，请使用 `Bus::dispath` 或 `Queue::push` 来分发任务。

<a name="command-allow-list"></a>
#### 命令白名单

Tinker 使用白名单来确定哪些 Artisan 命令可以在其 Shell 中运行。默认情况下，你可以运行 `clear-compiled`、`down`、`env`、`inspire`、`migrate`、`optimize` 和 `up` 命令。如果你想允许更多命令，你可以将它们添加到 `tinker.php` 配置文件的 `commands` 数组中：

    'commands' => [
        // App\Console\Commands\ExampleCommand::class,
    ],

<a name="classes-that-should-not-be-aliased"></a>
#### 别名黑名单

一般而言，Tinker 会在你引入类时自动为其添加别名。不过，你可能不希望为某些类添加别名。你可以在 `tinker.php` 配置文件的 `dont_alias` 数组中列举这些类来完成此操作：

    'dont_alias' => [
        App\Models\User::class,
    ],



<a name="writing-commands"></a>
## 编写命令

除了 Artisan 提供的命令之外，你可以创建自定义命令。一般而言，命令保存在 `app/Console/Commands` 目录；不过，你可以自由选择命令的存储位置，只要它能够被 Composer 加载即可。

<a name="generating-commands"></a>
### 生成命令

要创建新命令，可以使用 `make:command` Artisan 命令。该命令会在 `app/Console/Commands` 目录下创建一个新的命令类。如果该目录不存在，也无需担心 - 它会在第一次运行 `make:command` Artisan 命令的时候自动创建：

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 命令结构

生成命令后，应该为该类的 `signature` 和 `description` 属性设置设当的值。当在 list 屏幕上显示命令时，将使用这些属性。`signature` 属性也会让你定义[命令输入预期值](#defining-input-expectations)。`handle` 方法会在命令执行时被调用。你可以在该方法中编写命令逻辑。

让我们看一个示例命令。请注意，我们能够通过命令的 `handle` 方法引入我们需要的任何依赖项。Laravel [服务容器](https://learnku.com/docs/laravel/9.x/container) 将自动注入此方法签名中带有类型提示的所有依赖项：

    <?php

    namespace App\Console\Commands;

    use App\Models\User;
    use App\Support\DripEmailer;
    use Illuminate\Console\Command;

    class SendEmails extends Command
    {
        /**
         * 控制台命令的名称和签名
         *
         * @var string
         */
        protected $signature = 'mail:send {user}';

        /**
         * 命令描述
         *
         * @var string
         */
        protected $description = 'Send a marketing email to a user';

        /**
         * 执行命令
         */
        public function handle(DripEmailer $drip): void
        {
            $drip->send(User::find($this->argument('user')));
        }
    }

> **注意**
> 为了更好地复用代码，请尽量让你的命令类保持轻量并且能够延迟到应用服务中完成。上例中，我们注入了一个服务类来进行发送电子邮件的「繁重工作」。



<a name="closure-commands"></a>
### 闭包命令

基于闭包的命令为将控制台命令定义为类提供了一种替代方法。与路由闭包可以替代控制器一样，可以将命令闭包视为命令类的替代。在 `app/Console/Kernel.php` 文件的  `commands` 方法中 ，Laravel 加载 `routes/console.php` 文件：

    /**
     * 注册闭包命令
     */
    protected function commands(): void
    {
        require base_path('routes/console.php');
    }

尽管该文件没有定义 HTTP 路由，但它定义了进入应用程序的基于控制台的入口 (routes) 。在这个文件中，你可以使用 `Artisan::command` 方法定义所有的闭包路由。 `command` 方法接受两个参数： [命令名称](#defining-input-expectations) 和可调用的闭包，闭包接收命令的参数和选项：

    Artisan::command('mail:send {user}', function (string $user) {
        $this->info("Sending email to: {$user}!");
    });

该闭包绑定到基础命令实例，因此你可以完全访问通常可以在完整命令类上访问的所有辅助方法。

<a name="type-hinting-dependencies"></a>
#### Type-Hinting Dependencies

除了接受命令参数及选项外，命令闭包也可以使用类型约束从 [服务容器](/docs/laravel/10.x/container) 中解析其他的依赖关系：

    use App\Models\User;
    use App\Support\DripEmailer;

    Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
        $drip->send(User::find($user));
    });

<a name="closure-command-descriptions"></a>
#### 闭包命令说明

在定义基于闭包的命令时，可以使用 `purpose` 方法向命令添加描述。当你运行 `php artisan list` 或 `php artisan help` 命令时，将显示以下描述：

    Artisan::command('mail:send {user}', function (string $user) {
        // ...
    })->purpose('Send a marketing email to a user');



<a name="isolatable-commands"></a>
### 单例命令

> **警告**
> 要使用该特性，应用必须使用 `memcached`、`redis`、`dynamodb`、`database`、`file` 或 `array` 作为默认的缓存驱动。另外，所有的服务器必须与同一个中央缓存服务器通信。

有时您可能希望确保一次只能运行一个命令实例。为此，你可以在命令类上实现 `Illuminate\Contracts\Console\Isolatable` 接口：

    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Contracts\Console\Isolatable;

    class SendEmails extends Command implements Isolatable
    {
        // ...
    }

当命令被标记为 `Isolatable` 时，Laravel 会自动为该命令添加 `--isolated` 选项。当命令中使用这一选项时，Laravel 会确保不会有该命令的其他实例同时运行。Laravel 通过在应用的默认缓存驱动中使用原子锁来实现这一功能。如果这一命令有其他实例在运行，则该命令不会执行；不过，该命令仍然会使用成功退出状态码退出：

```shell
php artisan mail:send 1 --isolated
```

如果你想自己指定命令无法执行时返回的退出状态码，你可用通过 `isolated` 选项提供：

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-expiration-time"></a>
#### 原子锁到期时间

默认情况下，单例锁会在命令完成后过期。或者如果命令被打断且无法完成的话，锁会在一小时后过期。不过你也可以通过定义命令的 `isolationLockExpiresAt` 方法来调整过期时间：

```php
use DateTimeInterface;
use DateInterval;

/**
 * 定义单例锁的到期时间
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->addMinutes(5);
}
```



<a name="defining-input-expectations"></a>
## 定义输入期望

在编写控制台命令时，通常是通过参数和选项来收集用户输入的。 Laravel 让你可以非常方便地在 `signature` 属性中定义你期望用户输入的内容。`signature` 属性允许使用单一且可读性高，类似路由的语法来定义命令的名称、参数和选项。

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

选项类似于参数，是用户输入的另一种形式。在命令行中指定选项的时候，它们以两个短横线 (`--`) 作为前缀。这有两种类型的选项：接收值和不接受值。不接收值的选项就像是一个布尔「开关」。我们来看一下这种类型的选项的示例：

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

在终端上调用命令时，选项简写的前缀只用一个连字符，在为选项指定值时不应该包括`=`字符。

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 输入数组

如果你想要接收数组数组的参数或者选项，你可以使用 `*` 字符。首先，让我们看一下指定了一个数组参数的例子：

    'mail:send {user*}'

当调用这个方法的时候，`user` 参数的输入参数将按顺序传递给命令。例如，以下命令将会设置 `user` 的值为 `foo` 和 `bar` ：

```shell
php artisan mail:send 1 2
```



 `*` 字符可以与可选的参数结合使用，允许您定义零个或多个参数实例：

    'mail:send {user?*}'

<a name="option-arrays"></a>
#### 选项数组

当定义需要多个输入值的选项时，传递给命令的每个选项值都应以选项名称作为前缀：

    'mail:send {--id=*}'

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
     */
    public function handle(): void
    {
        $userId = $this->argument('user');
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
     */
    public function handle(): void
    {
        $name = $this->ask('What is your name?');

        // ...
    }

`secret` 方法与 `ask` 相似，区别在于用户的输入将不可见。这个方法在需要输入一些诸如密码之类的敏感信息时是非常有用的：

    $password = $this->secret('What is the password?');

<a name="asking-for-confirmation"></a>
#### 请求确认

如果你需要请求用户进行一个简单的确认，可以使用 `confirm` 方法来实现。默认情况下，这个方法会返回 `false`。当然，如果用户输入 `y` 或 `yes`，这个方法将会返回 `true`。

    if ($this->confirm('Do you wish to continue?')) {
        // ...
    }

如有必要，你可以通过将 `true` 作为第二个参数传递给 `confirm` 方法，这样就可以在默认情况下返回 `true`：

    if ($this->confirm('Do you wish to continue?', true)) {
        // ...
    }

<a name="auto-completion"></a>
#### 自动补全

`anticipate` 方法可用于为可能的选项提供自动补全功能。用户依然可以忽略自动补全的提示，进行任意回答：

    $name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);

或者，你可以将一个闭包作为第二个参数传递给 `anticipate` 方法。每当用户键入字符时，闭包函数都会被调用。闭包函数应该接受一个包含用户输入的字符串形式的参数，并返回一个可供自动补全的选项的数组：

    $name = $this->anticipate('What is your address?', function (string $input) {
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

此外， `choice` 方法接受第四和第五可选参数 ，用于确定选择有效响应的最大尝试次数以及是否允许多次选择：

    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex,
        $maxAttempts = null,
        $allowMultipleSelections = false
    );

<a name="writing-output"></a>
### 文字输出

你可以使用 `line`，`info`，`comment`，`question` 和 `error` 方法，发送输出到控制台。 这些方法中的每一个都会使用合适的 ANSI 颜色以展示不同的用途。例如，我们要为用户展示一些常规信息。通常，`info` 将会以绿色文本在控制台展示。

    /**
     * Execute the console command.
     */
    public function handle(): void
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

    $users = $this->withProgressBar(User::all(), function (User $user) {
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

> **技巧：**有关更多高级选项，请查看 [Symfony 进度条组件文档](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a name="registering-commands"></a>
## 注册命令

你的所有控制台命令都在您的应用程序的 `App\Console\Kernel` 类中注册，这是你的应用程序的「控制台内核」。在此类的 `commands` 方法中，你将看到对内核的 `load` 方法的调用。 `load` 方法将扫描 `app/Console/Commands` 目录并自动将其中包含的每个命令注册到 Artisan。 你甚至可以自由地调用 `load` 方法来扫描其他目录以查找 Artisan 命令：

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        $this->load(__DIR__.'/../Domain/Orders/Commands');

        // ...
    }



如有必要，你可以通过将命令的类名添加到 `App\Console\Kernel` 类中的 `$commands` 属性来手动注册命令。如果你的内核上尚未定义此属性，则应手动定义它。当 Artisan 启动时，此属性中列出的所有命令将由 [服务容器](/docs/laravel/10.x/container) 解析并注册到 Artisan：

    protected $commands = [
        Commands\SendEmails::class
    ];

<a name="programmatically-executing-commands"></a>
## 以编程方式执行命令

有时你可能希望在 CLI 之外执行 Artisan 命令。例如，你可能希望从路由或控制器执行 Artisan 命令。你可以使用 `Artisan` 外观上的 `call` 方法来完成此操作。 `call` 方法接受命令的签名名称或类名作为其第一个参数，以及一个命令参数数组作为第二个参数。将返回退出代码：

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function (string $user) {
        $exitCode = Artisan::call('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        // ...
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

使用 `Artisan` 门面的 `queue` 方法，你甚至可以对 Artisan 命令进行排队，以便你的 [队列工作者](/docs/laravel/10.x/queues) 在后台处理它们。在使用此方法之前，请确保你已配置队列并正在运行队列侦听器：

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function (string $user) {
        Artisan::queue('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        // ...
    });

使用 `onConnection` 和 `onQueue` 方法，你可以指定 Artisan 命令应分派到的连接或队列：

    Artisan::queue('mail:send', [
        'user' => 1, '--queue' => 'default'
    ])->onConnection('redis')->onQueue('commands');

<a name="calling-commands-from-other-commands"></a>
### 从其他命令调用命令

有时你可能希望从现有的 Artisan 命令调用其他命令。你可以使用 `call` 方法来执行此操作。这个 `call` 方法接受命令名称和命令参数/选项数组：

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->call('mail:send', [
            'user' => 1, '--queue' => 'default'
        ]);

        // ...
    }

如果你想调用另一个控制台命令并禁止其所有输出，你可以使用 `callSilently` 方法。 `callSilently` 方法与 `call` 方法具有相同的签名：

    $this->callSilently('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

<a name="signal-handling"></a>
## 信号处理

正如你可能知道的，操作系统允许向运行中的进程发送信号。例如，「SIGTERM」信号是操作系统要求程序终止的方式。如果你想在 Artisan 控制台命令中监听信号，并在信号发生时执行代码，你可以使用 `trap` 方法。

    /**
     * 执行控制台命令。
     */
    public function handle(): void
    {
        $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

        while ($this->shouldKeepRunning) {
            // ...
        }
    }



为了一次监听多个信号，你可以向 `trap` 方法提供一个信号数组。

    $this->trap([SIGTERM, SIGQUIT], function (int $signal) {
        $this->shouldKeepRunning = false;

        dump($signal); // SIGTERM / SIGQUIT
    });

<a name="stub-customization"></a>
## Stub 定制

Artisan 控制台的 `make` 命令用于创建各种类，例如控制器、作业、迁移和测试。这些类是使用「stub」文件生成的，这些文件中会根据你的输入填充值。但是，你可能需要对 Artisan 生成的文件进行少量更改。为此，你可以使用以下 `stub:publish` 命令将最常见的 Stub 命令发布到你的应用程序中，以便可以自定义它们：

```shell
php artisan stub:publish
```

已发布的 stub 将存放于你的应用根目录下的 `stubs` 目录中。对这些 stub 进行任何改动都将在你使用 Artisan `make` 命令生成相应的类的时候反映出来。

<a name="events"></a>
## 事件

Artisan 在运行命令时会调度三个事件： `Illuminate\Console\Events\ArtisanStarting`，`Illuminate\Console\Events\CommandStarting` 和  `Illuminate\Console\Events\CommandFinished`。当 Artisan 开始运行时，会立即调度 `ArtisanStarting` 事件。接下来，在命令运行之前立即调度  `CommandStarting` 事件。最后，一旦命令执行完毕，就会调度  `CommandFinished` 事件。

