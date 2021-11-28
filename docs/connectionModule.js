// ----------------------------------------------------------------------------
// Network           Network Id   Chain Id
// Mainnet                    1          1
// Ropsten                    3          3
// Rinkeby                    4          4
// Kovan                     42         42
// Görli                      5          5
// Truffle Develop Network 4447
// Ganache Blockchain      5777
// Testnet   | Explorers                     | Testnet ETH Faucets
// :-------- |:----------------------------- |:-------------------------
// Ropsten   | https://ropsten.etherscan.io/ | https://faucet.metamask.io/<br />https://twitter.com/BokkyPooBah/status/1099498823699714048
// Kovan     | https://kovan.etherscan.io/   | https://faucet.kovan.network/<br />https://github.com/kovan-testnet/faucet<br />https://faucet.kovan.radarrelay.com/
// Rinkeby   | https://rinkeby.etherscan.io/ | https://faucet.metamask.io/<br />https://faucet.rinkeby.io/
// Görli     | https://goerli.etherscan.io/  | https://faucet.goerli.mudit.blog/<br />https://goerli-faucet.slock.it/<br />https://bridge.goerli.com/
// ----------------------------------------------------------------------------
var networks = {
  "-1" : { "id": "-1", "name": "Network Unknown", "explorer": "", "faucets": {} },
  "1" : { "id": "1", "name": "Ethereum Mainnet", "explorer": "https://etherscan.io/", "faucets": {} },
  "2" : { "id": "2", "name": "Morden Testnet (deprecated)", "explorer": "https://morden.etherscan.io/", "faucets": {} },
  "3" : { "id": "3", "name": "Ropsten Testnet", "explorer": "https://ropsten.etherscan.io/", "faucets": { "faucet.metamask.io": "https://faucet.metamask.io/" /*, "BokkyPooBah's VIP": "https://twitter.com/BokkyPooBah/status/1099498823699714048/" */ } },
  "4" : { "id": "4", "name": "Rinkeby Testnet", "explorer": "https://rinkeby.etherscan.io/", "faucets": { "faucet.metamask.io": "https://faucet.metamask.io/", "faucet.rinkeby.io": "https://faucet.rinkeby.io/" } },
  "42" : { "id": "42", "name": "Kovan Testnet", "explorer": "https://kovan.etherscan.io/", "faucets": { "faucet.kovan.network": "https://faucet.kovan.network/", "github.com/kovan-testnet": "https://github.com/kovan-testnet/faucet" } },
  "5" : { "id": "5", "name": "Görli Testnet", "explorer": "https://goerli.etherscan.io/", "faucets": { "faucet.goerli.mudit.blog": "https://faucet.goerli.mudit.blog/", "goerli-faucet.slock.it": "https://goerli-faucet.slock.it/" } },
  "1337" : { "id": "1337", "name": "Geth Devnet", "explorer": "(none)", "faucets": [] },
  "4447" : { "id": "4447", "name": "Truffle Devnet", "explorer": "(none)", "faucets": [] },
  "5777" : { "id": "5777", "name": "Ganache Devnet", "explorer": "(none)", "faucets": [] },
};

function getNetworkDetails(network) {
  return networks[network] || networks[-1];
}

function getTimeDiff(ts) {
  if (ts > 0) {
    var secs = parseInt(new Date() / 1000 - ts);
    var mins = parseInt(secs / 60);
    secs = secs % 60;
    var hours = parseInt(mins / 60);
    mins = mins % 60;
    var days = parseInt(hours / 24);
    hours = hours % 24;
    var s = "";
    if (days > 0) {
      s += days + "d ";
    }
    if (hours > 0) {
      s += hours + "h ";
    }
    if (mins > 0) {
      s += mins + "m ";
    }
    if (secs > 0) {
      s += secs + "s";
    }
    return "-" + s;
  } else {
    return "";
  }
}

// ----------------------------------------------------------------------------
// Convenience function
// ----------------------------------------------------------------------------
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );


// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      <!--
      powerOn: {{ powerOn }}<br />
      connected: {{ connected }}<br />
      connectionError: {{ connectionError }}<br />
      blockUpdated: {{ blockUpdated }}<br />
      block: {{ block == null ? 'null' : block.number }}<br />
      coinbaseUpdated: {{ coinbaseUpdated }}<br />
      network: {{ network == null ? 'null' : network.chainId }}<br />
      networkUpdated: {{ networkUpdated }}<br />
      <br />
      <br />
      -->

      <b-card header-class="warningheader" v-if="!connected" header="Web3 Connection Not Detected">
        <b-card-text>
          Please use the <b-link href="https://metamask.io" target="_blank">MetaMask</b-link> addon with Firefox, Chromium, Opera or Chrome, or any other other web3 browser to view this page
        </b-card-text>
      </b-card>
      <b-button v-b-toggle.connection size="sm" block variant="outline-info" v-if="connected">{{ networkName }} <b-spinner class="float-right mt-1" :variant="spinnerVariant" style="animation: spinner-grow 3.75s linear infinite;" small type="grow" label="Spinning" /></b-button>
      <b-collapse id="connection" visible class="mt-2">
        <b-card no-body class="border-0" v-if="connected">
          <b-row>
            <b-col cols="4" class="small">Block</b-col>
            <b-col class="small truncate" cols="8" >
              <b-link :href="explorer + 'block/' + blockNumber" class="card-link" target="_blank">{{ blockNumberString }}</b-link>&nbsp;&nbsp;<font size="-3">{{ lastBlockTimeDiff }}</font>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Account</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ coinbase == null ? '' : (coinbase.substring(0, 20) + '...') }}</b-link><span class="float-right"><b-link v-b-popover.hover="'View on OpenSea.io'" :href="'https://testnets.opensea.io/accounts/'+ coinbase" target="_blank"><img src="images/381114e-opensea-logomark-flat-colored-blue.png" width="20px" /></b-link> <!-- <b-link :href="'https://rarible.com/user/'+ coinbase" v-b-popover.hover="'View on Rarible.com'" target="_blank"><img src="images/rarible_feb7c08ba34c310f059947d23916f76c12314e85.png" height="20px" /></b-link> --></span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">ETH Balance</b-col><b-col class="small truncate" cols="8"><b-link :href="explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ formatETH(balance) }}</b-link></b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">WETH Balance</b-col><b-col class="small truncate" cols="8"><b-link :href="explorer + 'token/' + wethAddress + '?=' + coinbase" class="card-link" target="_blank">{{ formatETH(wethBalance) }}</b-link> <font size="-3">Δ{{ weth && weth.updatedAccounts && weth.updatedAccounts.length }}</font></b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Nix WETH Allow</b-col><b-col class="small truncate" cols="8"><b-link :href="explorer + 'address/' + wethAddress + '#events'" class="card-link" target="_blank">{{ formatETH(wethAllowanceToNix) }}</b-link></b-col>
          </b-row>
          <b-row v-show="Object.keys(faucets).length">
            <b-col cols="4" class="small">Faucet(s)</b-col>
            <b-col class="small truncate" cols="8">
              <span v-for="(url, name) in faucets">
                <b-link :href="url" class="card-link" target="_blank">{{ name }}</b-link><br />
              </span>
            </b-col>
          </b-row>
          <b-row v-show="Object.keys(txs).length">
            <b-col cols="4" class="small">
              Transactions
            </b-col>
            <b-col class="truncate" cols="8">
              <span v-for="(key, hash) in txs">
                <b-row>
                <b-col class="small truncate">
                  <b-link href="#" v-b-popover.hover="'Clear transaction ' + hash" @click="removeTx(hash)" class="card-link">x</b-link>
                  <b-link :href="explorer + 'tx/' + hash" class="card-link" target="_blank">{{ hash }}</b-link>
                </b-col>
                </b-row>
              </span>
            </b-col>
          </b-row>
          <b-row v-show="txError.length > 0">
            <b-col cols="4" class="small">
              Last Error
            </b-col>
            <b-col class="small truncate" cols="8">
              <b-link href="#" v-b-popover.hover="'Clear error ' + txError" @click="clearTxError()" class="card-link">x</b-link>
              {{ txError }}
            </b-col>
          </b-row>
        </b-card>
      </b-collapse>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      provider: null,
      spinnerVariant: "success",
      lastBlockTimeDiff: "establishing network connection",
      reschedule: false,
      refreshNow: false,
      listenersInstalled: false,
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    connected() {
      return store.getters['connection/connected'];
    },
    connectionError() {
      return store.getters['connection/connectionError'];
    },
    network() {
      return store.getters['connection/network'];
    },
    networkUpdated() {
      return store.getters['connection/networkUpdated'];
    },
    networkName() {
      return store.getters['connection/networkName'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    faucets() {
      return store.getters['connection/faucets'] || [];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    coinbaseUpdated() {
      return store.getters['connection/coinbaseUpdated'];
    },
    balance() {
      return store.getters['connection/balance'];
    },
    balanceString() {
      return store.getters['connection/balance'] == null ? "" : new BigNumber(store.getters['connection/balance']).shift(-18).toString();
    },
    weth() {
      return store.getters['connection/weth'];
    },
    wethAddress() {
      return WETHADDRESS;
    },
    wethBalance() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].balance : null;
    },
    wethAllowanceToNix() {
      return store.getters['connection/weth'] ? store.getters['connection/weth'].allowanceToNix : null;
    },
    block() {
      return store.getters['connection/block'];
    },
    blockUpdated() {
      return store.getters['connection/blockUpdated'];
    },
    blockNumber() {
      return store.getters['connection/block'] == null ? 0 : store.getters['connection/block'].number;
    },
    blockNumberString() {
      return store.getters['connection/block'] == null ? "" : formatNumber(store.getters['connection/block'].number);
    },
    txs() {
      return store.getters['connection/txs'];
    },
    txError() {
      return store.getters['connection/txError'];
    },
  },
  methods: {
    formatETH(e) {
      try {
        return e ? ethers.utils.commify(ethers.utils.formatEther(e)) : null;
      } catch (err) {
      }
      return e.toFixed(9);
    },
    removeTx(tx) {
      logDebug("Connection", "removeTx");
      store.dispatch('connection/removeTx', tx);
    },
    clearTxError(tx) {
      logDebug("Connection", "clearTxError");
      store.dispatch('connection/setTxError', "");
    },
    async execWeb3() {
      logDebug("Connection", "execWeb3() start[" + this.count + "]");

      if (this.powerOn) {
        if (!window.ethereum.isConnected() || !window.ethereum['isUnlocked']) {
            logDebug("Connection", "execWeb3() requesting accounts");
            try {
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              logDebug("Connection", "execWeb3() accounts: " + JSON.stringify(accounts));
              store.dispatch('connection/setConnected', true);
              logDebug("Connection", "execWeb3() setConnected done");
              store.dispatch('connection/setConnectionError', null);
              logDebug("Connection", "execWeb3() setConnectionError done");
            } catch (e) {
              logError("Connection", "execWeb3() error: " + JSON.stringify(e.message));
              store.dispatch('connection/setConnected', false);
              store.dispatch('connection/setConnectionError', 'Web3 account not permissioned');
            }
        }
        if (this.connected && !this.listenersInstalled) {
          logInfo("Connection", "execWeb3() Installing listeners");
          function handleChainChanged(_chainId) {
            alert('Ethereum chain has changed - reloading this page.')
            window.location.reload();
          }
          window.ethereum.on('chainChanged', handleChainChanged);

          const t = this;
          async function handleAccountsChanged(accounts) {
            logInfo("Connection", "execWeb3() handleAccountsChanged: " + JSON.stringify(accounts));
            const signer = provider.getSigner()
            const coinbase = await signer.getAddress();
            store.dispatch('connection/setCoinbase', coinbase);
            t.refreshNow = true;
          }
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          // const signer = provider.getSigner()
          // const coinbase = await signer.getAddress();
          // store.dispatch('connection/setCoinbase', coinbase);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          function handleNewBlock(b) {
            // logInfo("Connection", "execWeb3() handleNewBlock: " + JSON.stringify(b));
            t.refreshNow = true;
          }
          provider.on('block', handleNewBlock);

        }
        if (this.connected) {
          logDebug("Connection", "execWeb3() Getting data");
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            store.dispatch('connection/setNetwork', network);
            const block = await provider.getBlock();
            store.dispatch('connection/setBlock', block);
            const signer = provider.getSigner()
            const coinbase = await signer.getAddress();
            store.dispatch('connection/setCoinbase', coinbase);
            const balance = await provider.getBalance(this.coinbase);
            store.dispatch('connection/setBalance', balance);

            if (network.chainId == 4) {
              const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
              const wethBalance = await weth.balanceOf(this.coinbase);
              const wethAllowanceToNix = await weth.allowance(this.coinbase, NIXADDRESS);

              const blockNumber = block.number;
              const lookback = 50000;
              const filter = {
                address: WETHADDRESS,
                fromBlock: blockNumber - lookback,
                toBlock: blockNumber,
                topics: [[
                  '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', // Deposit (index_topic_1 address dst, uint256 wad)
                  '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', // Withdrawal (index_topic_1 address src, uint256 wad)
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
                  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval (index_topic_1 address src, index_topic_2 address guy, uint256 wad)
                ]],
              };
              const events = await provider.getLogs(filter);
              const updatedAccounts = {};
              for (let j = 0; j < events.length; j++) {
                const event = events[j];
                const parsedLog = weth.interface.parseLog(event);
                const decodedEventLog = weth.interface.decodeEventLog(parsedLog.eventFragment.name, event.data, event.topics);
                // console.log(parsedLog.eventFragment.name + " " + JSON.stringify(decodedEventLog.map((x) => { return x.toString(); })));
                if (parsedLog.eventFragment.name == "Transfer") {
                  updatedAccounts[decodedEventLog[0]] = true;
                  updatedAccounts[decodedEventLog[1]] = true;
                } else if (parsedLog.eventFragment.name == "Deposit" || parsedLog.eventFragment.name == "Withdrawal") {
                  updatedAccounts[decodedEventLog[0]] = true;
                } else { // Approval
                  if (decodedEventLog[1] == NIXADDRESS) {
                    updatedAccounts[decodedEventLog[0]] = true;
                  }
                }
              }
              store.dispatch('connection/setWeth', { balance: wethBalance, allowanceToNix: wethAllowanceToNix, updatedAccounts: Object.keys(updatedAccounts) });

            } else {
              store.dispatch('connection/setWeth', { balance: null, allowanceToNix: null, updatedAccounts: [] });
            }

          } catch (e) {
            store.dispatch('connection/setConnectionError', 'Cannot retrieve data from web3 provider');
          }
        } else {
          logError("Connection", "execWeb3() Getting data - not connected");
        }

      } else {
        if (this.connected) {
          store.dispatch('connection/setConnected', false);
        }
        if (this.connectionError != null) {
          store.dispatch('connection/setConnectionError', null);
        }
      }

      if (this.connected && this.network && this.network.chainId == 4) {
        store.dispatch('nixData/execWeb3', { count: this.count, listenersInstalled: this.listenersInstalled });
        store.dispatch('collectionData/execWeb3', { count: this.count, listenersInstalled: this.listenersInstalled });
      }

      if (!this.listenersInstalled) {
        this.listenersInstalled = true;
      }
      logDebug("Connection", "execWeb3() end[" + this.count + "]");
    },
    async timeoutCallback() {
      if (this.count++ % 150 == 0 || this.refreshNow) {
        if (this.refreshNow) {
          this.refreshNow = false;
        }
        await this.execWeb3();
      }
      if (this.block != null) {
        this.lastBlockTimeDiff = getTimeDiff(this.block.timestamp);
        var secs = parseInt(new Date() / 1000 - this.block.timestamp);
        if (secs > 90) {
          this.spinnerVariant = "danger";
        } else if (secs > 60) {
          this.spinnerVariant = "warning";
        } else {
          this.spinnerVariant = "success";
        }
      } else {
        this.spinnerVariant = "danger";
      }
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 100);
      }
    }
  },
  mounted() {
    logDebug("Connection", "mounted()");
    this.reschedule = true;
    var t = this;
    setTimeout(function() {
      t.timeoutCallback();
    }, 1000);
  },
  destroyed() {
    logDebug("Connection", "destroyed()");
    this.reschedule = false;
  },
};


