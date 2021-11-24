const Tokens = {
  template: `
    <div class="mt-5 pt-3">
      <b-card class="mt-5" header-class="warningheader" header="Web3 Connection And/Or Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>

      <b-card no-body header="Tokens" class="border-0" header-class="p-1" v-if="network && network.chainId == 4">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-card-body class="p-0">

            <div>
              <b-card no-body class="mt-2">

                <b-tabs vertical pills card end nav-class="p-2" active-tab-class="p-2">

                  <b-tab title="Search OS" class="p-1">
                    <b-form-group label-cols="3" label-size="sm" label="OS ERC-721 Collections">
                      <b-button size="sm" @click="loadOSCollections" variant="primary">Load</b-button>
                    </b-form-group>
                    <b-form-group label-cols="3" label-size="sm" label="Filter">
                      <b-form-input type="text" size="sm" @change="recalculateOSFilter()" v-model.trim="osCollection.filter" debounce="600" placeholder="🔍 0x1234..., Symbol or Name" class="w-50 mb-2"></b-form-input>
                    </b-form-group>
                    <b-card-text>
                      <font size="-2">
                        <b-table small fixed striped sticky-header="1000px" :items="osCollection.filtered" head-variant="light">
                        </b-table>
                      </font>
                    </b-card-text>
                  </b-tab>

                  <b-tab title="TestToadz" class="p-1">
                    <b-card header="TestToadz" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="loadTestToadz" variant="primary">Load</b-button>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Token Address">
                          <b-link :href="explorer + 'token/' + testToadz.address" class="card-link" target="_blank">{{ testToadz.address }}</b-link>
                        </b-form-group>
                        <!--
                        <b-form-group label-cols="3" label-size="sm" label="Supports ERC-721 '0x80ac58cd'">
                          <b-form-input size="sm" readonly v-model="testToadz.supportsERC721" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Supports ERC-721 Metadata '0x5b5e139f'">
                          <b-form-input size="sm" readonly v-model="testToadz.supportsERC721METADATA" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Supports ERC-721 Enumerable '0x780e9d63'">
                          <b-form-input size="sm" readonly v-model="testToadz.supportsERC721ENUMERABLE" class="w-50"></b-form-input>
                        </b-form-group>
                        -->
                        <b-form-group label-cols="3" label-size="sm" label="Symbol">
                          <b-form-input size="sm" readonly v-model="testToadz.symbol" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Name">
                          <b-form-input size="sm" readonly v-model="testToadz.name" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Balance">
                          <b-form-input size="sm" readonly v-model="testToadz.balance" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Approved To Nix For Trading">
                          <b-form-input size="sm" readonly v-model="testToadz.approvedToNix" class="w-50"></b-form-input>
                        </b-form-group>
                      </b-card-text>
                      <b-card-text>
                        <font size="-2">
                          <b-table small fixed striped sticky-header="1000px" :fields="testToadzFields" :items="testToadz.owners" head-variant="light">
                            <template #cell(tokenURI)="data">
                              {{ testToadz.tokenURIs[data.item.tokenId] || '(none)' }}
                            </template>
                            <template #cell(image)="data">
                              <div v-if="testToadz.osData[data.item.tokenId]">
                                <b-img-lazy :width="'100%'" :src="testToadz.osData[data.item.tokenId].image" />
                              </div>
                            </template>
                            <template #cell(traits)="data">
                              <div v-if="testToadz.osData[data.item.tokenId]">
                                <b-row v-for="(attribute, i) in testToadz.osData[data.item.tokenId].traits"  v-bind:key="i" class="m-0 p-0">
                                  <b-col cols="3" class="m-0 p-0"><font size="-3">{{ attribute.trait_type }}</font></b-col><b-col class="m-0 p-0"><b><font size="-2">{{ attribute.value }}</font></b></b-col>
                                </b-row>
                              </div>
                            </template>
                          </b-table>
                        </font>
                      </b-card-text>
                    </b-card>

                    <b-card header="Check TestToadz Royalties" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="TokenId" description="e.g., 123">
                          <b-form-input size="sm" v-model="testToadz.royaltyTokenId" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Sale amount" description="In WETH. e.g., 0.456">
                          <b-form-input size="sm" v-model="testToadz.royaltyAmount" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="checkTestToadzRoyalty" variant="primary">Check</b-button>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Nix RoyaltyEngine">
                          <div v-if="testToadz.nixRoyaltyEngine">
                            <b-link :href="explorer + 'address/' + testToadz.nixRoyaltyEngine" class="card-link" target="_blank">{{ testToadz.nixRoyaltyEngine }}</b-link>
                          </div>
                          <div v-else>
                            Click Check for address
                          </div>
                        </b-form-group>
                        <font size="-2">
                          <b-table small fixed striped sticky-header="1000px" :items="testToadz.royaltyPayments" head-variant="light">
                            <template #cell(payTo)="data">
                              <b-link :href="explorer + 'token/' + weth.address + '?a=' + data.item.payTo" class="card-link" target="_blank">{{ data.item.payTo }}</b-link>
                            </template>
                            <template #cell(payAmount)="data">
                              {{ formatETH(data.item.payAmount) }}
                            </template>
                          </b-table>
                        </font>
                      </b-card-text>
                    </b-card>

                    <b-card header="Mint TestToadz" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="Number to mint" description="Up to 3 at a time. 20 max can be minted per account">
                          <b-form-input size="sm" v-model="testToadz.mintNumber" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="mintTestToadz" variant="warning">Mint</b-button>
                        </b-form-group>
                        <b-form-group v-if="testToadz.mintMessage && testToadz.mintMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-textarea size="sm" rows="10" v-model="testToadz.mintMessage" class="w-50"></b-form-textarea>
                        </b-form-group>
                        <b-form-group v-if="testToadz.mintMessage && testToadz.mintMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + testToadz.mintMessage" class="card-link" target="_blank">{{ testToadz.mintMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

                    <b-card header="Approve TestToadz or Revoke TestToadz Approval To Nix For Trading" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="approveTestToadzToNix(true)" variant="warning">Approve</b-button>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="approveTestToadzToNix(false)" variant="warning">Revoke Approval</b-button>
                        </b-form-group>
                        <b-form-group v-if="testToadz.approvalMessage && testToadz.approvalMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-textarea size="sm" rows="10" v-model="testToadz.approvalMessage" class="w-50"></b-form-textarea>
                        </b-form-group>
                        <b-form-group v-if="testToadz.approvalMessage && testToadz.approvalMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + testToadz.approvalMessage" class="card-link" target="_blank">{{ testToadz.approvalMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>
                  </b-tab>

                  <!--
                  <b-tab title="Approvals" class="p-1">
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="checkApprovals" variant="primary">Check</b-button>
                    </b-form-group>
                  </b-tab>
                  -->
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

      osCollection: {
        data: [],
        filter: null,
        filtered: [],
      },

      testToadz: {
        address: TESTTOADZADDRESS,
        supportsERC721: null,
        supportsERC721METADATA: null,
        supportsERC721ENUMERABLE: null,
        symbol: null,
        name: null,
        balance: null,
        nixRoyaltyEngine: null,
        royaltyTokenId: null,
        royaltyAmount: null,
        royaltyPayments: [],
        approvedToNix: null,
        approvalMessage: null,
        mintNumber: null,
        mintMessage: null,
        owners: [],
        tokenURIs: {},
        osData: {},
      },

      testToadzFields: [
        { key: 'tokenId', label: 'Token Id', sortable: true },
        { key: 'owner', label: 'Owner', sortable: true },
        // { key: 'tokenURI', label: 'TokenURI', sortable: true },
        { key: 'image', label: 'Image', sortable: true },
        { key: 'traits', label: 'Traits', sortable: true },
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
    tokensData() {
      return store.getters['nixData/tokensData'];
    },
    tradeData() {
      return store.getters['nixData/tradeData'];
    },
    osCollectionFiltered() {
      if (this.osCollection.filter && this.osCollection.filter.length > 0) {
        const results = [];
        const filter = this.osCollection.filter.toLowerCase();
        for (const item of this.osCollection.data) {
          // console.log(JSON.stringify(item));
          const address = item.address.toLowerCase();
          const symbol = item.symbol.toLowerCase();
          const name = item.symbol.toLowerCase();
          if (address.includes(filter) || symbol.includes(filter) || name.includes(filter)) {
            results.push(item);
          }
        }
        return results;
      } else {
        return this.osCollection.data;
      }

      // let stage5Data = stage4Data;
      // if (this.settings.searchAccount != null && this.settings.searchAccount.length > 0) {
      //   const searchAccounts = this.settings.searchAccount.split(",");
      //   stage5Data = [];
      //   for (let i in stage4Data) {
      //     const d = stage4Data[i];
      //     const owner = this.owners[d.tokenId] ? this.owners[d.tokenId].toLowerCase() : null;
      //     const ensName = owner == null ? null : this.ensMap[owner];
      //     for (searchAccount of searchAccounts) {
      //       const s = searchAccount.toLowerCase();
      //       if (owner != null && owner.includes(s)) {
      //         stage5Data.push(d);
      //         break;
      //       } else if (ensName != null && ensName.includes(s)) {
      //         stage5Data.push(d);
      //         break;
      //       }
      //     }
      //   }
      // }
      // console.log("stage5Data.length: " + stage5Data.length);


      // return this.osCollection.data;
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
    formatBuyOrSell(buyOrSell) {
      return BUYORSELLSTRING[buyOrSell];
    },
    formatAnyOrAll(anyOrAll) {
      return ANYORALLSTRING[anyOrAll];
    },
    formatOrderStatus(orderStatus) {
      return ORDERSTATUSSTRING[orderStatus];
    },
    formatDate(d) {
      if (d == 0) {
        return "(no expiry)";
      } else {
        if (new RegExp('^[0-9]+$').test(d)) {
          return new Date(parseInt(d) * 1000).toISOString(); // .substring(4);
        } else {
          return new Date(d).toDateString().substring(4);
        }
      }
    },

    async recalculateOSFilter() {
      let results = [];
      if (this.osCollection.filter && this.osCollection.filter.length > 0) {
        const filter = this.osCollection.filter.toLowerCase();
        for (const item of this.osCollection.data) {
          const address = item.address.toLowerCase();
          const symbol = item.symbol.toLowerCase();
          const name = item.symbol.toLowerCase();
          if (address.includes(filter) || symbol.includes(filter) || name.includes(filter)) {
            results.push(item);
          }
        }
      } else {
        results = this.osCollection.data;
      }
      this.osCollection.filtered = results;
    },

    async loadOSCollections() {
      console.log("loadOSCollections");
      const BATCHSIZE = 300; // Max 30
      const DELAYINMILLIS = 500;
      const delay = ms => new Promise(res => setTimeout(res, ms));

      let offset = 0;
      let done = false;
      const osCollectionData = [];
      while (!done) {
        try {
          let url = "https://testnets-api.opensea.io/api/v1/collections?offset=" + offset + "\&limit=" + BATCHSIZE;
          console.log("Processing " + offset + ": " + url);
          const data = await fetch(url).then(response => response.json());
          if (data && data.collections && data.collections.length > 0) {
            // console.log("data: " + JSON.stringify(data.collections.length));
            for (let i = 0; i < data.collections.length; i++) {
              const collection = data.collections[i];
              const info = collection.primary_asset_contracts.length > 0 ? collection.primary_asset_contracts[0] : null;
              if (info && info.schema_name == 'ERC721') {
                console.log((offset + i) + " " + info.address + " " + info.symbol + " " + info.name + " " + info.schema_name);
                osCollectionData.push({ address: info.address, symbol: info.symbol, name: info.name, total_supply: info.total_supply });
              }
            }
            this.osCollection.data = osCollectionData;
            this.recalculateOSFilter();
            await delay(DELAYINMILLIS);
          } else {
            done = true;
          }
          offset = offset + BATCHSIZE;
        } catch (e) {
          done = true;
        }
      }
      this.osCollection.data = osCollectionData;

      // const osData = {};
      // for (let i = 0; i < tokenIds.length; i += BATCHSIZE) {
      //   let url = "https://testnets-api.opensea.io/api/v1/assets?asset_contract_address=" + TESTTOADZADDRESS + "\&order_direction=desc\&limit=50\&offset=0";
      //   for (let j = i; j < i + BATCHSIZE && j < tokenIds.length; j++) {
      //     url = url + "&token_ids=" + tokenIds[j];
      //   }
      //   console.log("url: " + url);
      //   const data = await fetch(url).then(response => response.json());
      //   // console.log("data: " + JSON.stringify(data));
      //   if (data.assets && data.assets.length > 0) {
      //   //   this.settings.contract.loadingOSData += data.assets.length;
      //     for (let assetIndex = 0; assetIndex < data.assets.length; assetIndex++) {
      //       const asset = data.assets[assetIndex];
      //       // console.log("asset: " + JSON.stringify(asset));
      //       // console.log("asset - token_id: " + asset.token_id + ", image_url: " + asset.image_url + ", traits: " + JSON.stringify(asset.traits));
      //   //     records.push({ contract: contract, tokenId: asset.token_id, asset: asset, timestamp: timestamp });
      //       osData[asset.token_id] = { image: asset.image_url, traits: asset.traits };
      //     }
      //   }
      //   await delay(DELAYINMILLIS);
      // }
      // this.testToadz.osData = osData;
      // console.log("osData: " + JSON.stringify(osData));
    },

    async loadTestToadz() {
      event.preventDefault();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc721Helper = new ethers.Contract(ERC721HELPERADDRESS, ERC721HELPERABI, provider);
      console.log("Start: " + new Date().toString());
      const tokenInfo = await erc721Helper.tokenInfo([TESTTOADZADDRESS]);
      // console.log(JSON.stringify(tokenInfo, null, 2));
      const totalSupply = 6969; // TestToadz
      var tokensIndices = [...Array(parseInt(totalSupply)).keys()];
      const ownersInfo = await erc721Helper.ownersByTokenIds(TESTTOADZADDRESS, tokensIndices);
      const owners = [];
      const tokenIds = [];
      const ownerRecords = [];
      const timestamp = parseInt(new Date() / 1000);
      for (let i = 0; i < ownersInfo[0].length; i++) {
        if (ownersInfo[0][i]) {
          console.log(ownersInfo[1][i]);
          owners.push({ tokenId: tokensIndices[i], owner: ownersInfo[1][i] });
          tokenIds.push(tokensIndices[i]);
          ownerRecords.push({ chainId: this.network.chainId, contract: TESTTOADZADDRESS, tokenId: tokensIndices[i], owner: ownersInfo[1][i], timestamp: timestamp });
        }
      }
      console.log("End: " + new Date().toString());
      // console.log(JSON.stringify(owners, null, 2));
      console.log(JSON.stringify(ownerRecords, null, 2));
      this.testToadz.owners = owners;

      const tokenURIsInfo = await erc721Helper.tokenURIsByTokenIds(TESTTOADZADDRESS, tokenIds);
      console.log(JSON.stringify(tokenURIsInfo, null, 2));
      const tokenURIRecords = [];
      const tokenURIs = {};
      for (let i = 0; i < tokenURIsInfo[0].length; i++) {
        if (tokenURIsInfo[0][i]) {
          console.log(tokenURIsInfo[1][i]);
          tokenURIRecords.push({ chainId: this.network.chainId, contract: TESTTOADZADDRESS, tokenId: tokenIds[i], tokenURI: tokenURIsInfo[1][i], timestamp: timestamp });
          tokenURIs[tokenIds[i]] = tokenURIsInfo[1][i];
        }
      }
      this.testToadz.tokenURIs = tokenURIs;

      const BATCHSIZE = 30; // Max 30
      const DELAYINMILLIS = 100;
      const delay = ms => new Promise(res => setTimeout(res, ms));
      const osData = {};
      for (let i = 0; i < tokenIds.length; i += BATCHSIZE) {
        let url = "https://testnets-api.opensea.io/api/v1/assets?asset_contract_address=" + TESTTOADZADDRESS + "\&order_direction=desc\&limit=50\&offset=0";
        for (let j = i; j < i + BATCHSIZE && j < tokenIds.length; j++) {
          url = url + "&token_ids=" + tokenIds[j];
        }
        console.log("url: " + url);
        const data = await fetch(url).then(response => response.json());
        // console.log("data: " + JSON.stringify(data));
        if (data.assets && data.assets.length > 0) {
        //   this.settings.contract.loadingOSData += data.assets.length;
          for (let assetIndex = 0; assetIndex < data.assets.length; assetIndex++) {
            const asset = data.assets[assetIndex];
            // console.log("asset: " + JSON.stringify(asset));
            // console.log("asset - token_id: " + asset.token_id + ", image_url: " + asset.image_url + ", traits: " + JSON.stringify(asset.traits));
        //     records.push({ contract: contract, tokenId: asset.token_id, asset: asset, timestamp: timestamp });
            osData[asset.token_id] = { image: asset.image_url, traits: asset.traits };
          }
        }
        await delay(DELAYINMILLIS);
      }
      this.testToadz.osData = osData;
      console.log("osData: " + JSON.stringify(osData));


      var db0 = new Dexie("NixDB");
      db0.version(1).stores({
        // nftData: '&tokenId,asset,timestamp',
        owners: '[chainId+contract+tokenId],chainId,contract,tokenId,owner,timestamp',
        tokenURIs: '[chainId+contract+tokenId],chainId,contract,tokenId,tokenURI,timestamp',
      });
      await db0.owners.bulkPut(ownerRecords).then (function(){
      }).catch(function(error) {
        console.log("error: " + error);
      });
      await db0.tokenURIs.bulkPut(tokenURIRecords).then (function(){
      }).catch(function(error) {
        console.log("error: " + error);
      });

      console.log("chainId: " + this.network.chainId);

      const testToadz = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);
      this.testToadz.supportsERC721 = (await testToadz.supportsInterface(ERC721_INTERFACE)).toString();
      this.testToadz.supportsERC721METADATA = (await testToadz.supportsInterface(ERC721METADATA_INTERFACE)).toString();
      this.testToadz.supportsERC721ENUMERABLE = (await testToadz.supportsInterface(ERC721ENUMERABLE_INTERFACE)).toString();
      this.testToadz.symbol = (await testToadz.symbol()).toString();
      this.testToadz.name = (await testToadz.name()).toString();
      this.testToadz.balance = (await testToadz.balanceOf(this.coinbase)).toString();
      this.testToadz.approvedToNix = (await testToadz.isApprovedForAll(this.coinbase, NIXADDRESS)).toString();
    },

    async checkTestToadzRoyalty() {
      event.preventDefault();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const nix = new ethers.Contract(NIXADDRESS, NIXABI, provider);
      const nixRoyaltyEngine = await nix.royaltyEngine();
      this.testToadz.nixRoyaltyEngine = nixRoyaltyEngine;
      const royaltyEngine = new ethers.Contract(nixRoyaltyEngine, ROYALTYENGINEABI, provider);
      const royaltyPayments = [];
      try {
        const results = await royaltyEngine.getRoyaltyView(TESTTOADZADDRESS, this.testToadz.royaltyTokenId, ethers.utils.parseEther(this.testToadz.royaltyAmount));
        for (let i = 0; i < results[0].length; i++) {
          royaltyPayments.push({ payTo: results[0][i], payAmount: results[1][i] });
        }
      } catch (e) {
        royaltyPayments.push({ payTo: "Error", payAmount: "Error" });
      }
      this.testToadz.royaltyPayments = royaltyPayments;
    },

    approveTestToadzToNix(approved) {
      console.log("approveTestToadzToNix(" + approved + ")");
      this.$bvModal.msgBoxConfirm(approved ? 'Approve TestToadz for Nix trading?' : 'Revoke TestToadz approval for Nix trading?', {
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
            const testToadz = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);
            const testToadzSigner = testToadz.connect(provider.getSigner());
            try {
              const tx = await testToadzSigner.setApprovalForAll(NIXADDRESS, approved);
              this.testToadz.approvalMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.testToadz.approvalMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    mintTestToadz() {
      console.log("mintTestToadz()");
      this.$bvModal.msgBoxConfirm('Mint ' + this.testToadz.mintNumber + ' TestToadz?', {
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
            const testToadz = new ethers.Contract(TESTTOADZADDRESS, TESTTOADZABI, provider);
            const testToadzSigner = testToadz.connect(provider.getSigner());
            try {
              const tx = await testToadzSigner.mint(this.testToadz.mintNumber);
              this.testToadz.mintMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.testToadz.mintMessage = e.message.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    async timeoutCallback() {
      logDebug("Tokens", "timeoutCallback() count: " + this.count);

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
    logDebug("Tokens", "beforeDestroy()");
  },
  mounted() {
    logDebug("Tokens", "mounted() $route: " + JSON.stringify(this.$route.params));
    this.reschedule = true;
    logDebug("Tokens", "Calling timeoutCallback()");
    this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const tokensModule = {
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
      logDebug("tokensModule", "mutations.setCanvas('" + c + "')")
      state.canvas = c;
    },
    deQueue(state) {
      logDebug("tokensModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("tokensModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("tokensModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
    setCanvas(context, c) {
      logDebug("connectionModule", "actions.setCanvas(" + JSON.stringify(c) + ")");
      // context.commit('setCanvas', c);
    },
  },
};
