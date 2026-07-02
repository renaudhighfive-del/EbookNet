<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateAvailabilityExceptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'type' => ['required', Rule::in(['blocked', 'extra'])],
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s|after:start_time',
            'reason' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'La date est requise.',
            'date.date' => 'La date n\'est pas valide.',
            'type.required' => 'Le type d\'exception est requis.',
            'type.in' => 'Le type d\'exception sélectionné n\'est pas valide.',
            'start_time.date_format' => 'L\'heure de début n\'est pas valide.',
            'end_time.date_format' => 'L\'heure de fin n\'est pas valide.',
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
            'reason.string' => 'La raison doit être une chaîne de caractères.',
            'reason.max' => 'La raison ne peut pas dépasser :max caractères.',
        ];
    }
}
