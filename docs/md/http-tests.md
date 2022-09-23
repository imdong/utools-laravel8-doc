# HTTP 测试

- [简介](#简介)
- [创建请求](#创建请求)
    - [自定义请求头](#customizing-request-headers)
    - [Cookies](#cookies)
    - [会话 / 认证](#session-and-authentication)
    - [调试响应](#debugging-responses)
    - [异常处理](#exception-handling)
- [测试 JSON APIs](#testing-json-apis)
    - [流畅 JSON 测试](#fluent-json-testing)
- [测试文件上传](#testing-file-uploads)
- [测试视图](#testing-views)
    - [渲染切面 & 组件](#rendering-blade-and-components)
- [可用断言](#available-assertions)
    - [回应断言](#response-assertions)
    - [身份验证断言](#authentication-assertions)

<a name="introduction"></a>
## 简介

Laravel提供了一个非常流畅的API，用于向应用程序发出HTTP请求并检查响应。例如，看看下面定义的特性测试:

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 基本的测试示例.
         *
         * @return void
         */
        public function test_a_basic_request()
        {
            $response = $this->get('/');

            $response->assertStatus(200);
        }
    }

`get`方法向应用程序发出`Get`请求，而`assertStatus`方法则断言返回的响应应该具有给定的HTTP状态代码。除了这个简单的断言之外，Laravel还包含各种用于检查响应头、内容、JSON结构等的断言。

<a name="making-requests"></a>
## 创建请求

要向应用程序发出请求，可以在测试中调用`get`、`post`、`put`、`patch`或`delete`方法。这些方法实际上不会向应用程序发出“真正的” HTTP请求。相反，整个网络请求是在内部模拟的.


测试请求方法不返回`Illuminate\Http\Response`实例，而是返回`Illuminate\Testing\TestResponse`实例，该实例提供[各种有用的断言](##available-assertions),允许您检查应用程序的响应:

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 基本的测试示例.
         *
         * @return void
         */
        public function test_a_basic_request()
        {
            $response = $this->get('/');

            $response->assertStatus(200);
        }
    }



通常，您的每个测试应该只向您的应用发出一个请求。如果在单个测试方法中执行多个请求，则可能会出现意外行为。

> 技巧：为了方便起见，运行测试时会自动禁用 CSRF 中间件。

<a name="customizing-request-headers"></a>
### 自定义请求头

您可以使用此 `withHeaders` 方法自定义请求的标头，然后再将其发送到应用程序。这使您可以将任何想要的自定义标头添加到请求中：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 一个基本的功能测试示例
         *
         * @return void
         */
        public function test_interacting_with_headers()
        {
            $response = $this->withHeaders([
                'X-Header' => 'Value',
            ])->post('/user', ['name' => 'Sally']);

            $response->assertStatus(201);
        }
    }

<a name="cookies"></a>
### Cookies

在发送请求前你可以使用 `withCookie` 或 `withCookies` 方法设置 cookie 。`withCookie` 接受 cookie 的名称和值这两个参数，而 `withCookies` 方法接受一个名称 / 值对数组：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_interacting_with_cookies()
        {
            $response = $this->withCookie('color', 'blue')->get('/');

            $response = $this->withCookies([
                'color' => 'blue',
                'name' => 'Taylor',
            ])->get('/');
        }
    }

<a name="session-and-authentication"></a>
### Session / Authentication

Laravel 提供了几个可在 HTTP 测试时使用 Session 的辅助函数。首先，你需要传递一个数组给 `withSession` 方法来设置 session 数据。这样在应用程序的测试请求发送之前，就会先去给数据加载 session：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_interacting_with_the_session()
        {
            $response = $this->withSession(['banned' => false])->get('/');
        }
    }



Laravel 的 session 通常用于维护当前已验证用户的状态。因此，`actingAs` 方法提供了一种将给定用户作为当前用户进行身份验证的便捷方法。例如， 我们可以使用 [工厂模式](/docs/laravel/9.x/database-testing#writing-factories) 生成并验证用户:

    <?php

    namespace Tests\Feature;

    use App\Models\User;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_an_action_that_requires_authentication()
        {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                             ->withSession(['banned' => false])
                             ->get('/');
        }
    }

你也可以通过传递看守器名称作为 `actingAs` 方法的第二参数以指定用户通过哪种看守器来认证：

    $this->actingAs($user, 'web')

<a name="debugging-responses"></a>
### 调试响应

在向您的应用程序发出测试请求之后，可以使用 `dump`、`dumpHeaders` 和 `dumpSession` 方法来检查和调试响应内容：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 一个最基础的测试例子
         *
         * @return void
         */
        public function test_basic_test()
        {
            $response = $this->get('/');

            $response->dumpHeaders();

            $response->dumpSession();

            $response->dump();
        }
    }

或者，你可以使用 `dd`、`ddHeaders` 和 `ddSession` 方法转储有关响应的信息，然后停止执行：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 基本功能测试示例子
         *
         * @return void
         */
        public function test_basic_test()
        {
            $response = $this->get('/');

            $response->ddHeaders();

            $response->ddSession();

            $response->dd();
        }
    }

<a name="exception-handling"></a>
### 异常处理

有时你可能想要测试你的应用程序是否引发了特定异常。为了确保异常不会被 Laravel 的异常处理程序捕获并作为 HTTP 响应返回，可以在发出请求之前调用 `withoutExceptionHandling` 方法：

    $response = $this->withoutExceptionHandling()->get('/');



此外，如果想确保你的应用程序没有使用 PHP 语言或你的应用程序正在使用的库已弃用的功能，你可以在发出请求之前调用 `withoutDeprecationHandling` 方法。禁用弃用处理时，弃用警告将转换为异常，从而导致你的测试失败：

    $response = $this->withoutDeprecationHandling()->get('/');

<a name="testing-json-apis"></a>
## 测试 JSON APIs

Laravel 也提供了几个辅助函数来测试 JSON APIs 和其响应。例如，`json`、`getJson`、`postJson`、`putJson`、`patchJson`、`deleteJson` 以及 `optionsJson` 可以被用于发送各种 HTTP 动作。你也可以轻松地将数据和请求头传递到这些方法中。首先，让我们实现一个测试示例， 发送 `POST` 请求到 `/api/user`，并断言返回的期望数据：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 基本功能测试示例
         *
         * @return void
         */
        public function test_making_an_api_request()
        {
            $response = $this->postJson('/api/user', ['name' => 'Sally']);

            $response
                ->assertStatus(201)
                ->assertJson([
                    'created' => true,
                ]);
        }
    }

此外，JSON 响应数据可以作为响应上的数组变量进行访问，从而使你可以方便地检查 JSON 响应中返回的各个值：

    $this->assertTrue($response['created']);

> 技巧：`assertJson` 方法将响应转换为数组，并利用 `PHPUnit::assertArraySubset` 验证给定数组是否存在于应用程序返回的 JSON 响应中。因此，如果 JSON 响应中还有其他属性，则只要存在给定的片段，此测试仍将通过。



<a name="verifying-exact-match"></a>
#### 验证 JSON 完全匹配

如前所述，`assertJson` 方法可用于断言 JSON 响应中存在 JSON 片段。如果您想验证给定数组是否与应用程序返回的 JSON **完全匹配**，则应使用 `assertExactJson` 方法：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 一个基本的功能测试示例。
         *
         * @return void
         */
        public function test_asserting_an_exact_json_match()
        {
            $response = $this->postJson('/user', ['name' => 'Sally']);

            $response
                ->assertStatus(201)
                ->assertExactJson([
                    'created' => true,
                ]);
        }
    }

<a name="verifying-json-paths"></a>
#### 验证 JSON 路径

如果你想验证 JSON 响应是否包含指定路径上的某些给定数据，可以使用 `assertJsonPath` 方法：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        /**
         * 一个基本的功能测试示例。
         *
         * @return void
         */
        public function test_asserting_a_json_paths_value()
        {
            $response = $this->postJson('/user', ['name' => 'Sally']);

            $response
                ->assertStatus(201)
                ->assertJsonPath('team.owner.name', 'Darian');
        }
    }

<a name="fluent-json-testing"></a>
### JSON 流式测试

Laravel 还提供了一种漂亮的方式来流畅地测试应用程序的 JSON 响应。首先，将闭包传递给 `assertJson` 方法。这个闭包将使用 `Illuminate\Testing\Fluent\AssertableJson` 的实例调用，该实例可用于对应用程序返回的 JSON 进行断言。 `where` 方法可用于对 JSON 的特定属性进行断言，而 `missing` 方法可用于断言 JSON 中缺少特定属性：
    use Illuminate\Testing\Fluent\AssertableJson;

    /**
     * 一个基本的功能测试示例。
     *
     * @return void
     */
    public function test_fluent_json()
    {
        $response = $this->getJson('/users/1');

        $response
            ->assertJson(fn (AssertableJson $json) =>
                $json->where('id', 1)
                     ->where('name', 'Victoria Faith')
                     ->missing('password')
                     ->etc()
            );
    }



#### 了解 `etc` 方法

在上面的示例中，你可能已经注意到我们在断言链的末尾调用了 `etc` 方法。该方法通知 Laravel 在 JSON 对象上可能存在其他属性。如果未使用 `etc` 方法，则如果 JSON 对象上存在你未对其进行断言的其他属性，则测试将失败。

此行为背后的目的是通过强制你明确对属性做出断言或通过 `etc` 方法明确允许其他属性来保护你避免无意中在 JSON 响应中暴露敏感信息。

<a name="asserting-json-attribute-presence-and-absence"></a>
#### 断言属性存在/不存在

要断言属性存在或不存在，可以使用 `has` 和 `missing` 方法：

    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('data')
             ->missing('message')
    );

此外，`hasAll` 和 `missingAll` 方法允许同时断言多个属性的存在或不存在：

    $response->assertJson(fn (AssertableJson $json) =>
        $json->hasAll('status', 'data')
             ->missingAll('message', 'code')
    );

你可以使用 `hasAny` 方法来确定是否存在给定属性列表中的至少一个：

    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('status')
             ->hasAny('data', 'message', 'code')
    );

<a name="asserting-against-json-collections"></a>
#### 断言反对 JSON 集合

通常，你的路由将返回一个 JSON 响应，其中包含多个项目，例如多个用户：

    Route::get('/users', function () {
        return User::all();
    });

在这些情况下，我们可以使用 fluent JSON 对象的 `has` 方法对响应中包含的用户进行断言。例如，让我们断言 JSON 响应包含三个用户。接下来，我们将使用 `first` 方法对集合中的第一个用户进行一些断言。 `first` 方法接受一个闭包，该闭包接收另一个可断言的 JSON 字符串，我们可以使用它来对 JSON 集合中的第一个对象进行断言：

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has(3)
                 ->first(fn ($json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->missing('password')
                         ->etc()
                 )
        );



<a name="scoping-json-collection-assertions"></a>
#### JSON 集合范围断言

有时，你的应用程序的路由将返回分配有命名键的 JSON 集合：

    Route::get('/users', function () {
        return [
            'meta' => [...],
            'users' => User::all(),
        ];
    })

在测试这些路由时，你可以使用 `has` 方法来断言集合中的项目数。此外，你可以使用 `has` 方法来确定断言链的范围：

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has('meta')
                 ->has('users', 3)
                 ->has('users.0', fn ($json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->missing('password')
                         ->etc()
                 )
        );

但是，你可以进行一次调用，提供一个闭包作为其第三个参数，而不是对 `has` 方法进行两次单独调用来断言 `users` 集合。这样做时，将自动调用闭包并将其范围限定为集合中的第一项：

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has('meta')
                 ->has('users', 3, fn ($json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->missing('password')
                         ->etc()
                 )
        );

<a name="asserting-json-types"></a>
#### 断言 JSON 类型

你可能只想断言 JSON 响应中的属性属于某种类型。 `Illuminate\Testing\Fluent\AssertableJson` 类提供了 `whereType` 和 `whereAllType` 方法来做到这一点：

    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('id', 'integer')
             ->whereAllType([
                'users.0.name' => 'string',
                'meta' => 'array'
            ])
    );

你可以使用 `|` 字符指定多种类型，或者将类型数组作为第二个参数传递给 `whereType` 方法。如果响应值为任何列出的类型，则断言将成功：

    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('name', 'string|null')
             ->whereType('id', ['string', 'integer'])
    );



`whereType` 和 `whereAllType` 方法识别以下类型：`string`、`integer`、`double`、`boolean`、`array` 和 `null`。

<a name="testing-file-uploads"></a>
## 测试文件上传

`Illuminate\Http\UploadedFile` 提供了一个 `fake` 方法用于生成虚拟的文件或者图像以供测试之用。它可以和 `Storage` facade 的 `fake` 方法相结合，大幅度简化了文件上传测试。举个例子，你可以结合这两者的功能非常方便地进行头像上传表单测试：

    <?php

    namespace Tests\Feature;

    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Http\UploadedFile;
    use Illuminate\Support\Facades\Storage;
    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_avatars_can_be_uploaded()
        {
            Storage::fake('avatars');

            $file = UploadedFile::fake()->image('avatar.jpg');

            $response = $this->post('/avatar', [
                'avatar' => $file,
            ]);

            Storage::disk('avatars')->assertExists($file->hashName());
        }
    }

如果你想断言一个给定的文件不存在，则可以使用由 `Storage` facade 提供的 `AssertMissing` 方法：

    Storage::fake('avatars');

    // ...

    Storage::disk('avatars')->assertMissing('missing.jpg');

<a name="fake-file-customization"></a>
#### 虚拟文件定制

在使用 `fake` 方法创建文件时，你可以指定图像的宽高以及大小，从而更好的验证测试规则：

    UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);

