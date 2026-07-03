<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;

class CreateManualAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s|after:start_time',
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'La date est requise.',
            'date.date' => 'La date n\'est pas valide.',
            'start_time.required' => 'L\'heure de début est requise.',
            'start_time.date_format' => 'L\'heure de début n\'est pas valide.',
            'end_time.required' => 'L\'heure de fin est requise.',
            'end_time.date_format' => 'L\'heure de fin n\'est pas valide.',
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
        ];
    }
}
