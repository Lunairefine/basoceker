"use client"

import { useState } from "react"
import { createPublicClient, http, formatEther } from "viem"
import { mainnet, bsc, arbitrum, optimism, base, linea } from "viem/chains"

// UBAH DENGAN RPC ANDA SENDIRI ATAU GUNAKAN RPC PUBLIC
const clients = {
  ethereum: createPublicClient({
    chain: mainnet,
    transport: http("https://eth.llamarpc.com"),
  }),
  bnb: createPublicClient({
    chain: bsc,
    transport: http("https://bsc-dataseed1.bnbchain.org"),
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
// const symbols = {
//   ethereum: "ETH",
//   bnb: "BNB",
//   arbitrum: "ETH",
//   optimism: "ETH",
//   base: "ETH",
//   linea: "ETH",
// }

export default function Home() {
  const [addressInput, setAddressInput] = useState("")
  const [balances, setBalances] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse addresses from textarea
  const parseAddresses = (input: string): string[] => {
    if (!input.trim()) return []

    // Split by newline and filter out empty lines
    const addresses = input
      .split("\n")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0)

    // Filter out invalid addresses
    const validAddresses = addresses.filter((addr) => addr.startsWith("0x") && addr.length === 42)

    // Remove duplicates
    return [...new Set(validAddresses)]
  }

  // Check balances for all addresses
  const checkBalances = async () => {
    const addresses = parseAddresses(addressInput)

    if (addresses.length === 0) {
      setError("Please enter at least one valid Ethereum address (0x...)")
      return
    }

    setLoading(true)
    setError(null)
    const newBalances: Record<string, Record<string, string>> = {}

    try {
      for (const address of addresses) {
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

            // @ts-expect-error: dynamic key assignment is valid here
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
          <h1 className="text-2xl font-bold">EVM Balance Checker</h1>
          <p className="text-gray-400">Check wallet balances across multiple EVM networks</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-2 mb-6">
            <textarea
              placeholder="Enter Ethereum addresses (one per line)
Example:
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full min-h-[120px] bg-gray-800 border border-gray-700 rounded-md p-3 text-white"
            />
            <button
              onClick={checkBalances}
              disabled={loading || !addressInput.trim()}
              className={`px-4 py-2 rounded-md w-full md:w-auto md:self-end ${
                loading || !addressInput.trim()
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
                {Object.keys(balances).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No addresses checked yet. Enter addresses and click &quot;Check Balances&quot;.
                    </td>
                  </tr>
                ) : (
                  Object.keys(balances).map((address) => (
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