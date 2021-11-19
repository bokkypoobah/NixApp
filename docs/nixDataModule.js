const NixData = {
  template: `
    <div>
      <b-card header-class="warningheader" header="Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>
      <b-button v-b-toggle.contracts size="sm" block variant="outline-info">Contracts</b-button>
      <b-collapse id="contracts" visible class="my-2">
        <b-card no-body class="border-0" v-if="network && network.chainId == 4">
          <b-row>
            <b-col cols="4" class="small">Nix</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixAddress + '#code'" class="card-link" target="_blank">{{ nixAddress == null ? '' : (nixAddress.substring(0, 10) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Nix Helper</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixHelperAddress + '#code'" class="card-link" target="_blank">{{ nixHelperAddress == null ? '' : (nixHelperAddress.substring(0, 10) + '...') }}</b-link>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="small">Royalty Engine</b-col>
            <b-col class="small truncate" cols="8">
              <b-link :href="explorer + 'address/' + nixRoyaltyEngine + '#code'" class="card-link" target="_blank">{{ nixRoyaltyEngine == null ? '' : (nixRoyaltyEngine.substring(0, 10) + '...') }}</b-link>
            </b-col>
          </b-row>
        </b-card>
      </b-collapse>
      <b-button v-b-toggle.tokens size="sm" block variant="outline-info">Tokens</b-button>
      <b-collapse id="tokens" visible class="my-2">
        <b-card no-body class="border-0">
          <b-row>
            <b-col cols="4" class="small">Tokens</b-col><b-col class="small truncate" cols="8">{{ Object.keys(tokensData).length }}</b-col>
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
    // collectionList() {
    //   return store.getters['tokens/collectionList'];
    // },
    // assets() {
    //   return store.getters['tokens/assets'];
    // },
    // nftData() {
    //   return store.getters['tokens/nftData'];
    // },
  },
  methods: {
    async timeoutCallback() {
      logInfo("NixData", "timeoutCallback() count: " + this.count);

      this.count++;
      var t = this;

      // logInfo("NixData", "before tokens/loadLibrary");
      // await store.dispatch('tokens/loadLibrary');
      // logInfo("NixData", "after tokens/loadLibrary");

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

    // collections: {},
    // collectionList: [],
    // assets: {},
    // touched: {},

    // nftData: null,
    // allTokenIds: null,
    // allParents: null,
    // allAttributes: null,
    // allAncientDNAs: null,

    // selectedId: null,
    // balances: null,

    params: null,
    executing: false,
  },
  getters: {
    nixRoyaltyEngine: state => state.nixRoyaltyEngine,
    tokensData: state => state.tokensData,

    // collections: state => state.collections,
    // collectionList: state => state.collectionList,
    // assets: state => state.assets,
    // nftData: state => state.nftData,
    // allTokenIds: state => state.allTokenIds,
    // allParents: state => state.allParents,
    // allAttributes: state => state.allAttributes,
    // allAncientDNAs: state => state.allAncientDNAs,

    // selectedId: state => state.selectedId,
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
    // updateAssetsPreparation(state) {
    //   const keys = Object.keys(state.assets);
    //   for (let i = 0; i < keys.length; i++) {
    //     state.touched[keys[i]] = 0;
    //   }
    // },
    // updateAssetsCompletion(state) {
    //   for (let key in state.touched) {
    //     const value = state.touched[key];
    //     if (value == 0) {
    //       Vue.delete(state.collections[state.assets[key].contract].assets, key);
    //       if (Object.keys(state.collections[state.assets[key].contract].assets).length == 0) {
    //         Vue.delete(state.collections, state.assets[key].contract);
    //       }
    //       Vue.delete(state.assets, key);
    //     }
    //   }
    //   state.touched = {};
    //   // state.collectionList = Object.keys(state.collections).sort(function(a, b) {
    //   //   return (state.collections[a].name).localeCompare(state.collections[b].name);
    //   // });
    //   // for (const contract in state.collectionList) {
    //   //   const collection = state.collections[state.collectionList[contract]];
    //   //   collection.assetList = Object.keys(collection.assets).sort(function(a, b) {
    //   //     return (state.assets[a].name).localeCompare(state.assets[b].name);
    //   //   });
    //   // }
    //
    //   // for (const contract in state.collectionList) {
    //   //   const collection = state.collections[state.collectionList[contract]];
    //   //   logInfo("nixDataModule", "mutations.updateAssetsCompletion() - collection: " + JSON.stringify(collection, null, 2));
    //   //   for (let assetKeyIndex in collection.assetList) {
    //   //     const assetKey = collection.assetList[assetKeyIndex];
    //   //     const asset = state.assets[assetKey];
    //   //     logInfo("nixDataModule", "mutations.updateAssetsCompletion()   - asset: " + JSON.stringify(asset));
    //   //   }
    //   // }
    // },
    // updateAssets(state, { owner, permissions, data }) {
    //   // logInfo("nixDataModule", "mutations.updateAssets(" + JSON.stringify(permissions) + ", " + JSON.stringify(data).substring(0, 100) + ")");
    //   if (data && data.assets && data.assets.length > 0) {
    //     for (let assetIndex = 0; assetIndex < data.assets.length; assetIndex++) {
    //       const asset = data.assets[assetIndex];
    //       let assetOwner = asset.owner.address.toLowerCase();
    //       if (assetOwner == ADDRESS0) {
    //         assetOwner = owner.toLowerCase();
    //         console.log("assetOwner is " + ADDRESS0 + " so set to " + assetOwner);
    //       }
    //       const contract = asset.asset_contract.address.toLowerCase();
    //       // console.log("Asset: " + JSON.stringify(asset.name || '(no name)') + ", contract: " + contract);
    //       // console.log(JSON.stringify(asset, null, 2));
    //       let permission = permissions[assetOwner + ':' + contract];
    //       if (permission == null) {
    //         permission = permissions[assetOwner + ':' + null];
    //       }
    //       // console.log("  assetOwner: " + assetOwner + ", contract: " + contract + " => permission: " + JSON.stringify(permission));
    //       if (permission && (permission.permission == 1 || permission.permission == 2)) {
    //         var traits = [];
    //         for (let traitIndex = 0; traitIndex < asset.traits.length; traitIndex++) {
    //           const trait = asset.traits[traitIndex];
    //           // TODO: Sanitize
    //           traits.push({ type: trait.trait_type, value: trait.value });
    //         }
    //         var collection = state.collections[contract];
    //         if (collection == null) {
    //           Vue.set(state.collections, contract, {
    //             contract: contract,
    //             name: asset.collection.name,
    //             slug: asset.collection.slug,
    //             bannerImageUrl: asset.collection.banner_image_url,
    //             imageUrl: asset.collection.image_url,
    //             externalUrl: asset.collection.external_url,
    //             assets: {},
    //             assetList: []
    //           });
    //           collection = state.collections[contract];
    //           // console.log("New collection: " + JSON.stringify(collection));
    //         }
    //         const key = contract + "." + asset.token_id;
    //         state.touched[key] = 1;
    //         // console.log(JSON.stringify(asset));
    //         var record = {
    //           key: key,
    //           permission: permission.permission,
    //           curation: permission.curation,
    //           contract: contract,
    //           tokenId: asset.token_id,
    //           owner: assetOwner,
    //           name: asset.name || '(null)',
    //           imageUrl: asset.image_url,
    //           externalLink: asset.external_link,
    //           permalink: asset.permalink,
    //           traits: traits
    //         }
    //         Vue.set(state.assets, key, record);
    //         Vue.set(state.collections[contract].assets, key, true);
    //         // console.log(JSON.stringify(record, null, 2));
    //       }
    //     }
    //     state.collectionList = Object.keys(state.collections).sort(function(a, b) {
    //       return ('' + state.collections[a].name).localeCompare('' + state.collections[b].name);
    //     });
    //     for (const contract in state.collectionList) {
    //       const collection = state.collections[state.collectionList[contract]];
    //       collection.assetList = Object.keys(collection.assets).sort(function(a, b) {
    //         return ('' + state.assets[a].name).localeCompare('' + state.assets[b].name);
    //       });
    //     }
    //   }
    // },
    // updateNFTData(state, nftData) {
    //   // logInfo("nixDataModule", "mutations.updateNFTData(" + JSON.stringify(nftData) + ")");
    //   state.nftData = nftData;
    //   if (state.nftData == null) {
    //     state.allTokenIds = null;
    //     state.allParents = null;
    //     state.allAttributes = null;
    //     state.allAncientDNAs = null;
    //   } else {
    //     const allParents = {};
    //     const allAttributes = {};
    //     const allAncientDNAs = {};
    //     for (let tokenId in Object.keys(state.nftData.tokens)) {
    //       const token = state.nftData.tokens[tokenId];
    //       for (let parentIndex in token.parents) {
    //         const parent = token.parents[parentIndex];
    //         if (allParents[parent] === undefined) {
    //           allParents[parent] = 1;
    //         }
    //       }
    //       for (let attributeIndex in token.attributes) {
    //         const attribute = token.attributes[attributeIndex];
    //         if (allAttributes[attribute] === undefined) {
    //           allAttributes[attribute] = 1;
    //         }
    //       }
    //       for (let ancientDNAIndex in token.ancientDNA) {
    //         let ancientDNA = token.ancientDNA[ancientDNAIndex];
    //         if (allAncientDNAs[ancientDNA] === undefined) {
    //           allAncientDNAs[ancientDNA] = 1;
    //         }
    //       }
    //     }
    //     state.allTokenIds = Object.keys(state.nftData.tokens).sort(function(a, b) { return a - b; });
    //     state.allParents = Object.keys(allParents).sort();
    //     state.allAttributes = Object.keys(allAttributes).sort();
    //     state.allAncientDNAs = Object.keys(allAncientDNAs).sort();
    //   }
    // },
    // updateSelectedId(state, selectedId) {
    //   state.selectedId = selectedId;
    //   logDebug("nixDataModule", "updateSelectedId('" + JSON.stringify(selectedId) + "')")
    // },
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
    // async loadLibrary(context) {
    //   logDebug("nixDataModule", "actions.loadLibrary()");
    //
    //   // const defaultRegistryEntries = [
    //   //   ["0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922", "0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922", "0xBEEEf7786F0681Dd80651e4F05253dB8C9Fb74d1", "0x00000217d2795F1Da57e392D2a5bC87125BAA38D"],
    //   //   ["0x31385d3520bCED94f77AaE104b406994D8F2168C", null, null, "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"],
    //   //   [2, 1, 2, 2],
    //   //   [1, 1, 1, 1],
    //   // ];
    //
    //   // enum Permission { None, View, ComposeWith, Permission3, Permission4, Permission5, Permission6, Permission7 }
    //   // enum Curation { None, LoadByDefault, DisableView, DisableComposeWith, Curation4, Curation5, Curation6, Curation7 }
    //
    //   // function getEntries() public view returns (address[] memory accounts, address[] memory tokens, Permission[] memory permissions, Curation[] memory curations) {
    //   //     uint length = entries.length();
    //   //     accounts = new address[](length);
    //   //     tokens = new address[](length);
    //   //     permissions = new Permission[](length);
    //   //     curations = new Curation[](length);
    //   //     for (uint i = 0; i < length; i++) {
    //   //         Entries.Entry memory entry = entries.entries[entries.index[i]];
    //   //         accounts[i] = entry.account;
    //   //         tokens[i] = entry.token;
    //   //         permissions[i] = entry.permission;
    //   //         curations[i] = entry.curation;
    //   //     }
    //   // }
    //
    //   // const defaultRegistryEntries = [
    //   //   ["0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922", "0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922", "0x00000217d2795F1Da57e392D2a5bC87125BAA38D", "0x00000217d2795F1Da57e392D2a5bC87125BAA38D"],
    //   //   ["0x31385d3520bCED94f77AaE104b406994D8F2168C", null, null, "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"],
    //   //   [2, 1, 2, 1],
    //   //   [1, 1, 1, 1],
    //   // ];
    //   const defaultRegistryEntries = [
    //     ["0x00000217d2795F1Da57e392D2a5bC87125BAA38D", "0x00000217d2795F1Da57e392D2a5bC87125BAA38D"],
    //     [null, "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"],
    //     [2, 1],
    //     [1, 1],
    //   ];
    //   // logInfo("nixDataModule", "actions.loadLibrary() - defaultRegistryEntries[0].length: " + defaultRegistryEntries[0].length);
    //
    //   const owners = {};
    //   const permissions = {};
    //   const assets = {};
    //   let i;
    //   for (i = 0; i < defaultRegistryEntries[0].length; i++) {
    //     const owner = defaultRegistryEntries[0][i].toLowerCase();
    //     const contract = defaultRegistryEntries[1][i] == null ? null : defaultRegistryEntries[1][i].toLowerCase();
    //     const permission = defaultRegistryEntries[2][i];
    //     const curation = defaultRegistryEntries[3][i];
    //
    //     if (owners[owner] == null) {
    //       owners[owner] = [contract];
    //     } else {
    //       owners[owner].push(contract);
    //     }
    //     permissions[owner + ':' + contract] = { permission: permission, curation: curation };
    //     // logInfo("nixDataModule", "  owner: " + owner + ", contract: " + contract + ", permission: " + permission + ", curation: " + curation);
    //   }
    //   // logInfo("nixDataModule", "actions.loadLibrary() - owners: " + JSON.stringify(owners));
    //   logDebug("nixDataModule", "actions.loadLibrary() - permissions: " + JSON.stringify(permissions));
    //
    //   context.commit('updateAssetsPreparation');
    //   for (const [owner, ownersContracts] of Object.entries(owners)) {
    //     // console.log(owner, ownersContracts);
    //     let hasNull = false;
    //     for (let i = 0; i < ownersContracts.length; i++) {
    //       let contract = ownersContracts[i];
    //       if (contract == null) {
    //         hasNull = true;
    //       }
    //       // console.log(" - " + contract);
    //     }
    //     const PAGESIZE = 50; // Default 20, max 50
    //     const DELAY = 1000; // Millis
    //     const delay = ms => new Promise(res => setTimeout(res, ms));
    //     // Do all
    //     if (hasNull) {
    //       // console.log("Retrieve all by owner %s", owner);
    //       // this.assets = [];
    //       // await delay(DELAY);
    //       let completed = false;
    //       let page = 0;
    //       while (!completed) {
    //         const offset = PAGESIZE * page;
    //         const url = "https://api.opensea.io/api/v1/assets?owner=" + owner + "&order_direction=desc&limit=" + PAGESIZE + "&offset=" + offset;
    //         logDebug("nixDataModule", "actions.loadLibrary() owner url:" + url);
    //         const data = await fetch(url).then(response => response.json());
    //         context.commit('updateAssets', { owner, permissions, data } );
    //         // if (data.assets && data.assets.length > 0) {
    //         //   for (let assetIndex = 0; assetIndex < data.assets.length; assetIndex++) {
    //         //     const asset = data.assets[assetIndex];
    //         //     // permissions[owner + ':' + contract] = { permission: permission, curation: curation };
    //         //     let permission = permissions[asset.owner.address.toLowerCase() + ':' + asset.asset_contract.address.toLowerCase()];
    //         //     if (permission == null) {
    //         //       permission = permissions[asset.owner.address.toLowerCase() + ':' + null];
    //         //     }
    //         //     context.commit('updateAssets', { permission, asset } );
    //         //     // logInfo("nixDataModule", "actions.loadLibrary() - asset(" + (parseInt(offset) + assetIndex) + ") name: " + asset.collection.name + ", slug: " + asset.collection.slug + ", owner: " + asset.owner.address + ", contract: " + asset.asset_contract.address + ", permission: " + JSON.stringify(permission));
    //         //     // assets[asset.owner.address.toLowerCase() + ':' + asset.asset_contract.address.toLowerCase()] = { permission: permission, asset: asset };
    //         //   }
    //         // }
    //         if (!data.assets || data.assets.length < PAGESIZE) {
    //           completed = true;
    //         }
    //         page++;
    //         await delay(DELAY);
    //       }
    //     } else {
    //       // Do individually
    //       for (let i = 0; i < ownersContracts.length; i++) {
    //         const contract = ownersContracts[i];
    //         // console.log("Retrieve all by owner %s contract %s", owner, contract);
    //         let completed = false;
    //         let page = 0;
    //         while (!completed) {
    //           const offset = PAGESIZE * page;
    //           const url = "https://api.opensea.io/api/v1/assets?owner=" + owner + "&asset_contract_address=" + contract + "&order_direction=desc&limit=" + PAGESIZE + "&offset=" + offset;
    //           logInfo("nixDataModule", "actions.loadLibrary() owner and contract url:" + url);
    //           const data = await fetch(url).then(response => response.json());
    //           context.commit('updateAssets', { owner, permissions, data });
    //           // if (data.assets && data.assets.length > 0) {
    //           //   for (let assetIndex = 0; assetIndex < data.assets.length; assetIndex++) {
    //           //     const asset = data.assets[assetIndex];
    //           //     let permission = permissions[asset.owner.address.toLowerCase() + ':' + asset.asset_contract.address.toLowerCase()];
    //           //     if (permission == null) {
    //           //       permission = permissions[asset.owner.address.toLowerCase() + ':' + null];
    //           //     }
    //           //     // logInfo("nixDataModule", "actions.loadLibrary() - asset(" + (parseInt(offset) + assetIndex) + ") name: " + asset.collection.name + ", slug: " + asset.collection.slug + ", owner: " + asset.owner.address + ", contract: " + asset.asset_contract.address + ", permission: " + JSON.stringify(permission));
    //           //     // TODO - Add timestamp, and add routine to remove expired entries
    //           //     // assets[asset.owner.address.toLowerCase() + ':' + asset.asset_contract.address.toLowerCase()] = { permission: permission, asset: asset };
    //           //     context.commit('updateAssets', { permission, asset });
    //           //   }
    //           // }
    //           if (!data.assets || data.assets.length < PAGESIZE) {
    //             completed = true;
    //           }
    //           page++;
    //           await delay(DELAY);
    //         }
    //       }
    //     }
    //     context.commit('updateAssetsCompletion');
    //     // for (const [key, asset] of Object.entries(assets)) {
    //     //   logInfo("nixDataModule", "actions.loadLibrary():" + key + " => " + JSON.stringify(asset).substring(0, 100));
    //     // }
    //   }
    // },
    // updateNFTData(context, nftData) {
    //   // logInfo("nixDataModule", "actions.updateNFTData(" + JSON.stringify(nftData) + ")");
    //   context.commit('updateNFTData', nftData);
    // },
    // updateSelectedId(context, selectedId) {
    //   logInfo("nixDataModule", "actions.updateSelectedId(" + JSON.stringify(selectedId) + ")");
    //   context.commit('updateSelectedId', selectedId);
    // },
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

          var tokensData = [];
          const tokensLength = await nix.tokensLength();
          if (tokensLength > 0) {
            var tokensIndices = [...Array(parseInt(tokensLength)).keys()];
            // console.log("tokensIndices: " + JSON.stringify(tokensIndices));
            const tokens = await nixHelper.getTokens(tokensIndices);
            // console.log("tokens: " + JSON.stringify(tokens));
            for (let i = 0; i < tokens[0].length; i++) {
              const token = tokens[0][i];
              const ordersLength = tokens[1][i];
              const executed = tokens[2][i];
              const volumeToken = tokens[3][i];
              const volumeWeth = tokens[4][i];
              // console.log("token: " + token + ", ordersLength: " + ordersLength + ", executed: " + executed + ", volumeToken: " + volumeToken + ", volumeWeth: " + volumeWeth);
              var ordersData = [];
              var orderIndices = [...Array(parseInt(ordersLength)).keys()];
              const orders = await nixHelper.getOrders(token, orderIndices);
              // console.log("orders: " + JSON.stringify(orders.map((x) => { return x.toString(); })));
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
                ordersData.push({ orderId: i, maker: maker, taker: taker, tokenIds: tokenIds, price: price, buyOrSell: buyOrSell,
                  anyOrAll: anyOrAll, expiry: expiry, tradeCount: tradeCount, tradeMax: tradeMax, royaltyFactor: royaltyFactor,
                  orderStatus: orderStatus });
            //     // console.log("maker: " + maker + ", taker: " + taker + ", tokenIds: " + tokenIds + ", price: " + price +
            //     //   ", buyOrSell: " + BUYORSELLSTRING[buyOrSell] + ", anyOrAll: " + ANYORALLSTRING[anyOrAll] + ", expiryString: " + expiryString +
            //     //   ", tradeCount: " + tradeCount + ", tradeMax: " + tradeMax + ", royaltyFactor: " + royaltyFactor +
            //     //   ", orderStatus: " + ORDERSTATUSSTRING[orderStatus]);
              }
              // console.log("ordersData: " + JSON.stringify(ordersData));
              tokensData.push({ token: token, ordersLength: ordersLength, executed: executed, volumeToken: volumeToken, volumeWeth: volumeWeth, ordersData: ordersData });
            }
            // console.log("tokensData: " + JSON.stringify(tokensData, null, 2));
            // this.tokensData = tokensData;
            commit('updateTokensData', tokensData);
          }


        }


        // const networkChanged = false;
        // const blockChanged = false;
        // const coinbaseChanged = false;
        // if (networkChanged || blockChanged || coinbaseChanged || paramsChanged) {

          // You can also use an ENS name for the contract address
          // const nftAddress = "token.zombiebabies.eth"; // state.nftData.nftAddress;
          // logDebug("nixDataModule", "execWeb3() nftAddress: " + nftAddress);

          // const nftAbi = ERC1155NFTABI;
          // logDebug("nixDataModule", "execWeb3() nftAbi: " + JSON.stringify(nftAbi));

          // // The ERC-20 Contract ABI, which is a common contract interface
          // // for tokens (this is the Human-Readable ABI format)
          // const daiAbi = [
          //   // Some details about the token
          //   "function name() view returns (string)",
          //   "function symbol() view returns (string)",
          //
          //   // Get the account balance
          //   "function balanceOf(address) view returns (uint)",
          //
          //   // Send some of your tokens to someone else
          //   "function transfer(address to, uint amount)",
          //
          //   // An event triggered whenever anyone transfers to someone else
          //   "event Transfer(address indexed from, address indexed to, uint amount)"
          // ];

          // store.getters['connection/coinbase']
          // const name = await store.getters['connection/connection'].provider.lookupAddress(store.getters['connection/coinbase']);
          // logDebug("nixDataModule", "execWeb3() coinbase: " + JSON.stringify(store.getters['connection/coinbase']) + " => " + name);
          //
          // // // const allnames = await ReverseRecords.getNames(['coinbase']);
          // // // logDebug("Connection", "execWeb3() allnames: " + JSON.stringify(allnames));
          // const addresses = [ "0x07fb31ff47Dc15f78C5261EEb3D711fb6eA985D1", "0x000001f568875F378Bf6d170B790967FE429C81A", "0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922"];
          // const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, store.getters['connection/connection'].provider);
          // const allnames = await ensReverseRecordsContract.getNames(addresses);
          // logDebug("nixDataModule", "execWeb3() allnames: " + JSON.stringify(addresses) + " => " + allnames);
          // const validNames = allnames.filter((n) => normalize(n) === n );
          // logDebug("nixDataModule", "execWeb3() validNames: " + JSON.stringify(addresses) + " => " + validNames);
          //
          // const beeeefRegistryContract = new ethers.Contract(BEEEEFREGISTRYENS, BEEEEFREGISTRYABI, store.getters['connection/connection'].provider);
          // const entries = await beeeefRegistryContract.getEntries();
          // logDebug("nixDataModule", "execWeb3() beeeefRegistryContract.entries: " + JSON.stringify(entries));

          // //
          // // // The Contract object
          // const nftContract = new ethers.Contract(nftAddress, nftAbi, store.getters['connection/connection'].provider);
          // // logDebug("nixDataModule", "execWeb3() nftContract: " + JSON.stringify(nftContract));
          //
          // const tokenIds = store.getters['tokens/allTokenIds'];
          // const accounts = [];
          // for (let i = 0; i < tokenIds.length; i++) {
          //   accounts.push(store.getters['connection/coinbase']);
          // }
          // logDebug("nixDataModule", "execWeb3() tokens/allTokenIds: " + JSON.stringify(store.getters['tokens/allTokenIds']));
          //
          // const balanceOfs = await nftContract.balanceOfBatch(accounts, tokenIds);
          // logDebug("nixDataModule", "execWeb3() balanceOfs: " + JSON.stringify(balanceOfs.map((x) => { return x.toString(); })));
          // commit('updateBalances', balanceOfs.map((x) => { return x.toString(); }));
          //
          // const cryptoPunksMarketContract = new ethers.Contract(CRYPTOPUNKMARKETADDRESS, CRYPTOPUNKMARKETABI, store.getters['connection/connection'].provider);
          // const cpBalanceOf = await cryptoPunksMarketContract.balanceOf(store.getters['connection/coinbase']);
          // logDebug("nixDataModule", "execWeb3() cpBalanceOf: " + cpBalanceOf);


        // }
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
