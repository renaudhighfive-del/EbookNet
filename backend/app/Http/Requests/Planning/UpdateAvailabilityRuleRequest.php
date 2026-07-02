<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAvailabilityRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['sometimes', 'integer', Rule::in([0, 1, 2, 3, 4, 5, 6])],
            'start_time' => 'sometimes|date_format:H:i:s',
            'end_time' => 'sometimes|date_format:H:i:s|after:start_time',
            'slot_duration_minutes' => 'sometimes|integer|min:15',
            'buffer_minutes' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.integer' => 'Le jour de la semaine doit être un entier.',
            'day_of_week.in' => 'Le jour de la semaine sélectionné n\'est pas valide.',
            'start_time.date_format' => 'L\'heure de début n\'est pas valide.',
            'end_time.date_format' => 'L\'heure de fin n\'est pas valide.',
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
            'slot_duration_minutes.integer' => 'La durée du créneau doit être un entier.',
            'slot_duration_minutes.min' => 'La durée du créneau doit être d\'au moins :min minutes.',
            'buffer_minutes.integer' => 'La durée de la pause doit être un entier.',
            'buffer_minutes.min' => 'La durée de la pause doit être d\'au moins :min minutes.',
            'is_active.boolean' => 'Le statut d\'activité doit être un booléen.',
        ];
    }
}
