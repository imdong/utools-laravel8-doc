# Blade 模板

- [简介](#introduction)
- [数据显示](#displaying-data)
    - [HTML 实体编码](#html-entity-encoding)
    - [Blade & JavaScript 框架](#blade-and-javascript-frameworks)
- [Blade 指令](#blade-directives)
    - [If 语句](#if-statements)
    - [Switch 语句](#switch-statements)
    - [循环](#loops)
    - [循环变量](#the-loop-variable)
    - [条件类](#conditional-classes)
    - [Checked / Selected / Disabled](#checked-and-selected)
    - [包括子视图](#including-subviews)
    - [`@once` 指令](#the-once-directive)
    - [PHP](#raw-php)
    - [注释](#comments)
- [组件](#components)
    - [渲染组件](#rendering-components)
    - [组件传参](#passing-data-to-components)
    - [组件属性](#component-attributes)
    - [保留关键字](#reserved-keywords)
    - [插槽](#slots)
    - [内联组件视图](#inline-component-views)
    - [匿名组件](#anonymous-components)
    - [动态组件](#dynamic-components)
    - [手动注册组件](#manually-registering-components)
- [创建布局](#building-layouts)
    - [使用组件的布局](#layouts-using-components)
    - [使用模板继承的布局](#layouts-using-template-inheritance)
- [表单](#forms)
    - [CSRF 字段](#csrf-field)
    - [Method 字段](#method-field)
    - [验证错误](#validation-errors)
- [堆栈](#stacks)
- [服务注入](#service-injection)
- [渲染内联 Blade 模板](#rendering-inline-blade-templates)
- [Blade 扩展](#extending-blade)
    - [自定义 Echo 处理](#custom-echo-handlers)
    - [自定义 if 语句](#custom-if-statements)

<a name="introduction"></a>
## 简介

Blade 是 Laravel 提供的一个简单而又强大的模板引擎。 和其他流行的 PHP 模板引擎不同，Blade 并不限制你在视图中使用原生 PHP 代码。实际上，所有 Blade 视图文件都将被编译成原生的 PHP 代码并缓存起来，除非它被修改，否则不会重新编译，这就意味着 Blade 基本上不会给你的应用增加任何负担。Blade 模板文件使用 `.blade.php` 作为文件扩展名，被存放在 `resources/views` 目录。

Blade 视图可以使用全局 `view` 函数从 Route 或控制器返回。当然，正如有关 [views](/docs/laravel/9.x/views) 的文档中所描述的，可以使用 `view` 函数的第二个参数将数据传递到 Blade 视图：

    Route::get('/', function () {
        return view('greeting', ['name' => 'Finn']);
    });

> 技巧：想要让您的 Blade 模板更上一层楼并轻松构建动态界面？请阅读 [Laravel Livewire](https://laravel-livewire.com)。



<a name="displaying-data"></a>
## 显示数据

你可以把变量置于花括号中以在视图中显示数据。例如，给定下方的路由：

    Route::get('/', function () {
        return view('welcome', ['name' => 'Samantha']);
    });

您可以像如下这样显示 `name` 变量的内容：

```blade
Hello, {{ $name }}.
```

> 技巧：Blade 的 `{{ }}` 语句将被 PHP 的 `htmlspecialchars` 函数自动转义以防范 XSS 攻击。

您不仅限于显示传递给视图的变量的内容。您也可以回显任何 PHP 函数的结果。实际上，您可以将所需的任何 PHP 代码放入 Blade echo 语句中：

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### HTML 实体编码

默认情况下，Blade（和 Laravel `e` 助手）将对 HTML 实体进行双重编码。如果您想禁用双重编码，请从 `AppServiceProvider` 的 `boot` 方法调用 `Blade::withoutDoubleEncoding` 方法：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Blade;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 在此启动任意服务
         *
         * @return void
         */
        public function boot()
        {
            Blade::withoutDoubleEncoding();
        }
    }

<a name="displaying-unescaped-data"></a>
#### 展示非转义数据

默认情况下， Blade `{{ }}` 语句将被 PHP 的 `htmlspecialchars` 函数自动转义以防范 XSS 攻击。如果不想您的数据被转义，那么您可使用如下的语法：

```blade
Hello, {!! $name !!}.
```

> 注意：在应用中显示用户提供的数据时请格外小心，请尽可能的使用转义和双引号语法来防范 XSS 攻击。



<a name="blade-and-javascript-frameworks"></a>
### Blade & JavaScript 框架

由于许多 JavaScript 框架也使用「花括号」来标识将显示在浏览器中的表达式，因此，您可以使用 @ 符号来表示 Blade 渲染引擎应当保持不变。例如：

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

在这个例子中， `@` 符号将被 Blade 移除；当然，Blade 将不会修改 `{{ name }}` 表达式，取而代之的是 JavaScript 模板来对其进行渲染。


`@` 符号也用于转义 Blade 指令：

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### 渲染 JSON

有时，您可能会将数组传递给视图，以将其呈现为 JSON，以便初始化 JavaScript 变量。 例如：

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

或者，您可以使用 `Illuminate\Support\Js::from` 方法指令，而不是手动调用 `json_encode`。 `from` 方法接受与 PHP 的 `json_encode` 函数相同的参数；但是，它将确保正确转义生成的 JSON 以包含在 HTML 引号中。 `from` 方法将返回一个字符串 `JSON.parse` JavaScript 语句，它将给定对象或数组转换为有效的 JavaScript 对象：

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

Laravel 应用程序框架的最新版本包括一个 `Js` 门面，它提供了在 Blade 模板中方便地访问此功能：

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> 注意：您应该只使用 `Js::from` 渲染已经存在的变量为 JSON。 Blade 模板基于正则表达式，如果尝试将复杂表达式传递给 `Js::from` 可能会导致无法预测的错误。



<a name="the-at-verbatim-directive"></a>
#### `@verbatim` 指令

如果您在模板中显示很大一部分 JavaScript 变量，您可以将 HTML 嵌入到 `@verbatim` 指令中，这样，您就不需要在每一个 Blade 回显语句前添加 `@` 符号：

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## Blade 指令

除了模板继承和显示数据以外， Blade 还为常见的 PHP 控制结构提供了便捷的快捷方式，例如条件语句和循环。这些快捷方式为 PHP 控制结构提供了一个非常清晰、简洁的书写方式，同时，还与 PHP 中的控制结构保持了相似的语法特性。

<a name="if-statements"></a>
### If 语句

您可以使用 `@if` ， `@elseif` ， `@else` 和 `@endif` 指令构造 `if` 语句。这些指令功能与它们所对应的 PHP 语句完全一致：

```blade
@if (count($records) === 1)
    // 有一条记录
@elseif (count($records) > 1)
    // 有多条记录
@else
    // 没有记录
@endif
```

为了方便， Blade 还提供了一个 `@unless` 指令：

```blade
@unless (Auth::check())
    // 还没有登录
@endunless
```

> 译注：相当于 `@if (! Auth::check()) @endif`

除了上面所说条件指令外， `@isset` 和 `@empty` 指令亦可作为它们所对应的 PHP 函数的快捷方式：

```blade
@isset($records)
    // $records 已经被定义且不为 null ……
@endisset

@empty($records)
    // $records 为「空」……
@endempty
```

<a name="authentication-directives"></a>
#### 授权指令

`@auth` 和 `@guest` 指令可用于快速判断当前用户是否已经获得 [授权](/docs/laravel/9.x/authentication) 或是游客：

```blade
@auth
    // 用户已经通过认证……
@endauth

@guest
    // 用户没有通过认证……
@endguest
```



如有需要，您亦可在使用 `@auth` 和 `@guest` 指令时指定 [鉴权守卫](https://learnku.com/docs/laravel/8.x/authentication "鉴权守卫")：

```blade
@auth('admin')
    // 用户已经通过认证...
@endauth

@guest('admin')
    // 用户没有通过认证...
@endguest
```

<a name="environment-directives"></a>
#### 环境指令

您可以使用 `@production` 指令来判断应用是否处于生产环境：

```blade
@production
    // 生产环境特定内容...
@endproduction
```

或者，您可以使用 `@env` 指令来判断应用是否运行于指定的环境：

```blade
@env('staging')
    //  应用运行于「staging」环境...
@endenv

@env(['staging', 'production'])
    // 应用运行于 「staging」或 [生产] 环境...
@endenv
```

<a name="section-directives"></a>
#### 区块指令

您可以使用 `@hasSection` 指令来判断区块是否有内容：

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

您可以使用 `sectionMissing` 指令来判断区块是否没有内容：

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="switch-statements"></a>
### Switch Statements

您可使用 `@switch` ， `@case` ， `@break` ， `@default` 和 `@endswitch` 语句来构造 Switch 语句：

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a name="loops"></a>
### 循环

除了条件语句， Blade 还提供了与 PHP 循环结构功能相同的指令。同样，这些语句的功能和它们所对应的 PHP 语法一致：

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> 技巧：在遍历 `foreach` 循环时，您可以使用 [循环变量](#the-loop-variable) 去获取有关循环的有价值的信息，例如，您处于循环的第一个迭代亦或是处于最后一个迭代。



使用循环时，还可以使用 `@continue` 和 `@break` 循环或跳过当前迭代：

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

您还可以在指令声明中包含继续或中断条件：

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Loop 变量

在遍历 `foreach` 循环时，循环内部可以使用 `$loop` 变量。该变量提供了访问一些诸如当前的循环索引和此次迭代是首次或是末次这样的信息的方式：

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

如果您处于嵌套循环中，您可以使用循环的 `$loop` 变量的 `parent` 属性访问父级循环：

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

该 `$loop` 变量还包含各种各样有用的属性：

属性  | 描述
------------- | -------------
`$loop->index`  |  当前迭代的索引（从 0 开始）。
`$loop->iteration`  |  当前循环的迭代次数（从 1 开始）。
`$loop->remaining`  |  循环剩余的迭代次数。
`$loop->count`  |  被迭代的数组的元素个数。
`$loop->first`  |  当前迭代是否是循环的首次迭代。
`$loop->last`  |  当前迭代是否是循环的末次迭代。
`$loop->even`  |  当前循环的迭代次数是否是偶数。
`$loop->odd`  |  当前循环的迭代次数是否是奇数。
`$loop->depth`  |  当前循环的嵌套深度。
`$loop->parent`  |  嵌套循环中的父级循环。



<a name="conditional-classes"></a>
### 有条件地编译 class 样式

该 `@class` 指令有条件地编译 CSS class 样式。该指令接收一个数组，其中数组的键包含您希望添加的一个或多个样式的类名，而值是一个布尔表达式。如果数组元素有一个数值的键，它将始终包含在呈现的 class 列表中：

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

<a name="checked-and-selected"></a>
### Checked / Selected / Disabled

为方便起见，您可以使用该 `@checked` 指令轻松判断给定的 HTML 复选框输入是否被「checked」。如果提供的条件判断为 `true` ，则此指令将回显 `checked`：

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

同样，该 `@selected` 指令可用于判断给定的选项是否被「selected」：

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

此外，该 `@disabled` 指令可用于判断给定元素是否为「disabled」:

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

<a name="including-subviews"></a>
### 包含子视图

> 技巧：虽然您可以自由使用该 `@include` 指令，但是 Blade [组件](#components) 提供了类似的功能，并提供了优于该 `@include` 指令的功能，如数据和属性绑定。

Blade 的 `@include` 指令允许您从一个视图中包含另外一个 Blade 视图。父视图中的所有变量在子视图中都可以使用：

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```



尽管子视图可以继承父视图中所有可以使用的数据，但是您也可以传递一个额外的数组，这个数组在子视图中也可以使用:

```blade
@include('view.name', ['status' => 'complete'])
```

如果您想要使用 `@include` 包含一个不存在的视图，Laravel 将会抛出一个错误。如果您想要包含一个可能存在也可能不存在的视图，那么您应该使用 `@includeIf` 指令:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

如果想要使用 `@include`  包含一个给定值为 `true` 或 `false`的布尔表达式的视图，那么您可以使用 `@includeWhen` 和 `@includeUnless` 指令:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

如果想要包含一个视图数组中第一个存在的视图，您可以使用 `includeFirst` 指令:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> 注意：在视图中，您应该避免使用 `__DIR__` 和 `__FILE__` 这些常量，因为他们将引用已缓存的和已编译的视图。

<a name="rendering-views-for-collections"></a>
#### 为集合渲染视图

您可以使用 Blade 的 `@each` 指令将循环合并在一行内：

```blade
@each('view.name', $jobs, 'job')
```

该 `@each` 指令的第一个参数是数组或集合中的元素的要渲染的视图片段。第二个参数是您想要迭代的数组或集合，当第三个参数是一个表示当前迭代的视图的变量名。因此，如果您遍历一个名为 `jobs` 的数组，通常会在视图片段中使用 `job` 变量来访问每一个 job （jobs 数组的元素）。在您的视图片段中，可以使用 `key` 变量来访问当前迭代的键。



您亦可传递第四个参数给 `@each` 指令。当给定的数组为空时，将会渲染该参数所对应的视图。

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> 注意：通过 `@each` 指令渲染的视图不会继承父视图的变量。如果子视图需要使用这些变量，您可以使用 `@foreach` 和 `@include` 来代替它。

<a name="the-once-directive"></a>
### `@once` 指令

该 `@once` 指令允许您定义模板的一部分内容，这部分内容在每一个渲染周期中只会被计算一次。该指令在使用 [堆栈](#stacks) 推送一段特定的 JavaScript 代码到页面的头部环境下是很有用的。例如，如果您想要在循环中渲染一个特定的 [组件](#components) ，您可能希望仅在组件渲染的首次推送 JavaScript 代码到头部：

```blade
@once
    @push('scripts')
        <script>
            // 您自定义的 JavaScript 代码...
        </script>
    @endpush
@endonce
```

由于该 `@once` 指令经常与 `@push` 或 `@prepend` 指令一起使用，为了使用方便，我们提供了 `@pushOnce` 和 `@prependOnce` 指令：

```blade
@pushOnce('scripts')
    <script>
        // 您自定义的 JavaScript 代码...
    </script>
@endPushOnce
```

<a name="raw-php"></a>
### PHP

在许多情况下，嵌入 PHP 代码到您的视图中是很有用的。您可以在模板中使用 Blade 的 `@php` 指令执行原生的 PHP 代码块：

```blade
@php
    $counter = 1;
@endphp
```

<a name="comments"></a>
### 注释

Blade 也允许您在视图中定义注释。但是，和 HTML 注释不同， Blade 注释不会被包含在应用返回的 HTML 中：

```blade
{{-- This comment will not be present in the rendered HTML --}}
```



<a name="components"></a>
## 组件

组件和插槽的作用与区块和布局的作用一致；不过，有些人可能觉着组件和插槽更易于理解。有两种书写组件的方法：基于类的组件和匿名组件。

您可以使用 `make:component` Artisan 命令来创建一个基于类的组件。我们将会创建一个简单的  `Alert` 组件用于说明如何使用组件。该 `make:component` 命令将会把组件置于 `App\View\Components` 目录中：

```shell
php artisan make:component Alert
```

该 `make:component` 命令将会为组件创建一个视图模板。创建的视图被置于 `resources/views/components` 目录中。在为自己的应用程序编写组件时，会在 `app/View/Components` 目录和 `resources/views/components` 目录中自动发现组件，因此通常不需要进一步的组件注册。

您还可以在子目录中创建组件：

```shell
php artisan make:component Forms/Input
```

上面的命令将在目录中创建一个 `Input` 组件， `App\View\Components\Forms` 视图将放置在 `resources/views/components/forms` 目录中。

如果你想创建一个匿名组件（一个只有 Blade 模板并且没有类的组件），你可以在调用命令  `make:component` 使用该`--view`标志：

```shell
php artisan make:component forms.input --view
```

上面的命令将在 `resources/views/components/forms/input.blade.php`创建一个 Blade 文件，该文件中可以通过 `<x-forms.input />`作为组件呈现。



<a name="manually-registering-package-components"></a>
#### 手动注册包组件

当为您自己的应用编写组件的时候，Laravel 将会自动发现位于 `app/View/Components` 目录和 `resources/views/components` 目录中的组件。

当然，如果您使用 Blade 组件编译一个包，您可能需要手动注册组件类及其 HTML 标签别名。您应该在包的服务提供者的 `boot` 方法中注册您的组件：

    use Illuminate\Support\Facades\Blade;

    /**
     * 驱动您的包的服务
     */
    public function boot()
    {
        Blade::component('package-alert', Alert::class);
    }

当组件注册完成后，便可使用标签别名来对其进行渲染。

```blade
<x-package-alert/>
```

或者，您可以使用该 `componentNamespace` 方法按照约定自动加载组件类。例如，一个 `Nightshade` 包可能有 `Calendar` 和 `ColorPicker` 组件驻留在 `Package\Views\Components` 命名空间中：

    use Illuminate\Support\Facades\Blade;

    /**
     * 驱动您的包的服务
     *
     * @return void
     */
    public function boot()
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }

这将允许他们的供应商命名空间使用包组件，使用以下 `package-name::` 语法：

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade 将自动检测链接到该组件的类，通过对组件名称进行帕斯卡大小写。使用「点」表示法也支持子目录。

<a name="rendering-components"></a>
### 显示组件

要显示一个组件，您可以在 Blade 模板中使用 Blade 组件标签。 Blade 组件以  `x-` 字符串开始，其后紧接组件类 kebab case 形式的名称（即单词与单词之间使用短横线 `-` 进行连接）：

```blade
<x-alert/>

<x-user-profile/>
```

如果组件位于 `App\View\Components` 目录的子目录中，您可以使用 `.` 字符来指定目录层级。例如，假设我们有一个组件位于 `App\View\Components\Inputs\Button.php`，那么我们可以像这样渲染它：

```blade
<x-inputs.button/>
```



<a name="passing-data-to-components"></a>
### 传递数据到组件中

您可以使用 HTML 属性传递数据到 Blade 组件中。普通的值可以通过简单的 HTML 属性来传递给组件。PHP 表达式和变量应该通过以 `:` 字符作为前缀的变量来进行传递：

```blade
<x-alert type="error" :message="$message"/>
```

您应该在类的构造器中定义组件的必要数据。在组件的视图中，组件的所有 public 类型的属性都是可用的。不必通过组件类的 `render` 方法传递：

    <?php

    namespace App\View\Components;

    use Illuminate\View\Component;

    class Alert extends Component
    {
        /**
         * alert 类型。
         *
         * @var string
         */
        public $type;

        /**
         * alert 消息。
         *
         * @var string
         */
        public $message;

        /**
         * 创建一个组件实例。
         *
         * @param  string  $type
         * @param  string  $message
         * @return void
         */
        public function __construct($type, $message)
        {
            $this->type = $type;
            $this->message = $message;
        }

        /**
         * 获取组件的视图 / 内容
         *
         * @return \Illuminate\View\View|\Closure|string
         */
        public function render()
        {
            return view('components.alert');
        }
    }

渲染组件时，您可以回显变量名来显示组件的 public 变量的内容：

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### 命名方式（Casing）

组件的构造器的参数应该使用 `驼峰式` 类型，在 HTML 属性中引用参数名时应该使用 `短横线隔开式 kebab-case ：单词与单词之间使用短横线 - 进行连接）` 。例如，给定如下的组件构造器：

    /**
     * 创建一个组件实例
     *
     * @param  string  $alertType
     * @return void
     */
    public function __construct($alertType)
    {
        $this->alertType = $alertType;
    }

`$alertType`  参数可以像这样使用：

```blade
<x-alert alert-type="danger" />
```



<a name="escaping-attribute-rendering"></a>
#### 转义属性渲染

因为一些 JavaScript 框架，例如 Alpine.js 还可以使用冒号前缀属性，你可以使用双冒号 (`::`) 前缀通知 Blade 属性不是 PHP 表达式。例如，给定以下组件：

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade 将渲染出以下 HTML 内容：

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### 组件方法

除了组件模板可用的公共变量外，还可以调用组件上的任何公共方法。例如，假设一个组件有一个 `isSelected` 方法：

    /**
     * 确定给定选项是否为当前选定的选项。
     *
     * @param  string  $option
     * @return bool
     */
    public function isSelected($option)
    {
        return $option === $this->selected;
    }

通过调用与方法名称匹配的变量，可以从组件模板执行此方法：

```blade
<option {{ $isSelected($value) ? 'selected="selected"' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### 访问组件类中的属性和插槽

Blade 组件还允许你访问类的 render 方法中的组件名称、属性和插槽。但是，为了访问这些数据，应该从组件的 `render` 方法返回闭包。闭包将接收一个  `$data` 数组作为它的唯一参数。此数组将包含几个元素，这些元素提供有关组件的信息：

    /**
     * 获取表示组件的视图 / 内容
     *
     * @return \Illuminate\View\View|\Closure|string
     */
    public function render()
    {
        return function (array $data) {
            // $data['componentName'];
            // $data['attributes'];
            // $data['slot'];

            return '<div>Components content</div>';
        };
    }



`componentName` 等于 `x-` 前缀后面的 HTML 标记中使用的名称。所以 `<x-alert />` 的 `componentName` 将是 `alert` 。 `attributes` 元素将包含 HTML 标记上的所有属性。 `slot` 元素是一个 `Illuminate\Support\HtmlString`实例，包含组件的插槽内容。

闭包应该返回一个字符串。如果返回的字符串与现有视图相对应，则将呈现该视图；否则，返回的字符串将作为内联 Blade 视图进行计算。

<a name="additional-dependencies"></a>
#### 附加依赖项

如果你的组件需要引入来自 Laravel 的 [服务容器](/docs/laravel/9.x/container)的依赖项，你可以在组件的任何数据属性之前列出这些依赖项，这些依赖项将由容器自动注入：

```php
use App\Services\AlertCreator;

/**
 * 创建组件实例
 *
 * @param  \App\Services\AlertCreator  $creator
 * @param  string  $type
 * @param  string  $message
 * @return void
 */
public function __construct(AlertCreator $creator, $type, $message)
{
    $this->creator = $creator;
    $this->type = $type;
    $this->message = $message;
}
```

<a name="hiding-attributes-and-methods"></a>
#### 隐藏属性/方法

如果要防止某些公共方法或属性作为变量公开给组件模板，可以将它们添加到组件的 `$except` 数组属性中：

    <?php

    namespace App\View\Components;

    use Illuminate\View\Component;

    class Alert extends Component
    {
        /**
         * The alert type.
         *
         * @var string
         */
        public $type;

        /**
         * 不应向组件模板公开的属性/方法。
         *
         * @var array
         */
        protected $except = ['type'];
    }

<a name="component-attributes"></a>
### 组件属性

我们已经研究了如何将数据属性传递给组件；但是，有时你可能需要指定额外的 HTML 属性，例如  `class`，这些属性不是组件运行所需的数据的一部分。通常，你希望将这些附加属性向下传递到组件模板的根元素。例如，假设我们要呈现一个 `alert` 组件，如下所示：

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```



所有不属于组件的构造器的属性都将被自动添加到组件的「属性包」中。该属性包将通过 `$attributes` 变量自动传递给组件。您可以通过回显这个变量来渲染所有的属性：

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> 注意：此时不支持在组件中使用诸如 `@env` 这样的指令。例如， `<x-alert :live="@env('production')"/>` 不会被编译。

<a name="default-merged-attributes"></a>
#### 默认 / 合并属性

某些时候，你可能需要指定属性的默认值，或将其他值合并到组件的某些属性中。为此，你可以使用属性包的 `merge`方法。 此方法对于定义一组应始终应用于组件的默认 CSS 类特别有用：

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

假设我们如下方所示使用该组件：

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

最终呈现的组件 HTML 将如下所示：

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### 有条件地合并类

有时您可能希望在给定条件为 `true` 时合并类。 您可以通过该 `class` 方法完成此操作，该方法接受一个类数组，其中数组键包含您希望添加的一个或多个类，而值是一个布尔表达式。如果数组元素有一个数字键，它将始终包含在呈现的类列表中：

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```



如果需要将其他属性合并到组件中，可以将 `merge` 方法链接到 `class` 方法中：

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> 技巧：如果您需要有条件地编译不应接收合并属性的其他 HTML 元素上的类，您可以使用 [`@class` 指令](#conditional-classes)。

<a name="non-class-attribute-merging"></a>
#### 非 class 属性的合并

当合并非 `class` 属性的属性时，提供给 `merge` 方法的值将被视为该属性的「default」值。但是，与 `class` 属性不同，这些属性不会与注入的属性值合并。相反，它们将被覆盖。例如， `button` 组件的实现可能如下所示：

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

若要使用自定义 `type` 呈现按钮组件，可以在使用该组件时指定它。如果未指定 `type`，则将使用 `button` 作为 type 值：

```blade
<x-button type="submit">
    Submit
</x-button>
```

本例中 `button` 组件渲染的 HTML 为：

```blade
<button type="submit">
    Submit
</button>
```

如果希望 `class` 以外的属性将其默认值和注入值连接在一起，可以使用 `prepends` 方法。在本例中， `data-controller` 属性始终以 `profile-controller` 开头，并且任何其他注入 `data-controller` 的值都将放在该默认值之后：

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### 保留属性 / 过滤属性

可以使用 `filter` 方法筛选属性。如果希望在属性包中保留属性，此方法接受应返回 `true` 的闭包：

```blade
{{ $attributes->filter(fn ($value, $key) => $key == 'foo') }}
```



为了方便起见，你可以使用 `whereStartsWith` 方法检索其键以给定字符串开头的所有属性：

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

相反，该 `whereDoesntStartWith` 方法可用于排除键以给定字符串开头的所有属性：

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

使用 `first` 方法，可以呈现给定属性包中的第一个属性：

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

如果要检查组件上是否存在属性，可以使用 `has` 方法。此方法接受属性名称作为其唯一参数，并返回一个布尔值，指示该属性是否存在：

```blade
@if ($attributes->has('class'))
    <div>>存在 class 属性</div>
@endif
```

可以使用 `get` 方法检索特定属性的值：

```blade
{{ $attributes->get('class') }}
```

<a name="reserved-keywords"></a>
### 保留关键字

默认情况下，为了渲染组件，会保留一些关键字供 Blade 内部使用。以下关键字不能定义为组件中的公共属性或方法名称：

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

<a name="slots"></a>
### 插槽

你通常需要通过「插槽」将其他内容传递给组件。通过回显 `$slot` 变量来呈现组件插槽。为了探索这个概念，我们假设 `alert` 组件具有以下内容：

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

我们可以通过向组件中注入内容将内容传递到 `slot` ：

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```



有时候一个组件可能需要在它内部的不同位置放置多个不同的插槽。我们来修改一下 alert 组件，使其允许注入 「title」:

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

您可以使用 `x-slot` 标签来定义命名插槽的内容。任何没有在 `x-slot` 标签中的内容都将传递给  `$slot` 变量中的组件：

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="scoped-slots"></a>
#### 作用域插槽

如果您使用诸如 Vue 这样的 JavaScript 框架，那么您应该很熟悉「作用域插槽」，它允许您从插槽中的组件访问数据或者方法。 Laravel 中也有类似的用法，只需在您的组件中定义 public 方法或属性，并且使用 `$component` 变量来访问插槽中的组件。在此示例中，我们将假设组件在其组件类上定义了 `x-alert` 一个公共方法： `formatAlert`

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### 插槽属性

像 Blade 组件一样，您可以为插槽分配额外的 [属性](#component-attributes) ，例如 CSS 类名：

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

要与插槽属性交互，您可以访问 `attributes` 插槽变量的属性。有关如何与属性交互的更多信息，请参阅有关 [组件属性](#component-attributes) 的文档：

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```



<a name="inline-component-views"></a>
### 内联组件视图

对于小型组件而言，管理组件类和组件视图模板可能会很麻烦。因此，您可以从 `render` 方法中返回组件的内容：

    /**
     * 获取组件的视图 / 内容。
     *
     * @return \Illuminate\View\View|\Closure|string
     */
    public function render()
    {
        return <<<'blade'
            <div class="alert alert-danger">
                {{ $slot }}
            </div>
        blade;
    }

<a name="generating-inline-view-components"></a>
#### 生成内联视图组件

要创建一个渲染内联视图的组件，您可以在运行 `make:component` 命令时使用  `inline` ：

```shell
php artisan make:component Alert --inline
```

<a name="anonymous-components"></a>
### 匿名组件

与行内组件相同，匿名组件提供了一个通过单个文件管理组件的机制。然而，匿名组件使用的是一个没有关联类的单一视图文件。要定义一个匿名组件，您只需将 Blade 模板置于 `resources/views/components` 目录下。例如，假设您在 `resources/views/components/alert.blade.php`中定义了一个组件：

```blade
<x-alert/>
```

如果组件在 `components` 目录的子目录中，您可以使用 `.` 字符来指定其路径。例如，假设组件被定义在 `resources/views/components/inputs/button.blade.php` 中，您可以像这样渲染它：

```blade
<x-inputs.button/>
```

<a name="anonymous-index-components"></a>
#### 匿名索引组件

有时，当一个组件由许多 Blade 模板组成时，您可能希望将给定组件的模板分组到一个目录中。例如，想象一个具有以下目录结构的「可折叠」组件：

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```



此目录结构允许您像这样呈现组件及其项目：

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

然而，为了通过 `x-accordion` 渲染组件， 我们被迫将「索引」组件模板放置在 `resources/views/components` 目录中，而不是与其他相关的模板嵌套在 `accordion` 目录中。

幸运的是，Blade 允许您 `index.blade.php` 在组件的模板目录中放置文件。当 `index.blade.php` 组件存在模板时，它将被呈现为组件的「根」节点。因此，我们可以继续使用上面示例中给出的相同 Blade 语法；但是，我们将像这样调整目录结构：

```none
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
#### 数据 / 属性

由于匿名组件没有任何关联类，您可能想要区分哪些数据应该被作为变量传递给组件，而哪些属性应该被存放于 [属性包](#component-attributes)中。

您可以在组件的 Blade 模板的顶层使用 `@props` 指令来指定哪些属性应该作为数据变量。组件中的其他属性都将通过属性包的形式提供。如果您想要为某个数据变量指定一个默认值，您可以将属性名作为数组键，默认值作为数组值来实现：

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```



给定上面的组件定义，我们可以像这样渲染组件：

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
#### 访问父数据

有时您可能希望从子组件中的父组件访问数据。在这些情况下，您可以使用该 `@aware` 指令。例如，假设我们正在构建一个由父 `<x-menu>` 和 子组成的复杂菜单组件 `<x-menu.item>`：

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

该 `<x-menu>` 组件可能具有如下实现：

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

因为 `color` 只被传递到父级 (`<x-menu>`)中，所以 `<x-menu.item>` 在内部是不可用的。但是，如果我们使用该 `@aware` 指令，我们也可以使其在内部可用 `<x-menu.item>` ：

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> 注意：该 `@aware` 指令无法访问未通过 HTML 属性显式传递给父组件的父数据。`@aware` 指令 不能访问未显式传递给父组件的默认值 `@props` 。

<a name="dynamic-components"></a>
### 动态组件

有时，您可能需要渲染一个组件，但在运行前不知道要渲染哪一个。这种情况下，您可以使用 Laravel 内置的 `dynamic-component` 组件来渲染一个基于值或变量的组件：

```blade
<x-dynamic-component :component="$componentName" class="mt-4" />
```



<a name="manually-registering-components"></a>
### 手动注册组件

> 注意：以下关于手动注册组件的文档主要适用于编写包含视图组件的 Laravel 包的人。如果您不编写包，则组件文档的这一部分可能与您无关。

当为您自己的应用编写组件的时候，Laravel 将会自动发现位于 `app/View/Components` 目录和  `resources/views/components` 目录中的组件。

当然，如果您使用 Blade 组件编译一个包，您可能需要手动注册组件类及其 HTML 标签别名。您应该在包的服务提供者的 `boot` 方法中注册您的组件：

    use Illuminate\Support\Facades\Blade;
    use VendorPackage\View\Components\AlertComponent;

    /**
     * 驱动您的包的服务
     *
     * @return void
     */
    public function boot()
    {
        Blade::component('package-alert', AlertComponent::class);
    }

当组件注册完成后，便可使用标签别名来对其进行渲染。

```blade
<x-package-alert/>
```

#### 自动加载包组件

或者，您可以使用该 `componentNamespace` 方法按照约定自动加载组件类。例如，一个 `Nightshade` 包可能有 `Calendar` 和 `ColorPicker` 组件驻留在 `Package\Views\Components` 命名空间中：

    use Illuminate\Support\Facades\Blade;

    /**
     * 驱动您的包的服务
     *
     * @return void
     */
    public function boot()
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }

这将允许他们的供应商命名空间使用包组件，使用以下 `package-name::` 语法：

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade 将自动检测链接到该组件的类，通过对组件名称进行帕斯卡大小写。使用「点」表示法也支持子目录。



<a name="building-layouts"></a>
## 构建布局

<a name="layouts-using-components"></a>
### 使用组件布局

大多数 web 应用程序在不同的页面上有相同的总体布局。如果我们必须在创建的每个视图中重复整个布局 HTML，那么维护我们的应用程序将变得非常麻烦和困难。谢天谢地，将此布局定义为单个 [Blade 组件](#components) 并在整个应用程序中非常方便地使用它。

<a name="defining-the-layout-component"></a>
#### 定义布局组件

例如，假设我们正在构建一个 todo list 应用程序。我们可以定义如下所示的 `layout` 组件：

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

<a name="applying-the-layout-component"></a>
#### 应用布局组件

一旦定义了 `layout` 组件，我们就可以创建一个使用该组件的 Blade 视图。在本例中，我们将定义一个显示任务列表的简单视图：

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

请记住，注入到组件中的内容将提供给 `layout` 组件中的默认 `$slot` 变量。正如你可能已经注意到的，如果提供了 `$title` 插槽，那么我们的 `layout` 也会尊从该插槽；否则，将显示默认的标题。我们可以使用组件文档中讨论的标准槽语法从任务列表视图中插入自定义标题。 我们可以使用[组件文档](#components)中讨论的标准插槽语法从任务列表视图中注入自定义标题：

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```



现在我们已经定义了布局和任务列表视图，我们只需要从路由中返回 `task` 视图即可：

    use App\Models\Task;

    Route::get('/tasks', function () {
        return view('tasks', ['tasks' => Task::all()]);
    });

<a name="layouts-using-template-inheritance"></a>
### 使用模板继承进行布局

<a name="defining-a-layout"></a>
#### 定义一个布局

布局也可以通过 「模板继承」 创建。在引入 [组件](#components) 之前，这是构建应用程序的主要方法。

让我们看一个简单的例子做开头。首先，我们将检查页面布局。由于大多数 web 应用程序在不同的页面上保持相同的总体布局，因此将此布局定义为单一视图非常方便：

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            这是一个主要的侧边栏
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

如你所见，此文件包含经典的 HTML 标记。但是，请注意 `@section` 和 `@yield` 指令。顾名思义， `@section` 指令定义内容的一部分，而 `@yield` 指令用于显示给定部分的内容。

现在我们已经为应用程序定义了一个布局，让我们定义一个继承该布局的子页面。

<a name="extending-a-layout"></a>
#### 继承布局

定义子视图时，请使用 `@extends` Blade 指令指定子视图应「继承」的布局。扩展 Blade 布局的视图可以使用 `@section` 指令将内容注入布局的节点中。请记住，如上面的示例所示，这些部分的内容将使用 `@yield` 显示在布局中：

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```



在本例中，`sidebar` 部分使用 `@parent`  指令将内容追加（而不是覆盖）到局部的侧栏位置。在呈现视图时， `@parent` 指令将被布局的内容替换。

> 技巧：与前面的示例相反，本 `sidebar` 节以 `@endsection` 结束，而不是以 `@show` 结束。 `@endsection` 指令将只定义一个节，`@show` 将定义并 **立即 yield** 该节。

该 `@yield` 指令还接受默认值作为其第二个参数。如果要生成的节点未定义，则将呈现此内容：

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## 表单

<a name="csrf-field"></a>
### CSRF 字段

无论何时在应用程序中定义 HTML 表单，都应该在表单中包含一个隐藏的 CSRF 令牌字段，以便 [CSRF 保护中间件](/docs/laravel/9.x/csrf) 可以验证请求。你可以使用 `@csrf` Blade 指令生成令牌字段：

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### Method 字段

由于 HTML 表单不能发出 `PUT`、`PATCH`或 `DELETE` 请求，因此需要添加一个隐藏的 `_method` 字段来欺骗这些 HTTP 动词。 `@method` Blade 指令可以为你创建此字段：

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### 表单校验错误

该 `@error` 指令可用于快速检查给定属性是否存在 [验证错误消息](/docs/laravel/9.x/validation#quick-displaying-the-validation-errors) 。在 `@error` 指令中，可以回显 `$message` 变量以显示错误消息：

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```



由于该 `@error` 指令编译为「if」语句，因此您可以在 `@else` 属性没有错误时使用该指令来呈现内容：

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror">
```

你可以将 [特定错误包的名称](/docs/laravel/9.x/validation#named-error-bags) 作为第二个参数传递给 `@error` 指令，以便在包含多个表单的页面上检索验证错误消息：

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror">

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>
## 堆栈

Blade 允许你推送到可以在其他视图或布局中的其他地方渲染的命名堆栈。这对于指定子视图所需的任何 JavaScript 库特别有用：

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

你可以根据需要多次推入堆栈。要呈现完整的堆栈内容，请将堆栈的名称传递给 `@stack` 指令：

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

如果要将内容前置到堆栈的开头，应使用 `@prepend` 指令：

```blade
@push('scripts')
    这是第二加载的...
@endpush

// Later...

@prepend('scripts')
    这是第一加载的...
@endprepend
```

<a name="service-injection"></a>
## 服务注入

该 `@inject` 指令可用于从 Laravel [服务容器](/docs/laravel/9.x/container)中检索服务。传递给 `@inject` 的第一个参数是要将服务放入的变量的名称，而第二个参数是要解析的服务的类或接口名称：

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```



<a name="rendering-inline-blade-templates"></a>
## 渲染内联 Blade 模板

有时您可能需要将原始 Blade 模板字符串转换为有效的 HTML。您可以使用 `Blade` 门面提供的 `render` 方法来完成此操作。该 `render` 方法接受 Blade 模板字符串和提供给模板的可选数据数组：

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

Laravel 通过将内联 Blade 模板写入 `storage/framework/views` 目录来呈现它们。如果你希望 Laravel 在渲染 Blade 模板后删除这些临时文件，你可以为 `deleteCachedView` 方法提供参数：

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="extending-blade"></a>
## 扩展 Blade

Blade 允许你使用 `directive` 方法定义自己的自定义指令。当 Blade 编译器遇到自定义指令时，它将使用该指令包含的表达式调用提供的回调。

下面的示例创建了一个 `@datetime($var)` 指令，该指令格式化给定的 `$var`，它应该是 `DateTime` 的一个实例：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Blade;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册应用的服务
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 启动应用的服务
         *
         * @return void
         */
        public function boot()
        {
            Blade::directive('datetime', function ($expression) {
                return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
            });
        }
    }

正如你所见，我们将 `format` 方法应用到传递给指令中的任何表达式上。因此，在本例中，此指令生成的最终 PHP 将是：

    <?php echo ($var)->format('m/d/Y H:i'); ?>

> 注意：更新 Blade 指令的逻辑后，需要删除所有缓存的 Blade 视图。可以使用 `view:clear` Artisan 命令。



<a name="custom-echo-handlers"></a>
### 自定义回显处理程序

如果您试图使用 Blade 来「回显」一个对象， 该对象的 `__toString` 方法将被调用。该[`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 方法是 PHP 内置的「魔术方法」之一。但是，有时您可能无法控制 `__toString` 给定类的方法，例如当您与之交互的类属于第三方库时。

在这些情况下，Blade 允许您为该特定类型的对象注册自定义回显处理程序。为此，您应该调用 Blade 的 `stringable` 方法。该 `stringable` 方法接受一个闭包。这个闭包类型应该提示它负责呈现的对象的类型。通常，应该在应用程序的 `AppServiceProvider` 类的 `boot` 方法中调用该`stringable` 方法：

    use Illuminate\Support\Facades\Blade;
    use Money\Money;

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::stringable(function (Money $money) {
            return $money->formatTo('en_GB');
        });
    }

定义自定义回显处理程序后，您可以简单地回显 Blade 模板中的对象：

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### 自定义 if 声明

在定义简单的自定义条件语句时，编写自定义指令通常比较复杂。因此，Blade 提供了一个  `Blade::if` 方法，允许你使用闭包快速定义自定义条件指令。例如，让我们定义一个自定义条件来检查为应用程序配置的默认 「存储」。我们可以在 `AppServiceProvider` 的 `boot` 方法中执行此操作：

    use Illuminate\Support\Facades\Blade;

    /**
     * 启动应用的服务
     *
     * @return void
     */
    public function boot()
    {
        Blade::if('disk', function ($value) {
            return config('filesystems.default') === $value;
        });
    }

一旦定义了自定义条件，就可以在模板中使用它:

```blade
@disk('local')
    <!-- 应用正在使用 local 存储 ... -->
@elsedisk('s3')
    <!-- 应用正在使用 s3 存储 ... -->
@else
    <!-- 应用正在使用其他存储 ... -->
@enddisk

@unlessdisk('local')
    <!-- 应用当前没有使用 local 存储 ... -->
@enddisk
```

