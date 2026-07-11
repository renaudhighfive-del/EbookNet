<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(['user', 'responsable_rh', 'responsable_demande', 'admin'])],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'Le rôle est requis.',
            'role.in' => 'Le rôle sélectionné n\'est pas valide.',
        ];
    }
}
