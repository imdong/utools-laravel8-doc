
# 请求的生命周期

- [简介](#introduction)
- [生命周期概述](#lifecycle-overview)
    - [第一步](#first-steps)
    - [HTTP / Console 内核](#http-console-kernels)
    - [服务提供者](#service-providers)
    - [路由](#routing)
    - [请求结束](#finishing-up)
- [关注服务提供者](#focus-on-service-providers)

<a name="introduction"></a>
## 简介

在「真实世界」中使用任何工具时，如果你了解该工具的工作原理，你会更加自信。应用程序开发也不例外。当您了解开发工具的功能时，你会觉得使用它们更舒服、更自信。

本文的目的是让您对 Laravel 框架的工作原理有一个良好的、高层次的理解。通过更好地了解整个框架，一切感觉都不那么「神奇」，你将更有信心构建你的应用程序。如果你不明白所有的规则，不要灰心！只要试着对正在发生的事情有一个基本的掌握，你的知识就会随着你探索文档的其他部分而增长。

<a name="lifecycle-overview"></a>
## 生命周期概述

<a name="first-steps"></a>
### 第一步

Laravel 应用程序的所有请求的入口点都是 `public/index.php` 文件。所有请求都由你的 web 服务器（Apache/Nginx）配置定向到此文件。那个 `index.php` 文件不包含太多代码。相反，它是加载框架其余部分的起点。

`index.php` 文件将加载 Composer 生成的自动加载器定义，然后从 `bootstrap/app.php` 中检索 Laravel 应用程序的实例。Laravel 本身采取的第一个操作是创建应用 / [服务容器](/docs/laravel/10.x/container) 的实例。



<a name="http-console-kernels"></a>
### HTTP / Console 内核

接下来，根据进入应用的请求类型，传入的请求将被发送到 HTTP 内核或者 Console 内核。这两个内核充当所有请求流经的中心位置。现在，我们只关注位于`app/Http/Kernel.php`中的 HTTP 内核。

HTTP 内核继承了`Illuminate\Foundation\Http\Kernel`类，该类定义了一个将在执行请求之前运行的`bootstrappers` 数组。这些引导程序用来配置异常处理、配置日志、[检测应用程序环境](/docs/laravel/10.x/configuration#environment-configuration)，并执行在实际处理请求之前需要完成的其他任务。通常，这些类处理你无需担心的内部 Laravel 配置。

HTTP 内核还定义了一个 HTTP [中间件](/docs/laravel/10.x/middleware)列表，所有请求在被应用程序处理之前都必须通过该列表。这些中间件处理读写[HTTP 会话](/docs/laravel/10.x/session) ，确定应用程序是否处于维护模式， [校验 CSRF 令牌](/docs/laravel/10.x/csrf), 等等。我们接下来会做详细的讨论。

HTTP 内核的`handle`方法的签名非常简单：它接收`Request`接口并返回`Response`接口。把内核想象成一个代表整个应用程序的大黑匣子。向它提供 HTTP 请求，它将返回 HTTP 响应。

<a name="service-providers"></a>
### 服务提供者

最重要的内核引导操作之一是为应用程序加载[服务提供者 ](/docs/laravel/10.x/providers)。应用程序的所有服务提供程序都在`config/app.php`文件中的`providers` 数组。



Laravel 将遍历这个提供者列表并实例化它们中的每一个。实例化提供程序后，将在所有提供程序上调用`register`方法。然后，一旦所有的提供者都被注册了，就会对每个提供程序调用`boot`方法。服务提供者可能依赖于在执行`boot`方法时注册并可用的每个容器绑定。

服务提供者负责引导框架的所有不同组件，如数据库、队列、验证和路由组件。基本上，Laravel 提供的每个主要功能都是由服务提供商引导和配置的。由于它们引导和配置框架提供的许多特性，服务提供者是整个 Laravel 引导过程中最重要的部分。

<a name="routing"></a>
### 路由

应用程序中最重要的服务提供者之一是`App\Providers\RouteServiceProvider`。此服务提供者加载应用程序的`routes`目录中包含的路由文件。继续，打开`RouteServiceProvider`代码，看看它是如何工作的！

一旦应用程序被引导并且所有服务提供者都被注册，`Request`将被传递给路由器进行调度。路由器将请求发送到路由或控制器，并运行任何路由特定的中间件。

中间件为过滤或检查进入应用程序的 HTTP 请求提供了一种方便的机制。例如，Laravel 包含一个这样的中间件，用于验证应用程序的用户是否经过身份验证。如果用户未通过身份验证，中间件将用户重定向到登录页。但是，如果用户经过身份验证，中间件将允许请求进一步进入应用程序。一些中间件被分配给应用程序中的所有路由，比如那些在 HTTP 内核的`$middleware`属性中定义的路由，而一些只被分配给特定的路由或路由组。你可以通过阅读完整的[中间件文档](/docs/laravel/10.x/middleware)来了解关于中间件的信息。


如果请求通过了所有匹配路由分配的中间件，则执行路由或控制器方法，并通过路由的中间件链路返回路由或控制器方法的响应。

<a name="finishing-up"></a>
### 最后

一旦路由或控制器方法返回一个响应，该响应将通过路由的中间件返回，从而使应用程序有机会修改或检查传出的响应。

最后，一旦响应通过中间件返回，HTTP 内核的`handle`方法将返回响应对象，并且`index.php`文件在返回的响应上调用`send`方法。`send`方法将响应内容发送到用户的 Web 浏览器。至此，我们已经完成了整个 Laravel 请求生命周期的旅程！

<a name="focus-on-service-providers"></a>
## 关注服务提供者

服务提供者确实是引导 Laravel 应用程序的关键。创建应用程序实例，注册服务提供者，并将请求传递给引导应用程序。就这么简单！

牢牢掌握服务提供者的构建和其对 Laravel 应用处理机制的原理是非常有价值的。你的应用的默认服务提供会存放在`app/Providers`目录下面。

默认情况下，`AppServiceProvider`是空白的。这里是用于你添加应用自身的引导处理和服务容器绑定的一个非常棒的地方。在大型项目中，你可能希望创建多个服务提供者，每个服务提供者都为应用程序使用的特定服务提供更细粒度的引导。

