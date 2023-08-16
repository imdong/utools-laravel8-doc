
# 加密解密

- [简介](#introduction)
- [配置](#configuration)
- [基本用法](#using-the-encrypter)

<a name="introduction"></a>
## 简介

Laravel 的加密服务提供了一个简单、方便的接口，使用 OpenSSL 所提供的 AES-256 和 AES-128 加密和解密文本。所有 Laravel 加密的结果都会使用消息认证码 (MAC) 进行签名，因此一旦加密，其底层值就不能被修改或篡改。

<a name="configuration"></a>
## 配置

在使用 Laravel 的加密工具之前，你必须先设置 `config/app.php` 配置文件中的 `key` 配置项。该配置项由环境变量 `APP_KEY` 设定。你应当使用 `php artisan key:generate` 命令来生成该变量的值，`key:generate` 命令将使用 PHP 的安全随机字节生成器为你的应用程序构建加密安全密钥。通常情况下，在 [Laravel 安装](/docs/laravel/10.x/installation) 中会为你生成 APP_KEY 环境变量的值。

<a name="using-the-encrypter"></a>
## 基本用法

<a name="encrypting-a-value"></a>
#### 加密一个值

你可以使用 `Crypt` 门面提供的 `encryptString` 方法来加密一个值。所有加密的值都使用 OpenSSL 的 AES-256-CBC 来进行加密。此外，所有加密过的值都会使用消息认证码 (MAC) 来签名，可以防止恶意用户对值进行篡改：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Crypt;

    class DigitalOceanTokenController extends Controller
    {
        /**
         *  为用户存储一个 DigitalOcean API 令牌。
         */
        public function store(Request $request): RedirectResponse
        {
            $request->user()->fill([
                'token' => Crypt::encryptString($request->token),
            ])->save();

            return redirect('/secrets');
        }
    }

<a name="decrypting-a-value"></a>
#### 解密一个值

你可以使用 `Crypt` 门面提供的 `decryptString` 来进行解密。如果该值不能被正确解密，例如消息认证码 (MAC) 无效，会抛出异常 `Illuminate\Contracts\Encryption\DecryptException`：

    use Illuminate\Contracts\Encryption\DecryptException;
    use Illuminate\Support\Facades\Crypt;

    try {
        $decrypted = Crypt::decryptString($encryptedValue);
    } catch (DecryptException $e) {
        // ...
    }

