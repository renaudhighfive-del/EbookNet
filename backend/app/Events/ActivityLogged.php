<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class ActivityLogged
{
    use Dispatchable;

    public function __construct(
        public User $user,
        public string $action,
        public ?string $targetTable = null,
        public ?int $targetId = null,
        public ?string $comment = null,
        public ?string $ipAddress = null,
        public ?string $userAgent = null,
    ) {}
}
