# 本地化

- [简介](#introduction)
    - [配置语言环境](#configuring-the-locale)
- [定义翻译字符串](#defining-translation-strings)
    - [使用短键](#using-short-keys)
    - [使用翻译字符串作为键](#using-translation-strings-as-keys)
- [检索翻译字符串](#retrieving-translation-strings)
    - [替换翻译字符串中的参数](#replacing-parameters-in-translation-strings)
    - [复数化](#pluralization)
- [覆盖扩展包的语言文件](#overriding-package-language-files)

<a name="introduction"></a>
## 简介

Laravel 的本地化功能提供了一种方便的方法来检索各种语言的字符串，从而使你可以轻松地在应用程序中支持多种语言。

Laravel 提供了两种管理翻译字符串的方法。首先，语言字符串可以存储在`lang`目录里的文件中。在此目录中，可能存在应用程序支持的每种语言的子目录。这是 Laravel 用于管理内置 Laravel 功能（例如验证错误消息）的翻译字符串的方法：

    /lang
        /en
            messages.php
        /es
            messages.php

或者，可以在 `lang` 目录中放置的 JSON 文件中定义翻译字符串。采用这种方法时，应用程序支持的每种语言在此目录中都会有一个对应的 JSON 文件。对于具有大量可翻译字符串的应用，建议使用此方法：

    /lang
        en.json
        es.json

我们将在本文档中讨论每种管理翻译字符串的方法。

<a name="configuring-the-locale"></a>
### 配置语言环境

应用程序的默认语言存储在 `config/app.php` 配置文件的 `locale` 配置选项中。你可以随意修改此值以适合你的应用程序的需求。

你可以使用 `App` Facade 提供的 `setLocale` 方法,在运行时通过单个 HTTP 请求修改默认语言：

    use Illuminate\Support\Facades\App;

    Route::get('/greeting/{locale}', function ($locale) {
        if (! in_array($locale, ['en', 'es', 'fr'])) {
            abort(400);
        }

        App::setLocale($locale);

        //
    });



你可以配置一个 “备用语言”，当当前语言不包含给定的翻译字符串时，将使用该语言。和默认语言一样，备用语言也是在`config/app.php`配置文件中配置的。

    'fallback_locale' => 'en',

<a name="determining-the-current-locale"></a>
#### 确定当前的语言环境

你可以使用`currentLocale`和`isLocale`方法来确定当前的`locale`或检查`locale`是否是一个给定值。

    use Illuminate\Support\Facades\App;

    $locale = App::currentLocale();

    if (App::isLocale('en')) {
        //
    }

<a name="defining-translation-strings"></a>
## 定义翻译字符串

<a name="using-short-keys"></a>
### 使用短键

通常，翻译字符串存储在 `lang` 目录中的文件中。在这个目录中，应用程序支持的每种语言都应该有一个子目录。这是Laravel用于管理内置 Laravel 功能（如验证错误消息）的翻译字符串的方法：

    /lang
        /en
            messages.php
        /es
            messages.php

所有的语言文件都会返回一个键值对数组。比如下方这个例子：

    <?php

    // lang/en/messages.php

    return [
        'welcome' => 'Welcome to our application!',
    ];

> 注意：对于不同地区的语言，应根据 ISO 15897 命名语言目录。例如，英式英语应使用「en_GB」而不是 「en_gb」。

<a name="using-translation-strings-as-keys"></a>
### 使用翻译字符串作为键

对于具有大量可翻译字符串的应用程序，在视图中引用键时，使用「短键」定义每个字符串可能会令人困惑，并且为应用程序支持的每个翻译字符串不断发明键会很麻烦。

出于这个原因，Laravel 还支持使用字符串的「默认」翻译作为键来定义翻译字符串。使用翻译字符串作为键的翻译文件作为JSON文件存储在 `lang` 目录中。例如，如果你的应用程序有西班牙语翻译，你应该创建一个 `lang/es.json` 文件：

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 键 / 文件冲突

你不应该定义和其他翻译文件的文件名存在冲突的键。例如，在 `nl/action.php` 文件存在，但 `nl.json` 文件不存在时，对 `NL` 语言翻译 `__('Action')` 会导致翻译器返回 `nl/action.php` 文件的全部内容。

## 检索翻译字符串

您可以使用 `__` 辅助函数从语言文件中检索翻译字符串。 如果您使用“短键”来定义翻译字符串，您应该使用“点”语法将包含键的文件和键本身传递给`__`函数。 例如，让我们从 `lang/en/messages.php` 语言文件中检索 `welcome` 翻译字符串：

    echo __('messages.welcome');

如果指定的翻译字符串不存在，`__` 函数将返回翻译字符串键。 因此，使用上面的示例，如果翻译字符串不存在，`__` 函数将返回 `messages.welcome`。

  如果您使用 [默认翻译字符串作为翻译键](#using-translation-strings-as-keys)，则应将字符串的默认翻译传递给 `__` 函数；

    echo __('I love programming.');

同样，如果翻译字符串不存在，`__` 函数将返回给定的翻译字符串键。



如果您使用的是 [Blade 模板引擎](/docs/laravel/9.x/blade)，则可以使用 `{{ }}` 语法来显示翻译字符串：

    {{ __('messages.welcome') }}

<a name="replacing-parameters-in-translation-strings"></a>
### 替换翻译字符串中的参数

如果愿意，可以在翻译字符串中定义占位符。所有占位符的前缀都是 `:`。例如，可以使用占位符名称定义欢迎消息：

    'welcome' => 'Welcome, :name',

在要检索翻译字符串时替换占位符，可以将替换数组作为第二个参数传递给 `__` 函数：

    echo __('messages.welcome', ['name' => 'dayle']);

如果占位符包含所有大写字母，或仅首字母大写，则转换后的值将相应地转换成大写：

    'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
    'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle

<a name="pluralization"></a>
### 复数化

因为不同的语言有着各种复杂的复数化规则,所以复数化是个复杂的问题;不过Laravel 可以根据你定义的复数化规则帮助你翻译字符串。使用 `|` 字符，可以区分字符串的单数形式和复数形式：

    'apples' => 'There is one apple|There are many apples',

当然，使用 [翻译字符串作为键](#using-translation-strings-as-keys) 时也支持复数化：

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

你甚至可以创建更复杂的复数化规则，为多个值范围指定转换字符串：

    'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',

定义具有复数选项的翻译字符串后，可以使用 `trans_choice`  函数检索给定「count」的行。在本例中，由于计数大于 1 ，因此返回翻译字符串的复数形式：

    echo trans_choice('messages.apples', 10);



也可以在复数化字符串中定义占位符属性。通过将数组作为第三个参数传递给 `trans_choice` 函数，可以替换这些占位符：

    'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

    echo trans_choice('time.minutes_ago', 5, ['value' => 5]);

如果要显示传递给 `trans_choice` 函数的整数值，可以使用内置的 `:count` 占位符：

    'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',

<a name="overriding-package-language-files"></a>
## 覆盖扩展包的语言文件

有些包可能随自己的语言文件一起装运。你可以将文件放置在 `lang/vendor/{package}/{locale}` 目录中，而不是更改扩展包的核心文件来调整这些行。

例如，如果需要重写位于名为 `skyrim/hearthfire` 的包的 `messages.php` 文件内容，应将语言文件放在： `lang/vendor/hearthfire/en/messages.php` 在这个文件中，你应该只定义要覆盖的翻译字符串。任何未重写的翻译字符串仍将从包的原始语言文件中加载。

