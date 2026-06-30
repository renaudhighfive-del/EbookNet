<?php

namespace Tests\Unit;

use App\Models\DepositRequest;
use App\Models\Reference;
use App\Models\User;
use App\Policies\DepositRequestPolicy;
use App\Policies\ReferencePolicy;
use App\Policies\UserPolicy;
use PHPUnit\Framework\TestCase;

class PolicyAuthorizationTest extends TestCase
{
    public function test_admin_can_manage_references(): void
    {
        $policy = new ReferencePolicy();
        $admin = new User(['role' => 'admin']);

        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->update($admin, new Reference()));
        $this->assertTrue($policy->delete($admin, new Reference()));
    }

    public function test_regular_user_cannot_manage_references(): void
    {
        $policy = new ReferencePolicy();
        $user = new User(['role' => 'user']);

        $this->assertFalse($policy->create($user));
        $this->assertFalse($policy->update($user, new Reference()));
        $this->assertFalse($policy->delete($user, new Reference()));
    }

    public function test_user_policy_allows_self_and_admin_roles(): void
    {
        $policy = new UserPolicy();
        $admin = new User(['role' => 'admin']);
        $admin->id = 1;
        $rh = new User(['role' => 'responsable_rh']);
        $rh->id = 2;
        $user = new User(['role' => 'user']);
        $user->id = 3;
        $target = new User(['role' => 'user']);
        $target->id = 3;

        $this->assertTrue($policy->view($admin, $target));
        $this->assertTrue($policy->view($target, $target));
        $this->assertTrue($policy->view($rh, $target));
        $this->assertFalse($policy->create($user));
    }

    public function test_deposit_request_policy_allows_owner_and_manager(): void
    {
        $policy = new DepositRequestPolicy();
        $owner = new User(['role' => 'user']);
        $owner->id = 10;
        $manager = new User(['role' => 'responsable_demande']);
        $manager->id = 20;
        $deposit = new DepositRequest(['applicant_id' => 10, 'assigned_manager_id' => 20]);

        $this->assertTrue($policy->view($owner, $deposit));
        $this->assertTrue($policy->view($manager, $deposit));
        $this->assertTrue($policy->update($owner, $deposit));
        $this->assertTrue($policy->assign($manager, $deposit));
        $this->assertFalse($policy->assign($owner, $deposit));
    }
}
