import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

import Homepage from "./pages/Homepage";

const App = () => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "4f4dc9d0-ece6-4a6d-b8fd-28ef25c16542",
        walletConnectors: [ EthereumWalletConnectors ],
        enableTestnets: true
      }} 
    >
      <Homepage />
    </DynamicContextProvider>
  );
};

export default App;