# 文件存储

- [简介](#introduction)
- [配置](#configuration)
    - [本地驱动](#the-local-driver)
    - [公共磁盘](#the-public-disk)
    - [驱动先决要求](#driver-prerequisites)
    - [分区和只读文件系统](#scoped-and-read-only-filesystems)
    - [Amazon S3 兼容文件系统](#amazon-s3-compatible-filesystems)
- [获取磁盘实例](#obtaining-disk-instances)
    - [按需配置磁盘](#on-demand-disks)
- [检索文件](#retrieving-files)
    - [下载文件](#downloading-files)
    - [文件 URL](#file-urls)
    - [临时 URL](#temporary-urls)
    - [文件元数据](#file-metadata)
- [保存文件](#storing-files)
    - [预置和附加文件](#prepending-appending-to-files)
    - [复制和移动文件](#copying-moving-files)
    - [自动流式传输](#automatic-streaming)
    - [文件上传](#file-uploads)
    - [文件可见性](#file-visibility)
- [删除文件](#deleting-files)
- [目录](#directories)
- [测试](#testing)
- [自定义文件系统](#custom-filesystems)

<a name="introduction"></a>
## 简介

Laravel 提供了一个强大的文件系统抽象，这要感谢 Frank de Jonge 的 [Flysystem](https://github.com/thephpleague/flysystem) PHP 包。Laravel 的 Flysystem 集成提供了 简单的驱动来处理本地文件系统、SFTP 和 Amazon S3。更棒的是，在你的本地开发机器和生产服务器之间切换这些存储选项是非常简单的，因为每个系统的 API 都是一样的。

<a name="configuration"></a>
## 配置

Laravel 的文件系统配置文件位于 `config/filesystems.php`。 在这个文件中，你可以配置你所有的文件系统「磁盘」。每个磁盘代表一个特定的存储驱动器和存储位置。 每种支持的驱动器的配置示例都包含在配置文件中, 因此你可以修改配置以反映你的存储偏好和证书。

`local` 驱动用于与运行Laravel应用程序的服务器上存储的文件进行交互，而 `s3` 驱动用于写入 Amazon 的 S3 云存储服务。

> **注意**
> 你可以配置任意数量的磁盘，甚至可以添加多个使用相同驱动的磁盘。



<a name="the-local-driver"></a>
### 本地驱动

使用  `local` 驱动时，所有文件操作都与 `filesystems` 配置文件中定义的 `root` 目录相关。 默认情况下，此值设置为 `storage/app` 目录。因此，以下方法会把文件存储在 `storage/app/example.txt`中：

    use Illuminate\Support\Facades\Storage;

    Storage::disk('local')->put('example.txt', 'Contents');

<a name="the-public-disk"></a>
### 公共磁盘

在 `filesystems` 配置文件中定义的 `public` 磁盘适用于要公开访问的文件。默认情况下， `public` 磁盘使用 `local` 驱动，并且将这些文件存储在 `storage/app/public`目录下。

要使这些文件可从 web 访问，应创建从 `public/storage` 到 `storage/app/public`的符号链接。这种方式能把可公开访问文件都保留在同一个目录下，以便在使用零停机时间部署系统如 [Envoyer](https://envoyer.io) 的时候，就可以轻松地在不同的部署之间共享这些文件。

你可以使用 Artisan 命令 `storage:link` 来创建符号链接：

```shell
php artisan storage:link
```

一旦一个文件被存储并且已经创建了符号链接，你就可以使用辅助函数 `asset` 来创建文件的 URL：

    echo asset('storage/file.txt');

你可以在 `filesystems` 配置文件中配置额外的符号链接。这些链接将会在运行 `storage:link` 命令时自动创建：

    'links' => [
        public_path('storage') => storage_path('app/public'),
        public_path('images') => storage_path('app/images'),
    ],

<a name="driver-prerequisites"></a>


### 驱动先决要求

<a name="s3-driver-configuration"></a>
#### S3 驱动配置

在使用 S3 驱动之前，你需要通过 Composer 包管理器安装 Flysystem S3 软件包：

```shell
composer require league/flysystem-aws-s3-v3 "^3.0"
```

S3 驱动配置信息位于你的 `config/filesystems.php` 配置文件中。该文件包含一个 S3 驱动的示例配置数组。你可以自由使用自己的 S3 配置和凭证修改此数组。为方便起见，这些环境变量与 AWS CLI 使用的命名约定相匹配。

<a name="ftp-driver-configuration"></a>
#### FTP 驱动配置

在使用 FTP 驱动之前，你需要通过 Composer 包管理器安装 Flysystem FTP 包：

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel 的 Flysystem 能与 FTP 很好的适配；然而，框架的默认 `filesystems.php` 配置文件中并未包含示例配置。如果你需要配置 FTP 文件系统，可以使用下面的配置示例：

    'ftp' => [
        'driver' => 'ftp',
        'host' => env('FTP_HOST'),
        'username' => env('FTP_USERNAME'),
        'password' => env('FTP_PASSWORD'),

        // 可选的 FTP 设置...
        // 'port' => env('FTP_PORT', 21),
        // 'root' => env('FTP_ROOT'),
        // 'passive' => true,
        // 'ssl' => true,
        // 'timeout' => 30,
    ],

<a name="sftp-driver-configuration"></a>
#### SFTP 驱动配置

在使用 SFTP 驱动之前，你需要通过 Composer 包管理器安装 Flysystem SFTP 软件包。

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel 的 Flysystem 能与 SFTP 很好的适配；然而，框架默认的 `filesystems.php` 配置文件中并未包含示例配置。如果你需要配置 SFTP 文件系统，可以使用下面的配置示例：

    'sftp' => [
        'driver' => 'sftp',
        'host' => env('SFTP_HOST'),

        // 基本认证的设置...
        'username' => env('SFTP_USERNAME'),
        'password' => env('SFTP_PASSWORD'),

        // 基于SSH密钥的认证与加密密码的设置...
        'privateKey' => env('SFTP_PRIVATE_KEY'),
        'passphrase' => env('SFTP_PASSPHRASE'),

        // 可选的SFTP设置...
        // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
        // 'maxTries' => 4,
        // 'passphrase' => env('SFTP_PASSPHRASE'),
        // 'port' => env('SFTP_PORT', 22),
        // 'root' => env('SFTP_ROOT', ''),
        // 'timeout' => 30,
        // 'useAgent' => true,
    ],



### 驱动先决条件

<a name="s3-driver-configuration"></a>
#### S3 驱动配置

在使用 S3 驱动之前，你需要通过 Composer 安装 Flysystem S3 包：

```shell
composer require league/flysystem-aws-s3-v3 "^3.0"
```

S3 驱动配置信息位于你的 `config/filesystems.php` 配置文件中。 此文件包含 S3 驱动的示例配置数组。 你可以使用自己的 S3 配置和凭据自由修改此数组。 为方便起见，这些环境变量与 AWS CLI 使用的命名约定相匹配。

<a name="ftp-driver-configuration"></a>
#### FTP 驱动配置

在使用 FTP 驱动之前，你需要通过 Composer 安装 Flysystem FTP 包：

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel 的 Flysystem 集成与 FTP 配合得很好； 但是，框架的默认 `filesystems.php` 配置文件中不包含示例配置。 如果需要配置 FTP 文件系统，可以使用下面的配置示例：

    'ftp' => [
        'driver' => 'ftp',
        'host' => env('FTP_HOST'),
        'username' => env('FTP_USERNAME'),
        'password' => env('FTP_PASSWORD'),

        // 可选的 FTP 设置...
        // 'port' => env('FTP_PORT', 21),
        // 'root' => env('FTP_ROOT'),
        // 'passive' => true,
        // 'ssl' => true,
        // 'timeout' => 30,
    ],

<a name="sftp-driver-configuration"></a>
#### SFTP 驱动配置

在使用 SFTP 驱动之前，你需要通过 Composer 安装 Flysystem SFTP 包：

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel 的 Flysystem 集成与 SFTP 配合得很好； 但是，框架的默认 `filesystems.php` 配置文件中不包含示例配置。 如果你需要配置 SFTP 文件系统，可以使用下面的配置示例：

    'sftp' => [
        'driver' => 'sftp',
        'host' => env('SFTP_HOST'),

        // 基本身份验证设置...
        'username' => env('SFTP_USERNAME'),
        'password' => env('SFTP_PASSWORD'),

        // 基于SSH密钥的加密密码认证设置…
        'privateKey' => env('SFTP_PRIVATE_KEY'),
        'passphrase' => env('SFTP_PASSPHRASE'),

        // 可选的 SFTP 设置...
        // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
        // 'maxTries' => 4,
        // 'passphrase' => env('SFTP_PASSPHRASE'),
        // 'port' => env('SFTP_PORT', 22),
        // 'root' => env('SFTP_ROOT', ''),
        // 'timeout' => 30,
        // 'useAgent' => true,
    ],



<a name="scoped-and-read-only-filesystems"></a>
### 分区和只读文件系统

分区磁盘允许你定义一个文件系统，其中所有的路径都自动带有给定的路径前缀。在创建一个分区文件系统磁盘之前，你需要通过 Composer 包管理器安装一个额外的 Flysystem 包：

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

你可以通过定义一个使用 `scoped` 驱动的磁盘来创建任何现有文件系统磁盘的路径分区实例。例如，你可以创建一个磁盘，它将你现有的 `s3` 磁盘限定在特定的路径前缀上，然后使用你的分区磁盘进行的每个文件操作都将使用指定的前缀：

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

「只读」磁盘允许你创建不允许写入操作的文件系统磁盘。在使用 `read-only` 配置选项之前，你需要通过 Composer 包管理器安装一个额外的 Flysystem 包：

```shell
composer require league/flysystem-read-only "^3.0"
```

接下来，你可以在一个或多个磁盘的配置数组中包含 `read-only` 配置选项：

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 兼容文件系统

默认情况下，你的应用程序的 `filesystems` 配置文件包含一个 `s3` 磁盘的磁盘配置。除了使用此磁盘与 Amazon S3 交互外，你还可以使用它与任何兼容 S3 的文件存储服务（如 [MinIO](https://github.com/minio/minio) 或 [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)）进行交互。

通常，在更新磁盘凭据以匹配你计划使用的服务的凭据后，你只需要更新  `endpoint` 配置选项的值。此选项的值通常通过 `AWS_ENDPOINT` 环境变量定义：

    'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),



<a name="minio"></a>
#### MinIO

为了让 Laravel 的 Flysystem 集成在使用 MinIO 时生成正确的 URL，你应该定义 `AWS_URL` 环境变量，使其与你的应用程序的本地 URL 匹配，并在 URL 路径中包含存储桶名称：

```ini
AWS_URL=http://localhost:9000/local
```

> **警告**
> 当使用 MinIO 时，不支持通过 `temporaryUrl` 方法生成临时存储 URL。

<a name="obtaining-disk-instances"></a>
## 获取磁盘实例

`Storage` Facade 可用于与所有已配置的磁盘进行交互。例如，你可以使用 Facade 中的 `put` 方法将头像存储到默认磁盘。如果你在未先调用 `disk` 方法的情况下调用 `Storage` Facade 中的方法，则该方法将自动传递给默认磁盘：

    use Illuminate\Support\Facades\Storage;

    Storage::put('avatars/1', $content);

如果你的应用与多个磁盘进行交互，可使用 `Storage` Facade 中的 `disk` 方法对特定磁盘上的文件进行操作：

    Storage::disk('s3')->put('avatars/1', $content);

<a name="on-demand-disks"></a>
### 按需配置磁盘

有时你可能希望在运行时使用给定配置创建磁盘，而无需在应用程序的 `filesystems` 配置文件中实际存在该配置。为了实现这一点，你可以将配置数组传递给 `Storage` Facade 的 `build` 方法：

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a name="retrieving-files"></a>
## 检索文件

`get` 方法可用于检索文件的内容。该方法将返回文件的原始字符串内容。切记，所有文件路径的指定都应该相对于该磁盘所配置的「root」目录：

    $contents = Storage::get('file.jpg');



`exists` 方法可以用来判断一个文件是否存在于磁盘上：

    if (Storage::disk('s3')->exists('file.jpg')) {
        // ...
    }

`missing` 方法可以用来判断一个文件是否缺失于磁盘上：

    if (Storage::disk('s3')->missing('file.jpg')) {
        // ...
    }

<a name="downloading-files"></a>
### 下载文件

`download` 方法可以用来生成一个响应，强制用户的浏览器下载给定路径的文件。`download` 方法接受一个文件名作为方法的第二个参数，这将决定用户下载文件时看到的文件名。最后，你可以传递一个 HTTP 头部的数组作为方法的第三个参数：

    return Storage::download('file.jpg');

    return Storage::download('file.jpg', $name, $headers);

<a name="file-urls"></a>
### 文件 URL

你可以使用 `url` 方法来获取给定文件的 URL。如果你使用的是`local` 驱动，这通常只会在给定路径前加上 `/storage`，并返回一个相对 URL 到文件。如果你使用的是 `s3` 驱动，将返回完全限定的远程 URL：

    use Illuminate\Support\Facades\Storage;

    $url = Storage::url('file.jpg');

当使用 `local` 驱动时，所有应该公开访问的文件都应放置在 `storage/app/public` 目录中。此外，你应该在 `public/storage` 处 [创建一个符号连接](#the-public-disk) 指向 `storage/app/public` 目录。

> **警告**
> 当使用 `local` 驱动时，url 的返回值不是 URL 编码的。因此，我们建议始终使用能够创建有效 URL 的名称存储文件。



<a name="url-host-customization"></a>
#### 定制 URL 的 Host

如果你想预定义使用 `Storage` Facade 生成的 URL 的 Host，则可以在磁盘的配置数组中添加一个 `url` 选项：

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],

<a name="temporary-urls"></a>
### 临时 URL

使用 `temporaryUrl` 方法，你可以为使用 `s3` 驱动存储的文件创建临时 URL。此方法接受一个路径和一个 `DateTime` 实例，指定 URL 的过期时间：

    use Illuminate\Support\Facades\Storage;

    $url = Storage::temporaryUrl(
        'file.jpg', now()->addMinutes(5)
    );

如果你需要指定额外的 [S3 请求参数](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)，你可以将请求参数数组作为第三个参数传递给`temporaryUrl` 方法。

    $url = Storage::temporaryUrl(
        'file.jpg',
        now()->addMinutes(5),
        [
            'ResponseContentType' => 'application/octet-stream',
            'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
        ]
    );

如果你需要为一个特定的存储磁盘定制临时 URL 的创建方式，可以使用 `buildTemporaryUrlsUsing` 方法。例如，如果你有一个控制器允许你通过不支持临时 URL 的磁盘下载存储的文件，这可能很有用。通常，此方法应从服务提供者的 `boot` 方法中调用：

    <?php

    namespace App\Providers;

    use DateTime;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Facades\URL;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 启动任何应用程序服务。
         */
        public function boot(): void
        {
            Storage::disk('local')->buildTemporaryUrlsUsing(
                function (string $path, DateTime $expiration, array $options) {
                    return URL::temporarySignedRoute(
                        'files.download',
                        $expiration,
                        array_merge($options, ['path' => $path])
                    );
                }
            );
        }
    }

<a name="url-host-customization"></a>
#### URL Host 自定义

如果你想为使用 `Storage` Facade 生成的 URL 预定义 Host，可以将 `url` 选项添加到磁盘的配置数组：

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],


<a name="temporary-upload-urls"></a>
#### 临时上传 URL

> **警告**
> 生成临时上传 URL 的能力仅由 `s3` 驱动支持。

如果你需要生成一个临时 URL，可以直接从客户端应用程序上传文件，你可以使用 `temporaryUploadUrl` 方法。此方法接受一个路径和一个 `DateTime` 实例，指定 URL 应该在何时过期。`temporaryUploadUrl` 方法返回一个关联数组，可以解构为上传 URL 和应该包含在上传请求中的头部：

    use Illuminate\Support\Facades\Storage;

    ['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
        'file.jpg', now()->addMinutes(5)
    );

此方法主要用于无服务器环境，需要客户端应用程序直接将文件上传到云存储系统（如 Amazon S3）。

<a name="file-metadata"></a>
### 文件元数据

除了读写文件，Laravel 还可以提供有关文件本身的信息。例如，`size` 方法可用于获取文件大小（以字节为单位）：

    use Illuminate\Support\Facades\Storage;

    $size = Storage::size('file.jpg');

`lastModified` 方法返回上次修改文件时的时间戳：

    $time = Storage::lastModified('file.jpg');

可以通过 `mimeType` 方法获取给定文件的 MIME 类型：

    $mime = Storage::mimeType('file.jpg')

<a name="file-paths"></a>
#### 文件路径

你可以使用 `path` 方法获取给定文件的路径。如果你使用的是 `local` 驱动，这将返回文件的绝对路径。如果你使用的是 `s3` 驱动，此方法将返回 S3 存储桶中文件的相对路径：

    use Illuminate\Support\Facades\Storage;

    $path = Storage::path('file.jpg');

<a name="storing-files"></a>
## 保存文件

可以使用 `put` 方法将文件内容存储在磁盘上。你还可以将 PHP `resource` 传递给 `put` 方法，该方法将使用 Flysystem 的底层流支持。请记住，应相对于为磁盘配置的「根」目录指定所有文件路径：

    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents);

    Storage::put('file.jpg', $resource);

<a name="failed-writes"></a>
#### 写入失败

如果 `put` 方法（或其他「写入」操作）无法将文件写入磁盘，将返回 `false`。

    if (! Storage::put('file.jpg', $contents)) {
        // 该文件无法写入磁盘...
    }

你可以在你的文件系统磁盘的配置数组中定义 `throw` 选项。当这个选项被定义为 `true` 时，「写入」的方法如 `put` 将在写入操作失败时抛出一个 `League\Flysystem\UnableToWriteFile` 的实例。

    'public' => [
        'driver' => 'local',
        // ...
        'throw' => true,
    ],

<a name="prepending-appending-to-files"></a>
### 追加内容到文件开头或结尾

`prepend` 和 `append` 方法允许你将内容写入文件的开头或结尾：

    Storage::prepend('file.log', 'Prepended Text');

    Storage::append('file.log', 'Appended Text');

<a name="copying-moving-files"></a>
### 复制 / 移动文件

`copy` 方法可用于将现有文件复制到磁盘上的新位置，而 `move` 方法可用于重命名现有文件或将其移动到新位置：

    Storage::copy('old/file.jpg', 'new/file.jpg');

    Storage::move('old/file.jpg', 'new/file.jpg');

<a name="automatic-streaming"></a>


### 自动流式传输

将文件流式传输到存储位置可显著减少内存使用量。如果你希望 Laravel 自动管理将给定文件流式传输到你的存储位置，你可以使用 `putFile` 或 `putFileAs` 方法。此方法接受一个 `Illuminate\Http\File` 或 `Illuminate\Http\UploadedFile` 实例，并自动将文件流式传输到你所需的位置：

    use Illuminate\Http\File;
    use Illuminate\Support\Facades\Storage;

    // 为文件名自动生成一个唯一的 ID...
    $path = Storage::putFile('photos', new File('/path/to/photo'));

    // 手动指定一个文件名...
    $path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');

关于 putFile 方法有几点重要的注意事项。注意，我们只指定了目录名称而不是文件名。默认情况下，`putFile` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。文件的路径将由 `putFile` 方法返回，因此你可以将路径（包括生成的文件名）存储在数据库中。

`putFile` 和 `putFileAs` 方法还接受一个参数来指定存储文件的「可见性」。如果你将文件存储在云盘（如 Amazon S3）上，并希望文件通过生成的 URL 公开访问，这一点特别有用：

    Storage::putFile('photos', new File('/path/to/photo'), 'public');

<a name="file-uploads"></a>
### 文件上传

在网络应用程序中，存储文件的最常见用例之一是存储用户上传的文件，如照片和文档。Laravel 使用上传文件实例上的 `store` 方法非常容易地存储上传的文件。使用你希望存储上传文件的路径调用 `store` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;

    class UserAvatarController extends Controller
    {
        /**
         * 更新用户的头像。
         */
        public function update(Request $request): string
        {
            $path = $request->file('avatar')->store('avatars');

            return $path;
        }
    }


关于这个例子有几点重要的注意事项。注意，我们只指定了目录名称而不是文件名。默认情况下，`store` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。文件的路径将由 `store` 方法返回，因此你可以将路径（包括生成的文件名）存储在数据库中。

你也可以在 `Storage` Facade 上调用 `putFile` 方法来执行与上面示例相同的文件存储操作：

    $path = Storage::putFile('avatars', $request->file('avatar'));

<a name="specifying-a-file-name"></a>
#### 指定一个文件名

如果你不希望文件名被自动分配给你存储的文件，你可以使用 `storeAs` 方法，该方法接收路径、文件名和（可选的）磁盘作为其参数：

    $path = $request->file('avatar')->storeAs(
        'avatars', $request->user()->id
    );

你也可以在 `Storage` Facade 使用 `putFileAs` 方法，它将执行与上面示例相同的文件存储操作：

    $path = Storage::putFileAs(
        'avatars', $request->file('avatar'), $request->user()->id
    );

> **警告**
> 不可打印和无效的 Unicode 字符将自动从文件路径中删除。因此，你可能希望在将文件路径传递给 Laravel 的文件存储方法之前对其进行清理。文件路径使用 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 方法进行规范化。

<a name="specifying-a-disk"></a>
#### 指定一个磁盘

默认情况下，此上传文件的 `store` 方法将使用你的默认磁盘。如果你想指定另一个磁盘，将磁盘名称作为第二个参数传递给 `store` 方法：

    $path = $request->file('avatar')->store(
        'avatars/'.$request->user()->id, 's3'
    );


如果你正在使用 `storeAs` 方法，你可以将磁盘名称作为第三个参数传递给该方法：

    $path = $request->file('avatar')->storeAs(
        'avatars',
        $request->user()->id,
        's3'
    );

<a name="other-uploaded-file-information"></a>
#### 其他上传文件的信息

如果您想获取上传文件的原始名称和扩展名，可以使用 `getClientOriginalName` 和 `getClientOriginalExtension` 方法来实现：

    $file = $request->file('avatar');

    $name = $file->getClientOriginalName();
    $extension = $file->getClientOriginalExtension();

然而，请记住，`getClientOriginalName` 和 `getClientOriginalExtension` 方法被认为是不安全的，因为文件名和扩展名可能被恶意用户篡改。因此，你通常应该更喜欢使用 `hashName` 和 `extension` 方法来获取给定文件上传的名称和扩展名：

    $file = $request->file('avatar');

    $name = $file->hashName(); // 生成一个唯一的、随机的名字...
    $extension = $file->extension(); // 根据文件的 MIME 类型来确定文件的扩展名...

<a name="file-visibility"></a>
### 文件可见性

在 Laravel 的 Flysystem 集成中，「visibility」 是跨多个平台的文件权限的抽象。文件可以被声明为 `public` 或 `private`。当一个文件被声明为 `public` 时，你表示该文件通常应该被其他人访问。例如，在使用 S3 驱动程序时，你可以检索 `public` 文件的 URL。

你可以通过 `put` 方法在写入文件时设置可见性：

    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents, 'public');

如果文件已经被存储，可以通过 `getVisibility` 和 `setVisibility` 方法检索和设置其可见性：

    $visibility = Storage::getVisibility('file.jpg');

    Storage::setVisibility('file.jpg', 'public');


在与上传文件交互时，你可以使用 `storePublicly` 和 `storePubliclyAs` 方法将上传文件存储为 `public` 可见性

    $path = $request->file('avatar')->storePublicly('avatars', 's3');

    $path = $request->file('avatar')->storePubliclyAs(
        'avatars',
        $request->user()->id,
        's3'
    );

<a name="local-files-and-visibility"></a>
#### 本地文件和可见性

当使用 `local` 驱动时，`public`[可见性](#file-visibility)转换为目录的 `0755` 权限和文件的 `0644` 权限。你可以在你的应用程序的 `filesystems` 配置文件中修改权限映射：

    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'permissions' => [
            'file' => [
                'public' => 0644,
                'private' => 0600,
            ],
            'dir' => [
                'public' => 0755,
                'private' => 0700,
            ],
        ],
    ],

<a name="deleting-files"></a>
## 删除文件

`delete` 方法接收一个文件名或一个文件名数组来将其从磁盘中删除：

    use Illuminate\Support\Facades\Storage;

    Storage::delete('file.jpg');

    Storage::delete(['file.jpg', 'file2.jpg']);

如果需要，你可以指定应从哪个磁盘删除文件。

    use Illuminate\Support\Facades\Storage;

    Storage::disk('s3')->delete('path/file.jpg');

<a name="directories"></a>
## 目录

<a name="get-all-files-within-a-directory"></a>
#### 获取目录下所有的文件

`files` 将以数组的形式返回给定目录下所有的文件。如果你想要检索给定目录的所有文件及其子目录的所有文件，你可以使用 `allFiles` 方法：

    use Illuminate\Support\Facades\Storage;

    $files = Storage::files($directory);

    $files = Storage::allFiles($directory);

<a name="get-all-directories-within-a-directory"></a>
#### 获取特定目录下的子目录

`directories` 方法以数组的形式返回给定目录中的所有目录。此外，你还可以使用 `allDirectories` 方法递归地获取给定目录中的所有目录及其子目录中的目录：

    $directories = Storage::directories($directory);

    $directories = Storage::allDirectories($directory);



<a name="create-a-directory"></a>
#### 创建目录

`makeDirectory` 方法可递归的创建指定的目录：

    Storage::makeDirectory($directory);

<a name="delete-a-directory"></a>
#### 删除一个目录

最后，`deleteDirectory` 方法可用于删除一个目录及其下所有的文件：

    Storage::deleteDirectory($directory);

<a name="testing"></a>
## 测试

The `Storage` facade's `fake` method allows you to easily generate a fake disk that, combined with the file generation utilities of the `Illuminate\Http\UploadedFile` class, greatly simplifies the testing of file uploads. For example:


`Storage` 门面类的 `fake` 方法可以轻松创建一个虚拟磁盘，与`Illuminate\Http\UploadedFile` 类配合使用，大大简化了文件的上传测试。例如：

    <?php

    namespace Tests\Feature;

    use Illuminate\Http\UploadedFile;
    use Illuminate\Support\Facades\Storage;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_albums_can_be_uploaded(): void
        {
            Storage::fake('photos');

            $response = $this->json('POST', '/photos', [
                UploadedFile::fake()->image('photo1.jpg'),
                UploadedFile::fake()->image('photo2.jpg')
            ]);

            // 断言存储了一个或多个文件。
            Storage::disk('photos')->assertExists('photo1.jpg');
            Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

            // 断言一个或多个文件未存储。
            Storage::disk('photos')->assertMissing('missing.jpg');
            Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

            // 断言给定目录为空。
            Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
        }
    }


默认情况下，`fake` 方法将删除临时目录中的所有文件。如果你想保留这些文件，你可以使用 "persistentFake" 方法代替。有关测试文件上传的更多信息，您可以查阅 [HTTP 测试文档的文件上传](/docs/laravel/10.x/http-tests#testing-file-uploads).

> **警告**
> `image` 方法需要 [GD 扩展](https://www.php.net/manual/en/book.image.php) .



<a name="custom-filesystems"></a>
## 自定义文件系统

Laravel 内置的文件系统提供了一些开箱即用的驱动；当然，它不仅仅是这些，它还提供了与其他存储系统的适配器。通过这些适配器，你可以在你的 Laravel 应用中创建自定义驱动。

要安装自定义文件系统，你可能需要一个文件系统适配器。让我们将社区维护的 Dropbox 适配器添加到项目中：

```shell
composer require spatie/flysystem-dropbox
```

接下来，你可以在 [服务提供者](/docs/laravel/10.x/providers) 中注册一个带有 `boot` 方法的驱动。在提供者的 `boot` 方法中，你可以使用 `Storage` 门面的 `extend` 方法来定义一个自定义驱动：

    <?php

    namespace App\Providers;

    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Filesystem\FilesystemAdapter;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\ServiceProvider;
    use League\Flysystem\Filesystem;
    use Spatie\Dropbox\Client as DropboxClient;
    use Spatie\FlysystemDropbox\DropboxAdapter;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * 注册任意应用程序服务。
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
            Storage::extend('dropbox', function (Application $app, array $config) {
                $adapter = new DropboxAdapter(new DropboxClient(
                    $config['authorization_token']
                ));

                return new FilesystemAdapter(
                    new Filesystem($adapter, $config),
                    $adapter,
                    $config
                );
            });
        }
    }

`extend` 方法的第一个参数是驱动程序的名称，第二个参数是接收 `$app` 和 `$config` 变量的闭包。闭包必须返回的实例 `League\Flysystem\Filesystem`。`$config` 变量包含 `config/filesystems.php` 为指定磁盘定义的值。

一旦创建并注册了扩展的服务提供商，就可以 `dropbox` 在 `config/filesystems.php` 配置文件中使用该驱动程序。

