const Welcome = {
  template: `
    <div class="mt-5 pt-3">

      <b-card no-body header="Welcome" class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">

          <b-card class="my-3" header-class="warningheader" header="Web3 Connection And/Or Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
            <b-card-text>
              Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
            </b-card-text>
          </b-card>

          <b-card-body class="p-0">
            <b-card header="Welcome" class="mb-2">
              <b-card-text>
                <b>Status: WIP</b>
              </b-card-text>
              <b-card-text>
                Welcome to the Nix Decentralised ERC-721 Exchange. Check out the menus on the top right. Click on the top left icon to get back here.
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>How This Works</h5>
                <ul>
                  <li>
                    <b>Makers</b> add orders to buy or sell NFTs in the Nix exchange at <b-link :href="explorer + 'address/' + nixAddress + '#code'" target="_blank">{{ nixAddress.substring(0, 20) + '...' }}</b-link>. (Exchange -> Orders)
                  </li>
                  <li>
                    <b>Takers</b> execute against one or more orders. (Exchange -> Trades)
                  </li>
                  <li>
                    Payments are made in <b-link :href="explorer + 'token/' + wethAddress" target="_blank">WETH</b-link> and are netted, so no fancy flash loans are required for complicated buy/sell bulk trades. The taker pays the <b>netAmount</b> in WETH if negative, or receives if positive.
                  </li>
                  <li>
                    The Nix exchange must be approved to transfer the WETH and/or the NFT. (Tokens -> Approval and WETH -> Approval)
                  </li>
                  <li>
                    The NixHelper contract at <b-link :href="explorer + 'address/' + nixHelperAddress + '#code'" target="_blank">{{ nixHelperAddress.substring(0, 20) + '...' }}</b-link> allows this Web3 UI to retrieve the order and trade information in bulk, via the web3 connection.
                  </li>
                  <li>
                    There are no fees on this exchange.
                  </li>
                  <li>
                    Makers and takers are encouraged to add a tip for this developer (in ETH) when executing Nix transactions.
                  </li>
                  <li>
                    There is a parameter when executing Nix transactions for 3rd party integrators to receive a portion of ETH tips sent by makers and takers.
                  </li>
                  <li>
                    There is no backend server for this application to work. Data retrieval is through the web3 connection, and will take time to update.
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>Order Type Examples</h5>
                (Buy/Sell, Any/All, [tokenIds], price, tradeMax)
                <ul>
                  <li>
                    Buy up to 5 NFTs from a collection for 0.1 WETH each. (Buy, Any, [], 0.1, 5)
                  </li>
                  <li>
                    Buy up to 2 NFTs with tokenIds [1, 2, 3 or 4] from a collection for 0.1 WETH each. (Buy, Any, [1, 2, 3, 4], 0.1, 2)
                  </li>
                  <li>
                    Buy a bundle of NFTs with tokenIds [1, 2, 3 and 4] from a collection for 0.1 WETH in total. (Buy, All, [1, 2, 3, 4], 0.1, 1)
                  </li>
                  <li>
                    Sell any NFT owned by the seller for 0.1 WETH each. (Sell, Any, [], 0.1, 1)
                  </li>
                  <li>
                    Sell up to 2 of NFTs [1, 2, 3, or 4] for 0.1 WETH each. (Sell, Any, [1, 2, 3, 4], 0.1, 2)
                  </li>
                  <li>
                    Sell a bundle of NFTs with tokenIds [1, 2, 3 and 4] from a collection for 0.1 WETH in total. (Sell, All, [1, 2, 3, 4], 0.1, 1)
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>Other Order Details</h5>
                <ul>
                  <li>
                    Orders can only be executed if the <b>expiry</b> is set to 0, or is after than the current time.
                  </li>
                  <li>
                    Orders depend on ownership and approval of the NFTs and WETH, and can become active (and inactive) when these are updated.
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>ERC-721 Token Collection Data Retrieval</h5>
                <ul>
                  <li>
                    The ERC721Helper contract at <b-link :href="explorer + 'address/' + erc721HelperAddress + '#code'" target="_blank">{{ erc721HelperAddress.substring(0, 20) + '...' }}</b-link> allows this Web3 UI to retrieve the token ownership and tokenURI information for ERC-721 NFT collections in bulk, via the web3 connection.
                  </li>
                  <li>
                    The tokenURI information for each tokenId within an NFT collection may have an image and/or traits. This can be parsed and used for displaying and filtering.
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>Royalties</h5>
                <ul>
                  <li>
                    This exchange uses <b-link href="https://royaltyregistry.xyz/lookup" target="_blank">Manifold's Royalty Engine</b-link> at <b-link :href="explorer + 'address/' + nixRoyaltyEngine + '#code'" target="_blank">{{ nixRoyaltyEngine == null ? '' : (nixRoyaltyEngine.substring(0, 20) + '...') }}</b-link> to compute the royalty payments on NFT sales. Note that there can be different royalty payment rates for different tokenIds within the same collection.
                  </li>
                  <li>
                    Deployers of ERC-721 token collection configure the royalty payment information in the <b-link href="https://royaltyregistry.xyz/configure" target="_blank">Royalty Registry</b-link>.
                  </li>
                  <li>
                    Makers specify a <b>royaltyFactor</b> (in percent, 0 to 1000, or 0x to 10x) when adding orders. Takers specify a royaltyFactor when executing against the orders. The NFT seller's royaltyFactor is multiplied by the royalty payments computed by the Royalty Engine. i.e., sellers pay 0x to 10x the royalty payment recommended by the Royalty Engine configuration.
                  </li>
                </ul>
              </b-card-text>

              <b-card-text class="mt-5 mb-2">
                <h5>Calculating NetAmount</h5>
                <ul>
                  <li>
                    As a taker, if you are selling an NFT, you will receive WETH minus any royalty payments. So selling an NFT for 0.1 WETH with a 1% royalty payment and 100% royaltyFactor will result in a netAmount of 0.0099 WETH. 0.0001 WETH will be paid to the collection owner address.
                  </li>
                </ul>
              </b-card-text>

            </b-card>


            <!--
            <div>
              <b-card no-body class="mt-2">
                <b-card header="Transfer Nix Ownership" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="Transfer Nix ownership to" description="e.g. 0x123456...">
                      <b-form-input size="sm" v-model="admin.transferTo" class="w-50"></b-form-input>
                    </b-form-group>
                  </b-card-text>
                  <b-form-group label-cols="3" label-size="sm" label="">
                    <b-button size="sm" @click="transferOwnership" variant="warning">Transfer Ownership</b-button>
                  </b-form-group>
                  <b-form-group label-cols="3" label-size="sm" label="Data">
                    <b-form-textarea size="sm" rows="10" v-model="JSON.stringify(admin, null, 2)" class="w-50"></b-form-textarea>
                  </b-form-group>
                </b-card>
                <b-card header="Withdraw ETH, ERC-20 And ERC-721 Tokens From Nix" class="mb-2">
                  <b-card-text>
                    <b-form-group label-cols="3" label-size="sm" label="Token" description="Blank for ETH, address for ERC-20 or ERC-721. e.g., 0xD000F000Aa1F8accbd5815056Ea32A54777b2Fc4 for TestToadz">
                      <b-form-input size="sm" v-model="admin.token" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="Tokens" description="Tokens in raw format, for ETH and ERC-20. e.g., 3500000000000000000 for 3.5 with 18dp. Set to 0 or null for full balance">
                      <b-form-input size="sm" v-model="admin.tokens" class="w-50"></b-form-input>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="Token Id" description="ERC-721 Token Id. e.g., 3">
                      <b-form-input size="sm" v-model="admin.tokenId" class="w-50"></b-form-input>
                    </b-form-group>
                  </b-card-text>
                  <b-form-group label-cols="3" label-size="sm" label="">
                    <b-button size="sm" @click="withdraw" variant="warning">Withdraw</b-button>
                  </b-form-group>
                  <b-form-group label-cols="3" label-size="sm" label="Data">
                    <b-form-textarea size="sm" rows="10" v-model="JSON.stringify(admin, null, 2)" class="w-50"></b-form-textarea>
                  </b-form-group>
                </b-card>
              </b-card>
            </div>
            -->

          </b-card-body>
        </b-card>
      </b-card>
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
    explorer () {
      return store.getters['connection/explorer'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    network() {
      return store.getters['connection/network'];
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
    erc721HelperAddress() {
      return ERC721HELPERADDRESS;
    },
    wethAddress() {
      return WETHADDRESS;
    },
  },
  methods: {
    async timeoutCallback() {
      logDebug("Welcome", "timeoutCallback() count: " + this.count);

      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 15000);
      }
    },
  },
  beforeDestroy() {
    logDebug("Welcome", "beforeDestroy()");
  },
  mounted() {
    logDebug("Welcome", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("Welcome", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const welcomeModule = {
  namespaced: true,
  state: {
    canvas: null,
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    canvas: state => state.canvas,
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    setCanvas(state, c) {
      logDebug("welcomeModule", "mutations.setCanvas('" + c + "')")
      state.canvas = c;
    },
    deQueue(state) {
      logDebug("welcomeModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("welcomeModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("welcomeModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    setCanvas(context, c) {
      logDebug("connectionModule", "actions.setCanvas(" + JSON.stringify(c) + ")");
      // context.commit('setCanvas', c);
    },
  },
};
