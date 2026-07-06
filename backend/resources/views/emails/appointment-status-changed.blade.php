<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statut du rendez-vous</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5;">
    <h1 style="color:#0f172a;">Statut de votre rendez-vous</h1>
    <p>Bonjour {{ $appointment->first_name }},</p>
    <p>Votre demande de rendez-vous du {{ $appointment->date->format('d/m/Y') }} de {{ substr($appointment->start_time, 0, 5) }} à {{ substr($appointment->end_time, 0, 5) }} a été <strong>{{ $statusLabel }}</strong>.</p>
    @if($appointment->admin_message)
    <p>Message de l'administrateur :</p>
    <blockquote style="padding:12px 16px;background:#f8fafc;border-left:4px solid #2563eb;">{{ nl2br(e($appointment->admin_message)) }}</blockquote>
    @endif
    <p>Si vous avez des questions, vous pouvez répondre directement à cet e-mail.</p>
    <p>Bonne journée,<br>L'équipe EbookNet</p>
</body>
</html>
