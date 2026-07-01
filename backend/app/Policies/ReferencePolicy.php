<?php

namespace App\Policies;

use App\Models\Reference;
use App\Models\User;

class ReferencePolicy
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

    public function view(User $user, Reference $reference): bool
    {
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Reference $reference): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Reference $reference): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Reference $reference): bool
    {
        return $user->role === 'admin';
    }
}
