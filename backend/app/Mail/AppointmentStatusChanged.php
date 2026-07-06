<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;
    public string $status;

    public function __construct(Appointment $appointment, string $status)
    {
        $this->appointment = $appointment;
        $this->status = $status;
    }

    public function build()
    {
        $statusLabel = $this->status === 'confirmed' ? 'confirmé' : 'refusé';

        return $this
            ->subject("Votre rendez-vous a été {$statusLabel}")
            ->view('emails.appointment-status-changed')
            ->with([
                'appointment' => $this->appointment,
                'statusLabel' => $statusLabel,
            ]);
    }
}
