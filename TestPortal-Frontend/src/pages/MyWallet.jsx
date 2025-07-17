import React, { useEffect, useState } from "react";

export default function MyWallet() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetch("/api/v1/user_wallets")
      .then(res => res.json())
      .then(data => {
        setWallet(Array.isArray(data) ? data[0] : data);
      });
  }, []);

  if (!wallet) return <div>Loading wallet...</div>;

  return (
    <div>
      <h3>My Token Wallet</h3>
      <div>Balance: <b>{wallet.token_balance}</b> tokens</div>
    </div>
  );
} 