const connectionModule = {
  namespaced: true,
  state: {
    powerOn: false,
    connected: false,
    connectionError: null,
    network: null,
    networkUpdated: false,
    networkName: null,
    explorer: "https://etherscan.io/",
    faucets: null,
    coinbase: null,
    coinbaseUpdated: false,
    balance: null,
    weth: {
      balance: null,
      allowanceToNix: null,
      updatedAccounts: [],
    },
    block: null,
    blockUpdated: false,
    txs: {},
    txError: "",
  },
  getters: {
    powerOn: state => state.powerOn,
    connected: state => state.connected,
    connectionError: state => state.connectionError,
    connection: state => state.connection,
    network: state => state.network,
    networkUpdated: state => state.networkUpdated,
    networkName: state => state.networkName,
    explorer: state => state.explorer,
    faucets: state => state.faucets,
    coinbase: state => state.coinbase,
    coinbaseUpdated: state => state.coinbaseUpdated,
    balance: state => state.balance,

    weth: state => state.weth,

    block: state => state.block,
    blockUpdated: state => state.blockUpdated,
    txs: state => state.txs,
    txError: state => state.txError,
  },
  mutations: {
    setPowerOn(state, powerOn) {
      logDebug("connectionModule", "mutations.setPowerOn(" + powerOn + ")");
      state.powerOn = powerOn;
    },
    setConnected(state, connected) {
      logDebug("connectionModule", "mutations.setConnected(" + connected + ")");
      state.connected = connected;
    },
    setConnectionError(state, error) {
      logDebug("connectionModule", "mutations.setConnectionError(" + error + ")");
      state.connectionError = error;
    },
    setNetwork(state, network) {
      logDebug("connectionModule", "mutations.setNetwork() - networkName: " + network.chainId);
      if (state.network == null || state.network.chainId != network.chainId) {
        logDebug("connectionModule", "mutations.setNetwork() - networkName: " + network.chainId + " updated");
        state.network = network;
        var networkDetails = getNetworkDetails(network.chainId);
        state.networkName = networkDetails.name;
        logDebug("connectionModule", "mutations.setNetwork() - networkName: " + state.networkName);
        state.explorer = networkDetails.explorer;
        state.faucets = networkDetails.faucets;
        state.networkUpdated = true;
      } else {
        if (state.networkUpdated) {
          state.networkUpdated = false;
        }
      }
    },
    setCoinbase(state, coinbase) {
      logDebug("connectionModule", "mutations.setCoinbase(" + coinbase + ")");
      if (coinbase != state.coinbase) {
        logDebug("connectionModule", "mutations.setCoinbase(" + coinbase + ") updated");
        state.coinbase = coinbase;
        state.coinbaseUpdated = true;
      } else {
        if (state.coinbaseUpdated) {
          state.coinbaseUpdated = false;
        }
      }
    },
    setBalance(state, b) {
      state.balance = b;
    },
    setWeth(state, weth) {
      // logInfo("connectionModule", "mutations.setWeth(): " + JSON.stringify(weth));
      state.weth = weth;
    },
    setBlock(state, block) {
      logDebug("connectionModule", "mutations.setBlock()");
      if (block == null) {
        logDebug("connectionModule", "actions.setBlock - block == null");
        if (state.block != null) {
          state.block = block;
          state.blockUpdated = true;
        }
      } else {
        if (state.block == null || block.hash != state.block.hash) {
          state.block = block;
          logDebug("connectionModule", "mutations.setBlock - state.blockUpdated set to true");
          state.blockUpdated = true;
        } else {
          if (state.blockUpdated) {
            logDebug("connectionModule", "mutations.setBlock - state.blockUpdated set to false");
            state.blockUpdated = false;
          }
        }
      }
    },
    addTx(state, tx) {
      logDebug("connectionModule", "mutations.addTx(): " + tx);
      Vue.set(state.txs, tx, tx);
    },
    removeTx(state, tx) {
      logDebug("connectionModule", "mutations.removeTx(): " + tx);
      Vue.delete(state.txs, tx);
    },
    setTxError(state, txError) {
      logDebug("connectionModule", "mutations.setTxError(): " + txError);
      state.txError = txError;
    },
  },
  actions: {
    setPowerOn(context, powerOn) {
      logDebug("connectionModule", "actions.setPowerOn(" + powerOn + ")");
      context.commit('setPowerOn', powerOn);
    },
    setConnected(context, connected) {
      logDebug("connectionModule", "actions.setConnected(" + connected + ")");
      context.commit('setConnected', connected);
    },
    setConnectionError(context, error) {
      logDebug("connectionModule", "actions.setConnectionError(" + error + ")");
      context.commit('setConnectionError', error);
    },
    setNetwork(context, n) {
      context.commit('setNetwork', n);
    },
    setCoinbase(context, cb) {
      context.commit('setCoinbase', cb);
    },
    setBalance(context, b) {
      context.commit('setBalance', b);
    },
    setWeth(context, weth ) {
      context.commit('setWeth', weth);
    },
    setBlock(context, block) {
      logDebug("connectionModule", "actions.setBlock()");
      context.commit('setBlock', block);
    },
    addTx(context, tx) {
      logDebug("connectionModule", "actions.addTx(): " + tx);
      context.commit('addTx', tx);
    },
    removeTx(context, tx) {
      logDebug("connectionModule", "actions.removeTx(): " + tx);
      context.commit('removeTx', tx);
    },
    setTxError(context, txError) {
      logDebug("connectionModule", "actions.setTxError(): " + txError);
      context.commit('setTxError', txError);
    },
  },
};
