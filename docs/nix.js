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

                  <b-tab active title="Add Orders" class="p-1">
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

                      <!--
                      <b-form-group label-cols="2" label-size="sm" label="Width" description="24 to 2048">
                        <b-input-group>
                          <template #prepend>
                            <b-form-input type="text" @change="setCanvasSize()" v-model.trim="canvasSetting.width" class="w-100 mr-2"></b-form-input>
                            <b-input-group-text>24</b-input-group-text>
                          </template>
                          <b-form-input @change="setCanvasSize()" v-model="canvasSetting.width" type="range" min="24" max="2048" class="w-25"></b-form-input>
                          <template #append>
                            <b-input-group-text>2048</b-input-group-text>
                          </template>
                        </b-input-group>
                      </b-form-group>

                      <b-form-group label-cols="2" label-size="sm" label="Height" description="24 to 2048">
                        <b-input-group>
                          <template #prepend>
                            <b-form-input type="text" @change="setCanvasSize()" v-model.trim="canvasSetting.height" class="w-100 mr-2"></b-form-input>
                            <b-input-group-text>24</b-input-group-text>
                          </template>
                          <b-form-input @change="setCanvasSize()" v-model="canvasSetting.height" type="range" min="24" max="2048" class="w-25"></b-form-input>
                          <template #append>
                            <b-input-group-text>2048</b-input-group-text>
                          </template>
                        </b-input-group>
                      </b-form-group>

                      <b-form-group label-cols="2" label-size="sm" description="To be implemented. Please use your OS print screen buttons">
                        <b-button disabled size="sm" @click="saveImage()" v-b-popover.hover="'Not working yet. Please use your OS print screen buttons'" variant="info">Save Image</b-button>
                      </b-form-group>
                      -->
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
        buyOrSell: 0,
        anyOrAll: 0,
        tokenIds: "1, 2, 3, 4",
        price: "1000000000000000000",
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
            console.log("addOrder 1");
            event.preventDefault();
          //   console.log("EXEC setMetaData: " + tokenId + this.metadatas[tokenId]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log("addOrder 2");
            const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
            console.log("addOrder 3");
            const nixWithSigner = nix.connect(provider.getSigner());
            console.log("addOrder 4");
            const weth = await nix.weth();
            console.log("weth: " + weth);


            // order: {
            //   token: "0x66fa96804A82034Dd7C44aF5376eEd7207861efd",
            //   taker: null,
            //   buyOrSell: 0,
            //   anyOrAll: 0,
            //   tokenIds: "1, 2, 3, 4",
            //   price: "0.01",
            //   expiry: "1d",
            //   tradeMax: "5",
            //   royaltyFactor: "100",
            //   integrator: null,
            // },

            const taker = this.order.taker == null || this.order.taker.trim().length == 0 ? ADDRESS0 : taker;
            console.log("taker: " + taker);

            const tokenIds = this.order.tokenIds.split(",").map(function(item) { return item.trim(); });
            console.log("tokenIds: " + JSON.stringify(tokenIds));

            const integrator = this.order.integrator == null || this.order.integrator.trim().length == 0 ? ADDRESS0 : integrator;
            console.log("integrator: " + integrator);

            try {
              const tx = await nixWithSigner.addOrder(this.order.token, taker, this.order.buyOrSell, this.order.anyOrAll, tokenIds, this.order.price, this.order.expiry, this.order.tradeMax, this.order.royaltyFactor, integrator);
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              console.log("error: " + e.toString());
            }
          //   const yourBastardYourCall = new ethers.Contract(YOURBASTARDYOURCALLADDRESS, YOURBASTARDYOURCALLABI, provider);
          //   const yourBastardYourCallWithSigner = yourBastardYourCall.connect(provider.getSigner());
          //   const tx = await yourBastardYourCallWithSigner.setLicenseForBASTARD(2, tokenId, this.metadatas[tokenId]);
          //   console.log("EXEC setMetaData - yourBastardYourCall - tx: " + JSON.stringify(tx));
          //   // this.$bvModal.msgBoxOk("TRANSACTION HASH: " + tx)
          //   //   .then(value1 => {
          //   //     event.preventDefault();
          //   //   })
          //   //   .catch(err => {
          //   //     // An error occurred
          //   //   });
          //   // function setLicenseForBASTARD(uint8 _version, uint _id, string memory _text) external {
          //   // console.log("EXEC setMetaData - yourBastardYourCall: " + JSON.stringify(yourBastardYourCall));

          // function addOrder(
          //     address token,
          //     address taker,
          //     BuyOrSell buyOrSell,
          //     AnyOrAll anyOrAll,
          //     uint[] memory tokenIds,
          //     uint price,
          //     uint expiry,
          //     uint tradeMax,
          //     uint royaltyFactor,
          //     address integrator
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
