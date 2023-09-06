# Laravel Valet

- [简介](#introduction)
- [安装](#installation)
    - [升级](#upgrading-valet)
- [服务站点](#serving-sites)
    - [Park 命令](#the-park-command)
    - [Link 命令](#the-link-command)
    - [使用 TLS 保护站点](#securing-sites)
    - [服务默认站点](#serving-a-default-site)
    - [默认 PHP 版本](#per-site-php-versions)
- [共享站点](#sharing-sites)
    - [通过 Ngrok 共享站点](#sharing-sites-via-ngrok)
    - [通过 Expose 共享站点](#sharing-sites-via-expose)
    - [共享本地网络站点](#sharing-sites-on-your-local-network)
- [网站特定环境变量](#site-specific-environment-variables)
- [代理服务](#proxying-services)
- [自定义 Valet 驱动](#custom-valet-drivers)
    - [本地驱动](#local-drivers)
- [其他 Valet 命令](#other-valet-commands)
- [Valet 目录和文件](#valet-directories-and-files)
    - [磁盘访问](#disk-access)

<a name="introduction"></a>
## 简介

[Laravel Valet](https://github.com/laravel/valet) 是一个面向 macOS 极简主义者的 Laravel 开发环境。Laravel Valet 为你的 Mac 设置了开机后始终在后台运行 [Nginx](https://www.nginx.com/) 服务。然后，使用 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq) 将所有指向安装在本地的计算机站点请求代理到 `*.test` 结尾的域名上。

总之，Valet 是一个速度极快的 Laravel 开发环境，仅仅占用了 7 MB 内存。Valet 并不能完全取代 [Sail](/docs/laravel/10.x/sail) 或 [Homestead](/docs/laravel/10.x/homestead)，只是提供了另外一种使用起来更加灵活、方便、以及内存占用更小的选择。

开箱即用，Valet 支持但不局限于以下内容：

<style>
    #valet-support > ul {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        line-height: 1.9;
    }
</style>

<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [ConcreteCMS](https://www.concretecms.com/)
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
- Static HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>



但是，你可以使用自己的 [自定义驱动程序](#custom-valet-drivers) 扩展 Valet 。 .

<a name="installation"></a>
## 安装

> 注意：Valet 需要 macOS 和 [Homebrew](https://brew.sh/) ，你应该确保没有其他程序 (例如 Apache 或者 Nginx) 占用本地计算机的 80 端口。

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

> 注意：你无需修改全局的 PHP 版本，你可以通过 `isolate` [命令](#per-site-php-versions)指定 Valet 使用每个站点的 PHP 版本


Valet 允许你使用 `valet use php@version` 命令切换 PHP 版本。如果尚未安装， Valet 将通过 Homebrew 安装指定的 PHP 版本：

```shell
valet use php@8.1

valet use php
```



你还可以在项目的根目录中创建一个 `.valetphprc` 文件。 `.valetphprc` 文件应包含站点应使用的PHP版本：

```shell
php@8.1
```

创建此文件后，你只需执行 `valet use` 命令，命令将通过读取文件来确定站点的首选PHP版本。

> **注意**  
> Valet一次仅提供一个PHP版本，即使你安装了多个PHP版本。

<a name="database"></a>
#### 数据库

如果应用程序需要数据库，请查看[DBngin](https://dbngin.com/)，它提供了一个免费的全合一数据库管理工具，包括MySQL、PostgreSQL和Redis。安装DBngin后，你可以使用`root`用户名和空字符串作为密码连接到你的数据库`127.0.0.1`。

<a name="resetting-your-installation"></a>
#### 重置安装

如果你无法使Valet安装正常运行，请执行`composer global require laravel/valet`命令，然后执行`valet install`将重置你的安装并可以解决各种问题。在极少数情况下，可能需要通过执行`valet uninstall --force`，然后执行`valet install`来进行“硬重置”Valet。

<a name="upgrading-valet"></a>
### 升级 Valet

你可以通过在终端中执行`composer global require laravel/valet`命令来更新Valet安装。升级后，建议运行`valet install`命令，以便Valet可以根据需要对你的配置文件进行其他升级。

<a name="serving-sites"></a>
## 运行站点服务

安装Valet后，你可以开始为你的Laravel应用程序提供服务。Valet提供了两个命令来帮助你服务你的应用程序： `park` 和 `link` 。



<a name="the-park-command"></a>
### `park` 命令

`park` 命令在你的电脑上注册一个包含应用程序的目录。 一旦该目录被 Valet「parked」，该目录下所有应用都可以使用 `http://文件夹名.test` 来访问：

```shell
cd ~/Sites

valet park
```

这就是所有需要手动的操作。现在，任何你创建在「parked」目录中的应用都可以使用 `http://文件夹名.test` 域名访问。例如，如果你的「parked」路径下包括一个名为「laravel」的目录，可以使用 `http://laravel.test` 来访问。此外，Valet 自动允许二级域名访问此站点。 (`http://foo.laravel.test`)。

<a name="the-link-command"></a>
### `link` 命令

该 `link` 命令也可以用来为你的 Laravel 站点提供服务。如果要为目录中的单个站点而不是整个目录提供服务，则此命令非常有用。

```shell
cd ~/Sites/laravel

valet link
```

使用 `link` 命令链接一个站点后，你可以使用目录名称来访问。例如，你可以在浏览器中通过 `http://laravel.test` 访问。另外，Valet 自动添加了站点二级目录的访问功能，例如 (`http://foo.laravel.test`)。

如果你想要使用不同的域名来访问相同站点，你可以使用 `link` 命令来构造站点。例如，你可以使用以下命令来指定域名 `http://application.test` ：

```shell
cd ~/Sites/laravel

valet link application
```



当然，你也可以使用 `link` 命令来设置子域名访问：

```shell
valet link api.application
```

你可以使用 `links` 命令来查看所有的目录链接：

```shell
valet links
```

`unlink` 命令可以用来删除目录链接：

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### 使用 TLS 保护站点

默认情况下，Valet 使用 HTTP 协议提供服务。当然，如果你想使用 HTTP/2 通过 TLS 加密你的站点，你可以使用 `secure` 命令。例如， 如果你的站点由 `laravel.test` 域名的 Valet 提供服务，可以使用以下命令为站点实现安全保护功能：

```shell
valet secure laravel
```

要 「解除保护」并恢复 HTTP 访问 ，请使用 `unsecure` 命令。像 `secure` 命令一样，该命令接受你想要解除保护的主机名：

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 默认站点

有时，当访问未知的 `test` 域时，你可能希望访问「默认」站点，而不是 `404` 。要实现这一点，你可以在 `~/.config/valet/config.json` 配置文件中添加一个 `default` 选项。 并设置默认站点的路径：

    "default": "/Users/Sally/Sites/example-site",

<a name="per-site-php-versions"></a>
### 站点 PHP 版本

默认情况下，Valet 使用你的全局 PHP 安装来为你的站点提供服务。 但是，如果你需要跨多个站点支持多个 PHP 版本，则可以使用 `isolate` 命令指定特定站点的 PHP 版本。 `isolate` 命令将 Valet 配置为当前工作目录的站点使用指定的 PHP 版本：

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```



如果你的站点名称与目录名称不一致，你可以使用 `--site` 选项指定站点名称：

```shell
valet isolate php@8.0 --site="site-name"
```

为方便起见，你可以使用 `valet php`、`composer` 和 `which-php` 命令根据站点配置的 PHP 版本代理对适合的 PHP CLI 或工具的调用：

```shell
valet php
valet composer
valet which-php
```

你可以执行 `isolated` 命令来显示所有隔离站点及其 PHP 版本的列表：

```shell
valet isolated
```

要将站点恢复为 Valet 全局安装的 PHP 版本，你可以从站点的根目录调用 `unisolate` 命令：

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 共享站点

Valet 甚至包含了一个与全世界共享你的本地站点的命令，提供了一种在移动设备上测试你的站点或与团队成员和客户共享的简单方法。

<a name="sharing-sites-via-ngrok"></a>
### 使用 Ngrok 共享站点

要共享站点，请在终端中进到站点目录，并运行 `valet share` 命令。一个公开可访问的 URL 将会插入到你的剪贴板中，你可以分享给团队成员或在浏览器中打开它:

```shell
cd ~/Sites/laravel

valet share
```

要停止共享你的站点，可以按 `Control + C` 。使用 Ngrok 共享你的网站需要你 [创建一个  Ngrok 帐户](https://dashboard.ngrok.com/signup) 和 [设置身份验证令牌](https://dashboard.ngrok.com/get-started/your-authtoken)。

> **提示**
> 你可以向 share 命令传递额外的参数， 如 `valet share --region=eu`。 详细信息，请参考 [ngrok 文档](https://ngrok.com/docs)。



<a name="sharing-sites-via-expose"></a>
### 通过 Expose 共享网站

如果你已经安装了 [Expose](https://expose.dev/)，你可以在终端里进入网站目录运行 `expose` 命令来共享你的网站。可以访问 [Expose 文档](https://expose.dev/docs) 查看命令行参数说明。共享网站后，Expose 将显示共享 URL，你可以在其他设备或团队成员之间使用它：

```shell
cd ~/Sites/laravel

expose
```
你可以按下 `Control + C` 停止共享网站。

<a name="sharing-sites-on-your-local-network"></a>
### 在局域网里共享网站

Valet 默认限制本机 `127.0.0.1` 访问，以便你的开发机器不会受到来自互联网的安全风险。

如果你想让局域网里的其他设备通过你的局域网 IP 地址访问 Valet 网站（例如：`192.168.1.10/application.test`），则需要手动编辑该网站的 Nginx 配置文件，删除 `listen` 指令上的限制。你需要删除端口 80 和 443 的 `listen` 指令前缀 `127.0.0.1：`。

如果你没有在项目上运行 `valet secure`，则可以通过编辑 `/usr/local/etc/nginx/valet/valet.conf` 文件来为所有非 HTTPS 网站打开网络访问。但是，如果你通过 HTTPS 提供项目站点（即你已经对站点运行了 `valet secure`），则应编辑 `~/.config/valet/Nginx/app-name.test` 文件。

更新了 Nginx 配置后，需要运行 `valet restart` 命令让配置更改生效。



<a name="site-specific-environment-variables"></a>
## 站点特定环境变量

一些使用其他框架的应用程序可能依赖于服务器环境变量，但不提供在你的项目中配置这些变量的方法。 Valet 允许你通过在项目根目录内添加 `.valet-env.php` 文件来配置站点特定环境变量。此文件应返回一个站点 / 环境变量对数组，该数组将添加到数组中指定的每个站点的全局 `$_SERVER` 数组中：

    <?php

    return [
        // 将 laravel.test 站点的 $_SERVER['key'] 设置为 "value"...
        'laravel' => [
            'key' => 'value',
        ],

        // 将所有站点的 $_SERVER['key'] 设置为 "value"...
        '*' => [
            'key' => 'value',
        ],
    ];

<a name="proxying-services"></a>
## 代理服务

有时你可能希望将 Valet 域名代理到本地计算机上的另一项服务。 例如，你可能偶尔需要运行 Valet，同时在 Docker 中运行单独的站点； 但是， Valet 和 Docker 不能同时绑定到80端口。

为了解决这个问题，你可以用 `proxy` 命令去生成一个代理。例如，你可以代理所有流量从 `http://elasticsearch.test` 到 `http://127.0.0.1:9200`：

```shell
# 通过 HTTP 代理...
valet proxy elasticsearch http://127.0.0.1:9200

# 通过 TLS + HTTP/2 代理...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

你可以用 `unproxy` 命令去删除一个代理：

```shell
valet unproxy elasticsearch
```

你可以用 `proxies` 命令列出所有被代理的站点配置：

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 定制 Valet 驱动

你可以编写自己的 Valet「驱动」来为在 Valet 本身不支持的框架或 CMS 上运行的 PHP 应用程序提供服务。安装 Valet 时，创建了一个 `~/.config/valet/Drivers` 目录，其中包含一个 `SampleValetDriver.php` 文件。该文件包含一个示例驱动程序实现，用于演示如何编写自定义驱动程序。编写驱动只需要你实现三种方法：  `serves` ， `isStaticFile` ， 和 `frontControllerPath`。



这三种方法都接收 `$sitePath`, `$siteName`, 和 `$uri` 值作为其参数。 `$sitePath` 是你机器上服务的网站的完整的路径， 如 `/Users/Lisa/Sites/my-project`。 `$siteName` 是 「host」/「site name」域名的一部分 (`my-project`)。`$uri` 是传入的请求 URI (`/foo/bar`)。

完成你的自定义 Valet 驱动后，使用 `frameworkvaletdriver.php` 命名约定将它放在`~/.config/valet/Drivers` 目录中。 例如，如果你正在为 WordPress 编写自定义 Valet 驱动，则文件名应为 `WordPressValetDriver.php`。

我们来看看自定义的 Valet 驱动程序应该实现的每种方法的示例实现。

<a name="the-serves-method"></a>
#### `serves` 方法

如果驱动程序应该处理传入的请求，`serves` 方法应该返回 `true`。否则，该方法应返回 `false`。因此，在这个方法中，你应该尝试确定给定的`$sitePath` 是否包含你试图服务的类型的项目。

例如，假设我们正在编写一个 `WordPressValetDriver`。我们的 `serves` 方法可能看起来如下所示：

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

`isStaticFile` 应当确定即将到来的请求是否针对一个「静态」文件，比如：图片和样式表。如果文件是静态的，此方法应当返回静态文件在磁盘上的完全限定路径。如果即将到来的请求不是针对一个静态文件，这个方法应当返回 `false`：

    /**
     * 确定传入请求是否针对静态文件。
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

> **注意**  
> 仅当 `serves` 方法对传入请求返回 `true` 且请求 URI 不是 `/` 时，才会调用 `isStaticFile` 方法。



<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 方法

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

如果你想要为单个应用自定义一个 Valet 驱动，请在应用根目录创建一个 `LocalValetDriver.php`  文件。你的自定义驱动可以继承 `ValetDriver`  基类或继承现有应用的特定驱动程序，如 `LaravelValetDriver`：


    use Valet\Drivers\LaravelValetDriver;

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

<div class="overflow-auto">

命令  | 描述
------------- | -------------
`valet list` | 列出所有 Valet 命令
`valet forget` | 从「驻留」目录运行此命令，将其从驻留目录列表中删除。
`valet log` | 查看 Valet 服务记录的日志列表。
`valet paths` | 查看所有「驻留」的路径。
`valet restart` | 重启 Valet 守护进程。
`valet start` | 启动 Valet 守护进程。
`valet stop` | 停止 Valet 守护进程。
`valet trust` | 为 Brew 和 Valet 添加 sudoers 文件，使 Valet 输入命令的时候不需要输入密码。
`valet uninstall` | 卸载 Valet：显示手动卸载的说明。 传递 `--force` 选项来主动删除 Valet 的所有资源。

</div>



<a name="valet-directories-and-files"></a>
## Valet 目录和文件

你可能会发现以下目录和文件信息对排查你的 Valet 环境故障问题很有帮助：

#### `~/.config/valet`

包含 Valet 所有的配置，你可能希望对此文件夹进行备份。

#### `~/.config/valet/dnsmasq.d/`

此目录包含 DNSMasq 的配置。

#### `~/.config/valet/Drivers/`

此目录包含 Valet 的驱动，驱动判断如何为特定的 framework/CMS 提供服务。

#### `~/.config/valet/Extensions/`

此目录包括自定义的 Valet 扩展和指令。

#### `~/.config/valet/Nginx/`

此目录包含所有 Valet 的 Nginx 站点配置，当运行 `install`、`secure`、`tld` 指令时会重建这些配置文件。

#### `~/.config/valet/Sites/`

此目录包含所有 [链接项目](#the-link-command)的符号链接。

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

此目录包含用于各种 PHP 配置设置的 `*.ini` 文件

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

此文件是 PHP-FPM 池配置文件。

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`



该文件是默认的 Nginx 配置文件，用来为你的网站生成 SSL 证书。

<a name="disk-access"></a>
### 磁盘访问权限

从 maxOS 10.14 开始，[访问部分文件和目录默认受限](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf)。这些限制包括桌面，文档，以及下载目录。此外，网络磁盘和可卸载磁盘访问也受限。因此，Valet 推荐你不要将网站目录放在这些受保护的地方。

尽管如此，如果你希望在上述这些地方里提供网站服务，则要给予 Nginx「完全磁盘访问权限」。否则，Nginx 可能会出现服务器错误或其他不可预知的行为，尤其是访问静态资源时。通常来说，macOS 会自动询问你是否给予 Nginx 对这些地方的完全访问权限。或者，你也可以通过 `系统偏好设置` > `安全性与隐私` > `隐私`，然后选择 `完全磁盘访问权限` 手动设置。接下来，在主窗口中启用所有 `nginx` 选项。

