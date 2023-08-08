
# 控制台测试

- [介绍](#introduction)
- [期望成功/失败](#success-failure-expectations)
- [期望输入/输出](#input-output-expectations)

<a name="introduction"></a>
## 介绍

除了简化 HTTP 测试之外，Laravel 还提供了一个简单的 API 来测试应用程序的 [自定义控制台命令](/docs/laravel/10.x/artisan)。

<a name="success-failure-expectations"></a>
## 期望成功/失败

首先，让我们探索如何对 Artisan 命令的退出代码进行断言。为此，我们将使用 `artisan` 方法从我们的测试中调用 Artisan 命令。然后，我们将使用 `assertExitCode` 方法断言该命令以给定的退出代码完成：

    /**
     * 测试控制台命令。
     */
    public function test_console_command(): void
    {
        $this->artisan('inspire')->assertExitCode(0);
    }

你可以使用 `assertNotExitCode` 方法断言命令没有以给定的退出代码退出：

    $this->artisan('inspire')->assertNotExitCode(1);

当然，所有终端命令通常在成功时以 `0` 状态码退出，在不成功时以非零退出码退出。因此，为方便起见，你可以使用 `assertSuccessful` 和 `assertFailed` 断言来断言给定命令是否以成功的退出代码退出：

    $this->artisan('inspire')->assertSuccessful();

    $this->artisan('inspire')->assertFailed();

<a name="input-output-expectations"></a>
## 期望输入/输出

Laravel 允许你使用 `expectsQuestion` 方法轻松 「mock」控制台命令的用户输入。此外，你可以使用 `assertExitCode` 和 `expectsOutput` 方法指定你希望通过控制台命令输出的退出代码和文本。例如，考虑以下控制台命令：

    Artisan::command('question', function () {
        $name = $this->ask('What is your name?');

        $language = $this->choice('Which language do you prefer?', [
            'PHP',
            'Ruby',
            'Python',
        ]);

        $this->line('Your name is '.$name.' and you prefer '.$language.'.');
    });



你可以用下面的测试来测试这个命令，该测试利用了 `expectsQuestion`、`expectsOutput`、`doesntExpectOutput`、`expectsOutputToContain`、`doesntExpectOutputToContain` 和 `assertExitCode` 方法。

    /**
     * 测试控制台命令。
     */
    public function test_console_command(): void
    {
        $this->artisan('question')
             ->expectsQuestion('What is your name?', 'Taylor Otwell')
             ->expectsQuestion('Which language do you prefer?', 'PHP')
             ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
             ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
             ->expectsOutputToContain('Taylor Otwell')
             ->doesntExpectOutputToContain('you prefer Ruby')
             ->assertExitCode(0);
    }

<a name="confirmation-expectations"></a>
#### 确认期望

当编写一个期望以「是」或「否」答案形式确认的命令时，你可以使用 `expectsConfirmation` 方法：

    $this->artisan('module:import')
        ->expectsConfirmation('Do you really wish to run this command?', 'no')
        ->assertExitCode(1);

<a name="table-expectations"></a>
#### 表格期望

如果你的命令使用 Artisan 的 `table` 方法显示信息表，则为整个表格编写输出预期会很麻烦。相反，你可以使用 `expectsTable` 方法。此方法接受表格的标题作为它的第一个参数和表格的数据作为它的第二个参数：

    $this->artisan('users:all')
        ->expectsTable([
            'ID',
            'Email',
        ], [
            [1, 'taylor@example.com'],
            [2, 'abigail@example.com'],
        ]);

