# Task

Goal: Design and build a simple options wizard to help traders buy calls and puts on Derive based on a price target within a timeframe.

The options wizard should have the following features:

- Select a currency (ETH or BTC)
- Select an expriy
- Select a strike
- Show a recommended instrument (e.g. ETH-20250228-1000-P)
- Show the best bid/ask price of the instrument

A demo of a complete solution is shown below:

![options-wizard-demo](https://github.com/user-attachments/assets/66d1d636-f7aa-4ae7-9f80-b47680c2c08b)

# What We Are Looking For

- Reliable, efficient code. First and foremost, Derive is a high performance trading interface. Your solution be fast and work without bugs.
- High quality design. We have provided a barebones design system in the repo and demo, but you are encouraged to extend it to create excellent UX and interactions.
- Above and beyond. We are looking for engineers who care deeply about their work and go the extra mile to create awesome experiences for users.

# Installation

```
yarn install
yarn dev
```

# Stack

- TypeScript
- NextJS/React
- Tailwind for styling
- [Shadcn](https://ui.shadcn.com/) for ui components

# Important Notes

- Khan Acadmey has a [helpful introduction](https://www.khanacademy.org/economics-finance-domain/core-finance/derivative-securities/put-call-options/v/american-call-options) to options.
- We are only interested in ETH and BTC currencies with options markets. Other currencies, like SOL, do not have options markets on Derive and should be filtered out.
- Currencies (ETH, BTC) have many expiries (Feb 12, Mar 18). Expiries have many strikes ($2000, $3000). Every strike has a call and put option. An instrument is the combination of a currency, expiry, strike and call/put. The unique identifier for an instrument is the `instrument_name`, e.g. ETH-20250228-1000-P
- Not all expiries have all strikes. For example, the Dec 21 expiry can have the $10000 strike when the Feb 12 expiry does not.
- For the purposes of this options wizard, if the strike price is greater than the spot price, we expect the price to go up and should buy a call. If the strike is lower than spot, we expect the price to go down and should buy a put.

# Derive API Reference

We have included functions to call the necessary Lyra API endpoints to complete the challenge. These are wrapped as:

```
fetchAllCurrencies()
```

- Gets all active currencies on Lyra with their spot price

```
fetchInstruments(params)
```

- Gets all active instruments for a given `currency` and `type`

```
fetchTicker(params)
```

- Gets a ticker for a specific instrument, including the best bid and ask price

You can access the [API documentation](https://docs.derive.xyz/reference/overview) for more details on the request parameters and respective response body.
