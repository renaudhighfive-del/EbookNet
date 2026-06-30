<?php

namespace App\Providers;

use App\Models\Author;
use App\Models\Category;
use App\Models\DepositRequest;
use App\Models\Publisher;
use App\Models\Reference;
use App\Models\User;
use App\Policies\AuthorPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\DepositRequestPolicy;
use App\Policies\PublisherPolicy;
use App\Policies\ReferencePolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Author::class => AuthorPolicy::class,
        Category::class => CategoryPolicy::class,
        DepositRequest::class => DepositRequestPolicy::class,
        Publisher::class => PublisherPolicy::class,
        Reference::class => ReferencePolicy::class,
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
