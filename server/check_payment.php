<?php
require 'bootstrap/app.php';

$b = \App\Models\Booking::find(3);
echo "Booking 3:\n";
echo "  admin_status: " . $b->admin_status . "\n";
echo "  status: " . $b->status . "\n";
echo "  completed_at: " . $b->completed_at . "\n\n";

echo "Payments:\n";
$payments = $b->payments()->latest()->get();
foreach($payments as $p) {
  echo "  Type: {$p->type} | Status: {$p->status} | Amount: Rp " . number_format($p->amount) . "\n";
}
