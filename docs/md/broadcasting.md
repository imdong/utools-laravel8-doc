# 广播系统

- [简介](#introduction)
- [服务端配置](#server-side-installation)
    - [配置](#configuration)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
    - [开源替代品](#open-source-alternatives)
- [客户端配置](#client-side-installation)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
- [概念综述](#concept-overview)
    - [使用示例程序](#using-example-application)
- [定义广播事件](#defining-broadcast-events)
    - [广播名称](#broadcast-name)
    - [广播数据](#broadcast-data)
    - [广播队列](#broadcast-queue)
    - [广播条件](#broadcast-conditions)
    - [广播 & 数据库事务](#broadcasting-and-database-transactions)
- [授权频道](#authorizing-channels)
    - [定义授权路由](#defining-authorization-routes)
    - [定义授权回调](#defining-authorization-callbacks)
    - [定义频道类](#defining-channel-classes)
- [广播事件](#broadcasting-events)
    - [只广播给他人](#only-to-others)
    - [自定义连接](#customizing-the-connection)
- [接收广播](#receiving-broadcasts)
    - [对事件进行监听](#listening-for-events)
    - [退出频道](#leaving-a-channel)
    - [命名空间](#namespaces)
- [Presence 频道](#presence-channels)
    - [授权 Presence 频道](#authorizing-presence-channels)
    - [加入 Presence 频道](#joining-presence-channels)
    - [广播到 Presence 频道](#broadcasting-to-presence-channels)
- [广播模型](#model-broadcasting)
    - [广播约定模型](#model-broadcasting-conventions)
    - [监听广播模型](#listening-for-model-broadcasts)
- [客户端事件](#client-events)
- [消息通知](#notifications)

<a name="introduction"></a>
## 简介

在现代的 web 应用程序中，WebSockets 被用来实现实时、即时更新用户接口。当服务器上的数据更新后，更新信息会通过 WebSocket 连接发送到客户端等待处理。为了在 UI 中展示出这些数据的变化相比于不停地轮询应用程序，WebSockets 是一种更加可靠和高效的选择。

举一个例子，假设在应用程序中能够导出用户的 CSV 数据并且发送给他们。可是创建 CSV 文件要花费很长时间，因此你选择使用 [队列任务](/docs/laravel/9.x/queues)去创建文件和发送邮件。当创建了 CSV 文件并将其发送给用户后，我们能够创建使用一个广播事件比如 `App\Events\UserDataExported` ，然后在应用中利用 JavaScript 来接收这个事件。一旦接收到事件，我们就可以向用户显示一条消息，表明他们的 CSV 已经通过电子邮件发送给他们，而不需要他们刷新页面。



为了帮助您构建这些类型的功能，Laravel 通过 WebSocket 连接使它很容易的去「广播」您的服务端 Laravel [事件](/docs/laravel/9.x/events)。广播 Laravel 事件允许您在服务器端 Laravel 应用程序和客户端 JavaScript 应用程序之间共享相同的事件名称和数据。

广播背后的核心概念很简单：客户端连接到前端的命名频道，而您的 Laravel 应用程序将事件广播到后端的这些频道。这些事件可以包含您希望提供给前端的任何其他数据。

<a name="supported-drivers"></a>
#### 支持的驱动程序

默认情况下，Laravel 包含两个服务器端广播驱动程序供您选择：[Pusher Channels](https://pusher.com/channels) 和 [Ably](https://ably.io)。 但是，社区驱动的软件包，例如 [laravel-websockets](https://beyondco.de/docs/laravel-websockets/getting-started/introduction) 和 [soketi](https://docs.soketi.app/) 提供 不需要商业广播提供商的其他广播驱动程序。

> 技巧：在深入了解事件广播之前，请确保您已阅读 Laravel 关于 [事件和监听](/docs/laravel/9.x/events "事件和监听") 的文档。

<a name="server-side-installation"></a>
## 服务器端安装

要开始使用 Laravel 的事件广播，我们需要在 Laravel 应用程序中进行一些配置以及安装一些包。

事件广播由服务器端广播驱动程序完成，该驱动程序广播您的 Laravel 事件，以便 Laravel Echo（一个 JavaScript 库）可以在浏览器客户端中接收它们。 不用担心 - 我们将逐步完成安装过程的每个部分。

<a name="configuration"></a>
### 配置

您应用程序的所有事件广播配置都存储在 config/broadcasting.php 配置文件中。 Laravel 支持几个开箱即用的广播驱动程序：[Pusher Channels](https://pusher.com/channels)、[Redis](/docs/laravel/9.x/redis) 和一个用于本地的 `log` 驱动程序 开发和调试。 此外，还包含一个 `null` 驱动程序，允许您在测试期间完全禁用广播。 `config/broadcasting.php` 配置文件中包含每个驱动程序的配置示例。



<a name="broadcast-service-provider"></a>
#### 广播服务提供商

在广播任何事件之前，您首先需要注册 `App\Providers\BroadcastServiceProvider`。在新的 Laravel 应用程序中，您只需在 `config/app.php` 配置文件的 `providers` 数组中取消注释此提供程序。这个 `BroadcastServiceProvider` 包含注册广播授权路由和回调所需的代码。

<a name="queue-configuration"></a>
#### 队列配置

您还需要配置和运行 [queue worker](/docs/laravel/9.x/queues)。所有事件广播都是通过排队作业完成的，因此您的应用程序的响应时间不会受到广播事件的严重影响。

<a name="pusher-channels"></a>
### Pusher Channels

如果您计划使用 [Pusher Channels](https://pusher.com/channels) 广播您的事件，您应该使用 Composer 包管理器安装 Pusher Channels PHP SDK：

```shell
composer require pusher/pusher-php-server
```

接下来，您应该在 config/broadcasting.php 配置文件中配置您的 Pusher Channels 凭据。 此文件中已包含一个 Pusher Channels 配置示例，允许您快速指定您的密钥、秘密和应用程序 ID。 通常，这些值应通过 `PUSHER_APP_KEY`、`PUSHER_APP_SECRET` 和 `PUSHER_APP_ID` [环境变量](/docs/laravel/9.x/configuration#environment-configuration) 设置：

```ini
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=mt1
```

`config/broadcasting.php` 文件的 `pusher` 配置还允许您指定 Channels 支持的其他 `options`，例如集群。

接下来，您需要在 `.env` 文件中将广播驱动程序更改为 `pusher`：

```ini
BROADCAST_DRIVER=pusher
```



最后，您可以安装和配置 [Laravel Echo](#client-side-installation)，它将在客户端接收广播事件。

<a name="pusher-compatible-open-source-alternatives"></a>
#### 开源 Pusher 替代方案

[laravel-websockets](https://github.com/beyondcode/laravel-websockets) 和 [soketi](https://docs.soketi.app/) 包为 Laravel 提供了与 Pusher 兼容的 WebSocket 服务器。 这些包允许您在没有商业 WebSocket 提供程序的情况下利用 Laravel 广播的全部功能。 有关安装和使用这些软件包的更多信息，请参阅我们关于 [开源替代品](#open-source-alternatives) 的文档。

<a name="ably"></a>
### Ably

如果您计划使用 [Ably](https://ably.io) 广播您的活动，您应该使用 Composer 包管理器安装 Ably PHP SDK：

```shell
composer require ably/ably-php
```

接下来，您应该在 config/broadcasting.php 配置文件中配置您的 Ably 凭据。此文件中已包含一个示例 Ably 配置，允许您快速指定密钥。通常，此值应通过 `ABLY_KEY` [环境变量](/docs/laravel/9.x/configuration#environment-configuration) 设置：

```ini
ABLY_KEY=your-ably-key
```

接下来，您需要在 `.env` 文件中将广播驱动程序更改为 `ably`：

```ini
BROADCAST_DRIVER=ably
```

最后，您可以安装和配置 [Laravel Echo](#client-side-installation)，它将在客户端接收广播事件。

<a name="open-source-alternatives"></a>
### 开源替代方案

<a name="open-source-alternatives-php"></a>
#### PHP

[laravel-websockets](https://github.com/beyondcode/laravel-websockets) 包是一个纯 PHP、Pusher 兼容的 Laravel WebSocket 包。 这个包允许你在没有商业 WebSocket 提供者的情况下利用 Laravel 广播的全部功能。 有关安装和使用此软件包的更多信息，请参阅其 [官方文档](https://beyondco.de/docs/laravel-websockets)。



<a name="open-source-alternatives-node"></a>
#### Node

[Soketi](https://github.com/soketi/soketi) 是一个基于 Node 的、Pusher 兼容的 Laravel WebSocket 服务器。在底层，Soketi 利用 µWebSockets.js 实现了极高的可扩展性和速度。这个包允许你在没有商业 WebSocket 提供者的情况下利用 Laravel 广播的全部功能。有关安装和使用此软件包的更多信息，请参阅其[官方文档](https://docs.soketi.app/)。

<a name="client-side-installation"></a>
## 客户端安装

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo) 是一个 JavaScript 库，可以轻松订阅频道和收听服务器端广播驱动程序广播的事件。 你可以通过 NPM 包管理器安装 Echo。在此示例中，我们还将安装 `pusher-js` 包，因为我们将使用 Pusher Channels 广播器：

```shell
npm install --save-dev laravel-echo pusher-js
```

安装 Echo 后，您就可以在应用程序的 JavaScript 中创建一个新的 Echo 实例了。一个很好的地方是在 Laravel 框架中包含的 `resources/js/bootstrap.js` 文件的底部。默认情况下，此文件中已包含一个示例 Echo 配置 - 您只需取消注释即可：

```js
import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

根据您的需要取消注释并调整 Echo 配置后，您可以编译应用程序的资产：

```shell
npm run dev
```

> 技巧：要了解有关编译应用程序的 JavaScript 资产的更多信息，请参阅 [Laravel Mix](/docs/laravel/9.x/mix "Laravel Mix") 上的文档。



<a name="using-an-existing-client-instance"></a>
#### 使用现有的客户端实例

如果您已经有一个您希望 Echo 使用的预配置 Pusher Channels 客户端实例，您可以通过 `client` 配置选项将其传递给 Echo：

```js
import Echo from 'laravel-echo';

const client = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-channels-key',
    client: client
});
```

<a name="client-ably"></a>
### Ably

[Laravel Echo](https://github.com/laravel/echo) 是一个 JavaScript 库，可以轻松订阅频道和收听服务器端广播驱动程序广播的事件。你可以通过 NPM 包管理器安装 Echo。 在本例中，我们还将安装 `pusher-js` 包。

你可能想知道为什么我们要安装 `pusher-js` JavaScript 库，即使我们使用 Ably 来广播我们的事件。值得庆幸的是，Ably 包含一个 Pusher 兼容模式，它允许我们在客户端应用程序中侦听事件时使用 Pusher 协议：

```shell
npm install --save-dev laravel-echo pusher-js
```

**在继续之前，您应该在 Ably 应用程序设置中启用 Pusher 协议支持。您可以在 Ably 应用程序设置仪表板的“协议适配器设置”部分启用此功能。**

安装 Echo 后，您就可以在应用程序的 JavaScript 中创建一个新的 Echo 实例了。 一个很好的地方是在 Laravel 框架中包含的 `resources/js/bootstrap.js` 文件的底部。默认情况下，此文件中已包含示例 Echo 配置；然而，`bootstrap.js` 文件中的默认配置是为 Pusher 设计的。 您可以复制以下配置以将您的配置转换为 Ably：

```js
import Echo from 'laravel-echo';

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```



请注意，我们的 Ably Echo 配置引用了一个 `MIX_ABLY_PUBLIC_KEY` 环境变量。这个变量的值应该是你的 Ably 公钥。您的公钥是出现在 `:` 字符之前的 Ably 密钥部分。

根据您的需要取消注释并调整 Echo 配置后，您可以编译应用程序的资产：

```shell
npm run dev
```

> 技巧：要了解有关编译应用程序的 JavaScript 资产的更多信息，请参阅 [Laravel Mix](/docs/laravel/9.x/mix/ "Laravel Mix") 上的文档。

<a name="concept-overview"></a>
## 概念概述

Laravel 的事件广播允许您使用基于驱动程序的 WebSockets 方法将服务器端 Laravel 事件广播到客户端 JavaScript 应用程序。 目前，Laravel 附带 [Pusher Channels](https://pusher.com/channels) 和 [Ably](https://ably.io) 驱动程序。 使用 [Laravel Echo](#client-side-installation) JavaScript 包可以在客户端轻松使用这些事件。

事件通过「频道」广播，可以指定为公共或私人。您的应用程序的任何访问者都可以订阅公共频道而无需任何身份验证或授权；但是，为了订阅私人频道，用户必须经过身份验证并获得授权才能在该频道上收听。

> 技巧：如果您想探索 Pusher 的开源替代品，请查看 [开源替代品](#open-source-alternatives)。

<a name="using-example-application"></a>
### 使用示例应用程序

在深入了解事件广播的每个组件之前，让我们以电子商务商店为例进行高级概述。

在我们的应用程序中，假设我们有一个页面允许用户查看其订单的运输状态。我们还假设在应用程序处理运输状态更新时触发了一个 `OrderShipmentStatusUpdated` 事件：

    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);



<a name="the-shouldbroadcast-interface"></a>
#### `ShouldBroadcast` 接口

当用户查看他们的一个订单时，我们不希望他们必须刷新页面才能查看状态更新。相反，我们希望在创建应用程序时将更新广播到应用程序。所以，我们需要用 `ShouldBroadcast` 接口标记 `OrderShipmentStatusUpdated` 事件。这将指示 Laravel 在事件被触发时广播它：

    <?php

    namespace App\Events;

    use App\Order;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class OrderShipmentStatusUpdated implements ShouldBroadcast
    {
        /**
         * 订单实例。
         *
         * @var \App\Order
         */
        public $order;
    }

`ShouldBroadcast` 接口要求我们的事件定义一个 `broadcastOn` 方法。此方法负责返回事件应在其上广播的频道。此方法的空存根已在生成的事件类上定义，因此我们只需填写其详细信息。我们只希望订单的创建者能够查看状态更新，因此我们将在与订单绑定的私人频道上广播该事件：

    /**
     * 获取事件应广播的频道.
     *
     * @return \Illuminate\Broadcasting\PrivateChannel
     */
    public function broadcastOn()
    {
        return new PrivateChannel('orders.'.$this->order->id);
    }

<a name="example-application-authorizing-channels"></a>
#### 授权频道

请记住，用户必须获得授权才能在私人频道上收听。我们可以在应用程序的 `routes/channels.php` 文件中定义我们的频道授权规则。在此示例中，我们需要验证任何尝试在私有 `orders.1` 频道上收听的用户实际上是订单的创建者：

    use App\Models\Order;

    Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });



`channel` 方法接受两个参数：频道名称和返回 `true` 或 `false` 指示用户是否有权收听频道的回调。

所有授权回调都接收当前经过身份验证的用户作为其第一个参数，并将任何其他通配符参数作为其后续参数。在此示例中，我们使用 `{orderId}` 占位符来指示频道名称的「ID」部分是通配符。

<a name="listening-for-event-broadcasts"></a>
#### 监听事件广播

接下来，剩下的就是在我们的 JavaScript 应用程序中监听事件。我们可以使用 [Laravel Echo](#client-side-installation) 来做到这一点。首先，我们将使用 `private` 方法订阅私人频道。然后，我们可以使用 `listen` 方法来监听 `OrderShipmentStatusUpdated` 事件。默认情况下，所有事件的公共属性都将包含在广播事件中：

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## 定义广播事件

为了通知 Laravel 一个给定的事件应该被广播，你必须在事件类上实现 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 接口。该接口已经导入到框架生成的所有事件类中，因此您可以轻松地将其添加到您的任何事件中。

`ShouldBroadcast` 接口要求你实现一个方法：`broadcastOn`。 `broadcastOn` 方法应返回事件应在其上广播的频道或频道数组。 频道应该是`Channel`、`PrivateChannel`或`PresenceChannel`的实例。 `Channel` 的实例代表任何用户都可以订阅的公共频道，而 `PrivateChannels` 和 `PresenceChannels` 代表需要 [频道授权](#authorizing-channels) 的私人频道：

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
         * 创建服务器的用户。
         *
         * @var \App\Models\User
         */
        public $user;

        /**
         * 创建一个新的事件实例。
         *
         * @param  \App\Models\User  $user
         * @return void
         */
        public function __construct(User $user)
        {
            $this->user = $user;
        }

        /**
         * 获取事件应该广播的频道。
         *
         * @return Channel|array
         */
        public function broadcastOn()
        {
            return new PrivateChannel('user.'.$this->user->id);
        }
    }



在实现了 `ShouldBroadcast` 接口之后，你只需要像往常一样[触发事件](/docs/laravel/9.x/events)。触发事件后，[排队作业](/docs/laravel/9.x/queues) 将使用您指定的广播驱动程序自动广播事件。

<a name="broadcast-name"></a>
### 广播名称

默认情况下，Laravel 将使用事件的类名广播事件。但是，您可以通过在事件上定义一个 `broadcastAs` 方法来自定义广播名称：

    /**
     * 事件的广播名称。
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'server.created';
    }

如果您使用 `broadcastAs` 方法自定义广播名称，则应确保使用前导 `.` 字符注册您的侦听器。 这将指示 Echo 不要将应用程序的命名空间添加到事件中：

    .listen('.server.created', function (e) {
        ....
    });

<a name="broadcast-data"></a>
### 广播数据

当一个事件被广播时，它的所有 `public` 属性都会自动序列化并作为事件的有效负载广播，允许您从 JavaScript 应用程序访问它的任何公共数据。因此，例如，如果您的事件有一个包含 Eloquent 模型的公共 `$user` 属性，则事件的广播负载将是：

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

但是，如果您希望对广播负载进行更细粒度的控制，您可以在事件中添加一个 `broadcastWith` 方法。此方法应返回您希望作为事件有效负载广播的数据数组：

    /**
     * 获取要广播的数据。
     *
     * @return array
     */
    public function broadcastWith()
    {
        return ['id' => $this->user->id];
    }

<a name="broadcast-queue"></a>


### 广播队列

默认情况下，每个广播事件都放置在 `queue.php` 配置文件中指定的默认队列连接的默认队列中。 您可以通过在事件类上定义 `connection` 和 `queue` 属性来自定义广播者使用的队列连接和名称：

    /**
     * 广播事件时使用的队列连接的名称。
     *
     * @var string
     */
    public $connection = 'redis';

    /**
     * 放置广播作业的队列的名称。
     *
     * @var string
     */
    public $queue = 'default';

或者，您可以通过在您的事件上定义一个 `broadcastQueue` 方法来自定义队列名称：

    /**
     * 放置广播作业的队列的名称。
     *
     * @return string
     */
    public function broadcastQueue()
    {
        return 'default';
    }

如果您想使用 `sync` 队列而不是默认队列驱动程序广播您的事件，您可以实现 `ShouldBroadcastNow` 接口而不是 `ShouldBroadcast`：

    <?php

    use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

    class OrderShipmentStatusUpdated implements ShouldBroadcastNow
    {
        //
    }

<a name="broadcast-conditions"></a>
### 广播条件

有时您只想在给定条件为真时才广播您的事件。您可以通过向您的事件类添加一个 `broadcastWhen` 方法来定义这些条件：

    /**
     * 确定是否应广播此事件。
     *
     * @return bool
     */
    public function broadcastWhen()
    {
        return $this->order->value > 100;
    }

<a name="broadcasting-and-database-transactions"></a>
#### 广播和数据库事务

当广播事件在数据库事务中被分派时，它们可能在数据库事务提交之前由队列处理。发生这种情况时，您在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。如果您的事件依赖于这些模型，则在处理广播事件的作业时可能会出现意外错误。



如果您的队列连接的 `after_commit` 配置选项设置为 `false`，您仍然可以通过在事件类上定义 `$afterCommit` 属性来指示应在提交所有打开的数据库事务后调度特定的广播事件：

    <?php

    namespace App\Events;

    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class ServerCreated implements ShouldBroadcast
    {
        use SerializesModels;

        public $afterCommit = true;
    }

> 技巧：要了解有关解决这些问题的更多信息，请查看有关 [队列任务和数据库事务](/docs/laravel/9.x/queues#jobs-and-database-transactions "队列任务和数据库事务") 的文档。

<a name="authorizing-channels"></a>
## 授权频道

私人频道要求您授权当前经过身份验证的用户可以实际收听频道。这是通过使用频道名称向您的 Laravel 应用程序发出 HTTP 请求并允许您的应用程序确定用户是否可以在该频道上收听来实现的。 使用 [Laravel Echo](#client-side-installation) 时，会自动发出授权订阅私人频道的 HTTP 请求；但是，您确实需要定义正确的路由来响应这些请求。

<a name="defining-authorization-routes"></a>
### 定义授权路由

值得庆幸的是，Laravel 可以轻松定义响应通道授权请求的路由。在 Laravel 应用程序包含的 `App\Providers\BroadcastServiceProvider` 中，您将看到对 `Broadcast::routes` 方法的调用。此方法将注册 `/broadcasting/auth` 路由来处理授权请求：

    Broadcast::routes();

`Broadcast::routes` 方法会自动将其路由放置在 `web` 中间件组中；但是，如果您想自定义分配的属性，可以将路由属性数组传递给方法：

    Broadcast::routes($attributes);



<a name="customizing-the-authorization-endpoint"></a>
#### 自定义授权端点

默认情况下，Echo 将使用 `/broadcasting/auth` 端点来授权频道访问。但是，您可以通过将 `authEndpoint` 配置选项传递给 Echo 实例来指定自己的授权端点：

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="customizing-the-authorization-request"></a>
#### 自定义授权请求

您可以通过在初始化 Echo 时提供自定义授权器来自定义 Laravel Echo 如何执行授权请求：

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
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="defining-authorization-callbacks"></a>
### 定义授权回调

接下来，我们需要定义实际确定当前经过身份验证的用户是否可以收听给定频道的逻辑。这是在应用程序中包含的 `routes/channels.php` 文件中完成的。在这个文件中，你可以使用 `Broadcast::channel` 方法注册频道授权回调：

    Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });

`channel` 方法接受两个参数：频道名称和返回 `true` 或 `false` 指示用户是否有权收听频道的回调。

所有授权回调都接收当前经过身份验证的用户作为其第一个参数，并将任何其他通配符参数作为其后续参数。在此示例中，我们使用 `{orderId}` 占位符来指示频道名称的「ID」部分是通配符。



<a name="authorization-callback-model-binding"></a>
#### 授权回调模型绑定

就像 HTTP 路由一样，通道路由也可以利用隐式和显式 [路由模型绑定](/docs/laravel/9.x/routing#route-model-binding)。例如，您可以请求一个实际的 `Order` 模型实例，而不是接收字符串或数字订单 ID：

    use App\Models\Order;

    Broadcast::channel('orders.{order}', function ($user, Order $order) {
        return $user->id === $order->user_id;
    });

> 注意：与 HTTP 路由模型绑定不同，通道模型绑定不支持自动 [隐式模型绑定范围](/docs/laravel/9.x/routing#implicit-model-binding-scoping)。但是，这很少会成为问题，因为大多数通道都可以基于单个模型的唯一主键来确定范围。

<a name="authorization-callback-authentication"></a>
#### 授权回调认证

私有和在线广播频道通过您应用程序的默认身份验证保护对当前用户进行身份验证。如果用户未通过身份验证，则通道授权将自动被拒绝，并且永远不会执行授权回调。但是，您可以分配多个自定义保护，以在必要时对传入请求进行身份验证：

    Broadcast::channel('channel', function () {
        // ...
    }, ['guards' => ['web', 'admin']]);

<a name="defining-channel-classes"></a>
### 定义频道类

如果您的应用程序使用许多不同的频道，您的 `routes/channels.php` 文件可能会变得庞大。因此，您可以使用通道类，而不是使用闭包来授权通道。要生成通道类，请使用 `make:channel` Artisan 命令。此命令将在 `App/Broadcasting` 目录中放置一个新的频道类。

```shell
php artisan make:channel OrderChannel
```

接下来，在 `routes/channels.php` 文件中注册您的频道：

    use App\Broadcasting\OrderChannel;

    Broadcast::channel('orders.{order}', OrderChannel::class);



最后，您可以将频道的授权逻辑放在频道类的 `join` 方法中。这个 `join` 方法将包含您通常放置在通道授权闭包中的相同逻辑。您还可以利用通道模型绑定：

    <?php

    namespace App\Broadcasting;

    use App\Models\Order;
    use App\Models\User;

    class OrderChannel
    {
        /**
         * 创建一个新的通道实例。
         *
         * @return void
         */
        public function __construct()
        {
            //
        }

        /**
         * 验证用户对频道的访问权限。
         *
         * @param  \App\Models\User  $user
         * @param  \App\Models\Order  $order
         * @return array|bool
         */
        public function join(User $user, Order $order)
        {
            return $user->id === $order->user_id;
        }
    }

> 技巧：像 Laravel 中的许多其他类一样，通道类将由 [服务容器](/docs/laravel/9.x/container) 自动解析。因此，您可以在其构造函数中键入提示您的通道所需的任何依赖项。

<a name="broadcasting-events"></a>
## 广播事件

一旦你定义了一个事件并用 `ShouldBroadcast` 接口标记了它，你只需要使用事件的 dispatch 方法来触发事件。事件调度器会注意到该事件被标记为 `ShouldBroadcast` 接口，并将该事件排队以进行广播：

    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);

<a name="only-to-others"></a>
### 只广播给其他人

在构建使用事件广播的应用程序时，您可能偶尔需要将事件广播给给定频道的所有订阅者，但当前用户除外。 您可以使用 `broadcast` 帮助程序和 `toOthers` 方法来完成此操作：

    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->toOthers();

为了更好地理解何时需要使用 `toOthers` 方法，让我们想象一个任务列表应用程序，其中用户可以通过输入任务名称来创建新任务。要创建任务，您的应用程序可能会向 `/task` URL 发出请求，该 URL 会广播任务的创建并返回新任务的 JSON 表示。当您的 JavaScript 应用程序接收到来自端点的响应时，它可能会直接将新任务插入到其任务列表中，如下所示：

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```



但是，请记住，我们还广播了任务的创建。如果您的 JavaScript 应用程序也在侦听此事件以将任务添加到任务列表中，那么您的列表中将有重复的任务：一个来自端点，一个来自广播。您可以通过使用 `toOthers` 方法来指示广播者不要将事件广播给当前用户来解决此问题。

> 注意：您的事件必须使用 `Illuminate\Broadcasting\InteractsWithSockets` 特征才能调用 `toOthers` 方法。

<a name="only-to-others-configuration"></a>
#### 配置

当您初始化 Laravel Echo 实例时，会为连接分配一个套接字 ID。如果您使用全局 [Axios](https://github.com/mzabriskie/axios) 实例从 JavaScript 应用程序发出 HTTP 请求，则套接字 ID 将自动附加到每个传出请求作为 `X-Socket- ID`标头。然后，当你调用 `toOthers` 方法时，Laravel 将从头中提取套接字 ID 并指示广播器不要广播到具有该套接字 ID 的任何连接。

如果您没有使用全局 Axios 实例，您将需要手动配置 JavaScript 应用程序以发送带有所有传出请求的“X-Socket-ID”标头。您可以使用 `Echo.socketId` 方法检索套接字 ID：

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### 自定义连接

如果您的应用程序与多个广播连接交互，并且您想使用默认广播器以外的广播器广播事件，您可以使用 `via` 方法指定将事件推送到哪个连接：

    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');



或者，您可以通过在事件的构造函数中调用 `broadcastVia` 方法来指定事件的广播连接。但是，在这样做之前，您应该确保事件类使用 `InteractsWithBroadcasting` 特征：

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
         *
         * @return void
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

一旦你[安装并实例化了 Laravel Echo](#client-side-installation)，你就可以开始监听从你的 Laravel 应用程序广播的事件了。首先，使用 `channel` 方法获取通道实例，然后调用 `listen` 方法监听指定事件：

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

如果您想在私人频道上监听事件，请改用 `private` 方法。 您可以继续调用 `listen` 方法以在单个通道上侦听多个事件：

```js
Echo.private(`orders.${this.order.id}`)
    .listen(...)
    .listen(...)
    .listen(...);
```

<a name="stop-listening-for-events"></a>
#### 停止监听事件

如果您想在不 [离开频道](#leaving-a-channel) 的情况下停止收听给定事件，您可以使用 `stopListening` 方法：

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### 离开频道



要离开频道，您可以在 Echo 实例上调用 `leaveChannel` 方法：

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

如果你想离开一个频道及其相关的私人和在线频道，你可以调用 `leave` 方法：

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### 命名空间

您可能已经注意到，在上面的示例中，我们没有为事件类指定完整的 `App\Events` 命名空间。这是因为 Echo 会自动假定事件位于 `App\Events` 命名空间中。但是，您可以在实例化 Echo 时通过传递 `namespace` 配置选项来配置根命名空间：

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

或者，您可以在使用 Echo 订阅事件类时使用 `.` 作为事件类的前缀。这将允许您始终指定完全限定的类名：

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        //
    });
```

<a name="presence-channels"></a>
## 存在频道

在线状态频道建立在私人频道的安全性之上，同时公开了知道谁订阅了频道的附加功能。这使得构建强大的协作应用程序功能变得容易，例如在另一个用户查看同一页面时通知用户或列出聊天室的居民。

<a name="authorizing-presence-channels"></a>
### 授权存在频道

所有出席频道也是私人频道；因此，用户必须[授权访问他们](#authorizing-channels)。但是，在为出席频道定义授权回调时，如果用户被授权加入频道，则不会返回 `true`。相反，您应该返回有关用户的数据数组。



授权回调返回的数据将提供给 JavaScript 应用程序中的存在通道事件侦听器。如果用户未被授权加入出席频道，则应返回 `false` 或 `null`：

    Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
        if ($user->canJoinRoom($roomId)) {
            return ['id' => $user->id, 'name' => $user->name];
        }
    });

<a name="joining-presence-channels"></a>
### 加入存在频道

要加入在线状态频道，您可以使用 Echo 的 `join` 方法。 `join` 方法将返回 `PresenceChannel` 实现，连同公开 `listen` 方法，允许您订阅 `here`、`joining` 和 `leaving` 事件。

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        //
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

加入频道成功后，`here` 回调将立即执行，并会收到一个数组，其中包含当前订阅频道的所有其他用户的用户信息。 `joining` 方法会在新用户加入频道时执行，而 `leaving` 方法会在用户离开频道时执行。 当身份验证端点返回 200 以外的 HTTP 状态码或解析返回的 JSON 出现问题时，将执行 `error` 方法。

<a name="broadcasting-to-presence-channels"></a>
### 广播到存在频道

状态频道可以像公共或私人频道一样接收事件。以聊天室为例，我们可能希望将「NewMessage」事件广播到房间的出席频道。 为此，我们将从事件的 `broadcastOn` 方法返回一个 `PresenceChannel` 的实例：

    /**
     * 获取事件应该广播的频道。
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('room.'.$this->message->room_id);
    }



与其他事件一样，您可以使用 `broadcast` 助手和 `toOthers` 方法来排除当前用户接收广播：

    broadcast(new NewMessage($message));

    broadcast(new NewMessage($message))->toOthers();

作为典型的其他类型事件，您可以使用 Echo 的 `listen` 方法监听发送到存在通道的事件：

```js
Echo.join(`chat.${roomId}`)
    .here(...)
    .joining(...)
    .leaving(...)
    .listen('NewMessage', (e) => {
        //
    });
```

<a name="model-broadcasting"></a>
## 模型广播

> 注意：在阅读以下有关模型广播的文档之前，我们建议您熟悉 Laravel 模型广播服务的一般概念以及如何手动创建和收听广播事件。

在创建、更新或删除应用程序的 [Eloquent 模型](/docs/laravel/9.x/eloquent) 时广播事件是很常见的。 当然，这可以通过手动[为 Eloquent 模型状态更改定义自定义事件](/docs/laravel/9.x/eloquent#events) 并使用 `ShouldBroadcast` 接口标记这些事件来轻松完成。

但是，如果您在应用程序中没有将这些事件用于任何其他目的，则仅出于广播它们的目的而创建事件类可能会很麻烦。为了解决这个问题，Laravel 允许您指示 Eloquent 模型应该自动广播其状态更改。

首先，您的 Eloquent 模型应该使用 `Illuminate\Database\Eloquent\BroadcastsEvents` 特征。此外，模型应该定义一个 `broadcastsOn` 方法，该方法将返回模型事件应该在其上广播的频道数组：

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * 获取帖子所属的用户。
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 获取模型事件应该广播的频道。
     *
     * @param  string  $event
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn($event)
    {
        return [$this, $this->user];
    }
}
```



一旦您的模型包含此特征并定义其广播通道，它将在模型实例被创建、更新、删除、删除或恢复时自动开始广播事件。

此外，您可能已经注意到 `broadcastOn` 方法接收字符串 `$event` 参数。该参数包含模型上发生的事件类型，其值为`created`、`updated`、`deleted`、`trashed`或`restored`。通过检查此变量的值，您可以确定模型应该为特定事件广播到哪些频道（如果有）：

```php
/**
 * 获取模型事件应该广播的频道。
 *
 * @param  string  $event
 * @return \Illuminate\Broadcasting\Channel|array
 */
public function broadcastOn($event)
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a name="customizing-model-broadcasting-event-creation"></a>
#### 自定义模型广播事件创建

有时，您可能希望自定义 Laravel 如何创建底层模型广播事件。您可以通过在 Eloquent 模型上定义一个 `newBroadcastableEvent` 方法来完成此操作。这个方法应该返回一个 `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred` 实例：

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * 为模型创建一个新的可广播模型事件。
 *
 * @param  string  $event
 * @return \Illuminate\Database\Eloquent\BroadcastableModelEventOccurred
 */
protected function newBroadcastableEvent($event)
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### 广播约定模型

<a name="model-broadcasting-channel-conventions"></a>
#### 广播约定

您可能已经注意到，上面模型示例中的 `broadcastOn` 方法没有返回 `Channel` 实例。相反，直接返回了 Eloquent 模型。如果模型的 `broadcastOn` 方法返回 Eloquent 模型实例（或包含在该方法返回的数组中），Laravel 将使用模型的类名和主键标识符作为通道自动为模型实例化一个私有通道实例 姓名。



因此，`id`为`1`的`App\Models\User`模型将被转换为名称为`App.Models.User.1`的`Illuminate\Broadcasting\PrivateChannel`实例。当然，除了从模型的 `broadcastOn` 方法返回 Eloquent 模型实例之外，您还可以返回完整的 `Channel` 实例，以便完全控制模型的通道名称：

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * 获取模型事件应该广播的频道。
 *
 * @param  string  $event
 * @return \Illuminate\Broadcasting\Channel|array
 */
public function broadcastOn($event)
{
    return [new PrivateChannel('user.'.$this->id)];
}
```

如果您打算从模型的 `broadcastOn` 方法显式返回一个通道实例，则可以将 Eloquent 模型实例传递给通道的构造函数。这样做时，Laravel 将使用上面讨论的模型通道约定将 Eloquent 模型转换为通道名称字符串：

```php
return [new Channel($this->user)];
```

如果需要确定模型的频道名称，可以在任何模型实例上调用 `broadcastChannel` 方法。例如，此方法为 `App\Models\User` 模型返回字符串 `App.Models.User.1`，其 `id` 为 `1`：

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>
#### 事件约定

由于模型广播事件不与应用程序的`App\Events`目录中的「实际」事件相关联，因此根据约定为它们分配名称和有效负载。Laravel 的约定是使用模型的类名（不包括命名空间）和触发广播的模型事件的名称来广播事件。

因此，例如，对 `App\Models\Post` 模型的更新会将事件作为 `PostUpdated` 广播到您的客户端应用程序，并带有以下有效负载：

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



删除 `App\Models\User` 模型会广播一个名为 `UserDeleted` 的事件。

如果您愿意，您可以通过向模型添加 `broadcastAs` 和 `broadcastWith` 方法来定义自定义广播名称和有效负载。这些方法接收正在发生的模型事件/操作的名称，允许您为每个模型操作自定义事件的名称和有效负载。如果从 `broadcastAs` 方法返回 `null`，Laravel 将在广播事件时使用上面讨论的模型广播事件名称约定：

```php
/**
 * 模型事件的广播名称。
 *
 * @param  string  $event
 * @return string|null
 */
public function broadcastAs($event)
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * 获取要为模型广播的数据。
 *
 * @param  string  $event
 * @return array
 */
public function broadcastWith($event)
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a name="listening-for-model-broadcasts"></a>
### 监听模型广播

一旦你为你的模型添加了 `BroadcastsEvents` 特征并定义了模型的 `broadcastOn` 方法，你就可以开始在客户端应用程序中监听广播的模型事件了。在开始之前，您可能希望查阅有关 [listening for events](#listening-for-events) 的完整文档。

首先，使用 `private` 方法获取通道的实例，然后调用 `listen` 方法来监听指定事件。通常，赋予 `private` 方法的频道名称应对应于 Laravel 的 [模型广播约定](#model-broadcasting-conventions)。

一旦你获得了一个通道实例，你可以使用 `listen` 方法来监听一个特定的事件。由于模型广播事件不与应用程序的`App\Events`目录中的「实际」事件相关联，因此 [事件名称](#model-broadcasting-event-conventions) 必须以 `.` 为前缀以表明它确实如此不属于特定的命名空间。每个模型广播事件都有一个“模型”属性，其中包含模型的所有可广播属性：

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```



<a name="client-events"></a>
## 客户端事件

> 技巧：使用 [Pusher Channels](https://pusher.com/channels) 时，您必须在 [应用程序仪表板](https://dashboard.pusher.com) 的“应用程序设置”部分中启用“客户端事件”选项 /) 以发送客户端事件。

有时您可能希望将事件广播给其他连接的客户端，而根本不影响您的 Laravel 应用程序。这对于诸如「键入」通知之类的事情特别有用，您希望提醒应用程序的用户另一个用户正在给定屏幕上键入消息。

要广播客户端事件，您可以使用 Echo 的 `whisper` 方法：

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

要监听客户端事件，您可以使用 `listenForWhisper` 方法：

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## 通知

通过将事件广播与 [notifications](/docs/laravel/9.x/notifications) 配对，您的 JavaScript 应用程序可以在新通知发生时接收它们，而无需刷新页面。在开始之前，请务必阅读有关使用 [广播通知频道] 的文档（/docs/laravel/9.x/notifications#broadcast-notifications）。

一旦你配置了一个使用广播频道的通知，你就可以使用 Echo 的 `notification` 方法来监听广播事件。请记住，通道名称应与接收通知的实体的类名称匹配：

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

在这个例子中，所有通过 `broadcast` 通道发送到 `App\Models\User` 实例的通知都会被回调接收。 `App.Models.User.{id}` 频道的频道授权回调包含在 Laravel 框架附带的默认 `BroadcastServiceProvider` 中。

