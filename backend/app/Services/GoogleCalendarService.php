<?php

namespace App\Services;

use App\Models\GoogleCalendarToken;
use App\Models\Appointment;
use Illuminate\Support\Facades\Http;

class GoogleCalendarService
{
    public function __construct(protected GoogleCalendarToken $token)
    {
        // Nothing to do here for now.
    }

    protected function getAccessToken(): string
    {
        if ($this->token->expiry && $this->token->expiry->isPast()) {
            $this->refreshToken();
        }

        return $this->token->access_token;
    }

    protected function refreshToken(): void
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $this->token->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            throw new \Exception('Unable to refresh Google access token');
        }

        $data = $response->json();
        $this->token->access_token = $data['access_token'];
        $this->token->expiry = now()->addSeconds($data['expires_in'] ?? 0);
        $this->token->save();
    }

    public function createEventFromAppointment(Appointment $appointment, string $organizerEmail): array
    {
        $body = [
            'summary' => $appointment->subject ?: 'Rendez-vous',
            'description' => sprintf('Rendez-vous avec %s %s (%s)', $appointment->first_name, $appointment->last_name, $appointment->email),
            'start' => [
                'dateTime' => $appointment->date->format('Y-m-d') . 'T' . substr($appointment->start_time, 0, 5) . ':00',
                'timeZone' => config('app.timezone'),
            ],
            'end' => [
                'dateTime' => $appointment->date->format('Y-m-d') . 'T' . substr($appointment->end_time, 0, 5) . ':00',
                'timeZone' => config('app.timezone'),
            ],
            'attendees' => [[
                'email' => $appointment->email,
                'displayName' => $appointment->first_name . ' ' . $appointment->last_name,
            ]],
            'organizer' => [
                'email' => $organizerEmail,
            ],
        ];

        $response = Http::withToken($this->getAccessToken())
            ->acceptJson()
            ->post("https://www.googleapis.com/calendar/v3/calendars/{$this->token->calendar_id}/events", $body);

        if ($response->failed()) {
            throw new \Exception('Google Calendar event creation failed: ' . $response->body());
        }

        return $response->json();
    }

    public function deleteEvent(string $eventId): void
    {
        $response = Http::withToken($this->getAccessToken())
            ->delete("https://www.googleapis.com/calendar/v3/calendars/{$this->token->calendar_id}/events/{$eventId}");

        if ($response->failed() && $response->status() !== 404) {
            throw new \Exception('Google Calendar event deletion failed: ' . $response->body());
        }
    }
}
