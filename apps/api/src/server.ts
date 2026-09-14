import { loadRuntimeEnvironment } from './runtime-config.js';

loadRuntimeEnvironment();

const { app } = await import('./app.js');

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Gym Progress API listening on http://localhost:${port}`);
});
