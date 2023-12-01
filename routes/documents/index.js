import express from 'express';
import { validationResult } from 'express-validator';
import boundedRoute from '../bounded-route';
import { Factories, Middlewares } from '../../utils';
import { FailServerError } from '../../utils/errors';
import { validateInvestorId } from '../../utils/middlewares';

export const router = express.Router();

router.get('/', boundedRoute(async (req, res) => {
  const documents = await Factories.DocumentFactory.getDocuments();
  res.respond({
    documents
  });  
}));

router.post('/', Middlewares.RouteMiddlewares.createDocumentMiddlewares, boundedRoute(async (req, res) => {
  const { investorId } = req.body;
  console.log({investorId})
  res.respond({ investorId });
}));