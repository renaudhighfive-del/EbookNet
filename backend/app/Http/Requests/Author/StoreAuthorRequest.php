<?php

namespace App\Http\Requests\Author;

use Illuminate\Foundation\Http\FormRequest;

class StoreAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'biography' => 'nullable|string|max:5000',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'death_date' => 'nullable|date|after:birth_date',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est requis.',
            'last_name.required' => 'Le nom est requis.',
            'death_date.after' => 'La date de décès doit être postérieure à la date de naissance.',
        ];
    }
}
