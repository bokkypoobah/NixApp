const Nix = {
  template: `
    <div class="mt-5 pt-3">
      <b-card class="mt-5" header-class="warningheader" header="Web3 Connection And/Or Incorrect Network Detected" v-if="!powerOn || network == null || network.chainId != 4">
        <b-card-text>
          Please install the MetaMask extension, connect to the Rinkeby network and refresh this page. Then click the [Power] button on the top right.
        </b-card-text>
      </b-card>

      <b-card no-body header="Nix" class="border-0" header-class="p-1" v-if="network && network.chainId == 4">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-card-body class="p-0">

            <div>
              <b-card no-body class="mt-2">

                <!--
                <b-form-group label-cols="3" label-size="sm" label="" class="my-3">
                  <b-button size="sm" @click="testIt" variant="primary">TestIt</b-button>
                </b-form-group>
                -->

                <b-tabs vertical pills card end nav-class="p-2" active-tab-class="p-2">

                  <b-tab active title="Orders" class="p-1">
                    <!--
                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="loadInfo" variant="primary">Load Info</b-button>
                    </b-form-group>
                    -->

                    <div v-if="!tokensData || tokensData.length == 0">
                      <b-card>
                        <b-card-text>
                          Loading orders
                        </b-card-text>
                      </b-card>
                    </div>
                    <div v-for="(tokensDataItem, tokensDataIndex) in tokensData">
                      <b-card body-class="p-0" header-class="m-0 p-0 pl-2" footer-class="p-1" class="m-3 p-0">
                        <template #header>
                          <span variant="secondary" class="small truncate">
                            {{ tokensDataIndex }} ERC-721 NFT Collection <b-link :href="explorer + 'token/' + tokensDataItem.token" target="_blank">{{ tokensDataItem.token }}</b-link> - ordersLength: {{ tokensDataItem.ordersLength }}, executed: {{ tokensDataItem.executed }}, volumeToken: {{ tokensDataItem.volumeToken }}, volumeWeth: {{ tokensDataItem.volumeWeth }}
                          </span>
                        </template>
                        <font size="-2">
                          <b-table small fixed striped sticky-header="200px" :items="tokensDataItem.ordersData" head-variant="light" show-empty>

                            <template #cell(maker)="data">
                              <b-link :href="explorer + 'address/' + data.item.maker" target="_blank">{{ data.item.maker.substring(0, 10) + '...' }}</b-link>
                              <!--
                              <b-link @click="displayToken(data.item.tokenId)" v-b-popover.hover="'Click for details'">
                                <b-img-lazy width="300%" :src="data.item.images[0]" />
                              </b-link>
                              -->
                            </template>
                            <template #cell(taker)="data">
                              <b-link :href="explorer + 'address/' + data.item.taker" target="_blank">{{ data.item.taker.substring(0, 10) + '...' }}</b-link>
                            </template>
                            <template #cell(tokenIds)="data">
                              {{ JSON.stringify(data.item.tokenIds.map((x) => { return x.toString(); })) }}
                            </template>
                            <template #cell(price)="data">
                              {{ formatETH(data.item.price) }}
                            </template>
                            <template #cell(buyOrSell)="data">
                              {{ formatBuyOrSell(data.item.buyOrSell) }}
                            </template>
                            <template #cell(anyOrAll)="data">
                              {{ formatAnyOrAll(data.item.anyOrAll) }}
                            </template>
                            <template #cell(expiry)="data">
                              {{ formatDate(data.item.expiry) }}
                            </template>
                            <template #cell(royaltyFactor)="data">
                              {{ data.item.royaltyFactor.toString() }}
                            </template>
                            <template #cell(orderStatus)="data">
                              {{ formatOrderStatus(data.item.orderStatus) }}
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


                  <b-tab title="(W)ETH" class="p-1">
                    <b-card header="Balances" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="checkWeth" variant="primary">Check</b-button>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="Account">
                          <b-link :href="explorer + 'address/' + coinbase" class="card-link" target="_blank">{{ coinbase }}</b-link>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="ETH Balance">
                          <b-form-input size="sm" readonly v-model="weth.ethBalance" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="WETH Address">
                          <b-link :href="explorer + 'address/' + weth.address + '#code'" class="card-link" target="_blank">{{ weth.address }}</b-link>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="WETH Balance">
                          <b-form-input size="sm" readonly v-model="weth.wethBalance" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="WETH Allowance To Nix">
                          <b-form-input size="sm" readonly v-model="weth.wethAllowanceToNix" class="w-50"></b-form-input>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

                    <b-card header="Wrap ETH To WETH" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="ETH to wrap" description="e.g. 0.123456789">
                          <b-form-input size="sm" v-model="weth.ethToWrap" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="wrapEth" variant="warning">Wrap</b-button>
                        </b-form-group>
                        <b-form-group v-if="weth.wrapMessage && weth.wrapMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-input size="sm" readonly v-model="weth.wrapMessage" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group v-if="weth.wrapMessage && weth.wrapMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + weth.wrapMessage" class="card-link" target="_blank">{{ weth.wrapMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

                    <b-card header="Unwrap WETH To ETH" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="WETH to unwrap" description="e.g. 0.123456789">
                          <b-form-input size="sm" v-model="weth.wethToUnwrap" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="unwrapWeth" variant="warning">Unwrap</b-button>
                        </b-form-group>
                        <b-form-group v-if="weth.unwrapMessage && weth.unwrapMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-input size="sm" readonly v-model="weth.unwrapMessage" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group v-if="weth.unwrapMessage && weth.unwrapMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + weth.unwrapMessage" class="card-link" target="_blank">{{ weth.unwrapMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

                    <b-card header="Approve WETH Allowance For Nix To Spend" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="WETH to approve to Nix" description="e.g. 0.123456789">
                          <b-form-input size="sm" v-model="weth.wethToApproveToNix" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="approveWeth" variant="warning">Approve</b-button>
                        </b-form-group>
                        <b-form-group v-if="weth.approvalMessage && weth.approvalMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-input size="sm" readonly v-model="weth.approvalMessage" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group v-if="weth.approvalMessage && weth.approvalMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + weth.approvalMessage" class="card-link" target="_blank">{{ weth.approvalMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

                    <b-card header="Transfer WETH" class="mb-2">
                      <b-card-text>
                        <b-form-group label-cols="3" label-size="sm" label="Transfer WETH to" description="e.g. 0x123456...">
                          <b-form-input size="sm" v-model="weth.transferTo" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="WETH to approve to Nix" description="e.g. 0.123456789">
                          <b-form-input size="sm" v-model="weth.transferAmount" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="3" label-size="sm" label="">
                          <b-button size="sm" @click="transferWeth" variant="warning">Transfer</b-button>
                        </b-form-group>
                        <b-form-group v-if="weth.transferMessage && weth.transferMessage.substring(0, 2) != '0x'" label-cols="3" label-size="sm" label="">
                          <b-form-input size="sm" readonly v-model="weth.transferMessage" class="w-50"></b-form-input>
                        </b-form-group>
                        <b-form-group v-if="weth.transferMessage && weth.transferMessage.substring(0, 2) == '0x'" label-cols="3" label-size="sm" label="">
                          Tx <b-link :href="explorer + 'tx/' + weth.transferMessage" class="card-link" target="_blank">{{ weth.transferMessage }}</b-link>
                        </b-form-group>
                      </b-card-text>
                    </b-card>

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
                          <b-form-input size="sm" readonly v-model="testToadz.mintMessage" class="w-50"></b-form-input>
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
                          <b-form-input size="sm" readonly v-model="testToadz.approvalMessage" class="w-50"></b-form-input>
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


                  <b-tab title="Add Orders" class="p-1">
                    <b-form-group label-cols="3" label-size="sm" label="Token" description="e.g., 0xD000F000Aa1F8accbd5815056Ea32A54777b2Fc4 for TestToadz">
                      <b-form-input size="sm" v-model="order.token" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Taker" description="e.g., 0x12345...">
                      <b-form-input size="sm" v-model="order.taker" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Buy or Sell">
                      <b-form-select size="sm" v-model="order.buyOrSell" :options="buyOrSellOptions" class="w-50"></b-form-select>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Any or All">
                      <b-form-select size="sm" v-model="order.anyOrAll" :options="anyOrAllOptions" class="w-50"></b-form-select>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Token Ids" description="e.g., 1, 2, 3, 4">
                      <b-form-input size="sm" v-model="order.tokenIds" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Price" description="e.g., 0.1 for 0.1 WETH">
                      <b-form-input size="sm" v-model="order.price" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Expiry" description="Unixtime e.g., 1672491599 for 23:59:59 31/12/2022 UTC">
                      <b-form-input size="sm" v-model="order.expiry" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="TradeMax" description="e.g., 5">
                      <b-form-input size="sm" v-model="order.tradeMax" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Royalty Factor" description="0 to 100. e.g., 100">
                      <b-form-input size="sm" v-model="order.royaltyFactor" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="Integrator" description="e.g., 0x2345...">
                      <b-form-input size="sm" v-model="order.integrator" class="w-50"></b-form-input>
                    </b-form-group>

                    <b-form-group label-cols="3" label-size="sm" label="">
                      <b-button size="sm" @click="addOrder" variant="warning">Add Order</b-button>
                    </b-form-group>

                    <b-card>
                      {{ order }}
                    </b-card>

                  </b-tab>

                  <b-tab title="Execute Orders" class="p-1">
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

      weth: {
        ethBalance: null,
        address: WETHADDRESS,
        wethBalance: null,
        wethAllowanceToNix: null,
        ethToWrap: null,
        wrapMessage: null,
        wethToUnwrap: null,
        unwrapMessage: null,
        wethToApproveToNix: null,
        approvalMessage: null,
        transferTo: null,
        transferAmount: null,
        transferMessage: null,
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
      },

      testToadzFields: [
        { key: 'tokenId', label: 'Token Id', sortable: true },
        { key: 'owner', label: 'Owner', sortable: true },
        { key: 'tokenURI', label: 'TokenURI', sortable: true },
      ],

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

      // tokensData: [],
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
    tokensData() {
      return store.getters['nixData/tokensData'];
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

    setPowerOn() {
      store.dispatch('connection/setPowerOn', true);
      localStorage.setItem('powerOn', true);
      var t = this;
      setTimeout(function() {
        t.statusSidebar = true;
      }, 1500);
    },

    async testIt() {
      event.preventDefault();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const ethBalance = await provider.getBalance(this.coinbase);
      // this.weth.ethBalance = ethers.utils.formatEther(ethBalance.toString());
      const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);

      weth.on("*", (event) => {
        console.log("event: ", JSON.stringify(event));
      });

      // weth.events.Deposit({
      //   fromBlock: 'latest'
      // }, function(error, event){
      //   console.log("EVENT: " + JSON.stringify(event));
      // });

      // const wethBalance = await weth.balanceOf(this.coinbase);
      // this.weth.wethBalance = ethers.utils.formatEther(wethBalance.toString());
      // const wethAllowanceToNix = await weth.allowance(this.coinbase, NIXADDRESS);
      // this.weth.wethAllowanceToNix = ethers.utils.formatEther(wethAllowanceToNix.toString());
    },

    async checkWeth() {
      event.preventDefault();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const ethBalance = await provider.getBalance(this.coinbase);
      this.weth.ethBalance = ethers.utils.formatEther(ethBalance.toString());
      const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
      const wethBalance = await weth.balanceOf(this.coinbase);
      this.weth.wethBalance = ethers.utils.formatEther(wethBalance.toString());
      const wethAllowanceToNix = await weth.allowance(this.coinbase, NIXADDRESS);
      this.weth.wethAllowanceToNix = ethers.utils.formatEther(wethAllowanceToNix.toString());
    },

    wrapEth() {
      console.log("wrapEth");
      this.$bvModal.msgBoxConfirm('Wrap ' + this.weth.ethToWrap + ' ETH?', {
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
            const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.deposit({ value: ethers.utils.parseEther(this.weth.ethToWrap) });
              this.weth.wrapMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.wrapMessage = e.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    unwrapWeth() {
      console.log("unwrapWeth");
      this.$bvModal.msgBoxConfirm('Unwrap ' + this.weth.wethToUnwrap + ' WETH?', {
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
            const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.withdraw(ethers.utils.parseEther(this.weth.wethToUnwrap));
              this.weth.unwrapMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.unwrapMessage = e.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    approveWeth() {
      console.log("approveWeth");
      this.$bvModal.msgBoxConfirm('Approve ' + this.weth.wethToApproveToNix + ' WETH for Nix to spend?', {
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
            const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.approve(NIXADDRESS, ethers.utils.parseEther(this.weth.wethToApproveToNix));
              this.weth.approvalMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.approvalMessage = e.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    transferWeth() {
      console.log("transferWeth");
      this.$bvModal.msgBoxConfirm('Transfer ' + this.weth.transferAmount + ' to ' + this.weth.transferTo + '?', {
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
            const weth = new ethers.Contract(WETHADDRESS, WETHABI, provider);
            const wethWithSigner = weth.connect(provider.getSigner());
            try {
              const tx = await wethWithSigner.transfer(this.weth.transferTo, ethers.utils.parseEther(this.weth.transferAmount));
              this.weth.transferMessage = tx.hash;
              console.log("tx: " + JSON.stringify(tx));
            } catch (e) {
              this.weth.transferMessage = e.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
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
              this.testToadz.approvalMessage = e.toString();
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
              this.testToadz.mintMessage = e.toString();
              console.log("error: " + e.toString());
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
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
