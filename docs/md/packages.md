# 包开发

- [介绍](#introduction)
     - [关于 Facades](#a-note-on-facades)
- [包发现](#package-discovery)
- [服务提供商](#service-providers)
- [资源](#resources)
     - [配置](#配置)
     - [迁移](#migrations)
     - [路由](#routes)
     - [翻译](#translations)
     - [视图](#views)
     - [视图组件](#view-components)
- [命令](#commands)
- [公共资源](#public-assets)
- [发布文件组](#publishing-file-groups)

<a name="introduction"></a>
## 介绍

包是向 Laravel 添加功能的主要方式。 包可能是处理日期的好方法，例如 [Carbon](https://github.com/briannesbitt/Carbon)，也可能是允许您将文件与 Eloquent 模型相关联的包，例如 Spatie 的 [Laravel 媒体库](https://github.com/spatie/laravel-medialibrary)。

有不同类型的包。 有些包是独立的，这意味着它们可以与任何 PHP 框架一起使用。 Carbon 和 PHPUnit 是独立包的示例。 任何这些包都可以通过在你的 `composer.json` 文件中的要求来与 Laravel 一起使用。

另一方面，其他软件包专门用于 Laravel。 这些包可能包含专门用于增强 Laravel 应用程序的路由、控制器、视图和配置。 本指南主要涵盖了那些特定于 Laravel 的包的开发。

<a name="a-note-on-facades"></a>
### 关于 Facades

在编写 Laravel 应用程序时，通常使用契约（Contracts）还是门面（Facades）并不重要，因为两者都提供了基本相同的可测试性级别。 但是，在编写包时，您的包通常无法访问 Laravel 的所有测试助手。 如果您希望能够像将包安装在典型的 Laravel 应用程序中一样编写包测试，您可以使用 [Orchestral Testbench](https://github.com/orchestral/testbench) 包。



<a name="package-discovery"></a>
## 包发现

在 Laravel 应用程序的 `config/app.php` 配置文件中，`providers` 选项定义了 Laravel 应该加载的服务提供者列表。 当有人安装您的软件包时，您通常希望您的服务提供商包含在此列表中。 您可以在包的 `composer.json` 文件的 `extra` 部分中定义提供者，而不是要求用户手动将您的服务提供者添加到列表中。 除了服务提供商之外，您还可以列出您想注册的任何 [facades](/docs/laravel/9.x/facades)：

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

一旦你的包被配置为发现，Laravel 将在安装时自动注册它的服务提供者和门面，为你的包的用户创造一个方便的安装体验。

<a name="opting-out-of-package-discovery"></a>
### 选择退出包发现

如果您是一个包的消费者并且想要禁用包的包发现，您可以在应用程序的 `composer.json` 文件的 `extra` 部分列出包名：

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

您可以使用应用程序的 `dont-discover` 指令中的 `*` 字符禁用所有包的包发现：

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
## 服务供应商

[服务提供者](/docs/laravel/9.x/providers) 是你的包和 Laravel 之间的连接点。 服务提供者负责将事物绑定到 Laravel 的 [服务容器](/docs/laravel/9.x/container) 并通知 Laravel 在哪里加载包资源，例如视图、配置和本地化文件。



服务提供者扩展了 `Illuminate\Support\ServiceProvider` 类并包含两个方法：`register` 和 `boot`。 基本的 `ServiceProvider` 类位于 `illuminate/support` Composer 包中，您应该将其添加到您自己的包的依赖项中。 要了解有关服务提供者的结构和目的的更多信息，请查看 [他们的文档](/docs/laravel/9.x/providers)。

<a name="resources"></a>
## 资源

<a name="configuration"></a>
### 配置

通常，您需要将包的配置文件发布到应用程序的 `config` 目录。 这将允许您的包的用户轻松覆盖您的默认配置选项。 要允许发布配置文件，请从服务提供者的 `boot` 方法中调用 `publishes` 方法：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->publishes([
            __DIR__.'/../config/courier.php' => config_path('courier.php'),
        ]);
    }

现在，当你的包的用户执行 Laravel 的 `vendor:publish` 命令时，你的文件将被复制到指定的发布位置。 发布配置后，可以像访问任何其他配置文件一样访问其值：

    $value = config('courier.option');

> 注意：您不应该在配置文件中定义闭包。 当用户执行 `config:cache` Artisan 命令时，它们无法正确序列化。

<a name="default-package-configuration"></a>
#### 默认包配置

您还可以将自己的包配置文件与应用程序的已发布副本合并。 这将允许您的用户在配置文件的已发布副本中仅定义他们实际想要覆盖的选项。 要合并配置文件值，请在服务提供商的 `register` 方法中使用 `mergeConfigFrom` 方法。



`mergeConfigFrom` 方法接受包配置文件的路径作为其第一个参数，应用程序的配置文件副本的名称作为其第二个参数：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/courier.php', 'courier'
        );
    }

> 注意：此方法仅合并配置数组的第一级。 如果您的用户部分定义了多维配置数组，则不会合并缺少的选项。

<a name="routes"></a>
### 路由

如果你的包包含路由，你可以使用 `loadRoutesFrom` 方法加载它们。 此方法将自动确定应用程序的路由是否被缓存，如果路由已被缓存，则不会加载您的路由文件：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

<a name="migrations"></a>
### 迁移

如果你的包包含 [数据库迁移](/docs/laravel/9.x/migrations)，你可以使用 `loadMigrationsFrom` 方法告诉 Laravel 如何加载它们。 `loadMigrationsFrom` 方法接受包迁移的路径作为其唯一参数：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
    }

一旦您的包的迁移被注册，它们将在执行 `php artisan migrate` 命令时自动运行。 您不需要将它们导出到应用程序的 `database/migrations` 目录。

<a name="translations"></a>
### 翻译

如果你的包包含 [翻译文件](/docs/laravel/9.x/localization)，你可以使用 `loadTranslationsFrom` 方法告诉 Laravel 如何加载它们。 例如，如果您的包名为 `courier`，则应将以下内容添加到服务提供商的 `boot` 方法中：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
    }



使用 `package::file.line` 语法约定引用包翻译。 因此，您可以从 `messages` 文件中加载 `courier` 包的 `welcome` 行，如下所示：

    echo trans('courier::messages.welcome');

<a name="publishing-translations"></a>
#### 翻译

如果您想将包的翻译发布到应用程序的 `lang/vendor` 目录，您可以使用服务提供者的 `publishes` 方法。 `publishes` 方法接受一组包路径及其所需的发布位置。 例如，要发布 `courier` 包的翻译文件，您可以执行以下操作：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

        $this->publishes([
            __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
        ]);
    }

现在，当你的包的用户执行 Laravel 的 `vendor:publish` Artisan 命令时，你的包的翻译将被发布到指定的发布位置。

<a name="views"></a>
### 视图

要将包的 [views](/docs/laravel/9.x/views) 注册到 Laravel，你需要告诉 Laravel 视图的位置。 您可以使用服务提供者的 `loadViewsFrom` 方法来执行此操作。 `loadViewsFrom` 方法接受两个参数：视图模板的路径和包的名称。 例如，如果您的包的名称是 `courier`，您可以将以下内容添加到服务提供商的 `boot` 方法中：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
    }

使用 `package::view` 语法约定来引用包视图。 因此，一旦您的视图路径在服务提供者中注册，您就可以从 `courier` 包中加载 `dashboard` 视图，如下所示：

    Route::get('/dashboard', function () {
        return view('courier::dashboard');
    });



<a name="overriding-package-views"></a>
#### 覆盖包视图

当你使用 `loadViewsFrom` 方法时，Laravel 实际上为你的视图注册了两个位置：应用程序的 `resources/views/vendor` 目录和你指定的目录。 因此，以 `courier` 包为例，Laravel 将首先检查开发人员是否已将自定义版本的视图放置在 `resources/views/vendor/courier` 目录中。 然后，如果视图没有被自定义，Laravel 将搜索你在调用 `loadViewsFrom` 时指定的包视图目录。 这使包用户可以轻松自定义/覆盖您的包的视图。

<a name="publishing-views"></a>
#### 发布视图

如果您想让您的视图可用于发布到应用程序的 `resources/views/vendor` 目录，您可以使用服务提供者的 `publishes` 方法。 `publishes` 方法接受一组包视图路径及其所需的发布位置：

    /**
     * Bootstrap package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
        ]);
    }

现在，当你的包的用户执行 Laravel 的 `vendor:publish` Artisan 命令时，你的包的视图将被复制到指定的发布位置。

<a name="view-components"></a>
### 视图组件

如果你的包包含 [视图组件](/docs/laravel/9.x/blade#components)，你可以使用 `loadViewComponentsAs` 方法告诉 Laravel 如何加载它们。 `loadViewComponentsAs` 方法接受两个参数：视图组件的标签前缀和视图组件类名称的数组。 例如，如果您的包的前缀是 `courier` 并且您有 `Alert` 和 `Button` 视图组件，您可以将以下内容添加到服务提供者的 `boot` 方法中：

    use Courier\Components\Alert;
    use Courier\Components\Button;

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewComponentsAs('courier', [
            Alert::class,
            Button::class,
        ]);
    }



一旦您的视图组件在服务提供者中注册，您可以在视图中引用它们，如下所示：

```blade
<x-courier-alert />

<x-courier-button />
```

<a name="anonymous-components"></a>
#### 匿名组件

如果你的包包含匿名组件，它们必须放在你包的 `views` 目录的 `components` 目录中（由`loadViewsFrom` 指定）。 然后，您可以通过在组件名称前加上包的视图命名空间来呈现它们：

```blade
<x-courier::alert />
```

<a name="commands"></a>
## 命令

要在 Laravel 中注册你的包的 Artisan 命令，你可以使用 `commands` 方法。 此方法需要一个命令类名称数组。 注册命令后，您可以使用 [Artisan CLI](/docs/laravel/9.x/artisan) 执行它们：

    use Courier\Console\Commands\InstallCommand;
    use Courier\Console\Commands\NetworkCommand;

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
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

您的包可能包含 JavaScript、CSS 和图像等资产。要将这些资产发布到应用程序的 `public` 目录，请使用服务提供者的 `publishes` 方法。在本例中，我们还将添加一个 `public` 资产组标签，可用于轻松发布相关资产组：

    /**
     * Bootstrap any package services.
     *
     * @return void
     */
    public function boot()
    {
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/courier'),
        ], 'public');
    }

现在，当您的包的用户执行 `vendor:publish` 命令时，您的资产将被复制到指定的发布位置。由于用户通常需要在每次更新包时覆盖资产，您可以使用 `--force` 标志：

```shell
php artisan vendor:publish --tag=public --force
```



<a name="publishing-file-groups"></a>
## 发布文件组

您可能希望单独发布包资产和资源组。例如，您可能希望允许用户发布包的配置文件，而不是被迫发布包的全部资产。您可以在包的服务提供者中调用 `publishes` 方法时定义「标签」来做到这一点。例如，让我们使用标签在包的服务提供者的 `boot` 方法中为 `courier` 包定义两个发布组（`courier-config` 和 `courier-migrations`）：

    /**
     * 引导任何包服务。
     *
     * @return void
     */
    public function boot()
    {
        $this->publishes([
            __DIR__.'/../config/package.php' => config_path('package.php')
        ], 'courier-config');

        $this->publishes([
            __DIR__.'/../database/migrations/' => database_path('migrations')
        ], 'courier-migrations');
    }

现在，您的用户可以通过在执行 `vendor:publish` 命令时引用他们的标签来分别发布这些组：

```shell
php artisan vendor:publish --tag=courier-config
```

