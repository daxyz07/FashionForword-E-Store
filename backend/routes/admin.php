<?php
// Admin Authentication Routes
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/simple_database.php';
require_once __DIR__ . '/../utils/simple_jwt.php';

// Get database connection
$db = getDatabase();

// Admin Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_GET['action'] ?? '') === 'login' || strpos($_SERVER['REQUEST_URI'], '/admin/login') !== false)) {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    try {
        $collection = getCollection('admin_detail');
        $admin = $collection->findOne(['email' => $email]);

        if ($admin && password_verify($password, $admin['password'])) {
            $token = generateJWT(['admin_id' => $admin['_id'], 'email' => $admin['email']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'admin' => [
                    'id' => $admin['_id'],
                    'name' => $admin['name'],
                    'email' => $admin['email']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid credentials'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Login failed: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Verify Admin Token
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (($_GET['action'] ?? '') === 'verify' || strpos($_SERVER['REQUEST_URI'], '/admin/verify') !== false)) {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);

    try {
        $decoded = verifyJWT($token);
        echo json_encode([
            'success' => true,
            'admin' => $decoded
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid token'
        ]);
    }
    exit();
}

// Get Admin Stats
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (($_GET['action'] ?? '') === 'stats' || strpos($_SERVER['REQUEST_URI'], '/admin/stats') !== false)) {
    try {
        $menProducts = getCollection('products')->countDocuments(['category' => 'men']);
        $womenProducts = getCollection('products')->countDocuments(['category' => 'women']);
        $kidsProducts = getCollection('products')->countDocuments(['category' => 'kids']);
        $totalUsers = getCollection('users')->countDocuments();
        $totalAdmins = getCollection('admin_detail')->countDocuments();
        $totalOrders = getCollection('orders')->countDocuments();
        $pendingOrders = getCollection('orders')->countDocuments(['status' => 'pending']);
        $approvedOrders = getCollection('orders')->countDocuments(['status' => 'approved']);
        
        $today = date('Y-m-d');
        $todayOrders = getCollection('orders')->countDocuments(['order_date' => $today]);

        echo json_encode([
            'success' => true,
            'menProducts' => $menProducts,
            'womenProducts' => $womenProducts,
            'kidsProducts' => $kidsProducts,
            'totalUsers' => $totalUsers,
            'totalAdmins' => $totalAdmins,
            'totalOrders' => $totalOrders,
            'pendingOrders' => $pendingOrders,
            'approvedOrders' => $approvedOrders,
            'todayOrders' => $todayOrders
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch stats: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Admin Products with Advanced Query
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'products') {
    // Verify admin token
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    try {
        $decoded = verifyJWT($token);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }
    
    try {
        // Build query based on parameters
        $query = [];
        $options = [];
        
        // Category filter
        $category = $_GET['category'] ?? '';
        if (!empty($category)) {
            $query['category'] = $category;
        }
        
        // Search term filter
        $searchTerm = $_GET['searchTerm'] ?? '';
        if (!empty($searchTerm)) {
            $regexObj = (object)['pattern' => $searchTerm];
            $query['$or'] = [
                ['p_name' => $regexObj],
                ['p_description' => $regexObj]
            ];
        }
        
        // Price range filter
        $minPrice = $_GET['minPrice'] ?? '';
        $maxPrice = $_GET['maxPrice'] ?? '';
        if (!empty($minPrice) || !empty($maxPrice)) {
            $priceQuery = [];
            if (!empty($minPrice)) {
                $priceQuery['$gte'] = (float) $minPrice;
            }
            if (!empty($maxPrice)) {
                $priceQuery['$lte'] = (float) $maxPrice;
            }
            $query['p_price'] = $priceQuery;
        }
        
        // Date range filter
        $dateFrom = $_GET['dateFrom'] ?? '';
        $dateTo = $_GET['dateTo'] ?? '';
        if (!empty($dateFrom) || !empty($dateTo)) {
            $dateQuery = [];
            if (!empty($dateFrom)) {
                $dateQuery['$gte'] = $dateFrom;
            }
            if (!empty($dateTo)) {
                $dateQuery['$lte'] = $dateTo . ' 23:59:59';
            }
            $query['created_at'] = $dateQuery;
        }
        
        // Sorting
        $sortBy = $_GET['sortBy'] ?? 'created_at';
        $sortOrder = $_GET['sortOrder'] ?? 'desc';
        $sortDirection = ($sortOrder === 'asc') ? 1 : -1;
        $options['sort'] = [$sortBy => $sortDirection];
        
        // Pagination
        $page = (int) ($_GET['page'] ?? 1);
        $limit = (int) ($_GET['limit'] ?? 50);
        $skip = ($page - 1) * $limit;
        $options['skip'] = $skip;
        $options['limit'] = $limit;
        
        // Execute query
        $products = getCollection('products')->find($query, $options);
        $productsArray = [];
        
        // Convert ObjectId to string for JSON encoding
        foreach ($products as $product) {
            $product['_id'] = (string) $product['_id'];
            // Format dates for frontend
            if (isset($product['created_at'])) {
                $product['created_at_formatted'] = $product['created_at'];
            }
            if (isset($product['updated_at'])) {
                $product['updated_at_formatted'] = $product['updated_at'];
            }
            $productsArray[] = $product;
        }
        
        // Get total count for pagination
        $totalCount = getCollection('products')->countDocuments($query);
        
        echo json_encode([
            'products' => $productsArray,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ],
            'query' => $query,
            'resultsCount' => count($productsArray)
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch products: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Add Product
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_GET['action'] ?? '') === 'add_product' || strpos($_SERVER['REQUEST_URI'], '/admin/products') !== false)) {
    // Verify admin token
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    try {
        $decoded = verifyJWT($token);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }
    
    try {
        $name = $_POST['name'] ?? '';
        $price = $_POST['price'] ?? 0;
        $description = $_POST['description'] ?? '';
        $category = $_POST['category'] ?? 'men';
        
        if (empty($name) || empty($price) || empty($description)) {
            throw new Exception('Name, price, and description are required');
        }
        
        // Handle file upload
        $imageName = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../public/admin/uploaded_img/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $imageName = uniqid() . '_' . $_FILES['image']['name'];
            $uploadPath = $uploadDir . $imageName;
            
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                throw new Exception('Failed to upload image');
            }
        } else {
            throw new Exception('Product image is required');
        }
        
        $product = [
            'p_name' => $name,
            'p_price' => (float) $price,
            'p_description' => $description,
            'category' => $category,
            'p_image' => $imageName,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $result = getCollection('products')->insertOne($product);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product added successfully',
            'product_id' => (string) $result->getInsertedId()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add product: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Update Product
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $_GET['action'] === 'update_product') {
    $productId = $_GET['id'] ?? '';
    
    // Verify admin token
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    try {
        $decoded = verifyJWT($token);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }
    
    try {
        $name = $_POST['name'] ?? '';
        $price = $_POST['price'] ?? 0;
        $description = $_POST['description'] ?? '';
        $category = $_POST['category'] ?? 'men';
        
        $updateData = [
            'p_name' => $name,
            'p_price' => (float) $price,
            'p_description' => $description,
            'category' => $category,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Handle file upload if new image provided
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../public/admin/uploaded_img/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $imageName = uniqid() . '_' . $_FILES['image']['name'];
            $uploadPath = $uploadDir . $imageName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $updateData['p_image'] = $imageName;
            }
        }
        
        $result = getCollection('products')->updateOne(
            ['_id' => $productId],
            ['$set' => $updateData]
        );
        
        if ($result->getModifiedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Product not found or no changes made'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update product: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Delete Product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $_GET['action'] === 'delete_product') {
    $productId = $_GET['id'] ?? '';
    $category = $_GET['category'] ?? 'men';
    
    // Verify admin token
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    try {
        $decoded = verifyJWT($token);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }
    
    try {
        $result = getCollection('products')->deleteOne([
            '_id' => $productId,
            'category' => $category
        ]);
        
        if ($result->getDeletedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Product not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete product: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Admin Orders
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'orders') {
    $filter = $_GET['filter'] ?? 'all';
    
    try {
        $query = [];
        
        switch ($filter) {
            case 'pending':
                $query['status'] = 'pending';
                break;
            case 'approved':
                $query['status'] = 'approved';
                break;
            case 'shipped':
                $query['status'] = 'shipped';
                break;
            case 'delivered':
                $query['status'] = 'delivered';
                break;
            case 'today':
                $query['order_date'] = date('Y-m-d');
                break;
        }
        
        $orders = getCollection('orders')->find($query);
        
        // Convert ObjectId to string for JSON encoding
        foreach ($orders as &$order) {
            $order['_id'] = (string) $order['_id'];
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch orders: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Update Order Status
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $_GET['action'] === 'update_order_status') {
    $orderId = $_GET['id'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    $status = $input['status'] ?? '';
    
    try {
        $result = getCollection('orders')->updateOne(
            ['_id' => $orderId],
            ['$set' => ['status' => $status, 'updated_at' => date('Y-m-d H:i:s')]]
        );
        
        if ($result->getModifiedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Order status updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Order not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update order status: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Admin Users
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'users') {
    try {
        $users = getCollection('users')->find();
        
        // Convert ObjectId to string for JSON encoding
        foreach ($users as &$user) {
            $user['_id'] = (string) $user['_id'];
            unset($user['password']); // Don't send password
        }
        
        echo json_encode([
            'success' => true,
            'users' => $users
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch users: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Admin Admins
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'admins') {
    try {
        $admins = getCollection('admin_detail')->find();
        
        // Convert ObjectId to string for JSON encoding
        foreach ($admins as &$admin) {
            $admin['_id'] = (string) $admin['_id'];
            unset($admin['password']); // Don't send password
        }
        
        echo json_encode([
            'success' => true,
            'admins' => $admins
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch admins: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Add Admin
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'add_admin') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $admin = [
            'name' => $input['name'] ?? '',
            'email' => $input['email'] ?? '',
            'password' => password_hash($input['password'] ?? '', PASSWORD_DEFAULT),
            'contactno' => $input['contactno'] ?? '',
            'gender' => $input['gender'] ?? 'Male',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $result = getCollection('admin_detail')->insertOne($admin);
        
        echo json_encode([
            'success' => true,
            'message' => 'Admin added successfully',
            'admin_id' => (string) $result->getInsertedId()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add admin: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Delete User
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $_GET['action'] === 'delete_user') {
    $userId = $_GET['id'] ?? '';
    
    try {
        $result = getCollection('users')->deleteOne(['_id' => $userId]);
        
        if ($result->getDeletedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete user: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Delete Admin
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $_GET['action'] === 'delete_admin') {
    $adminId = $_GET['id'] ?? '';
    
    try {
        $result = getCollection('admin_detail')->deleteOne(['_id' => $adminId]);
        
        if ($result->getDeletedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Admin deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Admin not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete admin: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Analytics
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'analytics') {
    try {
        // Calculate total revenue
        $pipeline = [
            ['$group' => ['_id' => null, 'total' => ['$sum' => '$total_amount']]]
        ];
        $orders = getCollection('orders')->find();
        $totalRevenue = 0;
        foreach ($orders as $order) {
            $totalRevenue += $order['total_amount'] ?? 0;
        }
        
        // Get other stats
        $totalOrders = getCollection('orders')->countDocuments();
        $totalUsers = getCollection('users')->countDocuments();
        $totalProducts = getCollection('products')->countDocuments();
        
        // Order status distribution
        $statusPipeline = [
            ['$group' => ['_id' => '$status', 'count' => ['$sum' => 1]]]
        ];
        $allOrders = getCollection('orders')->find();
        $orderStatusDistribution = [];
        foreach ($allOrders as $order) {
            $status = $order['status'] ?? 'pending';
            $orderStatusDistribution[$status] = ($orderStatusDistribution[$status] ?? 0) + 1;
        }
        
        // Top products (mock data for now)
        $topProducts = [
            ['_id' => '1', 'name' => 'Classic White Shirt', 'category' => 'men', 'sales' => 45, 'revenue' => 58455],
            ['_id' => '2', 'name' => 'Elegant Black Dress', 'category' => 'women', 'sales' => 38, 'revenue' => 94962],
            ['_id' => '3', 'name' => 'Kids Colorful T-Shirt', 'category' => 'kids', 'sales' => 52, 'revenue' => 31148]
        ];
        
        // Recent orders
        $allOrders = getCollection('orders')->find();
        $recentOrders = array_slice($allOrders, -5, 5);
        
        echo json_encode([
            'success' => true,
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'totalProducts' => $totalProducts,
            'orderStatusDistribution' => $orderStatusDistribution,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch analytics: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get Contact Messages
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'contact_messages') {
    try {
        $messages = getCollection('contact')->find();
        
        // Convert ObjectId to string for JSON encoding
        foreach ($messages as &$message) {
            $message['_id'] = (string) $message['_id'];
        }
        
        echo json_encode([
            'success' => true,
            'messages' => $messages
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch contact messages: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Delete Contact Message
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $_GET['action'] === 'delete_contact_message') {
    $messageId = $_GET['id'] ?? '';
    
    try {
        $result = getCollection('contact')->deleteOne(['_id' => $messageId]);
        
        if ($result->getDeletedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Contact message deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Contact message not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete contact message: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Get all contact inquiries
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'contact') {
    try {
        $contacts = getCollection('contact')->find();
        echo json_encode([
            'success' => true,
            'contacts' => $contacts
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch contact inquiries: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Mark contact as read/responded
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $_GET['action'] === 'contact') {
    $contactId = $_GET['id'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    $status = $input['status'] ?? ''; // 'read' or 'responded'
    
    if (empty($contactId) || empty($status)) {
        echo json_encode([
            'success' => false,
            'message' => 'Contact ID and status are required'
        ]);
        exit();
    }
    
    try {
        $result = getCollection('contact')->updateOne(
            ['_id' => $contactId],
            ['$set' => ['status' => $status]]
        );
        
        if ($result->getModifiedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Contact status updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Contact not found or status unchanged'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update contact status: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Default response
echo json_encode([
    'success' => false,
    'message' => 'Invalid request'
]);
?>
