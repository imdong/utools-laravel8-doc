# 安装

- [认识 Laravel](#meet-laravel)
   - [为什么选择 Laravel?](#why-laravel)
- [你的第一个 Laravel 项目](#your-first-laravel-project)
- [Laravel & Docker](#laravel-and-docker)
   - [macOS 入门](#getting-started-on-macos)
   - [Windows 入门](#getting-started-on-windows)
   - [Linux 入门](#getting-started-on-linux)
   - [选择 Sail 服务](#choosing-your-sail-services)
- [初始化](#initial-configuration)
   - [基于环境的配置](#environment-based-configuration)
   - [目录配置](#databases-and-migrations)
- [下一步](#next-steps)
   - [将 Laravel 用作全栈框架](#laravel-the-fullstack-framework)
   - [将 Laravel 用作 API 后端](#laravel-the-api-backend)

<a name="meet-laravel"></a>
## 认识 Laravel
Laravel 是一个 Web 应用框架， 有着表现力强、语法优雅的特点。Web 框架为创建应用提供了一个结构和起点，你只需要专注于创造，我们来为你处理细节。

Laravel 致力于提供出色的开发体验，同时提供强大的特性，例如完全的依赖注入，富有表现力的数据库抽象层，队列和计划任务，单元和集成测试等等。

无论你是刚刚接触 PHP 和 Web 框架的新人，亦或是有着多年经验的老手， Laravel 都是一个可以与你一同成长的框架。我们将帮助你迈出成为 Web 开发者的第一步，或是将你的经验提高到下一个等级。我们迫不及待的想看看你的作品。

<a name="why-laravel"></a>
### 为什么选择 Laravel?

有非常多的工具和框架可以被用于构建一个 Web 应用。但我们相信 Laravel 是构建现代化、全栈 Web 应用的最佳选择。

#### 一个渐进式框架

我们喜欢称 Laravel 是一个「渐进式」框架。意思是 Laravel 将与你一同成长。如果你是首次进入 Web 开发， Laravel 大量的文档、指南和 [视频教程](https://laracasts.com) 将帮助你熟悉使用技巧而不至于不知所措。

如果你是高级开发人员, Laravel 为你提供了强大的工具用于 [依赖注入](/docs/laravel/10.x/container)、 [单元测试](/docs/laravel/10.x/testing)、 [队列](/docs/laravel/10.x/queues)、 [广播系统](/docs/laravel/10.x/broadcasting) 等等。 Laravel 为构建专业的 Web 应用程序进行了微调，并准备好处理企业工作负载。

#### 一个可扩展的框架

Laravel 具有难以置信的可扩展性。由于 PHP 的灵活性以及 Laravel 对 Redis 等快速分布式缓存系统的内置支持，使用 Laravel 进行扩展是轻而易举的事。事实上，Laravel 应用程序已经很容易扩展到每月处理数亿个请求。

需要节省开发费用吗？ [Laravel Vapor](https://vapor.laravel.com) 允许你在 AWS 最新的无服务器技术上以几乎无限的规模运行 Laravel 应用程序。

#### 一个社区化的框架

Laravel 结合了 PHP 生态系统中最好的软件包，提供了最健壮、对开发人员友好的框架。此外，来自世界各地的数千名有才华的开发人员 [为框架做出了贡献](https://github.com/laravel/framework) 。谁知道呢，也许你就是下一个 Laravel 的贡献者。

## 你的第一个 Laravel 项目

在创建你的第一个Laravel项目之前, 你应该确保你的本地机器上已经安装了 PHP 和 [Composer](https://getcomposer.org) 。 如果你是在 macOS 上开发， PHP 和 Composer 可以通过 [Homebrew](https://brew.sh/) 来安装。 此外, 我们建议你 [安装 Node 和 NPM](https://nodejs.org)。

安装 PHP 和 Composer 后，你可以通过`create-project`命令创建一个新的 Laravel 项目：

```nothing
composer create-project laravel/laravel example-app
```

或者，你可以通过 Laravel 安装器作为全局 Composer 依赖：

```nothing
composer global require laravel/installer

laravel new example-app
```

当应用程序创建完成后，你可以通过 Artisan CLI 的`serve`命令来启动 Laravel 的本地服务：

```nothing
cd example-app

php artisan serve
```

启动 Artisan 开发服务器后，你便可在 Web 浏览器中通过`http://localhost:8000`访问。 接下来，[你已经准备好开始进入 Laravel 生态系统的下一步](#next-steps)。 当然， 你也可能需要 [配置数据库](#databases-and-migrations)。

> **技巧**
> 如果你想在开发Laravel应用程序时领先一步， 可以考虑使用我们的 [入门套件](/docs/laravel/10.x/starter-kits)。 Laravel 的入门套件为你的新 Laravel 应用程序提供后端和前端身份验证脚手架。

<a name="laravel-and-docker"></a>
## Laravel & Docker

我们希望尽可能轻松地开始使用 Laravel，无论你喜欢哪种操作系统。因此，在本地计算机上开发和运行 Laravel 项目有多种选择。虽然你可能希望稍后探索这些选项，但 Laravel 提供了 [Sail](/docs/laravel/10.x/sail)，这是一个使用 [Docker](https://www.docker.com) 运行 Laravel 项目的内置解决方案。

Docker 是一种在小型、轻量级「容器」中运行应用程序和服务的工具，不会干扰本地机器上已安装的软件或配置。这意味着你不必担心在本地机器上配置或设置复杂的开发工具，如 Web 服务器和数据库。要开始，你只需要安装 [Docker Desktop](https://www.docker.com/products/docker-desktop).

Laravel Sail 是一个轻量级的命令行界面，用于与 Laravel 的默认 Docker 配置进行交互。Sail 为使用 PHP、MySQL 和 Redis 构建 Laravel 应用程序提供了一个很好的起点，而无需之前的 Docker 经验。

> **技巧**
> 已经是 Docker 专家？别担心！关于 Sail 的一切都可以使用 Laravel 附带的文件 `docker-compose.yml` 进行自定义。

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

第一次运行 Sail `up` 命令时， Sail 的应用程序容器将在你的机器上构建。这可能需要几分钟。 **不用担心，随后尝试启动 Sail 会快得多。**

启动应用程序的 Docker 容器后，你可以在 Web 浏览器中访问应用程序： http://localhost 。

> **技巧**
> 要继续了解有关 Laravel Sail 的更多信息，请查看其 [完整文档](/docs/laravel/10.x/sail)。

<a name="getting-started-on-windows"></a>
### Windows 入门

在创建 Laravel 应用前，请确保你的 Windows 电脑已经安装了 [Docker Desktop](https://www.docker.com/products/docker-desktop)。请确保已经安装并启用了适用于 Linux 的 Windows 子系统 2（WSL2），WSL 允许你在 Windows10 上运行 Linux 二进制文件。关于如何安装并启用 WSL2，请参阅微软 [开发者环境文档](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

> **技巧**
> 安装并启用 WSL2 后，请确保 Docker Desktop 已经 [配置为使用 WSL2 后端](https://docs.docker.com/docker-for-windows/wsl/).

接下来，准备创建你的第一个 Laravel 项目，启动 Windows Terminal，为 WSL2 Linux 操作系统打开一个终端。之后，你可以使用简单的命令来新建 Laravel 项目。比如，想要在「example-app」文件夹中新建 Laravel 应用，可以在终端中运行以下命令：

```shell
curl -s https://laravel.build/example-app | bash
```

当然，你可以将此 URL 中的「example-app」更改为你喜欢的任何内容，只需确保应用程序名称仅包含字母数字字符、破折号和下划线 Laravel 应用程序的目录将在你执行命令的目录中创建。

Sail 安装可能需要几分钟时间，因为 Sail 的应用程序容器是在你的本地计算机上构建的。

创建项目后，你可以导航到应用程序目录并启动 Laravel Sail。 Laravel Sail 提供了一个简单的命令行界面来与 Laravel 的默认 Docker 配置进行交互：

```shell
cd example-app

./vendor/bin/sail up
```

一旦应用的 Docker 容器启动了，你便可在 Web 浏览器中通过 localhost 访问你的应用了。

> **技巧**
> 要继续学习更多关于 Laravel Sail 的知识，请参阅 [详细文档](/docs/laravel/10.x/sail).

#### 使用 WSL2 进行开发

当然，你需要能够修改在 WSL2 安装中创建的 Laravel 应用程序文件。我们推荐你使用微软的 [Visual Studio Code](https://code.visualstudio.com) 编辑器并搭配其 [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) 扩展，它们可以帮助你解决这个问题。

一旦这些工具成功安装，你可以使用 Windows Terminal 在应用根目录执行 `code .` 命令来打开任何 Laravel 项目。

<a name="getting-started-on-linux"></a>
### 在 Linux 使用 Laravel Sail

如果在 Linux 开发，并且已经安装了 [Docker Compose](https://docs.docker.com/compose/install/) 你可以使用简单的终端命令来创建一个新的 Laravel 项目。例如，要在「example-app」目录中创建新的 Laravel 应用，你可以在终端中运行如下命令：

```shell
curl -s https://laravel.build/example-app | bash
```

当然，你可以将 URL 中的「example-app」替换为任何你喜欢的内容。Laravel 应用程序的目录将在执行命令的目录中创建。

在项目创建完成后，你可以导航至应用目录和启动 Laravel Sail。Laravel Sail 提供了一个简单的命令行接口，用于与 Laravel 的默认 Docker 配置进行交互：

```shell
cd example-app

./vendor/bin/sail up
```
在你首次运行 Sail 的 `up` 命令的时候，Sail 的应用容器将会在你的机器上进行编译。这个过程将会花费一段时间。**不要担心，以后就会很快了。**

一旦应用的 Docker 容器启动了，你便可在 Web 浏览器中通过 http://localhost 访问你的应用了。

> **技巧**
> 要继续学习更多关于 Laravel Sail 的知识，请参阅 [ 详细文档](/docs/laravel/10.x/sail)。

<a name="choosing-your-sail-services"></a>
### 选择 Sail 服务

通过 Sail 创建 Laravel 程序时，可以使用 `with` 查询字符串变量来选择程序的 `docker-compose.yml` 文件配置哪些服务。可用的服务包括 `mysql`, `pgsql`, `mariadb`, `redis`, `memcached`, `meilisearch`, `minio`, `selenium`, 和 `mailpit`:

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

如果不指定配置服务，将使用 `mysql`, `redis`, `meilisearch`, `mailpit`, 和 `selenium` 作为默认配置。

还可以通过 `devcontainer`参数添加到 URL 来安装默认的 [Devcontainer](/docs/laravel/10.x/sailmd#using-devcontainers):

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="initial-configuration"></a>
## 安装配置

Laravel 框架将所有的配置文件都放在 `config` 目录中。每个选项都有一个文件，因此可以浏览文件并熟悉可用的选项。

Laravel 开箱可用，不需要额外配置，你可以自由的开发！然而，你可能希望查看 `config/app.php` 文件及其文档。它包含几个选项，例如你可能希望根据程序更改 `timezone` 和 `locale`。

<a name="environment-based-configuration"></a>
### 环境配置

Laravel 的许多配置选项值可能会根据运行的环境有所不同，因此许多重要的配置选项值是在 `.env` 文件中定义的。

你的 `.env` 文件不应该提交到应用程序的源代码控制中，因为使用你的应用程序的每个开发者/服务器可能需要不同的环境配置。此外，如果入侵者访问了你的源代码仓库，这将成为安全风险，因为任何敏感数据都会被公开。

> **注意**
> 若要了解更多关于 `.env` 文件和基于环境的配置的信息，请查看完整的 [配置文档](/docs/laravel/10.x/configurationmd#environment-configuration)。

<a name="databases-and-migrations"></a>
### 数据库和迁移

现在，你已经创建了 Laravel 应用程序，可能想在数据库中存储一些数据。默认情况下，你的应用程序的 `.env` 配置文件指定 Laravel 将与 MySQL 数据库交互，并访问 `127.0.0.1` 中的数据库。如果你在 macOS 上开发并需要在本地安装 MySQL、Postgres 或 Redis，则可能会发现使用 [DBngin](https://dbngin.com/) 非常方便。

如果你不想在本地机器上安装 MySQL 或 Postgres，你总可以使用 [SQLite](https://www.sqlite.org/index.html) 数据库。SQLite 是一个小型、快速、自包含的数据库引擎。要开始使用，只需创建一个空的 SQLite 文件来创建 SQLite 数据库。通常，这个文件将存在于 Laravel 应用程序的 `database` 目录中：

```shell
touch database/database.sqlite
```

接下来，更新你的 `.env` 配置文件以使用 Laravel 的 `sqlite` 数据库驱动程序。你可以删除其他数据库配置选项：

```ini
DB_CONNECTION=sqlite # [tl! add]
DB_CONNECTION=mysql # [tl! remove]
DB_HOST=127.0.0.1 # [tl! remove]
DB_PORT=3306 # [tl! remove]
DB_DATABASE=laravel # [tl! remove]
DB_USERNAME=root # [tl! remove]
DB_PASSWORD= # [tl! remove]
```

一旦你配置了 SQLite 数据库，你可以运行你的应用程序的 [数据库迁移](/docs/laravel/10.x/migrations)，这将创建你的应用程序的数据库表：

```shell
php artisan migrate
```

<a name="next-steps"></a>
## 下一步

现在你已经创建了你的 Laravel 项目，你可能在想下一步该学什么。首先，我们强烈建议通过阅读以下文档来了解 Laravel 的工作方式：

<div class="content-list" markdown="1">

  -   [请求生命周期](/docs/laravel/10.x/lifecycle)
    -   [配置](/docs/laravel/10.x/configuration)
    -   [目录结构](/docs/laravel/10.x/structure)
    -   [前端](/docs/laravel/10.x/frontend)
    -   [服务容器](/docs/laravel/10.x/container)
    -   [门面](/docs/laravel/10.x/facades)

</div>

你如何使用 Laravel 也会决定你的下一步。Laravel 有多种使用方式，下面我们将探索框架的两个主要用例。

> **注意**
> 是第一次使用 Laravel 吗？请查看 [Laravel Bootcamp](https://bootcamp.laravel.com) 可让你实际操作 Laravel 框架并带你构建第一个 Laravel 应用程序。

<a name="laravel-the-fullstack-framework"></a>
### Laravel 全栈框架

Laravel 可以作为一个全栈框架。全栈框架意味着你将使用 Laravel 将请求路由到你的应用程序，并通过 [Blade 模板](/docs/laravel/10.x/blade) 或像 [Inertia](https://inertiajs.com) 这样的单页应用混合技术来渲染你的前端。这是使用 Laravel 框架最常见的方式，在我们看来，这也是使用 Laravel 最高效的方式。

如果你打算使用 Laravel 进行全栈开发，你可能想查看我们的 [前端开发文档](/docs/laravel/10.x/frontend)、[路由文档](/docs/laravel/10.x/routing)、[视图文档](/docs/laravel/10.x/views) 或 [Eloquent ORM](/docs/laravel/10.x/eloquent)。此外，你可能会对学习像 [Livewire](https://laravel-livewire.com) 和 [Inertia](https://inertiajs.com) 这样的社区包感兴趣。这些包允许你将 Laravel 用作全栈框架，同时享受单页 JavaScript 应用程序提供的许多 UI 好处。

如果你使用 Laravel 作为全栈框架，我们也强烈建议你学习如何使用 [Vite](/docs/laravel/10.x/vite) 编译应用程序的 CSS 和 JavaScript 。

> 技巧：如果你想尽快构建你的应用程序，请查看我们的官方 [应用程序入门工具包](/docs/laravel/10.x/starter-kits)。

<a name="laravel-the-api-backend"></a>
### Laravel API 后端

Laravel 也可以作为 JavaScript 单页应用程序或移动应用程序的 API 后端。例如，你可以使用 Laravel 作为 [Next.js](https://nextjs.org) 应用程序的 API 后端。在这种情况下，你可以使用 Laravel 为你的应用程序提供 [身份验证](/docs/laravel/10.x/sanctum) 和数据存储/检索，同时还可以利用 Laravel 的强大服务，例如队列、电子邮件、通知等。

如果这是你计划使用 Laravel 的方式，你可能需要查看我们关于 [路由](/docs/laravel/10.x/routing)，[Laravel Sanctum](/docs/laravel/10.x/sanctum) 和 [Eloquent ORM](/docs/laravel/10.x/eloquent) 的文档。

> 技巧：需要抢先搭建 Laravel 后端和 Next.js 前端的脚手架？Laravel Breeze 提供了 [API 堆栈](/docs/laravel/10.x/starter-kitsmd#breeze-and-next) 以及 [Next.js 前端实现](https://github.com/laravel/breeze-next) ，因此你可以在几分钟内开始使用。