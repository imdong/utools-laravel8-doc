# Eloquent: 序列化

- [简介](#introduction)
- [序列化模型 & 集合](#serializing-models-and-collections)
    - [序列化为数组](#serializing-to-arrays)
    - [序列化为 JSON](#serializing-to-json)
- [隐藏 JSON 属性](#hiding-attributes-from-json)
- [追加 JSON 值](#appending-values-to-json)
- [序列化日期](#date-serialization)

<a name="introduction"></a>
## 简介

在使用 Laravel 构建 API 时，经常需要把模型和关联转化为数组或 JSON。针对这些操作，Eloquent 提供了一些便捷方法，以及对序列化中的属性控制。

> 技巧：想获得更全面处理 Eloquent 的模型和集合 JSON 序列化的方法，请查看 [Eloquent API 资源](/docs/laravel/10.x/eloquent-resources) 文档。

<a name="serializing-models-and-collections"></a>
## 序列化模型 & 集合

<a name="serializing-to-arrays"></a>
### 序列化为数组

要转化模型及其加载的 [关联](/docs/laravel/10.x/eloquent-relationships) 为数组，可以使用 `toArray` 方法。这是一个递归的方法，因此所有的属性和关联（包括关联的关联）都将转化成数组：

    use App\Models\User;

    $user = User::with('roles')->first();

    return $user->toArray();

`attributesToArray` 方法可用于将模型的属性转换为数组，但不会转换其关联：

    $user = User::first();

    return $user->attributesToArray();

您还可以通过调用集合实例上的 `toArray` 方法，将模型的全部 [集合](/docs/laravel/10.x/eloquent-collections) 转换为数组：

    $users = User::all();

    return $users->toArray();

<a name="serializing-to-json"></a>
### 序列化为 JSON

您可以使用 `toJson` 方法将模型转化成 JSON。和 `toArray` 一样，`toJson` 方法也是递归的，因此所有属性和关联都会转化成 JSON, 您还可以指定由 [PHP 支持](https://secure.php.net/manual/en/function.json-encode.php)的任何  JSON 编码选项：


    use App\Models\User;

    $user = User::find(1);

    return $user->toJson();

    return $user->toJson(JSON_PRETTY_PRINT);



或者，你也可以将模型或集合转换为字符串，模型或集合上的 `toJson` 方法会自动调用：

    return (string) User::find(1);

由于模型和集合在转化为字符串的时候会转成 JSON， 因此可以在应用的路由或控制器中直接返回 Eloquent 对象。Laravel 会自动将 Eloquent 模型和集合序列化为 JSON：

    Route::get('users', function () {
        return User::all();
    });

<a name="relationships"></a>
#### 关联关系

当一个模型被转化为 JSON 的时候，它加载的关联关系也将自动转化为 JSON 对象被包含进来。同时，通过「小驼峰」定义的关联方法，关联的 JSON 属性将会是「蛇形」命名。

<a name="hiding-attributes-from-json"></a>
## 隐藏 JSON 属性

有时要将模型数组或 JSON 中的某些属性进行隐藏，比如密码。则可以在模型中添加 `$hidden` 属性。模型序列化后， `$hidden` 数组中列出的属性将不会被显示：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 数组中的属性会被隐藏。
         *
         * @var array
         */
        protected $hidden = ['password'];
    }

> **注意**
> 隐藏关联时，需添加关联的方法名到 `$hidden` 属性中。

此外，也可以使用属性 `visible` 定义一个模型数组和 JSON 可见的「白名单」。转化后的数组或 JSON 不会出现其他的属性：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 数组中的属性会被展示。
         *
         * @var array
         */
        protected $visible = ['first_name', 'last_name'];
    }


<a name="temporarily-modifying-attribute-visibility"></a>
#### 临时修改可见属性

如果你想要在一个模型实例中显示隐藏的属性，可以使用 `makeVisible` 方法。`makeVisible` 方法返回模型实例：

    return $user->makeVisible('attribute')->toArray();

相应地，如果你想要在一个模型实例中隐藏可见的属性，可以使用 `makeHidden` 方法。

    return $user->makeHidden('attribute')->toArray();

如果你想临时覆盖所有可见或隐藏的属性，你可以分别使用`setVisible`和`setHidden`方法:

    return $user->setVisible(['id', 'name'])->toArray();

    return $user->setHidden(['email', 'password', 'remember_token'])->toArray();

<a name="appending-values-to-json"></a>
## 追加 JSON 值

有时，需要在模型转换为数组或 JSON 时添加一些数据库中不存在字段的对应属性。要实现这个功能，首先要定义一个 [访问器](/docs/laravel/10.x/eloquent-mutators)：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 判断用户是否是管理员。
         */
        protected function isAdmin(): Attribute
        {
            return new Attribute(
                get: fn () => 'yes',
            );
        }
    }

如果你想附加属性到模型中，可以使用模型属性 `appends` 中添加该属性名。注意，尽管访问器使用「驼峰命名法」方式定义，但是属性名通常以「蛇形命名法」的方式来引用：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 要附加到模型数组表单的访问器。
         *
         * @var array
         */
        protected $appends = ['is_admin'];
    }


使用 `appends` 方法追加属性后，它将包含在模型的数组和 JSON 中。`appends` 数组中的属性也将遵循模型上配置的 `visible` 和 `hidden` 设置。

<a name="appending-at-run-time"></a>
#### 运行时追加

在运行时，你可以在单个模型实例上使用 `append` 方法来追加属性。或者，使用 `setAppends` 方法来重写整个追加属性的数组：

    return $user->append('is_admin')->toArray();

    return $user->setAppends(['is_admin'])->toArray();

<a name="date-serialization"></a>
## 日期序列化

<a name="customizing-the-default-date-format"></a>
#### 自定义默认日期格式

你可以通过重写 `serializeDate` 方法来自定义默认序列化格式。此方法不会影响日期在数据库中存储的格式：

    /**
     * 为 array / JSON 序列化准备日期格式
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

<a name="customizing-the-default-date-format"></a>
#### 自定义默认日期格式

你可以在 Eloquent 的 [属性转换](/docs/laravel/10.x/eloquent-mutators#attribute-casting) 中单独为日期属性自定义日期格式：

    protected $casts = [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];

