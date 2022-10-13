# Laravel Homestead

- [介绍](#introduction)
- [安装与设置](#installation-and-setup)
    - [第一步](#first-steps)
    - [配置 Homestead](#configuring-homestead)
    - [配置 Nginx 站点](#configuring-nginx-sites)
    - [配置服务](#configuring-services)
    - [启动 Vagrant Box](#launching-the-vagrant-box)
    - [为项目单独安装](#per-project-installation)
    - [安装可选功能](#installing-optional-features)
    - [别名](#aliases)
- [更新 Homestead](#updating-homestead)
- [日常使用方法](#daily-usage)
    - [通过 SSH 连接](#connecting-via-ssh)
    - [添加其他站点](#adding-additional-sites)
    - [环境变量](#environment-variables)
    - [端口](#ports)
    - [多 PHP 版本](#php-versions)
    - [连接数据库](#connecting-to-databases)
    - [数据库备份](#database-backups)
    - [配置 Cron 调度器](#configuring-cron-schedules)
    - [配置 MailHog](#configuring-mailhog)
    - [配置 Minio](#configuring-minio)
    - [Laravel Dusk](#laravel-dusk)
    - [共享你的环境](#sharing-your-environment)
- [调试与性能分析](#debugging-and-profiling)
    - [使用 Xdebug 调试 Web 请求](#debugging-web-requests)
    - [调试 CLI 应用程序](#debugging-cli-applications)
    - [使用 Blackfire 为应用程序分析性能](#profiling-applications-with-blackfire)
- [网络接口](#network-interfaces)
- [扩展 Homestead](#extending-homestead)
- [针对虚拟机软件的特殊设置](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 介绍

Laravel 努力让整个 PHP 开发体验愉快，包括你的本地开发环境。 [Laravel Homestead](https://github.com/laravel/homestead) 是 Lavarel 官方预封装的 Vagrant Box 套件，它为你提供了一个绝佳的开发环境，而无需你在本地机器上安装 PHP 、Web 服务器及任何其他服务器软件。

[Vagrant](https://www.vagrantup.com) 提供了一种简单、优雅的方式来管理和配置虚拟机。 Vagrant Box 完全是一次性的。如果出现问题，你可以在几分钟内销毁并重新创建 Box !

Homestead 可以在任何 Windows、 macOS 或 Linux 系统上运行，它预装好了  Nginx、 PHP、 MySQL、 PostgreSQL、 Redis、 Memcached、 Node 以及开发令人惊叹的 Laravel 应用程序所需的所有其他软件。

> 注意：如果你使用的是 Windows ，你可能需要启用硬件虚拟化（ VT-x ）。该功能通常需要通过你的 BIOS 启用。如果你在 UEFI 系统上使用 Hyper-V ，则可能还需要禁用 Hyper-V 才能访问 VT-x 。



<a name="included-software"></a>
### 内置软件

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">
- Ubuntu 20.04
- Git
- PHP 8.1
- PHP 8.0
- PHP 7.4
- PHP 7.3
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
- Nginx
- MySQL 8.0
- lmm
- Sqlite3
- PostgreSQL 13
- Composer
- Node (包括 Yarn， Bower， Grunt 和 Gulp)
- Redis
- Memcached
- Beanstalkd
- Mailhog
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli
</div>

<a name="optional-software"></a>
### 可选软件

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">
- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Docker
- Elasticsearch
- EventStoreDB
- Gearman
- Go
- Grafana
- InfluxDB
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python
- R
- RabbitMQ
- RVM (Ruby 版本管理)
- Solr
- TimescaleDB
- Trader <small>(PHP 扩展)</small>
- Webdriver & Laravel Dusk Utilities
</div>

<a name="installation-and-setup"></a>
## 安装 & 设置

<a name="first-steps"></a>
### 第一步

在你启动 Homestead 环境之前， 你必须安装 [Vagrant](https://www.vagrantup.com/downloads.html) 及以下受支持的虚拟机之一：

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Downloads)
- [Parallels](https://www.parallels.com/products/desktop/)

以上所有软件均针对不同的操作系统提供了易于使用的可视化安装包。



如果要使用 Parallels 提供虚拟机服务，你需要安装 [Parallels Vagrant 插件](https://github.com/Parallels/vagrant-parallels)。这个插件是免费的。

<a name="installing-homestead"></a>
#### 安装 Homestead

你可以通过将 Homestead 存储库克隆到你的主机上来安装 Homestead。 考虑将存储库克隆到 `home` 目录中的 `Homestead` 文件夹中，因为 Homestead 虚拟机将作为所有 Laravel 应用程序的主机。 在本文档中，我们将此目录称为你的「Homestead 目录」：

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

克隆 Laravel Homestead 存储库后，你应该检出 `release` 分支。 这个分支总是包含 Homestead 的最新稳定版本：

```shell
cd ~/Homestead

git checkout release
```

接下来，从 Homestead 目录执行 `bash init.sh` 命令以创建 `Homestead.yaml` 配置文件。 `Homestead.yaml` 文件是你为 Homestead 安装配置所有设置的地方。 这个文件将被放置在 Homestead 目录中：

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### 配置 Homestead

<a name="setting-your-provider"></a>
#### 设置提供服务的虚拟机程序

`Homestead.yaml` 文件中的 `provider` 键指示应该使用哪个 Vagrant 提供虚拟机服务：`virtualbox` 或 `parallels`：

    provider: virtualbox

> 注意：如果你使用的是 Apple Silicon，你应该将 `box: laravel/homestead-arm` 添加到你的 `Homestead.yaml` 文件中。 Apple Silicon 下需要使用 Parallels 提供虚拟机服务。

<a name="configuring-shared-folders"></a>
#### 配置共享文件夹

`Homestead.yaml` 文件的 `folders` 属性列出了你希望与 Homestead 环境共享的所有文件夹。 当这些文件夹中的文件发生更改时，它们将在你的本地机器和 Homestead 虚拟环境之间保持同步。 你可以根据需要配置任意数量的共享文件夹：

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> 注意：Windows 用户不应使用 `~/` 路径语法，而应使用其项目的完整路径，例如 `C:\Users\user\Code\project1`。


你应该始终将单个应用程序映射到它们自己的文件夹映射，而不是映射包含所有应用程序的单个大目录。 映射文件夹时，虚拟机需要跟踪文件夹中*每个*文件的所有磁盘 IO。 如果文件夹中有大量文件，性能可能会降低：

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> 注意：在使用 Homestead 时，你永远不应该挂载 `.`（当前目录）。 这会导致 Vagrant 不会将当前文件夹映射到 `/vagrant`，并且会在配置时破坏可选功能并导致意外结果。

要启用 [NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html)，你可以在文件夹映射中添加一个 `type` 选项：

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> 注意：在 Windows 上使用 NFS 时，应考虑安装 [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 插件。 该插件将维护 Homestead 虚拟机中文件和目录的正确用户/组权限。

你还可以通过在 `options` 键下列出它们来传递 Vagrant 的 [同步文件夹](https://www.vagrantup.com/docs/synced-folders/basic_usage.html) 支持的任何选项：

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a name="configuring-nginx-sites"></a>
### 配置 Nginx 站点

不熟悉 Nginx？ 没问题。 你的 `Homestead.yaml` 文件的 `sites` 属性允许你轻松地将「域」映射到 Homestead 环境中的文件夹。 Homestead.yaml 文件中包含一个示例站点配置。 同样，你可以根据需要向 Homestead 环境添加任意数量的站点。 Homestead 可以为你正在开发的每个 Laravel 应用程序提供方便的虚拟化环境：

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```



如果你在配置 Homestead 虚拟机后更改了 `sites` 属性，你应该在终端中执行 `vagrant reload --provision` 命令来更新虚拟机上的 Nginx 配置。

> 注意：Homestead 脚本被构建为尽可能具有幂等性。 但是，如果你在配置时遇到问题，你应该通过执行 `vagrant destroy && vagrant up` 命令来销毁和重建机器。

<a name="hostname-resolution"></a>
#### 主机名解析

Homestead 使用`mDNS` 发布主机名以进行自动主机解析。 如果你在 `Homestead.yaml` 文件中设置 `hostname: homestead`，主机将在 `homestead.local` 中可用。 macOS、iOS 和 Linux 桌面发行版默认包含 `mDNS` 支持。 如果你使用的是 Windows，则必须安装 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)。

使用自动主机名最适合 Homestead 的 [每个项目安装](#per-project-installation)。 如果你在单个 Homestead 实例上托管多个站点，你可以将你网站的「域」添加到你机器上的 `hosts` 文件中。 `hosts` 文件会将你对 Homestead 站点的请求重定向到你的 Homestead 虚拟机中。 在 macOS 和 Linux 上，此文件位于`/etc/hosts`。 在 Windows 上，它位于「C:\Windows\System32\drivers\etc\hosts」。 你添加到此文件的行将如下所示：

    192.168.56.56  homestead.test

确保列出的 IP 地址是你在 `Homestead.yaml` 文件中设置的地址。 将域添加到 `hosts` 文件并启动 Vagrant 框后，你将能够通过 Web 浏览器访问该站点：

```shell
http://homestead.test
```



<a name="configuring-services"></a>
### 配置服务

Homestead 默认会启动好几个服务； 但你可以在配置的时候自定义启用或禁用哪些服务。 例如，你可以通过修改 `Homestead.yaml` 文件中的 `services` 选项来启用 PostgreSQL 并禁用 MySQL：

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

指定的服务将根据它们在 `enabled` 和 `disabled` 指令中的顺序启动或停止。

<a name="launching-the-vagrant-box"></a>
### 启动 The Vagrant Box

你根据自己的需求修改 `Homestead.yaml` 后，你可以通过在 Homestead 目录运行 `vagrant up` 命令来启动 Vagrant 虚拟机。 Vagrant 将启动虚拟机并自动配置你的共享文件夹和 Nginx 站点。

要销毁虚拟机实例，你可以使用 `vagrant destroy` 命令。

<a name="per-project-installation"></a>
### 为项目单独安装

你可以为你管理的每个项目配置一个 Homestead 实例，而不是全局安装 Homestead 并在所有项目中共享相同的 Homestead 虚拟机。 如果你希望随项目一起提供 `Vagrantfile`，允许其他人在克隆项目的存储库后立即 `vagrant up`，则为每个项目安装 Homestead 可能会有所帮助。

你可以使用 Composer 包管理器将 Homestead 安装到你的项目中：

```shell
composer require laravel/homestead --dev
```

安装 Homestead 后，调用 Homestead 的 `make` 命令为你的项目生成 `Vagrantfile` 和 `Homestead.yaml` 文件。 这些文件将放置在项目的根目录中。 `make` 命令将自动配置 `Homestead.yaml` 文件中的站点和文件夹指令：

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```



接下来，在终端中运行 `vagrant up` 命令并在浏览器中通过 `http://homestead.test` 访问你的项目。 请记住，如果你不使用自动 [主机名解析](#hostname-resolution)，你仍然需要为 `homestead.test` 或你选择的域在 `/etc/hosts` 文件中添加一个主机名映射。

<a name="installing-optional-features"></a>
### 安装可选功能

使用 `Homestead.yaml` 文件中的 `features` 选项可以安装可选软件。 大多数功能可以使用布尔值启用或禁用，部分功能允许使用多个配置选项：

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - docker: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

你可以指定支持的 Elasticsearch 版本，该版本必须是确切的版本号 (major.minor.patch)。 默认安装将创建一个名为「homestead」的集群。 你永远不应该给 Elasticsearch 超过操作系统一半的内存，所以确保你的 Homestead 虚拟机至少有 Elasticsearch 分配的两倍。

> 技巧：查看 [Elasticsearch 文档](https://www.elastic.co/guide/en/elasticsearch/reference/current) 了解如何自定义你的配置。



<a name="mariadb"></a>
#### MariaDB

启用 MariaDB 将会移除 MySQL 并安装 MariaDB。MariaDB 通常是 MySQL 的替代品，完全兼容 MySQL，所以在应用数据库配置中你仍然可以使用 `mysql` 驱动。

<a name="mongodb"></a>
#### MongoDB

默认安装的 MongoDB 将会设置数据库用户名为 `homestead` 及对应的密码为 `secret`。

<a name="neo4j"></a>
#### Neo4j

[Neo4j](https://neo4j.com/) 是一个图形数据库，默认安装的 Neo4j 会设置数据库用户名为 `homestead` 及对应的密码 `secret`。要通过浏览器访问 Neo4j ，请通过 Web 浏览器访问 `http://homestead.test:7474`。默认情况下，服务预设了端口 `7687`（Bolt）、`7474`（HTTP）和 `7473`（HTTPS）为来自 Neo4j 客户端的请求提供服务。

<a name="aliases"></a>
### 系统命令别名

您可以通过修改 Homestead 目录中的 `aliases` 文件将 Bash 命令别名添加到 Homestead 虚拟机：

```shell
alias c='clear'
alias ..='cd ..'
```

当你更新完 `aliases` 文件后，你需要通过` vagrant reload --provision ` 命令重启 Homestead 机器，以确保新的别名在机器上生效。

<a name="updating-homestead"></a>
## 更新 Homestead

更新 Homestead 之前确保你已经在 Homestead 目录下通过如下命令移除了当前的虚拟机：

```shell
vagrant destroy
```

接下来，需要更新 Homestead 源码，如果你已经克隆仓库到本地，可以在项目根目录下运行如下命令进行更新：

```shell
git fetch

git pull origin release
```

这些命令会从 Github 存储库中拉取最新的 Homestead 仓库代码到本地，包括最新的标签版本。你可以在 Homestead 的 [GitHub 发布页面](https://github.com/laravel/homestead/releases) 上找到最新的稳定版本。


如果你是通过 Composer 在指定 Laravel 项目中安装的 Homestead，需要确保 `composer.json` 中包含了 `"laravel/homestead": "^12"`，然后更新这个依赖：

```shell
composer update
```

之后，你需要通过 `vagrant box update` 命令更新 Vagrant：

```shell
vagrant box update
```

接下来，你可以从 Homestead 目录下运行 `bash init.sh` 命令来更新 Homestead 额外的配置文件，你会被询问是否覆盖已存在的 `Homestead.yaml`、`after.sh` 以及 `aliases` 文件：

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

最后，你需要重新生成新的 Homestead 虚拟机来使用最新安装的 Vagrant：

```shell
vagrant up
```

<a name="daily-usage"></a>
## 日常使用方法

<a name="connecting-via-ssh"></a>
### 通过 SSH 连接

你可以在 Homestead 目录下通过运行 `vagrant ssh` 以 SSH 方式连接到虚拟机。如果你设置了全部访问 Homestead，也可以在任意路径下通过 homestead ssh 登录到虚拟机。

<a name="adding-additional-sites"></a>
### 添加其他站点

Homestead 虚拟机在运行时，可能需要添加多个 Laravel 应用到 Nginx 站点。如果是在单个 Homestead 环境中运行多个 Laravel 应用，添加站点很简单，只需将站点添加到 `Homestead.yaml` 文件：

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> 注意：在添加站点之前，你应该确保已经为项目的目录配置了[配置共享文件夹](#configuring-shared-folders)。

如果 Vagrant 没有自动管理你的「hosts」文件，你可能还需要将新站点添加到该文件中。在 macOS 和 Linux 上，此文件位于 `/etc/hosts`。在 Windows 上，它位于 `C:\Windows\System32\drivers\etc\hosts`：

    192.168.56.56  homestead.test
    192.168.56.56  another.test



添加站点后，你需要从 Homestead 目录执行 `vagrant reload --provision` 命令以保证 Vagrant 加载新的站点。

<a name="site-types"></a>
#### 站点类型

Homestead 支持多种「类型」的站点，让你可以轻松运行不是基于 Laravel 的项目。 例如，我们可以使用 `statamic` 站点类型轻松地将 Statamic 应用程序添加到 Homestead：

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

可用的站点类型有： `apache`、`apigility`、`expressive`、`laravel`（默认）、`proxy`、`silverstripe`、`statamic`、`symfony2`、`symfony4` 和 `zf`。

<a name="site-parameters"></a>
#### 站点参数

你可以通过 `params` 站点指令向你的站点添加额外的 Nginx `fastcgi_param` 值：

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### 环境变量

你可以 `Homestead.yaml` 文件来定义全局环境变量：

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

更新 `Homestead.yaml` 文件后，请务必通过执行 `vagrant reload --provision` 命令重新配置机器。 这将更新所有已安装 PHP 版本的 PHP-FPM 配置，并为 `vagrant` 用户更新环境。

<a name="ports"></a>
### 端口

默认情况下，以下端口会转发到你的 Homestead 环境：

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; 转发到 80
- **HTTPS:** 44300 &rarr; 转发到 443

</div>

<a name="forwarding-additional-ports"></a>
#### 转发额外的端口

如你所愿，你可以通过在你的 `Homestead.yaml` 文件中定义一个 `ports` 配置项来将额外的端口转发到 Vagrant 虚拟机。 更新`Homestead.yaml` 文件后，请务必通过执行`vagrant reload --provision` 命令重新载入虚拟机配置：

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```



以下是你可能希望从主机映射到 Vagrant box 的其他 Homestead 服务的端口清单：

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; 转发到 22
- **ngrok UI:** 4040 &rarr; 转发到 4040
- **MySQL:** 33060 &rarr; 转发到 3306
- **PostgreSQL:** 54320 &rarr; 转发到 5432
- **MongoDB:** 27017 &rarr; 转发到 27017
- **Mailhog:** 8025 &rarr; 转发到 8025
- **Minio:** 9600 &rarr; 转发到 9600

</div>

<a name="php-versions"></a>
### 多 PHP 版本

Homestead 6 引入了对在同一虚拟机上运行多个版本的 PHP 的支持。 你可以在 `Homestead.yaml` 文件中指定用于特定站点的 PHP 版本。 可用的 PHP 版本有：「5.6」、「7.0」、「7.1」、「7.2」、「7.3」、「7.4」、「8.0」（默认）和「8.1」：

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[在你的 Homestead 虚拟机中](#connecting-via-ssh)，你可以通过 CLI 使用任何支持的 PHP 版本：


```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
```

你可以通过在 Homestead 虚拟机中发出以下命令来更改 CLI 使用的默认 PHP 版本：

```shell
php56
php70
php71
php72
php73
php74
php80
php81
```

<a name="connecting-to-databases"></a>
### 连接到数据库

Homestead 开箱即用地为 MySQL 和 PostgreSQL 配置了一个 `homestead` 数据库。如果你想用宿主机的数据库客户端连接到 MySQL 或 PostgreSQL 数据库，你可以通过连接 `127.0.0.1` （本地网络）的 `33060` 端口（MySQL） 或 `54320` 端口（PostgreSQL）。 两个数据库的用户名和密码都是 `homestead`/`secret`。

> 注意：只有在从宿主机连接到数据库时，你才需要使用这些非标准端口。 由于 Laravel 在虚拟机中运行，因此你将在 Laravel 应用程序的数据库配置文件中使用默认的 3306 和 5432 端口。



<a name="database-backups"></a>
### 数据库备份

当你的 Homestead 虚拟机被破坏时，Homestead 可以自动备份你的数据库。 要使用此功能，你必须使用 Vagrant 2.1.0 或更高版本。 或者，如果你使用的是旧版本的 Vagrant，则必须安装 `vagrant-triggers` 插件。要启用自动数据库备份，请将以下行添加到你的 `Homestead.yaml` 文件中：

    backup: true

配置完成后，当执行 `vagrant destroy` 命令时，Homestead 会将你的数据库导出到 `mysql_backup` 和 `postgres_backup` 目录。 如果你选择了[为项目单独安装](#per-project-installation) Homestead，你可以在项目安装 Homestead 的文件夹中找到这些目录，或者在你的项目根目录中找到它们。

<a name="configuring-cron-schedules"></a>
### 配置 Cron 计划

Laravel 提供了一种便捷方式来满足[任务调度](/docs/laravel/9.x/scheduling)，通过 Artisan 命令 `schedule:run` 实现了定时运行（每分钟执行一次）。 `schedule:run` 命令将检查在 `App\Console\Kernel` 类中定义的作业计划，以确定要运行哪些计划任务。

如果你想为 Homestead 站点运行 `schedule:run` 命令，可以在定义站点时将 `schedule` 选项设置为 `true`：

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

站点的 cron 作业将在 Homestead 虚拟机的 `/etc/cron.d` 目录中被定义。

<a name="configuring-mailhog"></a>
### 配置 MailHog


[MailHog](https://github.com/mailhog/MailHog) 会在你本地开发的过程中拦截应用程序发送的电子邮件，而不是将邮件实际发送给收件人。如果要使用 MailHog，你需要参考以下邮件配置并更新应用程序的 `.env` 文件：

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```



配置 MailHog 后，你可以通过 `http://localhost:8025` 访问 MailHog 仪表盘。

<a name="configuring-minio"></a>
### 配置 Minio

[Minio](https://github.com/minio/minio) 是一个具有 Amazon S3 兼容 API 的开源对象存储服务器。 要安装 Minio，请使用 [features](#installing-optional-features) 部分中的以下配置选项更新你的 `Homestead.yaml` 文件：

[Minio](https://github.com/minio/minio) 是一个具有 Amazon S3 兼容 API 的开源对象存储服务器。 要安装 Minio，请使用 [features](#installing-optional-features) 部分中的以下配置选项更新你的 `Homestead.yaml` 文件：

    minio: true

默认情况下，Minio 在端口 9600 上可用。你可以通过访问 `http://localhost:9600` 访问 Minio 控制面板。 默认访问密钥是 `homestead`，而默认密钥是 `secretkey`。 访问 Minio 时，应始终使用区域 `us-east-1`。

为了使用 Minio，你需要在应用程序的 `config/filesystems.php` 配置文件中调整 S3 磁盘配置。 你需要将 `use_path_style_endpoint` 选项添加到磁盘配置中，并将 `url` 键更改为 `endpoint`:

    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'endpoint' => env('AWS_URL'),
        'use_path_style_endpoint' => true,
    ]

最后，确保你的 `.env` 文件包含以下选项：

```ini
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
AWS_URL=http://localhost:9600
```

要配置 Minio 支持的「S3」存储桶，请在你的 `Homestead.yaml` 文件中添加 `buckets` 指令。 定义存储桶后，你应该在终端中执行 `vagrant reload --provision` 命令重载虚拟机：

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

支持的 `policy` 值包括：`none`、`download`、`upload` 和 `public`。



<a name="laravel-dusk"></a>
### Laravel Dusk 测试工具

为了在 Homestead 中运行 [Laravel Dusk](/docs/laravel/9.x/dusk) 测试，你应该在 Homestead 配置中启用 [`webdriver` 功能](#installing-optional-features):

```yaml
features:
    - webdriver: true
```

启用 `webdriver` 功能后，你应该在终端中执行 `vagrant reload --provision` 命令重载虚拟机。

<a name="sharing-your-environment"></a>
### 共享你的环境

有时，你可能希望与同事或客户分享你目前正在做的事情。 Vagrant 通过 `vagrant share` 命令内置了对此的支持； 但是，如果你在 `Homestead.yaml` 文件中配置了多个站点，这个功能将不可用。

为了解决这个问题，Homestead 包含了自己的 `share` 命令。 首先，通过 `vagrant ssh` [SSH 到你的 Homestead 虚拟机](#connecting-via-ssh) 并执行 `share homestead.test` 命令。 此命令将从你的 `Homestead.yaml` 配置文件中共享 `homestead.test` 站点。 你可以将任何其他配置的站点替换为 `homestead.test`：

```shell
share homestead.test
```

运行该命令后，你将看到一个 Ngrok 屏幕出现，其中包含活动日志和共享站点的可公开访问的 URL。 如果你想指定自定义区域、子域或其他 Ngrok 运行时选项，你可以将它们添加到你的 `share` 命令中：

```shell
share homestead.test -region=eu -subdomain=laravel
```

> 注意：请记住，Vagrant 本质上是不安全的，并且你在运行 `share` 命令时会将虚拟机暴露在 Internet 上。

<a name="debugging-and-profiling"></a>
## 调试和分析

<a name="debugging-web-requests"></a>
### 使用 Xdebug 调试 Web 请求



Homestead 支持使用 [Xdebug](https://xdebug.org) 进行步骤调试。例如，你可以在浏览器中访问一个页面，PHP 将连接到你的 IDE 以允许检查和修改正在运行的代码。

默认情况下，Xdebug 将自动运行并准备好接受连接。 如果需要在 CLI 上启用 Xdebug，请在 Homestead 虚拟机中执行 `sudo phpenmod xdebug` 命令 . 接下来，按照 IDE 的说明启用调试。最后，配置你的浏览器以使用扩展名或 [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/) 触发 Xdebug。

> 注意：Xdebug 导致 PHP 运行速度明显变慢。要禁用 Xdebug，请在 Homestead 虚拟机中运行 sudo phpdismod xdebug 并重新启动 FPM 服务。

<a name="autostarting-xdebug"></a>
#### 自动启动 Xdebug

在调试向 Web 服务器发出请求的功能测试时，自动启动调试比修改测试以通过自定义标头或 cookie 来触发调试更容易。 要强制 Xdebug 自动启动，请修改 Homestead 虚拟机中的 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 文件并添加以下配置:

在调试向 Web 服务器发出请求的功能测试时，**自动启动调试**会比**通过自定义请求头或 cookie 修改测试逻辑来触发调试**更容易。要强制 Xdebug 自动启动，请修改 Homestead 虚拟机中的 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 文件并添加以下配置：


```ini
; 如果 Homestead.yaml 包含 IP 地址的不同子网，则这个 IP 地址可能会不一样
xdebug.remote_host = 192.168.10.1
xdebug.remote_autostart = 1
```

<a name="debugging-cli-applications"></a>
### 调试 CLI 应用程序

要调试 PHP CLI 应用程序，请在 Homestead 虚拟机中使用 `xphp` shell 别名：

    xphp /path/to/script

<a name="profiling-applications-with-blackfire"></a>
### 使用 Blackfire 分析应用程序

[Blackfire](https://blackfire.io/docs/introduction) 是一种用于分析 Web 请求和 CLI 应用程序的服务。它提供了一个交互式用户界面，可在调用图和时间线中显示配置文件数据。Blackfire 专为在开发、登台和生产中使用而构建，对最终用户没有任何开销。此外，Blackfire 还提供对代码和 `php.ini` 配置设置的性能、质量和安全检查。



[Blackfire Player](https://blackfire.io/docs/player/index) 是一个开源的 Web 爬行、Web 测试和 Web 抓取应用程序，可以与 Blackfire 联合使用以编写分析场景的脚本。

要启用 Blackfire，请使用 Homestead 配置文件中的「features」配置项：

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 服务器凭据和客户端凭据需要使用 [Blackfire 帐户](https://blackfire.io/signup)。 Blackfire 提供了多种选项来分析应用程序，包括 CLI 工具和浏览器扩展。 请查看 [Blackfire 文档](https://blackfire.io/docs/cookbooks/index)以获取更多详细信息。

<a name="network-interfaces"></a>
## 网络接口

`Homestead.yaml` 文件的 `networks` 属性为你的 Homestead 虚拟机配置网络接口。 你可以根据需要配置任意数量的接口：

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

要启用 [bridged](https://www.vagrantup.com/docs/networking/public_network.html) 接口，请为将网络配置调整为 `bridge` 并将网络类型更改为 `public_network`：

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

要启用 [DHCP](https://www.vagrantup.com/docs/networking/public_network.html) 功能，你只需从配置中删除 `ip` 选项：

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

<a name="extending-homestead"></a>
## 扩展 Homestead

你可以使用 Homestead 目录根目录中的 `after.sh` 脚本扩展 Homestead。 在此文件中，你可以添加正确配置和自定义虚拟机所需的任何 shell 命令。



当你自定义 Homestead 时，Ubuntu 可能会询问你是要保留软件包的原始配置还是使用新的配置文件覆盖它。 为了避免这种情况，你应该在安装软件包时使用以下命令，以避免覆盖 Homestead 之前编写的任何配置:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 用户自定义

与你的团队一起使用 Homestead 时，你可能需要调整 Homestead 以更好地适应你的个人开发风格。 为此，你可以在 Homestead 目录（包含 `Homestead.yaml` 文件的同一目录）的根目录中创建一个 `user-customizations.sh` 文件。 在此文件中，你可以进行任何你想要的自定义； 但是， `user-customizations.sh` 不应受版本管理工具控制。


<a name="provider-specific-settings"></a>
## 针对虚拟机软件的特殊设置

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

默认情况下，Homestead 将 `natdnshostresolver` 设置配置为 `on`。 这允许 Homestead 使用你的主机操作系统的 DNS 设置。 如果你想覆盖此行为，请将以下配置选项添加到你的 `Homestead.yaml` 文件中：

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```

<a name="symbolic-links-on-windows"></a>
#### Windows 上的符号链接

如果符号链接在你的 Windows 机器上不能正常工作，你可能需要将以下代码块添加到你的 Vagrantfile：

```ruby
config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
end
```

