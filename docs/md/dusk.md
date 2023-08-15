# Laravel Dusk

- [介绍](#introduction)
- [安装](#installation)
  - [管理 ChromeDriver 安装](#managing-chromedriver-installations)
  - [使用其他浏览器](#using-other-browsers)
- [入门](#getting-started)
  - [生成测试](#generating-tests)
  - [每个测试后重置数据库](#resetting-the-database-after-each-test)
  - [运行测试](#running-tests)
  - [环境处理](#environment-handling)
- [浏览器基础知识](#browser-basics)
  - [创建浏览器](#creating-browsers)
  - [导航](#navigation)
  - [调整浏览器窗口大小](#resizing-browser-windows)
  - [浏览器宏](#browser-macros)
  - [认证](#authentication)
  - [Cookies](#cookies)
  - [执行 JavaScript](#executing-javascript)
  - [截屏](#taking-a-screenshot)
  - [将控制台输出存储到磁盘](#storing-console-output-to-disk)
  - [将页面源代码存储到磁盘](#storing-page-source-to-disk)
- [与元素交互](#interacting-with-elements)
  - [Dusk 选择器](#dusk-selectors)
  - [文本、值和属性](#text-values-and-attributes)
  - [与表单交互](#interacting-with-forms)
  - [上传文件](#attaching-files)
  - [点击按钮](#pressing-buttons)
  - [点击链接](#clicking-links)
  - [使用键盘](#using-the-keyboard)
  - [使用鼠标](#using-the-mouse)
  - [JavaScript 对话框](#javascript-dialogs)
  - [选择器作用域](#scoping-selectors)
  - [等待元素](#waiting-for-elements)
  - [滚动元素到视图](#scrolling-an-element-into-view)
- [可用的断言](#available-assertions)
- [页面](#pages)
  - [生成页面](#generating-pages)
  - [配置页面](#configuring-pages)
  - [导航到页面](#navigating-to-pages)
  - [速记选择器](#shorthand-selectors)
  - [页面方法](#page-methods)
- [组件](#components)
  - [生成组件](#generating-components)
  - [使用组件](#using-components)
- [持续集成](#continuous-integration)
  - [Heroku CI](#running-tests-on-heroku-ci)
  - [Travis CI](#running-tests-on-travis-ci)
  - [GitHub Actions](#running-tests-on-github-actions)

<a name="introduction"></a>
## 介绍

[Laravel Dusk](https://github.com/laravel/dusk) 提供了一套富有表现力、易于使用的浏览器自动化和测试 API。默认情况下，Dusk 不需要在本地计算机上安装 JDK 或 Selenium。相反，Dusk 使用一个独立的 [ChromeDriver](https://sites.google.com/chromium.org/driver) 安装包。你可以自由地使用任何其他兼容 Selenium 的驱动程序。

<a name="installation"></a>
## 安装

为了开始使用，你需要先安装 [Google Chrome](https://www.google.com/chrome) 并将 `laravel/dusk` Composer 依赖添加到你的项目中：

```shell
composer require --dev laravel/dusk
```

> **警告**
> 如果你手动注册 Dusk 的服务提供者，在生产环境中 **绝不要** 注册，因为这可能导致任意用户能够认证你的应用程序。

安装 Dusk 包后，执行 `dusk:install` Artisan 命令。`dusk:install` 命令将会创建一个 `tests/Browser` 目录，一个示例 Dusk 测试，并为你的操作系统安装 Chrome 驱动程序二进制文件：

```shell
php artisan dusk:install
```

接下来，在应用程序的 `.env` 文件中设置 `APP_URL` 环境变量。该值应该与你用于在浏览器中访问应用程序的 URL 匹配。

> **注意**
> 如果你正在使用 [Laravel Sail](/docs/laravel/10.x/sail) 管理你的本地开发环境，请参阅 Sail 文档中有关[配置和运行 Dusk 测试](/docs/laravel/10.x/sail#laravel-dusk)的内容。

<a name="managing-chromedriver-installations"></a>
### 管理 ChromeDriver 安装

如果你想安装与 Laravel Dusk 通过 `dusk:install` 命令安装的不同版本的 ChromeDriver，则可以使用 `dusk:chrome-driver` 命令：

```shell
# 为你的操作系统安装最新版本的 ChromeDriver...
php artisan dusk:chrome-driver

# 为你的操作系统安装指定版本的 ChromeDriver...
php artisan dusk:chrome-driver 86

# 为所有支持的操作系统安装指定版本的 ChromeDriver...
php artisan dusk:chrome-driver --all

# 为你的操作系统安装与 Chrome / Chromium 检测到的版本匹配的 ChromeDriver...
php artisan dusk:chrome-driver --detect
```

> **警告**
> Dusk 需要 `chromedriver` 二进制文件可执行。如果你无法运行 Dusk，你应该使用以下命令确保二进制文件可执行：`chmod -R 0755 vendor/laravel/dusk/bin/`。

<a name="using-other-browsers"></a>
### 使用其他浏览器

默认情况下，Dusk 使用 Google Chrome 和独立的 [ChromeDriver](https://sites.google.com/chromium.org/driver) 安装来运行你的浏览器测试。但是，你可以启动自己的 Selenium 服务器，并运行你希望的任何浏览器来运行测试。

要开始，请打开你的 `tests/DuskTestCase.php` 文件，该文件是你的应用程序的基本 Dusk 测试用例。在这个文件中，你可以删除对 `startChromeDriver` 方法的调用。这将停止 Dusk 自动启动 ChromeDriver：

    /**
     * 准备执行 Dusk 测试。
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }

接下来，你可以修改 `driver` 方法来连接到你选择的 URL 和端口。此外，你可以修改应该传递给 WebDriver 的“期望能力”：

    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * 创建 RemoteWebDriver 实例。
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
        );
    }

<a name="getting-started"></a>
## 入门

<a name="generating-tests"></a>
### 生成测试

要生成 Dusk 测试，请使用 `dusk:make` Artisan 命令。生成的测试将放在 `tests/Browser` 目录中：

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>

### 在每次测试后重置数据库

你编写的大多数测试将与从应用程序数据库检索数据的页面交互；然而，你的 Dusk 测试不应该使用 `RefreshDatabase` trait。`RefreshDatabase` trait 利用数据库事务，这些事务将不适用或不可用于 HTTP 请求。相反，你有两个选项：`DatabaseMigrations` trait 和 `DatabaseTruncation` trait。

<a name="reset-migrations"></a>
#### 使用数据库迁移

`DatabaseMigrations` trait 会在每次测试之前运行你的数据库迁移。但是，为了每次测试而删除和重新创建数据库表通常比截断表要慢：

    <?php

    namespace Tests\Browser;

    use App\Models\User;
    use Illuminate\Foundation\Testing\DatabaseMigrations;
    use Laravel\Dusk\Chrome;
    use Tests\DuskTestCase;

    class ExampleTest extends DuskTestCase
    {
        use DatabaseMigrations;
    }

> **警告**
> 当执行 Dusk 测试时，不能使用 SQLite 内存数据库。由于浏览器在其自己的进程中执行，因此它将无法访问其他进程的内存数据库。

<a name="reset-truncation"></a>
#### 使用数据库截断

在使用 `DatabaseTruncation` trait 之前，你必须使用 Composer 包管理器安装 `doctrine/dbal` 包：

```shell
composer require --dev doctrine/dbal
```

`DatabaseTruncation` trait 将在第一次测试时迁移你的数据库，以确保你的数据库表已经被正确创建。但是，在后续测试中，数据库表将仅被截断 - 相比重新运行所有的数据库迁移，这样做可以提高速度：

    <?php

    namespace Tests\Browser;

    use App\Models\User;
    use Illuminate\Foundation\Testing\DatabaseTruncation;
    use Laravel\Dusk\Chrome;
    use Tests\DuskTestCase;

    class ExampleTest extends DuskTestCase
    {
        use DatabaseTruncation;
    }


默认情况下，此 trait 将截断除 `migrations` 表以外的所有表。如果你想自定义应该截断的表，则可以在测试类上定义 `$tablesToTruncate` 属性：

    /**
     * 表示应该截断哪些表。
     *
     * @var array
     */
    protected $tablesToTruncate = ['users'];


或者，你可以在测试类上定义 `$exceptTables` 属性，以指定应该从截断中排除的表：

    /**
     * 表示应该从截断中排除哪些表。
     *
     * @var array
     */
    protected $exceptTables = ['users'];


为了指定需要清空表格的数据库连接，你可以在测试类中定义一个 `$connectionsToTruncate` 属性：

    /**
     * 表示哪些连接需要清空表格。
     *
     * @var array
     */
    protected $connectionsToTruncate = ['mysql'];

<a name="running-tests"></a>

### 运行测试

要运行浏览器测试，执行 `dusk` Artisan 命令：

```shell
php artisan dusk
```

如果上一次运行 `dusk` 命令时出现了测试失败，你可以通过 `dusk:fails` 命令先重新运行失败的测试，以节省时间：

```shell
php artisan dusk:fails
```

`dusk` 命令接受任何 PHPUnit 测试运行器通常接受的参数，例如你可以只运行给定[组](https://phpunit.readthedocs.io/en/9.5/annotations.html#group)的测试：

```shell
php artisan dusk --group=foo
```

> **注意**
> 如果你正在使用 [Laravel Sail](/docs/laravel/10.x/sail) 来管理本地开发环境，请参考 Sail 文档中有关[配置和运行 Dusk 测试](/docs/laravel/10.x/sail#laravel-dusk)的部分。

<a name="manually-starting-chromedriver"></a>
#### 手动启动 ChromeDriver

默认情况下，Dusk 会自动尝试启动 ChromeDriver。如果对于你的特定系统无法自动启动，你可以在运行 `dusk` 命令之前手动启动 ChromeDriver。如果你选择手动启动 ChromeDriver，则应该注释掉 `tests/DuskTestCase.php` 文件中的以下代码：

    /**
     * 为 Dusk 测试执行做准备。
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }

此外，如果你在端口 9515 以外的端口上启动 ChromeDriver，你需要修改同一类中的 `driver` 方法以反映正确的端口：

    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * 创建 RemoteWebDriver 实例。
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:9515', DesiredCapabilities::chrome()
        );
    }

<a name="environment-handling"></a>
### 环境处理

如果要在运行测试时强制 Dusk 使用自己的环境文件，请在项目根目录中创建一个 `.env.dusk.{当前环境}` 文件。例如，如果你将从你的 `local` 环境启动 `dusk` 命令，你应该创建一个 `.env.dusk.local` 文件。

在运行测试时，Dusk 将备份你的 `.env` 文件，并将你的 Dusk 环境重命名为 `.env`。测试完成后，会将你的 `.env` 文件还原。

<a name="browser-basics"></a>
## 浏览器基础知识

<a name="creating-browsers"></a>
### 创建浏览器

为了开始学习，我们编写一个测试，验证我们能否登录到我们的应用程序。生成测试后，我们可以修改它以导航到登录页面，输入一些凭据并点击“登录”按钮。为了创建一个浏览器实例，你可以在 Dusk 测试中调用 `browse` 方法：

    <?php

    namespace Tests\Browser;

    use App\Models\User;
    use Illuminate\Foundation\Testing\DatabaseMigrations;
    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Chrome;
    use Tests\DuskTestCase;

    class ExampleTest extends DuskTestCase
    {
        use DatabaseMigrations;

        /**
         * 一个基本的浏览器测试示例。
         */
        public function test_basic_example(): void
        {
            $user = User::factory()->create([
                'email' => 'taylor@laravel.com',
            ]);

            $this->browse(function (Browser $browser) use ($user) {
                $browser->visit('/login')
                        ->type('email', $user->email)
                        ->type('password', 'password')
                        ->press('Login')
                        ->assertPathIs('/home');
            });
        }
    }

如上面的例子所示，`browse` 方法接受一个闭包。浏览器实例将由 Dusk 自动传递给此闭包，并且是与应用程序交互和进行断言的主要对象。

<a name="creating-multiple-browsers"></a>
#### 创建多个浏览器

有时你可能需要多个浏览器来正确地进行测试。例如，测试与 WebSockets 交互的聊天屏幕可能需要多个浏览器。要创建多个浏览器，只需将更多的浏览器参数添加到传递给 `browse` 方法的闭包签名中即可：

    $this->browse(function (Browser $first, Browser $second) {
        $first->loginAs(User::find(1))
              ->visit('/home')
              ->waitForText('Message');

        $second->loginAs(User::find(2))
               ->visit('/home')
               ->waitForText('Message')
               ->type('message', 'Hey Taylor')
               ->press('Send');

        $first->waitForText('Hey Taylor')
              ->assertSee('Jeffrey Way');
    });

<a name="navigation"></a>
### 导航

`visit` 方法可用于在应用程序中导航到给定的 URI：

    $browser->visit('/login');

你可以使用 `visitRoute` 方法来导航到 [命名路由](/docs/laravel/10.x/routing#named-routes)：

    $browser->visitRoute('login');

你可以使用 `back` 和 `forward` 方法来导航「后退」和「前进」：

    $browser->back();

    $browser->forward();

你可以使用 `refresh` 方法来刷新页面：

    $browser->refresh();

<a name="resizing-browser-windows"></a>

### 调整浏览器窗口大小

你可以使用 `resize` 方法来调整浏览器窗口的大小：

    $browser->resize(1920, 1080);

你可以使用 `maximize` 方法来最大化浏览器窗口：

    $browser->maximize();

`fitContent` 方法将调整浏览器窗口的大小以匹配其内容的大小：

    $browser->fitContent();

当测试失败时，Dusk 将在截取屏幕截图之前自动调整浏览器大小以适合内容。你可以在测试中调用 `disableFitOnFailure` 方法来禁用此功能：

    $browser->disableFitOnFailure();

你可以使用`move`方法将浏览器窗口移动到屏幕上的其他位置：

    $browser->move($x = 100, $y = 100);

<a name="browser-macros"></a>
### 浏览器宏

如果你想定义一个可以在各种测试中重复使用的自定义浏览器方法，可以在`Browser`类中使用`macro`方法。通常，你应该从[服务提供者](/docs/laravel/10.x/providers)的`boot`方法中调用它：

    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Dusk\Browser;

    class DuskServiceProvider extends ServiceProvider
    {
        /**
         * 注册 《Dusk》 的浏览器宏。
         */
        public function boot(): void
        {
            Browser::macro('scrollToElement', function (string $element = null) {
                $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

                return $this;
            });
        }
    }

该 `macro` 函数接收方法名作为其第一个参数，并接收闭包作为其第二个参数。 将宏作为`Browser`实现上的方法调用宏时，将执行宏的闭包：

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/pay')
                ->scrollToElement('#credit-card-details')
                ->assertSee('Enter Credit Card Details');
    });

<a name="authentication"></a>
### 用户认证

我们经常会测试需要身份验证的页面，你可以使用 Dusk 的`loginAs`方法来避免在每次测试期间与登录页面进行交互。该`loginAs`方法接收用户 ID 或者用户模型实例

    use App\Models\User;
    use Laravel\Dusk\Browser;

    $this->browse(function (Browser $browser) {
        $browser->loginAs(User::find(1))
              ->visit('/home');
    });

> **注意**
> 使用`loginAs`方法后，用户会话在文件中的所有测试被维护。



<a name="cookies"></a>
### Cookies

你可以使用`cookie`方法来获取或者设置加密过的 cookie 的值：

    $browser->cookie('name');

    $browser->cookie('name', 'Taylor');

使用`plainCookie`则可以获取或者设置未加密过的 cookie 的值：

    $browser->plainCookie('name');

    $browser->plainCookie('name', 'Taylor');

你可以使用`deleteCookie`方法删除指定的 cookie：

    $browser->deleteCookie('name');

<a name="executing-javascript"></a>
### 运行 JavaScript

可以使用`script`方法在浏览器中执行任意 JavaScript 语句：

    $browser->script('document.documentElement.scrollTop = 0');

    $browser->script([
        'document.body.scrollTop = 0',
        'document.documentElement.scrollTop = 0',
    ]);

    $output = $browser->script('return window.location.pathname');

<a name="taking-a-screenshot"></a>
### 获取截图

你可以使用`screenshot`方法来截图并将其指定文件名存储，所有截图都将存放在`tests/Browser/screenshots`目录下：

    $browser->screenshot('filename');

`responsiveScreenshots`方法可用于在不同断点处截取一系列截图:

    $browser->responsiveScreenshots('filename');

<a name="storing-console-output-to-disk"></a>
### 控制台输出结果保存到硬盘

你可以使用`storeConsoleLog`方法将控制台输出指定文件名并写入磁盘，控制台输出默认存放在`tests/Browser/console`目录下：

    $browser->storeConsoleLog('filename');

<a name="storing-page-source-to-disk"></a>
### 页面源码保存到硬盘

你可以使用`storeSource`方法将页面当前源代码指定文件名并写入磁盘，页面源代码默认会存放到`tests/Browser/source`目录：

    $browser->storeSource('filename');

<a name="interacting-with-elements"></a>
## 与元素交互

<a name="dusk-selectors"></a>
### Dusk 选择器

编写 Dusk 测试最困难的部分之一就是选择良好的 CSS 选择器与元素进行交互。 随着时间的推移，前端的更改可能会导致如下所示的 CSS 选择器无法通过测试：

    // HTML...

    <button>Login</button>

    // Test...

    $browser->click('.login-page .container div > button');

Dusk 选择器可以让你专注于编写有效的测试，而不必记住 CSS 选择器。要定义一个选择器，你需要添加一个`dusk`属性在 HTML 元素中。然后在选择器前面加上`@`用来在 Dusk 测试中操作元素：

    // HTML...

    <button dusk="login-button">Login</button>

    // Test...

    $browser->click('@login-button');

<a name="text-values-and-attributes"></a>
### 文本、值 & 属性

<a name="retrieving-setting-values"></a>
#### 获取 & 设置值

Dusk 提供了多个方法用于和页面元素的当前显示文本、值和属性进行交互，例如，要获取匹配指定选择器的元素的「值」，使用`value`方法：

    // 获取值...
    $value = $browser->value('selector');

    // 设置值...
    $browser->value('selector', 'value');

你可以使用`inputValue`方法来获取包含指定字段名称的输入元素的「值」：

    $value = $browser->inputValue('field');

<a name="retrieving-text"></a>
#### 获取文本

该`text`方法可以用于获取匹配指定选择器元素文本：

    $text = $browser->text('selector');

<a name="retrieving-attributes"></a>
#### 获取属性

最后，该`attribute`方法可以用于获取匹配指定选择器元素属性：

    $attribute = $browser->attribute('selector', 'value');

<a name="interacting-with-forms"></a>
### 使用表单

<a name="typing-values"></a>
#### 输入值

Dusk 提供了多种方法来与表单和输入元素进行交互。首先，让我们看一个在字段中输入值的示例：

    $browser->type('email', 'taylor@laravel.com');

注意，尽管该方法在需要时接收，但是我们不需要将 CSS 选择器传递给`type`方法。如果没有提供 CSS 选择器，Dusk 会搜索包含指定`name`属性的`input`或`textarea`字段。

要想将文本附加到一个字段之后而且不清除其内容， 你可以使用`append`方法：

    $browser->type('tags', 'foo')
            ->append('tags', ', bar, baz');

你可以使用`clear`方法清除输入值：

    $browser->clear('email');

你可以使用`typeSlowly`方法指示 Dusk 缓慢键入。 默认情况下，Dusk 在两次按键之间将暂停 100 毫秒。 要自定义按键之间的时间量，你可以将适当的毫秒数作为方法的第二个参数传递：

    $browser->typeSlowly('mobile', '+1 (202) 555-5555');

    $browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);

你可以使用`appendSlowly`方法缓慢添加文本：

    $browser->type('tags', 'foo')
            ->appendSlowly('tags', ', bar, baz');

<a name="dropdowns"></a>
#### 下拉菜单

需要在下拉菜单中选择值，你可以使用`select`方法。 类似于`type`方法， 该`select`方法并不是一定要传入 CSS 选择器。 当使用`select`方法时，你应该传递选项实际的值而不是它的显示文本：

    $browser->select('size', 'Large');

你也可以通过省略第二个参数来随机选择一个选项：

    $browser->select('size');

通过将数组作为`select`方法的第二个参数，可以指示该方法选择多个选项：

    $browser->select('categories', ['Art', 'Music']);

<a name="checkboxes"></a>
#### 复选框

使用「check」 复选框时，你可以使用`check`方法。 像其他许多与 input 相关的方法，并不是必须传入 CSS 选择器。 如果准确的选择器无法找到的时候，Dusk 会搜索能够与`name`属性匹配的复选框：

    $browser->check('terms');

该`uncheck`方法可用于「取消选中」复选框输入：

    $browser->uncheck('terms');

<a name="radio-buttons"></a>
#### 单选按钮

使用 「select」中单选按钮选项时，你可以使用`radio`这个方法。 像很多其他的与输入相关的方法一样， 它也并不是必须传入 CSS 选择器。如果准确的选择器无法被找到的时候， Dusk 会搜索能够与`name`属性或者`value`属性相匹配的`radio`单选按钮：

    $browser->radio('size', 'large');

<a name="attaching-files"></a>
### 附件

该`attach`方法可以附加一个文件到`file`input 元素中。 像很多其他的与输入相关的方法一样，他也并不是必须传入 CSS 选择器。如果准确的选择器没有被找到的时候，Dusk 会搜索与`name`属性匹配的文件输入框：

    $browser->attach('photo', __DIR__.'/photos/mountains.png');

> **注意**
> attach 方法需要使用 PHP`Zip`扩展，你的服务器必须安装了此扩展。

<a name="pressing-buttons"></a>
### 点击按钮

可以使用`press`方法来单击页面上的按钮元素。该`press`方法的第一个参数可以是按钮的显示文本，也可以是 CSS/ Dusk 选择器：

    $browser->press('Login');

提交表单时，许多应用程序在按下表单后会禁用表单的提交按钮，然后在表单提交的 HTTP 请求完成后重新启用该按钮。要按下按钮并等待按钮被重新启用，可以使用`pressAndWaitFor`方法：

    // 按下按钮并等待最多5秒，它将被启用…
    $browser->pressAndWaitFor('Save');

    // 按下按钮并等待最多1秒，它将被启用…
    $browser->pressAndWaitFor('Save', 1);

<a name="clicking-links"></a>
### 点击链接

要点击链接，可以在浏览器实例下使用`clickLink`方法。该`clickLink`方法将点击指定文本的链接：

    $browser->clickLink($linkText);

你可以使用`seeLink`方法来确定具有给定显示文本的链接在页面上是否可见：

    if ($browser->seeLink($linkText)) {
        // ...
    }

> **注意**
> 这些方法与 jQuery 交互。 如果页面上没有 jQuery，Dusk 会自动将其注入到页面中，以便在测试期间可用。

<a name="using-the-keyboard"></a>
### 使用键盘

该`keys`方法让你可以再指定元素中输入比`type`方法更加复杂的输入序列。例如，你可以在输入值的同时按下按键。在这个例子中，输入`taylor`时，`shift`键也同时被按下。当`taylor`输入完之后， 将会输入`swift`而不会按下任何按键：

    $browser->keys('selector', ['{shift}', 'taylor'], 'swift');

`keys`方法的另一个有价值的用例是向你的应用程序的主要 CSS 选择器发送「键盘快捷键」组合：

    $browser->keys('.app', ['{command}', 'j']);

> **技巧**
> 所有修饰符键如`{command}`都包裹在`{}`字符中，并且与在 `Facebook\WebDriver\WebDriverKeys`类中定义的常量匹配，该类可以[在 GitHub 上找到](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="using-the-mouse"></a>
### 使用鼠标

<a name="clicking-on-elements"></a>
#### 点击元素

该`click`方法可用于「点击」与给定选择器匹配的元素：

    $browser->click('.selector');

该`clickAtXPath`方法可用于「单击」与给定 XPath 表达式匹配的元素：

    $browser->clickAtXPath('//div[@class = "selector"]');

该`clickAtPoint`方法可用于「点击」相对于浏览器可视区域的给定坐标对上的最高元素：

    $browser->clickAtPoint($x = 0, $y = 0);

该`doubleClick`方法可用于模拟鼠标的双击：

    $browser->doubleClick();

该`rightClick`方法可用于模拟鼠标的右击：

    $browser->rightClick();

    $browser->rightClick('.selector');

该`clickAndHold`方法可用于模拟被单击并按住的鼠标按钮。 随后调用 `releaseMouse` 方法将撤消此行为并释放鼠标按钮：

    $browser->clickAndHold()
            ->pause(1000)
            ->releaseMouse();

<a name="mouseover"></a>
#### 鼠标悬停

该`mouseover`方法可用于与给定选择器匹配的元素的鼠标悬停动作：

    $browser->mouseover('.selector');

<a name="drag-drop"></a>
#### 拖放

该`drag`方法用于将与指定选择器匹配的元素拖到其它元素：

    $browser->drag('.from-selector', '.to-selector');

或者，可以在单一方向上拖动元素：

    $browser->dragLeft('.selector', $pixels = 10);
    $browser->dragRight('.selector', $pixels = 10);
    $browser->dragUp('.selector', $pixels = 10);
    $browser->dragDown('.selector', $pixels = 10);

最后，你可以将元素拖动给定的偏移量：

    $browser->dragOffset('.selector', $x = 10, $y = 10);

<a name="javascript-dialogs"></a>
### JavaScript 对话框

Dusk 提供了各种与 JavaScript 对话框进行交互的方法。例如，你可以使用`waitForDialog`方法来等待 JavaScript 对话框的出现。此方法接受一个可选参数，该参数指示等待对话框出现多少秒：

    $browser->waitForDialog($seconds = null);

该`assertDialogOpened`方法，断言对话框已经显示，并且其消息与给定值匹配：

    $browser->assertDialogOpened('Dialog message');

`typeInDialog`方法，在打开的 JavaScript 提示对话框中输入给定值：

    $browser->typeInDialog('Hello World');

`acceptDialog`方法，通过点击确定按钮关闭打开的 JavaScript 对话框：

    $browser->acceptDialog();

`dismissDialog`方法，通过点击取消按钮关闭打开的 JavaScript 对话框（仅对确认对话框有效）：

    $browser->dismissDialog();

<a name="scoping-selectors"></a>
### 选择器作用范围

有时可能希望在给定的选择器范围内执行多个操作。比如，可能想要断言表格中存在某些文本，然后点击表格中的一个按钮。那么你可以使用`with`方法实现此需求。在传递给`with`方法的闭包内执行的所有操作都将限于原始选择器：

    $browser->with('.table', function (Browser $table) {
        $table->assertSee('Hello World')
              ->clickLink('Delete');
    });

你可能偶尔需要在当前范围之外执行断言。 你可以使用`elsewhere`和`elsewhereWhenAvailable`方法来完成此操作：

     $browser->with('.table', function ($table) {
        // 当前范围是 `body .table`...

        $browser->elsewhere('.page-title', function ($title) {
            // 当前范围是 `body .page-title`...
            $title->assertSee('Hello World');
        });

        $browser->elsewhereWhenAvailable('.page-title', function ($title) {
            // 当前范围是 `body .page-title`...
            $title->assertSee('Hello World');
        });
     });

<a name="waiting-for-elements"></a>
### 等待元素

在测试大面积使用 JavaScript 的应用时，在进行测试之前，通常有必要 「等待」 某些元素或数据可用。Dusk 可轻松实现。使用一系列方法，可以等到页面元素可用，甚至给定的 JavaScript 表达式执行结果为`true`。

<a name="waiting"></a>
#### 等待

如果需要测试暂停指定的毫秒数， 使用`pause`方法：

    $browser->pause(1000);

如果你只需要在给定条件为`true`时暂停测试，请使用`pauseIf`方法:

    $browser->pauseIf(App::environment('production'), 1000);

同样地，如果你需要暂停测试，除非给定的条件是`true`，你可以使用`pauseUnless`方法:

    $browser->pauseUnless(App::environment('testing'), 1000);

<a name="waiting-for-selectors"></a>
#### 等待选择器

该`waitFor`方法可以用于暂停执行测试，直到页面上与给定 CSS 选择器匹配的元素被显示。默认情况下，将在暂停超过 5 秒后抛出异常。如有必要，可以传递自定义超时时长作为其第二个参数：

    // 等待选择器不超过 5 秒...
    $browser->waitFor('.selector');

    // 等待选择器不超过 1 秒...
    $browser->waitFor('.selector', 1);

你也可以等待选择器显示给定文字：

    //  等待选择器不超过 5 秒包含给定文字...
    $browser->waitForTextIn('.selector', 'Hello World');

    //  等待选择器不超过 1 秒包含给定文字...
    $browser->waitForTextIn('.selector', 'Hello World', 1);

你也可以等待指定选择器从页面消失:

    // 等待不超过 5 秒 直到选择器消失...
    $browser->waitUntilMissing('.selector');

    // 等待不超过 1 秒 直到选择器消失...
    $browser->waitUntilMissing('.selector', 1);

或者，你可以等待与给定选择器匹配的元素被启用或禁用：

    // 最多等待 5 秒钟，直到选择器启用...
    $browser->waitUntilEnabled('.selector');

    // 最多等待 1 秒钟，直到选择器启用...
    $browser->waitUntilEnabled('.selector', 1);

    // 最多等待 5 秒钟，直到选择器被禁用...
    $browser->waitUntilDisabled('.selector');

    // 最多等待 1 秒钟，直到选择器被禁用...
    $browser->waitUntilDisabled('.selector', 1);

<a name="scoping-selectors-when-available"></a>
#### 限定作用域范围（可用时）

有时，你或许希望等待给定选择器出现，然后与匹配选择器的元素进行交互。例如，你可能希望等到模态窗口可用，然后在模态窗口中点击「确定」按钮。在这种情况下，可以使用`whenAvailable`方法。给定回调内的所有要执行的元素操作都将被限定在起始选择器上:

    $browser->whenAvailable('.modal', function (Browser $modal) {
        $modal->assertSee('Hello World')
              ->press('OK');
    });

<a name="waiting-for-text"></a>
#### 等待文本

`waitForText`方法可以用于等待页面上给定文字被显示：

    // 等待指定文本不超过 5 秒...
    $browser->waitForText('Hello World');

    // 等待指定文本不超过 1 秒...
    $browser->waitForText('Hello World', 1);

你可以使用`waitUntilMissingText`方法来等待，直到显示的文本已从页面中删除为止:

    // 等待 5 秒删除文本...
    $browser->waitUntilMissingText('Hello World');

    // 等待 1 秒删除文本...
    $browser->waitUntilMissingText('Hello World', 1);

<a name="waiting-for-links"></a>
#### 等待链接

`waitForLink`方法用于等待给定链接文字在页面上显示:

    // 等待链接 5 秒...
    $browser->waitForLink('Create');

    // 等待链接 1 秒...
    $browser->waitForLink('Create', 1);

<a name="waiting-for-inputs"></a>
#### 等待输入

`waitForInput`方法可用于等待，直到给定的输入字段在页面上可见:

    // 等待 5 秒的输入…
    $browser->waitForInput($field);

    // 等待 1 秒的输入…
    $browser->waitForInput($field, 1);

<a name="waiting-on-the-page-location"></a>
#### 等待页面跳转

当给出类似`$browser->assertPathIs('/home')`的路径断言时，如果`window.location.pathname`被异步更新，断言就会失败。可以使用`waitForLocation`方法等待页面跳转到给定路径：

    $browser->waitForLocation('/secret');

`waitForLocation`方法还可用于等待当前窗口位置成为完全限定的 URL：

    $browser->waitForLocation('https://example.com/path');

还可以使用[被命名的路由](/docs/laravel/10.x/routing#named-routes)等待跳转：

    $browser->waitForRoute($routeName, $parameters);

<a name="waiting-for-page-reloads"></a>
#### 等待页面重新加载

如果要在页面重新加载后断言，可以使用`waitForReload`方法：

    use Laravel\Dusk\Browser;

    $browser->waitForReload(function (Browser $browser) {
        $browser->press('Submit');
    })
    ->assertSee('Success!');

由于需要等待页面重新加载通常发生在单击按钮之后，为了方便起见，你可以使用`clickAndWaitForReload`方法：

    $browser->clickAndWaitForReload('.selector')
            ->assertSee('something');

<a name="waiting-on-javascript-expressions"></a>
#### 等待 JavaScript 表达式

有时候会希望暂停测试的执行，直到给定的 JavaScript 表达式执行结果为`true`。可以使用`waitUntil`方法轻松地达成此目的。 通过这个方法执行表达式，不需要包含`return`关键字或者结束分号：

    // 等待表达式为 true 5 秒时间...
    $browser->waitUntil('App.data.servers.length > 0');

    // 等待表达式为 true 1 秒时间...
    $browser->waitUntil('App.data.servers.length > 0', 1);

<a name="waiting-on-vue-expressions"></a>
#### 等待 Vue 表达式

`waitUntilVue`和`waitUntilVueIsNot`方法可以一直等待，直到 [Vue 组件](https://vuejs.org) 的属性包含给定的值：

    // 一直等待，直到组件属性包含给定的值...
    $browser->waitUntilVue('user.name', 'Taylor', '@user');

    // 一直等待，直到组件属性不包含给定的值...
    $browser->waitUntilVueIsNot('user.name', null, '@user');

<a name="waiting-for-javascript-events"></a>
#### 等待 JavaScript 事件

`waitForEvent`方法可用于暂停测试的执行，直到 JavaScript 事件发生:

    $browser->waitForEvent('load');

事件监听器附加到当前作用域，默认情况下是`body`元素。当使用范围选择器时，事件监听器将被附加到匹配的元素上:

    $browser->with('iframe', function (Browser $iframe) {
        // 等待 iframe 的加载事件…
        $iframe->waitForEvent('load');
    });

你也可以提供一个选择器作为`waitForEvent`方法的第二个参数，将事件监听器附加到特定的元素上:

    $browser->waitForEvent('load', '.selector');

你也可以等待`document`和`window`对象上的事件:

    // 等待文档被滚动…
    $browser->waitForEvent('scroll', 'document');

    // 等待 5 秒，直到窗口大小被调整…
    $browser->waitForEvent('resize', 'window', 5);

<a name="waiting-with-a-callback"></a>
#### 等待回调

Dusk 中的许多 「wait」 方法都依赖于底层方法 waitUsing。你可以直接用这个方法去等待一个回调函数返回`waitUsing`。你可以直接用这个方法去等待一个回调函数返回`true`。该`waitUsing`方法接收一个最大的等待秒数，闭包执行间隔时间，闭包，以及一个可选的失败信息：

    $browser->waitUsing(10, 1, function () use ($something) {
        return $something->isReady();
    }, "有些东西没有及时准备好。");

<a name="scrolling-an-element-into-view"></a>
### 滚动元素到视图中

有时你可能无法单击某个元素，因为该元素在浏览器的可见区域之外。该`scrollIntoView`方法可以将元素滚动到浏览器可视窗口内：

    $browser->scrollIntoView('.selector')
            ->click('.selector');

<a name="available-assertions"></a>
## 可用的断言

Dusk 提供了各种你可以对应用使用的断言。所有可用的断言罗列如下：

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeContains](#assert-attribute-contains)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesNotContain](#assert-vue-does-not-contain)

</div>

<a name="assert-title"></a>
#### assertTitle

断言页面标题为给定文本：

    $browser->assertTitle($title);

<a name="assert-title-contains"></a>
#### assertTitleContains

断言页面标题包含给定文本：

    $browser->assertTitleContains($title);

<a name="assert-url-is"></a>
#### assertUrlIs

断言当前的 URL（不包含 query string）是给定的字符串：

    $browser->assertUrlIs($url);

<a name="assert-scheme-is"></a>
#### assertSchemeIs

断言当前的 URL scheme 是给定的 scheme：

    $browser->assertSchemeIs($scheme);

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

断言当前的 URL scheme 不是给定的 scheme：

    $browser->assertSchemeIsNot($scheme);

<a name="assert-host-is"></a>
#### assertHostIs

断言当前的 URL host 是给定的 host：

    $browser->assertHostIs($host);

<a name="assert-host-is-not"></a>
#### assertHostIsNot

断言当前的 URL host 不是给定的 host：

    $browser->assertHostIsNot($host);

<a name="assert-port-is"></a>
#### assertPortIs

断言当前的 URL 端口是给定的端口：

    $browser->assertPortIs($port);

<a name="assert-port-is-not"></a>
#### assertPortIsNot

断言当前的 URL 端口不是给定的端口：

    $browser->assertPortIsNot($port);

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

断言当前的 URL 路径以给定的路径开始：

    $browser->assertPathBeginsWith('/home');

<a name="assert-path-is"></a>
#### assertPathIs

断言当前的路径是给定的路径：

    $browser->assertPathIs('/home');

<a name="assert-path-is-not"></a>
#### assertPathIsNot

断言当前的路径不是给定的路径：

    $browser->assertPathIsNot('/home');

<a name="assert-route-is"></a>
#### assertRouteIs

断言给定的 URL 是给定的[命名路由](/docs/laravel/10.x/routing#named-routes)的 URL:

    $browser->assertRouteIs($name, $parameters);

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

断言给定的查询字符串参数存在：

    $browser->assertQueryStringHas($name);

断言给定的查询字符串参数存在并且具有给定的值：

    $browser->assertQueryStringHas($name, $value);

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

断言缺少给定的查询字符串参数：

    $browser->assertQueryStringMissing($name);

<a name="assert-fragment-is"></a>
#### assertFragmentIs

断言 URL 的当前哈希片段与给定的片段匹配：

    $browser->assertFragmentIs('anchor');

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

断言 URL 的当前哈希片段以给定片段开头：

    $browser->assertFragmentBeginsWith('anchor');

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

断言 URL 的当前哈希片段与给定的片段不匹配：

    $browser->assertFragmentIsNot('anchor');

<a name="assert-has-cookie"></a>
#### assertHasCookie

断言给定的加密 cookie 存在:

    $browser->assertHasCookie($name);

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

断言给定的未加密 cookie 存在：

    $browser->assertHasPlainCookie($name);

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

断言给定的加密 cookie 不存在：

    $browser->assertCookieMissing($name);

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

断言给定的未加密 cookie 不存在：

    $browser->assertPlainCookieMissing($name);

<a name="assert-cookie-value"></a>
#### assertCookieValue

断言加密的 cookie 具有给定值：

    $browser->assertCookieValue($name, $value);

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

断言未加密的 cookie 具有给定值：

    $browser->assertPlainCookieValue($name, $value);

<a name="assert-see"></a>
#### assertSee

断言在页面中有给定的文本：

    $browser->assertSee($text);

<a name="assert-dont-see"></a>
#### assertDontSee

断言在页面中没有给定的文本：

    $browser->assertDontSee($text);

<a name="assert-see-in"></a>
#### assertSeeIn

断言在选择器中有给定的文本：

    $browser->assertSeeIn($selector, $text);

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

断言在选择器中不存在给定的文本：

    $browser->assertDontSeeIn($selector, $text);

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

断言在选择器中存在任意的文本：

    $browser->assertSeeAnythingIn($selector);

断言在选择器中不存在文本：

    $browser->assertSeeNothingIn($selector);

<a name="assert-script"></a>
#### assertScript

断言给定的 JavaScript 表达式结果为给定的值：

    $browser->assertScript('window.isLoaded')
            ->assertScript('document.readyState', 'complete');

<a name="assert-source-has"></a>
#### assertSourceHas

断言在页面中存在给定的源码：

    $browser->assertSourceHas($code);

<a name="assert-source-missing"></a>
#### assertSourceMissing

断言页面中没有给定的源码：

    $browser->assertSourceMissing($code);

<a name="assert-see-link"></a>
#### assertSeeLink

断言在页面中存在指定的链接：

    $browser->assertSeeLink($linkText);

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

断言页面中没有指定的链接：

    $browser->assertDontSeeLink($linkText);

<a name="assert-input-value"></a>
#### assertInputValue

断言输入框（input）有给定的值：

    $browser->assertInputValue($field, $value);

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

断言输入框没有给定的值：

    $browser->assertInputValueIsNot($field, $value);

<a name="assert-checked"></a>
#### assertChecked

断言复选框（checkbox）被选中：

    $browser->assertChecked($field);

<a name="assert-not-checked"></a>
#### assertNotChecked

断言复选框没有被选中：

    $browser->assertNotChecked($field);

<a name="assert-radio-selected"></a>
#### assertRadioSelected

断言单选框（radio）被选中：

    $browser->assertRadioSelected($field, $value);

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

断言单选框（radio）没有被选中：

    $browser->assertRadioNotSelected($field, $value);

<a name="assert-selected"></a>
#### assertSelected

断言下拉框有给定的值:

    $browser->assertSelected($field, $value);


断言下拉框没有给定的值：

    $browser->assertNotSelected($field, $value);

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

断言给定的数组值是可选的：

    $browser->assertSelectHasOptions($field, $values);

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

断言给定的数组值是不可选的：

    $browser->assertSelectMissingOptions($field, $values);

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

断言给定的值在给定的地方是可供选择的：

    $browser->assertSelectHasOption($field, $value);

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

断言给定的值不可选：

    $browser->assertSelectMissingOption($field, $value);

<a name="assert-value"></a>
#### assertValue

断言选择器范围内的元素存在指定的值：

    $browser->assertValue($selector, $value);

<a name="assert-value-is-not"></a>
#### assertValueIsNot

断言选择器范围内的元素不存在指定的值：

    $browser->assertValueIsNot($selector, $value);

<a name="assert-attribute"></a>
#### assertAttribute

断言与给定选择器匹配的元素在提供的属性中具有给定的值：

    $browser->assertAttribute($selector, $attribute, $value);

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

断言匹配给定选择器的元素在提供的属性中包含给定值：

    $browser->assertAttributeContains($selector, $attribute, $value);

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

断言与给定选择器匹配的元素在给定的 aria 属性中具有给定的值：

    $browser->assertAriaAttribute($selector, $attribute, $value);

例如，给定标记`<button aria-label="Add"></button>`，你可以像这样声明`aria-label`属性：

    $browser->assertAriaAttribute('button', 'label', 'Add')

<a name="assert-data-attribute"></a>
#### assertDataAttribute

断言与给定选择器匹配的元素在提供的 data 属性中具有给定的值：

    $browser->assertDataAttribute($selector, $attribute, $value);

例如，给定标记`<tr id="row-1" data-content="attendees"></tr>`，你可以像这样断言`data-label`属性：

    $browser->assertDataAttribute('#row-1', 'content', 'attendees')

<a name="assert-visible"></a>
#### assertVisible

断言匹配给定选择器的元素可见:

    $browser->assertVisible($selector);

<a name="assert-present"></a>
#### assertPresent

断言匹配给定选择器的元素存在：

    $browser->assertPresent($selector);

<a name="assert-not-present"></a>
#### assertNotPresent

断言源中不存在与给定选择器匹配的元素：

    $browser->assertNotPresent($selector);

<a name="assert-missing"></a>
#### assertMissing

断言匹配给定选择器的元素不可见：

    $browser->assertMissing($selector);

<a name="assert-input-present"></a>
#### assertInputPresent

断言具有给定名称的输入存在：

    $browser->assertInputPresent($name);

<a name="assert-input-missing"></a>
#### assertInputMissing

断言源中不存在具有给定名称的输入：

    $browser->assertInputMissing($name);

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

断言已打开带有给定消息的 JavaScript 对话框：

    $browser->assertDialogOpened($message);

<a name="assert-enabled"></a>
#### assertEnabled

断言给定的字段已启用：

    $browser->assertEnabled($field);

<a name="assert-disabled"></a>
#### assertDisabled

断言给定的字段被禁用：

    $browser->assertDisabled($field);

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

断言给定的按钮已启用：

    $browser->assertButtonEnabled($button);

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

断言给定的按钮被禁用：

    $browser->assertButtonDisabled($button);

<a name="assert-focused"></a>
#### assertFocused

断言给定的字段是焦点：

    $browser->assertFocused($field);

<a name="assert-not-focused"></a>
#### assertNotFocused

断言给定字段未聚焦：

    $browser->assertNotFocused($field);

<a name="assert-authenticated"></a>
#### assertAuthenticated

断言用户已通过身份验证：

    $browser->assertAuthenticated();

<a name="assert-guest"></a>
#### assertGuest

断言用户未通过身份验证：

    $browser->assertGuest();

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

断言用户已作为给定用户进行身份验证：

    $browser->assertAuthenticatedAs($user);

<a name="assert-vue"></a>
#### assertVue

Dusk 甚至允许你对 [Vue 组件](https://vuejs.org)数据的状态进行断言。例如，假设你的应用程序包含以下 Vue 组件：

    // HTML...

    <profile dusk="profile-component"></profile>

    // 组件定义...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });

你可以像这样断言 Vue 组件的状态：

    /**
     * 一个基本的 Vue 测试示例
     *
     * @return void
     */
    public function testVue()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                    ->assertVue('user.name', 'Taylor', '@profile-component');
        });
    }

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

断言 Vue 组件数据的属性不匹配给定的值：

    $browser->assertVueIsNot($property, $value, $componentSelector = null);

<a name="assert-vue-contains"></a>
#### assertVueContains

断言 Vue 组件数据的属性是一个数组，并包含给定的值：

    $browser->assertVueContains($property, $value, $componentSelector = null);

<a name="assert-vue-does-not-contain"></a>
#### assertVueDoesNotContain

断言 Vue 组件数据的属性是一个数组，且不包含给定的值：

    $browser->assertVueDoesNotContain($property, $value, $componentSelector = null);

<a name="pages"></a>
## Pages

有时，测试需要按顺序执行几个复杂的操作。这会使测试代码更难阅读和理解。 Dusk Pages 允许你定义语义化的操作，然后可以通过单一方法在给定页面上执行这些操作。Pages 还可以为应用或单个页面定义通用选择器的快捷方式。

<a name="generating-pages"></a>
### 生成 Pages

`dusk:page`Artisan 命令可以生成页面对象。所有的页面对象都位于`tests/Browser/Pages`目录：

    php artisan dusk:page Login

<a name="configuring-pages"></a>
### 配置 Pages

默认情况下，页面具有三种方法：`url`、`assert`和`elements`。我们现在将讨论 `url`和`assert`方法。`elements`方法将[在下面更详细地讨论](#shorthand-selectors)。

<a name="the-url-method"></a>
#### `url` 方法

`url`方法应该返回表示页面 URL 的路径。 Dusk 将会在浏览器中使用这个 URL 来导航到具体页面：

    /**
     * 获取页面的 URL。
     *
     * @return string
     */
    public function url()
    {
        return '/login';
    }

<a name="the-assert-method"></a>
#### `assert` 方法

`assert`方法可以作出任何断言来验证浏览器是否在指定页面上。实际上没有必要在这个方法中放置任何东西；但是，你可以按自己的需求来做出这些断言。导航到页面时，这些断言将自动运行：

    /**
     * 断言浏览器当前处于指定页面。
     */
    public function assert(Browser $browser): void
    {
        $browser->assertPathIs($this->url());
    }

<a name="navigating-to-pages"></a>
### 导航至页面

一旦页面定义好之后，你可以使用`visit`方法导航至页面：

    use Tests\Browser\Pages\Login;

    $browser->visit(new Login);

有时你可能已经在给定的页面上，需要将页面的选择器和方法「加载」到当前的测试上下文中。 这在通过按钮重定向到指定页面而没有明确导航到该页面时很常见。 在这种情况下，你可以使用`on`方法加载页面：

    use Tests\Browser\Pages\CreatePlaylist;

    $browser->visit('/dashboard')
            ->clickLink('Create Playlist')
            ->on(new CreatePlaylist)
            ->assertSee('@create');

<a name="shorthand-selectors"></a>
### 选择器简写

该`elements`方法允许你为页面中的任何 CSS 选择器定义简单易记的简写。例如，让我们为应用登录页中的 email 输入框定义一个简写：

    /**
     * 获取页面元素的简写。
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@email' => 'input[name=email]',
        ];
    }

一旦定义了简写，你就可以用这个简写来代替之前在页面中使用的完整 CSS 选择器：

    $browser->type('@email', 'taylor@laravel.com');

<a name="global-shorthand-selectors"></a>
#### 全局的选择器简写

安装 Dusk 之后，`Page`基类存放在你的`tests/Browser/Pages`目录。该类中包含一个`siteElements`方法，这个方法可以用来定义全局的选择器简写，这样在你应用中每个页面都可以使用这些全局选择器简写了：

    /**
     * 获取站点全局的选择器简写。
     *
     * @return array<string, string>
     */
    public static function siteElements(): array
    {
        return [
            '@element' => '#selector',
        ];
    }

<a name="page-methods"></a>
### 页面方法

除了页面中已经定义的默认方法之外，你还可以定义在整个测试过程中会使用到的其他方法。例如，假设我们正在开发一个音乐管理应用，在应用中每个页面都可能需要一个公共的方法来创建播放列表，而不是在每一个测试类中都重写一遍创建播放列表的逻辑，这时候你可以在你的页面类中定义一个`createPlaylist`方法：

    <?php

    namespace Tests\Browser\Pages;

    use Laravel\Dusk\Browser;

    class Dashboard extends Page
    {
        // 其他页面方法...

        /**
         * 创建一个新的播放列表。
         */
        public function createPlaylist(Browser $browser, string $name): void
        {
            $browser->type('name', $name)
                    ->check('share')
                    ->press('Create Playlist');
        }
    }

方法被定义之后，你可以在任何使用到该页的测试中使用它了。浏览器实例会自动作为第一个参数传递给自定义页面方法：

    use Tests\Browser\Pages\Dashboard;

    $browser->visit(new Dashboard)
            ->createPlaylist('My Playlist')
            ->assertSee('My Playlist');

<a name="components"></a>
## 组件

组件类似于 Dusk 的 「页面对象」，不过它更多的是贯穿整个应用程序中频繁重用的 UI 和功能片断，比如说导航条或信息通知弹窗。因此，组件并不会绑定于某个明确的 URL。

<a name="generating-components"></a>
### 生成组件

使用`dusk:component`Artisan 命令即可生成组件。新生成的组件位于`tests/Browser/Components`目录下：

    php artisan dusk:component DatePicker

如上所示，这是生成一个「日期选择器」（date picker）组件的示例，这个组件可能会贯穿使用在你应用程序的许多页面中。在整个测试套件的大量测试页面中，手动编写日期选择的浏览器自动化逻辑会非常麻烦。 更方便的替代办法是，定义一个表示日期选择器的 Dusk 组件，然后把自动化逻辑封装在该组件内：

    <?php

    namespace Tests\Browser\Components;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Component as BaseComponent;

    class DatePicker extends BaseComponent
    {
        /**
         * 获取组件的 root selector。
         */
        public function selector(): string
        {
            return '.date-picker';
        }

        /**
         * 断言浏览器包含组件。
         */
        public function assert(Browser $browser): void
        {
            $browser->assertVisible($this->selector());
        }

        /**
         * 读取组件的元素简写。
         *
         * @return array<string, string>
         */
        public function elements(): array
        {
            return [
                '@date-field' => 'input.datepicker-input',
                '@year-list' => 'div > div.datepicker-years',
                '@month-list' => 'div > div.datepicker-months',
                '@day-list' => 'div > div.datepicker-days',
            ];
        }

        /**
         * 选择给定日期。
         */
        public function selectDate(Browser $browser, int $year, int $month, int $day): void
        {
            $browser->click('@date-field')
                    ->within('@year-list', function (Browser $browser) use ($year) {
                        $browser->click($year);
                    })
                    ->within('@month-list', function (Browser $browser) use ($month) {
                        $browser->click($month);
                    })
                    ->within('@day-list', function (Browser $browser) use ($day) {
                        $browser->click($day);
                    });
        }
    }

<a name="using-components"></a>
### 使用组件

当组件被定义了之后，我们就可以轻松的在任意测试页面通过日期选择器选择一个日期。并且，如果选择日期的逻辑发生了变化，我们只需要更新组件即可：

    <?php

    namespace Tests\Browser;

    use Illuminate\Foundation\Testing\DatabaseMigrations;
    use Laravel\Dusk\Browser;
    use Tests\Browser\Components\DatePicker;
    use Tests\DuskTestCase;

    class ExampleTest extends DuskTestCase
    {
        /**
         * 一个基础的组件测试用例.
         */
        public function test_basic_example(): void
        {
            $this->browse(function (Browser $browser) {
                $browser->visit('/')
                        ->within(new DatePicker, function (Browser $browser) {
                            $browser->selectDate(2019, 1, 30);
                        })
                        ->assertSee('January');
            });
        }
    }

<a name="continuous-integration"></a>
## 持续集成

> **注意**
> 大多数 Dusk 持续集成配置都希望你的 Laravel 应用程序使用端口 8000 上的内置 PHP 开发服务器提供服务。因此，你应该确保持续集成环境有一个值为 `http://127.0.0.1:8000` 的 `APP_URL` 环境变量。

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

要在 [Heroku CI](https://www.heroku.com/continuous-integration) 中运行 Dusk 测试，请将以下 Google Chrome buildpack 和 脚本添加到 Heroku 的 `app.json` 文件中：

    {
      "environments": {
        "test": {
          "buildpacks": [
            { "url": "heroku/php" },
            { "url": "https://github.com/heroku/heroku-buildpack-google-chrome" }
          ],
          "scripts": {
            "test-setup": "cp .env.testing .env",
            "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
          }
        }
      }
    }

<a name="running-tests-on-travis-ci"></a>
### Travis CI

要在 [Travis CI](https://travis-ci.org) 运行 Dusk 测试，可以使用下面这个 `.travis.yml` 配置。由于 Travis CI 不是一个图形化的环境，我们还需要一些额外的步骤以便启动 Chrome 浏览器。此外，我们将会使用 `php artisan serve` 来启动 PHP 自带的 Web 服务器：

```yaml
language: php

php:
  - 7.3

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a name="running-tests-on-github-actions"></a>
### GitHub Actions

如果你正在使用 [Github Actions](https://github.com/features/actions) 来运行你的 Dusk 测试，你应该使用以下这份配置文件为模版。像 TravisCI 一样，我们使用 `php artisan serve` 命令来启动 PHP 的内置 Web 服务：

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v3
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: console
          path: tests/Browser/console
```