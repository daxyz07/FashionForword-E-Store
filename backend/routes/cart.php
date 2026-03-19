<?php
require_once __DIR__ . '/../config/simple_database.php';
require_once __DIR__ . '/../utils/simple_jwt.php';

function getCartItems() {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $cart = getCollection('cart');
    $cartItems = $cart->find(['user_id' => $user['_id']]);
    
    echo json_encode(array_values($cartItems));
}

function addToCart() {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['productId']) || !isset($input['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID and quantity are required']);
        return;
    }
    
    $products = getCollection('products');
    $product = $products->findOne(['_id' => $input['productId']]);
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    $cart = getCollection('cart');
    
    // Check if item already exists in cart
    $existingItem = $cart->findOne([
        'user_id' => $user['_id'],
        'product_id' => $input['productId']
    ]);
    
    if ($existingItem) {
        // Update quantity
        $existingItem['quantity'] += $input['quantity'];
        $cart->updateOne(
            ['_id' => $existingItem['_id']],
            $existingItem
        );
    } else {
        // Add new item
        $cartItem = [
            '_id' => uniqid(),
            'user_id' => $user['_id'],
            'product_id' => $input['productId'],
            'name' => $product['name'] ?? $product['p_name'] ?? 'Unknown Product',
            'price' => (float)($product['price'] ?? $product['p_price'] ?? 0),
            'image' => $product['image'] ?? $product['p_image'] ?? '',
            'quantity' => (int)$input['quantity'],
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $cart->insertOne($cartItem);
    }
    
    echo json_encode(['success' => true]);
}

function updateCartItem($cartItemId) {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Quantity is required']);
        return;
    }
    
    $cart = getCollection('cart');
    
    $cartItem = $cart->findOne([
        '_id' => $cartItemId,
        'user_id' => $user['_id']
    ]);
    
    if ($cartItem) {
        $cartItem['quantity'] = $input['quantity'];
        $cart->updateOne(['_id' => $cartItemId], $cartItem);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Cart item not found']);
    }
}

function removeFromCart($cartItemId) {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $cart = getCollection('cart');
    
    $cartItem = $cart->findOne([
        '_id' => $cartItemId,
        'user_id' => $user['_id']
    ]);
    
    if ($cartItem) {
        $cart->deleteOne(['_id' => $cartItemId]);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Cart item not found']);
    }
}

function clearCart() {
    $user = getCurrentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $cart = getCollection('cart');
    $cart->deleteMany(['user_id' => $user['_id']]);
    
    echo json_encode(['success' => true]);
}
?>

