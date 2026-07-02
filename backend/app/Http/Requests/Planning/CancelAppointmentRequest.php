<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;

class CancelAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cancel_reason' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'cancel_reason.string' => 'La raison d\'annulation doit être une chaîne de caractères.',
            'cancel_reason.max' => 'La raison d\'annulation ne peut pas dépasser :max caractères.',
        ];
    }
}
