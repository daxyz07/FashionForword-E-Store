<?php
require_once __DIR__ . '/../config/simple_database.php';
require_once __DIR__ . '/../utils/simple_jwt.php';

function login() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Log input data (for debugging only, remove in production)
    error_log('Login attempt: ' . json_encode($input));
    
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }
    
    $users = getCollection('users');
    $user = $users->findOne(['email' => $input['email']]);
    
    // Log if user was found (for debugging only, remove in production)
    error_log('User found: ' . ($user ? 'yes' : 'no'));
    
    if (!$user || !password_verify($input['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }
    
    $token = generateJWT($user);
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            '_id' => $user['_id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'contactno' => $user['contactno'],
            'gender' => $user['gender']
        ]
    ]);
}

function signup() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['name', 'email', 'contactno', 'gender', 'password'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    $users = getCollection('users');
    
    // Check if user already exists
    $existingUser = $users->findOne(['email' => $input['email']]);
    if ($existingUser) {
        http_response_code(409);
        echo json_encode(['error' => 'User with this email already exists']);
        return;
    }
    
    $userData = [
        'name' => $input['name'],
        'email' => $input['email'],
        'contactno' => $input['contactno'],
        'gender' => $input['gender'],
        'password' => password_hash($input['password'], PASSWORD_DEFAULT),
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $result = $users->insertOne($userData);
    
    if ($result->getInsertedId()) {
        $insertedId = $result->getInsertedId();
        $user = $users->findOne(['_id' => $insertedId]);
        $token = generateJWT($user);
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                '_id' => $user['_id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'contactno' => $user['contactno'],
                'gender' => $user['gender']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create user']);
    }
}

function verifyToken() {
    $user = getCurrentUser();
    
    if ($user) {
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
    }
}
?>

