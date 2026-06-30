<?php

namespace App\Policies;

use App\Models\Publisher;
use App\Models\User;

class PublisherPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function view(User $user, Publisher $publisher): bool
    {
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Publisher $publisher): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Publisher $publisher): bool
    {
        return $user->role === 'admin';
    }
}
