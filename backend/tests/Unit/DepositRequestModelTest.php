<?php

namespace Tests\Unit;

use App\Models\DepositRequest;
use PHPUnit\Framework\TestCase;

class DepositRequestModelTest extends TestCase
{
    public function test_pages_and_publisher_are_mass_assignable(): void
    {
        $deposit = new DepositRequest([
            'publisher' => 'Éditions Test',
            'pages' => 320,
        ]);

        $this->assertSame('Éditions Test', $deposit->publisher);
        $this->assertSame(320, $deposit->pages);
    }
}
