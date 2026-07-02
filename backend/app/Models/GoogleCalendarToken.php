<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoogleCalendarToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'access_token',
        'refresh_token',
        'expiry',
        'calendar_id',
        'connected_at',
    ];

    protected $casts = [
        'expiry' => 'datetime',
        'connected_at' => 'datetime',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