除创建图像外，你也可以用 `create` 方法创建其他类型的文件：

    UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);

如果需要，可以向该方法传递一个 `$mimeType` 参数，以显式定义文件应返回的 MIME 类型：

    UploadedFile::fake()->create(
        'document.pdf', $sizeInKilobytes, 'application/pdf'
    );



<a name="testing-views"></a>
## 测试视图

Laravel 允许在不向应用程序发出模拟 HTTP 请求的情况下独立呈现视图。为此，可以在测试中使用 `view` 方法。`view` 方法接受视图名称和一个可选的数据数组。这个方法返回一个 `Illuminate\Testing\TestView` 的实例，它提供了几个方法来方便地断言视图的内容：

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;

    class ExampleTest extends TestCase
    {
        public function test_a_welcome_view_can_be_rendered()
        {
            $view = $this->view('welcome', ['name' => 'Taylor']);

            $view->assertSee('Taylor');
        }
    }

`TestView` 对象提供了以下断言方法：`assertSee`、`assertSeeInOrder`、`assertSeeText`、`assertSeeTextInOrder`、`assertDontSee` 和 `assertDontSeeText`。

如果需要，你可以通过将 `TestView` 实例转换为一个字符串获得原始的视图内容：

    $contents = (string) $this->view('welcome');

