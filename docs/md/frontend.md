# 前端

- [介绍](#introduction)
- [使用 PHP](#using-php)
    - [PHP 和 Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [入门套件](#php-starter-kits)
- [使用 Vue / React](#using-vue-react)
    - [Inertia](#inertia)
    - [入门套件](#inertia-starter-kits)
- [打包资源](#bundling-assets)

<a name="introduction"></a>
## 介绍

Laravel 是一个后端框架，提供了构建现代 Web 应用所需的所有功能，例如 [路由](/docs/laravel/10.x/routing)、[验证](/docs/laravel/10.x/validation)、[缓存](/docs/laravel/10.x/cache)、[队列](/docs/laravel/10.x/queues)、[文件存储](/docs/laravel/10.x/filesystem) 等等。然而，我们认为为开发人员提供美观的全栈体验，包括构建应用前端的强大方法，是非常重要的。

在使用 Laravel 构建应用时，有两种主要的方式来解决前端开发问题，选择哪种方式取决于你是否想通过 PHP 或使用像 Vue 和 React 这样的 JavaScript 框架来构建前端。我们将在下面讨论这两种选项，以便你可以做出有关应用程序前端开发的最佳方法的明智决策。

<a name="using-php"></a>
## 使用 PHP

<a name="php-and-blade"></a>
### PHP 和 Blade

过去，大多数 PHP 应用程序使用简单的 HTML 模板和 PHP `echo` 语句将数据呈现给浏览器，这些语句在请求期间从数据库检索数据：

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

在 Laravel 中，仍可以使用 视图 和 Blade 来实现呈现 HTML 的这种方法。Blade 是一种非常轻量级的模板语言，提供方便、简短的语法，用于显示数据、迭代数据等：

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

当使用这种方法构建应用程序时，表单提交和其他页面交互通常会从服务器接收一个全新的 HTML 文档，整个页面将由浏览器重新渲染。即使今天，许多应用程序也可能非常适合使用简单的 Blade 模板构建其前端。

<a name="growing-expectations"></a>
#### 不断提高的期望

然而，随着用户对 Web 应用程序的期望不断提高，许多开发人员发现需要构建更具有互动性和更具现代感的动态前端。为此，一些开发人员选择使用诸如 Vue 和 React 等 JavaScript 框架开始构建应用程序的前端。

其他人则更喜欢使用他们熟悉的后端语言，开发出可利用他们首选的后端语言构建现代 Web 应用程序 UI 的解决方案。例如，在[Rails](https://rubyonrails.org/)生态系统中，这促使了诸如[Turbo](https://turbo.hotwired.dev/)、[Hotwire](https://hotwired.dev/)和[Stimulus](https://stimulus.hotwired.dev/)等库的创建。

在 Laravel 生态系统中，需要主要使用PHP创建现代动态前端已经导致了[Laravel Livewire](https://laravel-livewire.com/)和[Alpine.js](https://alpinejs.dev/)的创建。

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://laravel-livewire.com/)是一个用于构建 Laravel 前端的框架，具有与使用现代 JavaScript 框架（如 Vue 和 React ）构建的前端一样的动态、现代和生动的感觉。

在使用 Livewire 时，你将创建 Livewire "组件"，这些组件将呈现 UI 的一个离散部分，并公开可以从应用程序的前端调用和互动的方法和数据。例如，一个简单的"计数器"组件可能如下所示：


    <?php

    namespace App\Http\Livewire;

    use Livewire\Component;

    class Counter extends Component
    {
        public $count = 0;

        public function increment()
        {
            $this->count++;
        }

        public function render()
        {
            return view('livewire.counter');
        }
    }

对于计数器，相应的模板将会像这样写：

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

正如你所见，Livewire 使你能够编写新的 HTML 属性，例如 `wire:click`，以连接 Laravel 应用程序的前端和后端。此外，你可以使用简单的 Blade 表达式呈现组件的当前状态。

对于许多人来说，Livewire 改变了 Laravel 的前端开发方式，使他们可以在 Laravel 的舒适环境下构建现代、动态的 Web 应用程序。通常，使用 Livewire 的开发人员也会利用 [Alpine.js](https://alpinejs.dev/) 仅在需要时 "适度地添加" JavaScript 到他们的前端，比如为了渲染对话框窗口。

如果你是 Laravel 新手，我们建议你先了解 [views](/docs/laravel/10.x/views) 和 [Blade](/docs/laravel/10.x/blade) 的基本用法。然后，查阅官方的 [Laravel Livewire 文档](https://laravel-livewire.com/docs)，学习如何通过交互式 Livewire 组件将你的应用程序提升到新的水平。

<a name="php-starter-kits"></a>
### 入门套件

如果你想使用 PHP 和 Livewire 构建你的前端，你可以利用我们的 Breeze 或 Jetstream [入门套件](/docs/laravel/10.x/starter-kits) 来快速启动你的应用程序开发。这两个入门套件都使用 [Blade](/docs/laravel/10.x/blade) 和 [Tailwind](https://tailwindcss.com/) 构建你的应用程序后端和前端身份验证流程，让你可以轻松开始构建你的下一个大项目。

<a name="using-vue-react"></a>
## 使用 Vue / React

尽管使用 Laravel 和 Livewire 可以构建现代的前端，但许多开发人员仍然喜欢利用像 Vue 或 React 这样的 JavaScript 框架的强大功能。这使开发人员能够利用通过 NPM 可用的丰富的 JavaScript 包和工具生态系统。

然而，如果没有额外的工具支持，将 Laravel 与 Vue 或 React 配对会遇到各种复杂的问题，例如客户端路由、数据注入和身份验证。使用诸如 [Nuxt](https://nuxtjs.org/) 和 [Next](https://nextjs.org/) 等具有观点的 Vue / React 框架可以简化客户端路由；但是，当将类似 Laravel 这样的后端框架与这些前端框架配对时，数据注入和身份验证仍然是复杂而麻烦的问题。

此外，开发人员需要维护两个单独的代码存储库，通常需要在两个存储库之间协调维护、发布和部署。虽然这些问题并非不可解决，但我们认为这不是开发应用程序的一种有成效或令人愉快的方式。

<a name="inertia"></a>
### Inertia

值得庆幸的是，Laravel 提供了两全其美的解决方案。[Inertia](https://inertiajs.com/) 可以桥接你的 Laravel 应用程序和现代 Vue 或 React 前端，使你可以使用 Vue 或 React 构建完整的现代前端，同时利用 Laravel 路由和控制器进行路由、数据注入和身份验证 - 所有这些都在单个代码存储库中完成。使用这种方法，你可以同时享受 Laravel 和 Vue / React 的全部功能，而不会破坏任何一种工具的能力。

在将 Inertia 安装到你的 Laravel 应用程序后，你将像平常一样编写路由和控制器。但是，你将返回 Inertia 页面而不是从控制器返回 Blade 模板：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Inertia\Inertia;
    use Inertia\Response;

    class UserController extends Controller {
        /**
         * 显示给定用户的个人资料
         */
        public function show(string $id): Response {
            return Inertia::render('Users/Profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }

Inertia 页面对应于 Vue 或 React 组件，通常存储在应用程序的 `resources/js/Pages` 目录中。通过 `Inertia::render` 方法传递给页面的数据将用于填充页面组件的 "props"：

```vue
<script setup>
import Layout from '@/Layouts/Authenticated.vue';
import { Head } from '@inertiajs/inertia-vue3';

const props = defineProps(['user']);
</script>

<template>
    <Head title="用户资料" />

    <Layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                资料
            </h2>
        </template>

        <div class="py-12">
            你好，{{ user.name }}
        </div>
    </Layout>
</template>
```

正如你所看到的，使用 Inertia 可以在构建前端时充分利用 Vue 或 React 的强大功能，同时为 Laravel 驱动的后端和 JavaScript 驱动的前端提供了轻量级的桥梁。

#### 服务器端渲染

如果你因为应用程序需要服务器端渲染而担心使用 Inertia，不用担心。Inertia 提供了 [服务器端渲染支持](https://inertiajs.com/server-side-rendering)。并且，在通过 [Laravel Forge](https://forge.laravel.com/) 部署应用程序时，轻松确保 Inertia 的服务器端渲染过程始终运行。

<a name="inertia-starter-kits"></a>
### 入门套件

如果你想使用 Inertia 和 Vue / React 构建前端，可以利用我们的 Breeze 或 Jetstream [入门套件](/docs/laravel/10.x/starter-kits) 来加速应用程序的开发。这两个入门套件使用 Inertia、Vue / React、[Tailwind](https://tailwindcss.com/) 和 [Vite](https://vitejs.dev/) 构建应用程序的后端和前端身份验证流程，让你可以开始构建下一个大型项目。

<a name="bundling-assets"></a>
## 打包资源

无论你选择使用 Blade 和 Livewire 还是 Vue/React 和 Inertia 来开发你的前端，你都可能需要将你的应用程序的 CSS 打包成生产就绪的资源。当然，如果你选择用 Vue 或 React 来构建你的应用程序的前端，你也需要将你的组件打包成浏览器准备好的 JavaScript 资源。

默认情况下，Laravel 利用 [Vite](https://vitejs.dev) 来打包你的资源。Vite 在本地开发过程中提供了闪电般的构建时间和接近即时的热模块替换（HMR）。在所有新的 Laravel 应用程序中，包括那些使用我们的 [入门套件](/docs/laravel/10.x/starter-kit)，你会发现一个 `vite.config.js` 文件，加载我们轻量级的 Laravel Vite 插件，使 Vite 在 Laravel 应用程序中使用起来非常愉快。

开始使用 Laravel 和 Vite 的最快方法是使用 [Laravel Breeze](/docs/laravel/10.x/starter-kitsmd#laravel-breeze) 开始你的应用程序的开发，我们最简单的入门套件，通过提供前端和后端的认证支架来启动你的应用程序。

> **注意**
> 关于利用 Vite 和 Laravel 的更多详细文档，请看我们的 [关于打包和编译资源的专用文档](/docs/laravel/10.x/vite)。

