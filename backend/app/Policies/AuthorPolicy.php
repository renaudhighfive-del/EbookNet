<?php

namespace App\Policies;

use App\Models\Author;
use App\Models\User;

class AuthorPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function view(User $user, Author $author): bool
    {
        return in_array($user->role, ['admin', 'responsable_demande', 'responsable_rh', 'user']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Author $author): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Author $author): bool
    {
        return $user->role === 'admin';
    }
}