<a name="sharing-errors"></a>
#### 共享错误

一些视图可能依赖于 Laravel 提供的 [全局错误包](/docs/laravel/9.x/validation#quick-displaying-the-validation-errors) 中共享的错误。要在错误包中生成错误消息，可以使用 `withViewErrors` 方法：

    $view = $this->withViewErrors([
        'name' => ['Please provide a valid name.']
    ])->view('form');

    $view->assertSee('Please provide a valid name.');

<a name="rendering-blade-and-components"></a>
### 渲染模板 & 组件

必要的话，你可以使用 `blade` 方法来计算和呈现原始的 [Blade](/docs/laravel/9.x/blade) 字符串。与 `view` 方法一样，`blade` 方法返回的是 `Illuminate\Testing\TestView` 的实例:

    $view = $this->blade(
        '<x-component :name="$name" />',
        ['name' => 'Taylor']
    );

    $view->assertSee('Taylor');

您可以使用 `component` 方法来评估和渲染 [Blade组件](/docs/laravel/9.x/blade#components)。类似于 `view` 方法，`component` 方法返回一个 `Illuminate\Testing\TestView` 的实例：

    $view = $this->component(Profile::class, ['name' => 'Taylor']);

    $view->assertSee('Taylor');



<a name="available-assertions"></a>
## 可用断言

<a name="response-assertions"></a>
### 响应断言

Laravel的 `Illuminate \ Testing \ TestResponse` 类提供了各种自定义断言方法，您可以在测试应用程序时使用它们。可以在由 `json`、`get`、`post`、`put` 和 `delete` 方法返回的响应上访问这些断言：

<style>
    .collection-method-list > p {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertForbidden](#assert-forbidden)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertNoContent](#assert-no-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertSimilarJson](#assert-similar-json)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a name="assert-cookie"></a>
#### assertCookie

断言响应中包含给定的 cookie：

    $response->assertCookie($cookieName, $value = null);

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

断言响应包含给定的过期的 cookie：

    $response->assertCookieExpired($cookieName);

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

断言响应包含给定的未过期的 cookie：

    $response->assertCookieNotExpired($cookieName);

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

断言响应不包含给定的 cookie:

    $response->assertCookieMissing($cookieName);



<a name="assert-created"></a>
#### assertCreated

断言做状态代码为 201 的响应：

    $response->assertCreated();

<a name="assert-dont-see"></a>
#### assertDontSee

断言给定的字符串不包含在响应中。除非传递第二个参数 `false`，否则此断言将给定字符串进行转义后匹配：

    $response->assertDontSee($value, $escaped = true);

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

断言给定的字符串不包含在响应文本中。除非你传递第二个参数 `false`，否则该断言将自动转义给定的字符串。该方法将在做出断言之前将响应内容传递给 PHP 的 `strip_tags` 函数：

    $response->assertDontSeeText($value, $escaped = true);

<a name="assert-download"></a>
#### assertDownload

断言响应是「下载」。通常，这意味着返回响应的调用路由返回了 `Response::download` 响应、`BinaryFileResponse` 或 `Storage::download` 响应：

    $response->assertDownload();

如果你愿意，你可以断言可下载的文件被分配了一个给定的文件名：

    $response->assertDownload('image.jpg');

<a name="assert-exact-json"></a>
#### assertExactJson

断言响应包含与给定 JSON 数据的完全匹配：

    $response->assertExactJson(array $data);

<a name="assert-forbidden"></a>
#### assertForbidden

断言响应中有禁止访问 (403) 状态码：

    $response->assertForbidden();

<a name="assert-header"></a>
#### assertHeader

断言给定的 header 在响应中存在：

    $response->assertHeader($headerName, $value = null);

<a name="assert-header-missing"></a>
#### assertHeaderMissing

断言给定的 header 在响应中不存在：

    $response->assertHeaderMissing($headerName);

<a name="assert-json"></a>
#### assertJson



断言响应包含给定的 JSON 数据：

    $response->assertJson(array $data, $strict = false);

`AssertJson` 方法将响应转换为数组，并利用 `PHPUnit::assertArraySubset` 验证给定数组是否存在于应用程序返回的 JSON 响应中。因此，如果 JSON 响应中还有其他属性，则只要存在给定的片段，此测试仍将通过。

<a name="assert-json-count"></a>
#### assertJsonCount

断言响应 JSON 中有一个数组，其中包含给定键的预期元素数量：

    $response->assertJsonCount($count, $key = null);

<a name="assert-json-fragment"></a>
#### assertJsonFragment

断言响应包含给定 JSON 片段：

    Route::get('/users', function () {
        return [
            'users' => [
                [
                    'name' => 'Taylor Otwell',
                ],
            ],
        ];
    });

    $response->assertJsonFragment(['name' => 'Taylor Otwell']);

<a name="assert-json-missing"></a>
#### assertJsonMissing

断言响应未包含给定的 JSON 片段：

    $response->assertJsonMissing(array $data);

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

断言响应不包含确切的 JSON 片段：

    $response->assertJsonMissingExact(array $data);

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

断言响应响应对于给定的键没有 JSON 验证错误：

    $response->assertJsonMissingValidationErrors($keys);

> 提示：更通用的 [assertValid](#assert-valid) 方法可用于断言响应没有以 JSON 形式返回的验证错误**并且**没有错误被闪现到会话存储中。

<a name="assert-json-path"></a>
#### assertJsonPath

断言响应包含指定路径上的给定数据：

    $response->assertJsonPath($path, $expectedValue);

例如，如果你的应用程序返回的 JSON 响应包含以下数据：

```js
{
    "user": {
        "name": "Steve Schoger"
    }
}
```



你可以断言 `user` 对象的 `name` 属性匹配给定值，如下所示：

    $response->assertJsonPath('user.name', 'Steve Schoger');

<a name="assert-json-structure"></a>
#### assertJsonStructure

断言响应具有给定的 JSON 结构：

    $response->assertJsonStructure(array $structure);

例如，如果你的应用程序返回的 JSON 响应包含以下数据：

```js
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

你可以断言 JSON 结构符合您的期望，如下所示：

    $response->assertJsonStructure([
        'user' => [
            'name',
        ]
    ]);

有时，你的应用程序返回的 JSON 响应可能包含对象数组：

```js
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

在这种情况下，你可以使用 `*` 字符来断言数组中所有对象的结构：

    $response->assertJsonStructure([
        'user' => [
            '*' => [
                 'name',
                 'age',
                 'location'
            ]
        ]
    ]);

<a name="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

断言响应具有给定键的给定 JSON 验证错误。在断言验证错误作为 JSON 结构返回而不是闪现到会话的响应时，应使用此方法：

    $response->assertJsonValidationErrors(array $data, $responseKey = 'errors');

> 技巧：更通用的 [assertInvalid](#assert-invalid) 方法可用于断言响应具有以 JSON 形式返回的验证错误**或**错误已闪存到会话存储。

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

断言响应对给定键有任何 JSON 验证错误：

    $response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');

<a name="assert-location"></a>
#### assertLocation

断言响应在 `Location` 头部中具有给定的 URI 值：

    $response->assertLocation($uri);



<a name="assert-no-content"></a>
#### assertNoContent

断言响应具有给定的 HTTP 状态码且没有内容：

    $response->assertNoContent($status = 204);

<a name="assert-not-found"></a>
#### assertNotFound

断言响应具有未找到（404）HTTP 状态码：

    $response->assertNotFound();

<a name="assert-ok"></a>
#### assertOk

断言响应有 200 状态码：

    $response->assertOk();

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

断言响应包含给定的 cookie （未加密）:

    $response->assertPlainCookie($cookieName, $value = null);

<a name="assert-redirect"></a>
#### assertRedirect

断言响应会重定向到给定的 URI：

    $response->assertRedirect($uri);

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

断言响应是否重定向到包含给定字符串的 URI：

    $response->assertRedirectContains($string);

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

断言响应是对给定签名路由的重定向：

    $response->assertRedirectToSignedRoute($name = null, $parameters = []);

<a name="assert-see"></a>
#### assertSee

断言给定的字符串包含在响应中。除非传递第二个参数 `false` ，否则此断言将给定字符串进行转义后匹配：

    $response->assertSee($value, $escaped = true);

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

断言给定的字符串按顺序包含在响应中。除非传递第二个参数 `false` ，否则此断言将给定字符串进行转义后匹配：

    $response->assertSeeInOrder(array $values, $escaped = true);

<a name="assert-see-text"></a>
#### assertSeeText

断言给定字符串包含在响应文本中。除非传递第二个参数 `false`，否则此断言将给定字符串进行转义后匹配。在做出断言之前，响应内容将被传递到 PHP 的 `strip_tags` 函数：

    $response->assertSeeText($value, $escaped = true);



<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

断言给定的字符串按顺序包含在响应的文本中。除非传递第二个参数 `false` ，否则此断言将给定字符串进行转义后匹配。在做出断言之前，响应内容将被传递到 PHP 的 `strip_tags` 函数：

    $response->assertSeeTextInOrder(array $values, $escaped = true);

<a name="assert-session-has"></a>
#### assertSessionHas

断言 Session 包含给定的数据段：

    $response->assertSessionHas($key, $value = null);

如果需要，可以提供一个闭包作为 `assertSessionHas` 方法的第二个参数。 如果闭包返回 `true`，则断言将通过：

    $response->assertSessionHas($key, function ($value) {
        return $value->name === 'Taylor Otwell';
    });

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

session 在 [闪存输入数组](/docs/laravel/9.x/responses#redirecting-with-flashed-session-data) 中断言具有给定值： 

    $response->assertSessionHasInput($key, $value = null);

如果需要，可以提供一个闭包作为 `assertSessionHasInput` 方法的第二个参数。 如果闭包返回 `true`，则断言将通过：

    $response->assertSessionHasInput($key, function ($value) {
        return Crypt::decryptString($value) === 'secret';
    });

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

断言 Session 中具有给定的键 / 值对列表：

    $response->assertSessionHasAll(array $data);

例如，如果您的应用程序会话包含 `name` 和 `status` 键，则可以断言它们存在并且具有指定的值，如下所示：

    $response->assertSessionHasAll([
        'name' => 'Taylor Otwell',
        'status' => 'active',
    ]);

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

断言 session 包含给定 `$keys` 的 Laravel 验证错误。如果 `$keys` 是关联数组，则断言 session 包含每个字段（key）的特定错误消息（value）。测试将闪存验证错误到 session 的路由时，应使用此方法，而不是将其作为 JSON 结构返回：

    $response->assertSessionHasErrors(
        array $keys, $format = null, $errorBag = 'default'
    );



例如，要断言 `name` 和 `email` 字段具有已闪存到 session 的验证错误消息，可以调用 `assertSessionHasErrors` 方法，如下所示：

    $response->assertSessionHasErrors(['name', 'email']);

或者，您可以断言给定字段具有特定的验证错误消息：

    $response->assertSessionHasErrors([
        'name' => 'The given name was invalid.'
    ]);

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

断言会话在特定的 [错误包](/docs/laravel/9.x/validation#named-error-bags) 中包含给定 `$keys` 的错误。如果 `$keys` 是一个关联数组，则断言该 session 在错误包内包含每个字段（键）的特定错误消息（值）： 

    $response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

断言 session 没有验证错误：

    $response->assertSessionHasNoErrors();

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

断言会话对给定键没有验证错误：

    $response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');

<a name="assert-session-missing"></a>
#### assertSessionMissing

断言 session 中缺少指定的 $key：

    $response->assertSessionMissing($key);

<a name="assert-status"></a>
#### assertStatus

断言响应指定的 http 状态码：

    $response->assertStatus($code);

<a name="assert-successful"></a>
#### assertSuccessful

断言响应一个成功的状态码 (>= 200 且 < 300) :

    $response->assertSuccessful();

<a name="assert-unauthorized"></a>
#### assertUnauthorized

断言一个未认证的状态码 (401)：

    $response->assertUnauthorized();

<a name="assert-unprocessable"></a>
#### assertUnprocessable

断言响应具有不可处理的实体 (422) HTTP 状态代码：

    $response->assertUnprocessable();

<a name="assert-valid"></a>
#### assertValid

断言响应对给定键没有验证错误。 此方法可用于断言验证错误作为 JSON 结构返回或验证错误已闪现到会话的响应：

    // 断言不存在验证错误...
    $response->assertValid();

    // 断言给定的键没有验证错误...
    $response->assertValid(['name', 'email']);



<a name="assert-invalid"></a>
#### assertInvalid

断言响应对给定键有验证错误。 此方法可用于断言验证错误作为 JSON 结构返回或验证错误已闪存到会话的响应：

    $response->assertInvalid(['name', 'email']);

您还可以断言给定键具有特定的验证错误消息。 这样做时，您可以提供整条消息或仅提供一部分消息：

    $response->assertInvalid([
        'name' => 'The name field is required.',
        'email' => 'valid email address',
    ]);

<a name="assert-view-has"></a>
#### assertViewHas

断言为响应视图提供了一个键值对数据：

    $response->assertViewHas($key, $value = null);

将闭包作为第二个参数传递给 `assertViewHas` 方法将允许您检查并针对特定的视图数据做出断言：

    $response->assertViewHas('user', function (User $user) {
        return $user->name === 'Taylor';
    });

此外，视图数据可以作为数组变量访问响应，让您可以方便地检查它：

    $this->assertEquals('Taylor', $response['name']);

<a name="assert-view-has-all"></a>
#### assertViewHasAll

断言响应视图具有给定的数据列表：

    $response->assertViewHasAll(array $data);

该方法可用于断言该视图仅包含与给定键匹配的数据：

    $response->assertViewHasAll([
        'name',
        'email',
    ]);

或者，您可以断言该视图数据存在并且具有特定值：

    $response->assertViewHasAll([
        'name' => 'Taylor Otwell',
        'email' => 'taylor@example.com,',
    ]);

<a name="assert-view-is"></a>
#### assertViewIs

断言当前路由返回的的视图是给定的视图：

    $response->assertViewIs($value);



<a name="assert-view-missing"></a>
#### assertViewMissing

断言给定的数据键不可用于应用程序响应中返回的视图：

    $response->assertViewMissing($key);

<a name="authentication-assertions"></a>
### Authentication Assertions

Laravel 还提供了各种与身份验证相关的断言，您可以在应用程序的功能测试中使用它们。 请注意，这些方法是在测试类本身上调用的，而不是由诸如 `get` 和 `post` 等方法返回的 `Illuminate\Testing\TestResponse` 实例。

<a name="assert-authenticated"></a>
#### assertAuthenticated

断言用户已通过身份验证：

    $this->assertAuthenticated($guard = null);

<a name="assert-guest"></a>
#### assertGuest

断言用户未通过身份验证：

    $this->assertGuest($guard = null);

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

断言特定用户已通过身份验证：

    $this->assertAuthenticatedAs($user, $guard = null);

