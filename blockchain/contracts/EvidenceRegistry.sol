// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EvidenceRegistry
 * @dev Smart contract for immutable evidence registration and chain-of-custody verification
 * Designed for Digital Evidence Management System (DEMS) under Indian Evidence Act & BNSS guidelines.
 */
contract EvidenceRegistry {

    struct Evidence {
        string documentId;
        string documentHash;     // SHA-256 cryptographic fingerprint
        string digitalId;        // Uploader Digital Identity (e.g., DEMS-UP-GZ-0001)
        uint256 version;
        uint256 timestamp;       // Block timestamp
        address uploader;        // Submitting wallet/node address
    }

    // Mapping from documentId to version history
    mapping(string => Evidence[]) private evidenceHistory;

    // Document ID lookup list for audit discovery
    string[] private documentIndex;
    mapping(string => bool) private documentExists;

    event EvidenceRegistered(
        string indexed documentId,
        string documentHash,
        string digitalId,
        uint256 version,
        uint256 timestamp,
        address indexed uploader
    );

    /**
     * @notice Registers an evidence cryptographic fingerprint on-chain
     * @param _documentId Unique ID of the evidence record
     * @param _documentHash SHA-256 hexadecimal hash of the raw evidence file
     * @param _digitalId The verified Digital Identity of the registering officer
     * @param _version Evidence version number
     */
    function registerEvidence(
        string memory _documentId,
        string memory _documentHash,
        string memory _digitalId,
        uint256 _version
    ) public {
        require(bytes(_documentId).length > 0, "Document ID cannot be empty");
        require(bytes(_documentHash).length > 0, "Document hash cannot be empty");

        evidenceHistory[_documentId].push(
            Evidence({
                documentId: _documentId,
                documentHash: _documentHash,
                digitalId: _digitalId,
                version: _version,
                timestamp: block.timestamp,
                uploader: msg.sender
            })
        );

        if (!documentExists[_documentId]) {
            documentIndex.push(_documentId);
            documentExists[_documentId] = true;
        }

        emit EvidenceRegistered(
            _documentId,
            _documentHash,
            _digitalId,
            _version,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @notice Checks if the given hash matches any recorded version of the evidence
     * @param _documentId Evidence identifier
     * @param _documentHash Hash to verify against on-chain records
     * @return bool True if authentic and untampered
     */
    function verifyEvidence(
        string memory _documentId,
        string memory _documentHash
    ) public view returns (bool) {
        Evidence[] memory history = evidenceHistory[_documentId];

        for (uint256 i = 0; i < history.length; i++) {
            if (
                keccak256(bytes(history[i].documentHash)) ==
                keccak256(bytes(_documentHash))
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @notice Returns the latest registered version of an evidence record
     */
    function getLatestEvidence(
        string memory _documentId
    ) public view returns (Evidence memory) {
        require(evidenceHistory[_documentId].length > 0, "No evidence found");
        return evidenceHistory[_documentId][evidenceHistory[_documentId].length - 1];
    }

    /**
     * @notice Returns the entire chain-of-custody version history for an evidence record
     */
    function getEvidenceHistory(
        string memory _documentId
    ) public view returns (Evidence[] memory) {
        return evidenceHistory[_documentId];
    }

    /**
     * @notice Total number of registered evidence documents
     */
    function getTotalDocuments() public view returns (uint256) {
        return documentIndex.length;
    }
}
