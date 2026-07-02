<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'min_notice_hours' => 'sometimes|integer|min:0',
            'max_advance_days' => 'sometimes|integer|min:1',
            'auto_confirm' => 'sometimes|boolean',
            'timezone' => 'sometimes|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'min_notice_hours.integer' => 'Le délai minimum doit être un entier.',
            'min_notice_hours.min' => 'Le délai minimum doit être d\'au moins :min heures.',
            'max_advance_days.integer' => 'Le délai maximum doit être un entier.',
            'max_advance_days.min' => 'Le délai maximum doit être d\'au moins :min jour.',
            'auto_confirm.boolean' => 'La confirmation automatique doit être un booléen.',
            'timezone.string' => 'Le fuseau horaire doit être une chaîne de caractères.',
            'timezone.max' => 'Le fuseau horaire ne peut pas dépasser :max caractères.',
        ];
    }
}
