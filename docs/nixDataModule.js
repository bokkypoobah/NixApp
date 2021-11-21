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
    tokensData: [],
    tradeData: [],
    params: null,
    executing: false,
  },
  getters: {
    nixRoyaltyEngine: state => state.nixRoyaltyEngine,
    tokensData: state => state.tokensData,
    tradeData: state => state.tradeData,
    balances: state => state.balances,
    params: state => state.params,
  },
  mutations: {
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
          logInfo("nixDataModule", "execWeb3() count: " + count + ", blockUpdated: " + blockUpdated + ", blockNumber: " + blockNumber + ", listenersInstalled: " + listenersInstalled + ", rootState.route.params: " + JSON.stringify(rootState.route.params) + "]");
          const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
          const nixHelper = new ethers.Contract(NIXHELPERADDRESS, NIXHELPERABI, provider);

          if (!state.nixRoyaltyEngine) {
            const nixRoyaltyEngine = await nix.royaltyEngine();
            commit('updateNixRoyaltyEngine', nixRoyaltyEngine);
          }

          // TODO - Capture relevant events, and refresh only the updated orders & trades data
          // Install listeners
          if (!listenersInstalled) {
            logInfo("nixDataModule", "execWeb3() installing listener");
            nix.on("*", (event) => {
              // console.log("nix - event: ", JSON.stringify(event));
              logInfo("nixDataModule", "nix - event: " + JSON.stringify(event));
            });
          }

          const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

          var tokensData = [];
          const tokensLength = await nix.tokensLength();
          if (tokensLength > 0) {
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
            commit('updateTokensData', tokensData);

            const tradesLength = await nix.tradesLength();
            const loaded = 0;
            var tradeData = [];
            const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
            const testToadz = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);
            const tradeIndices = range(loaded, parseInt(tradesLength) - 1, 1);
            const trades = await nixHelper.getTrades(tradeIndices);
            for (let i = 0; i < trades[0].length; i++) {
              const taker = trades[0][i];
              const royaltyFactor = trades[1][i];
              const blockNumber = trades[2][i];
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
                      const parsedLog = testToadz.interface.parseLog(log);
                      const decodedEventLog = testToadz.interface.decodeEventLog(parsedLog.eventFragment.name, log.data, log.topics);
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
              const tx = await getOrderExecutedTransaction(i, blockNumber.toNumber(), nix);
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
