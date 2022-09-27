# Laravel Envoy

- [简介](#introduction)
- [安装](#installation)
- [编写任务](#writing-tasks)
    - [定义任务](#defining-tasks)
    - [多服务器](#multiple-servers)
    - [配置](#setup)
    - [变量](#variables)
    - [脚本故事](#stories)
    - [任务钩子](#completion-hooks)
- [运行任务](#running-tasks)
    - [任务确认](#confirming-task-execution)
- [消息通知](#notifications)
    - [Slack](#slack)
    - [Discord](#discord)
    - [Telegram](#telegram)
    - [Microsoft Teams](#microsoft-teams)

<a name="introduction"></a>
## 简介

[Laravel Envoy](https://github.com/laravel/envoy) 是一套在远程服务器上执行日常任务的工具。使用了 [Blade](/docs/laravel/9.x/blade) 风格语法, 你可以轻松地配置部署任务、Artisan 命令的执行等。目前，Envoy 仅支持 Mac 和 Linux 操作系统。但是可以使用 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) 以实现在 Windows 上使用。

<a name="installation"></a>
## 安装

首先，运行 Composer 将 Envoy 安装到你的项目中：

```shell
composer require laravel/envoy --dev
```

安装 Envoy 之后, Envoy 的可执行文件将出现在你项目的 `vendor/bin` 目录下：

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## 编写任务

<a name="defining-tasks"></a>
### 定义任务

任务是 Envoy 的基础构建元素, 任务定义了你想在远程服务器上当任务被调用时所执行的 Shell 命令。例如, 你可能定义了一个任务, 在你所有的队列服务器上执行 `php artisan queue:restart` 命令。

你所有的 Envoy 任务都应该在项目根目录中的 `Envoy.blade.php` 文件中定义。 以下是一个帮助你入门的例子：

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```



如你所见，文件顶部定义了一个 `@server` 数组，允许你在任务声明的 `on` 选项中引用这些服务器。`@server` 声明应始终放在一行中。在你的 `@task` 声明中，你应该放置任务被调用执行时你期望在服务器上运行的 Shell 命令。

<a name="local-tasks"></a>
#### 本地任务

你可以通过将服务器的 IP 地址指定为 `127.0.0.1` 来强制脚本在本地运行：

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### 导入 Envoy 任务

使用 `@import` 指令, 你可以从其他的 Envoy 文件导入它们的故事与任务并添加到您的文件中。文件导入后，你可以执行他们所定义的任务，就像这些任务是在你的 Envoy 文件中被定义的一样：

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### 多服务器

Envoy 允许你轻松跨多台服务器运行任务。 首先，在 `@server` 声明中添加额外的服务器。每台服务器都应分配一个唯一的名称。一旦你定义了额外的服务器，你可以在任务的 `on` 数组中的列出每一台服务器：

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="parallel-execution"></a>
#### 并行执行

默认情况下，任务将在每台服务器上串行执行。 换句话说，任务将在第一台服务器上完成运行后，再继续在第二台服务器上执行。如果你想并行运行多个服务器上的任务，请在任务声明中添加 `parallel` 选项：

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```



<a name="setup"></a>
### 配置

有时，你可能需要在执行 Envoy 任务之前执行一些 PHP 代码。你可以使用 `@setup` 指令声明变量，并在执行任何其他任务之前执行其他常规 PHP 工作：

```php
@setup
    $now = new DateTime;
@endsetup
```

如果你需要在任务执行前引用其他PHP文件，你可以在 `Envoy.blade.php` 文件的顶部使用 `@include` 指令：

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### 变量

如果需要，你可以在调用 Envoy 任务时通过在命令行中指定参数，将参数传递给 Envoy 任务：

```shell
php vendor/bin/envoy run deploy --branch=master
```

你可以通过 Blade 的「echo」 语法访问传入任务中的参数。你也可以在任务中使用 `if` 语句和循环。 例如，在执行 `git pull` 命令之前，我们先验证 `$branch` 变量是否存在：

```blade
@servers(['web' => ['user@192.168.1.1']])

@task('deploy', ['on' => 'web'])
    cd /home/user/example.com

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate --force
@endtask
```

<a name="stories"></a>
### 脚本故事

你可以将多个同类型任务组合到在一起，我们称之为脚本故事。 例如， 运行 `deploy` 这个故事脚本时会运行定义在其中的 `update-code` 和 `install-dependencies` 两个任务：

```blade
@servers(['web' => ['user@192.168.1.1']])

@story('deploy')
    update-code
    install-dependencies
@endstory

@task('update-code')
    cd /home/user/example.com
    git pull origin master
@endtask

@task('install-dependencies')
    cd /home/user/example.com
    composer install
@endtask
```

一旦编写了脚本故事，你可以像调用任务一样调用脚本故事：

```shell
php vendor/bin/envoy run deploy
```



<a name="completion-hooks"></a>
### 任务钩子

当任务和故事脚本运行时，会执行许多钩子。Envoy 支持的钩子类型有 `@before`、`@after`、`@error`、`@success` 和 `@finished`。这些钩子中的所有代码都被解释为 PHP 并在本地执行，而不是在你的任务与之交互的远程服务器上执行。

你可以根据需要定义任意数量的这些。这些钩子将按照它们在您的 Envoy 脚本中出现的顺序执行。

<a name="hook-before"></a>
#### `@before`

在每个任务执行之前，Envoy 脚本中注册的所有 `@before` 钩子都会执行。 `@before` 钩子负责接收将要执行的任务的名称：

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

每次任务执行后，Envoy 脚本中注册的所有 `@after` 钩子都会执行。 `@after` 钩子负责接收已执行任务的名称：

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

在每次任务失败后（以大于 `0` 的状态码退出执行），Envoy 脚本中注册的所有 `@error` 钩子都将执行。 `@error` 钩子负责接收已执行任务的名称：

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

如果所有任务都已正确执行，则 Envoy 脚本中注册的所有 `@success` 钩子都将执行：

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

在所有任务都执行完毕后（不管退出状态如何），所有的 `@finished` 钩子都会被执行。 `@finished` 钩子负责接收已完成任务的状态码，它可能是 `null` 或大于或等于 `0` 的 `integer`：

```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```



<a name="running-tasks"></a>
## 运行任务

要运行在 `Envoy.blade.php` 文件中定义的任务或故事，请执行 Envoy 的 `run` 命令，传递您要执行的任务或故事的名称。 当任务运行时， Envoy 将运行任务并显示服务器的输出：

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### 确认任务执行

如果你希望在服务器上运行给定任务之前提示你进行确认，则应将 `confirm` 指令添加到任务声明中。 此选项对于破坏性操作特别有用：

```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## 消息通知

<a name="slack"></a>
### Slack

Envoy 还支持在执行每个任务后向 [Slack](https://slack.com) 发送通知。 `@slack` 指令接受 Slack 钩子 URL 和通道名称。 你可以通过在 Slack 控制面板中创建 Incoming WebHooks 集成来检索你的 webhook URL 。 你应该将整个 webhook URL 传递给 `@slack` 指令：

你应该将整个 webhook URL 作为第一个参数传递给 `@slack` 指令。`@slack` 指令的第二个参数应该是频道名称（`#channel`）或用户名（`@user`）：

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

默认情况下，Envoy 通知将向通知通道发送一条消息，描述已执行的任务。但是，你可以通过将第三个参数传递给 `@slack` 指令，用你自己的自定义消息覆盖此消息：

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```



<a name="discord"></a>
### Discord

Envoy 还支持在每个任务执行后向 [Discord](https://discord.com) 发送通知。 `@discord` 指令接受 Discord hook URL 和消息。你可以通过在服务器设置中创建「Webhook」并选择 Webhook 应该发布到哪个频道来检索你的 Webhook URL。你应该将整个 Webhook URL 传递到 `@discord` 指令中：

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

Envoy 还支持在执行每个任务后向 [Telegram](https://telegram.org) 发送通知。`@telegram` 指令接受Telegram Bot ID 和 Chat ID。你可以使用 [BotFather](https://t.me/botfather) 创建一个新的机器人（Bot）来检索 Bot ID。你可以使用 [@username_to_id_bot](https://t.me/username_to_id_bot) 检索有效的 Chat ID。你应该将整个 Bot ID 和 Chat ID 传递到 `@telegram` 指令中：

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

Envoy 还支持在每个任务执行后向 [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) 发送通知。 `@microsoftTeams` 指令接受 Teams Webhook（必需）、消息、主题颜色（成功、信息、警告、错误）和一系列选项。您可以通过创建新的 [incoming webhook] (https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) 来检索你的 Teams Webbook。 Teams API 具有许多其他属性来自定义你的消息框，例如标题、摘要和局部片段。你可以在 [Microsoft Teams 文档](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message)。你应该将整个 Webhook URL 传递到 `@microsoftTeams` 指令中：

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```

