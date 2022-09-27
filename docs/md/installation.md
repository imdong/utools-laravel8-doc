# 安装

- [认识 Laravel](#meet-laravel)
  - [为什么选择 Laravel?](#why-laravel)
- [你的第一个 Laravel 项目](#your-first-laravel-project)
  - [macOS 入门](#getting-started-on-macos)
  - [Windows 入门](#getting-started-on-windows)
  - [Linux 入门](#getting-started-on-linux)
  - [选择 Sail 服务](#choosing-your-sail-services)
  - [通过 Composer 安装](#installation-via-composer)
- [初始化](#initial-configuration)
  - [基于环境的配置](#environment-based-configuration)
  - [目录配置](#directory-configuration)
- [下一步](#next-steps)
  - [将 Laravel 用作全栈框架](#laravel-the-fullstack-framework)
  - [将 Laravel 用作 API 后端](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 认识 Laravel

Laravel 是一个 Web应用框架， 有着表现力强、语法优雅的特点。Web 框架为创建应用提供了一个结构和起点，你只需要专注于创造，我们来为你处理细节。

Laravel 致力于提供出色的开发体验，同时提供强大的特性，例如完全的依赖注入，富有表现力的数据库抽象层，队列和计划任务，单元和集成测试等等。

无论你是刚刚接触 PHP 和 Web 框架的新人，亦或是有着多年经验的老手， Laravel 都是一个可以与你一同成长的框架。我们将帮助你迈出成为 Web 开发者的第一步，或是将你的经验提高到下一个等级。我们迫不及待的想看看你的作品。

<a name="why-laravel"></a>
### 为什么选择 Laravel?

有非常多的工具和框架可以被用于构建一个 Web 应用。但我们相信 Laravel 是构建现代化、全栈 Web 应用的最佳选择。

#### 一个渐进式框架

我们喜欢称 Laravel 是一个「渐进式」框架。意思是 Laravel 将与你一同成长。如果你是首次进入 Web 开发， Laravel 大量的文档、指南和 [视频教程](https://laracasts.com) 将帮助你熟悉使用技巧而不至于不知所措。

如果你是高级开发人员，Laravel 为你提供了强大的工具用于 [依赖注入](/docs/laravel/9.x/container)、[单元测试](/docs/laravel/9.x/testing)、[队列](/docs/laravel/9.x/queues)、[广播系统](/docs/laravel/9.x/broadcasting) 等等。Laravel 为构建专业的 Web 应用程序进行了微调，并准备好处理企业工作负载。

#### 一个可扩展的框架

Laravel 具有难以置信的可扩展性。由于 PHP 的灵活性以及 Laravel 对 Redis 等快速分布式缓存系统的内置支持，使用 Laravel 进行扩展是轻而易举的事。事实上，Laravel 应用程序已经很容易扩展到每月处理数亿个请求。

需要压缩开发费用吗？ [Laravel Vapor](https://vapor.laravel.com) 允许你在 AWS 最新的无服务器技术上以几乎无限的规模运行 Laravel 应用程序。

#### 一个社区化的框架

Laravel 结合了 PHP 生态系统中最好的软件包，提供了最健壮、对开发人员友好的框架。此外，来自世界各地的数千名有才华的开发人员[为框架做出了贡献](https://github.com/laravel/framework)。谁知道呢，也许你就是下一个 Laravel 的贡献者。

<a name="your-first-laravel-project"></a>
## 你的第一个 Laravel 项目

我们希望尽可能轻松地开始使用 Laravel。在你自己的计算机上开发和运行 Laravel 项目有多种选择。虽然你可能希望以后再研究这些选项，但 Laravel 提供了 [Sail](/docs/laravel/9.x/sail)，使用 [Docker](https://www.docker.com) 运行 Laravel 项目的内置解决方案

Docker 是一种在小型、轻量级的「容器」中运行应用程序和服务的工具，它不会干扰本地计算机安装的软件或配置。这意味着你不必担心在个人计算机上配置或设置复杂的开发工具，例如 web 服务器和数据库。要开始，你只需安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)。

Laravel Sail 是一个轻量级的命令行界面，用于与 Laravel 的默认 Docker 配置进行交互。Sail 为使用 PHP、MySQL 和 Redis 构建 Laravel 应用程序提供了一个很好的起点，而无需之前的 Docker 经验。

> 技巧：已经是 Docker 专家？别担心！关于 Sail 的一切都可以使用Laravel 附带的文件 `docker-compose.yml` 进行自定义。

<a name="getting-started-on-macos"></a>
### macOS 入门

如果你在 Mac 上开发并且已经安装了 [Docker Desktop](https://www.docker.com/products/docker-desktop)，你可以使用一个简单的终端命令来创建一个新的 Laravel 项目。 例如，要在名为「example-app」的目录中创建一个新的 Laravel 应用程序，你可以在终端中运行以下命令：

```shell
curl -s "https://laravel.build/example-app" | bash
```

当然，你可以将此 URL 中的「example-app」更改为你喜欢的任何内容。Laravel 应用程序的目录将在你执行命令的目录中创建。

创建项目后，你可以导航到应用程序目录并启动 Laravel Sail。Laravel Sail 提供了一个简单的命令行界面，用于与 Laravel 的默认 Docker 配置进行交互：

```shell
cd example-app
./vendor/bin/sail up
```

第一次运行 Sail `up` 命令时， Sail 的应用程序容器将在你的机器上构建。这可能需要几分钟。 **不用担心，随后尝试启动 Sail 会快得多。**

启动应用程序的 Docker 容器后，你可以在 Web 浏览器中访问应用程序： http://localhost 。

> 技巧：要继续了解有关 Laravel Sail 的更多信息，请查看其 [完整文档](/docs/laravel/9.x/sail)。

<a name="getting-started-on-windows"></a>
### Windows 入门

在新建 Laravel 应用前，请确保你的 Windows 电脑已经安装了 [Docker Desktop](https://www.docker.com/products/docker-desktop)。之后，请确保已经安装并启用了适用于 Linux 的 Windows 子系统 2 （WSL2）。 WSL 允许你在 Windows 10 上运行 Linux 二进制文件。关于如何安装并启用 WSL2，请参阅微软 [开发者环境文档](https://docs.microsoft.com/en-us/windows/wsl/install-win10)。

> 技巧：安装并启用 WSL2 后，请确保 Docker Desktop 已经 [配置为使用 WSL2 后端](https://docs.docker.com/docker-for-windows/wsl/)。

接下来，准备创建你的第一个 Laravel 项目。启动 [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)，为 WSL2 Linux 操作系统打开一个终端。之后，你可以使用简单的命令来新建 Laravel 项目。比如，想要在「example-app」文件夹中新建 Laravel 应用，可以在终端中运行以下命令：

```shell
curl -s https://laravel.build/example-app | bash
```

当然，你可以任意更改 URL 中的「example-app」。Laravel 应用将被创建在执行命令的文件夹中。

创建项目后，你可以切换到应用目录并启动 Laravel Sail。Laravel Sail 提供了一个简单的命令行接口，用于和 Laravel 默认 Docker 配置进行交互：

```shell
cd example-app
./vendor/bin/sail up
```

在你首次运行 Sail 的 `up` 命令的时候，Sail 的应用容器将会在你的机器上进行编译。这个过程将会花费几分钟时间。**不要担心，以后就会很快了。**

一旦应用的 Docker 容器启动了，你便可在 Web 浏览器中通过 http://localhost 访问你的应用了。

> 技巧：要继续学习更多关于 Laravel Sail 的知识，请参阅 [详细文档](/docs/laravel/9.x/sail)。

#### 使用 WSL2 进行开发

当然，你需要能够修改在 WSL2 安装中创建的 Laravel 应用程序文件。我们推荐你使用微软的 [Visual Studio Code](https://code.visualstudio.com) 编辑器并搭配其 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) 扩展，它们可以帮助你解决这个问题。

一旦这些工具成功安装，你可以使用 Windows Terminal 在应用根目录执行 `code .` 命令来打开任何 Laravel 项目。

<a name="getting-started-on-linux"></a>
### 在 Linux 使用 Laravel Sail

如果在 Linux 开发，并且已经安装了 [Docker Compose](https://docs.docker.com/compose/install/)，你可以使用简单的终端命令来创建一个新的 Laravel 项目。例如，要在「example-app」目录中创建新的 Laravel 应用，你可以在终端中运行如下命令：

```shell
curl -s https://laravel.build/example-app | bash
```

当然，你可以将 URL 中的「example-app」替换为任何你喜欢的内容。Laravel 应用程序的目录将在执行命令的目录中创建。

在项目创建完成后，你可以导航至应用目录和启动 Laravel Sail。Laravel Sail 提供了一个简单的命令行接口，用于与 Laravel 的默认 Docker 配置进行交互：

```shell
cd example-app
./vendor/bin/sail up
```

在你首次运行 Sail 的 `up` 命令的时候，Sail 的应用容器将会在你的机器上进行编译。这个过程将会花费一段时间。**不要担心，以后就会很快了。**

一旦应用的 Docker 容器启动了，你便可在 Web 浏览器中通过 http://localhost 访问你的应用了。

> 技巧：要继续学习更多关于 Laravel Sail 的知识，请参阅 [详细文档](/docs/laravel/9.x/sail)。

<a name="choosing-your-sail-services"></a>
### 选择你的 Sail 服务

当通过 Sail 创建一个新的 Laravel 应用程序时, 你可以通过 `with` 查询变量来选择哪些服务需要配置到你的新应用程序的 `docker-compose.yml` 文件。 可选择的服务包括 `mysql`，`pgsql`，`mariadb`，`redis`，`memcached`，`meilisearch`，`minio`，`selenium` 和 `mailhog`：

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

如果你没有制定你想配置的服务, 默认将配置 `mysql`，`redis`，`meilisearch`，`mailhog` 和 `selenium`。

你可以通过在 URL 中添加 [容器开发](/docs/laravel/9.x/sail#using-devcontainers)
参数来指定 Sail 默认安装的服务。

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="installation-via-composer"></a>
### 通过 Composer 安装

如果你的终端已经安装了 PHP 和 Composer，你可以直接使用 Composer 来创建一个新的 Laravel 项目。 当应用程序创建完成后，你可以通过 Artisan CLI 的 `serve` 命令来启动 Laravel 的本地服务：

```shell
composer create-project laravel/laravel example-app
cd example-app
php artisan serve
```

<a name="the-laravel-installer"></a>
#### 通过 Laravel 安装器

或者, 你可以通过 Laravel 安装器作为全局 Composer 依赖：

```shell
composer global require laravel/installer
laravel new example-app
cd example-app
php artisan serve
```

请确保将 Composer 的全局 vendor bin 目录放置在你的系统环境变量 `$PATH` 中，以便系统可以找到 `laravel` 的可执行文件。在不同的操作系统中，该目录的路径也不相同；下面列出一些常见的位置：

<div class="content-list" markdown="1">

- macOS: `$HOME/.composer/vendor/bin`
- Windows: `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin`
- GNU / Linux Distributions: `$HOME/.config/composer/vendor/bin` or `$HOME/.composer/vendor/bin`

</div>

为方便起见，Laravel 安装程序还可以为你的新项目创建一个 Git 仓库。如需创建 Git 仓库，请在创建新项目时通过 `--git` 指定：

```shell
laravel new example-app --git
```
此命令将为你的项目初始化一个新的 Git 仓库并自动提交基础的 Laravel 框架。使用 `git` 命令前请确保你已正确安装并配置 Git。你还可以使用该 `--branch` 命令来设置初始的分支名称：

```shell
laravel new example-app --git --branch="main"
```

除了使用 `--git` 命令之外，你还可以使用 `--github` 命令在 GitHub 上创建相应的私有仓库：

```shell
laravel new example-app --github
```

创建的仓库将在 `https://github.com/<your-account>/example-app` 上。 使用 `github` 命令前请确保你已正确安装 [GitHub CLI](https://cli.github.com) 并已通过 GitHub 进行身份验证。此外，你还应该安装 `git` 并正确配置。如果需要，你可以传递 GitHub CLI 支持的其它命令：

```shell
laravel new example-app --github="--public"
```

你可以使用 `--organization` 命令在特定的 GitHub 组织下创建仓库：

```shell
laravel new example-app --github="--public" --organization="laravel"
```

## 初始配置
Laravel 框架的所有配置文件都存储在 `config` 目录中。每个选项都有文档记录，所以请随意浏览这些文件并熟悉可用的选项。

Laravel 几乎不需要额外的配置。你可以自由地开始开发！然而，你可能希望查看 `config/app.php` 文件及其文档。它包含几个选项，比如 `timezone` 和 `locale`，你可能希望根据你的应用程序进行更改。

<a name="environment-based-configuration"></a>
### 基于环境的配置

由于 Laravel 的许多配置选项值可能会根据你的应用程序是在本地计算机上还是在生产 Web 服务器上运行而有所不同，因此许多重要的配置值是使用 `.env` 存在于应用程序根目录中的文件来定义的。

你的 `.env` 文件不应提交到应用程序的源代码管理，因为每个使用你的应用程序的开发人员/服务器可能需要不同的环境配置。此外，如果入侵者获得对你的源代码控制存储库的访问权限，这将是一个安全风险，因为任何敏感凭据都会被暴露。

> 技巧：有关 `.env` 基于文件和环境的配置的更多信息，请查看完整的 [配置文档](/docs/laravel/9.x/configuration#environment-configuration)。

<a name="directory-configuration"></a>
### 目录配置

Laravel 应该始终从为你的 Web 服务器配置的「Web 目录」的根目录中提供服务。你不应该尝试从「Web 目录」的子目录中提供 Laravel 应用程序。尝试这样做可能会暴露应用程序中存在的敏感文件。

<a name="next-steps"></a>
## 下一步

现在你已经创建了 Laravel 项目，你可能想知道接下来要学习什么。首先，我们强烈建议你通过阅读以下文档来熟悉 Laravel 的工作原理：

<div class="content-list" markdown="1">

- [请求生命周期](/docs/laravel/9.x/lifecycle)
- [配置](/docs/laravel/9.x/configuration)
- [目录结构](/docs/laravel/9.x/structure)
- [服务容器](/docs/laravel/9.x/container)
- [Facades](/docs/laravel/9.x/facades)

</div>

你想如何使用 Laravel 也将决定你旅程的下一步。有多种使用 Laravel 的方法，我们将探讨以下框架的两个主要用例。

<a name="laravel-the-fullstack-framework"></a>
### Laravel 全栈框架

Laravel 可以作为一个全栈框架。「全栈」框架是指你将使用 Laravel 将请求路由到你的应用程序，并通过 [Blade 模板](/docs/laravel/9.x/blade) 或使用单页应用程序混合技术 [Inertia.js](https://inertiajs.com) 呈现你的前端。这是使用 Laravel 框架最常见的方式。

如果这是你计划使用 Laravel 的方式，你可能需要查看我们关于 [路由](/docs/laravel/9.x/routing)，[视图](/docs/laravel/9.x/views)，或者 [Eloquent ORM](/docs/laravel/9.x/eloquent) 的文档。此外，你可能有兴趣了解 [Livewire](https://laravel-livewire.com) 和 [Inertia.js](https://inertiajs.com) 等社区软件包。这些包允许你将 Laravel 用作全栈框架，同时享受单页 JavaScript 应用程序提供的许多 UI 优势。

如果你使用 Laravel 作为全栈框架，我们也强烈建议你学习如何使用 [Laravel Mix](/docs/laravel/9.x/mix) 编译应用程序的 CSS 和 JavaScript 。

> 技巧：如果你想尽快构建你的应用程序，请查看我们的官方 [应用程序入门工具包](/docs/laravel/9.x/starter-kits)。

<a name="laravel-the-api-backend"></a>
### Laravel API 后端

Laravel 也可以作为 JavaScript 单页应用程序或移动应用程序的 API 后端。例如，你可以使用 Laravel 作为 [Next.js](https://nextjs.org) 应用程序的 API 后端。在这种情况下，你可以使用 Laravel 为你的应用程序提供 [身份验证](/docs/laravel/9.x/sanctum) 和数据存储/检索，同时还可以利用 Laravel 的强大服务，例如队列、电子邮件、通知等。

如果这是你计划使用 Laravel 的方式，你可能需要查看我们关于 [路由](/docs/laravel/9.x/routing), [Laravel Sanctum](/docs/laravel/9.x/sanctum) 和 [Eloquent ORM](/docs/laravel/9.x/eloquent) 的文档。

> 技巧：需要抢先搭建 Laravel 后端和 Next.js 前端的脚手架？Laravel Breeze 提供了 [API 堆栈](/docs/laravel/9.x/starter-kits#breeze-and-next) 以及 [Next.js 前端实现](https://github.com/laravel/breeze-next) ，因此你可以在几分钟内开始使用。