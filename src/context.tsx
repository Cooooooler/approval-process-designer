import { createContext } from 'react';
import { ProcessNode } from './model';
import { ApprovalProcessEngine } from './model/ApprovalProcessEngine';
import { IActivities } from './types';

export const ApprovalProcessContext = createContext<
  ApprovalProcessEngine | undefined
>(void 0);

export const ActivitiesContext = createContext<IActivities | undefined>(void 0);

export const ProcessNodeContext = createContext<ProcessNode | undefined>(
  void 0,
);
