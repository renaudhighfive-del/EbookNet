<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmailContract
{
    use HasApiTokens, HasFactory, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    public function depositRequests()
    {
        return $this->hasMany(DepositRequest::class, 'applicant_id');
    }

    public function assignedDepositRequests()
    {
        return $this->hasMany(DepositRequest::class, 'assigned_manager_id');
    }

    public function depositRequestReviews()
    {
        return $this->hasMany(DepositRequestReview::class, 'reviewer_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function views()
    {
        return $this->hasMany(View::class);
    }

    public function references()
    {
        return $this->hasMany(Reference::class, 'uploaded_by');
    }

    public function availabilityRules()
    {
        return $this->hasMany(AvailabilityRule::class, 'teacher_id');
    }

    public function availabilityExceptions()
    {
        return $this->hasMany(AvailabilityException::class, 'teacher_id');
    }

    public function appointmentsAsTeacher()
    {
        return $this->hasMany(Appointment::class, 'teacher_id');
    }

    public function appointmentsAsStudent()
    {
        return $this->hasMany(Appointment::class, 'student_id');
    }

    public function googleCalendarToken()
    {
        return $this->hasOne(GoogleCalendarToken::class, 'teacher_id');
    }

    public function settings()
    {
        return $this->hasOne(Setting::class, 'teacher_id');
    }
}
