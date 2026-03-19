<?php
// Simple database simulation using JSON files for development
class SimpleDatabase {
    private $dataDir;
    
    public function __construct() {
        $this->dataDir = __DIR__ . '/../data/';
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
        $this->initializeData();
    }
    
    private function initializeData() {
        // Initialize admin data if not exists
        $adminFile = $this->dataDir . 'admin_detail.json';
        if (!file_exists($adminFile)) {
            $adminData = [
                [
                    '_id' => '1',
                    'name' => 'FashionForward Admin',
                    'email' => 'admin@fashionforward.com',
                    'contactno' => '9876543210',
                    'gender' => 'Male',
                    'password' => password_hash('admin123', PASSWORD_DEFAULT),
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ];
            file_put_contents($adminFile, json_encode($adminData, JSON_PRETTY_PRINT));
        }
        
        // Initialize other collections
        $collections = ['users', 'products', 'cart', 'orders', 'contact'];
        foreach ($collections as $collection) {
            $file = $this->dataDir . $collection . '.json';
            if (!file_exists($file)) {
                file_put_contents($file, json_encode([], JSON_PRETTY_PRINT));
            }
        }
    }
    
    public function getCollection($name) {
        return new SimpleCollection($this->dataDir, $name);
    }
}

class SimpleCollection {
    private $dataDir;
    private $collectionName;
    private $filePath;
    
    public function __construct($dataDir, $collectionName) {
        $this->dataDir = $dataDir;
        $this->collectionName = $collectionName;
        $this->filePath = $dataDir . $collectionName . '.json';
    }
    
    public function findOne($query) {
        $data = $this->loadData();
        foreach ($data as $item) {
            $match = true;
            foreach ($query as $key => $value) {
                if (!isset($item[$key]) || $item[$key] !== $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                return $item;
            }
        }
        return null;
    }
    
    public function find($query = [], $options = []) {
        $data = $this->loadData();
        $results = [];
        
        // Filter data based on query
        foreach ($data as $item) {
            if ($this->matchesQuery($item, $query)) {
                $results[] = $item;
            }
        }
        
        // Apply sorting if specified
        if (isset($options['sort'])) {
            foreach ($options['sort'] as $field => $direction) {
                usort($results, function($a, $b) use ($field, $direction) {
                    $aVal = $a[$field] ?? '';
                    $bVal = $b[$field] ?? '';
                    
                    if ($aVal == $bVal) return 0;
                    
                    if ($direction === 1) {
                        return ($aVal < $bVal) ? -1 : 1;
                    } else {
                        return ($aVal > $bVal) ? -1 : 1;
                    }
                });
                break; // Only handle first sort field for simplicity
            }
        }
        
        // Apply pagination
        if (isset($options['skip']) || isset($options['limit'])) {
            $skip = $options['skip'] ?? 0;
            $limit = $options['limit'] ?? count($results);
            $results = array_slice($results, $skip, $limit);
        }
        
        return $results;
    }
    
    private function matchesQuery($item, $query) {
        if (empty($query)) {
            return true;
        }
        
        foreach ($query as $key => $value) {
            if ($key === '$or') {
                // Handle $or operator
                $orMatch = false;
                foreach ($value as $orCondition) {
                    if ($this->matchesQuery($item, $orCondition)) {
                        $orMatch = true;
                        break;
                    }
                }
                if (!$orMatch) {
                    return false;
                }
            } elseif (is_array($value)) {
                // Handle range queries like $gte, $lte
                if (!isset($item[$key])) {
                    return false;
                }
                
                foreach ($value as $operator => $operatorValue) {
                    switch ($operator) {
                        case '$gte':
                            if ($item[$key] < $operatorValue) {
                                return false;
                            }
                            break;
                        case '$lte':
                            if ($item[$key] > $operatorValue) {
                                return false;
                            }
                            break;
                        case '$gt':
                            if ($item[$key] <= $operatorValue) {
                                return false;
                            }
                            break;
                        case '$lt':
                            if ($item[$key] >= $operatorValue) {
                                return false;
                            }
                            break;
                    }
                }
            } else {
                // Handle regular equality and regex-like objects
                if (is_object($value) && isset($value->pattern)) {
                    // Handle regex-like pattern matching (case insensitive)
                    if (!isset($item[$key])) {
                        return false;
                    }
                    $pattern = '/' . preg_quote($value->pattern, '/') . '/i';
                    if (!preg_match($pattern, $item[$key])) {
                        return false;
                    }
                } else {
                    // Handle regular equality
                    if (!isset($item[$key]) || $item[$key] !== $value) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    public function insertOne($document) {
        $data = $this->loadData();
        $document['_id'] = uniqid();
        $data[] = $document;
        $this->saveData($data);
        return (object)['getInsertedId' => function() use ($document) { return $document['_id']; }];
    }
    
    public function updateOne($query, $update) {
        $data = $this->loadData();
        $modified = 0;
        
        foreach ($data as &$item) {
            $match = true;
            foreach ($query as $key => $value) {
                if (!isset($item[$key]) || $item[$key] !== $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                if (isset($update['$set'])) {
                    foreach ($update['$set'] as $key => $value) {
                        $item[$key] = $value;
                    }
                }
                $modified = 1;
                break;
            }
        }
        
        $this->saveData($data);
        return (object)['getModifiedCount' => function() use ($modified) { return $modified; }];
    }
    
    public function deleteOne($query) {
        $data = $this->loadData();
        $deleted = 0;
        
        foreach ($data as $index => $item) {
            $match = true;
            foreach ($query as $key => $value) {
                if (!isset($item[$key]) || $item[$key] !== $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                unset($data[$index]);
                $data = array_values($data); // Re-index array
                $deleted = 1;
                break;
            }
        }
        
        $this->saveData($data);
        return (object)['getDeletedCount' => function() use ($deleted) { return $deleted; }];
    }
    
    public function countDocuments($query = []) {
        return count($this->find($query));
    }
    
    private function loadData() {
        if (!file_exists($this->filePath)) {
            return [];
        }
        $content = file_get_contents($this->filePath);
        return json_decode($content, true) ?: [];
    }
    
    private function saveData($data) {
        file_put_contents($this->filePath, json_encode($data, JSON_PRETTY_PRINT));
    }
}

// Global functions for compatibility
function getDatabase() {
    static $db = null;
    if ($db === null) {
        $db = new SimpleDatabase();
    }
    return $db;
}

function getCollection($name) {
    return getDatabase()->getCollection($name);
}
?>
