# 贡献导引

- [Bug 报告](#bug-reports)
- [帮助支持](#support-questions)
- [核心发展讨论](#core-development-discussion)
- [哪个分支？](#which-branch)
- [编译资源](#compiled-assets)
- [安全漏洞](#security-vulnerabilities)
- [代码风格](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [行为守则](#code-of-conduct)

<a name="bug-reports"></a>
## Bug 报告

为了鼓励积极的合作，Laravel 强烈鼓励提交 pull request，而不仅仅是提交「Bug 报告」。「Bug 报告」也可以包含失败测试的 pull request 的形式发送。只有在标记为「准备好审核」（而不是处于「草稿」状态）并且新功能的所有测试都通过时，才会审核拉取请求。停留在「草稿」状态的、非活动的拉取请求将在几天后关闭。

然而，如果你提交了一个 Bug 报告，你的问题（issue）应该包含一个标题和对问题的清晰描述。你还应该包含尽可能多的相关信息以及演示该问题的代码示例。错误报告的目标是使您自己（以及其他人）能够轻松地复现错误并开发修复程序。

请记住，创建 Bug 报告是希望有相同问题的其他人能够与您协作解决它。不要期望 Bug 报告能够自动查看任何活动或者其他人跳转自此来修复它。创建 Bug 报告有助于你自己和其他人开始修复问题。如果你想加入，你可以通过修复 [issues 列表](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel) 来提供帮助。你必须通过 GitHub 认证才能查看 Laravel 的所有问题。


Laravel 源码托管在 GitHub 上，每个项目都有一个仓库：

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
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Website](https://github.com/laravel/laravel.com-next)

</div>

<a name="support-questions"></a>
## 帮助支持

Laravel 的 GitHub issue 不打算提供 Laravel 的帮助或支持。相反，可以使用以下途径之一:

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
## 核心开发讨论

你可以在 Laravel 框架存储库的 [GitHub 讨论区](https://github.com/laravel/framework/discussions) 中提出新功能或对现有 Laravel 行为的改进。 如果您提出一项新功能，请愿意至少实现一些完成该功能所需的代码。

在 [Laravel Discord 服务器](https://discord.gg/laravel) 的 `#internals` 频道中进行了有关错误、新功能和现有功能实现的非正式讨论。 Laravel 的维护者 Taylor Otwell 通常在工作日的上午 8 点至下午 5 点（UTC-06:00 或美国/芝加哥）出现在频道中，并在其他时间偶尔出现在频道中。

<a name="which-branch"></a>
## 哪个分支？

**所有**错误修复应发送到最新的稳定分支。 错误修复不应该被发送到 `master` 分支，除非它们修复了仅存在于即将发布的版本中的功能。

**与当前版本**完全向后兼容**的**次要**功能可能会发送到最新的稳定分支。

**主要** 新功能应始终发送到包含即将发布的版本的 `master` 分支。

如果您不确定您的功能是否符合主要或次要功能，请在 [Laravel Discord 服务器](https://discord.gg/laravel) 的 `#internals` 频道中询问 Taylor Otwell。

<a name="compiled-assets"></a>
## 编译文件

如果您提交的更改会影响已编译文件，例如 `laravel/laravel` 存储库的 `resources/css` 或 `resources/js` 中的大部分文件，请不要提交已编译文件。 由于它们的体积很大，维护者实际上无法对其进行审查。 这可能被用作将恶意代码注入 Laravel 的一种方式。 为了防御性地防止这种情况发生，所有编译的文件都将由 Laravel 维护者生成和提交。



<a name="security-vulnerabilities"></a>
## 安全漏洞

如果你发现 Laravel 中存在安全漏洞，请发送电子邮件至 <a href="mailto:taylor@laravel.com">taylor@laravel.com</a> 给 Taylor Otwell。 所有安全漏洞都将得到及时解决。

<a name="coding-style"></a>
## 编码风格

Laravel 遵循 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 编码标准和 [PSR- 4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 自动加载标准。

<a name="phpdoc"></a>
### PHP文档

下面是一个有效的 Laravel 文档块的示例。 请注意，`@param` 属性后跟两个空格、参数类型、另外两个空格，最后是变量名：

    /**
     * 向容器注册绑定。
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
        //
    }

<a name="styleci"></a>
### StyleCI

如果您的代码样式不完美，请不要担心！ [StyleCI](https://styleci.io/) 将在合并拉取请求后自动将任何样式修复合并到 Laravel 存储库中。 这使我们能够专注于贡献的内容，而不是代码风格。

<a name="code-of-conduct"></a>
## 行为准则

Laravel 行为准则源自 Ruby 行为准则。 任何违反行为准则的行为都可以报告给 Taylor Otwell (taylor@laravel.com)：

<div class="content-list" markdown="1">

- 参与者将容忍反对意见。
- 参与者必须确保他们的语言和行为没有人身攻击和贬低个人言论。
- 在解释他人的言行时，参与者应始终保持良好的意图。
- 不能容忍可合理视为骚扰的行为。

</div>

