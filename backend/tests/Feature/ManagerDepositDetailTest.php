<?php

namespace Tests\Feature;

use App\Models\DepositRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagerDepositDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_view_publisher_and_pages_in_deposit_detail(): void
    {
        $manager = User::create([
            'first_name' => 'Manager',
            'last_name' => 'Test',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => 'responsable_demande',
            'status' => 'active',
        ]);

        $applicant = User::create([
            'first_name' => 'User',
            'last_name' => 'Test',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $deposit = DepositRequest::create([
            'applicant_id' => $applicant->id,
            'assigned_manager_id' => $manager->id,
            'title' => 'Titre test',
            'description' => 'Description',
            'publisher' => 'Éditions Test',
            'pages' => 320,
            'status' => 'assigned',
        ]);

        $response = $this->actingAs($manager, 'sanctum')
            ->getJson('/api/manager/deposits/' . $deposit->id);

        $response->assertOk();
        $response->assertJsonPath('deposit_request.publisher', 'Éditions Test');
        $response->assertJsonPath('deposit_request.pages', 320);
    }
}
