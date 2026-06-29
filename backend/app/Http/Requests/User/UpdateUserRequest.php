<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|max:100',
            'last_name'  => 'sometimes|string|max:100',
            'email'      => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($this->route('id'))],
            'phone'      => 'nullable|string|max:50',
            'password'   => 'sometimes|string|min:8',
            'role'       => ['sometimes', Rule::in(['user', 'responsable_rh', 'responsable_demande', 'admin'])],
            'status'     => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.email'  => "L'adresse e-mail n'est pas valide.",
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères.',
            'role.in'      => 'Le rôle sélectionné n\'est pas valide.',
            'status.in'    => 'Le statut sélectionné n\'est pas valide.',
        ];
    }
}
