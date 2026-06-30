<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'responsable_rh', 'responsable_demande']);
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || in_array($user->role, ['admin', 'responsable_rh']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin','responsable_rh']);
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->role === 'admin' || $user->role === 'responsable_rh';
    }

    public function delete(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    public function changeRole(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    public function changeStatus(User $user, User $model): bool
    {
        return $user->role === 'admin' || $user->role === 'responsable_rh';
    }
}
