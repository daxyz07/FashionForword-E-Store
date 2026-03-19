<?php
// Simple JWT implementation without external dependencies
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function generateJWT($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'iss' => 'fashion-forward',
        'aud' => 'fashion-forward-users',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60), // 24 hours
        'user' => [
            '_id' => $user['_id'] ?? $user['id'] ?? uniqid(),
            'email' => $user['email'] ?? '',
            'name' => $user['name'] ?? '',
            'contactno' => $user['contactno'] ?? '',
            'gender' => $user['gender'] ?? ''
        ]
    ]);
    
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payload);
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'fashion-forward-secret-key', true);
    $base64Signature = base64UrlEncode($signature);
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token) {
    try {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $validSignature = hash_hmac('sha256', $header . "." . $payload, 'fashion-forward-secret-key', true);
        $validBase64Signature = base64UrlEncode($validSignature);
        
        if ($signature !== $validBase64Signature) {
            return false;
        }
        
        $decodedPayload = json_decode(base64UrlDecode($payload), true);
        
        if ($decodedPayload['exp'] < time()) {
            return false;
        }
        
        return $decodedPayload;
    } catch (Exception $e) {
        return false;
    }
}

function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $decoded = verifyJWT($token);
        
        if ($decoded) {
            return $decoded['user'];
        }
    }
    
    return null;
}
?>
