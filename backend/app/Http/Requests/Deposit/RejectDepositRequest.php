<?php

namespace App\Http\Requests\Deposit;

use Illuminate\Foundation\Http\FormRequest;

class RejectDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'justification' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'justification.required' => 'La justification est requise.',
        ];
    }
}
