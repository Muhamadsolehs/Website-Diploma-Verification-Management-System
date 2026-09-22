import os
from pathlib import Path

import solcx
from dotenv import load_dotenv
from web3 import Web3


# =========================================================
# 1. LOAD ENVIRONMENT
# =========================================================

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

if not RPC_URL:
    raise RuntimeError("RPC_URL belum ada di file .env")

if not PRIVATE_KEY:
    raise RuntimeError("PRIVATE_KEY belum ada di file .env")


# =========================================================
# 2. CONNECT TO POLYGON AMOY
# =========================================================

w3 = Web3(Web3.HTTPProvider(RPC_URL))

print("=" * 60)
print("DVMS - SMART CONTRACT DEPLOYMENT")
print("=" * 60)

print("\n[1] Mengecek koneksi Polygon Amoy...")

if not w3.is_connected():
    raise RuntimeError("Gagal terhubung ke Polygon Amoy")

print("Connected       : True")
print("Chain ID        :", w3.eth.chain_id)

if w3.eth.chain_id != 80002:
    raise RuntimeError(
        f"Chain ID salah. Diharapkan 80002, tetapi mendapat {w3.eth.chain_id}"
    )


# =========================================================
# 3. LOAD DEPLOYER WALLET
# =========================================================

print("\n[2] Mengecek wallet deployer...")

account = w3.eth.account.from_key(PRIVATE_KEY)

print("Wallet          :", account.address)


# =========================================================
# 4. CHECK BALANCE
# =========================================================

balance_wei = w3.eth.get_balance(account.address)
balance_pol = w3.from_wei(balance_wei, "ether")

print("Balance POL     :", balance_pol)

if balance_wei == 0:
    raise RuntimeError("Wallet tidak memiliki POL untuk membayar gas.")


# =========================================================
# 5. COMPILE SMART CONTRACT
# =========================================================

print("\n[3] Compile DiplomaVerification.sol...")

contract_path = Path("contracts/DiplomaVerification.sol")

if not contract_path.exists():
    raise FileNotFoundError(
        f"File contract tidak ditemukan: {contract_path}"
    )

source = contract_path.read_text(encoding="utf-8")

solcx.set_solc_version("0.8.20")

compiled = solcx.compile_source(
    source,
    output_values=["abi", "bin"],
    solc_version="0.8.20",
)

contract_id = "<stdin>:DiplomaVerification"

if contract_id not in compiled:
    raise RuntimeError(
        "Contract DiplomaVerification tidak ditemukan setelah compile."
    )

contract_interface = compiled[contract_id]

abi = contract_interface["abi"]
bytecode = contract_interface["bin"]

print("Compile         : OK")
print("Bytecode length :", len(bytecode))
print("ABI             : OK")


# =========================================================
# 6. CREATE CONTRACT OBJECT
# =========================================================

Contract = w3.eth.contract(
    abi=abi,
    bytecode=bytecode,
)


# =========================================================
# 7. PREPARE DEPLOYMENT TRANSACTION
# =========================================================

print("\n[4] Menyiapkan transaksi deployment...")

nonce = w3.eth.get_transaction_count(
    account.address,
    "pending",
)

gas_price = w3.eth.gas_price

print("Nonce           :", nonce)
print("Gas price       :", gas_price)


# =========================================================
# 8. ESTIMATE GAS
# =========================================================

print("\n[5] Estimasi gas deployment...")

constructor = Contract.constructor()

estimated_gas = constructor.estimate_gas(
    {
        "from": account.address,
    }
)

# Tambahkan buffer 20% agar lebih aman
gas_limit = int(estimated_gas * 1.2)

print("Estimated gas   :", estimated_gas)
print("Gas limit       :", gas_limit)


# =========================================================
# 9. CHECK ESTIMATED COST
# =========================================================

estimated_cost_wei = gas_limit * gas_price
estimated_cost_pol = w3.from_wei(
    estimated_cost_wei,
    "ether",
)

print("Estimated cost  :", estimated_cost_pol, "POL")

if estimated_cost_wei >= balance_wei:
    raise RuntimeError(
        "Saldo POL tidak cukup untuk deployment."
    )


# =========================================================
# 10. BUILD TRANSACTION
# =========================================================

print("\n[6] Membuat transaksi deployment...")

transaction = constructor.build_transaction(
    {
        "from": account.address,
        "nonce": nonce,
        "chainId": 80002,
        "gas": gas_limit,
        "gasPrice": gas_price,
        "value": 0,
    }
)


# =========================================================
# 11. SIGN TRANSACTION
# =========================================================

print("[7] Signing transaction...")

signed_transaction = w3.eth.account.sign_transaction(
    transaction,
    PRIVATE_KEY,
)


# =========================================================
# 12. SEND TRANSACTION
# =========================================================

print("[8] Mengirim transaksi ke Polygon Amoy...")

tx_hash = w3.eth.send_raw_transaction(
    signed_transaction.raw_transaction
)

tx_hash_hex = w3.to_hex(tx_hash)

print("\nTransaction Hash:")
print(tx_hash_hex)

print("\nPolygonScan:")
print(f"https://amoy.polygonscan.com/tx/{tx_hash_hex}")


# =========================================================
# 13. WAIT FOR RECEIPT
# =========================================================

print("\n[9] Menunggu transaksi dikonfirmasi...")

receipt = w3.eth.wait_for_transaction_receipt(
    tx_hash,
    timeout=180,
)


# =========================================================
# 14. DEPLOYMENT RESULT
# =========================================================

print("\n" + "=" * 60)

if receipt.status == 1:
    contract_address = receipt.contractAddress

    print("DEPLOYMENT BERHASIL!")
    print("=" * 60)

    print("\nContract Address:")
    print(contract_address)

    print("\nTransaction Hash:")
    print(tx_hash_hex)

    print("\nPolygonScan Contract:")
    print(
        f"https://amoy.polygonscan.com/address/{contract_address}"
    )

    print("\nGas Used:")
    print(receipt.gasUsed)

    print("\nStatus:")
    print(receipt.status)

    print("\nSimpan Contract Address ini untuk konfigurasi DVMS.")


else:
    print("DEPLOYMENT GAGAL!")
    print("=" * 60)

    print("Transaction Hash:")
    print(tx_hash_hex)

    print("\nSilakan cek transaksi di PolygonScan:")
    print(f"https://amoy.polygonscan.com/tx/{tx_hash_hex}")