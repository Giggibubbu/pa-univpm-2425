import { app } from "./app";
import { APP_PORT } from "./utils/env/app_parameters";

/**
 * Entry point dell'applicazione.
 * Avvia il server Express sulla porta configurata.
 */

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});