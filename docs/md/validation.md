# Validation

- [简介](#introduction)
- [快速验证](#validation-quickstart)
    - [定义路由](#quick-defining-the-routes)
    - [创建控制器](#quick-creating-the-controller)
    - [编写验证逻辑](#quick-writing-the-validation-logic)
    - [显示验证的错误信息](#quick-displaying-the-validation-errors)
    - [回填表单](#repopulating-forms)
    - [可选字段的注意事项](#a-note-on-optional-fields)
- [表单请求验证](#form-request-validation)
    - [创建表单请求验证](#creating-form-requests)
    - [表单请求认证授权](#authorizing-form-requests)
    - [自定义验证错误信息](#customizing-the-error-messages)
    - [准备验证数据](#preparing-input-for-validation)
- [手动创建验证器](#manually-creating-validators)
    - [自动重定向](#automatic-redirection)
    - [命名错误信息包](#named-error-bags)
    - [自定义错误信息](#manual-customizing-the-error-messages)
    - [验证后的钩子](#after-validation-hook)
- [处理验证字段](#working-with-validated-input)
- [处理错误信息](#working-with-error-messages)
    - [在语言文件中指定自定义消息](#specifying-custom-messages-in-language-files)
    - [在语言文件中指定属性](#specifying-attribute-in-language-files)
    - [在语言文件中指定值](#specifying-values-in-language-files)
- [可用的验证规则](#available-validation-rules)
- [按条件添加验证规则](#conditionally-adding-rules)
- [数组的验证](#validating-arrays)
    - [验证多维数组字段](#validating-nested-array-input)
- [密码的验证](#validating-passwords)
- [自定义验证规则](#custom-validation-rules)
    - [使用规则类](#using-rule-objects)
    - [使用闭包](#using-closures)
    - [隐式规则](#implicit-rules)

<a name="introduction"></a>
## 简介

Laravel 提供了几种不同的方法来验证传入应用程序的数据。最常见的做法是在所有传入的 HTTP 请求中使用 `validate` 方法。但是，我们还将讨论其他验证方法。

Laravel 包含了各种方便的验证规则，你可以将它们应用于数据，甚至可以验证给定数据库表中的值是否唯一。我们将详细介绍每个验证规则，以便你熟悉 Laravel 的所有验证功能。



<a name="validation-quickstart"></a>
## 快速验证

为了了解 Laravel 强大的验证功能，我们来看一个表单验证并将错误消息展示给用户的完整示例。通过阅读概述，这将会对你如何使用 Laravel 验证传入的请求数据有一个很好的理解：

<a name="quick-defining-the-routes"></a>
### 定义路由

首先，假设我们在 `routes/web.php` 路由文件中定义了下面这些路由：

    use App\Http\Controllers\PostController;

    Route::get('/post/create', [PostController::class, 'create']);
    Route::post('/post', [PostController::class, 'store']);

`GET` 路由会显示一个供用户创建新博客文章的表单，而 `POST` 路由会将新的博客文章存储到数据库中。

<a name="quick-creating-the-controller"></a>
### 创建控制器

接下来，让我们一起来看看处理这些路由的简单控制器。我们暂时留空了 store 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * 显示创建博客文章的表单。
         *
         * @return \Illuminate\View\View
         */
        public function create()
        {
            return view('post.create');
        }

        /**
         * 存储一篇新的博客文章。
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            // Validate and store the blog post...
        }
    }

<a name="quick-writing-the-validation-logic"></a>
### 编写验证逻辑

现在我们开始在 `store` 方法中编写用来验证新的博客文章的逻辑代码。为此，我们将使用 `Illuminate\Http\Request` 类提供的 `validate` 方法。如果验证通过，你的代码会继续正常运行。如果验证失败，则会抛出`Illuminate\Validation\ValidationException`异常，并自动将对应的错误响应返回给用户。


如果在传统 HTTP 请求期间验证失败，则会生成对先前 URL 的重定向响应。如果传入的请求是 XHR，将将返回包含验证错误信息的 JSON 响应。

为了深入理解 `validate` 方法，让我们接着回到 `store` 方法中：

    /**
     * 存储一篇新的博客文章。
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        // 博客文章验证通过...
    }

如您所见，验证规则被传递到 `validate` 方法中。不用担心 - 所有可用的验证规则均已[记录在案](#available-validation-rules)。另外再提醒一次，如果验证失败，会自动生成一个对应的响应。如果验证通过，那我们的控制器会继续正常运行。
或者，验证规则可以使用数组而不是单个 `|` 分隔的字符串：

    $validatedData = $request->validate([
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);


另外，你可以使用 `validateWithBag` 方法来验证请求，并将所有错误信息储存在一个[命名错误信息包](#named-error-bags)：

    $validatedData = $request->validateWithBag('post', [
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);

<a name="stopping-on-first-validation-failure"></a>
#### 在首次验证失败时停止运行

有时候我们希望某个字段在第一次验证失败后就停止运行验证规则，只需要将 `bail` 添加到规则中

    $request->validate([
        'title' => 'bail|required|unique:posts|max:255',
        'body' => 'required',
    ]);

在这个例子中，如果 `title` 字段没有通过 `unique` 规则，那么不会继续验证 `max` 规则。规则会按照分配时的顺序来验证。



<a name="a-note-on-nested-attributes"></a>
#### 嵌套字段的说明

如果你的 HTTP 请求包含「嵌套」参数，你可以在验证规则中使用 `.` 语法来指定这些参数：

    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'author.name' => 'required',
        'author.description' => 'required',
    ]);

另外，如果你的字段名称包含点，则可以通过使用反斜杠将点转义，以防止将其解释为 `.` 语法：

    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'v1\.0' => 'required',
    ]);

<a name="quick-displaying-the-validation-errors"></a>
### 显示验证错误信息

那么，如果传入的请求参数未通过给定的验证规则呢？正如前面所提到的，Laravel 会自动将用户重定向到之前的位置。另外，所有的验证错误信息和 [请求输入](/docs/laravel/9.x/requests#retrieving-old-input) 都将自动存储到 [闪存 session](/docs/laravel/9.x/session#flash-data) 中。

`Illuminate\View\Middleware\ShareErrorsFromSession` 中间件与应用程序的所有视图共享一个 `$errors` 变量，该变量由 `web` 中间件组提供。当应用该中间件时，`$errors` 变量在你的视图中始终可用，从而使你可以方便地假定 `$errors` 变量始终被定义并且可以安全地使用。`$errors` 变量是`Illuminate\Support\MessageBag` 的一个实例。有关使用此对象的更多信息，请 [参阅这篇文档](#working-with-error-messages)。

所以，在如下的例子中，当表单验证失败时，用户将被重定向到控制器的 `create` 方法中，我们可在视图中显示错误信息：

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```



<a name="quick-customizing-the-error-messages"></a>
#### 自定义错误消息

Laravel 的内置验证规则每个都有一条错误消息，位于应用程序的 `lang/en/validation.php` 文件中。在此文件中，你将找到每个验证规则的翻译条目。你可以根据应用程序的需求随意更改或修改这些消息。

此外，你可以将此文件复制到另一个翻译语言的目录中，以翻译应用程序语言的消息。要了解有关 Laravel 本地化的更多信息，请查看完整的 [本地化文档](/docs/laravel/9.x/localization)。

<a name="quick-xhr-requests-and-validation"></a>
#### XHR 请求 & 验证

在如下示例中，我们使用传统形式将数据发送到应用程序。但是，许多应用程序从 JavaScript 驱动的前端接收 XHR 请求。在 XHR 请求期间使用 `validate` 方法时，Laravel 将不会生成重定向响应。相反，Laravel 会生成一个包含所有验证错误的 JSON 响应。该 JSON 响应将以 `422` HTTP 状态码发送。

<a name="the-at-error-directive"></a>
#### `@error` 指令

你亦可使用 `@error` [Blade](/docs/laravel/9.x/blade) 指令方便地检查给定的属性是否存在验证错误信息。在 `@error` 指令中，你可以输出 `$message` 变量以显示错误信息：

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

如果您使用 [命名错误包](#named-error-bags)，您可以将错误包的名称作为第二个参数传递给 `@error` 指令：

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```



<a name="repopulating-forms"></a>
### 回填表单

当 Laravel 由于验证错误而生成重定向响应时，框架将自动 [将所有请求的输入闪存到 session 中](/docs/laravel/9.x/session#flash-data)。这样做是为了方便你在下一个请求期间访问输入，并重新填充用户尝试提交的表单。

要从先前的请求中检索闪存的输入，请在 `Illuminate\Http\Request` 的实例上调用 `old` 方法。 `old` 方法将从 [session](/docs/laravel/9.x/session) 中提取先前闪存的输入数据：

    $title = $request->old('title');

Laravel 还提供了一个全局性的 `old`。如果要在 [Blade 模板](/docs/laravel/9.x/blade) 中显示旧输入，则使用 `old` 来重新填充表单会更加方便。如果给定字段不存在旧输入，则将返回 `null`：

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### 关于可选字段的注意事项

默认情况下， 在您的 Laravel 应用的全局中间件堆栈 `App\Http\Kernel` 类中包含了 `TrimStrings` 和 `ConvertEmptyStringsToNull` 中间件。因此，如果你不想让 `null` 被验证器标识为非法的话，你需要将「可选」字段标志为 `nullable`。例如：

    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
        'publish_at' => 'nullable|date',
    ]);

在上述例子中，我们指定了 `publish_at` 字段可以是`null`的或者是一个有效的日期格式。如果 `nullable` 修饰词没有被添加到规则定义中，验证器会将 `null` 视为无效的日期格式。



<a name="form-request-validation"></a>
## 验证表单请求

<a name="creating-form-requests"></a>
### 创建表单请求验证

面对更复杂的验证场景，您可以创建一个「表单请求」。表单请求是一个包含了验证逻辑的自定义请求类。要创建一个表单请求类，请使用 `make:request` Artisan CLI 命令：

```shell
php artisan make:request StorePostRequest
```

该命令生成的表单请求类将被置于 `app/Http/Requests` 目录中。如果这个目录不存在，在您运行 `make:request` 命令后将会创建这个目录。Laravel 生成的每个表单请求都有两个方法：`authorize` 和 `rules`。

正如您可能已经猜到的那样，`authorize` 方法负责确定当前经过身份验证的用户是否可以执行请求操作，而 `rules` 方法则返回适用于请求数据的验证规则：

    /**
     * 获取应用于该请求的验证规则。
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ];
    }

> 技巧：你可以向 `rules` 方法传入所需的任何依赖项。它们将被 Laravel [服务容器](/docs/laravel/9.x/container) 自动解析。

所以，验证规则是如何运行的呢？您所需要做的就是在控制器方法中类型提示传入的请求。在调用控制器方法之前验证传入的表单请求，这意味着您不需要在控制器中写任何验证逻辑：

    /**
     * 存储新的博客文章。
     *
     * @param  \App\Http\Requests\StorePostRequest  $request
     * @return Illuminate\Http\Response
     */
    public function store(StorePostRequest $request)
    {
        // 传入的请求通过验证...

        // 获取通过验证的数据...
        $validated = $request->validated();

        // 获取部分通过验证的数据...
        $validated = $request->safe()->only(['name', 'email']);
        $validated = $request->safe()->except(['name', 'email']);
    }



如果验证失败，就会生成一个让用户返回到先前位置的重定向响应。这些错误也会被闪存到 session 中，以便这些错误都可以在页面中显示出来。如果传入的请求是 XHR，会向用户返回具有 422 状态代码和验证错误信息的 JSON 数据的 HTTP 响应。

<a name="adding-after-hooks-to-form-requests"></a>
#### 在表单请求后添加钩子

如果您想在表单请求「之后」添加验证钩子，可以使用 `withValidator` 方法。这个方法接收一个完整的验证构造器，允许你在验证结果返回之前调用任何方法：

    /**
     * 配置验证实例。
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add('field', 'Something is wrong with this field!');
            }
        });
    }


<a name="request-stopping-on-first-validation-rule-failure"></a>
#### 单个验证规则失败后停止

通过向您的请求类添加 `stopOnFirstFailure` 属性，您可以通知验证器一旦发生单个验证失败后，停止验证所有规则。

    /**
     * 表示验证器是否应在第一个规则失败时停止。
     *
     * @var bool
     */
    protected $stopOnFirstFailure = true;

<a name="customizing-the-redirect-location"></a>
#### 自定义重定向

如前所述，当表单请求验证失败时，将会生成一个让用户返回到先前位置的重定向响应。当然，您也可以自由定义此行为。如果您要这样做，可以在表单请求中定义一个 `$redirect` 属性：

    /**
     * 如果验证失败，用户应重定向到的 URI。
     *
     * @var string
     */
    protected $redirect = '/dashboard';



或者，如果你想将用户重定向到一个命名路由，你可以定义一个 `$redirectRoute` 属性来代替：

    /**
     * 如果验证失败，用户应该重定向到的路由。
     *
     * @var string
     */
    protected $redirectRoute = 'dashboard';

<a name="authorizing-form-requests"></a>
### 表单请求授权验证

表单请求类内也包含了 `authorize` 方法。在这个方法中，您可以检查经过身份验证的用户确定其是否具有更新给定资源的权限。例如，您可以判断用户是否拥有更新文章评论的权限。最有可能的是，您将通过以下方法与你的 [授权与策略](/docs/laravel/9.x/authorization) 进行交互：

    use App\Models\Comment;

    /**
     * 确定用户是否有请求权限。
     *
     * @return bool
     */
    public function authorize()
    {
        $comment = Comment::find($this->route('comment'));

        return $comment && $this->user()->can('update', $comment);
    }

由于所有的表单请求都是继承了 Laravel 中的请求基类，所以我们可以使用 `user` 方法去获取当前认证登录的用户。同时请注意上述例子中对 `route` 方法的调用。这个方法允许你在被调用的路由上获取其定义的 URI 参数，譬如下面例子中的 `{comment}` 参数：

    Route::post('/comment/{comment}');

因此，如果您的应用程序正在使用 [路由模型绑定](/docs/laravel/9.x/routing#route-model-binding)，则可以通过将解析的模型作为请求从而让您的代码更加简洁：

    return $this->user()->can('update', $this->comment);

如果 `authorize` 方法返回 `false`，则会自动返回一个包含 403 状态码的 HTTP 响应，也不会运行控制器的方法。



如果您打算在应用程序的其它部分处理请求的授权逻辑，只需从 `authorize` 方法返回 `true`：

    /**
     * 判断用户是否有请求权限。
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

> 技巧：你可以向 `authorize` 方法传入所需的任何依赖项。它们会自动被 Laravel 提供的 [服务容器](/docs/laravel/9.x/container) 自动解析。

<a name="customizing-the-error-messages"></a>
### 自定义错误消息

你可以通过重写表单请求的 `messages` 方法来自定义错误消息。此方法应返回属性 / 规则对及其对应错误消息的数组：

    /**
     * 获取已定义验证规则的错误消息。
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title.required' => 'A title is required',
            'body.required' => 'A message is required',
        ];
    }

<a name="customizing-the-validation-attributes"></a>
#### 自定义验证属性

Laravel 的许多内置验证规则错误消息都包含 `:attribute` 占位符。如果您希望将验证消息的 `:attribute` 部分替换为自定义属性名称，则可以重写 `attributes` 方法来指定自定义名称。此方法应返回属性 / 名称对的数组：

    /**
     * 获取验证错误的自定义属性
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'email' => 'email address',
        ];
    }

<a name="preparing-input-for-validation"></a>
### 准备验证输入

如果您需要在应用验证规则之前修改或清理请求中的任何数据，您可以使用 `prepareForValidation` 方法：

    use Illuminate\Support\Str;

    /**
     * 准备验证数据。
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'slug' => Str::slug($this->slug),
        ]);
    }



<a name="manually-creating-validators"></a>
## 手动创建验证器

如果您不想在请求中使用 `validate` 方法，您可以使用 `Validator` [门面](/docs/laravel/9.x/facades) 手动创建一个验证器实例。门面中的 `make` 方法将会生成一个新的验证器实例：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Validator;

    class PostController extends Controller
    {
        /**
         * 存储一篇博客文章。
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            $validator = Validator::make($request->all(), [
                'title' => 'required|unique:posts|max:255',
                'body' => 'required',
            ]);

            if ($validator->fails()) {
                return redirect('post/create')
                            ->withErrors($validator)
                            ->withInput();
            }

            // 获取通过验证的数据...
            $validated = $validator->validated();

            // 获取部分通过验证的数据...
            $validated = $validator->safe()->only(['name', 'email']);
            $validated = $validator->safe()->except(['name', 'email']);

            //存储博客文章...
        }
    }

`make` 方法中的第一个参数是期望校验的数据。第二个参数是应用到数据上的校验规则。

如果校验失败，您可以使用 `withErrors` 方法将错误信息闪存至 session 中。使用该方法时，`$errors` 会自动与之后的视图共享，您可以很方便将其回显给用户。`withErrors` 方法接受验证器实例，`MessageBag` 或是 PHP `数组`。

#### 单个验证规则失败后停止

`stopOnFirstFailure` 方法将通知验证器，一旦发生单个验证失败，它应该停止验证所有属性

    if ($validator->stopOnFirstFailure()->fails()) {
        // ...
    }



<a name="automatic-redirection"></a>
### 自动重定向

如果您想要在手动创建验证器实例的同时，使用请求的 `validate` 方法的自动重定向功能，那么您可以在现有的验证器实例上调用 `validate` 方法。如果校验失败，用户将被自动重定向，或在 XHR 请求下，将会返回一个 JSON 响应：

    Validator::make($request->all(), [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ])->validate();

如果校验失败，您可以使用 `validateWithBag` 方法将错误信息存储到 [命名错误包](#named-error-bags) 中

    Validator::make($request->all(), [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ])->validateWithBag('post');

<a name="named-error-bags"></a>
### 命名错误包

如果您的一个页面中存在多个表单，您可以为错误的 `MessageBag` 命名，用于检索指定表单的错误信息。只需将名称作为 `withErrors` 的第二个参数传递给它：

    return redirect('register')->withErrors($validator, 'login');

您可以通过 `$errors` 变量访问命名后的 `MessageBag` 实例：

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### 自定义错误消息

如果需要，您可以提供验证程序实例使用的自定义错误消息，而不是 Laravel 提供的默认错误消息。有几种指定自定义消息的方法。首先，您可以将自定义消息作为第三个参数传递给 `Validator::make` 方法：

    $validator = Validator::make($input, $rules, $messages = [
        'required' => 'The :attribute field is required.',
    ]);



在此示例中，`:attribute` 占位符将被验证中的字段的实际名称替换。您也可以在验证消息中使用其它占位符。例如：

    $messages = [
        'same' => 'The :attribute and :other must match.',
        'size' => 'The :attribute must be exactly :size.',
        'between' => 'The :attribute value :input is not between :min - :max.',
        'in' => 'The :attribute must be one of the following types: :values',
    ];

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### 为给定属性指定自定义消息

有时您可能希望只为特定属性指定自定义错误消息。您可以使用 `.` 表示法。首先指定属性名称，然后指定规则：

    $messages = [
        'email.required' => 'We need to know your email address!',
    ];

<a name="specifying-custom-attribute-values"></a>
#### 指定自定义属性值

Laravel 的许多内置错误消息都包含一个 `:attribute` 占位符，该占位符已被验证中的字段或属性的名称替换。为了自定义用于替换特定字段的这些占位符的值，你可以将自定义属性的数组作为第四个参数传递给 `Validator::make` 方法：

    $validator = Validator::make($input, $rules, $messages, [
        'email' => 'email address',
    ]);

<a name="after-validation-hook"></a>
### 验证后钩子

验证器允许您在完成验证操作后执行附加的回调。以便您处理下一步的验证，甚至是往信息集合中添加更多的错误信息。您可以在验证器实例上使用 `after` 方法实现：

    $validator = Validator::make(...);

    $validator->after(function ($validator) {
        if ($this->somethingElseIsInvalid()) {
            $validator->errors()->add(
                'field', 'Something is wrong with this field!'
            );
        }
    });

    if ($validator->fails()) {
        //
    }



<a name="working-with-validated-input"></a>
## 处理验证字段

在使用表单请求或手动创建的验证器实例验证传入请求数据后，您可能希望检索经过验证的请求数据。 这可以通过多种方式实现。 首先，您可以在表单请求或验证器实例上调用 `validated` 方法。 此方法返回已验证的数据数组：

    $validated = $request->validated();

    $validated = $validator->validated();

或者，您可以在表单请求或验证器实例上调用 `safe` 方法。 此方法返回一个 `Illuminate\Support\ValidatedInput` 的实例。 该实例对象包含 `only`、`except` 和 `all` 方法来检索已验证数据的子集或整个已验证数据数组：

    $validated = $request->safe()->only(['name', 'email']);

    $validated = $request->safe()->except(['name', 'email']);

    $validated = $request->safe()->all();

此外，`Illuminate\Support\ValidatedInput` 实例可以像数组一样被迭代和访问：

    // 迭代验证数据...
    foreach ($request->safe() as $key => $value) {
        //
    }

    // 访问验证数据数组...
    $validated = $request->safe();

    $email = $validated['email'];

如果您想向已验证的数据添加其它字段，您可以调用 `merge` 方法：

    $validated = $request->safe()->merge(['name' => 'Taylor Otwell']);

如果您想将经过验证的数据作为 [collection](/docs/laravel/9.x/collections) 实例检索，您可以调用 `collect` 方法：

    $collection = $request->safe()->collect();

<a name="working-with-error-messages"></a>
## 处理错误信息

通过 `Validator` 实例调用 `errors` 方法，它会返回一个 `Illuminate\Support\MessageBag` 实例，该实例包含了各种可以很方便地处理错误信息的方法。并自动给所有视图提供 `$errors` 变量，也是 `MessageBag` 类的一个实例。



<a name="retrieving-the-first-error-message-for-a-field"></a>
#### 检索特定字段的第一个错误信息

您可以使用 `first` 方法检索给定字段的第一个错误信息：

    $errors = $validator->errors();

    echo $errors->first('email');

<a name="retrieving-all-error-messages-for-a-field"></a>
#### 检索特定字段的所有错误信息

您可以使用 `get` 方法检索给定字段所有信息的数组：

    foreach ($errors->get('email') as $message) {
        //
    }

如果要验证表单的数组字段，您可以使用 `*` 字符来获取每一个数组元素的所有错误信息：

    foreach ($errors->get('attachments.*') as $message) {
        //
    }

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### 检索所有字段的所有错误信息

您可以使用 all 方法获取所有字段的所有错误信息的数组：

    foreach ($errors->all() as $message) {
        //
    }

<a name="determining-if-messages-exist-for-a-field"></a>
#### 判断特定字段是否含有错误信息

`has` 方法可用于判断给定字段是否包含任何错误信息：

    if ($errors->has('email')) {
        //
    }

<a name="specifying-custom-messages-in-language-files"></a>
### 在语言文件中指定自定义消息

Laravel 的内置验证规则每个都对应一个错误消息，位于应用程序的 `lang/en/validation.php` 文件中。在此文件中，您将找到每个验证规则的翻译条目。您可以根据应用程序的需求随意更改或修改这些消息。

此外，您可以将此文件复制到另一个翻译语言目录中，以翻译应用程序语言的消息。要了解有关 Laravel 本地化的更多信息，请查看完整的[本地化文档](/docs/laravel/9.x/localization)。



<a name="custom-messages-for-specific-attributes"></a>
#### 特定属性的自定义消息

您可以在应用程序的验证语言文件中自定义用于指定属性和规则组合的错误消息。为此，请将消息自定义项添加到应用程序的 `lang/xx/validation.php` 语言文件的 `custom` 数组中：

    'custom' => [
        'email' => [
            'required' => 'We need to know your email address!',
            'max' => 'Your email address is too long!'
        ],
    ],

<a name="specifying-attribute-in-language-files"></a>
### 在语言文件中指定属性

Laravel 的许多内置错误消息都包含一个 `:attribute：` 占位符，该占位符已被验证中的字段或属性的名称替换。如果您希望将验证消息的 `:attribute` 部分替换为自定义值，则可以在 `lang/xx/validation.php` 语言文件的 `attributes` 数组中指定自定义属性名称：

    'attributes' => [
        'email' => 'email address',
    ],

<a name="specifying-values-in-language-files"></a>
### 在语言文件中指定值

Laravel 的一些内置验证规则错误消息中包含一个 `:value` 占位符，该占位符被 request 属性的当前值替换。但是，有时你可能需要将验证消息的 `:value` 部分替换为该值的自定义表示形式。例如，考虑以下规则，该规则指定如果 `payment_type` 的值为 `cc`，则要求提供信用卡号：

    Validator::make($request->all(), [
        'credit_card_number' => 'required_if:payment_type,cc'
    ]);

如果此验证规则失败，将产生以下错误消息：

```none
The credit card number field is required when payment type is cc.
```



你可以通过定义 `values` 数组在 `lang/xx/validation.php` 语言文件中指定更用户友好的提示，而不是将 `cc` 显示为支付类型值：

    'values' => [
        'payment_type' => [
            'cc' => 'credit card'
        ],
    ],

定义了 values 后，验证规则将产生以下错误消息：

```none
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## 可用的验证规则

下方列出了所有可用的验证规则及其功能：

<style>
    .collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Active URL](#rule-active-url)
[After (Date)](#rule-after)
[After Or Equal (Date)](#rule-after-or-equal)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Array](#rule-array)
[Bail](#rule-bail)
[Before (Date)](#rule-before)
[Before Or Equal (Date)](#rule-before-or-equal)
[Between](#rule-between)
[Boolean](#rule-boolean)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Dimensions (Image Files)](#rule-dimensions)
[Distinct](#rule-distinct)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude Without](#rule-exclude-without)
[Exists (Database)](#rule-exists)
[File](#rule-file)
[Filled](#rule-filled)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Image (File)](#rule-image)
[In](#rule-in)
[In Array](#rule-in-array)
[Integer](#rule-integer)
[IP Address](#rule-ip)
[MAC Address](#rule-mac)
[JSON](#rule-json)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Min](#rule-min)
[Multiple Of](#multiple-of)
[Not In](#rule-not-in)
[Not Regex](#rule-not-regex)
[Nullable](#rule-nullable)
[Numeric](#rule-numeric)
[Password](#rule-password)
[Present](#rule-present)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Regular Expression](#rule-regex)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Same](#rule-same)
[Size](#rule-size)
[Sometimes](#validating-when-present)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Timezone](#rule-timezone)
[Unique (Database)](#rule-unique)
[URL](#rule-url)
[UUID](#rule-uuid)

</div>



<a name="rule-accepted"></a>
#### accepted

待验证字段必须是 `yes` ，`on` ，`1` 或 `true`。这对于验证「服务条款」的接受或类似字段时很有用。

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

如果另一个正在验证的字段等于指定的值，则验证中的字段必须为 `yes` ，`on` ，`1` 或 `true`。 这对于验证「服务条款」接受或类似字段很有用。

<a name="rule-active-url"></a>
#### active_url

根据 `dns_get_record` PHP 函数，验证中的字段必须具有有效的 A 或 AAAA 记录。 提供的 URL 的主机名使用 `parse_url` PHP 函数提取，然后传递给 `dns_get_record`。

<a name="rule-after"></a>
#### after:_date_

验证中的字段必须是给定日期之后的值。日期将被传递给 `strtotime` PHP 函数中，以便转换为有效的 `DateTime` 实例：

    'start_date' => 'required|date|after:tomorrow'

你也可以指定另一个要与日期比较的字段，而不是传递要由 strtotime 处理的日期字符串：

    'finish_date' => 'required|date|after:start_date'

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

待验证字段的值对应的日期必须在给定日期之后或与给定的日期相同。可参阅 [after](#rule-after) 规则获取更多信息。

<a name="rule-alpha"></a>
#### alpha

待验证字段只能由字母组成。

<a name="rule-alpha-dash"></a>
#### alpha_dash

待验证字段可以含有字母、数字，短破折号（-）和下划线（_）。



<a name="rule-alpha-num"></a>
#### alpha_num

待验证字段只能由字母和数字组成。

<a name="rule-array"></a>
#### array

待验证字段必须是有效的 PHP 数组。

当向 `array` 规则提供附加值时，输入数组中的每个键都必须出现在提供给规则的值列表中。在以下示例中，输入数组中的 `admin` 键无效，因为它不包含在提供给 `array` 规则的值列表中：

    use Illuminate\Support\Facades\Validator;

    $input = [
        'user' => [
            'name' => 'Taylor Otwell',
            'username' => 'taylorotwell',
            'admin' => true,
        ],
    ];

    Validator::make($input, [
        'user' => 'array:username,locale',
    ]);

通常，你应该始终指定允许出现在数组中的数组键。

<a name="rule-bail"></a>
#### bail

在首次验证失败后立即终止验证。

虽然 `bail` 规则只会在遇到验证失败时停止验证特定字段，但 `stopOnFirstFailure` 方法会通知验证器，一旦发生单个验证失败，它应该停止验证所有属性：

    if ($validator->stopOnFirstFailure()->fails()) {
        // ...
    }

<a name="rule-before"></a>
#### before:_date_

待验证字段的值对应的日期必须在给定的日期之前。日期将会传递给 PHP 函数 `strtotime`。此外，与 [`after`](#rule-after) 规则一致，可以将另外一个待验证的字段作为 `date` 的值。
 
<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_



待验证字段的值对应的日期必须在给定的日期之前。日期将会传递给 PHP 函数 `strtotime`。此外，与 [`after`](#rule-after)规则一致，可以将另外一个待验证的字段作为 `date` 的值。 

<a name="rule-between"></a>
#### between:_min_,_max_

验证字段的大小必须在给定的 min 和 max 之间。字符串、数字、数组和文件的计算方式都使用 [`size`](#rule-size) 方法。

<a name="rule-boolean"></a>
#### boolean

验证的字段必须可以转换为 Boolean 类型。 可接受的输入为 `true`, `false`, `1`, `0`, `"1"`, 和 `"0"`。

<a name="rule-confirmed"></a>
#### confirmed

confirmed可以验证密码和确认密码是否相同，验证字段必须具有匹配字段 `{field}_confirmation` 。例如，验证字段为 `password` ，输入中必须存在与之匹配的 `password_confirmation` 字段。

<a name="rule-current-password"></a>
#### current_password

验证字段必须与已验证用户的密码匹配。 您可以使用规则的第一个参数指定 [authentication guard](/docs/laravel/9.x/authentication#eaa0d4)：

    'password' => 'current_password:api'

<a name="rule-date"></a>
#### date

根据 PHP `strtotime` 函数，验证的字段必须是有效的日期。

<a name="rule-date-equals"></a>
#### date_equals:_date_

验证字段必须等于给定日期。日期将传递到 PHP `strtotime` 函数中，以便转换为有效的 `DateTime` 实例。

<a name="rule-date-format"></a>


#### date_format:_format_

验证字段必须匹配给定的 _format_ （日期格式）。当验证某个字段的时候，你应该只使用 `date`  或者 `date_format`  **其中一个** ，而不是同时使用。此验证规则支持 PHP 所有的 [DateTime](https://www.php.net/manual/en/class.datetime.php) 类。

<a name="rule-declined"></a>
#### declined

正在验证的字段必须是 `"no"`，`"off"`，`0`或者 `false`。

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

正在验证的字段必须是 `"no"`，`"off"`，`0`或者 `false`。 如果正在验证的另一个字段等于指定值。

<a name="rule-different"></a>
#### different:_field_

验证的字段值必须与字段 _field_ 的值不同。

<a name="rule-digits"></a>
#### digits:_value_

验证的字段必须为 _numeric_ ，并且必须具有确切长度 _value_ 。

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

验证的字段必须为 _numeric_ ，并且长度必须在给定的 _min_ 和 _max_ 之间。

<a name="rule-dimensions"></a>
#### dimensions

验证的文件必须是图片并且图片比例必须符合规则:

    'avatar' => 'dimensions:min_width=100,min_height=200'

可用的规则为: _min\_width_ ，_max\_width_ ，_min\_height_ ，_max\_height_ ，_width_ ，_height_ ，_ratio_ 。

 _ratio_ 约束应该表示为宽度除以高度。 这可以通过像 `3/2` 这样的语句或像 `1.5`这样的 `float` 来指定：

    'avatar' => 'dimensions:ratio=3/2'

由于此规则需要多个参数，因此你可以 `Rule::dimensions` 方法来构造可读性高的规则：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'avatar' => [
            'required',
            Rule::dimensions()->maxWidth(1000)->maxHeight(500)->ratio(3 / 2),
        ],
    ]);



<a name="rule-distinct"></a>
#### distinct

验证数组时，指定的字段不能有任何重复值：

    'foo.*.id' => 'distinct'

Distinct 默认使用松散的变量比较。要使用严格比较，您可以将`strict`参数添加到验证规则定义中：

    'foo.*.id' => 'distinct:strict'

你可以在验证规则的参数中添加 `ignore_case` ，以使规则忽略大小写差异：

    'foo.*.id' => 'distinct:ignore_case'

<a name="rule-email"></a>
#### email

验证的字段必须符合 `e-mail` 地址格式。当前版本，此种验证规则由[`egulias/email-validator`](https://github.com/egulias/EmailValidator) 提供支持。默认情况下，使用 `RFCValidation` 验证样式，但你也可以应用其他验证样式：

    'email' => 'email:rfc,dns'

上面的示例将应用 `RFCValidation` 和 `DNSCheckValidation` 验证。以下是你可以应用的验证样式的完整列表：

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation`
- `strict`: `NoRFCWarningsValidation`
- `dns`: `DNSCheckValidation`
- `spoof`: `SpoofCheckValidation`
- `filter`: `FilterEmailValidation`

</div>

当下版本 `filter` 验证规则使用 PHP 的 `filter_var` 方法进行验证，在 5.8 版本接入 Laravel 。

> 注意： `dns` 和 `spoof` 验证器需要PHP的 `intl` 扩展。

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

被验证的字段必须以给定值之一结尾。

<a name="rule-enum"></a>
#### enum

`Enum` 规则是一个基于类的规则，验证指定的字段是否包含一个有效的枚举值。`Enum` 规则接受枚举的名称作为其唯一的构造函数参数：

    use App\Enums\ServerStatus;
    use Illuminate\Validation\Rules\Enum;

    $request->validate([
        'status' => [new Enum(ServerStatus::class)],
    ]);

> 注意：枚举仅适用于PHP 8.1+。



<a name="rule-exclude"></a>
#### exclude

`validate` 和 `validated` 方法中将会排除掉当前验证的字段。

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

如果 _anotherfield_ 等于 _value_ ，`validate` 和 `validated` 方法中会排除掉当前的字段。

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

除非 _anotherfield_ 等于 _value_ ，否则 `validate` 和 `validated` 方法中会排除掉当前的字段。如果 _value_ 为 `null` （`exclude_unless:name,null`），那么成立的条件就是被比较的字段（对应规则中的 `name` ）为 `null` 或者表单中没有该字段（对应规则中的 `name` ）。

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

如果 _anotherfield_ 不在表单数据中，`validate` 和 `validated` 方法中会排除掉当前的字段。

<a name="rule-exists"></a>
#### exists:_table_,_column_

验证的字段值必须存在于指定的表中。

<a name="basic-usage-of-exists-rule"></a>
#### Exists 规则的基本用法

    'state' => 'exists:states'

如果未指定 `column` 选项，则将使用字段名称。因此，在这种情况下，该规则将验证 `states` 数据库表是否包含一条记录，该记录的 `state` 列的值与请求的 `state` 属性值匹配。

<a name="specifying-a-custom-column-name"></a>
#### 指定自定义列名

你可以将验证规则使用的数据库列名称指定在数据库表名称之后：

    'state' => 'exists:states,abbreviation'



有时候，你或许需要去明确指定一个具体的数据库连接，用于`exists`查询。你可以通过在表名前面添加一个连接名称来实现这个效果。

    'email' => 'exists:connection.staff,email'

你可以明确指定 Eloquent 模型，这个模型将被用来确定表名，这样可以代替直接指定表名的方式。

    'user_id' => 'exists:App\Models\User,id'

如果你想要自定义一个执行查询的验证规则，你可以使用 `Rule` 类去流畅地定义规则。在这个例子中，我们也将指定验证规则为一个数组，而不再是使用 `|` 分割他们：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::exists('staff')->where(function ($query) {
                return $query->where('account_id', 1);
            }),
        ],
    ]);

<a name="rule-file"></a>
#### file

要验证的字段必须是一个成功的已经上传的文件。

<a name="rule-filled"></a>
#### filled

当字段存在时，要验证的字段必须是一个非空的。

<a name="rule-gt"></a>
#### gt:_field_

要验证的字段必须要大于被给的字段。这两个字段必须是同一个类型。字符串、数字、数组和文件都使用 [`size`](#rule-size) 进行相同的评估。

<a name="rule-gte"></a>
#### gte:_field_

要验证的字段必须要大于或等于被给的字段。这两个字段必须是同一个类型。字符串、数字、数组和文件都使用 [`size`](#rule-size) 进行相同的评估。


<a name="rule-image"></a>
#### image

正在验证的文件必须是图像（jpg、jpeg、png、bmp、gif、svg 或 webp）。

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

验证字段必须包含在给定的值列表中。由于此规则通常要求你 `implode` 数组，因此可以使用`Rule::in` 方法来流畅地构造规则：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'zones' => [
            'required',
            Rule::in(['first-zone', 'second-zone']),
        ],
    ]);

当 `in` 规则与 `array` 规则结合使用时，输入数组中的每个值都必须出现在提供给 `in` 规则的值列表中。 在以下示例中，输入数组中的「LAS」机场代码无效，因为它不包含在提供给 `in` 规则的机场列表中：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    $input = [
        'airports' => ['NYC', 'LAS'],
    ];

    Validator::make($input, [
        'airports' => [
            'required',
            'array',
            Rule::in(['NYC', 'LIT']),
        ],
    ]);

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*

正在验证的字段必须存在于_anotherfield_ 的值中。

<a name="rule-integer"></a>
#### integer

验证字段必须是整数。

> 注意：此验证规则不会验证输入是否为“整数”变量类型，仅验证输入是否为 PHP 的 `FILTER_VALIDATE_INT` 规则所接受的类型。 如果您需要将输入验证为数字，请将此规则与 [`numeric` 验证规则](#rule-numeric) 结合使用。

<a name="rule-ip"></a>
#### ip



验证的字段必须是 IP 地址。

<a name="ipv4"></a>
#### ipv4

验证的字段必须是 IPv4 地址。

<a name="ipv6"></a>
#### ipv6

验证的字段必须是 IPv6 地址。

<a name="rule-mac"></a>
#### mac_address

验证字段必须是 MAC 地址。

<a name="rule-json"></a>
#### json

验证的字段必须是有效的 JSON 字符串。

<a name="rule-lt"></a>
#### lt:_field_

验证的字段必须小于给定的字段。这两个字段必须是相同的类型。字符串、数值、数组和文件大小的计算方式与  [`size`](#rule-size) 方法进行评估。

<a name="rule-lte"></a>
#### lte:_field_

验证中的字段必须小于或等于给定的字段 。这两个字段必须是相同的类型。字符串、数值、数组和文件大小的计算方式与 [`size`](#rule-size) 方法进行评估。

<a name="rule-max"></a>
#### max:_value_

验证中的字段必须小于或等于 _value_ 。字符串、数字、数组或是文件大小的计算方式都用 [`size`](#rule-size) 规则。

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

验证的文件必须具备与列出的其中一个扩展相匹配的 MIME 类型：

    'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'

为了确定上传文件的 MIME，框架将会读取文件，然后自动推测文件 MIME 类型，这可能与客户端提供的 MIME 类型不一致。



<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

验证的文件必须具有与列出的其中一个扩展名相对应的 MIME 类型。

<a name="basic-usage-of-mime-rule"></a>
#### MIME 规则基本用法

    'photo' => 'mimes:jpg,bmp,png'

即使你可能只需要验证指定扩展名，但此规则实际上会去验证文件的 MIME 类型，其通过读取文件内容来推测它的 MIME 类型。可以在以下链接中找到完整的 MIME 类型列表及相对应的扩展名：

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="rule-min"></a>
#### min:_value_

验证字段必须具有最小值 _value_ 。字符串，数值，数组，文件大小的计算方式都与  [`size`](#rule-size) 规则一致。

<a name="multiple-of"></a>
#### multiple_of:_value_

验证字段必须是 _value_ 的倍数。

> 注意：使用 `multiple_of` 规则时，需要安装 [`bcmath` PHP 扩展](https://www.php.net/manual/en/book.bc.php) 

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

验证字段不能包含在给定的值的列表中。 使用 `Rule::notIn` 方法可以更流畅的构建这个规则：

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'toppings' => [
            'required',
            Rule::notIn(['sprinkles', 'cherries']),
        ],
    ]);

<a name="rule-not-regex"></a>
#### not_regex:_pattern_

验证字段必须与给定的正则表达式不匹配。

验证时，这个规则使用 PHP `preg_match` 函数。指定的模式应遵循 `preg_match` 所需的相同格式，也包括有效的分隔符。 例如： `'email' => 'not_regex:/^.+$/i'`。

> 注意：当使用 `regex` / `not_regex` 模式时， 可能需要在数组中指定规则，而不是使用 `|` 分隔符 ，特别是在正则表达式包含 `|` 字符 的情况下。



<a name="rule-nullable"></a>
#### nullable

验证字段可以为 `null`。

<a name="rule-numeric"></a>
#### numeric

验证字段必须为 [数值](https://www.php.net/manual/en/function.is-numeric.php)。

<a name="rule-password"></a>
#### password

验证字段必须与当前登录用户的密码相同。

> 注意：此规则已重命名为 `current_password` ，目的是在 Laravel 9 中将其删除。请改用 [当前密码](#rule-current-password) 规则。

<a name="rule-present"></a>
#### present

验证字段必须存在于输入数据中，但可以为空。

<a name="rule-prohibited"></a>
#### prohibited

验证字段必须为空或不存在。

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

如果 _anotherfield_ 字段等于任何值，则验证中的字段必须为空或不存在。

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

验证中的字段必须为空或不存在，除非 _anotherfield_ 字段等于 _value_ 。

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

如果验证中的字段存在，则 _anotherfield_ 中不能存在任何字段，即使该字段为空。

<a name="rule-regex"></a>
#### regex:_pattern_

验证字段必须与给定的正则表达式匹配。

验证时，这个规则使用 PHP 的 `preg_match`  函数。 指定的模式应遵循 `preg_match` 所需的相同格式，也包括有效的分隔符。 例如： `'email' => 'regex:/^.+@.+$/i'`.

> 注意：当使用  `regex` / `not_regex` 模式时， 可能需要在数组中指定规则，而不是使用 `|` 分隔符 ，特别是在正则表达式包含 `|` 字符 的情况下。



<a name="rule-required"></a>
#### required

验证中的字段必须存在于输入数据中，并且不能为空。如果以下条件之一为真，则字段被视为「空」：

<div class="content-list" markdown="1">

- 值为 `null`。
- 该值为空字符串。
- 该值是一个空数组或空的 `Countable` 对象。
- 该值是一个没有路径的上传文件。

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

如果 _anotherfield_ 字段等于任何 _value_ ，则验证中的字段必须存在且不为空。

如果你想为 `required_if` 规则构造一个更复杂的条件，你可以使用 `Rule::requiredIf` 方法。 此方法接受布尔值或闭包。 当传递一个闭包时，闭包应该返回 `true` 或 `false` 以指示是否需要验证字段：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($request->all(), [
        'role_id' => Rule::requiredIf($request->user()->is_admin),
    ]);

    Validator::make($request->all(), [
        'role_id' => Rule::requiredIf(function () use ($request) {
            return $request->user()->is_admin;
        }),
    ]);

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

除非_anotherfield_ 字段等于任何 _value_ ，否则验证中的字段必须存在且不为空。 这也意味着 _anotherfield_ 必须存在于请求数据中，除非 _value_ 为 `null`。 如果 _value_ 为 `null` (`required_unless:name,null`)，则需要验证的字段，除非比较字段为 `null` 或请求数据中缺少比较字段。



<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

仅当任何指定的字段存在且不为空时，验证下的字段才必须存在且不为空。

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

仅当所有指定的字段存在且不为空时，验证下的字段才必须存在且不为空。

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

仅当任何指定的字段不存在或为空时，验证下的字段才必须存在且不为空。

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

仅当所有指定的字段不存在或为空时，验证下的字段才必须存在且不为空。

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

验证的字段必须是一个数组，并且必须至少包含指定的键。

<a name="rule-same"></a>
#### same:_field_

给定的 _field_ 必须与正在验证的字段匹配。

<a name="rule-size"></a>
#### size:_value_

验证字段的大小必须与给定的 _value_ 匹配。对于字符串数据，_value_ 对应于字符数。 对于数字数据，_value_ 对应于给定的整数值（属性还必须具有 `numeric` 或 `integer` 规则）。 对于数组，_size_ 对应于数组的 `count`。 对于文件，_size_ 对应于以千字节为单位的文件大小。 让我们看一些例子：

    // 验证一个字符串是否正好是 12 个字符长...
    'title' => 'size:12';

    // 验证提供的整数是否等于 10...
    'seats' => 'integer|size:10';

    // 验证一个数组正好有 5 个元素...
    'tags' => 'array|size:5';

    // 验证上传的文件是否正好为 512 KB...
    'image' => 'file|size:512';



<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

验证字段必须以给定值之一开头。

<a name="rule-string"></a>
#### string

验证字段必须是字符串。 如果您想允许该字段也为 `null`，则应为该字段分配 `nullable` 规则。

<a name="rule-timezone"></a>
#### timezone

根据 `timezone_identifiers_list` PHP 函数，验证中的字段必须是有效的时区标识符。

<a name="rule-unique"></a>
#### unique:_table_,_column_

验证中的字段不能存在于给定的数据库表中。

**指定自定义表/列名称：**

您可以指定 Eloquent 模型来确定表名，而不是直接指定表名：

    'email' => 'unique:App\Models\User,email_address'

`column` 选项可用于指定字段对应的数据库列。 如果未指定 `column` 选项，将使用正在验证的字段的名称。

    'email' => 'unique:users,email_address'

**指定自定义数据库连接**

有时，您可能需要为验证器进行的数据库查询设置自定义连接。 为此，您可以将连接名称添加到表名称之前：

    'email' => 'unique:connection.users,email_address'

**强制唯一规则忽略给定 ID：**

有时，您可能希望在唯一验证期间忽略给定的 ID。 例如，考虑一个包含用户姓名、电子邮件地址和位置的“更新个人资料”屏幕。 您可能需要验证电子邮件地址是否唯一。 但是，如果用户只更改名称字段而不更改电子邮件字段，则您不希望引发验证错误，因为用户已经是相关电子邮件地址的所有者。



为了指示验证器忽略用户 ID，我们将使用 `Rule` 类来流畅地定义规则。 在这个例子中，我们还将验证规则指定为一个数组，而不是使用 `|` 字符来分隔规则：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::unique('users')->ignore($user->id),
        ],
    ]);

> 注意：你不应该将任何用户控制的请求输入传递给 `ignore` 方法。相反，您应该只传递系统生成的唯一 ID，例如来自 Eloquent 模型实例的自动递增 ID 或 UUID。否则，您的应用程序将容易受到 SQL 注入攻击。

除了将模型键的值传递给 `ignore` 方法，您还可以传递整个模型实例。 Laravel 会自动从模型中提取密钥：

    Rule::unique('users')->ignore($user)

如果您的表使用 `id` 以外的主键列名，则可以在调用 `ignore` 方法时指定列名：

    Rule::unique('users')->ignore($user->id, 'user_id')

默认情况下，`unique` 规则将检查与正在验证的属性名称匹配的列的唯一性。但是，您可以将不同的列名作为第二个参数传递给 `unique` 方法：

    Rule::unique('users', 'email_address')->ignore($user->id),

**添加额外的 Where 子句：**

您可以通过使用 `where` 方法自定义查询来指定其他查询条件。例如，让我们添加一个查询条件，将查询范围限定为仅搜索 `account_id` 列值为 `1` 的记录：

    'email' => Rule::unique('users')->where(function ($query) {
        return $query->where('account_id', 1);
    })



<a name="rule-url"></a>
#### url

验证字段必须是有效的 URL。

<a name="rule-uuid"></a>
#### uuid

验证字段必须是有效的 RFC 4122（版本 1、3、4 或 5）通用唯一标识符 (UUID)。

<a name="conditionally-adding-rules"></a>
## 有条件地添加规则

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### 当字段具有特定值时跳过验证

如果另一个字段具有给定值，您有时可能希望不验证给定字段。 您可以使用 `exclude_if` 验证规则来完成此操作。 在此示例中，如果 `has_appointment` 字段的值为 `false`，则不会验证 `appointment_date` 和 `doctor_name` 字段：

    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($data, [
        'has_appointment' => 'required|boolean',
        'appointment_date' => 'exclude_if:has_appointment,false|required|date',
        'doctor_name' => 'exclude_if:has_appointment,false|required|string',
    ]);

或者，您可以使用 `exclude_unless` 规则不验证给定字段，除非另一个字段具有给定值：

    $validator = Validator::make($data, [
        'has_appointment' => 'required|boolean',
        'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
        'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
    ]);

<a name="validating-when-present"></a>
#### 验证是否存在

在某些情况下，您可能希望**仅**如果该字段存在于正在验证的数据中，则对该字段运行验证检查。 要快速完成此操作，请将 `sometimes` 规则添加到您的规则列表中：

    $v = Validator::make($data, [
        'email' => 'sometimes|required|email',
    ]);

在上面的示例中，只有在 `$data` 数组中存在 `email` 字段时才会对其进行验证。

> 技巧：如果您尝试验证应始终存在但可能为空的字段，请查看 [关于可选字段的此注释](#a-note-on-optional-fields)。



<a name="complex-conditional-validation"></a>
#### 复杂的条件验证

有时您可能希望基于更复杂的条件逻辑添加验证规则。例如，您可能希望仅当另一个字段的值大于 100 时才需要给定字段。或者，您可能需要两个字段才能仅在另一个字段存在时才具有给定值。 添加这些验证规则并不一定很痛苦。首先，使用您的 _静态规则_ 创建一个永远不会改变的 `Validator` 实例：

    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'games' => 'required|numeric',
    ]);

假设我们的 Web 应用程序是面向游戏收藏家的。如果游戏收藏家在我们的应用程序中注册并且他们拥有超过 100 款游戏，我们希望他们解释为什么他们拥有这么多游戏。 例如，他们可能经营一家游戏转售店，或者他们只是喜欢收集游戏。要有条件地添加此要求，我们可以在 `Validator` 实例上使用 `sometimes` 方法。

    $validator->sometimes('reason', 'required|max:500', function ($input) {
        return $input->games >= 100;
    });

传递给 `sometimes` 方法的第一个参数是我们有条件地验证的字段的名称。 第二个参数是我们要添加的规则列表。 如果作为第三个参数传递的闭包返回 `true`，则将添加规则。 这种方法使构建复杂的条件验证变得轻而易举。 您甚至可以一次为多个字段添加条件验证：

    $validator->sometimes(['reason', 'cost'], 'required', function ($input) {
        return $input->games >= 100;
    });

> 技巧：传递给闭包的 `$input` 参数将是 `Illuminate\Support\Fluent` 的一个实例，可用于访问您的输入和正在验证的文件。



<a name="complex-conditional-array-validation"></a>
#### 复杂的条件数组验证

有时您可能希望根据同一嵌套数组中的另一个字段来验证一个字段，该数组的索引您不知道。在这些情况下，您可以允许您的闭包接收第二个参数，该参数将是正在验证的数组中的当前单个项目：

    $input = [
        'channels' => [
            [
                'type' => 'email',
                'address' => 'abigail@example.com',
            ],
            [
                'type' => 'url',
                'address' => 'https://example.com',
            ],
        ],
    ];

    $validator->sometimes('channels.*.address', 'email', function ($input, $item) {
        return $item->type === 'email';
    });

    $validator->sometimes('channels.*.address', 'url', function ($input, $item) {
        return $item->type !== 'email';
    });

与传递给闭包的 `$input` 参数一样，当属性数据是数组时，`$item` 参数是 `Illuminate\Support\Fluent` 的实例；否则，它是一个字符串。

<a name="validating-arrays"></a>
## 验证数组

正如 [`array` 验证规则文档](#rule-array) 中所讨论的，`array` 规则接受允许的数组键列表。如果数组中存在任何其他键，则验证将失败：

    use Illuminate\Support\Facades\Validator;

    $input = [
        'user' => [
            'name' => 'Taylor Otwell',
            'username' => 'taylorotwell',
            'admin' => true,
        ],
    ];

    Validator::make($input, [
        'user' => 'array:username,locale',
    ]);

通常，您应该始终指定允许出现在数组中的数组键。否则，验证器的 `validate` 和 `validated` 方法将返回所有经过验证的数据，包括数组及其所有键，即使这些键没有被其他嵌套数组验证规则验证。

<a name="validating-nested-array-input"></a>
### 验证嵌套数组输入

验证基于嵌套数组的表单输入字段并不一定很痛苦。 您可以使用“点表示法”来验证数组中的属性。 例如，如果传入的 HTTP 请求包含 `photos[profile]` 字段，您可以像这样验证它：

    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($request->all(), [
        'photos.profile' => 'required|image',
    ]);



您还可以验证数组的每个元素。例如，要验证给定数组输入字段中的每封电子邮件是否唯一，您可以执行以下操作：

    $validator = Validator::make($request->all(), [
        'person.*.email' => 'email|unique:users',
        'person.*.first_name' => 'required_with:person.*.last_name',
    ]);

同样，在指定 [语言文件中的自定义验证消息](#custom-messages-for-specific-attributes) 时，您可以使用 `*` 字符，从而轻松为基于数组的字段使用单个验证消息：

    'custom' => [
        'person.*.email' => [
            'unique' => 'Each person must have a unique email address',
        ]
    ],

<a name="accessing-nested-array-data"></a>
#### 访问嵌套数组数据

有时，在为属性分配验证规则时，您可能需要访问给定嵌套数组元素的值。您可以使用 `Rule::foreEach` 方法完成此操作。 `forEach` 方法接受一个闭包，该闭包将为验证中的数组属性的每次迭代调用，并将接收属性的值和显式的、完全扩展的属性名称。闭包应该返回一个规则数组来分配给数组元素：

    use App\Rules\HasPermission;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    $validator = Validator::make($request->all(), [
        'companies.*.id' => Rule::forEach(function ($value, $attribute) {
            return [
                Rule::exists(Company::class, 'id'),
                new HasPermission('manage-company', $value),
            ];
        }),
    ]);

<a name="validating-passwords"></a>
## 验证密码

为确保密码具有足够的复杂性，您可以使用 Laravel 的 `password` 规则对象：

    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rules\Password;

    $validator = Validator::make($request->all(), [
        'password' => ['required', 'confirmed', Password::min(8)],
    ]);

`Password` 规则对象允许您轻松自定义应用程序的密码复杂性要求，例如指定密码至少需要一个字母、数字、符号或混合大小写的字符：

    // 至少需要 8 个字符...
    Password::min(8)

    // 至少需要一个字母...
    Password::min(8)->letters()

    // 至少需要一个大写字母和一个小写字母...
    Password::min(8)->mixedCase()

    // 至少需要一个数字...
    Password::min(8)->numbers()

    // 至少需要一个符号...
    Password::min(8)->symbols()



此外，您可以使用 `uncompromised` 方法确保密码没有在公共密码数据泄露事件中被泄露：

    Password::min(8)->uncompromised()

在内部，`Password` 规则对象使用 [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) 模型来确定密码是否已通过 [haveibeenpwned.com](https://haveibeenpwned.com) 服务而不牺牲用户的隐私或安全。

默认情况下，如果密码在数据泄露中至少出现一次，则会被视为已泄露。您可以使用 `uncompromised` 方法的第一个参数自定义此阈值：

    // 确保密码在同一数据泄露中出现少于 3 次...
    Password::min(8)->uncompromised(3);

当然，您可以将上面示例中的所有方法链接起来：

    Password::min(8)
        ->letters()
        ->mixedCase()
        ->numbers()
        ->symbols()
        ->uncompromised()

<a name="defining-default-password-rules"></a>
#### 定义默认密码规则

您可能会发现在应用程序的单个位置指定密码的默认验证规则很方便。 您可以使用接受闭包的 `Password::defaults` 方法轻松完成此操作。 给`defaults` 方法的闭包应该返回密码规则的默认配置。 通常，应该在应用程序的服务提供者之一的 `boot` 方法中调用 `defaults` 规则：

```php
use Illuminate\Validation\Rules\Password;

/**
 * 引导任何应用程序服务。
 *
 * @return void
 */
public function boot()
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
                    ? $rule->mixedCase()->uncompromised()
                    : $rule;
    });
}
```

然后，当您想将默认规则应用于正在验证的特定密码时，您可以调用不带参数的 `defaults` 方法：

    'password' => ['required', Password::defaults()],



有时，您可能希望将其他验证规则附加到默认密码验证规则。 您可以使用 `rules` 方法来完成此操作：

    use App\Rules\ZxcvbnRule;

    Password::defaults(function () {
        $rule = Password::min(8)->rules([new ZxcvbnRule]);

        // ...
    });

<a name="custom-validation-rules"></a>
## 自定义验证规则

<a name="using-rule-objects"></a>
### 使用规则对象

Laravel 提供了各种有用的验证规则； 但是，您可能希望指定一些您自己的。 注册自定义验证规则的一种方法是使用规则对象。 要生成新的规则对象，您可以使用 `make:rule` Artisan 命令。 让我们使用这个命令生成一个验证字符串是否为大写的规则。 Laravel 会将新规则放在 `app/Rules` 目录中。 如果此目录不存在，Laravel 将在您执行 Artisan 命令创建规则时创建它：

```shell
php artisan make:rule Uppercase
```

创建规则后，我们就可以定义其行为了。 一个规则对象包含两个方法：`passes` 和 `message`。 `passes` 方法接收属性值和名称，应该根据属性值是否有效返回 `true` 或 `false`。 `message` 方法应该返回验证失败时应该使用的验证错误消息：

    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\Rule;

    class Uppercase implements Rule
    {
        /**
         * 确定验证规则是否通过。
         *
         * @param  string  $attribute
         * @param  mixed  $value
         * @return bool
         */
        public function passes($attribute, $value)
        {
            return strtoupper($value) === $value;
        }

        /**
         * 获取验证错误消息。
         *
         * @return string
         */
        public function message()
        {
            return 'The :attribute must be uppercase.';
        }
    }



如果您想从翻译文件中返回错误消息，您可以从您的 `message` 方法中调用 `trans` 助手：

    /**
     * 获取验证错误消息。
     *
     * @return string
     */
    public function message()
    {
        return trans('validation.uppercase');
    }

定义规则后，您可以通过将规则对象的实例与其他验证规则一起传递来将其附加到验证器：

    use App\Rules\Uppercase;

    $request->validate([
        'name' => ['required', 'string', new Uppercase],
    ]);

#### 访问附加数据

如果您的自定义验证规则类需要访问所有其他正在验证的数据，您的规则类可以实现 `Illuminate\Contracts\Validation\DataAwareRule` 接口。这个接口需要你的类定义一个 `setData` 方法。Laravel 将自动调用此方法（在验证进行之前），`$data` 包含所有即将验证的数据：

    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\Rule;
    use Illuminate\Contracts\Validation\DataAwareRule;

    class Uppercase implements Rule, DataAwareRule
    {
        /**
         * 即将进行验证的所有数据
         *
         * @var array
         */
        protected $data = [];

        // ...

        /**
         * 设置即将进行验证的所有数据。
         *
         * @param  array  $data
         * @return $this
         */
        public function setData($data)
        {
            $this->data = $data;

            return $this;
        }
    }

或者，如果您的验证规则需要访问执行验证的验证器实例，您可以实现 `ValidatorAwareRule` 接口：

    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\Rule;
    use Illuminate\Contracts\Validation\ValidatorAwareRule;

    class Uppercase implements Rule, ValidatorAwareRule
    {
        /**
         * 验证器实例。
         *
         * @var \Illuminate\Validation\Validator
         */
        protected $validator;

        // ...

        /**
         * 设置当前验证器。
         *
         * @param  \Illuminate\Validation\Validator  $validator
         * @return $this
         */
        public function setValidator($validator)
        {
            $this->validator = $validator;

            return $this;
        }
    }

<a name="using-closures"></a>


### 使用闭包

如果您在整个应用程序中只需要一次自定义规则的功能，您可以使用闭包而不是规则对象。闭包接收属性的名称、属性的值和一个在验证失败时应该调用的 `$fail` 回调：

    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($request->all(), [
        'title' => [
            'required',
            'max:255',
            function ($attribute, $value, $fail) {
                if ($value === 'foo') {
                    $fail('The '.$attribute.' is invalid.');
                }
            },
        ],
    ]);

<a name="implicit-rules"></a>
### 隐式规则

默认情况下，当正在验证的属性不存在或包含空字符串时，不会运行正常的验证规则，包括自定义规则。例如，[`unique`](#rule-unique) 规则不会针对空字符串运行：

    use Illuminate\Support\Facades\Validator;

    $rules = ['name' => 'unique:users,name'];

    $input = ['name' => ''];

    Validator::make($input, $rules)->passes(); // true

要使自定义规则即使在属性为空时也能运行，该规则必须暗示该属性是必需的。要创建「隐式」规则，请实现 Illuminate\Contracts\Validation\ImplicitRule 接口。 该接口用作验证器的「标识接口」；因此，除了典型的 `Rule` 接口所需的方法之外，它不包含您需要实现的任何其他方法。

要生成新的隐式规则对象，您可以使用带有 `--implicit` 选项的 `make:rule` Artisan 命令：

```shell
php artisan make:rule Uppercase --implicit
```

> 注意：「隐式」规则仅 _implicit_ 该属性是必需的。 它是否实际上使缺失或空属性无效取决于您。

