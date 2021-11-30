const NixData = {
  template: `
    <div>
      <b-card header-class="warningheader" header="Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>
      <b-button v-b-toggle.nix_contract size="sm" block variant="outline-info">Nix Exchange</b-button>
      <b-collapse id="nix_contract" visible class="my-2">
        <b-card no-body class="border-0" v-if="network && network.chainId == 4">
          <b-row>
            <b-col cols="4" class="small">Nix</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixAddress + '#code'" class="card-link" target="_blank">{{ nixAddress == null ? '' : (nixAddress.substring(0, 20) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Nix Helper</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixHelperAddress + '#code'" class="card-link" target="_blank">{{ nixHelperAddress == null ? '' : (nixHelperAddress.substring(0, 20) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Royalty Engine</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixRoyaltyEngine + '#code'" class="card-link" target="_blank">{{ nixRoyaltyEngine == null ? '' : (nixRoyaltyEngine.substring(0, 20) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Tokens</b-col>
            <b-col class="small truncate" cols="8">{{ Object.keys(tokensData).length }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Trades</b-col>
            <b-col class="small truncate" cols="8">{{ Object.keys(tradeData).length }}</b-col>
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
    nixAddress() {
      return NIXADDRESS;
    },
    nixHelperAddress() {
      return NIXHELPERADDRESS;
    },
    nixRoyaltyEngine() {
      return store.getters['nixData/nixRoyaltyEngine'];
    },
    tokensData() {
      return store.getters['nixData/tokensData'];
    },
    tradeData() {
      return store.getters['nixData/tradeData'];
    },
  },
  methods: {
    async timeoutCallback() {
      logInfo("NixData", "timeoutCallback() count: " + this.count);
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
    logInfo("NixData", "beforeDestroy()");
  },
  mounted() {
    logInfo("NixData", "mounted()");
    this.reschedule = true;
    logInfo("NixData", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
};


const nixDataModule = {
  namespaced: true,
  state: {
    nixRoyaltyEngine: null,

    collections: {},
    collectionList: [],
    nixTokens: {},
    nixTokenList: [],

    tokensData: [],
    tradeData: [],
    params: null,
    executing: false,
  },
  getters: {
    nixRoyaltyEngine: state => state.nixRoyaltyEngine,

    collections: state => state.collections,
    collectionList: state => state.collectionList,
    nixTokens: state => state.nixTokens,
    nixTokenList: state => state.nixTokenList,

    tokensData: state => state.tokensData,
    tradeData: state => state.tradeData,
    balances: state => state.balances,
    params: state => state.params,
  },
  mutations: {
    newCollection(state, data) {
      // logInfo("nixDataModule", "newCollection: " + JSON.stringify(data));
      const collectionKey = data.chainId + '.' + data.address;
      let collection = state.collections[collectionKey];
      if (collection == null) {
        Vue.set(state.collections, collectionKey, {
          chainId: data.chainId,
          address: data.address,
          symbol: data.symbol,
          name: data.name,
          totalSupply: data.totalSupply,
          blockNumber: null,
          timestamp: null,
          tokens: [],
          computedTotalSupply: null,
        });
      }
      const collectionList = [];
      for (const [key, collection] of Object.entries(state.collections)) {
        collectionList.push(collection);
      }
      state.collectionList = collectionList;
    },
    newCollectionTokens(state, data) {
      // logInfo("nixDataModule", "newCollectionTokens: " + JSON.stringify(data));
      const collectionKey = data.chainId + '.' + data.address;
      let collection = state.collections[collectionKey];
      if (collection != null) {
        const tokens = collection.tokens;
        for (const [tokenId, token] of Object.entries(data.tokens)) {
          tokens[tokenId] = token;
        }
        Vue.set(state.collections, collectionKey, {
          chainId: data.chainId,
          address: data.address,
          symbol: collection.symbol,
          name: collection.name,
          totalSupply: collection.totalSupply,
          blockNumber: data.blockNumber,
          timestamp: data.timestamp,
          tokens: tokens,
          computedTotalSupply: Object.keys(tokens).length,
        });
      }
      const collectionList = [];
      for (const [key, collection] of Object.entries(state.collections)) {
        collectionList.push(collection);
      }
      state.collectionList = collectionList;
    },
    updateNixToken(state, data) {
      // logInfo("nixDataModule", "updateNixToken: " + JSON.stringify(data));

      let token = state.nixTokens[data.tokenIndex];
      if (token == null) {
        const ordersList = [];
        for (const [orderIndex, order] of Object.entries(data.orders)) {
          ordersList.push(order);
        }
        Vue.set(state.nixTokens, data.tokenIndex, {
          tokenIndex: data.tokenIndex,
          token: data.token,
          symbol: data.symbol,
          name: data.name,
          totalSupply: data.totalSupply,
          ordersLength: data.ordersLength,
          executed: data.executed,
          volumeToken: data.volumeToken,
          volumeWeth: data.volumeWeth,
          averageWeth: data.averageWeth,
          orders: data.orders,
          ordersList: ordersList,
        });
        token = state.nixTokens[data.tokenIndex];
        const nixTokenList = [];
        for (const [tokenIndex, t] of Object.entries(state.nixTokens)) {
          nixTokenList.push(t);
        }
        state.nixTokenList = nixTokenList;
      } else {
        token.ordersLength = data.ordersLength;
        token.executed = data.executed;
        token.volumeToken = data.volumeToken;
        token.volumeWeth = data.volumeWeth;
        token.averageWeth = data.averageWeth;
        for (const [orderIndex, order] of Object.entries(data.orders)) {
          if (!token.orders[orderIndex]) {
            token.ordersList.push(order);
          }
          token.orders[orderIndex] = order;
        }
        Vue.set(state.nixTokens, data.tokenIndex, token);
      }
    },
    updateNixRoyaltyEngine(state, nixRoyaltyEngine) {
      // logInfo("nixDataModule", "updateNixRoyaltyEngine: " + nixRoyaltyEngine);
      state.nixRoyaltyEngine = nixRoyaltyEngine;
    },
    updateTokensData(state, tokensData) {
      // logInfo("nixDataModule", "updateTokensData: " + JSON.stringify(tokensData));
      state.tokensData = tokensData;
    },
    updateTradeData(state, tradeData) {
      // logInfo("nixDataModule", "updateTradeData: " + JSON.stringify(tradeData));
      state.tradeData = tradeData;
    },
    updateBalances(state, balances) {
      state.balances = balances;
      logDebug("nixDataModule", "updateBalances('" + JSON.stringify(balances) + "')")
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("nixDataModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("nixDataModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    // Called by Connection.execWeb3()
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {

      async function getUpdatedEvents(provider, nix, erc721, weth, blockNumber) {
        logDebug("nixDataModule", "execWeb3.getUpdatedEvents()");

        const wethLookback = 50000; // 100
        const erc721Lookback = 30000; // 100
        const nixLookback = 60000; // 100

        const accounts = {};
        const tokens = {};
        const nixTokens = {};
        const nixOrders = {};
        const nixTrades = {};

        const nixFilter = {
          address: NIXADDRESS,
          fromBlock: blockNumber - nixLookback,
          toBlock: blockNumber,
          topics: [[
            '0xf4c563a3ea86ff1f4275e8c207df0375a51963f2b831b7bf4da8be938d92876c', // TokenAdded(address token, uint256 tokenIndex)
            '0x98294be035c742c5a68ff3c35920bf3c58cba97677569fb8bea1ae14e1e8643d', // OrderAdded(address token, uint256 orderIndex)
            '0x384bb209f0fe774478cff852a38e0ad1152d763f1a10b696be5b14437e594ef4', // OrderExecuted(address indexed token, uint indexed orderIndex, uint indexed tradeIndex, uint[] tokenIds);
          ]],
        };
        const nixEvents = await provider.getLogs(nixFilter);
        for (let j = 0; j < nixEvents.length; j++) {
          const nixEvent = nixEvents[j];
          const parsedLog = nix.interface.parseLog(nixEvent);
          const decodedEventLog = nix.interface.decodeEventLog(parsedLog.eventFragment.name, nixEvent.data, nixEvent.topics);
          // console.log(parsedLog.eventFragment.name + " " + JSON.stringify(decodedEventLog.map((x) => { return x.toString(); })));
          if (parsedLog.eventFragment.name == "TokenAdded") {
            nixTokens[decodedEventLog[1]] = decodedEventLog[0];
          } else if (parsedLog.eventFragment.name == "OrderAdded") {
            if (nixOrders[decodedEventLog[0]] == null) {
              nixOrders[decodedEventLog[0]] = {};
            }
            nixOrders[decodedEventLog[0]][decodedEventLog[1]] = true;
          } else if (parsedLog.eventFragment.name == "OrderExecuted") {
            nixTrades[decodedEventLog[2]] = true;
          }
        }

        const wethFilter = {
          address: WETHADDRESS,
          fromBlock: blockNumber - wethLookback,
          toBlock: blockNumber,
          topics: [[
            '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', // Deposit (index_topic_1 address dst, uint256 wad)
            '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', // Withdrawal (index_topic_1 address src, uint256 wad)
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval (index_topic_1 address src, index_topic_2 address guy, uint256 wad)
          ]],
        };
        const wethEvents = await provider.getLogs(wethFilter);
        for (let j = 0; j < wethEvents.length; j++) {
          const wethEvent = wethEvents[j];
          const parsedLog = weth.interface.parseLog(wethEvent);
          const decodedEventLog = weth.interface.decodeEventLog(parsedLog.eventFragment.name, wethEvent.data, wethEvent.topics);
          // console.log(parsedLog.eventFragment.name + " " + JSON.stringify(decodedEventLog.map((x) => { return x.toString(); })));
          if (parsedLog.eventFragment.name == "Transfer") {
            accounts[decodedEventLog[0]] = true;
            accounts[decodedEventLog[1]] = true;
          } else if (parsedLog.eventFragment.name == "Deposit" || parsedLog.eventFragment.name == "Withdrawal") {
            accounts[decodedEventLog[0]] = true;
          } else { // Approval
            if (decodedEventLog[1] == NIXADDRESS) {
              accounts[decodedEventLog[0]] = true;
            }
          }
        }

        const collectionsConfig = Object.keys(store.getters['collectionData/collectionsConfig']);
        for (collectionConfig of collectionsConfig) {
          const erc721Filter = {
            address: collectionConfig,
            fromBlock: blockNumber - erc721Lookback,
            toBlock: blockNumber,
            topics: [[
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
              '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31', // ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
            ]],
          };
          const erc721Events = await provider.getLogs(erc721Filter);
          for (let j = 0; j < erc721Events.length; j++) {
            const erc721Event = erc721Events[j];
            const parsedLog = erc721.interface.parseLog(erc721Event);
            const decodedEventLog = erc721.interface.decodeEventLog(parsedLog.eventFragment.name, erc721Event.data, erc721Event.topics);
            // console.log(erc721Event.address + " " + parsedLog.eventFragment.name + " " + JSON.stringify(decodedEventLog.map((x) => { return x.toString(); })));
            if (parsedLog.eventFragment.name == "Transfer") {
              accounts[decodedEventLog[0]] = true;
              accounts[decodedEventLog[1]] = true;
              if (tokens[erc721Event.address] == null) {
                tokens[erc721Event.address] = {};
              }
              tokens[erc721Event.address][decodedEventLog[2]] = true;
            } else { // ApprovalForAll
              if (decodedEventLog[1] == NIXADDRESS) {
                accounts[decodedEventLog[0]] = true;
              }
            }
          }
        }
        logInfo("nixDataModule", "execWeb3.getUpdatedEvents() - nixTokens: " + JSON.stringify(Object.keys(nixTokens)));
        for (let collection of Object.keys(nixOrders)) {
          logInfo("nixDataModule", "execWeb3.getUpdatedEvents() - nixOrders: " + collection + " - " + Object.keys(nixOrders[collection]));
        }
        logInfo("nixDataModule", "execWeb3.getUpdatedEvents() - nixTrades: " + JSON.stringify(Object.keys(nixTrades)));
        logInfo("nixDataModule", "execWeb3.getUpdatedEvents() - accounts: " + JSON.stringify(Object.keys(accounts)));
        for (let collection of Object.keys(tokens)) {
          logInfo("nixDataModule", "execWeb3.getUpdatedEvents() - tokens: " + collection + " - " + Object.keys(tokens[collection]));
        }
        return { nixTokens, nixOrders, nixTrades, accounts, tokens };
      }

      async function fullSyncCollections(erc721Helper, blockNumber, timestamp) {
        // logInfo("nixDataModule", "execWeb3.fullSyncCollections()");
        const collectionsToSync = [];
        for (const [address, collectionConfig] of Object.entries(store.getters['collectionData/collectionsConfig'])) {
          if (collectionConfig.chainId == store.getters['connection/network'].chainId) {
            if (state.collections[collectionConfig.chainId + '.' + collectionConfig.address] == null) {
              collectionsToSync.push(collectionConfig.address)
            }
          }
        }
        logInfo("nixDataModule", "execWeb3.fullSyncCollections() - collectionsToSync: " + JSON.stringify(collectionsToSync));

        if (collectionsToSync.length > 0) {
          const enumerableBatchSize = 50;
          const scanBatchSize = 5000;
          let tokenInfo = null;
          try {
            tokenInfo = await erc721Helper.tokenInfo(collectionsToSync);
            for (let i = 0; i < tokenInfo[0].length; i++) {
              const tokenType = tokenInfo[0][i].toNumber();
              let symbol = null;
              let name = null;
              let totalSupply = null;
              if ((tokenType & MASK_ERC721) == MASK_ERC721) {
                if ((tokenType & MASK_ERC721METADATA) == MASK_ERC721METADATA) {
                  symbol = tokenInfo[1][i];
                  name = tokenInfo[2][i];
                }
                if ((tokenType & MASK_ERC721ENUMERABLE) == MASK_ERC721ENUMERABLE) {
                  totalSupply = tokenInfo[3][i].toString();
                }
              }
              commit('newCollection', {
                chainId: store.getters['connection/network'].chainId,
                address: collectionsToSync[i],
                symbol: symbol,
                name: name,
                totalSupply: totalSupply,
              });
            }
            for (let i = 0; i < tokenInfo[0].length; i++) {
              const tokenType = tokenInfo[0][i].toNumber();
              if ((tokenType & MASK_ERC721) == MASK_ERC721) {
                if ((tokenType & MASK_ERC721ENUMERABLE) == MASK_ERC721ENUMERABLE) {
                  const totalSupply = tokenInfo[3][i].toString();
                  for (let j = 0; j < totalSupply; j += enumerableBatchSize) {
                    const to = (j + enumerableBatchSize > totalSupply) ? totalSupply : j + enumerableBatchSize;
                    const ownersInfo = await erc721Helper.ownersByEnumerableIndex(collectionsToSync[i], j, to);
                    const owners = {};
                    for (let k = 0; k < ownersInfo[0].length; k++) {
                      const tokenId = ownersInfo[0][k].toString();
                      owners[tokenId] = { tokenId: tokenId, owner: ownersInfo[1][k] };
                    }
                    const tokens = {};
                    for (const [tokenId, owner] of Object.entries(owners)) {
                      tokens[tokenId] = { tokenId: tokenId, owner: owner.owner, tokenURI: null };
                    }
                    commit('newCollectionTokens', {
                      chainId: store.getters['connection/network'].chainId,
                      address: collectionsToSync[i],
                      blockNumber: blockNumber,
                      timestamp: timestamp,
                      tokens: tokens,
                    });
                  }
                } else {
                  const scanFrom = 0;
                  const scanTo = 6969;
                  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
                  var searchTokenIds = range(parseInt(scanFrom), (parseInt(scanTo) - 1), 1);
                  for (let j = 0; j < searchTokenIds.length; j += scanBatchSize) {
                    const batch = searchTokenIds.slice(j, parseInt(j) + scanBatchSize);
                    const ownersInfo = await erc721Helper.ownersByTokenIds(collectionsToSync[i], batch);
                    const owners = {};
                    for (let k = 0; k < ownersInfo[0].length; k++) {
                      if (ownersInfo[0][k]) {
                        const tokenId = batch[k].toString();
                        owners[tokenId] = { tokenId: tokenId, owner: ownersInfo[1][k] };
                      }
                    }
                    const tokens = {};
                    for (const [tokenId, owner] of Object.entries(owners)) {
                      tokens[tokenId] = { tokenId: tokenId, owner: owner.owner, tokenURI: null };
                    }
                    commit('newCollectionTokens', {
                      chainId: store.getters['connection/network'].chainId,
                      address: collectionsToSync[i],
                      blockNumber: blockNumber,
                      timestamp: timestamp,
                      tokens: tokens,
                    });
                  }
                }
              }
            }


          } catch (e) {
            console.log("ERROR - Not ERC-721");
          }
          // logInfo("nixDataModule", "execWeb3.fullSyncCollections() - tokenInfo: " + JSON.stringify(tokenInfo));
        }

        // for (const [address, collectionConfig] of Object.entries(collectionsConfig)) {
        //   logInfo("nixDataModule", "execWeb3.fullSyncCollections() - collection: " + JSON.stringify(collectionConfig));
        //   const collectionKey = collectionConfig.chainId + '.' + collectionConfig.address;
        //   let collection = state.collections[collectionKey];
        //   if (collection == null) {
        //     logInfo("nixDataModule", "execWeb3.fullSyncCollections() - New sync chainId: " + collectionConfig.chainId + ", address: " + collectionConfig.address);
        //     let tokenInfo = null;
        //     try {
        //       tokenInfo = await erc721Helper.tokenInfo([collectionConfig.address]);
        //
        //     } catch (e) {
        //       console.log("ERROR - Not ERC-721");
        //     }
        //     logInfo("nixDataModule", "execWeb3.fullSyncCollections() - tokenInfo: " + JSON.stringify(tokenInfo));
        //   }
        // }
      }

      async function fullSyncNix(provider, nix, nixHelper, erc721Helper, erc721, weth, blockNumber, timestamp) {
        logInfo("nixDataModule", "fullSyncNix()");

        const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

        var tokensData = [];
        const tokensLength = await nix.tokensLength();
        if (tokensLength > 0) {
          var tokenIndices = range(0, tokensLength - 1, 1);
          const tokens = await nixHelper.getTokens(tokenIndices);
          for (let i = 0; i < tokens[0].length; i++) {
            const token = tokens[0][i];
            const ordersLength = tokens[1][i].toNumber();
            const executed = tokens[2][i].toNumber();
            const volumeToken = tokens[3][i].toNumber();
            const volumeWeth = tokens[4][i];
            const averageWeth = volumeWeth  > 0 ? volumeWeth.div(volumeToken) : null;
            let tokenInfo = null;
            let symbol = null;
            let name = null;
            let totalSupply = null;
            try {
              tokenInfo = await erc721Helper.tokenInfo([token]);
              const tokenType = tokenInfo[0][0].toNumber();
              if ((tokenType & MASK_ERC721) == MASK_ERC721) {
                if ((tokenType & MASK_ERC721METADATA) == MASK_ERC721METADATA) {
                  symbol = tokenInfo[1][0];
                  name = tokenInfo[2][0];
                }
                if ((tokenType & MASK_ERC721ENUMERABLE) == MASK_ERC721ENUMERABLE) {
                  totalSupply = tokenInfo[3][0].toNumber();
                }
              }
            } catch (e) {
            }
            commit('updateNixToken', {
              tokenIndex: tokenIndices[i],
              token: token,
              symbol: symbol,
              name: name,
              totalSupply: totalSupply,
              ordersLength: ordersLength,
              executed: executed,
              volumeToken: volumeToken,
              volumeWeth: volumeWeth,
              averageWeth: averageWeth,
              orders: {},
            });
          }
          for (let i = 0; i < tokens[0].length; i++) {
            const token = tokens[0][i];
            const ordersLength = tokens[1][i].toNumber();
            const executed = tokens[2][i].toNumber();
            const volumeToken = tokens[3][i].toNumber();
            const volumeWeth = tokens[4][i];
            const averageWeth = volumeWeth  > 0 ? volumeWeth.div(volumeToken) : null;
            // tokensData.push({ token: token, ordersLength: ordersLength, executed: executed, volumeToken: volumeToken, volumeWeth: volumeWeth, averageWeth: averageWeth, ordersData: ordersData });

            var ordersData = [];
            var orderIndices = range(0, ordersLength - 1, 1);
            const orders = await nixHelper.getOrders(token, orderIndices);
            // console.log(JSON.stringify(orders));
            for (let i = 0; i < ordersLength; i++) {
              const maker = orders[0][i];
              const taker = orders[1][i] == ADDRESS0 ? null : orders[1][i];
              const tokenIds = orders[2][i];
              const price = orders[3][i];
              const data = orders[4][i];
              const buyOrSell = data[0].toNumber();
              const anyOrAll = data[1].toNumber();
              const expiry = data[2].toNumber();
              const tradeCount = data[3].toNumber();
              const tradeMax = data[4].toNumber();
              const royaltyFactor = data[5].toNumber();
              const orderStatus = data[6].toNumber();
              ordersData.push({ orderIndex: i, maker: maker, taker: taker, tokenIds: tokenIds, price: price, buyOrSell: buyOrSell,
                anyOrAll: anyOrAll, expiry: expiry, tradeCount: tradeCount, tradeMax: tradeMax, royaltyFactor: royaltyFactor,
                orderStatus: orderStatus });
            }

            commit('updateNixToken', {
              tokenIndex: tokenIndices[i],
              token: token,
              // symbol: symbol,
              // name: name,
              // totalSupply: totalSupply,
              ordersLength: ordersLength,
              executed: executed,
              volumeToken: volumeToken,
              volumeWeth: volumeWeth,
              averageWeth: averageWeth,
              orders: ordersData,
            });
          }
          // console.log(JSON.stringify(ordersData));
        }

        const tradesLength = await nix.tradesLength();
        const loaded = 0;
        var tradeData = [];
        const tradeIndices = range(loaded, parseInt(tradesLength) - 1, 1);
        const trades = await nixHelper.getTrades(tradeIndices);
        for (let i = 0; i < trades[0].length; i++) {
          const taker = trades[0][i];
          const royaltyFactor = trades[1][i].toNumber();
          const blockNumber = trades[2][i].toNumber();
          const orders = trades[3][i];

          // event OrderExecuted(address indexed token, uint indexed orderIndex, uint indexed tradeIndex, uint[] tokenIds);
          // TODO - handle removed: true
          async function getOrderExecutedTransaction(tradeIndex, blockNumber, nix) {
            let eventFilter = nix.filters.OrderExecuted(null, null, tradeIndex);
            const timestamp = (await provider.getBlock(blockNumber)).timestamp;
            let events = await nix.queryFilter(eventFilter, blockNumber, blockNumber);
            for (let j = 0; j < events.length; j++) {
              const event = events[j];
              const parsedLog = nix.interface.parseLog(event);
              const decodedEventLog = nix.interface.decodeEventLog(parsedLog.eventFragment.name, event.data, event.topics);
              return {
                address: event.address,
                txHash: event.transactionHash,
                txIndex: event.transactionIndex,
                logIndex: event.logIndex,
                blockNumber: event.blockNumber,
                timestamp: timestamp,
                removed: event.removed,
                eventName: parsedLog.eventFragment.name,
                token: decodedEventLog[0],
                orderIndex: decodedEventLog[1].toNumber(),
                tradeIndex: decodedEventLog[2].toNumber(),
                tokenIds: decodedEventLog[3].map((x) => { return x.toNumber(); }),
              };
            }
            return null;
          }

          async function getOrderExecutedEvents(txHash) {
            const results = [];
            const txReceipt = await provider.getTransactionReceipt(txHash);
            for (let j = 0; j < txReceipt.logs.length; j++) {
              const log = txReceipt.logs[j];
              if (log.address == nix.address) {
                const parsedLog = nix.interface.parseLog(log);
                try {
                  const decodedEventLog = nix.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
                  if (parsedLog.eventFragment.name == 'OrderExecuted') {
                    results.push({
                      logIndex: log.logIndex,
                      address: log.address,
                      name: 'OrderExecuted',
                      description: 'Nix.OrderExecuted(' + decodedEventLog[0].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[1].toNumber() +
                        ', ' + decodedEventLog[2].toNumber() +
                        ', [' + decodedEventLog[3].map((x) => { return x.toNumber(); }) +
                        '])',
                      token: decodedEventLog[0],
                      orderIndex: decodedEventLog[1].toNumber(),
                      tradeIndex: decodedEventLog[2].toNumber(),
                      tokenIds: decodedEventLog[3].map((x) => { return x.toNumber(); }),
                    });
                  } else if (parsedLog.eventFragment.name == 'ThankYou') {
                    results.push({
                      logIndex: log.logIndex,
                      address: log.address,
                      name: 'ThankYou',
                      description: 'Nix.ThankYou(' + ethers.utils.formatEther(decodedEventLog[0]) + ')',
                      tip: ethers.utils.formatEther(decodedEventLog[0]),
                    });
                  } else {
                    console.log("TODO: " + parsedLog.eventFragment.name);
                  }
                } catch (e) {
                }
              } else if (log.address == weth.address) {
                try {
                  const parsedLog = weth.interface.parseLog(log);
                  const decodedEventLog = weth.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
                  if (parsedLog.eventFragment.name == 'Transfer') {
                    results.push({
                      logIndex: log.logIndex,
                      address: log.address,
                      name: 'Transfer',
                      description: 'WETH.Transfer(' + decodedEventLog[0].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[1].substring(0, 10) + '...' +
                        ', ' + ethers.utils.formatEther(decodedEventLog[2]) +
                        ')',
                      from: decodedEventLog[0],
                      to: decodedEventLog[1],
                      tokens: decodedEventLog[2].toString(),
                    });
                  } else {
                    console.log("TODO: " + parsedLog.eventFragment.name);
                  }
                } catch (e) {
                }
              } else {
                try {
                  const parsedLog = erc721.interface.parseLog(log);
                  const decodedEventLog = erc721.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
                  if (parsedLog.eventFragment.name == 'Transfer') {
                    results.push({
                      logIndex: log.logIndex,
                      address: log.address,
                      name: 'Transfer',
                      description: log.address.substring(0, 10) + '.Transfer(' + decodedEventLog[0].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[1].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[2].toNumber() +
                        ')',
                      from: decodedEventLog[0],
                      to: decodedEventLog[1],
                      tokenId: decodedEventLog[2].toString(),
                    });
                  } else if (parsedLog.eventFragment.name == 'Approval') {
                    results.push({
                      logIndex: log.logIndex,
                      address: log.address,
                      name: 'Approval',
                      description: log.address.substring(0, 10) + '.Approval(' + decodedEventLog[0].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[1].substring(0, 10) + '...' +
                        ', ' + decodedEventLog[2].toNumber() +
                        ')',
                      owner: decodedEventLog[0],
                      approved: decodedEventLog[1],
                      tokenId: decodedEventLog[2].toString(),
                    });
                  } else {
                    console.log("TODO: " + parsedLog.eventFragment.name);
                  }
                } catch (e) {
                }
              }
            }
            return results;
          }
          const tx = await getOrderExecutedTransaction(i, blockNumber, nix);
          const orderExecutedEvents = await getOrderExecutedEvents(tx.txHash);
          // console.log("orderExecutedEvents: " + JSON.stringify(orderExecutedEvents, null, 2));
          tradeData.push({
            tradeIndex: i,
            taker: taker,
            royaltyFactor: royaltyFactor,
            blockNumber: blockNumber,
            orders: orders,
            txHash: tx.txHash,
            events: orderExecutedEvents,
          });
        }
        commit('updateTradeData', tradeData);
      }

      async function incrementalSync(updates) {
        logInfo("nixDataModule", "incrementalSync()" + JSON.stringify(updates));
      }


      logDebug("nixDataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
      if (!state.executing) {
        commit('updateExecuting', true);
        logDebug("nixDataModule", "execWeb3() executing[" + count + ", " + JSON.stringify(rootState.route.params) + "]");

        var paramsChanged = false;
        if (state.params != rootState.route.params.param) {
          logDebug("nixDataModule", "execWeb3() params changed from " + state.params + " to " + JSON.stringify(rootState.route.params.param));
          paramsChanged = true;
          commit('updateParams', rootState.route.params.param);
        }

        const connected = store.getters['connection/connected'];
        const block = store.getters['connection/block'];
        const blockUpdated = store.getters['connection/blockUpdated'];
        if (connected && blockUpdated) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const blockNumber = block ? block.number : await provider.getBlockNumber();
          const timestamp = block ? block.timestamp : await provider.getBlock().timestamp;
          logDebug("nixDataModule", "execWeb3() count: " + count + ", blockUpdated: " + blockUpdated + ", blockNumber: " + blockNumber + ", listenersInstalled: " + listenersInstalled + ", rootState.route.params: " + JSON.stringify(rootState.route.params) + "]");
          const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
          const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
          const nixHelper = new ethers.Contract(NIXHELPERADDRESS, NIXHELPERABI, provider);
          const erc721Helper = new ethers.Contract(ERC721HELPERADDRESS, ERC721HELPERABI, provider);
          const erc721 = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);

          const updates = await getUpdatedEvents(provider, nix, erc721, weth, blockNumber);
          // console.log(JSON.stringify(updates));
          await fullSyncNix(provider, nix, nixHelper, erc721Helper, erc721, weth, blockNumber, timestamp);
          await fullSyncCollections(erc721Helper, blockNumber, timestamp);
          // await incrementalSync(updates);

          if (!state.nixRoyaltyEngine) {
            const nixRoyaltyEngine = await nix.royaltyEngine();
            commit('updateNixRoyaltyEngine', nixRoyaltyEngine);
          }

          // TODO - Capture relevant events, and refresh only the updated orders & trades data
          // Install listeners
          if (!listenersInstalled) {
            logDebug("nixDataModule", "execWeb3() installing listener");
            nix.on("*", (event) => {
              // console.log("nix - event: ", JSON.stringify(event));
              logInfo("nixDataModule", "nix - event: " + JSON.stringify(event));
            });
          }

          // const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
          //
          // var tokensData = [];
          // const tokensLength = await nix.tokensLength();
          // if (tokensLength > 0) {
          //   var tokenIndices = range(0, tokensLength - 1, 1);
          //   const tokens = await nixHelper.getTokens(tokenIndices);
          //   for (let i = 0; i < tokens[0].length; i++) {
          //     const token = tokens[0][i];
          //     const ordersLength = tokens[1][i];
          //     const executed = tokens[2][i];
          //     const volumeToken = tokens[3][i];
          //     const volumeWeth = tokens[4][i];
          //     const averageWeth = volumeWeth  > 0 ? volumeWeth.div(volumeToken) : null;
          //     var ordersData = [];
          //     var orderIndices = range(0, ordersLength - 1, 1);
          //     const orders = await nixHelper.getOrders(token, orderIndices);
          //     for (let i = 0; i < ordersLength; i++) {
          //       const maker = orders[0][i];
          //       const taker = orders[1][i];
          //       const tokenIds = orders[2][i];
          //       const price = orders[3][i];
          //       const data = orders[4][i];
          //       const buyOrSell = data[0];
          //       const anyOrAll = data[1];
          //       const expiry = data[2];
          //       const expiryString = expiry == 0 ? "(none)" : new Date(expiry * 1000).toISOString();
          //       const tradeCount = data[3];
          //       const tradeMax = data[4];
          //       const royaltyFactor = data[5];
          //       const orderStatus = data[6];
          //       ordersData.push({ orderIndex: i, maker: maker, taker: taker, tokenIds: tokenIds, price: price, buyOrSell: buyOrSell,
          //         anyOrAll: anyOrAll, expiry: expiry, tradeCount: tradeCount, tradeMax: tradeMax, royaltyFactor: royaltyFactor,
          //         orderStatus: orderStatus });
          //     }
          //     tokensData.push({ token: token, ordersLength: ordersLength, executed: executed, volumeToken: volumeToken, volumeWeth: volumeWeth, averageWeth: averageWeth, ordersData: ordersData });
          //   }
          //   commit('updateTokensData', tokensData);
          //
          //   const tradesLength = await nix.tradesLength();
          //   const loaded = 0;
          //   var tradeData = [];
          //   const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
          //   const testToadz = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);
          //   const tradeIndices = range(loaded, parseInt(tradesLength) - 1, 1);
          //   const trades = await nixHelper.getTrades(tradeIndices);
          //   for (let i = 0; i < trades[0].length; i++) {
          //     const taker = trades[0][i];
          //     const royaltyFactor = trades[1][i];
          //     const blockNumber = trades[2][i];
          //     const orders = trades[3][i];
          //
          //     // event OrderExecuted(address indexed token, uint indexed orderIndex, uint indexed tradeIndex, uint[] tokenIds);
          //     // TODO - handle removed: true
          //     async function getOrderExecutedTransaction(tradeIndex, blockNumber, nix) {
          //       let eventFilter = nix.filters.OrderExecuted(null, null, tradeIndex);
          //       const timestamp = (await provider.getBlock(blockNumber)).timestamp;
          //       let events = await nix.queryFilter(eventFilter, blockNumber, blockNumber);
          //       for (let j = 0; j < events.length; j++) {
          //         const event = events[j];
          //         const parsedLog = nix.interface.parseLog(event);
          //         const decodedEventLog = nix.interface.decodeEventLog(parsedLog.eventFragment.name, event.data, event.topics);
          //         return {
          //           address: event.address,
          //           txHash: event.transactionHash,
          //           txIndex: event.transactionIndex,
          //           logIndex: event.logIndex,
          //           blockNumber: event.blockNumber,
          //           timestamp: timestamp,
          //           removed: event.removed,
          //           eventName: parsedLog.eventFragment.name,
          //           token: decodedEventLog[0],
          //           orderIndex: decodedEventLog[1].toNumber(),
          //           tradeIndex: decodedEventLog[2].toNumber(),
          //           tokenIds: decodedEventLog[3].map((x) => { return x.toNumber(); }),
          //         };
          //       }
          //       return null;
          //     }
          //
          //     async function getOrderExecutedEvents(txHash) {
          //       const results = [];
          //       const txReceipt = await provider.getTransactionReceipt(txHash);
          //       for (let j = 0; j < txReceipt.logs.length; j++) {
          //         const log = txReceipt.logs[j];
          //         if (log.address == nix.address) {
          //           const parsedLog = nix.interface.parseLog(log);
          //           try {
          //             const decodedEventLog = nix.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
          //             if (parsedLog.eventFragment.name == 'OrderExecuted') {
          //               results.push({
          //                 logIndex: log.logIndex,
          //                 address: log.address,
          //                 name: 'OrderExecuted',
          //                 description: 'Nix.OrderExecuted(' + decodedEventLog[0].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[1].toNumber() +
          //                   ', ' + decodedEventLog[2].toNumber() +
          //                   ', [' + decodedEventLog[3].map((x) => { return x.toNumber(); }) +
          //                   '])',
          //                 token: decodedEventLog[0],
          //                 orderIndex: decodedEventLog[1].toNumber(),
          //                 tradeIndex: decodedEventLog[2].toNumber(),
          //                 tokenIds: decodedEventLog[3].map((x) => { return x.toNumber(); }),
          //               });
          //             } else if (parsedLog.eventFragment.name == 'ThankYou') {
          //               results.push({
          //                 logIndex: log.logIndex,
          //                 address: log.address,
          //                 name: 'ThankYou',
          //                 description: 'Nix.ThankYou(' + ethers.utils.formatEther(decodedEventLog[0]) + ')',
          //                 tip: ethers.utils.formatEther(decodedEventLog[0]),
          //               });
          //             } else {
          //               console.log("TODO: " + parsedLog.eventFragment.name);
          //             }
          //           } catch (e) {
          //           }
          //         } else if (log.address == weth.address) {
          //           try {
          //             const parsedLog = weth.interface.parseLog(log);
          //             const decodedEventLog = weth.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
          //             if (parsedLog.eventFragment.name == 'Transfer') {
          //               results.push({
          //                 logIndex: log.logIndex,
          //                 address: log.address,
          //                 name: 'Transfer',
          //                 description: 'WETH.Transfer(' + decodedEventLog[0].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[1].substring(0, 10) + '...' +
          //                   ', ' + ethers.utils.formatEther(decodedEventLog[2]) +
          //                   ')',
          //                 from: decodedEventLog[0],
          //                 to: decodedEventLog[1],
          //                 tokens: decodedEventLog[2].toString(),
          //               });
          //             } else {
          //               console.log("TODO: " + parsedLog.eventFragment.name);
          //             }
          //           } catch (e) {
          //           }
          //         } else {
          //           try {
          //             const parsedLog = testToadz.interface.parseLog(log);
          //             const decodedEventLog = testToadz.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
          //             if (parsedLog.eventFragment.name == 'Transfer') {
          //               results.push({
          //                 logIndex: log.logIndex,
          //                 address: log.address,
          //                 name: 'Transfer',
          //                 description: log.address.substring(0, 10) + '.Transfer(' + decodedEventLog[0].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[1].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[2].toNumber() +
          //                   ')',
          //                 from: decodedEventLog[0],
          //                 to: decodedEventLog[1],
          //                 tokenId: decodedEventLog[2].toString(),
          //               });
          //             } else if (parsedLog.eventFragment.name == 'Approval') {
          //               results.push({
          //                 logIndex: log.logIndex,
          //                 address: log.address,
          //                 name: 'Approval',
          //                 description: log.address.substring(0, 10) + '.Approval(' + decodedEventLog[0].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[1].substring(0, 10) + '...' +
          //                   ', ' + decodedEventLog[2].toNumber() +
          //                   ')',
          //                 owner: decodedEventLog[0],
          //                 approved: decodedEventLog[1],
          //                 tokenId: decodedEventLog[2].toString(),
          //               });
          //             } else {
          //               console.log("TODO: " + parsedLog.eventFragment.name);
          //             }
          //           } catch (e) {
          //           }
          //         }
          //       }
          //       return results;
          //     }
          //     const tx = await getOrderExecutedTransaction(i, blockNumber.toNumber(), nix);
          //     const orderExecutedEvents = await getOrderExecutedEvents(tx.txHash);
          //     // console.log("orderExecutedEvents: " + JSON.stringify(orderExecutedEvents, null, 2));
          //     tradeData.push({
          //       tradeIndex: i,
          //       taker: taker,
          //       royaltyFactor: royaltyFactor,
          //       blockNumber: blockNumber,
          //       orders: orders,
          //       txHash: tx.txHash,
          //       events: orderExecutedEvents,
          //     });
          //   }
          //   commit('updateTradeData', tradeData);
          // }
        }
        commit('updateExecuting', false);
        logDebug("nixDataModule", "execWeb3() end[" + count + "]");
      } else {
        logDebug("nixDataModule", "execWeb3() already executing[" + count + "]");
      }
    },
  },
  // mounted() {
  //   logInfo("nixDataModule", "mounted() $route: " + JSON.stringify(this.$route.params));
  // },
};


// const filter = {
//   address: NIXADDRESS,
//   // address: [NIXADDRESS, weth.address],
//   // fromBlock: blockNumber.sub(1000).toNumber(),
//   // fromBlock: blockNumber.toNumber(),
//   fromBlock: 'earliest',
//   // toBlock: 'latest',
//   toBlock: blockNumber.toNumber(),
//   // topics: [[
//   //   // '0x98294be035c742c5a68ff3c35920bf3c58cba97677569fb8bea1ae14e1e8643d', // OrderAdded(address token, uint256 orderIndex)
//   //   // '0xf4c563a3ea86ff1f4275e8c207df0375a51963f2b831b7bf4da8be938d92876c', // TokenAdded(address token, uint256 tokenIndex)
//   //   '0x384bb209f0fe774478cff852a38e0ad1152d763f1a10b696be5b14437e594ef4', // event OrderExecuted(address indexed token, uint indexed orderIndex, uint indexed tradeIndex, uint[] tokenIds);
//   //   // '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
//   // //   // // '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(index_topic_1 address src, index_topic_2 address dst, uint256 wad)
//   //   // '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', // weth Deposit(index_topic_1 address dst, uint256 wad)
//   // ]],
// };
// const timestamp = (await provider.getBlock(blockNumber.toNumber())).timestamp;
// const logs = await provider.getLogs(filter);

// // console.log("logs: " + JSON.stringify(logs, null, 2));
// for (let j = 0; j < logs.length; j++) {
//   const log = logs[j];
//   console.log("log: " + JSON.stringify(log, null, 2));
//   try {
//     let data;
//     if (log.address == nix.address) {
//       data = nix.interface.parseLog(log);
//     } else if (log.address = weth.address) {
//       data = weth.interface.parseLog(log);
//     } else if (log.address = testToadz.address) {
//       data = testToadz.interface.parseLog(log);
//     } else {
//       data = weth.interface.parseLog(log);
//       // data = testToadz.interface.parseLog(log);
//     }
//     // const data = nix.interface.parseLog(log);
//     // if (data.name == 'OrderExecuted') {
//       // console.log("data: " + JSON.stringify(data, null, 2));
//       var result = data.name + "(";
//       let separator = "";
//       data.eventFragment.inputs.forEach((a) => {
//         result = result + separator + a.name + ": ";
//         if (a.type == 'address') {
//           result = result + data.args[a.name].toString(); // this.getShortAccountName(data.args[a.name].toString());
//         } else if (a.type == 'uint256' || a.type == 'uint128') {
//           if (a.name == 'tokens' || a.name == 'amount' || a.name == 'balance' || a.name == 'value') {
//             result = result + ethers.utils.formatUnits(data.args[a.name], 18);
//           } else {
//             result = result + data.args[a.name].toString();
//           }
//         } else {
//           result = result + data.args[a.name].toString();
//         }
//         separator = ", ";
//       });
//       result = result + ")";
//       console.log(new Date(timestamp * 1000).toUTCString() + ": address: " + log.address + ", txHash: " + log.transactionHash + ", txIndex: " + log.transactionIndex + ", logIndex: " + log.logIndex + ", blockNumber: " + log.blockNumber + ", removed: " + log.removed + ": " + result);
//       // console.log("          + " + this.getShortAccountName(log.address) + " " + log.blockNumber + "." + log.logIndex + " " + result);
//     // }
//   } catch (e) {
//   }
// }

// const decodedEvents = logs.map(log => {
//         nix.abi.decodeEventLog("Transfer", log.data)
//     });

// const logs = await provider.getLogs({
//       fromBlock: process.env.DEPLOYMENT_BLOCK,
//       toBlock: 'latest',
//       address: process.env.MY_CONTRACT_ADDRESS,
//       topic: event
//     })




// 10:57:05 INFO nixDataModule:nix - event: {"blockNumber":9672209,"blockHash":"0x740255487f8cb61cf09873e0bed18b4923938f9a75877164be7be678d8bf7ee0","transactionIndex":14,"removed":false,"address":"0xDd26fD59b687269A5672217614BA72dd0ffC6b9f","data":"0x000000000000000000000000652dc3aa8e1d18a8cc19aef62cf4f03c4d50b2b50000000000000000000000000000000000000000000000000000000000000001","topics":["0xf4c563a3ea86ff1f4275e8c207df0375a51963f2b831b7bf4da8be938d92876c"],"transactionHash":"0xec0647ac16574d22d8bcb5eb830fd1ecd7a0469eb998944479b2e22494ddc9d4","logIndex":11,"event":"TokenAdded","eventSignature":"TokenAdded(address,uint256)","args":["0x652dc3aA8e1D18A8CC19AeF62CF4F03C4D50B2b5",{"type":"BigNumber","hex":"0x01"}]}
//
//
// 11:21:34 INFO nixDataModule:nix - event: {"blockNumber":9672307,"blockHash":"0x771cd94c3eed6a855d9aa8982085e974376ee2a21fbe2f83cb96c61f8d04c238","transactionIndex":8,"removed":false,"address":"0xDd26fD59b687269A5672217614BA72dd0ffC6b9f","data":"0x000000000000000000000000652dc3aa8e1d18a8cc19aef62cf4f03c4d50b2b50000000000000000000000000000000000000000000000000000000000000001","topics":["0x98294be035c742c5a68ff3c35920bf3c58cba97677569fb8bea1ae14e1e8643d"],"transactionHash":"0x70cb39c34c6b8f9fd7aed8a76332a0a72e6eb9f897461b78aa0788fa613ce82f","logIndex":8,"event":"OrderAdded","eventSignature":"OrderAdded(address,uint256)","args":["0x652dc3aA8e1D18A8CC19AeF62CF4F03C4D50B2b5",{"type":"BigNumber","hex":"0x01"}]}
