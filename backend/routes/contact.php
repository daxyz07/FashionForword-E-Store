<?php
require_once __DIR__ . '/../config/database.php';

function submitContact() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['email']) || !isset($input['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, email, and message are required']);
        return;
    }
    
    $contact = getCollection('contact');
    
    $contactData = [
        'name' => $input['name'],
        'email' => $input['email'],
        'message' => $input['message'],
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ];
    
    $result = $contact->insertOne($contactData);
    
    if ($result->getInsertedId()) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message! We will get back to you soon.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to submit message']);
    }
}
?>

