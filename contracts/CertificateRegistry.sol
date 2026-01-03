// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CertificateRegistry {
    // =========================================================
    //                      STATE VARIABLES
    // =========================================================

    // Approved issuers
    mapping(address => bool) public approvedIssuers;

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

    // student => certificateIds   ✅ OPTION 1
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

    // =========================================================
    //                 ISSUER & INSTITUTE REGISTRATION
    // =========================================================

    function registerIssuer(
        string memory name,
        string memory instituteId,
        string memory location
    ) external {
        require(!approvedIssuers[msg.sender], "Issuer already registered");

        approvedIssuers[msg.sender] = true;
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
        string memory studentName,
        string memory courseName
    ) external onlyIssuer {
        require(certificateId != bytes32(0), "Invalid certificateId");
        require(studentAddress != address(0), "Invalid student address");
        require(certificates[certificateId].issuedAt == 0, "Already issued");

        Institute memory inst = institutes[msg.sender];
        require(inst.exists, "Institute not registered");

        certificates[certificateId] = Certificate({
            fileHash: fileHash,
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
        studentCertificates[studentAddress].push(certificateId); // ✅ Option 1

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
    )
        external
        view
        returns (
            bytes32 fileHash,
            address student,
            address issuer,
            uint256 issuedAt,
            bool revoked,
            uint256 revokedAt,
            string memory instituteName,
            string memory instituteId,
            string memory studentName,
            string memory courseName
        )
    {
        Certificate memory cert = certificates[certificateId];
        require(cert.issuedAt != 0, "Certificate not found");

        return (
            cert.fileHash,
            cert.student,
            cert.issuer,
            cert.issuedAt,
            cert.revoked,
            cert.revokedAt,
            cert.instituteName,
            cert.instituteId,
            cert.studentName,
            cert.courseName
        );
    }

    // =========================================================
    //             GET CERTIFICATES BY STUDENT (PHASE 2)
    // =========================================================

    function getCertificatesByStudent(
        address student
    ) external view returns (bytes32[] memory ids, Certificate[] memory certs) {
        bytes32[] memory certIds = studentCertificates[student];
        Certificate[] memory result = new Certificate[](certIds.length);

        for (uint256 i = 0; i < certIds.length; i++) {
            result[i] = certificates[certIds[i]];
        }

        return (certIds, result);
    }

    // =========================================================
    //              GET CERTIFICATES BY ISSUER
    // =========================================================

    function getCertificatesByIssuer(
        address issuer
    ) external view returns (bytes32[] memory ids, Certificate[] memory certs) {
        bytes32[] memory certIds = issuerCertificates[issuer];
        Certificate[] memory result = new Certificate[](certIds.length);

        for (uint256 i = 0; i < certIds.length; i++) {
            result[i] = certificates[certIds[i]];
        }

        return (certIds, result);
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
    ) external view returns (bool) {
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
