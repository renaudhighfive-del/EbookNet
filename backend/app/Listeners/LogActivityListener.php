<?php

namespace App\Listeners;

use App\Events\ActivityLogged;
use App\Models\ActivityLog;

class LogActivityListener
{
    public function handle(ActivityLogged $event): void
    {
        ActivityLog::create([
            'user_id' => $event->user->id,
            'action' => $event->action,
            'comment' => $event->comment,
            'target_table' => $event->targetTable,
            'target_id' => $event->targetId,
            'ip_address' => $event->ipAddress ?? request()->ip(),
            'user_agent' => $event->userAgent ?? request()->userAgent(),
        ]);
    }
}
