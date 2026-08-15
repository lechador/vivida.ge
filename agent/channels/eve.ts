import { localDev, placeholderAuth, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// Production requests fail closed unless they carry a valid Vercel OIDC token.
// Local development remains available through `eve dev`.
export default eveChannel({
  auth: [vercelOidc(), localDev(), placeholderAuth()],
});
