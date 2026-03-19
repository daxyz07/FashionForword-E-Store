<?php
require_once 'config/simple_database.php';
require_once 'utils/simple_jwt.php';

// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $uri);

// Route the request
switch ($path) {
    case '/auth/login':
        if ($method === 'POST') {
            require_once 'routes/auth.php';
            login();
        }
        break;
        
    case '/auth/signup':
        if ($method === 'POST') {
            require_once 'routes/auth.php';
            signup();
        }
        break;
        
    case '/auth/verify':
        if ($method === 'GET') {
            require_once 'routes/auth.php';
            verifyToken();
        }
        break;
        
    case '/products':
        if ($method === 'GET') {
            require_once 'routes/products.php';
            getAllProducts();
        } elseif ($method === 'POST') {
            require_once 'routes/products.php';
            createProduct();
        }
        break;
        
    case '/products/men':
        if ($method === 'GET') {
            require_once 'routes/products.php';
            getMenProducts();
        }
        break;
        
    case '/products/women':
        if ($method === 'GET') {
            require_once 'routes/products.php';
            getWomenProducts();
        }
        break;
        
    case '/products/kids':
        if ($method === 'GET') {
            require_once 'routes/products.php';
            getKidsProducts();
        }
        break;
        
    case (preg_match('/^\/products\/([a-f0-9]{24})$/', $path, $matches) ? true : false):
        if ($method === 'GET') {
            require_once 'routes/products.php';
            getProductById($matches[1]);
        } elseif ($method === 'PUT') {
            require_once 'routes/products.php';
            updateProduct($matches[1]);
        } elseif ($method === 'DELETE') {
            require_once 'routes/products.php';
            deleteProduct($matches[1]);
        }
        break;
        
    case '/cart':
        if ($method === 'GET') {
            require_once 'routes/cart.php';
            getCartItems();
        }
        break;
        
    case '/cart/add':
        if ($method === 'POST') {
            require_once 'routes/cart.php';
            addToCart();
        }
        break;
        
    case '/cart/clear':
        if ($method === 'DELETE') {
            require_once 'routes/cart.php';
            clearCart();
        }
        break;
        
    case (preg_match('/^\/cart\/(.+)$/', $path, $matches) ? true : false):
        if ($method === 'PUT') {
            require_once 'routes/cart.php';
            updateCartItem($matches[1]);
        } elseif ($method === 'DELETE') {
            require_once 'routes/cart.php';
            removeFromCart($matches[1]);
        }
        break;
        
    case '/orders':
        if ($method === 'POST') {
            require_once 'routes/orders.php';
            createOrder();
        } elseif ($method === 'GET') {
            require_once 'routes/orders.php';
            getAllOrders();
        }
        break;
        
    case (preg_match('/^\/orders\/([a-f0-9]{24})$/', $path, $matches) ? true : false):
        if ($method === 'GET') {
            require_once 'routes/orders.php';
            getOrderById($matches[1]);
        } elseif ($method === 'PUT') {
            require_once 'routes/orders.php';
            updateOrderStatus($matches[1]);
        } elseif ($method === 'DELETE') {
            require_once 'routes/orders.php';
            cancelOrder($matches[1]);
        }
        break;
        
    case '/contact':
        if ($method === 'POST') {
            require_once 'routes/contact.php';
            submitContact();
        }
        break;
        
    default:
        if (strpos($path, '/admin') === 0) {
            require_once 'routes/admin.php';
            exit();
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>

