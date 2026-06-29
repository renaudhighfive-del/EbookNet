<?php

namespace App\Http\Requests\Deposit;

use Illuminate\Foundation\Http\FormRequest;

class AssignDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_manager_id' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'assigned_manager_id.required' => 'Le responsable est requis.',
            'assigned_manager_id.exists'   => 'Le responsable sélectionné n\'existe pas.',
        ];
    }
}
