<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:8',
            'role' => ['sometimes', Rule::in(['user', 'responsable_rh', 'responsable_demande', 'admin'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est requis.',
            'last_name.required' => 'Le nom est requis.',
            'email.required' => "L'adresse e-mail est requise.",
            'email.email' => "L'adresse e-mail n'est pas valide.",
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères.',
            'role.in' => 'Le rôle sélectionné n\'est pas valide.',
            'status.in' => 'Le statut sélectionné n\'est pas valide.',
        ];
    }
}
