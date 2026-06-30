<?php

namespace App\Policies;

use App\Models\DepositRequest;
use App\Models\User;

class DepositRequestPolicy
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
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function view(User $user, DepositRequest $depositRequest): bool
    {
        return $user->role === 'admin'
            || $user->role === 'responsable_demande'
            || $user->id === $depositRequest->applicant_id
            || $user->id === $depositRequest->assigned_manager_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'user']);
    }

    public function update(User $user, DepositRequest $depositRequest): bool
    {
        return $user->role === 'admin' || $user->id === $depositRequest->applicant_id;
    }

    public function delete(User $user, DepositRequest $depositRequest): bool
    {
        return $user->role === 'admin';
    }

    public function assign(User $user, DepositRequest $depositRequest): bool
    {
        return $user->role === 'admin' || $user->role === 'responsable_demande';
    }

    public function review(User $user, DepositRequest $depositRequest): bool
    {
        return $user->role === 'admin' || $user->role === 'responsable_demande';
    }
}
