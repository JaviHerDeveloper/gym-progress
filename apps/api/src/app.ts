import express from 'express';

export const app = express();

app.use(express.json());

// Domain routes will be registered here as modules are introduced.
