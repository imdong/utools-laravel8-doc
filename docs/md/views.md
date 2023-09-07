# 视图

- [介绍](#introduction)
    - [在 React / Vue 中编写视图](#writing-views-in-react-or-vue)
- [创建和渲染视图](#creating-and-rendering-views)
    - [嵌套视图目录](#nested-view-directories)
    - [创建第一个可用视图](#creating-the-first-available-view)
    - [确定视图是否存在](#determining-if-a-view-exists)
- [向视图传递数据](#passing-data-to-views)
    - [与所有视图分享数据](#sharing-data-with-all-views)
- [视图组件](#view-composers)
    - [视图构造器](#view-creators)
- [视图构造器](#optimizing-views)

<a name="introduction"></a>
## 介绍

当然，直接从路由和控制器返回整个 HTML 文档字符串是不切实际的。值得庆幸的是，视图提供了一种方便的方式来将我们所有的 HTML 放在单独的文件中。

视图将你的控制器 / 应用程序逻辑与你的表示逻辑分开并存储在 `resources/views` 目录中。一个简单的视图可能看起来像这样：使用 Laravel 时，视图模板通常使用[Blade模板语言](/docs/laravel/10.x/blade) 编写。一个简单的视图如下所示：

```blade
<!-- 视图存储在 `resources/views/greeting.blade.php` -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

将上述代码存储到 `resources/views/greeting.blade.php` 后，我们可以使用全局辅助函数 `view` 将其返回，例如：

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

> 技巧：如果你想了解更多关于如何编写 Blade 模板的更多信息？查看完整的 [Blade 文档](/docs/laravel/10.x/blade) 将是最好的开始。

<a name="writing-views-in-react-or-vue"></a>
### 在 React / Vue 中编写视图

许多开发人员已经开始倾向于使用 React 或 Vue 编写模板，而不是通过 Blade 在 PHP 中编写前端模板。Laravel 让这件事不痛不痒，这要归功于 [惯性](https://inertiajs.com/)，这是一个库，可以轻松地将 React / Vue 前端连接到 Laravel 后端，而无需构建 SPA 的典型复杂性。


我们的 Breeze 和 Jetstream [starter kits](https://laravel.com/docs/10.x/starter-kits) 为你提供了一个很好的起点，用 Inertia 驱动你的下一个 Laravel 应用程序。此外，[Laravel Bootcamp](https://bootcamp.laravel.com/) 提供了一个完整的演示，展示如何构建一个由 Inertia 驱动的 Laravel 应用程序，包括 Vue 和 React 的示例。

<a name="creating-and-rendering-views"></a>

## 创建和渲染视图

你可以通过在应用程序 `resources/views` 目录中放置具有 `.blade.php` 扩展名的文件来创建视图。该 `.blade.php` 扩展通知框架该文件包含一个 [Blade 模板](/docs/laravel/10.x/blade)。Blade 模板包含 HTML 和 Blade 指令，允许你轻松地回显值、创建「if」语句、迭代数据等。

创建视图后，可以使用全局 `view` 从应用程序的某个路由或控制器返回视图：

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

也可以使用 `View` 视图门面（Facade）：

    use Illuminate\Support\Facades\View;

    return View::make('greeting', ['name' => 'James']);

如上所示，传递给 `view` 的第一个参数对应于 `resources/views` 目录中视图文件的名称。第二个参数是应该对视图可用的数据数组。在这种情况下，我们传递 name 变量，它使用 [Blade 语法](/docs/laravel/10.x/blade)显示在视图中。

<a name="nested-view-directories"></a>
### 嵌套视图目录

视图也可以嵌套在目录 `resources/views` 的子目录中。「.」符号可用于引用嵌套视图。例如，如果视图存储在  `resources/views/admin/profile.blade.php` ，你可以从应用程序的路由或控制器中返回它，如下所示：

    return view('admin.profile', $data);

> 注意：查看目录名称不应包含该 . 字符。



<a name="creating-the-first-available-view"></a>
### 创建第一个可用视图

使用 `View` 门面的 `first` 方法，你可以创建给定数组视图中第一个存在的视图。如果你的应用程序或开发的第三方包允许定制或覆盖视图，这会非常有用：

    use Illuminate\Support\Facades\View;

    return View::first(['custom.admin', 'admin'], $data);

<a name="determining-if-a-view-exists"></a>
### 判断视图文件是否存在

如果需要判断视图文件是否存在，可以使用 `View` 门面。如果视图存在， `exists` 方法会返回 `true`：

    use Illuminate\Support\Facades\View;

    if (View::exists('emails.customer')) {
        // ...
    }

<a name="passing-data-to-views"></a>
## 向视图传递数据

正如您在前面的示例中看到的，您可以将数据数组传递给视图，以使该数据可用于视图：

    return view('greetings', ['name' => 'Victoria']);

以这种方式传递信息时，数据应该是带有键 / 值对的数组。向视图提供数据后，您可以使用数据的键访问视图中的每个值，例如 `<?php echo $name; ?>`。

作为将完整的数据数组传递给 `view` 辅助函数的替代方法，你可以使用该 `with` 方法将单个数据添加到视图中。该 `with` 方法返回视图对象的实例，以便你可以在返回视图之前继续链接方法：

    return view('greeting')
                ->with('name', 'Victoria')
                ->with('occupation', 'Astronaut');

<a name="sharing-data-with-all-views"></a>
### 与所有视图共享数据

有时，你可能需要与应用程序呈现的所有视图共享数据，可以使用 `View` 门面的 `share` 。你可以在服务提供器的 `boot` 方法中调用视图门面（Facade）的 share 。例如，可以将它们添加到 `App\Providers\AppServiceProvider` 或者为它们生成一个单独的服务提供器：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册应用服务.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任何应用程序服务。
         */
        public function boot(): void
        {
            View::share('key', 'value');
        }
    }



<a name="view-composers"></a>
## 查看合成器

视图合成器是在呈现视图时调用的回调或类方法。如果每次渲染视图时都希望将数据绑定到视图，则视图合成器可以帮助你将逻辑组织到单个位置。如果同一视图由应用程序中的多个路由或控制器返回，并且始终需要特定的数据，视图合成器或许会特别有用。

通常，视图合成器将在应用程序的一个 [服务提供者](/docs/laravel/10.x/providers) 中注册。在本例中，我们假设我们已经创建了一个新的 `App\Providers\ViewServiceProvider` 来容纳此逻辑。

我们将使用 `View` 门面的 `composer` 方法来注册视图合成器。 Laravel 不包含基于类的视图合成器的默认目录，因此你可以随意组织它们。例如，可以创建一个 `app/View/Composers` 目录来存放应用程序的所有视图合成器：

    <?php

    namespace App\Providers;

    use App\View\Composers\ProfileComposer;
    use Illuminate\Support\Facades;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\View\View;

    class ViewServiceProvider extends ServiceProvider
    {
        /**
         * 注册任何应用程序服务。
         */
        public function register(): void
        {
            // ...
        }

        /**
         * 引导任何应用程序服务。
         */
        public function boot(): void
        {
            // 使用基于类的合成器。。。
            Facades\View::composer('profile', ProfileComposer::class);

            // 使用基于闭包的合成器。。。
            Facades\View::composer('welcome', function (View $view) {
                // ...
            });

            Facades\View::composer('dashboard', function (View $view) {
                // ...
            });
        }
    }

> 注意：请记住，如果创建一个新的服务提供程序来包含视图合成器注册，则需要将服务提供程序添加到 `config/app.php` 配置文件中的 `providers` 数组中。



现在我们注册了视图合成器，每次渲染 `profile` 视图时都会执行 `App\View\Composers\ProfileComposer` 类的 `compose` 方法。接下来看一个视图合成器类的例子：

    <?php

    namespace App\View\Composers;

    use App\Repositories\UserRepository;
    use Illuminate\View\View;

    class ProfileComposer
    {
        /**
         * 创建新的配置文件合成器。
         */
        public function __construct(
            protected UserRepository $users,
        ) {}

        /**
         * 将数据绑定到视图。
         */
        public function compose(View $view): void
        {
            $view->with('count', $this->users->count());
        }
    }

如上所示，所有的视图合成器都会通过 [服务容器](/docs/laravel/10.x/container)进行解析，所以你可以在视图合成器的构造函数中类型提示需要注入的依赖项。

<a name="attaching-a-composer-to-multiple-views"></a>
#### 将视图合成器添加到多个视图

你可以通过将视图数组作为第一个参数传递给 `composer` 方法，可以一次添加多个视图到视图合成器中：

    use App\Views\Composers\MultiComposer;
    use Illuminate\Support\Facades\View;

    View::composer(
        ['profile', 'dashboard'],
        MultiComposer::class
    );

该 `composer` 方法同时也接受通配符 `*` ，表示将所有视图添加到视图合成器中：

    use Illuminate\Support\Facades;
    use Illuminate\View\View;

    Facades\View::composer('*', function (View $view) {
        // ...
    });

<a name="view-creators"></a>
### 视图构造器

视图构造器「creators」和视图合成器非常相似。唯一不同之处在于视图构造器在视图实例化之后执行，而视图合成器在视图即将渲染时执行。使用 `creator` 方法注册视图构造器：

    use App\View\Creators\ProfileCreator;
    use Illuminate\Support\Facades\View;

    View::creator('profile', ProfileCreator::class);



<a name="optimizing-views"></a>
## 优化视图

默认情况下，Blade 模板视图是按需编译的。当执行渲染视图的请求时，Laravel 将确定视图的编译版本是否存在。如果文件存在，Laravel 将比较未编译的视图和已编译的视图是否有修改。如果编译后的视图不存在，或者未编译的视图已被修改，Laravel 将重新编译该视图。

在请求期间编译视图可能会对性能产生小的负面影响，因此 Laravel 提供了 `view:cache` Artisan 命令来预编译应用程序使用的所有视图。为了提高性能，你可能希望在部署过程中运行此命令：

```shell
php artisan view:cache
```

你可以使用 `view:clear` 命令清除视图缓存：

```shell
php artisan view:clear
```

