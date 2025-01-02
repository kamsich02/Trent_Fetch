const express = require("express");
const Moralis = require("moralis").default;
const cors = require("cors");

const app = express();
const port = 3000;

// Replace this with your actual API key
const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBiNDNlYWEyLTRhMTMtNDA5NS04MTVhLTE2YzE1NzhlNmFiZiIsIm9yZ0lkIjoiMTU4NTMwIiwidXNlcklkIjoiMTU4MTc0IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiI1YmQ5Yzk3Mi0wZjBkLTQ0MTQtODRmOS1jMzg0NWEzODAxMzAiLCJpYXQiOjE2OTAxMzU0MDIsImV4cCI6NDg0NTg5NTQwMn0.5gdSF2V31yfE6CN9ZFIY-dFe27fU6fDqvh50Vvmd3ck";

// Use cors middleware to enable CORS for all origins
app.use(cors());

// This function fetches the token balances and transactions for a given address on a given chain
async function getDemoData(address, chain) {
  try {
    // Get token balances
    const tokenBalancesResponse = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain, // e.g., "0x1" for Ethereum Mainnet, "0x89" for Polygon, etc.
    });

    // Get wallet transactions
    const walletTransactionsResponse = await Moralis.EvmApi.transaction.getWalletTransactions({
      address,
      chain,
      // You can pass extra params if needed, e.g. limit or from_block
    });

    // Convert responses to JSON (this gives you standard JavaScript objects)
    const tokenBalances = tokenBalancesResponse.toJSON();
    const walletTransactions = walletTransactionsResponse.toJSON();

    // Filter out tokens flagged as spam (possible_spam == true)
    const safeTokens = tokenBalances.filter((token) => !token.possible_spam);

    // Return the data you need
    return {
      tokens: safeTokens,
      walletx: walletTransactions,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to My Moralis Server!");
});

// Example endpoint: GET /demo?address=0x123...&chain=0x1
app.get("/demo", async (req, res) => {
  try {
    const { address, chain } = req.query;

    // Validate query parameters
    if (!address || !chain) {
      return res
        .status(400)
        .json({ error: "Address and chain parameters are required." });
    }

    // Fetch data from Moralis
    const data = await getDemoData(address, chain);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error on /demo endpoint:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Start the server after Moralis is initialized
const startServer = async () => {
  // Initialize Moralis
  await Moralis.start({
    apiKey: MORALIS_API_KEY,
  });

  // Start your Express server
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
};

startServer();
