<?php

namespace App\Providers;

use App\Events\ActivityLogged;
use App\Listeners\LogActivityListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(ActivityLogged::class, LogActivityListener::class);
    }
}
