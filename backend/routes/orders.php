<?php
require_once __DIR__ . '/../config/simple_database.php';
require_once __DIR__ . '/../utils/simple_jwt.php';

function createOrder() {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['items', 'custname', 'email', 'address', 'city', 'state', 'pincode', 'payment'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    // Optional fields with defaults
    if (!isset($input['contactno'])) $input['contactno'] = '';
    if (!isset($input['gender'])) $input['gender'] = 'Not specified';
    
    $orders = getCollection('orders');
    
    $orderData = [
        '_id' => uniqid(),
        'items' => $input['items'],
        'custname' => $input['custname'],
        'contactno' => $input['contactno'],
        'email' => $input['email'],
        'gender' => $input['gender'],
        'address' => $input['address'],
        'city' => $input['city'],
        'state' => $input['state'],
        'country' => $input['country'] ?? 'India',
        'pincode' => $input['pincode'],
        'payment' => $input['payment'],
        'status' => 'pending',
        'order_date' => date('Y-m-d H:i:s'),
        'order_time' => date('Y-m-d H:i:s'),
        'user_id' => $user['_id']
    ];
    
    $orders->insertOne($orderData);
    
    echo json_encode([
        'success' => true,
        'order_id' => $orderData['_id'],
        'message' => 'Order placed successfully'
    ]);
}

function getAllOrders() {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $orders = getCollection('orders');
    $userOrders = $orders->find(['user_id' => $user['_id']]);
    
    echo json_encode($userOrders);
}

function getOrderById($orderId) {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    try {
        $orders = getCollection('orders');
        $order = $orders->findOne([
            '_id' => $orderId,
            'user_id' => $user['_id']
        ]);
        
        if ($order) {
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order ID']);
    }
}

function updateOrderStatus($orderId) {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Status is required']);
        return;
    }
    
    try {
        $orders = getCollection('orders');
        
        $order = $orders->findOne([
            '_id' => $orderId,
            'user_id' => $user['_id']
        ]);
        
        if ($order) {
            $order['status'] = $input['status'];
            $order['updated_at'] = date('Y-m-d H:i:s');
            $orders->updateOne(['_id' => $orderId], $order);
            echo json_encode([
                'success' => true,
                'message' => 'Order status updated successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order ID']);
    }
}

function cancelOrder($orderId) {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    try {
        $orders = getCollection('orders');
        
        // Only allow cancellation if order is still pending
        $order = $orders->findOne([
            '_id' => $orderId,
            'user_id' => $user['_id'],
            'status' => 'pending'
        ]);
        
        if ($order) {
            $order['status'] = 'cancelled';
            $order['updated_at'] = date('Y-m-d H:i:s');
            $orders->updateOne(['_id' => $orderId], $order);
            echo json_encode([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Order cannot be cancelled or not found']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order ID']);
    }
}
?>
