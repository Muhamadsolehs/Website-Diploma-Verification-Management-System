// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DiplomaVerification {
    struct Diploma {
        string ipfsCID;
        string studentName;
        uint256 issueDate;
        address issuer;
        bool isRegistered;
    }

    mapping(bytes32 => Diploma) public diplomas;

    event DiplomaIssued(
        bytes32 indexed documentHash,
        string ipfsCID,
        string studentName,
        uint256 issueDate,
        address indexed issuer
    );

    function issueDiploma(
        bytes32 _documentHash,
        string memory _ipfsCID,
        string memory _studentName
    ) public {
        require(
            !diplomas[_documentHash].isRegistered,
            "Diploma already registered"
        );

        diplomas[_documentHash] = Diploma({
            ipfsCID: _ipfsCID,
            studentName: _studentName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isRegistered: true
        });

        emit DiplomaIssued(
            _documentHash,
            _ipfsCID,
            _studentName,
            block.timestamp,
            msg.sender
        );
    }

    function verifyDiploma(
        bytes32 _documentHash
    )
        public
        view
        returns (
            bool isRegistered,
            string memory ipfsCID,
            string memory studentName,
            uint256 issueDate,
            address issuer
        )
    {
        Diploma memory diploma = diplomas[_documentHash];

        return (
            diploma.isRegistered,
            diploma.ipfsCID,
            diploma.studentName,
            diploma.issueDate,
            diploma.issuer
        );
    }
}