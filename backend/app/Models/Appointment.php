<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'student_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'subject',
        'date',
        'start_time',
        'end_time',
        'status',
        'google_event_id',
        'cancel_reason',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function notificationsLog(): HasMany
    {
        return $this->hasMany(NotificationsLog::class);
    }
}
