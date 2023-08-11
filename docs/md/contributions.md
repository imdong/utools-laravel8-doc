# 贡献指南

- [Bug 报告](#bug-reports)
- [帮助支持](#support-questions)
- [核心发展讨论](#core-development-discussion)
- [哪个分支？](#which-branch)
- [编译资源](#compiled-assets)
- [安全漏洞](#security-vulnerabilities)
- [代码风格](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [行为准则](#code-of-conduct)

<a name="bug-reports"></a>
## Bug 报告

为了鼓励活跃的协作，Laravel 强烈推荐拉取请求，而不仅仅是错误报告。只有标记为「准备好审查」（而不是「草稿」状态）且新功能的所有测试都通过的拉取请求才会进行审核。留在「草稿」状态中未处理的悬而未决、不活跃的拉取请求将在几天后关闭。

不过，如果你提交了错误报告，你的问题应包含标题和清晰的问题描述。你还应尽可能提供相关信息和演示问题的代码示例。错误报告的目的是使自己和其他人能够轻松地复制错误并开发修复程序。

请记住，错误报告的创建是希望其他拥有相同问题的人能够与你协作解决问题。不要期望错误报告会自动获得任何活动，或者其他人会迅速修复它。创建错误报告有助于你自己和其他人开始解决问题的路径。如果你想参与，可以通过修复 [我们的问题跟踪器中列出的任何错误](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel) 来帮助。你必须使用 GitHub 进行身份验证才能查看 Laravel 的所有问题。

如果你在使用 Laravel 时注意到不正确的 DocBlock、PHPStan 或 IDE 警告，请不要创建 GitHub 问题。相反，请提交拉取请求以解决问题。

Laravel 的源代码托管在 GitHub 上，每个 Laravel 项目都有一个仓库：

<div class="content-list" markdown="1">

  - [Laravel Application](https://github.com/laravel/laravel)
    - [Laravel Art](https://github.com/laravel/art)
    - [Laravel Documentation](https://github.com/laravel/docs)
    - [Laravel Dusk](https://github.com/laravel/dusk)
    - [Laravel Cashier Stripe](https://github.com/laravel/cashier)
    - [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
    - [Laravel Echo](https://github.com/laravel/echo)
    - [Laravel Envoy](https://github.com/laravel/envoy)
    - [Laravel Framework](https://github.com/laravel/framework)
    - [Laravel Homestead](https://github.com/laravel/homestead)
    - [Laravel Homestead Build Scripts](https://github.com/laravel/settler)
    - [Laravel Horizon](https://github.com/laravel/horizon)
    - [Laravel Jetstream](https://github.com/laravel/jetstream)
    - [Laravel Passport](https://github.com/laravel/passport)
    - [Laravel Pennant](https://github.com/laravel/pennant)
    - [Laravel Pint](https://github.com/laravel/pint)
    - [Laravel Sail](https://github.com/laravel/sail)
    - [Laravel Sanctum](https://github.com/laravel/sanctum)
    - [Laravel Scout](https://github.com/laravel/scout)
    - [Laravel Socialite](https://github.com/laravel/socialite)
    - [Laravel Telescope](https://github.com/laravel/telescope)
    - [Laravel Website](https://github.com/laravel/laravel.com-next)

</div>

<a name="support-questions"></a>
## 帮助支持

Laravel 的 GitHub 问题跟踪器不适用于提供 Laravel 帮助或支持。请使用以下渠道之一：

<div class="content-list" markdown="1">

  - [GitHub 讨论](https://github.com/laravel/framework/discussions)
    - [Laracasts 论坛](https://laracasts.com/discuss)
    - [Laravel.io 论坛](https://laravel.io/forum)
    - [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
    - [Discord](https://discord.gg/laravel)
    - [Larachat](https://larachat.co)
    - [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## 核心发展讨论

可以在 Laravel 框架存储库的 [GitHub discussion board](https://github.com/laravel/framework/discussions) 。中提出新功能或改进现有 Laravel 行为。如果提出了新功能，请愿意实现至少一些完成该功能所需的代码。

关于错误、新功能和现有功能的实现的非正式讨论在 [Laravel Discord server](https://discord.gg/laravel) 的 #internals 频道进行。Laravel 的维护者 Taylor Otwell 通常在周一至周五上午8点至下午5点（UTC-06:00或美国/芝加哥）在频道中出现，并在其他时间不定期出现。

<a name="which-branch"></a>
## 哪个分支？

**所有的** Bug 修复应该发送到支持 Bug 修复的最新版本（目前是 `10.x`）。Bug 修复不应该发送到主分支，除非它们仅修复即将发布的版本中存在的功能。

完全向后兼容当前版本的小型功能可以发送到最新的稳定分支（目前是 `10.x`）。

具有重大新特性或破坏性更改的功能应该始终发送到主分支，该分支包含即将发布的版本。

<a name="compiled-assets"></a>
## 编译资源

如果你正在提交将影响编译文件的更改，例如 laravel/laravel 存储库中的 resources/css 或 resources/js 中的大多数文件，请不要提交编译文件。由于它们的尺寸较大，维护者无法实际审核它们。这可以被利用作为将恶意代码注入 Laravel 的方法。为了防御性地防止这种情况，所有编译文件将由 Laravel 维护者生成和提交。

<a name="security-vulnerabilities"></a>
## 安全漏洞

如果你在 Laravel 中发现安全漏洞，请发送电子邮件至 Taylor Otwell <a href="mailto:taylor@laravel.com">taylor@laravel.com</a> 。所有安全漏洞将得到及时处理。

<a name="coding-style"></a>
## 代码风格

Laravel 遵循 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.) 编码标准和 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.) 自动加载标准。

<a name="phpdoc"></a>
### PHPDoc

是一种在 PHP 代码中使用文档块注释的方式，它可以让开发者快速了解代码中的类、方法、属性等信息。下面是一个有效的 Laravel 文档块注释的示例。注意，`@param` 属性后面跟着两个空格、参数类型、两个空格，最后是变量名：

    /**
    * 容器注册与绑定
    *
    * @param  string|array  $abstract
    * @param  \Closure|string|null  $concrete
    * @param  bool  $shared
    * @return void
    *
    * @throws \Exception
    */
    public function bind($abstract, $concrete = null, $shared = false)
    {
        // ...
    }

如果使用了 PHP 本地类型，则可以删除 @param 或 @return 属性：

    /**
    * 执行任务
    */
    public function handle(AudioProcessor $processor): void
    {
        //...
    }

当使用的本地类型是泛型时，请通过使用 @param 或 @return 属性指定泛型类型：

    /**
    *  获取消息.
    *
    * @return array<int, \Illuminate\Mail\Mailables\Attachment>
    */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file'),
        ];
    }

<a name="styleci"></a>
### StyleCI

别担心你的代码风格, [StyleCI](https://styleci.io/) 是一个自动化的代码风格工具，它会在拉取请求合并后自动合并代码格式修复。这样我们就可以将重点放在贡献内容上，而不是代码风格上。

<a name="code-of-conduct"></a>
## 行为准则

Laravel 的行为准则源自于 Ruby 的行为准则。如果违反了行为准则，可以向 Taylor Otwell（taylor@laravel.com）报告：

<div class="content-list" markdown="1">

- 参与者应尊重不同的观点。
- 参与者必须确保他们的语言和行为没有人身攻击和贬低个人言论。
- 在解释他人的言行时，参与者应始终保持良好的意图。
- 不能容忍可合理视为骚扰的行为。

</div>