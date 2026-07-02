<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Le statut sélectionné n\'est pas valide.',
        ];
    }
}
