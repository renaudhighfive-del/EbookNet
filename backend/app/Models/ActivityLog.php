<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'comment',
        'target_table',
        'target_id',
        'ip_address',
        'user_agent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Filtre les logs pour une cible précise (ex: un DepositRequest donné).
     * Usage : ActivityLog::forTarget('deposit_requests', $id)->orderBy('created_at')->get()
     */
    public function scopeForTarget(Builder $query, string $table, int $id): Builder
    {
        return $query->where('target_table', $table)->where('target_id', $id);
    }
}