const routes = [{
    path: '/zombieBabiesAdoption',
    component: ZombieBabiesAdoption,
    name: 'ZombieBabiesAdoption',
  }, {
    path: '/beeefLibrary',
    component: BeeefLibrary,
    name: 'BeeefLibrary',
  }, {
    path: '/tokens',
    component: Tokens,
    name: 'Tokens',
  }, {
    path: '/admin',
    component: Admin,
    name: 'Admin',
  }, {
    path: '/weth',
    component: WETH,
    name: 'WETH',
  }, {
    path: '/nix',
    component: Nix,
    name: 'Nix',
  }, {
    path: '/collections',
    component: Collections,
    name: 'Collections',
  }, {
    path: '/nftpostcard',
    component: NFTPostcard,
    name: 'NFTPostcard',
  }, {
  //   path: '/bodyshop/:param',
  //   component: Bodyshop,
  //   name: 'Bodyshop',
  // }, {
  //   path: '/genemixer/:param',
  //   component: GeneMixer,
  //   name: 'GeneMixer',
  // }, {
    path: '/docs/:section/:topic',
    component: Docs,
    name: 'Docs',
  }, {
    path: '/:account/:collection',
    component: NFTPostcard,
    name: '',
  }, {
    path: '*',
    component: Welcome,
    name: ''
  }
];
