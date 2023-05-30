# 用户授权

- [简介](#introduction)
- [拦截器](#gates)
    - [编写拦截器](#writing-gates)
    - [授权动作](#authorizing-actions-via-gates)
    - [拦截器响应](#gate-responses)
    - [拦截器拦截检查](#intercepting-gate-checks)
    - [内联授权](#inline-authorization)
- [创建策略](#creating-policies)
    - [生成策略](#generating-policies)
    - [注册策略](#registering-policies)
- [编辑策略](#writing-policies)
    - [策略的模型](#policy-methods)
    - [策略的返回](#policy-responses)
    - [不使用模型的方法](#methods-without-models)
    - [访客和用户](#guest-users)
    - [策略的过滤器](#policy-filters)
- [使用策略进行授权操作](#authorizing-actions-using-policies)
    - [通过用户模型的方式](#via-the-user-model)
    - [通过控制器辅助函数的方式](#via-controller-helpers)
    - [通过中间件的方式](#via-middleware)
    - [通过前端的方式](#via-blade-templates)
    - [以附加形式提供给上下文调用的方式](#supplying-additional-context)

<a name="introduction"></a>
## 简介

除了提供内置的 [authentication](/docs/laravel/9.x/authentication) （身份验证） 服务外，Laravel 还提供了一种可以很简单就进行使用的方法，来对用户与资源的授权关系进行管理。 它很安全，即使用户已经通过了「身份验证（authentication)」, 用户也可能无权对应用程序中重要的模型或数据库记录进行删除或更改。简单、条理化的系统性，是 Laravel 对授权管理的特性。

Laravel 主要提供了两种授权操作的方法: [拦截器](#gates) 和 [策略](#creating-policies )。可以把拦截器（gates）和策略（policies）想象成路由和控制器。拦截器（Gates）提供了一种轻便的基于闭包函数的授权方法，像是路由。而策略（policies)，就像是一个控制器，对特定模型或资源，进行分组管理的逻辑规则。 在本文档中，我们将首先探讨拦截器（gates），然后研究策略（policies)。

您在构建应用程序时，不用为是仅仅使用拦截器（gates）或是仅仅使用策略（policies）而担心，并不需要在两者中进行唯一选择。大多数的应用程序都同时包含两个方法，并且同时使用两者，能够更好的进行工作。拦截器（gates），更适用于没有与任何模型或资源有关的授权操作，例如查看管理员仪表盘。与之相反，当您希望为特定的模型或资源进行授权管理时，应该使用策略（policies) 方法。



<a name="gates"></a>
## 拦截器 (Gates)

<a name="writing-gates"></a>
### 编写拦截器（Gates）

> 注意：通过理解拦截器（Gates），是一个很好的学习 Laravel 授权特性的基础知识的方法。同时，考虑到 Laravel 应用程序的健壮性，应该结合使用策略 ([policies](#creating-policies)) 来组织授权规则。

拦截器（Gates）是用来确定用户是否有权执行给定操作的闭包函数。默认条件下，拦截器（Gates）的使用，是在 `App\Providers\AuthServiceProvider` 类中的 `boot` 函数里来规定 `Gate` 规则。拦截器（Gates）始终接收用户实例为其第一个参数，并且可以选择性的接收其他参数，例如相关的 Eloquent 模型。

在下面的例子中，我们将定义一个拦截器（Gates)，并通过调用 `App\Models\Post` 类，来实现结合用户的 POST 请求，命中给定的规则。拦截器（Gates）将通过比较用户的 `id` ，和 POST 请求中的 `user_id` 来实现这个目标：

    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    /**
     * 注册任何需要身份验证、授权服务的行为
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('update-post', function (User $user, Post $post) {
            return $user->id === $post->user_id;
        });
    }

像是在控制器中操作一样，也可以直接使用类，进行回调数组，完成拦截器（Gates）的定义：

    use App\Policies\PostPolicy;
    use Illuminate\Support\Facades\Gate;

    /**
     * 注册任何需要身份验证、授权服务的行为
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('update-post', [PostPolicy::class, 'update']);
    }

<a name="authorizing-actions-via-gates"></a>
### 行为授权控制

如果需要通过拦截器（Gates）来对行为进行授权控制，您可以通过调用 `Gate` 中的 `allows` 或 `denies` 方法。请注意，在使用过程中，您不需要将已经通过身份验证的用户信息传递给这些方法。 Laravel 将会自动把用户信息传递给拦截器（Gates）。以下是一个典型的，在控制器中使用拦截器（Gates）进行行为授权控制的例子：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Gate;

    class PostController extends Controller
    {
        /**
         * 更新给定的帖子
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \App\Models\Post  $post
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, Post $post)
        {
            if (! Gate::allows('update-post', $post)) {
                abort(403);
            }

            // 更新帖子...
        }
    }



如果您需要判断某个用户，是否有权执行某个行为，您可以在 `Gate` 门面中，使用 `forUser` 方法：

    if (Gate::forUser($user)->allows('update-post', $post)) {
        // 这个用户可以提交update...
    }

    if (Gate::forUser($user)->denies('update-post', $post)) {
        // 这个用户不可以提交update...
    }

您还可以通过 `any` 或 `none` 方法来一次性授权多个行为:

    if (Gate::any(['update-post', 'delete-post'], $post)) {
        // 用户可以提交update或delete...
    }

    if (Gate::none(['update-post', 'delete-post'], $post)) {
        // 用户不可以提交update和delete...
    }

<a name="authorizing-or-throwing-exceptions"></a>
#### 未通过授权时的抛出异常

`Illuminate\Auth\Access\AuthorizationException` 中准备了 HTTP 的 403 响应。您可以使用 `Gate` 门面中的 `authorize` 方法，来规定如果用户进行了未授权的行为时，触发 `AuthorizationException` 实例 ，该实例会自动转换返回为 HTTP 的 403 响应:

    Gate::authorize('update-post', $post);

    // 行为已获授权...

<a name="gates-supplying-additional-context"></a>
#### 上下文的值传递

能够用于拦截器（Gates）的授权方法，(`allows`，`denies`，`check`，`any`，`none`， `authorize`，`can`，`cannot`) 和在前端进行的授权方法 [Blade 指令](#via-blade-templates) (`@can`，`@cannot`，`@canany`) 在第 2 个参数中，可以接收数组。这些数组元素作为参数传递给拦截器（Gates） ，在做出授权决策时可用于其他上下文:

    use App\Models\Category;
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    Gate::define('create-post', function (User $user, Category $category, $pinned) {
        if (! $user->canPublishToGroup($category->group)) {
            return false;
        } elseif ($pinned && ! $user->canPinPosts()) {
            return false;
        }

        return true;
    });

    if (Gate::check('create-post', [$category, $pinned])) {
        // 用户可以请求create...
    }



<a name="gate-responses"></a>
### 拦截器（Gates）返回（Responses）

到目前为止，我们只学习了拦截器（Gates）中返回布尔值的简单操作。但是，有时您需要的返回可能更复杂，比如错误消息。所以，您可以尝试使用 `Illuminate\Auth\Access\Response` 来构建您的拦截器（Gates）：

    use App\Models\User;
    use Illuminate\Auth\Access\Response;
    use Illuminate\Support\Facades\Gate;

    Gate::define('edit-settings', function (User $user) {
        return $user->isAdmin
                    ? Response::allow()
                    : Response::deny('You must be an administrator.');
    });

您希望从拦截器（Gates）中返回响应时，使用 `Gate::allows` 方法，将仅返回一个简单的布尔值；同时，您还可以使用 `Gate::inspect` 方法来返回拦截器（Gates）中的所有响应值：

    $response = Gate::inspect('edit-settings');

    if ($response->allowed()) {
        // 行为进行授权...
    } else {
        echo $response->message();
    }

在使用 `Gate::authorize` 方法时，如果操作未被授权，仍然会触发 `AuthorizationException` , 用户验证（authorization）响应提供的错误消息，将传递给 HTTP 响应：

    Gate::authorize('edit-settings');

    // 行为进行授权...

<a name="intercepting-gate-checks"></a>
### 拦截器（Gates）优先级

有时，您可能希望将所有权限授予特定用户。您可以使用 `before` 方法。该方法将定义该授权拦截规则，优先于所有其他授权拦截规则前执行：

    use Illuminate\Support\Facades\Gate;

    Gate::before(function ($user, $ability) {
        if ($user->isAdministrator()) {
            return true;
        }
    });

如果 `before` 返回的是非 null 结果，则该返回将会被视为最终的检查结果。

您还可以使用 `after` 方法，来定义在所有授权拦截规则执行后，再次进行授权拦截规则判定：

    Gate::after(function ($user, $ability, $result, $arguments) {
        if ($user->isAdministrator()) {
            return true;
        }
    });



类似于 `before` 方法，如果 `after` 闭包返回非空结果，则该结果将被视为授权检查的结果。

<a name="inline-authorization"></a>
### 内联授权

有时，你可能希望确定当前经过身份验证的用户是否有权执行给定操作，而无需编写与该操作对应的专用拦截器。Laravel 允许你通过 `Gate::allowIf` 和 `Gate::denyIf` 方法执行这些类型的「内联」授权检查：

```php
use Illuminate\Support\Facades\Auth;

Gate::allowIf(fn ($user) => $user->isAdministrator());

Gate::denyIf(fn ($user) => $user->banned());
```

如果该操作未授权或当前没有用户经过身份验证，Laravel 将自动抛出 `Illuminate\Auth\Access\AuthorizationException` 异常。 `AuthorizationException` 的实例会被 Laravel 的异常处理程序自动转换为 403 HTTP 响应：

<a name="creating-policies"></a>
## 新建策略

<a name="generating-policies"></a>
### 生成策略

策略是围绕特定模型或资源组织授权逻辑的类。例如，如果你的应用程序是博客，可能有一个 `App\Models\Post` 模型和一个相应的 `App\Policies\PostPolicy` 来授权用户操作，例如创建或更新帖子。

你可以使用 `make:policy` Artisan 命令生成策略。生成的策略将放置在 `app/Policies` 目录中。如果应用程序中不存在此目录，Laravel 将自动创建：

```shell
php artisan make:policy PostPolicy
```

`make:policy` 命令将生成一个空的策略类。如果要生成一个包含与查看、创建、更新和删除资源相关的示例策略方法的类，可以在执行命令时提供一个 `--model` 选项：

```shell
php artisan make:policy PostPolicy --model=Post
```



<a name="registering-policies"></a>
### 注册策略

创建了策略类之后，还需要对其进行注册。注册策略是告知 Laravel 在授权针对给定模型类型的操作时使用哪个策略。

新的 Laravel 应用程序中包含的 `App\Providers\AuthServiceProvider` 包含一个 `policies` 属性，它将 Eloquent 模型映射到其相应的策略。 注册策略将指示 Laravel 在授权针对给定 Eloquent 模型的操作时使用哪个策略：

    <?php

    namespace App\Providers;

    use App\Models\Post;
    use App\Policies\PostPolicy;
    use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
    use Illuminate\Support\Facades\Gate;

    class AuthServiceProvider extends ServiceProvider
    {
        /**
         * 应用程序的策略映射。
         *
         * @var array
         */
        protected $policies = [
            Post::class => PostPolicy::class,
        ];

        /**
         * 注册任何应用程序身份验证/授权服务。
         *
         * @return void
         */
        public function boot()
        {
            $this->registerPolicies();

            //
        }
    }

<a name="policy-auto-discovery"></a>
#### 策略自动发现

只要模型和策略遵循标准的 Laravel 命名约定，Laravel 就可以自动发现策略，而不是手动注册模型策略。具体来说，策略必须位于包含模型的目录或其上方的「Policies」目录中。 因此，例如，模型可以放置在 `app/Models` 目录中，而策略可以放置在 `app/Policies` 目录中。在这种情况下，Laravel 将检查 `app/Models/Policies` 然后 `app/Policies` 中的策略。此外，策略名称必须与模型名称匹配并具有 `Policy` 后缀。 因此，`User` 模型将对应于`UserPolicy` 策略类。

如果要自定义策略的发现逻辑，可以使用 `Gate::guessPolicyNamesUsing` 方法注册自定义策略发现回调。通常，应该从应用程序的 `AuthServiceProvider` 的 `boot` 方法调用此方法：

    use Illuminate\Support\Facades\Gate;

    Gate::guessPolicyNamesUsing(function ($modelClass) {
        // Return the name of the policy class for the given model...
    });

> 注意：在 `AuthServiceProvider` 中显式映射的任何策略将优先于任何可能自动发现的策略。



<a name="writing-policies"></a>
## 编写策略

<a name="policy-methods"></a>
### 策略方法

注册策略类后，可以为其授权的每个操作添加方法。例如，让我们在 `PostPolicy` 上定义一个 `update` 方法，该方法确定给定的 `App\Models\User` 是否可以更新给定的 `App\Models\Post` 实例。

该 `update` 方法将接收一个 `User` 和一个 `Post` 实例作为其参数，并应返回 `true` 或 `false` ，指示用户是否有权更新给定的 `Post`。因此，在本例中，我们将验证用户的 `id` 是否与 post 上的 `user_id` 匹配：

    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * 确定用户是否可以更新给定的帖子
         *
         * @param  \App\Models\User  $user
         * @param  \App\Models\Post  $post
         * @return bool
         */
        public function update(User $user, Post $post)
        {
            return $user->id === $post->user_id;
        }
    }

你可以继续根据需要为策略授权的各种操作定义其他方法。例如，你可以定义 `view` 或 `delete` 方法来授权各种与 `Post` 相关的操作，但请记住，你可以自由地为策略方法命名任何你喜欢的名称。

如果你在 Artisan 控制台生成策略时使用了 `--model` 选项，它将包含用于 `viewAny`，`view`， `create`，`update`，`delete`，`restore` 和 `forceDelete` 操作。

> 技巧：所有策略都通过 Laravel [服务容器](/docs/laravel/9.x/container) 解析，允许你在策略的构造函数中键入任何需要的依赖项，以自动注入它们。



<a name="policy-responses"></a>
### 策略响应

到目前为止，我们只检查了返回简单布尔值的策略方法。但是，有时你可能希望返回更详细的响应，包括错误消息。为此，你可以从你的策略方法返回一个 `Illuminate\Auth\Access\Response` 实例：

    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine if the given post can be updated by the user.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Auth\Access\Response
     */
    public function update(User $user, Post $post)
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::deny('You do not own this post.');
    }

当从你的策略返回授权响应时，`Gate::allows` 方法仍将返回一个简单的布尔值；但是，你可以使用 `Gate::inspect` 方法来获取返回的完整授权响应：
    use Illuminate\Support\Facades\Gate;

    $response = Gate::inspect('update', $post);

    if ($response->allowed()) {
        // The action is authorized...
    } else {
        echo $response->message();
    }

当使用 `Gate::authorize` 方法时，如果操作未被授权，该方法会抛出 `AuthorizationException`   ，授权响应提供的错误消息将传播到 HTTP 响应：

    Gate::authorize('update', $post);

    // 该操作已授权通过...

<a name="methods-without-models"></a>
### 无需传递模型的方法

一些策略方法只接收当前经过身份验证的用户实例，最常见的情况是给 `create` 方法做授权。例如，如果你正在创建一个博客，你可能希望确定一个用户是否被授权创建任何文章，在这种情况下，你的策略方法应该只期望接收一个用户实例：

    /**
     * 确定给定用户是否可以创建文件
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function create(User $user)
    {
        return $user->role == 'writer';
    }



<a name="guest-users"></a>
### Guest 用户

默认情况下，如果传入的 HTTP 请求不是经过身份验证的用户发起的，那么所有的拦截器（gates）和策略（policies）会自动返回 `false` 。但是，你可以通过声明一个「optional」类型提示或为用户参数定义提供一个 `null` 默认值，从而允许这些授权检查通过你的拦截器（gates）和策略（policies）：

    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * 确定用户是否可以更新给定的文章
         *
         * @param  \App\Models\User  $user
         * @param  \App\Models\Post  $post
         * @return bool
         */
        public function update(?User $user, Post $post)
        {
            return optional($user)->id === $post->user_id;
        }
    }

<a name="policy-filters"></a>
### 策略过滤器

对于某些用户，您可能希望给他授权给定策略中的所有操作。为了实现这一点，你可以在策略上定义一个 `before` 方法。该 `before` 方法将在策略上的所有方法之前执行，这样就使您有机会在实际调用预期的策略方法之前就已经授权了操作。该功能常用于授权应用程序管理员来执行任何操作：

    use App\Models\User;

    /**
     * 执行预先授权检查
     *
     * @param  \App\Models\User  $user
     * @param  string  $ability
     * @return void|bool
     */
    public function before(User $user, $ability)
    {
        if ($user->isAdministrator()) {
            return true;
        }
    }

如果你想拒绝特定类型用户的所有授权检查，那么你可以从 `before` 方法返回 `false` 。如果返回 `null` ，则授权检查将通过策略方法进行。

> 注意：如果策略类中不包含名称与被检查能力的名称相匹配的方法，则不会调用策略类的 `before` 方法。


<a name="authorizing-actions-using-policies"></a>
## 使用策略授权操作

<a name="via-the-user-model"></a>
### 通过用户模型

Laravel 应用程序中的 `App\Models\User` 型提供了两个用于授权操作的方法：`can` 和 `cannot`。 `can` 和 `cannot` 方法接收您希望授权的操作名称和相关模型。例如，让我们确定一个用户是否被授权更新给定的 `App\Models\Post` 模型，这通常在控制器方法中实现：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * Update the given post.
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \App\Models\Post  $post
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request, Post $post)
        {
            if ($request->user()->cannot('update', $post)) {
                abort(403);
            }

            // Update the post...
        }
    }

如果为给定模型 [注册了策略](#registering-policies) ，该 `can` 方法将自动调用适当的策略并返回布尔值；如果没有为模型注册策略，该 `can` 方法将尝试调用基于 Gate 的闭包，该闭包将匹配给定的操作名称。

<a name="user-model-actions-that-dont-require-models"></a>
#### 不需要指定模型的操作

请记住，某些操作可能对应着「不需要模型实例」的策略方法，比如 `create` 。在这些情况下，你可以将类名传递给 `can` 方法，类名将用于确定在授权操作时使用哪个策略：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * Create a post.
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function store(Request $request)
        {
            if ($request->user()->cannot('create', Post::class)) {
                abort(403);
            }

            // Create the post...
        }
    }



<a name="via-controller-helpers"></a>
### 通过控制器辅助函数

除了给 `App\Models\User` 模型提供了有用方法，Laravel 还给任何控制器提供了一个有用的  `authorize` 方法，这些控制器要继承（`extends`） `App\Http\Controllers\Controller` 基类。

与`can` 方法一样， `authorize` 方法接收您希望授权的操作名称和相关模型，如果该操作未被授权，该方法将抛出 `Illuminate\Auth\Access\AuthorizationException` 异常，Laravel 的异常处理程序将自动将该异常转换为一个带有 403 状态码的 HTTP 响应：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * 更新指定的博客文章
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  \App\Models\Post  $post
         * @return \Illuminate\Http\Response
         *
         * @throws \Illuminate\Auth\Access\AuthorizationException
         */
        public function update(Request $request, Post $post)
        {
            $this->authorize('update', $post);

            // The current user can update the blog post...
        }
    }

<a name="controller-actions-that-dont-require-models"></a>
#### 不需要指定模型的操作

如前所述，一些策略方法 如`create` 不需要模型实例，在这些情况下，你应该给 `authorize` 方法传递一个类名，该类名将用来确定在授权操作时使用哪个策略：

    use App\Models\Post;
    use Illuminate\Http\Request;

    /**
     * Create a new blog post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(Request $request)
    {
        $this->authorize('create', Post::class);

        // The current user can create blog posts...
    }



<a name="authorizing-resource-controllers"></a>
#### 授权资源控制器

如果你正在使用 [资源控制器](/docs/laravel/9.x/controllers#resource-controllers)，你可以在控制器的构造方法中使用 `authorizeResource` 方法，该方法将把适当的 `can` 中间件定义附加到资源控制器的方法上。

该 `authorizeResource` 方法的第一个参数是模型的类名，第二个参数是包含模型 ID 的 路由/请求参数的名称。你应该确保你的 [资源控制器](/docs/laravel/9.x/controllers#resource-controllers) 是使用 `--model` 标志创建的，这样它才具有所需的方法签名和类型提示。

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * 创建控制器实例
         *
         * @return void
         */
        public function __construct()
        {
            $this->authorizeResource(Post::class, 'post');
        }
    }

以下控制器方法将映射到其相应的策略方法。当请求被路由到给定的控制器方法时，会在控制器方法执行之前自动调用相应的策略方法：

| 控制器方法 | 策略方法 |
| --- | --- |
| index | viewAny |
| show | view |
| create | create |
| store | create |
| edit | update |
| update | update |
| destroy | delete |

> 技巧：你可以使用带有 `make:policy` 带有 `--model` 选项的命令，快速的为给定模型生成一个策略类： `php artisan make:policy PostPolicy --model=Post`。

<a name="via-middleware"></a>
### 通过中间件

Laravel 包含一个中间件，可以在传入的请求到达路由或控制器之前对操作进行授权。默认情况下， `Illuminate\Auth\Middleware\Authorize` 中间件会在 `App\Http\Kernel` 中的 `can` 键中被指定。让我们来看一个使用 `can` 中间件授权用户更新博客文章的例子：

    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // The current user may update the post...
    })->middleware('can:update,post');



在这个例子中，我们给 `can` 中间件传递了两个参数。第一个是我们希望授权操作的名称，第二个是我们希望传递给策略方法的路由参数。在这个例子中，当我们使用了 [隐式模型绑定](/docs/laravel/9.x/routing#implicit-binding) 后，一个 `App\Models\Post` 模型就将被传递给对应的策略方法。如果用户没有被授权执行给定操作的权限，那么中间件将会返回一个带有 403 状态码的 HTTP 响应。

为了方便起见，你也可以使用 `can` 方法将 `can` 中间件绑定到你的路由上：

    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // 当前用户可以更新文章
    })->can('update', 'post');

<a name="middleware-actions-that-dont-require-models"></a>
#### 不需要指定模型的操作

同样的，一些策略方法不需要模型实例，比如 `create` 。在这些情况下，你可以给中间件传递一个类名。这个类名将用来确定在授权操作时使用哪个策略：

    Route::post('/post', function () {
        // 当前用户可以创建文章
    })->middleware('can:create,App\Models\Post');

在一个中间件中定义整个类名会变得难以维护。因此，你也可以选择使用 `can` 方法将 `can` 中间件绑定到你的路由上：

    use App\Models\Post;

    Route::post('/post', function () {
        // 当前用户可以创建文章
    })->can('create', Post::class);

<a name="via-blade-templates"></a>
### 通过 Blade 模板



当编写 Blade 模板时，你可能希望只展示给用户有权限操作的数据。例如，你可能希望当用户具有更新文章的权限时才展示更新博客文章的表单。在这种情况下，你可以使用 `@can` 和 `@cannot` 指令：

```blade
@can('update', $post)
    <!-- 当前用户可更新的文章 -->
@elsecan('create', App\Models\Post::class)
    <!-- 当前用户可创建新文章 -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- 当前用户不可更新的文章 -->
@elsecannot('create', App\Models\Post::class)
    <!--  当前用户不可创建新文章 -->
@endcannot
```

这些指令是编写 `@if` 和 `@unless` 语句的快捷方式。上面的 `@can` 和 `@cannot` 语句相当于下面的语句：

```blade
@if (Auth::user()->can('update', $post))
    <!-- 当前用户可更新的文章 -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- 当前用户不可更新的文章 -->
@endunless
```

你还可以确定一个用户是否被授权从给定的操作数组中执行任何操作，要做到这一点，可以使用 `@canany` 指令：

```blade
@canany(['update', 'view', 'delete'], $post)
    <!--当前用户可以更新、查看、删除文章 -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- 当前用户可以创建新文章 -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 不需要执行模型的操作

像大多数其他授权方法一样，如果操作不需要模型实例，你可以给 `@can` 和 `@cannot` 指令传递一个类名：

```blade
@can('create', App\Models\Post::class)
    <!--当前用户可以创建文章 -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- 当前用户不能创建文章 -->
@endcannot
```



<a name="supplying-additional-context"></a>
### 提供额外的上下文

在使用策略授权操作时，可以将数组作为第二个参数传递给授权函数和辅助函数。数组中的第一个元素用于确定应该调用哪个策略，其余的数组元素作为参数传递给策略方法，并可在作出授权决策时用于额外的上下文中。例如，考虑下面的 `PostPolicy` 方法定义，它包含一个额外的 `$category` 参数：

    /**
     * 确认用户是否可以更新给定的文章
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @param  int  $category
     * @return bool
     */
    public function update(User $user, Post $post, int $category)
    {
        return $user->id === $post->user_id &&
               $user->canUpdateCategory($category);
    }

当尝试确认已验证过的用户是否可以更新给定的文章时，我们可以像这样调用此策略方法：

    /**
     * 更新给定的博客文章
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', [$post, $request->category]);

        // 当前用户可以更新博客文章
    }

