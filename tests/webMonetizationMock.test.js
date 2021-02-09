import { initFakeMonetization } from "../src/webMonetizationMock";
const config = {
  enabled: true,
  triggerFail: {
    enabled: true,
    onStart: false,
    onProgress: true,
    timeout: 6000,
  },
};
