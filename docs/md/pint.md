
# Laravel Pint

- [介绍](#introduction)
- [安装](#installation)
- [运行 Pint](#running-pint)
- [配置 Pint](#configuring-pint)
  - [Presets (预设)](#presets)
  - [规则](#rules)
  - [排除文件/文件夹](#excluding-files-or-folders)

<a name="introduction"></a>
## 介绍

[Laravel Pint](https://github.com/laravel/pint) 是一款面向极简主义者的 PHP 代码风格固定工具。Pint 是建立在 PHP-CS-Fixer 基础上，使保持代码风格的整洁和一致变得简单。

Pint 会随着所有新的 Laravel 应用程序自动安装，所以你可以立即开始使用它。默认情况下，Pint 不需要任何配置，将通过遵循 Laravel 的观点性编码风格来修复你的代码风格问题。

<a name="installation"></a>
## 安装

Pint 已包含在 Laravel 框架的最近版本中，所以无需安装。然而，对于旧的应用程序，你可以通过 Composer 安装 Laravel Pint：

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## 运行 Pint

可以通过调用你项目中的 `vendor/bin` 目录下的 `pint` 二进制文件来指示 Pint 修复代码风格问题：

```shell
./vendor/bin/pint
```

你也可以在特定的文件或目录上运行 Pint：

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint 将显示它所更新的所有文件的详细列表。 你可以在调用 Pint 时提供 `-v` 选项来查看更多关于 Pint 修改的细节。：

```shell
./vendor/bin/pint -v
```

如果你只想 Pint 检查代码中风格是否有错误，而不实际更改文件，则可以使用 `--test` 选项：

```shell
./vendor/bin/pint --test
```

如果你希望 Pint 根据 Git 仅修改未提交更改的文件，你可以使用 `--dirty` 选项：

```shell
./vendor/bin/pint --dirty
```

<a name="configuring-pint"></a>
## 配置 Pint

如前面所述，Pint 不需要任何配置。但是，如果你希望自定义预设、规则或检查的文件夹，可以在项目的根目录中创建一个 `pint.json` 文件：

```json
{
  "preset": "laravel"
}
```

此外，如果你希望使用特定目录中的 `pint.json`，可以在调用 Pint 时提供 `--config` 选项：

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### Presets(预设)

Presets 定义了一组规则，可以用来修复代码风格问题。默认情况下，Pint 使用 laravel preset，通过遵循 `Laravel` 的固定编码风格来修复问题。但是，你可以通过向 Pint 提供 `--preset` 选项来指定一个不同的 preset 值：

```shell
pint --preset psr12
```

如果你愿意，还可以在项目的 `pint.json` 文件中设置 preset ：

```json
{
  "preset": "psr12"
}
```

Pint 目前支持的 presets 有：`laravel`、`psr12` 和 `symfony`。

<a name="rules"></a>
### 规则

规则是 Pint 用于修复代码风格问题的风格指南。如上所述，presets 是预定义的规则组，适用于大多数 PHP 项目，因此你通常不需要担心它们所包含的单个规则。

但是，如果你愿意，可以在 `pint.json` 文件中启用或禁用特定规则：

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "braces": false,
        "new_with_braces": {
            "anonymous_class": false,
            "named_class": false
        }
    }
}
```

Pint是基于 [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) 构建的。因此，您可以使用它的任何规则来修复项目中的代码风格问题： [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### 排除文件/文件夹

默认情况下，Pint将检查项目中除 `vendor` 目录以外的所有 `.php` 文件。如果您希望排除更多文件夹，可以使用 `exclude` 配置选项:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

如果您希望排除包含给定名称模式的所有文件，则可以使用 `notName` 配置选项:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

如果您想要通过提供文件的完整路径来排除文件，则可以使用 `notPath` 配置选项:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

