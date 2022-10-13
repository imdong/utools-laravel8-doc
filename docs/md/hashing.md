# 哈希加密

- [简介](#introduction)
- [配置](#configuration)
- [基本用法](#basic-usage)
    - [使用哈希算法加密密码](#hashing-passwords)
    - [验证密码是否与哈希匹配](#verifying-that-a-password-matches-a-hash)
    - [检查密码是否需要重新散列/哈希](#determining-if-a-password-needs-to-be-rehashed)

<a name="introduction"></a>
## 简介

Laravel `Hash` [facade](/docs/laravel/9.x/facades) 为存储用户密码提供了安全的 Bcrypt 和 Argon2 哈希加密方式。如果你正在使用 [Laravel 应用初始脚手架](/docs/laravel/9.x/starter-kits) ，默认情况下，将使用 Bcrypt 进行注册和身份验证。

Bcrypt 是加密密码的一个很好的选择，因为它的「加密系数」是可调的，这意味着生成散列所需的时间可以随着硬件功率的增加而增加。当加密密码时速度慢是相对比较好的。算法对密码进行哈希运算的时间越长，恶意用户生成所有可能用于对应用程序进行暴力攻击的字符串哈希值的「彩虹表」的时间就越长。

<a name="configuration"></a>
## 配置

你可以在 `config/hashing.php` 配置文件中配置默认哈希驱动程序。目前支持三种驱动程序： [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 和 [Argon2](https://en.wikipedia.org/wiki/Argon2) (Argon2i and Argon2id variants)。

> 注意：Argon2i 驱动程序需要 PHP 7.2.0 或更高版本，而 Argon2id 驱动程序则需要 PHP 7.3.0 或更高版本。

<a name="basic-usage"></a>
## 基本用法

<a name="hashing-passwords"></a>
### 哈希密码

你可以通过调用 `Hash` facade 的 `make` 方法来加密你的密码：

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;

    class PasswordController extends Controller
    {
        /**
         * 更新用户密码
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        public function update(Request $request)
        {
            // 验证新密码长度

            $request->user()->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();
        }
    }



<a name="adjusting-the-bcrypt-work-factor"></a>
#### 调整 Bcrypt 加密系数

如果使用 Bcrypt 算法，你可以在 `make` 方法中使用 `rounds` 选项来配置该算法的加密系数。然而，对大多数应用程序来说，默认值就足够了：

    $hashed = Hash::make('password', [
        'rounds' => 12,
    ]);

<a name="adjusting-the-argon2-work-factor"></a>
#### 调整 Argon2 加密系数

如果使用 Argon2 算法，你可以在 `make` 方法中使用 `memory`，`time` 和 `threads` 选项来配置该算法的加密系数。然后，对大多数应用程序来说，默认值就足够了：

    $hashed = Hash::make('password', [
        'memory' => 1024,
        'time' => 2,
        'threads' => 2,
    ]);

> 技巧：有关这些选项的更多信息，请查阅 [关于 Argon Hash 的 PHP 官方文档](https://secure.php.net/manual/zh/function.password-hash.php)。

<a name="verifying-that-a-password-matches-a-hash"></a>
### 验证密码是否与哈希匹配

`check` 方法能为你验证一段给定的未加密字符串与给定的散列/哈希值是否一致：

    if (Hash::check('plain-text', $hashedPassword)) {
        // 密码匹配...
    }

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 检查密码是否需要重新散列/哈希

`needsRehash` 方法可以为你检查当散列/哈希的加密系数改变时，你的密码是否被新的加密系数重新加密过。某些应用程序选择在身份验证时执行这一项检查：

    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }

