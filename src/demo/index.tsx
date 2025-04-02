/**
 * title: 基础使用
 * description: 支持 发起，审批，抄送，条件分支 节点类型。支持自定义节点类型。支持扩展节点属性。
 */

import React, {useState} from 'react';
import {
  ApprovalProcessDesigner,
  GlobalStore,
  IProcessNode,
  ProcessWidget,
  StudioPanel,
} from 'approval-process-designer';
import {
  ApprovalActivity,
  ConditionActivity,
  RouteActivity,
  StartActivity,
  CcActivity,
} from './activities';
import * as Icons from './activities/Icons';

const Demo: React.FC = () => {
  const [data, setData] = useState<IProcessNode>({
    type: 'START',
    componentName: 'StartActivity',
    title: '发起人',
    nextNode: {
      type: 'APPROVAL',
      componentName: 'ApprovalActivity',
      title: '审批',
      nextNode: {
        type: 'ROUTE',
        componentName: 'RouteActivity',
        title: '路由',
        nextNode: {
          type: 'CC',
          componentName: 'CcActivity',
          title: '抄送人',
        },
        conditionNodes: [
          {
            type: 'CONDITION',
            componentName: 'ConditionActivity',
            title: '条件1',
            nextNode: {
              type: 'APPROVAL',
              componentName: 'ApprovalActivity',
              title: '审批人',
            },
          },
          {
            type: 'CONDITION',
            componentName: 'ConditionActivity',
            defaultCondition: true,
          },
        ],
      },
    },
  });
  const handleOnChange = (value: any) => {
    console.log('[processNode]', value);
    setData(value);
  };

  GlobalStore.registerIcons(Icons);

  return (
    <ApprovalProcessDesigner value={data} onChange={handleOnChange}>
      <StudioPanel>
        <ProcessWidget
          activities={{
            StartActivity,
            ApprovalActivity,
            RouteActivity,
            ConditionActivity,
            CcActivity,
          }}
        />
      </StudioPanel>
    </ApprovalProcessDesigner>
  );
}

export default Demo;
