# 广播

-   [介绍](#introduction)
-   [服务器端安装](#server-side-installation)
    -   [配置](#configuration)
    -   [Pusher Channels](#pusher-channels)
    -   [Ably](#ably)
    -   [开源替代品](#open-source-alternatives)
-   [客户端安装](#client-side-installation)
    -   [Pusher Channels](#client-pusher-channels)
    -   [Ably](#client-ably)
-   [概念概述](#concept-overview)
    -   [使用示例应用程序](#using-example-application)
-   [定义广播事件](#defining-broadcast-events)
    -   [广播名称](#broadcast-name)
    -   [广播数据](#broadcast-data)
    -   [广播队列](#broadcast-queue)
    -   [广播条件](#broadcast-conditions)
    -   [广播和数据库事务](#broadcasting-and-database-transactions)
-   [授权频道](#authorizing-channels)
    -   [定义授权路由](#defining-authorization-routes)
    -   [定义授权回调](#defining-authorization-callbacks)
    -   [定义频道类](#defining-channel-classes)
-   [广播事件](#broadcasting-events)
    -   [仅发送给其他人](#only-to-others)
    -   [自定义连接](#customizing-the-connection)
-   [接收广播](#receiving-broadcasts)
    -   [监听事件](#listening-for-events)
    -   [离开频道](#leaving-a-channel)
    -   [命名空间](#namespaces)
-   [在场频道](#presence-channels)
    -   [授权在场频道](#authorizing-presence-channels)
    -   [加入在场频道](#joining-presence-channels)
    -   [广播到在场频道](#broadcasting-to-presence-channels)
-   [模型广播](#model-broadcasting)
    -   [模型广播约定](#model-broadcasting-conventions)
    -   [监听模型广播](#listening-for-model-broadcasts)
-   [客户端事件](#client-events)
-   [通知](#notifications)

<a name="introduction"></a>
## 介绍

在许多现代 Web 应用程序中，WebSockets 用于实现实时的、实时更新的用户界面。当服务器上的某些数据更新时，通常会发送一条消息到 WebSocket 连接，以由客户端处理。WebSockets 提供了一种更有效的替代方法，可以连续轮询应用程序服务器以反映 UI 中应该反映的数据更改。

举个例子，假设你的应用程序能够将用户的数据导出为 CSV 文件并通过电子邮件发送给他们。但是，创建这个 CSV 文件需要几分钟的时间，因此你选择在[队列任务](/docs/laravel/10.x/queues)中创建和发送 CSV。当 CSV 文件已经创建并发送给用户后，我们可以使用事件广播来分发 `App\Events\UserDataExported` 事件，该事件由我们应用程序的 JavaScript 接收。一旦接收到事件，我们可以向用户显示消息，告诉他们他们的 CSV 已通过电子邮件发送给他们，而无需刷新页面。



为了帮助你构建此类特性，Laravel使得在WebSocket连接上“广播”你的服务端[Laravel事件](/docs/laravel/10.x/events)变得简单。广播你的Laravel事件允许你在你的服务端Laravel应用和客户端JavaScript应用之间共享相同的事件名称和数据。

广播背后的核心概念很简单：客户端在前端连接到命名通道，而你的Laravel应用在后端向这些通道广播事件。这些事件可以包含任何你想要向前端提供的其他数据。

<a name="supported-drivers"></a>
#### 支持的驱动程序

默认情况下，Laravel为你提供了两个服务端广播驱动程序可供选择：[Pusher Channels](https://pusher.com/channels) 和 [Ably](https://ably.com/)。但是，社区驱动的包，如 [laravel-websockets](https://beyondco.de/docs/laravel-websockets/getting-started/introduction) 和 [soketi](https://docs.soketi.app/) 提供了不需要商业广播提供者的其他广播驱动程序。

> **注意**
> 在深入了解事件广播之前，请确保已阅读Laravel的[事件和侦听器](/docs/laravel/10.x/events)文档。

<a name="server-side-installation"></a>
## 服务端安装

为了开始使用Laravel的事件广播，我们需要在Laravel应用程序中进行一些配置，并安装一些包。

事件广播是通过服务端广播驱动程序实现的，该驱动程序广播你的Laravel事件，以便Laravel Echo（一个JavaScript库）可以在浏览器客户端中接收它们。不用担心 - 我们将逐步介绍安装过程的每个部分。

<a name="configuration"></a>
### 配置

所有应用程序的事件广播配置都存储在`config/broadcasting.php`配置文件中。Laravel支持多个广播驱动程序：[Pusher Channels](https://pusher.com/channels)、[Redis](/docs/laravel/10.x/redis)和用于本地开发和调试的`log`驱动程序。此外，还包括一个`null`驱动程序，它允许你在测试期间完全禁用广播。`config/broadcasting.php`配置文件中包含每个驱动程序的配置示例。



<a name="broadcast-service-provider"></a>
#### 广播服务提供商

在广播任何事件之前，您首先需要注册 `App\Providers\BroadcastServiceProvider`。在新的 Laravel 应用程序中，您只需要在 `config/app.php` 配置文件的 `providers` 数组中取消注释此提供程序即可。这个 `BroadcastServiceProvider` 包含了注册广播授权路由和回调所需的代码。

<a name="queue-configuration"></a>
#### 队列配置

您还需要配置和运行一个[队列工作者](/docs/laravel/10.x/queues)。所有事件广播都是通过排队的作业完成的，以确保您的应用程序的响应时间不会受到广播事件的影响。

<a name="pusher-channels"></a>
### Pusher Channels

如果您计划使用[Pusher Channels](https://pusher.com/channels)广播您的事件，您应该使用 Composer 包管理器安装 Pusher Channels PHP SDK：

```shell
composer require pusher/pusher-php-server
```

接下来，您应该在 `config/broadcasting.php` 配置文件中配置 Pusher Channels 凭据。此文件中已经包含了一个示例 Pusher Channels 配置，让您可以快速指定您的密钥、密钥、应用程序 ID。通常，这些值应该通过 `PUSHER_APP_KEY`、`PUSHER_APP_SECRET` 和 `PUSHER_APP_ID`  [环境变量](/docs/laravel/10.x/configuration#environment-configuration) 设置：

```ini
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=mt1
```

`config/broadcasting.php` 文件的 `pusher` 配置还允许您指定 Channels 支持的其他 `options`，例如集群。

接下来，您需要在您的 `.env` 文件中将广播驱动程序更改为 `pusher`：

```ini
BROADCAST_DRIVER=pusher
```



最后，您已经准备好安装和配置[Laravel Echo](#client-side-installation)，它将在客户端接收广播事件。

<a name="pusher-compatible-open-source-alternatives"></a>
#### 开源的Pusher替代品

[laravel-websockets](https://github.com/beyondcode/laravel-websockets)和[soketi](https://docs.soketi.app/)软件包提供了适用于Laravel的Pusher兼容的WebSocket服务器。这些软件包允许您利用Laravel广播的全部功能，而无需商业WebSocket提供程序。有关安装和使用这些软件包的更多信息，请参阅我们的[开源替代品文档](#open-source-alternatives)。

<a name="ably"></a>
### Ably

>**注意** 下面的文档介绍了如何在“Pusher兼容”模式下使用Ably。然而，Ably团队推荐并维护一个广播器和Echo客户端，能够利用Ably提供的独特功能。有关使用Ably维护的驱动程序的更多信息，请[参阅Ably的Laravel广播器文档](https://github.com/ably/laravel-broadcaster)。

如果您计划使用[Ably](https://ably.com/)广播您的事件，则应使用Composer软件包管理器安装Ably PHP SDK：

```shell
composer require ably/ably-php
```

接下来，您应该在`config/broadcasting.php`配置文件中配置您的Ably凭据。该文件已经包含了一个示例Ably配置，允许您快速指定您的密钥。通常，此值应通过`ABLY_KEY`[环境变量](/docs/laravel/10.x/configuration#environment-configuration)进行设置：

```ini
ABLY_KEY=your-ably-key
```

Next, you will need to change your broadcast driver to `ably` in your `.env` file:

```ini
BROADCAST_DRIVER=ably
```

接下来，您需要在`.env`文件中将广播驱动程序更改为`ably`：



<a name="open-source-alternatives"></a>
### 开源替代方案

<a name="open-source-alternatives-php"></a>
#### PHP

[laravel-websockets](https://github.com/beyondcode/laravel-websockets) 是一个纯 PHP 的，与 Pusher 兼容的 Laravel WebSocket 包。该包允许您充分利用 Laravel 广播的功能，而无需商业 WebSocket 提供商。有关安装和使用此包的更多信息，请参阅其[官方文档](https://beyondco.de/docs/laravel-websockets)。

<a name="open-source-alternatives-node"></a>
#### Node

[Soketi](https://github.com/soketi/soketi) 是一个基于 Node 的，与 Pusher 兼容的 Laravel WebSocket 服务器。在幕后，Soketi 利用 µWebSockets.js 来实现极端的可扩展性和速度。该包允许您充分利用 Laravel 广播的功能，而无需商业 WebSocket 提供商。有关安装和使用此包的更多信息，请参阅其[官方文档](https://docs.soketi.app/)。

<a name="client-side-installation"></a>
## 客户端安装

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo) 是一个 JavaScript 库，可以轻松订阅通道并监听由服务器端广播驱动程序广播的事件。您可以通过 NPM 包管理器安装 Echo。在此示例中，我们还将安装 `pusher-js` 包，因为我们将使用 Pusher Channels 广播器：

```shell
npm install --save-dev laravel-echo pusher-js
```

安装 Echo 后，您可以在应用程序的 JavaScript 中创建一个新的 Echo 实例。一个很好的地方是在 Laravel 框架附带的 `resources/js/bootstrap.js` 文件的底部创建它。默认情况下，该文件中已包含一个示例 Echo 配置 - 您只需取消注释即可：

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```



一旦您根据自己的需求取消注释并调整了 Echo 配置，就可以编译应用程序的资产：

```shell
npm run dev
```

> **注意** 
> 要了解有关编译应用程序的 JavaScript 资产的更多信息，请参阅 [Vite](/docs/laravel/10.x/vite) 上的文档。

<a name="using-an-existing-client-instance"></a>
#### 使用现有的客户端实例

如果您已经有一个预配置的 Pusher Channels 客户端实例，并希望 Echo 利用它，您可以通过 `client` 配置选项将其传递给 Echo：

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: 'your-pusher-channels-key'
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a name="client-ably"></a>
### Ably

> **注意** 
> 下面的文档讨论如何在“Pusher 兼容性”模式下使用 Ably。但是，Ably 团队推荐和维护了一个广播器和 Echo 客户端，可以利用 Ably 提供的独特功能。有关使用由 Ably 维护的驱动程序的更多信息，请[查看 Ably 的 Laravel 广播器文档](https://github.com/ably/laravel-broadcaster)。

[Laravel Echo](https://github.com/laravel/echo) 是一个 JavaScript 库，可以轻松订阅通道并侦听服务器端广播驱动程序广播的事件。您可以通过 NPM 包管理器安装 Echo。在本示例中，我们还将安装 `pusher-js` 包。

您可能会想为什么我们要安装 `pusher-js` JavaScript 库，即使我们使用 Ably 来广播事件。幸运的是，Ably 包括 Pusher 兼容性模式，让我们可以在客户端应用程序中使用 Pusher 协议来侦听事件：

```shell
npm install --save-dev laravel-echo pusher-js
```



**在继续之前，你应该在你的 Ably 应用设置中启用 Pusher 协议支持。你可以在你的 Ably 应用设置仪表板的“协议适配器设置”部分中启用此功能。**

安装 Echo 后，你可以在应用的 JavaScript 中创建一个新的 Echo 实例。一个很好的地方是在 Laravel 框架附带的 `resources/js/bootstrap.js` 文件底部。默认情况下，此文件中已包含一个示例 Echo 配置；但是，`bootstrap.js` 文件中的默认配置是为 Pusher 设计的。你可以复制以下配置来将配置转换为 Ably：

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

请注意，我们的 Ably Echo 配置引用了一个 `VITE_ABLY_PUBLIC_KEY` 环境变量。该变量的值应该是你的 Ably 公钥。你的公钥是出现在 Ably 密钥的 `:` 字符之前的部分。

一旦你根据需要取消注释并调整 Echo 配置，你可以编译应用的资产：

```shell
npm run dev
```
> **注意**
> 要了解有关编译应用程序的 JavaScript 资产的更多信息，请参阅 [Vite](/docs/laravel/10.x/vite) 的文档。

<a name="concept-overview"></a>
## 概念概述

Laravel 的事件广播允许你使用基于驱动程序的 WebSocket 方法，将服务器端 Laravel 事件广播到客户端的 JavaScript 应用程序。目前，Laravel 附带了 [Pusher Channels](https://pusher.com/channels) 和 [Ably](https://ably.com/) 驱动程序。可以使用 [Laravel Echo](#client-side-installation) JavaScript 包轻松地在客户端消耗这些事件。



事件通过“通道”广播，可以指定为公共或私有。任何访问您的应用程序的用户都可以订阅公共频道，无需进行身份验证或授权；但是，要订阅私有频道，用户必须经过身份验证和授权以便监听该频道。


> **注意**  
> 如果您想探索 Pusher 的开源替代品，请查看[开源替代品](#open-source-alternatives)。

<a name="using-example-application"></a>
### 使用示例应用程序

在深入了解事件广播的每个组件之前，让我们使用电子商务店铺作为示例进行高级概述。

在我们的应用程序中，假设我们有一个页面，允许用户查看其订单的发货状态。假设在应用程序处理发货状态更新时，将触发一个 `OrderShipmentStatusUpdated` 事件：

    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);

<a name="the-shouldbroadcast-interface"></a>
#### ShouldBroadcast 接口

当用户查看其订单之一时，我们不希望他们必须刷新页面才能查看状态更新。相反，我们希望在创建更新时将更新广播到应用程序。因此，我们需要使用 `ShouldBroadcast` 接口标记 `OrderShipmentStatusUpdated` 事件。这将指示 Laravel 在触发事件时广播该事件：

    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class OrderShipmentStatusUpdated implements ShouldBroadcast
    {
        /**
         * The order instance.
         *
         * @var \App\Order
         */
        public $order;
    }



`ShouldBroadcast`接口要求我们的事件定义一个`broadcastOn`方法。该方法负责返回事件应广播到的频道。在生成的事件类中已经定义了这个方法的空桩，所以我们只需要填写它的细节即可。我们只希望订单的创建者能够查看状态更新，因此我们将事件广播到与订单相关的私有频道上：

    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\PrivateChannel;

    /**
     * 获取事件应该广播到的频道。
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('orders.'.$this->order->id);
    }

如果你希望事件广播到多个频道，可以返回一个`array`：

    use Illuminate\Broadcasting\PrivateChannel;

    /**
     * 获取事件应该广播到的频道。
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.'.$this->order->id),
            // ...
        ];
    }

<a name="example-application-authorizing-channels"></a>
#### 授权频道

记住，用户必须被授权才能监听私有频道。我们可以在应用程序的`routes/channels.php`文件中定义频道授权规则。在这个例子中，我们需要验证任何试图监听私有`orders.1`频道的用户是否实际上是订单的创建者：

    use App\Models\Order;
    use App\Models\User;

    Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });

`channel`方法接受两个参数：频道名称和一个回调函数，该函数返回`true`或`false`，表示用户是否被授权监听该频道。



所有授权回调函数的第一个参数是当前认证的用户，其余的通配符参数是它们的后续参数。在此示例中，我们使用`{orderId}`占位符来指示频道名称的“ID”部分是通配符。

<a name="listening-for-event-broadcasts"></a>
#### 监听事件广播

接下来，我们只需要在JavaScript应用程序中监听事件即可。我们可以使用[Laravel Echo](#client-side-installation)来完成这个过程。首先，我们使用`private`方法订阅私有频道。然后，我们可以使用`listen`方法来监听`OrderShipmentStatusUpdated`事件。默认情况下，广播事件的所有公共属性将被包括在广播事件中：

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 定义广播事件

要通知 Laravel 给定事件应该被广播，您必须在事件类上实现`Illuminate\Contracts\Broadcasting\ShouldBroadcast`接口。该接口已经被框架生成的所有事件类导入，因此您可以轻松地将其添加到任何事件中。

`ShouldBroadcast`接口要求您实现一个单独的方法:`broadcastOn`。`broadcastOn`方法应该返回一个频道或频道数组，事件应该在这些频道上广播。这些频道应该是`Channel`、`PrivateChannel`或`PresenceChannel`的实例。`Channel`的实例表示任何用户都可以订阅的公共频道，而`PrivateChannel`和`PresenceChannel`表示需要[频道授权](#authorizing-channels)的私有频道：

    <?php

    namespace App\Events;

    use App\Models\User;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class ServerCreated implements ShouldBroadcast
    {
        use SerializesModels;

        /**
         * 创建一个新的事件实例。
         */
        public function __construct(
            public User $user,
        ) {}

        /**
         * 获取事件应该广播到哪些频道。
         *
         * @return array<int, \Illuminate\Broadcasting\Channel>
         */
        public function broadcastOn(): array
        {
            return [
                new PrivateChannel('user.'.$this->user->id),
            ];
        }
    }



实现 `ShouldBroadcast` 接口后，您只需要像平常一样[触发事件](/docs/laravel/10.x/events)。一旦事件被触发，一个[队列任务](/docs/laravel/10.x/queues)将自动使用指定的广播驱动程序广播该事件。

<a name="broadcast-name"></a>
### 广播名称

默认情况下，Laravel将使用事件类名广播事件。但是，您可以通过在事件上定义 `broadcastAs` 方法来自定义广播名称：

    /**
     * 活动的广播名称
     */
    public function broadcastAs(): string
    {
        return 'server.created';
    }

如果您使用 `broadcastAs` 方法自定义广播名称，则应确保使用前导“.”字符注册您的侦听器。这将指示 Echo 不将应用程序的命名空间添加到事件中：

    .listen('.server.created', function (e) {
        ....
    });

<a name="broadcast-data"></a>
### 广播数据

当广播事件时，所有 `public` 属性都将自动序列化并广播为事件负载，使您能够从 JavaScript 应用程序中访问其任何公共数据。例如，如果您的事件具有单个公共 `$user` 属性，其中包含 Eloquent 模型，则事件的广播负载将是：

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

但是，如果您希望更精细地控制广播负载，则可以向事件中添加 `broadcastWith` 方法。该方法应该返回您希望作为事件负载广播的数据数组：

    /**
     * 获取要广播的数据。
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return ['id' => $this->user->id];
    }

<a name="broadcast-queue"></a>


### 广播队列

默认情况下，每个广播事件都会被放置在您在 `queue.php` 配置文件中指定的默认队列连接的默认队列上。您可以通过在事件类上定义 `connection` 和 `queue` 属性来自定义广播器使用的队列连接和名称：

    /**
     * 广播事件时要使用的队列连接的名称。
     *
     * @var string
     */
    public $connection = 'redis';

    /**
     * 广播作业要放置在哪个队列上的名称。
     *
     * @var string
     */
    public $queue = 'default';

或者，您可以通过在事件上定义一个 `broadcastQueue` 方法来自定义队列名称：

    /**
     * 广播作业放置在其上的队列的名称。
     */
    public function broadcastQueue(): string
    {
        return 'default';
    }

如果您想要使用 `sync` 队列而不是默认的队列驱动程序来广播事件，您可以实现 `ShouldBroadcastNow` 接口而不是 `ShouldBroadcast` 接口：

    <?php

    use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

    class OrderShipmentStatusUpdated implements ShouldBroadcastNow
    {
        // ...
    }

<a name="broadcast-conditions"></a>
### 广播条件

有时候您只想在给定条件为真时才广播事件。您可以通过在事件类中添加一个 `broadcastWhen` 方法来定义这些条件：

    /**
     * 确定此事件是否应该广播。
     */
    public function broadcastWhen(): bool
    {
        return $this->order->value > 100;
    }

<a name="broadcasting-and-database-transactions"></a>
#### 广播和数据库事务

当在数据库事务中分派广播事件时，它们可能会在数据库事务提交之前被队列处理。当这种情况发生时，在数据库中对模型或数据库记录所做的任何更新可能尚未反映在数据库中。此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。如果您的事件依赖于这些模型，则在处理广播事件的作业时可能会出现意外错误。



如果您的队列连接的`after_commit`配置选项设置为`false`，您仍然可以通过在事件类上定义`$afterCommit`属性来指示特定的广播事件在所有打开的数据库事务提交后被调度：

    <?php

    namespace App\Events;

    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class ServerCreated implements ShouldBroadcast
    {
        use SerializesModels;

        public $afterCommit = true;
    }

> **注意**
> 要了解更多有关解决这些问题的信息，请查阅有关[队列作业和数据库事务](https://chat.openai.com/docs/laravel/10.x/queues#jobs-and-database-transactions)的文档。

<a name="authorizing-channels"></a>
## 授权频道

私有频道需要您授权当前已验证的用户是否实际上可以监听该频道。这可以通过向您的 Laravel 应用程序发送带有频道名称的 HTTP 请求来完成，并允许您的应用程序确定用户是否可以在该频道上监听。当使用[Laravel Echo](#client-side-installation)时，将自动进行授权订阅私有频道的 HTTP 请求；但是，您需要定义正确的路由来响应这些请求。

<a name="defining-authorization-routes"></a>
### 定义授权路由

幸运的是，Laravel 可以轻松定义用于响应频道授权请求的路由。在您的 Laravel 应用程序中包含的`App\Providers\BroadcastServiceProvider`中，您将看到对`Broadcast::routes`方法的调用。此方法将注册`/broadcasting/auth`路由以处理授权请求：

    Broadcast::routes();

`Broadcast::routes`方法将自动将其路由放置在`web`中间件组中；但是，如果您想自定义分配的属性，则可以将路由属性数组传递给该方法：

    Broadcast::routes($attributes);



<a name="customizing-the-authorization-endpoint"></a>
#### 自定义授权终点

默认情况下，Echo 将使用 `/broadcasting/auth` 终点来授权频道访问。但是，您可以通过将 `authEndpoint` 配置选项传递给 Echo 实例来指定自己的授权终点：

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="customizing-the-authorization-request"></a>
#### 自定义授权请求

您可以在初始化 Echo 时提供自定义授权器来自定义 Laravel Echo 如何执行授权请求：

```js
window.Echo = new Echo({
    // ...
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(null, response.data);
                })
                .catch(error => {
                    callback(error);
                });
            }
        };
    },
})
```

<a name="defining-authorization-callbacks"></a>
### 定义授权回调函数

接下来，我们需要定义实际确定当前认证用户是否可以收听给定频道的逻辑。这是在您的应用程序中包含的 `routes/channels.php` 文件中完成的。在该文件中，您可以使用 `Broadcast::channel` 方法来注册频道授权回调函数：

    use App\Models\User;

    Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });

`channel` 方法接受两个参数：频道名称和一个回调函数，该回调函数返回 `true` 或 `false`，指示用户是否有权限在频道上收听。

所有授权回调函数都接收当前认证用户作为其第一个参数，任何其他通配符参数作为其后续参数。在此示例中，我们使用 `{orderId}` 占位符来指示频道名称的 "ID" 部分是通配符。



您可以使用`channel:list` Artisan命令查看应用程序的广播授权回调列表：

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### 授权回调模型绑定

与HTTP路由一样，频道路由也可以利用隐式和显式的[路由模型绑定](/docs/laravel/10.x/routing#route-model-binding)。例如，您可以请求一个实际的 `Order` 模型实例，而不是接收一个字符串或数字订单ID：

    use App\Models\Order;
    use App\Models\User;

    Broadcast::channel('orders.{order}', function (User $user, Order $order) {
        return $user->id === $order->user_id;
    });

> **警告**
> 与HTTP路由模型绑定不同，频道模型绑定不支持自动[隐式模型绑定范围](/docs/laravel/10.x/routing#implicit-model-binding-scoping)。但是，这很少是问题，因为大多数频道可以基于单个模型的唯一主键进行范围限制。

<a name="authorization-callback-authentication"></a>
#### 授权回调身份验证

私有和存在广播频道会通过您的应用程序的默认身份验证保护当前用户。如果用户未经过身份验证，则频道授权将自动被拒绝，并且不会执行授权回调。但是，您可以分配多个自定义守卫，以根据需要对传入请求进行身份验证：

    Broadcast::channel('channel', function () {
        // ...
    }, ['guards' => ['web', 'admin']]);

<a name="defining-channel-classes"></a>
### 定义频道类

如果您的应用程序正在消耗许多不同的频道，则您的 `routes/channels.php` 文件可能会变得臃肿。因此，您可以使用频道类而不是使用闭包来授权频道。要生成一个频道类，请使用 `make:channel` Artisan命令。该命令将在 `App/Broadcasting` 目录中放置一个新的频道类。

```shell
php artisan make:channel OrderChannel
```



接下来，在您的 `routes/channels.php` 文件中注册您的频道：

    use App\Broadcasting\OrderChannel;

    Broadcast::channel('orders.{order}', OrderChannel::class);

最后，您可以将频道授权逻辑放在频道类的 `join` 方法中。这个 `join` 方法将包含您通常放置在频道授权闭包中的相同逻辑。您还可以利用频道模型绑定：

    <?php

    namespace App\Broadcasting;

    use App\Models\Order;
    use App\Models\User;

    class OrderChannel
    {
        /**
         * 创建一个新的频道实例。
         */
        public function __construct()
        {
            // ...
        }

        /**
         * 验证用户对频道的访问权限。
         */
        public function join(User $user, Order $order): array|bool
        {
            return $user->id === $order->user_id;
        }
    }

> **注意**
> 像 Laravel 中的许多其他类一样，频道类将自动由[服务容器](/docs/laravel/10.x/container)解析。因此，您可以在其构造函数中声明频道所需的任何依赖关系。

<a name="broadcasting-events"></a>
## 广播事件

一旦您定义了一个事件并使用 `ShouldBroadcast` 接口标记了它，您只需要使用事件的 `dispatch` 方法来触发事件。事件调度程序会注意到该事件已标记为 `ShouldBroadcast` 接口，并将该事件排队进行广播：

    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);

<a name="only-to-others"></a>
### 只发给其他人

在构建使用事件广播的应用程序时，您可能需要将事件广播给给定频道的所有订阅者，除了当前用户。您可以使用 `broadcast` 帮助器和 `toOthers` 方法来实现：

    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->toOthers();



为了更好地理解何时需要使用`toOthers`方法，让我们想象一个任务列表应用程序，用户可以通过输入任务名称来创建新任务。为了创建任务，您的应用程序可能会向`/task` URL发出请求，该请求广播任务的创建并返回新任务的JSON表示。当JavaScript应用程序从端点接收到响应时，它可能会直接将新任务插入到其任务列表中，如下所示：

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

然而，请记住，我们也会广播任务的创建。如果JavaScript应用程序也在监听此事件以便将任务添加到任务列表中，那么您的列表中将有重复的任务：一个来自端点，一个来自广播。您可以使用`toOthers`方法来解决这个问题，指示广播器不要向当前用户广播事件。

> **警告**
> 您的事件必须使用`Illuminate\Broadcasting\InteractsWithSockets`特性才能调用`toOthers`方法。

<a name="only-to-others-configuration"></a>
#### 配置

当您初始化一个Laravel Echo实例时，将为连接分配一个套接字ID。如果您正在使用全局的[Axios](https://github.com/mzabriskie/axios)实例从JavaScript应用程序发出HTTP请求，则套接字ID将自动附加到每个传出请求作为`X-Socket-ID`头。然后，当您调用`toOthers`方法时，Laravel将从标头中提取套接字ID，并指示广播器不向具有该套接字ID的任何连接广播。



如果您没有使用全局的 Axios 实例，您需要手动配置 JavaScript 应用程序，以在所有传出请求中发送 `X-Socket-ID` 标头。您可以使用 `Echo.socketId` 方法检索 socket ID：

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 定制连接

如果您的应用程序与多个广播连接交互，并且您想使用除默认之外的广播器广播事件，则可以使用 `via` 方法指定要将事件推送到哪个连接：

    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');

或者，您可以在事件的构造函数中调用 `broadcastVia` 方法指定事件的广播连接。不过，在这样做之前，您应该确保事件类使用了 `InteractsWithBroadcasting` trait：

    <?php

    namespace App\Events;

    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithBroadcasting;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class OrderShipmentStatusUpdated implements ShouldBroadcast
    {
        use InteractsWithBroadcasting;

        /**
         * 创建一个新的事件实例。
         */
        public function __construct()
        {
            $this->broadcastVia('pusher');
        }
    }

<a name="receiving-broadcasts"></a>
## 接收广播

<a name="listening-for-events"></a>
### 监听事件

一旦您 [安装并实例化了 Laravel Echo](#client-side-installation)，您就可以开始监听从 Laravel 应用程序广播的事件。首先使用 `channel` 方法检索通道实例，然后调用 `listen` 方法来监听指定的事件：

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```



如需在私有频道上监听事件，请改用`private`方法。您可以继续链式调用`listen`方法以侦听单个频道上的多个事件：

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### 停止监听事件

如果您想停止侦听给定事件而不离开频道，可以使用`stopListening`方法：

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 离开频道

要离开频道，请在Echo实例上调用`leaveChannel`方法：

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

如果您想离开频道以及其关联的私有和预​​sence频道，则可以调用`leave`方法：

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 命名空间

您可能已经注意到在上面的示例中，我们没有指定事件类的完整`App\Events`命名空间。这是因为Echo将自动假定事件位于`App\Events`命名空间中。但是，您可以在实例化Echo时通过传递`namespace`配置选项来配置根命名空间：

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

或者，您可以在使用Echo订阅时使用`。`前缀为事件类添加前缀。这将允许您始终指定完全限定的类名：
```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="presence-channels"></a>


## 存在频道

存在频道基于私有频道的安全性，并公开了订阅频道用户的附加功能。这使得构建强大的协作应用程序功能变得容易，例如在另一个用户正在查看同一页面时通知用户，或者列出聊天室的用户。

<a name="authorizing-presence-channels"></a>
### 授权存在频道

所有存在频道也都是私有频道，因此用户必须获得[访问权限](#authorizing-channels)。但是，在为存在频道定义授权回调时，如果用户被授权加入该频道，您将不会返回`true`。相反，您应该返回有关用户的数据数组。

授权回调返回的数据将在JavaScript应用程序中的存在频道事件侦听器中可用。如果用户没有被授权加入存在频道，则应返回`false`或`null`：

    use App\Models\User;

    Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
        if ($user->canJoinRoom($roomId)) {
            return ['id' => $user->id, 'name' => $user->name];
        }
    });

<a name="joining-presence-channels"></a>
### 加入存在频道

要加入存在频道，您可以使用Echo的`join`方法。`join`方法将返回一个`PresenceChannel`实现，除了公开`listen`方法外，还允许您订阅`here`，`joining`和`leaving`事件。

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

成功加入频道后，`here`回调将立即执行，并接收一个包含所有当前订阅频道用户信息的数组。`joining`方法将在新用户加入频道时执行，而`leaving`方法将在用户离开频道时执行。当认证端点返回HTTP状态码200以外的代码或存在解析返回的JSON时，将执行`error`方法。



<a name="broadcasting-to-presence-channels"></a>
### 向 Presence 频道广播

Presence 频道可以像公共频道或私有频道一样接收事件。以聊天室为例，我们可能希望将 `NewMessage` 事件广播到聊天室的 Presence 频道中。为此，我们将从事件的 `broadcastOn` 方法返回一个 `PresenceChannel` 实例：

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('room.'.$this->message->room_id),
        ];
    }

与其他事件一样，您可以使用 `broadcast` 助手和 `toOthers` 方法来排除当前用户接收广播：

    broadcast(new NewMessage($message));

    broadcast(new NewMessage($message))->toOthers();

与其他类型的事件一样，您可以使用 Echo 的 `listen` 方法来监听发送到 Presence 频道的事件：

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a name="model-broadcasting"></a>
## 模型广播

> **警告**
> 在阅读有关模型广播的以下文档之前，我们建议您熟悉 Laravel 模型广播服务的一般概念以及如何手动创建和监听广播事件。

当创建、更新或删除应用程序的[Eloquent 模型](/docs/laravel/10.x/eloquent)时，通常会广播事件。当然，这可以通过手动[定义用于 Eloquent 模型状态更改的自定义事件](/docs/laravel/10.x/eloquent#events)并将这些事件标记为 `ShouldBroadcast` 接口来轻松完成。

但是，如果您没有在应用程序中使用这些事件进行任何其他用途，则为仅广播它们的目的创建事件类可能会很麻烦。为解决这个问题，Laravel 允许您指示一个 Eloquent 模型应自动广播其状态更改。



开始之前，你的Eloquent模型应该使用`Illuminate\Database\Eloquent\BroadcastsEvents` trait。此外，模型应该定义一个`broadcastOn`方法，该方法将返回一个数组，该数组包含模型事件应该广播到的频道：

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * 获取发帖用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 获取模型事件应该广播到的频道
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

一旦你的模型包含了这个trait并定义了它的广播频道，当模型实例被创建、更新、删除、移到回收站或还原时，它将自动开始广播事件。

另外，你可能已经注意到`broadcastOn`方法接收一个字符串`$event`参数。这个参数包含了在模型上发生的事件类型，将具有`created`、`updated`、`deleted`、`trashed`或`restored`的值。通过检查这个变量的值，你可以确定模型在特定事件上应该广播到哪些频道（如果有）：

```php
/**
 * 获取模型事件应该广播到的频道
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```



<a name="customizing-model-broadcasting-event-creation"></a>
#### 自定义模型广播事件创建

有时候，您可能希望自定义 Laravel 创建底层模型广播事件的方式。您可以通过在您的 Eloquent 模型上定义一个 `newBroadcastableEvent` 方法来实现。这个方法应该返回一个 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 实例：

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * 为模型创建一个新的可广播模型事件。
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 模型广播约定

<a name="model-broadcasting-channel-conventions"></a>
#### 频道约定

您可能已经注意到，在上面的模型示例中，`broadcastOn` 方法没有返回 `Channel` 实例。相反，它直接返回了 Eloquent 模型。如果您的模型的 `broadcastOn` 方法返回了 Eloquent 模型实例（或者包含在方法返回的数组中），Laravel 将自动使用模型的类名和主键标识符作为频道名称为模型实例实例化一个私有频道实例。

因此，`App\Models\User` 模型的 `id` 为 `1` 将被转换为一个名称为 `App.Models.User.1` 的 `Illuminate\Broadcasting\PrivateChannel` 实例。当然，除了从模型的 `broadcastOn` 方法返回 Eloquent 模型实例之外，您还可以返回完整的 `Channel` 实例，以完全控制模型的频道名称：

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 获取模型事件应该广播到的频道。
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

如果您打算从模型的 `broadcastOn` 方法中明确返回一个频道实例，您可以将一个 Eloquent 模型实例传递给频道的构造函数。这样做时，Laravel 将使用上面讨论的模型频道约定将 Eloquent 模型转换为频道名称字符串：

```php
return [new Channel($this->user)];
```



如果您需要确定模型的频道名称，可以在任何模型实例上调用`broadcastChannel`方法。例如，对于一个 `App\Models\User` 模型，它的 `id` 为 `1`，这个方法将返回字符串 `App.Models.User.1`：

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>
#### 事件约定

由于模型广播事件与应用程序的 `App\Events` 目录中的“实际”事件没有关联，它们会根据约定分配名称和负载。 Laravel 的约定是使用模型的类名（不包括命名空间）和触发广播的模型事件的名称来广播事件。

例如，对 `App\Models\Post` 模型进行更新会将事件广播到您的客户端应用程序中，名称为 `PostUpdated`，负载如下：

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId",
}
```

删除 `App\Models\User` 模型将广播名为 `UserDeleted` 的事件。

如果需要，您可以通过在模型中添加 `broadcastAs` 和 `broadcastWith` 方法来定义自定义广播名称和负载。这些方法接收正在发生的模型事件/操作的名称，允许您为每个模型操作自定义事件的名称和负载。如果从 `broadcastAs` 方法返回 `null`，则 Laravel 将在广播事件时使用上述讨论的模型广播事件名称约定：

```php
/**
 * 模型事件的广播名称。
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * 获取要广播到模型的数据。
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```



<a name="listening-for-model-broadcasts"></a>
### 监听模型广播

一旦您将`BroadcastsEvents` trait添加到您的模型中并定义了模型的`broadcastOn`方法，您就可以开始在客户端应用程序中监听广播的模型事件。在开始之前，您可能希望查阅完整的[事件监听文档](#listening-for-events)。

首先，使用`private`方法获取一个通道实例，然后调用`listen`方法来监听指定的事件。通常，传递给`private`方法的通道名称应该对应于Laravel的[模型广播规则](#model-broadcasting-conventions)。

获取通道实例后，您可以使用`listen`方法来监听特定事件。由于模型广播事件与应用程序的`App\Events`目录中的"实际"事件不相关联，因此必须在事件名称前加上`.`以表示它不属于特定的命名空间。每个模型广播事件都有一个`model`属性，其中包含模型的所有可广播属性：

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>
## 客户端事件

> **注意**
> 当使用[Pusher Channels](https://pusher.com/channels)时，您必须在[应用程序仪表板](https://dashboard.pusher.com/)的"应用程序设置"部分中启用"客户端事件"选项，以便发送客户端事件。

有时您可能希望将事件广播给其他连接的客户端，而根本不会触发您的Laravel应用程序。这对于诸如"正在输入"通知非常有用，其中您希望向应用程序的用户通知另一个用户正在给定屏幕上输入消息。



要广播客户端事件，你可以使用 Echo 的 `whisper` 方法：

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

要监听客户端事件，你可以使用 `listenForWhisper` 方法：

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 通知

通过将事件广播与 [notifications](/docs/laravel/10.x/notifications) 配对，你的 JavaScript 应用程序可以在新通知发生时接收它们，而无需刷新页面。在开始之前，请务必阅读有关使用 [广播通知频道](/docs/laravel/10.x/notifications#broadcast-notifications) 的文档。

一旦你配置了一个使用广播频道的通知，你就可以使用 Echo 的 `notification` 方法来监听广播事件。请记住，通道名称应与接收通知的实体的类名称匹配：

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

在这个例子中，所有通过 `broadcast` 通道发送到 `App\Models\User` 实例的通知都会被回调接收。 `App.Models.User.{id}` 频道的频道授权回调包含在 Laravel 框架附带的默认` BroadcastServiceProvider` 中。

