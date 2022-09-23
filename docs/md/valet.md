# Laravel Valet

- [简介](#introduction)
- [安装](#installation)
    - [升级](#upgrading-valet)
- [服务站点](#serving-sites)
    - [Park 命令](#the-park-command)
    - [Link 命令](#the-link-command)
    - [使用TLS保护站点](#securing-sites)
    - [服务默认站点](#serving-a-default-site)
- [共享站点](#sharing-sites)
    - [通过 Ngrok 共享站点](#sharing-sites-via-ngrok)
    - [通过 Expose 共享站点](#sharing-sites-via-expose)
    - [共享本地网络站点](#sharing-sites-on-your-local-network)
- [网络特点环境变量](#site-specific-environment-variables)
- [代理服务](#proxying-services)
- [自定义 Valet 驱动](#custom-valet-drivers)
    - [本地驱动](#local-drivers)
- [其他 Valet 命令](#other-valet-commands)
- [Valet 目录和文件](#valet-directories-and-files)

<a name="introduction"></a>
## 简介

[Laravel Valet](https://github.com/laravel/valet) 是面向 macOS 极简主义者的 Laravel 开发环境。Laravel Valet 为你的 Mac 设置了开机后始终在后台运行 [Nginx](https://www.nginx.com/)。Valet 使用 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq) 代理所有 `*.test` 域名的请求，指向安装在你本地计算机上的站点。
Valet 不能完全替代 [Sail](/docs/laravel/9.x/sail) 或 [Homestead](/docs/laravel/9.x/homestead)，但 Valet 为你提供了另外提供一种使用起来更灵活、快速且内存占用更少的选择。

开箱即用，Valet 支持包括但不限于以下内容：

<style>
    #valet-support > ul {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        line-height: 1.9;
    }
</style>

<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Lumen](https://lumen.laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [Concrete5](https://www.concrete5.org/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [ExpressionEngine](https://www.expressionengine.com/)
- [Jigsaw](https://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [OctoberCMS](https://octobercms.com/)
- [Sculpin](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- 静态 HTML 页面
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>



但是，你可以使用自己的 [自定义驱动程序](#custom-valet-drivers) 扩展 Valet 。

<a name="installation"></a>
## 安装

> 注意：Valet 需要 macOS 和 [Homebrew](https://brew.sh/) ，你应该确保没有其他程序 (例如 Apache 或者 Nginx) 占用本地计算机的 80 端口。

首先，你首先需要使用以下 `update` 命令确保 Homebrew 是最新的：

```shell
brew update
```

接下来，你应该使用 Homebrew 安装 PHP:

```shell
brew install php
```

在安装 PHP 之后，就可以安装 [Composer 软件包管理器](https://getcomposer.org) 了。 另外，你应该确保 `~/.composer/vendor/bin` 目录位于系统的「PATH」 中。安装 Composer 之后，你可以将 Laravel Valet 安装为全局 Composer 软件包：

```shell
composer global require laravel/valet
```

最后，你可以执行 Valet 的 `install` 命令。这将配置并安装 Valet 和 DnsMasq。此外，Valet 依赖的守护程序将配置为在系统启动时启动：

```shell
valet install
```

安装 Valet 后，请尝试使用如 之类的命令 `ping foobar.test` ping 终端上的任何 `*.test` 域。 如果 Valet 安装正确，你应该看到该域在 `127.0.0.1` 上响应。

每当你的机器启动时，Valet 将自动启动其所需的相关服务。

<a name="php-versions"></a>
#### PHP 版本

Valet 允许你使用 `valet use php@version` 命令切换 PHP 版本。如果尚未安装， Valet 将通过 Homebrew 安装指定的 PHP 版本：

```shell
valet use php@7.2

valet use php
```



你也可以在项目根目录中创建一个 `.valetphprc` 文件。 该 `.valetphprc` 文件应包含网站应使用的PHP版本：

```shell
php@7.2
```

创建此文件后，您可以简单地执行 `valet use` 命令，该命令将通过读取该文件来确定站点的首选PHP版本。

> 注意：即使您安装了多个 PHP 版本，Valet 服务一次只能提供一个 PHP 版本。

<a name="database"></a>
#### 数据库

如果你的站点需要使用数据库，尝试使用 [DBngin](https://dbngin.com)。DBngin 是一个免费的，可以管理多种数据库的工具，包括 MySQL，PostgreSQL 和 Redis。在安装完成 DBngin 以后，你可以使用 `root` 用户名和空密码连接到你的本地 `127.0.0.1` 数据库。

<a name="resetting-your-installation"></a>
#### 重新安装

如果你的 Valet 无法正常运行，执行 `composer global update` 命令后再执行 `valet install` 重新安装可解决各种问题。在极少数情况下，可能需要执行 `valet uninstall --force` 然后执行 `valet install` 来「硬复位」 Valet。

<a name="upgrading-valet"></a>
### 升级 Valet

你可以在命令行终端运行 `composer global update` 更新你的 Valet。更新完成后，最好再运行一次 `valet install` 命令，这样 Valet 可以在必要时对配置文件进行升级。

<a name="serving-sites"></a>
## 服务站点

安装 Valet 之后，你就可以配置 Laravel 站点。Valet 提供了 2 个命令来配置： `park` 和 `link`。



<a name="the-park-command"></a>
### `park` 命令

该 `park` 命令将注册了你的 Mac 上的一个包含服务的路径。一旦路径被「parked」成为 Valet 的一部分，可以使用域名 `http://<directory-name>.test` 通过浏览器访问此路径下的目录：

```shell
cd ~/Sites

valet park
```

这就是所有需要手动的操作。现在，任何你创建在「parked」目录中的服务都可以使用 `http://<directory-name>.test` 域名自动访问。例如，如果你的「parked」路径下包括一个名为「laravel」的目录，可以使用 `http://laravel.test` 来访问。另外，Valet 自动允许二级域名访问此站点。 (`http://foo.laravel.test`)。

<a name="the-link-command"></a>
### `link` 命令

该 `link` 命令也可以用来为你的 Laravel 站点提供服务。如果要为目录中的单个站点而不是整个目录提供服务，则此命令非常有用。

```shell
cd ~/Sites/laravel

valet link
```

在运行 `link` 命令链接一个站点后，你可以使用目录名称来访问这个链接。例如，你可以在浏览器中通过 `http://laravel.test` 访问站点。另外，Valet 自动添加了站点二级目录的访问功能，例如 (`http://foo.laravel.test`)。

如果你想要使用不同的域名来访问相同站点，你可以使用 `link` 命令来构造站点。例如，你可以使用以下命令来使目录可以通过 `http://application.test` 访问：

```shell
cd ~/Sites/laravel

valet link application
```



你可以使用 `links` 命令来查看所有的目录链接：

```shell
valet links
```

该 `unlink` 命令可以用来删除动态链接：

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### 使用 TLS 保护站点

默认情况下，Valet 使用 HTTP 协议提供服务。当然，如果您想要使用 HTTP/2 通过 TLS 加密您的站点，您可以使用 `secure` 命令。例如，如果您的站点通过 Valet 在 `laravel.test` 域名上提供服务，您可以使用如下命令以为站点实现安全保护功能：

```shell
valet secure laravel
```

要 「解除保护」并回退至 HTTP ，请使用 `unsecure` 命令。像 `secure` 命令一样，该命令接受您想要解除保护的主机名：

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 为默认站点提供服务

有时，当访问未知的 `test` 域时，您可能希望将Valet配置为「默认」站点，而不是 `404` 。要实现这一点，您可以在 `~/.config/valet/config.json` 配置文件中添加一个 `default` 选项。 其中包含应作为默认站点的路径：

    "default": "/Users/Sally/Sites/foo",

<a name="sharing-sites"></a>
## 共享站点

Valet 甚至包含了一个命令，用于与全世界共享您的站点，它提供了一种方便的可在手机上测试站点或和您的团队成员共享站点的方式。

<a name="sharing-sites-via-ngrok"></a>
### 使用 Ngrok 共享站点

要共享站点，请在终端中定位到站点目录，并运行 Valet `share` 命令。一个公开可访问的 URL 将会插入到您的剪贴板中，您可以分享它给您的团队成员或在浏览器中打开它:

```shell
cd ~/Sites/laravel

valet share
```



要停止共享你的站点，请按 `Control + C` 去取消该过程。使用Ngrok共享您的网站需要您 [创建  Ngrok 帐户](https://dashboard.ngrok.com/signup) 和 [设置身份验证令牌](https://dashboard.ngrok.com/get-started/your-authtoken)。

> 技巧：您可以向 share 命令传递额外的参数， 如 `valet share --region=eu`。 更多信息，请参考 [ngrok 文档](https://ngrok.com/docs)。

<a name="sharing-sites-via-expose"></a>
### 通过 Expose 共享站点

如果你安装了 [Expose](https://expose.dev) ，打开命令行进入网站根目录执行 `expose` 就可以共享你的网站。查看 [Expose 文档](https://expose.dev/docs) 获取更多支持的命令行参数。成功共享站点后，Expose 将显示可共享的 URL，您可以在其他设备上或在团队成员之间使用该 URL:

```shell
cd ~/Sites/laravel

expose
```

要停止共享你的站点，请按 `Control + C` 去取消该过程。

<a name="sharing-sites-on-your-local-network"></a>
### 在本地网络上共享站点

默认情况下，Valet 将传入流量限制为内部 `127.0.0.1` 接口。这样，您的开发机器就不会暴露在来自 Internet 的安全风险中。

如果您希望在本地网络上允许其他设备通过机器的 IP 地址访问计算机上的代码站点 (如： `192.168.1.10/application.test` )，您需要手动编辑该站点的相应 Nginx 配置文件，以删除对 `listen` 指令的限制。您应该删除端口 80 和 443 `listen` 指令中的 `127.0.0.1:` 前缀。

如果您没有在项目上运行 `valet secure` 您可以通过编辑， `/usr/local/etc/nginx/valet/valet.conf` 文件来为所有非 HTTPS 站点打开所有非 HTTPS 站点的网络访问。但是，如果您在 HTTPS 上为项目站点提供服务（您已为网站运行 `valet secure` ），那么您应该编辑 `~/.config/valet/Nginx/app-name.test` 文件。



更新了 nginx 配置后，运行 `valet restart` 命令以应用配置更改。

<a name="site-specific-environment-variables"></a>
## 站点特定环境变量

使用其他框架的某些应用程序可能取决于服务器环境变量，但不提供要在项目中配置的变量的方法。 Valet 允许您通过在项目根部内添加 `.valet-env.php` 文件来配置站点特定环境变量。 此文件应返回一个站点 / 环境变量对数组，该对将为阵列中指定的每个站点添加到全局 `$_SERVER` 数组中：

    <?php

    return [
        // 为 laravel.test 站点设置 $_SERVER['key'] 对应的 "value" 值 ...
        'laravel' => [
            'key' => 'value',
        ],

        // 为所有站点设置 $_SERVER['key'] 对应的 "value" 值 ...
        '*' => [
            'key' => 'value',
        ],
    ];

<a name="proxying-services"></a>
## 代理服务

有时您可能希望将代客域代理到本地机器上的 Valet 站点。 例如，您可能偶尔需要运行 Valet，同时在 Docker 中运行单独的站点； 但是， Valet 和 Docker 不能同时绑定到端口 80。

为了解决这个问题，你可能用到 `proxy` 命令去生成一个代理。例如，您可以代理所有流量从 `http://elasticsearch.test` 到  `http://127.0.0.1:9200`：

```shell
# Proxy over HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy over TLS + HTTP/2...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

你可以用 `unproxy` 命令去删除一个代理：

```shell
valet unproxy elasticsearch
```

你可以用 `proxies` 命令列出代理的所有站点配置：

```shell
valet proxies
```



<a name="custom-valet-drivers"></a>
## 定制 Valet 驱动

你可以编写自己的 Valet「驱动」，以服务于在框架或 CMS 上运行的 PHP 应用程序，该应用程序未受 Valet 支持的。 安装 Valet 时，创建了一个 `~/.config/valet/Drivers` 目录，其中包含一个 `samplevaletdriver.php` 文件。 此文件包含示例驱动程序实现，以演示如何编写自定义驱动程序。写驱动只需要你实现三种方法：`serves` ， `isStaticFile` ， 和 `frontControllerPath` 。

这三种方法都接收 `$sitePath`, `$siteName`, and `$uri` 值作为其参数。 `$sitePath` 是你机器上服务的网站的完整的路径， 如 `/Users/Lisa/Sites/my-project`。  `$siteName` 是 「host」/「site name」域名的一部分 (`my-project`)。`$uri` 是传入的请求 URI (`/foo/bar`)。

完成你的自定义 Valet 驱动后, 使用 `frameworkvaletdriver.php` 命名约定将它放在 `~/.config/valet/Drivers` 目录中。 例如，如果你正在为 WordPress 编写自定义 Valet 驱动，则你的文件名应该是 `WordPressValetDriver.php`。

我们来看看自定义的 Valet 驱动程序应该实现的每种方法的示例实现。
<a name="the-serves-method"></a>
#### `serves` 方法

如果驱动程序应该处理传入的请求，`serves` 方法应该返回 `true`。否则，该方法应返回 `false`。因此，在这个方法中，你应该尝试确定给定的 `$sitePath` 是否包含你试图服务的类型的项目。

例如，假设我们正在编写一个 `WordPressValetDriver`。我们的 `serves` 方法可能看起来如下所示：

    /**
     * 确定驱动程序是否为请求服务。
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return bool
     */
    public function serves($sitePath, $siteName, $uri)
    {
        return is_dir($sitePath.'/wp-admin');
    }



<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 方法

`isStaticFile` 应当确定即将到来的请求是否针对一个「静态」文件，比如：图片和样式表。如果文件是静态的，此方法应当返回静态文件在磁盘上的完全限定路径。如果即将到来的请求不是针对一个静态文件，这个方法应当返回 `false`：

    /**
     * 确定即将到来的请求是否针对静态文件。
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return string|false
     */
    public function isStaticFile($sitePath, $siteName, $uri)
    {
        if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
            return $staticFilePath;
        }

        return false;
    }

> 注意：仅当 `serves` 方法对传入请求返回 `true` 且请求 URI 不是 `/` 时，才会调用 `isStaticFile` 方法。

<a name="the-frontcontrollerpath-method"></a>
####  `frontControllerPath` 方法

`frontControllerPath` 方法应该返回你的应用的「前端控制器」的完全限定路径，它通常是 「index.php」 或等效的文件：

    /**
     * 获取应用程序前端控制器的完全解析路径。
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return string
     */
    public function frontControllerPath($sitePath, $siteName, $uri)
    {
        return $sitePath.'/public/index.php';
    }

<a name="local-drivers"></a>
### 本地驱动

如果你想要为单个应用自定义一个 Valet 驱动，请在应用根目录创建一个 `LocalValetDriver.php` 文件。你的自定义驱动可以继承 `ValetDriver` 基类或继承现有应用的特定驱动程序，如 `LaravelValetDriver`：

    class LocalValetDriver extends LaravelValetDriver
    {
        /**
         * 确定驱动程序是否给请求提供服务。
         *
         * @param  string  $sitePath
         * @param  string  $siteName
         * @param  string  $uri
         * @return bool
         */
        public function serves($sitePath, $siteName, $uri)
        {
            return true;
        }

        /**
         * 获取对应用程序的前端控制器的完全解析路径。
         *
         * @param  string  $sitePath
         * @param  string  $siteName
         * @param  string  $uri
         * @return string
         */
        public function frontControllerPath($sitePath, $siteName, $uri)
        {
            return $sitePath.'/public_html/index.php';
        }
    }



<a name="other-valet-commands"></a>
## 其他 Valet 命令

命令  | 描述
------------- | -------------
`valet forget` | 从「驻留」目录运行此命令，将其从驻留目录列表中删除。
`valet log` | 查看 Valet 服务记录的日志列表。
`valet paths` | 查看所有「驻留」的路径。
`valet restart` | 重启 Valet 守护进程。
`valet start` | 启动 Valet 守护进程。
`valet stop` | 停止 Valet 守护进程。
`valet trust` | 为 Brew 和 Valet 添加 sudoers 文件，使 Valet 输入命令的时候不需要输入密码。
`valet uninstall` | 卸载 Valet：显示手动卸载的说明。 传递 `--force` 选项来主动删除 Valet 的所有资源。

<a name="valet-directories-and-files"></a>
## Valet 目录和文件

你可能会发现以下目录和文件信息对排查你的 Valet 环境故障问题很有帮助：

#### `~/.config/valet`

包含 Valet 所有的配置，您可能希望对此文件夹进行备份。

#### `~/.config/valet/dnsmasq.d/`

此目录包含 DNSMasq 的配置。

#### `~/.config/valet/Drivers/`

此目录包含 Valet 的驱动，驱动判断如何为特定的 framework/CMS 提供服务。

#### `~/.config/valet/Extensions/`

此目录包括自定义的 Valet 扩展和指令。

#### `~/.config/valet/Nginx/`

此目录包含所有 Valet 的 Nginx 站点配置，当运行 `install`、`secure`、`tld` 指令时会重建这些配置文件。

#### `~/.config/valet/Sites/`

此目录包含所有 [链接项目](#the-link-command) 的符号链接。

#### `~/.config/valet/config.json`

此文件是 Valet 的主要配置文件。

#### `~/.config/valet/valet.sock`

这个文件是 Valet 中 Nginx 安装使用的 PHP-FPM 套接字，只有在 PHP 正常运行的情况下，它才会存在。



#### `~/.config/valet/Log/fpm-php.www.log`

此文件是 PHP 错误的用户日志。

#### `~/.config/valet/Log/nginx-error.log`

此文件是 Nginx 错误的用户日志。

#### `/usr/local/var/log/php-fpm.log`

此文件是 PHP-FPM 错误的系统日志。

#### `/usr/local/var/log/nginx`

此目录包含 Nginx 的访问和错误日志。

#### `/usr/local/etc/php/X.X/conf.d`

此目录包含用于各种 PHP 配置设置的  `*.ini` 文件。

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

此文件是 PHP-FPM 池配置文件。

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

此文件是用于为站点构建 SSL 证书的默认 Nginx 配置。

