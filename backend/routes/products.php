<?php
require_once __DIR__ . '/../config/database.php';

function getAllProducts() {
    $products = getCollection('products');
    $allProducts = $products->find()->toArray();
    
    echo json_encode($allProducts);
}

function getMenProducts() {
    $products = getCollection('products');
    $menProducts = $products->find(['category' => 'men'])->toArray();
    
    echo json_encode($menProducts);
}

function getWomenProducts() {
    $products = getCollection('products');
    $womenProducts = $products->find(['category' => 'women'])->toArray();
    
    echo json_encode($womenProducts);
}

function getKidsProducts() {
    $products = getCollection('products');
    $kidsProducts = $products->find(['category' => 'kids'])->toArray();
    
    echo json_encode($kidsProducts);
}

function getProductById($id) {
    try {
        $products = getCollection('products');
        $product = $products->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        
        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID']);
    }
}

function createProduct() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['name', 'price', 'description', 'category'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    $products = getCollection('products');
    
    $productData = [
        'name' => $input['name'],
        'price' => (float)$input['price'],
        'description' => $input['description'],
        'category' => $input['category'],
        'image' => $input['image'] ?? '',
        'created_at' => new MongoDB\BSON\UTCDateTime(),
        'updated_at' => new MongoDB\BSON\UTCDateTime()
    ];
    
    $result = $products->insertOne($productData);
    
    if ($result->getInsertedId()) {
        echo json_encode([
            'success' => true,
            'product_id' => $result->getInsertedId(),
            'message' => 'Product created successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product']);
    }
}

function updateProduct($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $products = getCollection('products');
        
        $updateData = [
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];
        
        // Only update fields that are provided
        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['price'])) $updateData['price'] = (float)$input['price'];
        if (isset($input['description'])) $updateData['description'] = $input['description'];
        if (isset($input['category'])) $updateData['category'] = $input['category'];
        if (isset($input['image'])) $updateData['image'] = $input['image'];
        
        $result = $products->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $updateData]
        );
        
        if ($result->getModifiedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found or no changes made']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID or data']);
    }
}

function deleteProduct($id) {
    try {
        $products = getCollection('products');
        
        $result = $products->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        
        if ($result->getDeletedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID']);
    }
}
?>

