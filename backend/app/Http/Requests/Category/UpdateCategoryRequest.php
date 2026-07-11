<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255|unique:categories,name,'.$this->route('id'),
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la catégorie est requis.',
            'name.unique' => 'Ce nom de catégorie existe déjà.',
            'status.in' => 'Le statut doit être actif ou inactif.',
        ];
    }
}
