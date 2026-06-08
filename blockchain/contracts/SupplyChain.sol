// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    enum ProductStatus { Created, InTransit, Delivered }
    
    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        ProductStatus status;
        uint256 timestamp;
        mapping(uint256 => StatusUpdate) statusUpdates;
        uint256 updateCount;
    }
    
    struct StatusUpdate {
        ProductStatus status;
        address updatedBy;
        string location;
        uint256 timestamp;
        string comments;
    }
    
    struct ProductBasicInfo {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        ProductStatus status;
        uint256 timestamp;
        uint256 updateCount;
    }
    
    mapping(uint256 => Product) private products;
    uint256 public productCount = 0;
    
    mapping(address => bool) public authorizedUsers;
    address public owner;
    
    event ProductCreated(
        uint256 id,
        string name,
        address manufacturer,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        uint256 id,
        ProductStatus status,
        address updatedBy,
        string location,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedUsers[msg.sender] = true;
    }
    
    function addAuthorizedUser(address user) public onlyOwner {
        authorizedUsers[user] = true;
    }
    
    function removeAuthorizedUser(address user) public onlyOwner {
        require(user != owner, "Cannot remove owner");
        authorizedUsers[user] = false;
    }
    
    function createProduct(string memory _name, string memory _description) public onlyAuthorized returns (uint256) {
        productCount++;
        Product storage product = products[productCount];
        product.id = productCount;
        product.name = _name;
        product.description = _description;
        product.manufacturer = msg.sender;
        product.status = ProductStatus.Created;
        product.timestamp = block.timestamp;
        product.updateCount = 0;
        
        // Add initial status update
        addStatusUpdate(
            productCount, 
            ProductStatus.Created, 
            "Manufacturer Facility", 
            "Product created"
        );
        
        emit ProductCreated(productCount, _name, msg.sender, block.timestamp);
        
        return productCount;
    }
    
    function updateProductStatus(
        uint256 _id, 
        ProductStatus _status, 
        string memory _location, 
        string memory _comments
    ) public onlyAuthorized {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        
        Product storage product = products[_id];
        product.status = _status;
        
        addStatusUpdate(_id, _status, _location, _comments);
        
        emit ProductStatusUpdated(_id, _status, msg.sender, _location, block.timestamp);
    }
    
    function addStatusUpdate(
        uint256 _id, 
        ProductStatus _status, 
        string memory _location, 
        string memory _comments
    ) private {
        Product storage product = products[_id];
        product.updateCount++;
        
        StatusUpdate storage update = product.statusUpdates[product.updateCount];
        update.status = _status;
        update.updatedBy = msg.sender;
        update.location = _location;
        update.timestamp = block.timestamp;
        update.comments = _comments;
    }
    
    function getProduct(uint256 _id) public view returns (
        ProductBasicInfo memory
    ) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        Product storage product = products[_id];
        
        return ProductBasicInfo({
            id: product.id,
            name: product.name,
            description: product.description,
            manufacturer: product.manufacturer,
            status: product.status,
            timestamp: product.timestamp,
            updateCount: product.updateCount
        });
    }
    
    function getStatusUpdate(uint256 _productId, uint256 _updateId) public view returns (
        ProductStatus status,
        address updatedBy,
        string memory location,
        uint256 timestamp,
        string memory comments
    ) {
        require(_productId > 0 && _productId <= productCount, "Product does not exist");
        require(_updateId > 0 && _updateId <= products[_productId].updateCount, "Update does not exist");
        
        StatusUpdate storage update = products[_productId].statusUpdates[_updateId];
        
        return (
            update.status,
            update.updatedBy,
            update.location,
            update.timestamp,
            update.comments
        );
    }
    
    function getProductStatusUpdatesCount(uint256 _productId) public view returns (uint256) {
        require(_productId > 0 && _productId <= productCount, "Product does not exist");
        return products[_productId].updateCount;
    }
}