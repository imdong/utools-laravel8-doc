# 视图

- [介绍](#introduction)
- [创建和渲染视图](#creating-and-rendering-views)
    - [嵌套视图目录](#nested-view-directories)
    - [创建第一个可用视图](#creating-the-first-available-view)
    - [确定视图是否存在](#determining-if-a-view-exists)
- [向视图传递数据](#passing-data-to-views)
    - [与所有视图分享数据](#sharing-data-with-all-views)
- [视图组件](#view-composers)
    - [视图构造器](#view-creators)
- [视图优化](#optimizing-views)

<a name="introduction"></a>
## 介绍

当然，直接从路由和控制器返回整个 HTML 文档字符串是不切实际的。值得庆幸的是，视图提供了一种方便的方式来将我们所有的 HTML 放在单独的文件中。视图将您的控制器/应用程序逻辑与您的表示逻辑分开并存储在 `resources/views` 目录中。一个简单的视图可能看起来像这样：

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

将上述代码存储到 `resources/views/greeting.blade.php` 后，我们可以使用全局辅助函数 `view` 将其返回，例如：

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

> 技巧：如果您想了解更多关于如何编写 Blade 模板的更多信息？查看完整的 [Blade 文档](/docs/laravel/9.x/blade) 将是最好的开始。

<a name="creating-and-rendering-views"></a>
## 创建和渲染视图

您可以通过在应用程序 `resources/views` 目录中放置具有 `.blade.php` 扩展名的文件来创建视图。 该 `.blade.php` 扩展通知框架该文件包含一个 [Blade 模板](/docs/laravel/9.x/blade)。Blade 模板包含 HTML 和 Blade 指令，允许您轻松地回显值、创建「if」语句、迭代数据等。



创建视图后，可以使用全局 `view` 从应用程序的某个路由或控制器返回视图：

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

也可以使用 `View` 视图门面（Facade）：

    use Illuminate\Support\Facades\View;

    return View::make('greeting', ['name' => 'James']);

如您所见，传递给 `view` 的第一个参数对应于 `resources/views` 目录中视图文件的名称。第二个参数是应该对视图可用的数据数组。在这种情况下，我们传递 `name` 变量，它使用 [Blade 语法](/docs/laravel/9.x/blade)显示在视图中。

<a name="nested-view-directories"></a>
### 嵌套视图目录

视图也可以嵌套在目录 `resources/views` 的子目录中。「.」符号可用于引用嵌套视图。例如，如果您的视图存储在 `resources/views/admin/profile.blade.php`，您可以从应用程序的路由/控制器之一返回它，如下所示：

    return view('admin.profile', $data);

> 注意：查看目录名称不应包含该 `.` 字符。

<a name="creating-the-first-available-view"></a>
### 创建第一个可用视图

使用 `View` 门面的 `first` 方法，你可以创建给定数组视图中第一个存在的视图。如果你的应用程序或开发的第三方包允许定制或覆盖视图，这非常有用：

    use Illuminate\Support\Facades\View;

    return View::first(['custom.admin', 'admin'], $data);

<a name="determining-if-a-view-exists"></a>
### 判断视图文件是否存在

如果需要判断视图文件是否存在，可以使用 `View` 门面。如果视图存在， `exists` 方法会返回 `true`：

    use Illuminate\Support\Facades\View;

    if (View::exists('emails.customer')) {
        //
    }



<a name="passing-data-to-views"></a>
## 向视图传递数据

正如您在前面的示例中看到的，您可以将数据数组传递给视图，以使该数据可用于视图：

    return view('greetings', ['name' => 'Victoria']);

以这种方式传递信息时，数据应该是带有键/值对的数组。向视图提供数据后，您可以使用数据的键访问视图中的每个值，例如 `<?php echo $name; ?>`.

作为将完整的数据数组传递给 `view` 辅助函数的替代方法，您可以使用该 `with` 方法将单个数据添加到视图中。该 `with` 方法返回视图对象的实例，以便您可以在返回视图之前继续链接方法：

    return view('greeting')
                ->with('name', 'Victoria')
                ->with('occupation', 'Astronaut');

<a name="sharing-data-with-all-views"></a>
### 与所有视图共享数据

有时，您可能需要与应用程序呈现的所有视图共享数据。您可以使用 `View` 门面的 `share` 。你可以在服务提供器的 `boot` 方法中调用视图门面（Facade）的  `share` 。例如，可以将它们添加到 `App\Providers\AppServiceProvider` 或者为它们生成一个单独的服务提供器：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册应用服务.
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 引导应用服务.
         *
         * @return void
         */
        public function boot()
        {
            View::share('key', 'value');
        }
    }

<a name="view-composers"></a>
## 视图合成器



视图合成器是在渲染视图时调用的回调或类方法。如果您希望在每次呈现视图时将数据绑定到该视图，则视图编辑器可以帮助您将该逻辑组织到一个位置。如果应用程序中的多个路由或控制器返回相同的视图并且总是需要特定的数据，则视图合成器可能会特别有用。

通常，视图合成器将在您的应用程序的 [服务提供者](/docs/laravel/9.x/providers)之中注册。在这个例子中，我们假设我们已经创建了一个新 `App\Providers\ViewServiceProvider` 的来构建这个逻辑。

我们将使用 `View` 门面的 `composer` 方法来注册视图合成器。Laravel 不包含基于类的视图编写器的默认目录，因此您可以随意组织它们。例如，您可以创建一个 `app/View/Composers` 目录来存放应用程序的所有视图编写器：

    <?php

    namespace App\Providers;

    use App\View\Composers\ProfileComposer;
    use Illuminate\Support\Facades\View;
    use Illuminate\Support\ServiceProvider;

    class ViewServiceProvider extends ServiceProvider
    {
        /**
         * 注册应用服务.
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 引导应用服务.
         *
         * @return void
         */
        public function boot()
        {
            // 使用基于类的生成器...
            View::composer('profile', ProfileComposer::class);

            // 使用基于闭包的生成器...
            View::composer('dashboard', function ($view) {
                //
            });
        }
    }

> 注意：记住，如果你创建了新的一个服务提供者来存放你注册视图合成器的代码，那么你需要将这个服务提供器添加到配置文件 `config/app.php` 的 `providers` 数组中。



现在我们注册了视图合成器，每次渲染 `profile` 视图时都会执行`App\View\Composers\ProfileComposer` 类的 `compose` 方法。我们来看一个视图合成器类的例子：

    <?php

    namespace App\View\Composers;

    use App\Repositories\UserRepository;
    use Illuminate\View\View;

    class ProfileComposer
    {
        /**
         * 用户库的实现.
         *
         * @var \App\Repositories\UserRepository
         */
        protected $users;

        /**
         * 创建一个 profile 视图生成器.
         *
         * @param  \App\Repositories\UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            // 依赖项由服务容器自动解析...
            $this->users = $users;
        }

        /**
         * 绑定视图数据.
         *
         * @param  \Illuminate\View\View  $view
         * @return void
         */
        public function compose(View $view)
        {
            $view->with('count', $this->users->count());
        }
    }

如您所见，所有的视图合成器都会通过 [服务容器](/docs/laravel/9.x/container)进行解析，所以你可以在视图合成器的构造函数中类型提示需要注入的依赖项。

<a name="attaching-a-composer-to-multiple-views"></a>
#### 将视图合成器添加到多个视图

您可以通过将视图数组作为第一个参数传递给 `composer` 方法，可以一次添加多个视图到视图合成器中：
    use App\Views\Composers\MultiComposer;

    View::composer(
        ['profile', 'dashboard'],
        MultiComposer::class
    );

该 `composer` 方法同时也接受通配符 `*` ，表示将所有视图添加到视图合成器中：

    View::composer('*', function ($view) {
        //
    });

<a name="view-creators"></a>
### 视图构造器

视图构造器「creators」和视图合成器非常相似。唯一不同之处在于视图构造器在视图实例化之后执行，而视图合成器在视图即将渲染时执行。使用  `creator` 方法注册视图构造器：

    use App\View\Creators\ProfileCreator;
    use Illuminate\Support\Facades\View;

    View::creator('profile', ProfileCreator::class);



<a name="optimizing-views"></a>
## 优化视图

默认情况下，Blade 模板视图是按需编译的。当执行渲染视图的请求时，Laravel 将确定视图的编译版本是否存在。如果文件存在，Laravel 将比较未编译的视图和已编译的视图是否有修改。如果编译后的视图不存在，或者未编译的视图已被修改，Laravel 将重新编译该视图。

在请求期间编译视图可能会对性能产生小的负面影响，因此 Laravel 提供了 `view:cache` Artisan 命令来预编译应用程序使用的所有视图。为了提高性能，您可能希望在部署过程中运行此命令：

```shell
php artisan view:cache
```

您可以使用 `view:clear` 命令清除视图缓存：

```shell
php artisan view:clear
```


