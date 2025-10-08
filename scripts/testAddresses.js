#!/usr/bin/env node
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
if (!process.env.HD_MNEMONIC && fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
const { deriveAddress } = require('../lib/addressGenerator');

function logAddr(network, i) {
  const { address, derivationPath, warning } = deriveAddress({ network, index: i });
  console.log(network, i, address, derivationPath, warning || '');
}

['bitcoin','ethereum','bsc','tron'].forEach(net => {
  for (let i=0;i<3;i++) logAddr(net, i);
});
