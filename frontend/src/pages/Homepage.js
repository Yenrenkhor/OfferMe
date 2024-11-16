import "../App.css";

import {
  DynamicContextProvider,
  DynamicWidget,
  SortWallets
} from "@dynamic-labs/sdk-react-core";
import WalletManager from "./WalletManager";

const Homepage = () => (
  <div className="App">
    <header className="App-header">
        <WalletManager />
    </header>
  </div>
);

export default Homepage;
