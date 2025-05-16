"use client"

import { useState } from "react"
import { createPublicClient, http, formatEther } from "viem"
import { mainnet, bsc, arbitrum, optimism, base, linea } from "viem/chains"
import { ethers } from "ethers"

// Define network clients with more reliable RPC endpoints
const clients = {
  ethereum: createPublicClient({
    chain: mainnet,
    transport: http("https://eth.llamarpc.com"),
  }),
  bnb: createPublicClient({
    chain: bsc,
    transport: http("https://bsc-dataseed.binance.org"),
  }),
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: http("https://arb1.arbitrum.io/rpc"),
  }),
  optimism: createPublicClient({
    chain: optimism,
    transport: http("https://mainnet.optimism.io"),
  }),
  base: createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  }),
  linea: createPublicClient({
    chain: linea,
    transport: http("https://rpc.linea.build"),
  }),
}

// Define network symbols
const symbols = {
  ethereum: "ETH",
  bnb: "BNB",
  arbitrum: "ETH",
  optimism: "ETH",
  base: "ETH",
  linea: "ETH",
}

export default function PrivateKeyChecker() {
  const [privateKeyInput, setPrivateKeyInput] = useState("")
  const [balances, setBalances] = useState<Record<string, Record<string, string>>>({})
  const [addresses, setAddresses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse private keys from textarea
  const parsePrivateKeys = (input: string): string[] => {
    if (!input.trim()) return []

    // Split by newline and filter out empty lines
    const privateKeys = input
      .split("\n")
      .map((key) => key.trim())
      .filter((key) => key.length > 0)

    // Remove duplicates
    return [...new Set(privateKeys)]
  }

  // Derive addresses from private keys
  const deriveAddresses = (privateKeys: string[]): string[] => {
    const derivedAddresses: string[] = []
    const invalidKeys: string[] = []

    for (const privateKey of privateKeys) {
      try {
        // Try to create a wallet from the private key
        let formattedKey = privateKey
        
        // If the key doesn't start with 0x, add it
        if (!formattedKey.startsWith("0x")) {
          formattedKey = `0x${formattedKey}`
        }
        
        const wallet = new ethers.Wallet(formattedKey)
        derivedAddresses.push(wallet.address)
      } catch (error) {
        console.error("Invalid private key:", privateKey)
        invalidKeys.push(privateKey)
      }
    }

    if (invalidKeys.length > 0) {
      setError(`Found ${invalidKeys.length} invalid private key(s). They will be skipped.`)
    }

    return derivedAddresses
  }

  // Check balances for all addresses
  const checkBalances = async () => {
    const privateKeys = parsePrivateKeys(privateKeyInput)

    if (privateKeys.length === 0) {
      setError("Please enter at least one private key")
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Derive addresses from private keys
      const derivedAddresses = deriveAddresses(privateKeys)
      setAddresses(derivedAddresses)
      
      if (derivedAddresses.length === 0) {
        setError("No valid private keys found")
        setLoading(false)
        return
      }
      
      const newBalances: Record<string, Record<string, string>> = {}

      for (const address of derivedAddresses) {
        newBalances[address] = {}

        // Check balance on each network
        for (const [network, client] of Object.entries(clients)) {
          try {
            console.log(`Fetching balance for ${address} on ${network}...`)

            // Use a timeout to prevent hanging requests
            const fetchBalance = async () => {
              const balance = await client.getBalance({
                address: address as `0x${string}`,
              })
              return balance
            }

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timed out")), 15000),
            )

            const balance = await Promise.race([fetchBalance(), timeoutPromise])
            console.log(`Balance for ${address} on ${network}:`, balance)

            // @ts-ignore - TypeScript doesn't know that balance is a bigint
            newBalances[address][network] = formatEther(balance)
          } catch (error) {
            console.error(`Error fetching balance for ${address} on ${network}:`, error)
            newBalances[address][network] = "Error"
          }
        }
      }

      setBalances(newBalances)
    } catch (err) {
      console.error("Error checking balances:", err)
      setError("Failed to check balances. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-950 text-white">
      <div className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">EVM Balance Checker (Private Key)</h1>
          <p className="text-gray-400">Check wallet balances using private keys</p>
          <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-md">
            <p className="text-sm text-red-300">
              <strong>Security Warning:</strong> This tool runs entirely in your browser and your private keys are never
              sent to any server. However, it's generally not recommended to enter private keys on websites. Use at your
              own risk and preferably on a secure, offline device.<br></br><br></br>PEMBUAT TIDAK BERTANGGUNG JAWAB ATAS APA YANG AKAN TERJADI, ALAT INI HANYA UNTUK UJI COBA !!! JANGAN MASUKAN PRIVATE KEY ASLI/YANG DIGUNAKAN. MENGGUNAKAN PRGRAM BERARTI MENYETUJUI
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-2 mb-6">
            <textarea
              placeholder="Enter private keys (one per line)
Example:
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              value={privateKeyInput}
              onChange={(e) => setPrivateKeyInput(e.target.value)}
              className="w-full min-h-[120px] bg-gray-800 border border-gray-700 rounded-md p-3 text-white"
            />
            <button
              onClick={checkBalances}
              disabled={loading || !privateKeyInput.trim()}
              className={`px-4 py-2 rounded-md w-full md:w-auto md:self-end ${
                loading || !privateKeyInput.trim()
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                "Check Balances"
              )}
            </button>
          </div>

          {error && <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4">{error}</div>}

          <div className="rounded-md border border-gray-800 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Ethereum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    BNB Chain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Arbitrum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Optimism
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Linea
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No addresses checked yet. Enter private keys and click "Check Balances".
                    </td>
                  </tr>
                ) : (
                  addresses.map((address) => (
                    <tr key={address} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-white">{formatAddress(address)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.ethereum
                          ? balances[address].ethereum === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].ethereum).toFixed(6)} ETH`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.bnb
                          ? balances[address].bnb === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].bnb).toFixed(6)} BNB`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.arbitrum
                          ? balances[address].arbitrum === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].arbitrum).toFixed(6)} ETH`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.optimism
                          ? balances[address].optimism === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].optimism).toFixed(6)} ETH`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.base
                          ? balances[address].base === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].base).toFixed(6)} ETH`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {balances[address]?.linea
                          ? balances[address].linea === "Error"
                            ? "Error"
                            : `${Number.parseFloat(balances[address].linea).toFixed(6)} ETH`
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* <footer className="mt-8 text-center text-gray-400 pb-4">Created by Lunairefine</footer> */}
      <footer className="mt-8 text-center text-gray-400 pb-4">
  Created by{' '}
  <a
    href="https://x.com/lunairefine"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 hover:underline"
  >
    Lunairefine
  </a>
</footer>

    </main>
  )
}