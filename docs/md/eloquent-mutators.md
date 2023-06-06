# Eloquent: 修改器 & 类型转换

- [简介](#introduction)
- [访问器 & 修改器](#accessors-and-mutators)
    - [定义一个访问器](#defining-an-accessor)
    - [定义一个修改器](#defining-a-mutator)
- [属性转换](#attribute-casting)
    - [数组 & JSON 转换](#array-and-json-casting)
    - [Date 转换](#date-casting)
    - [枚举转换](#enum-casting)
    - [加密转换](#encrypted-casting)
    - [查询时转换](#query-time-casting)
- [自定义类型转换](#custom-casts)
    - [值对象转换](#value-object-casting)
    - [数组 / JSON 序列化](#array-json-serialization)
    - [入站转换](#inbound-casting)
    - [类型转换参数](#cast-parameters)
    - [Castables](#castables)

<a name="introduction"></a>
## 简介

当你在 Eloquent 模型实例中获取或设置某些属性值的时候，访问器和修改器允许你对 Eloquent 属性值进行格式化。例如，你可能需要使用 [Laravel 加密器](https://learnku.com/docs/laravel/8.5/encryption) 来加密保存在数据库中的值，而在使用 Eloquent 模型访问该属性的时候自动进行解密其值。

或者，当通过 Eloquent 模型访问存储在数据库的 JSON 字符串时，你可能希望将其转换为数组。

<a name="accessors-and-mutators"></a>
## 访问器 & 修改器

<a name="defining-an-accessor"></a>
### 定义一个访问器

访问器会在访问一个模型的属性时转换 Eloquent 值。要定义访问器，请在模型中创建一个受保护的「驼峰式」方法来表示可访问属性。此方法名称对应到真正的底层模型 `属性/数据库字段` 的表示。

在本例中，我们将为 first_name 属性定义一个访问器。在尝试检索 first_name 属性的值时，Eloquent 会自动调用访问器。所有属性访问器/修改器方法必须声明 `Illuminate\Database\Eloquent\Casts\Attribute` 的返回类型提示：

```
<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
 
class User extends Model
{
    /**
     * 获取用户的名字。
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
        );
    }
}
```



所有访问器方法都返回一个 `Attribute` 实例，该实例定义了如何访问该属性以及如何改变该属性。 在此示例中，我们仅定义如何访问该属性。 为此，我们将 `get` 参数提供给 `Attribute` 类构造函数。

如你所见，字段的原始值被传递到访问器中，允许你对它进行处理并返回结果。如果想获取被修改后的值，你可以在模型实例上访问 `first_name` 属性：

    use App\Models\User;

    $user = User::find(1);

    $firstName = $user->first_name;

> 技巧：如果要将这些计算值添加到模型的数组/JSON 表示中，[你需要追加它们](/docs/laravel/9.x/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 从多个属性构建值对象

有时你的访问器可能需要将多个模型属性转换为单个「值对象」。 为此，你的 `get` 闭包可以接受 `$attributes` 的第二个参数，该参数将自动提供给闭包，并将包含模型所有当前属性的数组：

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 与用户地址交互。
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
public function address(): Attribute
{
    return new Attribute(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}

```
#### 访问器缓存
从访问器返回值对象时，对值对象所做的任何更改都将在模型保存之前自动同步回模型。 这是可能的，因为 Eloquent 保留了访问器返回的实例，因此每次调用访问器时都可以返回相同的实例：

    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Line 1 Value';
    $user->address->lineTwo = 'Updated Address Line 2 Value';

    $user->save();

有时您可能希望为字符串和布尔值等原始值启用缓存，特别是当它们是计算密集型时。要实现这一点，您可以在定义访问器时调用 `shouldCache` 方法：
```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn ($value) => bcrypt(gzuncompress($value)),
      )->shouldCache();
}
```
如果要禁用属性的缓存，可以在定义属性时调用 `withoutObjectCaching` 方法：

```php
/**
 * 与 user 的 address 交互.
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
public function address(): Attribute
{
    return (new Attribute(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    ))->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### 定义修改器

修改器会在设置属性时生效。要定义修改器，可以在定义属性时提供 `set` 参数。让我们为 `first_name` 属性定义一个修改器。这个修改器将会在我们修改 `first_name` 属性的值时自动调用：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 与 user 的first name 交互
         *
         * @param  string  $value
         * @return \Illuminate\Database\Eloquent\Casts\Attribute
         */
        protected function firstName(): Attribute
        {
            return new Attribute(
                get: fn ($value) => ucfirst($value),
                set: fn ($value) => strtolower($value),
            );
        }
    }

修改器的闭包会接收将要设置的值，并允许我们使用和返回该值。要使该修改器生效，只需在模型上设置  `first_name` 即可：

    use App\Models\User;

    $user = User::find(1);

    $user->first_name = 'Sally';

在本例中，值 `Sally` 将会触发 `set` 回调。然后，修改器会使用 `strtolower` 函数处理姓名，并将结果值设置在模型的 `$attributes` 数组中。



<a name="mutating-multiple-attributes"></a>
#### 修改多个属性

有时你的修改器可能需要修改底层模型的多个属性。 为此，你的 `set` 闭包可以返回一个数组，数组中的每个键都应该与模型的属性/数据库列相对应：

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 与user模型的address交互.
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
public function address(): Attribute
{
    return new Attribute(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="attribute-casting"></a>
## 属性转换

属性转换提供了类似于访问器和修改器的功能，且无需在模型上定义任何其他方法。模型中的 `$casts` 属性提供了一个便利的方法来将属性转换为常见的数据类型。

`$casts` 属性应是一个数组，且数组的键是那些需要被转换的属性名称，值则是你希望转换的数据类型。支持转换的数据类型有：

<div class="content-list" markdown="1">

- `array`
- `AsStringable::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- `decimal:`<code>&lt;digits&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

示例， 让我们把以整数 (`0` 或 `1`) 形式存储在数据库中的 `is_admin` 属性转成布尔值：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 类型转换
         *
         * @var array
         */
        protected $casts = [
            'is_admin' => 'boolean',
        ];
    }



现在当你访问 `is_admin` 属性时，虽然保存在数据库里的值是一个整数类型，但是返回值总是会被转换成布尔值类型：

    $user = App\Models\User::find(1);

    if ($user->is_admin) {
        //
    }

如果需要在运行时添加新的临时强制转换，可以使用 `mergeCasts` 这些强制转换定义将添加到模型上已定义的任何强制转换中：

    $user->mergeCasts([
        'is_admin' => 'integer',
        'options' => 'object',
    ]);

> 注意： `null` 值属性将不会被转换。此外，禁止定义与关联同名的类型转换（或属性）。

<a name="stringable-casting"></a>
#### 强制转换

你可以用 `Illuminate\Database\Eloquent\Casts\AsStringable` 类将模型属性强制转换为 [`Illuminate\Support\Stringable` 对象](/docs/laravel/9.x/helpers#fluent-strings-method-list)：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\AsStringable;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be cast.
         *
         * @var array
         */
        protected $casts = [
            'directory' => AsStringable::class,
        ];
    }

<a name="array-and-json-casting"></a>
### 数组 & JSON 转换

当你在数据库存储序列化的 JSON 的数据时， `array` 类型的转换非常有用。比如：如果你的数据库具有被序列化为 JSON 的 `JSON` 或 `TEXT` 字段类型，并且在 Eloquent 模型中加入了 `array` 类型转换，那么当你访问的时候就会自动被转换为 PHP 数组：

    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be cast.
         *
         * @var array
         */
        protected $casts = [
            'options' => 'array',
        ];
    }



一旦定义了转换，你访问 `options` 属性时他会自动从 JSON 类型反序列化为 PHP 数组。当你设置了  `options` 属性的值时，给定的数组也会自动序列化为 JSON 类型存储：

    use App\Models\User;

    $user = User::find(1);

    $options = $user->options;

    $options['key'] = 'value';

    $user->options = $options;

    $user->save();

当使用 `update` 方法更新 JSON 属性的单个字段时，可以使用 `->` 操作符让语法更加简洁：

    $user = User::find(1);

    $user->update(['options->key' => 'value']);

<a name="array-object-and-collection-casting"></a>
#### 数组对象 & 集合 类型转换

虽然标准的 `array` 类型转换对于许多应用程序来说已经足够了，但它确实有一些缺点。由于 `array` 类型转换返回一个基础类型，因此不可能直接改变数组键的值。例如，以下代码将触发一个 PHP 错误：

    $user = User::find(1);

    $user->options['key'] = $value;

为了解决这个问题，Laravel 提供了一个 `AsArrayObject` 类型转换，它将 JSON 属性转换为一个 [数组对象](https://www.php.net/manual/en/class.arrayobject.php) 类。这个特性是使用 Laravel 的 [自定义类型转换](#custom-casts) 实现的，它允许 Laravel 智能地缓存和转换修改的对象，这样可以在不触发 PHP 错误的情况下修改各个键的值。要使用 `AsArrayObject` 类型转换，只需将其指定给一个属性即可：

    use Illuminate\Database\Eloquent\Casts\AsArrayObject;

    /**
     * 类型转换.
     *
     * @var array
     */
    protected $casts = [
        'options' => AsArrayObject::class,
    ];

类似的，Laravel 提供了一个 `AsCollection`  类型转换，它将 JSON 属性转换为 Laravel [集合](/docs/laravel/9.x/collections) 实例：

    use Illuminate\Database\Eloquent\Casts\AsCollection;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'options' => AsCollection::class,
    ];



<a name="date-casting"></a>
### Date 转换

默认情况下，Eloquent 会将 `created_at` 和 `updated_at` 字段转换为 [Carbon](https://github.com/briannesbitt/Carbon)实例，它继承了 PHP 原生的 `DateTime` 类并提供了各种有用的方法。你可以通过在模型的 `$casts` 属性数组中定义额外的日期类型转换，用来转换其他的日期属性。通常来说，日期应该使用 `datetime` 或 `immutable_datetime` 类型转换来转换。

当使用 `date` 或 `datetime` 类型转换时，你也可以指定日期的格式。这种格式会被用在 [模型序列化为数组或者JSON](/docs/laravel/9.x/eloquent-serialization)：

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime:Y-m-d',
    ];

将列类型转换为日期时，可以将其值设置为 UNIX 时间戳、日期字符串（`Y-m-d`）、日期时间字符串或  `DateTime` / `Carbon` 实例。日期值将会被准确的转换并存储在数据库中。

通过在模型中定义 `serializeDate` 方法，你可以自定义所有模型日期的默认序列化格式。此方法不会影响日期在数据库中存储的格式：

    /**
     * 为 array / JSON 序列化准备日期格式
     *
     * @param  \DateTimeInterface  $date
     * @return string
     */
    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d');
    }

在模型上定义 `$dateFormat` 属性后，模型的日期将会以你指定的格式实际存储于数据库中：

    /**
     * 模型日期列的存储格式.
     *
     * @var string
     */
    protected $dateFormat = 'U';



<a name="date-casting-and-timezones"></a>
#### 日期转换，序列化，& 时区

默认情况下，`date` 和 `datetime` 会序列化为UTC ISO-8601格式的（ `1986-05-28T21:05:54.000000Z` ）字符串，并不会受到应用的 `timezone` 配置影响。强烈建议您始终使用此序列化格式，并不更改应用程序的 `timezone` 配置（默认 `UTC` ）以将应用程序的日期存储在UTC时区中。在整个应用程序中始终使用 UTC 时区，会使与其他 PHP 和 JavaScript 类库的互操作性更高。

如果对 `date` 或 `datetime` 属性自定义了格式，例如 `datetime:Y-m-d H:i​:s`，那么在日期序列化期间将使用Carbon实例的内部时区。通常，这是应用程序的 `timezone` 配置选项中指定的时区。

<a name="enum-casting"></a>
### 枚举转换

> 注意：枚举转换仅适用于 PHP 8.1+.

Eloquent 还允许您将属性值强制转换为 PHP 的 [枚举](https://www.php.net/manual/en/language.enumerations.backed.php)。为此，可以在模型的 `$casts` 数组属性中指定要转换的属性和枚举：

    use App\Enums\ServerStatus;

    /**
     * 要转换的属性
     *
     * @var array
     */
    protected $casts = [
        'status' => ServerStatus::class,
    ];

在模型上定义了转换后，与属性交互时，指定的属性都将在枚举中强制转换：

    if ($server->status == ServerStatus::provisioned) {
        $server->status = ServerStatus::ready;

        $server->save();
    }



<a name="encrypted-casting"></a>

### 加密转换

`encrypted` 转换使用了 Laravel 的内置 [encryption](/docs/laravel/9.x/encryption) 功能加密模型的属性值。 此外，`encrypted:array`、`encrypted:collection`、`encrypted:object`、`AsEncryptedArrayObject` 和 `AsEncryptedCollection` 类型转换的工作方式与未加密的类型相同； 但是，正如您所料，底层值在存储在数据库中时是加密的。

由于加密文本的最终长度不可预测并且比其纯文本长度要长，因此请确保关联的数据库列属性是 `TEXT` 类型或更大。此外，由于数据库中的值是加密的，您将无法查询或搜索加密的属性值。

<a name="query-time-casting"></a>
### 查询时转换

有时你可能需要在执行查询时应用强制转换，例如从表中选择原始值时。 例如，考虑以下查询：

    use App\Models\Post;
    use App\Models\User;

    $users = User::select([
        'users.*',
        'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
    ])->get();

在该查询获取到的结果集中，`last_posted_at` 属性将会是一个字符串。假如我们在执行查询时进行 `datetime` 类型转换将更方便。你可以通过使用 `withCasts` 方法来完成上述操作：

    $users = User::select([
        'users.*',
        'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
    ])->withCasts([
        'last_posted_at' => 'datetime'
    ])->get();

<a name="custom-casts"></a>
## 自定义类型转换

Laravel 有多种内置的、有用的类型转换； 如果需要自定义的强制转换类型。 可以通过定义一个实现 `CastsAttributes` 接口的类来实现这一点。



实现这个接口的类必须定义一个 `get` 和 `set` 方法。 `get` 方法负责将数据库中的原始值转换为转换值，而 `set` 方法应将转换值转换为可以存储在数据库中的原始值。 作为示例，我们将内置的 `json` 类型转换重新实现为自定义类型：

    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

    class Json implements CastsAttributes
    {
        /**
         * 将取出的数据进行转换
         *
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @param  string  $key
         * @param  mixed  $value
         * @param  array  $attributes
         * @return array
         */
        public function get($model, $key, $value, $attributes)
        {
            return json_decode($value, true);
        }

        /**
         * 转换成将要进行存储的值
         *
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @param  string  $key
         * @param  array  $value
         * @param  array  $attributes
         * @return string
         */
        public function set($model, $key, $value, $attributes)
        {
            return json_encode($value);
        }
    }

定义好自定义类型转换后，可以使用其类名称将其附加到模型属性里：

    <?php

    namespace App\Models;

    use App\Casts\Json;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * 应被强制转换的属性
         *
         * @var array
         */
        protected $casts = [
            'options' => Json::class,
        ];
    }

<a name="value-object-casting"></a>
### 值对象转换

你不仅可以将数据转换成原生的数据类型，还可以将数据转换成对象。两种自定义类型转换的定义方式非常类似。但是将数据转换成对象的自定义转换类中的 set 方法需要返回键值对数组，用于设置原始、可存储的值到对应的模型中。

举个例子，定义一个自定义类型转换类用于将多个模型属性值转换成单个 `Address` 值对象，假设 `Address` 对象有两个公有属性 `lineOne` 和 `lineTwo`:



例如，我们将定义一个自定义转换类，将多个模型值转换为单个「地址」值对象。 我们将假设 `Address` 值有两个公共属性：`lineOne` 和 `lineTwo`：

    <?php

    namespace App\Casts;

    use App\Models\Address as AddressModel;
    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
    use InvalidArgumentException;

    class Address implements CastsAttributes
    {
        /**
         * 转换给定的值
         *
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @param  string  $key
         * @param  mixed  $value
         * @param  array  $attributes
         * @return \App\Models\Address
         */
        public function get($model, $key, $value, $attributes)
        {
            return new AddressModel(
                $attributes['address_line_one'],
                $attributes['address_line_two']
            );
        }

        /**
         * 准备给定值以进行存储
         *
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @param  string  $key
         * @param  \App\Models\Address  $value
         * @param  array  $attributes
         * @return array
         */
        public function set($model, $key, $value, $attributes)
        {
            if (! $value instanceof AddressModel) {
                throw new InvalidArgumentException('The given value is not an Address instance.');
            }

            return [
                'address_line_one' => $value->lineOne,
                'address_line_two' => $value->lineTwo,
            ];
        }
    }

转换为值对象时，对值对象所做的任何更改都将在模型保存之前自动同步回模型：

    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Value';

    $user->save();

> 技巧：如果你计划将包含值对象的 Eloquent 模型序列化为 JSON 或数组，那么应该在值对象上实现 `Illuminate\Contracts\Support\Arrayable` 和 `JsonSerializable` 接口。

<a name="array-json-serialization"></a>
### 数组 / JSON 序列化

当使用 `toArray` 和 `toJson` 方法将 Eloquent 模型转换为数组或 JSON 时，自定义转换值对象通常会被序列化，只要它们实现 `Illuminate\Contracts\Support\Arrayable` 和 `JsonSerializable` 接口。 但是，在使用第三方库提供的值对象时，你可能无法将这些接口添加到对象中。



因此，你可以指定你自定义的类型转换类，它将负责序列化成值对象。为此，你自定义的类型转换类需要实现 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 接口。此接口声明类应包含 `serialize` 方法，该方法应返回值对象的序列化形式：

    /**
     * 获取值的序列化表示形式
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return mixed
     */
    public function serialize($model, string $key, $value, array $attributes)
    {
        return (string) $value;
    }

<a name="inbound-casting"></a>
### 入站转换

有时候，你可能只需要对写入模型的属性值进行类型转换而不需要对从模型中获取的属性值进行任何处理。一个典型入站类型转换的例子就是 「hashing」。入站类型转换类需要实现 `CastsInboundAttributes` 接口，只需要实现 `set` 方法。

    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;

    class Hash implements CastsInboundAttributes
    {
        /**
         * 哈希算法
         *
         * @var string
         */
        protected $algorithm;

        /**
         * 创建一个新的类型转换类实例
         *
         * @param  string|null  $algorithm
         * @return void
         */
        public function __construct($algorithm = null)
        {
            $this->algorithm = $algorithm;
        }

        /**
         * 转换成将要进行存储的值
         *
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @param  string  $key
         * @param  array  $value
         * @param  array  $attributes
         * @return string
         */
        public function set($model, $key, $value, $attributes)
        {
            return is_null($this->algorithm)
                        ? bcrypt($value)
                        : hash($this->algorithm, $value);
        }
    }

<a name="cast-parameters"></a>
### 转换参数

当将自定义类型转换附加到模型时，可以指定传入的类型转换参数。传入类型转换参数需使用 `:` 将参数与类名分隔，多个参数之间使用逗号分隔。这些参数将会传递到类型转换类的构造函数中：

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'secret' => Hash::class.':sha256',
    ];



<a name="castables"></a>
### 可转换

如果要允许应用程序对象的值定义它们自定义转换类。除了将自定义转换类附加到你的模型之外，还可以附加一个实现 `Illuminate\Contracts\Database\Eloquent\Castable` 接口的值对象类：

    use App\Models\Address;

    protected $casts = [
        'address' => Address::class,
    ];

实现 `Castable` 接口的对象必须定义一个 `castUsing` 方法，此方法返回的是负责将 `Castable` 类进行自定义转换的转换器类名：

    <?php

    namespace App\Models;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use App\Casts\Address as AddressCast;

    class Address implements Castable
    {
        /**
         * 获取转换器的类名用以转换当前类型转换对象
         *
         * @param  array  $arguments
         * @return string
         */
        public static function castUsing(array $arguments)
        {
            return AddressCast::class;
        }
    }

使用 `Castable` 类时，仍然可以在 `$casts` 定义中提供参数。参数将传递给 `castUsing` 方法：

    use App\Models\Address;

    protected $casts = [
        'address' => Address::class.':argument',
    ];

<a name="anonymous-cast-classes"></a>
#### 可转换 & 匿名类型转换类

通过将 `castables` 与 PHP 的 [匿名类](https://www.php.net/manual/en/language.oop5.anonymous.php) 相结合，可以将值对象及其转换逻辑定义为单个可转换对象。为此，请从值对象的 `castUsing` 方法返回一个匿名类。匿名类应该实现 `CastsAttributes` 接口：

    <?php

    namespace App\Models;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

    class Address implements Castable
    {
        // ...

        /**
         * 获取转换器类用以转换当前类型转换对象
         *
         * @param  array  $arguments
         * @return object|string
         */
        public static function castUsing(array $arguments)
        {
            return new class implements CastsAttributes
            {
                public function get($model, $key, $value, $attributes)
                {
                    return new Address(
                        $attributes['address_line_one'],
                        $attributes['address_line_two']
                    );
                }

                public function set($model, $key, $value, $attributes)
                {
                    return [
                        'address_line_one' => $value->lineOne,
                        'address_line_two' => $value->lineTwo,
                    ];
                }
            };
        }
    }

