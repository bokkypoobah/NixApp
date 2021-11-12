const Nix = {
  template: `
    <div class="mt-5 pt-3">
      <b-card class="mt-5" header-class="warningheader" header="Web3 Connection And/Or Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>

      <b-card no-body header="Nix" class="border-0" header-class="p-1"  v-if="network && network.chainId == 4">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-card-body class="p-0">

            <div>
              <b-card no-body class="mt-2">
                <b-tabs vertical pills card end nav-class="p-2" active-tab-class="p-2">

                  <b-tab active title="Orders" class="p-1">
                    <b-form-group label-cols="2" label-size="sm" label="">
                      <b-button size="sm" @click="loadInfo" variant="primary">Load Info</b-button>
                    </b-form-group>

                    <div v-for="(tokensDataItem, tokensDataIndex) in tokensData">
                      <b-card body-class="p-0" header-class="m-0 p-0 pl-2" footer-class="p-1" class="m-3 p-0">
                        <template #header>
                          <span variant="secondary" class="small truncate">
                            {{ tokensDataIndex }} ERC-721 NFT Collection <b-link :href="explorer + 'token/' + tokensDataItem.token" target="_blank">{{ tokensDataItem.token }}</b-link> - ordersLength: {{ tokensDataItem.ordersLength }}, executed: {{ tokensDataItem.executed }}, volumeToken: {{ tokensDataItem.volumeToken }}, volumeWeth: {{ tokensDataItem.volumeWeth }}
                          </span>
                        </template>
                        <font size="-2">
                          <b-table small fixed striped sticky-header="200px" :items="tokensDataItem.ordersData" head-variant="light">

                            <template #cell(maker)="data">
                              <b-link :href="explorer + 'address/' + data.item.maker" target="_blank">{{ data.item.maker.substring(0, 10) + '...' }}</b-link>
                              <!--
                              <b-link @click="displayToken(data.item.tokenId)" v-b-popover.hover="'Click for details'">
                                <b-img-lazy width="300%" :src="data.item.images[0]" />
                              </b-link>
                              -->
                            </template>

                          </b-table>
                        </font>

                        <!--
                        {{ tokensDataItem }}
                        <font size="-2">
                          <b-table small fixed striped sticky-header="200px" :fields="categoryFields" :items="getSortedValuesForCategory(categoryKey)" head-variant="light">
                            <template #cell(select)="data">
                              <b-form-checkbox @change="filterChange(categoryKey, data.item.categoryOption)"></b-form-checkbox>
                            </template>
                          </b-table>
                        </font>
                        -->
                      </b-card>


                      <!--

                      <b-link @click="displayToken(item)">
                        <b-avatar rounded="sm" variant="light" size="3.0rem" :src="data[item] ? data[item].images[0] : null" v-b-popover.hover.bottom="'#' + item" class="ml-2"></b-avatar>
                      </b-link>
                      -->
                    </div>

                  </b-tab>

                  <b-tab title="Add Orders" class="p-1">
                    <b-form-group label-cols="2" label-size="sm" label="Token" description="e.g., 0xD000F000Aa1F8accbd5815056Ea32A54777b2Fc4 for TestToadz">
                      <b-form-input size="sm" v-model="order.token" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Taker" description="e.g., 0x12345...">
                      <b-form-input size="sm" v-model="order.taker" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Buy or Sell">
                      <b-form-select size="sm" v-model="order.buyOrSell" :options="buyOrSellOptions" class="w-50"></b-form-select>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Any or All">
                      <b-form-select size="sm" v-model="order.anyOrAll" :options="anyOrAllOptions" class="w-50"></b-form-select>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Token Ids" description="e.g., 1, 2, 3, 4">
                      <b-form-input size="sm" v-model="order.tokenIds" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Price" description="e.g., 0.1 for 0.1 WETH">
                      <b-form-input size="sm" v-model="order.price" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Expiry" description="Unixtime e.g., 1672491599 for 23:59:59 31/12/2022 UTC">
                      <b-form-input size="sm" v-model="order.expiry" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="TradeMax" description="e.g., 5">
                      <b-form-input size="sm" v-model="order.tradeMax" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Royalty Factor" description="0 to 100. e.g., 100">
                      <b-form-input size="sm" v-model="order.royaltyFactor" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="Integrator" description="e.g., 0x2345...">
                      <b-form-input size="sm" v-model="order.integrator" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="2" label-size="sm" label="">
                      <b-button size="sm" @click="addOrder" variant="warning">Add Order</b-button>
                    </b-form-group>

                    <b-card>
                      {{ order }}
                    </b-card>

                  </b-tab>

                  <b-tab title="Orders" class="p-1">
                    <b-card-text>
                    </b-card-text>
                  </b-tab>

                  <b-tab title="Trades" class="p-1">
                  </b-tab>

                </b-tabs>
              </b-card>
            </div>

          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,

      order: {
        token: "0xD000F000Aa1F8accbd5815056Ea32A54777b2Fc4",
        taker: null,
        buyOrSell: 1,
        anyOrAll: 0,
        tokenIds: "2075, 1479, 881, 18",
        price: "0.01",
        expiry: 1672491599,
        tradeMax: "5",
        royaltyFactor: "100",
        integrator: null,
      },

      buyOrSellOptions: [
        { value: 0, text: 'Buy' },
        { value: 1, text: 'Sell' },
      ],
      anyOrAllOptions: [
        { value: 0, text: 'Any' },
        { value: 1, text: 'All' },
      ],

      tokensData: [],
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
    networkName() {
      return store.getters['connection/networkName'];
    },
    accounts() {
      return [ store.getters['connection/coinbase'], "0xBeeef66749B64Afe43Bbc9475635Eb510cFE4922" ];
      // return [ "0x000001f568875F378Bf6d170B790967FE429C81A", "0x00000217d2795F1Da57e392D2a5bC87125BAA38D", "0x000003e1E88A1110E961f135dF8cdEa4b1FFA81a", "0x07fb31ff47Dc15f78C5261EEb3D711fb6eA985D1" ];
    },
  },
  methods: {

    setPowerOn() {
      store.dispatch('connection/setPowerOn', true);
      localStorage.setItem('powerOn', true);
      var t = this;
      setTimeout(function() {
        t.statusSidebar = true;
      }, 1500);
    },

    async loadInfo() {
      event.preventDefault();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const blockNumber = await provider.getBlockNumber();
      console.log("blockNumber: " + blockNumber);
      const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
      const nixHelper = new ethers.Contract(NIXHELPERADDRESS, NIXHELPERABI, provider);
      var tokensData = [];
      const tokensLength = await nix.tokensLength();
      if (tokensLength > 0) {
        var tokensIndices = [...Array(parseInt(tokensLength)).keys()];
        console.log("tokensIndices: " + JSON.stringify(tokensIndices));
        const tokens = await nixHelper.getTokens(tokensIndices);
        console.log("tokens: " + JSON.stringify(tokens));
        for (let i = 0; i < tokens[0].length; i++) {
          const token = tokens[0][i];
          const ordersLength = tokens[1][i];
          const executed = tokens[2][i];
          const volumeToken = tokens[3][i];
          const volumeWeth = tokens[4][i];
          console.log("token: " + token + ", ordersLength: " + ordersLength + ", executed: " + executed + ", volumeToken: " + volumeToken + ", volumeWeth: " + volumeWeth);
          var ordersData = [];
          var orderIndices = [...Array(parseInt(ordersLength)).keys()];
          const orders = await nixHelper.getOrders(token, orderIndices);
          console.log("orders: " + JSON.stringify(orders.map((x) => { return x.toString(); })));
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
            ordersData.push({ maker: maker, taker: taker, tokenIds: tokenIds, price: price, buyOrSell: buyOrSell,
              anyOrAll: anyOrAll, expiry: expiry, tradeCount: tradeCount, tradeMax: tradeMax, royaltyFactor: royaltyFactor,
              orderStatus: orderStatus });
            // console.log("maker: " + maker + ", taker: " + taker + ", tokenIds: " + tokenIds + ", price: " + price +
            //   ", buyOrSell: " + BUYORSELLSTRING[buyOrSell] + ", anyOrAll: " + ANYORALLSTRING[anyOrAll] + ", expiryString: " + expiryString +
            //   ", tradeCount: " + tradeCount + ", tradeMax: " + tradeMax + ", royaltyFactor: " + royaltyFactor +
            //   ", orderStatus: " + ORDERSTATUSSTRING[orderStatus]);
          }
          console.log("ordersData: " + JSON.stringify(ordersData));
          tokensData.push({ token: token, ordersLength: ordersLength, executed: executed, volumeToken: volumeToken, volumeWeth: volumeWeth, ordersData: ordersData });
        }
        console.log("tokensData: " + JSON.stringify(tokensData, null, 2));
        this.tokensData = tokensData;
      }
    },

    addOrder() {
      console.log("addOrder");
      this.$bvModal.msgBoxConfirm('Add Order?', {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
        .then(async value1 => {
          if (value1) {
            event.preventDefault();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
            const nixWithSigner = nix.connect(provider.getSigner());
            const weth = await nix.weth();
            const taker = this.order.taker == null || this.order.taker.trim().length == 0 ? ADDRESS0 : taker;
            const tokenIds = this.order.tokenIds.split(",").map(function(item) { return item.trim(); });
            const price = ethers.utils.parseEther(this.order.price);
            const integrator = this.order.integrator == null || this.order.integrator.trim().length == 0 ? ADDRESS0 : integrator;
            try {
              const tx = await nixWithSigner.addOrder(this.order.token, taker, this.order.buyOrSell, this.order.anyOrAll, tokenIds, price, this.order.expiry, this.order.tradeMax, this.order.royaltyFactor, integrator);
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },


    async timeoutCallback() {
      logDebug("Nix", "timeoutCallback() count: " + this.count);

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
    logDebug("Nix", "beforeDestroy()");
  },
  mounted() {
    logDebug("Nix", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("Nix", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();

    let storedCanvas;
    try {
      storedCanvas = JSON.parse(localStorage.getItem('canvas'));
    } catch (e) {
      storedCanvas = null;
    }
    // logDebug("Nix", "LocalStorage storedCanvas: " + JSON.stringify(storedCanvas));

    logDebug("Nix", "Canvas: " + JSON.stringify(this.canvas));
    if (storedCanvas == null) {
      logDebug("Nix", "Canvas");
      this.canvas = new fabric.Canvas('thecanvas', {
        hoverCursor: 'pointer',
        selection: false,
        targetFindTolerance: 2
      });
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        fill: 'cyan',
        width: 380,
        height: 380
      });
      this.canvas.add(rect);
      const text = new fabric.IText('Tap and Type', {
          left: 100,
          top: 100,
      });
      this.canvas.add(text);
      localStorage.setItem('canvas', JSON.stringify(this.canvas));
      logDebug("Nix", "LocalStorage Canvas: " + JSON.stringify(this.canvas));
    } else {
      this.canvas = new fabric.Canvas('thecanvas', {
        hoverCursor: 'pointer',
        selection: false,
        targetFindTolerance: 2
      });
      const t = this;
      this.canvas.loadFromJSON(storedCanvas, function() {
        // logDebug("Nix", "LocalStorage loadFromJSON: " + JSON.stringify(storedCanvas));
         t.canvas.renderAll();
      },function(o,object){
         // console.log(o,object)
      })
    }
  },
  destroyed() {
    this.reschedule = false;
  },
};

const nixModule = {
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
      logDebug("nixModule", "mutations.setCanvas('" + c + "')")
      state.canvas = c;
    },
    deQueue(state) {
      logDebug("nixModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("nixModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("nixModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    setCanvas(context, c) {
      logDebug("connectionModule", "actions.setCanvas(" + JSON.stringify(c) + ")");
      // context.commit('setCanvas', c);
    },
  },
};
