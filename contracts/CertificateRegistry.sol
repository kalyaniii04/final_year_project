// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CertificateRegistry {
    // =========================================================
    //                      STATE VARIABLES
    // =========================================================

    // Approved issuers
    mapping(address => bool) public approvedIssuers;

    // Institute ID uniqueness
    mapping(string => bool) private instituteIdUsed;

    // Institute details
    struct Institute {
        string name;
        string instituteId;
        string location;
        bool exists;
    }
    mapping(address => Institute) public institutes;

    // Approved verifiers
    mapping(address => bool) private approvedVerifiers;

    // Certificate structure
    struct Certificate {
        bytes32 fileHash;
        string ipfsHash; // ✅ ADD THIS
        address student;
        address issuer;
        uint256 issuedAt;
        bool revoked;
        uint256 revokedAt;
        string instituteName;
        string instituteId;
        string studentName;
        string courseName;
    }

    // certificateId => Certificate
    mapping(bytes32 => Certificate) private certificates;

    // issuer => certificateIds
    mapping(address => bytes32[]) private issuerCertificates;

    // student => certificateIds
    mapping(address => bytes32[]) private studentCertificates;

    // =========================================================
    //                           EVENTS
    // =========================================================

    event IssuerRegistered(
        address indexed issuer,
        string name,
        string instituteId
    );
    event CertificateIssued(
        bytes32 indexed certificateId,
        address indexed student,
        address indexed issuer,
        bytes32 fileHash,
        uint256 issuedAt
    );
    event CertificateRevoked(
        bytes32 indexed certificateId,
        address indexed issuer,
        uint256 revokedAt
    );
    event VerifierRegistered(
        address indexed verifierAddress,
        address indexed registeredBy
    );

    // =========================================================
    //                         MODIFIERS
    // =========================================================

    modifier onlyIssuer() {
        require(approvedIssuers[msg.sender], "Not a registered issuer");
        _;
    }

    modifier onlyVerifierOrIssuer() {
        require(
            approvedVerifiers[msg.sender] || approvedIssuers[msg.sender],
            "Not authorized"
        );
        _;
    }

    // =========================================================
    //                 ISSUER & INSTITUTE REGISTRATION
    // =========================================================

    function registerIssuer(
        string calldata name,
        string calldata instituteId,
        string calldata location
    ) external {
        require(!approvedIssuers[msg.sender], "Issuer already registered");
        require(bytes(name).length > 0, "Institute name required");
        require(bytes(instituteId).length > 0, "Institute ID required");
        require(!instituteIdUsed[instituteId], "Institute ID already used");

        approvedIssuers[msg.sender] = true;
        instituteIdUsed[instituteId] = true;

        institutes[msg.sender] = Institute({
            name: name,
            instituteId: instituteId,
            location: location,
            exists: true
        });

        emit IssuerRegistered(msg.sender, name, instituteId);
    }

    // =========================================================
    //                     ISSUE CERTIFICATE
    // =========================================================

    function issueCertificate(
        bytes32 certificateId,
        address studentAddress,
        bytes32 fileHash,
        string calldata ipfsHash, // ✅ ADD
        string calldata studentName,
        string calldata courseName
    ) external onlyIssuer {
        require(certificateId != bytes32(0), "Invalid certificateId");
        require(studentAddress != address(0), "Invalid student address");
        require(certificates[certificateId].issuedAt == 0, "Already issued");
        require(fileHash != bytes32(0), "Invalid file hash");
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(courseName).length > 0, "Course name required");

        Institute memory inst = institutes[msg.sender];
        require(inst.exists, "Institute not registered");

        certificates[certificateId] = Certificate({
            fileHash: fileHash,
            ipfsHash: ipfsHash,
            student: studentAddress,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            revokedAt: 0,
            instituteName: inst.name,
            instituteId: inst.instituteId,
            studentName: studentName,
            courseName: courseName
        });

        issuerCertificates[msg.sender].push(certificateId);
        studentCertificates[studentAddress].push(certificateId);

        emit CertificateIssued(
            certificateId,
            studentAddress,
            msg.sender,
            fileHash,
            block.timestamp
        );
    }

    // =========================================================
    //                 GET CERTIFICATE DETAILS
    // =========================================================

    function getCertificate(
        bytes32 certificateId
    ) external view returns (Certificate memory) {
        Certificate memory cert = certificates[certificateId];
        require(cert.issuedAt != 0, "Certificate not found");
        return cert;
    }

    // =========================================================
    //             GET CERTIFICATE IDS (GAS SAFE)
    // =========================================================

    function getCertificateIdsByStudent(
        address student
    ) external view returns (bytes32[] memory) {
        return studentCertificates[student];
    }

    function getCertificateIdsByIssuer(
        address issuer
    ) external view returns (bytes32[] memory) {
        return issuerCertificates[issuer];
    }

    // =========================================================
    //                       REVOKE CERTIFICATE
    // =========================================================

    function revokeCertificate(bytes32 certificateId) external onlyIssuer {
        Certificate storage cert = certificates[certificateId];
        require(cert.issuedAt != 0, "Certificate not found");
        require(cert.issuer == msg.sender, "Not original issuer");
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;
        cert.revokedAt = block.timestamp;

        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }

    // =========================================================
    //                    VERIFY CERTIFICATE
    // =========================================================

    function verifyCertificate(
        bytes32 certificateId,
        bytes32 fileHashToCheck
    ) external view onlyVerifierOrIssuer returns (bool) {
        Certificate memory cert = certificates[certificateId];
        if (cert.issuedAt == 0 || cert.revoked) return false;
        return cert.fileHash == fileHashToCheck;
    }

    // =========================================================
    //                   VERIFIER REGISTRATION
    // =========================================================

    function registerVerifier(address verifierAddress) external onlyIssuer {
        require(verifierAddress != address(0), "Invalid address");
        require(!approvedVerifiers[verifierAddress], "Already verifier");

        approvedVerifiers[verifierAddress] = true;
        emit VerifierRegistered(verifierAddress, msg.sender);
    }

    function isVerifier(address addr) external view returns (bool) {
        return approvedVerifiers[addr];
    }
}
