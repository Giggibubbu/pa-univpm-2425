import { app } from "./app";
import { APP_PORT } from "./utils/env/app_parameters";


app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});