# 文件存储

- [简介](#introduction)
- [配置](#configuration)
    - [本地驱动](#the-local-driver)
    - [公共磁盘](#the-public-disk)
    - [驱动要求](#driver-prerequisites)
    - [Amazon S3 兼容文件系统](#amazon-s3-compatible-filesystems)
- [获取磁盘实例](#obtaining-disk-instances)
    - [按需配置磁盘](#on-demand-disks)
- [检索文件](#retrieving-files)
    - [下载文件](#downloading-files)
    - [文件 URL](#file-urls)
    - [文件元数据](#file-metadata)
- [保存文件](#storing-files)
    - [文件上传](#file-uploads)
    - [文件可见性](#file-visibility)
- [删除文件](#deleting-files)
- [目录](#directories)
- [自定义文件系统](#custom-filesystems)

<a name="introduction"></a>
## 简介

Laravel 提供了一个强大的文件系统抽象概念，这得益于 Frank de Jonge 强大的 [Flysystem](https://github.com/thephpleague/flysystem) 扩展包。Laravel 文件系统集成为使用本地文件系统、SFTP 和 Amazon S3 提供了简单易用的驱动程序。 更棒的是，由于每个系统的 API 保持不变，所以在这些存储选项之间切换是非常简单的。

<a name="configuration"></a>
## 配置

Laravel 文件系统的配置文件位于 `config/filesystems.php`。在这个文件中你可以配置所有的「磁盘」。每个磁盘代表特定的存储驱动及存储位置。每种支持的驱动程序的示例配置都包含在配置文件中。因此，只需要修改配置即可应用你的存储偏好和凭据。

`local` 驱动用于操作本地服务器的文件，而 `s3` 驱动用于操作在 Amazon S3 云存储服务上的文件。

> 技巧：你可以配置任意数量的磁盘，甚至可以添加多个使用相同驱动的磁盘。



<a name="the-local-driver"></a>
### 本地驱动

使用 `local` 驱动时，所有文件操作都与 `filesystems` 配置文件中定义的 `root` 目录相关。 默认情况下，此值设置为 `storage/app` 目录。因此，以下方法会把文件存储在 `storage/app/example.txt` 中：

    use Illuminate\Support\Facades\Storage;

    Storage::disk('local')->put('example.txt', 'Contents');

<a name="the-public-disk"></a>
### 公共磁盘

在 `filesystems` 配置文件中定义的 `public` 磁盘适用于要公开访问的文件。默认情况下， `public` 磁盘使用 `local` 驱动，并且将这些文件存储在 `storage/app/public` 目录下。

为了让它们能通过网络访问，你需要创建从 `public/storage` 到 `storage/app/public` 的符号链接。这种方式能把可公开访问文件都保留在同一个目录下，以便在使用零停机时间部署系统如 [Envoyer](https://envoyer.io) 的时候，就可以轻松地在不同的部署之间共享这些文件。

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


### 驱动要求

<a name="s3-driver-configuration"></a>
#### S3 驱动配置

在使用 S3 驱动之前，你需要通过 Composer 安装相应的软件包：

```shell
composer require -W league/flysystem-aws-s3-v3 "^3.0"
```

S3 驱动配置信息位于 `config/filesystems.php` 配置文件中。该文件包含 S3 驱动程序的示例配置数组。你可以自由使用你自己的 S3 配置和凭证修改此配置数组。为了方便起见，这些环境变量与 AWS CLI 使用的命名约定一致。

<a name="ftp-driver-configuration"></a>
#### FTP 驱动配置

在使用 FTP 驱动之前，你需要通过 Composer 安装相应的软件包：

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel 的文件系统能很好的适配 FTP，不过 FTP 的配置示例并没有被包含在框架默认的 `filesystems.php` 配置文件中。如果你需要配置 FTP 文件系统，你可以参考下方的例子：

    'ftp' => [
        'driver' => 'ftp',
        'host' => env('FTP_HOST'),
        'username' => env('FTP_USERNAME'),
        'password' => env('FTP_PASSWORD'),

        // 可选的 FTP 设置
        // 'port' => env('FTP_PORT', 21),
        // 'root' => env('FTP_ROOT'),
        // 'passive' => true,
        // 'ssl' => true,
        // 'timeout' => 30,
    ],

<a name="sftp-driver-configuration"></a>
#### SFTP 驱动配置

在使用 SFTP 驱动之前，你需要通过 Composer 安装相应的软件包：

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel 的文件系统能很好的适配 SFTP，不过 SFTP 的配置示例并没有被包含在框架默认的 `filesystems.php` 配置文件中。如果你需要配置 SFTP 文件系统，你可以参考下方的例子：

    'sftp' => [
        'driver' => 'sftp',
        'host' => env('SFTP_HOST'),

        // 基于基础的身份验证设置...
        'username' => env('SFTP_USERNAME'),
        'password' => env('SFTP_PASSWORD'),

        // 使用加密密码进行基于 SSH 密钥的身份验证的设置...
        'privateKey' => env('SFTP_PRIVATE_KEY'),
        'password' => env('SFTP_PASSWORD'),

        // 可选的 SFTP 设置
        // 'port' => env('SFTP_PORT', 22),
        // 'root' => env('SFTP_ROOT', ''),
        // 'timeout' => 30,
    ],



<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 兼容文件系统

默认情况下，应用程序的 `filesystems` 配置文件包含 `s3` 磁盘的磁盘配置。除了使用此磁盘与 Amazon S3 交互外，你还可以使用它与任何 S3 兼容的文件存储服务进行交互，例如 [MinIO](https://github.com/minio/minio) 或 [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)。

通常，在更新磁盘的凭据以匹配你计划使用的服务的凭据后，你只需要更新 `url` 配置选项的值。此选项的值通常通过 `AWS_ENDPOINT` 环境变量定义：

    'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),

<a name="obtaining-disk-instances"></a>
## 获取磁盘实例

`Storage` Facade 可用于与所有已配置的磁盘进行交互。例如，你可以使用 Facade 中的 `put` 方法将头像存储到默认磁盘。如果你使用 `Storage` Facade 时并没有使用 `disk` 方法，那么所有的方法调用将会自动传递给默认的磁盘：

    use Illuminate\Support\Facades\Storage;

    Storage::put('avatars/1', $content);

如果应用要与多个磁盘进行交互，可使用 `Storage` Facade 中的 `disk` 方法对特定磁盘上的文件进行操作：

    Storage::disk('s3')->put('avatars/1', $content);

<a name="on-demand-disks"></a>
### 按需配置磁盘

有时你可能希望在运行时使用给定配置创建磁盘，而该配置实际上不存在于应用程序的「文件系统」配置文件中。为此，你可以将配置数组传递给 `Storage` 门面的 `build` 方法：

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

`get` 方法可以用于获取文件的内容，此方法返回该文件的原始字符串内容。切记，所有文件路径的指定都应该相对于该磁盘所配置的「root」目录：

    $contents = Storage::get('file.jpg');

`exists` 方法可以用来判断磁盘上是否存在指定的文件：

    if (Storage::disk('s3')->exists('file.jpg')) {
        // ...
    }

`missing` 方法可以用来判断磁盘上是否缺少指定的文件：

    if (Storage::disk('s3')->missing('file.jpg')) {
        // ...
    }

<a name="downloading-files"></a>
### 下载文件

`download` 方法可用于生成响应，该响应强制用户的浏览器在给定路径下下载文件。`download` 方法接受文件名作为该方法的第二个参数，它将确定下载文件的用户看到的文件名。最后，你可以将 HTTP 标头数组作为该方法的第三个参数传递：

    return Storage::download('file.jpg');

    return Storage::download('file.jpg', $name, $headers);

<a name="file-urls"></a>
### 文件地址

你可以使用 `url` 方法来获取给定文件的 url。如果你使用的是 `local` 驱动程序，这通常会将 `/storage` 添加到给定的路径，并返回文件的相对 URL。如果你使用的是 `s3` 驱动程序，则会返回完全限定的远程URL：

    use Illuminate\Support\Facades\Storage;

    $url = Storage::url('file.jpg');



当使用 `local` 驱动程序时，所有应该公开访问的文件应该放在 `storage/app/public` 目录下。此外，你应该在 `public/storage` 处[创建一个符号链接](#the-public-disk)，它指向 `storage/app/public` 目录。

> 注意：当使用 `local` 驱动时， `url` 的返回值不是 url 编码的。因此，我们建议总是使用可以创建有效 url 的名称来存储文件。

<a name="temporary-urls"></a>
#### 临时地址

使用 `temporaryUrl` 方法，你可以为使用 `s3` 驱动程序存储的文件创建临时 URL 。此方法接受一个路径和一个 `DateTime` 实例，指定 URL 何时应过期：

    use Illuminate\Support\Facades\Storage;

    $url = Storage::temporaryUrl(
        'file.jpg', now()->addMinutes(5)
    );

如果需要指定其他 [S3 请求参数](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests) ,你可以将请求参数数组作为第三个参数传递给 `temporaryUrl` 方法：

    $url = Storage::temporaryUrl(
        'file.jpg',
        now()->addMinutes(5),
        [
            'ResponseContentType' => 'application/octet-stream',
            'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
        ]
    );

如果你需要自定义如何为特定存储磁盘创建临时 URL，可以使用 `buildTemporaryUrlsUsing` 方法。例如，如果你有一个控制器允许你下载通过通常不支持临时 URL 的磁盘存储的文件，这可能会很有用。通常，应该从服务提供者的 `boot` 方法调用此方法：

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Facades\URL;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            Storage::disk('local')->buildTemporaryUrlsUsing(function ($path, $expiration, $options) {
                return URL::temporarySignedRoute(
                    'files.download',
                    $expiration,
                    array_merge($options, ['path' => $path])
                );
            });
        }
    }



<a name="url-host-customization"></a>
#### 定制路径的 Host

如果要为使用 `Storage` Facade 生成的 url 预定义 Host，可以向磁盘的配置数组中添加 `url` 选项：

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],

<a name="file-metadata"></a>
### 文件 Metadata 信息

除了读写文件，Laravel 还可以提供有关文件自身的信息。例如，`size` 方法可用于获取文件的大小(以字节为单位)：

    use Illuminate\Support\Facades\Storage;

    $size = Storage::size('file.jpg');

`lastModified` 方法返回上次修改文件时的时间戳：

    $time = Storage::lastModified('file.jpg');

<a name="file-paths"></a>
#### 文件路径

可以使用 `path` 方法获取给定文件的路径。如果你使用的是 `local` 驱动程序，这将返回文件的绝对路径。如果你使用的是 `s3` 驱动程序，此方法将返回 s3 bucket 中文件的相对路径：

    use Illuminate\Support\Facades\Storage;

    $path = Storage::path('file.jpg');

<a name="storing-files"></a>
## 储存文件

可以使用 `put` 方法将文件内容存储在磁盘上。你还可以将 PHP `resource` 传递给 `put` 方法，该方法将使用 Flysystem 的底层流支持。请记住，应相对于为磁盘配置的根目录指定所有文件路径：

    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents);

    Storage::put('file.jpg', $resource);



<a name="automatic-streaming"></a>
#### 自动流存储

将文件流式传输到存储可显著减少内存使用。如果希望 Laravel 自动管理将给定文件流式传输到存储位置，可以使用 `putFile` 或 `putFileAs` 方法。此方法接受 `Illuminate\Http\File` 或 `Illuminate\Http\UploadedFile` 实例，并自动将文件流式传输到所需位置：

    use Illuminate\Http\File;
    use Illuminate\Support\Facades\Storage;

    // 自动生成一个唯一文件名 ...
    $path = Storage::putFile('photos', new File('/path/to/photo'));

    // 手动指定文件名 ...
    $path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');

关于 `putFile` 方法，有一些重要的事情需要注意。那就是，我们只指定了一个目录名，而没有指定文件名。默认情况下，`putFile` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。`putFile` 方法将返回文件的路径，以便你可以将路径（包括生成的文件名）存储在数据库中。

`putFile` 和 `putFileAs` 方法还接受一个参数来指定存储文件的 「可见性」。如果你将文件存储在云磁盘（如 Amazon S3）上，并且希望通过生成的 URL 公开访问该文件，则这一点特别有用：

    Storage::putFile('photos', new File('/path/to/photo'), 'public');

<a name="prepending-appending-to-files"></a>
#### 追加内容到文件开头或结尾

 `prepend` 和 `append` 方法允许你将内容写入文件的开头或结尾：

    Storage::prepend('file.log', 'Prepended Text');

    Storage::append('file.log', 'Appended Text');



<a name="copying-moving-files"></a>
#### 复制 / 移动文件

`copy` 方法可用于将现有文件复制到磁盘上的新位置，而 `move` 方法可用于重命名现有文件或将其移动到新位置：

    Storage::copy('old/file.jpg', 'new/file.jpg');

    Storage::move('old/file.jpg', 'new/file.jpg');

<a name="file-uploads"></a>
### 文件上传

在 web 应用程序中，存储文件最常见的用例之一是存储用户上传的文件，如照片和文档。Laravel 使得在上传的文件实例上使用 `store` 方法存储上传的文件变得非常容易。可以在要存储的上传文件上调用 `store` 方法：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;

    class UserAvatarController extends Controller
    {
        /**
         * 更新用户头像
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request)
        {
            $path = $request->file('avatar')->store('avatars');

            return $path;
        }
    }

关于这个例子，有一些重要的事情需要注意。那就是，我们只指定了一个目录名，而不是文件名。默认情况下，`store` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。文件的路径将由 `store` 方法返回，因此你可以将路径（包括生成的文件名）存储在数据库中。

你还可以调用 `Storage` facade上的 `putFile` 方法来执行与上述示例相同的文件存储操作：

    $path = Storage::putFile('avatars', $request->file('avatar'));



<a name="specifying-a-file-name"></a>
#### 指定一个文件名

如果不希望文件名自动分配给存储的文件，可以使用 `storeAs` 方法，该方法接收路径、文件名和（可选）磁盘作为参数：

    $path = $request->file('avatar')->storeAs(
        'avatars', $request->user()->id
    );

你还可以在 `Storage` facade 上使用 `putFileAs` 方法，该方法将执行与上述示例相同的文件存储操作：

    $path = Storage::putFileAs(
        'avatars', $request->file('avatar'), $request->user()->id
    );

> 注意：无法打印和无效的 unicode 字符将自动从文件路径中删除。因此，您可能希望在将文件路径传递给Laravel的文件存储方法之前对其进行清理。使用'League\Flysystem\Util:：normalizePath'方法规范化文件路径。

<a name="specifying-a-disk"></a>
#### 指定一个磁盘

默认情况下，此上载文件的 `store` 方法将使用默认磁盘。如果要指定另一个磁盘，请将磁盘名作为第二个参数传递给 `store` 方法：

    $path = $request->file('avatar')->store(
        'avatars/'.$request->user()->id, 's3'
    );

如果使用的是 `storeAs` 方法，则可以将磁盘名作为第三个参数传递给该方法：

    $path = $request->file('avatar')->storeAs(
        'avatars',
        $request->user()->id,
        's3'
    );

<a name="other-uploaded-file-information"></a>
#### 其他上传文件信息

如果你想获取上传文件的原始名称和扩展名，可以使用 `getClientOriginalName` 和 `getClientOriginalExtension` 方法：

    $file = $request->file('avatar');

    $name = $file->getClientOriginalName();
    $extension = $file->getClientOriginalExtension();



但是，请记住，`getClientOriginalName` 和 `getClientOriginalExtension` 方法被认为是不安全的，因为文件名和扩展名可能被恶意用户篡改。出于这个原因，你应该更喜欢 `hashName` 和 `extension` 方法来获取给定文件上传的名称和扩展名：

    $file = $request->file('avatar');

    $name = $file->hashName(); // 生成一个唯一的随机名称...
    $extension = $file->extension(); // 根据文件的 MIME 类型确定文件的扩展名...

<a name="file-visibility"></a>
### 文件的可见性

在 Laravel 继承的文件系统中，「可见性」是一个针对多平台的权限的抽象概念。文件可以定义为 `public` 或 `private` 。当文件被定义为 `public` 时，意味着其他人可以访问之。例如，当您使用 S3 驱动的时候，你可以检索声明为 `public` 的文件的 URL 。

在使用 `put` 方法的时候，你可以设置文件的可见性：

    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents, 'public');

你可以使用 `getVisibility` 和 `setVisibility` 方法对现有文件的可见性进行检索和设置：

    $visibility = Storage::getVisibility('file.jpg');

    Storage::setVisibility('file.jpg', 'public');

当和上传文件交互的时候，你可以使用 `storePublicly` 和 `storePubliclyAs` 方法来将文件的可见性设置为 `public` 并存储之：

    $path = $request->file('avatar')->storePublicly('avatars', 's3');

    $path = $request->file('avatar')->storePubliclyAs(
        'avatars',
        $request->user()->id,
        's3'
    );

<a name="local-files-and-visibility"></a>
#### 本地文件 & 可见性

当使用 `local` 驱动程序时，`public` [文件的可见性](#file-visibility) 转换文件和目录的权限 为 `0755` 的 `0644` 权限。 你可以在应用程序的 `filesystems` 配置文件中修改权限配置：

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

如果有必要，你可以指定删除的文件的磁盘：

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
#### 创建一个目录

`makeDirectory` 方法可递归的创建指定的目录：

    Storage::makeDirectory($directory);

<a name="delete-a-directory"></a>
#### 删除一个目录

最后，`deleteDirectory` 方法可用于删除一个目录及其下所有的文件：

    Storage::deleteDirectory($directory);

<a name="custom-filesystems"></a>
## 自定义文件系统

Laravel 内置的文件系统提供了一些开箱即用的驱动；当然，它不仅仅是这些，它还提供了与其他存储系统的适配器。通过这些适配器，你可以在你的 Laravel 应用中创建自定义驱动。



要安装自定义文件系统，你可能需要一个文件系统适配器。让我们将社区维护的 Dropbox 适配器添加到项目中：

```shell
composer require spatie/flysystem-dropbox
```

接下来，你可以创建一个诸如 `DropboxServiceProvider` 这样的 [服务提供者](/docs/laravel/9.x/providers) 。在提供者的 `boot` 方法中，你可以使用 `Storage` 门面的 `extend` 方法来定义一个自定义驱动：

    <?php

    namespace App\Providers;

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
         *
         * @return void
         */
        public function register()
        {
            //
        }

        /**
         * 引导任何应用程序服务。
         *
         * @return void
         */
        public function boot()
        {
            Storage::extend('dropbox', function ($app, $config) {
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

