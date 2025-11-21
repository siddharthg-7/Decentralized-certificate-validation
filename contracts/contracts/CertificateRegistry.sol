// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateRegistry
 * @dev Smart contract for decentralized certificate validation
 * @notice This contract allows authorized issuers to register certificates and anyone to verify them
 */
contract CertificateRegistry is Ownable {
    
    // Certificate structure
    struct Certificate {
        bytes32 docHash;        // SHA-256 hash of the certificate document
        string ipfsCID;         // IPFS CID for encrypted metadata
        address issuer;         // Address of the issuing institution
        uint256 timestamp;      // Timestamp when certificate was issued
        bool exists;            // Flag to check if certificate exists
    }
    
    // Mapping from document hash to certificate
    mapping(bytes32 => Certificate) public certificates;
    
    // Mapping to track authorized issuers
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event CertificateIssued(
        bytes32 indexed docHash,
        string ipfsCID,
        address indexed issuer,
        uint256 timestamp
    );
    
    event IssuerAdded(address indexed issuer, uint256 timestamp);
    event IssuerRemoved(address indexed issuer, uint256 timestamp);
    
    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Add contract deployer as first authorized issuer
        authorizedIssuers[msg.sender] = true;
        emit IssuerAdded(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a new authorized issuer
     * @param _issuer Address of the institution to authorize
     */
    function addAuthorizedIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already authorized");
        
        authorizedIssuers[_issuer] = true;
        emit IssuerAdded(_issuer, block.timestamp);
    }
    
    /**
     * @dev Remove an authorized issuer
     * @param _issuer Address of the institution to deauthorize
     */
    function removeAuthorizedIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Issuer not authorized");
        
        authorizedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer, block.timestamp);
    }
    
    /**
     * @dev Issue a new certificate
     * @param _docHash SHA-256 hash of the certificate document
     * @param _ipfsCID IPFS CID containing encrypted metadata
     */
    function issueCertificate(bytes32 _docHash, string memory _ipfsCID) 
        external 
        onlyAuthorizedIssuer 
    {
        require(_docHash != bytes32(0), "Invalid document hash");
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(!certificates[_docHash].exists, "Certificate already exists");
        
        certificates[_docHash] = Certificate({
            docHash: _docHash,
            ipfsCID: _ipfsCID,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit CertificateIssued(_docHash, _ipfsCID, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a certificate exists and retrieve its details
     * @param _docHash SHA-256 hash of the certificate document
     * @return exists Whether the certificate exists
     * @return ipfsCID IPFS CID of the certificate metadata
     * @return issuer Address of the issuing institution
     * @return timestamp When the certificate was issued
     */
    function verifyCertificate(bytes32 _docHash) 
        external 
        view 
        returns (
            bool exists,
            string memory ipfsCID,
            address issuer,
            uint256 timestamp
        ) 
    {
        Certificate memory cert = certificates[_docHash];
        return (
            cert.exists,
            cert.ipfsCID,
            cert.issuer,
            cert.timestamp
        );
    }
    
    /**
     * @dev Check if an address is an authorized issuer
     * @param _issuer Address to check
     * @return bool True if authorized, false otherwise
     */
    function isAuthorizedIssuer(address _issuer) external view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    /**
     * @dev Get certificate details by document hash
     * @param _docHash SHA-256 hash of the certificate document
     * @return Certificate struct
     */
    function getCertificate(bytes32 _docHash) 
        external 
        view 
        returns (Certificate memory) 
    {
        return certificates[_docHash];
    }
}
