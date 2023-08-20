
# 哈希

- [介绍](#introduction)
- [配置](#configuration)
- [基本用法](#basic-usage)
    - [哈希密码](#hashing-passwords)
    - [验证密码是否与哈希值相匹配](#verifying-that-a-password-matches-a-hash)
    - [确定密码是否需要重新哈希](#determining-if-a-password-needs-to-be-rehashed)

<a name="introduction"></a>

## 介绍

Laravel `Hash` [Facad](/docs/laravel/10.x/facades) 为存储用户密码提供了安全的 Bcrypt 和 Argon2 哈希。如果您使用的是一个[Laravel 应用程序启动套件](/docs/laravel/10.x/st arter-kits)，那么在默认情况下，Bcrypt 将用于注册和身份验证。

Bcrypt 是哈希密码的绝佳选择，因为它的「加密系数」是可调节的，这意味着随着硬件功率的增加，生成哈希的时间可以增加。当哈希密码时，越慢越好。算法花费的时间越长，恶意用户生成「彩虹表」的时间就越长，该表包含所有可能的字符串哈希值，这些哈希值可能会被用于针对应用程序的暴力攻击中。

<a name="configuration"></a>

## 配置

你可以在 `config/hashing.php` 配置文件中配置默认哈希驱动程序。目前有几个受支持的驱动程序：[Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 和 [Argon2](https://en.wikipedia.org/wiki/Argon2)（Argon2i 和 Argon2id 变体）。

<a name="basic-usage"></a>

## 基本用法

<a name="hashing-passwords"></a>

### 哈希密码

您可以通过在 `Hash` Facade 上调用 `make` 方法来哈希密码：

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * 更新用户的密码。
     */
    public function update(Request $request): RedirectResponse
    {
        // 验证新密码的长度...

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();

        return redirect('/profile');
    }
}
```

<a name="adjusting-the-bcrypt-work-factor"></a>

#### 调整 Bcrypt 加密系数

如果您正在使用 Bcrypt 算法，则 `make` 方法允许您使用 `rounds` 选项来配置该算法的加密系数。然而，对大多数应用程序来说，默认值就足够了：

```
$hashed = Hash::make('password', [
    'rounds' => 12,
]);

```

<a name="adjusting-the-argon2-work-factor"></a>

#### 调整 Argon2 加密系数

如果您正在使用 Argon2 算法，则 `make` 方法允许您使用 `memory`，`time` 和 `threads` 选项来配置该算法的加密系数。然后，对大多数应用程序来说，默认值就足够了：

```
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);

```

> **注意**
> 有关这些选项的更多信息，请参见 [关于 Argon 哈希的官方 PHP 文档](https://secure.php.net/manual/en/function.password-hash.php) 。

<a name="verifying-that-a-password-matches-a-hash"></a>

### 验证密码是否与哈希值相匹配

由 `Hash` Facade 提供的 `check` 方法允许您验证给定的明文字符串是否与给定的哈希值一致：

```
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}

```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>

### 确定密码是否需要重新哈希

由 `Hash` Facade 提供的 `needsRehash` 方法可以为你检查当散列 / 哈希的加密系数改变时，你的密码是否被新的加密系数重新加密过。某些应用程序选择在身份验证过程中执行此检查：

```
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```
