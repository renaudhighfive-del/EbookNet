<?php

namespace App\Http\Requests\Publisher;

use Illuminate\Foundation\Http\FormRequest;

class StorePublisherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de l\'éditeur est requis.',
            'website.url' => 'Le site web doit être une URL valide.',
        ];
    }
}
