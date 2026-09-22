import os

from dotenv import load_dotenv
from web3 import Web3


load_dotenv()


class BlockchainService:
    """
    Service untuk komunikasi backend DVMS dengan
    smart contract DiplomaVerification di Polygon Amoy.
    """

    def __init__(self):
        self.rpc_url = os.getenv("RPC_URL")
        self.private_key = os.getenv("PRIVATE_KEY")
        self.contract_address = os.getenv("CONTRACT_ADDRESS")

        if not self.rpc_url:
            raise ValueError(
                "RPC_URL belum dikonfigurasi."
            )

        if not self.private_key:
            raise ValueError(
                "PRIVATE_KEY belum dikonfigurasi."
            )

        if not self.contract_address:
            raise ValueError(
                "CONTRACT_ADDRESS belum dikonfigurasi."
            )

        # =====================================================
        # KONEKSI KE POLYGON AMOY
        # =====================================================

        self.web3 = Web3(
            Web3.HTTPProvider(self.rpc_url)
        )

        if not self.web3.is_connected():
            raise RuntimeError(
                "Tidak dapat terhubung ke Polygon Amoy."
            )

        # =====================================================
        # CONTRACT
        # =====================================================

        self.contract_address = (
            Web3.to_checksum_address(
                self.contract_address
            )
        )

        # =====================================================
        # ACCOUNT / ISSUER
        # =====================================================

        self.account = (
            self.web3.eth.account.from_key(
                self.private_key
            )
        )

        self.issuer_address = self.account.address

        # =====================================================
        # SMART CONTRACT ABI
        # =====================================================

        self.contract_abi = [
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "_documentHash",
                        "type": "bytes32",
                    },
                    {
                        "internalType": "string",
                        "name": "_ipfsCID",
                        "type": "string",
                    },
                    {
                        "internalType": "string",
                        "name": "_studentName",
                        "type": "string",
                    },
                ],
                "name": "issueDiploma",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32",
                    }
                ],
                "name": "diplomas",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "ipfsCID",
                        "type": "string",
                    },
                    {
                        "internalType": "string",
                        "name": "studentName",
                        "type": "string",
                    },
                    {
                        "internalType": "uint256",
                        "name": "issueDate",
                        "type": "uint256",
                    },
                    {
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address",
                    },
                    {
                        "internalType": "bool",
                        "name": "isRegistered",
                        "type": "bool",
                    },
                ],
                "stateMutability": "view",
                "type": "function",
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "_documentHash",
                        "type": "bytes32",
                    }
                ],
                "name": "verifyDiploma",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "isRegistered",
                        "type": "bool",
                    },
                    {
                        "internalType": "string",
                        "name": "ipfsCID",
                        "type": "string",
                    },
                    {
                        "internalType": "string",
                        "name": "studentName",
                        "type": "string",
                    },
                    {
                        "internalType": "uint256",
                        "name": "issueDate",
                        "type": "uint256",
                    },
                    {
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address",
                    },
                ],
                "stateMutability": "view",
                "type": "function",
            },
        ]

        self.contract = self.web3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi,
        )

    # =========================================================
    # NETWORK INFO
    # =========================================================

    def get_network_info(self) -> dict:
        """
        Mengambil informasi jaringan blockchain.
        """

        chain_id = self.web3.eth.chain_id

        balance_wei = self.web3.eth.get_balance(
            self.issuer_address
        )

        balance_pol = self.web3.from_wei(
            balance_wei,
            "ether",
        )

        return {
            "chain_id": chain_id,
            "issuer_address": self.issuer_address,
            "balance_pol": str(balance_pol),
            "contract_address": self.contract_address,
        }

    # =========================================================
    # ISSUE DIPLOMA
    # =========================================================

    def issue_diploma(
        self,
        document_hash: bytes,
        ipfs_cid: str,
        student_name: str,
    ) -> dict:
        """
        Mencatat hash dan CID ijazah ke smart contract.

        Parameter:
        - document_hash: SHA-256 dalam bentuk 32 bytes
        - ipfs_cid: CID file di IPFS
        - student_name: nama alumni
        """

        # =====================================================
        # VALIDASI
        # =====================================================

        if len(document_hash) != 32:
            raise ValueError(
                "document_hash harus berupa 32 bytes."
            )

        if not ipfs_cid.strip():
            raise ValueError(
                "IPFS CID wajib diisi."
            )

        if not student_name.strip():
            raise ValueError(
                "Nama alumni wajib diisi."
            )

        # =====================================================
        # CEK APAKAH HASH SUDAH TERDAFTAR
        # =====================================================

        existing = (
            self.contract.functions.verifyDiploma(
                document_hash
            ).call()
        )

        if existing[0]:
            raise ValueError(
                "Dokumen dengan hash tersebut sudah "
                "terdaftar di blockchain."
            )

        # =====================================================
        # NONCE
        # =====================================================

        nonce = self.web3.eth.get_transaction_count(
            self.issuer_address,
            "pending",
        )

        # =====================================================
        # CHAIN ID
        # =====================================================

        chain_id = self.web3.eth.chain_id

        # =====================================================
        # GAS PRICE
        # =====================================================

        gas_price = self.web3.eth.gas_price

        # =====================================================
        # BUILD TRANSACTION
        # =====================================================

        transaction = (
            self.contract.functions.issueDiploma(
                document_hash,
                ipfs_cid,
                student_name,
            ).build_transaction(
                {
                    "from": self.issuer_address,
                    "nonce": nonce,
                    "chainId": chain_id,
                    "gas": 300000,
                    "gasPrice": gas_price,
                }
            )
        )

        # =====================================================
        # SIGN TRANSACTION
        # =====================================================

        signed_transaction = (
            self.web3.eth.account.sign_transaction(
                transaction,
                self.private_key,
            )
        )

        # =====================================================
        # SEND TRANSACTION
        # =====================================================

        tx_hash = self.web3.eth.send_raw_transaction(
            signed_transaction.raw_transaction
        )

        # =====================================================
        # WAIT RECEIPT
        # =====================================================

        receipt = (
            self.web3.eth.wait_for_transaction_receipt(
                tx_hash
            )
        )

        # =====================================================
        # VALIDASI STATUS TRANSAKSI
        # =====================================================

        if receipt.status != 1:
            raise RuntimeError(
                "Transaksi blockchain gagal."
            )

        # =====================================================
        # HITUNG GAS FEE
        # =====================================================

        gas_used = receipt.gasUsed

        effective_gas_price = getattr(
            receipt,
            "effectiveGasPrice",
            gas_price,
        )

        gas_fee_wei = (
            gas_used * effective_gas_price
        )

        gas_fee_pol = self.web3.from_wei(
            gas_fee_wei,
            "ether",
        )

        return {
            "transaction_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "gas_used": gas_used,
            "gas_price": str(effective_gas_price),
            "gas_fee_wei": str(gas_fee_wei),
            "gas_fee_pol": str(gas_fee_pol),
            "status": receipt.status,
            "issuer": self.issuer_address,
            "contract_address": self.contract_address,
            "chain_id": chain_id,
        }

    # =========================================================
    # VERIFY DIPLOMA
    # =========================================================

    def verify_diploma(
        self,
        document_hash: bytes,
    ) -> dict:
        """
        Memverifikasi ijazah berdasarkan SHA-256 hash.
        """

        if len(document_hash) != 32:
            raise ValueError(
                "document_hash harus berupa 32 bytes."
            )

        result = (
            self.contract.functions.verifyDiploma(
                document_hash
            ).call()
        )

        return {
            "is_registered": result[0],
            "ipfs_cid": result[1],
            "student_name": result[2],
            "issue_date": result[3],
            "issuer": result[4],
        }


blockchain_service = BlockchainService()