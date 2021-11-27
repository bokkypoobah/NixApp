const CollectionData = {
  template: `
    <div>
      <b-card header-class="warningheader" header="Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>
      <b-button v-b-toggle.collections size="sm" block variant="outline-info">ERC-721 Token Collections</b-button>
      <b-collapse id="collections" visible class="my-2">
        <b-card no-body class="border-0" v-if="network && network.chainId == 4">
          <b-row>
            <b-col cols="4" class="small">Collections</b-col>
            <b-col class="small truncate" cols="8">{{ collectionData.length }}</b-col>
          </b-row>
        </b-card>
      </b-collapse>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    network() {
      return store.getters['connection/network'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    collectionData() {
      return store.getters['collectionData/collectionData'];
    },
    nixAddress() {
      return NIXADDRESS;
    },
    nixHelperAddress() {
      return NIXHELPERADDRESS;
    },
    nixRoyaltyEngine() {
      return store.getters['tokenData/nixRoyaltyEngine'];
    },
    tokensData() {
      return store.getters['tokenData/tokensData'];
    },
    tradeData() {
      return store.getters['tokenData/tradeData'];
    },
  },
  methods: {
    async timeoutCallback() {
      logInfo("CollectionData", "timeoutCallback() count: " + this.count);
      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 600000);
      }
    },
  },
  beforeDestroy() {
    logInfo("CollectionData", "beforeDestroy()");
  },
  mounted() {
    logInfo("CollectionData", "mounted()");
    this.reschedule = true;
    logInfo("CollectionData", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
};


const collectionDataModule = {
  namespaced: true,
  state: {
    collectionData: [
      {
        address: "0x652dc3aa8e1d18a8cc19aef62cf4f03c4d50b2b5",
        symbol: "TESTS",
        name: "Tests for Devolution",
        sync: "auto",
        status: null,
      },
      {
        address: "0xD000F000Aa1F8accbd5815056Ea32A54777b2Fc4",
        symbol: "TESTTOADZ",
        name: "TestToadz",
        sync: "auto",
        status: null,
      },
      {
        address: "0xab04795fa12aCe45Dd2A2E4A132e4E46B2d4D1B8",
        symbol: "TTTT",
        name: "TTTT",
        sync: "auto",
        status: null,
      },
    ],
    nixRoyaltyEngine: null,
    tokensData: [],
    tradeData: [],
    params: null,
    executing: false,
  },
  getters: {
    collectionData: state => state.collectionData,
    nixRoyaltyEngine: state => state.nixRoyaltyEngine,
    tokensData: state => state.tokensData,
    tradeData: state => state.tradeData,
    balances: state => state.balances,
    params: state => state.params,
  },
  mutations: {
    updateNixRoyaltyEngine(state, nixRoyaltyEngine) {
      // logInfo("collectionDataModule", "updateNixRoyaltyEngine: " + nixRoyaltyEngine);
      state.nixRoyaltyEngine = nixRoyaltyEngine;
    },
    updateTokensData(state, tokensData) {
      // logInfo("collectionDataModule", "updateTokensData: " + JSON.stringify(tokensData));
      state.tokensData = tokensData;
    },
    updateTradeData(state, tradeData) {
      // logInfo("collectionDataModule", "updateTradeData: " + JSON.stringify(tradeData));
      state.tradeData = tradeData;
    },
    updateBalances(state, balances) {
      state.balances = balances;
      logDebug("collectionDataModule", "updateBalances('" + JSON.stringify(balances) + "')")
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("collectionDataModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("collectionDataModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {
      logDebug("collectionDataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
      if (!state.executing) {
        commit('updateExecuting', true);
        logDebug("collectionDataModule", "execWeb3() executing[" + count + ", " + JSON.stringify(rootState.route.params) + "]");

        var paramsChanged = false;
        if (state.params != rootState.route.params.param) {
          logDebug("collectionDataModule", "execWeb3() params changed from " + state.params + " to " + JSON.stringify(rootState.route.params.param));
          paramsChanged = true;
          commit('updateParams', rootState.route.params.param);
        }

        const connected = store.getters['connection/connected'];
        const block = store.getters['connection/block'];
        const blockUpdated = store.getters['connection/blockUpdated'];
        if (connected && blockUpdated) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const blockNumber = block ? block.number : await provider.getBlockNumber();
          logInfo("collectionDataModule", "execWeb3() count: " + count + ", blockUpdated: " + blockUpdated + ", blockNumber: " + blockNumber + ", listenersInstalled: " + listenersInstalled + ", rootState.route.params: " + JSON.stringify(rootState.route.params) + "]");
          const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
          const nixHelper = new ethers.Contract(NIXHELPERADDRESS, NIXHELPERABI, provider);

          if (!state.nixRoyaltyEngine) {
            const nixRoyaltyEngine = await nix.royaltyEngine();
            commit('updateNixRoyaltyEngine', nixRoyaltyEngine);
          }

          // TODO - Capture relevant events, and refresh only the updated orders & trades data
          // Install listeners
          if (!listenersInstalled) {
            logInfo("collectionDataModule", "execWeb3() installing listener");
            nix.on("*", (event) => {
              // console.log("nix - event: ", JSON.stringify(event));
              logInfo("collectionDataModule", "nix - event: " + JSON.stringify(event));
            });
          }

          const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

          var tokensData = [];
          const tokensLength = await nix.tokensLength();
          if (false && tokensLength > 0) {
            var tokenIndices = range(0, tokensLength - 1, 1);
            const tokens = await nixHelper.getTokens(tokenIndices);
            for (let i = 0; i < tokens[0].length; i++) {
              const token = tokens[0][i];
              const ordersLength = tokens[1][i];
              const executed = tokens[2][i];
              const volumeToken = tokens[3][i];
              const volumeWeth = tokens[4][i];
              var ordersData = [];
              var orderIndices = range(0, ordersLength - 1, 1);
              const orders = await nixHelper.getOrders(token, orderIndices);
              for (let i = 0; i < ordersLength; i++) {
                const maker = orders[0][i];
                const taker = orders[1][i];
                const tokenIds = orders[2][i];
                const price = orders[3][i];
                const data = orders[4][i];
                const buyOrSell = data[0];
                const anyOrAll = data[1];
                const expiry = data[2];
                const expiryString = expiry == 0 ? "(none)" : new Date(expiry * 1000).toISOString();
                const tradeCount = data[3];
                const tradeMax = data[4];
                const royaltyFactor = data[5];
                const orderStatus = data[6];
                ordersData.push({ orderIndex: i, maker: maker, taker: taker, tokenIds: tokenIds, price: price, buyOrSell: buyOrSell,
                  anyOrAll: anyOrAll, expiry: expiry, tradeCount: tradeCount, tradeMax: tradeMax, royaltyFactor: royaltyFactor,
                  orderStatus: orderStatus });
              }
              tokensData.push({ token: token, ordersLength: ordersLength, executed: executed, volumeToken: volumeToken, volumeWeth: volumeWeth, ordersData: ordersData });
            }
            // commit('updateTokensData', tokensData);

            const tradesLength = await nix.tradesLength();
            const loaded = 0;
            var tradeData = [];
            const tradeIndices = range(loaded, parseInt(tradesLength) - 1, 1);
            const trades = await nixHelper.getTrades(tradeIndices);
            for (let i = 0; i < trades[0].length; i++) {
              // console.log("trades[" + i + "]: " + JSON.stringify(trades[i], null, 2));
              const taker = trades[0][i];
              const royaltyFactor = trades[1][i];
              const blockNumber = trades[2][i];
              const orders = trades[3][i];
              tradeData.push({ tradeIndex: i, taker: taker, royaltyFactor: royaltyFactor, blockNumber: blockNumber, orders: orders });
            }
            // commit('updateTradeData', tradeData);
          }
        }

        commit('updateExecuting', false);
        logDebug("collectionDataModule", "execWeb3() end[" + count + "]");
      } else {
        logDebug("collectionDataModule", "execWeb3() already executing[" + count + "]");
      }
    },
  },
  // mounted() {
  //   logInfo("collectionDataModule", "mounted() $route: " + JSON.stringify(this.$route.params));
  // },
};
