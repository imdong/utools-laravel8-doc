
# Laravel Sail

- [介绍](#introduction)
- [安装 & 设定](#installation)
    - [安装 Sail 到当前应用中](#installing-sail-into-existing-applications)
    - [配置 Bash 别名](#configuring-a-bash-alias)
- [启动 & 停止 Sail](#starting-and-stopping-sail)
- [执行命令](#executing-sail-commands)
    - [执行 PHP 命令](#executing-php-commands)
    - [执行 Composer 命令](#executing-composer-commands)
    - [执行 Artisan 命令](#executing-artisan-commands)
    - [执行 Node / NPM 命令](#executing-node-npm-commands)
- [与数据库交互](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [Redis](#redis)
    - [MeiliSearch](#meilisearch)
- [文件存储](#file-storage)
-   [运行测试](#running-tests)
    - [Laravel Dusk](#laravel-dusk)
- [预览电子邮件](#previewing-emails)
- [容器 CLI](#sail-container-cli)
- [PHP 版本](#sail-php-versions)
- [Node 版本](#sail-node-versions)
- [共享您的网站](#sharing-your-site)
- [使用 Xdebug 进行调试](#debugging-with-xdebug)
    - [通过命令行使用 Xdebug 进行调试](#xdebug-cli-usage)
    - [通过浏览器使用 Xdebug 进行调试](#xdebug-browser-usage)
- [定制化](#sail-customization)

<a name="introduction"></a>
## 介绍

[Laravel Sail](https://github.com/laravel/sail) 是一个轻量级的命令行界面，用于与 Laravel 的默认 Docker 开发环境进行交互。Sail 为使用 PHP, MySQL, 和 Redis 构建 Laravel 应用提供了一个很好的起点，不需要事先有 Docker 经验。

Sail 的核心是 `docker-compose.yml` 文件和存储在项目根目录的 `sail` 脚本。`sail` 脚本为 CLI 提供了便捷的方法，可用于与 `docker-compose.yml` 文件定义的 Docker 容器进行交互。

Laravel Sail 支持 macOS、Linux 和 Windows (通过 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)）。

<a name="installation"></a>
## 安装 & 设定

Laravel Sail 会随着所有全新的 Laravel 应用程序一起自动安装，因此你可以立即的开始使用它。要了解如何创建一个新的 Laravel 应用程序，请查阅适合您目前操作系统的 [安装文档](https://learnku.com/docs/laravel/10.x/installation)。在安装过程中，你将被要求选择你的应用程序将与哪些 Sail 支持的服务进行交互。


<a name="installing-sail-into-existing-applications"></a>
### 安装 Sail 到当前应用中

假如你有兴趣在你现有的 Laravel 应用程序中使用 Sail，你可以透过 Composer 套件管理简单的安装 Sail。当然，这些步骤的前提是假设你现有的本地开发环境允许你安装 Copmoser 依赖：

```shell
composer require laravel/sail --dev
```

在 Sail 完成安装后，你可以运行 Artisan 命令 `sail:install`。这个命令将会发布 Sail 的 `docker-compose.yml` 文件到你应用程序的根目录：

```shell
php artisan sail:install
```

最后，你可以启动 Sail 的服务了。想要继续学习如何使用 Sail，请接着阅读本文挡的其余部分：

```shell
./vendor/bin/sail up
```

<a name="adding-additional-services"></a>
#### 增加额外服务

如果你想在你现有的 Sail 安装中添加一个额外的服务，你可以运行`sail:add` Artisan 命令。

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### 使用开发容器

如果你想在 [Devcontainer](https://code.visualstudio.com/docs/remote/containers) 中进行开发，你可以在执行 `sail:install` 命令时添加 `--devcontainer` 参数。`--devcontainer` 将指示 `sail:install` 命令将默认的 `.devcontainer/devcontainer.json` 文件发布到你的应用程序根目录：

```shell
php artisan sail:install --devcontainer
```

<a name="configuring-a-shell-alias"></a>
### 配置 Shell 别名

默认情况下，Sail 命令使用 `vendor/bin/sail` 脚本调用，该脚本已包含在所有新建的 Laravel 应用程序中：

```shell
./vendor/bin/sail up
```

但与其重复的输入 `vendor/bin/sail` 来执行 Sail 命令，你可能会希望配置一个 Shell 别名方便你更容易的执行 Sail 命令：

```shell
alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'
```


为了确保这一点始终可用，你可以把它添加到你的主目录下的 shell 配置文件中，如 `~/.zshrc` 或 `~/.bashrc` ，然后重新启动你的 shell。

一旦配置了 shell 别名，你可以通过简单地输入 `sail` 来执行 Sail 命令。本文接下来的示例都假定你已经配置了此别名：

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## 启动 & 停止 Sail

Laravel Sail 的 `docker-compose.yml` 文件定义了各种 Docker 容器，它们可以协同工作以帮助你构建 Laravel 应用程序。每一个容器都定义在 `docker-compose.yml` 文件的 `services` 的配置内。 `laravel.test` 容器是将服务于您的应用程序的主要应用程序容器。

在开始 Sail 之前，你应该确认没有其他的网站服务器或数据库正运行在你的本地计算机上。要开始启用 `docker-compose.yml` 文件中定义的所有 Docker 容器，请执行 `up` 命令：

```shell
sail up
```

要在后台启动所有的 Docker 容器，你可以以 "detached" 模式启动 Sail。

```shell
sail up -d
```

启动应用程序的容器后，你可以通过 Web 浏览器中访问项目：[http://localhost](http://localhost/).

要停止所有的容器，你可以简单的按 Control + C 来停止容器的执行。或者，如果容器是在后台运行的，你可以使用 `stop` 命令。

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## 执行命令

使用 Laravel Sail 时，应用程序在 Docker 容器中执行，并且与本地计算机隔离。不过 Sail 提供了一种针对应用程序运行各种命令的便捷方法，例如任意的 PHP 命令，Artisan 命令，Composer 命令和 Node / NPM 命令。



**当你阅读 Laravel 文档时，你可能经常看到在未使用 Sail 的状况下运行 Composer，Artisan 或是 Node / NPM 命令。** 以下示例假设你已经在本地计算机上安装上述工具。如果你打算使用 Sail 建构你的本地开发环境 ，你需要改用 Sail 运行这些命令：

```shell
# 在本地运行 Artisan 命令...
php artisan queue:work

# 在 Laravel Sail 中运行 Artisan 命令...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### 执行 PHP 命令

PHP 命令可以使用 `php` 命令执行。当然，这些命令将使用为你的应用程序配置的 PHP 版本执行。要了解更多关于 PHP 版本可用的 Laravel Sail 信息，请查阅 [PHP 版本文档](#sail-php-versions)：

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### 执行 Composer 命令

Composer 命令可以使用 `composer` 命令执行。Laravel Sail 的应用程序容器中已经安装 Composer 2.x：

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### 在已运行的应用中安装 Composer 依赖

假如你与团队一起开发应用程序，你也许不是最初创建 Laravel 应用程序的人。因此，当你克隆应用程序的仓库到本地计算机后，仓库默认不会安装的任何 Composer 依赖项，也包括 Sail。

你可以进入到应用程序目录下并执行以下命令来安装应用所需的依赖，这个命令使用一个包含 PHP 与 Composer 的小型 Docker 容器进行应用程序依赖的安装：

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php82-composer:latest \
    composer install --ignore-platform-reqs
```



当你使用 `laravelsail/phpXX-composer` 镜像时，你应该选择和你的应用程序所用环境相同的 PHP 版本（`74`、`80`、`81`或 `82`）。

<a name="executing-artisan-commands"></a>
### 执行 Artisan 命令

Artisan 命令可以使用 `artisan` 命令执行：

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### 执行 Node / NPM 命令

Node 命令可以使用 `node` 命令执行，而 NPM 命令可以使用 `npm` 命令执行：

```shell
sail node --version

sail npm run dev
```

如果你愿意，你可以使用 Yarn 代替 NPM：

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## 与数据库交互

<a name="mysql"></a>
### MySQL

你可能已经注意到，应用程序的 `docker-compose.yml` 文件包含一个 MySQL 容器的配置。该容器使用了 [Docker volume](https://docs.docker.com/storage/volumes/)，以便即使在停止和重新启动容器时依然可以持久存储数据库中存储的数据。

此外，在MySQL容器第一次启动时，它将为你创建两个数据库。第一个数据库使用你的 `DB_DATABASE` 环境变量的值命名，用于你的本地开发。第二个是专门的测试数据库，名为 `testing`，将确保你的测试不会干扰你的开发数据。

一旦你启动了你的容器，你可以通过在你的应用程序的 `.env` 文件中设置 `DB_HOST` 环境变量来连接到你的应用程序中的 MySQL 实例 `mysql`。

要从你的本地机器连接到你的应用程序的 MySQL 数据库，你可以使用一个图形化的数据库管理应用程序，如 [TablePlus](https://tableplus.com/)。默认情况下，MySQL 数据库可以通过 `localhost` 端口 3306 访问，访问凭证与 `DB_USERNAME` 和 `DB_PASSWORD` 环境变量的值一致。或者，你可以以 `root` 用户的身份连接，它也利用 `DB_PASSWORD` 环境变量的值作为密码。



<a name="redis"></a>
### Redis

应用程序的 `docker-compose.yml` 文件也包含 [Redis](https://redis.io/) 容器的配置，此容器使用 [Docker volume](https://docs.docker.com/storage/volumes/)，以便即使在停止和重新启动容器后，Redis 数据中存储的数据也可以持久保存。启动容器后，可以通过将应用程序 `.env` 文件中的环境变量 `REDIS_HOST` 设置为 `redis` 来连接到应用程序中的 Redis 实例。


要从本地计算机连接到应用程序的 Redis 数据库，可以使用图形数据库管理应用程序，例如 [TablePlus](https://tableplus.com/)。默认情况下，可以从 `localhost` 的 6379 端口访问 Redis 数据库。

<a name="meilisearch"></a>
### Meilisearch

如果你在安装 Sail 时选择安装 [MeiliSearch](https://www.meilisearch.com) 服务，你的应用程序的 `docker-compose.yml` 文件将包含一个 [Laravel Scout](/docs/laravel/10.x/scout) 兼容且强大的[搜索引擎服务组件配置](https://github.com/meilisearch/meilisearch-laravel-scout)。启动容器后，你可以通过将环境变量 `MEILISEARCH_HOST` 设置为 `http://meilisearch:7700` 来连接到应用程序中的 MeiliSearch 实例。

要从本地计算机访问 MeiliSearch 的 Web 管理面板，你可以通过浏览器访问 `http://localhost:7700`。

<a name="file-storage"></a>
## 文件存储

如果你计划在生产环境中运行应用程序时使用 Amazon S3 存储文件，你可能希望在安装 Sail 时安装 [MinIO](https://min.io) 服务。 MinIO 提供了一个与 S3 兼容的 API，你可以使用 Laravel 的 `s3` 文件存储驱动程序在本地进行开发，而无需在生产 S3 环境中创建用于测试的存储桶。如果在安装 Sail 时选择安装 MinIO，部分 MinIO 相关的配置将添加到应用程序的 `docker-compose.yml` 文件中。



默认情况下，应用程序的 `filesystems`  配置文件已经包含 `s3` 磁盘的磁盘配置。除了使用此磁盘与 Amazon S3 交互之外，你还可以使用它与任何 S3 兼容的文件存储服务（例如 MinIO）进行交互，只需修改控制其配置的关联环境变量即可。例如，在使用 MinIO 时，你的文件系统环境变量配置应定义如下：

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

为了让 Laravel 的 Flysystem 集成在使用 MinIO 时产生正确的 URL，你应该定义 `AWS_URL` 环境变量，使其与你的应用程序的本地 URL 相匹配，并在 URL 路径中包含桶的名称。

```ini
AWS_URL=http://localhost:9000/local
```

你可以通过 MinIO 控制台创建桶，该控制台可在 `http://localhost:8900` 。MinIO 控制台的默认用户名是 `sail`，默认密码是 `password`。

> **警告**
> 使用 MinIO 时，不支持通过 `temporaryUrl` 方法生成临时存储的 URL。

<a name="running-tests"></a>
## 运行测试

Laravel 提供了出色的开箱即用测试，你可以使用 Sail 的 `test` 命令运行应用程序的 [功能和单元测试](/docs/laravel/10.x/testing)。任何 PHPUnit 可接受的命令选项都可以透过 `test` 命令传递：

```shell
sail test

sail test --group orders
```

Sail `test` 命令相当于运行 Artisan `test` 命令：

```shell
sail artisan test
```



默认情况下, Sail会创建一个专门的 `测试` 数据库, 这样你的测试就不会干扰到你的数据库的当前状态. 在默认的Laravel安装中, Sail也会配置你的 `phpunit.xml` 文件, 在执行你的测试时使用这个数据库:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/laravel/10.x/dusk) 提供了非常优雅、易于使用的浏览器自动化测试 API。有了 Sail，进行浏览器测试更加方便了，你甚至不用在你的本地电脑上安装 Selenium 或者任何其他工具。要开启这项功能，请在 `docker-compose.yml` 文件中取消 Selenium 服务相关配置的注释：

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

下一步，请确认 `docker-compose.yml` 文件中的 `laravel.test` 服务配置 `depends_on` 是否包含了 `selenium` 选项：

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

最后，你可以透过启动 Sail 并运行 `dusk` 命令来进行 Dusk 测试：

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### 在 Apple Silicon 上运行 Selenium

如果你的本地机器包含 Apple Silicon 芯片，你的 `selenium` 服务必须使用 `seleniarm/standalone-chromium` 镜像：

```yaml
selenium:
    image: 'seleniarm/standalone-chromium'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## 预览电子邮件

Laravel Sail 默认的 `docker-compose.yml` 文件中包含了一个服务项 [Mailpit](https://github.com/axllent/mailpit)。Mailpit 在本地开发过程中拦截应用程序发送的邮件，并提供一个便捷的 Web 界面，这样你就可以在浏览器中预览你的邮件。当使用 Sail 时，Mailpit 的默认主机是 `mailpit` ，可通过端口 1025 使用。

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```



当 Sail 运行时，你可以透过 [http://localhost:8025](http://localhost:8025/) 访问 Mailpit 的 Web 界面。


<a name="sail-container-cli"></a>
## 容器 CLI

有时候，你可能想要在应用容器中开启一个 Bash 会话。 可以通过执行 `shell` 命令，以访问容器中的文件和已安装的服务，此外，你还可以执行其他任意 Shell 指令：

```shell
sail shell

sail root-shell
```

想打开一个新的 [Laravel Tinker](https://github.com/laravel/tinker) 会话，你可以执行 `tinker` 命令：

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## PHP 版本

Sail目前支持通过 PHP 8.2、8.1、PHP 8.0 或 PHP 7.4 为你的应用程序提供服务。目前 Sail 使用的默认 PHP 版本是 PHP 8.2。想更改应用程序使用的 PHP 版本，请在 `docker-compose.yml` 文件定义的容器 `laravel.test` 相应配置中调整 `build` 定义:

```yaml
# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0

# PHP 7.4
context: ./vendor/laravel/sail/runtimes/7.4
```

此外，你如果想更新你的镜像名称来反映当前使用的 PHP 版本，你可以在 `docker-compose.yml` 文件中调整 `image` 字段：

```yaml
image: sail-8.1/app
```

在修改 `docker-compose.yml` 文件过后，你需要重建容器镜像并重启 Sail：

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node 版本

Sail 默认安装 Node 18。要更改镜像构建时所安装的 Node 版本，你可以在应用程序的 `docker-compose.yml` 文件中更新 `laravel.test` 服务的 `build.args` 定义：

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '14'
```

在修改 `docker-compose.yml` 文件过后，你需要重建容器镜像并重启 Sail：

```shell
sail build --no-cache

sail up
```



<a name="sharing-your-site"></a>
## 共享你的网站

有时候你可能需要公开分享你的网站给同事，或是测试应用与 Webhook 的集成。想共享你的网站时，可以使用 `share` 命令。当你执行此命令后，将会获取一个随机的网址，例如 `laravel-sail.site` 用来访问你的应用程序：

```shell
sail share
```

当通过 `share` 命令共享你的站点时，你应该在 `TrustProxies` 中间件中配置应用程序的可信代理。否则，相关的URL 生成的助手函数，例如 `url` 和 `route` 将无法在生成 URL 生成过程中选择正确 HTTP 主机地址：

    /**
     * 应用程序的受信任代理
     *
     * @var array|string|null
     */
    protected $proxies = '*';

如果你想为你的共享站点自定义子域名，可以在执行 `share` 命令时加上 `subdomain` 参数：

```shell
sail share --subdomain=my-sail-site
```

> **注意**
> `share` 命令是由 [Expose](https://github.com/beyondcode/expose) 提供，这是 [BeyondCode](https://beyondco.de/) 的一个开源网络隧道服务。

<a name="debugging-with-xdebug"></a>
## 使用 Xdebug 进行调试

Laravel Sail 的 Docker 配置包含对 [Xdebug](https://xdebug.org/) 的支持，这是一个流行且强大的 PHP 调试器。为了启用 Xdebug，你需要在应用程序的 `.env` 文件中添加一些变量以 [配置 Xdebug](https://xdebug.org/docs/step_debug#mode)。要启用 Xdebug，你必须在启动 Sail 之前设置适当的应用模式：

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Linux 主机 IP 配置



在容器内部，`XDEBUG_CONFIG` 环境变量被定义为 `client_host=host.docker.internal` 以便为 Mac 和 Windows (WSL2) 正确配置 Xdebug。如果你的本地机器运行的是 Linux，确保你运行的是 Docker Engine 17.06.0+ 和 Compose 1.16.0+。否则，你将需要手动定义这个环境变量。

首先，你需要通过运行以下命令来确定要添加到环境变量中的正确主机 IP 地址。通常，`<container-name>` 应该是为你的应用程序提供服务的容器的名称，并且通常以 `_laravel.test_1` 结尾：

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

在获得正确的主机 IP 地址后，你需要在应用程序的 `.env` 文件中定义 `SAIL_XDEBUG_CONFIG` 变量：

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### 通过命令行使用 Xdebug 进行调试

在运行 Artisan 命令时，可以使用 `sail debug` 命令启动调试会话：

```shell
# 在没有 Xdebug 的情况下运行 Artisan 命令...
sail artisan migrate

# 使用 Xdebug 运行 Artisan 命令...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### 通过浏览器使用 Xdebug 进行调试

要在通过 Web 浏览器与应用程序交互时调试你的应用程序，请按照 [Xdebug 提供的说明](https://xdebug.org/docs/step_debug#web-application) 从 Web 浏览器启动 Xdebug 会话。

如果你使用的是 PhpStorm，请查看 JetBrains 关于 [零配置调试](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html) 的文档。

> **警告**
> Laravel Sail 依赖于 `artisan serve` 来为你的应用程序提供服务。从 Laravel 8.53.0 版本开始，`artisan serve` 命令只接受 `XDEBUG_CONFIG` 和 `XDEBUG_MODE` 变量。从 Laravel 8.53.0 版本开始，旧版本的 Laravel（8.52.0 及以下）不支持这些变量并且不接受调试连接。


<a name="sail-customization"></a>
## 定制化

因为 Sail 就是 Docker，所以你可以自由的定制任何内容，使用 `sail:publish` 命令可以将 Sail 预设的 Dockerfile 发布到你的应用程序中，以便于进行定制：

```shell
sail artisan sail:publish
```

运行这个命令后，Laravel Sail 预设好的 Dockerfile 和其他配置文件将被生成发布到项目根目录的 `docker` 目录中。当你自行定制 Sail 配置之后，你可以在应用程序的 `docker-compose.yml` 文件中更改应用程序容器的映像名称。在完成上述操作后，你需要使用 `build` 命令重新构建容器。如果你使用 Sail 在单台机器上开发多个 Laravel 应用程序，那么为应用程序的镜像分配一个唯一的名称将尤为重要：

```shell
sail build --no-cache
```

