import express from 'express';
import serverless from 'serverless-http';
import app from './app'; // Assumes your main app logic is in app.ts

// Create a serverless handler
const handler = serverless(app);

export default async (req: any, res: any) => {
  await handler(req, res);
};