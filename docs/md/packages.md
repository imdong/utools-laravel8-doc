# 包开发

- [介绍](#introduction)
    - [关于 Facades](#a-note-on-facades)
- [包发现](#package-discovery)
- [服务提供者](#service-providers)
- [资源](#resources)
    - [配置](#configuration)
    - [迁移](#migrations)
    - [路由](#routes)
    - [语言文件](#language-files)
    - [视图](#views)
    - [视图组件](#view-components)
    - ["About" Artisan 命令](#about-artisan-command)
- [命令](#commands)
- [公共资源](#public-assets)
- [发布文件组](#publishing-file-groups)

<a name="introduction"></a>
## 介绍

包是向 Laravel 添加功能的主要方式。包可能是处理日期的好方法，例如 [Carbon](https://github.com/briannesbitt/Carbon)，也可能是允许您将文件与 Eloquent 模型相关联的包，例如 Spatie 的 [Laravel 媒体库](https://github.com/spatie/laravel-medialibrary)。

包有不同类型。有些包是独立的，这意味着它们可以与任何 PHP 框架一起使用。 Carbon 和 PHPUnit 是独立包的示例。这种包可以通过 `composer.json` 文件引入，在 Laravel 中使用。

此外，还有一些包是专门用在 Laravel 中。这些包可能包含路由、控制器、视图和配置，专门用于增强 Laravel 应用。本教程主要涵盖的就是这些专用于 Laravel 的包的开发。

<a name="a-note-on-facades"></a>
### 关于 Facades

编写 Laravel 应用时，通常使用契约（Contracts）还是门面（Facades）并不重要，因为两者都提供了基本相同的可测试性级别。但是，在编写包时，包通常是无法使用 Laravel 的所有测试辅助函数。如果您希望能够像将包安装在典型的 Laravel 应用程序中一样编写包测试，您可以使用 [Orchestral Testbench](https://github.com/orchestral/testbench) 包。


<a name="package-discovery"></a>
## 包发现

在 Laravel 应用程序的 `config/app.php` 配置文件中，providers 选项定义了 Laravel 应该加载的服务提供者列表。当有人安装您的软件包时，您通常希望您的服务提供者也包含在此列表中。 您可以在包的 `composer.json` 文件的 `extra` 部分中定义提供者，而不是要求用户手动将您的服务提供者添加到列表中。除了服务提供者外，您还可以列出您想注册的任何 [facades](/docs/laravel/10.x/facades)：

```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

当你的包配置了包发现后，Laravel 会在安装该包时自动注册服务提供者及 Facades，这样就为你的包用户创造一个便利的安装体验。

<a name="opting-out-of-package-discovery"></a>
### 退出包发现

如果你是包消费者，要禁用包发现功能，你可以在应用的 `composer.json` 文件的 `extra` 区域列出包名：

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

你可以在应用的 `dont-discover` 指令中使用 `*` 字符，禁用所有包的包发现功能：

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## 服务提供者

[服务提供者](/docs/laravel/10.x/providers)是你的包和 Laravel 之间的连接点。服务提供者负责将事物绑定到 Laravel 的[服务容器](/docs/laravel/10.x/container)并告知 Laravel 到哪里去加载包资源，比如视图、配置及语言文件。



服务提供者扩展了 `Illuminate/Support/ServiceProvider` 类，包含两个方法： `register` 和 `boot`。基本的 `ServiceProvider` 类位于 `illuminate/support` Composer 包中，你应该把它添加到你自己包的依赖项中。要了解更多关于服务提供者的结构和目的，请查看 [服务提供者](/docs/laravel/10.x/providers).

<a name="resources"></a>
## 资源

<a name="configuration"></a>
### 配置

通常情况下，你需要将你的包的配置文件发布到应用程序的 `config` 目录下。这将允许在使用包时覆盖扩展包中的默认配置选项。发布配置文件，需要在服务提供者的 `boot` 方法中调用 `publishes` 方法:

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/courier.php' => config_path('courier.php'),
        ]);
    }

使用扩展包的时候执行 Laravel 的 `vendor:publish` 命令, 你的文件将被复制到指定的发布位置。 一旦你的配置被发布, 它的值可以像其他的配置文件一样被访问:

    $value = config('courier.option');

> **Warning**  
> 你不应该在你的配置文件中定义闭包。当用户执行 `config:cache` Artisan 命令时，它们不能被正确序列化。

<a name="default-package-configuration"></a>
#### 默认的包配置

你也可以将你自己的包的配置文件与应用程序的发布副本合并。这将允许你的用户在配置文件的发布副本中只定义他们真正想要覆盖的选项。要合并配置文件的值，请使用你的服务提供者的 `register` 方法中的 `mergeConfigFrom` 方法。



`mergeConfigFrom` 方法的第一个参数为你的包的配置文件的路径，第二个参数为应用程序的配置文件副本的名称：

    /**
     * 注册应用程序服务
     */
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/courier.php', 'courier'
        );
    }

> **Warning**  
> 这个方法只合并了配置数组的第一层。如果你的用户部分地定义了一个多维的配置阵列，缺少的选项将不会被合并。

<a name="routes"></a>
### 路由

如果你的软件包包含路由，你可以使用 `loadRoutesFrom` 方法加载它们。这个方法会自动判断应用程序的路由是否被缓存，如果路由已经被缓存，则不会加载你的路由文件：

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

<a name="migrations"></a>
### 迁移

如果你的软件包包含了 [数据库迁移](/docs/laravel/10.x/migrations) , 你可以使用 `loadMigrationsFrom` 方法来加载它们。`loadMigrationsFrom` 方法的参数为软件包迁移文件的路径。

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
    }

一旦你的软件包的迁移被注册，当 `php artisan migrate` 命令被执行时，它们将自动被运行。你不需要把它们导出到应用程序的 `database/migrations` 目录中。

<a name="language-files"></a>
### 语言文件

如果你的软件包包含 [语言文件](/docs/laravel/10.x/localization) , 你可以使用 `loadTranslationsFrom` 方法来加载它们。 例如, 如果你的包被命名为 `courier` , 你应该在你的服务提供者的 `boot` 方法中加入以下内容:

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
    }



包的翻译行是使用 `package::file.line` 的语法惯例来引用的。因此，你可以这样从 `messages` 文件中加载 `courier` 包的 `welcome` 行：

    echo trans('courier::messages.welcome');

<a name="publishing-language-files"></a>
#### 发布语言文件

如果你想把包的语言文件发布到应用程序的 `lang/vendor` 目录，可以使用服务提供者的 `publishes` 方法。`publishes` 方法接受一个软件包路径和它们所需的发布位置的数组。例如，要发布 `courier` 包的语言文件，你可以做以下工作：

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

        $this->publishes([
            __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
        ]);
    }

当你的软件包的用户执行Laravel的 `vendor:publish` Artisan 命令时, 你的软件包的语言文件会被发布到指定的发布位置。

<a name="views"></a>
### 视图

要在 Laravel 注册你的包的 [视图](/docs/laravel/10.x/views) , 你需要告诉 Laravel 这些视图的位置. 你可以使用服务提供者的 `loadViewsFrom` 方法来完成。`loadViewsFrom` 方法接受两个参数: 视图模板的路径和包的名称。 例如，如果你的包的名字是 `courier`，你可以在服务提供者的 `boot` 方法中加入以下内容：

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
    }

包的视图是使用 `package::view` 的语法惯例来引用的。因此，一旦你的视图路径在服务提供者中注册，你可以像这样从 `courier` 包中加载 `dashboard` 视图。

    Route::get('/dashboard', function () {
        return view('courier::dashboard');
    });



<a name="overriding-package-views"></a>
#### 覆盖包的视图

当你使用 `loadViewsFrom` 方法时, Laravel 实际上为你的视图注册了两个位置: 应用程序的 `resources/views/vendor` 目录和你指定的目录。 所以, 以 `courier` 包为例, Laravel 首先会检查视图的自定义版本是否已经被开发者放在 `resources/views/vendor/courier` 目录中。 然后, 如果视图没有被定制, Laravel 会搜索你在调用 `loadViewsFrom` 时指定的包的视图目录. 这使得包的用户可以很容易地定制/覆盖你的包的视图。

<a name="publishing-views"></a>
#### 发布视图

如果你想让你的视图可以发布到应用程序的 `resources/views/vendor` 目录下，你可以使用服务提供者的 `publishes` 方法。`publishes` 方法接受一个数组的包视图路径和它们所需的发布位置：

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
        ]);
    }

当你的包的用户执行 Laravel 的 `vendor:publish` Artisan 命令时, 你的包的视图将被复制到指定的发布位置。

<a name="view-components"></a>
### 视图组件

如果你正在建立一个用 Blade 组件的包，或者将组件放在非传统的目录中，你将需要手动注册你的组件类和它的 HTML 标签别名，以便 Laravel 知道在哪里可以找到这个组件。你通常应该在你的包的服务提供者的 `boot` 方法中注册你的组件:

    use Illuminate\Support\Facades\Blade;
    use VendorPackage\View\Components\AlertComponent;

    /**
     * 引导你的包的服务
     */
    public function boot(): void
    {
        Blade::component('package-alert', AlertComponent::class);
    }



当组件注册成功后，你就可以使用标签别名对其进行渲染：

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 自动加载包组件

此外，你可以使用 `compoentNamespace` 方法依照规范自动加载组件类。比如，`Nightshade` 包中可能有 `Calendar` 和 `ColorPicker` 组件，存在于 `Nightshade\Views\Components` 命名空间中：

    use Illuminate\Support\Facades\Blade;

    /**
     * 启动包服务
     */
    public function boot(): void
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }

我们可以使用 `package-name::` 语法，通过包提供商的命名空间调用包组件：

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade 会通过组件名自动检测链接到该组件的类。子目录也支持使用'点'语法。

<a name="anonymous-components"></a>
#### 匿名组件

如果包中有匿名组件，则必须将它们放在包的视图目录(由[`loadViewsFrom` 方法](#views)指定)的 `components` 文件夹下。然后，你就可以通过在组件名的前面加上包视图的命名空间来对其进行渲染了：

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" Artisan 命令

Laravel 内建的 `about` Artisan 命令提供了应用环境和配置的摘要信息。包可以通过 `AboutCommand` 类为该命令输出添加附加信息。一般而言，这些信息可以在包服务提供者的 `boot` 方法中添加：

    use Illuminate\Foundation\Console\AboutCommand;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
    }

<a name="commands"></a>
## 命令

要在 Laravel 中注册你的包的 Artisan 命令，你可以使用 `commands` 方法。 此方法需要一个命令类名称数组。 注册命令后，您可以使用 [Artisan CLI](https://learnku.com/docs/laravel/9.x/artisan) 执行它们：

    use Courier\Console\Commands\InstallCommand;
    use Courier\Console\Commands\NetworkCommand;

    /**
     * Bootstrap any package services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
                NetworkCommand::class,
            ]);
        }
    }



<a name="public-assets"></a>
## 公共资源

你的包可能有诸如 JavaScript 、CSS 和图片等资源。要发布这些资源到应用程序的 `public` 目录，请使用服务提供者的 `publishes` 方法。在下面例子中，我们还将添加一个 `public` 资源组标签，它可以用来轻松发布相关资源组：

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/courier'),
        ], 'public');
    }

当你的软件包的用户执行 `vendor:publish` 命令时，你的资源将被复制到指定的发布位置。通常用户需要在每次更新包的时候都要覆盖资源，你可以使用 `--force` 标志。

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 发布文件组

你可能想单独发布软件包的资源和资源组。例如，你可能想让你的用户发布你的包的配置文件，而不被强迫发布你的包的资源。你可以通过在调用包的服务提供者的 `publishes` 方法时对它们进行 `tagging` 来做到这一点。例如，让我们使用标签在软件包服务提供者的 `boot` 方法中为 `courier` 软件包定义两个发布组（ `courier-config` 和 `courier-migrations` ）。

    /**
     * 引导包服务
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/package.php' => config_path('package.php')
        ], 'courier-config');

        $this->publishes([
            __DIR__.'/../database/migrations/' => database_path('migrations')
        ], 'courier-migrations');
    }

现在你的用户可以在执行 `vendor:publish` 命令时引用他们的标签来单独发布这些组。

```shell
php artisan vendor:publish --tag=courier-config
```

